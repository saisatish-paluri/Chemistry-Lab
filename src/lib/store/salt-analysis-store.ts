import { create } from "zustand";
import type { SaltAnalysisState, UnknownSaltId } from "@/lib/engine/types";
import {
  initialSaltAnalysisState,
  selectSalt, recordPreliminary,
  runCationTest, finishCationTest,
  runAnionTest, finishAnionTest,
  completeSaltAnalysis, resetSaltAnalysis,
} from "@/lib/engine/salt-analysis-engine";
import { saveSession, loadSession } from "@/lib/persistence";

const STORAGE_KEY = "salt-analysis";

interface SaltAnalysisStore extends SaltAnalysisState {
  lastError:              string | null;
  selectSaltAction:       (id: UnknownSaltId) => void;
  preliminaryAction:      () => void;
  runCationTestAction:    () => void;
  finishCationTestAction: () => void;
  runAnionTestAction:     () => void;
  finishAnionTestAction:  () => void;
  completeAction:         () => void;
  resetAction:            () => void;
  setMode:                (mode: SaltAnalysisState["mode"]) => void;
  hydrate:                () => void;
}

export const useSaltAnalysisStore = create<SaltAnalysisStore>((set, get) => ({
  ...initialSaltAnalysisState("guided"),
  lastError: null,

  selectSaltAction: (id) => {
    const next = selectSalt(get() as SaltAnalysisState, id);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  preliminaryAction: () => {
    const next = recordPreliminary(get() as SaltAnalysisState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  runCationTestAction: () => {
    const next = runCationTest(get() as SaltAnalysisState);
    set({ ...next, lastError: null });
  },

  finishCationTestAction: () => {
    const next = finishCationTest(get() as SaltAnalysisState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  runAnionTestAction: () => {
    const next = runAnionTest(get() as SaltAnalysisState);
    set({ ...next, lastError: null });
  },

  finishAnionTestAction: () => {
    const next = finishAnionTest(get() as SaltAnalysisState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  completeAction: () => {
    const next = completeSaltAnalysis(get() as SaltAnalysisState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  resetAction: () => {
    const next = resetSaltAnalysis(get() as SaltAnalysisState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  setMode: (mode) => {
    set({ mode });
    saveSession(STORAGE_KEY, { ...get(), mode });
  },

  hydrate: () => {
    const saved = loadSession<SaltAnalysisState>(STORAGE_KEY);
    if (saved && saved.status !== "completed") {
      set({ ...saved, lastError: null });
    }
  },
}));
