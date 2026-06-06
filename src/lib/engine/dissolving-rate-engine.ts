import type {
  DissolvingRateState, DissolveTemp, DissolveGranularity,
  DissolvingDataPoint, ObservationEvent, StepDef, ExperimentObjective,
} from "./types";

function uid(): string { return Math.random().toString(36).slice(2, 10); }

function mkObs(
  type: ObservationEvent["type"],
  message: string,
  severity: ObservationEvent["severity"],
): ObservationEvent {
  return { id: uid(), timestamp: Date.now(), type, message, severity };
}

// ── Dissolving time model ─────────────────────────────────────────────────────
// Base time (seconds) that stirring, temp, and granularity each modify.
const BASE_TIME = 120; // 120 simulated seconds for cold, coarse, no-stir

const TEMP_FACTOR: Record<DissolveTemp, number> = {
  cold: 1.00,
  warm: 0.55,
  hot:  0.25,
};

const GRAIN_FACTOR: Record<DissolveGranularity, number> = {
  coarse: 1.00,
  fine:   0.65,
  powder: 0.35,
};

const STIR_FACTOR = 0.50; // halves the time

export function calcDissolveTime(
  temp:        DissolveTemp,
  granularity: DissolveGranularity,
  stirring:    boolean,
): number {
  const t = BASE_TIME * TEMP_FACTOR[temp] * GRAIN_FACTOR[granularity] * (stirring ? STIR_FACTOR : 1);
  return Math.round(t);
}

/**
 * Variant that accepts a continuous Celsius temperature (5–100 °C).
 * Interpolates the temperature factor between the reference points:
 *   5 °C → 1.00 (cold), 40 °C → 0.55 (warm), 80 °C → 0.25 (hot)
 */
export function calcDissolveTimeFromCelsius(
  tempCelsius: number,
  granularity: DissolveGranularity,
  stirring:    boolean,
): number {
  const factor = interpolateTempFactor(tempCelsius);
  const t = BASE_TIME * factor * GRAIN_FACTOR[granularity] * (stirring ? STIR_FACTOR : 1);
  return Math.round(Math.max(3, t));
}

/** Map Celsius → dissolving-time factor via linear interpolation. */
export function interpolateTempFactor(tempCelsius: number): number {
  const t = Math.max(5, Math.min(100, tempCelsius));
  if (t <= 5)  return 1.00;
  if (t <= 40) return 1.00 + ((t - 5)  / 35) * (0.55 - 1.00);
  if (t <= 80) return 0.55 + ((t - 40) / 40) * (0.25 - 0.55);
  return 0.25 + ((t - 80) / 20) * (0.15 - 0.25); // very hot tail
}

/** Snap a Celsius value to the nearest named DissolveTemp. */
export function celsiusToDissolveTemp(tempCelsius: number): DissolveTemp {
  if (tempCelsius <= 22) return "cold";
  if (tempCelsius <= 60) return "warm";
  return "hot";
}

/** Human-readable label for a celsius temperature value. */
export function celsiusLabel(tempCelsius: number): string {
  return `${Math.round(tempCelsius)} °C`;
}

export function conditionLabel(
  temp:        DissolveTemp,
  granularity: DissolveGranularity,
  stirring:    boolean,
): string {
  const tempLabel = { cold: "Cold", warm: "Warm", hot: "Hot" }[temp];
  const grainLabel = { coarse: "Coarse", fine: "Fine", powder: "Powder" }[granularity];
  const stirLabel = stirring ? "Stirred" : "Unstirred";
  return `${tempLabel} / ${grainLabel} / ${stirLabel}`;
}

export function conditionLabelCelsius(
  tempCelsius: number,
  granularity: DissolveGranularity,
  stirring:    boolean,
): string {
  const grainLabel = { coarse: "Coarse", fine: "Fine", powder: "Powder" }[granularity];
  const stirLabel = stirring ? "Stirred" : "Unstirred";
  return `${Math.round(tempCelsius)} °C / ${grainLabel} / ${stirLabel}`;
}

// ── Steps & objectives ────────────────────────────────────────────────────────
function makeSteps(): StepDef[] {
  return [
    { id: "s1", instruction: "Choose water temperature: Cold (5°C), Warm (40°C), or Hot (80°C).", hint: "Temperature gives molecules more kinetic energy.", completed: false },
    { id: "s2", instruction: "Choose sugar particle size: Coarse, Fine, or Powder.", hint: "Smaller particles have more surface area exposed.", completed: false },
    { id: "s3", instruction: "Toggle stirring on or off.", hint: "Stirring brings fresh solvent into contact with the solid.", completed: false },
    { id: "s4", instruction: "Click \"Start Dissolving\" and watch the progress.", hint: "The beaker animation speeds up with favourable conditions.", completed: false },
    { id: "s5", instruction: "Record the result then change one variable and repeat.", hint: "Change only ONE variable at a time (controlled experiment).", completed: false },
    { id: "s6", instruction: "Collect at least 3 data points then click \"Complete Lab\".", hint: "Compare the bar chart to see which factor has the biggest effect.", completed: false },
  ];
}

function makeObjectives(): ExperimentObjective[] {
  return [
    { id: "o1", description: "Run the dissolving experiment at least once.", completed: false },
    { id: "o2", description: "Compare at least 2 different temperature settings.", completed: false },
    { id: "o3", description: "Compare at least 2 different granularity settings.", completed: false },
    { id: "o4", description: "Collect 4 or more data points for the bar chart.", completed: false },
  ];
}

// ── Initial state ─────────────────────────────────────────────────────────────
export function initialDissolvingState(mode: DissolvingRateState["mode"]): DissolvingRateState {
  return {
    mode,
    status:           "idle",
    temperature:      "warm",
    granularity:      "coarse",
    stirring:         false,
    isDissolving:     false,
    dissolveProgress: 0,
    dissolveTime:     null,
    dataPoints:       [],
    steps:            makeSteps(),
    objectives:       makeObjectives(),
    observations:     [],
    result:           null,
    startedAt:        null,
  };
}

// ── Engine functions (pure) ───────────────────────────────────────────────────
export function setTemperature(
  state: DissolvingRateState,
  temp:  DissolveTemp,
): DissolvingRateState {
  return { ...state, temperature: temp, dissolveProgress: 0, isDissolving: false, dissolveTime: null };
}

export function setGranularity(
  state:       DissolvingRateState,
  granularity: DissolveGranularity,
): DissolvingRateState {
  return { ...state, granularity, dissolveProgress: 0, isDissolving: false, dissolveTime: null };
}

export function setStirring(state: DissolvingRateState, stirring: boolean): DissolvingRateState {
  return { ...state, stirring, dissolveProgress: 0, isDissolving: false, dissolveTime: null };
}

export function startDissolving(state: DissolvingRateState): DissolvingRateState {
  const steps = state.steps.map((s) => {
    if (s.id === "s1" || s.id === "s2" || s.id === "s3") return { ...s, completed: true };
    if (s.id === "s4") return { ...s, completed: true };
    return s;
  });
  return {
    ...state,
    status:           "running",
    isDissolving:     true,
    dissolveProgress: 0,
    dissolveTime:     null,
    startedAt:        state.startedAt ?? Date.now(),
    steps,
    objectives:       state.objectives.map((o) =>
      o.id === "o1" ? { ...o, completed: true } : o,
    ),
    observations: [
      mkObs(
        "reaction-start",
        `Dissolving started: ${conditionLabel(state.temperature, state.granularity, state.stirring)}`,
        "info",
      ),
      ...state.observations,
    ],
  };
}

export function tickDissolveProgress(
  state: DissolvingRateState,
  delta: number, // seconds elapsed (real-time tick)
): DissolvingRateState {
  if (!state.isDissolving) return state;
  const totalTime = calcDissolveTime(state.temperature, state.granularity, state.stirring);
  const increment = (delta / totalTime) * 100;
  const newProgress = Math.min(100, state.dissolveProgress + increment);
  if (newProgress >= 100) {
    return finishDissolving({ ...state, dissolveProgress: 100 });
  }
  return { ...state, dissolveProgress: newProgress };
}

function finishDissolving(state: DissolvingRateState): DissolvingRateState {
  const time    = calcDissolveTime(state.temperature, state.granularity, state.stirring);
  const label   = conditionLabel(state.temperature, state.granularity, state.stirring);
  const newPoint: DissolvingDataPoint = { label, time };

  const dataPoints = [...state.dataPoints, newPoint];

  // Check for objective completions
  const tempSettings  = dataPoints.map((dp) => dp.label.split(" / ")[0]);
  const grainSettings = dataPoints.map((dp) => dp.label.split(" / ")[1]);
  const uniqueTemps   = new Set(tempSettings).size;
  const uniqueGrains  = new Set(grainSettings).size;

  const objectives = state.objectives.map((o) => {
    if (o.id === "o1") return { ...o, completed: true };
    if (o.id === "o2" && uniqueTemps >= 2)     return { ...o, completed: true };
    if (o.id === "o3" && uniqueGrains >= 2)    return { ...o, completed: true };
    if (o.id === "o4" && dataPoints.length >= 4) return { ...o, completed: true };
    return o;
  });

  const steps = state.steps.map((s) => {
    if (s.id === "s5") return { ...s, completed: dataPoints.length >= 2 };
    if (s.id === "s6") return { ...s, completed: dataPoints.length >= 3 };
    return s;
  });

  return {
    ...state,
    status:           "ready",
    isDissolving:     false,
    dissolveProgress: 100,
    dissolveTime:     time,
    dataPoints,
    steps,
    objectives,
    observations: [
      mkObs(
        "reaction-complete",
        `Sugar fully dissolved in ${time}s under: ${label}`,
        "success",
      ),
      ...state.observations,
    ],
  };
}

export function completeDissolvingRate(state: DissolvingRateState): DissolvingRateState {
  const points = state.dataPoints.length;
  const score  = Math.min(100, Math.round((points / 4) * 80 + (state.objectives.filter((o) => o.completed).length / 4) * 20));

  return {
    ...state,
    status: "completed",
    result: {
      completedAt: Date.now(),
      success:     points >= 2,
      score,
      summary:     `Collected ${points} data points. ${points >= 3 ? "Excellent comparison!" : "Try collecting more data points for a better comparison."}`,
      explanation:
        "Dissolving rate increases with: (1) Higher temperature — molecules have more energy to break bonds. " +
        "(2) Smaller particle size — more surface area exposed to the solvent. " +
        "(3) Stirring — keeps fresh solvent in contact with undissolved solid.",
    },
  };
}

export function resetDissolving(state: DissolvingRateState): DissolvingRateState {
  return initialDissolvingState(state.mode);
}
