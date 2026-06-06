import { create } from "zustand";
import type { ChemicalEquilibriumState, EquilibriumPerturbation } from "@/lib/engine/types";
import {
  initialEquilibriumState,
  applyPerturbation,
  startEquilibrium,
  resetEquilibrium,
} from "@/lib/engine/chemical-equilibrium-engine";
import { validateApplyPerturbation } from "@/lib/engine/validation";
import { saveSession, loadSession } from "@/lib/persistence";

const STORAGE_KEY = "chemical-equilibrium";

interface ChemicalEquilibriumStore extends ChemicalEquilibriumState {
  lastError:           string | null;
  perturbAction:       (p: EquilibriumPerturbation) => void;
  startAction:         () => void;
  resetAction:         () => void;
  setMode:             (mode: ChemicalEquilibriumState["mode"]) => void;
  hydrate:             () => void;
}

export const useChemicalEquilibriumStore = create<ChemicalEquilibriumStore>((set, get) => ({
  ...initialEquilibriumState("guided"),
  lastError: null,

  perturbAction: (perturbation) => {
    const s = get();
    const err = validateApplyPerturbation(s, perturbation);
    if (err) { set({ lastError: err.message }); return; }
    const next = applyPerturbation(s as ChemicalEquilibriumState, perturbation);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  startAction: () => {
    const next = startEquilibrium(get() as ChemicalEquilibriumState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  resetAction: () => {
    const next = resetEquilibrium(get().mode);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  setMode: (mode) => set({ mode }),

  hydrate: () => {
    const saved = loadSession<ChemicalEquilibriumState>(STORAGE_KEY);
    if (saved) {
      if (saved.status === "completed" || saved.status === "failed") {
        const fresh = initialEquilibriumState(saved.mode);
        set({ ...fresh, lastError: null });
        saveSession(STORAGE_KEY, fresh);
      } else {
        set({ ...saved, lastError: null });
      }
    }
  },
}));
