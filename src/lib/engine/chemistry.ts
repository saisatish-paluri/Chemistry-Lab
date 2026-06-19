import type { IndicatorName } from "./types";

// ─── Statistical helpers ───────────────────────────────────────────────────────

/**
 * Box-Muller Gaussian noise. Returns a normally-distributed random value
 * with mean=0 and the given standard deviation. Used by all engines to add
 * session-to-session variability to instrument readings and chemical outcomes.
 */
export function gaussianNoise(sigma: number): number {
  let u: number, v: number, s: number;
  do {
    u = Math.random() * 2 - 1;
    v = Math.random() * 2 - 1;
    s = u * u + v * v;
  } while (s >= 1 || s === 0);
  return sigma * u * Math.sqrt(-2 * Math.log(s) / s);
}

/**
 * Temperature of a mixture when V_hot mL at T_hot °C is combined with
 * V_cold mL at T_cold °C (cp and ρ assumed equal — valid for dilute aqueous).
 */
export function mixingTemp(vHotMl: number, tHotC: number, vColdMl: number, tColdC: number): number {
  const total = vHotMl + vColdMl;
  if (total <= 0) return tColdC;
  return (vHotMl * tHotC + vColdMl * tColdC) / total;
}

export const ACID_CONC         = 0.1;   // mol/L  HCl in flask
export const ACID_VOLUME_ML    = 25;    // mL
export const BASE_CONC         = 0.1;   // mol/L  NaOH in burette
export const BURETTE_START_ML  = 50;    // mL
export const EQUIVALENCE_VOL   = (ACID_CONC * ACID_VOLUME_ML) / BASE_CONC; // 25 mL
export const FARADAY           = 96485; // C/mol
export const ML_PER_MOLE_GAS   = 22400; // mL/mol at STP

export interface IndicatorDef {
  name:            string;
  acidColor:       string;
  baseColor:       string;
  transitionLow:   number;
  transitionHigh:  number;
  description:     string;
}

export const INDICATORS: Record<IndicatorName, IndicatorDef> = {
  phenolphthalein: {
    name: "Phenolphthalein",
    acidColor: "#f0f8f0",
    baseColor: "#f472b6",
    transitionLow: 8.2,
    transitionHigh: 10.0,
    description: "Colourless in acid, pink in base. Best for strong acid/base titrations.",
  },
  litmus: {
    name: "Litmus",
    acidColor: "#e05555",
    baseColor: "#5555d5",
    transitionLow: 6.0,
    transitionHigh: 8.0,
    description: "Red in acid, blue in base. Broad transition zone.",
  },
  methylOrange: {
    name: "Methyl Orange",
    acidColor: "#f97316",
    baseColor: "#facc15",
    transitionLow: 3.1,
    transitionHigh: 4.4,
    description: "Orange/red in acid, yellow in base. Ideal for weak base titrations.",
  },
};

export function calcpH(
  acidMoles: number,
  baseMoles: number,
  totalVolumeL: number,
  acidType: "strong" | "weak" = "strong",
  baseType: "strong" | "weak" = "strong"
): number {
  if (totalVolumeL <= 0) return 7.0;

  if (acidType === "strong" && baseType === "strong") {
    const diff = acidMoles - baseMoles;
    if (Math.abs(diff) < 1e-9) return 7.0;
    if (diff > 0) return Math.max(0, -Math.log10(diff / totalVolumeL));
    const pOH = Math.max(0, -Math.log10(-diff / totalVolumeL));
    return Math.min(14, 14 - pOH);
  }

  const pKa = 4.76; // CH3COOH
  const pKb = 4.75; // NH3, pKa of NH4+ = 9.25

  if (acidType === "weak" && baseType === "strong") {
    // Weak Acid + Strong Base titration
    if (baseMoles < 1e-9) {
      // Pure weak acid
      const c_a = acidMoles / totalVolumeL;
      const hConc = Math.sqrt(Math.max(0, Math.pow(10, -pKa) * c_a));
      return -Math.log10(Math.max(1e-14, hConc));
    } else if (baseMoles < acidMoles) {
      // Buffer region: Henderson-Hasselbalch
      return pKa + Math.log10(baseMoles / (acidMoles - baseMoles));
    } else if (Math.abs(baseMoles - acidMoles) < 1e-9) {
      // Equivalence point: hydrolysis of weak conjugate base (CH3COO-)
      const c_salt = acidMoles / totalVolumeL;
      const Kw = 1e-14;
      const Ka = Math.pow(10, -pKa);
      const ohConc = Math.sqrt((Kw / Ka) * c_salt);
      return 14 + Math.log10(Math.max(1e-14, ohConc));
    } else {
      // Excess strong base
      const ohConc = (baseMoles - acidMoles) / totalVolumeL;
      return 14 + Math.log10(Math.max(1e-14, ohConc));
    }
  }

  if (acidType === "strong" && baseType === "weak") {
    // Strong Acid + Weak Base titration
    const pKaConj = 9.25;
    if (baseMoles < 1e-9) {
      // Pure strong acid
      const hConc = acidMoles / totalVolumeL;
      return -Math.log10(Math.max(1e-14, hConc));
    } else if (baseMoles > acidMoles) {
      // Buffer region: Henderson-Hasselbalch for weak base buffer
      return pKaConj + Math.log10((baseMoles - acidMoles) / acidMoles);
    } else if (Math.abs(baseMoles - acidMoles) < 1e-9) {
      // Equivalence point: hydrolysis of weak conjugate acid (NH4+)
      const c_salt = acidMoles / totalVolumeL;
      const KaConj = Math.pow(10, -pKaConj);
      const hConc = Math.sqrt(KaConj * c_salt);
      return -Math.log10(Math.max(1e-14, hConc));
    } else {
      // Excess strong acid
      const hConc = (acidMoles - baseMoles) / totalVolumeL;
      return -Math.log10(Math.max(1e-14, hConc));
    }
  }

  // Weak Acid + Weak Base
  if (Math.abs(acidMoles - baseMoles) < 1e-9) {
    return 7.0 + 0.5 * (pKa - pKb);
  } else if (acidMoles > baseMoles) {
    // Weak acid buffer dominates
    return pKa + Math.log10(baseMoles / (acidMoles - baseMoles));
  } else {
    // Weak base buffer dominates
    const pKaConj = 9.25;
    return pKaConj + Math.log10((baseMoles - acidMoles) / acidMoles);
  }
}

export function indicatorColor(pH: number, ind: IndicatorDef): string {
  if (pH <= ind.transitionLow)  return ind.acidColor;
  if (pH >= ind.transitionHigh) return ind.baseColor;
  const t = (pH - ind.transitionLow) / (ind.transitionHigh - ind.transitionLow);
  return lerpHex(ind.acidColor, ind.baseColor, t);
}

export function flaskColor(pH: number, ind: IndicatorDef | null): string {
  if (!ind) return "#bfdbfe";
  return indicatorColor(pH, ind);
}

// Precision score: how close volumeAdded was to the equivalence point
export function precisionScore(volumeAdded: number, equivalenceVol: number): number {
  const deviation = Math.abs(volumeAdded - equivalenceVol);
  if (deviation <= 0.3) return 100;
  if (deviation <= 0.6) return 95;
  if (deviation <= 1.0) return 88;
  if (deviation <= 2.0) return 78;
  if (deviation <= 3.5) return 65;
  if (deviation <= 5.0) return 50;
  return 35;
}

/**
 * Continuous precision score — smooth exponential decay from 100 (zero error)
 * to ~10 (>8 mL deviation). Replaces the lookup-table version for richer feedback.
 * Score = 100 × e^(-0.45 × deviation)  clamped to [10, 100].
 */
export function continuousPrecisionScore(deviation: number): number {
  return Math.max(10, Math.round(100 * Math.exp(-0.45 * Math.abs(deviation))));
}

/**
 * Instrument parallax error — simulates the random ±σ reading error introduced
 * when a student reads a burette or graduated cylinder meniscus.
 * @param sigma  Standard deviation in mL (default 0.08 mL for a burette)
 */
export function parallaxError(sigma = 0.08): number {
  return gaussianNoise(sigma);
}

/**
 * Thermal noise — simulates random ±σ °C fluctuation from lab drafts,
 * thermometer resolution, or thermal lag. Used by calorimetry and dissolution.
 */
export function thermalNoise(sigma = 0.15): number {
  return gaussianNoise(sigma);
}

export function lerpHex(a: string, b: string, t: number): string {
  const p = (s: string, o: number) => parseInt(s.slice(o, o + 2), 16);
  const r  = Math.round(p(a, 1) + (p(b, 1) - p(a, 1)) * t);
  const g  = Math.round(p(a, 3) + (p(b, 3) - p(a, 3)) * t);
  const bl = Math.round(p(a, 5) + (p(b, 5) - p(a, 5)) * t);
  return `#${hexByte(r)}${hexByte(g)}${hexByte(bl)}`;
}

function hexByte(n: number) { return Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0"); }

export function calcElectrolysisMoles(currentA: number, timeSec: number, electrons: number): number {
  return (currentA * timeSec) / (electrons * FARADAY);
}
