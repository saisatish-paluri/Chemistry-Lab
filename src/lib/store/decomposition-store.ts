import { create } from "zustand";
import type { DecompositionState, ExperimentMode } from "@/lib/engine/types";
import {
  initialDecompositionState,
  selectReactant,
  addMnO2CatalystAction,
  setDecompHeatingPower,
  toggleDecompHeatingAction,
  tickDecomposition,
  resetDecomposition,
} from "@/lib/engine/decomposition-engine";
import { saveSession, loadSession } from "@/lib/persistence";

const STORAGE_KEY = "decomposition-lab";

interface DecompositionStore extends DecompositionState {
  setMode: (mode: ExperimentMode) => void;
  selectReactantAction: (reactant: "caco3" | "kclo3" | "h2o2") => void;
  addMnO2CatalystAction: () => void;
  setHeatingPowerAction: (power: number) => void;
  toggleHeatingAction: (active: boolean) => void;
  tickAction: (delta: number) => void;
  resetAction: () => void;
  hydrate: () => void;
}

export const useDecompositionStore = create<DecompositionStore>((set, get) => ({
  ...initialDecompositionState("guided"),

  setMode: (mode) => {
    set({ mode });
    saveSession(STORAGE_KEY, { ...get(), mode });
  },

  selectReactantAction: (reactant) => {
    const next = selectReactant(get() as DecompositionState, reactant);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  addMnO2CatalystAction: () => {
    const next = addMnO2CatalystAction(get() as DecompositionState);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  setHeatingPowerAction: (power) => {
    const next = setDecompHeatingPower(get() as DecompositionState, power);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  toggleHeatingAction: (active) => {
    const next = toggleDecompHeatingAction(get() as DecompositionState, active);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  tickAction: (delta) => {
    const next = tickDecomposition(get() as DecompositionState, delta);
    set({ ...next });
  },

  resetAction: () => {
    const next = resetDecomposition(get() as DecompositionState);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  hydrate: () => {
    const saved = loadSession<DecompositionState>(STORAGE_KEY);
    if (saved && saved.status !== "completed") {
      set({ ...saved });
    }
  },
}));
