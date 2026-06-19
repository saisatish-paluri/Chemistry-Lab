import { create } from "zustand";
import type { ChemicalEquilibriumState, EquilibriumPerturbation } from "@/lib/engine/types";
import {
  initialEquilibriumState,
  applyPerturbation,
  startEquilibrium,
  tickEquilibration,
} from "@/lib/engine/chemical-equilibrium-engine";
import { validateApplyPerturbation } from "@/lib/engine/validation";
import { saveSession, loadSession } from "@/lib/persistence";
import { useSimulationStore } from "@/lib/simulation/session";
import { getEquilibriumSimParams } from "@/lib/engine/sim-bridge";

function getSession() {
  return useSimulationStore.getState().getOrCreate({
    domain: "equilibrium",
  });
}

function freshInit(mode: ChemicalEquilibriumState["mode"]): ChemicalEquilibriumState {
  const session = getSession();
  const params  = getEquilibriumSimParams(session);
  return initialEquilibriumState(mode, params);
}

const STORAGE_KEY = "chemical-equilibrium";

interface ChemicalEquilibriumStore extends ChemicalEquilibriumState {
  lastError:        string | null;
  perturbAction:    (p: EquilibriumPerturbation) => void;
  tickAction:       (deltaSec: number) => void;
  startAction:      () => void;
  resetAction:      () => void;
  setMode:          (mode: ChemicalEquilibriumState["mode"]) => void;
  hydrate:          () => void;
}

export const useChemicalEquilibriumStore = create<ChemicalEquilibriumStore>((set, get) => ({
  ...freshInit("guided"),
  lastError: null,

  perturbAction: (perturbation) => {
    const s   = get();
    const err = validateApplyPerturbation(s, perturbation);
    if (err) { set({ lastError: err.message }); return; }
    const next = applyPerturbation(s as ChemicalEquilibriumState, perturbation);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
    useSimulationStore.getState().recordAction("equilibrium", "add-reagent");
  },

  tickAction: (deltaSec) => {
    const next = tickEquilibration(get() as ChemicalEquilibriumState, deltaSec);
    set({ ...next });
  },

  startAction: () => {
    const next = startEquilibrium(get() as ChemicalEquilibriumState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  resetAction: () => {
    useSimulationStore.getState().reset({ domain: "equilibrium" });
    const next = freshInit(get().mode);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  setMode: (mode) => set({ mode }),

  hydrate: () => {
    const saved = loadSession<ChemicalEquilibriumState>(STORAGE_KEY);
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
