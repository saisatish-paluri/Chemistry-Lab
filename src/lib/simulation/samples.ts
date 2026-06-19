/**
 * Unknown Sample Engine
 *
 * Generates randomized but scientifically valid unknown samples for each
 * experiment session. Supports salts, metals, solutions, and water samples.
 * Every session gets a unique `sessionCode` so students can cross-reference
 * their notes without knowing the identity beforehand.
 */

import type {
  UnknownSaltSample,
  UnknownMetalSample,
  UnknownSolutionSample,
  UnknownWaterSample,
  UnknownSample,
} from "./types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number, dp = 3): number {
  return Math.round((min + Math.random() * (max - min)) * Math.pow(10, dp)) / Math.pow(10, dp);
}

function sessionCode(): string {
  // e.g. "UNK-4F2A"
  return "UNK-" + Math.random().toString(16).slice(2, 6).toUpperCase();
}

// ─── Salt Catalogue ───────────────────────────────────────────────────────────

const SALT_CATALOGUE = [
  { id: "cuso4",   formula: "CuSO₄",        cation: "Cu²⁺",  anion: "SO₄²⁻",   color: "#3b82f6", colorName: "blue" },
  { id: "fecl3",   formula: "FeCl₃",         cation: "Fe³⁺",  anion: "Cl⁻",     color: "#b45309", colorName: "amber-brown" },
  { id: "znco3",   formula: "ZnCO₃",         cation: "Zn²⁺",  anion: "CO₃²⁻",   color: "#e5e7eb", colorName: "white" },
  { id: "ca-no3",  formula: "Ca(NO₃)₂",      cation: "Ca²⁺",  anion: "NO₃⁻",    color: "#f9fafb", colorName: "colorless" },
  { id: "nh4cl",   formula: "NH₄Cl",         cation: "NH₄⁺",  anion: "Cl⁻",     color: "#f9fafb", colorName: "colorless" },
  { id: "pb-no3",  formula: "Pb(NO₃)₂",      cation: "Pb²⁺",  anion: "NO₃⁻",    color: "#f9fafb", colorName: "colorless" },
  { id: "nacl",    formula: "NaCl",           cation: "Na⁺",   anion: "Cl⁻",     color: "#f9fafb", colorName: "colorless" },
  { id: "barium",  formula: "BaCl₂",          cation: "Ba²⁺",  anion: "Cl⁻",     color: "#f9fafb", colorName: "colorless" },
  { id: "k2cr2o7", formula: "K₂Cr₂O₇",        cation: "K⁺",    anion: "Cr₂O₇²⁻", color: "#f97316", colorName: "orange" },
  { id: "caco3",   formula: "CaCO₃",          cation: "Ca²⁺",  anion: "CO₃²⁻",   color: "#f9fafb", colorName: "white" },
] as const;

// ─── Metal Catalogue ──────────────────────────────────────────────────────────

const METAL_CATALOGUE = [
  { id: "magnesium", symbol: "Mg", name: "Magnesium" },
  { id: "zinc",      symbol: "Zn", name: "Zinc" },
  { id: "iron",      symbol: "Fe", name: "Iron" },
  { id: "copper",    symbol: "Cu", name: "Copper" },
  { id: "lead",      symbol: "Pb", name: "Lead" },
  { id: "silver",    symbol: "Ag", name: "Silver" },
  { id: "calcium",   symbol: "Ca", name: "Calcium" },
  { id: "aluminum",  symbol: "Al", name: "Aluminium" },
] as const;

const SURFACE_AREAS = ["powder", "granules", "strip", "solid"] as const;

// ─── Solution Catalogue ───────────────────────────────────────────────────────

const SOLUTION_CATALOGUE = [
  { id: "hcl",   formula: "HCl",  label: "Hydrochloric Acid",  pHBase: 1.5,  concRange: [0.05, 0.15] as [number,number] },
  { id: "h2so4", formula: "H₂SO₄",label: "Sulfuric Acid",       pHBase: 1.2,  concRange: [0.04, 0.12] as [number,number] },
  { id: "naoh",  formula: "NaOH", label: "Sodium Hydroxide",    pHBase: 12.5, concRange: [0.05, 0.15] as [number,number] },
  { id: "ch3cooh",formula:"CH₃COOH",label:"Acetic Acid",        pHBase: 4.5,  concRange: [0.08, 0.20] as [number,number] },
  { id: "na2co3",formula:"Na₂CO₃",label: "Sodium Carbonate",    pHBase: 11.5, concRange: [0.04, 0.10] as [number,number] },
  { id: "nh3",   formula: "NH₃",  label: "Ammonia Solution",    pHBase: 11.0, concRange: [0.06, 0.15] as [number,number] },
] as const;

// ─── Water Sample Catalogue ───────────────────────────────────────────────────

const WATER_SOURCES = [
  { id: "tap",      source: "Municipal Tap Water",  hardnessRange: [50, 180]  as [number,number], pHRange: [6.8, 8.0]  as [number,number] },
  { id: "well",     source: "Borehole Well Water",  hardnessRange: [150, 450] as [number,number], pHRange: [6.5, 7.8]  as [number,number] },
  { id: "rain",     source: "Rainwater",            hardnessRange: [5, 30]    as [number,number], pHRange: [5.5, 6.8]  as [number,number] },
  { id: "river",    source: "River Water",          hardnessRange: [80, 300]  as [number,number], pHRange: [6.5, 8.5]  as [number,number] },
  { id: "distilled",source: "Distilled Water",      hardnessRange: [0, 5]     as [number,number], pHRange: [6.5, 7.0]  as [number,number] },
] as const;

// ─── Public API ───────────────────────────────────────────────────────────────

/** Generate a randomized unknown salt for salt analysis / precipitation labs. */
export function generateUnknownSalt(): UnknownSaltSample {
  const def           = pick(SALT_CATALOGUE);
  const concentration = rand(0.05, 0.25, 3);
  return {
    type: "salt",
    id:   def.id,
    formula:       def.formula,
    cation:        def.cation,
    anion:         def.anion,
    concentration,
    color:         def.color,
    colorName:     def.colorName,
    sessionCode:   sessionCode(),
  };
}

/** Generate a randomized unknown metal strip for redox / activity series labs. */
export function generateUnknownMetal(): UnknownMetalSample {
  const def  = pick(METAL_CATALOGUE);
  const massG = rand(0.5, 3.0, 2);
  return {
    type: "metal",
    id:   def.id,
    symbol:      def.symbol,
    name:        def.name,
    massG,
    surfaceArea: pick(SURFACE_AREAS),
    sessionCode: sessionCode(),
  };
}

/**
 * Generate an unknown acid or base solution for titration / neutralization labs.
 *
 * @param forceAcid  true → always generate an acid; false → always base; undefined → random.
 */
export function generateUnknownSolution(forceAcid?: boolean): UnknownSolutionSample {
  const acids = SOLUTION_CATALOGUE.filter((s) => s.pHBase < 7);
  const bases = SOLUTION_CATALOGUE.filter((s) => s.pHBase > 7);

  let pool: typeof SOLUTION_CATALOGUE[number][];
  if (forceAcid === true)        pool = acids as typeof SOLUTION_CATALOGUE[number][];
  else if (forceAcid === false)  pool = bases as typeof SOLUTION_CATALOGUE[number][];
  else                           pool = [...SOLUTION_CATALOGUE] as typeof SOLUTION_CATALOGUE[number][];

  const def           = pick(pool);
  const concentration = rand(def.concRange[0], def.concRange[1], 4);
  const pH            = rand(def.pHBase - 0.3, def.pHBase + 0.3, 2);

  return {
    type: "solution",
    id:   def.id,
    formula:       def.formula,
    label:         def.label,
    concentration,
    pH,
    sessionCode:   sessionCode(),
  };
}

/** Generate an unknown water sample for water-hardness labs. */
export function generateUnknownWater(): UnknownWaterSample {
  const def        = pick(WATER_SOURCES);
  const hardnessMgL = rand(def.hardnessRange[0], def.hardnessRange[1], 1);
  const pHValue    = rand(def.pHRange[0],     def.pHRange[1],     2);

  const turbidity: UnknownWaterSample["turbidity"] =
    hardnessMgL > 300 ? "turbid"
    : hardnessMgL > 100 ? "slightly-turbid"
    : "clear";

  return {
    type: "water",
    id:   def.id,
    source:      def.source,
    hardnessMgL,
    pHValue,
    turbidity,
    sessionCode: sessionCode(),
  };
}

/** Generate an unknown sample of the requested type. */
export function generateUnknownSample(type: UnknownSample["type"]): UnknownSample {
  switch (type) {
    case "salt":     return generateUnknownSalt();
    case "metal":    return generateUnknownMetal();
    case "solution": return generateUnknownSolution();
    case "water":    return generateUnknownWater();
    default:         return generateUnknownSalt();
  }
}
