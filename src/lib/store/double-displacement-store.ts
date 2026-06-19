import { create } from "zustand";
import type { DoubleDisplacementState, ExperimentMode } from "@/lib/engine/types";
import {
  initialDoubleDisplacementState,
  selectSystem,
  configureReactants,
  mixReactantsAction,
  tickDoubleDisplacement,
  resetDoubleDisplacement,
} from "@/lib/engine/double-displacement-engine";
import { saveSession, loadSession } from "@/lib/persistence";

const STORAGE_KEY = "double-displacement-lab";

interface DoubleDisplacementStore extends DoubleDisplacementState {
  setMode: (mode: ExperimentMode) => void;
  selectSystemAction: (sys: DoubleDisplacementState["system"]) => void;
  configureReactantsAction: (vol1: number, vol2: number, conc1: number, conc2: number, temp: number) => void;
  mixReactantsAction: () => void;
  tickAction: (delta: number) => void;
  resetAction: () => void;
  hydrate: () => void;
}

export const useDoubleDisplacementStore = create<DoubleDisplacementStore>((set, get) => ({
  ...initialDoubleDisplacementState("guided"),

  setMode: (mode) => {
    set({ mode });
    saveSession(STORAGE_KEY, { ...get(), mode });
  },

  selectSystemAction: (sys) => {
    const next = selectSystem(get() as DoubleDisplacementState, sys);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  configureReactantsAction: (vol1, vol2, conc1, conc2, temp) => {
    const next = configureReactants(get() as DoubleDisplacementState, vol1, vol2, conc1, conc2, temp);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  mixReactantsAction: () => {
    const next = mixReactantsAction(get() as DoubleDisplacementState);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  tickAction: (delta) => {
    const next = tickDoubleDisplacement(get() as DoubleDisplacementState, delta);
    set({ ...next });
  },

  resetAction: () => {
    const next = resetDoubleDisplacement(get() as DoubleDisplacementState);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  hydrate: () => {
    const saved = loadSession<DoubleDisplacementState>(STORAGE_KEY);
    if (saved && saved.status !== "completed") {
      set({ ...saved });
    }
  },
}));
