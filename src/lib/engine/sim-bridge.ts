/**
 * Simulation Bridge
 *
 * Extracts scientifically-derived parameters from a SimulationSession for
 * each experiment domain. Engines remain pure functions — stores call these
 * helpers before initialising engine state to inject session-specific values
 * (rolled reagent concentrations, apparatus biases, environment conditions,
 * unknown samples) instead of hardcoded constants.
 *
 * All extractor functions are side-effect-free and handle missing/null
 * session data gracefully by returning scientifically sensible defaults.
 */

import type { SimulationSession, ApparatusCondition } from "@/lib/simulation/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/** Apparauts condition additive noise magnitude (0 if clean-dry). */
function apparatusNoise(cond: ApparatusCondition | undefined): number {
  return cond ? Math.abs(cond.additiveBias) : 0;
}

/** True for sessions with variance enabled (used for ±% rolling). */
function withVariance(session: SimulationSession, pct: number): number {
  if (!session.enableVariance) return 0;
  // Deterministic per-session jitter based on sessionId hash
  const h = [...session.sessionId].reduce((a, c) => a * 31 + c.charCodeAt(0), 0);
  return (((h % 1000) / 1000) * 2 - 1) * pct;
}

// ─── Titration ────────────────────────────────────────────────────────────────

export interface TitrationSimParams {
  /** Effective concentration of analyte (mol/L). */
  acidConc: number;
  /** Effective concentration of titrant (mol/L). */
  baseConc: number;
  /** Volume of acid in the flask (mL) — 25 mL standard pipette. */
  acidVolMl: number;
  /** True acid concentration for % error reporting. */
  trueAcidConc: number;
  /** ±mL endpoint detection noise from burette apparatus condition. */
  endpointNoiseMl: number;
  acidType: "strong" | "weak";
  baseType: "strong" | "weak";
  acidName: "HCl" | "CH3COOH";
  baseName: "NaOH" | "NH3";
}

export function getTitrationSimParams(session: SimulationSession): TitrationSimParams {
  const acid = session.reagents["hcl-0.1"] || session.reagents["ch3cooh-0.1"];
  const base = session.reagents["naoh-0.1"] || session.reagents["nh3-0.1"];
  const burette = session.apparatus["burette"];

  const acidConc = acid?.effectiveConc ?? 0.100;
  const baseConc = base?.effectiveConc ?? 0.100;

  // Endpoint noise: burette additive bias ×0.4 + 0.05 mL base noise
  const endpointNoiseMl = clamp(apparatusNoise(burette) * 0.4 + 0.05, 0.02, 0.50);

  const isWeakAcid = "ch3cooh-0.1" in session.reagents;
  const isWeakBase = "nh3-0.1" in session.reagents;

  return {
    acidConc,
    baseConc,
    acidVolMl: 25.0,
    trueAcidConc: acidConc,
    endpointNoiseMl,
    acidType: isWeakAcid ? "weak" : "strong",
    baseType: isWeakBase ? "weak" : "strong",
    acidName: isWeakAcid ? "CH3COOH" : "HCl",
    baseName: isWeakBase ? "NH3" : "NaOH",
  };
}

// ─── Calorimetry ─────────────────────────────────────────────────────────────

export interface CalorimetrySimParams {
  /** Effective HCl concentration (mol/L). */
  hclConc: number;
  /** Effective NaOH concentration (mol/L). */
  naohConc: number;
  /** Ambient lab temperature used as starting temperature (°C). */
  initialTempC: number;
  /**
   * Heat-loss probability (0–1). Higher in hot/humid environments.
   * Applied at each addition as a random deduction from ΔT.
   */
  heatLossProb: number;
  /** Max fractional ΔT loss per addition when heat loss occurs. */
  heatLossMagnitude: number;
}

export function getCalorimetrySimParams(session: SimulationSession): CalorimetrySimParams {
  const acid = session.reagents["hcl-1.0"];
  const base = session.reagents["naoh-1.0"];
  const { temperatureC, humidityPct } = session.environment;

  const hclConc  = acid?.effectiveConc ?? 1.0;
  const naohConc = base?.effectiveConc ?? 1.0;

  // Warmer + more humid → higher heat loss probability
  const heatLossProb = clamp(0.25 + (temperatureC - 20) * 0.015 + (humidityPct - 50) * 0.003, 0.10, 0.60);
  const heatLossMagnitude = session.difficulty === "advanced" ? 0.12 : session.difficulty === "intermediate" ? 0.07 : 0.03;

  return {
    hclConc,
    naohConc,
    initialTempC: clamp(temperatureC, 15, 30),
    heatLossProb,
    heatLossMagnitude,
  };
}

// ─── Gas Laws ─────────────────────────────────────────────────────────────────

export interface GasLawsSimParams {
  /** Lab temperature (K) — used as reference for Charles's Law (T fixed). */
  refTempK: number;
  /** Lab pressure (atm) — used as reference for Boyle's Law (P₀). */
  refPressureAtm: number;
  /** Moles of gas sealed in the syringe. */
  nMoles: number;
}

export function getGasLawsSimParams(session: SimulationSession): GasLawsSimParams {
  const { temperatureC, pressureAtm } = session.environment;
  const refTempK = clamp(temperatureC + 273.15, 285, 305);
  const refPressureAtm = clamp(pressureAtm, 0.95, 1.05);
  // nMoles: base 0.2 mol ± up to 5% jitter
  const jitter = withVariance(session, 0.05);
  const nMoles = clamp(0.2 * (1 + jitter), 0.17, 0.23);

  return { refTempK, refPressureAtm, nMoles };
}

// ─── Water Hardness ───────────────────────────────────────────────────────────

export interface WaterHardnessSimParams {
  /** Effective EDTA concentration (mol/L). */
  edtaConc: number;
  /** True water hardness of the sample (mg/L as CaCO₃). */
  trueHardnessMgL: number;
  /** EDTA volume at equivalence endpoint (mL) — derived from true hardness. */
  endpointMl: number;
  /** Sample volume (mL) — 100 mL standard. */
  sampleVolMl: number;
  /**
   * Gaussian noise offset (mL) on first-trial endpoint detection.
   * Simulates the real indicator transition zone (wine-red → blue is not
   * an instantaneous sharp change). σ = 0.4 mL, clamped ±1.2 mL.
   */
  endpointNoiseMl: number;
}

export function getWaterHardnessSimParams(session: SimulationSession): WaterHardnessSimParams {
  const edtaReagent = session.reagents["edta-0.01"];
  const edtaConc    = edtaReagent?.effectiveConc ?? 0.01;
  const sampleVolMl = 100;
  const M_CaCO3     = 100.09;

  let trueHardnessMgL: number;

  // If session has a rolled unknown water sample, use its hardness
  if (session.unknownSample?.type === "water") {
    trueHardnessMgL = session.unknownSample.hardnessMgL;
  } else {
    // Roll hardness: 50–350 mg/L, seeded by session for reproducibility
    const seed = [...session.sessionId].reduce((a, c) => a * 17 + c.charCodeAt(0), 0);
    const RANGES = [60, 110, 200, 280, 340];
    trueHardnessMgL = RANGES[Math.abs(seed) % RANGES.length] +
      (session.enableVariance ? ((seed % 21) - 10) : 0);
  }

  // V_EDTA = (hardness_mgL × V_sample_L) / (M_CaCO3 × c_EDTA × 1000)
  const endpointMl = (trueHardnessMgL * (sampleVolMl / 1000)) /
    (M_CaCO3 * edtaConc);

  // Per-session Gaussian noise on endpoint (σ=0.4 mL) — Box-Muller
  let endpointNoiseMl = 0;
  if (session.enableVariance) {
    const h1 = [...session.sessionId].reduce((a, c) => a * 37 + c.charCodeAt(0), 1);
    const h2 = [...session.sessionId].reduce((a, c) => a * 53 + c.charCodeAt(0), 7);
    const u1 = Math.abs((h1 % 10000) / 10000) || 0.5;
    const u2 = Math.abs((h2 % 10000) / 10000) || 0.5;
    const gauss = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    endpointNoiseMl = Math.max(-1.2, Math.min(1.2, gauss * 0.4));
  }

  return {
    edtaConc,
    trueHardnessMgL: Math.round(trueHardnessMgL * 10) / 10,
    endpointMl:      Math.round(endpointMl * 10) / 10,
    sampleVolMl,
    endpointNoiseMl,
  };
}

// ─── Chemical Equilibrium ────────────────────────────────────────────────────

export interface EquilibriumSimParams {
  /** Starting concentration of Fe³⁺ (mol/L). */
  initConcFe3: number;
  /** Starting concentration of SCN⁻ (mol/L). */
  initConcSCN: number;
  /** Temperature step for heat/cool perturbations (K). */
  tempPerturbK: number;
  /** Reactant addition step for add-fe3/add-scn perturbations (mol/L). */
  addConc: number;
}

export function getEquilibriumSimParams(session: SimulationSession): EquilibriumSimParams {
  const v = withVariance(session, 0.10); // ±10% on starting concs
  const initConc = clamp(0.050 * (1 + v), 0.030, 0.070);

  // Harder sessions: larger temperature swings to stress the system more
  const tempPerturbK  = session.difficulty === "advanced" ? 25 : session.difficulty === "intermediate" ? 20 : 15;
  const addConc       = session.difficulty === "advanced" ? 0.025 : 0.020;

  return {
    initConcFe3:  initConc,
    initConcSCN:  clamp(0.050 * (1 - v * 0.5), 0.030, 0.070),
    tempPerturbK,
    addConc,
  };
}

// ─── Reaction Kinetics ────────────────────────────────────────────────────────

export interface ReactionRateSimParams {
  /** Initial temperature preset from lab environment (°C). */
  initialTempC: number;
  /** Environment rate multiplier (Arrhenius, relative to 25 °C). */
  envRateMultiplier: number;
  /** Base rate constant at reference conditions (%/s). */
  baseRatePctPerSec: number;
  /**
   * Catalyst rate enhancement factor (≥1.0).
   * Applied multiplicatively when the user adds a catalyst.
   * Session-rolled: beginner=3×, intermediate=4×, advanced=5–6×.
   */
  catalystFactor: number;
}

export function getReactionRateSimParams(session: SimulationSession): ReactionRateSimParams {
  const { temperatureC, effects } = session.environment;
  const jitter = withVariance(session, 0.08);
  const baseRatePctPerSec = clamp(1.5 * (1 + jitter), 0.9, 2.2);

  // Catalyst factor: harder sessions get more dramatic effect to stress kinetics understanding
  const catalystBase = session.difficulty === "advanced" ? 5.5
    : session.difficulty === "intermediate" ? 4.0 : 3.0;
  const catalystJitter = withVariance(session, 0.15);
  const catalystFactor = clamp(catalystBase * (1 + catalystJitter), 2.0, 7.0);

  return {
    initialTempC:     clamp(temperatureC, 15, 30),
    envRateMultiplier: effects.rateMultiplier,
    baseRatePctPerSec,
    catalystFactor,
  };
}

// ─── Electrolysis ─────────────────────────────────────────────────────────────

export interface ElectrolysisSimParams {
  /** Conductivity scale factor from apparatus condition (0.8–1.0). */
  conductivityScale: number;
  /** Measurement noise magnitude for current readings. */
  currentNoise: number;
  /**
   * Additional overpotential offset (V) applied on top of thermodynamic minimum.
   * Models electrode surface roughness, oxide layers, and poor contact.
   * Ranges 0.0–0.3 V depending on electrode condition.
   */
  overpotentialOffset: number;
}

export function getElectrolysisSimParams(session: SimulationSession): ElectrolysisSimParams {
  const electrodes = session.apparatus["electrodes"];
  const conductivityScale = electrodes
    ? clamp(electrodes.biasMultiplier, 0.75, 1.05)
    : 1.0;

  const currentNoise = apparatusNoise(session.apparatus["ammeter"]);

  // Overpotential from electrode condition: dirty/corroded electrodes add up to 0.3 V
  const overpotentialOffset = electrodes
    ? clamp(Math.abs(electrodes.additiveBias) * 3.0, 0.0, 0.3)
    : 0.0;

  return { conductivityScale, currentNoise, overpotentialOffset };
}

// ─── Redox Displacement ───────────────────────────────────────────────────────

export interface RedoxSimParams {
  /** Effective CuSO₄ concentration (mol/L). */
  cuConc: number;
  /** Mass of metal rod used (g). */
  metalMassG: number;
  /** Reaction rate multiplier from environment temperature. */
  rateMultiplier: number;
}

export function getRedoxSimParams(session: SimulationSession): RedoxSimParams {
  const cuso4    = session.reagents["cuso4-0.5"];
  const cuConc   = cuso4?.effectiveConc ?? 0.5;

  const jitter   = withVariance(session, 0.06);
  const metalMassG = clamp(5.0 * (1 + jitter), 4.5, 5.5);

  return {
    cuConc,
    metalMassG,
    rateMultiplier: session.environment.effects.rateMultiplier,
  };
}

// ─── Flame Test ───────────────────────────────────────────────────────────────

export type FlameTestSampleId =
  | "lithium-chloride" | "sodium-chloride" | "potassium-chloride"
  | "barium-chloride"  | "copper-sulfate"  | "calcium-chloride"
  | "strontium-chloride";

export interface FlameTestSimParams {
  /**
   * If non-null, this sample is pre-selected as "unknown" and shown only
   * after the student has identified it. Otherwise all samples are available.
   */
  unknownSampleId: FlameTestSampleId | null;
  /** 0–1 probability that a contaminated loop gives an anomalous reading. */
  contaminationProbability: number;
}

const ALL_FLAME_SAMPLES: FlameTestSampleId[] = [
  "lithium-chloride", "sodium-chloride", "potassium-chloride",
  "barium-chloride",  "copper-sulfate",  "calcium-chloride",
  "strontium-chloride",
];

export function getFlameTestSimParams(session: SimulationSession): FlameTestSimParams {
  let unknownSampleId: FlameTestSampleId | null = null;

  if (session.unknownSample?.type === "metal") {
    // Map symbol → sample id
    const sym = session.unknownSample.symbol;
    const MAP: Record<string, FlameTestSampleId> = {
      Li: "lithium-chloride", Na: "sodium-chloride", K: "potassium-chloride",
      Ba: "barium-chloride",  Cu: "copper-sulfate",  Ca: "calcium-chloride",
      Sr: "strontium-chloride",
    };
    unknownSampleId = MAP[sym] ?? null;
  } else if (session.unknownSample?.type === "salt") {
    // Use cation
    const cation = session.unknownSample.cation;
    const MAP: Record<string, FlameTestSampleId> = {
      "Li+": "lithium-chloride", "Na+": "sodium-chloride",
      "K+": "potassium-chloride", "Ba2+": "barium-chloride",
      "Cu2+": "copper-sulfate", "Ca2+": "calcium-chloride",
      "Sr2+": "strontium-chloride",
    };
    unknownSampleId = MAP[cation] ?? null;
  }

  // If no unknown sample, roll one deterministically from session
  if (!unknownSampleId && session.enableVariance) {
    const seed = [...session.sessionId].reduce((a, c) => a * 13 + c.charCodeAt(0), 0);
    unknownSampleId = ALL_FLAME_SAMPLES[Math.abs(seed) % ALL_FLAME_SAMPLES.length];
  }

  // Contamination probability from loop apparatus condition
  const loop = session.apparatus["wire-loop"];
  const contaminationProbability = loop
    ? clamp(loop.severity === "major" ? 0.35 : loop.severity === "moderate" ? 0.20 : 0.08, 0, 0.4)
    : 0.08;

  return { unknownSampleId, contaminationProbability };
}

// ─── Solubility / Precipitation ──────────────────────────────────────────────

export interface SolubilitySimParams {
  /** Extra variability on precipitate formation (visual noise). */
  precipitateNoise: number;
}

export function getSolubilitySimParams(session: SimulationSession): SolubilitySimParams {
  const testTubes = session.apparatus["test-tubes"];
  const precipitateNoise = testTubes
    ? clamp(apparatusNoise(testTubes) * 0.1, 0, 0.15)
    : 0.02;
  return { precipitateNoise };
}

// ─── Functional Groups ────────────────────────────────────────────────────────

export type FunctionalGroupsCompoundId =
  | "ethanol" | "butanone" | "ethanoic-acid" | "benzaldehyde" | "cyclohexanol";

export interface FunctionalGroupsSimParams {
  /**
   * Id of the compound pre-selected as "unknown sample A".
   * If null the user can select any compound.
   */
  unknownCompoundId: FunctionalGroupsCompoundId | null;
}

const ALL_FG_COMPOUNDS: FunctionalGroupsCompoundId[] = [
  "ethanol", "butanone", "ethanoic-acid", "benzaldehyde", "cyclohexanol",
];

export function getFunctionalGroupsSimParams(session: SimulationSession): FunctionalGroupsSimParams {
  let unknownCompoundId: FunctionalGroupsCompoundId | null = null;

  if (session.unknownSample?.type === "solution") {
    const label = session.unknownSample.label.toLowerCase();
    for (const id of ALL_FG_COMPOUNDS) {
      if (label.includes(id.replace("-", " "))) {
        unknownCompoundId = id;
        break;
      }
    }
  }

  // Roll deterministically if still null and variance enabled
  if (!unknownCompoundId && session.enableVariance) {
    const seed = [...session.sessionId].reduce((a, c) => a * 19 + c.charCodeAt(0), 0);
    unknownCompoundId = ALL_FG_COMPOUNDS[Math.abs(seed) % ALL_FG_COMPOUNDS.length];
  }

  return { unknownCompoundId };
}

// ─── Gas Collection ───────────────────────────────────────────────────────────

export interface GasCollectionSimParams {
  /** Effective HCl concentration used (mol/L). */
  hclConc: number;
  /**
   * Fraction of generated gas actually collected (0.70–0.98).
   * Reduced by cracked/wet apparatus.
   */
  collectionEfficiency: number;
  /**
   * CO₂ molar volume corrected for lab T and P (mL/mol).
   * At 25 °C, 1 atm: ~24500. Higher T/lower P → larger.
   */
  co2MolarVolMl: number;
}

export function getGasCollectionSimParams(session: SimulationSession): GasCollectionSimParams {
  const hcl    = session.reagents["hcl-1.0"];
  const hclConc = hcl?.effectiveConc ?? 1.0;

  // Apparatus severity reduces collection efficiency
  const gasCollection = session.apparatus["gas-collection-tube"];
  const flask         = session.apparatus["flask"];
  const maxSeverity   = [gasCollection, flask]
    .filter(Boolean)
    .map((a) => (a!.severity === "major" ? 3 : a!.severity === "moderate" ? 2 : a!.severity === "minor" ? 1 : 0))
    .reduce((a, b) => (Math.max(a, b) as 0 | 1 | 2 | 3), 0 as 0 | 1 | 2 | 3);

  const collectionEfficiency = clamp(0.96 - maxSeverity * 0.07, 0.70, 0.98);

  // Correct molar volume for lab T and P (ideal gas: V ∝ T/P)
  const { temperatureC, pressureAtm } = session.environment;
  const co2MolarVolMl = Math.round(24500 * ((temperatureC + 273.15) / 298.15) / pressureAtm);

  return { hclConc, collectionEfficiency, co2MolarVolMl };
}

// ─── Separation Techniques ────────────────────────────────────────────────────

export interface SeparationSimParams {
  /** Fraction of solid recovered by filtration (0.78–0.97). */
  filtrationRecoveryPct: number;
  /** Fraction of dissolved solid recovered by evaporation/crystallisation. */
  evaporationRecoveryPct: number;
  /** Fraction of volatile liquid recovered by distillation. */
  distillationRecoveryPct: number;
  /**
   * Mass (g) of sand in the starting mixture — session-rolled 2.0–3.5 g.
   */
  sandMassG: number;
  /** Mass (g) of NaCl in the mixture — session-rolled 1.2–2.0 g. */
  saltMassG: number;
}

export function getSeparationSimParams(session: SimulationSession): SeparationSimParams {
  const { temperatureC, humidityPct } = session.environment;
  const filter    = session.apparatus["filter-paper"];
  const evapDish  = session.apparatus["evaporation-dish"];

  // Filtration: worse in high humidity (paper saturates faster), apparatus faults
  const filtHumidityPenalty = (humidityPct - 50) * 0.001;
  const filtApparatusPenalty = apparatusNoise(filter) * 0.02;
  const filtrationRecoveryPct = clamp(0.95 - filtHumidityPenalty - filtApparatusPenalty, 0.78, 0.97);

  // Evaporation: worse in high humidity; better at higher temp
  const evapHumidityPenalty  = (humidityPct - 50) * 0.002;
  const evapTempBonus        = (temperatureC - 20) * 0.003;
  const evapApparatusPenalty = apparatusNoise(evapDish) * 0.02;
  const evaporationRecoveryPct = clamp(0.90 + evapTempBonus - evapHumidityPenalty - evapApparatusPenalty, 0.78, 0.97);

  // Distillation: mainly limited by apparatus (condenser efficiency)
  const condenser = session.apparatus["condenser"];
  const distillationRecoveryPct = clamp(
    0.88 - apparatusNoise(condenser) * 0.03, 0.70, 0.94,
  );

  // Mass of components — session-rolled
  const v = withVariance(session, 0.15);
  const sandMassG = clamp(2.5 * (1 + v), 2.0, 3.5);
  const saltMassG = clamp(1.6 * (1 - v * 0.5), 1.2, 2.0);

  return {
    filtrationRecoveryPct:   Math.round(filtrationRecoveryPct * 1000) / 1000,
    evaporationRecoveryPct:  Math.round(evaporationRecoveryPct * 1000) / 1000,
    distillationRecoveryPct: Math.round(distillationRecoveryPct * 1000) / 1000,
    sandMassG:               Math.round(sandMassG * 100) / 100,
    saltMassG:               Math.round(saltMassG * 100) / 100,
  };
}
