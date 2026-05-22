import { create } from "zustand";
import type { GasCollectionState } from "@/lib/engine/types";
import {
  initialGasCollectionState,
  addMarbleChips,
  addHCl,
  tickGasCollection,
  resetGasCollection,
} from "@/lib/engine/gas-collection-engine";
import {
  validateAddMarbleChips,
  validateAddHCl,
} from "@/lib/engine/validation";
import { saveSession, loadSession } from "@/lib/persistence";

const STORAGE_KEY = "gas-collection";

interface GasCollectionStore extends GasCollectionState {
  lastError:         string | null;
  addChipsAction:    (grams: number) => void;
  addHClAction:      (volumeMl: number) => void;
  tickAction:        (delta: number) => void;
  resetAction:       () => void;
  setMode:           (mode: GasCollectionState["mode"]) => void;
  hydrate:           () => void;
}

export const useGasCollectionStore = create<GasCollectionStore>((set, get) => ({
  ...initialGasCollectionState("guided"),
  lastError: null,

  addChipsAction: (grams) => {
    const s   = get();
    const err = validateAddMarbleChips(s);
    if (err) { set({ lastError: err.message }); return; }
    const next = addMarbleChips(s as GasCollectionState, grams);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  addHClAction: (volumeMl) => {
    const s   = get();
    const err = validateAddHCl(s);
    if (err) { set({ lastError: err.message }); return; }
    const next = addHCl(s as GasCollectionState, volumeMl);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  tickAction: (delta) => {
    const next = tickGasCollection(get() as GasCollectionState, delta);
    set({ ...next });
    if (next.status === "completed") saveSession(STORAGE_KEY, next);
  },

  resetAction: () => {
    const next = resetGasCollection(get().mode);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  setMode: (mode) => set({ mode }),

  hydrate: () => {
    const saved = loadSession<GasCollectionState>(STORAGE_KEY);
    if (saved) set({ ...saved, lastError: null });
  },
}));
