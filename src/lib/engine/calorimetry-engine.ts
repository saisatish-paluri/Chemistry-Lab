/**
 * Calorimetry Engine — Neutralisation Heat
 *
 * HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)    ΔH = −57.1 kJ/mol
 *
 * q = m × cp × ΔT   where cp = 4.18 J/(g·°C), ρ ≈ 1 g/mL
 * ΔH (J/mol) = −q / moles_reacted (negative = exothermic)
 *
 * User adds NaOH in 10 mL portions up to 100 mL.
 * At equivalence (100 mL NaOH = 0.1 mol), temperature peaks then drops.
 */

import type {
  CalorimetryState,
  CalorimetryDataPoint,
  ObservationEvent,
  StepDef,
  ExperimentObjective,
} from "./types";

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

const HCL_VOL_ML   = 100;   // fixed
const HCL_CONC     = 1.0;   // mol/L → 0.1 mol HCl total
const NAOH_CONC    = 1.0;   // mol/L
const INITIAL_TEMP = 25.0;  // °C

/** Temperature after adding naohAddedMl of 1 M NaOH to 100 mL of 1 M HCl. */
export function calcCalorimetryTemp(naohAddedMl: number): number {
  const hclMoles   = (HCL_VOL_ML / 1000) * HCL_CONC;          // 0.1 mol
  const naohMoles  = (naohAddedMl / 1000) * NAOH_CONC;
  const molReacted = Math.min(hclMoles, naohMoles);             // limiting

  const totalVolMl = HCL_VOL_ML + naohAddedMl;
  const massSol    = totalVolMl * RHO_SOLUTION;                  // g

  const qJoules    = -DELTA_H_NEUTRALISATION * molReacted;      // heat released (positive)
  const deltaT     = qJoules / (massSol * CP_SOLUTION);

  return INITIAL_TEMP + deltaT;
}

/** Experimental ΔH from measured ΔT at a given point (before equivalence). */
export function calcExperimentalDeltaH(
  naohAddedMl: number,
  deltaT: number,
): number {
  const totalVolMl = HCL_VOL_ML + naohAddedMl;
  const massSol    = totalVolMl * RHO_SOLUTION;
  const naohMoles  = (naohAddedMl / 1000) * NAOH_CONC;
  if (naohMoles <= 0) return 0;
  const qJoules    = massSol * CP_SOLUTION * deltaT;
  return -qJoules / naohMoles / 1000;   // kJ/mol
}

// ─── Initial state ────────────────────────────────────────────────────────────

const INITIAL_STEPS: StepDef[] = [
  { id: "record-init",  instruction: "Record the initial temperature of the HCl solution.",  completed: false },
  { id: "add-10ml",     instruction: "Add 10 mL NaOH and record the temperature.",           completed: false },
  { id: "add-more",     instruction: "Continue adding NaOH in 10 mL increments.",            completed: false },
  { id: "equivalence",  instruction: "Note the maximum temperature at the equivalence point.", completed: false },
  { id: "calculate",    instruction: "Calculate ΔH from your temperature-volume data.",       completed: false },
];

const INITIAL_OBJECTIVES: ExperimentObjective[] = [
  { id: "add-50ml",   description: "Add at least 50 mL NaOH",                                completed: false },
  { id: "reach-eq",   description: "Reach the equivalence point (100 mL NaOH)",              completed: false },
  { id: "calc-dh",    description: "Calculate ΔH within ±5 kJ/mol of −57.1 kJ/mol",         completed: false },
];

export function initialCalorimetryState(mode: CalorimetryState["mode"]): CalorimetryState {
  return {
    mode, status: "ready",
    hclVolumeMl:    HCL_VOL_ML,
    hclConc:        HCL_CONC,
    naohConc:       NAOH_CONC,
    naohAddedMl:    0,
    initialTempC:   INITIAL_TEMP,
    currentTempC:   INITIAL_TEMP,
    dataPoints:     [{ naohVolumeMl: 0, tempC: INITIAL_TEMP }],
    calculatedDeltaH: null,
    steps:      INITIAL_STEPS.map((s) => ({ ...s })),
    objectives: INITIAL_OBJECTIVES.map((o) => ({ ...o })),
    observations: [
      mkObs("reaction-start",
        `HCl solution ready: ${HCL_VOL_ML} mL of ${HCL_CONC} M HCl at ${INITIAL_TEMP} °C. ` +
        "Add NaOH in 10 mL portions to measure the heat of neutralisation.",
        "info"),
    ],
    result: null, startedAt: null,
  };
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export function addNaOH(state: CalorimetryState, volumeMl: number = 10): CalorimetryState {
  if (state.status === "completed" || state.status === "failed") return state;

  const addMl       = Math.max(5, Math.min(volumeMl, 20));
  const newAddedMl  = Math.min(state.naohAddedMl + addMl, 150); // allow slight excess
  const newTemp     = calcCalorimetryTemp(newAddedMl);
  const hclMoles    = (state.hclVolumeMl / 1000) * state.hclConc; // 0.1 mol
  const naohMoles   = (newAddedMl / 1000) * state.naohConc;
  const atOrPastEq  = naohMoles >= hclMoles;
  const isFirst     = state.naohAddedMl === 0;

  const deltaT      = newTemp - state.initialTempC;
  const newPoint: CalorimetryDataPoint = { naohVolumeMl: newAddedMl, tempC: newTemp };
  const newPoints = [...state.dataPoints, newPoint];

  const steps = state.steps.map((s) => {
    if (s.id === "record-init" && isFirst)      return { ...s, completed: true };
    if (s.id === "add-10ml"   && newAddedMl >= 10)  return { ...s, completed: true };
    if (s.id === "add-more"   && newAddedMl >= 50)  return { ...s, completed: true };
    if (s.id === "equivalence"&& atOrPastEq)        return { ...s, completed: true };
    return s;
  });

  const objectives = state.objectives.map((o) => {
    if (o.id === "add-50ml"  && newAddedMl >= 50)   return { ...o, completed: true };
    if (o.id === "reach-eq"  && atOrPastEq)          return { ...o, completed: true };
    return o;
  });

  const newObs: ObservationEvent[] = [];
  newObs.push(mkObs(
    "heat-released",
    `Added ${addMl} mL NaOH → T = ${newTemp.toFixed(2)} °C (ΔT = ${deltaT.toFixed(2)} °C). ` +
    `Total NaOH: ${newAddedMl} mL.`,
    deltaT > 0 ? "success" : "info",
  ));

  if (atOrPastEq && !state.objectives.find((o) => o.id === "reach-eq")?.completed) {
    newObs.push(mkObs(
      "heat-released",
      `Equivalence point reached at ${newAddedMl} mL NaOH! ` +
      `Maximum temperature: ${newTemp.toFixed(2)} °C. ` +
      `Estimated ΔH ≈ ${calcExperimentalDeltaH(100, newTemp - state.initialTempC).toFixed(1)} kJ/mol.`,
      "success",
    ));
  }

  const calcDH = calcExperimentalDeltaH(100, calcCalorimetryTemp(100) - INITIAL_TEMP);

  const dhObjectiveDone = atOrPastEq && Math.abs(calcDH - (-57.1)) < 5;
  const updatedObjs     = objectives.map((o) =>
    o.id === "calc-dh" && dhObjectiveDone ? { ...o, completed: true } : o,
  );
  const allDone = updatedObjs.every((o) => o.completed);
  const newStatus = allDone ? "completed" : "running";

  const calcSteps = allDone
    ? steps.map((s) => s.id === "calculate" ? { ...s, completed: true } : s)
    : steps;

  const result = allDone ? {
    completedAt: Date.now(),
    success: true,
    score: Math.round(95 - Math.abs(calcDH - (-57.1)) * 2),
    summary:
      `Equivalence at ${newAddedMl} mL NaOH. Max T = ${calcCalorimetryTemp(100).toFixed(2)} °C. ` +
      `Calculated ΔH = ${calcDH.toFixed(1)} kJ/mol (literature: −57.1 kJ/mol).`,
    explanation:
      "Neutralisation releases heat because strong acid/base reactions form H₂O, releasing ~57 kJ per mole.\n" +
      `q = m × cp × ΔT = ${(HCL_VOL_ML + 100) * CP_SOLUTION * (calcCalorimetryTemp(100) - INITIAL_TEMP) / 1000 | 0} kJ\n` +
      "ΔH = −q / n(NaOH) = experimental value\n\n" +
      "Sources of error: heat loss to calorimeter walls, incomplete mixing, density assumption (ρ ≈ 1 g/mL).",
  } : null;

  return {
    ...state,
    status:          newStatus,
    naohAddedMl:     newAddedMl,
    currentTempC:    newTemp,
    dataPoints:      newPoints,
    calculatedDeltaH: atOrPastEq ? calcDH : null,
    steps:           calcSteps,
    objectives:      updatedObjs,
    result,
    startedAt:       state.startedAt ?? Date.now(),
    observations:    [...newObs, ...state.observations],
  };
}

export function resetCalorimetry(mode: CalorimetryState["mode"]): CalorimetryState {
  return initialCalorimetryState(mode);
}
