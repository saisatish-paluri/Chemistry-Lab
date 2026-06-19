import { create } from "zustand";
import type { AcidCarbonateState, ExperimentMode } from "@/lib/engine/types";
import {
  initialAcidCarbonateState,
  selectCarbonate, weighCarbonate,
  configureCarbonateAcid, startCarbonateReaction,
  toggleLimeWaterTest, tickAcidCarbonate,
  resetAcidCarbonate,
} from "@/lib/engine/acid-carbonate-engine";
import { saveSession, loadSession } from "@/lib/persistence";

const STORAGE_KEY = "acid-carbonate-lab";

interface AcidCarbonateStore extends AcidCarbonateState {
  setMode: (mode: ExperimentMode) => void;
  selectCarbonateAction: (carb: AcidCarbonateState["selectedCarbonate"]) => void;
  weighCarbonateAction: (mass: number) => void;
  configureAcidAction: (acid: "hcl" | "h2so4", vol: number, conc: number, sealed: boolean) => void;
  startReactionAction: () => void;
  toggleLimeWaterTestAction: (active: boolean) => void;
  tickAction: (delta: number) => void;
  resetAction: () => void;
  hydrate: () => void;
}

export const useAcidCarbonateStore = create<AcidCarbonateStore>((set, get) => ({
  ...initialAcidCarbonateState("guided"),

  setMode: (mode) => {
    set({ mode });
    saveSession(STORAGE_KEY, { ...get(), mode });
  },

  selectCarbonateAction: (carb) => {
    const next = selectCarbonate(get() as AcidCarbonateState, carb);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  weighCarbonateAction: (mass) => {
    const next = weighCarbonate(get() as AcidCarbonateState, mass);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  configureAcidAction: (acid, vol, conc, sealed) => {
    const next = configureCarbonateAcid(get() as AcidCarbonateState, acid, vol, conc, sealed);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  startReactionAction: () => {
    const next = startCarbonateReaction(get() as AcidCarbonateState);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  toggleLimeWaterTestAction: (active) => {
    const next = toggleLimeWaterTest(get() as AcidCarbonateState, active);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  tickAction: (delta) => {
    const next = tickAcidCarbonate(get() as AcidCarbonateState, delta);
    set({ ...next });
  },

  resetAction: () => {
    const next = resetAcidCarbonate(get() as AcidCarbonateState);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
  },

  hydrate: () => {
    const saved = loadSession<AcidCarbonateState>(STORAGE_KEY);
    if (saved && saved.status !== "completed") {
      set({ ...saved });
    }
  },
}));
