import { calcElectrolysisMoles, ML_PER_MOLE_GAS } from "./chemistry";
import type {
  ElectrolysisState, ElectrolyteId,
  ObservationEvent, StepDef, ExperimentObjective, ElectrodeMaterial,
} from "./types";
import type { ElectrolysisSimParams } from "./sim-bridge";

function uid(): string { return Math.random().toString(36).slice(2, 10); }

function mkObs(
  type: ObservationEvent["type"],
  message: string,
  severity: ObservationEvent["severity"],
): ObservationEvent {
  return { id: uid(), timestamp: Date.now(), type, message, severity };
}

export const GAS_TUBE_CAPACITY_ML = 10;
const MAX_VOLTAGE = 12;
const MAX_CURRENT = 3.0; // A at 12 V, conductivity = 1.0
const M_CU = 63.55; // g/mol

/** Derive current (A) based on voltage, electrolyte conductivity, and temperature. */
function deriveCurrent(voltage: number, conductivity: number, tempC: number): number {
  // Temperature coefficient: 2% conductivity increase per °C above 25 °C
  const tempFactor = 1 + 0.02 * (tempC - 25);
  return (voltage / MAX_VOLTAGE) * MAX_CURRENT * conductivity * Math.max(0.2, tempFactor);
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
  minVoltage:       number;
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
    minVoltage: 2.2,
    education: "NaCl dissociates into Na⁺ and Cl⁻. Cl⁻ is oxidised at the anode. Water is reduced at the cathode, releasing H₂. Min decomposition voltage ≈ 2.2 V.",
  },
  "sulfuric-acid": {
    id: "sulfuric-acid", name: "Sulfuric Acid", formula: "H₂SO₄ (aq)",
    conductivity: 0.92, isConductive: true,
    anodeGas: "O₂", cathodeGas: "H₂",
    anodeReaction:   "2H₂O → O₂ + 4H⁺ + 4e⁻",
    cathodeReaction: "2H⁺ + 2e⁻ → H₂",
    anodeElectrons: 4, cathodeElectrons: 2,
    liquidColor: "#fef9c3",
    minVoltage: 1.7,
    education: "H₂SO₄ ionises to H⁺. H⁺ is reduced at cathode (H₂). Water is oxidised at anode (O₂). Theoretical minimum = 1.23 V; overpotential raises practical minimum to ~1.7 V. 2:1 volume ratio H₂:O₂.",
  },
  "copper-sulfate": {
    id: "copper-sulfate", name: "Copper Sulfate", formula: "CuSO₄ (aq)",
    conductivity: 0.70, isConductive: true,
    anodeGas: "O₂", cathodeGas: "Cu (deposited)",
    anodeReaction:   "2H₂O → O₂ + 4H⁺ + 4e⁻",
    cathodeReaction: "Cu²⁺ + 2e⁻ → Cu",
    anodeElectrons: 4, cathodeElectrons: 2,
    liquidColor: "#bfdbfe",
    minVoltage: 0.9,
    education: "Cu²⁺ is reduced at the cathode, depositing copper. Water is oxidised at anode, releasing O₂. Min voltage ≈ 0.9 V.",
  },
  "sodium-hydroxide": {
    id: "sodium-hydroxide", name: "Sodium Hydroxide", formula: "NaOH (aq)",
    conductivity: 0.88, isConductive: true,
    anodeGas: "O₂", cathodeGas: "H₂",
    anodeReaction:   "4OH⁻ → O₂ + 2H₂O + 4e⁻",
    cathodeReaction: "2H₂O + 2e⁻ → H₂ + 2OH⁻",
    anodeElectrons: 4, cathodeElectrons: 2,
    liquidColor: "#d1fae5",
    minVoltage: 1.5,
    education: "OH⁻ is oxidised to O₂ at the anode. Water is reduced to H₂ at the cathode. Min voltage ~1.5 V.",
  },
  "distilled-water": {
    id: "distilled-water", name: "Distilled Water", formula: "H₂O",
    conductivity: 0.0, isConductive: false,
    anodeGas: "—", cathodeGas: "—",
    anodeReaction: "—", cathodeReaction: "—",
    anodeElectrons: 2, cathodeElectrons: 2,
    liquidColor: "#f0f9ff",
    minVoltage: 99,
    education: "Pure water lacks free ions to conduct charge. Electrolysis will not occur.",
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

export function initialElectrolysisState(
  mode: ElectrolysisState["mode"],
  simParams?: ElectrolysisSimParams,
): ElectrolysisState {
  const conductivityScale   = simParams?.conductivityScale   ?? 1.0;
  const overpotentialOffset = simParams?.overpotentialOffset ?? 0.0;
  return {
    mode, status: "idle",
    electrolyte: null, electrolyteConc: 1.0,
    anode:   { material: "carbon", polarity: "anode",   connected: false, gasFormula: null, gasMoles: 0, bubbleRate: 0 },
    cathode: { material: "carbon", polarity: "cathode", connected: false, gasFormula: null, gasMoles: 0, bubbleRate: 0 },
    circuitComplete: false,
    voltage: 6.0,
    current: 0,
    runTimeSeconds: 0, anodeGasMl: 0, cathodeGasMl: 0,
    steps:      INITIAL_STEPS.map((s) => ({ ...s })),
    objectives: INITIAL_OBJECTIVES.map((o) => ({ ...o })),
    observations: [], result: null, startedAt: null,
    temperatureC: 25,
    _conductivityScale:   conductivityScale,
    _overpotentialOffset: overpotentialOffset,
    minVoltage: 0,
    overpotentialActive: false,
    cathodeMassGainG: 0,
    anodeMassLossG: 0,
  };
}

export function setElectrolyte(state: ElectrolysisState, id: ElectrolyteId): ElectrolysisState {
  if (state.status === "running" || state.status === "completed" || state.status === "failed") return state;
  const p = ELECTROLYTES[id];
  const condScale = state._conductivityScale ?? 1.0;
  const effectiveMinV = p.minVoltage + (state._overpotentialOffset ?? 0);
  const current = p.isConductive ? deriveCurrent(state.voltage, p.conductivity * condScale, state.temperatureC) : 0;
  const belowMinV = p.isConductive && state.voltage < effectiveMinV;

  const obs = mkObs(
    "conductivity-change",
    !p.isConductive
      ? `${p.name} has near-zero conductivity — electrolysis will not occur.`
      : belowMinV
        ? `${p.name} selected — but applied voltage (${state.voltage.toFixed(1)} V) is below minimum decomposition voltage (${effectiveMinV.toFixed(1)} V).`
        : `${p.name} selected — current at ${state.voltage.toFixed(1)} V: ${current.toFixed(2)} A. Decomposition voltage: ${effectiveMinV.toFixed(1)} V.`,
    !p.isConductive ? "warning" : belowMinV ? "warning" : "info",
  );
  return {
    ...state, electrolyte: id, status: "setup",
    current,
    minVoltage: effectiveMinV,
    overpotentialActive: belowMinV,
    steps:      state.steps.map((s) => s.id === "choose-electrolyte" ? { ...s, completed: true } : s),
    objectives: state.objectives.map((o) => o.id === "select-electrolyte" && p.isConductive && !belowMinV ? { ...o, completed: true } : o),
    observations: [obs, ...state.observations],
  };
}

export function insertElectrodes(state: ElectrolysisState, material: ElectrodeMaterial = "carbon"): ElectrolysisState {
  if (!state.electrolyte) return state;
  if (state.anode.connected && state.cathode.connected) return state;
  
  return {
    ...state,
    anode:   { ...state.anode,   connected: true, material },
    cathode: { ...state.cathode, connected: true, material },
    steps:   state.steps.map((s) => s.id === "insert-electrodes" ? { ...s, completed: true } : s),
    observations: [mkObs("reaction-start", `${material.toUpperCase()} electrodes inserted.`, "info"), ...state.observations],
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
  if (state.voltage < p.minVoltage) {
    return {
      ...state,
      overpotentialActive: true,
      observations: [
        mkObs("conductivity-change", `Applied voltage is below the minimum decomposition voltage of ${p.minVoltage.toFixed(1)} V.`, "error"),
        ...state.observations,
      ],
    };
  }
  const condScale = state._conductivityScale ?? 1.0;
  const current = deriveCurrent(state.voltage, p.conductivity * condScale, state.temperatureC);
  const rate = Math.min(1, current / 2);
  return {
    ...state,
    status: "running",
    current,
    overpotentialActive: false,
    startedAt: state.startedAt ?? Date.now(),
    anode:   { ...state.anode,   gasFormula: state.anode.material === "copper" && state.electrolyte === "copper-sulfate" ? null : p.anodeGas,   bubbleRate: state.anode.material === "copper" && state.electrolyte === "copper-sulfate" ? 0 : rate },
    cathode: { ...state.cathode, gasFormula: p.cathodeGas, bubbleRate: rate },
    steps:   state.steps.map((s) => s.id === "start-current" ? { ...s, completed: true } : s),
    observations: [
      mkObs("reaction-start", `Current flowing at ${current.toFixed(2)} A (${state.voltage.toFixed(1)} V) — electrolysis active.`, "success"),
      ...state.observations,
    ],
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

  // Faraday's Law: moles = (I * t) / (z * F) * currentEfficiency
  // Assume a current efficiency of 92%
  const currentEfficiency = 0.92;
  const rawAnodeMoles     = calcElectrolysisMoles(state.current, deltaSec, p.anodeElectrons) * currentEfficiency;
  const rawCathodeMoles   = calcElectrolysisMoles(state.current, deltaSec, p.cathodeElectrons) * currentEfficiency;

  let newAnodeGasMl  = state.anodeGasMl;
  let newCathodeGasMl = state.cathodeGasMl;
  let newCathodeMassGain = state.cathodeMassGainG ?? 0;
  let newAnodeMassLoss = state.anodeMassLossG ?? 0;

  const isCuSO4 = state.electrolyte === "copper-sulfate";
  const anodeIsCopper = state.anode.material === "copper";
  const cathodeIsCopper = state.cathode.material === "copper" || state.cathode.material === "carbon";

  // Cathode Reaction:
  if (isCuSO4) {
    // CuSO4 cathode plates Copper: Cu2+ + 2e- -> Cu
    // Moles Cu plated = current * t / (2 * F) * currentEfficiency
    const molesCu = calcElectrolysisMoles(state.current, deltaSec, 2) * currentEfficiency;
    newCathodeMassGain += molesCu * M_CU;
  } else {
    // standard gas evolution
    newCathodeGasMl += rawCathodeMoles * ML_PER_MOLE_GAS;
  }

  // Anode Reaction:
  if (isCuSO4 && anodeIsCopper) {
    // Copper Anode dissolves: Cu(s) -> Cu2+ + 2e-
    // Anode loses mass, NO gas is evolved
    const molesCuLost = calcElectrolysisMoles(state.current, deltaSec, 2) * currentEfficiency;
    newAnodeMassLoss += molesCuLost * M_CU;
  } else {
    // standard gas evolution
    newAnodeGasMl += rawAnodeMoles * ML_PER_MOLE_GAS;
  }

  const newObs: ObservationEvent[] = [];
  let objectives = state.objectives;

  if (state.cathodeGasMl < 0.5 && newCathodeGasMl >= 0.5) {
    newObs.push(mkObs("gas-evolution", `First bubbles of ${p.cathodeGas} visible at cathode (−).`, "success"));
    objectives = objectives.map((o) => o.id === "observe-gas" ? { ...o, completed: true } : o);
  }
  if (!anodeIsCopper && state.anodeGasMl < 0.5 && newAnodeGasMl >= 0.5) {
    newObs.push(mkObs("gas-evolution", `First bubbles of ${p.anodeGas} visible at anode (+).`, "success"));
  }

  if (isCuSO4 && state.cathodeMassGainG === 0 && newCathodeMassGain > 0.01) {
    newObs.push(mkObs("gas-evolution", `Reddish-orange metallic copper layer deposits on cathode (−).`, "success"));
    objectives = objectives.map((o) => o.id === "observe-gas" ? { ...o, completed: true } : o);
  }

  if (anodeIsCopper && isCuSO4 && state.anodeMassLossG === 0 && newAnodeMassLoss > 0.01) {
    newObs.push(mkObs("gas-evolution", `Active copper anode (+) begins to dissolve, entering solution as Cu²⁺.`, "info"));
  }

  let newStatus: import("./types").ExperimentStatus = state.status;
  let newResult  = state.result;
  const tubeIsFull = newCathodeGasMl >= GAS_TUBE_CAPACITY_ML || newAnodeGasMl >= GAS_TUBE_CAPACITY_ML * 0.6 || newCathodeMassGain >= 1.0;
  const timeCap    = newRunTime >= 120;

  if (!state.result && (tubeIsFull || timeCap)) {
    newStatus = "completed";
    let summary = `Electrolysis of ${p.name} completed successfully. `;
    if (isCuSO4) {
      summary += `Cathode copper deposited: ${newCathodeMassGain.toFixed(4)} g. `;
      if (anodeIsCopper) {
        summary += `Anode copper lost: ${newAnodeMassLoss.toFixed(4)} g.`;
      } else {
        summary += `Anode O₂ evolved: ${newAnodeGasMl.toFixed(1)} mL.`;
      }
    } else {
      summary += `Cathode ${p.cathodeGas} evolved: ${newCathodeGasMl.toFixed(1)} mL. Anode ${p.anodeGas} evolved: ${newAnodeGasMl.toFixed(1)} mL.`;
    }

    newResult = {
      completedAt: Date.now(), success: true, score: 100,
      summary,
      explanation:
        `Cathode half-reaction: ${p.cathodeReaction}\n` +
        `Anode half-reaction: ${anodeIsCopper && isCuSO4 ? "Cu(s) -> Cu²⁺ + 2e⁻" : p.anodeReaction}\n\n` +
        `Faraday's Law confirmed: calculated yields match current (${state.current.toFixed(2)} A) and time (${newRunTime.toFixed(0)} s).`,
    };
  }

  return {
    ...state,
    runTimeSeconds: newRunTime,
    anodeGasMl:  anodeIsCopper && isCuSO4 ? 0 : Math.min(newAnodeGasMl,  GAS_TUBE_CAPACITY_ML * 0.6),
    cathodeGasMl: isCuSO4 ? 0 : Math.min(newCathodeGasMl, GAS_TUBE_CAPACITY_ML),
    cathodeMassGainG: newCathodeMassGain,
    anodeMassLossG: newAnodeMassLoss,
    anode:   { ...state.anode,   gasMoles: state.anode.gasMoles   + rawAnodeMoles },
    cathode: { ...state.cathode, gasMoles: state.cathode.gasMoles + rawCathodeMoles },
    status: newStatus, result: newResult, objectives,
    observations: newObs.length ? [...newObs, ...state.observations] : state.observations,
  };
}

export function setVoltage(state: ElectrolysisState, v: number): ElectrolysisState {
  if (state.status === "completed" || state.status === "failed") return state;
  const voltage = Math.max(0, Math.min(MAX_VOLTAGE, v));
  const profile = state.electrolyte ? ELECTROLYTES[state.electrolyte] : null;
  const condScale = state._conductivityScale ?? 1.0;
  const current = profile?.isConductive ? deriveCurrent(voltage, profile.conductivity * condScale, state.temperatureC) : 0;
  const belowMinV = profile ? voltage < profile.minVoltage : false;
  const rate = state.status === "running" && !belowMinV ? Math.min(1, current / 2) : 0;

  const voltageObs: ObservationEvent[] = [];
  if (profile && belowMinV && state.voltage >= profile.minVoltage) {
    voltageObs.push(mkObs(
      "conductivity-change",
      `Voltage dropped below minimum decomposition voltage (${profile.minVoltage.toFixed(1)} V) — electrolysis stopped.`,
      "warning",
    ));
  }

  return {
    ...state,
    voltage,
    current,
    overpotentialActive: belowMinV,
    anode:   { ...state.anode,   bubbleRate: state.anode.material === "copper" && state.electrolyte === "copper-sulfate" ? 0 : rate },
    cathode: { ...state.cathode, bubbleRate: rate },
    observations: voltageObs.length ? [...voltageObs, ...state.observations] : state.observations,
  };
}

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

export function resetElectrolysis(
  mode: ElectrolysisState["mode"],
  simParams?: ElectrolysisSimParams,
): ElectrolysisState {
  return initialElectrolysisState(mode, simParams);
}
