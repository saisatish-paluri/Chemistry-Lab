import type {
  ReactionRateState, SurfaceAreaType,
  ObservationEvent, StepDef, ExperimentObjective,
} from "./types";

function uid(): string { return Math.random().toString(36).slice(2, 10); }

function mkObs(
  type: ObservationEvent["type"],
  message: string,
  severity: ObservationEvent["severity"],
): ObservationEvent {
  return { id: uid(), timestamp: Date.now(), type, message, severity };
}

// ─── Rate Calculation ─────────────────────────────────────────────────────────

export const BASE_RATE_PCT_PER_SEC = 1.5; // % per second at reference conditions

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

/** Arrhenius-simplified temperature factor: rate doubles every 10 °C above 25 °C */
export function temperatureFactor(tempC: number): number {
  return Math.pow(2, (tempC - 25) / 10);
}

/** Concentration factor — linear, normalised to reference 0.5 M */
export function concentrationFactor(concM: number): number {
  return concM / 0.5;
}

/** Overall rate multiplier combining all three factors */
export function calcRateMultiplier(
  tempC: number,
  concM: number,
  surfaceArea: SurfaceAreaType,
): number {
  return temperatureFactor(tempC) * concentrationFactor(concM) * SURFACE_AREA_FACTORS[surfaceArea];
}

/** Progress gain per tick (delta seconds) */
export function calcProgressDelta(rateMultiplier: number, deltaSec: number): number {
  return BASE_RATE_PCT_PER_SEC * rateMultiplier * deltaSec;
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

export function initialReactionRateState(mode: ReactionRateState["mode"]): ReactionRateState {
  const temp = 25, conc = 0.5;
  const surf: SurfaceAreaType = "chips";
  return {
    mode, status: "idle",
    temperature: temp,
    concentration: conc,
    surfaceArea: surf,
    rateMultiplier: calcRateMultiplier(temp, conc, surf),
    progress: 0,
    timeElapsed: 0,
    dataPoints: [],
    steps:      INITIAL_STEPS.map((s) => ({ ...s })),
    objectives: INITIAL_OBJECTIVES.map((o) => ({ ...o })),
    observations: [], result: null, startedAt: null,
  };
}

export function setTemperature(state: ReactionRateState, tempC: number): ReactionRateState {
  if (state.status === "completed" || state.status === "failed") return state;
  const clamped = Math.max(15, Math.min(80, tempC));
  const rate = calcRateMultiplier(clamped, state.concentration, state.surfaceArea);
  const wasRunning = state.status === "running";

  const newObs: ObservationEvent[] = [];
  if (wasRunning) {
    const direction = clamped > state.temperature ? "increased" : "decreased";
    newObs.push(mkObs(
      "rate-change",
      `Temperature ${direction} to ${clamped} °C — rate multiplier now ×${rate.toFixed(2)}. ` +
      `(Factor: ${temperatureFactor(clamped).toFixed(2)} — doubles every 10 °C rise.)`,
      clamped > state.temperature ? "success" : "info",
    ));
  }

  const configComplete = true; // temp set
  const steps = state.steps.map((s) => s.id === "set-temp" ? { ...s, completed: configComplete } : s);

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
  const rate = calcRateMultiplier(state.temperature, clamped, state.surfaceArea);
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
  const rate = calcRateMultiplier(state.temperature, state.concentration, sa);
  const steps = state.steps.map((s) => s.id === "set-surface" ? { ...s, completed: true } : s);
  return {
    ...state,
    surfaceArea: sa,
    rateMultiplier: rate,
    steps,
  };
}

export function startReaction(state: ReactionRateState): ReactionRateState {
  if (state.status === "running" || state.status === "completed" || state.status === "failed") return state;

  const rate = calcRateMultiplier(state.temperature, state.concentration, state.surfaceArea);

  // Check if all 3 steps configured
  const objectives = state.objectives.map((o) =>
    o.id === "configure" ? { ...o, completed: true } : o,
  );
  const steps = state.steps.map((s) => s.id === "start" ? { ...s, completed: true } : s);

  return {
    ...state,
    status: "running",
    progress: 0,
    timeElapsed: 0,
    dataPoints: [{ time: 0, progress: 0 }],
    rateMultiplier: rate,
    steps,
    objectives,
    startedAt: state.startedAt ?? Date.now(),
    observations: [
      mkObs(
        "reaction-start",
        `Reaction started — rate ×${rate.toFixed(2)} ` +
        `(T=${state.temperature} °C, [C]=${state.concentration.toFixed(1)} M, SA=${SURFACE_AREA_LABELS[state.surfaceArea]}).`,
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
      mkObs("reaction-start", `Reaction paused at ${state.progress.toFixed(1)}% progress.`, "info"),
      ...state.observations,
    ],
  };
}

export function tickReaction(state: ReactionRateState, deltaSec: number): ReactionRateState {
  if (state.status !== "running") return state;

  const newTime     = state.timeElapsed + deltaSec;
  const gained      = calcProgressDelta(state.rateMultiplier, deltaSec);
  const newProgress = Math.min(100, state.progress + gained);
  const newPoints   = [...state.dataPoints, { time: newTime, progress: newProgress }];

  const newObs: ObservationEvent[] = [];
  let objectives = state.objectives;

  // Milestone observations
  if (state.progress < 25 && newProgress >= 25) {
    newObs.push(mkObs("rate-change", `25% complete — ${newTime.toFixed(1)} s elapsed. Collision frequency maintaining progress.`, "info"));
  }
  if (state.progress < 50 && newProgress >= 50) {
    newObs.push(mkObs("rate-change", `Half-way (50%) — ${newTime.toFixed(1)} s elapsed. Reactant concentration decreasing.`, "info"));
  }
  if (state.progress < 75 && newProgress >= 75) {
    newObs.push(mkObs("rate-change", `75% complete — ${newTime.toFixed(1)} s elapsed. Rate slowing as reactants are consumed.`, "info"));
  }

  if (newProgress >= 100) {
    const runsCompleted = state.dataPoints.length > 0 ? 1 : 0;
    objectives = objectives.map((o) => {
      if (o.id === "run-once") return { ...o, completed: true };
      if (o.id === "run-twice" && runsCompleted >= 1) return o; // needs second run
      return o;
    });

    const result = {
      completedAt: Date.now(),
      success: true,
      score: 100,
      summary:
        `Reaction complete in ${newTime.toFixed(1)} s ` +
        `(T=${state.temperature} °C, [C]=${state.concentration.toFixed(1)} M, SA=${SURFACE_AREA_LABELS[state.surfaceArea]}). ` +
        `Rate multiplier: ×${state.rateMultiplier.toFixed(2)}.`,
      explanation:
        "Reaction rate depends on collision frequency and energy:\n" +
        "• Temperature: Higher T → more kinetic energy → more successful collisions (Arrhenius equation: k = Ae^(-Ea/RT)). Rate doubles per ~10 °C rise.\n" +
        "• Concentration: More particles per volume → more frequent collisions → higher rate (rate ∝ [reactant]ⁿ).\n" +
        "• Surface area: Reactions occur at surfaces — finer particles expose more surface → more simultaneous collisions.\n\n" +
        "Try varying one factor at a time (controlled experiment) to isolate its effect.",
    };

    return {
      ...state,
      status: "completed",
      progress: 100,
      timeElapsed: newTime,
      dataPoints: newPoints,
      objectives,
      result,
      observations: [
        mkObs("reaction-complete", `Reaction complete — 100% in ${newTime.toFixed(1)} s.`, "success"),
        ...newObs,
        ...state.observations,
      ],
    };
  }

  return {
    ...state,
    progress: newProgress,
    timeElapsed: newTime,
    dataPoints: newPoints,
    objectives,
    observations: newObs.length ? [...newObs, ...state.observations] : state.observations,
  };
}

export function resetReaction(state: ReactionRateState): ReactionRateState {
  // Preserve settings, reset progress
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
    timeElapsed: 0,
    dataPoints: [],
    result: null,
    steps: runsCompleted
      ? steps.map((s) => s.id === "vary-factor" ? { ...s, completed: false } : s)
      : steps,
    objectives,
    observations: runsCompleted
      ? [mkObs("rate-change", "Try changing one factor to compare reaction rates.", "info"), ...state.observations]
      : state.observations,
  };
}

export function resetReactionFull(mode: ReactionRateState["mode"]): ReactionRateState {
  return initialReactionRateState(mode);
}
