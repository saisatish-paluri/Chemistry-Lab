import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ActiveLabInfo {
  href:       string;
  title:      string;
  accent:     string;
  bg:         string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  features:   string[];
  desc:       string;
}

interface ActiveLabState extends ActiveLabInfo {
  isActive:      boolean;
  setActiveLab:  (lab: ActiveLabInfo) => void;
  clearActiveLab: () => void;
}

const DEFAULT: ActiveLabInfo = {
  href:       "",
  title:      "",
  accent:     "#2563eb",
  bg:         "#eff6ff",
  difficulty: "Beginner",
  features:   [],
  desc:       "",
};

export const useActiveLabStore = create<ActiveLabState>()(
  persist(
    (set) => ({
      ...DEFAULT,
      isActive: false,

      setActiveLab: (lab) => set({ ...lab, isActive: true }),

      clearActiveLab: () => set({ ...DEFAULT, isActive: false }),
    }),
    {
      name:    "chemlab-active-lab",
      version: 1,
      partialize: (s) => ({
        href:       s.href,
        title:      s.title,
        accent:     s.accent,
        bg:         s.bg,
        difficulty: s.difficulty,
        features:   s.features,
        desc:       s.desc,
        isActive:   s.isActive,
      }),
    },
  ),
);

// Lookup map — single source of truth for all experiment metadata
export const EXPERIMENT_META: Record<string, ActiveLabInfo> = {
  // ── Class 6-7 experiments ──────────────────────────────────────────────────
  "/experiments/density-floats-sinks": {
    href: "/experiments/density-floats-sinks", title: "Density & Floating/Sinking",
    accent: "#0284c7", bg: "#f0f9ff", difficulty: "Beginner",
    features: ["8 materials", "Density values", "Float/sink prediction"],
    desc: "Discover why objects float or sink by comparing density to water.",
  },
  "/experiments/filtration-basics": {
    href: "/experiments/filtration-basics", title: "Filtration Basics",
    accent: "#d97706", bg: "#fffbeb", difficulty: "Beginner",
    features: ["Step-by-step setup", "Residue & filtrate", "Real-world context"],
    desc: "Separate insoluble sand from saltwater using a funnel and filter paper.",
  },
  "/experiments/dissolving-rate": {
    href: "/experiments/dissolving-rate", title: "Dissolving Rate",
    accent: "#059669", bg: "#f0fdf4", difficulty: "Beginner",
    features: ["3 variables", "Rate comparison", "Bar chart"],
    desc: "Investigate how temperature, stirring, and particle size affect dissolving.",
  },
  "/experiments/indicator-test": {
    href: "/experiments/indicator-test", title: "Indicator Test",
    accent: "#7c3aed", bg: "#f5f3ff", difficulty: "Beginner",
    features: ["4 indicators", "8 substances", "Colour changes"],
    desc: "Test household substances with turmeric and litmus to identify acids and bases.",
  },
  // ── Existing experiments ───────────────────────────────────────────────────
  "/experiments/titration": {
    href: "/experiments/titration", title: "Acid-Base Titration",
    accent: "#2563eb", bg: "#eff6ff", difficulty: "Beginner",
    features: ["Live pH curve", "3 indicators", "Precision scoring"],
    desc: "Master pH curves and endpoint detection with three indicators.",
  },
  "/experiments/flame-test": {
    href: "/experiments/flame-test", title: "Flame Test",
    accent: "#ea580c", bg: "#fff7ed", difficulty: "Beginner",
    features: ["7 metal salts", "Emission spectra", "Colour catalogue"],
    desc: "Identify metal ions by their characteristic emission colours.",
  },
  "/experiments/gas-collection": {
    href: "/experiments/gas-collection", title: "Gas Collection",
    accent: "#0284c7", bg: "#f0f9ff", difficulty: "Beginner",
    features: ["CO₂ evolution", "Water displacement", "Volume tracking"],
    desc: "Collect CO₂ from marble chips and HCl — measure gas volume over water.",
  },
  "/experiments/electrolysis": {
    href: "/experiments/electrolysis", title: "Electrolysis",
    accent: "#0891b2", bg: "#ecfeff", difficulty: "Intermediate",
    features: ["5 electrolytes", "Half-reactions", "Gas tracking"],
    desc: "Decompose ionic compounds — observe gas evolution and Faraday's laws.",
  },
  "/experiments/solubility": {
    href: "/experiments/solubility", title: "Solubility & Precipitation",
    accent: "#059669", bg: "#ecfdf5", difficulty: "Intermediate",
    features: ["9 ionic pairs", "Net ionic eq.", "Ksp predictions"],
    desc: "Mix ionic solutions and observe precipitate formation with net ionic equations.",
  },
  "/experiments/redox-displacement": {
    href: "/experiments/redox-displacement", title: "Redox Displacement",
    accent: "#64748b", bg: "#f8fafc", difficulty: "Intermediate",
    features: ["Activity series", "Metal displacement", "Colour changes"],
    desc: "Place metals in salt solutions and observe displacement by reactivity series.",
  },
  "/experiments/separation-techniques": {
    href: "/experiments/separation-techniques", title: "Separation Techniques",
    accent: "#0284c7", bg: "#f0f9ff", difficulty: "Intermediate",
    features: ["Filtration", "Evaporation", "Distillation", "Chromatography"],
    desc: "Filtration, evaporation, distillation, and chromatography — calculate Rf values.",
  },
  "/experiments/reaction-rate": {
    href: "/experiments/reaction-rate", title: "Reaction Kinetics",
    accent: "#7c3aed", bg: "#f5f3ff", difficulty: "Advanced",
    features: ["Temp effect", "Collision theory", "Rate multiplier"],
    desc: "Investigate how temperature and concentration affect reaction rate.",
  },
  "/experiments/gas-laws": {
    href: "/experiments/gas-laws", title: "Gas Laws",
    accent: "#db2777", bg: "#fdf2f8", difficulty: "Advanced",
    features: ["Boyle's Law", "Charles's Law", "PV = nRT"],
    desc: "Verify Boyle's and Charles's Laws with live PV and V/T graphing.",
  },
  "/experiments/chemical-equilibrium": {
    href: "/experiments/chemical-equilibrium", title: "Chemical Equilibrium",
    accent: "#d97706", bg: "#fffbeb", difficulty: "Advanced",
    features: ["Le Chatelier's", "Fe³⁺/SCN⁻", "Keq changes"],
    desc: "Observe Le Chatelier's Principle via the Fe³⁺/SCN⁻ colour-shift system.",
  },
  "/experiments/calorimetry": {
    href: "/experiments/calorimetry", title: "Calorimetry",
    accent: "#ef4444", bg: "#fef2f2", difficulty: "Advanced",
    features: ["ΔH calculation", "Temp graph", "Heat capacity"],
    desc: "Measure enthalpy of neutralisation — calculate ΔH from temperature data.",
  },
  // ── 5 New Experiments ─────────────────────────────────────────────────────
  "/experiments/neutralization": {
    href: "/experiments/neutralization", title: "Neutralization Reaction",
    accent: "#10b981", bg: "#ecfdf5", difficulty: "Beginner",
    features: ["Exothermic reaction", "Temperature rise", "NaCl formation", "q = mcΔT"],
    desc: "Study the neutralisation of HCl with NaOH and observe heat generation and salt formation.",
  },
  "/experiments/salt-analysis": {
    href: "/experiments/salt-analysis", title: "Qualitative Salt Analysis",
    accent: "#7c3aed", bg: "#f5f3ff", difficulty: "Intermediate",
    features: ["5 unknown salts", "Cation tests", "Anion tests", "Systematic analysis"],
    desc: "Identify unknown salts using systematic cation and anion tests.",
  },
  "/experiments/water-hardness": {
    href: "/experiments/water-hardness", title: "Water Hardness Test",
    accent: "#0284c7", bg: "#f0f9ff", difficulty: "Advanced",
    features: ["EDTA titration", "EBT indicator", "Hardness calculation", "Classification"],
    desc: "Determine water hardness using EDTA complexometric titration.",
  },
  "/experiments/functional-groups": {
    href: "/experiments/functional-groups", title: "Functional Group Detection",
    accent: "#d97706", bg: "#fffbeb", difficulty: "Advanced",
    features: ["5 functional groups", "5 reagent tests", "Positive/negative results", "Structural identification"],
    desc: "Identify organic functional groups using Lucas, Tollen's, 2,4-DNP, NaHCO₃, and Hinsberg tests.",
  },
  "/experiments/chromatography": {
    href: "/experiments/chromatography", title: "Paper Chromatography",
    accent: "#0ea5e9", bg: "#f0f9ff", difficulty: "Intermediate",
    features: ["4 ink samples", "Real-time development", "Rf calculation", "Dye identification"],
    desc: "Separate ink dye mixtures by paper chromatography and calculate Rf values.",
  },
};

export const DIFFICULTY_STYLE = {
  Beginner:     { bg: "rgba(5,150,105,0.09)",  color: "#059669", border: "rgba(5,150,105,0.22)"  },
  Intermediate: { bg: "rgba(37,99,235,0.09)",  color: "#2563eb", border: "rgba(37,99,235,0.22)"  },
  Advanced:     { bg: "rgba(124,58,237,0.09)", color: "#7c3aed", border: "rgba(124,58,237,0.22)" },
};
