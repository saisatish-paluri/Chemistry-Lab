import { create } from "zustand";
import type { DissolvingRateState, DissolveTemp, DissolveGranularity } from "@/lib/engine/types";
import {
  initialDissolvingState,
  setTemperature, setGranularity, setStirring,
  startDissolving, tickDissolveProgress,
  completeDissolvingRate, resetDissolving,
  calcDissolveTimeFromCelsius,
  celsiusToDissolveTemp,
} from "@/lib/engine/dissolving-rate-engine";
import { saveSession, loadSession } from "@/lib/persistence";

const STORAGE_KEY = "dissolving-rate";

interface DissolvingStore extends DissolvingRateState {
  lastError:                  string | null;
  /** Continuous temperature chosen by the slider (5–100 °C) */
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
}

export const useDissolvingStore = create<DissolvingStore>((set, get) => ({
  ...initialDissolvingState("guided"),
  lastError:         null,
  customTempCelsius: 40,          // default: warm (40 °C)

  setTempAction: (t) => {
    const next = setTemperature(get() as DissolvingRateState, t);
    const celsius = t === "cold" ? 10 : t === "warm" ? 40 : 80;
    set({ ...next, customTempCelsius: celsius, lastError: null });
  },

  setCustomTempCelsiusAction: (celsius) => {
    const mapped: DissolveTemp = celsiusToDissolveTemp(celsius);
    const next = setTemperature(get() as DissolvingRateState, mapped);
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

  startAction: () => {
    const next = startDissolving(get() as DissolvingRateState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  tickAction: (delta) => {
    const state = get();
    if (!state.isDissolving) return;
    // Use continuous celsius for accurate dissolving-time calculation
    const totalTime = calcDissolveTimeFromCelsius(
      state.customTempCelsius,
      state.granularity,
      state.stirring,
    );
    const increment  = (delta / totalTime) * 100;
    const newProgress = Math.min(100, state.dissolveProgress + increment);
    if (newProgress >= 100) {
      // finish dissolving
      const next = tickDissolveProgress({ ...state, dissolveProgress: 100 - increment } as DissolvingRateState, delta);
      set({ ...next });
    } else {
      set({ dissolveProgress: newProgress });
    }
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
      // Derive celsius from saved DissolveTemp if not otherwise stored
      const celsius =
        saved.temperature === "cold" ? 10
        : saved.temperature === "hot"  ? 80
        : 40;
      set({ ...saved, lastError: null, customTempCelsius: celsius });
    }
  },
}));
