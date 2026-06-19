import { create } from "zustand";
import type { DissolvingRateState, DissolveTemp, DissolveGranularity } from "@/lib/engine/types";
import {
  initialDissolvingState,
  setGranularity, setStirring,
  startDissolving, tickDissolveProgress,
  completeDissolvingRate, resetDissolving,
  updateDissolvingParameters,
} from "@/lib/engine/dissolving-rate-engine";
import { saveSession, loadSession } from "@/lib/persistence";

const STORAGE_KEY = "dissolving-rate";

interface DissolvingStore extends DissolvingRateState {
  lastError:                  string | null;
  customTempCelsius:          number;
  setTempAction:              (t: DissolveTemp) => void;
  setCustomTempCelsiusAction: (celsius: number) => void;
  setGranularityAction:       (g: DissolveGranularity) => void;
  setStirringAction:          (s: boolean) => void;
  startAction:                () => void;
  tickAction:                 (delta: number) => void;
  completeAction:             () => void;
  resetAction:                () => void;
  setMode:                    (mode: DissolvingRateState["mode"]) => void;
  hydrate:                    () => void;
  updateSugarMassAction:      (mass: number) => void;
}

export const useDissolvingStore = create<DissolvingStore>((set, get) => ({
  ...initialDissolvingState("guided"),
  lastError:         null,
  customTempCelsius: 40,          // default: warm (40 °C)

  setTempAction: (t) => {
    const celsius = t === "cold" ? 5 : t === "warm" ? 40 : 80;
    const next = updateDissolvingParameters(get() as DissolvingRateState, { celsius });
    set({ ...next, customTempCelsius: celsius, lastError: null });
  },

  setCustomTempCelsiusAction: (celsius) => {
    const next = updateDissolvingParameters(get() as DissolvingRateState, { celsius });
    set({ ...next, customTempCelsius: celsius, lastError: null });
  },

  setGranularityAction: (g) => {
    const next = setGranularity(get() as DissolvingRateState, g);
    set({ ...next, lastError: null });
  },

  setStirringAction: (s) => {
    const next = setStirring(get() as DissolvingRateState, s);
    set({ ...next, lastError: null });
  },

  updateSugarMassAction: (mass) => {
    const next = updateDissolvingParameters(get() as DissolvingRateState, { massAdded: mass });
    set({ ...next, lastError: null });
  },

  startAction: () => {
    const next = startDissolving(get() as DissolvingRateState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  tickAction: (delta) => {
    const state = get();
    if (!state.isDissolving) return;
    const next = tickDissolveProgress(state as DissolvingRateState, delta);
    set({ ...next });
  },

  completeAction: () => {
    const next = completeDissolvingRate(get() as DissolvingRateState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  resetAction: () => {
    const next = resetDissolving(get() as DissolvingRateState);
    set({ ...next, lastError: null, customTempCelsius: 40 });
    saveSession(STORAGE_KEY, next);
  },

  setMode: (mode) => {
    set({ mode });
    saveSession(STORAGE_KEY, { ...get(), mode });
  },

  hydrate: () => {
    const saved = loadSession<DissolvingRateState>(STORAGE_KEY);
    if (saved && saved.status !== "completed") {
      set({ ...saved, lastError: null, customTempCelsius: saved.celsius ?? 40 });
    }
  },
}));
