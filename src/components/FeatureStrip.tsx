"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const FEATURES = [
  {
    icon:      <PhysicsIcon />,
    title:     "Accurate Simulations",
    desc:      "Every reaction follows real chemistry — pH curves, gas laws, Le Chatelier's principle, and more, all driven by accurate equations.",
    color:     "#2563eb",
    bg:        "rgba(37,99,235,0.07)",
    border:    "rgba(37,99,235,0.16)",
    glow:      "rgba(37,99,235,0.10)",
    tag:       "Simulated",
    stat:      "20",
    statLabel: "Experiments",
  },
  {
    icon:      <GuidedIcon />,
    title:     "Guided Step-by-Step",
    desc:      "Each lab walks you through the setup, procedure, and result — with explanations at every stage so you always know what is happening.",
    color:     "#0891b2",
    bg:        "rgba(8,145,178,0.07)",
    border:    "rgba(8,145,178,0.16)",
    glow:      "rgba(8,145,178,0.09)",
    tag:       "Guided",
    stat:      "118",
    statLabel: "Elements",
  },
  {
    icon:      <AssessIcon />,
    title:     "Free, No Signup",
    desc:      "Open the app and start experimenting immediately. No account, no equipment, no cost — just chemistry you can learn by doing.",
    color:     "#059669",
    bg:        "rgba(5,150,105,0.07)",
    border:    "rgba(5,150,105,0.16)",
    glow:      "rgba(5,150,105,0.09)",
    tag:       "Free",
    stat:      "6–12",
    statLabel: "Class",
  },
];

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.10 } },
};
const card = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
};

export default function FeatureStrip() {
  return (
    <section
      id="features"
      style={{
        background: "var(--lab-white)",
        borderTop:  "1px solid var(--lab-glass-border)",
        padding:    "clamp(4rem, 8vw, 7rem) clamp(16px, 4vw, 48px)",
        position:   "relative",
        overflow:   "hidden",
      }}
    >
      {/* Background radial glow */}
      <div aria-hidden="true" style={{
        position:     "absolute",
        top:          "30%",
        left:         "50%",
        transform:    "translateX(-50%)",
        width:        "900px",
        height:       "500px",
        borderRadius: "50%",
        background:   "radial-gradient(ellipse at center, rgba(37,99,235,0.04) 0%, transparent 60%)",
        pointerEvents:"none",
      }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 10 }}>

        {/* ── Section heading ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          viewport={{ once: true, margin: "-50px" }}
          style={{ textAlign: "center", marginBottom: "4rem" }}
        >
          <span className="section-tag section-tag-blue" style={{ marginBottom: 14, display: "inline-flex" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb", flexShrink: 0 }} />
            Why ChemLab
          </span>
          <h2 className="section-heading" style={{ marginTop: "0.75rem" }}>
            Why{" "}
            <span className="gradient-text">ChemLab</span>
          </h2>
          <p className="section-subheading" style={{ maxWidth: "480px", margin: "0.85rem auto 0" }}>
            Designed so any student — beginner or advanced — can understand
            chemistry by seeing it happen in real time.
          </p>
        </motion.div>

        {/* ── Feature cards ── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {FEATURES.map(({ icon, title, desc, color, bg, border, glow, tag, stat, statLabel }) => (
            <motion.div
              key={title}
              variants={card}
              whileHover={{ y: -5, boxShadow: `0 20px 52px rgba(15,23,42,0.11), 0 4px 14px rgba(15,23,42,0.05), 0 0 0 1.5px ${color}28 inset` }}
              style={{
                display:       "flex",
                flexDirection: "column",
                padding:       "32px",
                borderRadius:  "24px",
                border:        `1px solid ${border}`,
                background:    "rgba(255,255,255,0.97)",
                boxShadow:     "0 4px 24px rgba(15,23,42,0.07), 0 1px 4px rgba(15,23,42,0.04)",
                position:      "relative",
                overflow:      "hidden",
                transition:    "box-shadow 0.22s ease",
              }}
            >
              {/* Corner glow */}
              <div aria-hidden="true" style={{
                position: "absolute", top: 0, right: 0,
                width: 160, height: 160, borderRadius: "50%",
                background: `radial-gradient(circle at 100% 0%, ${glow} 0%, transparent 60%)`,
                pointerEvents: "none",
              }} />

              {/* Top row: tag + stat */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <span style={{
                  fontSize: 9.5, fontWeight: 700, padding: "3px 11px", borderRadius: 100,
                  background: bg, color, border: `1px solid ${border}`,
                  textTransform: "uppercase", letterSpacing: "0.09em",
                }}>
                  {tag}
                </span>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "1.5rem", fontWeight: 900, color, lineHeight: 1, letterSpacing: "-0.03em" }}>{stat}</p>
                  <p style={{ fontSize: 9, fontWeight: 600, color: "var(--lab-text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 2 }}>{statLabel}</p>
                </div>
              </div>

              {/* Icon */}
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                background: bg, border: `1px solid ${border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 20, flexShrink: 0,
                boxShadow: `0 4px 18px ${glow}`,
                color,
              }}>
                {icon}
              </div>

              {/* Accent rule */}
              <div style={{
                width: 32, height: 3, borderRadius: 2,
                background: `linear-gradient(90deg, ${color}, ${color}44)`,
                marginBottom: 16,
              }} />

              <h3 style={{ fontSize: 16.5, fontWeight: 800, color: "var(--lab-text-primary)", marginBottom: 10, lineHeight: 1.28, letterSpacing: "-0.015em" }}>
                {title}
              </h3>
              <p style={{ fontSize: 13, lineHeight: 1.78, color: "var(--lab-text-muted)", flex: 1 }}>
                {desc}
              </p>

              {/* Bottom divider */}
              <div style={{ marginTop: 24, height: 1, background: `linear-gradient(90deg, transparent, ${color}28, transparent)` }} />
            </motion.div>
          ))}
        </motion.div>

        {/* ── Trust strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.52, delay: 0.28, ease: "easeOut" }}
          viewport={{ once: true }}
          style={{
            marginTop:      "3.5rem",
            padding:        "22px 32px",
            borderRadius:   "20px",
            background:     "linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(6,182,212,0.04) 50%, rgba(124,58,237,0.04) 100%)",
            border:         "1px solid rgba(37,99,235,0.11)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            flexWrap:       "wrap",
            gap:            16,
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "28px" }}>
            {[
              "No equipment needed",
              "Free, no signup",
              "Real-time feedback",
              "Class 6–12 aligned",
            ].map((text) => (
              <span key={text} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 600, color: "var(--lab-text-secondary)" }}>
                <span style={{ color: "#059669", fontWeight: 800, fontSize: 14 }}>✓</span>
                {text}
              </span>
            ))}
          </div>
          <Link
            href="/experiments"
            style={{
              display:        "inline-flex",
              alignItems:     "center",
              gap:            7,
              padding:        "10px 22px",
              borderRadius:   100,
              background:     "linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%)",
              color:          "white",
              fontSize:       13,
              fontWeight:     700,
              textDecoration: "none",
              boxShadow:      "0 4px 18px rgba(37,99,235,0.30)",
              whiteSpace:     "nowrap",
              letterSpacing:  "-0.01em",
            }}
          >
            Explore All Labs
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2.5 6h7M7 3.5l2.5 2.5L7 8.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function PhysicsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
      <path d="M2 15 C4 12 6 8 8 7 C10 6 11 10 13 9 C15 8 16 5 18 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <line x1="2" y1="17" x2="18" y2="17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      <line x1="2" y1="17" x2="2" y2="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function GuidedIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
      <circle cx="4" cy="5"  r="1.6" fill="currentColor" />
      <line x1="7.5" y1="5"  x2="18" y2="5"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="4" cy="10" r="1.6" fill="currentColor" opacity="0.7" />
      <line x1="7.5" y1="10" x2="15" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <circle cx="4" cy="15" r="1.6" fill="currentColor" opacity="0.4" />
      <line x1="7.5" y1="15" x2="12" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function AssessIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="16" height="16" rx="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.5 10 L9 12.5 L13.5 7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
