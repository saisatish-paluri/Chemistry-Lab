/**
 * Redox Displacement Engine
 *
 * Metal rod placed in CuSO₄ solution.
 * Metals above Cu in the electrochemical series displace Cu²⁺:
 *   M(s) + Cu²⁺(aq) → M²⁺(aq) + Cu(s)   (simplified — actual stoichiometry varies by metal)
 *
 * Electrochemical series (most to least reactive):
 *   Mg > Al > Zn > Fe > Pb > Cu > Ag
 */

import type {
  RedoxDisplacementState,
  MetalId,
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

// ─── Metal profiles ───────────────────────────────────────────────────────────

export interface MetalProfile {
  id:            MetalId;
  name:          string;
  symbol:        string;
  molarMass:     number;    // g/mol
  electrons:     number;    // electrons transferred per atom
  displacesCu:   boolean;
  rodColor:      string;    // normal metal rod color
  depositColor:  string;    // after Cu deposits (if active)
  halfEquation:  string;    // oxidation half-equation
  stdPotential:  number;    // E° (V) vs SHE
  observation:   string;
}

export const METALS: Record<MetalId, MetalProfile> = {
  magnesium: {
    id: "magnesium", name: "Magnesium", symbol: "Mg",
    molarMass: 24.31, electrons: 2, displacesCu: true,
    rodColor: "#e8e8e8", depositColor: "#b87333",
    halfEquation: "Mg → Mg²⁺ + 2e⁻",
    stdPotential: -2.37,
    observation: "Vigorous reaction — copper deposits rapidly, solution turns colourless as Cu²⁺ is consumed.",
  },
  zinc: {
    id: "zinc", name: "Zinc", symbol: "Zn",
    molarMass: 65.38, electrons: 2, displacesCu: true,
    rodColor: "#d0d0c0", depositColor: "#b87333",
    halfEquation: "Zn → Zn²⁺ + 2e⁻",
    stdPotential: -0.76,
    observation: "Steady reaction — brown copper deposits on zinc rod; blue solution fades.",
  },
  iron: {
    id: "iron", name: "Iron", symbol: "Fe",
    molarMass: 55.85, electrons: 2, displacesCu: true,
    rodColor: "#888888", depositColor: "#b87333",
    halfEquation: "Fe → Fe²⁺ + 2e⁻",
    stdPotential: -0.44,
    observation: "Moderate reaction — copper slowly deposits on iron nail; solution becomes pale blue then green.",
  },
  lead: {
    id: "lead", name: "Lead", symbol: "Pb",
    molarMass: 207.2, electrons: 2, displacesCu: true,
    rodColor: "#909090", depositColor: "#b87333",
    halfEquation: "Pb → Pb²⁺ + 2e⁻",
    stdPotential: -0.13,
    observation: "Slow reaction — small amounts of copper deposit on lead strip; solution becomes slightly paler.",
  },
  copper: {
    id: "copper", name: "Copper", symbol: "Cu",
    molarMass: 63.55, electrons: 2, displacesCu: false,
    rodColor: "#b87333", depositColor: "#b87333",
    halfEquation: "No reaction (Cu cannot displace itself)",
    stdPotential: +0.34,
    observation: "No reaction — copper is at the same position in the series; solution colour unchanged.",
  },
  silver: {
    id: "silver", name: "Silver", symbol: "Ag",
    molarMass: 107.87, electrons: 1, displacesCu: false,
    rodColor: "#c0c0c0", depositColor: "#c0c0c0",
    halfEquation: "No reaction (Ag is less reactive than Cu)",
    stdPotential: +0.80,
    observation: "No reaction — silver is below copper in the series; no displacement occurs.",
  },
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CUPRIC_INITIAL    = 0.5;    // mol/L (default)
const SOLUTION_VOL_L    = 0.100;  // 100 mL
const METAL_MASS_G      = 5.0;    // grams placed in solution (default)

/**
 * Base tick rate at ΔE° = 1.10 V (Zn reference) and 25 °C.
 * Actual rate scales with cell potential and temperature via Arrhenius.
 */
const TICK_RATE_BASE    = 0.010;  // s⁻¹ at reference conditions (Zn, 25 °C)

export const CUPRIC_INITIAL_CONC = CUPRIC_INITIAL;

/**
 * Electrochemical rate constant for a given metal.
 *
 * Rate ∝ ΔE°^0.8  (Butler-Volmer approximation for large overpotential).
 * Normalised to Zn (ΔE° = 1.10 V) = base rate.
 * Temperature factor: Q₁₀ rule, ×1.4 per 10 °C (less sensitive than homogeneous).
 *
 * @param metal          Metal profile (to get E°)
 * @param rateMultiplier Session-rolled temperature-derived multiplier
 */
function calcTickRate(metal: MetalProfile, rateMultiplier: number): number {
  if (!metal.displacesCu) return 0;
  const cellPotential = 0.34 - metal.stdPotential;          // E° vs Cu²⁺/Cu
  const refPotential  = 0.34 - (-0.76);                     // Zn reference = 1.10 V
  // Butler-Volmer-like scaling — higher ΔE° gives much faster rate
  const potentialScale = Math.pow(cellPotential / refPotential, 0.8);
  return TICK_RATE_BASE * potentialScale * rateMultiplier;
}

export function cuSolutionColor(cupricConc: number): string {
  const t = Math.max(0, Math.min(1, cupricConc / CUPRIC_INITIAL));
  const r = Math.round(200 + t * 10);
  const g = Math.round(220 + t * 15);
  const b = Math.round(255);
  return `rgb(${r},${g},${b})`;
}

// ─── Initial state ────────────────────────────────────────────────────────────

const INITIAL_STEPS: StepDef[] = [
  { id: "select-metal",   instruction: "Select a metal from the activity series.",          completed: false },
  { id: "add-metal",      instruction: "Place the metal rod into the CuSO₄ solution.",     completed: false },
  { id: "observe",        instruction: "Observe any colour change and deposits.",           completed: false },
  { id: "second-metal",   instruction: "Try a second metal to compare reactivity.",        completed: false },
];

const INITIAL_OBJECTIVES: ExperimentObjective[] = [
  { id: "active-metal",   description: "Test a metal that displaces copper",               completed: false },
  { id: "inactive-metal", description: "Test a metal that does NOT displace copper",       completed: false },
  { id: "full-reaction",  description: "Allow a displacement reaction to run to completion", completed: false },
];

export function initialRedoxState(
  mode: RedoxDisplacementState["mode"],
  simParams?: import("./sim-bridge").RedoxSimParams,
): RedoxDisplacementState {
  const cuConc        = simParams?.cuConc        ?? CUPRIC_INITIAL;
  const metalMassG    = simParams?.metalMassG    ?? METAL_MASS_G;
  const rateMultiplier = simParams?.rateMultiplier ?? 1.0;
  return {
    mode, status: "idle",
    selectedMetal:    null,
    metalMassG:       0,
    cupricConc:       cuConc,
    solutionVolumeMl: 100,
    cuDepositedG:     0,
    metalConsumedG:   0,
    reactionOccurs:   false,
    steps:      INITIAL_STEPS.map((s) => ({ ...s })),
    objectives: INITIAL_OBJECTIVES.map((o) => ({ ...o })),
    observations: [], result: null, startedAt: null,
    _cuConc:         cuConc,
    _metalMassG:     metalMassG,
    _rateMultiplier: rateMultiplier,

    // Overhaul defaults
    temperature:       25,
    metalConc:         1e-6,
    cellPotential:     0.0,
    equilibriumReached: false,
    experimentalError: (Math.random() - 0.5) * 2,
  };
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export function selectMetal(state: RedoxDisplacementState, metalId: MetalId): RedoxDisplacementState {
  if (state.status === "completed" || state.status === "failed") return state;
  const metal = METALS[metalId];
  const steps = state.steps.map((s) => s.id === "select-metal" ? { ...s, completed: true } : s);
  return {
    ...state,
    selectedMetal: metalId,
    steps,
    observations: [
      mkObs("reaction-start",
        `Selected ${metal.name} (${metal.symbol}) — E° = ${metal.stdPotential.toFixed(2)} V. ` +
        `${metal.displacesCu ? "More reactive than Cu — displacement expected." : "Less reactive than Cu — no reaction expected."}`,
        "info"),
      ...state.observations,
    ],
  };
}

export function recalculateRedox(state: RedoxDisplacementState): RedoxDisplacementState {
  if (!state.selectedMetal) return state;
  const metal = METALS[state.selectedMetal];
  if (!metal.displacesCu) {
    return {
      ...state,
      cellPotential: 0.0,
      equilibriumReached: false,
    };
  }

  const T_K = state.temperature + 273.15;
  const R_gas = 8.314;
  const F = 96485;
  const z = 2; // Mg2+, Zn2+, Fe2+, Pb2+

  const E_std = 0.34 - metal.stdPotential;
  const mConc = Math.max(1e-6, state.metalConc ?? 1e-6);
  const cuConc = Math.max(1e-6, state.cupricConc);

  // Nernst Equation
  const cellPotential = E_std - (R_gas * T_K / (z * F)) * Math.log(mConc / cuConc);

  return {
    ...state,
    cellPotential: cellPotential + 0.02 * state.experimentalError,
  };
}

export function updateRedoxParameters(
  state: RedoxDisplacementState,
  changes: Partial<Pick<RedoxDisplacementState, "temperature" | "cupricConc">>,
): RedoxDisplacementState {
  if (state.status !== "idle" && state.status !== "setup") return state;
  const next = {
    ...state,
    temperature: changes.temperature !== undefined ? changes.temperature : state.temperature,
    cupricConc: changes.cupricConc !== undefined ? changes.cupricConc : state.cupricConc,
  };
  next._cuConc = next.cupricConc;
  return recalculateRedox(next);
}

export function addMetalToSolution(state: RedoxDisplacementState): RedoxDisplacementState {
  if (!state.selectedMetal)      return state;
  if (state.status === "running" || state.status === "completed") return state;
  
  const metal    = METALS[state.selectedMetal];
  const occurs   = metal.displacesCu;
  
  const calculatedState = recalculateRedox(state);
  const cellPotential = calculatedState.cellPotential;
  const newStatus = occurs ? "running" : "completed";
  
  const metalMassG    = state._metalMassG > 0 ? state._metalMassG : METAL_MASS_G;

  const objectives = state.objectives.map((o) => {
    if (o.id === "active-metal"   && occurs)  return { ...o, completed: true };
    if (o.id === "inactive-metal" && !occurs) return { ...o, completed: true };
    return o;
  });
  const steps = state.steps.map((s) =>
    s.id === "add-metal" ? { ...s, completed: true } : s,
  );

  const rateNote = occurs
    ? ` Initial cell potential E_cell = ${cellPotential.toFixed(2)} V (calculated via Nernst at ${state.temperature}°C).`
    : "";

  const result = !occurs ? {
    completedAt: Date.now(),
    success: true,
    score: 80,
    summary: `No reaction — ${metal.name} (E° = ${metal.stdPotential.toFixed(2)} V) is less reactive than copper (E° = +0.34 V).`,
    explanation:
      metal.observation + "\n\n" +
      "In the electrochemical series, only metals with a more negative standard reduction potential " +
      `(E° < +0.34 V) can displace Cu²⁺. ${metal.name} has E° = ${metal.stdPotential.toFixed(2)} V.\n` +
      "The cell potential E°_cell would be negative, meaning the reaction is non-spontaneous.",
  } : null;

  return {
    ...calculatedState,
    status:         newStatus,
    metalMassG:     metalMassG,
    reactionOccurs: occurs,
    startedAt:      occurs ? Date.now() : state.startedAt,
    steps,
    objectives,
    result,
    observations: [
      mkObs(
        occurs ? "deposition" : "no-reaction",
        occurs
          ? `${metal.name} rod placed in CuSO₄ (${state.cupricConc.toFixed(2)} M) — ${metal.observation}${rateNote}`
          : `${metal.name} rod placed in CuSO₄ — ${metal.observation}`,
        occurs ? "success" : "info",
      ),
      ...state.observations,
    ],
  };
}

export function tickRedox(state: RedoxDisplacementState, deltaSec: number): RedoxDisplacementState {
  if (state.status !== "running" || !state.selectedMetal || !state.reactionOccurs) return state;
  const metal = METALS[state.selectedMetal];

  // Nernst Cell Potential calculation at current concentrations
  const T_K = state.temperature + 273.15;
  const R_gas = 8.314;
  const F = 96485;
  const z = 2;

  const E_std = 0.34 - metal.stdPotential;
  const mConc = Math.max(1e-6, state.metalConc ?? 1e-6);
  const cuConc = Math.max(1e-6, state.cupricConc);
  const cellPotential = E_std - (R_gas * T_K / (z * F)) * Math.log(mConc / cuConc);

  if (cellPotential <= 0.001) {
    // Reaction reaches equilibrium naturally
    return completeRedox({
      ...state,
      cellPotential: 0.0,
      equilibriumReached: true,
    }, metal);
  }

  // Arrhenius Kinetics & Passivation:
  const Ea = metal.id === "magnesium" ? 15000
           : metal.id === "zinc" ? 22000
           : metal.id === "iron" ? 28000
           : 35000;
  const A = 120.0; // pre-exponential scale factor
  const rateK = A * Math.exp(-Ea / (R_gas * T_K)) * (1.0 + 0.04 * state.experimentalError);
  
  // Passivation factor: Cu layer limits access to the underlying metal
  const k_pass = metal.id === "magnesium" ? 1.0 : metal.id === "zinc" ? 3.0 : 6.5; 
  const passivation = Math.exp(-k_pass * state.cuDepositedG);

  // Reaction rate in moles/second
  const rate = rateK * cellPotential * cuConc * passivation;
  const molesThisTick = rate * deltaSec;

  const cu2PlusMoles = state.cupricConc * SOLUTION_VOL_L;
  const metalMoles     = (state.metalMassG - state.metalConsumedG) / metal.molarMass;
  const limiting       = Math.min(cu2PlusMoles, metalMoles);

  if (limiting <= molesThisTick || limiting <= 1e-4 || (rate < 1e-6 && state.cuDepositedG > 0.05)) {
    return completeRedox({
      ...state,
      cellPotential: 0.0,
      equilibriumReached: true,
    }, metal);
  }

  const newCu2Plus     = Math.max(0, cu2PlusMoles - molesThisTick);
  const newCupricConc  = newCu2Plus / SOLUTION_VOL_L;
  const cuDepositedNew = state.cuDepositedG + molesThisTick * 63.55;
  const metalConsumed  = state.metalConsumedG + molesThisTick * metal.molarMass;
  const newMetalConc   = mConc + (molesThisTick / SOLUTION_VOL_L);

  const initConc       = state._cuConc;
  const newObs: ObservationEvent[] = [];
  if (state.cupricConc > initConc * 0.75 && newCupricConc <= initConc * 0.75) {
    newObs.push(mkObs("deposition", `25% of Cu²⁺ consumed — reddish-brown copper deposits visible on ${metal.name} surface.`, "info"));
  }
  if (state.cupricConc > initConc * 0.50 && newCupricConc <= initConc * 0.50) {
    newObs.push(mkObs("deposition", `50% consumed — solution turning noticeably paler blue. Cu deposit thickening.`, "info"));
  }
  if (state.cupricConc > initConc * 0.25 && newCupricConc <= initConc * 0.25) {
    newObs.push(mkObs("deposition",
      `75% consumed — solution nearly colourless. ${cuDepositedNew.toFixed(3)} g Cu deposited so far. ${
        metal.id === "magnesium" ? "Vigorous reaction has slowed as Cu²⁺ depletes." :
        metal.id === "zinc"      ? "Steady deposition continues." :
        metal.id === "lead"      ? "Slow but steady — Pb has the smallest driving force of active metals." : ""
      }`,
      "success",
    ));
  }

  return {
    ...state,
    cupricConc:      newCupricConc,
    cuDepositedG:    cuDepositedNew,
    metalConsumedG:  metalConsumed,
    metalConc:       newMetalConc,
    cellPotential:   cellPotential + 0.02 * state.experimentalError,
    observations: newObs.length ? [...newObs, ...state.observations] : state.observations,
  };
}

function completeRedox(state: RedoxDisplacementState, metal: MetalProfile): RedoxDisplacementState {
  const cuTotal  = (CUPRIC_INITIAL - state.cupricConc) * SOLUTION_VOL_L * 63.55;
  const cellPotential = 0.34 - metal.stdPotential;

  const objectives = state.objectives.map((o) =>
    o.id === "full-reaction" ? { ...o, completed: true } : o,
  );
  const steps = state.steps.map((s) =>
    s.id === "observe" ? { ...s, completed: true } : s,
  );

  return {
    ...state,
    status:     "completed",
    cupricConc: Math.max(0, state.cupricConc),
    steps,
    objectives,
    result: {
      completedAt: Date.now(),
      success: true,
      score: 100,
      summary:
        `${metal.name} displaced Cu²⁺ from solution. ` +
        `${cuTotal.toFixed(3)} g Cu deposited. Cell potential E°_cell = ${cellPotential.toFixed(2)} V.`,
      explanation:
        metal.observation + "\n\n" +
        `Oxidation (at metal): ${metal.halfEquation}\n` +
        `Reduction (in soln):  Cu²⁺ + 2e⁻ → Cu   E° = +0.34 V\n\n` +
        `Cell potential: E°_cell = E°_cathode − E°_anode = 0.34 − (${metal.stdPotential.toFixed(2)}) = ${cellPotential.toFixed(2)} V\n` +
        "A positive E°_cell confirms the reaction is spontaneous (ΔG = −nFE°_cell < 0).",
    },
    observations: [
      mkObs("reaction-complete",
        `Reaction complete — ${cuTotal.toFixed(2)} g copper deposited. E°_cell = ${cellPotential.toFixed(2)} V.`,
        "success"),
      ...state.observations,
    ],
  };
}

export function resetRedox(
  mode: RedoxDisplacementState["mode"],
  simParams?: import("./sim-bridge").RedoxSimParams,
): RedoxDisplacementState {
  return initialRedoxState(mode, simParams);
}
