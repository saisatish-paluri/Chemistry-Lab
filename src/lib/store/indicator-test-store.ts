import { create } from "zustand";
import type { IndicatorTestState, IndicatorTestId, TestSubstanceId } from "@/lib/engine/types";
import {
  initialIndicatorState,
  selectIndicator, selectSubstance,
  runTest, finishTest,
  completeIndicatorTest, resetIndicatorTest,
} from "@/lib/engine/indicator-test-engine";
import { saveSession, loadSession } from "@/lib/persistence";

const STORAGE_KEY = "indicator-test";

interface IndicatorStore extends IndicatorTestState {
  lastError:              string | null;
  selectIndicatorAction:  (id: IndicatorTestId) => void;
  selectSubstanceAction:  (id: TestSubstanceId) => void;
  testAction:             () => void;
  finishTestAction:       () => void;
  completeAction:         () => void;
  resetAction:            () => void;
  setMode:                (mode: IndicatorTestState["mode"]) => void;
  hydrate:                () => void;
}

export const useIndicatorStore = create<IndicatorStore>((set, get) => ({
  ...initialIndicatorState("guided"),
  lastError: null,

  selectIndicatorAction: (id) => {
    const next = selectIndicator(get() as IndicatorTestState, id);
    set({ ...next, lastError: null });
  },

  selectSubstanceAction: (id) => {
    const next = selectSubstance(get() as IndicatorTestState, id);
    set({ ...next, lastError: null });
  },

  testAction: () => {
    const next = runTest(get() as IndicatorTestState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  finishTestAction: () => {
    const next = finishTest(get() as IndicatorTestState);
    set({ ...next });
  },

  completeAction: () => {
    const next = completeIndicatorTest(get() as IndicatorTestState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  resetAction: () => {
    const next = resetIndicatorTest(get() as IndicatorTestState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  setMode: (mode) => {
    set({ mode });
    saveSession(STORAGE_KEY, { ...get(), mode });
  },

  hydrate: () => {
    const saved = loadSession<IndicatorTestState>(STORAGE_KEY);
    if (saved && saved.status !== "completed") {
      set({ ...saved, lastError: null });
    }
  },
}));
