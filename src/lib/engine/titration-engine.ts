import {
  ACID_CONC, ACID_VOLUME_ML, BASE_CONC, BURETTE_START_ML,
  EQUIVALENCE_VOL, INDICATORS, calcpH, flaskColor, precisionScore,
} from "./chemistry";
import type {
  TitrationState, IndicatorName, TitrantFlowRate,
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

// Prevent duplicate obs of the same type in the last N entries
function isDuplicate(obs: ObservationEvent[], type: ObservationEvent["type"], windowSize = 3): boolean {
  return obs.slice(0, windowSize).some((o) => o.type === type);
}

const INITIAL_STEPS: StepDef[] = [
  { id: "add-indicator",  instruction: "Add an indicator to the flask.",                      completed: false },
  { id: "open-stopcock",  instruction: "Open the stopcock to begin adding titrant.",          completed: false },
  { id: "near-endpoint",  instruction: "Near the endpoint — add titrant drop by drop.",      completed: false },
  { id: "record-result",  instruction: "Record the volume at the permanent colour change.",  completed: false },
];

const INITIAL_OBJECTIVES: ExperimentObjective[] = [
  { id: "add-indicator",   description: "Add indicator to the flask",                  completed: false },
  { id: "reach-endpoint",  description: "Reach the endpoint without overshooting",     completed: false },
  { id: "record-volume",   description: "Record the exact titrant volume at endpoint", completed: false },
];

export function initialTitrationState(mode: TitrationState["mode"]): TitrationState {
  const initpH = calcpH(
    (ACID_CONC * ACID_VOLUME_ML) / 1000,
    0,
    ACID_VOLUME_ML / 1000,
  );
  return {
    mode,
    status: "idle",
    flask: {
      pH: initpH,
      color: "#bfdbfe",
      volume: ACID_VOLUME_ML,
      indicator: null,
      indicatorAdded: false,
    },
    burette: {
      volumeRemaining: BURETTE_START_ML,
      flowRate: 1,
      stopcockOpen: false,
    },
    volumeAdded: 0,
    titrationCurve: [{ v: 0, pH: initpH }],
    equivalenceVolume: EQUIVALENCE_VOL,
    endpointReached: false,
    overshot: false,
    steps: INITIAL_STEPS.map((s) => ({ ...s })),
    objectives: INITIAL_OBJECTIVES.map((o) => ({ ...o })),
    observations: [],
    result: null,
    startedAt: null,
  };
}

export function addIndicator(state: TitrationState, indicator: IndicatorName): TitrationState {
  if (state.flask.indicatorAdded) return state;
  if (state.status === "running" || state.status === "completed" || state.status === "failed") return state;
  const ind   = INDICATORS[indicator];
  const color = flaskColor(state.flask.pH, ind);
  const obs   = mkObs(
    "color-change",
    `${ind.name} added — flask turns ${state.flask.pH < ind.transitionLow ? "its acid colour" : "its base colour"} at pH ${state.flask.pH.toFixed(2)}. Transition: pH ${ind.transitionLow}–${ind.transitionHigh}.`,
    "info",
  );
  return {
    ...state,
    flask:      { ...state.flask, indicator, indicatorAdded: true, color },
    steps:      state.steps.map((s) => s.id === "add-indicator"  ? { ...s, completed: true } : s),
    objectives: state.objectives.map((o) => o.id === "add-indicator" ? { ...o, completed: true } : o),
    observations: [obs, ...state.observations],
    status: "ready",
  };
}

export function setFlowRate(state: TitrationState, rate: TitrantFlowRate): TitrationState {
  return { ...state, burette: { ...state.burette, flowRate: rate } };
}

export function addTitrant(state: TitrationState): TitrationState {
  if (!state.flask.indicatorAdded) return state;
  if (state.burette.volumeRemaining <= 0) return state;
  if (state.status === "completed" || state.status === "failed") return state;

  const added            = Math.min(state.burette.flowRate, state.burette.volumeRemaining);
  const newVolumeAdded   = state.volumeAdded + added;
  const acidMoles        = (ACID_CONC * ACID_VOLUME_ML) / 1000;
  const baseMoles        = (BASE_CONC * newVolumeAdded) / 1000;
  const totalVolumeL     = (ACID_VOLUME_ML + newVolumeAdded) / 1000;
  const newpH            = calcpH(acidMoles, baseMoles, totalVolumeL);
  const ind              = state.flask.indicator ? INDICATORS[state.flask.indicator] : null;
  const newColor         = flaskColor(newpH, ind);
  const newCurve         = [...state.titrationCurve, { v: newVolumeAdded, pH: newpH }];

  const prevpH  = state.flask.pH;
  const newObs: ObservationEvent[] = [];
  let endpointReached = state.endpointReached;
  let overshot        = state.overshot;
  let status: import("./types").ExperimentStatus = state.status;
  let steps      = state.steps;
  let objectives = state.objectives;

  // First addition — open stopcock, start running
  if (state.volumeAdded === 0) {
    newObs.push(mkObs("reaction-start", "HCl + NaOH → NaCl + H₂O  Titrant flowing — watch the flask carefully.", "info"));
    steps  = steps.map((s) => s.id === "open-stopcock" ? { ...s, completed: true } : s);
    status = "running";
  }

  // Neutralization milestone — halfway to equivalence
  if (
    !isDuplicate(state.observations, "neutralization") &&
    state.volumeAdded < EQUIVALENCE_VOL * 0.5 &&
    newVolumeAdded >= EQUIVALENCE_VOL * 0.5
  ) {
    newObs.push(mkObs(
      "neutralization",
      `Half-way — ${newVolumeAdded.toFixed(1)} mL added. Half the acid is neutralised, pH ${newpH.toFixed(2)}.`,
      "info",
    ));
  }

  // Near-endpoint hint (within 3 mL)
  if (!steps.find((s) => s.id === "near-endpoint")?.completed && newVolumeAdded >= EQUIVALENCE_VOL - 3) {
    steps = steps.map((s) => s.id === "near-endpoint" ? { ...s, completed: true } : s);
    newObs.push(mkObs("color-change", `Approaching equivalence — switch to 0.1 mL drops! (${(EQUIVALENCE_VOL - newVolumeAdded).toFixed(1)} mL remaining)`, "warning"));
  }

  // Indicator colour shift (significant pH jump)
  if (ind && newColor !== state.flask.color && Math.abs(newpH - prevpH) > 0.3 && !isDuplicate(state.observations, "color-change", 2)) {
    newObs.push(mkObs("color-change", `Colour shifting — pH ${newpH.toFixed(2)} (${ind.name} transition: ${ind.transitionLow}–${ind.transitionHigh}).`, "info"));
  }

  // Endpoint detection: indicator fully in base-colour zone
  if (!endpointReached && ind && newpH >= ind.transitionHigh) {
    endpointReached = true;
    status          = "completed";
    steps      = steps.map((s) => s.id === "record-result" ? { ...s, completed: true } : s);
    objectives = objectives.map((o) =>
      o.id === "reach-endpoint" || o.id === "record-volume"
        ? { ...o, completed: true }
        : o,
    );
    const deviation = Math.abs(newVolumeAdded - EQUIVALENCE_VOL);
    newObs.unshift(mkObs(
      "endpoint-reached",
      `Endpoint reached! ${newVolumeAdded.toFixed(2)} mL NaOH, pH ${newpH.toFixed(2)}. Deviation from equivalence: ${deviation.toFixed(2)} mL.`,
      "success",
    ));
  }

  // Overshot: more than 2× equivalence added
  if (!overshot && newVolumeAdded > EQUIVALENCE_VOL * 2) {
    overshot = true;
    status   = "failed";
    newObs.unshift(mkObs(
      "contamination",
      `Overshot by ${(newVolumeAdded - EQUIVALENCE_VOL).toFixed(1)} mL — far too much NaOH added. Result invalidated.`,
      "error",
    ));
  }

  return {
    ...state,
    flask: {
      ...state.flask,
      pH: newpH,
      color: newColor,
      volume: ACID_VOLUME_ML + newVolumeAdded,
    },
    burette: {
      ...state.burette,
      volumeRemaining: state.burette.volumeRemaining - added,
      stopcockOpen: status !== "completed" && status !== "failed",
    },
    volumeAdded: newVolumeAdded,
    titrationCurve: newCurve,
    endpointReached,
    overshot,
    status,
    steps,
    objectives,
    observations: [...newObs, ...state.observations],
    startedAt: state.startedAt ?? Date.now(),
  };
}

export function resetTitration(mode: TitrationState["mode"]): TitrationState {
  return initialTitrationState(mode);
}

export function buildTitrationResult(state: TitrationState): TitrationState {
  if (state.status !== "completed" && state.status !== "failed") return state;

  let score: number;
  let precision: number | undefined;

  if (state.overshot) {
    score = 20;
  } else if (!state.endpointReached) {
    score = 15;
  } else if (!state.flask.indicator) {
    score = 55;
  } else {
    precision = Math.abs(state.volumeAdded - state.equivalenceVolume);
    score = precisionScore(state.volumeAdded, state.equivalenceVolume);
  }

  const result = {
    completedAt:  Date.now(),
    success:      state.endpointReached && !state.overshot,
    score,
    precision,
    summary:      state.endpointReached
      ? `Endpoint reached at ${state.volumeAdded.toFixed(2)} mL NaOH. Equivalence point: ${state.equivalenceVolume.toFixed(1)} mL. ${precision !== undefined ? `Deviation: ${precision.toFixed(2)} mL.` : ""}`
      : state.overshot
        ? `Overshot — ${state.volumeAdded.toFixed(2)} mL added (${(state.volumeAdded - state.equivalenceVolume).toFixed(1)} mL past equivalence).`
        : `Experiment ended. ${state.volumeAdded.toFixed(2)} mL added without reaching endpoint.`,
    explanation:
      "In a strong acid–strong base titration the equivalence point occurs at pH 7. " +
      "An indicator that changes colour close to the equivalence pH signals the endpoint. " +
      "Phenolphthalein (pH 8.2–10) is ideal for NaOH titrations. " +
      "One drop past the endpoint permanently changes the colour, confirming all acid is neutralised:\n" +
      "HCl + NaOH → NaCl + H₂O",
  };
  return { ...state, result };
}
