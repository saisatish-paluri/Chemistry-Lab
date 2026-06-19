import {
  ACID_CONC, ACID_VOLUME_ML, BASE_CONC, BURETTE_START_ML,
  INDICATORS, calcpH, flaskColor, precisionScore,
} from "./chemistry";
import type {
  TitrationState, IndicatorName, TitrantFlowRate,
  ObservationEvent, StepDef, ExperimentObjective,
  ExperimentalError, TitrationMeasurements,
} from "./types";
import type { TitrationSimParams } from "./sim-bridge";
import { readBurette, readPHMeter } from "@/lib/instruments/instruments";

function uid(): string { return Math.random().toString(36).slice(2, 10); }

function mkObs(
  type: ObservationEvent["type"],
  message: string,
  severity: ObservationEvent["severity"],
): ObservationEvent {
  return { id: uid(), timestamp: Date.now(), type, message, severity };
}

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

function buildTitrationMeasurements(
  volumeAdded: number,
  pH:          number,
  errors:      ExperimentalError[],
): TitrationMeasurements {
  // Add meniscus parallax reading error (typically +/- 0.03 mL)
  const meniscusNoise = (Math.random() - 0.5) * 0.06;
  return {
    buretteVolume: readBurette(volumeAdded + meniscusNoise, { activeErrors: errors }),
    flaskPH:       readPHMeter(pH,          { activeErrors: errors }),
  };
}

export function initialTitrationState(
  mode:         TitrationState["mode"],
  activeErrors: ExperimentalError[] = [],
  simParams?:   TitrationSimParams,
): TitrationState {
  const acidType        = simParams?.acidType        ?? "strong";
  const baseType        = simParams?.baseType        ?? "strong";
  const acidName        = simParams?.acidName        ?? "HCl";
  const baseName        = simParams?.baseName        ?? "NaOH";

  // Roll randomized unknown concentration if in a mode that uses it
  const isUnknown = mode === "exam" || mode === "advanced";
  const rawAcidConc = simParams?.acidConc ?? ACID_CONC;
  const trueAcidConc    = isUnknown
    ? 0.05 + Math.random() * 0.10 // 0.05 to 0.15 M
    : rawAcidConc;
  const acidConc = isUnknown ? 0.1 : rawAcidConc; // Nominal label is 0.1 M
  
  const baseConc        = simParams?.baseConc        ?? BASE_CONC;
  const acidVolMl       = simParams?.acidVolMl       ?? ACID_VOLUME_ML;
  const endpointNoiseMl = simParams?.endpointNoiseMl ?? 0.05;

  const equivalenceVolume = (trueAcidConc * acidVolMl) / baseConc;

  const initpH = calcpH(
    (trueAcidConc * acidVolMl) / 1000,
    0,
    acidVolMl / 1000,
    acidType,
    baseType
  );

  return {
    mode,
    status: "idle",
    flask: {
      pH: initpH,
      color: "#bfdbfe",
      volume: acidVolMl,
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
    equivalenceVolume,
    endpointReached: false,
    overshot: false,
    steps: INITIAL_STEPS.map((s) => ({ ...s })),
    objectives: INITIAL_OBJECTIVES.map((o) => ({ ...o })),
    observations: [],
    result: null,
    startedAt: null,
    measurements: buildTitrationMeasurements(0, initpH, activeErrors),
    activeErrors,
    acidConc,
    baseConc,
    acidVolMl,
    trueAcidConc,
    endpointNoiseMl,
    acidType,
    baseType,
    acidName,
    baseName,
    trialCount: 0,
    trialVolumes: [],
    swirlCount: 0,
  };
}

export function swirlFlask(state: TitrationState): TitrationState {
  if (state.status === "idle") return state;
  const newObs: ObservationEvent[] = [];
  if (state.status === "running" && state.swirlCount % 4 === 0) {
    newObs.push(mkObs(
      "color-change",
      "Flask swirled — solution mixing ensures the colour change is uniform throughout the solution.",
      "info",
    ));
  }
  return {
    ...state,
    swirlCount: state.swirlCount + 1,
    observations: newObs.length ? [...newObs, ...state.observations] : state.observations,
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
    flask:        { ...state.flask, indicator, indicatorAdded: true, color },
    steps:        state.steps.map((s) => s.id === "add-indicator"  ? { ...s, completed: true } : s),
    objectives:   state.objectives.map((o) => o.id === "add-indicator" ? { ...o, completed: true } : o),
    observations: [obs, ...state.observations],
    status:       "ready",
    measurements: buildTitrationMeasurements(state.volumeAdded, state.flask.pH, state.activeErrors),
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

  // Use true concentrations for pH calculation
  const acidMoles        = (state.trueAcidConc * state.acidVolMl) / 1000;
  const baseMoles        = (state.baseConc * newVolumeAdded) / 1000;
  const totalVolumeL     = (state.acidVolMl + newVolumeAdded) / 1000;
  const newpH            = calcpH(acidMoles, baseMoles, totalVolumeL, state.acidType, state.baseType);
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

  if (state.volumeAdded === 0) {
    newObs.push(mkObs("reaction-start", `${state.acidName} + ${state.baseName} neutralisation started — watch the flask color shifts.`, "info"));
    steps  = steps.map((s) => s.id === "open-stopcock" ? { ...s, completed: true } : s);
    status = "running";
  }

  if (
    !isDuplicate(state.observations, "neutralization") &&
    state.volumeAdded < state.equivalenceVolume * 0.5 &&
    newVolumeAdded >= state.equivalenceVolume * 0.5
  ) {
    newObs.push(mkObs(
      "neutralization",
      `Half-way — ${newVolumeAdded.toFixed(1)} mL added. Half the acid is neutralised, pH ${newpH.toFixed(2)}.`,
      "info",
    ));
  }

  if (!steps.find((s) => s.id === "near-endpoint")?.completed && newVolumeAdded >= state.equivalenceVolume - 3) {
    steps = steps.map((s) => s.id === "near-endpoint" ? { ...s, completed: true } : s);
    newObs.push(mkObs("color-change", `Approaching equivalence — switch to 0.1 mL drops! (${(state.equivalenceVolume - newVolumeAdded).toFixed(1)} mL remaining)`, "warning"));
  }

  if (ind && newColor !== state.flask.color && Math.abs(newpH - prevpH) > 0.1 && !isDuplicate(state.observations, "color-change", 2)) {
    newObs.push(mkObs("color-change", `Colour shifting — pH ${newpH.toFixed(2)} (${ind.name} transition: ${ind.transitionLow}–${ind.transitionHigh}).`, "info"));
  }

  // Endpoint reached when indicator shifts color
  if (!endpointReached && ind && newpH >= ind.transitionHigh) {
    endpointReached = true;
    status          = "completed";
    steps      = steps.map((s) => s.id === "record-result" ? { ...s, completed: true } : s);
    objectives = objectives.map((o) =>
      o.id === "reach-endpoint" || o.id === "record-volume"
        ? { ...o, completed: true }
        : o,
    );
    const deviation = Math.abs(newVolumeAdded - state.equivalenceVolume);
    newObs.unshift(mkObs(
      "endpoint-reached",
      `Endpoint reached! ${newVolumeAdded.toFixed(2)} mL ${state.baseName}, pH ${newpH.toFixed(2)}. Deviation from equivalence: ${deviation.toFixed(2)} mL.`,
      "success",
    ));
  }

  // Overshot check
  if (!overshot && newVolumeAdded > state.equivalenceVolume * 1.3) {
    overshot = true;
    status   = "failed";
    newObs.unshift(mkObs(
      "contamination",
      `Overshot by ${(newVolumeAdded - state.equivalenceVolume).toFixed(1)} mL — base concentration is now dominant. Result invalidated.`,
      "error",
    ));
  }

  return {
    ...state,
    flask: {
      ...state.flask,
      pH: newpH,
      color: newColor,
      volume: state.acidVolMl + newVolumeAdded,
    },
    burette: {
      ...state.burette,
      volumeRemaining: state.burette.volumeRemaining - added,
      stopcockOpen: status !== "completed" && status !== "failed",
    },
    volumeAdded:    newVolumeAdded,
    titrationCurve: newCurve,
    endpointReached,
    overshot,
    status,
    steps,
    objectives,
    observations: [...newObs, ...state.observations],
    startedAt:    state.startedAt ?? Date.now(),
    measurements: buildTitrationMeasurements(newVolumeAdded, newpH, state.activeErrors),
  };
}

export function resetTitration(
  mode:         TitrationState["mode"],
  activeErrors: ExperimentalError[] = [],
  simParams?:   TitrationSimParams,
): TitrationState {
  return initialTitrationState(mode, activeErrors, simParams);
}

export function resetForNextTrial(state: TitrationState): TitrationState {
  const newTrialVols = [...state.trialVolumes, state.volumeAdded];
  const initpH = calcpH(
    (state.trueAcidConc * state.acidVolMl) / 1000,
    0,
    state.acidVolMl / 1000,
    state.acidType,
    state.baseType
  );

  return {
    ...state,
    status: "idle",
    flask: {
      pH: initpH,
      color: "#bfdbfe",
      volume: state.acidVolMl,
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
    endpointReached: false,
    overshot: false,
    trialCount: newTrialVols.length,
    trialVolumes: newTrialVols,
    observations: [
      mkObs("reaction-start", `Trial ${newTrialVols.length} recorded: ${state.volumeAdded.toFixed(2)} mL. Ready for replicate titration.`, "info"),
      ...state.observations
    ],
    measurements: buildTitrationMeasurements(0, initpH, state.activeErrors)
  };
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

  const determinedAcidConc = state.endpointReached
    ? (state.baseConc * state.volumeAdded) / state.acidVolMl
    : null;
  const percentError = determinedAcidConc !== null
    ? Math.abs((determinedAcidConc - state.trueAcidConc) / state.trueAcidConc) * 100
    : undefined;

  const result = {
    completedAt:  Date.now(),
    success:      state.endpointReached && !state.overshot,
    score,
    precision,
    summary:      state.endpointReached
      ? `Endpoint at ${state.volumeAdded.toFixed(2)} mL ${state.baseName}. ` +
        `[${state.acidName}] determined = ${determinedAcidConc?.toFixed(4)} mol/L ` +
        `(true: ${state.trueAcidConc.toFixed(4)} mol/L` +
        (percentError !== undefined ? `, error: ${percentError.toFixed(2)}%` : "") + `). ` +
        (precision !== undefined ? `Deviation: ${precision.toFixed(2)} mL.` : "")
      : state.overshot
        ? `Overshot — ${state.volumeAdded.toFixed(2)} mL added.`
        : `Experiment ended without reaching endpoint.`,
    explanation:
      `${state.acidName} (${state.trueAcidConc.toFixed(4)} M) × ${state.baseName} (${state.baseConc.toFixed(4)} M). ` +
      `Equivalence at ${state.equivalenceVolume.toFixed(2)} mL. ` +
      "At the equivalence point: c₁V₁ = c₂V₂.\n" +
      "Indicators transition color as pH shifts across their respective zones.",
  };
  return { ...state, result };
}
