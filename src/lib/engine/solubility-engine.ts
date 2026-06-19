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

export const PRECIPITATE_TABLE: Record<PrecipKey, PrecipitateInfo> = {
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
      "This reaction is used in gravimetric analysis to determine sulfate concentrations.",
  },
  [pairKey("lead-nitrate", "potassium-iodide")]: {
    formula: "PbI₂",
    color: "#FFD700",
    colorName: "Bright Yellow ('Golden Rain')",
    netIonic: "Pb²⁺(aq) + 2I⁻(aq) → PbI₂(s)",
    explanation:
      "PbI₂ forms spectacular golden-yellow crystals. Its solubility increases rapidly with " +
      "temperature (Ksp = 9.8 × 10⁻⁹ at 25°C). Mixing in hot water prevents precipitation, " +
      "which then forms beautiful crystals as it cools.",
  },
  [pairKey("calcium-chloride-sol", "sodium-sulfate")]: {
    formula: "CaSO₄",
    color: "#fafafa",
    colorName: "White (fine)",
    netIonic: "Ca²⁺(aq) + SO₄²⁻(aq) → CaSO₄(s)",
    explanation:
      "CaSO₄ is slightly soluble (Ksp = 4.9 × 10⁻⁵) — the precipitate may be faint and " +
      "sensitive to dilution or temperature changes. Forms plaster of Paris when dry.",
  },
  [pairKey("iron-nitrate", "sodium-hydroxide-sol")]: {
    formula: "Fe(OH)₃",
    color: "#B45309",
    colorName: "Rust Brown",
    netIonic: "Fe³⁺(aq) + 3OH⁻(aq) → Fe(OH)₃(s)",
    explanation:
      "Fe(OH)₃ forms a gelatinous rust-brown precipitate. Metal hydroxides (except group 1) " +
      "are highly insoluble. Ksp = 2.8 × 10⁻³⁹.",
  },
  [pairKey("lead-nitrate", "sodium-sulfate")]: {
    formula: "PbSO₄",
    color: "#f1f5f9",
    colorName: "White",
    netIonic: "Pb²⁺(aq) + SO₄²⁻(aq) → PbSO₄(s)",
    explanation:
      "PbSO₄ is insoluble (Ksp = 2.5 × 10⁻⁸). Lead sulfate is the active discharge product " +
      "in car batteries.",
  },
  [pairKey("silver-nitrate", "sodium-sulfate")]: {
    formula: "Ag₂SO₄",
    color: "#f8fafc",
    colorName: "White (slight)",
    netIonic: "2Ag⁺(aq) + SO₄²⁻(aq) → Ag₂SO₄(s)",
    explanation:
      "Ag₂SO₄ is slightly soluble (Ksp = 1.2 × 10⁻⁵ at 25°C). Forms only at higher concentrations.",
  },
};

interface PrecipDetails {
  formula: string;
  Mw: number;
  Ksp25: number;
  deltaH: number; // J/mol
  cationStoich: number;
  anionStoich: number;
}

const PRECIP_DATA: Record<string, PrecipDetails> = {
  "silver-nitrate+sodium-chloride-sol": { formula: "AgCl", Mw: 143.32, Ksp25: 1.8e-10, deltaH: 65000, cationStoich: 1, anionStoich: 1 },
  "silver-nitrate+potassium-iodide": { formula: "AgI", Mw: 234.77, Ksp25: 8.5e-17, deltaH: 84000, cationStoich: 1, anionStoich: 1 },
  "barium-chloride-sol+sodium-sulfate": { formula: "BaSO₄", Mw: 233.38, Ksp25: 1.1e-10, deltaH: 26000, cationStoich: 1, anionStoich: 1 },
  "lead-nitrate+potassium-iodide": { formula: "PbI₂", Mw: 461.01, Ksp25: 9.8e-9, deltaH: 46500, cationStoich: 1, anionStoich: 2 },
  "calcium-chloride-sol+sodium-sulfate": { formula: "CaSO₄", Mw: 136.14, Ksp25: 4.9e-5, deltaH: -18000, cationStoich: 1, anionStoich: 1 },
  "iron-nitrate+sodium-hydroxide-sol": { formula: "Fe(OH)₃", Mw: 106.87, Ksp25: 2.8e-39, deltaH: 95000, cationStoich: 1, anionStoich: 3 },
  "lead-nitrate+sodium-sulfate": { formula: "PbSO₄", Mw: 303.26, Ksp25: 2.5e-8, deltaH: 12000, cationStoich: 1, anionStoich: 1 },
  "silver-nitrate+sodium-sulfate": { formula: "Ag₂SO₄", Mw: 311.80, Ksp25: 1.2e-5, deltaH: 17000, cationStoich: 2, anionStoich: 1 },
};

function getCationName(a: SolutionId, b: SolutionId): string {
  const pair = [a, b];
  if (pair.includes("silver-nitrate")) return "Ag⁺";
  if (pair.includes("barium-chloride-sol")) return "Ba²⁺";
  if (pair.includes("lead-nitrate")) return "Pb²⁺";
  if (pair.includes("calcium-chloride-sol")) return "Ca²⁺";
  if (pair.includes("iron-nitrate")) return "Fe³⁺";
  return "Mᶻ⁺";
}

function getAnionName(a: SolutionId, b: SolutionId): string {
  const pair = [a, b];
  if (pair.includes("sodium-chloride-sol")) return "Cl⁻";
  if (pair.includes("potassium-iodide")) return "I⁻";
  if (pair.includes("sodium-sulfate")) return "SO₄²⁻";
  if (pair.includes("sodium-hydroxide-sol")) return "OH⁻";
  return "Xʸ⁻";
}

export function calculatePrecipitation(
  solA: SolutionId,
  solB: SolutionId,
  tempC: number,
  volA: number,
  volB: number,
  concA: number,
  concB: number
) {
  const key1 = `${solA}+${solB}`;
  const key2 = `${solB}+${solA}`;
  const data = PRECIP_DATA[key1] ?? PRECIP_DATA[key2] ?? null;
  if (!data) return { hasPrecipitate: false, precipitateMass: 0, turbidity: 0, Qsp: 0, Ksp: 1, netIonic: "" };

  const T_kelvin = tempC + 273.15;
  const T_ref = 298.15; // 25°C
  const R = 8.314;

  // Van 't Hoff: ln(Ksp_T / Ksp_ref) = -dH/R * (1/T - 1/T_ref)
  const lnKspRatio = -(data.deltaH / R) * (1 / T_kelvin - 1 / T_ref);
  const Ksp = data.Ksp25 * Math.exp(lnKspRatio);

  const V_total = volA + volB;
  
  // Mixed concentrations:
  const concCation = concA * (volA / V_total) * data.cationStoich;
  const concAnion = concB * (volB / V_total) * data.anionStoich;

  const p = data.cationStoich;
  const q = data.anionStoich;

  // Qsp = [Cation]^p * [Anion]^q
  const Qsp = Math.pow(concCation, p) * Math.pow(concAnion, q);

  if (Qsp <= Ksp) {
    return {
      hasPrecipitate: false,
      precipitateMass: 0,
      turbidity: 0,
      Qsp,
      Ksp,
      netIonic: `${p > 1 ? p : ""}${getCationName(solA, solB)}(aq) + ${q > 1 ? q : ""}${getAnionName(solA, solB)}(aq) → ${data.formula}(s)`
    };
  }

  // Precipitated moles per liter
  const maxPrecipMolesPerL = Math.min(concCation / p, concAnion / q);
  const solubilityLimitMolesPerL = Math.pow(Ksp / (Math.pow(p, p) * Math.pow(q, q)), 1 / (p + q));
  const precipMolesPerL = Math.max(0, maxPrecipMolesPerL - solubilityLimitMolesPerL);
  
  const precipitateMass = precipMolesPerL * (V_total / 1000) * data.Mw;
  // Turbidity: fully turbid (1.0) at 20mg or more precipitate
  const turbidity = Math.min(1.0, precipitateMass / 0.02);

  return {
    hasPrecipitate: true,
    precipitateMass,
    turbidity,
    Qsp,
    Ksp,
    netIonic: `${p > 1 ? p : ""}${getCationName(solA, solB)}(aq) + ${q > 1 ? q : ""}${getAnionName(solA, solB)}(aq) → ${data.formula}(s)`
  };
}

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
    temperature: 25,
    volumeA: 10,
    volumeB: 10,
    concA: 0.1,
    concB: 0.1,
    precipitateMass: 0,
    turbidity: 0,
  };
}

export function updateSolubilityParameters(
  state: SolubilityState,
  changes: Partial<Pick<SolubilityState, "temperature" | "volumeA" | "volumeB" | "concA" | "concB">>,
): SolubilityState {
  return {
    ...state,
    temperature: changes.temperature !== undefined ? changes.temperature : state.temperature,
    volumeA: changes.volumeA !== undefined ? changes.volumeA : state.volumeA,
    volumeB: changes.volumeB !== undefined ? changes.volumeB : state.volumeB,
    concA: changes.concA !== undefined ? changes.concA : state.concA,
    concB: changes.concB !== undefined ? changes.concB : state.concB,
  };
}

export function selectSolutionA(state: SolubilityState, id: SolutionId): SolubilityState {
  if (state.status === "running" || state.status === "completed" || state.status === "failed") return state;
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

  const a = SOLUTIONS[state.solutionA];
  const b = SOLUTIONS[state.solutionB];

  // Perform dynamic thermodynamic calculation
  const calc = calculatePrecipitation(
    state.solutionA,
    state.solutionB,
    state.temperature,
    state.volumeA,
    state.volumeB,
    state.concA,
    state.concB
  );

  let precipInfo: PrecipitateInfo | null = null;
  if (calc.hasPrecipitate) {
    const key = pairKey(state.solutionA, state.solutionB);
    const baseInfo = PRECIPITATE_TABLE[key];
    precipInfo = {
      formula: baseInfo?.formula ?? "Precipitate",
      color: baseInfo?.color ?? "#ffffff",
      colorName: baseInfo?.colorName ?? "White",
      netIonic: calc.netIonic,
      explanation: baseInfo?.explanation ?? `Precipitate formed. Qsp = ${calc.Qsp.toExponential(2)} > Ksp = ${calc.Ksp.toExponential(2)}.`,
    };
  }

  const newObs: ObservationEvent[] = [
    mkObs("reaction-start", `Combining ${state.volumeA}mL of ${a.name} (${state.concA}M) and ${state.volumeB}mL of ${b.name} (${state.concB}M) at ${state.temperature}°C…`, "info"),
  ];

  return {
    ...state,
    status: "running",
    precipitate: precipInfo,
    hasPrecipitate: calc.hasPrecipitate,
    precipitateMass: calc.precipitateMass,
    turbidity: calc.turbidity,
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

  const calc = calculatePrecipitation(state.solutionA!, state.solutionB!, state.temperature, state.volumeA, state.volumeB, state.concA, state.concB);
  
  // Add small experimental uncertainty to final reported mass
  const obsMass = Math.max(0, state.precipitateMass + (Math.random() - 0.5) * 0.0015); // ±0.75mg noise

  const resultObs: ObservationEvent = state.hasPrecipitate
    ? mkObs(
        "precipitation",
        `${state.precipitate!.formula} precipitate formed — ${state.precipitate!.colorName} (mass ≈ ${(obsMass * 1000).toFixed(1)} mg). ` +
        `Net ionic: ${state.precipitate!.netIonic}. Qsp = ${calc.Qsp.toExponential(2)} > Ksp = ${calc.Ksp.toExponential(2)}.`,
        "success",
      )
    : mkObs(
        "no-reaction",
        `No precipitate — ${a.name} + ${b.name} remain fully dissolved. ` +
        `Product ions did not exceed solubility limit (Qsp = ${calc.Qsp.toExponential(2)} < Ksp = ${calc.Ksp.toExponential(2)}).`,
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
  return {
    ...state,
    solutionA: null,
    solutionB: null,
    precipitate: null,
    hasPrecipitate: false,
    precipitateMass: 0,
    turbidity: 0,
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

export function lookupPrecipitate(a: SolutionId, b: SolutionId): PrecipitateInfo | null {
  return PRECIPITATE_TABLE[pairKey(a, b)] ?? null;
}
