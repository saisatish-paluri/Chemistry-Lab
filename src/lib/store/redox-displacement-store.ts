import { create } from "zustand";
import type { RedoxDisplacementState, MetalId } from "@/lib/engine/types";
import {
  initialRedoxState,
  selectMetal,
  addMetalToSolution,
  tickRedox,
  resetRedox,
} from "@/lib/engine/redox-displacement-engine";
import { validateSelectMetal, validateAddMetal } from "@/lib/engine/validation";
import { saveSession, loadSession } from "@/lib/persistence";

const STORAGE_KEY = "redox-displacement";

interface RedoxDisplacementStore extends RedoxDisplacementState {
  lastError:        string | null;
  selectMetalAction: (id: MetalId) => void;
  addMetalAction:   () => void;
  tickAction:       (delta: number) => void;
  resetAction:      () => void;
  setMode:          (mode: RedoxDisplacementState["mode"]) => void;
  hydrate:          () => void;
}

export const useRedoxDisplacementStore = create<RedoxDisplacementStore>((set, get) => ({
  ...initialRedoxState("guided"),
  lastError: null,

  selectMetalAction: (id) => {
    const s   = get();
    const err = validateSelectMetal(s);
    if (err) { set({ lastError: err.message }); return; }
    const next = selectMetal(s as RedoxDisplacementState, id);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  addMetalAction: () => {
    const s   = get();
    const err = validateAddMetal(s);
    if (err) { set({ lastError: err.message }); return; }
    const next = addMetalToSolution(s as RedoxDisplacementState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  tickAction: (delta) => {
    const next = tickRedox(get() as RedoxDisplacementState, delta);
    set({ ...next });
    if (next.status === "completed") saveSession(STORAGE_KEY, next);
  },

  resetAction: () => {
    const next = resetRedox(get().mode);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  setMode: (mode) => set({ mode }),

  hydrate: () => {
    const saved = loadSession<RedoxDisplacementState>(STORAGE_KEY);
    if (saved) set({ ...saved, lastError: null });
  },
}));
