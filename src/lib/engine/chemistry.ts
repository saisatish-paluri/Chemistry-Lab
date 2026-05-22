import type { IndicatorName } from "./types";

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

export function calcpH(acidMoles: number, baseMoles: number, totalVolumeL: number): number {
  const diff = acidMoles - baseMoles;
  if (Math.abs(diff) < 1e-9) return 7.0;
  if (diff > 0) return Math.max(0, -Math.log10(diff / totalVolumeL));
  const pOH = Math.max(0, -Math.log10(-diff / totalVolumeL));
  return Math.min(14, 14 - pOH);
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

function lerpHex(a: string, b: string, t: number): string {
  const p = (s: string, o: number) => parseInt(s.slice(o, o + 2), 16);
  const r  = Math.round(p(a, 1) + (p(b, 1) - p(a, 1)) * t);
  const g  = Math.round(p(a, 3) + (p(b, 3) - p(a, 3)) * t);
  const bl = Math.round(p(a, 5) + (p(b, 5) - p(a, 5)) * t);
  return `#${h(r)}${h(g)}${h(bl)}`;
}

function h(n: number) { return Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0"); }

export function calcElectrolysisMoles(currentA: number, timeSec: number, electrons: number): number {
  return (currentA * timeSec) / (electrons * FARADAY);
}
