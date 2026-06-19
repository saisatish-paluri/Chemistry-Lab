import { create } from "zustand";
import type { StatesOfMatterState, ExperimentMode } from "@/lib/engine/types";
import {
  initialStatesOfMatterState,
  selectSubstance,
  setHeatingPower,
  toggleSubstanceHeating,
  toggleSubstanceCooling,
  adjustThermometerParallax,
  tickStatesOfMatter,
  resetStatesOfMatter,
} from "@/lib/engine/states-of-matter-engine";
import { saveSession, loadSession } from "@/lib/persistence";

const STORAGE_KEY = "states-of-matter-lab";

interface StatesOfMatterStore extends StatesOfMatterState {
  setMode: (mode: ExperimentMode) => void;
  selectSubstanceAction: (sub: "water" | "ethanol" | "wax", alt: number) => void;
  setHeatingPowerAction: (power: number) => void;
  toggleHeatingAction: (active: boolean) => void;
  toggleCoolingAction: (active: boolean) => void;
  adjustThermometerParallaxAction: (offset: number) => void;
  tickAction: (delta: number) => void;
  resetAction: () => void;
  hydrate: () => void;
}

export const useStatesOfMatterStore = create<StatesOfMatterStore>((set, get) => ({
  ...initialStatesOfMatterState("guided"),

  setMode: (mode) => {
    set({ mode });
    saveSession(STORAGE_KEY, { ...get(), mode });
  },

  selectSubstanceAction: (sub, alt) => {
    const next = selectSubstance(get() as StatesOfMatterState, sub, alt);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  setHeatingPowerAction: (power) => {
    const next = setHeatingPower(get() as StatesOfMatterState, power);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  toggleHeatingAction: (active) => {
    const next = toggleSubstanceHeating(get() as StatesOfMatterState, active);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  toggleCoolingAction: (active) => {
    const next = toggleSubstanceCooling(get() as StatesOfMatterState, active);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  adjustThermometerParallaxAction: (offset) => {
    const next = adjustThermometerParallax(get() as StatesOfMatterState, offset);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  tickAction: (delta) => {
    const next = tickStatesOfMatter(get() as StatesOfMatterState, delta);
    set({ ...next });
  },

  resetAction: () => {
    const next = resetStatesOfMatter(get() as StatesOfMatterState);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  hydrate: () => {
    const saved = loadSession<StatesOfMatterState>(STORAGE_KEY);
    if (saved && saved.status !== "completed") {
      set({ ...saved });
    }
  },
}));
