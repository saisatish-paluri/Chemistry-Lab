import { create } from "zustand";
import type { FunctionalGroupsState, UnknownCompoundId, FGTestId } from "@/lib/engine/types";
import {
  initialFunctionalGroupsState,
  selectFGCompound, selectFGTest,
  runFGTest, finishFGTest,
  completeFunctionalGroups, resetFunctionalGroups,
} from "@/lib/engine/functional-groups-engine";
import { saveSession, loadSession } from "@/lib/persistence";

const STORAGE_KEY = "functional-groups";

interface FunctionalGroupsStore extends FunctionalGroupsState {
  lastError:              string | null;
  selectCompoundAction:   (id: UnknownCompoundId) => void;
  selectTestAction:       (id: FGTestId) => void;
  runTestAction:          () => void;
  finishTestAction:       () => void;
  completeAction:         () => void;
  resetAction:            () => void;
  setMode:                (mode: FunctionalGroupsState["mode"]) => void;
  hydrate:                () => void;
  updateParamsAction:     (changes: Partial<Pick<FunctionalGroupsState, "temperature" | "reagentConc">>) => void;
}

export const useFunctionalGroupsStore = create<FunctionalGroupsStore>((set, get) => ({
  ...initialFunctionalGroupsState("guided"),
  lastError: null,

  selectCompoundAction: (id) => {
    const next = selectFGCompound(get() as FunctionalGroupsState, id);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  selectTestAction: (id) => {
    const next = selectFGTest(get() as FunctionalGroupsState, id);
    set({ ...next, lastError: null });
  },

  runTestAction: () => {
    const next = runFGTest(get() as FunctionalGroupsState);
    set({ ...next, lastError: null });
  },

  finishTestAction: () => {
    const next = finishFGTest(get() as FunctionalGroupsState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  completeAction: () => {
    const next = completeFunctionalGroups(get() as FunctionalGroupsState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  resetAction: () => {
    const next = resetFunctionalGroups(get() as FunctionalGroupsState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  setMode: (mode) => {
    set({ mode });
    saveSession(STORAGE_KEY, { ...get(), mode });
  },

  updateParamsAction: (changes) => {
    const next = { ...get() as FunctionalGroupsState, ...changes };
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  hydrate: () => {
    const saved = loadSession<FunctionalGroupsState>(STORAGE_KEY);
    if (saved && saved.status !== "completed") {
      set({ ...saved, lastError: null });
    }
  },
}));
