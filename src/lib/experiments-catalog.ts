// Single source of truth for all experiment metadata.
// Consumers: ExperimentsIndex, experiments/layout.tsx, active-lab-store.ts

export type Difficulty  = "Beginner" | "Intermediate" | "Advanced";
export type ClassLevel  = 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type ChemCategory = "physical" | "analytical" | "organic" | "inorganic" | "techniques";

export interface CategoryDef {
  id:          ChemCategory;
  label:       string;
  tagline:     string;
  description: string;
  color:       string;
  photo:       string;
  /** Gradient used as card background / hero tint */
  gradient:    string;
}

export const CATEGORIES: CategoryDef[] = [
  {
    id:          "physical",
    label:       "Physical Chemistry",
    tagline:     "Energy, Gases & Equilibrium",
    description: "Explore the mathematical laws that govern gas behavior, chemical kinetics, equilibrium, and thermochemistry. Measure real enthalpy changes and verify the ideal gas equation.",
    color:       "#7c3aed",
    photo:       "/images/experiments/equilibrium.png",
    gradient:    "linear-gradient(135deg, #faf5ff 0%, #ede9fe 60%, #f5f3ff 100%)",
  },
  {
    id:          "analytical",
    label:       "Analytical Chemistry",
    tagline:     "Precision Measurement & Analysis",
    description: "Master quantitative analysis through titration, indicators, water hardness, and salt identification. Build precision skills that underpin all modern laboratory science.",
    color:       "#2563eb",
    photo:       "/images/experiments/titration.png",
    gradient:    "linear-gradient(135deg, #eff6ff 0%, #dbeafe 60%, #eff6ff 100%)",
  },
  {
    id:          "organic",
    label:       "Organic Chemistry",
    tagline:     "Functional Groups & Structure",
    description: "Identify organic compounds through characteristic chemical tests. Run Tollen's, Lucas, and 2,4-DNP reactions, then separate dye mixtures by paper chromatography.",
    color:       "#d97706",
    photo:       "/images/experiments/functional-groups.png",
    gradient:    "linear-gradient(135deg, #fffbeb 0%, #fef3c7 60%, #fffbeb 100%)",
  },
  {
    id:          "inorganic",
    label:       "Inorganic Chemistry",
    tagline:     "Ions, Metals & Electrochemistry",
    description: "Observe vibrant flame test colors, electrolyze ionic solutions, displace metals in the activity series, and watch precipitates form in solubility reactions.",
    color:       "#0891b2",
    photo:       "/images/experiments/flame.png",
    gradient:    "linear-gradient(135deg, #ecfeff 0%, #cffafe 60%, #ecfeff 100%)",
  },
  {
    id:          "techniques",
    label:       "Laboratory Techniques",
    tagline:     "Separation, Filtration & Analysis",
    description: "Develop core practical skills: filtration, distillation, chromatography, density measurement, and gas collection. The foundation of every chemistry experiment.",
    color:       "#059669",
    photo:       "/images/experiments/filtration.png",
    gradient:    "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 60%, #f0fdf4 100%)",
  },
];

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
  category:    ChemCategory;
  isNew?:      boolean;
}

const CATALOG: ExperimentEntry[] = [
  // ── Laboratory Techniques ─────────────────────────────────────────────────
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
    category: "techniques",
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
    category: "techniques",
    isNew:    true,
  },
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
    category: "techniques",
    isNew:    true,
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
    category: "techniques",
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
    category: "techniques",
  },
  // ── Analytical Chemistry ──────────────────────────────────────────────────
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
    category: "analytical",
    isNew:    true,
  },
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
    category: "analytical",
  },
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
    category: "analytical",
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
    category: "analytical",
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
    category: "analytical",
    isNew:    true,
  },
  // ── Inorganic Chemistry ───────────────────────────────────────────────────
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
    category: "inorganic",
  },
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
    category: "inorganic",
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
    category: "inorganic",
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
    category: "inorganic",
  },
  // ── Physical Chemistry ─────────────────────────────────────────────────────
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
    category: "physical",
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
    category: "physical",
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
    category: "physical",
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
    category: "physical",
  },
  // ── Organic Chemistry ─────────────────────────────────────────────────────
  {
    slug:        "functional-groups",
    href:        "/experiments/functional-groups",
    title:       "Functional Group Detection",
    subject:     "Organic Chemistry",
    classLevels: [11, 12],
    difficulty:  "Advanced",
    accent:      "#d97706",
    bg:          "#fffbeb",
    desc:        "Identify organic functional groups using Lucas, Tollen’s, 2,4-DNP, NaHCO₃, and Hinsberg tests.",
    details:
      "Select from 5 unknown organic compounds and run characteristic chemical tests. " +
      "Observe silver mirrors, precipitates, gas evolution, and turbidity to identify the functional group.",
    features: ["5 functional groups", "5 reagent tests", "Positive/negative results", "Structural identification"],
    duration: "30–40 min",
    iconId:   "functionalGroups",
    category: "organic",
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
    category: "organic",
    isNew:    true,
  },
  {
    slug:        "crystallization",
    href:        "/experiments/crystallization",
    title:       "Crystallization & Purification",
    subject:     "Separation Techniques",
    classLevels: [9, 10],
    difficulty:  "Intermediate",
    accent:      "#0ea5e9",
    bg:          "#f0f9ff",
    desc:        "Purify Copper(II) Sulfate crystals from an impure salt mixture.",
    details:
      "Prepare a saturated CuSO₄ solution, filter out insoluble impurities, and control the cooling rate. " +
      "Compare slow vs. fast cooling to grow beautiful, high-purity crystals.",
    features: ["Solubility curves", "Cooling rate kinetics", "Filtration & drying", "Purity analysis"],
    duration: "25–35 min",
    iconId:   "crystallization",
    category: "techniques",
    isNew:    true,
  },
  {
    slug:        "natural-indicators",
    href:        "/experiments/natural-indicators",
    title:       "Natural Indicators",
    subject:     "Acids & Bases",
    classLevels: [7, 8],
    difficulty:  "Beginner",
    accent:      "#db2777",
    bg:          "#fdf2f8",
    desc:        "Extract pigments from natural sources and test them against household acids and bases.",
    details:
      "Macerate Turmeric, China Rose, and Red Cabbage. Add drops of your natural indicators to " +
      "various acids, bases, and neutral solutions to witness pH-dependent color transitions.",
    features: ["3 plant extracts", "6 test solutions", "Mashing & extraction", "pH color scale"],
    duration: "20–30 min",
    iconId:   "naturalIndicators",
    category: "analytical",
    isNew:    true,
  },
  {
    slug:        "acid-metal",
    href:        "/experiments/acid-metal",
    title:       "Acid-Metal Reactions",
    subject:     "Chemical Reactivity",
    classLevels: [9, 10],
    difficulty:  "Intermediate",
    accent:      "#ea580c",
    bg:          "#fff7ed",
    desc:        "React active metals with acids to produce hydrogen gas and study reactivity trends.",
    details:
      "Introduce Magnesium, Zinc, Iron, or Copper to hydrochloric or sulfuric acid. Measure the hydrogen " +
      "gas evolution in a gas syringe, check the exothermic heat release, and perform a lighted splint pop test.",
    features: ["4 active metals", "2 acids", "Gas syringe collection", "Squeaky pop test"],
    duration: "20–30 min",
    iconId:   "acidMetal",
    category: "inorganic",
    isNew:    true,
  },
  {
    slug:        "acid-carbonate",
    href:        "/experiments/acid-carbonate",
    title:       "Acid-Carbonate Reactions",
    subject:     "Gas Stoichiometry",
    classLevels: [9, 10, 11],
    difficulty:  "Intermediate",
    accent:      "#059669",
    bg:          "#f0fdf4",
    desc:        "React carbonates with acid, collect carbon dioxide, and test it with limewater.",
    details:
      "Observe the stoichiometry of marble chips, calcium carbonate powder, or sodium carbonate reacting with HCl. " +
      "Bubble the evolved CO₂ through limewater to trigger precipitation and eventual redissolution.",
    features: ["Carbonate stoichiometry", "Limewater precipitation", "Stopper sealing error", "CO₂ volume tracking"],
    duration: "25–35 min",
    iconId:   "acidCarbonate",
    category: "inorganic",
    isNew:    true,
  },
  {
    slug:        "states-of-matter",
    href:        "/experiments/states-of-matter",
    title:       "States of Matter",
    subject:     "Thermodynamics",
    classLevels: [7, 8, 9],
    difficulty:  "Beginner",
    accent:      "#7c3aed",
    bg:          "#f5f3ff",
    desc:        "Study phase transitions, latent heat plateaus, and pressure dependency of boiling points.",
    details:
      "Heat or cool Water, Ethanol, and Wax. Observe temperature pauses during melting and boiling, " +
      "and witness boiling point shifts at higher altitudes.",
    features: ["Water, Ethanol, & Wax", "Altitude pressure adjustment", "Latent heat plateaus", "Heating & cooling curves"],
    duration: "20–30 min",
    iconId:   "statesOfMatter",
    category: "physical",
    isNew:    true,
  },
  {
    slug:        "diffusion-liquids",
    href:        "/experiments/diffusion-liquids",
    title:       "Diffusion in Liquids",
    subject:     "Physical Properties",
    classLevels: [7, 8, 9],
    difficulty:  "Beginner",
    accent:      "#7c3aed",
    bg:          "#f5f3ff",
    desc:        "Observe solute particle spreading speed under thermal, stirring, and size configurations.",
    details:
      "Drop KMnO₄, food coloring, or CuSO₄ into a water beaker. Study Fick's Law of diffusion by adjusting temperature, stirrer RPM, and molecular size.",
    features: ["KMnO₄, Dye, & CuSO₄", "Fick's Law math", "Brownian particle motion", "Dynamic spreading rates"],
    duration: "15–20 min",
    iconId:   "diffusion",
    category: "physical",
    isNew:    true,
  },
  {
    slug:        "separation-mixtures",
    href:        "/experiments/separation-mixtures",
    title:       "Separation of Mixtures",
    subject:     "Separation Techniques",
    classLevels: [6, 7, 8],
    difficulty:  "Beginner",
    accent:      "#059669",
    bg:          "#f0fdf4",
    desc:        "Separate a solid-liquid mixture containing iron filings, sand, and salt.",
    details:
      "Perform multi-step laboratory separations using magnet extraction, dissolution, filtration wicking, and crystal thermal evaporation.",
    features: ["Magnet extraction", "Stokes' sedimentation", "Funnel filtration", "Evaporation crystals"],
    duration: "25–35 min",
    iconId:   "separation",
    category: "techniques",
    isNew:    true,
  },
  {
    slug:        "double-displacement",
    href:        "/experiments/double-displacement",
    title:       "Double Displacement",
    subject:     "Chemical Reactions",
    classLevels: [9, 10, 11],
    difficulty:  "Intermediate",
    accent:      "#0891b2",
    bg:          "#ecfeff",
    desc:        "Investigate precipitation kinetics and solubility constants (Ksp) of mixed solutions.",
    details:
      "Combine AgNO₃ + NaCl, Pb(NO₃)₂ + KI, or BaCl₂ + Na₂SO₄. Calculate ion product Qsp vs Ksp(T) to predict precipitate yields.",
    features: ["AgCl, PbI₂, & BaSO₄", "Qsp vs Ksp(T) math", "Vibrant precipitate clouds", "Nucleation micro views"],
    duration: "20–30 min",
    iconId:   "precipitation",
    category: "inorganic",
    isNew:    true,
  },
  {
    slug:        "decomposition",
    href:        "/experiments/decomposition",
    title:       "Decomposition Reactions",
    subject:     "Reaction Kinetics",
    classLevels: [9, 10, 11],
    difficulty:  "Intermediate",
    accent:      "#ea580c",
    bg:          "#fff7ed",
    desc:        "Heat chemical compounds and analyze gas evolution and solid mass reduction.",
    details:
      "Study thermal and catalytic decomposition of CaCO₃, KClO₃, and H₂O₂. Monitor reaction speed multipliers under catalyst and power variables.",
    features: ["CaCO₃, KClO₃, & H₂O₂", "Arrhenius activation energy", "MnO₂ catalyst acceleration", "Gas syringe collection"],
    duration: "20–30 min",
    iconId:   "decomposition",
    category: "inorganic",
    isNew:    true,
  },
  {
    slug:        "physical-chemical",
    href:        "/experiments/physical-chemical",
    title:       "Physical vs Chemical",
    subject:     "Chemical Reactivity",
    classLevels: [7, 8, 9],
    difficulty:  "Beginner",
    accent:      "#ea580c",
    bg:          "#fff7ed",
    desc:        "Compare physical phase/dissolution changes with chemical combustion, oxidation, and neutralization reactions.",
    details:
      "Execute 6 separate chemical or physical procedures. Track enthalpy release, molecule structure integrity, and reversibility.",
    features: ["6 comparative workflows", "Rust, ash, & melting wax", "Enthalpy heat release", "Reversibility tests"],
    duration: "20–30 min",
    iconId:   "change",
    category: "physical",
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

export function getExperimentsByCategory(category: ChemCategory): ExperimentEntry[] {
  return CATALOG.filter((e) => e.category === category);
}

export function getCategoryDef(id: ChemCategory): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.id === id);
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
