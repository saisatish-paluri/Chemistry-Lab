import { calcElectrolysisMoles, ML_PER_MOLE_GAS } from "./chemistry";
import type {
  ElectrolysisState, ElectrolyteId,
  ObservationEvent, StepDef, ExperimentObjective,
} from "./types";

function uid(): string { return Math.random().toString(36).slice(2, 10); }

function mkObs(
  type: ObservationEvent["type"],
  message: string,
  severity: ObservationEvent["severity"],
): ObservationEvent {
  return { id: uid(), timestamp: Date.now(), type, message, severity };
}

// How full a tube needs to get (mL) before the experiment auto-completes.
export const GAS_TUBE_CAPACITY_ML = 10;

// Maximum voltage and the maximum current that full voltage + full conductivity produces.
const MAX_VOLTAGE = 12;
const MAX_CURRENT = 3.0; // A at 12 V, conductivity = 1.0

/** Derive current (A) from a voltage setting and electrolyte conductivity. */
function deriveCurrent(voltage: number, conductivity: number): number {
  return (voltage / MAX_VOLTAGE) * MAX_CURRENT * conductivity;
}

export interface ElectrolyteProfile {
  id:               ElectrolyteId;
  name:             string;
  formula:          string;
  conductivity:     number;
  isConductive:     boolean;
  anodeGas:         string;
  cathodeGas:       string;
  anodeReaction:    string;
  cathodeReaction:  string;
  anodeElectrons:   number;
  cathodeElectrons: number;
  liquidColor:      string;
  education:        string;
}

export const ELECTROLYTES: Record<ElectrolyteId, ElectrolyteProfile> = {
  "sodium-chloride": {
    id: "sodium-chloride", name: "Sodium Chloride", formula: "NaCl (aq)",
    conductivity: 0.85, isConductive: true,
    anodeGas: "Cl₂", cathodeGas: "H₂",
    anodeReaction:   "2Cl⁻ → Cl₂ + 2e⁻",
    cathodeReaction: "2H₂O + 2e⁻ → H₂ + 2OH⁻",
    anodeElectrons: 2, cathodeElectrons: 2,
    liquidColor: "#e0f2fe",
    education: "NaCl dissociates into Na⁺ and Cl⁻ ions. Cl⁻ is oxidised at the anode to form Cl₂ gas. Water is reduced at the cathode, releasing H₂.",
  },
  "sulfuric-acid": {
    id: "sulfuric-acid", name: "Sulfuric Acid", formula: "H₂SO₄ (aq)",
    conductivity: 0.92, isConductive: true,
    anodeGas: "O₂", cathodeGas: "H₂",
    anodeReaction:   "2H₂O → O₂ + 4H⁺ + 4e⁻",
    cathodeReaction: "2H⁺ + 2e⁻ → H₂",
    anodeElectrons: 4, cathodeElectrons: 2,
    liquidColor: "#fef9c3",
    education: "H₂SO₄ provides H⁺ ions. H⁺ is reduced at cathode (H₂). Water is oxidised at anode (O₂). Note 2:1 volume ratio H₂:O₂.",
  },
  "copper-sulfate": {
    id: "copper-sulfate", name: "Copper Sulfate", formula: "CuSO₄ (aq)",
    conductivity: 0.70, isConductive: true,
    anodeGas: "O₂", cathodeGas: "Cu (deposited)",
    anodeReaction:   "2H₂O → O₂ + 4H⁺ + 4e⁻",
    cathodeReaction: "Cu²⁺ + 2e⁻ → Cu",
    anodeElectrons: 4, cathodeElectrons: 2,
    liquidColor: "#bfdbfe",
    education: "Cu²⁺ ions are preferentially reduced at the cathode, depositing solid copper metal. This is the basis of electroplating.",
  },
  "sodium-hydroxide": {
    id: "sodium-hydroxide", name: "Sodium Hydroxide", formula: "NaOH (aq)",
    conductivity: 0.88, isConductive: true,
    anodeGas: "O₂", cathodeGas: "H₂",
    anodeReaction:   "4OH⁻ → O₂ + 2H₂O + 4e⁻",
    cathodeReaction: "2H₂O + 2e⁻ → H₂ + 2OH⁻",
    anodeElectrons: 4, cathodeElectrons: 2,
    liquidColor: "#d1fae5",
    education: "OH⁻ is oxidised at the anode to produce O₂. Water is reduced at the cathode to produce H₂. Net: water is electrolysed.",
  },
  "distilled-water": {
    id: "distilled-water", name: "Distilled Water", formula: "H₂O",
    conductivity: 0.0, isConductive: false,
    anodeGas: "—", cathodeGas: "—",
    anodeReaction: "—", cathodeReaction: "—",
    anodeElectrons: 2, cathodeElectrons: 2,
    liquidColor: "#f0f9ff",
    education: "Pure water has virtually no free ions, so it cannot conduct electricity and electrolysis will not occur.",
  },
};

const INITIAL_STEPS: StepDef[] = [
  { id: "choose-electrolyte",  instruction: "Select an electrolyte solution.",            completed: false },
  { id: "insert-electrodes",   instruction: "Insert both electrodes into the solution.",  completed: false },
  { id: "connect-circuit",     instruction: "Connect the wires to the power source.",     completed: false },
  { id: "start-current",       instruction: "Switch on the current and observe.",         completed: false },
];

const INITIAL_OBJECTIVES: ExperimentObjective[] = [
  { id: "select-electrolyte",  description: "Select a conductive electrolyte",     completed: false },
  { id: "complete-circuit",    description: "Complete the electrical circuit",      completed: false },
  { id: "observe-gas",         description: "Observe gas evolution at electrodes",  completed: false },
];

export function initialElectrolysisState(mode: ElectrolysisState["mode"]): ElectrolysisState {
  return {
    mode, status: "idle",
    electrolyte: null, electrolyteConc: 1.0,
    anode:   { material: "platinum", polarity: "anode",   connected: false, gasFormula: null, gasMoles: 0, bubbleRate: 0 },
    cathode: { material: "platinum", polarity: "cathode", connected: false, gasFormula: null, gasMoles: 0, bubbleRate: 0 },
    circuitComplete: false,
    voltage: 6.0,
    current: 0,   // derived once an electrolyte is chosen
    runTimeSeconds: 0, anodeGasMl: 0, cathodeGasMl: 0,
    steps:      INITIAL_STEPS.map((s) => ({ ...s })),
    objectives: INITIAL_OBJECTIVES.map((o) => ({ ...o })),
    observations: [], result: null, startedAt: null,
  };
}

export function setElectrolyte(state: ElectrolysisState, id: ElectrolyteId): ElectrolysisState {
  if (state.status === "running" || state.status === "completed" || state.status === "failed") return state;
  const p = ELECTROLYTES[id];
  const current = p.isConductive ? deriveCurrent(state.voltage, p.conductivity) : 0;
  const obs = mkObs(
    "conductivity-change",
    p.isConductive
      ? `${p.name} selected — conductivity ${(p.conductivity * 100).toFixed(0)}%. Effective current at ${state.voltage.toFixed(1)} V: ${current.toFixed(2)} A. ${p.education}`
      : `${p.name} has near-zero conductivity — electrolysis will not occur. ${p.education}`,
    p.isConductive ? "info" : "warning",
  );
  return {
    ...state, electrolyte: id, status: "setup",
    current,
    steps:      state.steps.map((s) => s.id === "choose-electrolyte" ? { ...s, completed: true } : s),
    objectives: state.objectives.map((o) => o.id === "select-electrolyte" && p.isConductive ? { ...o, completed: true } : o),
    observations: [obs, ...state.observations],
  };
}

export function insertElectrodes(state: ElectrolysisState): ElectrolysisState {
  if (!state.electrolyte) return state;
  if (state.anode.connected && state.cathode.connected) return state;
  return {
    ...state,
    anode:   { ...state.anode,   connected: true },
    cathode: { ...state.cathode, connected: true },
    steps:   state.steps.map((s) => s.id === "insert-electrodes" ? { ...s, completed: true } : s),
    observations: [mkObs("reaction-start", "Platinum electrodes inserted — anode (+) and cathode (−) submerged in electrolyte.", "info"), ...state.observations],
  };
}

export function connectCircuit(state: ElectrolysisState): ElectrolysisState {
  if (!state.anode.connected || !state.cathode.connected) return state;
  if (state.circuitComplete) return state;
  return {
    ...state,
    circuitComplete: true,
    status: "ready",
    steps:      state.steps.map((s) => s.id === "connect-circuit" ? { ...s, completed: true } : s),
    objectives: state.objectives.map((o) => o.id === "complete-circuit" ? { ...o, completed: true } : o),
    observations: [mkObs("conductivity-change", `Circuit complete — ${state.current.toFixed(2)} A at ${state.voltage.toFixed(1)} V. Ready to start electrolysis.`, "info"), ...state.observations],
  };
}

export function disconnectCircuit(state: ElectrolysisState): ElectrolysisState {
  return {
    ...state,
    circuitComplete: false,
    status: state.status === "running" ? "paused" : state.status === "ready" ? "setup" : state.status,
    anode:   { ...state.anode,   bubbleRate: 0 },
    cathode: { ...state.cathode, bubbleRate: 0 },
    observations: [mkObs("conductivity-change", "Circuit disconnected — no current flowing.", "info"), ...state.observations],
  };
}

export function startElectrolysis(state: ElectrolysisState): ElectrolysisState {
  if (!state.circuitComplete || !state.electrolyte) return state;
  const p = ELECTROLYTES[state.electrolyte];
  if (!p.isConductive) {
    return {
      ...state,
      observations: [mkObs("conductivity-change", "Insufficient conductivity — no current flows. Select a conductive electrolyte.", "error"), ...state.observations],
    };
  }
  const current = deriveCurrent(state.voltage, p.conductivity);
  const rate = Math.min(1, current / 2);
  return {
    ...state,
    status: "running",
    current,
    startedAt: state.startedAt ?? Date.now(),
    anode:   { ...state.anode,   gasFormula: p.anodeGas,   bubbleRate: rate },
    cathode: { ...state.cathode, gasFormula: p.cathodeGas, bubbleRate: rate },
    steps:   state.steps.map((s) => s.id === "start-current" ? { ...s, completed: true } : s),
    observations: [mkObs("reaction-start", `Current flowing at ${current.toFixed(2)} A (${state.voltage.toFixed(1)} V) — monitor the electrodes!`, "success"), ...state.observations],
  };
}

export function stopElectrolysis(state: ElectrolysisState): ElectrolysisState {
  return {
    ...state,
    status: "paused",
    anode:   { ...state.anode,   bubbleRate: 0 },
    cathode: { ...state.cathode, bubbleRate: 0 },
    observations: [mkObs("reaction-start", "Current switched off — reaction paused.", "info"), ...state.observations],
  };
}

export function tickElectrolysis(state: ElectrolysisState, deltaSec: number): ElectrolysisState {
  if (state.status !== "running" || !state.electrolyte) return state;
  const p              = ELECTROLYTES[state.electrolyte];
  const newRunTime     = state.runTimeSeconds + deltaSec;
  const anodeMoles     = calcElectrolysisMoles(state.current, deltaSec, p.anodeElectrons);
  const cathodeMoles   = calcElectrolysisMoles(state.current, deltaSec, p.cathodeElectrons);
  const newAnodeGasMl  = state.anodeGasMl  + anodeMoles  * ML_PER_MOLE_GAS;
  const newCathodeGasMl= state.cathodeGasMl+ cathodeMoles * ML_PER_MOLE_GAS;

  const newObs: ObservationEvent[] = [];
  let objectives = state.objectives;

  // Gas visibility milestones
  if (state.cathodeGasMl < 0.5 && newCathodeGasMl >= 0.5) {
    newObs.push(mkObs("gas-evolution", `First bubbles of ${p.cathodeGas} visible at cathode (−). Reduction: ${p.cathodeReaction}`, "success"));
    objectives = objectives.map((o) => o.id === "observe-gas" ? { ...o, completed: true } : o);
  }
  if (state.anodeGasMl < 0.5 && newAnodeGasMl >= 0.5) {
    newObs.push(mkObs("gas-evolution", `First bubbles of ${p.anodeGas} visible at anode (+). Oxidation: ${p.anodeReaction}`, "success"));
  }
  if (state.cathodeGasMl < 2 && newCathodeGasMl >= 2) {
    newObs.push(mkObs("gas-evolution", `${p.cathodeGas} collecting at cathode — ${newCathodeGasMl.toFixed(1)} mL. Reduction: ${p.cathodeReaction}`, "success"));
  }
  if (state.anodeGasMl < 2 && newAnodeGasMl >= 2) {
    newObs.push(mkObs("gas-evolution", `${p.anodeGas} collecting at anode — ${newAnodeGasMl.toFixed(1)} mL. Oxidation: ${p.anodeReaction}`, "info"));
  }
  if (state.cathodeGasMl < 5 && newCathodeGasMl >= 5) {
    newObs.push(mkObs("gas-evolution", `${newCathodeGasMl.toFixed(1)} mL ${p.cathodeGas} at cathode — tube half full.`, "info"));
  }

  // Completion: gas collection limit OR max run-time safety cap
  let newStatus: import("./types").ExperimentStatus = state.status;
  let newResult  = state.result;
  const tubeIsFull = newCathodeGasMl >= GAS_TUBE_CAPACITY_ML;
  const timeCap    = newRunTime >= 120;

  if (!state.result && (tubeIsFull || timeCap)) {
    newStatus = "completed";
    const reason = tubeIsFull
      ? `Gas collection tube full (${GAS_TUBE_CAPACITY_ML} mL ${p.cathodeGas})`
      : `Experiment complete after ${newRunTime.toFixed(0)} s`;
    newObs.push(mkObs(
      "reaction-complete",
      `${reason} — cathode: ${newCathodeGasMl.toFixed(1)} mL ${p.cathodeGas}, anode: ${newAnodeGasMl.toFixed(1)} mL ${p.anodeGas}.`,
      "success",
    ));
    newResult = {
      completedAt: Date.now(), success: true, score: 100,
      summary: `Electrolysis of ${p.name} complete after ${newRunTime.toFixed(0)} s at ${state.voltage.toFixed(1)} V (${state.current.toFixed(2)} A). Cathode: ${p.cathodeGas} (${newCathodeGasMl.toFixed(1)} mL). Anode: ${p.anodeGas} (${newAnodeGasMl.toFixed(1)} mL).`,
      explanation:
        `Cathode (reduction): ${p.cathodeReaction}\n` +
        `Anode (oxidation): ${p.anodeReaction}\n\n` +
        p.education + "\n\n" +
        "Electrolysis uses electrical energy to drive non-spontaneous chemical reactions. " +
        "Reduction (gain of e⁻) occurs at the cathode; oxidation (loss of e⁻) at the anode.\n" +
        `Faraday's law: n = It/(nF), where I = ${state.current.toFixed(2)} A, t = ${newRunTime.toFixed(0)} s, F = 96 485 C/mol.`,
    };
  }

  return {
    ...state,
    runTimeSeconds: newRunTime,
    anodeGasMl:  Math.min(newAnodeGasMl,  GAS_TUBE_CAPACITY_ML * 0.6), // anode tube is smaller
    cathodeGasMl: Math.min(newCathodeGasMl, GAS_TUBE_CAPACITY_ML),
    anode:   { ...state.anode,   gasMoles: state.anode.gasMoles   + anodeMoles },
    cathode: { ...state.cathode, gasMoles: state.cathode.gasMoles + cathodeMoles },
    status: newStatus, result: newResult, objectives,
    observations: newObs.length ? [...newObs, ...state.observations] : state.observations,
  };
}

/** Set voltage as the primary control; current is derived from voltage + electrolyte conductivity. */
export function setVoltage(state: ElectrolysisState, v: number): ElectrolysisState {
  if (state.status === "completed" || state.status === "failed") return state;
  const voltage = Math.max(0, Math.min(MAX_VOLTAGE, v));
  const profile = state.electrolyte ? ELECTROLYTES[state.electrolyte] : null;
  const current = profile?.isConductive ? deriveCurrent(voltage, profile.conductivity) : 0;
  const rate = state.status === "running" ? Math.min(1, current / 2) : 0;
  return {
    ...state,
    voltage,
    current,
    anode:   { ...state.anode,   bubbleRate: rate },
    cathode: { ...state.cathode, bubbleRate: rate },
  };
}

/** Keep setCurrent for backward compatibility with existing tests. */
export function setCurrent(state: ElectrolysisState, current: number): ElectrolysisState {
  const c    = Math.max(0.1, Math.min(5, current));
  const rate = state.status === "running" ? Math.min(1, c / 2) : 0;
  return {
    ...state,
    current: c,
    anode:   { ...state.anode,   bubbleRate: rate },
    cathode: { ...state.cathode, bubbleRate: rate },
  };
}

export function resetElectrolysis(mode: ElectrolysisState["mode"]): ElectrolysisState {
  return initialElectrolysisState(mode);
}
