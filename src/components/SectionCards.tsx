"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Interactive3DCard from "@/components/Interactive3DCard";

const PANELS = [
  {
    href:      "/experiments",
    label:     "Virtual Labs",
    sub:       "20 experiments · Class 6–12",
    cta:       "Explore All Labs",
    color:     "#1d4ed8",
    accent:    "#2563eb",
    photo:     "/images/experiments/titration.png",
    bg:        "var(--panel-labs-bg)",
    textColor: "var(--lab-text-primary)",
    subColor:  "var(--lab-text-muted)",
    photoBlend: "var(--panel-labs-blend)" as any,
  },
  {
    href:      "/apparatus",
    label:     "Apparatus",
    sub:       "Interactive equipment reference",
    cta:       "Browse Equipment",
    color:     "#b45309",
    accent:    "#d97706",
    photo:     "/images/apparatus/beaker.png",
    bg:        "var(--panel-apparatus-bg)",
    textColor: "var(--lab-text-primary)",
    subColor:  "var(--lab-text-muted)",
    photoBlend: "var(--panel-apparatus-blend)" as any,
  },
];

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.10 } },
};
const item = {
  hidden:  { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.50, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
};

export default function SectionCards() {
  return (
    <section
      style={{
        background: "transparent",
        borderTop:  "1px solid var(--lab-glass-border)",
        padding:    "clamp(2.5rem, 5vw, 4.5rem) clamp(16px, 4vw, 48px)",
        position:   "relative",
        overflow:   "hidden",
      }}
    >
      {/* Subtle dot texture */}
      <div
        aria-hidden="true"
        style={{
          position:        "absolute",
          inset:           0,
          backgroundImage: "radial-gradient(circle, rgba(37,99,235,0.036) 1px, transparent 1px)",
          backgroundSize:  "30px 30px",
          pointerEvents:   "none",
        }}
      />

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 2 }}>

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.44, ease: "easeOut" }}
          style={{ textAlign: "center", marginBottom: "clamp(1.8rem, 4vw, 3rem)" }}
        >
          <h2
            style={{
              fontSize:      "clamp(1.5rem, 4vw, 2.2rem)",
              fontWeight:    900,
              color:         "var(--lab-text-primary)",
              letterSpacing: "-0.03em",
              margin:        0,
              lineHeight:    1.1,
            }}
          >
            Start Exploring
          </h2>
          <p style={{
            fontSize:   "clamp(12px, 1.5vw, 14px)",
            color:      "var(--lab-text-muted)",
            marginTop:  "0.6rem",
            fontWeight: 500,
          }}>
            Everything you need, zero barriers.
          </p>
        </motion.div>

        {/* ── Two visual panels ── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          style={{
            display:               "grid",
            gridTemplateColumns:   "repeat(auto-fit, minmax(280px, 1fr))",
            gap:                   "clamp(10px, 1.8vw, 16px)",
            marginBottom:          "clamp(12px, 2vw, 18px)",
          }}
        >
          {PANELS.map(({ href, label, sub, cta, color, accent, photo, bg, textColor, subColor, photoBlend }) => (
            <motion.div key={href} variants={item}>
              <Interactive3DCard>
                <Link
                  href={href}
                  className="section-nav-panel"
                  style={{
                    display:        "flex",
                    flexDirection:  "column",
                    justifyContent: "space-between",
                    minHeight:      "clamp(180px, 22vw, 220px)",
                    borderRadius:   "20px",
                    overflow:       "hidden",
                    position:       "relative",
                    textDecoration: "none",
                    background:     bg,
                    border:         `1px solid ${accent}30`,
                    boxShadow:      "var(--lab-shadow-sm)",
                  } as React.CSSProperties}
                >
                {/* Left accent gradient */}
                <div
                  aria-hidden="true"
                  style={{
                    position:   "absolute",
                    inset:      0,
                    background: `radial-gradient(ellipse at 0% 50%, ${accent}18 0%, transparent 55%)`,
                    pointerEvents: "none",
                  }}
                />

                {/* Content */}
                <div style={{ position: "relative", zIndex: 2, padding: "clamp(22px, 2.5vw, 34px)", display: "flex", flexDirection: "column", height: "100%" }}>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize:      "clamp(1.15rem, 2.5vw, 1.45rem)",
                      fontWeight:    900,
                      color:         textColor,
                      letterSpacing: "-0.025em",
                      margin:        "0 0 6px",
                      lineHeight:    1.2,
                    }}>
                      {label}
                    </p>
                    <p style={{
                      fontSize:   "clamp(11px, 1.2vw, 12.5px)",
                      color:      subColor,
                      fontWeight: 500,
                      margin:     0,
                    }}>
                      {sub}
                    </p>
                  </div>

                  <div style={{ marginTop: "auto", paddingTop: 20 }}>
                    <span
                      style={{
                        display:        "inline-flex",
                        alignItems:     "center",
                        gap:            6,
                        fontSize:       "clamp(11px, 1.2vw, 12.5px)",
                        fontWeight:     700,
                        color,
                        padding:        "7px 15px",
                        borderRadius:   10,
                        background:     `${accent}1c`,
                        border:         `1px solid ${accent}38`,
                        transition:     "background 0.2s ease",
                      }}
                    >
                      {cta}
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                        <path d="M2 5.5h7M6.5 3.5l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Top accent line */}
                <div
                  aria-hidden="true"
                  style={{
                    position:   "absolute",
                    top:        0,
                    left:       0,
                    right:      0,
                    height:     "2px",
                    background: `linear-gradient(90deg, ${accent}, ${accent}40, transparent)`,
                  }}
                />
              </Link>
              </Interactive3DCard>
            </motion.div>
          ))}
        </motion.div>

        {/* 3D Interactive Simulators Panel */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 p-6 rounded-3xl border bg-white/70 border-slate-200 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex-1">
            <h3 className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              3D Interactive Simulators
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Explore molecular structures, electron orbitals probability clouds, and crystal unit cells in real-time.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-3d-builder", { detail: { tab: "molecules" } }))}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-cyan-600 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              🧬 Molecular Builder
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-3d-builder", { detail: { tab: "orbitals" } }))}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-cyan-600 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              ⚛️ Atomic Orbitals
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-3d-builder", { detail: { tab: "lattices" } }))}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-cyan-600 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              🧊 Crystal Lattices
            </button>
          </div>
        </motion.div>

        {/* ── Safety footnote ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.25 }}
          style={{ textAlign: "center" }}
        >
          <Link
            href="/safety"
            style={{
              fontSize:       "11.5px",
              fontWeight:     600,
              color:          "var(--lab-text-muted)",
              textDecoration: "none",
              display:        "inline-flex",
              alignItems:     "center",
              gap:            5,
              padding:        "5px 10px",
              borderRadius:   8,
              transition:     "color 0.15s ease, background 0.15s ease",
            }}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.color = "var(--lab-text-primary)"; el.style.background = "rgba(37,99,235,0.06)"; }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.color = "var(--lab-text-muted)"; el.style.background = "none"; }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M6 1L2 3v4c0 2.8 1.6 4.6 4 5.4C10 11.6 10 9.8 10 7V3L6 1Z"
                stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" fill="none"/>
              <path d="M4.5 6 L5.5 7 L7.5 5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Lab Safety Guidelines
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
