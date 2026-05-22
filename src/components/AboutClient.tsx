"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

const FEATURE_ITEMS = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <path d="M9 3v7L5 15a2 2 0 001.8 3h10.4A2 2 0 0019 15l-4-5V3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8.5 3h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    title:  "Real Chemistry Principles",
    detail: "Every simulation is grounded in actual GCSE, IGCSE, A-Level, and IB chemistry syllabuses. Stoichiometry, reaction kinetics, thermochemistry — all mathematically accurate.",
    color:  "#2563eb",
    bg:     "rgba(37,99,235,0.08)",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="8.5" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M11 7v4l2.5 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title:  "Guided Step-by-Step Flow",
    detail: "Experiments walk you through every procedural step with real-time context explanations, so you understand the science as it unfolds, not just after the fact.",
    color:  "#059669",
    bg:     "rgba(5,150,105,0.08)",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
        <rect x="12" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
        <rect x="3" y="12" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
        <rect x="12" y="12" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
      </svg>
    ),
    title:  "Full Periodic Table",
    detail: "All 118 elements with interactive tiles — atomic number, symbol, mass, and category colour-coding. Hover to explore electron configurations and properties.",
    color:  "#7c3aed",
    bg:     "rgba(124,58,237,0.08)",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="8.5" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M8 11l2.2 2.2L14 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title:  "Post-Lab Assessments",
    detail: "Each experiment closes with a multiple-choice quiz that reinforces the key concepts, provides immediate feedback, and grades your understanding out of 100.",
    color:  "#d97706",
    bg:     "rgba(217,119,6,0.08)",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <path d="M11 3L4 6v6.5c0 3.7 3 7.2 7 8.5 4-1.3 7-4.8 7-8.5V6L11 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      </svg>
    ),
    title:  "Safety-First Design",
    detail: "Every experiment opens with a structured pre-lab briefing covering safety notes, hazards, PPE requirements, and procedure overview — mirroring real laboratory best practice.",
    color:  "#ef4444",
    bg:     "rgba(239,68,68,0.08)",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <path d="M3 11h16M11 3l8 8-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title:  "Zero Setup Required",
    detail: "No downloads, no account needed. Open ChemLab in any modern browser and start experimenting instantly. Designed to work seamlessly on desktop, tablet, and mobile.",
    color:  "#0891b2",
    bg:     "rgba(8,145,178,0.08)",
  },
];

const LEARNING_OUTCOMES = [
  "Understand acid-base equilibria and titration endpoints",
  "Explain how electrolytic cells and electrodes work",
  "Predict flame emission colours from metal ion identity",
  "Apply Le Chatelier's principle to chemical equilibria",
  "Investigate factors affecting reaction rate",
  "Use Boyle's and Charles' laws to model gas behaviour",
  "Calculate energy changes using calorimetry data",
  "Distinguish between redox half-equations",
  "Apply solubility rules to predict precipitate formation",
  "Evaluate separation techniques for mixtures",
  "Collect and measure gas volumes by water displacement",
];

const CURRICULUM_BADGES = [
  { label: "IGCSE Chemistry",  color: "#2563eb" },
  { label: "GCSE Chemistry",   color: "#059669" },
  { label: "A-Level Chemistry",color: "#7c3aed" },
  { label: "IB Chemistry HL",  color: "#d97706" },
  { label: "IB Chemistry SL",  color: "#0891b2" },
  { label: "AP Chemistry",     color: "#ef4444" },
];

export default function AboutClient() {
  return (
    <div style={{ background: "linear-gradient(180deg,#f0f7ff 0%,#ffffff 50%,#f8fafc 100%)" }}>

      {/* ── Hero ── */}
      <section className="pt-14 pb-16 px-6 sm:px-8 max-w-5xl mx-auto text-center">
        <motion.div {...fadeUp(0)}>
          <div className="flex justify-center mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg,#1d4ed8 0%,#0ea5e9 100%)",
                boxShadow:  "0 6px 24px rgba(37,99,235,0.3)",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <path d="M11 4v9.5L6.5 20a2.5 2.5 0 002.2 3.75h14a2.5 2.5 0 002.2-3.75L20 13.5V4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 4h8" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="12" cy="18" r="1.5" fill="rgba(255,255,255,0.7)"/>
                <circle cx="16.5" cy="20.5" r="1.2" fill="rgba(255,255,255,0.5)"/>
              </svg>
            </div>
          </div>
          <p className="section-eyebrow">About ChemLab</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-5"
              style={{ color: "var(--lab-text-primary)" }}>
            Chemistry Education,
            <br />
            <span className="gradient-text-hero">Reimagined</span>
          </h1>
          <p className="text-base sm:text-lg leading-relaxed max-w-2xl mx-auto"
             style={{ color: "var(--lab-text-muted)" }}>
            ChemLab brings the practical chemistry laboratory directly to your screen —
            accurate, safe, accessible, and beautifully crafted for students at every level.
          </p>
        </motion.div>
      </section>

      {/* ── Mission ── */}
      <section className="px-6 sm:px-8 max-w-5xl mx-auto mb-20">
        <div
          className="rounded-3xl p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
          style={{
            background: "linear-gradient(135deg,rgba(37,99,235,0.06) 0%,rgba(6,182,212,0.04) 100%)",
            border:     "1px solid rgba(37,99,235,0.10)",
          }}
        >
          <motion.div {...fadeUp(0.1)}>
            <p className="section-eyebrow">Our Mission</p>
            <h2 className="text-2xl sm:text-3xl font-black leading-tight mb-4"
                style={{ color: "var(--lab-text-primary)" }}>
              Every student deserves access to a great lab
            </h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--lab-text-muted)" }}>
              Practical chemistry is irreplaceable for building intuition about how matter behaves.
              Yet millions of students lack access to well-equipped labs, safe reagents, or the time
              to run experiments properly.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--lab-text-muted)" }}>
              ChemLab removes every barrier — no chemicals to buy, no safety risks, no equipment
              to maintain. Just authentic experiments you can run at any time, on any device,
              as many times as you need.
            </p>
          </motion.div>

          <motion.div {...fadeUp(0.2)} className="flex flex-col gap-4">
            {[
              { icon: "🌍", text: "Free and accessible to every student worldwide" },
              { icon: "🔬", text: "Scientifically accurate simulations, not cartoons" },
              { icon: "📚", text: "Aligned to IGCSE, A-Level, IB, GCSE, and AP curricula" },
              { icon: "🔄", text: "Repeat experiments as many times as needed — zero cost" },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: "rgba(37,99,235,0.08)" }}
                >
                  {item.icon}
                </div>
                <p className="text-sm leading-relaxed pt-1.5" style={{ color: "var(--lab-text-secondary)" }}>
                  {item.text}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="px-6 sm:px-8 max-w-5xl mx-auto mb-20">
        <motion.div {...fadeUp(0.1)} className="text-center mb-10">
          <p className="section-eyebrow">How It Works</p>
          <h2 className="section-heading">From briefing to results in minutes</h2>
          <p className="section-subheading max-w-2xl mx-auto">
            Each experiment follows a structured, guided flow designed to teach the science, not just show pretty animations.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { step: "01", title: "Pre-Lab Briefing",   desc: "Read objectives, reagents, apparatus, and safety notes before you begin. Just like a real lab.",          color: "#2563eb" },
            { step: "02", title: "Run the Experiment", desc: "Follow guided steps or explore freely. Context pop-ups explain what is happening chemically in real time.", color: "#059669" },
            { step: "03", title: "Record Observations",desc: "Your actions are logged in the observation panel with severity-coded entries — info, warning, and success.",  color: "#7c3aed" },
            { step: "04", title: "Post-Lab Assessment", desc: "After completion, take a multiple-choice quiz, review your observation log, and get a scored performance summary.", color: "#d97706" },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              {...fadeUp(0.12 + i * 0.07)}
              className="premium-card p-5 rounded-2xl"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black mb-4"
                style={{ background: `${item.color}14`, color: item.color }}
              >
                {item.step}
              </div>
              <h3 className="text-sm font-bold mb-2" style={{ color: "var(--lab-text-primary)" }}>
                {item.title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--lab-text-muted)" }}>
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features grid ── */}
      <section className="px-6 sm:px-8 max-w-5xl mx-auto mb-20">
        <motion.div {...fadeUp(0.1)} className="text-center mb-10">
          <p className="section-eyebrow">What Makes ChemLab Different</p>
          <h2 className="section-heading">Built for learning, not just looks</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURE_ITEMS.map((item, i) => (
            <motion.div
              key={item.title}
              {...fadeUp(0.1 + i * 0.06)}
              className="premium-card p-5 rounded-2xl"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: item.bg, color: item.color }}
              >
                {item.icon}
              </div>
              <h3 className="text-sm font-bold mb-2" style={{ color: "var(--lab-text-primary)" }}>
                {item.title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--lab-text-muted)" }}>
                {item.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Learning outcomes ── */}
      <section className="px-6 sm:px-8 max-w-5xl mx-auto mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <motion.div {...fadeUp(0.1)}>
            <p className="section-eyebrow">Learning Outcomes</p>
            <h2 className="text-2xl sm:text-3xl font-black leading-tight mb-4"
                style={{ color: "var(--lab-text-primary)" }}>
              What you will master
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--lab-text-muted)" }}>
              ChemLab covers key practical skills from major chemistry curricula, helping you build
              genuine conceptual understanding alongside technique.
            </p>
          </motion.div>
          <motion.div {...fadeUp(0.2)}>
            <ul className="space-y-2.5">
              {LEARNING_OUTCOMES.map((outcome, i) => (
                <motion.li
                  key={outcome}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.2 + i * 0.04 }}
                  className="flex items-start gap-2.5"
                >
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "rgba(37,99,235,0.1)" }}
                  >
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
                      <path d="M1.5 4l2 2L6.5 2" stroke="#2563eb" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-sm leading-snug" style={{ color: "var(--lab-text-secondary)" }}>
                    {outcome}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ── Curriculum badges ── */}
      <section className="px-6 sm:px-8 max-w-5xl mx-auto mb-20 text-center">
        <motion.div {...fadeUp(0.1)}>
          <p className="section-eyebrow">Curriculum Alignment</p>
          <h2 className="text-2xl font-black mb-6" style={{ color: "var(--lab-text-primary)" }}>
            Aligned to your syllabus
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {CURRICULUM_BADGES.map((badge) => (
              <span
                key={badge.label}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border"
                style={{
                  background:  `${badge.color}0d`,
                  borderColor: `${badge.color}28`,
                  color:        badge.color,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: badge.color }} />
                {badge.label}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 sm:px-8 max-w-5xl mx-auto pb-20 text-center">
        <motion.div
          {...fadeUp(0.1)}
          className="rounded-3xl px-8 py-12"
          style={{
            background: "linear-gradient(135deg,rgba(37,99,235,0.07) 0%,rgba(6,182,212,0.05) 100%)",
            border:     "1px solid rgba(37,99,235,0.10)",
          }}
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--lab-blue-600)" }}>
            Get started
          </p>
          <h3 className="text-2xl sm:text-3xl font-black mb-4" style={{ color: "var(--lab-text-primary)" }}>
            Ready to experiment?
          </h3>
          <p className="text-sm mb-8 max-w-xl mx-auto" style={{ color: "var(--lab-text-muted)" }}>
            No signup, no download, no cost. Open your first experiment right now and start learning by doing.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/experiments"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-95"
              style={{ background: "linear-gradient(135deg,#1d4ed8 0%,#0ea5e9 100%)", boxShadow: "0 4px 20px rgba(37,99,235,0.25)" }}
            >
              Enter the Laboratory
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 7h10M8.5 3.5l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link
              href="/safety"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-base font-semibold border transition-all hover:bg-slate-50 active:scale-95"
              style={{ borderColor: "var(--lab-glass-border)", color: "var(--lab-text-secondary)" }}
            >
              Read Safety Guide
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
