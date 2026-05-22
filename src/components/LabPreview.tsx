"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const LABS = [
  {
    icon:     <TitrationIcon />,
    accent:   "#2563eb",
    bg:       "#eff6ff",
    tag:      "Available",
    title:    "Acid-Base Titration",
    href:     "/experiments/titration",
    desc:     "Strong acid–base titration with micro-litre precision, live pH curves, three indicators, and scored endpoint detection.",
    features: ["Live pH curve", "3 indicators", "Precision scoring"],
    difficulty: "Beginner",
  },
  {
    icon:     <ElectrolysisIcon />,
    accent:   "#0891b2",
    bg:       "#ecfeff",
    tag:      "Available",
    title:    "Electrolysis",
    href:     "/experiments/electrolysis",
    desc:     "Electrolysis of five ionic solutions — observe gas evolution, Faradaic half-reactions, and voltage effects.",
    features: ["5 electrolytes", "Half-reactions", "Gas volume tracking"],
    difficulty: "Intermediate",
  },
  {
    icon:     <FlameIcon />,
    accent:   "#ea580c",
    bg:       "#fff7ed",
    tag:      "Available",
    title:    "Flame Test",
    href:     "/experiments/flame-test",
    desc:     "Identify metal ions by their characteristic flame emission wavelengths using a Bunsen burner and nichrome loop.",
    features: ["7 metal salts", "Emission spectra", "Contamination test"],
    difficulty: "Beginner",
  },
  {
    icon:     <SolubilityIcon />,
    accent:   "#059669",
    bg:       "#ecfdf5",
    tag:      "Available",
    title:    "Solubility & Precipitation",
    href:     "/experiments/solubility",
    desc:     "Mix ionic solutions and observe precipitate formation with net ionic equations and Ksp-based predictions.",
    features: ["9 solutions", "Net ionic eq.", "Precipitate colours"],
    difficulty: "Intermediate",
  },
  {
    icon:     <ReactionRateIcon />,
    accent:   "#7c3aed",
    bg:       "#f5f3ff",
    tag:      "Available",
    title:    "Reaction Rate",
    href:     "/experiments/reaction-rate",
    desc:     "Explore how temperature, concentration, and surface area alter the rate of a chemical reaction in real time.",
    features: ["Temperature ctrl", "Collision theory", "Rate multiplier"],
    difficulty: "Advanced",
  },
  {
    icon:     <GasLawsIcon />,
    accent:   "#db2777",
    bg:       "#fdf2f8",
    tag:      "Available",
    title:    "Gas Laws",
    href:     "/experiments/gas-laws",
    desc:     "Verify Boyle's and Charles's Laws interactively — adjust pressure, volume, and temperature with live PV and V/T graphs.",
    features: ["Boyle's + Charles's", "PV = nRT", "Data graphing"],
    difficulty: "Advanced",
  },
];

const DIFFICULTY_STYLE: Record<string, { bg: string; color: string }> = {
  Beginner:     { bg: "rgba(5,150,105,0.08)",  color: "#059669" },
  Intermediate: { bg: "rgba(37,99,235,0.08)",  color: "#2563eb" },
  Advanced:     { bg: "rgba(124,58,237,0.08)", color: "#7c3aed" },
};

export default function LabPreview() {
  return (
    <section
      id="lab"
      className="py-20 px-6"
      style={{ background: "var(--lab-white)" }}
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
            Virtual Lab Experience
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold leading-tight"
            style={{ color: "var(--lab-text-primary)" }}
          >
            Choose Your{" "}
            <span className="gradient-text">Experiment</span>
          </h2>
          <p
            className="mt-4 text-base max-w-xl mx-auto"
            style={{ color: "var(--lab-text-muted)" }}
          >
            Six precision-engineered virtual lab environments, each purpose-built for a distinct discipline of chemistry.
          </p>
        </motion.div>

        {/* 3-col grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LABS.map(({ icon, accent, bg, tag, title, href, desc, features, difficulty }, i) => {
            const diffStyle = DIFFICULTY_STYLE[difficulty];
            return (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.07, ease: "easeOut" }}
                viewport={{ once: true, margin: "-60px" }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative rounded-2xl border overflow-hidden flex flex-col"
                style={{
                  background:    "var(--lab-glass-heavy)",
                  borderColor:   "var(--lab-glass-border)",
                  boxShadow:     "var(--lab-shadow-md)",
                  backdropFilter: "blur(12px)",
                }}
              >
                {/* Gradient accent bar */}
                <div
                  className="h-1 w-full flex-shrink-0"
                  style={{ background: `linear-gradient(90deg, ${accent}60, ${accent})` }}
                />

                <div className="p-6 flex flex-col flex-1">
                  {/* Icon + badges */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
                      style={{ background: bg }}
                    >
                      <span style={{ color: accent }}>{icon}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full border"
                        style={{ background: bg, borderColor: accent + "50", color: accent }}
                      >
                        {tag}
                      </span>
                      <span
                        className="text-[9px] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: diffStyle.bg, color: diffStyle.color }}
                      >
                        {difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Title + desc */}
                  <h3
                    className="text-base font-bold mb-1.5"
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
                  <div className="mt-4 flex flex-wrap gap-1.5">
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
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold transition-all duration-200 group/link"
                    style={{ color: accent }}
                  >
                    Launch Lab
                    <span className="transition-transform duration-200 group-hover/link:translate-x-1">→</span>
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
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

function SolubilityIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
      <path d="M4 8 L5 18 L10 18 L9 8 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 8 L13 18 L18 18 L17 8 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 13 Q11 11 13 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="11" cy="16" r="1" fill="currentColor" opacity="0.6" />
      <circle cx="13" cy="14.5" r="0.8" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

function ReactionRateIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 4 L11 11 L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="11" cy="11" r="1.5" fill="currentColor" opacity="0.6" />
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
