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

// ── Solubility limit of sucrose in water ──────────────────────────────────────
export function calculateSolubilityLimit(temp: number): number {
  // Sucrose solubility (g/100mL) vs temperature in °C
  return 180 + 1.5 * temp + 0.005 * Math.pow(temp, 2);
}

// Snaps a Celsius value to named temp
export function celsiusToDissolveTemp(tempCelsius: number): DissolveTemp {
  if (tempCelsius <= 22) return "cold";
  if (tempCelsius <= 60) return "warm";
  return "hot";
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

// ── Steps & objectives ────────────────────────────────────────────────────────
function makeSteps(): StepDef[] {
  return [
    { id: "s1", instruction: "Choose water temperature: Cold (5°C), Warm (40°C), or Hot (80°C).", hint: "Temperature increases diffusion coefficient and solubility.", completed: false },
    { id: "s2", instruction: "Choose sugar particle size: Coarse, Fine, or Powder.", hint: "Smaller particles have more exposed surface area.", completed: false },
    { id: "s3", instruction: "Select sugar mass to add and toggle stirring on/off.", hint: "Stirring reduces boundary layer thickness.", completed: false },
    { id: "s4", instruction: "Click \"Start Dissolving\" and watch the progress.", hint: "Will it dissolve fully or saturate the solution?", completed: false },
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
    massAdded:        10,
    dissolvedMass:    0,
    waterVolume:      100,
    celsius:          40,
    solubilityLimit:  248,
    surfaceArea:      1.0,
    isSaturated:      false,
  };
}

// ── Engine functions (pure) ───────────────────────────────────────────────────
export function setTemperature(
  state: DissolvingRateState,
  temp:  DissolveTemp,
): DissolvingRateState {
  const celsius = temp === "cold" ? 5 : temp === "warm" ? 40 : 80;
  const solubilityLimit = calculateSolubilityLimit(celsius);
  return {
    ...state,
    temperature:      temp,
    celsius,
    solubilityLimit,
    dissolveProgress: 0,
    isDissolving:     false,
    dissolveTime:     null,
    dissolvedMass:    0,
    isSaturated:      false,
  };
}

export function setGranularity(
  state:       DissolvingRateState,
  granularity: DissolveGranularity,
): DissolvingRateState {
  return { ...state, granularity, dissolveProgress: 0, isDissolving: false, dissolveTime: null, dissolvedMass: 0, isSaturated: false };
}

export function setStirring(state: DissolvingRateState, stirring: boolean): DissolvingRateState {
  return { ...state, stirring, dissolveProgress: 0, isDissolving: false, dissolveTime: null, dissolvedMass: 0, isSaturated: false };
}

export function updateDissolvingParameters(
  state: DissolvingRateState,
  changes: Partial<Pick<DissolvingRateState, "massAdded" | "waterVolume" | "celsius">>,
): DissolvingRateState {
  const massAdded = changes.massAdded !== undefined ? changes.massAdded : state.massAdded;
  const waterVolume = changes.waterVolume !== undefined ? changes.waterVolume : state.waterVolume;
  const celsius = changes.celsius !== undefined ? changes.celsius : state.celsius;
  const solubilityLimit = calculateSolubilityLimit(celsius);
  const temperature = celsiusToDissolveTemp(celsius);

  return {
    ...state,
    massAdded,
    waterVolume,
    celsius,
    temperature,
    solubilityLimit,
    dissolveProgress: 0,
    dissolvedMass:    0,
    isSaturated:      false,
  };
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
    dissolvedMass:    0,
    isSaturated:      false,
    startedAt:        Date.now(),
    steps,
    objectives:       state.objectives.map((o) =>
      o.id === "o1" ? { ...o, completed: true } : o,
    ),
    observations: [
      mkObs(
        "reaction-start",
        `Dissolving started: ${state.massAdded}g sugar in ${state.waterVolume}mL water. Condition: ${conditionLabel(state.temperature, state.granularity, state.stirring)}. Temperature: ${state.celsius}°C, Solubility limit: ${state.solubilityLimit.toFixed(1)} g/100mL.`,
        "info",
      ),
      ...state.observations,
    ],
  };
}

export function tickDissolveProgress(
  state: DissolvingRateState,
  delta: number, // simulated seconds elapsed per tick
): DissolvingRateState {
  if (!state.isDissolving) return state;

  const V = state.waterVolume;
  const T = state.celsius;
  const Cs = state.solubilityLimit;
  const dissolved = state.dissolvedMass;
  const remaining = state.massAdded - dissolved;

  // Concentration in g/100mL
  const C = dissolved * (100 / V);

  if (remaining <= 0.001) {
    return finishDissolving({ ...state, dissolvedMass: state.massAdded, dissolveProgress: 100 });
  }

  if (C >= Cs) {
    return finishDissolving({ ...state, isSaturated: true });
  }

  // Noyes-Whitney calculation
  const D = 0.5 + 0.015 * T; // Diffusion coefficient
  const a0 = state.granularity === "powder" ? 5.0 : state.granularity === "fine" ? 2.5 : 1.0;
  const A = a0 * Math.pow(remaining / state.massAdded, 2 / 3); // dynamic shrinking surface area
  const d = state.stirring ? 0.35 : 1.0; // boundary layer thickness

  const k_tune = 0.08; // tuning coefficient for visual time steps
  const rate = (D * A * Math.max(0, Cs - C) / d) * k_tune;

  // Add small experimental uncertainty/variance
  const noise = (Math.random() - 0.5) * 0.08 * rate;
  const dM = Math.max(0, (rate + noise) * delta);

  const nextDissolved = Math.min(state.massAdded, dissolved + dM);
  const nextC = nextDissolved * (100 / V);
  const progress = Math.min(100, (nextDissolved / state.massAdded) * 100);

  if (nextC >= Cs) {
    return finishDissolving({ ...state, dissolvedMass: nextDissolved, dissolveProgress: progress, isSaturated: true });
  }

  if (nextDissolved >= state.massAdded) {
    return finishDissolving({ ...state, dissolvedMass: state.massAdded, dissolveProgress: 100 });
  }

  return {
    ...state,
    dissolvedMass: nextDissolved,
    dissolveProgress: progress,
    surfaceArea: A,
  };
}

function finishDissolving(state: DissolvingRateState): DissolvingRateState {
  const elapsedMs = Date.now() - (state.startedAt ?? Date.now());
  const time = Math.round(elapsedMs / 100) / 10; // simulated elapsed time (seconds)
  
  const label = conditionLabel(state.temperature, state.granularity, state.stirring) + 
    ` (${state.massAdded}g sugar)`;
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

  const msg = state.isSaturated
    ? `Solution saturated! Saturated at ${state.dissolvedMass.toFixed(1)}g dissolved. Solubility limit: ${state.solubilityLimit.toFixed(1)} g/100mL. (time: ${time}s)`
    : `Sugar fully dissolved in ${time}s under: ${label}`;

  return {
    ...state,
    status:           "ready",
    isDissolving:     false,
    dissolveProgress: state.isSaturated ? state.dissolveProgress : 100,
    dissolveTime:     time,
    dataPoints,
    steps,
    objectives,
    observations: [
      mkObs(
        state.isSaturated ? "endpoint-reached" : "reaction-complete",
        msg,
        state.isSaturated ? "warning" : "success",
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
        "(3) Stirring — keeps fresh solvent in contact with undissolved solid. " +
        "If you add more solute than the solubility limit, the solution reaches saturation, and no more solid dissolves.",
    },
  };
}

export function resetDissolving(state: DissolvingRateState): DissolvingRateState {
  return initialDissolvingState(state.mode);
}
