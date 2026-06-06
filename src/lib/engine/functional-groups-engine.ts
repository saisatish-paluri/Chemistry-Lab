import type {
  FunctionalGroupsState, FunctionalGroupId, FGTestId, UnknownCompoundId,
  FGTestResult,
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

// ── Compound profiles ─────────────────────────────────────────────────────────
export interface CompoundProfile {
  id:              UnknownCompoundId;
  label:           string;
  example:         string;
  formula:         string;
  group:           FunctionalGroupId;
  groupName:       string;
  correctTest:     FGTestId;
}

export const COMPOUNDS: Record<UnknownCompoundId, CompoundProfile> = {
  "compound-a": { id: "compound-a", label: "Compound A", example: "1-Butanol", formula: "C₄H₉OH",     group: "alcohol",         groupName: "Alcohol",         correctTest: "lucas-test"   },
  "compound-b": { id: "compound-b", label: "Compound B", example: "Ethanal",   formula: "CH₃CHO",      group: "aldehyde",        groupName: "Aldehyde",        correctTest: "tollens-test" },
  "compound-c": { id: "compound-c", label: "Compound C", example: "Propanone", formula: "(CH₃)₂CO",    group: "ketone",          groupName: "Ketone",          correctTest: "dnp-test"     },
  "compound-d": { id: "compound-d", label: "Compound D", example: "Acetic Acid","formula": "CH₃COOH", group: "carboxylic-acid", groupName: "Carboxylic Acid", correctTest: "nahco3-test"  },
  "compound-e": { id: "compound-e", label: "Compound E", example: "Aniline",   formula: "C₆H₅NH₂",    group: "amine",           groupName: "Amine",           correctTest: "hinsberg-test"},
};

// ── Test profiles ─────────────────────────────────────────────────────────────
export interface TestProfile {
  id:           FGTestId;
  name:         string;
  reagent:      string;
  detects:      FunctionalGroupId;
  posObs:       string;
  negObs:       string;
  posColor:     string;
  negColor:     string;
  posExplain:   string;
  negExplain:   string;
}

export const TESTS: Record<FGTestId, TestProfile> = {
  "lucas-test": {
    id:         "lucas-test",
    name:       "Lucas Test",
    reagent:    "ZnCl₂ in conc. HCl (Lucas reagent)",
    detects:    "alcohol",
    posObs:     "Cloudiness / turbidity appears (alkyl chloride formed)",
    negObs:     "Solution remains clear — no alcohol present",
    posColor:   "#f8fafc",
    negColor:   "#dbeafe",
    posExplain: "R-OH + HCl(ZnCl₂) → R-Cl + H₂O. Alkyl chloride (insoluble in reagent) causes cloudiness. 3° > 2° > 1° in reactivity.",
    negExplain: "No cloudiness — functional group is not an alcohol or is very slow (primary alcohol).",
  },
  "tollens-test": {
    id:         "tollens-test",
    name:       "Tollen's Test (Silver Mirror)",
    reagent:    "Tollen's reagent [Ag(NH₃)₂]⁺",
    detects:    "aldehyde",
    posObs:     "Silver mirror deposits on inner wall of test tube",
    negObs:     "No silver deposit — no aldehyde",
    posColor:   "#c0c0c0",
    negColor:   "#dbeafe",
    posExplain: "RCHO + 2[Ag(NH₃)₂]⁺ + 2OH⁻ → RCOO⁻ + 2Ag↓ + 4NH₃ + H₂O. Aldehyde reduces Ag⁺ to metallic silver.",
    negExplain: "Ketones do not reduce Tollen's reagent — they lack the oxidisable C-H bond adjacent to the carbonyl.",
  },
  "dnp-test": {
    id:         "dnp-test",
    name:       "2,4-DNP Test",
    reagent:    "2,4-Dinitrophenylhydrazine (Brady's reagent)",
    detects:    "ketone",
    posObs:     "Orange/yellow crystalline precipitate forms",
    negObs:     "No precipitate — no carbonyl (C=O) group",
    posColor:   "#f97316",
    negColor:   "#dbeafe",
    posExplain: "C=O + 2,4-DNP → dinitrophenylhydrazone (orange). Positive for both aldehydes and ketones; use Tollen's to distinguish.",
    negExplain: "No precipitate indicates absence of aldehyde or ketone functional group.",
  },
  "nahco3-test": {
    id:         "nahco3-test",
    name:       "NaHCO₃ Test",
    reagent:    "Sodium Bicarbonate (NaHCO₃) solution",
    detects:    "carboxylic-acid",
    posObs:     "Brisk effervescence — CO₂ gas evolved",
    negObs:     "No effervescence — no carboxylic acid",
    posColor:   "#d1fae5",
    negColor:   "#dbeafe",
    posExplain: "RCOOH + NaHCO₃ → RCOONa + H₂O + CO₂↑. Strong enough acid to react with bicarbonate; weaker acids (phenols) do not.",
    negExplain: "No CO₂ — compound is not acidic enough to react with NaHCO₃ (not a carboxylic acid).",
  },
  "hinsberg-test": {
    id:         "hinsberg-test",
    name:       "Hinsberg Test",
    reagent:    "Benzenesulfonyl chloride + KOH(aq)",
    detects:    "amine",
    posObs:     "Product dissolves in KOH — primary amine confirmed",
    negObs:     "No clear dissolution change — not an amine",
    posColor:   "#a78bfa",
    negColor:   "#dbeafe",
    posExplain: "R-NH₂ + PhSO₂Cl → R-NH-SO₂Ph (sulfonamide). Primary sulfonamide is soluble in KOH. 2° gives insoluble sulfonamide; 3° does not react.",
    negExplain: "No distinctive sulfonamide formation — compound lacks a primary or secondary amine group.",
  },
};

// ── Steps / Objectives ────────────────────────────────────────────────────────
const INITIAL_STEPS: StepDef[] = [
  { id: "s1", instruction: "Select an unknown organic compound (A–E)", hint: "Each compound contains one functional group.", completed: false },
  { id: "s2", instruction: "Choose an appropriate reagent test from the list", hint: "Lucas = alcohol, Tollen's = aldehyde, 2,4-DNP = ketone/aldehyde, NaHCO₃ = acid, Hinsberg = amine.", completed: false },
  { id: "s3", instruction: "Add the reagent and observe the reaction", hint: "Watch for colour change, precipitate, or gas evolution.", completed: false },
  { id: "s4", instruction: "Record your observation and interpret the result", hint: "Positive test → functional group present. Negative → absent.", completed: false },
  { id: "s5", instruction: "Identify the functional group and complete the experiment", hint: "Run more than one test to confirm your identification.", completed: false },
];

const INITIAL_OBJECTIVES: ExperimentObjective[] = [
  { id: "o1", description: "Select and test at least one compound", completed: false },
  { id: "o2", description: "Correctly interpret a positive test result", completed: false },
  { id: "o3", description: "Identify the functional group of the unknown compound", completed: false },
];

export function initialFunctionalGroupsState(mode: FunctionalGroupsState["mode"] = "guided"): FunctionalGroupsState {
  return {
    mode,
    status:           "idle",
    selectedCompound: null,
    selectedTest:     null,
    testResults:      [],
    isTesting:        false,
    identified:       null,
    steps:            INITIAL_STEPS.map(s => ({ ...s })),
    objectives:       INITIAL_OBJECTIVES.map(o => ({ ...o })),
    observations:     [],
    result:           null,
    startedAt:        null,
  };
}

export function selectFGCompound(state: FunctionalGroupsState, id: UnknownCompoundId): FunctionalGroupsState {
  const obs   = mkObs("reaction-start", `Unknown ${COMPOUNDS[id].label} selected. Formula: ${COMPOUNDS[id].formula}. Choose a reagent test to identify its functional group.`, "info");
  const steps = state.steps.map(s => s.id === "s1" ? { ...s, completed: true } : s);
  return {
    ...state,
    selectedCompound: id,
    selectedTest:     null,
    identified:       null,
    status:           "running",
    startedAt:        state.startedAt ?? Date.now(),
    steps,
    observations:     [obs, ...state.observations],
  };
}

export function selectFGTest(state: FunctionalGroupsState, id: FGTestId): FunctionalGroupsState {
  const steps = state.steps.map(s => s.id === "s2" ? { ...s, completed: true } : s);
  return { ...state, selectedTest: id, steps };
}

export function runFGTest(state: FunctionalGroupsState): FunctionalGroupsState {
  if (!state.selectedCompound || !state.selectedTest || state.isTesting) return state;
  return { ...state, isTesting: true };
}

export function finishFGTest(state: FunctionalGroupsState): FunctionalGroupsState {
  if (!state.selectedCompound || !state.selectedTest) return state;
  const compound = COMPOUNDS[state.selectedCompound];
  const test     = TESTS[state.selectedTest];
  const positive = test.detects === compound.group;

  const fgResult: FGTestResult = {
    testId:      state.selectedTest,
    testName:    test.name,
    observation: positive ? test.posObs : test.negObs,
    color:       positive ? test.posColor : test.negColor,
    positive,
    timestamp:   Date.now(),
  };

  const obs = mkObs(
    positive ? "color-change" : "no-reaction",
    positive
      ? `POSITIVE: ${test.posObs}. ${test.posExplain}`
      : `NEGATIVE: ${test.negObs}. ${test.negExplain}`,
    positive ? "success" : "info",
  );

  const steps = state.steps.map(s => s.id === "s3" || s.id === "s4" ? { ...s, completed: true } : s);
  const identified = positive ? compound.group : state.identified;

  return {
    ...state,
    isTesting:    false,
    testResults:  [fgResult, ...state.testResults],
    identified,
    steps,
    observations: [obs, ...state.observations],
    objectives:   state.objectives.map(o => {
      if (o.id === "o1") return { ...o, completed: true };
      if (o.id === "o2" && positive) return { ...o, completed: true };
      if (o.id === "o3" && positive) return { ...o, completed: true };
      return o;
    }),
  };
}

export function completeFunctionalGroups(state: FunctionalGroupsState): FunctionalGroupsState {
  const compound = state.selectedCompound ? COMPOUNDS[state.selectedCompound] : null;

  const result: ExperimentResult = {
    completedAt: Date.now(),
    success:     !!state.identified,
    score:       state.identified ? 90 : 60,
    summary:     compound
      ? `Functional group identified: ${compound.groupName} in ${compound.label} (${compound.example}).`
      : "Experiment completed. Run tests on more compounds for practice.",
    explanation: compound
      ? `${compound.label} (${compound.formula}) contains a ${compound.groupName} group. ` +
        `The ${TESTS[compound.correctTest].name} gave a positive result: ${TESTS[compound.correctTest].posObs}. ` +
        TESTS[compound.correctTest].posExplain
      : "More tests needed to identify the functional group.",
  };

  const steps = state.steps.map(s => s.id === "s5" ? { ...s, completed: true } : s);
  return {
    ...state,
    status:       "completed",
    steps,
    result,
    observations: [mkObs("reaction-complete", "Functional group identification complete.", "success"), ...state.observations],
    objectives:   state.objectives.map(o => ({ ...o, completed: true })),
  };
}

export function resetFunctionalGroups(state: FunctionalGroupsState): FunctionalGroupsState {
  return initialFunctionalGroupsState(state.mode);
}
