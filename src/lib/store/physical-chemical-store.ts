import { create } from "zustand";
import type { PhysicalChemicalState, ExperimentMode } from "@/lib/engine/types";
import {
  initialPhysicalChemicalState,
  selectProcess,
  triggerProcessAction,
  checkReversibilityAction,
  tickPhysicalChemical,
  resetPhysicalChemical,
} from "@/lib/engine/physical-chemical-engine";
import { saveSession, loadSession } from "@/lib/persistence";

const STORAGE_KEY = "physical-chemical-lab";

interface PhysicalChemicalStore extends PhysicalChemicalState {
  setMode: (mode: ExperimentMode) => void;
  selectProcessAction: (process: PhysicalChemicalState["selectedProcess"]) => void;
  triggerProcessAction: () => void;
  checkReversibilityAction: () => void;
  tickAction: (delta: number) => void;
  resetAction: () => void;
  hydrate: () => void;
}

export const usePhysicalChemicalStore = create<PhysicalChemicalStore>((set, get) => ({
  ...initialPhysicalChemicalState("guided"),

  setMode: (mode) => {
    set({ mode });
    saveSession(STORAGE_KEY, { ...get(), mode });
  },

  selectProcessAction: (process) => {
    const next = selectProcess(get() as PhysicalChemicalState, process);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  triggerProcessAction: () => {
    const next = triggerProcessAction(get() as PhysicalChemicalState);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  checkReversibilityAction: () => {
    const next = checkReversibilityAction(get() as PhysicalChemicalState);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  tickAction: (delta) => {
    const next = tickPhysicalChemical(get() as PhysicalChemicalState, delta);
    set({ ...next });
  },

  resetAction: () => {
    const next = resetPhysicalChemical(get() as PhysicalChemicalState);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  hydrate: () => {
    const saved = loadSession<PhysicalChemicalState>(STORAGE_KEY);
    if (saved && saved.status !== "completed") {
      set({ ...saved });
    }
  },
}));
