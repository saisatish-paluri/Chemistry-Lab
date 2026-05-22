"use client";

import { motion, type Variants } from "framer-motion";
import AnimatedBackground from "./AnimatedBackground";
import Link from "next/link";

const stagger: Variants = {
  animate: { transition: { staggerChildren: 0.11 } },
};
const fadeUp: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6 } },
};

const STAT_ITEMS = [
  { value: "10",   label: "Virtual Labs",        sub: "fully interactive" },
  { value: "118",  label: "Elements",            sub: "complete periodic table" },
  { value: "50+",  label: "MCQ Assessments",     sub: "post-lab quizzes" },
];

const EXPERIMENT_PREVIEWS = [
  { label: "Titration",         color: "#2563eb", tag: "Beginner" },
  { label: "Electrolysis",      color: "#0891b2", tag: "Intermediate" },
  { label: "Flame Test",        color: "#ea580c", tag: "Beginner" },
  { label: "Equilibrium",       color: "#d97706", tag: "Advanced" },
  { label: "Kinetics",          color: "#7c3aed", tag: "Advanced" },
  { label: "Calorimetry",       color: "#ef4444", tag: "Advanced" },
];

export default function HeroSection() {
  return (
    <section
      id="lab"
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden pt-16"
      style={{
        background: "linear-gradient(180deg, #f0f7ff 0%, #ffffff 50%, #f8fafc 100%)",
      }}
    >
      <AnimatedBackground />

      {/* Hero content */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto w-full"
        variants={stagger}
        initial="initial"
        animate="animate"
      >
        {/* Academic badge */}
        <motion.div variants={fadeUp} className="flex justify-center mb-7">
          <div
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-semibold border"
            style={{
              background:  "rgba(37,99,235,0.06)",
              borderColor: "rgba(37,99,235,0.18)",
              color:       "var(--lab-blue-600)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"
              style={{ animation: "blink-dot 2s ease-in-out infinite" }}
            />
            Secondary &amp; Pre-University Chemistry · IGCSE · A-Level · IB
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6"
          style={{ color: "var(--lab-text-primary)" }}
        >
          Virtual Chemistry
          <br />
          <span className="gradient-text-hero">Laboratory</span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          variants={fadeUp}
          className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-4"
          style={{ color: "var(--lab-text-muted)" }}
        >
          Conduct authentic laboratory experiments, explore every element on the periodic table,
          and reinforce understanding through post-lab assessments — all in your browser.
        </motion.p>

        <motion.p
          variants={fadeUp}
          className="text-sm max-w-xl mx-auto mb-10"
          style={{ color: "var(--lab-text-subtle)" }}
        >
          Ten rigorously designed simulations covering acid-base chemistry, electrochemistry,
          kinetics, equilibrium, thermochemistry, and separation science.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14"
        >
          <Link
            href="/experiments"
            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
            style={{
              background:  "linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #0ea5e9 100%)",
              boxShadow:   "0 4px 24px rgba(37,99,235,0.30), 0 1px 4px rgba(15,23,42,0.08)",
            }}
          >
            Enter the Laboratory
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
          <a
            href="#elements"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold border transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:-translate-y-0.5"
            style={{
              color:        "var(--lab-text-secondary)",
              borderColor:  "var(--lab-slate-200)",
              background:   "var(--lab-glass)",
              backdropFilter: "blur(10px)",
            }}
          >
            Explore the Elements
          </a>
        </motion.div>

        {/* Experiment preview pills */}
        <motion.div variants={fadeUp} className="mb-14">
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-3"
             style={{ color: "var(--lab-text-subtle)" }}>
            Available experiments
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {EXPERIMENT_PREVIEWS.map(({ label, color, tag }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
                style={{
                  background:  `${color}08`,
                  borderColor: `${color}28`,
                  color,
                }}
              >
                <span
                  className="w-1 h-1 rounded-full flex-shrink-0"
                  style={{ background: color }}
                />
                {label}
                <span
                  className="text-[8px] px-1 rounded-sm font-semibold"
                  style={{ background: `${color}18`, color }}
                >
                  {tag}
                </span>
              </span>
            ))}
            <span
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border"
              style={{
                background:  "rgba(100,116,139,0.05)",
                borderColor: "rgba(100,116,139,0.15)",
                color:       "var(--lab-text-subtle)",
              }}
            >
              +4 more
            </span>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-3 gap-8 max-w-lg mx-auto"
        >
          {STAT_ITEMS.map(({ value, label, sub }) => (
            <div key={label} className="flex flex-col items-center">
              <span className="text-3xl font-black gradient-text leading-none mb-0.5">{value}</span>
              <span
                className="text-xs font-semibold"
                style={{ color: "var(--lab-text-secondary)" }}
              >
                {label}
              </span>
              <span
                className="text-[9px] mt-0.5 text-center"
                style={{ color: "var(--lab-text-subtle)" }}
              >
                {sub}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ color: "var(--lab-text-subtle)" }}
      >
        <span className="text-[9px] uppercase tracking-widest font-semibold">Scroll</span>
        <div
          className="w-5 h-8 rounded-full border-2 flex items-start justify-center pt-1.5"
          style={{ borderColor: "var(--lab-slate-300)" }}
        >
          <div
            className="w-1 h-2 rounded-full bg-blue-400"
            style={{ animation: "float-y 2s ease-in-out infinite" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
