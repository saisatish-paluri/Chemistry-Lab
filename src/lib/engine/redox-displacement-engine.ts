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

const CUPRIC_INITIAL    = 0.5;    // mol/L
const SOLUTION_VOL_L    = 0.100;  // 100 mL
const METAL_MASS_G      = 5.0;    // grams placed in solution
const TICK_RATE         = 0.010;  // fraction of available Cu²⁺ moles reacted per second

export const CUPRIC_INITIAL_CONC = CUPRIC_INITIAL;

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

export function initialRedoxState(mode: RedoxDisplacementState["mode"]): RedoxDisplacementState {
  return {
    mode, status: "idle",
    selectedMetal:    null,
    metalMassG:       0,
    cupricConc:       CUPRIC_INITIAL,
    solutionVolumeMl: 100,
    cuDepositedG:     0,
    metalConsumedG:   0,
    reactionOccurs:   false,
    steps:      INITIAL_STEPS.map((s) => ({ ...s })),
    objectives: INITIAL_OBJECTIVES.map((o) => ({ ...o })),
    observations: [], result: null, startedAt: null,
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

export function addMetalToSolution(state: RedoxDisplacementState): RedoxDisplacementState {
  if (!state.selectedMetal)      return state;
  if (state.status === "running" || state.status === "completed") return state;
  const metal    = METALS[state.selectedMetal];
  const occurs   = metal.displacesCu;
  const newStatus = occurs ? "running" : "completed";

  const objectives = state.objectives.map((o) => {
    if (o.id === "active-metal"   && occurs)  return { ...o, completed: true };
    if (o.id === "inactive-metal" && !occurs) return { ...o, completed: true };
    return o;
  });
  const steps = state.steps.map((s) =>
    s.id === "add-metal" ? { ...s, completed: true } : s,
  );

  const result = !occurs ? {
    completedAt: Date.now(),
    success: true,
    score: 80,
    summary: `No reaction — ${metal.name} is less reactive than copper.`,
    explanation:
      metal.observation + "\n\n" +
      "In the electrochemical series, only metals with a more negative standard reduction potential " +
      `(E° < +0.34 V) can displace Cu²⁺. ${metal.name} has E° = ${metal.stdPotential.toFixed(2)} V.`,
  } : null;

  return {
    ...state,
    status:         newStatus,
    metalMassG:     METAL_MASS_G,
    reactionOccurs: occurs,
    startedAt:      occurs ? Date.now() : state.startedAt,
    steps,
    objectives,
    result,
    observations: [
      mkObs(
        occurs ? "deposition" : "no-reaction",
        occurs
          ? `${metal.name} rod placed in CuSO₄ — ${metal.observation}`
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

  const cu2PlusMoles   = state.cupricConc * SOLUTION_VOL_L;  // mol in solution
  const metalMoles     = (state.metalMassG - state.metalConsumedG) / metal.molarMass;

  // Stoichiometry: 1 mol metal ⇌ 1 mol Cu²⁺ (simplified for all metals here)
  const limiting       = Math.min(cu2PlusMoles, metalMoles);
  if (limiting <= 0.0001) {
    // Complete
    return completeRedox(state, metal);
  }

  const reacted        = TICK_RATE * limiting * deltaSec;
  const newCu2Plus     = Math.max(0, cu2PlusMoles - reacted);
  const newCupricConc  = newCu2Plus / SOLUTION_VOL_L;
  const cuDepositedNew = state.cuDepositedG + reacted * 63.55; // g
  const metalConsumed  = state.metalConsumedG + reacted * metal.molarMass;

  const newObs: ObservationEvent[] = [];
  if (state.cupricConc > 0.375 && newCupricConc <= 0.375) {
    newObs.push(mkObs("deposition", "25% of Cu²⁺ consumed — copper deposits clearly visible on metal surface.", "info"));
  }
  if (state.cupricConc > 0.25 && newCupricConc <= 0.25) {
    newObs.push(mkObs("deposition", "50% consumed — solution turning noticeably paler blue.", "info"));
  }
  if (state.cupricConc > 0.125 && newCupricConc <= 0.125) {
    newObs.push(mkObs("deposition", "75% consumed — solution nearly colourless, thick copper deposits on rod.", "success"));
  }

  if (newCupricConc <= 0.01) {
    return completeRedox({ ...state, cupricConc: newCupricConc, cuDepositedG: cuDepositedNew, metalConsumedG: metalConsumed }, metal);
  }

  return {
    ...state,
    cupricConc:      newCupricConc,
    cuDepositedG:    cuDepositedNew,
    metalConsumedG:  metalConsumed,
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

export function resetRedox(mode: RedoxDisplacementState["mode"]): RedoxDisplacementState {
  return initialRedoxState(mode);
}
