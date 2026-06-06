import { create } from "zustand";
import type { ChromatographyState, InkId } from "@/lib/engine/types";
import {
  initialChromatographyState,
  selectInk, applyInkSpot, placePaperInChamber, addSolvent,
  updateSolventFront, calculateRfValues,
  completeChromatography, resetChromatography,
} from "@/lib/engine/chromatography-engine";
import { saveSession, loadSession } from "@/lib/persistence";

const STORAGE_KEY = "chromatography";

interface ChromatographyStore extends ChromatographyState {
  lastError:                 string | null;
  selectInkAction:           (id: InkId) => void;
  applyInkAction:            () => void;
  placePaperAction:          () => void;
  addSolventAction:          () => void;
  updateSolventFrontAction:  (frontCm: number) => void;
  calculateRfAction:         () => void;
  completeAction:            () => void;
  resetAction:               () => void;
  setMode:                   (mode: ChromatographyState["mode"]) => void;
  hydrate:                   () => void;
}

export const useChromatographyStore = create<ChromatographyStore>((set, get) => ({
  ...initialChromatographyState("guided"),
  lastError: null,

  selectInkAction: (id) => {
    const next = selectInk(get() as ChromatographyState, id);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  applyInkAction: () => {
    const next = applyInkSpot(get() as ChromatographyState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  placePaperAction: () => {
    const next = placePaperInChamber(get() as ChromatographyState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  addSolventAction: () => {
    const next = addSolvent(get() as ChromatographyState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  updateSolventFrontAction: (frontCm) => {
    const next = updateSolventFront(get() as ChromatographyState, frontCm);
    set({ ...next });
  },

  calculateRfAction: () => {
    const next = calculateRfValues(get() as ChromatographyState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  completeAction: () => {
    const next = completeChromatography(get() as ChromatographyState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  resetAction: () => {
    const next = resetChromatography(get() as ChromatographyState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  setMode: (mode) => {
    set({ mode });
    saveSession(STORAGE_KEY, { ...get(), mode });
  },

  hydrate: () => {
    const saved = loadSession<ChromatographyState>(STORAGE_KEY);
    if (saved && saved.status !== "completed") {
      set({ ...saved, lastError: null });
    }
  },
}));
