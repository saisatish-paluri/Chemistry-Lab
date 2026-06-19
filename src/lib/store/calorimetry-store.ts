import { create } from "zustand";
import type { CalorimetryState } from "@/lib/engine/types";
import {
  initialCalorimetryState,
  addNaOH,
  resetCalorimetry,
  tickCalorimetry,
} from "@/lib/engine/calorimetry-engine";
import { validateAddNaOH } from "@/lib/engine/validation";
import { saveSession, loadSession } from "@/lib/persistence";
import { rollErrors, buildDefaultErrorConfig } from "@/lib/instruments/error-engine";
import { useSimulationStore } from "@/lib/simulation/session";
import { getCalorimetrySimParams } from "@/lib/engine/sim-bridge";

function getSession() {
  return useSimulationStore.getState().getOrCreate({
    domain:       "calorimetry",
    reagentIds:   ["hcl-1.0", "naoh-1.0"],
    apparatusIds: ["thermometer", "calorimeter", "measuring-cylinder"],
  });
}

function freshInit(mode: CalorimetryState["mode"]): CalorimetryState {
  const session = getSession();
  const params  = getCalorimetrySimParams(session);
  const errors  = rollErrors(buildDefaultErrorConfig(session.difficulty, {
    "heat-loss": { probability: params.heatLossProb, magnitude: -params.heatLossMagnitude },
  })).errors;
  return initialCalorimetryState(mode, errors, params);
}

const STORAGE_KEY = "calorimetry";

interface CalorimetryStore extends CalorimetryState {
  lastError:     string | null;
  addNaOHAction: (volumeMl?: number) => void;
  tickAction:    (deltaSec: number) => void;
  resetAction:   () => void;
  setMode:       (mode: CalorimetryState["mode"]) => void;
  hydrate:       () => void;
}

export const useCalorimetryStore = create<CalorimetryStore>((set, get) => ({
  ...freshInit("guided"),
  lastError: null,

  addNaOHAction: (volumeMl = 10) => {
    const s   = get();
    const err = validateAddNaOH(s);
    if (err) { set({ lastError: err.message }); return; }
    const next = addNaOH(s as CalorimetryState, volumeMl);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
    useSimulationStore.getState().recordAction("calorimetry", "add-reagent", volumeMl, "mL");
    if (next.status === "completed") {
      useSimulationStore.getState().recordAction("calorimetry", "record");
    }
  },

  tickAction: (deltaSec: number) => {
    const next = tickCalorimetry(get() as CalorimetryState, deltaSec);
    // Only update if temperature actually changed
    if (next !== get()) set({ ...next });
  },

  resetAction: () => {
    useSimulationStore.getState().reset({
      domain: "calorimetry",
      reagentIds: ["hcl-1.0", "naoh-1.0"],
      apparatusIds: ["thermometer", "calorimeter", "measuring-cylinder"],
    });
    const next = freshInit(get().mode);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  setMode: (mode) => set({ mode }),

  hydrate: () => {
    const saved = loadSession<CalorimetryState>(STORAGE_KEY);
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
