import { create } from "zustand";
import type { CrystallizationState, ExperimentMode } from "@/lib/engine/types";
import {
  initialCrystallizationState,
  addImpureSalt, addWater,
  toggleHeating, setCoolingRate,
  transferToDish, filterCrystals,
  collectProduct, tickCrystallization,
  resetCrystallization,
} from "@/lib/engine/crystallization-engine";
import { saveSession, loadSession } from "@/lib/persistence";

const STORAGE_KEY = "crystallization-lab";

interface CrystallizationStore extends CrystallizationState {
  setMode: (mode: ExperimentMode) => void;
  addImpureSaltAction: (mass: number) => void;
  addWaterAction: (volume: number) => void;
  toggleHeatingAction: (active: boolean) => void;
  setCoolingRateAction: (rate: "slow" | "medium" | "fast") => void;
  transferToDishAction: () => void;
  filterCrystalsAction: () => void;
  collectProductAction: () => void;
  tickAction: (delta: number) => void;
  resetAction: () => void;
  hydrate: () => void;
}

export const useCrystallizationStore = create<CrystallizationStore>((set, get) => ({
  ...initialCrystallizationState("guided"),

  setMode: (mode) => {
    set({ mode });
    saveSession(STORAGE_KEY, { ...get(), mode });
  },

  addImpureSaltAction: (mass) => {
    const next = addImpureSalt(get() as CrystallizationState, mass);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  addWaterAction: (volume) => {
    const next = addWater(get() as CrystallizationState, volume);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  toggleHeatingAction: (active) => {
    const next = toggleHeating(get() as CrystallizationState, active);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  setCoolingRateAction: (rate) => {
    const next = setCoolingRate(get() as CrystallizationState, rate);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  transferToDishAction: () => {
    const next = transferToDish(get() as CrystallizationState);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  filterCrystalsAction: () => {
    const next = filterCrystals(get() as CrystallizationState);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  collectProductAction: () => {
    const next = collectProduct(get() as CrystallizationState);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  tickAction: (delta) => {
    const next = tickCrystallization(get() as CrystallizationState, delta);
    set({ ...next });
  },

  resetAction: () => {
    const next = resetCrystallization(get() as CrystallizationState);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  hydrate: () => {
    const saved = loadSession<CrystallizationState>(STORAGE_KEY);
    if (saved && saved.status !== "completed") {
      set({ ...saved });
    }
  },
}));
