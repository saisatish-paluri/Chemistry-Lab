"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CATALOG, {
  CATEGORIES,
  getCategoryDef,
  type ChemCategory,
  type Difficulty,
  type ExperimentEntry,
} from "@/lib/experiments-catalog";
import Interactive3DCard from "@/components/Interactive3DCard";


// ── High-quality experiment photography ───────────────────────────────────────
const EXPERIMENT_PHOTOS: Record<string, string> = {
  // Analytical
  titration: "/images/experiments/titration.png",
  indicator: "/images/experiments/indicator.png",
  neutralization: "/images/experiments/neutralization.png",
  saltAnalysis: "/images/experiments/salt-analysis.png",
  waterHardness: "/images/experiments/water-hardness.png",

  // Inorganic
  flame: "/images/experiments/flame.png",
  electrolysis: "/images/experiments/electrolysis.png",
  solubility: "/images/experiments/solubility.png",
  redox: "/images/experiments/redox.png",

  // Physical
  kinetics: "/images/experiments/kinetics.png",
  gas: "/images/experiments/gas.png",
  equilibrium: "/images/experiments/equilibrium.png",
  calorimetry: "/images/experiments/calorimetry.png",

  // Organic
  functionalGroups: "/images/experiments/functional-groups.png",
  chromatography: "/images/experiments/chromatography.png",

  // Techniques
  density: "/images/experiments/density.png",
  filtration: "/images/experiments/filtration.png",
  dissolving: "/images/experiments/dissolving.png",
  gasCollect: "/images/experiments/gas-collect.png",
  separation: "/images/experiments/separation.png",
  crystallization: "/images/experiments/crystallization.png",
  naturalIndicators: "/images/experiments/natural-indicators.png",
  acidMetal: "/images/experiments/acid-metal.png",
  acidCarbonate: "/images/experiments/acid-carbonate.png",
  statesOfMatter: "/images/experiments/states-of-matter.png",
  diffusion: "/images/experiments/diffusion.png",
  precipitation: "/images/experiments/precipitation.png",
  decomposition: "/images/experiments/decomposition.png",
  change: "/images/experiments/change.png",
};

// ── Difficulty styling ─────────────────────────────────────────────────────────
const DIFF: Record<Difficulty, { bg: string; color: string; border: string }> = {
  Beginner:     { bg: "rgba(5,150,105,0.14)",  color: "#10b981", border: "rgba(5,150,105,0.30)"  },
  Intermediate: { bg: "rgba(37,99,235,0.14)",  color: "#3b82f6", border: "rgba(37,99,235,0.30)"  },
  Advanced:     { bg: "rgba(124,58,237,0.14)", color: "#8b5cf6", border: "rgba(124,58,237,0.30)" },
};

// ── Experiment card — fully image-first ───────────────────────────────────────
function ExpCard({
  exp,
  index,
  reduced,
}: {
  exp: ExperimentEntry;
  index: number;
  reduced: boolean;
}) {
  const [imgErr, setImgErr] = useState(false);
  const photo   = EXPERIMENT_PHOTOS[exp.iconId];
  const hasImg  = !!photo && !imgErr;
  const diff    = DIFF[exp.difficulty];

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12px" }}
      transition={{
        duration: 0.48,
        delay: index * 0.045,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      }}
    >
      <Interactive3DCard>
      <Link href={exp.href} aria-label={`Open ${exp.title}`} className="exp-img-card-link group block text-decoration-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-2xl" prefetch>
        <div className="exp-img-card flex flex-col w-full h-[320px] relative overflow-hidden bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
          
          {/* ── Photo section ── */}
          <div className="relative h-[155px] w-full overflow-hidden bg-slate-50 flex-shrink-0">
            {/* Top accent bar */}
            <div
              className="absolute top-0 left-0 right-0 h-1 z-10"
              style={{ background: `linear-gradient(90deg, ${exp.accent}, ${exp.accent}44, transparent)` }}
            />
            {hasImg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                onError={() => setImgErr(true)}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: `linear-gradient(145deg, ${exp.bg} 0%, #ffffff 100%)` }}
              >
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                  <path d="M16 5h8M16 5v11L8 26h24L24 16V5" stroke={exp.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <ellipse cx="20" cy="24" rx="5" ry="2" fill={`${exp.accent}1a`} />
                </svg>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80" />
            {exp.isNew && <span className="absolute top-3 right-3 text-[8px] font-extrabold px-2.5 py-0.5 bg-red-500 text-white rounded-full tracking-wider shadow-sm z-10">NEW</span>}
            
            {/* Overlay subject and class tag inside the image */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
              <span className="text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-md bg-white/95 text-slate-800 shadow-sm border border-white/20">
                {exp.subject}
              </span>
              <span className="text-[9.5px] font-bold text-white bg-slate-950/50 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white/10 shadow-sm">
                Class {exp.classLevels.join(", ")}
              </span>
            </div>
          </div>
          
          {/* ── Info section ── */}
          <div className="exp-img-card-info flex flex-col flex-1 p-4 justify-between bg-white relative z-20">
            <div>
              <h3 className="text-[14px] font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1 leading-snug">
                {exp.title}
              </h3>
              <p className="text-[11.5px] text-slate-500 line-clamp-2 leading-relaxed">
                {exp.desc}
              </p>
            </div>
            
            {/* Card footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100/80 mt-auto">
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide"
                style={{ background: diff.bg, border: `1px solid ${diff.border}`, color: diff.color }}
              >
                {exp.difficulty}
              </span>
              <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="flex-shrink-0">
                  <circle cx="6" cy="6" r="4.5" />
                  <path d="M6 3.5v2.5h1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {exp.duration}
              </span>
            </div>
          </div>

          {/* ── Slide-up hover overlay ── */}
          <div className="absolute inset-0 bg-slate-900/98 backdrop-blur-md translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-30 flex flex-col p-5 justify-between text-white">
            <div className="flex flex-col gap-3 min-w-0">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-[9px] font-extrabold tracking-wider uppercase" style={{ color: exp.accent }}>
                  {exp.subject}
                </span>
                <span className="text-[9.5px] font-bold text-slate-400">
                  Class {exp.classLevels.join(", ")}
                </span>
              </div>
              <h4 className="text-[14px] font-black leading-snug text-white">
                {exp.title}
              </h4>
              <p className="text-[11.5px] text-slate-300 leading-relaxed line-clamp-3">
                {exp.details}
              </p>
              {/* Features bullets */}
              <div className="flex flex-wrap gap-1 mt-1">
                {exp.features.slice(0, 3).map((feat) => (
                  <span key={feat} className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/10 text-slate-200 border border-white/5">
                    • {feat}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Glowing CTA Button */}
            <div
              className="w-full text-center py-2.5 rounded-xl text-[11.5px] font-black tracking-wide uppercase transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98]"
              style={{
                backgroundColor: exp.accent,
                boxShadow: `0 4px 12px ${exp.accent}40`,
              }}
            >
              Start Experiment
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-200 group-hover:translate-x-0.5">
                <path d="M4 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
      </Interactive3DCard>
    </motion.div>
  );
}

// ── Main CategoryPage ─────────────────────────────────────────────────────────
export default function CategoryPage({ categoryId }: { categoryId: ChemCategory }) {
  const reduced = useReducedMotion() ?? false;
  const cat     = getCategoryDef(categoryId);

  const [diffFilter, setDiffFilter] = useState<Difficulty | "all">("all");

  const allExperiments = useMemo(
    () => CATALOG.filter((e) => e.category === categoryId),
    [categoryId],
  );

  const filtered = useMemo(
    () =>
      diffFilter === "all"
        ? allExperiments
        : allExperiments.filter((e) => e.difficulty === diffFilter),
    [allExperiments, diffFilter],
  );

  if (!cat) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Navbar />
        <p style={{ color: "var(--lab-text-muted)" }}>Category not found.</p>
      </div>
    );
  }

  const diffCounts = {
    Beginner:     allExperiments.filter((e) => e.difficulty === "Beginner").length,
    Intermediate: allExperiments.filter((e) => e.difficulty === "Intermediate").length,
    Advanced:     allExperiments.filter((e) => e.difficulty === "Advanced").length,
  };

  return (
    <div className="catpage-root">
      <Navbar />

      {/* ── Category hero ── */}
      <section className="catpage-hero" style={{ paddingTop: 64 }}>
        {/* Photo background */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cat.photo}
          alt=""
          aria-hidden="true"
          className="catpage-hero-photo"
        />
        {/* Dark overlay */}
        <div className="catpage-hero-overlay" />
        {/* Accent glow */}
        <div
          className="catpage-hero-glow"
          style={{ background: `radial-gradient(ellipse at 80% 20%, ${cat.color}28 0%, transparent 60%)` }}
        />

        <div className="catpage-hero-content">
          {/* Breadcrumb */}
          <motion.div
            initial={reduced ? false : { opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.38 }}
            style={{ marginBottom: 20 }}
          >
            <Link
              href="/experiments"
              className="catpage-breadcrumb"
              style={{ color: cat.color }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              All Categories
            </Link>
          </motion.div>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          >
            {/* Count badge */}
            <div style={{ marginBottom: 12 }}>
              <span className="catpage-count-badge" style={{ background: `${cat.color}1a`, border: `1px solid ${cat.color}35`, color: cat.color }}>
                <span className="catpage-count-dot" style={{ background: cat.color }} />
                {allExperiments.length} Experiment{allExperiments.length !== 1 ? "s" : ""}
              </span>
            </div>

            <h1 className="catpage-title">{cat.label}</h1>
            <p className="catpage-tagline" style={{ color: cat.color }}>{cat.tagline}</p>
            <p className="catpage-desc">{cat.description}</p>
          </motion.div>
        </div>
      </section>

      {/* ── Sticky filter bar ── */}
      <div className="catpage-filter-bar">
        <div className="catpage-filter-inner">
          <span className="catpage-filter-label">Filter</span>

          {(["all", "Beginner", "Intermediate", "Advanced"] as const).map((d) => {
            const active = diffFilter === d;
            const count  = d === "all" ? allExperiments.length : diffCounts[d as Difficulty] ?? 0;
            const col    = d === "all" ? cat.color : DIFF[d as Difficulty]?.color ?? cat.color;
            return (
              <button
                key={d}
                onClick={() => setDiffFilter(d)}
                className="catpage-filter-btn"
                style={{
                  border:     `1px solid ${active ? col + "45" : "var(--lab-glass-border)"}`,
                  background: active ? `${col}12` : "transparent",
                  color:      active ? col : "var(--lab-text-muted)",
                  fontWeight: active ? 700 : 500,
                }}
              >
                {d === "all" ? "All" : d}
                <span
                  className="catpage-filter-count"
                  style={{
                    background: active ? `${col}1a` : "rgba(0,0,0,0.06)",
                    color:      active ? col : "var(--lab-text-subtle)",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}

          <div style={{ flex: 1 }} />

          {/* Sibling category links */}
          <div className="catpage-sibling-links">
            {CATEGORIES.filter((c) => c.id !== categoryId).map((c) => (
              <Link
                key={c.id}
                href={`/experiments/category/${c.id}`}
                className="catpage-sibling-link"
                style={{ color: `${c.color}90`, borderColor: `${c.color}1a` }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = c.color;
                  el.style.borderColor = `${c.color}38`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = `${c.color}90`;
                  el.style.borderColor = `${c.color}1a`;
                }}
              >
                {c.label.split(" ")[0]}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Experiment grid ── */}
      <main className="catpage-grid-wrapper" aria-label={`${cat.label} experiments`}>
        <AnimatePresence mode="wait">
          {filtered.length > 0 ? (
            <motion.div
              key={diffFilter}
              className="catpage-grid"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.20 }}
            >
              {filtered.map((exp, i) => (
                <ExpCard key={exp.slug} exp={exp} index={i} reduced={reduced} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="catpage-empty"
            >
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--lab-text-muted)" }}>
                No experiments match this filter.
              </p>
              <button
                onClick={() => setDiffFilter("all")}
                style={{ marginTop: 10, fontSize: 12, color: cat.color, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
              >
                Show all
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
