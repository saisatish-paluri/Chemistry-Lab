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

    // Overhaul variables
    temperature: 25,
    reagentConc: 1.0,
    elapsedTime: 0,
    turbidity: 0,
    experimentalError: (Math.random() - 0.5) * 2,
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
    turbidity:        0,
    elapsedTime:      0,
  };
}

export function selectFGTest(state: FunctionalGroupsState, id: FGTestId): FunctionalGroupsState {
  const steps = state.steps.map(s => s.id === "s2" ? { ...s, completed: true } : s);
  return { ...state, selectedTest: id, steps, turbidity: 0, elapsedTime: 0 };
}

export function runFGTest(state: FunctionalGroupsState): FunctionalGroupsState {
  if (!state.selectedCompound || !state.selectedTest || state.isTesting) return state;
  return { ...state, isTesting: true, turbidity: 0, elapsedTime: 0 };
}

export function finishFGTest(state: FunctionalGroupsState): FunctionalGroupsState {
  if (!state.selectedCompound || !state.selectedTest) return state;
  const compound = COMPOUNDS[state.selectedCompound];
  const test     = TESTS[state.selectedTest];
  
  // Calculate organic chemistry kinetics and thermodynamic limits
  let positive = false;
  let obsText = "";
  let obsColor = "#dbeafe";
  let finalTurbidity = 0;

  const T_kelvin = state.temperature + 273.15;
  const errorFactor = 1.0 + 0.1 * state.experimentalError;
  const concEffect = state.reagentConc * errorFactor;

  if (state.selectedTest === "lucas-test") {
    if (compound.group === "alcohol") {
      // 1-Butanol is a primary alcohol.
      // S_N1 Rate constants: primary is extremely slow at room temperature, requires heating.
      // k = A * exp(-Ea / RT)
      const Ea = 92000; // J/mol
      const A = 2e10; // s^-1
      const R = 8.314;
      const k = A * Math.exp(-Ea / (R * T_kelvin)) * Math.pow(concEffect, 2);
      
      // Assume reaction goes for 300 seconds (standard lab wait time)
      const t_wait = 300;
      finalTurbidity = 100 * (1.0 - Math.exp(-k * t_wait));
      
      if (finalTurbidity > 5.0) {
        positive = true;
        obsText = `Lucas Test: Cloudiness/turbidity appeared slowly after heating (turbidity: ${finalTurbidity.toFixed(0)}%). Confirms Primary Alcohol.`;
        obsColor = "#f8fafc";
      } else {
        positive = false;
        obsText = `Lucas Test: Solution remains clear after 5 minutes at ${state.temperature}°C. No reaction (primary alcohols do not react at room temp).`;
        obsColor = "#dbeafe";
      }
    } else {
      positive = false;
      obsText = "Lucas Test: Solution remains clear. No alcohol present.";
      obsColor = "#dbeafe";
    }
  } else if (state.selectedTest === "tollens-test") {
    if (compound.group === "aldehyde") {
      // Aldehyde oxidises to carboxylic acid, reduces Ag+ to Ag(s)
      // k = A * exp(-Ea / RT)
      const Ea = 54000; // J/mol
      const A = 1.2e7;
      const k = A * Math.exp(-Ea / (8.314 * T_kelvin)) * concEffect;
      
      const t_wait = 120;
      const mirrorFraction = 1.0 - Math.exp(-k * t_wait);
      
      if (mirrorFraction > 0.15) {
        positive = true;
        obsText = `Tollen's Test: A shiny, metallic silver mirror deposited on the test tube walls (coverage: ${(mirrorFraction * 100).toFixed(0)}%).`;
        obsColor = "#c0c0c0";
      } else {
        positive = false;
        obsText = `Tollen's Test: Solution turned dark grey/black but no silver mirror formed. Reaction rate too slow at ${state.temperature}°C.`;
        obsColor = "#cbd5e1";
      }
    } else {
      positive = false;
      obsText = "Tollen's Test: No silver mirror. Ketones and other groups do not reduce Tollen's reagent.";
      obsColor = "#dbeafe";
    }
  } else if (state.selectedTest === "dnp-test") {
    // 2,4-DNP hydrazone crystallization (precipitate forms)
    // Solubility product Ksp depends heavily on temperature (crystallization is exothermic)
    if (compound.group === "ketone" || compound.group === "aldehyde") {
      const Ksp_25 = 1.5e-4;
      const Ksp = Ksp_25 * Math.exp(12000 * (1/298.15 - 1/T_kelvin));
      const Q = 0.05 * concEffect; // ionic product
      
      if (Q > Ksp) {
        positive = true;
        const mass = (Q - Ksp) * 220 * errorFactor; // in mg
        obsText = `2,4-DNP Test: Bright orange-yellow crystalline precipitate formed (${mass.toFixed(1)} mg). Confirms Carbonyl (C=O) group.`;
        obsColor = "#f97316";
      } else {
        positive = false;
        obsText = `2,4-DNP Test: Solution remains clear orange. At ${state.temperature}°C, the hydrazone product is highly soluble (Qsp < Ksp). Cool the tube to crystallize.`;
        obsColor = "#dbeafe";
      }
    } else {
      positive = false;
      obsText = "2,4-DNP Test: No precipitate. Non-carbonyl compounds do not react.";
      obsColor = "#dbeafe";
    }
  } else if (state.selectedTest === "nahco3-test") {
    if (compound.group === "carboxylic-acid") {
      // Brisk effervescence of CO2
      const rate = 0.45 * concEffect * Math.exp((state.temperature - 25) / 20);
      if (rate > 0.1) {
        positive = true;
        obsText = `NaHCO₃ Test: Brisk effervescence observed. Rapid release of CO₂ gas bubbles which turn lime water milky. Confirms Carboxylic Acid.`;
        obsColor = "#d1fae5";
      } else {
        positive = false;
        obsText = `NaHCO₃ Test: Extremely weak gas evolution at ${state.temperature}°C with concentration ${state.reagentConc}M. Insufficient acid strength.`;
        obsColor = "#dbeafe";
      }
    } else {
      positive = false;
      obsText = "NaHCO₃ Test: No reaction. Weak acids and neutral compounds do not release CO₂.";
      obsColor = "#dbeafe";
    }
  } else if (state.selectedTest === "hinsberg-test") {
    if (compound.group === "amine") {
      // Primary amine (aniline, Compound E)
      // Forms benzenesulfonamide which dissolves in excess KOH (conc >= 2M)
      if (state.reagentConc < 1.8) {
        positive = false;
        obsText = `Hinsberg Test: White precipitate formed but remains insoluble. Without excess KOH (concentration too low: ${state.reagentConc}M), primary amine cannot be confirmed.`;
        obsColor = "#f1f5f9";
      } else {
        positive = true;
        obsText = "Hinsberg Test: White precipitate of sulfonamide formed initially and then dissolved completely in excess KOH solution, confirming Primary Amine.";
        obsColor = "#a78bfa";
      }
    } else {
      positive = false;
      obsText = "Hinsberg Test: No reaction. No sulfonamide precipitate formed.";
      obsColor = "#dbeafe";
    }
  }

  const fgResult: FGTestResult = {
    testId:      state.selectedTest,
    testName:    test.name,
    observation: obsText,
    color:       obsColor,
    positive,
    timestamp:   Date.now(),
  };

  const obs = mkObs(
    positive ? "color-change" : "no-reaction",
    positive
      ? `POSITIVE: ${obsText} ${test.posExplain}`
      : `NEGATIVE: ${obsText} ${test.negExplain}`,
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
    turbidity:    finalTurbidity,
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
    score:       state.identified ? 96 : 60,
    summary:     compound
      ? `Functional group identified: ${compound.groupName} in ${compound.label} (${compound.example}).`
      : "Experiment completed. Run tests on more compounds for practice.",
    explanation: compound
      ? `${compound.label} (${compound.formula}) contains a ${compound.groupName} group. ` +
        `The ${TESTS[compound.correctTest].name} gave a positive result under specified conditions: ${TESTS[compound.correctTest].posObs}. ` +
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
