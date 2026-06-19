/**
 * Universal Scientific Measurement Framework — Core Types
 *
 * Platform-wide type definitions for instrument models, measurement readings,
 * experimental errors, significant-figure operations, and uncertainty budgets.
 * All experiment engines and UI components share these types; no per-experiment
 * duplicates are permitted.
 */

// ─── Instrument catalogue ──────────────────────────────────────────────────────

export type InstrumentType =
  | "analytical-balance"
  | "thermometer"
  | "burette"
  | "pipette"
  | "measuring-cylinder"
  | "stopwatch"
  | "ph-meter"
  | "conductivity-meter"
  | "gas-syringe"
  | "manometer";

/**
 * Physical specification of a laboratory instrument.
 * Values are based on IUPAC Class-A tolerances and standard student-grade equipment.
 */
export interface InstrumentSpec {
  type:          InstrumentType;
  label:         string;
  unit:          string;
  /** Smallest readable graduation (e.g. 0.05 mL for a 50 mL burette). */
  resolution:    number;
  /** Absolute ± uncertainty per reading (e.g. ±0.05 mL for a burette). */
  uncertainty:   number;
  minRange:      number;
  maxRange:      number;
  /** Decimal places shown on display — derived from resolution. */
  decimalPlaces: number;
  /** Gaussian noise σ (absolute) for realistic last-digit fluctuation. */
  noiseSigma:    number;
}

// ─── Instrument reading ────────────────────────────────────────────────────────

/**
 * A fully characterised measurement: actual engine value plus the displayed,
 * rounded reading with all uncertainty metadata.
 */
export interface InstrumentReading {
  instrument:            InstrumentType;
  label:                 string;
  /** Ground-truth value computed by the engine. */
  actualValue:           number;
  /** Value rounded to instrument resolution — what the student reads. */
  displayedValue:        number;
  /** Absolute ± uncertainty (e.g. 0.05 mL). */
  uncertainty:           number;
  /** Relative uncertainty: uncertainty / |displayedValue|. */
  relativeUncertainty:   number;
  /** Percentage uncertainty: relativeUncertainty × 100. */
  percentageUncertainty: number;
  unit:                  string;
  sigFigs:               number;
  /** "24.85 mL" */
  formatted:             string;
  /** "24.85 ± 0.05 mL" */
  withUncertainty:       string;
  calibrated:            boolean;
  /** True when an active experimental error is biasing this reading. */
  hasActiveError:        boolean;
  activeErrorLabel:      string | null;
}

// ─── Experimental error system ────────────────────────────────────────────────

export type ErrorType =
  | "parallax"
  | "air-bubble"
  | "contaminated-apparatus"
  | "wet-glassware"
  | "heat-loss"
  | "endpoint-overshoot"
  | "incomplete-mixing"
  | "reading-error"
  | "instrument-drift";

/** A single experimental error that introduces a systematic bias into instrument readings. */
export interface ExperimentalError {
  type:               ErrorType;
  label:              string;
  /** Whether this error is active in the current session. */
  active:             boolean;
  /** Absolute offset added to affected readings when active (positive or negative). */
  systematicBias:     number;
  severity:           "minor" | "moderate" | "major";
  /** Student-facing explanation of the error and how to avoid it. */
  educationalNote:    string;
  /** Instruments whose readings are biased by this error. */
  affectsInstruments: InstrumentType[];
}

export interface ErrorProbabilityConfig {
  /** 0.0 – 1.0 probability of this error being active in a session. */
  probability: number;
  /** Typical magnitude of the bias when active (absolute value). */
  magnitude:   number;
}

export interface ErrorEngineConfig {
  /** Master switch — false disables all errors (beginner / demonstration mode). */
  enabled:    boolean;
  difficulty: "beginner" | "intermediate" | "advanced";
  errors:     Partial<Record<ErrorType, ErrorProbabilityConfig>>;
}

export interface ActiveErrors {
  errors:     ExperimentalError[];
  hasErrors:  boolean;
  errorCount: number;
}

// ─── Uncertainty budget ───────────────────────────────────────────────────────

export interface UncertaintyBudget {
  measurements:       InstrumentReading[];
  /** Combined absolute uncertainty (quadrature sum). */
  combinedAbsolute:   number;
  /** Combined relative uncertainty (quadrature). */
  combinedRelative:   number;
  combinedPercentage: number;
  /** Human-readable summary string. */
  formatted:          string;
}

// ─── Significant-figure operation record ──────────────────────────────────────

export interface SigFigOperation {
  operands:            { value: number; sigFigs: number; decimalPlaces: number }[];
  operation:           "add" | "subtract" | "multiply" | "divide";
  result:              number;
  resultSigFigs:       number;
  resultDecimalPlaces: number;
  /** Display string with correct precision (e.g. "24.85"). */
  formatted:           string;
  /** Educational note explaining which rule was applied. */
  rule:                string;
}

// ─── Per-experiment measurement contexts ─────────────────────────────────────
// Named readings for experiments that integrate the measurement framework.

export interface TitrationMeasurements {
  /** Volume of NaOH dispensed from burette. */
  buretteVolume: InstrumentReading;
  /** pH meter reading of flask solution. */
  flaskPH:       InstrumentReading;
}

export interface CalorimetryMeasurements {
  /** Thermometer reading of the reaction mixture. */
  thermometer: InstrumentReading;
  /** Volume of NaOH added (from measuring cylinder). */
  naohVolume:  InstrumentReading;
}

export interface GasLawsMeasurements {
  /** Thermometer reading in °C. */
  thermometer: InstrumentReading;
  /** Gas volume in litres from gas syringe. */
  gasSyringe:  InstrumentReading;
  /** Manometer pressure reading in atm. */
  manometer:   InstrumentReading;
}
