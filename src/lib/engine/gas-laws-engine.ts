import type {
  GasLawsState, GasLaw, GasDataPoint,
  ObservationEvent, StepDef, ExperimentObjective,
  ExperimentalError, GasLawsMeasurements,
} from "./types";
import type { GasLawsSimParams } from "./sim-bridge";
import { readThermometer, readGasSyringe, readManometer } from "@/lib/instruments/instruments";

function uid(): string { return Math.random().toString(36).slice(2, 10); }

function mkObs(
  type: ObservationEvent["type"],
  message: string,
  severity: ObservationEvent["severity"],
): ObservationEvent {
  return { id: uid(), timestamp: Date.now(), type, message, severity };
}

// ─── Constants & van der Waals coefficients ───────────────────────────────────

export const GAS_R        = 0.08206;   // L·atm / (mol·K)
export const GAS_N_MOLES  = 0.2;       // fixed amount of gas
export const GAS_REF_TEMP = 300;       // K — fixed for Boyle's
export const GAS_REF_PRES = 1.0;       // atm — fixed for Charles's

export const VDW_COEFFS = {
  he:  { a: 0.034, b: 0.0237 },
  n2:  { a: 1.39,  b: 0.0391 },
  co2: { a: 3.59,  b: 0.0427 },
};

export function solveVanDerWaalsVolume(p: number, t: number, n: number, a: number, b: number): number {
  let v = (n * GAS_R * t) / p; // ideal gas guess
  for (let i = 0; i < 15; i++) {
    const v2 = v * v;
    const v3 = v2 * v;
    const f = p * v - p * n * b + (a * n * n) / v - (a * b * n * n * n) / v2 - n * GAS_R * t;
    const df = p - (a * n * n) / v2 + (2 * a * b * n * n * n) / v3;
    if (Math.abs(df) < 1e-7) break;
    const nextV = v - f / df;
    if (nextV <= n * b) {
      v = n * b + 0.01;
    } else {
      v = nextV;
    }
  }
  return v;
}

export function boylePressure(volumeL: number, gasType: "he" | "n2" | "co2" = "co2", nMoles: number = GAS_N_MOLES, tempK: number = GAS_REF_TEMP): number {
  const { a, b } = VDW_COEFFS[gasType];
  const v = Math.max(volumeL, nMoles * b + 0.01);
  return (nMoles * GAS_R * tempK) / (v - nMoles * b) - (a * nMoles * nMoles) / (v * v);
}

export function charlesVolume(tempK: number, gasType: "he" | "n2" | "co2" = "co2", nMoles: number = GAS_N_MOLES, pressureAtm: number = GAS_REF_PRES): number {
  const { a, b } = VDW_COEFFS[gasType];
  return solveVanDerWaalsVolume(pressureAtm, tempK, nMoles, a, b);
}

export function gayLussacPressure(tempK: number, volumeL: number, nMoles: number = GAS_N_MOLES, gasType: "he" | "n2" | "co2" = "co2"): number {
  const { a, b } = VDW_COEFFS[gasType];
  const v = Math.max(volumeL, nMoles * b + 0.01);
  return (nMoles * GAS_R * tempK) / (v - nMoles * b) - (a * nMoles * nMoles) / (v * v);
}

// Boyle's Law ranges (T = 300 K fixed)
export const BOYLE_V_MIN  = 0.5;       // L
export const BOYLE_V_MAX  = 12.0;      // L
export const BOYLE_V_INIT = 5.0;       // L

// Charles's Law ranges (P = 1.0 atm fixed)
export const CHARLES_T_MIN  = 200;     // K
export const CHARLES_T_MAX  = 600;     // K
export const CHARLES_T_INIT = 300;     // K

// Gay-Lussac's Law ranges (V fixed, P vs T at constant volume)
export const GAYL_T_MIN  = 200;       // K
export const GAYL_T_MAX  = 600;       // K
export const GAYL_T_INIT = 300;       // K
export const GAYL_V_REF  = 5.0;       // L

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

const GAYL_STEPS: StepDef[] = [
  { id: "select-law",   instruction: "Select Gay-Lussac's Law (constant volume).",             completed: true  },
  { id: "start-exp",    instruction: "Begin exploration — adjust the temperature slider.",     completed: false },
  { id: "record-3",     instruction: "Record at least 3 data points at different temperatures.", completed: false },
  { id: "describe",     instruction: "Describe the pressure–temperature relationship observed.", completed: false },
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

const GAYL_OBJECTIVES: ExperimentObjective[] = [
  { id: "start",        description: "Start the gas law exploration",                          completed: false },
  { id: "record-data",  description: "Record at least 3 (T, P) data points",                  completed: false },
  { id: "observe-dir",  description: "Observe the direct P–T relationship at constant V",     completed: false },
];

function stepsForLaw(law: GasLaw): StepDef[] {
  const arr = law === "boyle" ? BOYLE_STEPS : law === "charles" ? CHARLES_STEPS : GAYL_STEPS;
  return arr.map((s) => ({ ...s }));
}

function objectivesForLaw(law: GasLaw): ExperimentObjective[] {
  const arr = law === "boyle" ? BOYLE_OBJECTIVES : law === "charles" ? CHARLES_OBJECTIVES : GAYL_OBJECTIVES;
  return arr.map((o) => ({ ...o }));
}

function buildGasLawsMeasurements(
  tempK:    number,
  volumeL:  number,
  pressureAtm: number,
  errors:   ExperimentalError[],
  calibrationBias = 1.0,
  frictionOffset = 0,
): GasLawsMeasurements {
  const tempNoise = (Math.random() - 0.5) * 0.2; // ±0.1 K
  const presNoise = (Math.random() - 0.5) * 0.008; // ±0.004 atm
  const volNoise = (Math.random() - 0.5) * 0.04; // ±0.02 L

  const pGasWithFriction = Math.max(0.01, pressureAtm * calibrationBias + frictionOffset + presNoise);
  const tGas = Math.max(1, tempK + tempNoise);
  const vGas = Math.max(0.1, volumeL + volNoise);

  return {
    thermometer: readThermometer(tGas - 273.15, { activeErrors: errors }),
    gasSyringe:  readGasSyringe(vGas,         { activeErrors: errors }),
    manometer:   readManometer(pGasWithFriction,       { activeErrors: errors }),
  };
}

// ─── State Machine ────────────────────────────────────────────────────────────

export function initialGasLawsState(
  mode:         GasLawsState["mode"],
  activeErrors: ExperimentalError[] = [],
  simParams?:   GasLawsSimParams,
): GasLawsState {
  const refTempK      = simParams?.refTempK      ?? GAS_REF_TEMP;
  const refPressAtm   = simParams?.refPressureAtm ?? GAS_REF_PRES;
  const nMoles        = simParams?.nMoles         ?? GAS_N_MOLES;

  const calibrationBias = 1.0 + (Math.random() - 0.5) * 0.03; // ±1.5%
  const initVol  = charlesVolume(refTempK, "co2", nMoles, refPressAtm);
  const initPres = boylePressure(initVol, "co2", nMoles, refTempK);

  return {
    mode, status: "idle",
    law: null,
    nMoles,
    temperature:       refTempK,
    volume:            initVol,
    pressure:          initPres,
    referenceTemp:     refTempK,
    referencePressure: refPressAtm,
    referenceVolume:   GAYL_V_REF,
    dataPoints: [],
    steps:      [],
    objectives: [],
    observations: [], result: null, startedAt: null,
    gasType:            "co2",
    sealQuality:        1.0,
    pistonFriction:     0.15,
    calibrationBias,
    leakRate:           0.0,
    lastVolumeChangeDirection: "none",
    measurements: buildGasLawsMeasurements(refTempK, initVol, initPres, activeErrors, calibrationBias),
    activeErrors,
  };
}

export function selectLaw(state: GasLawsState, law: GasLaw): GasLawsState {
  if (state.status === "completed" || state.status === "failed") return state;

  const n = state.nMoles;

  let initTemp: number, initVol: number, initPres: number, lawLabel: string;

  if (law === "boyle") {
    initTemp = state.referenceTemp;
    initVol  = charlesVolume(state.referenceTemp, state.gasType, n, state.referencePressure);
    initPres = boylePressure(initVol, state.gasType, n, state.referenceTemp);
    lawLabel = `Boyle's Law (P vs V, T = ${state.referenceTemp} K constant)`;
  } else if (law === "charles") {
    initTemp = CHARLES_T_INIT;
    initVol  = charlesVolume(CHARLES_T_INIT, state.gasType, n, state.referencePressure);
    initPres = state.referencePressure;
    lawLabel = `Charles's Law (V vs T, P = ${state.referencePressure.toFixed(3)} atm constant)`;
  } else {
    initTemp = GAYL_T_INIT;
    initVol  = state.referenceVolume;
    initPres = gayLussacPressure(GAYL_T_INIT, state.referenceVolume, n, state.gasType);
    lawLabel = `Gay-Lussac's Law (P vs T, V = ${state.referenceVolume.toFixed(2)} L constant)`;
  }

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
    measurements: buildGasLawsMeasurements(initTemp, initVol, initPres, state.activeErrors, state.calibrationBias),
    observations: [
      mkObs(
        "pressure-change",
        `${lawLabel} selected. n = ${state.nMoles.toFixed(4)} mol, R = ${GAS_R} L·atm/mol·K.`,
        "info",
      ),
      ...state.observations,
    ],
  };
}

export function startExploration(state: GasLawsState): GasLawsState {
  if (state.status === "running" || state.status === "completed" || !state.law) return state;

  const startMsg =
    state.law === "boyle"
      ? `Exploration started — adjust volume (${BOYLE_V_MIN}–${BOYLE_V_MAX} L). Temperature locked at ${state.referenceTemp} K.`
    : state.law === "charles"
      ? `Exploration started — adjust temperature (${CHARLES_T_MIN}–${CHARLES_T_MAX} K). Pressure locked at ${state.referencePressure.toFixed(3)} atm.`
      : `Exploration started — adjust temperature (${GAYL_T_MIN}–${GAYL_T_MAX} K). Volume locked at ${state.referenceVolume.toFixed(2)} L.`;

  return {
    ...state,
    status: "running",
    steps:      state.steps.map((s) => s.id === "start-exp" ? { ...s, completed: true } : s),
    objectives: state.objectives.map((o) => o.id === "start" ? { ...o, completed: true } : o),
    observations: [
      mkObs("pressure-change", startMsg, "success"),
      ...state.observations,
    ],
  };
}

export function setVolume(state: GasLawsState, volumeL: number): GasLawsState {
  if (state.law !== "boyle") return state;
  if (state.status === "completed" || state.status === "failed") return state;
  const v = Math.max(BOYLE_V_MIN, Math.min(BOYLE_V_MAX, volumeL));
  const p = boylePressure(v, state.gasType, state.nMoles, state.referenceTemp);

  const changeDir = v > state.volume ? "up" : v < state.volume ? "down" : "none";
  const P_friction = state.pistonFriction * 0.02; // max friction offset in atm
  const fricOffset = changeDir === "up" ? -P_friction : changeDir === "down" ? P_friction : 0;

  const newObs: ObservationEvent[] = [];
  const prevP = state.pressure;
  if (Math.abs(p - prevP) > 0.05) {
    const direction = v < state.volume ? "compressed" : "expanded";
    newObs.push(mkObs(
      "pressure-change",
      `Syringe ${direction} (${state.gasType.toUpperCase()}): V = ${v.toFixed(2)} L → P = ${p.toFixed(3)} atm (real gas correction applied).`,
      "info",
    ));
  }

  return {
    ...state,
    volume:       v,
    pressure:     p,
    lastVolumeChangeDirection: changeDir,
    measurements: buildGasLawsMeasurements(state.temperature, v, p, state.activeErrors, state.calibrationBias, fricOffset),
    observations: newObs.length ? [...newObs, ...state.observations] : state.observations,
  };
}

export function setTemperature(state: GasLawsState, tempK: number): GasLawsState {
  if (state.law !== "charles" && state.law !== "gay-lussac") return state;
  if (state.status === "completed" || state.status === "failed") return state;

  const tMin = state.law === "charles" ? CHARLES_T_MIN : GAYL_T_MIN;
  const tMax = state.law === "charles" ? CHARLES_T_MAX : GAYL_T_MAX;
  const t = Math.max(tMin, Math.min(tMax, tempK));
  const direction = t > state.temperature ? "heated" : "cooled";

  const newObs: ObservationEvent[] = [];

  if (state.law === "charles") {
    const v = charlesVolume(t, state.gasType, state.nMoles, state.referencePressure);
    const changeDir = v > state.volume ? "up" : v < state.volume ? "down" : "none";
    const P_friction = state.pistonFriction * 0.02;
    const fricOffset = changeDir === "up" ? -P_friction : changeDir === "down" ? P_friction : 0;

    if (Math.abs(v - state.volume) > 0.05) {
      newObs.push(mkObs(
        "pressure-change",
        `Gas ${direction} (${state.gasType.toUpperCase()}): T = ${t} K → V = ${v.toFixed(3)} L. Piston moved to maintain ${state.referencePressure.toFixed(3)} atm.`,
        "info",
      ));
    }
    return {
      ...state,
      temperature:  t,
      volume:       v,
      lastVolumeChangeDirection: changeDir,
      measurements: buildGasLawsMeasurements(t, v, state.pressure, state.activeErrors, state.calibrationBias, fricOffset),
      observations: newObs.length ? [...newObs, ...state.observations] : state.observations,
    };
  } else {
    // Gay-Lussac's: volume fixed, pressure changes with temperature
    const p = gayLussacPressure(t, state.referenceVolume, state.nMoles, state.gasType);
    if (Math.abs(p - state.pressure) > 0.005) {
      newObs.push(mkObs(
        "pressure-change",
        `Gas ${direction} (${state.gasType.toUpperCase()}): T = ${t} K → P = ${p.toFixed(3)} atm. Syringe is locked (V = ${state.referenceVolume.toFixed(2)} L).`,
        "info",
      ));
    }
    return {
      ...state,
      temperature:  t,
      pressure:     p,
      lastVolumeChangeDirection: "none",
      measurements: buildGasLawsMeasurements(t, state.volume, p, state.activeErrors, state.calibrationBias, 0),
      observations: newObs.length ? [...newObs, ...state.observations] : state.observations,
    };
  }
}

export function setGasType(state: GasLawsState, gasType: "he" | "n2" | "co2"): GasLawsState {
  if (state.status === "running" || state.status === "completed") return state;
  const n = state.nMoles;
  let p = state.pressure;
  let v = state.volume;

  if (state.law === "boyle") {
    v = charlesVolume(state.referenceTemp, gasType, n, state.referencePressure);
    p = boylePressure(v, gasType, n, state.referenceTemp);
  } else if (state.law === "charles") {
    v = charlesVolume(state.temperature, gasType, n, state.referencePressure);
    p = state.referencePressure;
  } else if (state.law === "gay-lussac") {
    v = state.referenceVolume;
    p = gayLussacPressure(state.temperature, state.referenceVolume, n, gasType);
  }

  return {
    ...state,
    gasType,
    volume: v,
    pressure: p,
    measurements: buildGasLawsMeasurements(state.temperature, v, p, state.activeErrors, state.calibrationBias),
    observations: [
      mkObs("pressure-change", `Gas type switched to ${gasType.toUpperCase()}.`, "info"),
      ...state.observations,
    ],
  };
}

export function setSealQuality(state: GasLawsState, quality: number): GasLawsState {
  const q = Math.max(0, Math.min(1.0, quality));
  return {
    ...state,
    sealQuality: q,
  };
}

export function tickGasLaws(state: GasLawsState, deltaSec: number): GasLawsState {
  if (state.status !== "running" || !state.law) return state;

  const P_ambient = 1.0; // atm
  const leakCoeff = (1.0 - state.sealQuality) * 0.012; // exponential leak decay factor
  const pDiff = state.pressure - P_ambient;
  
  let newNMoles = state.nMoles;
  const newObs: ObservationEvent[] = [];

  if (Math.abs(pDiff) > 0.01 && leakCoeff > 0) {
    const deltaMoles = -leakCoeff * pDiff * deltaSec;
    newNMoles = Math.max(0.01, state.nMoles + deltaMoles);
    
    // Check if we just started leaking and need to alert the user
    if (state.nMoles - newNMoles > 0.0001 && state.observations.filter(o => o.type === "leak-alert").length === 0) {
      newObs.push(mkObs("leak-alert", "Hissing sound detected! Gas is leaking from the apparatus seal.", "warning"));
    }
  }

  // Recalculate based on the law
  let p = state.pressure;
  let v = state.volume;

  if (state.law === "boyle") {
    p = boylePressure(state.volume, state.gasType, newNMoles, state.referenceTemp);
  } else if (state.law === "charles") {
    v = charlesVolume(state.temperature, state.gasType, newNMoles, state.referencePressure);
  } else if (state.law === "gay-lussac") {
    p = gayLussacPressure(state.temperature, state.referenceVolume, newNMoles, state.gasType);
  }

  // Add friction offset if slider is moving
  const P_friction = state.pistonFriction * 0.02;
  const fricOffset = state.lastVolumeChangeDirection === "up" ? -P_friction : state.lastVolumeChangeDirection === "down" ? P_friction : 0;

  const measurements = buildGasLawsMeasurements(state.temperature, v, p, state.activeErrors, state.calibrationBias, fricOffset);

  return {
    ...state,
    nMoles: newNMoles,
    pressure: p,
    volume: v,
    measurements,
    observations: newObs.length ? [...newObs, ...state.observations] : state.observations,
  };
}

export function recordDataPoint(state: GasLawsState): GasLawsState {
  if (!state.law) return state;
  if (state.status !== "running") return state;

  const point: GasDataPoint = state.law === "boyle"
    ? { x: state.volume, y: state.pressure }
    : state.law === "charles"
    ? { x: state.temperature, y: state.volume }
    : { x: state.temperature, y: state.pressure };  // Gay-Lussac's: (T, P)

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
    ? `Data point: V=${state.volume.toFixed(2)} L, P=${state.pressure.toFixed(3)} atm — PV = ${(state.pressure * state.volume).toFixed(3)} L·atm (${count} total)`
    : state.law === "charles"
    ? `Data point: T=${state.temperature} K, V=${state.volume.toFixed(3)} L — V/T = ${(state.volume / state.temperature).toFixed(5)} L/K (${count} total)`
    : `Data point: T=${state.temperature} K, P=${state.pressure.toFixed(3)} atm — P/T = ${(state.pressure / state.temperature).toFixed(6)} atm/K (${count} total)`;

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

  const lawExplanations: Record<import("./types").GasLaw, string> = {
    boyle:
      "Boyle's Law (1662): At constant temperature, gas pressure is inversely proportional to volume.\n" +
      "P₁V₁ = P₂V₂ = nRT (constant)\n" +
      "Doubling the volume halves the pressure. This occurs because gas molecules hit the container walls " +
      "less frequently when the volume increases. Applications: syringes, bicycle pumps, breathing mechanics.",
    charles:
      "Charles's Law (1787): At constant pressure, gas volume is directly proportional to absolute temperature.\n" +
      "V₁/T₁ = V₂/T₂ = nR/P (constant)\n" +
      "Doubling the temperature (in Kelvin) doubles the volume. Higher T → more kinetic energy → " +
      "molecules push walls harder → volume expands to restore pressure. Applications: hot-air balloons, " +
      "gas thermometers.",
    "gay-lussac":
      "Gay-Lussac's Law (1808): At constant volume, gas pressure is directly proportional to absolute temperature.\n" +
      "P₁/T₁ = P₂/T₂ = nR/V (constant)\n" +
      "Higher T → molecules move faster → more forceful wall collisions → pressure rises. " +
      "Volume is fixed so molecules cannot expand — all extra kinetic energy becomes pressure. " +
      "Applications: pressure cookers, aerosol can warnings ('do not incinerate'), tyre pressure variation.",
  };

  const summaries: Record<import("./types").GasLaw, string> = {
    boyle:       `PV = ${(state.pressure * state.volume).toFixed(3)} L·atm (constant).`,
    charles:     `V/T = ${(state.volume / state.temperature).toFixed(5)} L/K (constant).`,
    "gay-lussac":`P/T = ${(state.pressure / state.temperature).toFixed(6)} atm/K (constant).`,
  };

  const lawNames: Record<import("./types").GasLaw, string> = {
    boyle: "Boyle's", charles: "Charles's", "gay-lussac": "Gay-Lussac's",
  };

  const result = {
    completedAt: Date.now(),
    success: true,
    score,
    summary:
      `${lawNames[state.law]} Law explored with ${count} data point(s). ${summaries[state.law]}`,
    explanation: lawExplanations[state.law],
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

export function resetGasLaws(
  mode:         GasLawsState["mode"],
  activeErrors: ExperimentalError[] = [],
  simParams?:   GasLawsSimParams,
): GasLawsState {
  return initialGasLawsState(mode, activeErrors, simParams);
}
