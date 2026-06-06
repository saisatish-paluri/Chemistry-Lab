import { create } from "zustand";
import type { WaterHardnessState } from "@/lib/engine/types";
import {
  initialWaterHardnessState,
  fillBurette, prepareSample, addIndicator, addEDTA,
  calculateHardness, completeWaterHardness, resetWaterHardness,
} from "@/lib/engine/water-hardness-engine";
import { saveSession, loadSession } from "@/lib/persistence";

const STORAGE_KEY = "water-hardness";

interface WaterHardnessStore extends WaterHardnessState {
  lastError:            string | null;
  fillBuretteAction:    () => void;
  prepareSampleAction:  () => void;
  addIndicatorAction:   () => void;
  addEDTAAction:        (incrementMl: number) => void;
  calculateAction:      () => void;
  completeAction:       () => void;
  resetAction:          () => void;
  setMode:              (mode: WaterHardnessState["mode"]) => void;
  hydrate:              () => void;
}

export const useWaterHardnessStore = create<WaterHardnessStore>((set, get) => ({
  ...initialWaterHardnessState("guided"),
  lastError: null,

  fillBuretteAction: () => {
    const next = fillBurette(get() as WaterHardnessState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  prepareSampleAction: () => {
    const next = prepareSample(get() as WaterHardnessState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  addIndicatorAction: () => {
    const next = addIndicator(get() as WaterHardnessState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  addEDTAAction: (incrementMl) => {
    const next = addEDTA(get() as WaterHardnessState, incrementMl);
    set({ ...next, lastError: null });
  },

  calculateAction: () => {
    const next = calculateHardness(get() as WaterHardnessState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  completeAction: () => {
    const next = completeWaterHardness(get() as WaterHardnessState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  resetAction: () => {
    const next = resetWaterHardness(get() as WaterHardnessState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  setMode: (mode) => {
    set({ mode });
    saveSession(STORAGE_KEY, { ...get(), mode });
  },

  hydrate: () => {
    const saved = loadSession<WaterHardnessState>(STORAGE_KEY);
    if (saved && saved.status !== "completed") {
      set({ ...saved, lastError: null });
    }
  },
}));
