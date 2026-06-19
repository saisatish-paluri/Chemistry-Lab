import { create } from "zustand";
import type { ElectrolysisState, ElectrolyteId, ElectrodeMaterial } from "@/lib/engine/types";
import {
  initialElectrolysisState, setElectrolyte, insertElectrodes,
  connectCircuit, disconnectCircuit, startElectrolysis,
  stopElectrolysis, tickElectrolysis, setCurrent, setVoltage, resetElectrolysis,
} from "@/lib/engine/electrolysis-engine";
import {
  validateStartElectrolysis, validateConnectCircuit, validateInsertElectrodes,
} from "@/lib/engine/validation";
import { saveSession, loadSession } from "@/lib/persistence";
import { useSimulationStore } from "@/lib/simulation/session";
import { getElectrolysisSimParams } from "@/lib/engine/sim-bridge";

function getSession() {
  return useSimulationStore.getState().getOrCreate({
    domain:       "electrolysis",
    reagentIds:   ["cuso4-0.5"],
    apparatusIds: ["electrodes", "ammeter", "power-supply"],
  });
}

function freshInit(mode: ElectrolysisState["mode"]): ElectrolysisState {
  const session = getSession();
  const params  = getElectrolysisSimParams(session);
  const state = initialElectrolysisState(mode, params);
  state.temperatureC = session.environment.temperatureC;
  return state;
}

const STORAGE_KEY = "electrolysis";

interface ElectrolysisStore extends ElectrolysisState {
  lastError:               string | null;
  setElectrolyteAction:    (id: ElectrolyteId) => void;
  insertElectrodesAction:  (material: ElectrodeMaterial) => void;
  connectCircuitAction:    () => void;
  disconnectCircuitAction: () => void;
  startAction:             () => void;
  stopAction:              () => void;
  tickAction:              (delta: number) => void;
  setCurrentAction:        (current: number) => void;
  setVoltageAction:        (voltage: number) => void;
  resetAction:             () => void;
  setMode:                 (mode: ElectrolysisState["mode"]) => void;
  hydrate:                 () => void;
}

export const useElectrolysisStore = create<ElectrolysisStore>((set, get) => ({
  ...freshInit("guided"),
  lastError: null,

  setElectrolyteAction: (id) => {
    const next = setElectrolyte(get() as ElectrolysisState, id);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
    useSimulationStore.getState().recordAction("electrolysis", "add-reagent");
  },

  insertElectrodesAction: (material) => {
    const s   = get();
    const err = validateInsertElectrodes(s);
    if (err) { set({ lastError: err.message }); return; }
    const next = insertElectrodes(s as ElectrolysisState, material);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  connectCircuitAction: () => {
    const s   = get();
    const err = validateConnectCircuit(s);
    if (err) { set({ lastError: err.message }); return; }
    const next = connectCircuit(s as ElectrolysisState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  disconnectCircuitAction: () => {
    const next = disconnectCircuit(get() as ElectrolysisState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  startAction: () => {
    const s   = get();
    const err = validateStartElectrolysis(s);
    if (err) { set({ lastError: err.message }); return; }
    const next = startElectrolysis(s as ElectrolysisState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
    useSimulationStore.getState().recordAction("electrolysis", "mix");
  },

  stopAction: () => {
    const next = stopElectrolysis(get() as ElectrolysisState);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  tickAction: (delta) => {
    const next = tickElectrolysis(get() as ElectrolysisState, delta);
    set({ ...next });
    if (next.status === "completed") saveSession(STORAGE_KEY, next);
  },

  setCurrentAction: (current) => {
    const next = setCurrent(get() as ElectrolysisState, current);
    set({ ...next });
  },

  setVoltageAction: (voltage) => {
    const next = setVoltage(get() as ElectrolysisState, voltage);
    set({ ...next });
    saveSession(STORAGE_KEY, next);
    useSimulationStore.getState().recordAction("electrolysis", "measure", voltage, "V");
  },

  resetAction: () => {
    useSimulationStore.getState().reset({
      domain: "electrolysis", reagentIds: ["cuso4-0.5"],
      apparatusIds: ["electrodes", "ammeter", "power-supply"],
    });
    const next = freshInit(get().mode);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  setMode: (mode) => set({ mode }),

  hydrate: () => {
    const saved = loadSession<ElectrolysisState>(STORAGE_KEY);
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
