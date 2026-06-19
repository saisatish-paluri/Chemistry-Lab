import { create } from "zustand";
import type { DiffusionLiquidsState, ExperimentMode } from "@/lib/engine/types";
import {
  initialDiffusionLiquidsState,
  selectSolute,
  setTemperature,
  setStirringSpeed,
  addDroplet,
  tickDiffusionLiquids,
  resetDiffusionLiquids,
} from "@/lib/engine/diffusion-liquids-engine";
import { saveSession, loadSession } from "@/lib/persistence";

const STORAGE_KEY = "diffusion-liquids-lab";

interface DiffusionLiquidsStore extends DiffusionLiquidsState {
  setMode: (mode: ExperimentMode) => void;
  selectSoluteAction: (solute: "kmno4" | "dye" | "cuso4") => void;
  setTemperatureAction: (temp: number) => void;
  setStirringSpeedAction: (speed: number) => void;
  addDropletAction: () => void;
  tickAction: (delta: number) => void;
  resetAction: () => void;
  hydrate: () => void;
}

export const useDiffusionLiquidsStore = create<DiffusionLiquidsStore>((set, get) => ({
  ...initialDiffusionLiquidsState("guided"),

  setMode: (mode) => {
    set({ mode });
    saveSession(STORAGE_KEY, { ...get(), mode });
  },

  selectSoluteAction: (solute) => {
    const next = selectSolute(get() as DiffusionLiquidsState, solute);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  setTemperatureAction: (temp) => {
    const next = setTemperature(get() as DiffusionLiquidsState, temp);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  setStirringSpeedAction: (speed) => {
    const next = setStirringSpeed(get() as DiffusionLiquidsState, speed);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  addDropletAction: () => {
    const next = addDroplet(get() as DiffusionLiquidsState);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  tickAction: (delta) => {
    const next = tickDiffusionLiquids(get() as DiffusionLiquidsState, delta);
    set({ ...next });
  },

  resetAction: () => {
    const next = resetDiffusionLiquids(get() as DiffusionLiquidsState);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  hydrate: () => {
    const saved = loadSession<DiffusionLiquidsState>(STORAGE_KEY);
    if (saved && saved.status !== "completed") {
      set({ ...saved });
    }
  },
}));
