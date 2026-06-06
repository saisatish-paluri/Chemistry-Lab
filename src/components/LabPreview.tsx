"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const DIFFICULTY_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  Beginner:     { bg: "rgba(5,150,105,0.08)",   color: "#059669", border: "rgba(5,150,105,0.20)"   },
  Intermediate: { bg: "rgba(37,99,235,0.08)",   color: "#2563eb", border: "rgba(37,99,235,0.20)"   },
  Advanced:     { bg: "rgba(124,58,237,0.08)",  color: "#7c3aed", border: "rgba(124,58,237,0.20)"  },
};

const GROUPS: { tier: "Beginner" | "Intermediate" | "Advanced"; labs: Lab[] }[] = [
  {
    tier: "Beginner",
    labs: [
      {
        accent: "#2563eb", bg: "#eff6ff",
        title: "Acid-Base Titration",
        href:  "/experiments/titration",
        desc:  "Master pH curves and endpoint detection with three indicators.",
        features: ["Live pH curve", "3 indicators", "Precision scoring"],
        icon: <TitrationIcon />,
      },
      {
        accent: "#ea580c", bg: "#fff7ed",
        title: "Flame Test",
        href:  "/experiments/flame-test",
        desc:  "Identify metal ions by their characteristic emission colours.",
        features: ["7 metal salts", "Emission spectra", "Colour catalogue"],
        icon: <FlameIcon />,
      },
      {
        accent: "#0284c7", bg: "#f0f9ff",
        title: "Gas Collection",
        href:  "/experiments/gas-collection",
        desc:  "Collect CO₂ from marble chips and HCl — measure gas volume over water.",
        features: ["CO₂ evolution", "Water displacement", "Volume tracking"],
        icon: <GasCollectIcon />,
      },
    ],
  },
  {
    tier: "Intermediate",
    labs: [
      {
        accent: "#0891b2", bg: "#ecfeff",
        title: "Electrolysis",
        href:  "/experiments/electrolysis",
        desc:  "Decompose ionic compounds — observe gas evolution and Faraday's laws.",
        features: ["5 electrolytes", "Half-reactions", "Gas tracking"],
        icon: <ElectrolysisIcon />,
      },
      {
        accent: "#059669", bg: "#ecfdf5",
        title: "Solubility & Precipitation",
        href:  "/experiments/solubility",
        desc:  "Mix ionic solutions and observe precipitate formation with net ionic equations.",
        features: ["9 ionic pairs", "Net ionic eq.", "Ksp predictions"],
        icon: <SolubilityIcon />,
      },
      {
        accent: "#475569", bg: "#f8fafc",
        title: "Redox Displacement",
        href:  "/experiments/redox-displacement",
        desc:  "Place metals in salt solutions and observe displacement by reactivity series.",
        features: ["Activity series", "Metal displacement", "Colour changes"],
        icon: <RedoxIcon />,
      },
      {
        accent: "#0284c7", bg: "#f0f9ff",
        title: "Separation Techniques",
        href:  "/experiments/separation-techniques",
        desc:  "Filtration, distillation, and chromatography — calculate Rf values.",
        features: ["Filtration", "Chromatography", "Rf values"],
        icon: <SeparationIcon />,
      },
    ],
  },
  {
    tier: "Advanced",
    labs: [
      {
        accent: "#7c3aed", bg: "#f5f3ff",
        title: "Reaction Kinetics",
        href:  "/experiments/reaction-rate",
        desc:  "Investigate how temperature and concentration affect reaction rate.",
        features: ["Temp effect", "Collision theory", "Rate multiplier"],
        icon: <KineticsIcon />,
      },
      {
        accent: "#db2777", bg: "#fdf2f8",
        title: "Gas Laws",
        href:  "/experiments/gas-laws",
        desc:  "Verify Boyle's and Charles's Laws with live PV and V/T graphing.",
        features: ["Boyle's Law", "Charles's Law", "PV = nRT"],
        icon: <GasLawsIcon />,
      },
      {
        accent: "#d97706", bg: "#fffbeb",
        title: "Chemical Equilibrium",
        href:  "/experiments/chemical-equilibrium",
        desc:  "Observe Le Chatelier's Principle via the Fe³⁺/SCN⁻ colour-shift system.",
        features: ["Le Chatelier's", "Fe³⁺/SCN⁻", "Keq changes"],
        icon: <EquilibriumIcon />,
      },
      {
        accent: "#ef4444", bg: "#fef2f2",
        title: "Calorimetry",
        href:  "/experiments/calorimetry",
        desc:  "Measure enthalpy of neutralisation — calculate ΔH from temperature data.",
        features: ["ΔH calculation", "Temp graph", "Heat capacity"],
        icon: <CalorimetryIcon />,
      },
    ],
  },
];

interface Lab {
  accent: string;
  bg: string;
  title: string;
  href: string;
  desc: string;
  features: string[];
  icon: React.ReactNode;
}

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const cardAnim = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export default function LabPreview() {
  return (
    <section
      id="experiments-journey"
      style={{
        background: "var(--lab-white)",
        borderTop:  "1px solid var(--lab-glass-border)",
        padding:    "clamp(3.5rem, 7vw, 6rem) clamp(16px, 4vw, 40px)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-14"
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--lab-blue-600)" }}
          >
            Your Learning Path
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold leading-tight"
            style={{ color: "var(--lab-text-primary)" }}
          >
            11 Experiments,{" "}
            <span className="gradient-text">3 Difficulty Tiers</span>
          </h2>
          <p
            className="mt-4 text-base max-w-xl mx-auto"
            style={{ color: "var(--lab-text-muted)" }}
          >
            Progress from core observations to complex multi-variable analysis.
            Each lab includes pre-lab briefing, guided procedure, and a scored assessment.
          </p>
        </motion.div>

        {/* Difficulty groups */}
        <div className="space-y-12">
          {GROUPS.map(({ tier, labs }) => {
            const ds = DIFFICULTY_STYLE[tier];
            return (
              <div key={tier}>
                {/* Group header */}
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  viewport={{ once: true, margin: "-40px" }}
                  className="flex items-center gap-3 mb-6"
                >
                  <span
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border"
                    style={{ background: ds.bg, color: ds.color, borderColor: ds.border }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: ds.color }} />
                    {tier}
                  </span>
                  <div className="flex-1 h-px" style={{ background: ds.border }} />
                  <span className="text-xs font-medium" style={{ color: ds.color }}>
                    {labs.length} {labs.length === 1 ? "lab" : "labs"}
                  </span>
                </motion.div>

                {/* Cards */}
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  className={`grid grid-cols-1 gap-5 ${
                    labs.length === 3 ? "md:grid-cols-3" :
                    labs.length === 4 ? "sm:grid-cols-2 lg:grid-cols-4" :
                    "sm:grid-cols-2 lg:grid-cols-3"
                  }`}
                >
                  {labs.map(({ icon, accent, bg, title, href, desc, features }) => (
                    <motion.article
                      key={title}
                      variants={cardAnim}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      className="group relative rounded-2xl border overflow-hidden flex flex-col"
                      style={{
                        background:     "var(--lab-glass-heavy)",
                        borderColor:    "var(--lab-glass-border)",
                        boxShadow:      "var(--lab-shadow-md)",
                        backdropFilter: "blur(12px)",
                      }}
                    >
                      {/* Gradient accent bar */}
                      <div
                        className="h-0.5 w-full flex-shrink-0"
                        style={{ background: `linear-gradient(90deg, ${accent}60, ${accent})` }}
                      />

                      <div className="p-5 flex flex-col flex-1">
                        {/* Icon */}
                        <div className="flex items-start justify-between mb-4">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
                            style={{ background: bg }}
                          >
                            <span style={{ color: accent }}>{icon}</span>
                          </div>
                        </div>

                        {/* Title + desc */}
                        <h3
                          className="text-sm font-bold mb-1.5"
                          style={{ color: "var(--lab-text-primary)" }}
                        >
                          {title}
                        </h3>
                        <p
                          className="text-xs leading-relaxed flex-1"
                          style={{ color: "var(--lab-text-muted)" }}
                        >
                          {desc}
                        </p>

                        {/* Feature pills */}
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {features.map((f) => (
                            <span
                              key={f}
                              className="text-[9.5px] px-2 py-0.5 rounded-full border font-medium"
                              style={{
                                background:  bg,
                                borderColor: accent + "40",
                                color:       accent,
                              }}
                            >
                              {f}
                            </span>
                          ))}
                        </div>

                        {/* CTA */}
                        <Link
                          href={href}
                          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 group/link"
                          style={{ color: accent }}
                        >
                          Launch Lab
                          <span className="transition-transform duration-200 group-hover/link:translate-x-1">→</span>
                        </Link>
                      </div>
                    </motion.article>
                  ))}
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <Link
            href="/experiments"
            className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
            style={{
              background: "linear-gradient(130deg, #1d4ed8 0%, #2563eb 55%, #0ea5e9 100%)",
              boxShadow:  "0 8px 28px rgba(37,99,235,0.30), 0 2px 6px rgba(15,23,42,0.08)",
            }}
          >
            Browse All Experiments
            <span>→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ── Icons ────────────────────────────────────────────────────────────────────

function TitrationIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
      <rect x="8" y="2" width="6" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 8h6" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <path d="M11 12v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="11" cy="17" rx="5" ry="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="11" cy="17" r="1.2" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
      <path d="M11 2 C11 2 14 6 14 10 C14 12 12 13 11 14 C10 13 8 12 8 10 C8 6 11 2 11 2Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 14 C11 14 9.5 15.5 9.5 17 C9.5 18.5 10.5 19 11 19 C11.5 19 12.5 18.5 12.5 17 C12.5 15.5 11 14 11 14Z"
        fill="currentColor" opacity="0.5" />
      <rect x="5" y="19" width="12" height="2" rx="1" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

function GasCollectIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
      <path d="M5 18 L5 8 Q5 4 9 4 L13 4 Q17 4 17 8 L17 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="4" y1="18" x2="18" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="9" cy="12" r="1.2" fill="currentColor" opacity="0.5" />
      <circle cx="13" cy="9" r="1" fill="currentColor" opacity="0.4" />
      <circle cx="11" cy="14" r="0.9" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

function ElectrolysisIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <line x1="8" y1="10" x2="8" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14" y1="10" x2="14" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5" y1="3" x2="11" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="13" y1="3" x2="17" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="14" r="1.2" fill="currentColor" opacity="0.5" />
      <circle cx="14" cy="14" r="1.2" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

function SolubilityIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
      <path d="M4 8 L5 18 L10 18 L9 8 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 8 L13 18 L18 18 L17 8 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 13 Q11 11 13 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="11" cy="16" r="1" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

function RedoxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="12" width="16" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="8" y="8" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 17 Q11 15 15 17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function SeparationIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
      <line x1="4" y1="6" x2="18" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="4" y1="10" x2="15" y2="10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="4" y1="14" x2="12" y2="14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="4" y1="18" x2="9" y2="18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="3" y1="4" x2="3" y2="20" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function KineticsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
      <path d="M3 18 C5 15 7 11 9 10 C11 9 12 13 14 12 C16 11 17 7 19 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <line x1="3" y1="20" x2="20" y2="20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <line x1="3" y1="20" x2="3" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function GasLawsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="6" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M17 10 L19 10 L19 14 L17 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="12" r="1.2" fill="currentColor" opacity="0.5" />
      <circle cx="11" cy="10" r="1" fill="currentColor" opacity="0.4" />
      <circle cx="13" cy="13" r="0.9" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

function EquilibriumIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
      <path d="M4 9 H10 L8 7 M10 9 L8 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 13 H12 L14 15 M12 13 L14 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="5" cy="17" r="3" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="17" cy="17" r="3" fill="currentColor" opacity="0.30" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function CalorimetryIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
      <rect x="5" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="8" y="5" width="6" height="4" rx="1.5" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.2" />
      <line x1="11" y1="5" x2="11" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 15 Q10 13 12 15 Q14 17 16 15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
