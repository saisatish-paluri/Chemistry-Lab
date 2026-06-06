import { create } from "zustand";
import type { ElectrolysisState, ElectrolyteId } from "@/lib/engine/types";
import {
  initialElectrolysisState, setElectrolyte, insertElectrodes,
  connectCircuit, disconnectCircuit, startElectrolysis,
  stopElectrolysis, tickElectrolysis, setCurrent, setVoltage, resetElectrolysis,
} from "@/lib/engine/electrolysis-engine";
import {
  validateStartElectrolysis, validateConnectCircuit, validateInsertElectrodes,
} from "@/lib/engine/validation";
import { saveSession, loadSession } from "@/lib/persistence";

const STORAGE_KEY = "electrolysis";

interface ElectrolysisStore extends ElectrolysisState {
  lastError:               string | null;
  setElectrolyteAction:    (id: ElectrolyteId) => void;
  insertElectrodesAction:  () => void;
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
  ...initialElectrolysisState("guided"),
  lastError: null,

  setElectrolyteAction: (id) => {
    const next = setElectrolyte(get() as ElectrolysisState, id);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  insertElectrodesAction: () => {
    const s   = get();
    const err = validateInsertElectrodes(s);
    if (err) { set({ lastError: err.message }); return; }
    const next = insertElectrodes(s as ElectrolysisState);
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
  },

  resetAction: () => {
    const next = resetElectrolysis(get().mode);
    set({ ...next, lastError: null });
    saveSession(STORAGE_KEY, next);
  },

  setMode: (mode) => set({ mode }),

  hydrate: () => {
    const saved = loadSession<ElectrolysisState>(STORAGE_KEY);
    if (saved) {
      if (saved.status === "completed" || saved.status === "failed") {
        const fresh = initialElectrolysisState(saved.mode);
        set({ ...fresh, lastError: null });
        saveSession(STORAGE_KEY, fresh);
      } else {
        set({ ...saved, lastError: null });
      }
    }
  },
}));
