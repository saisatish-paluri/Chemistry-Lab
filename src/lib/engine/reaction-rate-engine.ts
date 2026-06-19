/**
 * Reaction Rate Engine — Chemical Kinetics (CaCO₃ + HCl → CO₂)
 *
 * Kinetic model: pseudo-first-order with respect to the solid reactant.
 * Rate = k_eff × [A]   where [A] = concFraction (0→1 fraction remaining).
 *
 * k_eff = BASE_RATE × temperatureFactor(T) × concentrationFactor([HCl])
 *                   × surfaceAreaFactor(SA) × envMultiplier × catalystFactor
 *
 * Arrhenius: k ∝ A·exp(-Ea/RT). Simplified to a Q₁₀ rule:
 *   temperatureFactor = 2^((T-25)/10)  (rate doubles per 10 °C)
 *
 * Catalyst: lowers activation energy, multiplying k by catalystFactor (2–5×).
 *
 * First-order decay: d[A]/dt = -k_eff·[A]
 *   concFraction(t) = e^(-k_eff·t)
 *   progress(t) = (1 − e^(-k_eff·t)) × 100
 *
 * Rate slows naturally as reactant is consumed — no scripted completion time.
 * Each session produces a unique rate curve due to session-rolled parameters.
 */

import type {
  ReactionRateState, SurfaceAreaType,
  ObservationEvent, StepDef, ExperimentObjective,
} from "./types";
import type { ReactionRateSimParams } from "./sim-bridge";

function uid(): string { return Math.random().toString(36).slice(2, 10); }

function mkObs(
  type: ObservationEvent["type"],
  message: string,
  severity: ObservationEvent["severity"],
): ObservationEvent {
  return { id: uid(), timestamp: Date.now(), type, message, severity };
}

// ─── Rate constants ───────────────────────────────────────────────────────────

export const BASE_RATE_PCT_PER_SEC = 1.5; // %/s at reference: 25 °C, 0.5 M, chips, no catalyst

export const SURFACE_AREA_FACTORS: Record<SurfaceAreaType, number> = {
  solid:    1.0,
  chips:    1.8,
  granules: 3.5,
  powder:   7.0,
};

export const SURFACE_AREA_LABELS: Record<SurfaceAreaType, string> = {
  solid:    "Solid Block",
  chips:    "Chips",
  granules: "Granules",
  powder:   "Powder",
};

/** Arrhenius-simplified: rate doubles every 10 °C above 25 °C. */
export function temperatureFactor(tempC: number): number {
  return Math.pow(2, (tempC - 25) / 10);
}

/** Concentration factor — linear, normalised to reference 0.5 M. */
export function concentrationFactor(concM: number): number {
  return concM / 0.5;
}

/** Overall initial rate multiplier (independent of reaction progress). */
export function calcRateMultiplier(
  tempC: number,
  concM: number,
  surfaceArea: SurfaceAreaType,
): number {
  return temperatureFactor(tempC) * concentrationFactor(concM) * SURFACE_AREA_FACTORS[surfaceArea];
}

/**
 * First-order progress increment for one tick.
 * Rate is proportional to the fraction of reactant remaining, so the
 * reaction decelerates as it proceeds — no constant-rate assumption.
 *
 * @param rateMultiplier  Combined k_eff scaling (temp × conc × SA × env × catalyst)
 * @param concFraction    Fraction of reactant left (1.0 at start → 0.0 at end)
 * @param deltaSec        Tick length in seconds
 */
export function calcProgressDelta(
  rateMultiplier: number,
  deltaSec: number,
  concFraction = 1.0,
): number {
  return BASE_RATE_PCT_PER_SEC * rateMultiplier * Math.max(0, concFraction) * deltaSec;
}

// ─── Steps & Objectives ───────────────────────────────────────────────────────

const INITIAL_STEPS: StepDef[] = [
  { id: "set-temp",     instruction: "Set the reaction temperature (15–80 °C).",           completed: false },
  { id: "set-conc",     instruction: "Set the reactant concentration (0.1–2.0 M).",        completed: false },
  { id: "set-surface",  instruction: "Choose the surface area of the solid reactant.",     completed: false },
  { id: "start",        instruction: "Start the reaction and observe the rate.",            completed: false },
  { id: "vary-factor",  instruction: "Change one factor and re-run to compare rates.",     completed: false },
];

const INITIAL_OBJECTIVES: ExperimentObjective[] = [
  { id: "configure",    description: "Configure all three rate factors",                   completed: false },
  { id: "run-once",     description: "Run the reaction to completion once",                completed: false },
  { id: "run-twice",    description: "Run with a different variable setting to compare",   completed: false },
];

export function initialReactionRateState(
  mode: ReactionRateState["mode"],
  simParams?: ReactionRateSimParams,
): ReactionRateState {
  const temp = simParams?.initialTempC    ?? 25;
  const conc = 0.5;
  const surf: SurfaceAreaType = "chips";
  const envMult     = simParams?.envRateMultiplier ?? 1.0;
  const sessBaseRate = simParams?.baseRatePctPerSec ?? BASE_RATE_PCT_PER_SEC;
  const catalystFactor = simParams?.catalystFactor ?? 1.0;

  return {
    mode, status: "idle",
    temperature: temp,
    concentration: conc,
    surfaceArea: surf,
    rateMultiplier: calcRateMultiplier(temp, conc, surf) * envMult,
    progress: 0,
    timeElapsed: 0,
    concFraction: 1.0,
    catalystAdded: false,
    dataPoints: [],
    steps:      INITIAL_STEPS.map((s) => ({ ...s })),
    objectives: INITIAL_OBJECTIVES.map((o) => ({ ...o })),
    observations: [
      mkObs("reaction-start",
        `Lab conditions: T = ${temp.toFixed(1)} °C. Base rate = ${sessBaseRate.toFixed(2)} %/s. ` +
        `Env. rate factor = ×${envMult.toFixed(3)}. ` +
        "First-order kinetics: rate slows as reactant is consumed.",
        "info"),
    ],
    result: null, startedAt: null,
    _envRateMultiplier: envMult,
    _baseRatePctPerSec: sessBaseRate,
    _catalystFactor:   catalystFactor,
  } as ReactionRateState;
}

export function setTemperature(state: ReactionRateState, tempC: number): ReactionRateState {
  if (state.status === "completed" || state.status === "failed") return state;
  const clamped = Math.max(15, Math.min(80, tempC));
  const rate = calcRateMultiplier(clamped, state.concentration, state.surfaceArea)
    * state._envRateMultiplier
    * (state.catalystAdded ? state._catalystFactor : 1.0);
  const wasRunning = state.status === "running";

  const newObs: ObservationEvent[] = [];
  if (wasRunning) {
    const direction = clamped > state.temperature ? "increased" : "decreased";
    newObs.push(mkObs(
      "rate-change",
      `Temperature ${direction} to ${clamped} °C — rate multiplier now ×${rate.toFixed(2)}. ` +
      `(Arrhenius factor: ×${temperatureFactor(clamped).toFixed(2)} — doubles per 10 °C rise.)`,
      clamped > state.temperature ? "success" : "info",
    ));
  }

  const steps = state.steps.map((s) => s.id === "set-temp" ? { ...s, completed: true } : s);

  return {
    ...state,
    temperature: clamped,
    rateMultiplier: rate,
    steps,
    observations: [...newObs, ...state.observations],
  };
}

export function setConcentration(state: ReactionRateState, concM: number): ReactionRateState {
  if (state.status === "completed" || state.status === "failed") return state;
  const clamped = Math.max(0.1, Math.min(2.0, concM));
  const rate = calcRateMultiplier(state.temperature, clamped, state.surfaceArea)
    * state._envRateMultiplier
    * (state.catalystAdded ? state._catalystFactor : 1.0);
  const wasRunning = state.status === "running";

  const newObs: ObservationEvent[] = [];
  if (wasRunning) {
    const direction = clamped > state.concentration ? "increased" : "decreased";
    newObs.push(mkObs(
      "rate-change",
      `Concentration ${direction} to ${clamped.toFixed(1)} M — rate multiplier now ×${rate.toFixed(2)}. ` +
      `(Factor: ×${concentrationFactor(clamped).toFixed(2)} vs reference 0.5 M.)`,
      clamped > state.concentration ? "success" : "info",
    ));
  }

  const steps = state.steps.map((s) => s.id === "set-conc" ? { ...s, completed: true } : s);

  return {
    ...state,
    concentration: clamped,
    rateMultiplier: rate,
    steps,
    observations: [...newObs, ...state.observations],
  };
}

export function setSurfaceArea(state: ReactionRateState, sa: SurfaceAreaType): ReactionRateState {
  if (state.status === "running" || state.status === "completed" || state.status === "failed") return state;
  const rate = calcRateMultiplier(state.temperature, state.concentration, sa)
    * state._envRateMultiplier
    * (state.catalystAdded ? state._catalystFactor : 1.0);
  const steps = state.steps.map((s) => s.id === "set-surface" ? { ...s, completed: true } : s);
  return {
    ...state,
    surfaceArea: sa,
    rateMultiplier: rate,
    steps,
    observations: [
      mkObs(
        "rate-change",
        `Surface area changed to ${SURFACE_AREA_LABELS[sa]} (factor ×${SURFACE_AREA_FACTORS[sa]}). ` +
        `${sa === "powder" ? "Maximum surface exposure — fastest reaction possible." : ""}`,
        "info",
      ),
      ...state.observations,
    ],
  };
}

/**
 * Add (or remove) a catalyst. Catalyst reduces activation energy, multiplying k_eff
 * by `_catalystFactor` (session-rolled 2–4×). This shifts the reaction profile
 * without changing stoichiometry.
 */
export function setCatalyst(state: ReactionRateState, add: boolean): ReactionRateState {
  if (state.status === "completed" || state.status === "failed") return state;
  if (state.catalystAdded === add) return state;

  const rate = calcRateMultiplier(state.temperature, state.concentration, state.surfaceArea)
    * state._envRateMultiplier
    * (add ? state._catalystFactor : 1.0);

  const catalystLabel = add
    ? `Catalyst added — k_eff multiplied by ×${state._catalystFactor.toFixed(1)}. Activation energy lowered.`
    : "Catalyst removed — reaction returns to uncatalysed rate.";

  return {
    ...state,
    catalystAdded: add,
    rateMultiplier: rate,
    observations: [
      mkObs("rate-change", catalystLabel, add ? "success" : "info"),
      ...state.observations,
    ],
  };
}

export function startReaction(state: ReactionRateState): ReactionRateState {
  if (state.status === "running" || state.status === "completed" || state.status === "failed") return state;

  const rate = calcRateMultiplier(state.temperature, state.concentration, state.surfaceArea)
    * state._envRateMultiplier
    * (state.catalystAdded ? state._catalystFactor : 1.0);

  const objectives = state.objectives.map((o) =>
    o.id === "configure" ? { ...o, completed: true } : o,
  );
  const steps = state.steps.map((s) => s.id === "start" ? { ...s, completed: true } : s);

  return {
    ...state,
    status: "running",
    progress: 0,
    timeElapsed: 0,
    concFraction: 1.0,
    dataPoints: [{ time: 0, progress: 0 }],
    rateMultiplier: rate,
    steps,
    objectives,
    startedAt: state.startedAt ?? Date.now(),
    observations: [
      mkObs(
        "reaction-start",
        `Reaction started — initial rate ×${rate.toFixed(2)} ` +
        `(T=${state.temperature} °C, [HCl]=${state.concentration.toFixed(1)} M, ` +
        `SA=${SURFACE_AREA_LABELS[state.surfaceArea]}` +
        (state.catalystAdded ? `, catalyst ×${state._catalystFactor.toFixed(1)}` : "") +
        `). First-order decay — rate decreases as reactant is consumed.`,
        "success",
      ),
      ...state.observations,
    ],
  };
}

export function stopReaction(state: ReactionRateState): ReactionRateState {
  if (state.status !== "running") return state;
  return {
    ...state,
    status: "setup",
    observations: [
      mkObs("reaction-start", `Reaction paused at ${state.progress.toFixed(1)}% — ${(state.concFraction * 100).toFixed(0)}% reactant remaining.`, "info"),
      ...state.observations,
    ],
  };
}

export function tickReaction(state: ReactionRateState, deltaSec: number): ReactionRateState {
  if (state.status !== "running") return state;

  // First-order kinetics: rate ∝ concFraction (fraction of reactant remaining).
  // Derive concFraction from progress so externally-set progress values (e.g. in tests)
  // are respected — progress is the canonical source of truth each tick.
  const k = (state._baseRatePctPerSec / 100) * state.rateMultiplier;
  const effectiveConc   = Math.max(0, 1 - state.progress / 100);
  const newConcFraction = effectiveConc * Math.exp(-k * deltaSec);
  const newProgress     = Math.min(99.9, (1 - newConcFraction) * 100);
  const newTime         = state.timeElapsed + deltaSec;
  const newPoints       = [...state.dataPoints, { time: newTime, progress: newProgress }];

  const newObs: ObservationEvent[] = [];
  let objectives = state.objectives;

  // Milestone observations
  if (state.progress < 25 && newProgress >= 25) {
    newObs.push(mkObs("rate-change", `25% complete — ${newTime.toFixed(1)} s. CO₂ bubbling strongly. Rate = ×${(state.rateMultiplier * newConcFraction).toFixed(2)}.`, "info"));
  }
  if (state.progress < 50 && newProgress >= 50) {
    newObs.push(mkObs("rate-change", `Half-way (50%) — ${newTime.toFixed(1)} s. Bubble rate visibly slower — acid concentration falling.`, "info"));
  }
  if (state.progress < 75 && newProgress >= 75) {
    newObs.push(mkObs("rate-change", `75% complete — ${newTime.toFixed(1)} s. Rate now ×${(state.rateMultiplier * newConcFraction).toFixed(3)} (first-order decay).`, "info"));
  }
  if (state.progress < 90 && newProgress >= 90) {
    newObs.push(mkObs("rate-change", `90% complete — few bubbles remain. Reaction approaching completion.`, "info"));
  }

  // Completion threshold: 99% consumed (asymptote never truly reaches 100%)
  if (newProgress >= 99) {
    objectives = objectives.map((o) => {
      if (o.id === "run-once") return { ...o, completed: true };
      return o;
    });

    const halfLife = Math.log(2) / k;
    const result = {
      completedAt: Date.now(),
      success: true,
      score: 100,
      summary:
        `Reaction complete in ${newTime.toFixed(1)} s ` +
        `(T=${state.temperature} °C, [HCl]=${state.concentration.toFixed(1)} M, SA=${SURFACE_AREA_LABELS[state.surfaceArea]}` +
        (state.catalystAdded ? `, catalyst ×${state._catalystFactor.toFixed(1)}` : "") + `). ` +
        `Half-life: ${halfLife.toFixed(1)} s. Rate multiplier: ×${state.rateMultiplier.toFixed(2)}.`,
      explanation:
        "CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g)\n\n" +
        "Reaction rate depends on:\n" +
        `• Temperature: factor ×${temperatureFactor(state.temperature).toFixed(2)} at ${state.temperature} °C (Arrhenius, Q₁₀ rule: doubles per 10 °C).\n` +
        `• Concentration: factor ×${concentrationFactor(state.concentration).toFixed(2)} at ${state.concentration.toFixed(1)} M (rate ∝ [HCl]).\n` +
        `• Surface area: factor ×${SURFACE_AREA_FACTORS[state.surfaceArea]} (${SURFACE_AREA_LABELS[state.surfaceArea]}) — more surface → more simultaneous collisions.\n` +
        (state.catalystAdded ? `• Catalyst: factor ×${state._catalystFactor.toFixed(1)} — lowers activation energy (Ea) without being consumed.\n` : "") +
        "\nFirst-order kinetics: rate = k[HCl] → rate slows as acid is consumed.\n" +
        `Half-life t½ = ln(2)/k = ${halfLife.toFixed(1)} s — half the reactant consumed in this time.\n` +
        "Try varying one factor at a time (controlled experiment) to isolate its effect.",
    };

    return {
      ...state,
      status: "completed",
      progress: 100,
      concFraction: 0.0,
      timeElapsed: newTime,
      dataPoints: newPoints,
      objectives,
      result,
      observations: [
        mkObs("reaction-complete", `Reaction complete — 100% consumed in ${newTime.toFixed(1)} s. k_eff = ${k.toFixed(4)} s⁻¹.`, "success"),
        ...newObs,
        ...state.observations,
      ],
    };
  }

  return {
    ...state,
    progress: newProgress,
    concFraction: newConcFraction,
    timeElapsed: newTime,
    dataPoints: newPoints,
    objectives,
    observations: newObs.length ? [...newObs, ...state.observations] : state.observations,
  };
}

export function resetReaction(state: ReactionRateState): ReactionRateState {
  const runsCompleted = state.result !== null;
  const steps = state.steps.map((s) =>
    s.id === "start" || s.id === "vary-factor" ? { ...s, completed: false } : s,
  );
  const objectives = state.objectives.map((o) => {
    if (o.id === "run-twice" && runsCompleted) return { ...o, completed: true };
    if (o.id === "run-once")  return { ...o, completed: false };
    return o;
  });

  return {
    ...state,
    status: "setup",
    progress: 0,
    concFraction: 1.0,
    timeElapsed: 0,
    dataPoints: [],
    result: null,
    steps: runsCompleted
      ? steps.map((s) => s.id === "vary-factor" ? { ...s, completed: false } : s)
      : steps,
    objectives,
    observations: runsCompleted
      ? [mkObs("rate-change", "Second run ready. Change one factor to compare the rate curve.", "info"), ...state.observations]
      : state.observations,
  };
}

export function resetReactionFull(mode: ReactionRateState["mode"]): ReactionRateState {
  return initialReactionRateState(mode);
}
