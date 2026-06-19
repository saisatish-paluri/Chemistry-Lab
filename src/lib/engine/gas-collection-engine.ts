/**
 * Gas Collection Engine
 *
 * Reaction: CaCO₃(s) + 2 HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g)
 * Gas is collected by upward displacement of air in an inverted cylinder.
 *
 * Molar masses: CaCO₃ = 100.09 g/mol, HCl = 36.46 g/mol
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
export const COLLECTION_CAP_ML = 600;      // max collection volume

/** Stoichiometric moles of CO₂ for given reactant amounts. */
export function theoreticalCO2Moles(caco3G: number, hclMol: number): number {
  const caco3Mol = caco3G / CACO3_MOLAR_MASS;
  // 1 mol CaCO₃ : 2 mol HCl : 1 mol CO₂
  const limitingMol = Math.min(caco3Mol, hclMol / 2);
  return limitingMol;
}

/** Helper: Calculate vapor pressure of water, net CO2 pressure, and dry gas volume */
export function calculateDynamicGasProps(moles: number, tempC: number, totalP: number) {
  const T_K = tempC + 273.15;
  // Antoine equation for water vapor pressure in atm (mmHg / 760)
  const pWater = Math.exp(20.386 - 5132.0 / T_K) / 760;
  const pCO2 = Math.max(0.01, totalP - pWater);
  const R = 0.08206; // L*atm/(mol*K)
  const volumeMl = (moles * R * T_K / pCO2) * 1000;
  const purityPct = (pCO2 / totalP) * 100;
  return { volumeMl, purityPct, pWater, pCO2 };
}

// ─── Steps & objectives ────────────────────────────────────────────────────────

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

    // Overhaul defaults
    temperature:       25,
    pressure:          1.0,
    leakRate:          0,
    gasPurity:         100,
    collectionEfficiency: 100,
    experimentalError: (Math.random() - 0.5) * 2, // rolled once per session
    bubbleRate:        0,
  };
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export function updateGasCollectionParameters(
  state: GasCollectionState,
  changes: Partial<Pick<GasCollectionState, "temperature" | "pressure" | "leakRate">>,
): GasCollectionState {
  if (state.status !== "idle" && state.status !== "setup") return state;
  const next = {
    ...state,
    temperature: changes.temperature !== undefined ? changes.temperature : state.temperature,
    pressure: changes.pressure !== undefined ? changes.pressure : state.pressure,
    leakRate: changes.leakRate !== undefined ? changes.leakRate : state.leakRate,
  };
  return recalculateGasCollectionTheory(next);
}

function recalculateGasCollectionTheory(state: GasCollectionState): GasCollectionState {
  const hclMol = (state.hclVolumeMl / 1000) * state.hclConc;
  const theoryMoles = theoreticalCO2Moles(state.caco3Grams, hclMol);
  const props = calculateDynamicGasProps(theoryMoles, state.temperature, state.pressure);
  return {
    ...state,
    theoreticalCo2Ml: props.volumeMl,
    gasPurity: props.purityPct,
  };
}

export function addMarbleChips(state: GasCollectionState, grams: number): GasCollectionState {
  if (state.status === "completed" || state.status === "failed") return state;
  const addGrams = Math.max(0.5, Math.min(grams, 10));
  const newGrams = state.caco3Grams + addGrams;
  const steps    = state.steps.map((s) => s.id === "add-chips" ? { ...s, completed: true } : s);

  const preRecalc = {
    ...state,
    caco3Grams:  newGrams,
    caco3MolesLeft: newGrams / CACO3_MOLAR_MASS - ((state.caco3Grams / CACO3_MOLAR_MASS) - state.caco3MolesLeft),
    steps,
  };

  const next = recalculateGasCollectionTheory(preRecalc);
  return {
    ...next,
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

  const newStatus = state.caco3Grams > 0 ? "running" : state.status;
  const steps     = state.steps.map((s) =>
    s.id === "add-acid" ? { ...s, completed: true } : s,
  );
  const objectives = state.objectives.map((o) =>
    o.id === "add-reactants" && state.caco3Grams > 0 ? { ...o, completed: true } : o,
  );

  const preRecalc = {
    ...state,
    hclVolumeMl: newMl,
    hclMolesLeft: hclMol - (state.hclMolesLeft > 0 ? (state.hclVolumeMl / 1000 * state.hclConc) - state.hclMolesLeft : 0),
    status: newStatus,
    startedAt: state.startedAt ?? (newStatus === "running" ? Date.now() : null),
    steps,
    objectives,
  };

  const next = recalculateGasCollectionTheory(preRecalc);
  return {
    ...next,
    observations: [
      mkObs("reaction-start",
        `Added ${addMl} mL of ${state.hclConc.toFixed(1)} M HCl — ` +
        `effervescence begins! Theoretical dry/wet CO₂ = ${next.theoreticalCo2Ml.toFixed(0)} mL.`,
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

  // Track consumed moles from the starting state parameters
  const caco3ReactedTotal = Math.max(0, caco3Total - state.caco3MolesLeft);
  const hclReactedTotal   = Math.max(0, hclTotal - state.hclMolesLeft);

  const caco3Left = state.caco3MolesLeft;
  const hclLeft   = state.hclMolesLeft;
  const limiting  = Math.min(caco3Left, hclLeft / 2);

  const T_K = state.temperature + 273.15;
  const R = 0.08206;

  // Henry's Law Solubility of CO2 in water
  const Kh = 0.034 * Math.exp(2400 * (1.0 / T_K - 1.0 / 298.15)); // mol/(L*atm)
  const props = calculateDynamicGasProps(1.0, state.temperature, state.pressure); // get pCO2
  const maxDissolvedMoles = Kh * props.pCO2 * 0.05; // 50 mL effective water volume saturated along bubble path

  if (limiting <= 1e-6) {
    // Reaction complete
    const finalMl  = state.co2CollectedMl;
    const theorMl  = state.theoreticalCo2Ml;
    const pctYield = theorMl > 0 ? (finalMl / theorMl) * 100 : 0;
    const within10 = Math.abs(finalMl - theorMl) / Math.max(theorMl, 1) < 0.15;

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
      caco3MolesLeft: Math.max(0, caco3Left),
      hclMolesLeft: Math.max(0, hclLeft),
      steps,
      objectives,
      bubbleRate: 0,
      result: {
        completedAt: Date.now(),
        success: true,
        score: Math.min(100, score),
        summary:
          `Collected ${finalMl.toFixed(0)} mL wet gas out of theoretical ${theorMl.toFixed(0)} mL ` +
          `(observed yield: ${pctYield.toFixed(1)}%). Gas purity was ${state.gasPurity.toFixed(1)}%.`,
        explanation:
          "CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂ — the limiting reagent determines the gas yield.\n" +
          `At ${state.temperature}°C and ${state.pressure} atm, water vapor pressure is ${(props.pWater * 100).toFixed(1)}% of total pressure.\n` +
          `Henry's Law predicted ${(maxDissolvedMoles * 1000).toFixed(1)} mmol of CO₂ dissolved in the water trough, reducing collection.\n` +
          `Apparatus leak rate of ${state.leakRate}% further reduced final yields.`,
      },
      observations: [
        mkObs("reaction-complete",
          `Reaction complete — ${finalMl.toFixed(0)} mL gas collected. Collection efficiency: ${state.collectionEfficiency.toFixed(1)}%.`,
          "success"),
        ...state.observations,
      ],
    };
  }

  // Arrhenius-dependent rate constant: k(T) = A * exp(-Ea / RT)
  const A_rate = 0.012 * Math.exp(35000 / (8.314 * 298.15));
  const rateK = A_rate * Math.exp(-35000 / (8.314 * T_K)) * (1.0 + 0.05 * state.experimentalError);
  const molesThisTick = rateK * limiting * deltaSec;

  const nextCaco3Left = Math.max(0, caco3Left - molesThisTick);
  const nextHclLeft   = Math.max(0, hclLeft - molesThisTick * 2);

  // Moles of CO2 produced so far
  const totalCaco3Reacted = caco3Total - nextCaco3Left;
  
  // Apply solubility losses
  const netGasOutMoles = Math.max(0, totalCaco3Reacted - maxDissolvedMoles);

  // Apply leak rate
  const netCollectedMoles = netGasOutMoles * (1.0 - state.leakRate / 100);

  // Calculate volume using ideal gas law
  const gasProps = calculateDynamicGasProps(netCollectedMoles, state.temperature, state.pressure);

  // Uncertainty noise in volume reading
  const volumeNoise = (Math.random() - 0.5) * 0.4 * deltaSec;
  const newMl = Math.min(COLLECTION_CAP_ML, Math.max(0, gasProps.volumeMl + volumeNoise));

  // Visual bubble rate linked directly to instantaneous moles reacting
  const bubbleRate = Math.max(0, Math.min(10, molesThisTick * 80000 * (1.0 - state.leakRate / 100)));

  // Calculate dynamic parameters
  const currentEfficiency = totalCaco3Reacted > 0 ? (netCollectedMoles / totalCaco3Reacted) * 100 : 100;

  const newObs: ObservationEvent[] = [];
  if (state.co2CollectedMl < 50 && newMl >= 50) {
    newObs.push(mkObs("gas-evolution", `50 mL gas collected. Current purity: ${gasProps.purityPct.toFixed(1)}% (vapor pressure: ${(gasProps.pWater * 760).toFixed(0)} mmHg).`, "info"));
  }
  if (state.co2CollectedMl < 100 && newMl >= 100) {
    newObs.push(mkObs("gas-evolution", `100 mL collected! In trough, ${(maxDissolvedMoles * 1000).toFixed(1)} mmol CO₂ has dissolved.`, "success"));
  }

  const steps = state.steps.map((s) =>
    s.id === "observe-gas" ? { ...s, completed: true } : s,
  );

  return {
    ...state,
    co2CollectedMl: newMl,
    caco3MolesLeft: nextCaco3Left,
    hclMolesLeft: nextHclLeft,
    steps,
    gasPurity: gasProps.purityPct,
    collectionEfficiency: currentEfficiency,
    bubbleRate,
    observations: newObs.length ? [...newObs, ...state.observations] : state.observations,
  };
}

export function resetGasCollection(mode: GasCollectionState["mode"]): GasCollectionState {
  return initialGasCollectionState(mode);
}
