import type {
  IndicatorTestState, IndicatorTestId, TestSubstanceId,
  AcidityClass, IndicatorTestRecord,
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

// ── Indicator profiles ────────────────────────────────────────────────────────
export interface IndicatorProfile {
  id:          IndicatorTestId;
  name:        string;
  origin:      string;
  acidColor:   string;
  neutralColor:string;
  basicColor:  string;
  acidLabel:   string;
  neutralLabel:string;
  basicLabel:  string;
}

export const INDICATORS: Record<IndicatorTestId, IndicatorProfile> = {
  turmeric: {
    id: "turmeric", name: "Turmeric Paper", origin: "Natural (Curcuma longa)",
    acidColor: "#f59e0b", neutralColor: "#fbbf24", basicColor: "#dc2626",
    acidLabel: "Yellow (unchanged)", neutralLabel: "Yellow", basicLabel: "Red / brick-red",
  },
  "red-litmus": {
    id: "red-litmus", name: "Red Litmus Paper", origin: "Lichen extract",
    acidColor: "#ef4444", neutralColor: "#ef4444", basicColor: "#8b5cf6",
    acidLabel: "Stays red", neutralLabel: "Stays red", basicLabel: "Turns blue",
  },
  "blue-litmus": {
    id: "blue-litmus", name: "Blue Litmus Paper", origin: "Lichen extract",
    acidColor: "#ef4444", neutralColor: "#3b82f6", basicColor: "#3b82f6",
    acidLabel: "Turns red", neutralLabel: "Stays blue", basicLabel: "Stays blue",
  },
  "cabbage-juice": {
    id: "cabbage-juice", name: "Red Cabbage Juice", origin: "Natural (Brassica oleracea)",
    acidColor: "#dc2626", neutralColor: "#8b5cf6", basicColor: "#059669",
    acidLabel: "Red / pink", neutralLabel: "Purple", basicLabel: "Green / yellow",
  },
};

// ── Substance data ────────────────────────────────────────────────────────────
export interface SubstanceProfile {
  id:          TestSubstanceId;
  name:        string;
  pH:          number;
  classification: AcidityClass;
  description: string;
  examples:    string;
}

export const SUBSTANCES: Record<TestSubstanceId, SubstanceProfile> = {
  vinegar:         { id: "vinegar",         name: "Vinegar (Dilute Acetic Acid)", pH: 2.5,  classification: "acidic",  description: "Weak acid used in cooking.", examples: "CH₃COOH in water" },
  "lemon-juice":   { id: "lemon-juice",     name: "Lemon Juice",                  pH: 2.0,  classification: "acidic",  description: "Contains citric acid.",       examples: "Citric acid solution" },
  "baking-soda":   { id: "baking-soda",     name: "Baking Soda Solution",         pH: 8.5,  classification: "basic",   description: "Sodium bicarbonate dissolved in water.", examples: "NaHCO₃(aq)" },
  "soap-solution": { id: "soap-solution",   name: "Soap Solution",                pH: 9.5,  classification: "basic",   description: "Soap is mildly basic due to hydrolysis of fatty acid salts.", examples: "Sodium stearate in water" },
  milk:            { id: "milk",            name: "Milk",                          pH: 6.5,  classification: "acidic",  description: "Slightly acidic due to lactic acid.", examples: "Lactic acid solution" },
  "distilled-water": { id: "distilled-water", name: "Distilled Water",            pH: 7.0,  classification: "neutral", description: "Pure water — the reference for pH 7.", examples: "H₂O (pure)" },
  ammonia:         { id: "ammonia",         name: "Ammonia Solution",              pH: 11.0, classification: "basic",   description: "Strong base used in cleaning.", examples: "NH₃(aq)" },
  "salt-solution": { id: "salt-solution",   name: "Salt Solution (NaCl)",         pH: 7.0,  classification: "neutral", description: "Sodium chloride dissolved in water — neutral salt.", examples: "NaCl(aq)" },
};

// ── Colour lookup ─────────────────────────────────────────────────────────────
export function getIndicatorColor(
  indicator:  IndicatorTestId,
  substance:  TestSubstanceId,
): { color: string; label: string } {
  const ind = INDICATORS[indicator];
  const sub = SUBSTANCES[substance];
  if (sub.classification === "acidic")  return { color: ind.acidColor,    label: ind.acidLabel };
  if (sub.classification === "basic")   return { color: ind.basicColor,   label: ind.basicLabel };
  return                                       { color: ind.neutralColor, label: ind.neutralLabel };
}

// ── Steps & objectives ────────────────────────────────────────────────────────
function makeSteps(): StepDef[] {
  return [
    { id: "s1", instruction: "Select an indicator from the tray (turmeric, litmus, or cabbage juice).", hint: "Different indicators work at different pH ranges.", completed: false },
    { id: "s2", instruction: "Select a household substance to test.", hint: "Start with vinegar (acid) and baking soda (base).", completed: false },
    { id: "s3", instruction: "Click \"Test\" to dip the indicator into the substance.", hint: "Watch the colour change carefully.", completed: false },
    { id: "s4", instruction: "Record whether the substance is acidic, neutral, or basic.", hint: "Use the colour guide on the right.", completed: false },
    { id: "s5", instruction: "Test at least 5 combinations and click \"Complete Lab\".", hint: "Try the same substance with different indicators!", completed: false },
  ];
}

function makeObjectives(): ExperimentObjective[] {
  return [
    { id: "o1", description: "Test at least one acidic substance.", completed: false },
    { id: "o2", description: "Test at least one basic substance.", completed: false },
    { id: "o3", description: "Test distilled water (neutral reference).", completed: false },
    { id: "o4", description: "Collect at least 5 test results.", completed: false },
  ];
}

// ── Initial state ─────────────────────────────────────────────────────────────
export function initialIndicatorState(mode: IndicatorTestState["mode"]): IndicatorTestState {
  return {
    mode,
    status:            "idle",
    selectedIndicator: null,
    selectedSubstance: null,
    isTesting:         false,
    currentResult:     null,
    testHistory:       [],
    steps:             makeSteps(),
    objectives:        makeObjectives(),
    observations:      [],
    result:            null,
    startedAt:         null,
  };
}

// ── Engine functions (pure) ───────────────────────────────────────────────────
export function selectIndicator(
  state:     IndicatorTestState,
  indicator: IndicatorTestId,
): IndicatorTestState {
  return {
    ...state,
    status:            state.status === "idle" ? "setup" : state.status,
    selectedIndicator: indicator,
    currentResult:     null,
    steps:             state.steps.map((s) => (s.id === "s1" ? { ...s, completed: true } : s)),
  };
}

export function selectSubstance(
  state:     IndicatorTestState,
  substance: TestSubstanceId,
): IndicatorTestState {
  return {
    ...state,
    selectedSubstance: substance,
    currentResult:     null,
    steps:             state.steps.map((s) => (s.id === "s2" ? { ...s, completed: true } : s)),
  };
}

export function runTest(state: IndicatorTestState): IndicatorTestState {
  if (!state.selectedIndicator || !state.selectedSubstance) return state;

  const { color, label } = getIndicatorColor(state.selectedIndicator, state.selectedSubstance);
  const sub = SUBSTANCES[state.selectedSubstance];
  const ind = INDICATORS[state.selectedIndicator];

  const record: IndicatorTestRecord = {
    id:             uid(),
    indicator:      state.selectedIndicator,
    substance:      state.selectedSubstance,
    resultColor:    color,
    classification: sub.classification,
    pH:             sub.pH,
    timestamp:      Date.now(),
  };

  const testHistory = [record, ...state.testHistory];

  const obs = mkObs(
    "color-change",
    `${ind.name} + ${sub.name}: turned ${label} → ${sub.classification.toUpperCase()} (pH ${sub.pH})`,
    sub.classification === "neutral" ? "info" : "success",
  );

  const hasAcid    = testHistory.some((r) => r.classification === "acidic");
  const hasBase    = testHistory.some((r) => r.classification === "basic");
  const hasNeutral = testHistory.some((r) => r.substance === "distilled-water");

  const steps = state.steps.map((s) => {
    if (s.id === "s3" || s.id === "s4") return { ...s, completed: true };
    if (s.id === "s5" && testHistory.length >= 5) return { ...s, completed: true };
    return s;
  });

  const objectives = state.objectives.map((o) => {
    if (o.id === "o1" && hasAcid)                 return { ...o, completed: true };
    if (o.id === "o2" && hasBase)                  return { ...o, completed: true };
    if (o.id === "o3" && hasNeutral)               return { ...o, completed: true };
    if (o.id === "o4" && testHistory.length >= 5)  return { ...o, completed: true };
    return o;
  });

  return {
    ...state,
    status:        "running",
    isTesting:     true,
    currentResult: { color, classification: sub.classification, pH: sub.pH },
    testHistory,
    steps,
    objectives,
    startedAt:     state.startedAt ?? Date.now(),
    observations:  [obs, ...state.observations],
  };
}

export function finishTest(state: IndicatorTestState): IndicatorTestState {
  return { ...state, isTesting: false };
}

export function completeIndicatorTest(state: IndicatorTestState): IndicatorTestState {
  const count = state.testHistory.length;
  const score = Math.min(100, Math.round(
    (count / 8) * 50 +
    (state.objectives.filter((o) => o.completed).length / 4) * 50,
  ));

  return {
    ...state,
    status: "completed",
    result: {
      completedAt: Date.now(),
      success:     count >= 3,
      score,
      summary:     `Completed ${count} indicator tests across various substances.`,
      explanation:
        "Indicators are substances that change colour in acidic or basic conditions. " +
        "Natural indicators like turmeric and red cabbage juice contain pigments (flavonoids) " +
        "that respond to H⁺ and OH⁻ ions. The pH scale (0–14) measures how acidic or basic a substance is: " +
        "pH < 7 = acidic, pH 7 = neutral, pH > 7 = basic.",
    },
  };
}

export function resetIndicatorTest(state: IndicatorTestState): IndicatorTestState {
  return initialIndicatorState(state.mode);
}
