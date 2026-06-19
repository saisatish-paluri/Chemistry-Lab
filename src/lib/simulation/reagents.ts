/**
 * Reagent Simulation Engine
 *
 * Generates realistic reagent states with session-rolled concentration
 * variance and purity, replacing hardcoded "HCl = 0.100 M" with
 * scientifically plausible "HCl = 0.097 M, purity 98.4 %".
 */

import type { ReagentId, ReagentConfig, ReagentState } from "./types";

// ─── Catalogue ────────────────────────────────────────────────────────────────

interface ReagentDef {
  formula:      string;
  label:        string;
  nominalConc:  number;  // mol/L
  purityRange:  [number, number];
}

export const REAGENT_CATALOGUE: Record<string, ReagentDef> = {
  "hcl-0.1":       { formula: "HCl",    label: "Hydrochloric Acid 0.1 M",     nominalConc: 0.1,  purityRange: [97.5, 99.9] },
  "hcl-1.0":       { formula: "HCl",    label: "Hydrochloric Acid 1.0 M",     nominalConc: 1.0,  purityRange: [97.0, 99.8] },
  "naoh-0.1":      { formula: "NaOH",   label: "Sodium Hydroxide 0.1 M",      nominalConc: 0.1,  purityRange: [96.0, 99.5] },
  "naoh-1.0":      { formula: "NaOH",   label: "Sodium Hydroxide 1.0 M",      nominalConc: 1.0,  purityRange: [95.0, 99.0] },
  "h2so4-0.05":    { formula: "H₂SO₄",  label: "Sulfuric Acid 0.05 M",        nominalConc: 0.05, purityRange: [98.0, 99.9] },
  "na2s2o3-0.1":   { formula: "Na₂S₂O₃", label: "Sodium Thiosulfate 0.1 M",  nominalConc: 0.1,  purityRange: [97.0, 99.5] },
  "edta-0.01":     { formula: "EDTA",   label: "EDTA 0.01 M",                  nominalConc: 0.01, purityRange: [98.5, 99.9] },
  "agno3-0.1":     { formula: "AgNO₃",  label: "Silver Nitrate 0.1 M",        nominalConc: 0.1,  purityRange: [99.0, 99.9] },
  "naoh-solid":    { formula: "NaOH",   label: "Sodium Hydroxide (solid)",     nominalConc: 1.0,  purityRange: [94.0, 98.5] },
  "cuso4-0.5":     { formula: "CuSO₄",  label: "Copper Sulfate 0.5 M",        nominalConc: 0.5,  purityRange: [98.0, 99.8] },
  "nacl-sat":      { formula: "NaCl",   label: "Saturated NaCl Solution",      nominalConc: 6.1,  purityRange: [99.0, 99.9] },
  "phenolphthalein":{ formula: "C₂₀H₁₄O₄", label: "Phenolphthalein Indicator",nominalConc: 0.01, purityRange: [95.0, 99.5] },
  "universal-indicator":{ formula: "—", label: "Universal Indicator",          nominalConc: 0.01, purityRange: [95.0, 99.0] },
  "eriochrome-t":  { formula: "EBT",    label: "Eriochrome Black T Indicator", nominalConc: 0.01, purityRange: [95.0, 99.5] },
  "kmno4-0.02":    { formula: "KMnO₄",  label: "Potassium Permanganate 0.02 M",nominalConc: 0.02, purityRange: [98.0, 99.9] },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function gaussian(mean: number, sigma: number): number {
  let u: number, v: number, s: number;
  do {
    u = Math.random() * 2 - 1;
    v = Math.random() * 2 - 1;
    s = u * u + v * v;
  } while (s >= 1 || s === 0);
  return mean + sigma * u * Math.sqrt(-2 * Math.log(s) / s);
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function round4(v: number): number {
  return Math.round(v * 10000) / 10000;
}

function preparationNote(purity: number, isAged: boolean): string {
  if (isAged) return "Aged stock — higher concentration variance expected.";
  if (purity >= 99.5) return "Freshly prepared from analytical-grade stock.";
  if (purity >= 98.0) return "Standard laboratory reagent, checked concentration.";
  return "Reagent grade — slight variance from nominal concentration.";
}

// ─── Core API ─────────────────────────────────────────────────────────────────

/**
 * Create a session-rolled reagent from the catalogue.
 *
 * @param id       Key in REAGENT_CATALOGUE (e.g. "hcl-0.1")
 * @param config   Optional overrides for variance and purity.
 */
export function createReagent(id: ReagentId, config: ReagentConfig = {}): ReagentState {
  const def = REAGENT_CATALOGUE[id];
  if (!def) {
    throw new Error(`Unknown reagent id "${id}". Add it to REAGENT_CATALOGUE first.`);
  }

  const nominalConc     = config.nominalConc     ?? def.nominalConc;
  const [pMin, pMax]    = config.purityRange     ?? def.purityRange;
  const variancePct     = config.concVariancePct ?? (config.isAged ? 6 : 3);
  const quantityMl      = config.quantityMl      ?? 500;
  const isAged          = config.isAged          ?? false;

  // Roll concentration: Gaussian ±variancePct% of nominal
  const sigma           = nominalConc * (variancePct / 100);
  const rawConc         = gaussian(nominalConc, sigma);
  const actualConc      = round4(clamp(rawConc, nominalConc * 0.85, nominalConc * 1.15));

  // Roll purity uniformly in [pMin, pMax]
  const purityPct       = Math.round((pMin + Math.random() * (pMax - pMin)) * 10) / 10;

  const effectiveConc   = round4(actualConc * purityPct / 100);

  return {
    id,
    formula:        def.formula,
    label:          def.label,
    nominalConc,
    actualConc,
    purityPct,
    effectiveConc,
    quantityMl,
    quantityUsedMl: 0,
    isExpired:      isAged && purityPct < 96.0,
    preparationNote: preparationNote(purityPct, isAged),
  };
}

/**
 * Create a reagent with fully custom parameters (not from catalogue).
 */
export function createCustomReagent(
  id:          ReagentId,
  formula:     string,
  label:       string,
  config:      Required<ReagentConfig>,
): ReagentState {
  const { nominalConc, concVariancePct, purityRange, quantityMl, isAged } = config;
  const [pMin, pMax] = purityRange;

  const sigma      = nominalConc * (concVariancePct / 100);
  const rawConc    = gaussian(nominalConc, sigma);
  const actualConc = round4(clamp(rawConc, nominalConc * 0.85, nominalConc * 1.15));
  const purityPct  = Math.round((pMin + Math.random() * (pMax - pMin)) * 10) / 10;
  const effectiveConc = round4(actualConc * purityPct / 100);

  return {
    id, formula, label,
    nominalConc, actualConc, purityPct, effectiveConc,
    quantityMl, quantityUsedMl: 0,
    isExpired: isAged && purityPct < 96.0,
    preparationNote: preparationNote(purityPct, isAged),
  };
}

/** Create a batch of reagents from catalogue ids. */
export function createReagentSet(
  ids:     ReagentId[],
  configs: Partial<Record<ReagentId, ReagentConfig>> = {},
): Record<ReagentId, ReagentState> {
  return Object.fromEntries(
    ids.map((id) => [id, createReagent(id, configs[id] ?? {})]),
  );
}

/** Record consumption of a reagent; returns updated state. */
export function consumeReagent(reagent: ReagentState, volumeMl: number): ReagentState {
  const used = clamp(volumeMl, 0, reagent.quantityMl - reagent.quantityUsedMl);
  return { ...reagent, quantityUsedMl: round4(reagent.quantityUsedMl + used) };
}

/** Remaining volume available. */
export function remainingVolume(reagent: ReagentState): number {
  return reagent.quantityMl - reagent.quantityUsedMl;
}

/** Moles available in the remaining volume. */
export function availableMoles(reagent: ReagentState): number {
  return round4((remainingVolume(reagent) / 1000) * reagent.effectiveConc);
}

/**
 * Return a display string showing the realistic concentration.
 * e.g. "HCl  0.097 M  (purity 98.4 %)"
 */
export function describeReagent(reagent: ReagentState): string {
  return (
    `${reagent.formula}  ${reagent.actualConc.toFixed(4)} M  ` +
    `(purity ${reagent.purityPct.toFixed(1)} %)  —  ` +
    reagent.preparationNote
  );
}
