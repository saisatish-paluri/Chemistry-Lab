import type {
  NaturalIndicatorsState, ObservationEvent, StepDef, ExperimentObjective, ExperimentMode,
} from "./types";

function uid(): string { return Math.random().toString(36).slice(2, 10); }

function mkObs(
  type: ObservationEvent["type"],
  message: string,
  severity: ObservationEvent["severity"],
): ObservationEvent {
  return { id: uid(), timestamp: Date.now(), type, message, severity };
}

export function initialIndicatorsState(mode: ExperimentMode): NaturalIndicatorsState {
  const steps: StepDef[] = [
    { id: "s1", instruction: "Select a natural source (Turmeric root, China Rose petals, or Red Cabbage leaves).", hint: "Each source contains unique anthocyanin or curcumin pigments.", completed: false },
    { id: "s2", instruction: "Mash the material in a mortar & pestle for sufficient time.", hint: "Mashing breaks cell walls to release the organic pigments.", completed: false },
    { id: "s3", instruction: "Add hot water solvent to extract the pigment concentrate.", hint: "Let it steep to maximize extract concentration.", completed: false },
    { id: "s4", instruction: "Select a test solution (HCl, Vinegar, Lemon Juice, Water, Soap, or NaOH).", hint: "Choose acidic, neutral, or alkaline solutions to test.", completed: false },
    { id: "s5", instruction: "Add indicator extract drops to the test tube and watch the color transition propagate.", hint: "Look closely at how concentration determines color intensity.", completed: false },
  ];

  const objectives: ExperimentObjective[] = [
    { id: "o1", description: "Successfully prepare a natural indicator extract.", completed: false },
    { id: "o2", description: "Observe indicator color transition in both strongly acidic and basic solutions.", completed: false },
    { id: "o3", description: "Test a solution with a low extract concentration and note the faint result.", completed: false },
  ];

  return {
    mode,
    status: "setup",
    selectedIndicator: null,
    preparationStep: null,
    extractProgress: 0,
    extractConcentration: 0,
    selectedSolution: null,
    solutionPh: 7,
    addedIndicatorDrops: 0,
    liquidColor: "#f1f5f9", // base clear water
    colorMixProgress: 0,
    steps,
    objectives,
    observations: [mkObs("info", "Welcome to the Natural Indicators Lab. Select an indicator source to begin.", "info")],
    result: null,
    startedAt: Date.now(),
  };
}

export function selectIndicator(state: NaturalIndicatorsState, ind: "turmeric" | "china-rose" | "red-cabbage"): NaturalIndicatorsState {
  if (state.selectedIndicator !== null) return state;
  const next = { ...state };
  next.selectedIndicator = ind;
  next.preparationStep = "mortar";
  next.steps[0].completed = true;
  const name = ind === "turmeric" ? "Turmeric root" : ind === "china-rose" ? "China Rose petals" : "Red Cabbage leaves";
  next.observations.unshift(mkObs("info", `Selected ${name}. Mash thoroughly in the mortar.`, "info"));
  return next;
}

export function mashMaterial(state: NaturalIndicatorsState, amount: number): NaturalIndicatorsState {
  if (state.preparationStep !== "mortar") return state;
  const next = { ...state };
  next.extractProgress = Math.min(1.0, next.extractProgress + amount);
  if (next.extractProgress >= 1.0) {
    next.preparationStep = "solvent";
    next.steps[1].completed = true;
    next.observations.unshift(mkObs("state_change", "Mashing complete. Add hot water solvent to extract the pigment.", "info"));
  }
  return next;
}

export function addSolvent(state: NaturalIndicatorsState, steepTimeSeconds: number): NaturalIndicatorsState {
  if (state.preparationStep !== "solvent") return state;
  const next = { ...state };
  
  // Insufficient extract concentration error system
  // If steep time is < 5 seconds, concentration is very low
  const conc = Math.min(1.0, steepTimeSeconds / 12);
  next.extractConcentration = conc;
  next.preparationStep = "extracted";
  next.steps[2].completed = true;
  next.objectives[0].completed = true;

  if (conc < 0.45) {
    next.objectives[2].completed = true; // low concentration objective met
    next.observations.unshift(mkObs("warning", "Extract prepared, but steeping time was too short. Pigment concentration is low.", "warning"));
  } else {
    next.observations.unshift(mkObs("state_change", `Extract prepared successfully. Concentration: ${(conc * 100).toFixed(0)}%.`, "success"));
  }
  return next;
}

export function selectTestSolution(state: NaturalIndicatorsState, sol: NaturalIndicatorsState["selectedSolution"]): NaturalIndicatorsState {
  if (state.preparationStep !== "extracted") return state;
  const next = { ...state };
  next.selectedSolution = sol;
  next.addedIndicatorDrops = 0;
  next.colorMixProgress = 0;
  
  // Set pH values
  const pHMap = {
    "hcl": 1.0,
    "vinegar": 3.0,
    "lemon-juice": 2.2,
    "water": 7.0,
    "soap": 9.2,
    "naoh": 13.0,
  };
  next.solutionPh = pHMap[sol as keyof typeof pHMap] || 7.0;
  next.steps[3].completed = true;
  
  const solLabel = {
    hcl: "HCl (Strong Acid)",
    vinegar: "Vinegar (Weak Acid)",
    "lemon-juice": "Lemon Juice (Weak Acid)",
    water: "Distilled Water (Neutral)",
    soap: "Soap Solution (Weak Base)",
    naoh: "NaOH (Strong Base)",
  }[sol as keyof typeof pHMap] || "";
  
  next.observations.unshift(mkObs("info", `Selected ${solLabel}. Add indicator drops to test.`, "info"));
  return next;
}

// Color transition calculator
export function getIndicatorColor(indicator: "turmeric" | "china-rose" | "red-cabbage", pH: number): string {
  if (indicator === "turmeric") {
    // Curcumin is yellow at acidic/neutral, transitions to deep reddish-brown in alkaline pH (pH > 8.0)
    if (pH < 7.8) return "#fbbf24"; // yellow
    if (pH < 9.5) {
      const p = (pH - 7.8) / 1.7;
      const r = Math.round(251 + p * (120 - 251));
      const g = Math.round(191 + p * (53 - 191));
      const b = Math.round(36 + p * (15 - 36));
      return `rgb(${r},${g},${b})`;
    }
    return "#78350f"; // reddish brown
  }

  if (indicator === "china-rose") {
    // Acid: Magenta, Neutral: Pink, Base: Green/Yellow
    if (pH < 4.5) return "#db2777"; // Magenta
    if (pH < 7.5) {
      const p = (pH - 4.5) / 3.0;
      const r = Math.round(219 + p * (251 - 219));
      const g = Math.round(39 + p * (207 - 39));
      const b = Math.round(119 + p * (232 - 119));
      return `rgb(${r},${g},${b})`; // pink transition
    }
    if (pH < 9.5) {
      const p = (pH - 7.5) / 2.0;
      const r = Math.round(251 + p * (163 - 251));
      const g = Math.round(207 + p * (230 - 207));
      const b = Math.round(232 + p * (53 - 232));
      return `rgb(${r},${g},${b})`; // green-yellow transition
    }
    return "#a3e635"; // green-yellow
  }

  // Red Cabbage (multi-color Anthocyanin indicator)
  if (pH < 3.0) return "#ef4444"; // Red
  if (pH < 5.0) {
    const p = (pH - 3.0) / 2.0;
    return p < 0.5 ? "#f43f5e" : "#f472b6"; // Pinkish Red
  }
  if (pH < 7.5) return "#8b5cf6"; // Purple/Violet
  if (pH < 9.0) return "#3b82f6"; // Blue
  if (pH < 11.5) return "#10b981"; // Green
  return "#eab308"; // Yellow
}

export function addIndicatorDropAction(state: NaturalIndicatorsState): NaturalIndicatorsState {
  if (state.selectedSolution === null) return state;
  const next = { ...state };
  next.addedIndicatorDrops = Math.min(10, next.addedIndicatorDrops + 1);
  next.colorMixProgress = 0; // reset mixing animation
  next.steps[4].completed = true;
  
  // Check objective o2 (testing acidic vs basic)
  const isAcid = next.solutionPh < 4;
  const isBase = next.solutionPh > 9;
  if (isAcid && next.addedIndicatorDrops >= 3) {
    // Check if basic was also tested in observations
    const testedBase = state.observations.some(o => o.message.includes("NaOH") || o.message.includes("Soap"));
    if (testedBase) next.objectives[1].completed = true;
  }
  if (isBase && next.addedIndicatorDrops >= 3) {
    const testedAcid = state.observations.some(o => o.message.includes("HCl") || o.message.includes("Vinegar"));
    if (testedAcid) next.objectives[1].completed = true;
  }

  // Blended liquid color
  const targetCol = getIndicatorColor(state.selectedIndicator!, next.solutionPh);
  next.observations.unshift(mkObs("chemical_added", `Added a drop of indicator extract to ${state.selectedSolution}.`, "info"));
  return next;
}

export function tickIndicatorsMix(state: NaturalIndicatorsState, deltaSec: number): NaturalIndicatorsState {
  const next = { ...state };
  if (next.addedIndicatorDrops > 0 && next.colorMixProgress < 1.0) {
    next.colorMixProgress = Math.min(1.0, next.colorMixProgress + 0.35 * deltaSec * 10);
  }
  return next;
}

export function submitIndicatorsResult(state: NaturalIndicatorsState): NaturalIndicatorsState {
  const next = { ...state };
  next.status = "completed";

  const allObjectivesCompleted = next.objectives.every(obj => obj.completed);
  next.result = {
    completedAt: Date.now(),
    success: allObjectivesCompleted,
    score: allObjectivesCompleted ? 100 : next.objectives.filter(o => o.completed).length * 33,
    summary: `Investigated natural indicators (${state.selectedIndicator}) across different household solutions. Observed the color spectrum transitions and identified acidic, neutral, and alkaline behaviors.`,
    explanation: `Natural indicators contain organic pigments like curcumin and anthocyanins that change color due to protonation (gaining H⁺) or deprotonation (losing H⁺) corresponding to hydronium or hydroxide concentration.`,
  };
  return next;
}

export function resetIndicators(state: NaturalIndicatorsState): NaturalIndicatorsState {
  return initialIndicatorsState(state.mode);
}
