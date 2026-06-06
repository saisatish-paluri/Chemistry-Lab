import type {
  SaltAnalysisState, UnknownSaltId, SaltCationId, SaltAnionId,
  SaltTestResult,
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

// ── Salt profiles ─────────────────────────────────────────────────────────────
export interface SaltProfile {
  id:      UnknownSaltId;
  name:    string;
  formula: string;
  cation:  SaltCationId;
  anion:   SaltAnionId;
  color:   string;  // solution color in water
}

export const SALTS: Record<UnknownSaltId, SaltProfile> = {
  "copper-sulfate": {
    id: "copper-sulfate", name: "Copper(II) Sulfate", formula: "CuSO₄",
    cation: "copper", anion: "sulfate", color: "#3b82f6",
  },
  "iron-chloride": {
    id: "iron-chloride", name: "Iron(III) Chloride", formula: "FeCl₃",
    cation: "iron", anion: "chloride", color: "#b45309",
  },
  "zinc-carbonate": {
    id: "zinc-carbonate", name: "Zinc Carbonate", formula: "ZnCO₃",
    cation: "zinc", anion: "carbonate", color: "#94a3b8",
  },
  "calcium-nitrate": {
    id: "calcium-nitrate", name: "Calcium Nitrate", formula: "Ca(NO₃)₂",
    cation: "calcium", anion: "nitrate", color: "#e2e8f0",
  },
  "ammonium-chloride": {
    id: "ammonium-chloride", name: "Ammonium Chloride", formula: "NH₄Cl",
    cation: "ammonium", anion: "chloride", color: "#f1f5f9",
  },
};

// ── Cation tests ──────────────────────────────────────────────────────────────
export interface CationTest {
  testName:      string;
  reagent:       string;
  cation:        SaltCationId;
  observation:   string;
  color:         string;
  precipitate:   boolean;
  effervescence: boolean;
  explanation:   string;
}

export const CATION_TESTS: Record<SaltCationId, CationTest> = {
  copper: {
    testName: "NaOH Test (Cation)",
    reagent: "Sodium Hydroxide (NaOH)",
    cation: "copper",
    observation: "Blue precipitate forms — Cu(OH)₂",
    color: "#2563eb",
    precipitate: true,
    effervescence: false,
    explanation: "Cu²⁺ + 2OH⁻ → Cu(OH)₂↓ (blue precipitate). Characteristic of copper(II) ions.",
  },
  iron: {
    testName: "NaOH Test (Cation)",
    reagent: "Sodium Hydroxide (NaOH)",
    cation: "iron",
    observation: "Reddish-brown precipitate — Fe(OH)₃",
    color: "#b45309",
    precipitate: true,
    effervescence: false,
    explanation: "Fe³⁺ + 3OH⁻ → Fe(OH)₃↓ (reddish-brown). Characteristic of iron(III) ions.",
  },
  zinc: {
    testName: "NaOH Test (Cation)",
    reagent: "Sodium Hydroxide (NaOH)",
    cation: "zinc",
    observation: "White precipitate — Zn(OH)₂ (dissolves in excess NaOH)",
    color: "#e2e8f0",
    precipitate: true,
    effervescence: false,
    explanation: "Zn²⁺ + 2OH⁻ → Zn(OH)₂↓ (white). Dissolves in excess NaOH forming [Zn(OH)₄]²⁻ (amphoteric).",
  },
  calcium: {
    testName: "Flame Test (Cation)",
    reagent: "Bunsen Burner Flame",
    cation: "calcium",
    observation: "Brick-red / orange-red flame colour",
    color: "#ea580c",
    precipitate: false,
    effervescence: false,
    explanation: "Ca²⁺ ions emit brick-red light (≈ 620–630 nm) when electrons fall from excited to ground state.",
  },
  ammonium: {
    testName: "NaOH Warm Test (Cation)",
    reagent: "NaOH + gentle heating",
    cation: "ammonium",
    observation: "Pungent ammonia gas evolved — turns moist red litmus blue",
    color: "#d1fae5",
    precipitate: false,
    effervescence: true,
    explanation: "NH₄⁺ + OH⁻ → NH₃(g) + H₂O. Ammonia gas turns moist red litmus paper blue.",
  },
};

// ── Anion tests ───────────────────────────────────────────────────────────────
export interface AnionTest {
  testName:      string;
  reagent:       string;
  anion:         SaltAnionId;
  observation:   string;
  color:         string;
  precipitate:   boolean;
  effervescence: boolean;
  explanation:   string;
}

export const ANION_TESTS: Record<SaltAnionId, AnionTest> = {
  chloride: {
    testName: "AgNO₃ Test (Anion)",
    reagent: "Silver Nitrate (AgNO₃) + dilute HNO₃",
    anion: "chloride",
    observation: "White curdy precipitate — AgCl (insoluble in dilute HNO₃)",
    color: "#f8fafc",
    precipitate: true,
    effervescence: false,
    explanation: "Cl⁻ + Ag⁺ → AgCl↓ (white). Insoluble in dilute HNO₃, soluble in NH₃ — confirms chloride.",
  },
  sulfate: {
    testName: "BaCl₂ Test (Anion)",
    reagent: "Barium Chloride (BaCl₂) + dilute HCl",
    anion: "sulfate",
    observation: "White precipitate — BaSO₄ (insoluble in dilute HCl)",
    color: "#f1f5f9",
    precipitate: true,
    effervescence: false,
    explanation: "SO₄²⁻ + Ba²⁺ → BaSO₄↓ (white). Persistent white precipitate even in dilute HCl confirms sulfate.",
  },
  carbonate: {
    testName: "HCl Test (Anion)",
    reagent: "Dilute Hydrochloric Acid (HCl)",
    anion: "carbonate",
    observation: "Effervescence — CO₂ gas turns lime water milky",
    color: "#d1fae5",
    precipitate: false,
    effervescence: true,
    explanation: "CO₃²⁻ + 2H⁺ → H₂O + CO₂↑. Gas turns Ca(OH)₂ solution milky (CaCO₃↓), confirming carbonate.",
  },
  nitrate: {
    testName: "Brown Ring Test (Anion)",
    reagent: "FeSO₄ + conc. H₂SO₄",
    anion: "nitrate",
    observation: "Brown ring at interface — [Fe(NO)]SO₄",
    color: "#92400e",
    precipitate: false,
    effervescence: false,
    explanation: "NO₃⁻ oxidises Fe²⁺ to [Fe(NO)]²⁺ complex producing a brown ring at the H₂SO₄/FeSO₄ interface.",
  },
};

// ── Steps / Objectives ────────────────────────────────────────────────────────
const INITIAL_STEPS: StepDef[] = [
  { id: "s1", instruction: "Select an unknown salt sample from the list", hint: "You will be given an unknown — run tests to identify it.", completed: false },
  { id: "s2", instruction: "Record preliminary observations (colour, appearance)", hint: "Colour of the solution gives a first clue to the cation.", completed: false },
  { id: "s3", instruction: "Perform cation test (NaOH / flame test)", hint: "Precipitate colour or flame colour identifies the metal ion.", completed: false },
  { id: "s4", instruction: "Perform anion test (AgNO₃ / BaCl₂ / HCl / Brown ring)", hint: "Precipitate or gas evolution identifies the anion.", completed: false },
  { id: "s5", instruction: "Compare observations and identify the salt", hint: "Combine cation + anion results to name the compound.", completed: false },
];

const INITIAL_OBJECTIVES: ExperimentObjective[] = [
  { id: "o1", description: "Identify the cation using appropriate test", completed: false },
  { id: "o2", description: "Identify the anion using appropriate test", completed: false },
  { id: "o3", description: "Determine the complete name and formula of the salt", completed: false },
];

export function initialSaltAnalysisState(mode: SaltAnalysisState["mode"] = "guided"): SaltAnalysisState {
  return {
    mode,
    status: "idle",
    selectedSalt: null,
    phase: "select",
    cationResults: [],
    anionResults: [],
    identifiedCation: null,
    identifiedAnion: null,
    currentTest: null,
    isTesting: false,
    testProgress: 0,
    steps: INITIAL_STEPS.map(s => ({ ...s })),
    objectives: INITIAL_OBJECTIVES.map(o => ({ ...o })),
    observations: [],
    result: null,
    startedAt: null,
  };
}

export function selectSalt(state: SaltAnalysisState, id: UnknownSaltId): SaltAnalysisState {
  const obs = mkObs("reaction-start", `Unknown salt selected. Appears as ${id === "copper-sulfate" ? "blue" : id === "iron-chloride" ? "orange-brown" : "white/colourless"} solution. Begin systematic analysis.`, "info");
  const steps = state.steps.map(s => s.id === "s1" ? { ...s, completed: true } : s);
  return {
    ...state,
    selectedSalt: id,
    phase: "preliminary",
    steps,
    observations: [obs, ...state.observations],
    status: "running",
    startedAt: state.startedAt ?? Date.now(),
  };
}

export function recordPreliminary(state: SaltAnalysisState): SaltAnalysisState {
  if (!state.selectedSalt) return state;
  const salt = SALTS[state.selectedSalt];
  const obs  = mkObs("color-change", `Preliminary: salt dissolves in water giving ${salt.cation === "copper" ? "blue" : salt.cation === "iron" ? "orange-brown" : "colourless"} solution. No odour (except ammonium). Proceed to cation test.`, "info");
  const steps = state.steps.map(s => s.id === "s2" ? { ...s, completed: true } : s);
  return { ...state, phase: "cation", steps, observations: [obs, ...state.observations] };
}

export function runCationTest(state: SaltAnalysisState): SaltAnalysisState {
  if (!state.selectedSalt || state.isTesting) return state;
  return { ...state, isTesting: true, currentTest: "cation", testProgress: 0 };
}

export function finishCationTest(state: SaltAnalysisState): SaltAnalysisState {
  if (!state.selectedSalt || state.currentTest !== "cation") return state;
  const salt   = SALTS[state.selectedSalt];
  const test   = CATION_TESTS[salt.cation];
  const result: SaltTestResult = {
    testName:      test.testName,
    observation:   test.observation,
    color:         test.color,
    precipitate:   test.precipitate,
    effervescence: test.effervescence,
    timestamp:     Date.now(),
  };
  const obs    = mkObs("precipitation", `Cation test: ${test.observation}. ${test.explanation}`, "success");
  const steps  = state.steps.map(s => s.id === "s3" ? { ...s, completed: true } : s);
  return {
    ...state,
    isTesting:        false,
    currentTest:      null,
    testProgress:     0,
    cationResults:    [result],
    identifiedCation: salt.cation,
    phase:            "anion",
    steps,
    observations:     [obs, ...state.observations],
    objectives:       state.objectives.map(o => o.id === "o1" ? { ...o, completed: true } : o),
  };
}

export function runAnionTest(state: SaltAnalysisState): SaltAnalysisState {
  if (!state.selectedSalt || state.isTesting) return state;
  return { ...state, isTesting: true, currentTest: "anion", testProgress: 0 };
}

export function finishAnionTest(state: SaltAnalysisState): SaltAnalysisState {
  if (!state.selectedSalt || state.currentTest !== "anion") return state;
  const salt   = SALTS[state.selectedSalt];
  const test   = ANION_TESTS[salt.anion];
  const result: SaltTestResult = {
    testName:      test.testName,
    observation:   test.observation,
    color:         test.color,
    precipitate:   test.precipitate,
    effervescence: test.effervescence,
    timestamp:     Date.now(),
  };
  const obs    = mkObs("precipitation", `Anion test: ${test.observation}. ${test.explanation}`, "success");
  const steps  = state.steps.map(s => s.id === "s4" ? { ...s, completed: true } : s);
  return {
    ...state,
    isTesting:       false,
    currentTest:     null,
    testProgress:    0,
    anionResults:    [result],
    identifiedAnion: salt.anion,
    phase:           "identify",
    steps,
    observations:    [obs, ...state.observations],
    objectives:      state.objectives.map(o => o.id === "o2" ? { ...o, completed: true } : o),
  };
}

export function completeSaltAnalysis(state: SaltAnalysisState): SaltAnalysisState {
  if (!state.selectedSalt || !state.identifiedCation || !state.identifiedAnion) return state;
  const salt = SALTS[state.selectedSalt];

  const result: ExperimentResult = {
    completedAt: Date.now(),
    success:     true,
    score:       92,
    summary:     `Unknown salt identified as ${salt.name} (${salt.formula}).`,
    explanation:
      `Systematic cation and anion analysis confirmed the presence of ${salt.cation} cation and ${salt.anion} anion. ` +
      `${CATION_TESTS[salt.cation].explanation} ${ANION_TESTS[salt.anion].explanation} ` +
      `Final identification: ${salt.name} (${salt.formula}).`,
  };

  const steps = state.steps.map(s => s.id === "s5" ? { ...s, completed: true } : s);
  const obs   = mkObs("reaction-complete", `Salt identified: ${salt.name} (${salt.formula}). Both cation (${salt.cation}) and anion (${salt.anion}) confirmed.`, "success");

  return {
    ...state,
    status:       "completed",
    phase:        "identify",
    steps,
    observations: [obs, ...state.observations],
    result,
    objectives:   state.objectives.map(o => ({ ...o, completed: true })),
  };
}

export function resetSaltAnalysis(state: SaltAnalysisState): SaltAnalysisState {
  return initialSaltAnalysisState(state.mode);
}
