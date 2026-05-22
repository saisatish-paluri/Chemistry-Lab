import { create } from "zustand";
import type { GasLawsState, GasLaw } from "@/lib/engine/types";
import {
  initialGasLawsState, selectLaw, startExploration,
  setVolume, setTemperature, recordDataPoint, completeGasLaws, resetGasLaws,
} from "@/lib/engine/gas-laws-engine";
import {
  validateSelectLaw, validateRecordDataPoint, validateCompleteGasLaws,
} from "@/lib/engine/validation";
import { saveSession, loadSession } from "@/lib/persistence";

const STORAGE_KEY = "gas-laws";

interface GasLawsStore extends GasLawsState {
  lastError:                string | null;
  selectLawAction:          (law: GasLaw) => void;
  startExplorationAction:   () => void;
  setVolumeAction:          (v: number) => void;
  setTemperatureAction:     (t: number) => void;
  recordDataPointAction:    () => void;
  completeExperimentAction: () => void;
  resetAction:              () => void;
  setMode:                  (mode: GasLawsState["mode"]) => void;
  hydrate:                  () => void;
}

export const useGasLawsStore = create<GasLawsStore>((set, get) => ({
  ...initialGasLawsState("guided"),
  lastError: null,

  selectLawAction: (law) => {
    const s   = get();
    const err = validateSelectLaw(s);
    if (err) { set({ lastError: err.message }); return; }
    const next = selectLaw(s as GasLawsState, law);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  startExplorationAction: () => {
    const next = startExploration(get() as GasLawsState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  setVolumeAction: (v) => {
    const next = setVolume(get() as GasLawsState, v);
    set({ ...next });
    // don't spam storage on every slider tick
  },

  setTemperatureAction: (t) => {
    const next = setTemperature(get() as GasLawsState, t);
    set({ ...next });
  },

  recordDataPointAction: () => {
    const s   = get();
    const err = validateRecordDataPoint(s);
    if (err) { set({ lastError: err.message }); return; }
    const next = recordDataPoint(s as GasLawsState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
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
    const next = resetGasLaws(get().mode);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  setMode: (mode) => set({ mode }),

  hydrate: () => {
    const saved = loadSession<GasLawsState>(STORAGE_KEY);
    if (saved) set({ ...saved, lastError: null });
  },
}));
