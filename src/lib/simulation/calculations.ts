/**
 * Chemistry Calculation Engine
 *
 * A reusable, model-based framework for all chemistry calculations.
 * Every function derives outputs from scientific models — no hardcoded
 * lookup tables or fixed outcomes. Designed to be consumed by individual
 * experiment engines once integrated.
 *
 * Constants follow IUPAC / NIST standards.
 */

import type {
  StoichiometryInput,
  StoichiometryResult,
  TitrationCalcResult,
  CalorimetryCalcResult,
  GasLawCalcResult,
  GasLawVariable,
  EquilibriumCalcResult,
  KineticsCalcResult,
  ElectrochemCalcResult,
} from "./types";

// ─── Physical Constants ───────────────────────────────────────────────────────

export const GAS_R        = 0.08206;  // L·atm / (mol·K)
export const GAS_R_SI     = 8.314;    // J / (mol·K)
export const FARADAY      = 96485;    // C/mol
export const STP_TEMP_K   = 273.15;   // K
export const STP_PRES_ATM = 1.0;      // atm
export const STP_MOLAR_VOL_L = 22.414; // L/mol at STP (0 °C, 1 atm)

// ─── 1. Stoichiometry ─────────────────────────────────────────────────────────

/**
 * Determine the limiting reagent and calculate moles reacted / produced.
 *
 * Positive coefficients = reactants, negative = products.
 *
 * Example:
 *   coefficients: { HCl: 1, NaOH: 1, NaCl: -1, H2O: -1 }
 *   knownMoles:   { HCl: 0.0025, NaOH: 0.0025 }
 */
export function stoichiometry(input: StoichiometryInput): StoichiometryResult {
  const { coefficients, knownMoles } = input;

  // Identify reactants (positive coeff) and products (negative)
  const reactants = Object.entries(coefficients).filter(([, c]) => c > 0);

  // Limiting reagent: species with the smallest moles/stoichiometric-ratio
  let limitingReagent = "";
  let limitingRatio   = Infinity;

  for (const [species, coeff] of reactants) {
    if (knownMoles[species] !== undefined) {
      const ratio = knownMoles[species] / coeff;
      if (ratio < limitingRatio) {
        limitingRatio   = ratio;
        limitingReagent = species;
      }
    }
  }

  // Moles reacted (proportional to limiting ratio)
  const molesReacted: Record<string, number> = {};
  const molesProduced: Record<string, number> = {};
  const excessReagents: Record<string, number> = {};

  for (const [species, coeff] of Object.entries(coefficients)) {
    if (coeff > 0) {
      // Reactant
      molesReacted[species] = limitingRatio * coeff;
      const initial = knownMoles[species] ?? 0;
      const excess  = initial - molesReacted[species];
      if (excess > 1e-12) excessReagents[species] = excess;
    } else {
      // Product
      molesProduced[species] = limitingRatio * Math.abs(coeff);
    }
  }

  return { limitingReagent, molesReacted, molesProduced, excessReagents };
}

// ─── 2. Titration ─────────────────────────────────────────────────────────────

/**
 * Calculate concentration of unknown analyte at the equivalence point.
 *
 * Handles: strong acid/base, EDTA metal titration (1:1 stoichiometry assumed).
 *
 * @param titrantConc    mol/L of titrant in burette.
 * @param titrantVolMl   mL of titrant at equivalence.
 * @param analyteVolMl   mL of analyte in flask.
 * @param stoichRatio    Molar ratio titrant:analyte (default 1).
 * @param knownConc      True concentration for % error (optional).
 */
export function titrationCalc(
  titrantConc:   number,
  titrantVolMl:  number,
  analyteVolMl:  number,
  stoichRatio = 1,
  knownConc?:   number,
): TitrationCalcResult {
  const molesAtEP    = (titrantConc * titrantVolMl) / 1000;
  const molesAnalyte = molesAtEP / stoichRatio;
  const unknownConc  = molesAnalyte / (analyteVolMl / 1000);
  const percentError = knownConc !== undefined
    ? Math.abs((unknownConc - knownConc) / knownConc) * 100
    : undefined;

  return {
    unknownConc:   Math.round(unknownConc * 10000) / 10000,
    molesAtEP:     Math.round(molesAtEP   * 100000) / 100000,
    volumeAtEP:    titrantVolMl,
    percentError,
  };
}

// ─── 3. Calorimetry ───────────────────────────────────────────────────────────

/**
 * Calculate heat transferred and molar enthalpy from a calorimetry experiment.
 *
 * q = m × cp × ΔT
 * ΔH = −q / n_reacted
 *
 * @param massG       Mass of solution in g (typically ρ = 1 g/mL).
 * @param deltaT      Temperature change in °C (positive = exothermic releases heat).
 * @param molReacted  Moles of limiting reagent reacted.
 * @param cp          Specific heat capacity J/(g·°C); default 4.18 for dilute aq.
 * @param knownDeltaH True ΔH kJ/mol for % error (optional).
 */
export function calorimetryCalc(
  massG:      number,
  deltaT:     number,
  molReacted: number,
  cp = 4.18,
  knownDeltaH?: number,
): CalorimetryCalcResult {
  const qJoules        = massG * cp * deltaT;                // positive = absorbed by solution
  const deltaHkJperMol = (molReacted > 0)
    ? -qJoules / (molReacted * 1000)                         // negative for exothermic
    : 0;

  const percentError = knownDeltaH !== undefined && knownDeltaH !== 0
    ? Math.abs((deltaHkJperMol - knownDeltaH) / knownDeltaH) * 100
    : undefined;

  return {
    qJoules:        Math.round(qJoules * 10) / 10,
    deltaHkJperMol: Math.round(deltaHkJperMol * 100) / 100,
    deltaT,
    massG,
    percentError,
  };
}

// ─── 4. Gas Laws ──────────────────────────────────────────────────────────────

/**
 * Calculate the unknown variable in a gas law equation.
 *
 * Supported laws:
 *  - "boyle":    P₁V₁ = P₂V₂  (T constant)
 *  - "charles":  V₁/T₁ = V₂/T₂  (P constant)
 *  - "combined": P₁V₁/T₁ = P₂V₂/T₂
 *  - "ideal":    PV = nRT
 *
 * Pass the known values and set the unknown to undefined.
 */
export function gasLawCalc(
  law:  "boyle" | "charles" | "combined" | "ideal",
  params: {
    P1?: number; V1?: number; T1?: number; n1?: number;
    P2?: number; V2?: number; T2?: number;
  },
): GasLawCalcResult {
  const { P1, V1, T1, P2, V2, T2, n1 } = params;

  switch (law) {
    case "boyle": {
      // P₁V₁ = P₂V₂
      if (P1 !== undefined && V1 !== undefined && P2 !== undefined)
        return result(law, (P1 * V1) / P2,  "V", "L");
      if (P1 !== undefined && V1 !== undefined && V2 !== undefined)
        return result(law, (P1 * V1) / V2,  "P", "atm");
      break;
    }
    case "charles": {
      // V₁/T₁ = V₂/T₂
      if (V1 !== undefined && T1 !== undefined && T2 !== undefined)
        return result(law, (V1 * T2) / T1,  "V", "L");
      if (V1 !== undefined && T1 !== undefined && V2 !== undefined)
        return result(law, (V2 * T1) / V1,  "T", "K");
      break;
    }
    case "combined": {
      // P₁V₁/T₁ = P₂V₂/T₂
      if (P1 !== undefined && V1 !== undefined && T1 !== undefined && P2 !== undefined && T2 !== undefined)
        return result(law, (P2 * V1 * T2) / (T1 * P2), "V", "L");
      if (P1 !== undefined && V1 !== undefined && T1 !== undefined && V2 !== undefined && T2 !== undefined)
        return result(law, (P1 * V1 * T2) / (T1 * V2), "P", "atm");
      break;
    }
    case "ideal": {
      // PV = nRT
      if (P1 !== undefined && n1 !== undefined && T1 !== undefined)
        return result(law, (n1 * GAS_R * T1) / P1, "V", "L");
      if (V1 !== undefined && n1 !== undefined && T1 !== undefined)
        return result(law, (n1 * GAS_R * T1) / V1, "P", "atm");
      if (P1 !== undefined && V1 !== undefined && n1 !== undefined)
        return result(law, (P1 * V1) / (n1 * GAS_R), "T", "K");
      if (P1 !== undefined && V1 !== undefined && T1 !== undefined)
        return result(law, (P1 * V1) / (GAS_R * T1), "n", "mol");
      break;
    }
  }

  throw new Error(`gasLawCalc(${law}): insufficient parameters provided.`);
}

function result(
  law:        GasLawCalcResult["law"],
  calculated: number,
  variable:   GasLawVariable,
  unit:       string,
): GasLawCalcResult {
  return { law, calculated: Math.round(calculated * 100000) / 100000, variable, unit };
}

// ─── 5. Chemical Equilibrium ──────────────────────────────────────────────────

/**
 * Determine direction of equilibrium shift (Le Chatelier) given Keq and
 * current concentrations.
 *
 * @param keq          Equilibrium constant.
 * @param concs        Current concentrations as { species: mol/L }.
 * @param coefficients Stoichiometric coefficients (positive = reactant, negative = product).
 */
export function equilibriumCalc(
  keq:          number,
  concs:        Record<string, number>,
  coefficients: Record<string, number>,
): EquilibriumCalcResult {
  // Q = Π[products]^|coeff| / Π[reactants]^coeff
  let numerator   = 1;
  let denominator = 1;

  for (const [species, coeff] of Object.entries(coefficients)) {
    const c = concs[species] ?? 0;
    if (coeff > 0) denominator *= Math.pow(c, coeff);
    else           numerator   *= Math.pow(c, Math.abs(coeff));
  }

  const qc        = denominator > 0 ? numerator / denominator : 0;
  const direction: EquilibriumCalcResult["direction"] =
    qc < keq ? "forward" : qc > keq ? "reverse" : "none";

  return { keq, concentrations: concs, direction, qc };
}

// ─── 6. Chemical Kinetics ─────────────────────────────────────────────────────

/**
 * Calculate instantaneous reaction rate for first- or second-order kinetics.
 *
 * rate = k × [A]^order
 *
 * @param rateConstant   k (units depend on order: s⁻¹, L/mol/s, …).
 * @param concentration  [A] in mol/L.
 * @param order          Reaction order (0, 1, or 2).
 */
export function kineticsCalc(
  rateConstant:  number,
  concentration: number,
  order: 0 | 1 | 2,
): KineticsCalcResult {
  const rate    = rateConstant * Math.pow(concentration, order);
  const halfLife = order === 1
    ? Math.LN2 / rateConstant
    : order === 0
      ? concentration / (2 * rateConstant)
      : undefined;

  return {
    rate:        Math.round(rate * 1e8) / 1e8,
    halfLife:    halfLife !== undefined ? Math.round(halfLife * 100) / 100 : undefined,
    order,
    rateConstant,
  };
}

// ─── 7. Electrochemistry (Faraday) ────────────────────────────────────────────

/**
 * Calculate the moles and mass of substance deposited/consumed at an electrode
 * using Faraday's laws of electrolysis.
 *
 * n_moles = (I × t) / (z × F)
 * mass    = n_moles × M_r
 *
 * @param currentA    Applied current in Amperes.
 * @param timeSec     Electrolysis duration in seconds.
 * @param electrons   Number of electrons transferred per formula unit (z).
 * @param molarMass   Molar mass g/mol.
 * @param isGas       True to also compute gas volume at STP (for H₂, O₂, Cl₂).
 */
export function electrochemCalc(
  currentA:  number,
  timeSec:   number,
  electrons: number,
  molarMass: number,
  isGas = false,
): ElectrochemCalcResult {
  const chargeC  = currentA * timeSec;
  const moles    = chargeC / (electrons * FARADAY);
  const massG    = moles * molarMass;
  const gasVolumeMl = isGas
    ? (moles * STP_MOLAR_VOL_L * 1000)   // mL at STP
    : undefined;

  return {
    moles:      Math.round(moles * 1e8) / 1e8,
    massG:      Math.round(massG * 10000) / 10000,
    chargeC:    Math.round(chargeC * 100) / 100,
    gasVolumeMl: gasVolumeMl !== undefined
      ? Math.round(gasVolumeMl * 100) / 100
      : undefined,
  };
}

// ─── 8. pH Calculations ───────────────────────────────────────────────────────

/** pH of a strong acid solution (monoprotic, complete dissociation). */
export function strongAcidPH(concMolL: number): number {
  if (concMolL <= 0) return 7;
  return Math.max(0, -Math.log10(concMolL));
}

/** pH of a strong base solution (monoprotic). */
export function strongBasePH(concMolL: number): number {
  if (concMolL <= 0) return 7;
  const pOH = Math.max(0, -Math.log10(concMolL));
  return Math.min(14, 14 - pOH);
}

/** pOH from pH. */
export function pOHFromPH(pH: number): number {
  return 14 - pH;
}

/** Henderson-Hasselbalch approximation for buffer pH. */
export function bufferPH(pKa: number, concAcid: number, concBase: number): number {
  if (concAcid <= 0) return pKa + 3;
  if (concBase <= 0) return pKa - 3;
  return pKa + Math.log10(concBase / concAcid);
}

// ─── 9. Water Hardness ────────────────────────────────────────────────────────

/**
 * Calculate water hardness from EDTA titration.
 *
 * [Ca²⁺ + Mg²⁺] = c_EDTA × V_EDTA / V_sample
 * hardness (mg/L as CaCO₃) = [M²⁺] × M(CaCO₃) × 1000
 *
 * @param edtaConc    mol/L of EDTA titrant.
 * @param edtaVolMl   mL used at endpoint.
 * @param sampleVolMl mL of water sample.
 */
export function waterHardnessCalc(
  edtaConc:    number,
  edtaVolMl:   number,
  sampleVolMl: number,
): { molL: number; mgL: number; category: "soft" | "moderately-hard" | "hard" | "very-hard" } {
  const M_CACO3 = 100.09; // g/mol
  const molL    = (edtaConc * edtaVolMl) / sampleVolMl;
  const mgL     = molL * M_CACO3 * 1000;

  const category =
    mgL <  60  ? "soft"
    : mgL < 120  ? "moderately-hard"
    : mgL < 180  ? "hard"
    :              "very-hard";

  return {
    molL:  Math.round(molL * 1e6) / 1e6,
    mgL:   Math.round(mgL * 10) / 10,
    category,
  };
}
