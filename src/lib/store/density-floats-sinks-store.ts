import { create } from "zustand";
import type { DensityState, DensityMaterialId } from "@/lib/engine/types";
import {
  initialDensityState,
  selectMaterial, dropMaterial, settleAnimation,
  completeDensity, resetDensity, updateDensityParameters
} from "@/lib/engine/density-floats-sinks-engine";
import { saveSession, loadSession } from "@/lib/persistence";

const STORAGE_KEY = "density-floats-sinks";

interface DensityStore extends DensityState {
  lastError:             string | null;
  selectMaterialAction:  (id: DensityMaterialId) => void;
  dropAction:            () => void;
  settleAction:          () => void;
  completeAction:        () => void;
  resetAction:           () => void;
  setMode:               (mode: DensityState["mode"]) => void;
  hydrate:               () => void;
  updateParametersAction: (changes: Partial<Pick<DensityState, "mass" | "volume" | "temperature" | "salinity">>) => void;
}

export const useDensityStore = create<DensityStore>((set, get) => ({
  ...initialDensityState("guided"),
  lastError: null,

  selectMaterialAction: (id) => {
    const next = selectMaterial(get() as DensityState, id);
    set({ ...next, lastError: null });
  },

  updateParametersAction: (changes) => {
    const next = updateDensityParameters(get() as DensityState, changes);
    set({ ...next, lastError: null });
  },

  dropAction: () => {
    const next = dropMaterial(get() as DensityState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  settleAction: () => {
    const next = settleAnimation(get() as DensityState);
    set({ ...next });
  },

  completeAction: () => {
    const next = completeDensity(get() as DensityState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  resetAction: () => {
    const next = resetDensity(get() as DensityState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  setMode: (mode) => {
    set({ mode });
    saveSession(STORAGE_KEY, { ...get(), mode });
  },

  hydrate: () => {
    const saved = loadSession<DensityState>(STORAGE_KEY);
    if (saved && saved.status !== "completed") {
      set({ ...saved, lastError: null });
    }
  },
}));
