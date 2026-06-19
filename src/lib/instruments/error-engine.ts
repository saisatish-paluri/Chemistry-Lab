/**
 * Experimental Error Engine
 *
 * Defines all recognised laboratory errors with educational notes and affected
 * instruments. rollErrors() randomly activates errors based on per-difficulty
 * probability tables, producing an ActiveErrors snapshot that is stored in
 * experiment state for the duration of a session.
 */

import type {
  ErrorType,
  ExperimentalError,
  ErrorEngineConfig,
  ActiveErrors,
  InstrumentType,
} from "./types";

// ─── Static error definitions ─────────────────────────────────────────────────
// Each entry defines everything except `active` and `systematicBias`, which are
// set at roll-time when the session starts.

type ErrorTemplate = Omit<ExperimentalError, "active" | "systematicBias">;

export const ERROR_DEFINITIONS: Record<ErrorType, ErrorTemplate> = {
  parallax: {
    type:               "parallax",
    label:              "Parallax Error",
    severity:           "minor",
    educationalNote:
      "Parallax error occurs when the eye is not level with the graduation mark or meniscus. " +
      "Always read graduated glassware at eye level, aligning the line of sight with the bottom of the meniscus. " +
      "Viewing from above gives a falsely high reading; from below, falsely low.",
    affectsInstruments: ["burette", "measuring-cylinder", "pipette"] as InstrumentType[],
  },
  "air-bubble": {
    type:               "air-bubble",
    label:              "Air Bubble in Burette",
    severity:           "moderate",
    educationalNote:
      "A trapped air bubble below the stopcock occupies dead volume. When it escapes during titration " +
      "it registers as delivered liquid, giving a falsely high volume reading. Always inspect the burette " +
      "tip for bubbles before starting and expel them by opening the stopcock rapidly.",
    affectsInstruments: ["burette"] as InstrumentType[],
  },
  "contaminated-apparatus": {
    type:               "contaminated-apparatus",
    label:              "Contaminated Apparatus",
    severity:           "major",
    educationalNote:
      "Rinsing the burette with water instead of the titrant dilutes the solution and reduces its " +
      "effective concentration. Rinsing the conical flask with the wrong solution introduces extra moles " +
      "of one reagent. Always rinse the burette with the solution it will contain; the flask may be rinsed " +
      "with distilled water without affecting the result.",
    affectsInstruments: ["burette", "pipette", "measuring-cylinder"] as InstrumentType[],
  },
  "wet-glassware": {
    type:               "wet-glassware",
    label:              "Wet Glassware (Dilution)",
    severity:           "minor",
    educationalNote:
      "Water remaining in a burette or pipette dilutes the solution, lowering the effective " +
      "concentration. This means more volume must be delivered to achieve the same number of moles, " +
      "causing an overestimate of the required volume. Always dry (or rinse with) the solution before use.",
    affectsInstruments: ["burette", "pipette"] as InstrumentType[],
  },
  "heat-loss": {
    type:               "heat-loss",
    label:              "Heat Loss to Surroundings",
    severity:           "moderate",
    educationalNote:
      "Heat dissipates through the calorimeter walls and through the thermometer itself, so the " +
      "measured temperature rise is always lower than the true enthalpy would predict. Using a well-insulated " +
      "polystyrene cup calorimeter and correcting for heat capacity of the calorimeter reduces this error. " +
      "Plot temperature vs. time and extrapolate back to t=0 for a more accurate ΔT.",
    affectsInstruments: ["thermometer"] as InstrumentType[],
  },
  "endpoint-overshoot": {
    type:               "endpoint-overshoot",
    label:              "Overshooting the Endpoint",
    severity:           "moderate",
    educationalNote:
      "Adding titrant too quickly near the endpoint delivers excess reagent before the colour change " +
      "can be detected. This gives a volume reading larger than the true equivalence volume. " +
      "Within 2 mL of the expected endpoint, reduce flow to single drops and swirl thoroughly after each addition.",
    affectsInstruments: ["burette"] as InstrumentType[],
  },
  "incomplete-mixing": {
    type:               "incomplete-mixing",
    label:              "Incomplete Mixing",
    severity:           "minor",
    educationalNote:
      "Poor swirling creates local concentration gradients. The indicator near the point of reagent " +
      "addition may temporarily change colour before the bulk solution is neutralised, causing a " +
      "premature (false) endpoint. Swirl the flask continuously and observe the colour only after " +
      "a few seconds of vigorous mixing.",
    affectsInstruments: ["ph-meter"] as InstrumentType[],
  },
  "reading-error": {
    type:               "reading-error",
    label:              "Instrumental Reading Error",
    severity:           "minor",
    educationalNote:
      "Analog scales introduce a random uncertainty of ±½ the smallest division due to interpolation " +
      "between graduation marks. Digital instruments have a quantisation error of ±1 in the last digit. " +
      "Both are captured in the stated instrument uncertainty (e.g. ±0.05 mL for a burette). " +
      "Taking repeated readings and averaging minimises random reading errors.",
    affectsInstruments: ["burette", "measuring-cylinder", "thermometer", "analytical-balance"] as InstrumentType[],
  },
  "instrument-drift": {
    type:               "instrument-drift",
    label:              "Instrument Drift",
    severity:           "moderate",
    educationalNote:
      "Electronic sensors drift from their calibrated zero over time due to temperature fluctuations, " +
      "battery depletion, or electrode ageing. A pH electrode that was calibrated at the start of a long " +
      "practical session may read 0.1–0.3 pH units high or low by the end. Re-calibrate instruments " +
      "frequently and allow them to warm up before use.",
    affectsInstruments: ["ph-meter", "conductivity-meter", "analytical-balance"] as InstrumentType[],
  },
};

// ─── Default probability/magnitude tables per difficulty ──────────────────────

type ProbMap = Partial<Record<ErrorType, { probability: number; magnitude: number }>>;

const DIFFICULTY_DEFAULTS: Record<"beginner" | "intermediate" | "advanced", ProbMap> = {
  beginner: {
    // No errors in demonstration / beginner mode
  },
  intermediate: {
    parallax:           { probability: 0.20, magnitude:  0.10 },
    "heat-loss":        { probability: 0.30, magnitude: -0.50 },
    "reading-error":    { probability: 0.15, magnitude:  0.05 },
    "incomplete-mixing":{ probability: 0.15, magnitude:  0.04 },
  },
  advanced: {
    parallax:                { probability: 0.30, magnitude:  0.10 },
    "air-bubble":            { probability: 0.20, magnitude:  0.30 },
    "contaminated-apparatus":{ probability: 0.10, magnitude:  0.50 },
    "wet-glassware":         { probability: 0.15, magnitude:  0.15 },
    "heat-loss":             { probability: 0.35, magnitude: -0.60 },
    "endpoint-overshoot":    { probability: 0.15, magnitude:  0.25 },
    "incomplete-mixing":     { probability: 0.20, magnitude:  0.06 },
    "reading-error":         { probability: 0.20, magnitude:  0.05 },
    "instrument-drift":      { probability: 0.15, magnitude:  0.12 },
  },
};

// ─── Public API ───────────────────────────────────────────────────────────────

/** Build a default ErrorEngineConfig for the given difficulty. */
export function buildDefaultErrorConfig(
  difficulty: "beginner" | "intermediate" | "advanced" = "intermediate",
  overrides: ProbMap = {},
): ErrorEngineConfig {
  const base   = DIFFICULTY_DEFAULTS[difficulty];
  const merged = { ...base, ...overrides };
  return {
    enabled:    difficulty !== "beginner",
    difficulty,
    errors:     merged,
  };
}

/**
 * Roll errors for a new experimental session.
 *
 * For each configured error, a uniform random draw is compared against its
 * probability. Active errors have a bias magnitude drawn from
 * [0.8 × config, 1.2 × config] to add natural variation between sessions.
 */
export function rollErrors(config: ErrorEngineConfig): ActiveErrors {
  if (!config.enabled) {
    return { errors: [], hasErrors: false, errorCount: 0 };
  }

  const errors: ExperimentalError[] = [];

  for (const [errType, cfg] of Object.entries(config.errors) as [ErrorType, NonNullable<ProbMap[ErrorType]>][]) {
    if (!cfg) continue;
    const def      = ERROR_DEFINITIONS[errType];
    const isActive = Math.random() < cfg.probability;
    // Vary bias ±20% around the configured magnitude for natural session-to-session differences
    const rawBias  = cfg.magnitude * (0.8 + Math.random() * 0.4);
    errors.push({
      ...def,
      active:         isActive,
      systematicBias: isActive ? rawBias : 0,
    });
  }

  const activeCount = errors.filter((e) => e.active).length;
  return { errors, hasErrors: activeCount > 0, errorCount: activeCount };
}

/** Filter to only the errors that are currently active. */
export function getActiveErrors(errors: ExperimentalError[]): ExperimentalError[] {
  return errors.filter((e) => e.active);
}

/** Filter active errors affecting a specific instrument. */
export function getErrorsForInstrument(
  errors:     ExperimentalError[],
  instrument: InstrumentType,
): ExperimentalError[] {
  return errors.filter((e) => e.active && e.affectsInstruments.includes(instrument));
}

/** True when at least one active error affects the given instrument. */
export function instrumentHasError(
  errors:     ExperimentalError[],
  instrument: InstrumentType,
): boolean {
  return errors.some((e) => e.active && e.affectsInstruments.includes(instrument));
}
