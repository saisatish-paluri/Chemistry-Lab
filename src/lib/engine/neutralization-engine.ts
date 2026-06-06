import type {
  NeutralizationState, NeutStepId,
  ObservationEvent, StepDef, ExperimentObjective, ExperimentResult,
} from "./types";

function uid(): string { return Math.random().toString(36).slice(2, 10); }

function mkObs(
  type: ObservationEvent["type"],
  message: string,
  severity: ObservationEvent["severity"],
): ObservationEvent {
  return { id: uid(), timestamp: Date.now(), type, message, severity };
}

const INITIAL_STEPS: StepDef[] = [
  { id: "s1", instruction: "Measure 25 mL of 0.1 M HCl into the beaker", hint: "Use the measuring cylinder for accuracy — check the meniscus at eye level.", completed: false },
  { id: "s2", instruction: "Measure 25 mL of 0.1 M NaOH in the cylinder", hint: "Keep the base separate until ready to combine.", completed: false },
  { id: "s3", instruction: "Pour NaOH into the HCl beaker and stir", hint: "Watch the thermometer — an exothermic reaction produces heat.", completed: false },
  { id: "s4", instruction: "Observe and record the temperature rise", hint: "ΔT confirms that neutralisation released heat energy.", completed: false },
  { id: "s5", instruction: "Record observations and complete the experiment", hint: "NaCl (table salt) and water are the products.", completed: false },
];

const INITIAL_OBJECTIVES: ExperimentObjective[] = [
  { id: "o1", description: "Combine acid and base in stoichiometric ratio", completed: false },
  { id: "o2", description: "Observe exothermic temperature rise", completed: false },
  { id: "o3", description: "Confirm NaCl and H₂O formation", completed: false },
];

export function initialNeutralizationState(mode: NeutralizationState["mode"] = "guided"): NeutralizationState {
  return {
    mode,
    status: "idle",
    currentStep: "measure-hcl",
    hclVolumeMl: 0,
    naohVolumeMl: 0,
    isMixing: false,
    mixProgress: 0,
    initialTempC: 25.0,
    currentTempC: 25.0,
    reactionDone: false,
    saltFormed: false,
    steps: INITIAL_STEPS.map(s => ({ ...s })),
    objectives: INITIAL_OBJECTIVES.map(o => ({ ...o })),
    observations: [],
    result: null,
    startedAt: null,
  };
}

export function measureHCl(state: NeutralizationState, volumeMl: number): NeutralizationState {
  if (state.currentStep !== "measure-hcl") return state;
  const obs = mkObs("reaction-start", `Measured ${volumeMl.toFixed(0)} mL of 0.1 M HCl into the beaker.`, "info");
  const steps = state.steps.map(s => s.id === "s1" ? { ...s, completed: true } : s);
  return {
    ...state,
    status: "running",
    hclVolumeMl: volumeMl,
    currentStep: "measure-naoh",
    steps,
    observations: [obs, ...state.observations],
    startedAt: state.startedAt ?? Date.now(),
    objectives: state.objectives.map(o => o.id === "o1" ? { ...o, completed: false } : o),
  };
}

export function measureNaOH(state: NeutralizationState, volumeMl: number): NeutralizationState {
  if (state.currentStep !== "measure-naoh") return state;
  const obs = mkObs("reaction-start", `Measured ${volumeMl.toFixed(0)} mL of 0.1 M NaOH — ready to add to the acid.`, "info");
  const steps = state.steps.map(s => s.id === "s2" ? { ...s, completed: true } : s);
  return {
    ...state,
    naohVolumeMl: volumeMl,
    currentStep: "mix",
    steps,
    observations: [obs, ...state.observations],
  };
}

export function startMixing(state: NeutralizationState): NeutralizationState {
  if (state.currentStep !== "mix" || state.isMixing) return state;
  const obs = mkObs("neutralization", "Solutions combined — neutralisation reaction starts. HCl + NaOH → NaCl + H₂O. Heat is being released.", "info");
  const steps = state.steps.map(s => s.id === "s3" ? { ...s, completed: true } : s);
  return {
    ...state,
    isMixing: true,
    mixProgress: 0,
    steps,
    observations: [obs, ...state.observations],
    objectives: state.objectives.map(o => o.id === "o1" ? { ...o, completed: true } : o),
  };
}

export function updateMixProgress(state: NeutralizationState, progress: number): NeutralizationState {
  if (!state.isMixing) return state;
  const tempRise = 6.5 * progress;
  const newTemp  = state.initialTempC + tempRise;
  let   newStep: NeutStepId = state.currentStep;
  let   newObs   = [...state.observations];
  const newSteps = [...state.steps];

  if (progress >= 1.0 && state.currentStep === "mix") {
    newStep = "observe";
    const obs = mkObs("heat-released", `Temperature rose to ${newTemp.toFixed(1)}°C (+${tempRise.toFixed(1)}°C). Exothermic neutralisation confirmed. Solution contains NaCl(aq).`, "success");
    newObs = [obs, ...newObs];
    newSteps[3] = { ...newSteps[3], completed: true };
  }

  return {
    ...state,
    mixProgress:  Math.min(1, progress),
    currentTempC: newTemp,
    isMixing:     progress < 1.0,
    currentStep:  newStep,
    steps:        newSteps,
    observations: newObs,
  };
}

export function recordNeutObservations(state: NeutralizationState): NeutralizationState {
  if (state.currentStep !== "observe") return state;
  const deltaT = (state.currentTempC - state.initialTempC).toFixed(1);
  const obs = mkObs("temperature-change", `Final T = ${state.currentTempC.toFixed(1)}°C. ΔT = ${deltaT}°C. Solution is neutral (pH ≈ 7). NaCl crystallises on evaporation.`, "success");
  const steps = state.steps.map(s => s.id === "s4" ? { ...s, completed: true } : s);
  return {
    ...state,
    currentStep: "record",
    saltFormed: true,
    steps,
    observations: [obs, ...state.observations],
    objectives: state.objectives.map(o => o.id === "o2" ? { ...o, completed: true } : o),
  };
}

export function completeNeutralization(state: NeutralizationState): NeutralizationState {
  const n       = Math.min(state.hclVolumeMl, state.naohVolumeMl) / 1000 * 0.1;
  const heatKJ  = n * 55.8;
  const deltaT  = (state.currentTempC - state.initialTempC).toFixed(1);

  const result: ExperimentResult = {
    completedAt:  Date.now(),
    success:      true,
    score:        95,
    summary:      "Neutralisation of HCl and NaOH completed successfully.",
    explanation:
      `HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l). ` +
      `${n.toFixed(4)} mol of each reactant reacted in a 1:1 ratio, releasing ${heatKJ.toFixed(2)} kJ. ` +
      `The temperature rose by ${deltaT}°C confirming the exothermic nature. ` +
      `Sodium chloride (common salt) remains in solution and can be recovered by evaporation.`,
  };

  const steps = state.steps.map(s => s.id === "s5" ? { ...s, completed: true } : s);
  const obs   = mkObs("reaction-complete", "Experiment complete! NaCl + H₂O produced. Neutralisation verified.", "success");

  return {
    ...state,
    status:       "completed",
    reactionDone: true,
    steps,
    observations: [obs, ...state.observations],
    result,
    objectives: state.objectives.map(o => ({ ...o, completed: true })),
  };
}

export function resetNeutralization(state: NeutralizationState): NeutralizationState {
  return initialNeutralizationState(state.mode);
}
