import { create } from "zustand";
import type { CalorimetryState } from "@/lib/engine/types";
import {
  initialCalorimetryState,
  addNaOH,
  resetCalorimetry,
} from "@/lib/engine/calorimetry-engine";
import { validateAddNaOH } from "@/lib/engine/validation";
import { saveSession, loadSession } from "@/lib/persistence";

const STORAGE_KEY = "calorimetry";

interface CalorimetryStore extends CalorimetryState {
  lastError:     string | null;
  addNaOHAction: (volumeMl?: number) => void;
  resetAction:   () => void;
  setMode:       (mode: CalorimetryState["mode"]) => void;
  hydrate:       () => void;
}

export const useCalorimetryStore = create<CalorimetryStore>((set, get) => ({
  ...initialCalorimetryState("guided"),
  lastError: null,

  addNaOHAction: (volumeMl = 10) => {
    const s   = get();
    const err = validateAddNaOH(s);
    if (err) { set({ lastError: err.message }); return; }
    const next = addNaOH(s as CalorimetryState, volumeMl);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  resetAction: () => {
    const next = resetCalorimetry(get().mode);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  setMode: (mode) => set({ mode }),

  hydrate: () => {
    const saved = loadSession<CalorimetryState>(STORAGE_KEY);
    if (saved) {
      if (saved.status === "completed" || saved.status === "failed") {
        const fresh = initialCalorimetryState(saved.mode);
        set({ ...fresh, lastError: null });
        saveSession(STORAGE_KEY, fresh);
      } else {
        set({ ...saved, lastError: null });
      }
    }
  },
}));
