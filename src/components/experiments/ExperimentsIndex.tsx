"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CATALOG, {
  CATEGORIES,
  type ChemCategory,
  type Difficulty,
  type ClassLevel,
  type ExperimentEntry,
} from "@/lib/experiments-catalog";
import Interactive3DCard from "@/components/Interactive3DCard";


// ── Photo map (shared with CategoryPage) ──────────────────────────────────────
const EXPERIMENT_PHOTOS: Record<string, string> = {
  titration: "/images/experiments/titration.png",
  indicator: "/images/experiments/indicator.png",
  neutralization: "/images/experiments/neutralization.png",
  saltAnalysis: "/images/experiments/salt-analysis.png",
  waterHardness: "/images/experiments/water-hardness.png",
  flame: "/images/experiments/flame.png",
  electrolysis: "/images/experiments/electrolysis.png",
  solubility: "/images/experiments/solubility.png",
  redox: "/images/experiments/redox.png",
  kinetics: "/images/experiments/kinetics.png",
  gas: "/images/experiments/gas.png",
  equilibrium: "/images/experiments/equilibrium.png",
  calorimetry: "/images/experiments/calorimetry.png",
  functionalGroups: "/images/experiments/functional-groups.png",
  chromatography: "/images/experiments/chromatography.png",
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

const DIFF_STYLE: Record<Difficulty, { bg: string; color: string; border: string }> = {
  Beginner:     { bg: "rgba(5,150,105,0.14)",  color: "#10b981", border: "rgba(5,150,105,0.30)"  },
  Intermediate: { bg: "rgba(37,99,235,0.14)",  color: "#3b82f6", border: "rgba(37,99,235,0.30)"  },
  Advanced:     { bg: "rgba(124,58,237,0.14)", color: "#8b5cf6", border: "rgba(124,58,237,0.30)" },
};

const CLASS_LEVELS: ClassLevel[] = [6, 7, 8, 9, 10, 11, 12];

// ── Experiment card ───────────────────────────────────────────────────────────
function ExpCard({ exp, index, reduced }: { exp: ExperimentEntry; index: number; reduced: boolean }) {
  const [imgErr, setImgErr] = useState(false);
  const photo  = EXPERIMENT_PHOTOS[exp.iconId];
  const hasImg = !!photo && !imgErr;
  const diff   = DIFF_STYLE[exp.difficulty];

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10px" }}
      transition={{ duration: 0.44, delay: Math.min(index * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
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

// ── Main ExperimentsIndex ─────────────────────────────────────────────────────
export default function ExperimentsIndex() {
  const reduced = useReducedMotion() ?? false;

  const [query,      setQuery]      = useState("");
  const [catFilter,  setCatFilter]  = useState<ChemCategory | "all">("all");
  const [diffFilter, setDiffFilter] = useState<Difficulty | "all">("all");
  const [classFilter, setClassFilter] = useState<ClassLevel | "all">("all");

  const filtered = useMemo(() => {
    let list = CATALOG;
    if (catFilter  !== "all") list = list.filter((e) => e.category  === catFilter);
    if (diffFilter !== "all") list = list.filter((e) => e.difficulty === diffFilter);
    if (classFilter !== "all") list = list.filter((e) => e.classLevels.includes(classFilter as ClassLevel));
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.subject.toLowerCase().includes(q) ||
          e.desc.toLowerCase().includes(q),
      );
    }
    return list;
  }, [catFilter, diffFilter, classFilter, query]);

  const activeCategory = CATEGORIES.find((c) => c.id === catFilter);

  return (
    <div className="expidx-root">
      <Navbar />

      {/* ── Page header ── */}
      <section className="expidx-header">
        <motion.div
          className="expidx-header-inner"
          initial={reduced ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        >
          <span className="expidx-eyebrow">
            <span className="expidx-eyebrow-dot" />
            All Experiments
          </span>
          <h1 className="expidx-headline">
            Experiment{" "}
            <span className="gradient-text-hero">Catalog</span>
          </h1>
          <p className="expidx-sub">
            {CATALOG.length} interactive experiments across {CATEGORIES.length} chemistry domains
          </p>
        </motion.div>
      </section>

      {/* ── Filter controls ── */}
      <div className="expidx-controls">
        <div className="expidx-controls-inner">

          {/* Search */}
          <div className="expidx-search-wrap">
            <svg className="expidx-search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              placeholder="Search experiments…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="expidx-search"
              aria-label="Search experiments"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="expidx-search-clear"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* Category tabs */}
          <div className="expidx-cat-tabs" role="group" aria-label="Filter by category">
            <button
              onClick={() => setCatFilter("all")}
              className="expidx-cat-tab"
              data-active={catFilter === "all"}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCatFilter(c.id)}
                className="expidx-cat-tab"
                data-active={catFilter === c.id}
                style={
                  catFilter === c.id
                    ? { borderColor: `${c.color}40`, background: `${c.color}10`, color: c.color }
                    : undefined
                }
              >
                {c.label.replace(" Chemistry", "").replace("Laboratory ", "")}
              </button>
            ))}
          </div>

          {/* Difficulty + class level row */}
          <div className="expidx-secondary-filters">
            <div className="expidx-filter-group" role="group" aria-label="Filter by difficulty">
              {(["all", "Beginner", "Intermediate", "Advanced"] as const).map((d) => {
                const active = diffFilter === d;
                const col    = d === "all" ? "var(--lab-text-muted)" : DIFF_STYLE[d as Difficulty].color;
                return (
                  <button
                    key={d}
                    onClick={() => setDiffFilter(d)}
                    className="expidx-filter-pill"
                    style={{
                      border:     `1px solid ${active ? (d === "all" ? "var(--lab-glass-border)" : `${col}40`) : "var(--lab-glass-border)"}`,
                      background: active ? (d === "all" ? "var(--lab-glass)" : `${col}12`) : "transparent",
                      color:      active ? col : "var(--lab-text-muted)",
                      fontWeight: active ? 700 : 500,
                    }}
                  >
                    {d === "all" ? "All Levels" : d}
                  </button>
                );
              })}
            </div>

            <div className="expidx-filter-group" role="group" aria-label="Filter by class">
              <button
                onClick={() => setClassFilter("all")}
                className="expidx-filter-pill"
                style={{
                  border:     `1px solid ${classFilter === "all" ? "var(--lab-glass-border)" : "var(--lab-glass-border)"}`,
                  background: classFilter === "all" ? "var(--lab-glass)" : "transparent",
                  color:      classFilter === "all" ? "var(--lab-text-primary)" : "var(--lab-text-muted)",
                  fontWeight: classFilter === "all" ? 700 : 500,
                }}
              >
                All Classes
              </button>
              {CLASS_LEVELS.map((cl) => {
                const active = classFilter === cl;
                return (
                  <button
                    key={cl}
                    onClick={() => setClassFilter(active ? "all" : cl)}
                    className="expidx-filter-pill"
                    style={{
                      border:     `1px solid ${active ? "rgba(37,99,235,0.40)" : "var(--lab-glass-border)"}`,
                      background: active ? "rgba(37,99,235,0.10)" : "transparent",
                      color:      active ? "#3b82f6" : "var(--lab-text-muted)",
                      fontWeight: active ? 700 : 500,
                    }}
                  >
                    Class {cl}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <main className="expidx-results" aria-label="Experiment results">
        <div className="expidx-results-inner">
          {/* Result meta row */}
          <div className="expidx-result-meta">
            <span className="expidx-result-count">
              {filtered.length} experiment{filtered.length !== 1 ? "s" : ""}
              {catFilter !== "all" && activeCategory && (
                <> in <span style={{ color: activeCategory.color }}>{activeCategory.label}</span></>
              )}
            </span>
            {(catFilter !== "all" || diffFilter !== "all" || classFilter !== "all" || query) && (
              <button
                onClick={() => {
                  setCatFilter("all");
                  setDiffFilter("all");
                  setClassFilter("all");
                  setQuery("");
                }}
                className="expidx-clear-filters"
              >
                Clear all filters
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {filtered.length > 0 ? (
              <motion.div
                key={`${catFilter}-${diffFilter}-${classFilter}-${query}`}
                className="expidx-grid"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
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
                className="expidx-empty"
              >
                <div className="expidx-empty-icon" aria-hidden="true">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M12 4h8M12 4v9L4 22h24L20 13V4" stroke="var(--lab-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="expidx-empty-text">No experiments match these filters.</p>
                <button
                  onClick={() => { setCatFilter("all"); setDiffFilter("all"); setClassFilter("all"); setQuery(""); }}
                  className="expidx-empty-reset"
                >
                  Reset filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ── Browse by category shortcut ── */}
      <section className="expidx-categories-strip">
        <div className="expidx-categories-strip-inner">
          <h2 className="expidx-categories-strip-title">Browse by Discipline</h2>
          <div className="expidx-categories-strip-grid">
            {CATEGORIES.map((cat) => {
              const count = CATALOG.filter((e) => e.category === cat.id).length;
              return (
                <Link
                  key={cat.id}
                  href={`/experiments/category/${cat.id}`}
                  className="expidx-cat-card"
                  style={{ borderColor: `${cat.color}20` }}
                >
                  <div
                    className="expidx-cat-card-bar"
                    style={{ background: cat.color }}
                  />
                  <div className="expidx-cat-card-body">
                    <span className="expidx-cat-card-label" style={{ color: cat.color }}>
                      {cat.label}
                    </span>
                    <span className="expidx-cat-card-tagline">{cat.tagline}</span>
                    <span className="expidx-cat-card-count">
                      {count} experiment{count !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <svg
                    className="expidx-cat-card-arrow"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    style={{ color: cat.color }}
                    aria-hidden="true"
                  >
                    <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
