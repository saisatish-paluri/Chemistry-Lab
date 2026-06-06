import type {
  ChromatographyState, InkId, ChromaDye,
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

// ── Ink compositions ──────────────────────────────────────────────────────────
export interface InkProfile {
  id:    InkId;
  name:  string;
  dyes:  Array<{ name: string; color: string; rfValue: number }>;
}

export const INKS: Record<InkId, InkProfile> = {
  "black-ink": {
    id: "black-ink", name: "Black Ink",
    dyes: [
      { name: "Cyan dye",    color: "#06b6d4", rfValue: 0.85 },
      { name: "Magenta dye", color: "#ec4899", rfValue: 0.65 },
      { name: "Yellow dye",  color: "#eab308", rfValue: 0.45 },
      { name: "Black dye",   color: "#1e293b", rfValue: 0.20 },
    ],
  },
  "blue-ink": {
    id: "blue-ink", name: "Blue Ink",
    dyes: [
      { name: "Azure blue",  color: "#3b82f6", rfValue: 0.78 },
      { name: "Deep blue",   color: "#1d4ed8", rfValue: 0.42 },
    ],
  },
  "green-ink": {
    id: "green-ink", name: "Green Ink",
    dyes: [
      { name: "Cyan dye",    color: "#06b6d4", rfValue: 0.82 },
      { name: "Yellow dye",  color: "#eab308", rfValue: 0.50 },
      { name: "Green dye",   color: "#22c55e", rfValue: 0.35 },
    ],
  },
  "red-ink": {
    id: "red-ink", name: "Red Ink",
    dyes: [
      { name: "Orange dye",  color: "#f97316", rfValue: 0.72 },
      { name: "Red dye",     color: "#ef4444", rfValue: 0.38 },
    ],
  },
};

const INITIAL_STEPS: StepDef[] = [
  { id: "s1", instruction: "Select an ink sample to analyse", hint: "Mixed inks contain multiple dye components with different polarities.", completed: false },
  { id: "s2", instruction: "Apply a concentrated ink spot near the bottom of the chromatography paper", hint: "Use a capillary tube — spot should be small and concentrated.", completed: false },
  { id: "s3", instruction: "Place the paper in the developing chamber", hint: "Make sure the ink spot is above the solvent level.", completed: false },
  { id: "s4", instruction: "Add solvent to the chamber and start development", hint: "The solvent travels up by capillary action (mobile phase).", completed: false },
  { id: "s5", instruction: "Wait for solvent front to reach near the top", hint: "Each dye moves at a different rate based on its affinity for solvent vs paper.", completed: false },
  { id: "s6", instruction: "Remove paper, mark solvent front, calculate Rf values", hint: "Rf = distance of spot / distance of solvent front.", completed: false },
];

const INITIAL_OBJECTIVES: ExperimentObjective[] = [
  { id: "o1", description: "Successfully develop the chromatogram", completed: false },
  { id: "o2", description: "Identify all dye bands in the ink", completed: false },
  { id: "o3", description: "Calculate Rf values for each component", completed: false },
];

export function initialChromatographyState(mode: ChromatographyState["mode"] = "guided"): ChromatographyState {
  return {
    mode,
    status:         "idle",
    selectedInk:    null,
    inkApplied:     false,
    paperInChamber: false,
    solventAdded:   false,
    isRunning:      false,
    solventFrontCm: 0,
    dyes:           [],
    rfValues:       [],
    runComplete:    false,
    steps:          INITIAL_STEPS.map(s => ({ ...s })),
    objectives:     INITIAL_OBJECTIVES.map(o => ({ ...o })),
    observations:   [],
    result:         null,
    startedAt:      null,
  };
}

export function selectInk(state: ChromatographyState, id: InkId): ChromatographyState {
  const ink = INKS[id];
  const obs = mkObs("reaction-start", `Selected ${ink.name} for analysis. This ink contains ${ink.dyes.length} dye component(s). Apply a spot and develop the chromatogram.`, "info");
  const steps = state.steps.map(s => s.id === "s1" ? { ...s, completed: true } : s);
  return {
    ...state,
    selectedInk: id,
    status:      "running",
    startedAt:   state.startedAt ?? Date.now(),
    steps,
    observations: [obs, ...state.observations],
  };
}

export function applyInkSpot(state: ChromatographyState): ChromatographyState {
  if (!state.selectedInk || state.inkApplied) return state;
  const obs   = mkObs("reaction-start", "Ink spot applied 2 cm from the bottom of the chromatography paper using a capillary tube. Spot is small and concentrated.", "info");
  const steps = state.steps.map(s => s.id === "s2" ? { ...s, completed: true } : s);
  return { ...state, inkApplied: true, steps, observations: [obs, ...state.observations] };
}

export function placePaperInChamber(state: ChromatographyState): ChromatographyState {
  if (!state.inkApplied || state.paperInChamber) return state;
  const obs   = mkObs("reaction-start", "Chromatography paper placed in the developing chamber. Ink spot is above the solvent level to prevent washing.", "info");
  const steps = state.steps.map(s => s.id === "s3" ? { ...s, completed: true } : s);
  return { ...state, paperInChamber: true, steps, observations: [obs, ...state.observations] };
}

export function addSolvent(state: ChromatographyState): ChromatographyState {
  if (!state.paperInChamber || state.solventAdded) return state;
  const obs   = mkObs("reaction-start", "Solvent added to chamber. Capillary action drives the mobile phase up the stationary paper phase. Separation begins.", "info");
  const steps = state.steps.map(s => (s.id === "s4" || s.id === "s5") ? { ...s, completed: s.id === "s4" } : s);
  return { ...state, solventAdded: true, isRunning: true, steps, objectives: state.objectives.map(o => o.id === "o1" ? { ...o, completed: false } : o), observations: [obs, ...state.observations] };
}

export function updateSolventFront(state: ChromatographyState, frontCm: number): ChromatographyState {
  if (!state.isRunning || state.runComplete) return state;
  const ink = state.selectedInk ? INKS[state.selectedInk] : null;
  if (!ink) return state;

  const dyes: ChromaDye[] = ink.dyes.map(d => ({
    name:       d.name,
    color:      d.color,
    rfValue:    d.rfValue,
    distanceCm: Math.min(d.rfValue * frontCm, d.rfValue * 10),
  }));

  let runComplete: boolean = state.runComplete;
  let observations  = [...state.observations];
  let steps         = [...state.steps];
  let objectives    = [...state.objectives];

  if (frontCm >= 9.5 && !state.runComplete) {
    runComplete    = true;
    const rfVals   = dyes.map(d => ({ name: d.name, rf: parseFloat(d.rfValue.toFixed(2)), color: d.color }));
    const obs1     = mkObs("reaction-complete", `Solvent front reached ${frontCm.toFixed(1)} cm. Development complete — ${dyes.length} band(s) separated.`, "success");
    const obs2     = mkObs("color-change", `Rf values: ${rfVals.map(r => `${r.name}: ${r.rf}`).join(", ")}.`, "success");
    observations   = [obs2, obs1, ...observations];
    steps          = steps.map(s => s.id === "s5" ? { ...s, completed: true } : s);
    objectives     = objectives.map(o => o.id === "o1" || o.id === "o2" ? { ...o, completed: true } : o);
  }

  return {
    ...state,
    solventFrontCm: frontCm,
    dyes,
    runComplete,
    isRunning:      !runComplete,
    steps,
    objectives,
    observations,
  };
}

export function calculateRfValues(state: ChromatographyState): ChromatographyState {
  if (!state.runComplete) return state;
  const rfValues = state.dyes.map(d => ({
    name:  d.name,
    rf:    parseFloat((d.distanceCm / state.solventFrontCm).toFixed(2)),
    color: d.color,
  }));
  const obs   = mkObs("reaction-complete", `Rf values calculated: ${rfValues.map(r => `${r.name} Rf = ${r.rf}`).join(", ")}. Lower Rf = more polar (less soluble in mobile phase).`, "success");
  const steps = state.steps.map(s => s.id === "s6" ? { ...s, completed: true } : s);

  return {
    ...state,
    rfValues,
    steps,
    observations: [obs, ...state.observations],
    objectives:   state.objectives.map(o => o.id === "o3" ? { ...o, completed: true } : o),
  };
}

export function completeChromatography(state: ChromatographyState): ChromatographyState {
  const ink      = state.selectedInk ? INKS[state.selectedInk] : null;
  const rfList   = state.rfValues.map(r => `${r.name} (Rf = ${r.rf})`).join(", ");

  const result: ExperimentResult = {
    completedAt: Date.now(),
    success:     state.runComplete,
    score:       state.rfValues.length > 0 ? 93 : 70,
    summary:     ink ? `${ink.name} separated into ${state.dyes.length} dye component(s).` : "Chromatography completed.",
    explanation:
      ink
        ? `Paper chromatography of ${ink.name} revealed ${ink.dyes.length} distinct components: ${rfList}. ` +
          `Dyes with higher Rf values are less polar and travel further with the solvent front. ` +
          `The stationary phase (paper/cellulose) retains polar dyes more strongly than the mobile phase (organic solvent).`
        : "Run the chromatography to observe dye separation.",
  };

  return {
    ...state,
    status:       "completed",
    result,
    observations: [mkObs("reaction-complete", "Chromatography experiment complete. All Rf values recorded.", "success"), ...state.observations],
    objectives:   state.objectives.map(o => ({ ...o, completed: true })),
  };
}

export function resetChromatography(state: ChromatographyState): ChromatographyState {
  return initialChromatographyState(state.mode);
}
