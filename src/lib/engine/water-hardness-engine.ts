import type {
  WaterHardnessState, HardnessCategory,
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

// Hard water sample: 200 mg/L as CaCO₃ (hard category)
// EDTA: 0.01 M, sample volume: 100 mL
// Endpoint at V_EDTA = 20.0 mL
const ENDPOINT_ML   = 20.0;
const EDTA_MOLARITY = 0.01;
const SAMPLE_VOL_ML = 100;
const M_CaCO3       = 100.09; // g/mol

const INITIAL_STEPS: StepDef[] = [
  { id: "s1", instruction: "Fill the burette with 0.01 M EDTA solution", hint: "EDTA chelates Ca²⁺ and Mg²⁺ ions in the sample.", completed: false },
  { id: "s2", instruction: "Pipette 100 mL of hard water sample into the flask", hint: "Use the 100 mL pipette for accurate measurement.", completed: false },
  { id: "s3", instruction: "Add buffer (pH 10) and Eriochrome Black T indicator", hint: "At pH 10, EBT forms wine-red complex with Ca²⁺/Mg²⁺.", completed: false },
  { id: "s4", instruction: "Add EDTA dropwise from the burette", hint: "EDTA out-competes EBT for the metal ions as titration proceeds.", completed: false },
  { id: "s5", instruction: "Stop at the endpoint — wine-red turns blue", hint: "The last drop of EDTA frees the indicator, giving pure blue.", completed: false },
  { id: "s6", instruction: "Calculate hardness in mg/L as CaCO₃", hint: "Hardness = (V_EDTA × M_EDTA × M_CaCO₃ × 1000) / V_sample", completed: false },
];

const INITIAL_OBJECTIVES: ExperimentObjective[] = [
  { id: "o1", description: "Set up EDTA titration correctly", completed: false },
  { id: "o2", description: "Detect colour endpoint (wine-red → blue)", completed: false },
  { id: "o3", description: "Calculate and classify water hardness", completed: false },
];

function hardnessToColor(edtaMl: number): string {
  if (edtaMl >= ENDPOINT_ML) return "#3b82f6";
  const t = edtaMl / ENDPOINT_ML;
  // Interpolate wine-red (#9f1239) → purple (#7c3aed) → blue (#3b82f6)
  if (t < 0.5) {
    const tt = t / 0.5;
    const r  = Math.round(159 + (124 - 159) * tt);
    const g  = Math.round(18  + (58  - 18)  * tt);
    const b  = Math.round(57  + (237 - 57)  * tt);
    return `rgb(${r},${g},${b})`;
  } else {
    const tt = (t - 0.5) / 0.5;
    const r  = Math.round(124 + (59  - 124) * tt);
    const g  = Math.round(58  + (130 - 58)  * tt);
    const b  = Math.round(237 + (246 - 237) * tt);
    return `rgb(${r},${g},${b})`;
  }
}

function classify(hardnessMgL: number): HardnessCategory {
  if (hardnessMgL <  75)  return "soft";
  if (hardnessMgL < 150)  return "moderately-hard";
  if (hardnessMgL < 300)  return "hard";
  return "very-hard";
}

export function initialWaterHardnessState(mode: WaterHardnessState["mode"] = "guided"): WaterHardnessState {
  return {
    mode,
    status:           "idle",
    buretteFilled:    false,
    samplePrepared:   false,
    indicatorAdded:   false,
    edtaAddedMl:      0,
    endpointReached:  false,
    solutionColor:    "#9f1239",
    hardnessMgL:      null,
    hardnessCategory: null,
    isTitrating:      false,
    steps:            INITIAL_STEPS.map(s => ({ ...s })),
    objectives:       INITIAL_OBJECTIVES.map(o => ({ ...o })),
    observations:     [],
    result:           null,
    startedAt:        null,
  };
}

export function fillBurette(state: WaterHardnessState): WaterHardnessState {
  const obs   = mkObs("reaction-start", "Burette filled with 0.01 M EDTA solution. Zero the burette before titrating.", "info");
  const steps = state.steps.map(s => s.id === "s1" ? { ...s, completed: true } : s);
  return {
    ...state,
    buretteFilled: true,
    status:        "running",
    startedAt:     state.startedAt ?? Date.now(),
    steps,
    observations:  [obs, ...state.observations],
    objectives:    state.objectives.map(o => o.id === "o1" ? { ...o, completed: false } : o),
  };
}

export function prepareSample(state: WaterHardnessState): WaterHardnessState {
  const obs   = mkObs("reaction-start", "100 mL hard water sample pipetted into the conical flask. Sample contains dissolved Ca²⁺ and Mg²⁺ ions.", "info");
  const steps = state.steps.map(s => s.id === "s2" ? { ...s, completed: true } : s);
  return { ...state, samplePrepared: true, steps, observations: [obs, ...state.observations] };
}

export function addIndicator(state: WaterHardnessState): WaterHardnessState {
  const obs = mkObs("color-change", "Buffer (pH 10) and Eriochrome Black T added. Solution turns wine-red — EBT forms complex with Ca²⁺ and Mg²⁺.", "info");
  const steps = state.steps.map(s => (s.id === "s3" || s.id === "s4") ? { ...s, completed: s.id === "s3" } : s);
  return {
    ...state,
    indicatorAdded: true,
    solutionColor:  "#9f1239",
    steps,
    observations:   [obs, ...state.observations],
    objectives:     state.objectives.map(o => o.id === "o1" ? { ...o, completed: true } : o),
  };
}

export function addEDTA(state: WaterHardnessState, incrementMl: number): WaterHardnessState {
  if (!state.indicatorAdded || state.endpointReached) return state;
  const newVol = Math.min(state.edtaAddedMl + incrementMl, ENDPOINT_ML + 0.1);
  const color  = hardnessToColor(newVol);
  const newObs = [...state.observations];
  const steps  = [...state.steps];

  if (newVol >= ENDPOINT_ML * 0.5 && state.edtaAddedMl < ENDPOINT_ML * 0.5) {
    newObs.unshift(mkObs("color-change", `Added ${newVol.toFixed(1)} mL EDTA — colour shifting towards purple as metal ions are chelated.`, "info"));
  }

  let endpointReached: boolean = state.endpointReached;
  let objectives               = state.objectives;

  if (newVol >= ENDPOINT_ML && !state.endpointReached) {
    endpointReached = true;
    steps[4] = { ...steps[4], completed: true };
    newObs.unshift(mkObs("endpoint-reached", `Endpoint reached at ${newVol.toFixed(1)} mL EDTA! Solution turned pure blue — all Ca²⁺ and Mg²⁺ ions chelated by EDTA.`, "success"));
    objectives = state.objectives.map(o => o.id === "o2" ? { ...o, completed: true } : o);
  }

  return {
    ...state,
    edtaAddedMl:     newVol,
    solutionColor:   color,
    endpointReached,
    isTitrating:     true,
    steps,
    objectives,
    observations:    newObs,
  };
}

export function calculateHardness(state: WaterHardnessState): WaterHardnessState {
  if (!state.endpointReached) return state;
  const hardnessMgL = (state.edtaAddedMl / 1000) * EDTA_MOLARITY * M_CaCO3 * 1000 / (SAMPLE_VOL_ML / 1000);
  const category    = classify(hardnessMgL);

  const catLabel: Record<HardnessCategory, string> = {
    "soft":            "Soft (< 75 mg/L)",
    "moderately-hard": "Moderately Hard (75–150 mg/L)",
    "hard":            "Hard (150–300 mg/L)",
    "very-hard":       "Very Hard (> 300 mg/L)",
  };

  const obs   = mkObs("reaction-complete", `Water hardness = ${hardnessMgL.toFixed(1)} mg/L as CaCO₃ — classified as ${catLabel[category]}.`, "success");
  const steps = state.steps.map(s => s.id === "s6" ? { ...s, completed: true } : s);

  return {
    ...state,
    hardnessMgL,
    hardnessCategory: category,
    isTitrating:      false,
    steps,
    observations:     [obs, ...state.observations],
    objectives:       state.objectives.map(o => o.id === "o3" ? { ...o, completed: true } : o),
  };
}

export function completeWaterHardness(state: WaterHardnessState): WaterHardnessState {
  if (!state.hardnessMgL) return state;
  const category = state.hardnessCategory!;
  const catExplanation: Record<HardnessCategory, string> = {
    "soft":            "Soft water is ideal for soap lathering, boilers, and industrial processes.",
    "moderately-hard": "Moderately hard water is acceptable for domestic use with minor scaling.",
    "hard":            "Hard water causes scale deposits in pipes and requires water softening for industrial use.",
    "very-hard":       "Very hard water requires treatment (ion exchange, lime-soda softening) before most applications.",
  };

  const result: ExperimentResult = {
    completedAt: Date.now(),
    success:     true,
    score:       90,
    summary:     `Water hardness determined: ${state.hardnessMgL.toFixed(1)} mg/L (${category.replace("-", " ")}).`,
    explanation:
      `EDTA titration consumed ${state.edtaAddedMl.toFixed(1)} mL of 0.01 M EDTA to chelate all Ca²⁺ and Mg²⁺ in 100 mL of the water sample. ` +
      `Hardness = (${state.edtaAddedMl.toFixed(1)} × 0.01 × 100.09 × 1000) / 100 = ${state.hardnessMgL.toFixed(1)} mg/L as CaCO₃. ` +
      catExplanation[category],
  };

  return {
    ...state,
    status:       "completed",
    result,
    observations: [mkObs("reaction-complete", "Water hardness experiment complete.", "success"), ...state.observations],
  };
}

export function resetWaterHardness(state: WaterHardnessState): WaterHardnessState {
  return initialWaterHardnessState(state.mode);
}

export { ENDPOINT_ML, SAMPLE_VOL_ML };
