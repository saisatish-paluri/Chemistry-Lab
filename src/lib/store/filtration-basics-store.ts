import { create } from "zustand";
import type { FiltrationState } from "@/lib/engine/types";
import {
  initialFiltrationState,
  addWater, tickMixProgress, setupFilter,
  startPouring, tickFilterProgress,
  completeFiltration, resetFiltration,
} from "@/lib/engine/filtration-basics-engine";
import { saveSession, loadSession } from "@/lib/persistence";

const STORAGE_KEY = "filtration-basics";

interface FiltrationStore extends FiltrationState {
  lastError:         string | null;
  addWaterAction:    () => void;
  tickMixAction:     (delta: number) => void;
  setupFilterAction: () => void;
  startPourAction:   () => void;
  tickFilterAction:  (delta: number) => void;
  completeAction:    () => void;
  resetAction:       () => void;
  setMode:           (mode: FiltrationState["mode"]) => void;
  hydrate:           () => void;
}

export const useFiltrationStore = create<FiltrationStore>((set, get) => ({
  ...initialFiltrationState("guided"),
  lastError: null,

  addWaterAction: () => {
    const next = addWater(get() as FiltrationState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  tickMixAction: (delta) => {
    const next = tickMixProgress(get() as FiltrationState, delta);
    set({ ...next });
  },

  setupFilterAction: () => {
    const next = setupFilter(get() as FiltrationState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  startPourAction: () => {
    const next = startPouring(get() as FiltrationState);
    set({ ...next, lastError: null });
  },

  tickFilterAction: (delta) => {
    const next = tickFilterProgress(get() as FiltrationState, delta);
    set({ ...next });
  },

  completeAction: () => {
    const next = completeFiltration(get() as FiltrationState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  resetAction: () => {
    const next = resetFiltration(get() as FiltrationState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  setMode: (mode) => {
    set({ mode });
    saveSession(STORAGE_KEY, { ...get(), mode });
  },

  hydrate: () => {
    const saved = loadSession<FiltrationState>(STORAGE_KEY);
    if (saved && saved.status !== "completed") {
      set({ ...saved, lastError: null });
    }
  },
}));
