/**
 * Apparatus Condition Engine
 *
 * Rolls a realistic apparatus condition for each piece of glassware in a
 * session. Conditions bias measurements where scientifically appropriate.
 *
 * Probability tables are difficulty-weighted so beginner sessions almost
 * always receive ideal apparatus, while advanced sessions introduce
 * systematic errors requiring identification and correction.
 */

import type {
  ApparatusConditionId,
  ApparatusCondition,
  ApparatusConfig,
} from "./types";

// ─── Condition Definitions ────────────────────────────────────────────────────

const CONDITION_DEFS: Record<ApparatusConditionId, Omit<ApparatusCondition, "id">> = {
  "clean-dry": {
    label:           "Clean and Dry",
    biasMultiplier:  1.000,
    additiveBias:    0.000,
    severity:        "none",
    educationalNote: "Ideal condition — no bias introduced.",
  },
  "rinsed-water": {
    label:           "Rinsed with Distilled Water",
    biasMultiplier:  0.997,
    additiveBias:    0.000,
    severity:        "minor",
    educationalNote:
      "Residual water in a burette dilutes the titrant slightly, lowering its effective " +
      "concentration and causing a slight over-delivery. The flask may be rinsed with " +
      "distilled water without affecting the result.",
  },
  "rinsed-solution": {
    label:           "Pre-rinsed with Titrant",
    biasMultiplier:  1.000,
    additiveBias:    0.000,
    severity:        "none",
    educationalNote:
      "Rinsing the burette with the titrant solution removes any residual water and " +
      "ensures the concentration is maintained. This is correct procedure.",
  },
  "wet": {
    label:           "Wet Glassware (Residual Water)",
    biasMultiplier:  0.993,
    additiveBias:   -0.02,
    severity:        "minor",
    educationalNote:
      "Water on the inside walls of a burette or pipette dilutes the solution and gives " +
      "a reading that is slightly below the true volume. Always dry glassware or rinse " +
      "with the solution before use.",
  },
  "contaminated": {
    label:           "Contaminated with Foreign Substance",
    biasMultiplier:  1.000,
    additiveBias:    0.08,
    severity:        "major",
    educationalNote:
      "Contamination introduces additional moles of a reagent into the system, skewing " +
      "results significantly. Always rinse with distilled water, then with the reagent itself.",
  },
  "poorly-calibrated": {
    label:           "Poorly Calibrated Instrument",
    biasMultiplier:  1.000,
    additiveBias:    0.05,
    severity:        "moderate",
    educationalNote:
      "Instruments that drift from calibration give systematically biased readings. " +
      "Re-calibrate with known standards before use and between long sessions.",
  },
  "cracked": {
    label:           "Cracked / Chipped Glassware",
    biasMultiplier:  0.980,
    additiveBias:    0.000,
    severity:        "major",
    educationalNote:
      "A crack near a graduation mark renders the volume marking unreliable. " +
      "Cracked glassware should be immediately discarded.",
  },
};

// ─── Probability Tables ───────────────────────────────────────────────────────

type ProbTable = Partial<Record<ApparatusConditionId, number>>;

const PROB_TABLES: Record<"beginner" | "intermediate" | "advanced", ProbTable> = {
  beginner: {
    "clean-dry":        0.90,
    "rinsed-water":     0.05,
    "rinsed-solution":  0.05,
  },
  intermediate: {
    "clean-dry":        0.55,
    "rinsed-water":     0.15,
    "rinsed-solution":  0.10,
    "wet":              0.10,
    "poorly-calibrated":0.07,
    "contaminated":     0.03,
  },
  advanced: {
    "clean-dry":        0.35,
    "rinsed-water":     0.15,
    "rinsed-solution":  0.10,
    "wet":              0.15,
    "contaminated":     0.08,
    "poorly-calibrated":0.12,
    "cracked":          0.05,
  },
};

// ─── Core API ─────────────────────────────────────────────────────────────────

/** Roll a single apparatus condition for the session. */
export function rollApparatusCondition(config: ApparatusConfig = {}): ApparatusCondition {
  const difficulty = config.difficulty ?? "intermediate";
  const table      = PROB_TABLES[difficulty];

  // Override: if faultProbability set to 0, always return clean-dry
  if ((config.faultProbability ?? 1) === 0) {
    return buildCondition("clean-dry");
  }

  const roll    = Math.random();
  let cumulative = 0;

  for (const [id, prob] of Object.entries(table) as [ApparatusConditionId, number][]) {
    cumulative += prob;
    if (roll < cumulative) return buildCondition(id);
  }

  return buildCondition("clean-dry");
}

/** Roll conditions for multiple apparatus in one call. */
export function rollApparatusSet(
  ids:    string[],
  config: ApparatusConfig = {},
): Record<string, ApparatusCondition> {
  return Object.fromEntries(ids.map((id) => [id, rollApparatusCondition(config)]));
}

function buildCondition(id: ApparatusConditionId): ApparatusCondition {
  return { id, ...CONDITION_DEFS[id] };
}

/**
 * Apply an apparatus condition bias to a measured value.
 *
 * @param rawValue   True engine value (e.g. 24.83 mL).
 * @param condition  Rolled apparatus condition.
 * @returns Biased value that the student would observe.
 */
export function applyApparatusBias(
  rawValue:  number,
  condition: ApparatusCondition,
): number {
  return rawValue * condition.biasMultiplier + condition.additiveBias;
}

/** True when the condition introduces a measurement bias. */
export function conditionHasBias(condition: ApparatusCondition): boolean {
  return condition.severity !== "none";
}

/** Human-readable description for the apparatus condition panel. */
export function describeCondition(condition: ApparatusCondition): string {
  if (condition.severity === "none") return "Apparatus is clean and ready to use.";
  return `${condition.label} — ${condition.educationalNote}`;
}
