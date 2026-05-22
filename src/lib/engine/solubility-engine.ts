import type {
  SolubilityState, SolutionId, PrecipitateInfo, SolubilityTestRecord,
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

export interface SolutionProfile {
  id:          SolutionId;
  name:        string;
  formula:     string;
  color:       string;   // solution color (hex)
  ionsPrimary: string;   // ions contributed
  concentration: string;
}

export const SOLUTIONS: Record<SolutionId, SolutionProfile> = {
  "silver-nitrate":    { id: "silver-nitrate",    name: "Silver Nitrate",    formula: "AgNO₃ (aq)",  color: "#f0f9ff", ionsPrimary: "Ag⁺, NO₃⁻",  concentration: "0.1 M" },
  "sodium-chloride-sol": { id: "sodium-chloride-sol", name: "Sodium Chloride",   formula: "NaCl (aq)",   color: "#f1f5f9", ionsPrimary: "Na⁺, Cl⁻",   concentration: "0.1 M" },
  "potassium-iodide":  { id: "potassium-iodide",  name: "Potassium Iodide",  formula: "KI (aq)",     color: "#fefce8", ionsPrimary: "K⁺, I⁻",     concentration: "0.1 M" },
  "calcium-chloride-sol": { id: "calcium-chloride-sol", name: "Calcium Chloride", formula: "CaCl₂ (aq)", color: "#f0fdf4", ionsPrimary: "Ca²⁺, Cl⁻", concentration: "0.1 M" },
  "sodium-sulfate":    { id: "sodium-sulfate",    name: "Sodium Sulfate",    formula: "Na₂SO₄ (aq)", color: "#fafafa", ionsPrimary: "Na⁺, SO₄²⁻",  concentration: "0.1 M" },
  "barium-chloride-sol": { id: "barium-chloride-sol", name: "Barium Chloride", formula: "BaCl₂ (aq)", color: "#f0fdf4", ionsPrimary: "Ba²⁺, Cl⁻",  concentration: "0.1 M" },
  "lead-nitrate":      { id: "lead-nitrate",      name: "Lead(II) Nitrate",  formula: "Pb(NO₃)₂ (aq)", color: "#f8fafc", ionsPrimary: "Pb²⁺, NO₃⁻", concentration: "0.1 M" },
  "sodium-hydroxide-sol": { id: "sodium-hydroxide-sol", name: "Sodium Hydroxide", formula: "NaOH (aq)",  color: "#f0fdf4", ionsPrimary: "Na⁺, OH⁻",  concentration: "0.1 M" },
  "iron-nitrate":      { id: "iron-nitrate",      name: "Iron(III) Nitrate", formula: "Fe(NO₃)₃ (aq)", color: "#fef3c7", ionsPrimary: "Fe³⁺, NO₃⁻", concentration: "0.1 M" },
};

// Precipitate lookup — key is sorted pair so order doesn't matter
type PrecipKey = string;

function pairKey(a: SolutionId, b: SolutionId): PrecipKey {
  return [a, b].sort().join("+");
}

const PRECIPITATE_TABLE: Record<PrecipKey, PrecipitateInfo> = {
  [pairKey("silver-nitrate", "sodium-chloride-sol")]: {
    formula: "AgCl",
    color: "#ffffff",
    colorName: "White",
    netIonic: "Ag⁺(aq) + Cl⁻(aq) → AgCl(s)",
    explanation:
      "AgCl is insoluble (Ksp = 1.8 × 10⁻¹⁰). Ag⁺ and Cl⁻ ions combine immediately " +
      "to form a white precipitate. Solubility rules: silver halides (except AgF) are insoluble.",
  },
  [pairKey("silver-nitrate", "potassium-iodide")]: {
    formula: "AgI",
    color: "#FEFF8A",
    colorName: "Pale Yellow",
    netIonic: "Ag⁺(aq) + I⁻(aq) → AgI(s)",
    explanation:
      "AgI is even less soluble than AgCl (Ksp = 8.5 × 10⁻¹⁷). " +
      "The pale-yellow precipitate forms instantly. AgI is used in photographic emulsions.",
  },
  [pairKey("barium-chloride-sol", "sodium-sulfate")]: {
    formula: "BaSO₄",
    color: "#f8fafc",
    colorName: "White",
    netIonic: "Ba²⁺(aq) + SO₄²⁻(aq) → BaSO₄(s)",
    explanation:
      "BaSO₄ is highly insoluble (Ksp = 1.1 × 10⁻¹⁰). " +
      "This reaction is used in gravimetric analysis to determine sulfate concentrations. " +
      "Barium meals in medicine use insoluble BaSO₄ as an X-ray contrast agent.",
  },
  [pairKey("lead-nitrate", "potassium-iodide")]: {
    formula: "PbI₂",
    color: "#FFD700",
    colorName: "Bright Yellow ('Golden Rain')",
    netIonic: "Pb²⁺(aq) + 2I⁻(aq) → PbI₂(s)",
    explanation:
      "PbI₂ forms spectacular golden-yellow crystals. The 'Golden Rain' demonstration " +
      "involves hot dissolution then cooling to watch crystals slowly form. " +
      "Ksp = 9.8 × 10⁻⁹.",
  },
  [pairKey("calcium-chloride-sol", "sodium-sulfate")]: {
    formula: "CaSO₄",
    color: "#fafafa",
    colorName: "White (fine)",
    netIonic: "Ca²⁺(aq) + SO₄²⁻(aq) → CaSO₄(s)",
    explanation:
      "CaSO₄ is slightly soluble (Ksp = 4.9 × 10⁻⁵) — the precipitate may be faint. " +
      "It forms gypsum (CaSO₄·2H₂O) when hydrated. Used in plaster of Paris and cement.",
  },
  [pairKey("iron-nitrate", "sodium-hydroxide-sol")]: {
    formula: "Fe(OH)₃",
    color: "#B45309",
    colorName: "Rust Brown",
    netIonic: "Fe³⁺(aq) + 3OH⁻(aq) → Fe(OH)₃(s)",
    explanation:
      "Fe(OH)₃ forms a gelatinous rust-brown precipitate. Metal hydroxides (except group 1 " +
      "and some group 2) are insoluble. Ksp = 2.8 × 10⁻³⁹. " +
      "The brown colour is characteristic of Fe³⁺ compounds.",
  },
  [pairKey("lead-nitrate", "sodium-sulfate")]: {
    formula: "PbSO₄",
    color: "#f1f5f9",
    colorName: "White",
    netIonic: "Pb²⁺(aq) + SO₄²⁻(aq) → PbSO₄(s)",
    explanation:
      "PbSO₄ is insoluble (Ksp = 2.5 × 10⁻⁸). White precipitate forms. " +
      "Lead sulfate is used in lead-acid batteries as a discharge product.",
  },
  [pairKey("silver-nitrate", "sodium-sulfate")]: {
    formula: "Ag₂SO₄",
    color: "#f8fafc",
    colorName: "White (slight)",
    netIonic: "2Ag⁺(aq) + SO₄²⁻(aq) → Ag₂SO₄(s)",
    explanation:
      "Ag₂SO₄ is slightly soluble (Ksp = 1.2 × 10⁻⁵), giving a faint white cloudiness. " +
      "Silver sulfates are less insoluble than silver halides.",
  },
};

const INITIAL_STEPS: StepDef[] = [
  { id: "select-a",  instruction: "Select aqueous solution A from the rack.",           completed: false },
  { id: "select-b",  instruction: "Select aqueous solution B to combine.",              completed: false },
  { id: "combine",   instruction: "Pour both solutions into the reaction vessel.",      completed: false },
  { id: "observe",   instruction: "Observe and record: precipitate formed or no reaction.", completed: false },
  { id: "repeat",    instruction: "Reset and test at least 2 more solution pairs.",     completed: false },
];

const INITIAL_OBJECTIVES: ExperimentObjective[] = [
  { id: "first-combine",    description: "Combine two aqueous solutions",            completed: false },
  { id: "find-precipitate", description: "Observe a precipitation reaction",         completed: false },
  { id: "find-no-reaction", description: "Observe a pair with no precipitate",       completed: false },
  { id: "three-tests",      description: "Complete at least 3 different combinations", completed: false },
];

export function initialSolubilityState(mode: SolubilityState["mode"]): SolubilityState {
  return {
    mode, status: "idle",
    solutionA: null, solutionB: null,
    precipitate: null, hasPrecipitate: false, mixProgress: 0,
    testHistory: [],
    steps:      INITIAL_STEPS.map((s) => ({ ...s })),
    objectives: INITIAL_OBJECTIVES.map((o) => ({ ...o })),
    observations: [], result: null, startedAt: null,
  };
}

export function selectSolutionA(state: SolubilityState, id: SolutionId): SolubilityState {
  if (state.status === "running" || state.status === "completed" || state.status === "failed") return state;
  // Prevent selecting same as B
  if (id === state.solutionB) return {
    ...state,
    observations: [mkObs("no-reaction", "Choose a different solution — A and B must be different compounds.", "warning"), ...state.observations],
  };
  return {
    ...state,
    solutionA: id,
    status: state.solutionB ? "ready" : "setup",
    steps: state.steps.map((s) => s.id === "select-a" ? { ...s, completed: true } : s),
  };
}

export function selectSolutionB(state: SolubilityState, id: SolutionId): SolubilityState {
  if (state.status === "running" || state.status === "completed" || state.status === "failed") return state;
  if (id === state.solutionA) return {
    ...state,
    observations: [mkObs("no-reaction", "Choose a different solution — A and B must be different compounds.", "warning"), ...state.observations],
  };
  return {
    ...state,
    solutionB: id,
    status: state.solutionA ? "ready" : "setup",
    steps: state.steps.map((s) => s.id === "select-b" ? { ...s, completed: true } : s),
  };
}

export function combineSolutions(state: SolubilityState): SolubilityState {
  if (!state.solutionA || !state.solutionB) return state;
  if (state.status !== "ready") return state;

  const key = pairKey(state.solutionA, state.solutionB);
  const precipInfo = PRECIPITATE_TABLE[key] ?? null;
  const hasPrecip  = precipInfo !== null;
  const a = SOLUTIONS[state.solutionA];
  const b = SOLUTIONS[state.solutionB];

  const newObs: ObservationEvent[] = [
    mkObs("reaction-start", `Combining ${a.name} and ${b.name}…`, "info"),
  ];

  return {
    ...state,
    status: "running",
    precipitate: precipInfo,
    hasPrecipitate: hasPrecip,
    mixProgress: 0,
    steps: state.steps.map((s) => s.id === "combine" ? { ...s, completed: true } : s),
    startedAt: state.startedAt ?? Date.now(),
    observations: [...newObs, ...state.observations],
  };
}

export function tickMixing(state: SolubilityState, deltaFraction: number): SolubilityState {
  if (state.status !== "running") return state;
  const newProgress = Math.min(1, state.mixProgress + deltaFraction);
  if (newProgress < 1) return { ...state, mixProgress: newProgress };

  // Mixing complete → record result
  const a = SOLUTIONS[state.solutionA!];
  const b = SOLUTIONS[state.solutionB!];

  const record: SolubilityTestRecord = {
    id: uid(),
    solutionA: state.solutionA!,
    solutionB: state.solutionB!,
    hasPrecipitate: state.hasPrecipitate,
    precipitate: state.precipitate,
    timestamp: Date.now(),
  };

  const newHistory = [...state.testHistory, record];
  const uniquePairs = new Set(newHistory.map((r) => pairKey(r.solutionA, r.solutionB))).size;
  const hasPrecipTest = newHistory.some((r) => r.hasPrecipitate);
  const hasNoRxnTest  = newHistory.some((r) => !r.hasPrecipitate);

  let objectives = state.objectives;
  if (newHistory.length >= 1) objectives = objectives.map((o) => o.id === "first-combine" ? { ...o, completed: true } : o);
  if (hasPrecipTest)          objectives = objectives.map((o) => o.id === "find-precipitate" ? { ...o, completed: true } : o);
  if (hasNoRxnTest)           objectives = objectives.map((o) => o.id === "find-no-reaction" ? { ...o, completed: true } : o);
  if (uniquePairs >= 3)       objectives = objectives.map((o) => o.id === "three-tests" ? { ...o, completed: true } : o);

  const steps = state.steps.map((s) => {
    if (s.id === "observe") return { ...s, completed: true };
    if (s.id === "repeat" && uniquePairs >= 3) return { ...s, completed: true };
    return s;
  });

  const resultObs: ObservationEvent = state.hasPrecipitate
    ? mkObs(
        "precipitation",
        `${state.precipitate!.formula} precipitate formed — ${state.precipitate!.colorName}. ` +
        `Net ionic: ${state.precipitate!.netIonic}`,
        "success",
      )
    : mkObs(
        "no-reaction",
        `No precipitate — ${a.name} + ${b.name} remain fully dissolved. ` +
        "All product ions are soluble under these conditions.",
        "info",
      );

  return {
    ...state,
    status: "setup",   // ready for next combination
    mixProgress: 1,
    testHistory: newHistory,
    steps,
    objectives,
    observations: [resultObs, ...state.observations],
  };
}

export function resetSolubilityMix(state: SolubilityState): SolubilityState {
  // Keep history, reset current mix
  return {
    ...state,
    solutionA: null,
    solutionB: null,
    precipitate: null,
    hasPrecipitate: false,
    mixProgress: 0,
    status: state.testHistory.length > 0 ? "setup" : "idle",
    steps: state.steps.map((s) =>
      s.id === "select-a" || s.id === "select-b" || s.id === "combine" || s.id === "observe"
        ? { ...s, completed: false }
        : s,
    ),
  };
}

export function completeSolubility(state: SolubilityState): SolubilityState {
  if (state.status === "completed" || state.status === "failed") return state;
  if (state.testHistory.length < 1) return state;

  const uniquePairs = new Set(state.testHistory.map((r) => pairKey(r.solutionA, r.solutionB))).size;
  const precipitates = state.testHistory.filter((r) => r.hasPrecipitate).length;
  const hasAll = state.objectives.every((o) => o.completed);

  const score = hasAll ? 100
    : uniquePairs >= 3 ? 88
    : uniquePairs === 2 ? 72
    : 55;

  const result = {
    completedAt: Date.now(),
    success: uniquePairs >= 2,
    score,
    summary:
      `Completed ${state.testHistory.length} combination test(s). ` +
      `${precipitates} produced a precipitate; ${state.testHistory.length - precipitates} showed no reaction.`,
    explanation:
      "Precipitation reactions occur when mixing two aqueous solutions produces an insoluble ionic compound. " +
      "Solubility rules predict which ion pairs form precipitates:\n" +
      "• All nitrates (NO₃⁻) are soluble.\n" +
      "• Most chlorides are soluble — except AgCl, PbCl₂, Hg₂Cl₂.\n" +
      "• Most sulfates are soluble — except BaSO₄, PbSO₄, CaSO₄ (slight).\n" +
      "• Most hydroxides are insoluble — except NaOH, KOH, Ca(OH)₂ (slight).\n\n" +
      "Net ionic equations show only the ions that change state. " +
      "Spectator ions (unchanged in solution) are omitted.",
  };

  return {
    ...state,
    status: "completed",
    result,
    objectives: state.objectives.map((o) => ({ ...o, completed: true })),
    observations: [
      mkObs("reaction-complete", `Experiment complete — ${state.testHistory.length} tests. ${precipitates} precipitates observed.`, "success"),
      ...state.observations,
    ],
  };
}

export function resetSolubility(mode: SolubilityState["mode"]): SolubilityState {
  return initialSolubilityState(mode);
}

/** Exposed for components that need to look up precipitate info without running state machine */
export function lookupPrecipitate(a: SolutionId, b: SolutionId): PrecipitateInfo | null {
  return PRECIPITATE_TABLE[pairKey(a, b)] ?? null;
}
