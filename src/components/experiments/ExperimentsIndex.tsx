"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const DIFFICULTY_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  Beginner:     { bg: "rgba(5,150,105,0.08)",   color: "#059669", border: "rgba(5,150,105,0.20)"   },
  Intermediate: { bg: "rgba(37,99,235,0.08)",   color: "#2563eb", border: "rgba(37,99,235,0.20)"   },
  Advanced:     { bg: "rgba(124,58,237,0.08)",  color: "#7c3aed", border: "rgba(124,58,237,0.20)"  },
};

interface Experiment {
  accent: string;
  bg:     string;
  tag:    string;
  title:  string;
  href:   string;
  desc:   string;
  features: string[];
  icon:   React.ReactNode;
}

const EXPERIMENTS: Experiment[] = [
  {
    accent: "#2563eb", bg: "#eff6ff", tag: "Beginner",
    title: "Acid-Base Titration",
    href:  "/experiments/titration",
    desc:  "Determine the exact volume of NaOH needed to neutralise HCl. Master pH curves, indicators, and endpoint detection.",
    features: ["Live pH curve", "3 indicators", "Precision scoring", "Equivalence point"],
    icon: <TitrationIcon />,
  },
  {
    accent: "#0891b2", bg: "#ecfeff", tag: "Intermediate",
    title: "Electrolysis",
    href:  "/experiments/electrolysis",
    desc:  "Decompose ionic compounds using direct current. Observe gas evolution, electrode reactions, and Faraday's laws.",
    features: ["5 electrolytes", "Half-reactions", "Gas volume tracking", "Faraday's law"],
    icon: <ElectrolysisIcon />,
  },
  {
    accent: "#ea580c", bg: "#fff7ed", tag: "Beginner",
    title: "Flame Test",
    href:  "/experiments/flame-test",
    desc:  "Identify metal ions by their characteristic flame colours. Learn emission spectra and electron energy transitions.",
    features: ["7 metal salts", "Emission spectra", "Ion identification", "Colour catalogue"],
    icon: <FlameIcon />,
  },
  {
    accent: "#059669", bg: "#ecfdf5", tag: "Intermediate",
    title: "Solubility & Precipitation",
    href:  "/experiments/solubility",
    desc:  "Mix ionic solutions and observe precipitate formation. Write net ionic equations and identify insoluble salts.",
    features: ["9 ionic pairs", "Net ionic equations", "Precipitate colours", "Solubility rules"],
    icon: <SolubilityIcon />,
  },
  {
    accent: "#7c3aed", bg: "#f5f3ff", tag: "Advanced",
    title: "Reaction Kinetics",
    href:  "/experiments/reaction-rate",
    desc:  "Investigate how temperature, concentration, and surface area affect reaction rate. Apply collision theory.",
    features: ["Temperature effect", "Concentration effect", "Surface area", "Rate multiplier"],
    icon: <KineticsIcon />,
  },
  {
    accent: "#db2777", bg: "#fdf2f8", tag: "Advanced",
    title: "Gas Laws",
    href:  "/experiments/gas-laws",
    desc:  "Explore Boyle's and Charles's Laws experimentally. Graph P-V and V-T relationships using PV = nRT.",
    features: ["Boyle's Law", "Charles's Law", "PV = nRT graphing", "Real-time data"],
    icon: <GasIcon />,
  },
  {
    accent: "#d97706", bg: "#fffbeb", tag: "Advanced",
    title: "Chemical Equilibrium",
    href:  "/experiments/chemical-equilibrium",
    desc:  "Disturb the Fe³⁺/SCN⁻ equilibrium and observe Le Chatelier’s Principle in action with visible colour shifts.",
    features: ["Le Chatelier's Principle", "Fe³⁺/SCN⁻ system", "Colour shifts", "Keq changes"],
    icon: <EquilibriumIcon />,
  },
  {
    accent: "#ef4444", bg: "#fef2f2", tag: "Advanced",
    title: "Calorimetry",
    href:  "/experiments/calorimetry",
    desc:  "Measure the enthalpy change of neutralisation. Calculate ΔH from temperature rise and heat capacity data.",
    features: ["Heat of neutralisation", "ΔH calculation", "Temperature graph", "Energy transfer"],
    icon: <CalorimetryIcon />,
  },
  {
    accent: "#0284c7", bg: "#f0f9ff", tag: "Intermediate",
    title: "Separation Techniques",
    href:  "/experiments/separation-techniques",
    desc:  "Separate mixtures using filtration, distillation, and paper chromatography. Calculate Rf values.",
    features: ["Filtration", "Distillation", "Chromatography", "Rf values"],
    icon: <SeparationIcon />,
  },
  {
    accent: "#475569", bg: "#f8fafc", tag: "Intermediate",
    title: "Redox Displacement",
    href:  "/experiments/redox-displacement",
    desc:  "Place metals in copper sulfate solution and observe displacement reactions according to the reactivity series.",
    features: ["Activity series", "Metal displacement", "Colour changes", "Oxidation states"],
    icon: <RedoxIcon />,
  },
];

const cardVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.44, delay: i * 0.055, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export default function ExperimentsIndex() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--lab-off-white)" }}>
      <Navbar />

      {/* ── Hero ── */}
      <section
        className="pt-28 pb-12 px-6"
        style={{
          background: "linear-gradient(180deg, #eef5ff 0%, #f8fafc 100%)",
          borderBottom: "1px solid var(--lab-glass-border)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl mx-auto text-center"
        >
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-4 border"
            style={{
              background:  "rgba(37,99,235,0.07)",
              borderColor: "rgba(37,99,235,0.15)",
              color:       "var(--lab-blue-600)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--lab-blue-600)" }} />
            Virtual Laboratory
          </div>

          <h1
            className="text-4xl md:text-5xl font-black leading-[1.1] tracking-tight mb-4"
            style={{ color: "var(--lab-text-primary)" }}
          >
            Select an{" "}
            <span className="gradient-text">Experiment</span>
          </h1>

          <p
            className="text-base leading-relaxed max-w-lg mx-auto"
            style={{ color: "var(--lab-text-muted)" }}
          >
            10 interactive experiments with pre-lab briefing, guided setup,
            real-time simulation, and post-lab assessment.
          </p>
        </motion.div>

        {/* Difficulty legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28, duration: 0.4 }}
          className="flex items-center justify-center gap-3 mt-6 flex-wrap"
        >
          {(["Beginner", "Intermediate", "Advanced"] as const).map((d) => {
            const s = DIFFICULTY_STYLE[d];
            return (
              <span
                key={d}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border"
                style={{ background: s.bg, color: s.color, borderColor: s.border }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                {d}
              </span>
            );
          })}
        </motion.div>
      </section>

      {/* ── Experiment grid ── */}
      <section className="flex-1 px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {EXPERIMENTS.map((exp, i) => {
              const diff = DIFFICULTY_STYLE[exp.tag];
              return (
                <motion.div
                  key={exp.href}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Link
                    href={exp.href}
                    className="group flex flex-col h-full rounded-2xl border overflow-hidden transition-all duration-200 hover:-translate-y-1.5"
                    style={{
                      background:     "var(--lab-glass-heavy)",
                      borderColor:    "var(--lab-glass-border)",
                      boxShadow:      "var(--lab-shadow-sm)",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = `var(--lab-shadow-md), 0 0 0 1px ${exp.accent}22`;
                      (e.currentTarget as HTMLElement).style.borderColor = `${exp.accent}30`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "var(--lab-shadow-sm)";
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--lab-glass-border)";
                    }}
                    aria-label={`Open ${exp.title} experiment`}
                  >
                    {/* Accent top bar */}
                    <div
                      className="h-0.5 w-full flex-shrink-0 transition-all duration-300"
                      style={{ background: `linear-gradient(90deg, ${exp.accent}80, ${exp.accent})` }}
                    />

                    {/* Icon area */}
                    <div
                      className="flex items-center justify-center py-7 flex-shrink-0 transition-colors duration-300"
                      style={{ background: exp.bg }}
                    >
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
                        style={{ color: exp.accent }}
                      >
                        {exp.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h2
                          className="text-sm font-bold leading-snug"
                          style={{ color: "var(--lab-text-primary)" }}
                        >
                          {exp.title}
                        </h2>
                        <span
                          className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 mt-0.5 border"
                          style={{ background: diff.bg, color: diff.color, borderColor: diff.border }}
                        >
                          {exp.tag}
                        </span>
                      </div>

                      <p
                        className="text-xs leading-relaxed mb-4 flex-1"
                        style={{ color: "var(--lab-text-muted)" }}
                      >
                        {exp.desc}
                      </p>

                      {/* Feature chips */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {exp.features.map((f) => (
                          <span
                            key={f}
                            className="text-[9.5px] px-2 py-0.5 rounded-full border font-medium"
                            style={{
                              background:  exp.bg,
                              borderColor: `${exp.accent}28`,
                              color:       exp.accent,
                            }}
                          >
                            {f}
                          </span>
                        ))}
                      </div>

                      {/* CTA */}
                      <div
                        className="flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 group-hover:gap-2.5"
                        style={{ color: exp.accent }}
                      >
                        Enter Lab
                        <svg
                          width="12" height="12" viewBox="0 0 12 12" fill="none"
                          aria-hidden="true"
                          className="transition-transform duration-200 group-hover:translate-x-1"
                        >
                          <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// ── Experiment icons ─────────────────────────────────────────────────────────

function TitrationIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path d="M16 6h8M16 6v12L8 34h24L24 18V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="20" cy="28" rx="8" ry="4" fill="currentColor" fillOpacity="0.15" />
      <path d="M12 27 Q20 24 28 27" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="22" y1="8" x2="22" y2="14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function ElectrolysisIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="6" y="10" width="12" height="22" rx="4" stroke="currentColor" strokeWidth="1.8" />
      <rect x="22" y="10" width="12" height="22" rx="4" stroke="currentColor" strokeWidth="1.8" />
      <rect x="12" y="26" width="16" height="8" rx="2" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.2" />
      <line x1="12" y1="6" x2="12" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="6" x2="28" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="20" r="1.5" fill="currentColor" fillOpacity="0.6" />
      <circle cx="14" cy="17" r="1" fill="currentColor" fillOpacity="0.4" />
      <circle cx="28" cy="19" r="1.5" fill="currentColor" fillOpacity="0.6" />
      <circle cx="26" cy="16" r="1" fill="currentColor" fillOpacity="0.4" />
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path d="M20 34 C12 34 8 28 10 22 C10 22 14 26 16 22 C16 22 16 14 20 10 C20 10 20 18 24 18 C26 14 24 8 24 8 C30 12 32 22 28 28 C28 28 26 34 20 34Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <rect x="14" y="34" width="12" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <line x1="20" y1="38" x2="20" y2="40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SolubilityIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="8" y="14" width="24" height="20" rx="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 24 Q20 20 32 24" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <ellipse cx="20" cy="30" rx="6" ry="2" fill="currentColor" fillOpacity="0.18" />
      <path d="M16 8 L20 6 L24 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="20" y1="6" x2="20" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function KineticsIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path d="M6 32 C8 28 12 20 16 18 C20 16 22 24 26 22 C30 20 32 12 34 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="16" cy="18" r="2.5" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="26" cy="22" r="2.5" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.2" />
      <line x1="6" y1="34" x2="36" y2="34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="6" y1="34" x2="6" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function GasIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="10" y="16" width="20" height="16" rx="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 16 V 10 Q16 6 20 6 Q24 6 24 10 V16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="20" cy="24" r="4" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.2" />
      <line x1="20" y1="22" x2="20" y2="26" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="18" y1="24" x2="22" y2="24" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function EquilibriumIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path d="M8 18 H18 L15 15 M18 18 L15 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 22 H22 L25 25 M22 22 L25 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="30" r="6" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="30" cy="30" r="6" fill="currentColor" fillOpacity="0.30" stroke="currentColor" strokeWidth="1.6" />
      <text x="10" y="34" fontSize="8" textAnchor="middle" fill="currentColor" fontWeight="700">A</text>
      <text x="30" y="34" fontSize="8" textAnchor="middle" fill="currentColor" fontWeight="700">B</text>
    </svg>
  );
}

function CalorimetryIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="10" y="12" width="20" height="22" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="8" width="12" height="6" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.4" />
      <line x1="20" y1="8" x2="20" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14 26 Q17 22 20 26 Q23 30 26 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13 28 L27 28" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" />
    </svg>
  );
}

function SeparationIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <line x1="10" y1="12" x2="30" y2="12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="10" y1="18" x2="26" y2="18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="10" y1="24" x2="22" y2="24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="10" y1="30" x2="18" y2="30" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="8" y1="10" x2="8" y2="34" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <text x="32" y="15" fontSize="6.5" fill="currentColor" fillOpacity="0.7" fontWeight="600">Rf</text>
    </svg>
  );
}

function RedoxIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="8" y="18" width="24" height="16" rx="4" stroke="currentColor" strokeWidth="1.8" />
      <rect x="16" y="12" width="8" height="10" rx="2" fill="currentColor" fillOpacity="0.20" stroke="currentColor" strokeWidth="1.4" />
      <path d="M13 26 Q20 23 27 26" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="15" cy="30" r="2" fill="currentColor" fillOpacity="0.30" />
      <circle cx="25" cy="30" r="2" fill="currentColor" fillOpacity="0.50" />
      <path d="M18 14 L20 12 L22 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
