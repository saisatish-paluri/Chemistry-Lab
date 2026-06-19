import { create } from "zustand";
import type { WaterHardnessState } from "@/lib/engine/types";
import {
  initialWaterHardnessState,
  fillBurette, prepareSample, addIndicator, addEDTA,
  calculateHardness, completeWaterHardness, resetForNextTrial,
} from "@/lib/engine/water-hardness-engine";
import { saveSession, loadSession } from "@/lib/persistence";
import { useSimulationStore } from "@/lib/simulation/session";
import { getWaterHardnessSimParams } from "@/lib/engine/sim-bridge";

function getSession() {
  return useSimulationStore.getState().getOrCreate({
    domain:         "water-hardness",
    reagentIds:     ["edta-0.01", "eriochrome-t"],
    apparatusIds:   ["burette", "conical-flask"],
    includeUnknown: true,
    unknownType:    "water",
  });
}

function freshInit(mode: WaterHardnessState["mode"]): WaterHardnessState {
  const session = getSession();
  const params  = getWaterHardnessSimParams(session);
  return initialWaterHardnessState(mode, params);
}

const STORAGE_KEY = "water-hardness";

interface WaterHardnessStore extends WaterHardnessState {
  lastError:              string | null;
  fillBuretteAction:      () => void;
  prepareSampleAction:    () => void;
  addIndicatorAction:     () => void;
  addEDTAAction:          (incrementMl: number) => void;
  calculateAction:        () => void;
  completeAction:         () => void;
  nextTrialAction:        () => void;
  resetAction:            () => void;
  setMode:                (mode: WaterHardnessState["mode"]) => void;
  hydrate:                () => void;
}

export const useWaterHardnessStore = create<WaterHardnessStore>((set, get) => ({
  ...freshInit("guided"),
  lastError: null,

  fillBuretteAction: () => {
    const next = fillBurette(get() as WaterHardnessState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
    useSimulationStore.getState().recordAction("water-hardness", "add-reagent");
  },

  prepareSampleAction: () => {
    const next = prepareSample(get() as WaterHardnessState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
    useSimulationStore.getState().recordAction("water-hardness", "add-reagent");
  },

  addIndicatorAction: () => {
    const next = addIndicator(get() as WaterHardnessState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
    useSimulationStore.getState().recordAction("water-hardness", "add-reagent");
  },

  addEDTAAction: (incrementMl) => {
    const s    = get() as WaterHardnessState;
    const next = addEDTA(s, incrementMl);
    set({ ...next, lastError: null });
    const actionType = incrementMl <= 0.1 ? "titrate-dropwise" : incrementMl <= 0.5 ? "titrate-slow" : "titrate-fast";
    useSimulationStore.getState().recordAction("water-hardness", actionType, incrementMl, "mL");
    if (next.endpointReached && !s.endpointReached) {
      useSimulationStore.getState().recordAction("water-hardness", "endpoint-detected", next.edtaAddedMl, "mL");
    }
  },

  calculateAction: () => {
    const next = calculateHardness(get() as WaterHardnessState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
    useSimulationStore.getState().recordAction("water-hardness", "record");
  },

  completeAction: () => {
    const next = completeWaterHardness(get() as WaterHardnessState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  nextTrialAction: () => {
    const next = resetForNextTrial(get() as WaterHardnessState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  resetAction: () => {
    useSimulationStore.getState().reset({
      domain: "water-hardness",
      reagentIds: ["edta-0.01", "eriochrome-t"],
      apparatusIds: ["burette", "conical-flask"],
      includeUnknown: true, unknownType: "water",
    });
    const next = freshInit(get().mode);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  setMode: (mode) => {
    set({ mode });
    saveSession(STORAGE_KEY, { ...get(), mode });
  },

  hydrate: () => {
    const saved = loadSession<WaterHardnessState>(STORAGE_KEY);
    if (saved && saved.status !== "completed") {
      set({ ...saved, lastError: null });
    }
  },
}));
