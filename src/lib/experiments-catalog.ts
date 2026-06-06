// Single source of truth for all experiment metadata.
// Consumers: ExperimentsIndex, experiments/layout.tsx, active-lab-store.ts

export type Difficulty  = "Beginner" | "Intermediate" | "Advanced";
export type ClassLevel  = 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface ExperimentEntry {
  slug:        string;
  href:        string;
  title:       string;
  subject:     string;
  classLevels: ClassLevel[];
  difficulty:  Difficulty;
  accent:      string;
  bg:          string;
  desc:        string;
  details:     string;
  features:    string[];
  duration:    string;
  iconId:      string;
  isNew?:      boolean;
}

const CATALOG: ExperimentEntry[] = [
  // ── Class 6 ───────────────────────────────────────────────────────────────
  {
    slug:        "density-floats-sinks",
    href:        "/experiments/density-floats-sinks",
    title:       "Density & Floating / Sinking",
    subject:     "Physical Properties",
    classLevels: [6, 7],
    difficulty:  "Beginner",
    accent:      "#0284c7",
    bg:          "#f0f9ff",
    desc:        "Discover why objects float or sink by comparing their density to water.",
    details:
      "Drop 8 everyday materials into a water tank and observe whether they float or sink. " +
      "Compare densities, build intuition for buoyancy, and predict outcomes before testing.",
    features: ["8 materials", "Density values", "Float/sink prediction", "Buoyancy basics"],
    duration: "10–15 min",
    iconId:   "density",
    isNew:    true,
  },
  {
    slug:        "filtration-basics",
    href:        "/experiments/filtration-basics",
    title:       "Filtration Basics",
    subject:     "Separation Techniques",
    classLevels: [6, 7],
    difficulty:  "Beginner",
    accent:      "#d97706",
    bg:          "#fffbeb",
    desc:        "Separate insoluble sand from saltwater using a funnel and filter paper.",
    details:
      "Prepare a sand-and-salt mixture in water, then filter it through folded filter paper. " +
      "Observe the clear filtrate (salt solution) and dry residue (sand) — and understand when filtration works.",
    features: ["Step-by-step setup", "Residue & filtrate", "Real-world context", "Guided inquiry"],
    duration: "15–20 min",
    iconId:   "filtration",
    isNew:    true,
  },
  // ── Class 7 ───────────────────────────────────────────────────────────────
  {
    slug:        "dissolving-rate",
    href:        "/experiments/dissolving-rate",
    title:       "Dissolving Rate",
    subject:     "Solutions",
    classLevels: [6, 7],
    difficulty:  "Beginner",
    accent:      "#059669",
    bg:          "#f0fdf4",
    desc:        "Investigate how stirring, temperature, and particle size affect how fast sugar dissolves.",
    details:
      "Control three independent variables — water temperature (cold/warm/hot), stirring (on/off), " +
      "and granularity (coarse/fine/powder) — then compare dissolving times on an auto-generated bar chart.",
    features: ["3 variables", "Rate comparison", "Bar chart output", "Guided inquiry"],
    duration: "15–20 min",
    iconId:   "dissolving",
    isNew:    true,
  },
  {
    slug:        "indicator-test",
    href:        "/experiments/indicator-test",
    title:       "Indicator Test",
    subject:     "Acids & Bases",
    classLevels: [7, 8],
    difficulty:  "Beginner",
    accent:      "#7c3aed",
    bg:          "#f5f3ff",
    desc:        "Test household substances with turmeric paper and litmus to identify acids and bases.",
    details:
      "Select from 4 natural and synthetic indicators (turmeric, red litmus, blue litmus, red-cabbage juice) " +
      "and test 8 common household substances. Observe characteristic colour changes and classify each substance.",
    features: ["4 indicators", "8 substances", "Colour changes", "pH classification"],
    duration: "15–20 min",
    iconId:   "indicator",
    isNew:    true,
  },
  // ── Class 9–10 (Beginner) ─────────────────────────────────────────────────
  {
    slug:        "titration",
    href:        "/experiments/titration",
    title:       "Acid-Base Titration",
    subject:     "Volumetric Analysis",
    classLevels: [9, 10, 11],
    difficulty:  "Beginner",
    accent:      "#2563eb",
    bg:          "#eff6ff",
    desc:        "Determine the exact volume of NaOH required to neutralise HCl.",
    details:
      "Follow the pH from acidic to basic through the sigmoid equivalence curve. " +
      "Choose from three indicators and deliver titrant drop-by-drop for precise endpoint detection.",
    features: ["Live pH curve", "3 indicators", "Equivalence point", "Precision scoring"],
    duration: "25–35 min",
    iconId:   "titration",
  },
  {
    slug:        "flame-test",
    href:        "/experiments/flame-test",
    title:       "Flame Test",
    subject:     "Atomic Spectroscopy",
    classLevels: [9, 10, 11],
    difficulty:  "Beginner",
    accent:      "#ea580c",
    bg:          "#fff7ed",
    desc:        "Identify metal ions by their characteristic emission colours.",
    details:
      "Dip the nichrome loop into seven metal salt solutions and hold it in the gas flame. " +
      "Each ion emits a unique spectral colour tied to its electron configuration.",
    features: ["7 metal salts", "Emission spectra", "Ion identification", "Colour reference"],
    duration: "15–20 min",
    iconId:   "flame",
  },
  {
    slug:        "gas-collection",
    href:        "/experiments/gas-collection",
    title:       "Gas Collection",
    subject:     "Stoichiometry",
    classLevels: [9, 10],
    difficulty:  "Beginner",
    accent:      "#0284c7",
    bg:          "#f0f9ff",
    desc:        "Collect CO₂ from marble chips reacting with HCl by water displacement.",
    details:
      "Track gas volume in real time as CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂. " +
      "Control mass of marble chips and HCl volume to observe stoichiometric yield.",
    features: ["CO₂ evolution", "Water displacement", "Volume tracking", "Yield calculation"],
    duration: "20–30 min",
    iconId:   "gasCollect",
  },
  // ── Class 10–11 (Intermediate) ─────────────────────────────────────────────
  {
    slug:        "electrolysis",
    href:        "/experiments/electrolysis",
    title:       "Electrolysis",
    subject:     "Electrochemistry",
    classLevels: [10, 11, 12],
    difficulty:  "Intermediate",
    accent:      "#0891b2",
    bg:          "#ecfeff",
    desc:        "Decompose ionic compounds with direct current and verify Faraday’s laws.",
    details:
      "Connect electrodes, select from five electrolytes, and observe gas evolution. " +
      "Track collected volumes and compare measured vs. theoretical gas production.",
    features: ["5 electrolytes", "Half-reactions", "Gas volume tracking", "Faraday’s laws"],
    duration: "30–40 min",
    iconId:   "electrolysis",
  },
  {
    slug:        "solubility",
    href:        "/experiments/solubility",
    title:       "Solubility & Precipitation",
    subject:     "Ionic Chemistry",
    classLevels: [10, 11],
    difficulty:  "Intermediate",
    accent:      "#059669",
    bg:          "#ecfdf5",
    desc:        "Mix ionic solutions and observe precipitate formation.",
    details:
      "Select from nine ionic combinations and observe colour, turbidity, and precipitate formation. " +
      "Write net ionic equations and verify against solubility rules.",
    features: ["9 ionic pairs", "Net ionic equations", "Precipitate colours", "Solubility rules"],
    duration: "20–25 min",
    iconId:   "solubility",
  },
  {
    slug:        "redox-displacement",
    href:        "/experiments/redox-displacement",
    title:       "Redox Displacement",
    subject:     "Redox Chemistry",
    classLevels: [9, 10, 11],
    difficulty:  "Intermediate",
    accent:      "#64748b",
    bg:          "#f8fafc",
    desc:        "Place metals in salt solutions to observe displacement and confirm the activity series.",
    details:
      "Lower metal strips into copper sulfate and other ionic solutions. " +
      "Observe colour changes and deposits as more reactive metals displace less reactive ones.",
    features: ["Activity series", "Oxidation/reduction", "Colour changes", "Metal reactivity"],
    duration: "20–30 min",
    iconId:   "redox",
  },
  {
    slug:        "separation-techniques",
    href:        "/experiments/separation-techniques",
    title:       "Separation Techniques",
    subject:     "Analytical Chemistry",
    classLevels: [9, 10, 11],
    difficulty:  "Intermediate",
    accent:      "#0284c7",
    bg:          "#f0f9ff",
    desc:        "Separate mixtures using filtration, evaporation, distillation, and paper chromatography.",
    details:
      "Work through four classical separation methods with realistic animations. " +
      "Calculate Rf values from chromatography and determine separation efficiency.",
    features: ["Filtration", "Evaporation", "Distillation", "Chromatography"],
    duration: "35–45 min",
    iconId:   "separation",
  },
  // ── Class 11–12 (Advanced) ─────────────────────────────────────────────────
  {
    slug:        "reaction-rate",
    href:        "/experiments/reaction-rate",
    title:       "Reaction Kinetics",
    subject:     "Chemical Kinetics",
    classLevels: [11, 12],
    difficulty:  "Advanced",
    accent:      "#7c3aed",
    bg:          "#f5f3ff",
    desc:        "Investigate how temperature, concentration, and surface area affect reaction rate.",
    details:
      "Apply collision theory to explain rate changes. Vary each factor independently, " +
      "calculate rate multipliers, and connect observations to the Arrhenius equation.",
    features: ["Temperature effect", "Concentration effect", "Surface area", "Rate multiplier"],
    duration: "40–50 min",
    iconId:   "kinetics",
  },
  {
    slug:        "gas-laws",
    href:        "/experiments/gas-laws",
    title:       "Gas Laws",
    subject:     "Physical Chemistry",
    classLevels: [11, 12],
    difficulty:  "Advanced",
    accent:      "#db2777",
    bg:          "#fdf2f8",
    desc:        "Verify Boyle’s and Charles’s Laws experimentally and confirm PV = nRT.",
    details:
      "Adjust pressure, volume, and temperature for a fixed gas sample. " +
      "Record data points, graph P–V and V–T relationships, and extrapolate to absolute zero.",
    features: ["Boyle’s Law P–V", "Charles’s Law V–T", "Ideal gas equation", "Real-time graphs"],
    duration: "35–45 min",
    iconId:   "gas",
  },
  {
    slug:        "chemical-equilibrium",
    href:        "/experiments/chemical-equilibrium",
    title:       "Chemical Equilibrium",
    subject:     "Chemical Equilibrium",
    classLevels: [11, 12],
    difficulty:  "Advanced",
    accent:      "#d97706",
    bg:          "#fffbeb",
    desc:        "Disturb the Fe³⁺/SCN⁻ equilibrium and confirm Le Chatelier’s Principle.",
    details:
      "Start with the blood-red Fe(SCN)²⁺ system. Add Fe³⁺, SCN⁻, or dilute with water " +
      "and observe the colour shift as the system re-establishes equilibrium.",
    features: ["Le Chatelier’s Principle", "Fe³⁺/SCN⁻ system", "Colour shifts", "Keq changes"],
    duration: "25–35 min",
    iconId:   "equilibrium",
  },
  {
    slug:        "calorimetry",
    href:        "/experiments/calorimetry",
    title:       "Calorimetry",
    subject:     "Thermochemistry",
    classLevels: [11, 12],
    difficulty:  "Advanced",
    accent:      "#ef4444",
    bg:          "#fef2f2",
    desc:        "Measure the enthalpy of neutralisation using a polystyrene calorimeter.",
    details:
      "Add measured volumes of NaOH to HCl in an insulated calorimeter. " +
      "Record temperature rise, apply q = mcΔT, and calculate ΔH per mole of water formed.",
    features: ["Heat of neutralisation", "ΔH calculation", "Temperature curve", "q = mcΔT"],
    duration: "30–40 min",
    iconId:   "calorimetry",
  },
  // ── 5 New Experiments ─────────────────────────────────────────────────────
  {
    slug:        "neutralization",
    href:        "/experiments/neutralization",
    title:       "Neutralization Reaction",
    subject:     "Acid-Base Chemistry",
    classLevels: [9, 10],
    difficulty:  "Beginner",
    accent:      "#10b981",
    bg:          "#ecfdf5",
    desc:        "Study the neutralisation of HCl with NaOH and observe heat generation and salt formation.",
    details:
      "Measure equal volumes of HCl and NaOH, combine them, and observe the exothermic temperature rise. " +
      "Confirms that neutralisation produces NaCl and H₂O while releasing −55.8 kJ/mol.",
    features: ["Exothermic reaction", "Temperature rise", "NaCl formation", "q = mcΔT"],
    duration: "15–20 min",
    iconId:   "neutralization",
    isNew:    true,
  },
  {
    slug:        "salt-analysis",
    href:        "/experiments/salt-analysis",
    title:       "Qualitative Salt Analysis",
    subject:     "Analytical Chemistry",
    classLevels: [10, 11],
    difficulty:  "Intermediate",
    accent:      "#7c3aed",
    bg:          "#f5f3ff",
    desc:        "Identify unknown salts using systematic cation and anion tests.",
    details:
      "Perform NaOH, flame, and confirmatory tests on five unknown salts. " +
      "Observe precipitate colours and gas evolution to identify both the cation and anion.",
    features: ["5 unknown salts", "Cation tests", "Anion tests", "Systematic analysis"],
    duration: "25–35 min",
    iconId:   "saltAnalysis",
    isNew:    true,
  },
  {
    slug:        "water-hardness",
    href:        "/experiments/water-hardness",
    title:       "Water Hardness Test",
    subject:     "Analytical Chemistry",
    classLevels: [11, 12],
    difficulty:  "Advanced",
    accent:      "#0284c7",
    bg:          "#f0f9ff",
    desc:        "Determine water hardness using EDTA complexometric titration.",
    details:
      "Titrate a hard water sample with 0.01 M EDTA using Eriochrome Black T indicator at pH 10. " +
      "Observe the wine-red to blue colour change and calculate hardness in mg/L as CaCO₃.",
    features: ["EDTA titration", "EBT indicator", "Hardness calculation", "Classification"],
    duration: "25–35 min",
    iconId:   "waterHardness",
    isNew:    true,
  },
  {
    slug:        "functional-groups",
    href:        "/experiments/functional-groups",
    title:       "Functional Group Detection",
    subject:     "Organic Chemistry",
    classLevels: [11, 12],
    difficulty:  "Advanced",
    accent:      "#d97706",
    bg:          "#fffbeb",
    desc:        "Identify organic functional groups using Lucas, Tollen's, 2,4-DNP, NaHCO₃, and Hinsberg tests.",
    details:
      "Select from 5 unknown organic compounds and run characteristic chemical tests. " +
      "Observe silver mirrors, precipitates, gas evolution, and turbidity to identify the functional group.",
    features: ["5 functional groups", "5 reagent tests", "Positive/negative results", "Structural identification"],
    duration: "30–40 min",
    iconId:   "functionalGroups",
    isNew:    true,
  },
  {
    slug:        "chromatography",
    href:        "/experiments/chromatography",
    title:       "Paper Chromatography",
    subject:     "Analytical Chemistry",
    classLevels: [10, 11],
    difficulty:  "Intermediate",
    accent:      "#0ea5e9",
    bg:          "#f0f9ff",
    desc:        "Separate ink dye mixtures by paper chromatography and calculate Rf values.",
    details:
      "Apply ink spots to chromatography paper, develop with solvent, and watch real-time dye separation. " +
      "Calculate Rf values for each component to identify dyes and understand polarity-based separation.",
    features: ["4 ink samples", "Real-time development", "Rf calculation", "Dye identification"],
    duration: "20–25 min",
    iconId:   "chromatography",
    isNew:    true,
  },
];

export default CATALOG;

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getExperiment(slug: string): ExperimentEntry | undefined {
  return CATALOG.find((e) => e.slug === slug);
}

export function getExperimentByHref(href: string): ExperimentEntry | undefined {
  return CATALOG.find((e) => e.href === href);
}

export function getExperimentsByClass(level: ClassLevel): ExperimentEntry[] {
  return CATALOG.filter((e) => e.classLevels.includes(level));
}

export function getExperimentsByDifficulty(difficulty: Difficulty): ExperimentEntry[] {
  return CATALOG.filter((e) => e.difficulty === difficulty);
}

export function getAllClassLevels(): ClassLevel[] {
  const set = new Set<ClassLevel>();
  CATALOG.forEach((e) => e.classLevels.forEach((c) => set.add(c)));
  return Array.from(set).sort((a, b) => a - b);
}

/** Derive the accent colour map used by the experiments layout header */
export const EXPERIMENT_ACCENT_MAP: Record<string, string> = Object.fromEntries(
  CATALOG.map((e) => [e.href, e.accent]),
);

/** Derive the subject map used by the experiments layout header */
export const EXPERIMENT_SUBJECT_MAP: Record<string, string> = Object.fromEntries(
  CATALOG.map((e) => [e.href, e.subject]),
);

/** Derive the title map used by the experiments layout header */
export const EXPERIMENT_LABEL_MAP: Record<string, string> = Object.fromEntries(
  CATALOG.map((e) => [e.href, e.title]),
);
