import { create } from "zustand";
import type { SeparationMixturesState, ExperimentMode } from "@/lib/engine/types";
import {
  initialSeparationMixturesState,
  sweepMagnetAction,
  addWaterAndDissolveAction,
  startFiltrationAction,
  startEvaporationAction,
  tickSeparationMixtures,
  resetSeparationMixtures,
} from "@/lib/engine/separation-mixtures-engine";
import { saveSession, loadSession } from "@/lib/persistence";

const STORAGE_KEY = "separation-mixtures-lab";

interface SeparationMixturesStore extends SeparationMixturesState {
  setMode: (mode: ExperimentMode) => void;
  sweepMagnetAction: (sweepSec: number) => void;
  addWaterAndDissolveAction: () => void;
  startFiltrationAction: () => void;
  startEvaporationAction: () => void;
  tickAction: (delta: number) => void;
  resetAction: () => void;
  hydrate: () => void;
}

export const useSeparationMixturesStore = create<SeparationMixturesStore>((set, get) => ({
  ...initialSeparationMixturesState("guided"),

  setMode: (mode) => {
    set({ mode });
    saveSession(STORAGE_KEY, { ...get(), mode });
  },

  sweepMagnetAction: (sweepSec) => {
    const next = sweepMagnetAction(get() as SeparationMixturesState, sweepSec);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  addWaterAndDissolveAction: () => {
    const next = addWaterAndDissolveAction(get() as SeparationMixturesState);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  startFiltrationAction: () => {
    const next = startFiltrationAction(get() as SeparationMixturesState);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  startEvaporationAction: () => {
    const next = startEvaporationAction(get() as SeparationMixturesState);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  tickAction: (delta) => {
    const next = tickSeparationMixtures(get() as SeparationMixturesState, delta);
    set({ ...next });
  },

  resetAction: () => {
    const next = resetSeparationMixtures(get() as SeparationMixturesState);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  hydrate: () => {
    const saved = loadSession<SeparationMixturesState>(STORAGE_KEY);
    if (saved && saved.status !== "completed") {
      set({ ...saved });
    }
  },
}));
