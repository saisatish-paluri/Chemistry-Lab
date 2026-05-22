/**
 * Chemical Equilibrium Engine — Fe³⁺ + SCN⁻ ⇌ FeSCN²⁺ (Le Chatelier's Principle)
 *
 * Keq = [FeSCN²⁺] / ([Fe³⁺][SCN⁻])
 * At 25 °C (298 K): Keq = 1100 L/mol
 * Reaction is exothermic (ΔH ≈ −20 kJ/mol) → heating decreases Keq.
 *
 * Van't Hoff: ln(Keq2/Keq1) = −ΔH/R × (1/T2 − 1/T1)
 */

import type {
  ChemicalEquilibriumState,
  EquilibriumPerturbation,
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

const KEQ_298      = 1100;    // L/mol at 298 K
const DELTA_H_J    = -20000;  // J/mol (exothermic)
const R            = 8.314;   // J/(mol·K)
const T_REF        = 298;     // K

/** Equilibrium constant at temperature T (K) via van't Hoff equation. */
export function keqAtTemp(tempK: number): number {
  const exponent = (-DELTA_H_J / R) * (1 / tempK - 1 / T_REF);
  return KEQ_298 * Math.exp(exponent);
}

/**
 * Given current concentrations [a], [b], [c] and target Keq,
 * solve for the new equilibrium concentrations.
 * Keq = (c + x) / ((a − x)(b − x))  →  Keq·x² − (Keq·a + Keq·b + 1)x + (Keq·ab − c) = 0
 */
function solveEquilibrium(
  a: number,   // [Fe³⁺]
  b: number,   // [SCN⁻]
  c: number,   // [FeSCN²⁺]
  keq: number,
): { fe3: number; scn: number; fescn: number } {
  const A = keq;
  const B = -(keq * a + keq * b + 1);
  const C = keq * a * b - c;
  const disc = B * B - 4 * A * C;
  if (disc < 0) {
    // numerical edge: return unchanged
    return { fe3: a, scn: b, fescn: c };
  }
  const x1 = (-B + Math.sqrt(disc)) / (2 * A);
  const x2 = (-B - Math.sqrt(disc)) / (2 * A);
  // pick root that keeps all concentrations non-negative
  const x = (a - x1 >= 0 && b - x1 >= 0 && c + x1 >= 0) ? x1 : x2;
  return {
    fe3:   Math.max(0, a - x),
    scn:   Math.max(0, b - x),
    fescn: Math.max(0, c + x),
  };
}

export function calcQ(fe3: number, scn: number, fescn: number): number {
  if (fe3 <= 0 || scn <= 0) return fescn > 0 ? Infinity : 0;
  return fescn / (fe3 * scn);
}

/** Hex colour of solution: clear → pale yellow → blood red as [FeSCN²⁺] increases. */
export function equilibriumSolutionColor(fescn: number): string {
  // [FeSCN²⁺] range 0 – 0.05 M maps to colour
  const t = Math.min(1, fescn / 0.05);
  const r = Math.round(255);
  const g = Math.round(255 - t * 200);
  const b = Math.round(220 - t * 220);
  return `rgb(${r},${g},${b})`;
}

// ─── Initial state ────────────────────────────────────────────────────────────

const INITIAL_STEPS: StepDef[] = [
  { id: "observe-start",  instruction: "Observe the initial blood-red equilibrium mixture.",        completed: false },
  { id: "add-stress",     instruction: "Apply a stress: add Fe³⁺, SCN⁻, dilute, heat, or cool.", completed: false },
  { id: "observe-shift",  instruction: "Watch the colour change — note the shift direction.",      completed: false },
  { id: "second-stress",  instruction: "Apply a second stress and observe Le Chatelier's response.", completed: false },
  { id: "conclude",       instruction: "Complete the experiment to record your findings.",          completed: false },
];

const INITIAL_OBJECTIVES: ExperimentObjective[] = [
  { id: "first-stress",   description: "Apply at least one perturbation to the system",           completed: false },
  { id: "both-directions",description: "Observe both a forward AND a reverse equilibrium shift",  completed: false },
  { id: "temp-effect",    description: "Investigate the effect of temperature on Keq",            completed: false },
];

export function initialEquilibriumState(mode: ChemicalEquilibriumState["mode"]): ChemicalEquilibriumState {
  const tempK = 298;
  const keq   = keqAtTemp(tempK);
  // Start at equilibrium: [Fe³⁺]₀ = [SCN⁻]₀ = 0.050 M, [FeSCN²⁺]₀ = 0
  const eq = solveEquilibrium(0.050, 0.050, 0.0, keq);
  return {
    mode, status: "ready",
    temperatureK: tempK,
    concFe3:   eq.fe3,
    concSCN:   eq.scn,
    concFeSCN: eq.fescn,
    keq,
    q:           keq,   // starts at equilibrium
    shiftDirection: "none",
    atEquilibrium:  true,
    perturbHistory: [],
    steps:        INITIAL_STEPS.map((s) => ({ ...s })),
    objectives:   INITIAL_OBJECTIVES.map((o) => ({ ...o })),
    observations: [
      mkObs("reaction-start",
        `System at equilibrium at ${tempK} K. [FeSCN²⁺] = ${eq.fescn.toFixed(4)} M — blood-red solution.`,
        "info"),
    ],
    result: null, startedAt: null,
  };
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export function applyPerturbation(
  state: ChemicalEquilibriumState,
  perturbation: EquilibriumPerturbation,
): ChemicalEquilibriumState {
  if (state.status === "completed" || state.status === "failed") return state;

  let { concFe3: a, concSCN: b, concFeSCN: c } = state;
  let label    = "";
  let obsType: ObservationEvent["type"] = "equilibrium-shift";
  let tempK    = state.temperatureK;

  switch (perturbation) {
    case "add-fe3":
      a += 0.020;
      label = "Added Fe³⁺ (+0.020 M) → Q < Keq → forward shift (more FeSCN²⁺ — deeper red)";
      break;
    case "add-scn":
      b += 0.020;
      label = "Added SCN⁻ (+0.020 M) → Q < Keq → forward shift (deeper red)";
      break;
    case "remove-fescn":
      c = Math.max(0, c - 0.010);
      label = "Removed FeSCN²⁺ (−0.010 M) → Q < Keq → forward shift to restore product";
      break;
    case "dilute": {
      const factor = 0.5; // 50 % dilution
      a *= factor; b *= factor; c *= factor;
      label = "Diluted solution (50%) → Q decreases (net 2→1 stoich.) → slight forward shift";
      break;
    }
    case "heat":
      tempK = Math.min(373, state.temperatureK + 20);
      obsType = "temperature-change";
      label = `Heated to ${tempK} K → Keq decreases (exothermic rxn) → reverse shift (paler colour)`;
      break;
    case "cool":
      tempK = Math.max(273, state.temperatureK - 20);
      obsType = "temperature-change";
      label = `Cooled to ${tempK} K → Keq increases (exothermic rxn) → forward shift (deeper red)`;
      break;
  }

  const newKeq = keqAtTemp(tempK);
  const qBefore = calcQ(a, b, c);
  const shift: "forward" | "reverse" | "none" = qBefore < newKeq * 0.95
    ? "forward"
    : qBefore > newKeq * 1.05
    ? "reverse"
    : "none";

  const eq = solveEquilibrium(a, b, c, newKeq);
  const qAfter = calcQ(eq.fe3, eq.scn, eq.fescn);

  const newHistory = [...state.perturbHistory, perturbation];

  // Objective tracking
  const seenForward  = newHistory.includes("add-fe3") || newHistory.includes("add-scn") || newHistory.includes("cool");
  const seenReverse  = newHistory.includes("heat") || newHistory.includes("dilute") || newHistory.includes("remove-fescn");
  const seenTemp     = newHistory.includes("heat") || newHistory.includes("cool");

  const objectives = state.objectives.map((o) => {
    if (o.id === "first-stress"    && newHistory.length >= 1)      return { ...o, completed: true };
    if (o.id === "both-directions" && seenForward && seenReverse)  return { ...o, completed: true };
    if (o.id === "temp-effect"     && seenTemp)                     return { ...o, completed: true };
    return o;
  });

  const steps = state.steps.map((s) => {
    if (s.id === "observe-start") return { ...s, completed: true };
    if (s.id === "add-stress"    && newHistory.length >= 1) return { ...s, completed: true };
    if (s.id === "observe-shift" && shift !== "none")       return { ...s, completed: true };
    if (s.id === "second-stress" && newHistory.length >= 2) return { ...s, completed: true };
    return s;
  });

  const allObjsDone = objectives.every((o) => o.completed);
  const newStatus = allObjsDone ? "completed" : "running";

  const result = allObjsDone ? {
    completedAt: Date.now(),
    success: true,
    score: 100,
    summary: `Le Chatelier's Principle demonstrated with ${newHistory.length} perturbation(s). ` +
      `Final [FeSCN²⁺] = ${eq.fescn.toFixed(4)} M at ${tempK} K (Keq = ${newKeq.toFixed(1)}).`,
    explanation:
      "Le Chatelier's Principle: when a system at equilibrium is disturbed, it responds to minimise the disturbance.\n" +
      "• Adding reactant (Fe³⁺ or SCN⁻) → Q < Keq → forward shift → more FeSCN²⁺ (deeper red)\n" +
      "• Heating → Keq decreases (exothermic reaction) → reverse shift → paler colour\n" +
      "• Cooling → Keq increases → forward shift → deeper red\n" +
      "• Dilution → net stoichiometry 1+1→1 (same moles) → minimal shift for this reaction\n\n" +
      "The system always seeks a new equilibrium position consistent with the new conditions.",
  } : null;

  return {
    ...state,
    temperatureK: tempK,
    concFe3:  eq.fe3,
    concSCN:  eq.scn,
    concFeSCN: eq.fescn,
    keq:  newKeq,
    q:    qAfter,
    shiftDirection: shift,
    atEquilibrium:  true,
    perturbHistory: newHistory,
    status: newStatus,
    steps,
    objectives,
    result,
    startedAt: state.startedAt ?? Date.now(),
    observations: [
      mkObs(obsType, label, shift === "forward" ? "success" : shift === "reverse" ? "warning" : "info"),
      ...state.observations,
    ],
  };
}

export function startEquilibrium(state: ChemicalEquilibriumState): ChemicalEquilibriumState {
  if (state.status === "running" || state.status === "completed") return state;
  return { ...state, status: "running", startedAt: Date.now() };
}

export function resetEquilibrium(mode: ChemicalEquilibriumState["mode"]): ChemicalEquilibriumState {
  return initialEquilibriumState(mode);
}
