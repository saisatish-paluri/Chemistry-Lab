import { create } from "zustand";
import type { NeutralizationState } from "@/lib/engine/types";
import {
  initialNeutralizationState,
  measureHCl, measureNaOH, startMixing, updateMixProgress,
  recordNeutObservations, completeNeutralization, resetNeutralization,
} from "@/lib/engine/neutralization-engine";
import { saveSession, loadSession } from "@/lib/persistence";

const STORAGE_KEY = "neutralization";

interface NeutralizationStore extends NeutralizationState {
  lastError:                 string | null;
  measureHClAction:          (vol: number) => void;
  measureNaOHAction:         (vol: number) => void;
  startMixingAction:         () => void;
  updateMixProgressAction:   (progress: number) => void;
  recordObservationsAction:  () => void;
  completeAction:            () => void;
  resetAction:               () => void;
  setMode:                   (mode: NeutralizationState["mode"]) => void;
  hydrate:                   () => void;
}

export const useNeutralizationStore = create<NeutralizationStore>((set, get) => ({
  ...initialNeutralizationState("guided"),
  lastError: null,

  measureHClAction: (vol) => {
    const next = measureHCl(get() as NeutralizationState, vol);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  measureNaOHAction: (vol) => {
    const next = measureNaOH(get() as NeutralizationState, vol);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  startMixingAction: () => {
    const next = startMixing(get() as NeutralizationState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  updateMixProgressAction: (progress) => {
    const next = updateMixProgress(get() as NeutralizationState, progress);
    set({ ...next });
  },

  recordObservationsAction: () => {
    const next = recordNeutObservations(get() as NeutralizationState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  completeAction: () => {
    const next = completeNeutralization(get() as NeutralizationState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  resetAction: () => {
    const next = resetNeutralization(get() as NeutralizationState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  setMode: (mode) => {
    set({ mode });
    saveSession(STORAGE_KEY, { ...get(), mode });
  },

  hydrate: () => {
    const saved = loadSession<NeutralizationState>(STORAGE_KEY);
    if (saved && saved.status !== "completed") {
      set({ ...saved, lastError: null });
    }
  },
}));
