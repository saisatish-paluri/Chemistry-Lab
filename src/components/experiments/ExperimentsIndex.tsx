"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CATALOG, { type ExperimentEntry, type Difficulty } from "@/lib/experiments-catalog";

// ── Verified Wikimedia Commons photo mapping per experiment iconId ──────────────
// Each experiment gets a distinct, relevant chemistry photo as its card image.
// All photos are from Wikimedia Commons (CC-licensed) and verified to match the
// specific experiment. onError fallback silently drops the photo → SVG illustration.
const EXPERIMENT_PHOTOS: Record<string, string> = {
  // Acid-Base Titration — orange/pink endpoint colour in a conical flask
  titration:    "https://upload.wikimedia.org/wikipedia/commons/8/8a/The_orange_colour_in_a_titration_conical_flask.jpg",
  // Flame Test — composite showing coloured flames from different metal salts
  flame:        "https://upload.wikimedia.org/wikipedia/commons/d/d9/Coloured_flames_of_methanol_solutions_of_metal_salts_and_compounds.jpg",
  // Electrolysis — electrode apparatus with solution in U-tube cell
  electrolysis: "https://upload.wikimedia.org/wikipedia/commons/d/d1/Electrolysis_Apparatus.png",
  // Gas Collection — inverted cylinder collecting gas by water displacement
  gasCollect:   "https://upload.wikimedia.org/wikipedia/commons/9/9a/Gas_Collection_with_Water_Displacement_Possible_Acetylene.jpg",
  // Solubility & Precipitation — vivid blue copper sulfate ionic solution
  solubility:   "https://upload.wikimedia.org/wikipedia/commons/2/22/CopperSulphate.JPG",
  // Redox Displacement — zinc strip in blue copper sulfate, visible colour change
  redox:        "https://upload.wikimedia.org/wikipedia/commons/8/86/Zinc_and_copper_sulfate.JPG",
  // Separation Techniques — paper chromatography strip with separated colour bands
  separation:   "https://upload.wikimedia.org/wikipedia/commons/e/e4/Paper_chromatography_in_progress.jpg",
  // Reaction Kinetics — acid dissolving metal, effervescent bubbles visible in flask
  kinetics:     "https://upload.wikimedia.org/wikipedia/commons/b/b8/Magnesium_ribbon_reacting_with_dilute_sulfuric_acid.jpg",
  // Gas Laws — piston-cylinder apparatus illustrating Boyle's / gas pressure
  gas:          "https://upload.wikimedia.org/wikipedia/commons/5/51/Gax_expanding_doing_work_on_a_piston_in_a_cylinder.jpg",
  // Chemical Equilibrium — red-orange aqueous iron(III) thiocyanate complex
  equilibrium:  "https://upload.wikimedia.org/wikipedia/commons/f/f6/Aqueous_ferric_thiocyanate_%28Fe%28SCN%29n%29_hydrate_mix.jpg",
  // Calorimetry — coffee-cup (polystyrene) calorimeter setup with thermometer
  calorimetry:  "https://upload.wikimedia.org/wikipedia/commons/3/32/Coffee_cup_calorimeter_pic.jpg",
  // Density — layered density column showing liquids ordered by density
  density:      "https://upload.wikimedia.org/wikipedia/commons/2/25/Density_column.JPG",
  // Filtration — active filtration through funnel and filter paper with stirring rod
  filtration:   "https://upload.wikimedia.org/wikipedia/commons/2/2a/Cold_Filtration_%28with_stirring_rod%29.jpg",
  // Dissolving Rate — large sucrose crystals showing solubility / crystal structure
  dissolving:   "https://upload.wikimedia.org/wikipedia/commons/f/f1/Sucrose_crystals.JPG",
  // Indicator Test — blue and red litmus paper strips showing pH colour change
  indicator:    "https://upload.wikimedia.org/wikipedia/commons/e/e6/Blue_and_red_litmus_paper.JPG",
  // Neutralization — NaOH pellets, reactant of the neutralisation reaction
  neutralization: "https://upload.wikimedia.org/wikipedia/commons/5/55/NaOH_pellets.jpg",
  // Salt Analysis — test tubes with coloured precipitates for cation/anion tests
  saltAnalysis:  "https://upload.wikimedia.org/wikipedia/commons/4/4e/Qualitative_analysis_salts.jpg",
  // Water Hardness — conical flask with blue EBT endpoint after EDTA titration
  waterHardness: "https://upload.wikimedia.org/wikipedia/commons/3/3c/EDTA_titration.jpg",
  // Functional Groups — Tollen's silver mirror test showing aldehyde reaction
  functionalGroups: "https://upload.wikimedia.org/wikipedia/commons/6/67/Tollens%27_test_result.jpg",
  // Chromatography — TLC plate showing separated dye bands with distinct Rf values
  chromatography: "https://upload.wikimedia.org/wikipedia/commons/1/12/TLC_plate_small_bw.jpg",
};

// Object-position overrides for images where default "center" crops badly
const PHOTO_POSITION: Record<string, string> = {
  density: "center top",    // tall vertical image — show coloured top layers
  flame:   "center center",
};

// ── Experiment card photo — real lab photo at high opacity; SVG shown only on error ──
// When the photo loads it IS the visual. The SVG is the fallback for errors/missing photos.
function ExperimentCardPhoto({
  iconId, accent, onError, hasError,
}: {
  iconId: string; accent: string; onError: () => void; hasError: boolean;
}) {
  const photoUrl = EXPERIMENT_PHOTOS[iconId];
  const showPhoto = photoUrl && !hasError;

  return (
    <>
      {/* Primary: real lab photo */}
      {showPhoto && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          onError={onError}
          style={{
            position:       "absolute",
            inset:          0,
            width:          "100%",
            height:         "100%",
            objectFit:      "cover",
            objectPosition: PHOTO_POSITION[iconId] ?? "center",
            opacity:        0.82,
            transition:     "transform 0.45s cubic-bezier(0.22,1,0.36,1)",
          }}
          className="group-hover:scale-[1.06]"
        />
      )}

      {/* Fallback: SVG illustration shown only when photo is absent / failed */}
      {!showPhoto && (
        <div style={{
          position:       "relative",
          zIndex:         2,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          width:          "100%",
          height:         "100%",
        }}>
          <ApparatusIllustration iconId={iconId} accent={accent} />
        </div>
      )}
    </>
  );
}

// ── Difficulty palette ─────────────────────────────────────────────────────────
const DIFF_STYLE: Record<Difficulty, { bg: string; color: string; border: string }> = {
  Beginner:     { bg: "rgba(5,150,105,0.07)",   color: "#059669", border: "rgba(5,150,105,0.20)"   },
  Intermediate: { bg: "rgba(37,99,235,0.07)",   color: "#2563eb", border: "rgba(37,99,235,0.20)"   },
  Advanced:     { bg: "rgba(124,58,237,0.07)",  color: "#7c3aed", border: "rgba(124,58,237,0.20)"  },
};

// ── View modes ─────────────────────────────────────────────────────────────────
type ViewMode = "difficulty" | "class";

// ── Difficulty groups ──────────────────────────────────────────────────────────
const DIFFICULTY_GROUPS: { tier: Difficulty; blurb: string }[] = [
  {
    tier:  "Beginner",
    blurb: "Build core skills. Observe reactions, learn separation, and identify acids and bases — ideal for Class 6–10.",
  },
  {
    tier:  "Intermediate",
    blurb: "Explore multi-step processes. Set up circuits, observe ionic reactions, and apply classical techniques — Class 9–11.",
  },
  {
    tier:  "Advanced",
    blurb: "Apply quantitative analysis, multi-variable investigation, and thermochemical measurement — Class 11–12.",
  },
];

// ── Class groups ───────────────────────────────────────────────────────────────
// Each experiment is shown ONCE — in the group whose level range contains the
// experiment's minimum classLevel. This prevents experiments from appearing in
// multiple sections and keeps each group to a manageable, scannable count.
const CLASS_GROUPS: { range: string; levels: number[]; color: string; label: string }[] = [
  { range: "6–7",   levels: [6, 7],       color: "#059669", label: "Foundation"      },
  { range: "8–9",   levels: [8, 9],       color: "#2563eb", label: "Secondary"       },
  { range: "10",    levels: [10],         color: "#7c3aed", label: "Class 10"        },
  { range: "11–12", levels: [11, 12],     color: "#ef4444", label: "Senior Secondary" },
];

// ── Animation variants ─────────────────────────────────────────────────────────
const cardVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.40, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

// ── Main component ─────────────────────────────────────────────────────────────
export default function ExperimentsIndex() {
  const [viewMode, setViewMode] = useState<ViewMode>("class");

  const totalNew = CATALOG.filter((e) => e.isNew).length;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--lab-off-white)" }}>
      <Navbar />

      {/* ── Hero ── */}
      <section
        aria-label="Experiments overview"
        className="exp-hero-v2"
        style={{
          paddingTop:    "calc(64px + 2.5rem)",
          paddingBottom: "3rem",
          paddingLeft:   "clamp(16px, 4vw, 40px)",
          paddingRight:  "clamp(16px, 4vw, 40px)",
        }}
      >
        {/* Dot grid overlay */}
        <div
          aria-hidden="true"
          style={{
            position:        "absolute",
            inset:           0,
            backgroundImage: "radial-gradient(circle, rgba(37,99,235,0.06) 1px, transparent 1px)",
            backgroundSize:  "28px 28px",
            pointerEvents:   "none",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: "relative", maxWidth: "700px", margin: "0 auto", textAlign: "center" }}
        >
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 mb-5"
            style={{
              background:    "rgba(37,99,235,0.07)",
              borderColor:   "rgba(37,99,235,0.18)",
              color:         "var(--lab-blue-600)",
              fontSize:      "11px",
              fontWeight:    700,
              textTransform: "uppercase",
              letterSpacing: "0.10em",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full live-dot" style={{ background: "var(--lab-blue-600)", boxShadow: "0 0 6px rgba(37,99,235,0.6)" }} />
            Virtual Laboratory
            <span style={{ padding: "1px 8px", borderRadius: "100px", background: "rgba(37,99,235,0.12)", fontSize: "10px" }}>
              {CATALOG.length} Experiments
            </span>
            {totalNew > 0 && (
              <span style={{ padding: "1px 8px", borderRadius: "100px", background: "rgba(5,150,105,0.12)", fontSize: "10px", color: "#059669", border: "1px solid rgba(5,150,105,0.22)" }}>
                {totalNew} NEW
              </span>
            )}
          </div>

          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.025em", color: "var(--lab-text-primary)", marginBottom: "1rem" }}>
            Choose Your{" "}
            <span className="gradient-text-hero">Experiment</span>
          </h1>

          <p style={{ fontSize: "clamp(0.9rem, 2vw, 1.0625rem)", lineHeight: 1.72, color: "var(--lab-text-muted)", maxWidth: "540px", margin: "0 auto 1.75rem" }}>
            Every experiment includes guided steps, live simulation, and a scored assessment. Browse by class level or difficulty.
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-5 flex-wrap" style={{ fontSize: "12px", color: "var(--lab-text-muted)" }}>
            {[
              { value: `${CATALOG.length}`, label: "Lab simulations" },
              { value: "3",   label: "Difficulty levels" },
              { value: "6–12", label: "Class levels" },
              { value: "100%", label: "Browser-based" },
            ].map(({ value, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="font-bold" style={{ fontSize: "18px", color: "var(--lab-text-primary)" }}>{value}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── View toggle ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.38 }}
          className="flex items-center justify-center gap-2 flex-wrap"
          style={{ position: "relative", marginTop: "2rem" }}
        >
          {(["class", "difficulty"] as ViewMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className="px-4 py-1.5 rounded-full text-[12px] font-semibold border transition-all duration-150"
              style={{
                background:  viewMode === m ? "rgba(37,99,235,0.10)" : "rgba(255,255,255,0.80)",
                borderColor: viewMode === m ? "rgba(37,99,235,0.30)" : "var(--lab-glass-border)",
                color:       viewMode === m ? "var(--lab-blue-600)" : "var(--lab-text-muted)",
              }}
            >
              {m === "class" ? "Browse by Class" : "Browse by Difficulty"}
            </button>
          ))}
        </motion.div>
      </section>

      {/* ── Experiment listings ── */}
      <section
        aria-label="All experiments"
        style={{ flex: 1, padding: "clamp(2rem, 5vw, 4rem) clamp(16px, 4vw, 40px)" }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          {viewMode === "class" ? (
            <ClassView />
          ) : (
            <DifficultyView />
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

// ── Class View ────────────────────────────────────────────────────────────────
function ClassView() {
  let globalIdx = 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4rem" }}>
      {CLASS_GROUPS.map(({ range, levels, color, label }) => {
        // Show each experiment exactly once — in the group that contains its
        // minimum class level.  Prevents duplication across sections.
        const experiments = CATALOG.filter((e) => {
          const minLevel = Math.min(...e.classLevels);
          return levels.includes(minLevel);
        });
        if (experiments.length === 0) return null;
        const colClass = experiments.length <= 3 ? "exp-grid-3" : "exp-grid-4";
        return (
          <div key={range}>
            {/* Section header */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.38, ease: "easeOut" }}
              style={{ marginBottom: "1.75rem" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "0.75rem" }}>
                <span
                  className="diff-group-v2"
                  style={{
                    background:  `${color}10`,
                    color,
                    border:      `1px solid ${color}30`,
                  }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  Class {range}
                </span>
                <span style={{ fontSize: "11px", fontWeight: 600, color, flexShrink: 0, background: `${color}08`, padding: "2px 10px", borderRadius: "100px", border: `1px solid ${color}22` }}>
                  {label}
                </span>
                <div style={{ flex: 1, height: "1px", background: `${color}25` }} />
                <span style={{ fontSize: "12px", fontWeight: 600, color: `${color}cc`, flexShrink: 0 }}>
                  {experiments.length} experiment{experiments.length > 1 ? "s" : ""}
                </span>
              </div>
            </motion.div>

            {/* Cards */}
            <div className={colClass}>
              {experiments.map((exp) => {
                const idx = globalIdx++;
                return (
                  <motion.div
                    key={exp.href}
                    custom={idx}
                    variants={cardVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-28px" }}
                    style={{ height: "100%" }}
                  >
                    <ExperimentCard exp={exp} />
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Difficulty View ────────────────────────────────────────────────────────────
function DifficultyView() {
  let globalIdx = 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4.5rem" }}>
      {DIFFICULTY_GROUPS.map(({ tier, blurb }) => {
        const items = CATALOG.filter((e) => e.difficulty === tier);
        const ds    = DIFF_STYLE[tier];
        const colClass = items.length <= 3 ? "exp-grid-3" : "exp-grid-4";
        return (
          <div key={tier}>
            {/* Section header */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.38, ease: "easeOut" }}
              style={{ marginBottom: "1.75rem" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "0.85rem" }}>
                <span
                  className="diff-group-v2"
                  style={{ background: ds.bg, color: ds.color, border: `1px solid ${ds.border}` }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: ds.color }} />
                  {tier}
                </span>
                <div style={{ flex: 1, height: "1px", background: ds.border }} />
                <span style={{ fontSize: "12px", fontWeight: 600, color: ds.color, flexShrink: 0 }}>
                  {items.length} experiment{items.length > 1 ? "s" : ""}
                </span>
              </div>
              <p style={{ fontSize: "13.5px", color: "var(--lab-text-muted)", lineHeight: 1.68, maxWidth: "700px" }}>
                {blurb}
              </p>
            </motion.div>

            {/* Cards */}
            <div className={colClass}>
              {items.map((exp) => {
                const idx = globalIdx++;
                return (
                  <motion.div
                    key={exp.href}
                    custom={idx}
                    variants={cardVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-28px" }}
                    style={{ height: "100%" }}
                  >
                    <ExperimentCard exp={exp} />
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Experiment card ────────────────────────────────────────────────────────────
function ExperimentCard({ exp }: { exp: ExperimentEntry }) {
  const diff = DIFF_STYLE[exp.difficulty];
  const [photoError, setPhotoError] = useState(false);
  const hasPhoto = !!(EXPERIMENT_PHOTOS[exp.iconId] && !photoError);

  return (
    <Link
      href={exp.href}
      prefetch={true}
      aria-label={`Open ${exp.title} experiment`}
      className="group"
      style={{
        display:        "flex",
        flexDirection:  "column",
        height:         "100%",
        borderRadius:   "22px",
        border:         "1px solid rgba(148,163,184,0.18)",
        background:     "rgba(255,255,255,0.97)",
        boxShadow:
          "0 4px 20px rgba(15,23,42,0.07), 0 1px 4px rgba(15,23,42,0.04), 0 0 0 1px rgba(255,255,255,0.9) inset",
        overflow:       "hidden",
        textDecoration: "none",
        transition:     "transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s ease, border-color 0.25s ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform   = "translateY(-6px) scale(1.015)";
        el.style.boxShadow   = `0 24px 56px rgba(15,23,42,0.12), 0 4px 16px rgba(15,23,42,0.06), 0 0 0 1.5px ${exp.accent}45`;
        el.style.borderColor = `${exp.accent}40`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform   = "translateY(0) scale(1)";
        el.style.boxShadow   = "0 4px 20px rgba(15,23,42,0.07), 0 1px 4px rgba(15,23,42,0.04), 0 0 0 1px rgba(255,255,255,0.9) inset";
        el.style.borderColor = "rgba(148,163,184,0.18)";
      }}
    >
      {/* ── Card image header ── */}
      <div
        style={{
          position:     "relative",
          height:       "178px",
          flexShrink:   0,
          overflow:     "hidden",
          // Dark background for photo mode (photo fills it at ~82% opacity)
          // Light gradient for SVG-fallback mode
          background:   hasPhoto
            ? "linear-gradient(160deg, #0a0f1a 0%, #111827 100%)"
            : `radial-gradient(ellipse at 55% 20%, ${exp.accent}20 0%, transparent 65%),
               linear-gradient(158deg, rgba(241,245,249,0.98) 0%, rgba(248,250,252,0.96) 100%)`,
          borderBottom: `1px solid ${exp.accent}1a`,
        }}
      >
        {/* Dot grid — subtle on dark, or accent-tinted on light */}
        <div aria-hidden="true" style={{
          position:        "absolute",
          inset:           0,
          backgroundImage: hasPhoto
            ? "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)"
            : `radial-gradient(circle, ${exp.accent}11 1px, transparent 1px)`,
          backgroundSize:  "20px 20px",
          pointerEvents:   "none",
          zIndex:          1,
        }} />

        {/* Ambient glow — only shown in SVG fallback mode */}
        {!hasPhoto && (
          <div aria-hidden="true" style={{
            position:      "absolute",
            top:           0,
            left:          "50%",
            transform:     "translateX(-50%)",
            width:         "220px",
            height:        "120px",
            background:    `radial-gradient(ellipse at center, ${exp.accent}1c 0%, transparent 70%)`,
            pointerEvents: "none",
            filter:        "blur(28px)",
            zIndex:        1,
          }} />
        )}

        {/* Photo (primary) or SVG (fallback) */}
        <div aria-hidden="true" style={{
          position:       "absolute",
          inset:          0,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          color:          exp.accent,
          zIndex:         2,
        }}>
          <ExperimentCardPhoto
            iconId={exp.iconId}
            accent={exp.accent}
            onError={() => setPhotoError(true)}
            hasError={photoError}
          />
        </div>

        {/* Dark vignette for photo mode — adds depth and readability */}
        {hasPhoto && (
          <div aria-hidden="true" style={{
            position:      "absolute",
            inset:         0,
            background:    "linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.45) 100%)",
            zIndex:        3,
            pointerEvents: "none",
          }} />
        )}

        {/* Bottom tint for SVG mode */}
        {!hasPhoto && (
          <div aria-hidden="true" style={{
            position:      "absolute",
            bottom:        0, left: 0, right: 0,
            height:        "32px",
            background:    `linear-gradient(180deg, transparent, ${exp.accent}0d)`,
            borderTop:     `1px solid ${exp.accent}12`,
            zIndex:        3,
            pointerEvents: "none",
          }} />
        )}

        {/* Subject tag (top-left) — white text over photo, accent over SVG */}
        <div style={{
          position:      "absolute",
          top:           10,
          left:          12,
          display:       "flex",
          alignItems:    "center",
          gap:           5,
          fontSize:      "9px",
          fontWeight:    700,
          color:         hasPhoto ? "rgba(255,255,255,0.92)" : exp.accent,
          textTransform: "uppercase",
          letterSpacing: "0.10em",
          opacity:       0.90,
          zIndex:        4,
        }}>
          <span style={{
            width:     5,
            height:    5,
            borderRadius: "50%",
            background:   hasPhoto ? "rgba(255,255,255,0.85)" : exp.accent,
            boxShadow:    hasPhoto
              ? "0 0 5px rgba(255,255,255,0.50)"
              : `0 0 5px ${exp.accent}60`,
          }} />
          {exp.subject ?? "Chemistry"}
        </div>

        {/* NEW badge */}
        {exp.isNew && (
          <div style={{
            position:      "absolute",
            top:           8,
            right:         10,
            fontSize:      "9px",
            fontWeight:    800,
            padding:       "2px 9px",
            borderRadius:  "100px",
            background:    "rgba(5,150,105,0.15)",
            color:         "#4ade80",
            border:        "1px solid rgba(74,222,128,0.35)",
            textTransform: "uppercase",
            letterSpacing: "0.10em",
            backdropFilter:"blur(8px)",
            zIndex:        4,
          }}>
            NEW
          </div>
        )}

        {/* Duration badge (bottom-right) */}
        <div style={{
          position:      "absolute",
          bottom:        10,
          right:         12,
          fontSize:      "10px",
          fontWeight:    700,
          padding:       "3px 10px",
          borderRadius:  "100px",
          background:    hasPhoto ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.88)",
          border:        hasPhoto
            ? "1px solid rgba(255,255,255,0.18)"
            : `1px solid ${exp.accent}30`,
          color:         hasPhoto ? "rgba(255,255,255,0.95)" : exp.accent,
          backdropFilter:"blur(10px)",
          boxShadow:     hasPhoto
            ? "0 2px 8px rgba(0,0,0,0.30)"
            : `0 2px 8px rgba(15,23,42,0.08), 0 0 0 1px rgba(255,255,255,0.70) inset`,
          zIndex:        4,
        }}>
          {exp.duration}
        </div>
      </div>

      {/* ── Content body ── */}
      <div style={{ padding: "1.125rem 1.25rem 1.25rem", display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Title + difficulty */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "0.5rem" }}>
          <h2
            className="exp-card-title"
            style={{ fontSize: "15px", fontWeight: 800, lineHeight: 1.22, color: "var(--lab-text-primary)", flex: 1, letterSpacing: "-0.02em" }}
          >
            {exp.title}
          </h2>
          <span
            style={{ fontSize: "9.5px", fontWeight: 700, padding: "3px 9px", borderRadius: "100px", border: `1px solid ${diff.border}`, background: diff.bg, color: diff.color, flexShrink: 0, marginTop: "2px", whiteSpace: "nowrap" }}
          >
            {exp.difficulty}
          </span>
        </div>

        {/* Class + subject row */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: "0.6rem" }}>
          <span style={{ fontSize: "9.5px", fontWeight: 700, padding: "2px 9px", borderRadius: "100px", background: `${exp.accent}0d`, border: `1px solid ${exp.accent}22`, color: exp.accent }}>
            Class {exp.classLevels.join(", ")}
          </span>
        </div>

        {/* Short desc */}
        <p style={{ fontSize: "12.5px", lineHeight: 1.65, color: "var(--lab-text-muted)", marginBottom: "0.7rem", flex: 1 }}>
          {exp.desc}
        </p>

        {/* Feature chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "0.875rem" }}>
          {exp.features.slice(0, 3).map((f) => (
            <span key={f} style={{
              fontSize: "10px", fontWeight: 600, padding: "2px 9px", borderRadius: "100px",
              background: `${exp.accent}0e`, border: `1px solid ${exp.accent}28`, color: exp.accent,
              whiteSpace: "nowrap",
            }}>
              {f}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: `linear-gradient(90deg, transparent, ${exp.accent}30, transparent)`, marginBottom: "0.75rem" }} />

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: 700, color: exp.accent }}>
            Enter Lab
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true" className="group-hover:translate-x-1" style={{ transition: "transform 0.2s ease" }}>
              <path d="M2.5 6.5h8M7.5 4l3 2.5-3 2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: `linear-gradient(135deg, ${exp.accent}15, ${exp.accent}25)`,
            border: `1px solid ${exp.accent}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "transform 0.2s ease",
          }} className="group-hover:scale-110">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M6 2v8M2 6h8" stroke={exp.accent} strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Full-width apparatus illustration ─────────────────────────────────────────
function ApparatusIllustration({ iconId, accent }: { iconId: string; accent: string }) {
  const a = accent;
  switch (iconId) {
    case "titration":
      return (
        <svg width="160" height="130" viewBox="0 0 160 130" fill="none" aria-hidden="true">
          {/* Retort stand */}
          <rect x="20" y="110" width="72" height="8" rx="3" fill={`${a}30`} stroke={`${a}60`} strokeWidth="1"/>
          <rect x="24" y="22" width="5" height="90" rx="2" fill={`${a}25`} stroke={`${a}50`} strokeWidth="0.8"/>
          <rect x="29" y="28" width="34" height="5" rx="2" fill={`${a}25`} stroke={`${a}50`} strokeWidth="0.8"/>
          {/* Burette */}
          <rect x="57" y="14" width="12" height="70" rx="2" fill={`${a}18`} stroke={a} strokeWidth="1.4"/>
          <rect x="58.5" y="15" width="4" height="55" fill={`${a}35`} rx="1"/>
          <rect x="52" y="82" width="22" height="6" rx="3" fill={a} opacity="0.7"/>
          <rect x="62" y="88" width="3" height="10" rx="1" fill={`${a}70`}/>
          {/* Graduation marks */}
          {[0, 0.3, 0.6, 1].map((t, i) => (
            <line key={i} x1="69" y1={15 + t * 55} x2={73 + (i % 2 === 0 ? 5 : 3)} y2={15 + t * 55} stroke={`${a}80`} strokeWidth="0.8"/>
          ))}
          {/* Clamp */}
          <rect x="26" y="26" width="32" height="8" rx="3" fill={`${a}20`} stroke={`${a}40`} strokeWidth="0.8"/>
          {/* Flask */}
          <path d="M42 100 L42 112 Q28 120 20 125 L100 125 Q92 120 78 112 L78 100Z"
            fill={`${a}20`} stroke={a} strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M42 100 L78 100" stroke={a} strokeWidth="1.5" strokeLinecap="round"/>
          {/* Liquid in flask */}
          <path d="M28 119 Q60 114 92 119 L100 125 L20 125Z" fill={`${a}35`}/>
          {/* Drop */}
          <ellipse cx="63.5" cy="97" rx="1.8" ry="2.5" fill={`${a}90`}/>
          {/* pH meter */}
          <rect x="104" y="85" width="36" height="28" rx="6" fill="rgba(255,255,255,0.92)" stroke={`${a}30`} strokeWidth="1"/>
          <text x="122" y="101" fontSize="11" fontWeight="800" fill={a} textAnchor="middle">pH</text>
          <text x="122" y="108" fontSize="8" fill={`${a}90`} textAnchor="middle" fontFamily="monospace">7.00</text>
        </svg>
      );
    case "flame":
      return (
        <svg width="160" height="130" viewBox="0 0 160 130" fill="none" aria-hidden="true">
          {/* Bunsen burner base */}
          <rect x="62" y="110" width="36" height="8" rx="3" fill={`${a}30`} stroke={`${a}60`} strokeWidth="1"/>
          <rect x="70" y="80" width="20" height="30" rx="4" fill={`${a}20`} stroke={`${a}50`} strokeWidth="1.2"/>
          <rect x="74" y="75" width="12" height="8" rx="2" fill={`${a}30`} stroke={`${a}60`} strokeWidth="1"/>
          {/* Flame */}
          <path d="M80 72 C72 62 68 50 72 40 C74 36 78 44 80 40 C80 40 82 30 85 26 C87 34 84 44 88 44 C90 38 88 30 88 30 C96 38 94 54 88 66 C86 70 84 72 80 72Z"
            fill={`${a}50`} stroke={a} strokeWidth="1.2" strokeLinejoin="round"/>
          <path d="M80 70 C74 62 72 52 75 44 C77 50 80 46 80 42 C82 50 83 60 80 70Z"
            fill={`${a}80`} opacity="0.6"/>
          {/* Nichrome loop on wire */}
          <line x1="38" y1="52" x2="72" y2="52" stroke={`${a}60`} strokeWidth="1.8" strokeLinecap="round"/>
          <circle cx="36" cy="52" r="5" fill="none" stroke={a} strokeWidth="1.8"/>
          <circle cx="36" cy="52" r="2.5" fill={`${a}40`}/>
          {/* Sample bead glow in flame */}
          <circle cx="80" cy="52" r="4" fill={`${a}60`} stroke={a} strokeWidth="1"/>
          {/* Spectral lines in background */}
          {[100, 112, 124, 136].map((x, i) => (
            <rect key={i} x={x} y="35" width="3" height="60" rx="1.5" fill={a} opacity={0.12 + i * 0.04}/>
          ))}
          <text x="118" y="112" fontSize="9" fill={`${a}80`} textAnchor="middle" fontWeight="600">EMISSION SPECTRUM</text>
        </svg>
      );
    case "electrolysis":
      return (
        <svg width="160" height="130" viewBox="0 0 160 130" fill="none" aria-hidden="true">
          {/* Tank */}
          <rect x="18" y="55" width="124" height="58" rx="8" fill={`${a}12`} stroke={a} strokeWidth="1.5"/>
          {/* Liquid */}
          <rect x="19" y="70" width="122" height="42" rx="0" fill={`${a}18`} clipPath="url(#et-clip)"/>
          <clipPath id="et-clip"><rect x="18" y="55" width="124" height="58" rx="8"/></clipPath>
          {/* Electrodes */}
          <rect x="50" y="42" width="10" height="60" rx="2" fill={`${a}30`} stroke={a} strokeWidth="1.4"/>
          <rect x="100" y="42" width="10" height="60" rx="2" fill={`${a}50`} stroke={a} strokeWidth="1.4"/>
          {/* Wires */}
          <path d="M55 42 L55 22 L80 22 L80 10" stroke={a} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 2"/>
          <path d="M105 42 L105 22 L80 22" stroke={`${a}80`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 2"/>
          {/* Power source symbol */}
          <circle cx="80" cy="9" r="7" fill="rgba(255,255,255,0.9)" stroke={a} strokeWidth="1.2"/>
          <text x="80" y="13" fontSize="9" fontWeight="800" fill={a} textAnchor="middle">+−</text>
          {/* Bubbles at cathode */}
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={55 + i * 3} cy={75 - i * 8} r={1.5 + i * 0.5} fill="none" stroke={`${a}80`} strokeWidth="0.8"/>
          ))}
          {/* Bubbles at anode */}
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={105 - i * 3} cy={80 - i * 9} r={1.2 + i * 0.4} fill="none" stroke={`${a}60`} strokeWidth="0.8"/>
          ))}
          <text x="55" y="126" fontSize="8" fill={`${a}80`} textAnchor="middle">Cathode</text>
          <text x="105" y="126" fontSize="8" fill={`${a}80`} textAnchor="middle">Anode</text>
        </svg>
      );
    case "solubility":
      return (
        <svg width="160" height="130" viewBox="0 0 160 130" fill="none" aria-hidden="true">
          {/* Beaker A */}
          <rect x="14" y="45" width="52" height="68" rx="5" fill={`${a}12`} stroke={a} strokeWidth="1.4"/>
          <path d="M14 72 Q40 65 66 72" stroke={a} strokeWidth="1.2" strokeLinecap="round"/>
          <ellipse cx="40" cy="88" rx="14" ry="4" fill={`${a}22`}/>
          <text x="40" y="30" fontSize="9" fill={`${a}99`} textAnchor="middle" fontWeight="600">Clear</text>
          {/* Arrow */}
          <path d="M72 78 L88 78 M83 73 L88 78 L83 83" stroke={a} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          {/* Beaker B — precipitate */}
          <rect x="94" y="45" width="52" height="68" rx="5" fill={`${a}15`} stroke={a} strokeWidth="1.4"/>
          <path d="M94 72 Q120 65 146 72" stroke={a} strokeWidth="1.2" strokeLinecap="round"/>
          {/* Precipitate layer */}
          <rect x="95" y="98" width="50" height="14" rx="0" fill={`${a}38`} clipPath="url(#sol-clip)"/>
          <clipPath id="sol-clip"><rect x="94" y="45" width="52" height="68" rx="5"/></clipPath>
          <text x="120" y="30" fontSize="9" fill={`${a}99`} textAnchor="middle" fontWeight="600">Precipitate</text>
          {/* Particle dots */}
          {[100, 110, 120, 130, 140].map((x) => (
            <circle key={x} cx={x} cy={108} r="1.8" fill={a} opacity="0.5"/>
          ))}
        </svg>
      );
    case "gasCollect":
      return (
        <svg width="160" height="130" viewBox="0 0 160 130" fill="none" aria-hidden="true">
          {/* Round-bottom flask with gas */}
          <path d="M55 60 L55 70 Q28 85 26 108 Q26 122 55 122 L95 122 Q124 122 124 108 Q122 85 95 70 L95 60Z"
            fill={`${a}14`} stroke={a} strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M55 60 L95 60" stroke={a} strokeWidth="1.5"/>
          {/* Tube */}
          <path d="M75 60 L75 30 Q75 20 90 20 L120 20" stroke={a} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          {/* Inverted test tube with gas */}
          <path d="M120 20 L120 70 Q120 78 128 78 Q136 78 136 70 L136 20Z"
            fill="rgba(255,255,255,0.7)" stroke={a} strokeWidth="1.4" strokeLinejoin="round"/>
          {/* Gas bubbles in tube */}
          {[30, 42, 55].map((y) => (
            <circle key={y} cx="128" cy={y} r="3.5" fill={`${a}30`} stroke={`${a}60`} strokeWidth="0.7"/>
          ))}
          {/* Water level in tube */}
          <rect x="121" y="60" width="14" height="18" fill={`${a}20`} clipPath="url(#gc-clip)"/>
          <clipPath id="gc-clip"><path d="M120 20 L120 70 Q120 78 128 78 Q136 78 136 70 L136 20Z"/></clipPath>
          {/* Gas label */}
          <text x="128" y="42" fontSize="9" fill={a} textAnchor="middle" fontWeight="700">CO₂</text>
          {/* Water trough */}
          <rect x="108" y="78" width="48" height="30" rx="4" fill={`${a}10`} stroke={`${a}30`} strokeWidth="1"/>
          <rect x="109" y="88" width="46" height="19" rx="0" fill={`${a}18`} clipPath="url(#gc-trough)"/>
          <clipPath id="gc-trough"><rect x="108" y="78" width="48" height="30" rx="4"/></clipPath>
        </svg>
      );
    case "density":
      return (
        <svg width="160" height="130" viewBox="0 0 160 130" fill="none" aria-hidden="true">
          {/* Tank with water */}
          <rect x="18" y="35" width="124" height="82" rx="8" fill={`${a}10`} stroke={a} strokeWidth="1.5"/>
          {/* Water fill */}
          <rect x="19" y="65" width="122" height="51" rx="0" fill={`${a}18`} clipPath="url(#dn-clip)"/>
          <clipPath id="dn-clip"><rect x="18" y="35" width="124" height="82" rx="8"/></clipPath>
          {/* Water surface wave */}
          <path d="M19 65 Q50 60 80 65 Q110 70 141 65" stroke={`${a}60`} strokeWidth="1" fill="none"/>
          {/* Floating wood block */}
          <rect x="32" y="55" width="26" height="18" rx="3" fill="#92400e" stroke="#78350f" strokeWidth="1.2"/>
          <rect x="33" y="56" width="6" height="16" rx="1" fill="rgba(255,255,255,0.15)"/>
          <text x="45" y="67" fontSize="6.5" fill="white" textAnchor="middle" fontWeight="700">WOOD</text>
          <text x="45" y="76" fontSize="6" fill={`${a}cc`} textAnchor="middle">0.60 g/cm³</text>
          {/* Sinking steel block */}
          <rect x="85" y="88" width="28" height="20" rx="3" fill="#475569" stroke="#334155" strokeWidth="1.2"/>
          <rect x="86" y="89" width="6" height="18" rx="1" fill="rgba(255,255,255,0.12)"/>
          <text x="99" y="101" fontSize="6.5" fill="white" textAnchor="middle" fontWeight="700">STEEL</text>
          <text x="99" y="84" fontSize="6" fill={`${a}cc`} textAnchor="middle">7.85 g/cm³</text>
          {/* Labels */}
          <text x="45" y="28" fontSize="8.5" fill={`${a}99`} textAnchor="middle" fontWeight="600">Floats ↑</text>
          <text x="99" y="28" fontSize="8.5" fill={`${a}99`} textAnchor="middle" fontWeight="600">Sinks ↓</text>
          {/* Density reference line */}
          <path d="M18 65 L142 65" stroke={a} strokeWidth="0.8" strokeDasharray="4 3" opacity="0.5"/>
          <text x="145" y="68" fontSize="7.5" fill={a} fontWeight="700">1.0</text>
        </svg>
      );
    case "filtration":
      return (
        <svg width="160" height="130" viewBox="0 0 160 130" fill="none" aria-hidden="true">
          {/* Stand */}
          <rect x="22" y="120" width="40" height="6" rx="2" fill={`${a}25`} stroke={`${a}50`} strokeWidth="0.8"/>
          <rect x="36" y="55" width="4" height="65" rx="2" fill={`${a}20`} stroke={`${a}40`} strokeWidth="0.8"/>
          {/* Funnel */}
          <path d="M14 22 L62 22 L48 56 L28 56Z" fill={`${a}18`} stroke={a} strokeWidth="1.5" strokeLinejoin="round"/>
          {/* Filter paper fold lines */}
          <path d="M14 22 L38 56 M62 22 L38 56" stroke={a} strokeWidth="0.7" opacity="0.5"/>
          {/* Sand in funnel */}
          <ellipse cx="38" cy="36" rx="12" ry="4" fill={`${a}30`}/>
          {/* Stem */}
          <rect x="35" y="56" width="6" height="22" rx="2" fill={`${a}30`} stroke={`${a}60`} strokeWidth="1"/>
          {/* Filtrate drop */}
          <ellipse cx="38" cy="80" rx="2" ry="3" fill={`${a}60`}/>
          {/* Collecting beaker */}
          <path d="M22 82 L22 122 L62 122 L62 82" stroke={a} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={`${a}08`}/>
          {/* Clear filtrate */}
          <rect x="23" y="105" width="38" height="16" fill={`${a}20`} clipPath="url(#fil-clip)"/>
          <clipPath id="fil-clip"><path d="M22 82 L22 122 L62 122 L62 82"/></clipPath>
          {/* Labels */}
          <text x="38" y="17" fontSize="8.5" fill={`${a}aa`} textAnchor="middle" fontWeight="600">Sand + Salt</text>
          <text x="100" y="55" fontSize="9" fill={`${a}99`} textAnchor="middle" fontWeight="700">Residue</text>
          <text x="38" y="128" fontSize="7.5" fill={`${a}80`} textAnchor="middle">Clear filtrate</text>
          {/* Arrows annotation */}
          <path d="M72 45 Q90 42 96 50" stroke={`${a}40`} strokeWidth="0.8" strokeDasharray="3 2" fill="none"/>
          <path d="M94 47 L96 51 L99 48" stroke={`${a}40`} strokeWidth="0.8"/>
          <text x="102" y="44" fontSize="7" fill={`${a}70`}>Sand stays</text>
          <text x="102" y="53" fontSize="7" fill={`${a}70`}>(insoluble)</text>
        </svg>
      );
    case "dissolving":
      return (
        <svg width="160" height="130" viewBox="0 0 160 130" fill="none" aria-hidden="true">
          {/* Beaker */}
          <path d="M30 25 L30 108 Q30 118 40 118 L120 118 Q130 118 130 108 L130 25"
            fill={`${a}10`} stroke={a} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          {/* Water */}
          <rect x="31" y="65" width="98" height="52" fill={`${a}18`} clipPath="url(#dis-clip)"/>
          <clipPath id="dis-clip"><path d="M30 25 L30 108 Q30 118 40 118 L120 118 Q130 118 130 108 L130 25"/></clipPath>
          {/* Water surface */}
          <path d="M31 65 Q60 60 80 65 Q100 70 129 65" stroke={`${a}55`} strokeWidth="1.2" fill="none"/>
          {/* Sugar granules dissolving */}
          {[50, 65, 80, 95, 110].map((x, i) => (
            <circle key={x} cx={x} cy={90 - i * 4} r={2.5 - i * 0.3} fill={`${a}${60 - i * 10}`} opacity={1 - i * 0.15}/>
          ))}
          {/* Stir rod */}
          <rect x="77" y="15" width="5" height="65" rx="2" fill={`${a}40`} stroke={`${a}70`} strokeWidth="0.8" transform="rotate(12 80 48)"/>
          {/* Thermometer */}
          <rect x="115" y="18" width="6" height="55" rx="3" fill="rgba(255,255,255,0.9)" stroke={`${a}50`} strokeWidth="0.8"/>
          <rect x="117" y="45" width="2" height="25" rx="1" fill={`${a}60`}/>
          <circle cx="118" cy="72" r="5" fill={`${a}70`} stroke={`${a}90`} strokeWidth="0.8"/>
          {/* Temp label */}
          <text x="118" y="15" fontSize="7.5" fill={`${a}bb`} textAnchor="middle">°C</text>
          {/* Hot label */}
          <text x="75" y="18" fontSize="9" fill={`${a}aa`} textAnchor="middle" fontWeight="700">80°C Hot</text>
        </svg>
      );
    case "indicator":
      return (
        <svg width="160" height="130" viewBox="0 0 160 130" fill="none" aria-hidden="true">
          {/* 4 test tubes */}
          {[
            { x: 22, fill: "#ef4444", label: "Acid" },
            { x: 52, fill: "#f59e0b", label: "Neutral" },
            { x: 82, fill: "#8b5cf6", label: "pH 7" },
            { x: 112, fill: "#059669", label: "Base" },
          ].map(({ x, fill, label }) => (
            <g key={x}>
              <path d={`M${x} 22 L${x} 90 Q${x} 100 ${x + 15} 100 Q${x + 30} 100 ${x + 30} 90 L${x + 30} 22`}
                fill={`${fill}22`} stroke={fill} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x={x + 1} y={60} width={28} height={38} fill={`${fill}35`} clipPath={`url(#ind-${x})`}/>
              <clipPath id={`ind-${x}`}>
                <path d={`M${x} 22 L${x} 90 Q${x} 100 ${x + 15} 100 Q${x + 30} 100 ${x + 30} 90 L${x + 30} 22`}/>
              </clipPath>
              <line x1={x} y1="22" x2={x + 30} y2="22" stroke={fill} strokeWidth="1.4"/>
              <text x={x + 15} y="15" fontSize="7.5" fill={fill} textAnchor="middle" fontWeight="700">{label}</text>
              {/* Litmus paper strip in each */}
              <rect x={x + 10} y="36" width="8" height="30" rx="1" fill={fill} opacity="0.7"/>
            </g>
          ))}
          {/* pH scale bar at bottom */}
          <defs>
            <linearGradient id="ph-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#ef4444"/>
              <stop offset="50%"  stopColor="#8b5cf6"/>
              <stop offset="100%" stopColor="#059669"/>
            </linearGradient>
          </defs>
          <rect x="18" y="112" width="124" height="8" rx="4" fill="url(#ph-grad)" opacity="0.7"/>
          <text x="18" y="127" fontSize="7" fill="#ef4444" fontWeight="700">0</text>
          <text x="77" y="127" fontSize="7" fill="#8b5cf6" textAnchor="middle" fontWeight="700">7</text>
          <text x="142" y="127" fontSize="7" fill="#059669" fontWeight="700">14</text>
        </svg>
      );
    case "redox":
      return (
        <svg width="160" height="130" viewBox="0 0 160 130" fill="none" aria-hidden="true">
          {/* Beaker with CuSO4 solution */}
          <rect x="28" y="40" width="104" height="72" rx="7" fill={`${a}12`} stroke={a} strokeWidth="1.5"/>
          <rect x="29" y="70" width="102" height="41" fill={`${a}25`} clipPath="url(#redox-clip)"/>
          <clipPath id="redox-clip"><rect x="28" y="40" width="104" height="72" rx="7"/></clipPath>
          <path d="M29 70 Q80 64 131 70" stroke={`${a}60`} strokeWidth="1.2" fill="none"/>
          {/* Metal strip (zinc) */}
          <rect x="65" y="28" width="12" height="72" rx="2" fill="#94a3b8" stroke="#64748b" strokeWidth="1"/>
          <rect x="66" y="29" width="3" height="68" rx="1" fill="rgba(255,255,255,0.2)"/>
          {/* Copper deposit spots */}
          {[0,1,2,3,4,5].map((i) => (
            <circle key={i} cx={68 + (i % 2) * 6} cy={78 + i * 6} r={1.8} fill="#b45309" opacity="0.8"/>
          ))}
          {/* Activity series labels */}
          <text x="71" y="24" fontSize="8" fill="#64748b" textAnchor="middle" fontWeight="700">Zn</text>
          {/* Electron flow arrow */}
          <path d="M68 60 Q50 48 44 40 Q40 34 52 30" stroke={a} strokeWidth="1.2" strokeDasharray="3 2" fill="none"/>
          <path d="M50 28 L52 31 L55 28" stroke={a} strokeWidth="1"/>
          <text x="35" y="28" fontSize="7" fill={`${a}aa`}>e⁻ flow</text>
          <text x="80" y="20" fontSize="8" fill={`${a}90`} fontWeight="600">Cu²⁺ + 2e⁻ → Cu</text>
        </svg>
      );
    case "separation":
      return (
        <svg width="160" height="130" viewBox="0 0 160 130" fill="none" aria-hidden="true">
          {/* Chromatography paper strip */}
          <rect x="62" y="10" width="36" height="95" rx="3" fill="rgba(255,255,255,0.92)" stroke={`${a}40`} strokeWidth="1.2"/>
          {/* Coloured bands (Rf values) */}
          {[
            { y: 30, color: "#ef4444", label: "Rf 0.88" },
            { y: 52, color: "#f59e0b", label: "Rf 0.61" },
            { y: 72, color: "#059669", label: "Rf 0.38" },
            { y: 90, color: "#2563eb", label: "Rf 0.12" },
          ].map(({ y, color, label }) => (
            <g key={y}>
              <rect x="63" y={y} width="34" height="10" rx="1" fill={color} opacity="0.6"/>
              <text x="103" y={y + 7.5} fontSize="8" fill={color} fontWeight="600">{label}</text>
            </g>
          ))}
          {/* Solvent front */}
          <line x1="62" y1="25" x2="98" y2="25" stroke={a} strokeWidth="1" strokeDasharray="3 2"/>
          <text x="58" y="25" fontSize="7" fill={`${a}90`} textAnchor="end">Solvent</text>
          {/* Origin line */}
          <line x1="62" y1="98" x2="98" y2="98" stroke={`${a}60`} strokeWidth="1"/>
          <text x="58" y="100" fontSize="7" fill={`${a}80`} textAnchor="end">Origin</text>
          {/* Beaker of solvent at bottom */}
          <rect x="44" y="106" width="72" height="18" rx="4" fill={`${a}14`} stroke={a} strokeWidth="1.2"/>
          <rect x="45" y="112" width="70" height="11" fill={`${a}22`} clipPath="url(#sep-clip)"/>
          <clipPath id="sep-clip"><rect x="44" y="106" width="72" height="18" rx="4"/></clipPath>
          <text x="80" y="128" fontSize="8" fill={`${a}80`} textAnchor="middle">Solvent bath</text>
        </svg>
      );
    case "kinetics":
      return (
        <svg width="160" height="130" viewBox="0 0 160 130" fill="none" aria-hidden="true">
          {/* Graph axes */}
          <line x1="22" y1="108" x2="148" y2="108" stroke={`${a}50`} strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="22" y1="108" x2="22"  y2="18"  stroke={`${a}50`} strokeWidth="1.5" strokeLinecap="round"/>
          {/* Axis labels */}
          <text x="85" y="122" fontSize="9" fill={`${a}90`} textAnchor="middle" fontWeight="600">Time (s)</text>
          <text x="12" y="65" fontSize="9" fill={`${a}90`} textAnchor="middle" fontWeight="600" transform="rotate(-90 12 65)">Conc.</text>
          {/* Three rate curves: fast (hot), medium (warm), slow (cold) */}
          <path d="M22 95 C40 90 55 55 80 30 C95 16 110 15 148 15"
            stroke="#ef4444" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          <path d="M22 98 C45 93 65 70 90 50 C110 34 130 25 148 22"
            stroke={a} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          <path d="M22 100 C50 97 75 85 100 72 C120 62 136 50 148 40"
            stroke="#64748b" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeDasharray="5 3"/>
          {/* Legend */}
          <line x1="100" y1="100" x2="115" y2="100" stroke="#ef4444" strokeWidth="1.5"/>
          <text x="118" y="103" fontSize="7.5" fill="#ef4444">Hot</text>
          <line x1="100" y1="110" x2="115" y2="110" stroke={a} strokeWidth="1.5"/>
          <text x="118" y="113" fontSize="7.5" fill={a}>Warm</text>
          {/* Tick marks */}
          {[1, 2, 3].map((i) => (
            <line key={i} x1={22 + i * 40} y1="108" x2={22 + i * 40} y2="112" stroke={`${a}50`} strokeWidth="1"/>
          ))}
        </svg>
      );
    case "gas":
      return (
        <svg width="160" height="130" viewBox="0 0 160 130" fill="none" aria-hidden="true">
          {/* Cylinder (piston) */}
          <rect x="38" y="20" width="50" height="90" rx="6" fill={`${a}10`} stroke={a} strokeWidth="1.5"/>
          {/* Piston */}
          <rect x="40" y="52" width="46" height="12" rx="3" fill={`${a}40`} stroke={a} strokeWidth="1.2"/>
          <rect x="60" y="36" width="6" height="20" rx="2" fill={`${a}30`} stroke={`${a}60`} strokeWidth="0.8"/>
          {/* Gas molecules dots */}
          {[
            [55,70],[70,65],[85,72],[60,82],[75,78],[90,68],[65,90],[80,86],
          ].map(([x,y], i) => (
            <circle key={i} cx={x} cy={y} r="2.5" fill={`${a}60`}/>
          ))}
          {/* Pressure arrow */}
          <path d="M63 48 L63 38" stroke={a} strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M60 40 L63 36 L66 40" stroke={a} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <text x="72" y="44" fontSize="8.5" fill={a} fontWeight="700">P↑</text>
          {/* Graph inset */}
          <rect x="98" y="18" width="52" height="45" rx="5" fill="rgba(255,255,255,0.88)" stroke={`${a}25`} strokeWidth="0.8"/>
          <line x1="104" y1="58" x2="104" y2="24" stroke={`${a}40`} strokeWidth="0.8"/>
          <line x1="104" y1="58" x2="145" y2="58" stroke={`${a}40`} strokeWidth="0.8"/>
          {/* Boyle's curve */}
          <path d="M107 25 C113 26 122 32 134 42 C140 48 143 54 144 57"
            stroke={a} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
          <text x="124" y="20" fontSize="7.5" fill={a} textAnchor="middle" fontWeight="600">P–V curve</text>
          {/* Temperature labels */}
          <text x="63" y="120" fontSize="9" fill={`${a}99`} textAnchor="middle" fontWeight="600">PV = nRT</text>
        </svg>
      );
    case "equilibrium":
      return (
        <svg width="160" height="130" viewBox="0 0 160 130" fill="none" aria-hidden="true">
          {/* Two beakers representing equilibrium shift */}
          {/* Before beaker */}
          <rect x="10" y="40" width="58" height="62" rx="6" fill="rgba(194,65,12,0.15)" stroke="#b45309" strokeWidth="1.4"/>
          <rect x="11" y="68" width="56" height="33" fill="rgba(194,65,12,0.35)" clipPath="url(#eq-left)"/>
          <clipPath id="eq-left"><rect x="10" y="40" width="58" height="62" rx="6"/></clipPath>
          <text x="39" y="35" fontSize="8.5" fill="#b45309" textAnchor="middle" fontWeight="700">Fe(SCN)₂⁺</text>
          <text x="39" y="114" fontSize="7.5" fill="#b45309" textAnchor="middle">Deep red</text>
          {/* Equilibrium arrows */}
          <path d="M74 72 L86 66" stroke={a} strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M83 63 L86 67 L82 69" stroke={a} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M86 82 L74 88" stroke={`${a}70`} strokeWidth="1.3" strokeLinecap="round" strokeDasharray="3 2"/>
          <path d="M77 91 L74 87 L78 85" stroke={`${a}70`} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          <text x="80" y="79" fontSize="8" fill={a} textAnchor="middle" fontWeight="700">⇌</text>
          {/* After beaker */}
          <rect x="92" y="40" width="58" height="62" rx="6" fill="rgba(120,58,237,0.10)" stroke="#7c3aed" strokeWidth="1.4"/>
          <rect x="93" y="75" width="56" height="26" fill="rgba(120,58,237,0.22)" clipPath="url(#eq-right)"/>
          <clipPath id="eq-right"><rect x="92" y="40" width="58" height="62" rx="6"/></clipPath>
          <text x="121" y="35" fontSize="8.5" fill="#7c3aed" textAnchor="middle" fontWeight="700">+Fe³⁺ added</text>
          <text x="121" y="114" fontSize="7.5" fill="#7c3aed" textAnchor="middle">Paler</text>
          {/* Le Chatelier label */}
          <text x="80" y="128" fontSize="8" fill={`${a}aa`} textAnchor="middle" fontWeight="600">Le Chatelier&apos;s Principle</text>
        </svg>
      );
    case "calorimetry":
      return (
        <svg width="160" height="130" viewBox="0 0 160 130" fill="none" aria-hidden="true">
          {/* Calorimeter cup (polystyrene) */}
          <rect x="42" y="38" width="76" height="72" rx="6" fill="rgba(255,255,255,0.92)" stroke={`${a}40`} strokeWidth="1.3"/>
          <rect x="44" y="40" width="72" height="68" rx="4" fill={`${a}08`}/>
          {/* Lid */}
          <rect x="38" y="32" width="84" height="10" rx="5" fill="rgba(255,255,255,0.95)" stroke={`${a}35`} strokeWidth="1.2"/>
          {/* Liquid */}
          <rect x="44" y="78" width="72" height="29" fill={`${a}22`} clipPath="url(#cal-clip)"/>
          <clipPath id="cal-clip"><rect x="42" y="38" width="76" height="72" rx="6"/></clipPath>
          <path d="M44 78 Q80 72 116 78" stroke={`${a}60`} strokeWidth="1" fill="none"/>
          {/* Thermometer */}
          <rect x="76" y="10" width="7" height="56" rx="3.5" fill="rgba(255,255,255,0.9)" stroke={`${a}50`} strokeWidth="1"/>
          <rect x="78" y="38" width="3" height="25" rx="1.5" fill={`${a}80`}/>
          <circle cx="79.5" cy="64" r="5.5" fill={`${a}70`} stroke={`${a}90`} strokeWidth="0.8"/>
          {/* Temperature arrow */}
          <path d="M87 40 L100 33" stroke={a} strokeWidth="1.2" strokeDasharray="3 2"/>
          <text x="102" y="32" fontSize="8.5" fill={a} fontWeight="700">ΔT = 4.2°C</text>
          {/* Equation */}
          <text x="80" y="120" fontSize="8" fill={`${a}aa`} textAnchor="middle" fontWeight="600">q = mcΔT</text>
          {/* Heat waves */}
          {[0,1,2].map((i) => (
            <path key={i} d={`M${55 + i * 14} 76 Q${58 + i * 14} 70 ${62 + i * 14} 76 Q${66 + i * 14} 82 ${70 + i * 14} 76`}
              stroke={`${a}50`} strokeWidth="1" fill="none" strokeLinecap="round"/>
          ))}
        </svg>
      );
    case "neutralization":
      return (
        <svg width="160" height="130" viewBox="0 0 160 130" fill="none" aria-hidden="true">
          {/* HCl beaker (left) */}
          <rect x="12" y="38" width="44" height="60" rx="5" fill={`${a}12`} stroke={a} strokeWidth="1.4"/>
          <rect x="13" y="60" width="42" height="37" fill={`${a}18`} clipPath="url(#nl-lc)"/>
          <clipPath id="nl-lc"><rect x="12" y="38" width="44" height="60" rx="5"/></clipPath>
          <path d="M12 60 Q34 54 56 60" stroke={`${a}55`} strokeWidth="1" fill="none"/>
          <text x="34" y="32" fontSize="8" fill={`${a}99`} textAnchor="middle" fontWeight="700">HCl</text>
          {/* Arrow */}
          <path d="M60 68 Q74 64 84 68" stroke={a} strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M81 65 L84 68 L81 71" stroke={a} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          {/* NaOH cylinder (center) */}
          <rect x="64" y="32" width="26" height="72" rx="5" fill={`${a}10`} stroke={a} strokeWidth="1.4"/>
          <rect x="65" y="54" width="24" height="49" fill={`${a}20`} clipPath="url(#nl-nc)"/>
          <clipPath id="nl-nc"><rect x="64" y="32" width="26" height="72" rx="5"/></clipPath>
          <text x="77" y="26" fontSize="8" fill={`${a}99`} textAnchor="middle" fontWeight="700">NaOH</text>
          {/* Thermometer */}
          <rect x="96" y="22" width="6" height="55" rx="3" fill="rgba(255,255,255,0.9)" stroke={`${a}50`} strokeWidth="0.9"/>
          <rect x="98" y="44" width="2" height="30" rx="1" fill="#ef4444" opacity="0.8"/>
          <circle cx="99" cy="76" r="5" fill="#ef4444" opacity="0.9"/>
          <text x="99" y="18" fontSize="7" fill={`${a}99`} textAnchor="middle">°C</text>
          {/* ΔT badge */}
          <rect x="106" y="38" width="44" height="24" rx="5" fill="rgba(254,226,226,0.95)" stroke="rgba(239,68,68,0.3)" strokeWidth="0.9"/>
          <text x="128" y="52" fontSize="9" fontWeight="800" fill="#dc2626" textAnchor="middle">ΔT +8°C</text>
          {/* Product label */}
          <text x="80" y="118" fontSize="9" fill={`${a}aa`} textAnchor="middle" fontWeight="600">NaCl + H₂O</text>
          <text x="80" y="128" fontSize="7.5" fill={`${a}80`} textAnchor="middle">Exothermic · ΔH = −55.8 kJ/mol</text>
        </svg>
      );
    case "saltAnalysis":
      return (
        <svg width="160" height="130" viewBox="0 0 160 130" fill="none" aria-hidden="true">
          {/* Test tube rack */}
          <rect x="14" y="86" width="132" height="8" rx="3" fill="#92400e" opacity="0.5"/>
          {/* 4 test tubes */}
          {[
            { x: 24, fill: "#3b82f6",  ppt: "#1d4ed8", label: "Cu²⁺" },
            { x: 57, fill: "#92400e",  ppt: "#78350f", label: "Fe³⁺" },
            { x: 90, fill: "#e2e8f0",  ppt: "#94a3b8", label: "SO₄²⁻" },
            { x: 122, fill: "#e2e8f0", ppt: "#e2e8f0", label: "CO₃²⁻" },
          ].map(({ x, fill, ppt, label }) => (
            <g key={x}>
              <path d={`M${x} 22 L${x} 76 Q${x} 86 ${x+12} 86 Q${x+24} 86 ${x+24} 76 L${x+24} 22Z`}
                fill="rgba(241,245,249,0.55)" stroke="#94a3b8" strokeWidth="1.4"/>
              <rect x={x+1} y={42} width="22" height="42" fill={`${fill}`} opacity="0.4" clipPath={`url(#sa-${x})`}/>
              <rect x={x+1} y={68} width="22" height="16" fill={ppt} opacity="0.82" clipPath={`url(#sa-${x})`}/>
              <clipPath id={`sa-${x}`}><path d={`M${x} 22 L${x} 76 Q${x} 86 ${x+12} 86 Q${x+24} 86 ${x+24} 76 L${x+24} 22Z`}/></clipPath>
              <rect x={x+1} y={24} width="6" height="60" fill="rgba(255,255,255,0.3)" rx="2"/>
              <text x={x+12} y={18} fontSize="7.5" fill="#475569" textAnchor="middle" fontWeight="700">{label}</text>
            </g>
          ))}
          <text x="80" y="108" fontSize="8.5" fill={`${a}aa`} textAnchor="middle" fontWeight="600">Qualitative Salt Analysis</text>
          <text x="80" y="120" fontSize="7.5" fill={`${a}80`} textAnchor="middle">Cation + Anion tests → identification</text>
        </svg>
      );
    case "waterHardness":
      return (
        <svg width="160" height="130" viewBox="0 0 160 130" fill="none" aria-hidden="true">
          {/* Retort stand */}
          <rect x="74" y="110" width="24" height="7" rx="3" fill="#64748b" opacity="0.55"/>
          <rect x="81" y="20" width="9" height="94" rx="3" fill="#94a3b8" opacity="0.45"/>
          <rect x="68" y="26" width="36" height="8" rx="3" fill="#64748b" opacity="0.5"/>
          {/* Burette */}
          <rect x="76" y="22" width="20" height="72" rx="3" fill="rgba(241,245,249,0.55)" stroke="#64748b" strokeWidth="1.5"/>
          <rect x="78" y="24" width="16" height="56" fill="rgba(167,243,208,0.7)" rx="1"/>
          <rect x="72" y="92" width="28" height="8" rx="3" fill="#475569" opacity="0.7"/>
          <rect x="83" y="100" width="5" height="12" rx="2" fill="rgba(241,245,249,0.7)" stroke="#64748b" strokeWidth="0.9"/>
          {/* Drop */}
          <ellipse cx="85.5" cy="114" rx="2.5" ry="3.5" fill="rgba(167,243,208,0.9)"/>
          {/* Conical flask */}
          <path d="M44 76 L28 116 Q26 124 42 124 L128 124 Q144 124 142 116 L126 76Z"
            fill="rgba(241,245,249,0.52)" stroke="#64748b" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M44 76 L126 76" stroke="#64748b" strokeWidth="1.5"/>
          {/* Blue endpoint liquid */}
          <path d="M32 108 L138 108 L142 116 Q144 124 128 124 L42 124 Q26 124 28 116Z"
            fill="rgba(59,130,246,0.45)" clipPath="url(#wh-fc)"/>
          <clipPath id="wh-fc"><path d="M44 76 L28 116 Q26 124 42 124 L128 124 Q144 124 142 116 L126 76Z"/></clipPath>
          <text x="85" y="120" fontSize="8" fill="#1d4ed8" textAnchor="middle" fontWeight="700">Blue endpoint</text>
          {/* EDTA label */}
          <text x="86" y="18" fontSize="8.5" fill={`${a}aa`} textAnchor="middle" fontWeight="700">EDTA Complexometric Titration</text>
          <text x="86" y="8" fontSize="7" fill={`${a}80`} textAnchor="middle">EBT: wine-red → blue</text>
        </svg>
      );
    case "functionalGroups":
      return (
        <svg width="160" height="130" viewBox="0 0 160 130" fill="none" aria-hidden="true">
          {/* Reagent bottles (4 mini bottles) */}
          {[
            { x: 8,  c: "#22c55e", t: "Lucas" },
            { x: 44, c: "#f97316", t: "Tollens" },
            { x: 80, c: "#f59e0b", t: "DNP" },
            { x: 116, c: "#3b82f6", t: "Hinsberg" },
          ].map(({ x, c, t }) => (
            <g key={x}>
              <rect x={x+6} y="8"  width="18" height="10" rx="3" fill="rgba(241,245,249,0.6)" stroke="#94a3b8" strokeWidth="1"/>
              <rect x={x+2} y="16" width="26" height="42" rx="5" fill={`${c}18`} stroke="#94a3b8" strokeWidth="1.2"/>
              <rect x={x+5} y="26" width="20" height="20" rx="3" fill="rgba(255,255,255,0.8)" stroke="rgba(148,163,184,0.25)" strokeWidth="0.7"/>
              <text x={x+15} y="38" fontSize="5.5" fontWeight="800" fill={c} textAnchor="middle">{t}</text>
              <rect x={x+4} y="36" width="22" height="20" rx="0 0 3 3" fill={`${c}30`}/>
              <rect x={x+4} y="17" width="5" height="40" fill="rgba(255,255,255,0.3)" rx="2"/>
            </g>
          ))}
          {/* Main test tube */}
          <path d="M72 62 L72 108 Q72 118 80 118 Q88 118 88 108 L88 62Z"
            fill="rgba(241,245,249,0.55)" stroke="#64748b" strokeWidth="1.8"/>
          <rect x="74" y="78" width="12" height="38" fill="rgba(249,115,22,0.7)" clipPath="url(#fg-tc)"/>
          <clipPath id="fg-tc"><path d="M72 62 L72 108 Q72 118 80 118 Q88 118 88 108 L88 62Z"/></clipPath>
          <rect x="73" y="64" width="4" height="52" fill="rgba(255,255,255,0.35)" rx="2"/>
          {/* Silver mirror effect on Tollen's */}
          <rect x="74" y="80" width="12" height="20" fill="rgba(200,215,228,0.88)"/>
          <text x="80" y="130" fontSize="7" fill={`${a}80`} textAnchor="middle">Silver mirror (Tollen&apos;s test)</text>
          {/* Result badge */}
          <rect x="96" y="64" width="56" height="26" rx="6" fill="rgba(240,253,244,0.97)" stroke="rgba(34,197,94,0.4)" strokeWidth="1"/>
          <text x="124" y="74" fontSize="8" fontWeight="800" fill="#166534" textAnchor="middle">POSITIVE ✓</text>
          <text x="124" y="84" fontSize="7" fill="#059669" textAnchor="middle">Aldehyde (–CHO)</text>
        </svg>
      );
    case "chromatography":
      return (
        <svg width="160" height="130" viewBox="0 0 160 130" fill="none" aria-hidden="true">
          {/* Glass developing chamber */}
          <rect x="46" y="10" width="68" height="108" rx="6" fill="rgba(219,234,254,0.18)" stroke="#64748b" strokeWidth="1.6"/>
          {/* Solvent pool at bottom */}
          <rect x="48" y="100" width="64" height="16" fill="rgba(186,230,253,0.45)" clipPath="url(#ch-cc)"/>
          <clipPath id="ch-cc"><rect x="46" y="10" width="68" height="108" rx="6"/></clipPath>
          {/* Chromatography paper */}
          <rect x="68" y="14" width="24" height="90" fill="#fafaf9" stroke="rgba(203,213,225,0.5)" strokeWidth="1"/>
          {/* Dye bands (separated) */}
          {[
            { y: 28, c: "#ef4444", label: "Rf 0.88" },
            { y: 46, c: "#f59e0b", label: "Rf 0.65" },
            { y: 63, c: "#059669", label: "Rf 0.44" },
            { y: 78, c: "#3b82f6", label: "Rf 0.18" },
          ].map(({ y, c, label }) => (
            <g key={y}>
              <rect x="69" y={y} width="22" height="10" fill={c} opacity="0.68" rx="1"/>
              <text x="96" y={y + 7} fontSize="7.5" fill={c} fontWeight="600">{label}</text>
            </g>
          ))}
          {/* Solvent front line */}
          <line x1="68" y1="22" x2="92" y2="22" stroke="#3b82f6" strokeWidth="1.2" strokeDasharray="3 2"/>
          <text x="44" y="24" fontSize="7" fill="#3b82f6" textAnchor="end">Front</text>
          {/* Origin line */}
          <line x1="68" y1="92" x2="92" y2="92" stroke="#94a3b8" strokeWidth="1"/>
          <text x="44" y="94" fontSize="7" fill="#64748b" textAnchor="end">Start</text>
          {/* Scale marks on right */}
          {[0, 2, 4, 6, 8].map(cm => (
            <g key={cm}>
              <line x1="92" y1={92 - cm * 8.75} x2="98" y2={92 - cm * 8.75} stroke="#94a3b8" strokeWidth="0.9"/>
              <text x="100" y={92 - cm * 8.75 + 3.5} fontSize="6.5" fill="#64748b">{cm}</text>
            </g>
          ))}
          <text x="80" y="122" fontSize="8.5" fill={`${a}aa`} textAnchor="middle" fontWeight="600">Paper Chromatography</text>
          <text x="80" y="130" fontSize="7" fill={`${a}80`} textAnchor="middle">Rf = d_spot / d_front</text>
        </svg>
      );
    default:
      return (
        <svg width="100" height="90" viewBox="0 0 100 90" fill="none" aria-hidden="true">
          <path d="M38 10h24M38 10v32L18 78h64L62 42V10"
            stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <ellipse cx="50" cy="68" rx="16" ry="5" fill={`${accent}22`}/>
        </svg>
      );
  }
}
