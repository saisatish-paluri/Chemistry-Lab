import { create } from "zustand";
import type { TitrationState, IndicatorName, TitrantFlowRate } from "@/lib/engine/types";
import {
  initialTitrationState, addIndicator, addTitrant,
  setFlowRate, resetTitration, buildTitrationResult, resetForNextTrial, swirlFlask,
} from "@/lib/engine/titration-engine";
import { validateAddIndicator, validateAddTitrant } from "@/lib/engine/validation";
import { saveSession, loadSession } from "@/lib/persistence";
import { rollErrors, buildDefaultErrorConfig } from "@/lib/instruments/error-engine";
import { useSimulationStore } from "@/lib/simulation/session";
import { getTitrationSimParams } from "@/lib/engine/sim-bridge";

function getSession() {
  return useSimulationStore.getState().getOrCreate({
    domain:         "titration",
    reagentIds:     ["hcl-0.1", "naoh-0.1", "phenolphthalein"],
    apparatusIds:   ["burette", "conical-flask", "pipette"],
    includeUnknown: true,
    unknownType:    "solution",
  });
}

function freshInit(mode: TitrationState["mode"]): TitrationState {
  const session = getSession();
  const params  = getTitrationSimParams(session);
  const errors  = rollErrors(buildDefaultErrorConfig(session.difficulty)).errors;
  return initialTitrationState(mode, errors, params);
}

const STORAGE_KEY = "titration";

interface TitrationStore extends TitrationState {
  lastError: string | null;
  addIndicatorAction:   (indicator: IndicatorName) => void;
  addTitrantAction:     () => void;
  setFlowRateAction:    (rate: TitrantFlowRate) => void;
  swirlFlaskAction:     () => void;
  resetAction:          () => void;
  replicateTrialAction: () => void;
  setMode:              (mode: TitrationState["mode"]) => void;
  hydrate:              () => void;
}

export const useTitrationStore = create<TitrationStore>((set, get) => ({
  ...freshInit("guided"),
  lastError: null,

  addIndicatorAction: (indicator) => {
    const s   = get();
    const err = validateAddIndicator(s);
    if (err) { set({ lastError: err.message }); return; }
    const next = addIndicator(s as TitrationState, indicator);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
    useSimulationStore.getState().recordAction("titration", "add-reagent");
  },

  addTitrantAction: () => {
    const s   = get();
    const err = validateAddTitrant(s);
    if (err) { set({ lastError: err.message }); return; }
    const next = addTitrant(s as TitrationState);
    const final = next.status === "completed" || next.status === "failed"
      ? buildTitrationResult(next)
      : next;
    set({ ...final, lastError: null });
    saveSession(STORAGE_KEY, final);
    const actionType = s.burette.flowRate <= 0.1
      ? "titrate-dropwise"
      : s.burette.flowRate <= 0.5
        ? "titrate-slow"
        : "titrate-fast";
    useSimulationStore.getState().recordAction("titration", actionType, s.burette.flowRate, "mL");
    if (final.endpointReached) {
      useSimulationStore.getState().recordAction("titration", "endpoint-detected", final.volumeAdded, "mL");
    }
  },

  setFlowRateAction: (rate) => {
    const next = setFlowRate(get() as TitrationState, rate);
    set({ ...next });
  },

  swirlFlaskAction: () => {
    const next = swirlFlask(get() as TitrationState);
    set({ ...next });
  },

  resetAction: () => {
    const next = freshInit(get().mode);
    useSimulationStore.getState().reset({
      domain: "titration", reagentIds: ["hcl-0.1", "naoh-0.1", "phenolphthalein"],
      apparatusIds: ["burette", "conical-flask", "pipette"],
      includeUnknown: true, unknownType: "solution",
    });
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  replicateTrialAction: () => {
    const s = get();
    const next = resetForNextTrial(s as TitrationState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  setMode: (mode) => set({ mode }),

  hydrate: () => {
    const saved = loadSession<TitrationState>(STORAGE_KEY);
    if (saved) {
      if (saved.status === "completed" || saved.status === "failed") {
        const fresh = freshInit(saved.mode);
        set({ ...fresh, lastError: null });
        saveSession(STORAGE_KEY, fresh);
      } else {
        set({ ...saved, lastError: null });
      }
    }
  },
}));
