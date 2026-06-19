import { create } from "zustand";
import type { ReactionRateState, SurfaceAreaType } from "@/lib/engine/types";
import {
  initialReactionRateState, setTemperature, setConcentration, setSurfaceArea,
  startReaction, stopReaction, tickReaction, resetReaction,
  setCatalyst,
} from "@/lib/engine/reaction-rate-engine";
import { validateStartReaction, validateStopReaction } from "@/lib/engine/validation";
import { saveSession, loadSession } from "@/lib/persistence";
import { useSimulationStore } from "@/lib/simulation/session";
import { getReactionRateSimParams } from "@/lib/engine/sim-bridge";

function getSession() {
  return useSimulationStore.getState().getOrCreate({
    domain: "kinetics",
    apparatusIds: ["thermometer", "stopwatch"],
  });
}

function freshInit(mode: ReactionRateState["mode"]): ReactionRateState {
  const session = getSession();
  const params  = getReactionRateSimParams(session);
  return initialReactionRateState(mode, params);
}

const STORAGE_KEY = "reaction-rate";

interface ReactionRateStore extends ReactionRateState {
  lastError:              string | null;
  setTemperatureAction:   (tempC: number) => void;
  setConcentrationAction: (concM: number) => void;
  setSurfaceAreaAction:   (sa: SurfaceAreaType) => void;
  setCatalystAction:      (add: boolean) => void;
  startAction:            () => void;
  stopAction:             () => void;
  tickAction:             (delta: number) => void;
  resetRunAction:         () => void;
  resetAction:            () => void;
  setMode:                (mode: ReactionRateState["mode"]) => void;
  hydrate:                () => void;
}

export const useReactionRateStore = create<ReactionRateStore>((set, get) => ({
  ...freshInit("guided"),
  lastError: null,

  setTemperatureAction: (tempC) => {
    const next = setTemperature(get() as ReactionRateState, tempC);
    set({ ...next, lastError: null });
    useSimulationStore.getState().recordAction("kinetics", "heat", tempC, "°C");
  },

  setConcentrationAction: (concM) => {
    const next = setConcentration(get() as ReactionRateState, concM);
    set({ ...next, lastError: null });
  },

  setSurfaceAreaAction: (sa) => {
    const next = setSurfaceArea(get() as ReactionRateState, sa);
    set({ ...next, lastError: null });
  },

  setCatalystAction: (add) => {
    const next = setCatalyst(get() as ReactionRateState, add);
    set({ ...next, lastError: null });
    useSimulationStore.getState().recordAction("kinetics", "add-reagent", add ? 1 : 0, "catalyst");
  },

  startAction: () => {
    const s   = get();
    const err = validateStartReaction(s);
    if (err) { set({ lastError: err.message }); return; }
    const next = startReaction(s as ReactionRateState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
    useSimulationStore.getState().recordAction("kinetics", "mix");
  },

  stopAction: () => {
    const s   = get();
    const err = validateStopReaction(s);
    if (err) { set({ lastError: err.message }); return; }
    const next = stopReaction(s as ReactionRateState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  tickAction: (delta) => {
    const next = tickReaction(get() as ReactionRateState, delta);
    set({ ...next });
    if (next.status === "completed") saveSession(STORAGE_KEY, next);
  },

  resetRunAction: () => {
    const next = resetReaction(get() as ReactionRateState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  resetAction: () => {
    useSimulationStore.getState().reset({ domain: "kinetics", apparatusIds: ["thermometer", "stopwatch"] });
    const next = freshInit(get().mode);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  setMode: (mode) => set({ mode }),

  hydrate: () => {
    const saved = loadSession<ReactionRateState>(STORAGE_KEY);
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
