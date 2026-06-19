/**
 * Environment Engine
 *
 * Generates a session-based laboratory environment (temperature, pressure,
 * humidity) and derives its effects on chemistry simulations.
 *
 * Reference temperature: 25 °C (298.15 K) — IUPAC standard
 * Arrhenius approximation: rate ∝ 2^(ΔT / 10)  (Q₁₀ = 2 rule of thumb)
 */

import type { EnvironmentConfig, EnvironmentEffects, EnvironmentState } from "./types";

const REF_TEMP_C  = 25.0;  // °C
const REF_PRES_ATM = 1.0;  // atm
const STP_TEMP_K  = 273.15; // K

/** Gaussian random via Box-Muller. */
function gauss(mean: number, sigma: number): number {
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

function computeEffects(
  tempC:   number,
  presAtm: number,
  humidity: number,
): EnvironmentEffects {
  const deltaT = tempC - REF_TEMP_C;

  // Q₁₀ rule: rate doubles every 10 °C above reference
  const rateMultiplier = Math.pow(2, deltaT / 10);

  // Ideal gas: V ∝ T/P (relative to STP 273.15 K, 1 atm)
  const tempK       = tempC + 273.15;
  const gasVolumeAdj = (tempK / STP_TEMP_K) / (presAtm / REF_PRES_ATM);

  // van't Hoff approximation: solubility of most salts increases ~2 % per °C
  const solubilityAdj = 1 + (deltaT * 0.02);

  // Evaporation increases with temperature, decreases with humidity
  const evaporationAdj = Math.pow(1.07, deltaT) * (1 - (humidity - 50) / 200);

  // Temperature offset from standard (pure offset, no multiplication)
  const calorimetryTempOffset = deltaT;

  return {
    rateMultiplier:        clamp(rateMultiplier, 0.1, 10),
    gasVolumeAdj:          clamp(gasVolumeAdj, 0.8, 1.3),
    solubilityAdj:         clamp(solubilityAdj, 0.5, 2.0),
    evaporationAdj:        clamp(evaporationAdj, 0.2, 5.0),
    calorimetryTempOffset,
  };
}

/**
 * Generate a session-based lab environment.
 *
 * Values are rolled once per session using Gaussian distributions centred on
 * realistic lab conditions, so every session feels slightly different.
 */
export function createEnvironment(config: EnvironmentConfig = {}): EnvironmentState {
  const [tMin, tMax] = config.temperatureRange ?? [20, 26];
  const [pMin, pMax] = config.pressureRange    ?? [0.97, 1.03];
  const [hMin, hMax] = config.humidityRange    ?? [30, 70];

  const tMid    = (tMin + tMax) / 2;
  const tSigma  = (tMax - tMin) / 6; // 3σ within range
  const pMid    = (pMin + pMax) / 2;
  const pSigma  = (pMax - pMin) / 6;
  const hMid    = (hMin + hMax) / 2;
  const hSigma  = (hMax - hMin) / 6;

  const temperatureC = clamp(Math.round(gauss(tMid, tSigma) * 10) / 10, tMin, tMax);
  const pressureAtm  = clamp(Math.round(gauss(pMid, pSigma) * 1000) / 1000, pMin, pMax);
  const humidityPct  = clamp(Math.round(gauss(hMid, hSigma)), hMin, hMax);

  return {
    temperatureC,
    pressureAtm,
    humidityPct,
    effects: computeEffects(temperatureC, pressureAtm, humidityPct),
  };
}

/** Adjust a reaction rate using the session environment. */
export function applyRateEffect(baseRate: number, env: EnvironmentState): number {
  return baseRate * env.effects.rateMultiplier;
}

/** Adjust a gas volume using the session environment (relative to STP). */
export function applyGasVolumeEffect(baseVolumeMl: number, env: EnvironmentState): number {
  return baseVolumeMl * env.effects.gasVolumeAdj;
}

/** Adjust a solubility value using the session environment. */
export function applySolubilityEffect(baseKsp: number, env: EnvironmentState): number {
  return baseKsp * env.effects.solubilityAdj;
}

/**
 * Describe the environment state as a human-readable string for display.
 * e.g. "Lab: 22.4 °C, 1.002 atm, 45 % RH"
 */
export function describeEnvironment(env: EnvironmentState): string {
  return (
    `Lab conditions: ${env.temperatureC.toFixed(1)} °C, ` +
    `${env.pressureAtm.toFixed(3)} atm, ` +
    `${env.humidityPct} % RH`
  );
}

/** Get a human-readable note about how the environment affects the current experiment. */
export function getEnvironmentNote(env: EnvironmentState, domain: string): string {
  const dt = env.temperatureC - REF_TEMP_C;
  if (Math.abs(dt) < 0.5) return "";

  const direction = dt > 0 ? "above" : "below";
  const absDt     = Math.abs(dt).toFixed(1);

  switch (domain) {
    case "gas-laws":
    case "gas-collection":
      return `Ambient ${absDt} °C ${direction} 25 °C — gas volumes corrected (×${env.effects.gasVolumeAdj.toFixed(3)}).`;
    case "calorimetry":
    case "neutralization":
      return `Initial temperature ${env.temperatureC.toFixed(1)} °C (${absDt} °C ${direction} standard).`;
    case "titration":
    case "equilibrium":
      return `Lab at ${env.temperatureC.toFixed(1)} °C — reaction rates ${dt > 0 ? "increased" : "reduced"} by ×${env.effects.rateMultiplier.toFixed(2)}.`;
    case "dissolving-rate":
      return `Temperature ${env.temperatureC.toFixed(1)} °C — dissolution ${dt > 0 ? "faster" : "slower"} than standard.`;
    default:
      return `Lab temperature ${env.temperatureC.toFixed(1)} °C.`;
  }
}
