import { create } from "zustand";
import type { FlameTestState, FlameTestSampleId } from "@/lib/engine/types";
import {
  initialFlameTestState, lightBurner, selectSample, dipLoop,
  performTest, completeTest, cleanLoop, completeFlameTest, resetFlameTest,
} from "@/lib/engine/flame-test-engine";
import {
  validateLightBurner, validateDipLoop, validatePerformTest, validateCompleteFlameTest,
} from "@/lib/engine/validation";
import { saveSession, loadSession } from "@/lib/persistence";

const STORAGE_KEY = "flame-test";

interface FlameTestStore extends FlameTestState {
  lastError:              string | null;
  lightBurnerAction:      () => void;
  selectSampleAction:     (id: FlameTestSampleId) => void;
  dipLoopAction:          () => void;
  performTestAction:      () => void;
  completeTestAction:     () => void;
  cleanLoopAction:        () => void;
  completeExperimentAction: () => void;
  resetAction:            () => void;
  setMode:                (mode: FlameTestState["mode"]) => void;
  hydrate:                () => void;
}

export const useFlameTestStore = create<FlameTestStore>((set, get) => ({
  ...initialFlameTestState("guided"),
  lastError: null,

  lightBurnerAction: () => {
    const s   = get();
    const err = validateLightBurner(s);
    if (err) { set({ lastError: err.message }); return; }
    const next = lightBurner(s as FlameTestState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  selectSampleAction: (id) => {
    const s    = get();
    const next = selectSample(s as FlameTestState, id);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  dipLoopAction: () => {
    const s   = get();
    const err = validateDipLoop(s);
    if (err) { set({ lastError: err.message }); return; }
    const next = dipLoop(s as FlameTestState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  performTestAction: () => {
    const s   = get();
    const err = validatePerformTest(s);
    if (err) { set({ lastError: err.message }); return; }
    const next = performTest(s as FlameTestState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  completeTestAction: () => {
    const s    = get();
    const next = completeTest(s as FlameTestState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  cleanLoopAction: () => {
    const s    = get();
    const next = cleanLoop(s as FlameTestState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  completeExperimentAction: () => {
    const s   = get();
    const err = validateCompleteFlameTest(s);
    if (err) { set({ lastError: err.message }); return; }
    const next = completeFlameTest(s as FlameTestState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  resetAction: () => {
    const next = resetFlameTest(get().mode);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  setMode: (mode) => set({ mode }),

  hydrate: () => {
    const saved = loadSession<FlameTestState>(STORAGE_KEY);
    if (saved) set({ ...saved, lastError: null });
  },
}));
