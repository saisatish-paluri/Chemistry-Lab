/**
 * Gas Collection Engine
 *
 * Reaction: CaCO₃(s) + 2 HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g)
 * Gas is collected by upward displacement of air in an inverted cylinder.
 *
 * Molar masses: CaCO₃ = 100.09 g/mol, HCl = 36.46 g/mol
 * Molar volume of CO₂ at 25 °C, 1 atm ≈ 24,500 mL/mol
 */

import type {
  GasCollectionState,
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

export const CACO3_MOLAR_MASS  = 100.09;   // g/mol
export const HCL_CONC_DEFAULT  = 1.0;      // mol/L
export const CO2_MOLAR_VOL_ML  = 24500;    // mL/mol at 25 °C
export const COLLECTION_CAP_ML = 600;      // max collection volume
export const RATE_CONSTANT     = 0.012;    // fraction of limiting moles reacted per second

/** Stoichiometric moles of CO₂ for given reactant amounts. */
export function theoreticalCO2Moles(caco3G: number, hclMol: number): number {
  const caco3Mol = caco3G / CACO3_MOLAR_MASS;
  // 1 mol CaCO₃ : 2 mol HCl : 1 mol CO₂
  const limitingMol = Math.min(caco3Mol, hclMol / 2);
  return limitingMol;
}

export function co2MolToMl(moles: number): number {
  return moles * CO2_MOLAR_VOL_ML;
}

// ─── Initial state ────────────────────────────────────────────────────────────

const INITIAL_STEPS: StepDef[] = [
  { id: "add-chips",      instruction: "Add marble chips (CaCO₃) to the conical flask.",    completed: false },
  { id: "add-acid",       instruction: "Add hydrochloric acid (HCl) to start the reaction.", completed: false },
  { id: "observe-gas",    instruction: "Watch CO₂ collect in the inverted cylinder.",        completed: false },
  { id: "measure-volume", instruction: "Note the final volume of gas collected.",            completed: false },
  { id: "compare",        instruction: "Compare collected volume to the theoretical value.", completed: false },
];

const INITIAL_OBJECTIVES: ExperimentObjective[] = [
  { id: "add-reactants",  description: "Add both CaCO₃ and HCl",                           completed: false },
  { id: "collect-100ml",  description: "Collect at least 100 mL of CO₂",                   completed: false },
  { id: "near-theory",    description: "Collected volume within 10% of theoretical",        completed: false },
];

export function initialGasCollectionState(mode: GasCollectionState["mode"]): GasCollectionState {
  return {
    mode, status: "idle",
    caco3Grams:     0,
    hclVolumeMl:    0,
    hclConc:        HCL_CONC_DEFAULT,
    caco3MolesLeft: 0,
    hclMolesLeft:   0,
    co2CollectedMl: 0,
    theoreticalCo2Ml: 0,
    reactionComplete: false,
    steps:      INITIAL_STEPS.map((s) => ({ ...s })),
    objectives: INITIAL_OBJECTIVES.map((o) => ({ ...o })),
    observations: [], result: null, startedAt: null,
  };
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export function addMarbleChips(state: GasCollectionState, grams: number): GasCollectionState {
  if (state.status === "completed" || state.status === "failed") return state;
  const addGrams = Math.max(0.5, Math.min(grams, 10));
  const newGrams = state.caco3Grams + addGrams;
  const hclMol   = (state.hclVolumeMl / 1000) * state.hclConc;
  const theoryMl = co2MolToMl(theoreticalCO2Moles(newGrams, hclMol));
  const steps    = state.steps.map((s) => s.id === "add-chips" ? { ...s, completed: true } : s);

  return {
    ...state,
    caco3Grams:  newGrams,
    caco3MolesLeft: newGrams / CACO3_MOLAR_MASS - ((state.caco3Grams / CACO3_MOLAR_MASS) - state.caco3MolesLeft),
    theoreticalCo2Ml: theoryMl,
    steps,
    observations: [
      mkObs("reaction-start",
        `Added ${addGrams.toFixed(1)} g CaCO₃ (marble chips) — total ${newGrams.toFixed(1)} g (${(newGrams / CACO3_MOLAR_MASS).toFixed(4)} mol).`,
        "info"),
      ...state.observations,
    ],
  };
}

export function addHCl(state: GasCollectionState, volumeMl: number): GasCollectionState {
  if (state.status === "completed" || state.status === "failed") return state;
  const addMl  = Math.max(10, Math.min(volumeMl, 100));
  const newMl  = state.hclVolumeMl + addMl;
  const hclMol = (newMl / 1000) * state.hclConc;
  const theoryMl = co2MolToMl(theoreticalCO2Moles(state.caco3Grams, hclMol));

  const newStatus = state.caco3Grams > 0 ? "running" : state.status;
  const steps     = state.steps.map((s) =>
    s.id === "add-acid" ? { ...s, completed: true } : s,
  );
  const objectives = state.objectives.map((o) =>
    o.id === "add-reactants" && state.caco3Grams > 0 ? { ...o, completed: true } : o,
  );

  return {
    ...state,
    hclVolumeMl: newMl,
    hclMolesLeft: hclMol - (state.hclMolesLeft > 0 ? (state.hclVolumeMl / 1000 * state.hclConc) - state.hclMolesLeft : 0),
    theoreticalCo2Ml: theoryMl,
    status: newStatus,
    startedAt: state.startedAt ?? (newStatus === "running" ? Date.now() : null),
    steps,
    objectives,
    observations: [
      mkObs("reaction-start",
        `Added ${addMl} mL of ${state.hclConc.toFixed(1)} M HCl — ` +
        `effervescence begins! Theoretical CO₂ = ${theoryMl.toFixed(0)} mL.`,
        "success"),
      ...state.observations,
    ],
  };
}

export function tickGasCollection(state: GasCollectionState, deltaSec: number): GasCollectionState {
  if (state.status !== "running" || state.reactionComplete) return state;
  if (state.caco3Grams <= 0 || state.hclVolumeMl <= 0) return state;

  const caco3Total = state.caco3Grams / CACO3_MOLAR_MASS;
  const hclTotal   = (state.hclVolumeMl / 1000) * state.hclConc;

  // Moles already reacted (from CO₂ collected)
  const co2Reacted = state.co2CollectedMl / CO2_MOLAR_VOL_ML;
  const caco3Reacted = co2Reacted;
  const hclReacted   = co2Reacted * 2;

  const caco3Left = Math.max(0, caco3Total - caco3Reacted);
  const hclLeft   = Math.max(0, hclTotal   - hclReacted);
  const limiting  = Math.min(caco3Left, hclLeft / 2);

  if (limiting <= 1e-9) {
    // Reaction complete
    const finalMl  = state.co2CollectedMl;
    const theorMl  = state.theoreticalCo2Ml;
    const pctYield = theorMl > 0 ? (finalMl / theorMl) * 100 : 0;
    const within10 = Math.abs(finalMl - theorMl) / Math.max(theorMl, 1) < 0.10;

    const objectives = state.objectives.map((o) => {
      if (o.id === "collect-100ml" && finalMl >= 100) return { ...o, completed: true };
      if (o.id === "near-theory"   && within10)       return { ...o, completed: true };
      return o;
    });
    const steps = state.steps.map((s) =>
      s.id === "observe-gas" || s.id === "measure-volume" || s.id === "compare"
        ? { ...s, completed: true }
        : s,
    );

    const score = Math.round(
      (finalMl >= 100 ? 40 : (finalMl / 100) * 40) +
      (within10 ? 40 : Math.max(0, 40 - Math.abs(finalMl - theorMl) / theorMl * 100)) +
      20,
    );

    return {
      ...state,
      status: "completed",
      reactionComplete: true,
      co2CollectedMl: finalMl,
      caco3MolesLeft: caco3Left,
      hclMolesLeft: hclLeft,
      steps,
      objectives,
      result: {
        completedAt: Date.now(),
        success: true,
        score: Math.min(100, score),
        summary:
          `Collected ${finalMl.toFixed(0)} mL CO₂ out of theoretical ${theorMl.toFixed(0)} mL ` +
          `(yield: ${pctYield.toFixed(1)}%).`,
        explanation:
          "CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂ — the limiting reagent determines the maximum gas yield.\n" +
          "At 25 °C, 1 mole of CO₂ occupies 24.5 L (from PV = nRT).\n" +
          "Yield < 100% is expected due to gas solubility in water and incomplete collection.",
      },
      observations: [
        mkObs("reaction-complete",
          `Reaction complete — ${finalMl.toFixed(0)} mL CO₂ collected (${pctYield.toFixed(1)}% yield).`,
          "success"),
        ...state.observations,
      ],
    };
  }

  // Rate: fraction of limiting reacted per second
  const molesThisTick = RATE_CONSTANT * limiting * deltaSec;
  const co2ThisMl     = co2MolToMl(molesThisTick);
  const newMl         = Math.min(COLLECTION_CAP_ML, state.co2CollectedMl + co2ThisMl);

  const newObs: ObservationEvent[] = [];
  if (state.co2CollectedMl < 50 && newMl >= 50) {
    newObs.push(mkObs("gas-evolution", "50 mL CO₂ collected — reaction progressing well.", "info"));
  }
  if (state.co2CollectedMl < 100 && newMl >= 100) {
    newObs.push(mkObs("gas-evolution", "100 mL collected! Measure and compare to theoretical.", "success"));
  }

  const steps = state.steps.map((s) =>
    s.id === "observe-gas" ? { ...s, completed: true } : s,
  );

  return {
    ...state,
    co2CollectedMl: newMl,
    caco3MolesLeft: caco3Left - molesThisTick,
    hclMolesLeft: hclLeft - molesThisTick * 2,
    steps,
    observations: newObs.length ? [...newObs, ...state.observations] : state.observations,
  };
}

export function resetGasCollection(mode: GasCollectionState["mode"]): GasCollectionState {
  return initialGasCollectionState(mode);
}
