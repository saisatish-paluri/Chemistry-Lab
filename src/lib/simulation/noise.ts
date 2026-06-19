/**
 * Scientific Noise Engine
 *
 * Adds realistic measurement variation to simulation values.
 * Uses Box-Muller Gaussian noise (same method as the existing instruments layer)
 * but as a standalone, instrument-agnostic utility.
 *
 * Rule: always store the true (noiseless) value in state; apply noise only at
 * the display layer to keep state deterministic and comparable.
 */

import type { NoisyReading, MeasurementSet } from "./types";

// ─── Gaussian Sampling ────────────────────────────────────────────────────────

/** Returns a Gaussian-distributed sample with given mean and std. deviation. */
export function gaussianSample(mean: number, sigma: number): number {
  let u: number, v: number, s: number;
  do {
    u = Math.random() * 2 - 1;
    v = Math.random() * 2 - 1;
    s = u * u + v * v;
  } while (s >= 1 || s === 0);
  return mean + sigma * u * Math.sqrt(-2 * Math.log(s) / s);
}

// ─── Single Reading ───────────────────────────────────────────────────────────

/**
 * Add Gaussian noise to a value and round to a given resolution.
 *
 * @param actual      True engine value.
 * @param sigma       Noise standard deviation (same units as actual).
 * @param resolution  Smallest readable unit (e.g. 0.01 for a 2-dp instrument).
 * @param dp          Decimal places for display string.
 */
export function noisyReading(
  actual:     number,
  sigma:      number,
  resolution: number,
  dp:         number,
): NoisyReading {
  const noise     = gaussianSample(0, sigma);
  const biased    = actual + noise;
  const displayed = Math.round(biased / resolution) * resolution;
  const sigFigs   = countSigFigs(displayed, dp);

  return {
    actual,
    displayed,
    noise,
    sigFigs,
    formatted: displayed.toFixed(dp),
  };
}

// ─── Measurement Set ──────────────────────────────────────────────────────────

/**
 * Generate n repeated measurements of the same quantity with random noise.
 * Simulates the natural spread a student would observe taking multiple readings.
 *
 * @param actual      True value.
 * @param sigma       Noise σ.
 * @param resolution  Instrument graduation.
 * @param dp          Display decimal places.
 * @param n           Number of readings (default 3).
 */
export function measurementSet(
  actual:     number,
  sigma:      number,
  resolution: number,
  dp:         number,
  n = 3,
): MeasurementSet {
  const readings = Array.from({ length: n }, () =>
    noisyReading(actual, sigma, resolution, dp),
  );

  const displayed = readings.map((r) => r.displayed);
  const mean      = displayed.reduce((a, b) => a + b, 0) / n;
  const variance  = displayed.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1 || 1);
  const stdDev    = Math.sqrt(variance);
  const range     = Math.max(...displayed) - Math.min(...displayed);

  return { readings, mean, stdDev, range, n };
}

// ─── Rounding Utilities ───────────────────────────────────────────────────────

/** Round a value to n significant figures. */
export function roundToSigFigs(value: number, n: number): number {
  if (value === 0) return 0;
  const d = Math.ceil(Math.log10(Math.abs(value)));
  const factor = Math.pow(10, n - d);
  return Math.round(value * factor) / factor;
}

/** Count significant figures of a formatted number. */
export function countSigFigs(value: number, dp: number): number {
  if (value === 0) return 1;
  const str     = Math.abs(value).toFixed(dp).replace(".", "");
  const trimmed = str.replace(/^0+/, "");
  return trimmed.length || 1;
}

/**
 * Quantisation noise: picks the nearest graduation mark.
 * Models the ±½ graduation interpolation error of analogue instruments.
 */
export function quantise(value: number, resolution: number): number {
  return Math.round(value / resolution) * resolution;
}

// ─── Preset Noise Profiles ────────────────────────────────────────────────────

/**
 * Common noise parameters keyed by instrument type.
 * Mirrors the noiseSigma values in instruments.ts without coupling to that module.
 */
export const NOISE_PROFILES = {
  balance:           { sigma: 0.0003, resolution: 0.001, dp: 3 },
  thermometer:       { sigma: 0.03,   resolution: 0.1,   dp: 1 },
  burette:           { sigma: 0.008,  resolution: 0.05,  dp: 2 },
  pipette:           { sigma: 0.003,  resolution: 0.01,  dp: 2 },
  measuringCylinder: { sigma: 0.15,   resolution: 1.0,   dp: 0 },
  stopwatch:         { sigma: 0.002,  resolution: 0.01,  dp: 2 },
  phMeter:           { sigma: 0.004,  resolution: 0.01,  dp: 2 },
  conductivityMeter: { sigma: 0.30,   resolution: 0.1,   dp: 1 },
  gasSyringe:        { sigma: 0.008,  resolution: 0.05,  dp: 2 },
  manometer:         { sigma: 0.001,  resolution: 0.005, dp: 3 },
} as const;

export type NoiseProfileKey = keyof typeof NOISE_PROFILES;

/** Generate a noisy reading using a named preset profile. */
export function noisyReadingFromProfile(
  actual:       number,
  profileKey:   NoiseProfileKey,
): NoisyReading {
  const p = NOISE_PROFILES[profileKey];
  return noisyReading(actual, p.sigma, p.resolution, p.dp);
}
