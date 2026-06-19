"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import CATALOG from "@/lib/experiments-catalog";

const SUMMARY_CARDS = [
  {
    value: `${CATALOG.length}`, label: "Available Labs", sub: "interactive experiments", color: "#2563eb", bg: "rgba(37,99,235,0.07)",
    icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M8 4v8L4 16h12l-4-4V4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 4h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  },
  {
    value: "118", label: "Elements", sub: "in periodic table", color: "#7c3aed", bg: "rgba(124,58,237,0.07)",
    icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/></svg>,
  },
  {
    value: "5", label: "Disciplines", sub: "chemistry domains", color: "#059669", bg: "rgba(5,150,105,0.07)",
    icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6"/><path d="M10 6v4l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    value: "A+", label: "Your Level", sub: "keep experimenting!", color: "#d97706", bg: "rgba(217,119,6,0.07)",
    icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2l2.4 5.6H18l-4.5 3.3 1.7 5.7L10 13.3l-5.2 3.3 1.7-5.7L2 7.6h5.6L10 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  },
];

const QUICK_ACTIONS = [
  {
    label:   "Browse Experiments",
    desc:    `All ${CATALOG.length} interactive labs`,
    href:    "/experiments",
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
  {
    label:   "Lab Apparatus",
    desc:    "Interactive equipment guide",
    href:    "/apparatus",
    color:   "linear-gradient(135deg,#059669 0%,#06b6d4 100%)",
    shadow:  "0 4px 20px rgba(5,150,105,0.25)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 3v5l-4 7h8l-4-7V3M7.5 3h5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
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
];

// Chemistry domains as progress cards
const DISCIPLINE_PROGRESS = [
  { label: "Physical Chemistry", count: CATALOG.filter(e => e.category === "physical").length,   color: "#2563eb", icon: "⚗️", desc: "Gas laws, thermodynamics, kinetics" },
  { label: "Organic Chemistry",  count: CATALOG.filter(e => e.category === "organic").length,    color: "#d97706", icon: "🔬", desc: "Functional groups, reactions, tests" },
  { label: "Inorganic Chemistry",count: CATALOG.filter(e => e.category === "inorganic").length,  color: "#7c3aed", icon: "🧪", desc: "Metals, salts, flame tests, redox" },
  { label: "Analytical Chemistry",count: CATALOG.filter(e => e.category === "analytical").length,color: "#059669", icon: "📊", desc: "Titration, chromatography, analysis" },
  { label: "Lab Techniques",     count: CATALOG.filter(e => e.category === "techniques").length, color: "#0891b2", icon: "🔭", desc: "Filtration, separation, distillation" },
];

const ACHIEVEMENTS = [
  { label: "First Experiment", desc: "Complete your first virtual lab", earned: false, color: "#2563eb" },
  { label: "Element Scholar",  desc: "Explore 10 elements in the PT", earned: false, color: "#7c3aed" },
  { label: "Safety First",     desc: "Read the full safety guide",     earned: false, color: "#f59e0b" },
  { label: "Analyst",          desc: "Run a titration to endpoint",     earned: false, color: "#059669" },
  { label: "Spectrum Hunter",  desc: "Observe 5 different flame colors",earned: false, color: "#ea580c" },
  { label: "Gas Master",       desc: "Master all three gas laws",       earned: false, color: "#0891b2" },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
};

export default function DashboardClient() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#f0f7ff 0%,#ffffff 60%,#f8fafc 100%)" }}>

      {/* ── Hero band ── */}
      <section className="pt-14 pb-10 px-6 sm:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="section-eyebrow">Dashboard</p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: "var(--lab-text-primary)" }}>
            Your <span className="gradient-text">Chemistry</span> Hub
          </h1>
          <p className="mt-2 text-base" style={{ color: "var(--lab-text-muted)" }}>
            Track progress, explore disciplines, and unlock achievements across {CATALOG.length} virtual experiments.
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
              whileInView="whileInView"
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              className="premium-card p-5 rounded-2xl"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: card.bg, color: card.color }}
              >
                {card.icon}
              </div>
              <p className="text-2xl font-black leading-none mb-0.5 tabular-nums" style={{ color: card.color }}>
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
        <p className="section-eyebrow mb-5">Quick Actions</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.07 }}
            >
              <Link
                href={action.href}
                className="group flex flex-col p-4 rounded-2xl text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-95 block"
                style={{ background: action.color, boxShadow: action.shadow }}
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

      {/* ── Chemistry disciplines ── */}
      <section className="px-6 sm:px-8 max-w-7xl mx-auto mb-14">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="section-eyebrow mb-0">Chemistry Disciplines</p>
            <h2 className="text-xl font-bold mt-1" style={{ color: "var(--lab-text-primary)" }}>
              Explore by Domain
            </h2>
          </div>
          <Link
            href="/experiments"
            className="text-sm font-semibold transition-colors hover:underline"
            style={{ color: "var(--lab-blue-600)" }}
          >
            All Labs →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {DISCIPLINE_PROGRESS.map((disc, i) => (
            <motion.div
              key={disc.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                href={`/experiments/category/${disc.label.toLowerCase().replace(/\s+/g, "-").replace("chemistry", "").trim() || disc.label.toLowerCase()}`}
                className="premium-card flex flex-col p-5 rounded-2xl h-full hover:-translate-y-1 transition-transform duration-200 block"
                style={{ textDecoration: "none" }}
              >
                <div className="text-2xl mb-3">{disc.icon}</div>
                <p className="text-sm font-bold mb-1 leading-tight" style={{ color: "var(--lab-text-primary)" }}>
                  {disc.label}
                </p>
                <p className="text-xs mb-3 leading-relaxed" style={{ color: "var(--lab-text-subtle)" }}>
                  {disc.desc}
                </p>
                <div className="mt-auto flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--lab-glass-border)" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: disc.count > 0 ? "100%" : "0%",
                        background: disc.color,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold tabular-nums" style={{ color: disc.color }}>
                    {disc.count}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Achievements ── */}
      <section className="px-6 sm:px-8 max-w-7xl mx-auto mb-14">
        <div className="mb-5">
          <p className="section-eyebrow mb-0">Achievements</p>
          <h2 className="text-xl font-bold mt-1" style={{ color: "var(--lab-text-primary)" }}>
            Unlock Milestones
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {ACHIEVEMENTS.map((ach, i) => (
            <motion.div
              key={ach.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.38, delay: i * 0.05 }}
              className="premium-card p-4 rounded-2xl flex flex-col items-center text-center"
              style={{ opacity: ach.earned ? 1 : 0.65 }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mb-3 text-base"
                style={{
                  background: ach.earned ? `${ach.color}18` : "rgba(148,163,184,0.1)",
                  border: `1.5px solid ${ach.earned ? ach.color + "40" : "rgba(148,163,184,0.2)"}`,
                }}
              >
                {ach.earned ? "✓" : "🔒"}
              </div>
              <p className="text-xs font-bold leading-tight mb-1" style={{ color: "var(--lab-text-primary)" }}>
                {ach.label}
              </p>
              <p className="text-[10px] leading-relaxed" style={{ color: "var(--lab-text-subtle)" }}>
                {ach.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Getting started section ── */}
      <section className="px-6 sm:px-8 max-w-7xl mx-auto pb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.52 }}
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
              Browse Experiments
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
