import { create } from "zustand";
import type { GasLawsState, GasLaw } from "@/lib/engine/types";
import {
  initialGasLawsState, selectLaw, startExploration,
  setVolume, setTemperature, setGasType, setSealQuality, tickGasLaws,
  recordDataPoint, completeGasLaws, resetGasLaws,
} from "@/lib/engine/gas-laws-engine";
import {
  validateSelectLaw, validateRecordDataPoint, validateCompleteGasLaws,
} from "@/lib/engine/validation";
import { saveSession, loadSession } from "@/lib/persistence";
import { rollErrors, buildDefaultErrorConfig } from "@/lib/instruments/error-engine";
import { useSimulationStore } from "@/lib/simulation/session";
import { getGasLawsSimParams } from "@/lib/engine/sim-bridge";

function getSession() {
  return useSimulationStore.getState().getOrCreate({
    domain:       "gas-laws",
    apparatusIds: ["thermometer", "gas-syringe", "manometer"],
  });
}

function freshInit(mode: GasLawsState["mode"]): GasLawsState {
  const session = getSession();
  const params  = getGasLawsSimParams(session);
  const errors  = rollErrors(buildDefaultErrorConfig(session.difficulty)).errors;
  return initialGasLawsState(mode, errors, params);
}

const STORAGE_KEY = "gas-laws";

interface GasLawsStore extends GasLawsState {
  lastError:                string | null;
  selectLawAction:          (law: GasLaw) => void;
  startExplorationAction:   () => void;
  setVolumeAction:          (v: number) => void;
  setTemperatureAction:     (t: number) => void;
  setGasTypeAction:         (gasType: "he" | "n2" | "co2") => void;
  setSealQualityAction:     (quality: number) => void;
  tickAction:               (deltaSec: number) => void;
  recordDataPointAction:    () => void;
  completeExperimentAction: () => void;
  resetAction:              () => void;
  setMode:                  (mode: GasLawsState["mode"]) => void;
  hydrate:                  () => void;
}

export const useGasLawsStore = create<GasLawsStore>((set, get) => ({
  ...freshInit("guided"),
  lastError: null,

  selectLawAction: (law) => {
    const s   = get();
    const err = validateSelectLaw(s);
    if (err) { set({ lastError: err.message }); return; }
    const next = selectLaw(s as GasLawsState, law);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
    useSimulationStore.getState().recordAction("gas-laws", "record");
  },

  startExplorationAction: () => {
    const next = startExploration(get() as GasLawsState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  setVolumeAction: (v) => {
    const next = setVolume(get() as GasLawsState, v);
    set({ ...next });
  },

  setTemperatureAction: (t) => {
    const next = setTemperature(get() as GasLawsState, t);
    set({ ...next });
  },

  setGasTypeAction: (gasType) => {
    const next = setGasType(get() as GasLawsState, gasType);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  setSealQualityAction: (quality) => {
    const next = setSealQuality(get() as GasLawsState, quality);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  tickAction: (deltaSec) => {
    const next = tickGasLaws(get() as GasLawsState, deltaSec);
    set({ ...next });
  },

  recordDataPointAction: () => {
    const s   = get();
    const err = validateRecordDataPoint(s);
    if (err) { set({ lastError: err.message }); return; }
    const next = recordDataPoint(s as GasLawsState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
    useSimulationStore.getState().recordAction("gas-laws", "measure", next.dataPoints.length);
  },

  completeExperimentAction: () => {
    const s   = get();
    const err = validateCompleteGasLaws(s);
    if (err) { set({ lastError: err.message }); return; }
    const next = completeGasLaws(s as GasLawsState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  resetAction: () => {
    useSimulationStore.getState().reset({
      domain: "gas-laws",
      apparatusIds: ["thermometer", "gas-syringe", "manometer"],
    });
    const next = freshInit(get().mode);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  setMode: (mode) => set({ mode }),

  hydrate: () => {
    const saved = loadSession<GasLawsState>(STORAGE_KEY);
    if (saved) {
      if (saved.status === "completed" || saved.status === "failed") {
        const fresh = freshInit(saved.mode);
        set({ ...fresh, lastError: null });
        saveSession(STORAGE_KEY, fresh);
      } else {
        set({ ...saved, lastError: null });
      }
    }
  },
}));
