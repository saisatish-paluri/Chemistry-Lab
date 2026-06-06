"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const SAFETY_RULES = [
  { icon: "🥽", rule: "Always wear appropriate personal protective equipment (PPE) — safety goggles and lab coat." },
  { icon: "🚫", rule: "Never eat, drink, or apply cosmetics in the laboratory." },
  { icon: "🔥", rule: "Keep flammable materials away from open flames and heat sources." },
  { icon: "🧪", rule: "Read reagent labels carefully before use — check concentration and hazard symbols." },
  { icon: "💧", rule: "Clean up spills immediately using appropriate materials and methods." },
  { icon: "⚗️", rule: "Dispose of chemicals according to lab protocols — never pour acids down the drain without neutralising." },
  { icon: "⚡", rule: "Disconnect electrical equipment before adjusting connections in electrolysis setups." },
  { icon: "🧼", rule: "Wash hands thoroughly before leaving the lab, even if gloves were worn." },
  { icon: "📋", rule: "Report all accidents, spills, or injuries to the supervising teacher immediately." },
  { icon: "🚪", rule: "Know the location of fire exits, eye wash stations, and first aid kits before starting." },
];

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const cardAnim = {
  hidden:  { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
};

export default function SectionCards() {
  const [safetyOpen, setSafetyOpen] = useState(false);

  return (
    <section
      style={{
        background: "var(--lab-off-white)",
        borderTop:  "1px solid var(--lab-glass-border)",
        padding:    "clamp(4rem, 8vw, 7rem) clamp(16px, 4vw, 48px)",
        position:   "relative",
        overflow:   "hidden",
      }}
    >
      {/* Background texture */}
      <div aria-hidden="true" style={{
        position:        "absolute",
        inset:           0,
        backgroundImage: "radial-gradient(circle, rgba(37,99,235,0.04) 1px, transparent 1px)",
        backgroundSize:  "32px 32px",
        pointerEvents:   "none",
      }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 10 }}>
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.52, ease: "easeOut" }}
          viewport={{ once: true, margin: "-50px" }}
          style={{ textAlign: "center", marginBottom: "3.5rem" }}
        >
          <span className="section-tag section-tag-blue" style={{ marginBottom: 14, display: "inline-flex" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb", flexShrink: 0 }} />
            Explore ChemLab
          </span>
          <h2 className="section-heading" style={{ marginTop: "0.75rem" }}>
            Everything in One{" "}
            <span className="gradient-text">Place</span>
          </h2>
          <p className="section-subheading" style={{ maxWidth: "440px", margin: "0.85rem auto 0" }}>
            Labs, apparatus reference, and safety rules — all under one roof.
          </p>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid gap-5 mb-5"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}
        >
          {/* Virtual Labs */}
          <motion.div variants={cardAnim}>
            <Link
              href="/experiments"
              className="nav-card-apple flex flex-col gap-4"
              style={{ "--nav-card-glow": "radial-gradient(circle at 0% 0%, rgba(37,99,235,0.07) 0%, transparent 60%)" } as React.CSSProperties}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                background: "rgba(37,99,235,0.09)", border: "1px solid rgba(37,99,235,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#2563eb",
                boxShadow: "0 4px 16px rgba(37,99,235,0.12)",
              }}>
                <LabsIcon />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 800, color: "var(--lab-text-primary)", marginBottom: 5, letterSpacing: "-0.01em" }}>Virtual Labs</p>
                <p style={{ fontSize: 12.5, lineHeight: 1.65, color: "var(--lab-text-muted)" }}>Enter the full lab environment and conduct experiments</p>
              </div>
              <div style={{ marginTop: "auto" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontSize: 12, fontWeight: 700, color: "#2563eb",
                  padding: "5px 14px", borderRadius: 100,
                  background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.20)",
                }}>
                  Choose Experiment →
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Apparatus */}
          <motion.div variants={cardAnim}>
            <Link
              href="/apparatus"
              className="nav-card-apple flex flex-col gap-4"
              style={{ "--nav-card-glow": "radial-gradient(circle at 0% 0%, rgba(217,119,6,0.07) 0%, transparent 60%)" } as React.CSSProperties}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                background: "rgba(217,119,6,0.09)", border: "1px solid rgba(217,119,6,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#d97706",
                boxShadow: "0 4px 16px rgba(217,119,6,0.12)",
              }}>
                <FlaskIcon />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 800, color: "var(--lab-text-primary)", marginBottom: 5, letterSpacing: "-0.01em" }}>Apparatus</p>
                <p style={{ fontSize: 12.5, lineHeight: 1.65, color: "var(--lab-text-muted)" }}>Explore instruments you will encounter in the virtual lab</p>
              </div>
              <div style={{ marginTop: "auto" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontSize: 12, fontWeight: 700, color: "#d97706",
                  padding: "5px 14px", borderRadius: 100,
                  background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.20)",
                }}>
                  Explore →
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Lab Safety */}
          <motion.div variants={cardAnim}>
            <button
              onClick={() => setSafetyOpen((o) => !o)}
              className="nav-card-apple flex flex-col gap-4 w-full text-left"
              style={{
                background: safetyOpen ? "rgba(220,38,38,0.05)" : "rgba(255,255,255,0.90)",
                borderColor: safetyOpen ? "rgba(220,38,38,0.35)" : "rgba(148,163,184,0.18)",
                boxShadow: safetyOpen ? "0 4px 28px rgba(220,38,38,0.10), 0 0 0 1px rgba(255,255,255,0.7) inset" : undefined,
                cursor: "pointer",
              } as React.CSSProperties}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                background: "rgba(220,38,38,0.09)", border: "1px solid rgba(220,38,38,0.20)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#dc2626",
                boxShadow: "0 4px 16px rgba(220,38,38,0.12)",
              }}>
                <ShieldIcon />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 800, color: "var(--lab-text-primary)", marginBottom: 5, letterSpacing: "-0.01em" }}>Lab Safety</p>
                <p style={{ fontSize: 12.5, lineHeight: 1.65, color: "var(--lab-text-muted)" }}>Essential safety rules and regulations for every session</p>
              </div>
              <div style={{ marginTop: "auto" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontSize: 12, fontWeight: 700, color: "#dc2626",
                  padding: "5px 14px", borderRadius: 100,
                  background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.20)",
                }}>
                  {safetyOpen ? "▲ Hide Rules" : "▼ Safety Rules"}
                </span>
              </div>
            </button>
          </motion.div>
        </motion.div>

        {/* Safety panel */}
        <AnimatePresence mode="wait">
          {safetyOpen && (
            <motion.div
              key="safety"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: "hidden" }}
            >
              <SafetyPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function SafetyPanel() {
  return (
    <div style={{
      background:   "rgba(255,255,255,0.92)",
      border:       "1px solid rgba(220,38,38,0.22)",
      borderRadius: 20,
      padding:      "24px",
      boxShadow:    "var(--lab-shadow-md), 0 0 0 1px rgba(255,255,255,0.8) inset",
      marginTop:    4,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <span style={{ fontSize: 16 }}>🛡️</span>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#dc2626" }}>
          Laboratory Safety Rules
        </p>
        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 100, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", marginLeft: 4 }}>
          Mandatory
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {SAFETY_RULES.map(({ icon, rule }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04, ease: "easeOut" }}
            style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "10px 12px", borderRadius: 14,
              background: "#fef2f2", border: "1px solid #fecaca",
              fontSize: 12, color: "#7f1d1d", lineHeight: 1.65,
            }}
          >
            <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{icon}</span>
            <span>{rule}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function LabsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M9 3h6M9 3v8L5 19h14L15 11V3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 16 Q12 14 16 16" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.5" />
      <circle cx="10" cy="16" r="1.2" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

function FlaskIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M10 2h4M10 2v8L6 19h12L14 10V2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 17 Q12 15 16 17" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2 L4 6 L4 12 C4 16.8 7.5 21 12 22 C16.5 21 20 16.8 20 12 L20 6 Z"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12 L11 14 L15 10" stroke="currentColor" strokeWidth="1.7"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
