import { create } from "zustand";
import type { NaturalIndicatorsState, ExperimentMode } from "@/lib/engine/types";
import {
  initialIndicatorsState,
  selectIndicator, mashMaterial,
  addSolvent, selectTestSolution,
  addIndicatorDropAction, tickIndicatorsMix,
  submitIndicatorsResult, resetIndicators,
} from "@/lib/engine/natural-indicators-engine";
import { saveSession, loadSession } from "@/lib/persistence";

const STORAGE_KEY = "natural-indicators-lab";

interface NaturalIndicatorsStore extends NaturalIndicatorsState {
  setMode: (mode: ExperimentMode) => void;
  selectIndicatorAction: (ind: "turmeric" | "china-rose" | "red-cabbage") => void;
  mashMaterialAction: (amount: number) => void;
  addSolventAction: (steepTime: number) => void;
  selectTestSolutionAction: (sol: NaturalIndicatorsState["selectedSolution"]) => void;
  addIndicatorDropAction: () => void;
  tickAction: (delta: number) => void;
  submitResultAction: () => void;
  resetAction: () => void;
  hydrate: () => void;
}

export const useNaturalIndicatorsStore = create<NaturalIndicatorsStore>((set, get) => ({
  ...initialIndicatorsState("guided"),

  setMode: (mode) => {
    set({ mode });
    saveSession(STORAGE_KEY, { ...get(), mode });
  },

  selectIndicatorAction: (ind) => {
    const next = selectIndicator(get() as NaturalIndicatorsState, ind);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  mashMaterialAction: (amount) => {
    const next = mashMaterial(get() as NaturalIndicatorsState, amount);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  addSolventAction: (steepTime) => {
    const next = addSolvent(get() as NaturalIndicatorsState, steepTime);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  selectTestSolutionAction: (sol) => {
    const next = selectTestSolution(get() as NaturalIndicatorsState, sol);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  addIndicatorDropAction: () => {
    const next = addIndicatorDropAction(get() as NaturalIndicatorsState);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  tickAction: (delta) => {
    const next = tickIndicatorsMix(get() as NaturalIndicatorsState, delta);
    set({ ...next });
  },

  submitResultAction: () => {
    const next = submitIndicatorsResult(get() as NaturalIndicatorsState);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  resetAction: () => {
    const next = resetIndicators(get() as NaturalIndicatorsState);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  hydrate: () => {
    const saved = loadSession<NaturalIndicatorsState>(STORAGE_KEY);
    if (saved && saved.status !== "completed") {
      set({ ...saved });
    }
  },
}));
