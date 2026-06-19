/**
 * Significant Figures Utilities
 *
 * Implements IUPAC significant-figure rules for the two most common operations
 * in a chemistry laboratory:
 *
 *   Addition / Subtraction — answer is limited to the same number of DECIMAL
 *   PLACES as the least precise operand (e.g. 12.11 + 0.6 = 12.7, not 12.71).
 *
 *   Multiplication / Division — answer is limited to the same number of
 *   SIGNIFICANT FIGURES as the least precise operand (e.g. 2.3 × 1.47 = 3.4).
 *
 * All functions return a SigFigOperation record that includes both the result
 * and an educational explanation of the rule applied — suitable for display
 * in a lab notebook or results panel.
 */

import type { SigFigOperation } from "./types";

// ─── Counting helpers ─────────────────────────────────────────────────────────

/** Count significant figures in a number using string parsing. */
export function countSigFigs(value: number): number {
  if (value === 0) return 1;
  // Convert to fixed notation with enough precision, strip trailing zeros after decimal
  const abs  = Math.abs(value);
  const str  = abs.toPrecision(15).replace(/\.?0+$/, "");
  // Remove decimal point and leading zeros to isolate significant digits
  const core = str.replace(".", "").replace(/^0+/, "");
  return core.length || 1;
}

/** Count the number of decimal places in a number (0 for integers). */
export function countDecimalPlaces(value: number): number {
  const str      = Math.abs(value).toString();
  const dotIndex = str.indexOf(".");
  return dotIndex === -1 ? 0 : str.length - dotIndex - 1;
}

// ─── Rounding helpers ─────────────────────────────────────────────────────────

/** Round to a specific number of decimal places. */
export function roundToDecimalPlaces(value: number, places: number): number {
  const factor = Math.pow(10, places);
  return Math.round(value * factor) / factor;
}

/** Round to a specific number of significant figures. */
export function roundToSigFigs(value: number, sigFigs: number): number {
  if (value === 0) return 0;
  const magnitude = Math.floor(Math.log10(Math.abs(value)));
  const factor    = Math.pow(10, sigFigs - 1 - magnitude);
  return Math.round(value * factor) / factor;
}

// ─── Scientific notation ──────────────────────────────────────────────────────

/** Express a value in scientific notation with the given number of sig figs. */
export function toScientificNotation(value: number, sigFigs: number): string {
  return roundToSigFigs(value, sigFigs).toExponential(sigFigs - 1);
}

/**
 * Format a value to the correct number of sig figs, choosing between fixed and
 * scientific notation based on magnitude.
 */
export function formatSigFigs(value: number, sigFigs: number): string {
  if (value === 0) return "0";
  const magnitude = Math.floor(Math.log10(Math.abs(value)));
  if (magnitude >= sigFigs || magnitude < -3) {
    return toScientificNotation(value, sigFigs);
  }
  const decPlaces = Math.max(0, sigFigs - 1 - magnitude);
  return value.toFixed(decPlaces);
}

// ─── Operation calculators ────────────────────────────────────────────────────

/**
 * Apply the addition/subtraction sig-fig rule.
 *
 * The result is limited to the same number of DECIMAL PLACES as the least precise
 * operand. e.g. 12.11 + 0.6 → limited to 1 decimal place → 12.7
 */
export function addSubtract(
  a:         { value: number; decimalPlaces?: number },
  b:         { value: number; decimalPlaces?: number },
  operation: "add" | "subtract",
): SigFigOperation {
  const aDp = a.decimalPlaces ?? countDecimalPlaces(a.value);
  const bDp = b.decimalPlaces ?? countDecimalPlaces(b.value);

  const rawResult          = operation === "add" ? a.value + b.value : a.value - b.value;
  const limitingDp         = Math.min(aDp, bDp);
  const result             = roundToDecimalPlaces(rawResult, limitingDp);
  const aSigFigs           = countSigFigs(a.value);
  const bSigFigs           = countSigFigs(b.value);
  const resultSigFigs      = countSigFigs(result);

  return {
    operands: [
      { value: a.value, sigFigs: aSigFigs, decimalPlaces: aDp },
      { value: b.value, sigFigs: bSigFigs, decimalPlaces: bDp },
    ],
    operation,
    result,
    resultSigFigs,
    resultDecimalPlaces: limitingDp,
    formatted: result.toFixed(limitingDp),
    rule:
      `Addition/subtraction rule: the answer is limited to ` +
      `${limitingDp} decimal place${limitingDp !== 1 ? "s" : ""} ` +
      `(the least precise operand, ${limitingDp === aDp ? a.value : b.value}, ` +
      `has ${limitingDp} d.p.).`,
  };
}

/**
 * Apply the multiplication/division sig-fig rule.
 *
 * The result is limited to the same number of SIGNIFICANT FIGURES as the
 * least precise operand. e.g. 2.3 × 1.47 → limited to 2 sig figs → 3.4
 */
export function multiplyDivide(
  a:         { value: number; sigFigs?: number },
  b:         { value: number; sigFigs?: number },
  operation: "multiply" | "divide",
): SigFigOperation {
  const aSf = a.sigFigs ?? countSigFigs(a.value);
  const bSf = b.sigFigs ?? countSigFigs(b.value);

  const rawResult     = operation === "multiply" ? a.value * b.value : a.value / b.value;
  const limitingSf    = Math.min(aSf, bSf);
  const result        = roundToSigFigs(rawResult, limitingSf);
  const aDp           = countDecimalPlaces(a.value);
  const bDp           = countDecimalPlaces(b.value);
  const resultDp      = countDecimalPlaces(result);

  return {
    operands: [
      { value: a.value, sigFigs: aSf, decimalPlaces: aDp },
      { value: b.value, sigFigs: bSf, decimalPlaces: bDp },
    ],
    operation,
    result,
    resultSigFigs:       limitingSf,
    resultDecimalPlaces: resultDp,
    formatted: formatSigFigs(result, limitingSf),
    rule:
      `Multiplication/division rule: the answer is limited to ` +
      `${limitingSf} significant figure${limitingSf !== 1 ? "s" : ""} ` +
      `(the least precise operand, ${limitingSf === aSf ? a.value : b.value}, ` +
      `has ${limitingSf} s.f.).`,
  };
}

// ─── Convenience: apply rule from InstrumentReading ──────────────────────────

import type { InstrumentReading } from "./types";

/** Add two measured quantities using the addition/subtraction sig-fig rule. */
export function addReadings(a: InstrumentReading, b: InstrumentReading): SigFigOperation {
  return addSubtract(
    { value: a.displayedValue, decimalPlaces: a.sigFigs },
    { value: b.displayedValue, decimalPlaces: b.sigFigs },
    "add",
  );
}

/** Subtract two measured quantities using the addition/subtraction sig-fig rule. */
export function subtractReadings(a: InstrumentReading, b: InstrumentReading): SigFigOperation {
  return addSubtract(
    { value: a.displayedValue, decimalPlaces: a.sigFigs },
    { value: b.displayedValue, decimalPlaces: b.sigFigs },
    "subtract",
  );
}

/** Multiply two measured quantities using the multiplication/division sig-fig rule. */
export function multiplyReadings(a: InstrumentReading, b: InstrumentReading): SigFigOperation {
  return multiplyDivide(
    { value: a.displayedValue, sigFigs: a.sigFigs },
    { value: b.displayedValue, sigFigs: b.sigFigs },
    "multiply",
  );
}

/** Divide two measured quantities using the multiplication/division sig-fig rule. */
export function divideReadings(a: InstrumentReading, b: InstrumentReading): SigFigOperation {
  return multiplyDivide(
    { value: a.displayedValue, sigFigs: a.sigFigs },
    { value: b.displayedValue, sigFigs: b.sigFigs },
    "divide",
  );
}
