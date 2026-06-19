/**
 * Measurement Uncertainty System
 *
 * Implements GUM (Guide to the Expression of Uncertainty in Measurement)
 * propagation rules for the two fundamental cases:
 *
 *   Addition / Subtraction: combine ABSOLUTE uncertainties in quadrature.
 *     u(z) = √(u(a)² + u(b)²)   [independent, random errors]
 *
 *   Multiplication / Division: combine RELATIVE uncertainties in quadrature.
 *     u_r(z) = √(u_r(a)² + u_r(b)²)   → u(z) = |z| × u_r(z)
 *
 * Simple (non-quadrature) addition is also provided for systematic errors.
 *
 * All public functions accept InstrumentReading objects and return either a
 * plain number (for use in calculations) or an UncertaintyBudget (for display).
 */

import type { InstrumentReading, UncertaintyBudget } from "./types";

// ─── Single-reading accessors ─────────────────────────────────────────────────

export function absoluteUncertainty(r: InstrumentReading): number {
  return r.uncertainty;
}

export function relativeUncertainty(r: InstrumentReading): number {
  return r.relativeUncertainty;
}

export function percentageUncertainty(r: InstrumentReading): number {
  return r.percentageUncertainty;
}

// ─── Propagation — quadrature (GUM recommended for random/independent errors) ─

/**
 * Propagate absolute uncertainty for addition or subtraction.
 * u_combined = √(Σ u_i²)
 */
export function propagateAddSubtract(readings: InstrumentReading[]): number {
  return Math.sqrt(readings.reduce((acc, r) => acc + r.uncertainty * r.uncertainty, 0));
}

/**
 * Propagate absolute uncertainty for multiplication or division.
 * First combines relative uncertainties in quadrature, then scales by |result|.
 *
 * @param result The calculated result value (needed to convert back to absolute).
 */
export function propagateMulDiv(readings: InstrumentReading[], result: number): number {
  const relSq = readings.reduce((acc, r) => acc + r.relativeUncertainty * r.relativeUncertainty, 0);
  return Math.abs(result) * Math.sqrt(relSq);
}

// ─── Propagation — simple (for systematic errors, upper-bound estimates) ──────

/** Add absolute uncertainties linearly (conservative upper bound). */
export function propagateAddSubtractSimple(readings: InstrumentReading[]): number {
  return readings.reduce((acc, r) => acc + r.uncertainty, 0);
}

/** Add relative uncertainties linearly (conservative upper bound). */
export function propagateMulDivSimple(readings: InstrumentReading[], result: number): number {
  const relSum = readings.reduce((acc, r) => acc + r.relativeUncertainty, 0);
  return Math.abs(result) * relSum;
}

// ─── Difference uncertainty ───────────────────────────────────────────────────

/**
 * Uncertainty in a difference between two readings (e.g. final - initial burette).
 * Particularly important for burette readings where two independent readings are subtracted.
 *
 * u(V) = √(u_final² + u_initial²)
 *
 * @returns Object with the calculated difference, combined uncertainty, and formatted string.
 */
export function uncertaintyInDifference(
  final:   InstrumentReading,
  initial: InstrumentReading,
): { value: number; uncertainty: number; formatted: string } {
  const value       = final.displayedValue - initial.displayedValue;
  const combined    = Math.sqrt(final.uncertainty ** 2 + initial.uncertainty ** 2);
  const dp          = Math.max(
    -Math.floor(Math.log10(final.uncertainty + 1e-15)),
    -Math.floor(Math.log10(initial.uncertainty + 1e-15)),
  );
  const formatted   = `${value.toFixed(dp)} ± ${combined.toFixed(dp)} ${final.unit}`;
  return { value, uncertainty: combined, formatted };
}

// ─── Uncertainty budget ───────────────────────────────────────────────────────

/**
 * Build a complete uncertainty budget from a set of contributing readings.
 * Uses quadrature (GUM) combination for the absolute uncertainty of a sum,
 * and quadrature of relatives for a product.
 */
export function buildUncertaintyBudget(readings: InstrumentReading[]): UncertaintyBudget {
  const combinedAbsolute  = propagateAddSubtract(readings);
  const relSq             = readings.reduce((acc, r) => acc + r.relativeUncertainty ** 2, 0);
  const combinedRelative  = Math.sqrt(relSq);
  const combinedPercentage = combinedRelative * 100;

  const lines = readings.map(
    (r) =>
      `${r.label}: ${r.withUncertainty} (${r.percentageUncertainty.toFixed(2)}%)`,
  );

  return {
    measurements:        readings,
    combinedAbsolute,
    combinedRelative,
    combinedPercentage,
    formatted:           lines.join(" | "),
  };
}

// ─── Format helpers ───────────────────────────────────────────────────────────

/** Format a value with its absolute uncertainty. E.g. "25.00 ± 0.05 mL" */
export function formatWithUncertainty(
  value:       number,
  uncertainty: number,
  unit:        string,
  dp:          number,
): string {
  return `${value.toFixed(dp)} ± ${uncertainty.toFixed(dp)} ${unit}`;
}

/** Format a percentage uncertainty. E.g. "0.20%" */
export function formatPercentageUncertainty(reading: InstrumentReading): string {
  return `${reading.percentageUncertainty.toFixed(2)}%`;
}

/** Format the combined budget as a tidy multi-line string for a results panel. */
export function formatBudgetLines(budget: UncertaintyBudget): string[] {
  const lines = budget.measurements.map(
    (r) =>
      `• ${r.label}: ${r.withUncertainty}  (${r.percentageUncertainty.toFixed(2)}% uncertainty)`,
  );
  lines.push(`→ Combined: ±${budget.combinedAbsolute.toFixed(3)} (${budget.combinedPercentage.toFixed(2)}%)`);
  return lines;
}
