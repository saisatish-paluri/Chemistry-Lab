import type {
  GasLawsState, GasLaw, GasDataPoint,
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

// ─── Constants ────────────────────────────────────────────────────────────────

export const GAS_R        = 0.08206;   // L·atm / (mol·K)
export const GAS_N_MOLES  = 0.2;       // fixed amount of gas
export const GAS_REF_TEMP = 300;       // K — fixed for Boyle's
export const GAS_REF_PRES = 1.0;       // atm — fixed for Charles's

// Boyle's Law ranges (T = 300 K fixed)
export const BOYLE_V_MIN  = 0.5;       // L
export const BOYLE_V_MAX  = 12.0;      // L
export const BOYLE_V_INIT = 5.0;       // L → P ≈ 0.985 atm

// Charles's Law ranges (P = 1.0 atm fixed)
export const CHARLES_T_MIN  = 200;     // K
export const CHARLES_T_MAX  = 600;     // K
export const CHARLES_T_INIT = 300;     // K → V ≈ 4.92 L

// ─── Computations ─────────────────────────────────────────────────────────────

/** Boyle's Law: P = nRT / V  (T fixed) */
export function boylePressure(volumeL: number): number {
  return (GAS_N_MOLES * GAS_R * GAS_REF_TEMP) / volumeL;
}

/** Charles's Law: V = nRT / P  (P fixed) */
export function charlesVolume(tempK: number): number {
  return (GAS_N_MOLES * GAS_R * tempK) / GAS_REF_PRES;
}

// ─── Steps & Objectives ───────────────────────────────────────────────────────

const BOYLE_STEPS: StepDef[] = [
  { id: "select-law",   instruction: "Select Boyle's Law (constant temperature).",             completed: true  },
  { id: "start-exp",    instruction: "Begin exploration — adjust the volume slider.",           completed: false },
  { id: "record-3",     instruction: "Record at least 3 data points at different volumes.",    completed: false },
  { id: "describe",     instruction: "Describe the pressure–volume relationship observed.",    completed: false },
];

const CHARLES_STEPS: StepDef[] = [
  { id: "select-law",   instruction: "Select Charles's Law (constant pressure).",              completed: true  },
  { id: "start-exp",    instruction: "Begin exploration — adjust the temperature slider.",     completed: false },
  { id: "record-3",     instruction: "Record at least 3 data points at different temperatures.", completed: false },
  { id: "describe",     instruction: "Describe the temperature–volume relationship observed.", completed: false },
];

const BOYLE_OBJECTIVES: ExperimentObjective[] = [
  { id: "start",        description: "Start the gas law exploration",                          completed: false },
  { id: "record-data",  description: "Record at least 3 (P, V) data points",                  completed: false },
  { id: "observe-inv",  description: "Observe the inverse P–V relationship",                  completed: false },
];

const CHARLES_OBJECTIVES: ExperimentObjective[] = [
  { id: "start",        description: "Start the gas law exploration",                          completed: false },
  { id: "record-data",  description: "Record at least 3 (T, V) data points",                  completed: false },
  { id: "observe-dir",  description: "Observe the direct T–V relationship",                   completed: false },
];

function stepsForLaw(law: GasLaw): StepDef[] {
  return (law === "boyle" ? BOYLE_STEPS : CHARLES_STEPS).map((s) => ({ ...s }));
}

function objectivesForLaw(law: GasLaw): ExperimentObjective[] {
  return (law === "boyle" ? BOYLE_OBJECTIVES : CHARLES_OBJECTIVES).map((o) => ({ ...o }));
}

// ─── State Machine ────────────────────────────────────────────────────────────

export function initialGasLawsState(mode: GasLawsState["mode"]): GasLawsState {
  return {
    mode, status: "idle",
    law: null,
    nMoles: GAS_N_MOLES,
    temperature: GAS_REF_TEMP,
    volume: BOYLE_V_INIT,
    pressure: boylePressure(BOYLE_V_INIT),
    referenceTemp: GAS_REF_TEMP,
    referencePressure: GAS_REF_PRES,
    dataPoints: [],
    steps:      [],
    objectives: [],
    observations: [], result: null, startedAt: null,
  };
}

export function selectLaw(state: GasLawsState, law: GasLaw): GasLawsState {
  if (state.status === "completed" || state.status === "failed") return state;

  const initTemp = law === "boyle" ? GAS_REF_TEMP : CHARLES_T_INIT;
  const initVol  = law === "boyle" ? BOYLE_V_INIT : charlesVolume(CHARLES_T_INIT);
  const initPres = law === "boyle" ? boylePressure(BOYLE_V_INIT) : GAS_REF_PRES;

  const lawLabel = law === "boyle"
    ? "Boyle's Law (P₁V₁ = P₂V₂, T constant)"
    : "Charles's Law (V₁/T₁ = V₂/T₂, P constant)";

  return {
    ...state,
    law,
    status: "setup",
    temperature: initTemp,
    volume: initVol,
    pressure: initPres,
    dataPoints: [],
    steps:      stepsForLaw(law),
    objectives: objectivesForLaw(law),
    startedAt: state.startedAt ?? Date.now(),
    observations: [
      mkObs(
        "pressure-change",
        `${lawLabel} selected. n = ${GAS_N_MOLES} mol, R = ${GAS_R} L·atm/mol·K.`,
        "info",
      ),
      ...state.observations,
    ],
  };
}

export function startExploration(state: GasLawsState): GasLawsState {
  if (state.status === "running" || state.status === "completed" || !state.law) return state;

  return {
    ...state,
    status: "running",
    steps:      state.steps.map((s) => s.id === "start-exp" ? { ...s, completed: true } : s),
    objectives: state.objectives.map((o) => o.id === "start" ? { ...o, completed: true } : o),
    observations: [
      mkObs(
        "pressure-change",
        state.law === "boyle"
          ? `Exploration started — adjust volume (${BOYLE_V_MIN}–${BOYLE_V_MAX} L). Temperature locked at ${GAS_REF_TEMP} K.`
          : `Exploration started — adjust temperature (${CHARLES_T_MIN}–${CHARLES_T_MAX} K). Pressure locked at ${GAS_REF_PRES} atm.`,
        "success",
      ),
      ...state.observations,
    ],
  };
}

export function setVolume(state: GasLawsState, volumeL: number): GasLawsState {
  if (state.law !== "boyle") return state;
  if (state.status === "completed" || state.status === "failed") return state;
  const v = Math.max(BOYLE_V_MIN, Math.min(BOYLE_V_MAX, volumeL));
  const p = boylePressure(v);

  const newObs: ObservationEvent[] = [];
  const prevP = state.pressure;
  if (Math.abs(p - prevP) > 0.05) {
    const direction = v < state.volume ? "compressed" : "expanded";
    newObs.push(mkObs(
      "pressure-change",
      `Container ${direction}: V = ${v.toFixed(2)} L → P = ${p.toFixed(3)} atm. ` +
      `(PV = ${(p * v).toFixed(3)} L·atm — constant)`,
      "info",
    ));
  }

  return {
    ...state,
    volume: v,
    pressure: p,
    observations: newObs.length ? [...newObs, ...state.observations] : state.observations,
  };
}

export function setTemperature(state: GasLawsState, tempK: number): GasLawsState {
  if (state.law !== "charles") return state;
  if (state.status === "completed" || state.status === "failed") return state;
  const t = Math.max(CHARLES_T_MIN, Math.min(CHARLES_T_MAX, tempK));
  const v = charlesVolume(t);

  const newObs: ObservationEvent[] = [];
  const prevV = state.volume;
  if (Math.abs(v - prevV) > 0.05) {
    const direction = t > state.temperature ? "heated" : "cooled";
    newObs.push(mkObs(
      "pressure-change",
      `Gas ${direction}: T = ${t} K → V = ${v.toFixed(3)} L. ` +
      `(V/T = ${(v / t).toFixed(5)} L/K — constant)`,
      "info",
    ));
  }

  return {
    ...state,
    temperature: t,
    volume: v,
    observations: newObs.length ? [...newObs, ...state.observations] : state.observations,
  };
}

export function recordDataPoint(state: GasLawsState): GasLawsState {
  if (!state.law) return state;
  if (state.status !== "running") return state;

  const point: GasDataPoint = state.law === "boyle"
    ? { x: state.volume, y: state.pressure }
    : { x: state.temperature, y: state.volume };

  // Deduplicate nearby points (within 2% of existing)
  const isDup = state.dataPoints.some((dp) => Math.abs(dp.x - point.x) / point.x < 0.02);
  if (isDup) return state;

  const newPoints = [...state.dataPoints, point].sort((a, b) => a.x - b.x);
  const count = newPoints.length;

  let steps = state.steps;
  let objectives = state.objectives;

  if (count >= 3) {
    steps = steps.map((s) => s.id === "record-3" || s.id === "describe" ? { ...s, completed: true } : s);
    objectives = objectives.map((o) =>
      o.id === "record-data" || o.id === "observe-inv" || o.id === "observe-dir"
        ? { ...o, completed: true }
        : o,
    );
  }

  const label = state.law === "boyle"
    ? `Data point recorded: V=${state.volume.toFixed(2)} L, P=${state.pressure.toFixed(3)} atm (${count} total)`
    : `Data point recorded: T=${state.temperature} K, V=${state.volume.toFixed(3)} L (${count} total)`;

  return {
    ...state,
    dataPoints: newPoints,
    steps,
    objectives,
    observations: [
      mkObs("pressure-change", label, "success"),
      ...state.observations,
    ],
  };
}

export function completeGasLaws(state: GasLawsState): GasLawsState {
  if (state.status === "completed" || !state.law) return state;
  if (state.dataPoints.length < 1) return state;

  const count = state.dataPoints.length;
  const score = count >= 5 ? 100 : count >= 3 ? 88 : count === 2 ? 72 : 55;

  const lawExplanation = state.law === "boyle"
    ? "Boyle's Law (1662): At constant temperature, gas pressure is inversely proportional to volume.\n" +
      "P₁V₁ = P₂V₂ = nRT (constant)\n" +
      "Doubling the volume halves the pressure. This occurs because gas molecules hit the container walls " +
      "less frequently when the volume increases. Applications: syringes, bicycle pumps, breathing mechanics."
    : "Charles's Law (1787): At constant pressure, gas volume is directly proportional to absolute temperature.\n" +
      "V₁/T₁ = V₂/T₂ = nR/P (constant)\n" +
      "Doubling the temperature (in Kelvin) doubles the volume. Higher T → more kinetic energy → " +
      "molecules push walls harder → volume expands to restore pressure. Applications: hot-air balloons, " +
      "gas thermometers.";

  const result = {
    completedAt: Date.now(),
    success: true,
    score,
    summary:
      `${state.law === "boyle" ? "Boyle's" : "Charles's"} Law explored with ${count} data point(s). ` +
      `${state.law === "boyle" ? `PV = ${(state.pressure * state.volume).toFixed(3)} L·atm (constant).` : `V/T = ${(state.volume / state.temperature).toFixed(5)} L/K (constant).`}`,
    explanation: lawExplanation,
  };

  return {
    ...state,
    status: "completed",
    result,
    objectives: state.objectives.map((o) => ({ ...o, completed: true })),
    observations: [
      mkObs("reaction-complete", `Gas law exploration complete — ${count} data points recorded.`, "success"),
      ...state.observations,
    ],
  };
}

export function resetGasLaws(mode: GasLawsState["mode"]): GasLawsState {
  return initialGasLawsState(mode);
}
