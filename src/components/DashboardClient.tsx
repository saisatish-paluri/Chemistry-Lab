"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import CATALOG from "@/lib/experiments-catalog";

// Derive experiment list directly from the canonical catalog (prevents drift)
const EXPERIMENTS = CATALOG.map((e) => ({
  key:   e.slug,
  label: e.title,
  color: e.accent,
  tag:   e.difficulty,
  href:  e.href,
}));

const TAG_COLOR: Record<string, { bg: string; text: string }> = {
  Beginner:     { bg: "rgba(34,197,94,0.1)",  text: "#15803d" },
  Intermediate: { bg: "rgba(37,99,235,0.1)",  text: "#1d4ed8" },
  Advanced:     { bg: "rgba(124,58,237,0.1)", text: "#7c3aed" },
};

const QUICK_ACTIONS = [
  {
    label:   "Open Latest Lab",
    desc:    "Jump straight into titration",
    href:    "/experiments/titration",
    color:   "linear-gradient(135deg,#1d4ed8 0%,#0ea5e9 100%)",
    shadow:  "0 4px 20px rgba(37,99,235,0.25)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M8 4v8L4 16h12l-4-4V4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 4h6" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label:   "All Experiments",
    desc:    `Browse all ${CATALOG.length} labs`,
    href:    "/experiments",
    color:   "linear-gradient(135deg,#059669 0%,#06b6d4 100%)",
    shadow:  "0 4px 20px rgba(5,150,105,0.25)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="6" height="6" rx="1.5" stroke="white" strokeWidth="1.6"/>
        <rect x="11" y="3" width="6" height="6" rx="1.5" stroke="white" strokeWidth="1.6"/>
        <rect x="3" y="11" width="6" height="6" rx="1.5" stroke="white" strokeWidth="1.6"/>
        <rect x="11" y="11" width="6" height="6" rx="1.5" stroke="white" strokeWidth="1.6"/>
      </svg>
    ),
  },
  {
    label:   "Safety Guide",
    desc:    "Review lab safety rules",
    href:    "/safety",
    color:   "linear-gradient(135deg,#f59e0b 0%,#ef4444 100%)",
    shadow:  "0 4px 20px rgba(245,158,11,0.25)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 2L3 6v5c0 4.1 2.9 7.9 7 9 4.1-1.1 7-4.9 7-9V6L10 2Z" stroke="white" strokeWidth="1.6" strokeLinejoin="round"/>
        <path d="M7.5 10l2 2 3-3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label:   "Periodic Table",
    desc:    "Explore all 118 elements",
    href:    "/#elements",
    color:   "linear-gradient(135deg,#7c3aed 0%,#db2777 100%)",
    shadow:  "0 4px 20px rgba(124,58,237,0.25)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="7" height="7" rx="1" stroke="white" strokeWidth="1.6"/>
        <rect x="11" y="2" width="7" height="7" rx="1" stroke="white" strokeWidth="1.6"/>
        <rect x="2" y="11" width="7" height="7" rx="1" stroke="white" strokeWidth="1.6"/>
        <rect x="11" y="11" width="7" height="7" rx="1" stroke="white" strokeWidth="1.6"/>
      </svg>
    ),
  },
];

const SUMMARY_CARDS = [
  { value: `${CATALOG.length}`, label: "Total Experiments",  sub: "available labs",     color: "#2563eb", bg: "rgba(37,99,235,0.07)" },
  { value: "118",               label: "Elements",           sub: "in periodic table",  color: "#059669", bg: "rgba(5,150,105,0.07)" },
  { value: "50+",               label: "MCQ Questions",      sub: "across all labs",    color: "#7c3aed", bg: "rgba(124,58,237,0.07)" },
  { value: "A+",                label: "Your Level",         sub: "keep it up!",        color: "#d97706", bg: "rgba(217,119,6,0.07)"  },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function DashboardClient() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#f0f7ff 0%,#ffffff 60%,#f8fafc 100%)" }}>

      {/* ── Hero band ── */}
      <section className="pt-14 pb-10 px-6 sm:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="section-eyebrow">Dashboard</p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: "var(--lab-text-primary)" }}>
            Welcome to <span className="gradient-text">ChemLab</span>
          </h1>
          <p className="mt-2 text-base" style={{ color: "var(--lab-text-muted)" }}>
            Your virtual chemistry laboratory — {CATALOG.length} interactive experiments, full periodic table, and post-lab assessments.
          </p>
        </motion.div>
      </section>

      {/* ── Summary stat cards ── */}
      <section className="px-6 sm:px-8 max-w-7xl mx-auto mb-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {SUMMARY_CARDS.map((card, i) => (
            <motion.div
              key={card.label}
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              className="premium-card p-5 rounded-2xl"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: card.bg }}
              >
                <span className="text-xl font-black" style={{ color: card.color, fontSize: 15, fontVariantNumeric: "tabular-nums" }}>
                  {card.value}
                </span>
              </div>
              <p className="text-xl font-black leading-none mb-0.5" style={{ color: card.color }}>
                {card.value}
              </p>
              <p className="text-sm font-semibold" style={{ color: "var(--lab-text-primary)" }}>{card.label}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--lab-text-subtle)" }}>{card.sub}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Quick actions ── */}
      <section className="px-6 sm:px-8 max-w-7xl mx-auto mb-14">
        <div className="flex items-center gap-3 mb-5">
          <p className="section-eyebrow mb-0">Quick Actions</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.07 }}
            >
              <Link
                href={action.href}
                className="group flex flex-col p-4 rounded-2xl text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-95 block"
                style={{
                  background: action.color,
                  boxShadow:  action.shadow,
                }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                     style={{ background: "rgba(255,255,255,0.18)" }}>
                  {action.icon}
                </div>
                <p className="text-sm font-bold leading-tight">{action.label}</p>
                <p className="text-xs opacity-80 mt-0.5">{action.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── All experiments grid ── */}
      <section className="px-6 sm:px-8 max-w-7xl mx-auto mb-16">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="section-eyebrow mb-0">Experiments</p>
            <h2 className="text-xl font-bold mt-1" style={{ color: "var(--lab-text-primary)" }}>
              All {CATALOG.length} Available Labs
            </h2>
          </div>
          <Link
            href="/experiments"
            className="text-sm font-semibold transition-colors hover:underline"
            style={{ color: "var(--lab-blue-600)" }}
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {EXPERIMENTS.map((exp, i) => {
            const tc = TAG_COLOR[exp.tag] ?? TAG_COLOR["Beginner"];
            return (
              <motion.div
                key={exp.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.03 }}
              >
                <Link
                  href={exp.href}
                  className="group flex flex-col p-5 rounded-2xl premium-card card-lift h-full"
                >
                  {/* Color accent line */}
                  <div
                    className="w-full h-0.5 rounded-full mb-4 opacity-60"
                    style={{ background: `linear-gradient(90deg, ${exp.color}, transparent)` }}
                  />
                  <div className="flex items-start justify-between mb-2">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${exp.color}14` }}
                    >
                      {/* Accent dot instead of emoji — always consistent */}
                      <div className="w-3 h-3 rounded-full" style={{ background: exp.color, opacity: 0.7 }} />
                    </div>
                    <span
                      className="pill-tag text-[10px] mt-0.5"
                      style={{
                        background:  tc.bg,
                        borderColor: "transparent",
                        color:       tc.text,
                      }}
                    >
                      {exp.tag}
                    </span>
                  </div>
                  <p className="text-sm font-bold mt-2 leading-snug group-hover:underline"
                     style={{ color: "var(--lab-text-primary)" }}>
                    {exp.label}
                  </p>
                  <div className="mt-auto pt-3 flex items-center gap-1 text-xs font-semibold"
                       style={{ color: exp.color }}>
                    Start Lab
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true"
                         className="transition-transform group-hover:translate-x-0.5">
                      <path d="M2 5.5h7M6.5 3l2.5 2.5L6.5 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Getting started section ── */}
      <section className="px-6 sm:px-8 max-w-7xl mx-auto pb-20">
        <div
          className="rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-6"
          style={{
            background: "linear-gradient(135deg,rgba(37,99,235,0.08) 0%,rgba(6,182,212,0.06) 100%)",
            border: "1px solid rgba(37,99,235,0.12)",
          }}
        >
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--lab-blue-600)" }}>
              New here?
            </p>
            <h3 className="text-xl font-black mb-2" style={{ color: "var(--lab-text-primary)" }}>
              Start with the Safety Guide
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--lab-text-muted)" }}>
              Before beginning any experiment, review our lab safety rules, PPE requirements, and emergency protocols.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              href="/safety"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-95"
              style={{ background: "linear-gradient(135deg,#f59e0b 0%,#ef4444 100%)" }}
            >
              View Safety Guide
            </Link>
            <Link
              href="/experiments"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-blue-50 active:scale-95"
              style={{ borderColor: "var(--lab-glass-border)", color: "var(--lab-text-secondary)" }}
            >
              Skip to Labs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
