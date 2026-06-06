import { create } from "zustand";
import type { SolubilityState, SolutionId } from "@/lib/engine/types";
import {
  initialSolubilityState, selectSolutionA, selectSolutionB,
  combineSolutions, tickMixing, resetSolubilityMix, completeSolubility, resetSolubility,
} from "@/lib/engine/solubility-engine";
import {
  validateCombineSolutions, validateCompleteSolubility,
} from "@/lib/engine/validation";
import { saveSession, loadSession } from "@/lib/persistence";

const STORAGE_KEY = "solubility";

interface SolubilityStore extends SolubilityState {
  lastError:                string | null;
  selectSolutionAAction:    (id: SolutionId) => void;
  selectSolutionBAction:    (id: SolutionId) => void;
  combineAction:            () => void;
  tickMixingAction:         (delta: number) => void;
  resetMixAction:           () => void;
  completeExperimentAction: () => void;
  resetAction:              () => void;
  setMode:                  (mode: SolubilityState["mode"]) => void;
  hydrate:                  () => void;
}

export const useSolubilityStore = create<SolubilityStore>((set, get) => ({
  ...initialSolubilityState("guided"),
  lastError: null,

  selectSolutionAAction: (id) => {
    const next = selectSolutionA(get() as SolubilityState, id);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  selectSolutionBAction: (id) => {
    const next = selectSolutionB(get() as SolubilityState, id);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  combineAction: () => {
    const s   = get();
    const err = validateCombineSolutions(s);
    if (err) { set({ lastError: err.message }); return; }
    const next = combineSolutions(s as SolubilityState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  tickMixingAction: (delta) => {
    const next = tickMixing(get() as SolubilityState, delta);
    set({ ...next });
    if (next.status !== "running") saveSession(STORAGE_KEY, next);
  },

  resetMixAction: () => {
    const next = resetSolubilityMix(get() as SolubilityState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  completeExperimentAction: () => {
    const s   = get();
    const err = validateCompleteSolubility(s);
    if (err) { set({ lastError: err.message }); return; }
    const next = completeSolubility(s as SolubilityState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  resetAction: () => {
    const next = resetSolubility(get().mode);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  setMode: (mode) => set({ mode }),

  hydrate: () => {
    const saved = loadSession<SolubilityState>(STORAGE_KEY);
    if (saved) {
      if (saved.status === "completed" || saved.status === "failed") {
        const fresh = initialSolubilityState(saved.mode);
        set({ ...fresh, lastError: null });
        saveSession(STORAGE_KEY, fresh);
      } else {
        set({ ...saved, lastError: null });
      }
    }
  },
}));
