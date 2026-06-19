/**
 * Calorimetry Engine — Neutralisation Heat
 *
 * HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)    ΔH = −57.1 kJ/mol
 *
 * q = m × cp × ΔT   where cp = 4.18 J/(g·°C), ρ ≈ 1 g/mL
 * ΔH (J/mol) = −q / moles_reacted (negative = exothermic)
 *
 * Session integration: initial temperature from lab environment, reagent
 * concentrations from rolled reagent set, heat loss probability from
 * humidity and session difficulty. Every run produces a unique dataset.
 */

import type {
  CalorimetryState,
  CalorimetryDataPoint,
  ObservationEvent,
  StepDef,
  ExperimentObjective,
  ExperimentalError,
  CalorimetryMeasurements,
} from "./types";
import type { CalorimetrySimParams } from "./sim-bridge";
import { readThermometer, readCylinder } from "@/lib/instruments/instruments";

function uid(): string { return Math.random().toString(36).slice(2, 10); }
function mkObs(
  type: ObservationEvent["type"],
  message: string,
  severity: ObservationEvent["severity"],
): ObservationEvent {
  return { id: uid(), timestamp: Date.now(), type, message, severity };
}

// ─── Chemistry constants ───────────────────────────────────────────────────────

export const DELTA_H_NEUTRALISATION = -57100;   // J/mol (exothermic)
export const CP_SOLUTION             = 4.18;     // J/(g·°C)
export const RHO_SOLUTION            = 1.00;     // g/mL
export const C_CALORIMETER           = 15.0;     // J/K (calorimeter constant)
export const K_COOLING_INSULATED     = 0.0015;   // s⁻¹ (insulation cooling coefficient)

const HCL_VOL_ML   = 100;   // mL (fixed flask setup)

// ─── Core temperature calculation ─────────────────────────────────────────────

/**
 * Theoretical temperature after adding naohAddedMl of NaOH to HCl flask.
 * Accepts session-rolled concentrations to produce unique curves per run.
 */
export function calcCalorimetryTemp(
  naohAddedMl: number,
  hclConc = 1.0,
  naohConc = 1.0,
  initialTempC = 25.0,
): number {
  const hclMoles   = (HCL_VOL_ML / 1000) * hclConc;
  const naohMoles  = (naohAddedMl / 1000) * naohConc;
  const molReacted = Math.min(hclMoles, naohMoles);

  const totalVolMl = HCL_VOL_ML + naohAddedMl;
  const massSol    = totalVolMl * RHO_SOLUTION;

  const qJoules    = -DELTA_H_NEUTRALISATION * molReacted;
  // Incorporate calorimeter heat capacity
  const deltaT     = qJoules / (massSol * CP_SOLUTION + C_CALORIMETER);

  return initialTempC + deltaT;
}

/** Experimental ΔH from measured ΔT at equivalence. */
export function calcExperimentalDeltaH(
  naohAddedMl: number,
  deltaT: number,
  naohConc = 1.0,
): number {
  const totalVolMl = HCL_VOL_ML + naohAddedMl;
  const massSol    = totalVolMl * RHO_SOLUTION;
  const naohMoles  = (naohAddedMl / 1000) * naohConc;
  if (naohMoles <= 0) return 0;
  const qJoules    = (massSol * CP_SOLUTION + C_CALORIMETER) * deltaT;
  return -qJoules / naohMoles / 1000;   // kJ/mol
}

// ─── Measurement builder ──────────────────────────────────────────────────────

function buildCalorimetryMeasurements(
  tempC:       number,
  naohAddedMl: number,
  errors:      ExperimentalError[],
): CalorimetryMeasurements {
  return {
    thermometer: readThermometer(tempC,      { activeErrors: errors }),
    naohVolume:  readCylinder(naohAddedMl,  { activeErrors: errors }),
  };
}

// ─── Initial state ────────────────────────────────────────────────────────────

const INITIAL_STEPS: StepDef[] = [
  { id: "record-init",  instruction: "Record the initial temperature of the HCl solution.",   completed: false },
  { id: "add-10ml",     instruction: "Add 10 mL NaOH and record the temperature.",            completed: false },
  { id: "add-more",     instruction: "Continue adding NaOH in 10 mL increments.",             completed: false },
  { id: "equivalence",  instruction: "Note the maximum temperature at the equivalence point.", completed: false },
  { id: "calculate",    instruction: "Calculate ΔH from your temperature-volume data.",        completed: false },
];

const INITIAL_OBJECTIVES: ExperimentObjective[] = [
  { id: "add-50ml",   description: "Add at least 50 mL NaOH",                             completed: false },
  { id: "reach-eq",   description: "Reach the equivalence point",                          completed: false },
  { id: "calc-dh",    description: "Calculate ΔH within ±5 kJ/mol of −57.1 kJ/mol",      completed: false },
];

export function initialCalorimetryState(
  mode:         CalorimetryState["mode"],
  activeErrors: ExperimentalError[] = [],
  simParams?:   CalorimetrySimParams,
): CalorimetryState {
  const hclConc          = simParams?.hclConc          ?? 1.0;
  const naohConc         = simParams?.naohConc         ?? 1.0;
  const initialTempC     = simParams?.initialTempC     ?? 25.0;
  const heatLossProb     = simParams?.heatLossProb     ?? 0.25;
  const heatLossMagnitude = simParams?.heatLossMagnitude ?? 0.07;

  // Equivalence volume: V_NaOH = (c_HCl × V_HCl) / c_NaOH
  const eqVolMl = (hclConc * HCL_VOL_ML) / naohConc;

  return {
    mode, status: "ready",
    hclVolumeMl:    HCL_VOL_ML,
    hclConc,
    naohConc,
    naohAddedMl:    0,
    initialTempC,
    currentTempC:   initialTempC,
    dataPoints:     [{ naohVolumeMl: 0, tempC: initialTempC }],
    calculatedDeltaH: null,
    steps:      INITIAL_STEPS.map((s) => ({ ...s })),
    objectives: INITIAL_OBJECTIVES.map((o) => ({ ...o })),
    observations: [
      mkObs("reaction-start",
        `HCl solution ready: ${HCL_VOL_ML} mL of ${hclConc.toFixed(4)} M HCl at ${initialTempC.toFixed(1)} °C. ` +
        `Equivalence point at ~${eqVolMl.toFixed(1)} mL NaOH. ` +
        "Add NaOH in 10 mL portions to measure the heat of neutralisation.",
        "info"),
    ],
    result: null, startedAt: null,
    measurements: buildCalorimetryMeasurements(initialTempC, 0, activeErrors),
    activeErrors,
    heatLossProb,
    heatLossMagnitude,
  };
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export function addNaOH(state: CalorimetryState, volumeMl: number = 10): CalorimetryState {
  if (state.status === "completed" || state.status === "failed") return state;

  const addMl      = Math.max(5, Math.min(volumeMl, 20));
  const newAddedMl = Math.min(state.naohAddedMl + addMl, 150);

  // Theoretical temperature from session-rolled concentrations
  const theoreticalTemp = calcCalorimetryTemp(
    newAddedMl, state.hclConc, state.naohConc, state.initialTempC,
  );

  // Apply heat loss: random deduction based on session-rolled probability
  const heatLossOccurs = Math.random() < state.heatLossProb;
  const heatLossFraction = heatLossOccurs
    ? Math.random() * state.heatLossMagnitude
    : 0;
  const newTemp = theoreticalTemp - (theoreticalTemp - state.initialTempC) * heatLossFraction;

  const hclMoles   = (state.hclVolumeMl / 1000) * state.hclConc;
  const naohMoles  = (newAddedMl / 1000) * state.naohConc;
  const atOrPastEq = naohMoles >= hclMoles;
  const isFirst    = state.naohAddedMl === 0;

  const deltaT    = newTemp - state.initialTempC;
  const newPoint: CalorimetryDataPoint = { naohVolumeMl: newAddedMl, tempC: newTemp };
  const newPoints = [...state.dataPoints, newPoint];

  const steps = state.steps.map((s) => {
    if (s.id === "record-init" && isFirst)         return { ...s, completed: true };
    if (s.id === "add-10ml"   && newAddedMl >= 10) return { ...s, completed: true };
    if (s.id === "add-more"   && newAddedMl >= 50) return { ...s, completed: true };
    if (s.id === "equivalence"&& atOrPastEq)       return { ...s, completed: true };
    return s;
  });

  const objectives = state.objectives.map((o) => {
    if (o.id === "add-50ml" && newAddedMl >= 50) return { ...o, completed: true };
    if (o.id === "reach-eq" && atOrPastEq)        return { ...o, completed: true };
    return o;
  });

  const newObs: ObservationEvent[] = [];
  newObs.push(mkObs(
    "heat-released",
    `Added ${addMl} mL NaOH → T = ${newTemp.toFixed(2)} °C (ΔT = ${deltaT.toFixed(2)} °C). ` +
    `Total NaOH: ${newAddedMl} mL.` +
    (heatLossOccurs ? " [Minor heat loss to surroundings detected]" : ""),
    deltaT > 0 ? "success" : "info",
  ));

  if (atOrPastEq && !state.objectives.find((o) => o.id === "reach-eq")?.completed) {
    const calcDH = calcExperimentalDeltaH(newAddedMl, deltaT, state.naohConc);
    newObs.push(mkObs(
      "heat-released",
      `Equivalence point reached at ${newAddedMl} mL NaOH! ` +
      `Maximum temperature: ${newTemp.toFixed(2)} °C. ` +
      `Estimated ΔH ≈ ${calcDH.toFixed(1)} kJ/mol.`,
      "success",
    ));
  }

  // Calculate ΔH at equivalence using session-rolled concentrations
  const eqVolMl = (state.hclConc * state.hclVolumeMl) / state.naohConc;
  const eqTemp  = calcCalorimetryTemp(eqVolMl, state.hclConc, state.naohConc, state.initialTempC);
  const calcDH  = calcExperimentalDeltaH(eqVolMl, eqTemp - state.initialTempC, state.naohConc);

  const dhObjectiveDone = atOrPastEq && Math.abs(calcDH - (-57.1)) < 5;
  const updatedObjs     = objectives.map((o) =>
    o.id === "calc-dh" && dhObjectiveDone ? { ...o, completed: true } : o,
  );
  const allDone   = updatedObjs.every((o) => o.completed);
  const newStatus = allDone ? "completed" : "running";

  const calcSteps = allDone
    ? steps.map((s) => s.id === "calculate" ? { ...s, completed: true } : s)
    : steps;

  const result = allDone ? {
    completedAt: Date.now(),
    success: true,
    score: Math.round(95 - Math.abs(calcDH - (-57.1)) * 2),
    summary:
      `Equivalence at ${eqVolMl.toFixed(1)} mL NaOH. ` +
      `Max T = ${eqTemp.toFixed(2)} °C (ΔT = ${(eqTemp - state.initialTempC).toFixed(2)} °C). ` +
      `Calculated ΔH = ${calcDH.toFixed(1)} kJ/mol (literature: −57.1 kJ/mol).`,
    explanation:
      `HCl ${state.hclConc.toFixed(4)} M × NaOH ${state.naohConc.toFixed(4)} M. ` +
      "Neutralisation releases heat because strong acid/base reactions form H₂O, releasing ~57 kJ per mole.\n" +
      `q = m × cp × ΔT = ${((HCL_VOL_ML + eqVolMl) * CP_SOLUTION * (eqTemp - state.initialTempC) / 1000).toFixed(2)} kJ\n` +
      "ΔH = −q / n(NaOH) = experimental value\n\n" +
      "Sources of error: heat loss to calorimeter walls, incomplete mixing, density assumption (ρ ≈ 1 g/mL).",
  } : null;

  return {
    ...state,
    status:           newStatus,
    naohAddedMl:      newAddedMl,
    currentTempC:     newTemp,
    dataPoints:       newPoints,
    calculatedDeltaH: atOrPastEq ? calcDH : null,
    steps:            calcSteps,
    objectives:       updatedObjs,
    result,
    startedAt:        state.startedAt ?? Date.now(),
    observations:     [...newObs, ...state.observations],
    measurements:     buildCalorimetryMeasurements(newTemp, newAddedMl, state.activeErrors),
  };
}

/** Real-time Newton cooling tick */
export function tickCalorimetry(state: CalorimetryState, deltaSec: number): CalorimetryState {
  if (state.status !== "running" && state.status !== "ready") return state;
  if (state.naohAddedMl === 0) return state;

  const tempDiff = state.currentTempC - state.initialTempC;
  if (tempDiff <= 0.01) return state;

  // Newton's law of cooling: T(t) = T_env + (T_0 - T_env) * e^(-k*t)
  const cooledTemp = state.initialTempC + tempDiff * Math.exp(-K_COOLING_INSULATED * deltaSec);

  const newPoints = [...state.dataPoints];
  if (newPoints.length > 0) {
    newPoints[newPoints.length - 1] = {
      ...newPoints[newPoints.length - 1],
      tempC: cooledTemp,
    };
  }

  return {
    ...state,
    currentTempC: cooledTemp,
    dataPoints: newPoints,
    measurements: buildCalorimetryMeasurements(cooledTemp, state.naohAddedMl, state.activeErrors),
  };
}

export function resetCalorimetry(
  mode:         CalorimetryState["mode"],
  activeErrors: ExperimentalError[] = [],
  simParams?:   CalorimetrySimParams,
): CalorimetryState {
  return initialCalorimetryState(mode, activeErrors, simParams);
}
