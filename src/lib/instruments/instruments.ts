/**
 * Instrument definitions and reading generation.
 *
 * INSTRUMENT_SPECS — authoritative specifications for every supported instrument.
 * readInstrument() — transforms an engine (actual) value into an InstrumentReading
 *                    with resolution rounding, uncertainty metadata, and error bias.
 * Convenience wrappers (readBalance, readThermometer, …) for cleaner call sites.
 */

import type {
  InstrumentType,
  InstrumentSpec,
  InstrumentReading,
  ExperimentalError,
} from "./types";

// ─── Instrument Specifications ────────────────────────────────────────────────
// Tolerances sourced from IUPAC Class-A standards and typical student-grade equipment.

export const INSTRUMENT_SPECS: Record<InstrumentType, InstrumentSpec> = {
  "analytical-balance": {
    type:          "analytical-balance",
    label:         "Analytical Balance",
    unit:          "g",
    resolution:    0.001,
    uncertainty:   0.001,
    minRange:      0,
    maxRange:      300,
    decimalPlaces: 3,
    noiseSigma:    0.0003,
  },
  "thermometer": {
    type:          "thermometer",
    label:         "Digital Thermometer",
    unit:          "°C",
    resolution:    0.1,
    uncertainty:   0.5,
    minRange:      -10,
    maxRange:      110,
    decimalPlaces: 1,
    noiseSigma:    0.03,
  },
  "burette": {
    type:          "burette",
    label:         "Burette (50 mL)",
    unit:          "mL",
    resolution:    0.05,
    uncertainty:   0.05,
    minRange:      0,
    maxRange:      50,
    decimalPlaces: 2,
    noiseSigma:    0.008,
  },
  "pipette": {
    type:          "pipette",
    label:         "Volumetric Pipette",
    unit:          "mL",
    resolution:    0.01,
    uncertainty:   0.015,
    minRange:      0,
    maxRange:      25,
    decimalPlaces: 2,
    noiseSigma:    0.003,
  },
  "measuring-cylinder": {
    type:          "measuring-cylinder",
    label:         "Measuring Cylinder",
    unit:          "mL",
    resolution:    1.0,
    uncertainty:   0.5,
    minRange:      0,
    maxRange:      100,
    decimalPlaces: 0,
    noiseSigma:    0.15,
  },
  "stopwatch": {
    type:          "stopwatch",
    label:         "Digital Stopwatch",
    unit:          "s",
    resolution:    0.01,
    uncertainty:   0.01,
    minRange:      0,
    maxRange:      99999,
    decimalPlaces: 2,
    noiseSigma:    0.002,
  },
  "ph-meter": {
    type:          "ph-meter",
    label:         "pH Meter",
    unit:          "pH",
    resolution:    0.01,
    uncertainty:   0.02,
    minRange:      0,
    maxRange:      14,
    decimalPlaces: 2,
    noiseSigma:    0.004,
  },
  "conductivity-meter": {
    type:          "conductivity-meter",
    label:         "Conductivity Meter",
    unit:          "μS/cm",
    resolution:    0.1,
    uncertainty:   1.0,
    minRange:      0,
    maxRange:      2000,
    decimalPlaces: 1,
    noiseSigma:    0.3,
  },
  "gas-syringe": {
    type:          "gas-syringe",
    label:         "Gas Syringe",
    unit:          "L",
    resolution:    0.05,
    uncertainty:   0.025,
    minRange:      0,
    maxRange:      20,
    decimalPlaces: 2,
    noiseSigma:    0.008,
  },
  "manometer": {
    type:          "manometer",
    label:         "Manometer",
    unit:          "atm",
    resolution:    0.005,
    uncertainty:   0.005,
    minRange:      0,
    maxRange:      10,
    decimalPlaces: 3,
    noiseSigma:    0.001,
  },
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

/** Round a value to the nearest instrument graduation. */
function roundToResolution(value: number, resolution: number): number {
  return Math.round(value / resolution) * resolution;
}

/**
 * Count significant figures for a number rounded to a given number of decimal places.
 * E.g. 24.85 @ 2dp → "2485" → 4 sig figs.
 *      0.05  @ 2dp → "005"  → strip leading zeros → "5" → 1 sig fig.
 */
function countDisplaySigFigs(value: number, decimalPlaces: number): number {
  if (value === 0) return 1;
  const str      = Math.abs(value).toFixed(decimalPlaces).replace(".", "");
  const stripped = str.replace(/^0+/, "");
  return stripped.length || 1;
}

/** Sum the systematic biases from all active errors that affect this instrument. */
function sumBias(errors: ExperimentalError[], instrument: InstrumentType): number {
  return errors
    .filter((e) => e.active && e.affectsInstruments.includes(instrument))
    .reduce((acc, e) => acc + e.systematicBias, 0);
}

/** Collect labels of active errors affecting this instrument. */
function activeLabels(errors: ExperimentalError[], instrument: InstrumentType): string[] {
  return errors
    .filter((e) => e.active && e.affectsInstruments.includes(instrument))
    .map((e) => e.label);
}

// ─── Core reading generator ───────────────────────────────────────────────────

/**
 * Transform an engine (actual) value into a fully-characterised InstrumentReading.
 *
 * Steps:
 *  1. Apply systematic bias from active experimental errors.
 *  2. Clamp to instrument range.
 *  3. Round to instrument resolution (what the student reads).
 *  4. Compute uncertainty (doubled when uncalibrated).
 *  5. Derive relative/percentage uncertainties, sig figs, and format strings.
 *
 * Note: noise (noiseSigma) is intentionally NOT applied here to keep state
 * deterministic and testable. For UI "live fluctuation" effects, call
 * readInstrumentNoisy() instead.
 */
export function readInstrument(
  instrumentType: InstrumentType,
  actualValue:    number,
  options: {
    calibrated?:   boolean;
    activeErrors?: ExperimentalError[];
  } = {},
): InstrumentReading {
  const spec                         = INSTRUMENT_SPECS[instrumentType];
  const { calibrated = true, activeErrors = [] } = options;

  // 1. Bias from active errors
  const biased = actualValue + sumBias(activeErrors, instrumentType);

  // 2. Clamp to range
  const clamped = Math.max(spec.minRange, Math.min(spec.maxRange, biased));

  // 3. Round to resolution — the displayed value
  const displayedValue = roundToResolution(clamped, spec.resolution);

  // 4. Uncertainty — uncalibrated instruments have doubled uncertainty
  const uncertainty = calibrated ? spec.uncertainty : spec.uncertainty * 2;

  // 5. Derived statistics
  const relativeUncertainty = Math.abs(displayedValue) > 1e-9
    ? uncertainty / Math.abs(displayedValue)
    : 0;
  const percentageUncertainty = relativeUncertainty * 100;
  const sigFigs               = countDisplaySigFigs(displayedValue, spec.decimalPlaces);

  // 6. Format strings
  const dp                = spec.decimalPlaces;
  const formatted         = `${displayedValue.toFixed(dp)} ${spec.unit}`;
  const withUncertainty   = `${displayedValue.toFixed(dp)} ± ${uncertainty.toFixed(dp)} ${spec.unit}`;

  // 7. Error metadata
  const labels        = activeLabels(activeErrors, instrumentType);
  const hasActiveError = labels.length > 0;
  const activeErrorLabel = hasActiveError ? labels.join("; ") : null;

  return {
    instrument:            instrumentType,
    label:                 spec.label,
    actualValue,
    displayedValue,
    uncertainty,
    relativeUncertainty,
    percentageUncertainty,
    unit:                  spec.unit,
    sigFigs,
    formatted,
    withUncertainty,
    calibrated,
    hasActiveError,
    activeErrorLabel,
  };
}

/**
 * Like readInstrument() but adds Gaussian noise to simulate last-digit fluctuation.
 * Use this only for display effects (e.g., a "live" readout animation).
 * Do NOT store the result — it is non-deterministic.
 */
export function readInstrumentNoisy(
  instrumentType: InstrumentType,
  actualValue:    number,
  options: {
    calibrated?:   boolean;
    activeErrors?: ExperimentalError[];
  } = {},
): InstrumentReading {
  const spec     = INSTRUMENT_SPECS[instrumentType];
  // Box-Muller Gaussian noise
  let u: number, v: number, s: number;
  do {
    u = Math.random() * 2 - 1;
    v = Math.random() * 2 - 1;
    s = u * u + v * v;
  } while (s >= 1 || s === 0);
  const noise = spec.noiseSigma * u * Math.sqrt(-2 * Math.log(s) / s);
  return readInstrument(instrumentType, actualValue + noise, options);
}

// ─── Convenience wrappers ─────────────────────────────────────────────────────

type ReadOpts = Parameters<typeof readInstrument>[2];

export const readBalance           = (v: number, o?: ReadOpts) => readInstrument("analytical-balance",  v, o);
export const readThermometer       = (v: number, o?: ReadOpts) => readInstrument("thermometer",          v, o);
export const readBurette           = (v: number, o?: ReadOpts) => readInstrument("burette",              v, o);
export const readPipette           = (v: number, o?: ReadOpts) => readInstrument("pipette",              v, o);
export const readCylinder          = (v: number, o?: ReadOpts) => readInstrument("measuring-cylinder",   v, o);
export const readStopwatch         = (v: number, o?: ReadOpts) => readInstrument("stopwatch",            v, o);
export const readPHMeter           = (v: number, o?: ReadOpts) => readInstrument("ph-meter",             v, o);
export const readConductivityMeter = (v: number, o?: ReadOpts) => readInstrument("conductivity-meter",   v, o);
export const readGasSyringe        = (v: number, o?: ReadOpts) => readInstrument("gas-syringe",          v, o);
export const readManometer         = (v: number, o?: ReadOpts) => readInstrument("manometer",            v, o);
