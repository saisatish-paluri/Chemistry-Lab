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

// Helper: blend two hex colors
function interpolateColor(color1: string, color2: string, factor: number): string {
  const c1 = color1.startsWith("#") ? color1.slice(1) : "ffffff";
  const c2 = color2.startsWith("#") ? color2.slice(1) : "ffffff";
  const r1 = parseInt(c1.substring(0, 2), 16);
  const g1 = parseInt(c1.substring(2, 4), 16);
  const b1 = parseInt(c1.substring(4, 6), 16);
  const r2 = parseInt(c2.substring(0, 2), 16);
  const g2 = parseInt(c2.substring(2, 4), 16);
  const b2 = parseInt(c2.substring(4, 6), 16);
  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
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
    explanation: "Ca²⁺ ions emit brick-red light (≈ 620–630 nm) when excited in the burner flame.",
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
    explanation: "Cl⁻ + Ag⁺ → AgCl↓ (white). Insoluble in dilute HNO₃.",
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
    explanation: "CO₃²⁻ + 2H⁺ → H₂O + CO₂↑. Gas turns Ca(OH)₂ solution milky (CaCO₃↓).",
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
    
    // Overhaul variables
    temperature: 25,
    reagentDrops: 5,
    reagentConc: 1.0,
    contamination: 0,
    experimentalError: (Math.random() - 0.5) * 2, // rolled once per session

    // Accumulated reagents
    cationDropsAdded: 0,
    anionDropsAdded: 0,
    cationReagentConc: 1.0,
    anionReagentConc: 1.0,

    // Live tube properties
    cationLiquidColor: "rgba(203,213,225,0.15)",
    cationPptColor: null,
    cationPptMass: 0,
    cationBubbles: false,
    cationGasLabel: "",

    anionLiquidColor: "rgba(203,213,225,0.15)",
    anionPptColor: null,
    anionPptMass: 0,
    anionBubbles: false,
    anionGasLabel: "",

    flameColor: null,
  };
}

export function recalculateSaltAnalysis(state: SaltAnalysisState): SaltAnalysisState {
  if (!state.selectedSalt) {
    return {
      ...state,
      cationLiquidColor: "rgba(203,213,225,0.15)",
      cationPptColor: null,
      cationPptMass: 0,
      cationBubbles: false,
      cationGasLabel: "",
      anionLiquidColor: "rgba(203,213,225,0.15)",
      anionPptColor: null,
      anionPptMass: 0,
      anionBubbles: false,
      anionGasLabel: "",
      flameColor: null,
    };
  }

  const salt = SALTS[state.selectedSalt];
  const next = { ...state };

  // Determine active drops and conc to calculate visually
  const cationDrops = state.currentTest === "cation" ? state.reagentDrops : state.cationDropsAdded;
  const cationConc  = state.currentTest === "cation" ? state.reagentConc  : state.cationReagentConc;

  const anionDrops  = state.currentTest === "anion" ? state.reagentDrops : state.anionDropsAdded;
  const anionConc   = state.currentTest === "anion" ? state.reagentConc  : state.anionReagentConc;

  // 1. Cation Test tube calculations
  if (state.phase === "cation" || state.phase === "anion" || state.phase === "identify") {
    if (salt.cation === "calcium") {
      // Flame Test
      next.cationLiquidColor = "rgba(241,245,249,0.5)";
      next.cationPptColor = null;
      next.cationPptMass = 0;
      next.cationBubbles = false;
      next.cationGasLabel = "";
      
      // Calculate flame color
      if (state.currentTest === "cation" || state.phase === "anion" || state.phase === "identify") {
        const baseFlame = "#ea580c"; // Brick red
        const sodiumFlame = "#fbbf24"; // Golden yellow
        const factor = Math.min(1.0, state.contamination / 10.0);
        next.flameColor = interpolateColor(baseFlame, sodiumFlame, factor);
      } else {
        next.flameColor = null;
      }
    } else {
      next.flameColor = null;
      // Liquid reaction with NaOH
      const initialVol = 2.0; // mL
      const effDrops = cationDrops * (1.0 + 0.05 * state.experimentalError);
      const addedVol = effDrops * 0.05; // mL per drop
      const totalVol = initialVol + addedVol;

      if (cationDrops === 0) {
        next.cationLiquidColor = salt.color;
        next.cationPptColor = null;
        next.cationPptMass = 0;
        next.cationBubbles = false;
        next.cationGasLabel = "";
      } else {
        const C_cation = 0.05 * (initialVol / totalVol);
        const C_OH = cationConc * (addedVol / totalVol);

        if (salt.cation === "copper") {
          // Precipitate Cu(OH)2
          const P = Math.min(C_cation, 0.5 * C_OH);
          const mass = P * totalVol * 97.56; // in mg
          if (mass > 0.05) {
            next.cationPptColor = "#2563eb"; // Blue ppt
            next.cationPptMass = mass;
            // Diluted color
            const remainRatio = Math.max(0, 1.0 - (P / C_cation));
            next.cationLiquidColor = remainRatio > 0.05 ? `rgba(96,165,250,${0.2 + 0.6 * remainRatio})` : "rgba(255,255,255,0.2)";
          } else {
            next.cationPptColor = null;
            next.cationPptMass = 0;
            next.cationLiquidColor = salt.color;
          }
          next.cationBubbles = false;
          next.cationGasLabel = "";
        } else if (salt.cation === "iron") {
          // Precipitate Fe(OH)3
          const P = Math.min(C_cation, 0.33 * C_OH);
          const mass = P * totalVol * 106.87; // in mg
          if (mass > 0.05) {
            next.cationPptColor = "#b45309"; // Brown ppt
            next.cationPptMass = mass;
            const remainRatio = Math.max(0, 1.0 - (P / C_cation));
            next.cationLiquidColor = remainRatio > 0.05 ? `rgba(180,83,9,${0.2 + 0.6 * remainRatio})` : "rgba(255,255,255,0.2)";
          } else {
            next.cationPptColor = null;
            next.cationPptMass = 0;
            next.cationLiquidColor = salt.color;
          }
          next.cationBubbles = false;
          next.cationGasLabel = "";
        } else if (salt.cation === "zinc") {
          // Amphoteric: Zn(OH)2 precipitate forms, then dissolves in excess NaOH as [Zn(OH)4]2-
          // Stoichiometric ratio:
          const r = C_OH / Math.max(0.0001, C_cation);
          let P = 0;
          if (r < 2) {
            P = (r / 2) * C_cation;
          } else if (r >= 2 && r <= 4) {
            P = C_cation * (2 - r / 2);
          } else {
            P = 0;
          }
          // Temperature solubility shift
          const tempSolubility = Math.max(0, 0.0002 * (state.temperature - 25));
          P = Math.max(0, P - tempSolubility);

          const mass = P * totalVol * 99.4; // in mg
          if (mass > 0.05) {
            next.cationPptColor = "#f1f5f9"; // White ppt
            next.cationPptMass = mass;
          } else {
            next.cationPptColor = null;
            next.cationPptMass = 0;
          }
          next.cationLiquidColor = "rgba(241,245,249,0.25)";
          next.cationBubbles = false;
          next.cationGasLabel = "";
        } else if (salt.cation === "ammonium") {
          // Ammonia gas evolution kinetics
          const C_NH3 = Math.min(C_cation, C_OH);
          const rate = 0.08 * C_NH3 * Math.exp((state.temperature - 25) / 15) * (1.0 + 0.05 * state.experimentalError);
          
          next.cationPptColor = null;
          next.cationPptMass = 0;
          next.cationLiquidColor = "rgba(209,250,229,0.2)";
          
          if (rate > 0.005) {
            next.cationBubbles = true;
            next.cationGasLabel = "NH₃";
          } else {
            next.cationBubbles = false;
            next.cationGasLabel = "";
          }
        }
      }
    }
  }

  // 2. Anion Test tube calculations
  if (state.phase === "anion" || state.phase === "identify") {
    const initialVol = 2.0;
    const effDrops = anionDrops * (1.0 + 0.05 * state.experimentalError);
    const addedVol = effDrops * 0.05;
    const totalVol = initialVol + addedVol;

    if (anionDrops === 0) {
      next.anionLiquidColor = "rgba(203,213,225,0.15)";
      next.anionPptColor = null;
      next.anionPptMass = 0;
      next.anionBubbles = false;
      next.anionGasLabel = "";
    } else {
      const C_anion = 0.05 * (initialVol / totalVol);
      const C_reagent = anionConc * (addedVol / totalVol);

      if (salt.anion === "chloride") {
        // AgNO3 test
        const P = Math.min(C_anion, C_reagent);
        const mass = P * totalVol * 143.32;
        if (mass > 0.05) {
          next.anionPptColor = "#f8fafc"; // White curdy precipitate
          next.anionPptMass = mass;
        } else {
          next.anionPptColor = null;
          next.anionPptMass = 0;
        }
        next.anionLiquidColor = "rgba(248,250,252,0.2)";
        next.anionBubbles = false;
        next.anionGasLabel = "";
      } else if (salt.anion === "sulfate") {
        // BaCl2 test
        const P = Math.min(C_anion, C_reagent);
        const mass = P * totalVol * 233.39;
        if (mass > 0.05) {
          next.anionPptColor = "#f1f5f9"; // White precipitate
          next.anionPptMass = mass;
        } else {
          next.anionPptColor = null;
          next.anionPptMass = 0;
        }
        next.anionLiquidColor = "rgba(241,245,249,0.2)";
        next.anionBubbles = false;
        next.anionGasLabel = "";
      } else if (salt.anion === "carbonate") {
        // HCl test -> effervescence of CO2
        const rate = 15.0 * C_anion * Math.pow(C_reagent, 2) * Math.exp((state.temperature - 25) / 20) * (1.0 + 0.05 * state.experimentalError);
        next.anionPptColor = null;
        next.anionPptMass = 0;
        next.anionLiquidColor = "rgba(209,250,229,0.2)";
        if (rate > 0.005) {
          next.anionBubbles = true;
          next.anionGasLabel = "CO₂";
        } else {
          next.anionBubbles = false;
          next.anionGasLabel = "";
        }
      } else if (salt.anion === "nitrate") {
        // Brown Ring Test (FeSO4 + H2SO4)
        const stability = Math.max(0, 1.0 - Math.max(0, (state.temperature - 40) / 20));
        const P = stability * Math.min(C_anion, C_reagent);
        const mass = P * totalVol * 150.0;
        if (mass > 0.05) {
          next.anionPptColor = "#92400e"; // Brown ring
          next.anionPptMass = mass;
        } else {
          next.anionPptColor = null;
          next.anionPptMass = 0;
        }
        next.anionLiquidColor = "rgba(146,64,14,0.1)";
        next.anionBubbles = false;
        next.anionGasLabel = "";
      }
    }
  }

  return next;
}

export function selectSalt(state: SaltAnalysisState, id: UnknownSaltId): SaltAnalysisState {
  const obs = mkObs("reaction-start", `Unknown salt selected. Appears as ${id === "copper-sulfate" ? "blue" : id === "iron-chloride" ? "orange-brown" : "white/colourless"} solution. Begin systematic analysis.`, "info");
  const steps = state.steps.map(s => s.id === "s1" ? { ...s, completed: true } : s);
  
  const next: SaltAnalysisState = {
    ...state,
    selectedSalt: id,
    phase: "preliminary",
    steps,
    observations: [obs, ...state.observations],
    status: "running",
    startedAt: state.startedAt ?? Date.now(),
    reagentDrops: 0,
    flameColor: null,
    cationDropsAdded: 0,
    anionDropsAdded: 0,
  };

  return recalculateSaltAnalysis(next);
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

  // Transfer temporary slider values to accumulated values for recalculate
  const cationDropsAdded = state.reagentDrops;
  const cationReagentConc = state.reagentConc;

  const preState = {
    ...state,
    cationDropsAdded,
    cationReagentConc,
  };

  // Perform calculation live based on current parameters
  const tempState = recalculateSaltAnalysis(preState);

  let obsMessage = "";
  let pptObserved = false;
  let effObserved = false;
  let obsColor = "rgba(203,213,225,0.25)";

  if (salt.cation === "calcium") {
    // flame color
    obsColor = tempState.flameColor || "#ea580c";
    if (state.contamination > 2) {
      obsMessage = `Flame test: Orange-yellow flame observed. Brick-red Calcium emission is heavily masked by Sodium contamination (${state.contamination.toFixed(1)}%).`;
    } else {
      obsMessage = "Flame test: Crisp brick-red / orange-red flame observed. Confirms presence of Calcium.";
    }
  } else if (salt.cation === "ammonium") {
    effObserved = tempState.cationBubbles;
    obsColor = "#d1fae5";
    if (effObserved) {
      obsMessage = `NaOH Warm Test: Pungent ammonia gas (NH₃) evolved rapidly. Turns moist red litmus blue. Confirms Ammonium.`;
    } else {
      if (state.reagentDrops === 0) {
        obsMessage = "NaOH Warm Test: No reagent added. No ammonia gas detected.";
      } else if (state.temperature < 45) {
        obsMessage = `NaOH Warm Test: ${state.reagentDrops} drops added. Ammonia formed but temperature (${state.temperature}°C) is too low for effervescence. Please heat the solution.`;
      } else {
        obsMessage = `NaOH Warm Test: Low drops or concentration of NaOH. Weak ammonia formation, red litmus does not turn blue.`;
      }
    }
  } else {
    // copper, iron, zinc
    pptObserved = tempState.cationPptMass > 0.05;
    obsColor = tempState.cationPptColor || "rgba(203,213,225,0.25)";

    if (salt.cation === "zinc") {
      if (state.reagentDrops === 0) {
        obsMessage = "NaOH Test: No NaOH added. No precipitate formed.";
      } else if (state.reagentDrops > 0 && !pptObserved) {
        // dissolved in excess
        if (state.reagentDrops >= 20) {
          obsMessage = "NaOH Test: White precipitate of Zn(OH)₂ formed initially but has completely dissolved in excess NaOH to form soluble sodium zincate [Zn(OH)₄]²⁻.";
        } else {
          obsMessage = `NaOH Test: Reagent concentration (${state.reagentConc}M) or drops (${state.reagentDrops}) insufficient to exceed solubility product Ksp. No precipitate.`;
        }
      } else {
        obsMessage = `NaOH Test: White gelatinous precipitate of Zn(OH)₂ formed (${tempState.cationPptMass.toFixed(1)} mg). precipitate remains insoluble with low drops of NaOH.`;
      }
    } else {
      // copper or iron
      if (pptObserved) {
        obsMessage = `NaOH Test: ${salt.cation === "copper" ? "Blue" : "Reddish-brown"} precipitate of ${salt.cation === "copper" ? "Cu(OH)₂" : "Fe(OH)₃"} formed (${tempState.cationPptMass.toFixed(1)} mg). Insoluble in excess reagent.`;
      } else {
        obsMessage = `NaOH Test: No precipitate. Solubility product Ksp not exceeded. (drops: ${state.reagentDrops}, conc: ${state.reagentConc}M).`;
      }
    }
  }

  const result: SaltTestResult = {
    testName:      test.testName,
    observation:   obsMessage,
    color:         obsColor,
    precipitate:   pptObserved,
    effervescence: effObserved,
    timestamp:     Date.now(),
  };

  const obs    = mkObs("precipitation", `Cation test: ${obsMessage}`, pptObserved || effObserved || salt.cation === "calcium" ? "success" : "warning");
  const steps  = state.steps.map(s => s.id === "s3" ? { ...s, completed: true } : s);
  
  const next: SaltAnalysisState = {
    ...tempState,
    isTesting:        false,
    currentTest:      null,
    testProgress:     0,
    cationResults:    [result],
    identifiedCation: (pptObserved || effObserved || salt.cation === "calcium") ? salt.cation : null,
    phase:            "anion",
    steps,
    observations:     [obs, ...state.observations],
    objectives:       state.objectives.map(o => o.id === "o1" && (pptObserved || effObserved || salt.cation === "calcium") ? { ...o, completed: true } : o),
    reagentDrops:     0, // Reset drops slider for the next test
  };

  return recalculateSaltAnalysis(next);
}

export function runAnionTest(state: SaltAnalysisState): SaltAnalysisState {
  if (!state.selectedSalt || state.isTesting) return state;
  return { ...state, isTesting: true, currentTest: "anion", testProgress: 0 };
}

export function finishAnionTest(state: SaltAnalysisState): SaltAnalysisState {
  if (!state.selectedSalt || state.currentTest !== "anion") return state;
  const salt   = SALTS[state.selectedSalt];
  const test   = ANION_TESTS[salt.anion];

  // Transfer temporary slider values to accumulated values for recalculate
  const anionDropsAdded = state.reagentDrops;
  const anionReagentConc = state.reagentConc;

  const preState = {
    ...state,
    anionDropsAdded,
    anionReagentConc,
  };

  // Perform calculation live based on current parameters
  const tempState = recalculateSaltAnalysis(preState);

  let obsMessage = "";
  let pptObserved = false;
  let effObserved = false;
  let obsColor = "rgba(203,213,225,0.25)";

  if (salt.anion === "chloride") {
    pptObserved = tempState.anionPptMass > 0.05;
    obsColor = tempState.anionPptColor || "rgba(203,213,225,0.25)";
    if (pptObserved) {
      obsMessage = `AgNO₃ Test: White curdy precipitate of AgCl formed (${tempState.anionPptMass.toFixed(1)} mg). Insoluble in dilute HNO₃.`;
    } else {
      obsMessage = "AgNO₃ Test: No precipitate formed. Reagent concentration or drops too low to exceed Ksp.";
    }
  } else if (salt.anion === "sulfate") {
    pptObserved = tempState.anionPptMass > 0.05;
    obsColor = tempState.anionPptColor || "rgba(203,213,225,0.25)";
    if (pptObserved) {
      obsMessage = `BaCl₂ Test: Thick white precipitate of BaSO₄ formed (${tempState.anionPptMass.toFixed(1)} mg). Insoluble in dilute HCl.`;
    } else {
      obsMessage = "BaCl₂ Test: No precipitate formed. Solubility product Ksp not exceeded.";
    }
  } else if (salt.anion === "carbonate") {
    effObserved = tempState.anionBubbles;
    obsColor = "#d1fae5";
    if (effObserved) {
      obsMessage = `HCl Test: Vigorous effervescence. CO₂ gas bubbles evolved rapidly. Gas turns lime water milky.`;
    } else {
      if (state.reagentDrops === 0) {
        obsMessage = "HCl Test: No acid added. No reaction.";
      } else {
        obsMessage = `HCl Test: Reagent concentration (${state.reagentConc}M) or drops (${state.reagentDrops}) too low. Weak gas evolution, no visible bubbles.`;
      }
    }
  } else if (salt.anion === "nitrate") {
    pptObserved = tempState.anionPptMass > 0.05;
    obsColor = tempState.anionPptColor || "rgba(203,213,225,0.25)";
    if (pptObserved) {
      obsMessage = `Brown Ring Test: Concentrated H₂SO₄ interface formed a distinct brown ring of [Fe(NO)]²⁺ (${tempState.anionPptMass.toFixed(1)} mg).`;
    } else {
      if (state.temperature > 55) {
        obsMessage = `Brown Ring Test: No brown ring formed. [Fe(NO)]²⁺ complex is thermally unstable and has decomposed at ${state.temperature}°C.`;
      } else {
        obsMessage = "Brown Ring Test: Faint/no brown ring. Ensure FeSO₄ concentration and H₂SO₄ addition are optimal.";
      }
    }
  }

  const result: SaltTestResult = {
    testName:      test.testName,
    observation:   obsMessage,
    color:         obsColor,
    precipitate:   pptObserved,
    effervescence: effObserved,
    timestamp:     Date.now(),
  };

  const obs    = mkObs("precipitation", `Anion test: ${obsMessage}`, pptObserved || effObserved ? "success" : "warning");
  const steps  = state.steps.map(s => s.id === "s4" ? { ...s, completed: true } : s);
  
  const next: SaltAnalysisState = {
    ...tempState,
    isTesting:       false,
    currentTest:     null,
    testProgress:    0,
    anionResults:    [result],
    identifiedAnion: (pptObserved || effObserved) ? salt.anion : null,
    phase:           "identify",
    steps,
    observations:    [obs, ...state.observations],
    objectives:      state.objectives.map(o => o.id === "o2" && (pptObserved || effObserved) ? { ...o, completed: true } : o),
    reagentDrops:    0, // Reset drops for identification phase
  };

  return recalculateSaltAnalysis(next);
}

export function completeSaltAnalysis(state: SaltAnalysisState): SaltAnalysisState {
  if (!state.selectedSalt || !state.identifiedCation || !state.identifiedAnion) return state;
  const salt = SALTS[state.selectedSalt];

  const result: ExperimentResult = {
    completedAt: Date.now(),
    success:     true,
    score:       95,
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
