import { create } from "zustand";
import type { AcidMetalState, ExperimentMode } from "@/lib/engine/types";
import {
  initialAcidMetalState,
  selectMetalAndSize, weighMetal,
  configureAcid, startReaction,
  triggerPopTest, tickAcidMetal,
  resetAcidMetal,
} from "@/lib/engine/acid-metal-engine";
import { saveSession, loadSession } from "@/lib/persistence";

const STORAGE_KEY = "acid-metal-lab";

interface AcidMetalStore extends AcidMetalState {
  setMode: (mode: ExperimentMode) => void;
  selectMetalAndSizeAction: (metal: AcidMetalState["selectedMetal"], size: AcidMetalState["particleSize"]) => void;
  weighMetalAction: (mass: number) => void;
  configureAcidAction: (acid: "hcl" | "h2so4", vol: number, conc: number) => void;
  startReactionAction: () => void;
  triggerPopTestAction: () => void;
  tickAction: (delta: number) => void;
  resetAction: () => void;
  hydrate: () => void;
}

export const useAcidMetalStore = create<AcidMetalStore>((set, get) => ({
  ...initialAcidMetalState("guided"),

  setMode: (mode) => {
    set({ mode });
    saveSession(STORAGE_KEY, { ...get(), mode });
  },

  selectMetalAndSizeAction: (metal, size) => {
    const next = selectMetalAndSize(get() as AcidMetalState, metal, size);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  weighMetalAction: (mass) => {
    const next = weighMetal(get() as AcidMetalState, mass);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  configureAcidAction: (acid, vol, conc) => {
    const next = configureAcid(get() as AcidMetalState, acid, vol, conc);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  startReactionAction: () => {
    const next = startReaction(get() as AcidMetalState);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  triggerPopTestAction: () => {
    const next = triggerPopTest(get() as AcidMetalState);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  tickAction: (delta) => {
    const next = tickAcidMetal(get() as AcidMetalState, delta);
    set({ ...next });
  },

  resetAction: () => {
    const next = resetAcidMetal(get() as AcidMetalState);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  hydrate: () => {
    const saved = loadSession<AcidMetalState>(STORAGE_KEY);
    if (saved && saved.status !== "completed") {
      set({ ...saved });
    }
  },
}));
