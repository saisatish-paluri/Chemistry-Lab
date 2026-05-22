import { create } from "zustand";
import type { TitrationState, IndicatorName, TitrantFlowRate } from "@/lib/engine/types";
import {
  initialTitrationState, addIndicator, addTitrant,
  setFlowRate, resetTitration, buildTitrationResult,
} from "@/lib/engine/titration-engine";
import { validateAddIndicator, validateAddTitrant } from "@/lib/engine/validation";
import { saveSession, loadSession } from "@/lib/persistence";

const STORAGE_KEY = "titration";

interface TitrationStore extends TitrationState {
  lastError: string | null;
  addIndicatorAction: (indicator: IndicatorName) => void;
  addTitrantAction:   () => void;
  setFlowRateAction:  (rate: TitrantFlowRate) => void;
  resetAction:        () => void;
  setMode:            (mode: TitrationState["mode"]) => void;
  hydrate:            () => void;
}

export const useTitrationStore = create<TitrationStore>((set, get) => ({
  ...initialTitrationState("guided"),
  lastError: null,

  addIndicatorAction: (indicator) => {
    const s   = get();
    const err = validateAddIndicator(s);
    if (err) { set({ lastError: err.message }); return; }
    const next = addIndicator(s as TitrationState, indicator);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  addTitrantAction: () => {
    const s   = get();
    const err = validateAddTitrant(s);
    if (err) { set({ lastError: err.message }); return; }
    const next = addTitrant(s as TitrationState);
    const final = next.status === "completed" || next.status === "failed"
      ? buildTitrationResult(next)
      : next;
    set({ ...final, lastError: null });
    saveSession(STORAGE_KEY, final);
  },

  setFlowRateAction: (rate) => {
    const next = setFlowRate(get() as TitrationState, rate);
    set({ ...next });
  },

  resetAction: () => {
    const next = resetTitration(get().mode);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  setMode: (mode) => set({ mode }),

  hydrate: () => {
    const saved = loadSession<TitrationState>(STORAGE_KEY);
    if (saved) set({ ...saved, lastError: null });
  },
}));
