import type {
  FlameTestState, FlameTestSampleId, FlameTestRecord,
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

export interface FlameTestSampleProfile {
  id:          FlameTestSampleId;
  name:        string;
  formula:     string;
  ion:         string;
  flameColor:  string;   // CSS hex
  colorName:   string;
  wavelength:  string;
  explanation: string;
}

export const FLAME_SAMPLES: Record<FlameTestSampleId, FlameTestSampleProfile> = {
  "lithium-chloride": {
    id: "lithium-chloride",
    name: "Lithium Chloride", formula: "LiCl", ion: "Li⁺",
    flameColor: "#DC143C", colorName: "Crimson Red", wavelength: "~670 nm",
    explanation:
      "Li⁺ electrons absorb thermal energy and jump to higher energy levels. " +
      "When they fall back, they emit photons at ~670 nm — visible as crimson red. " +
      "Each element's emission spectrum is unique (like a fingerprint).",
  },
  "sodium-chloride": {
    id: "sodium-chloride",
    name: "Sodium Chloride", formula: "NaCl", ion: "Na⁺",
    flameColor: "#FFA500", colorName: "Golden Yellow", wavelength: "~589 nm",
    explanation:
      "Na⁺ produces the most intense flame colour: bright golden-yellow at 589 nm " +
      "(the D-line doublet). Even trace contamination gives a yellow tinge, which " +
      "is why sodium is the most common contaminant in flame tests.",
  },
  "potassium-chloride": {
    id: "potassium-chloride",
    name: "Potassium Chloride", formula: "KCl", ion: "K⁺",
    flameColor: "#9370DB", colorName: "Lilac / Violet", wavelength: "~404 / 767 nm",
    explanation:
      "K⁺ emits at 404 nm (violet) and 767 nm (near-IR). The visible result is " +
      "a faint lilac colour. Sodium contamination (yellow) can mask it — " +
      "a cobalt-blue glass filter blocks yellow and reveals the violet.",
  },
  "barium-chloride": {
    id: "barium-chloride",
    name: "Barium Chloride", formula: "BaCl₂", ion: "Ba²⁺",
    flameColor: "#7CFC00", colorName: "Pale Apple Green", wavelength: "~524 nm",
    explanation:
      "Ba²⁺ emits a characteristic pale green at ~524 nm. " +
      "Barium compounds are used in green pyrotechnic fireworks. " +
      "Note: barium compounds are toxic — handle with care.",
  },
  "copper-sulfate": {
    id: "copper-sulfate",
    name: "Copper Sulfate", formula: "CuSO₄", ion: "Cu²⁺",
    flameColor: "#00CED1", colorName: "Blue-Green", wavelength: "~510 nm",
    explanation:
      "Cu²⁺ gives a vivid blue-green flame at ~510 nm. " +
      "Copper halides (especially CuCl₂) produce even brighter blue-green. " +
      "This is the basis of blue-green fireworks.",
  },
  "calcium-chloride": {
    id: "calcium-chloride",
    name: "Calcium Chloride", formula: "CaCl₂", ion: "Ca²⁺",
    flameColor: "#FF4500", colorName: "Orange-Red", wavelength: "~617 nm",
    explanation:
      "Ca²⁺ emits at ~617 and 622 nm, producing an orange-red colour. " +
      "Calcium compounds give red-orange fireworks. " +
      "Similar to strontium but less intense and more orange in tone.",
  },
  "strontium-chloride": {
    id: "strontium-chloride",
    name: "Strontium Chloride", formula: "SrCl₂", ion: "Sr²⁺",
    flameColor: "#FF2400", colorName: "Scarlet Red", wavelength: "~672 nm",
    explanation:
      "Sr²⁺ emits a bright scarlet-red at ~672 nm. " +
      "Strontium compounds are used in emergency flares and red fireworks. " +
      "The colour is more saturated and pure red than calcium.",
  },
};

const INITIAL_STEPS: StepDef[] = [
  { id: "light-burner",   instruction: "Light the Bunsen burner.",                              completed: false },
  { id: "select-sample",  instruction: "Select a metal salt sample.",                           completed: false },
  { id: "dip-loop",       instruction: "Dip the wire loop into the sample (clean loop first).", completed: false },
  { id: "perform-test",   instruction: "Hold the loop in the flame and observe the colour.",    completed: false },
  { id: "clean-loop",     instruction: "Clean the loop in HCl and re-test the blank.",         completed: false },
  { id: "test-more",      instruction: "Test at least 2 more different samples.",               completed: false },
];

const INITIAL_OBJECTIVES: ExperimentObjective[] = [
  { id: "light-burner",   description: "Light the Bunsen burner",                    completed: false },
  { id: "first-test",     description: "Complete a flame test for one metal ion",    completed: false },
  { id: "clean-between",  description: "Clean the loop between samples",             completed: false },
  { id: "three-samples",  description: "Test at least 3 different metal compounds",  completed: false },
];

export function initialFlameTestState(mode: FlameTestState["mode"]): FlameTestState {
  return {
    mode, status: "idle",
    flameLit: false,
    selectedSample: null,
    loopDipped: false,
    loopClean: true,
    contaminated: false,
    lastTestedSample: null,
    currentFlameColor: null,
    testHistory: [],
    steps:      INITIAL_STEPS.map((s) => ({ ...s })),
    objectives: INITIAL_OBJECTIVES.map((o) => ({ ...o })),
    observations: [], result: null, startedAt: null,
  };
}

export function lightBurner(state: FlameTestState): FlameTestState {
  if (state.flameLit) return state;
  if (state.status === "completed" || state.status === "failed") return state;
  return {
    ...state,
    flameLit: true,
    status: "setup",
    startedAt: state.startedAt ?? Date.now(),
    steps:      state.steps.map((s) => s.id === "light-burner" ? { ...s, completed: true } : s),
    objectives: state.objectives.map((o) => o.id === "light-burner" ? { ...o, completed: true } : o),
    observations: [
      mkObs("reaction-start", "Bunsen burner lit — blue cone flame indicates complete combustion. Ready to heat samples.", "info"),
      ...state.observations,
    ],
  };
}

export function selectSample(state: FlameTestState, sampleId: FlameTestSampleId): FlameTestState {
  if (!state.flameLit) return state;
  if (state.status === "running" || state.status === "completed" || state.status === "failed") return state;

  const isChange = state.selectedSample !== null && state.selectedSample !== sampleId;
  return {
    ...state,
    selectedSample: sampleId,
    loopDipped: false, // must re-dip when sample changes
    status: "setup",
    steps: state.steps.map((s) => s.id === "select-sample" ? { ...s, completed: true } : s),
    observations: isChange
      ? [mkObs("color-change", `Sample changed to ${FLAME_SAMPLES[sampleId].name} — dip the loop again.`, "info"), ...state.observations]
      : state.observations,
  };
}

export function dipLoop(state: FlameTestState): FlameTestState {
  if (!state.selectedSample) return state;
  if (!state.flameLit) return state;
  if (state.status === "running" || state.status === "completed" || state.status === "failed") return state;

  const sample = FLAME_SAMPLES[state.selectedSample];
  const newObs: ObservationEvent[] = [];
  let contaminated = state.contaminated;

  // Contamination: loop used before without cleaning
  if (!state.loopClean && state.lastTestedSample && state.lastTestedSample !== state.selectedSample) {
    contaminated = true;
    newObs.push(mkObs(
      "contamination",
      `Loop not cleaned! Residue from ${FLAME_SAMPLES[state.lastTestedSample].name} may contaminate this test. ` +
      "Clean in dilute HCl and re-dip for a valid result.",
      "warning",
    ));
  }

  newObs.push(mkObs("reaction-start", `Loop dipped in ${sample.name} (${sample.formula}) — ions coating the wire.`, "info"));

  return {
    ...state,
    loopDipped: true,
    contaminated,
    status: "ready",
    steps: state.steps.map((s) => s.id === "dip-loop" ? { ...s, completed: true } : s),
    observations: [...newObs, ...state.observations],
  };
}

export function performTest(state: FlameTestState): FlameTestState {
  if (!state.loopDipped || !state.selectedSample) return state;
  if (!state.flameLit) return state;
  if (state.status === "running" || state.status === "completed" || state.status === "failed") return state;

  const sample = FLAME_SAMPLES[state.selectedSample];
  return {
    ...state,
    status: "running",
    currentFlameColor: sample.flameColor,
    steps: state.steps.map((s) => s.id === "perform-test" ? { ...s, completed: true } : s),
    observations: [
      mkObs(
        "color-change",
        `Flame turns ${sample.colorName} (${sample.wavelength}) — ${sample.ion} characteristic emission. ${state.contaminated ? "⚠ Result may be contaminated." : ""}`,
        state.contaminated ? "warning" : "success",
      ),
      ...state.observations,
    ],
  };
}

export function completeTest(state: FlameTestState): FlameTestState {
  if (state.status !== "running" || !state.selectedSample) return state;
  const sample = FLAME_SAMPLES[state.selectedSample];

  const record: FlameTestRecord = {
    id: uid(),
    sampleId: state.selectedSample,
    flameColor: sample.flameColor,
    colorName: sample.colorName,
    contaminated: state.contaminated,
    timestamp: Date.now(),
  };

  const newHistory = [...state.testHistory, record];
  const uniqueSamples = new Set(newHistory.map((r) => r.sampleId)).size;
  let steps = state.steps;
  let objectives = state.objectives;

  // Unlock clean step
  if (newHistory.length >= 1) {
    steps = steps.map((s) => s.id === "clean-loop" ? s : s);
  }
  if (uniqueSamples >= 3) {
    steps = steps.map((s) => s.id === "test-more" ? { ...s, completed: true } : s);
    objectives = objectives.map((o) => o.id === "three-samples" ? { ...o, completed: true } : o);
  }
  if (newHistory.length >= 1) {
    objectives = objectives.map((o) => o.id === "first-test" ? { ...o, completed: true } : o);
  }

  const obsMsg =
    `${sample.name} test recorded: ${sample.colorName}. ` +
    `${sample.explanation}`;

  return {
    ...state,
    status: "setup",            // back to setup for next test
    loopDipped: false,
    loopClean: false,           // must clean before next test
    contaminated: false,
    lastTestedSample: state.selectedSample,
    currentFlameColor: null,    // flame returns to normal blue
    testHistory: newHistory,
    steps,
    objectives,
    observations: [
      mkObs("reaction-complete", obsMsg, "info"),
      ...state.observations,
    ],
  };
}

export function cleanLoop(state: FlameTestState): FlameTestState {
  if (state.status === "running" || state.status === "completed" || state.status === "failed") return state;
  if (state.loopClean) return state;
  return {
    ...state,
    loopClean: true,
    contaminated: false,
    loopDipped: false,
    steps: state.steps.map((s) => s.id === "clean-loop" ? { ...s, completed: true } : s),
    objectives: state.objectives.map((o) => o.id === "clean-between" ? { ...o, completed: true } : o),
    observations: [
      mkObs(
        "reaction-start",
        "Loop cleaned in dilute HCl and confirmed blank — no residual colour. Safe to test next sample.",
        "success",
      ),
      ...state.observations,
    ],
  };
}

export function completeFlameTest(state: FlameTestState): FlameTestState {
  if (state.status === "completed" || state.status === "failed") return state;
  const uniqueSamples = new Set(state.testHistory.map((r) => r.sampleId)).size;
  if (uniqueSamples < 1) return state; // nothing done

  const score = uniqueSamples >= 4 ? 100
    : uniqueSamples === 3 ? 90
    : uniqueSamples === 2 ? 75
    : 60;

  const cleanTests = state.testHistory.filter((r) => !r.contaminated).length;

  const result = {
    completedAt: Date.now(),
    success: uniqueSamples >= 2,
    score,
    summary:
      `Tested ${state.testHistory.length} sample(s) across ${uniqueSamples} unique compound(s). ` +
      `${cleanTests} clean test(s), ${state.testHistory.length - cleanTests} contaminated.`,
    explanation:
      "Flame colours arise from electron transitions: heat excites metal-ion electrons to higher " +
      "energy levels; when they fall back to the ground state, photons of specific wavelengths are " +
      "emitted. Because energy levels are element-specific, each metal ion produces a unique colour. " +
      "This is the basis of emission spectroscopy and atomic absorption spectroscopy (AAS) in industry.\n\n" +
      "Key colours: Li⁺ crimson, Na⁺ golden-yellow, K⁺ lilac, Ba²⁺ pale green, Cu²⁺ blue-green, " +
      "Ca²⁺ orange-red, Sr²⁺ scarlet.",
  };

  return {
    ...state,
    status: "completed",
    result,
    objectives: state.objectives.map((o) => ({ ...o, completed: true })),
    observations: [
      mkObs("reaction-complete", `Flame test experiment concluded. ${state.testHistory.length} tests completed.`, "success"),
      ...state.observations,
    ],
  };
}

export function resetFlameTest(mode: FlameTestState["mode"]): FlameTestState {
  return initialFlameTestState(mode);
}
