"use client";

import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState, useEffect, startTransition } from "react";

const ROTATING_WORDS = ["Titration", "Flame Tests", "Electrolysis", "Chromatography", "Calorimetry"];

const STATS = [
  { value: "20", label: "Experiments" },
  { value: "118", label: "Elements" },
  { value: "Class 6–12", label: "Curriculum" },
  { value: "Free", label: "No signup" },
];

// ── Animated SVG lab scene (right column) ──────────────────────────────────
function LabScene({ reduced }: { reduced: boolean }) {
  return (
    <svg viewBox="0 0 420 480" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      <defs>
        <linearGradient id="hero-bench" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <linearGradient id="hero-flask-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(59,130,246,0.4)" />
          <stop offset="100%" stopColor="rgba(37,99,235,0.75)" />
        </linearGradient>
        <linearGradient id="hero-burette-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(34,197,94,0.7)" />
          <stop offset="100%" stopColor="rgba(22,163,74,0.9)" />
        </linearGradient>
        <filter id="hero-glow">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="hero-shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(37,99,235,0.18)" />
        </filter>
        <clipPath id="flask-clip">
          <path d="M152 300 L132 410 Q130 424 148 424 L272 424 Q290 424 288 410 L268 300 Z" />
        </clipPath>
      </defs>

      {/* Subtle lab bench */}
      <rect x="0" y="420" width="420" height="60" fill="url(#hero-bench)" rx="0" />
      <rect x="0" y="418" width="420" height="4" fill="#94a3b8" opacity="0.3" />

      {/* ── Floating molecules (background) ── */}
      {/* H₂O molecule */}
      <motion.g
        animate={reduced ? {} : { y: [-6, 6, -6], rotate: [-4, 4, -4] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "62px 90px" }}
      >
        <circle cx="62" cy="90" r="14" fill="rgba(59,130,246,0.12)" stroke="rgba(37,99,235,0.25)" strokeWidth="1.5" />
        <circle cx="42" cy="108" r="9"  fill="rgba(239,68,68,0.10)"  stroke="rgba(220,38,38,0.22)"  strokeWidth="1.2" />
        <circle cx="84" cy="108" r="9"  fill="rgba(239,68,68,0.10)"  stroke="rgba(220,38,38,0.22)"  strokeWidth="1.2" />
        <line x1="62" y1="100" x2="50" y2="107" stroke="rgba(148,163,184,0.4)" strokeWidth="1.5" />
        <line x1="62" y1="100" x2="74" y2="107" stroke="rgba(148,163,184,0.4)" strokeWidth="1.5" />
        <text x="62" y="95" textAnchor="middle" fontSize="9" fontWeight="700" fill="rgba(37,99,235,0.7)">O</text>
        <text x="42" y="113" textAnchor="middle" fontSize="8" fill="rgba(220,38,38,0.7)">H</text>
        <text x="84" y="113" textAnchor="middle" fontSize="8" fill="rgba(220,38,38,0.7)">H</text>
      </motion.g>

      {/* CO₂ molecule */}
      <motion.g
        animate={reduced ? {} : { y: [5, -8, 5], x: [-3, 3, -3] }}
        transition={{ duration: 6.8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        style={{ transformOrigin: "360px 70px" }}
      >
        <circle cx="330" cy="70" r="10" fill="rgba(239,68,68,0.10)" stroke="rgba(220,38,38,0.22)" strokeWidth="1.2" />
        <circle cx="360" cy="70" r="13" fill="rgba(15,23,42,0.08)"   stroke="rgba(30,41,59,0.22)"  strokeWidth="1.5" />
        <circle cx="390" cy="70" r="10" fill="rgba(239,68,68,0.10)" stroke="rgba(220,38,38,0.22)" strokeWidth="1.2" />
        <line x1="341" y1="70" x2="348" y2="70" stroke="rgba(148,163,184,0.5)" strokeWidth="2" />
        <line x1="372" y1="70" x2="379" y2="70" stroke="rgba(148,163,184,0.5)" strokeWidth="2" />
        <text x="330" y="74" textAnchor="middle" fontSize="8" fill="rgba(220,38,38,0.7)">O</text>
        <text x="360" y="74" textAnchor="middle" fontSize="8" fill="rgba(30,41,59,0.7)">C</text>
        <text x="390" y="74" textAnchor="middle" fontSize="8" fill="rgba(220,38,38,0.7)">O</text>
      </motion.g>

      {/* NaCl ion */}
      <motion.g
        animate={reduced ? {} : { rotate: [0, 360] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "370px 200px" }}
      >
        <circle cx="356" cy="200" r="10" fill="rgba(251,191,36,0.15)" stroke="rgba(245,158,11,0.3)" strokeWidth="1.2" />
        <circle cx="384" cy="200" r="12" fill="rgba(168,85,247,0.12)" stroke="rgba(139,92,246,0.25)" strokeWidth="1.2" />
        <line x1="366" y1="200" x2="372" y2="200" stroke="rgba(148,163,184,0.4)" strokeWidth="1.5" />
        <text x="356" y="204" textAnchor="middle" fontSize="8" fill="rgba(217,119,6,0.8)">Na⁺</text>
        <text x="384" y="204" textAnchor="middle" fontSize="8" fill="rgba(109,40,217,0.8)">Cl⁻</text>
      </motion.g>

      {/* ── Erlenmeyer Flask ── */}
      <g filter="url(#hero-shadow)">
        {/* Flask body */}
        <path d="M152 300 L132 410 Q130 424 148 424 L272 424 Q290 424 288 410 L268 300 Z"
          fill="rgba(241,245,249,0.55)" stroke="#64748b" strokeWidth="2.2" />
        {/* Neck */}
        <rect x="186" y="228" width="48" height="76" rx="4"
          fill="rgba(241,245,249,0.52)" stroke="#64748b" strokeWidth="1.9" />
        {/* Animated liquid — color-cycling */}
        <motion.path
          d="M146 390 L286 390 L285 410 Q283 424 268 424 L152 424 Q137 424 135 410 Z"
          clipPath="url(#flask-clip)"
          animate={reduced ? {} : {
            fill: ["rgba(59,130,246,0.65)", "rgba(239,68,68,0.6)", "rgba(34,197,94,0.65)",
                   "rgba(168,85,247,0.6)", "rgba(59,130,246,0.65)"],
          }}
          style={{ fill: "rgba(59,130,246,0.65)" }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Meniscus */}
        <motion.path
          d="M148 390 Q210 383 286 390"
          fill="none"
          stroke="rgba(148,163,184,0.5)" strokeWidth="1.5"
        />
        {/* Bubbles */}
        {!reduced && [162,180,198,216,234].map((x, i) => (
          <motion.circle key={x} cx={x} cy={414} r="3.5"
            fill="rgba(255,255,255,0.6)" stroke="rgba(148,163,184,0.3)" strokeWidth="0.8"
            animate={{ cy:[414, 395, 375], opacity:[0.8,0.6,0], scale:[1, 0.9, 0.7] }}
            transition={{ duration:2.4, repeat:Infinity, delay:i*0.55, ease:"easeOut" }}
          />
        ))}
        {/* Glass sheen */}
        <rect x="140" y="302" width="13" height="120" fill="rgba(255,255,255,0.3)" rx="5" />
      </g>

      {/* ── Burette ── */}
      <g opacity="0.9">
        {/* Retort stand */}
        <rect x="84" y="148" width="10" height="272" rx="4" fill="#94a3b8" opacity="0.45" />
        <rect x="72" y="152" width="34" height="10" rx="3" fill="#64748b" opacity="0.5" />
        {/* Burette tube */}
        <rect x="78" y="155" width="28" height="198" rx="3"
          fill="rgba(241,245,249,0.52)" stroke="#64748b" strokeWidth="1.6" />
        {/* EDTA liquid */}
        <motion.rect x="80" y="158" width="24" height="150"
          fill="url(#hero-burette-fill)"
          animate={reduced ? {} : { height:[150, 110, 78, 50, 110, 150] }}
          transition={{ duration:10, repeat:Infinity, ease:"easeInOut" }}
        />
        {/* Stopcock */}
        <rect x="74" y="350" width="36" height="12" rx="3" fill="#475569" opacity="0.7" />
        {/* Drop animation */}
        {!reduced && (
          <motion.ellipse cx="92" cy="368" rx="3" ry="4"
            fill="rgba(34,197,94,0.8)"
            animate={{ cy:[368, 290], opacity:[0.9,0], scaleY:[1,1.4] }}
            transition={{ duration:0.9, repeat:Infinity, repeatDelay:1.2, ease:"easeIn" }}
          />
        )}
        {/* Sheen */}
        <rect x="80" y="157" width="7" height="192" fill="rgba(255,255,255,0.3)" rx="2" />
      </g>

      {/* ── Bunsen Burner (right side) ── */}
      <g>
        {/* Base */}
        <rect x="320" y="385" width="50" height="34" rx="5" fill="#94a3b8" opacity="0.6" />
        {/* Barrel */}
        <rect x="333" y="320" width="24" height="68" rx="5" fill="#64748b" opacity="0.65" />
        {/* Flame */}
        <motion.path
          d="M345 322 Q336 298 345 278 Q354 298 364 278 Q354 315 345 322"
          fill="#f97316" opacity="0.85"
          animate={reduced ? {} : { scaleY:[1,1.18,0.92,1], scaleX:[1,0.88,1.06,1] }}
          transition={{ duration:1.1, repeat:Infinity, ease:"easeInOut" }}
          style={{ transformOrigin:"345px 322px" }}
        />
        <motion.path
          d="M345 322 Q340 306 345 290 Q350 306 345 322"
          fill="#fcd34d" opacity="0.7"
          animate={reduced ? {} : { scaleY:[1,1.12,0.9,1] }}
          transition={{ duration:0.82, repeat:Infinity, ease:"easeInOut" }}
          style={{ transformOrigin:"345px 322px" }}
        />
        {/* Blue inner cone */}
        <motion.path
          d="M345 322 Q342 316 345 308 Q348 316 345 322"
          fill="#93c5fd" opacity="0.8"
          animate={reduced ? {} : { scaleY:[1,1.08,0.94,1] }}
          transition={{ duration:0.6, repeat:Infinity, ease:"easeInOut" }}
          style={{ transformOrigin:"345px 322px" }}
        />
      </g>

      {/* ── Test tube (small, left) ── */}
      <motion.g
        animate={reduced ? {} : { rotate: [-3, 3, -3] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "52px 340px" }}
      >
        <path d="M44 288 L44 374 Q44 384 52 384 Q60 384 60 374 L60 288 Z"
          fill="rgba(241,245,249,0.55)" stroke="#94a3b8" strokeWidth="1.5" />
        <motion.rect x="46" y="320" width="12" height="58"
          animate={reduced ? {} : { fill:["rgba(239,68,68,0.6)","rgba(168,85,247,0.6)","rgba(239,68,68,0.6)"] }}
          style={{ fill: "rgba(239,68,68,0.6)" }}
          transition={{ duration:5, repeat:Infinity }}
        />
        <rect x="46" y="290" width="4" height="88" fill="rgba(255,255,255,0.3)" rx="2" />
      </motion.g>

      {/* ── Periodic table tile (floating) ── */}
      <motion.g
        animate={reduced ? {} : { y: [-5, 5, -5], x: [-2, 2, -2] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <rect x="10" y="152" width="56" height="64" rx="10"
          fill="rgba(37,99,235,0.88)"
          filter="url(#hero-glow)"
        />
        <text x="38" y="173" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.7)">6</text>
        <text x="38" y="196" textAnchor="middle" fontSize="22" fontWeight="900" fill="white">C</text>
        <text x="38" y="210" textAnchor="middle" fontSize="8.5" fill="rgba(255,255,255,0.8)">Carbon</text>
      </motion.g>

      {/* Another element tile */}
      <motion.g
        animate={reduced ? {} : { y: [4, -4, 4], x: [2, -2, 2] }}
        transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      >
        <rect x="358" y="285" width="50" height="58" rx="9"
          fill="rgba(234,88,12,0.85)"
          filter="url(#hero-glow)"
        />
        <text x="383" y="303" textAnchor="middle" fontSize="8.5" fill="rgba(255,255,255,0.7)">79</text>
        <text x="383" y="324" textAnchor="middle" fontSize="19" fontWeight="900" fill="white">Au</text>
        <text x="383" y="337" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.8)">Gold</text>
      </motion.g>
    </svg>
  );
}

export default function HeroSection() {
  const [wordIdx, setWordIdx] = useState(0);
  const reduced = useReducedMotion() ?? false;

  useEffect(() => {
    const t = setInterval(() => startTransition(() => setWordIdx(i => (i + 1) % ROTATING_WORDS.length)), 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <section
      id="lab"
      style={{
        position:      "relative",
        overflow:      "hidden",
        paddingTop:    "clamp(4rem, 8vw, 7rem)",
        paddingBottom: "clamp(3rem, 6vw, 5.5rem)",
        background:
          "radial-gradient(ellipse at 15% 55%, rgba(37,99,235,0.07) 0%, transparent 55%)," +
          "radial-gradient(ellipse at 85% 20%, rgba(14,165,233,0.05) 0%, transparent 52%)," +
          "radial-gradient(ellipse at 60% 90%, rgba(168,85,247,0.04) 0%, transparent 45%)," +
          "linear-gradient(175deg, #f0f6ff 0%, #ffffff 50%, #f8fafc 100%)",
      }}
    >
      {/* Dot grid */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle, rgba(59,130,246,0.045) 1px, transparent 1px)",
        backgroundSize:  "38px 38px",
        pointerEvents:   "none",
      }} />

      <div style={{
        position: "relative", zIndex: 10,
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 clamp(16px, 4vw, 48px)",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "clamp(2rem, 5vw, 5rem)",
        alignItems: "center",
      }}>
        {/* ─── Left column: text ─── */}
        <div>
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22,1,0.36,1] }}
            style={{ marginBottom: 24 }}
          >
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "5px 16px", borderRadius: 100,
              background: "rgba(37,99,235,0.07)", border: "1px solid rgba(37,99,235,0.18)",
              fontSize: 11, fontWeight: 700, color: "#2563eb",
              textTransform: "uppercase", letterSpacing: "0.10em",
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: "#2563eb", boxShadow: "0 0 8px rgba(37,99,235,0.7)",
                animation: "blink-dot 1.4s ease-in-out infinite", flexShrink: 0,
              }} />
              Virtual Chemistry Laboratory
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 0.08, ease: [0.22,1,0.36,1] }}
            style={{
              fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)",
              fontWeight: 900, lineHeight: 1.07,
              letterSpacing: "-0.038em",
              color: "var(--lab-text-primary)",
              marginBottom: "1.25rem",
            }}
          >
            Learn Chemistry
            <br />
            by{" "}
            <span style={{
              background: "linear-gradient(128deg, #1d4ed8 0%, #2563eb 38%, #0ea5e9 70%, #7c3aed 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Doing It
            </span>
          </motion.h1>

          {/* Rotating experiment word */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.22 }}
            style={{ marginBottom: "1.75rem", height: "2rem" }}
          >
            <span style={{ fontSize: "1rem", color: "var(--lab-text-muted)", fontWeight: 500 }}>
              Perform interactive{" "}
            </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={wordIdx}
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? {} : { opacity: 0, y: -12 }}
                transition={{ duration: reduced ? 0 : 0.3 }}
                style={{
                  fontSize: "1rem", fontWeight: 700,
                  background: "linear-gradient(128deg, #1d4ed8, #0ea5e9)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {ROTATING_WORDS[wordIdx]}
              </motion.span>
            </AnimatePresence>
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.60, delay: 0.30, ease: [0.22,1,0.36,1] }}
            style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: "2.5rem" }}
          >
            <Link href="/experiments" style={{
              display: "inline-flex", alignItems: "center", gap: 9,
              padding: "14px 28px", borderRadius: 14,
              background: "linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%)",
              color: "white", fontSize: "15px", fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 4px 22px rgba(37,99,235,0.38), 0 1px 0 rgba(255,255,255,0.15) inset",
              transition: "transform 0.18s ease, box-shadow 0.18s ease",
              letterSpacing: "-0.01em",
            }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform="translateY(-2px)"; el.style.boxShadow="0 10px 34px rgba(37,99,235,0.44), 0 1px 0 rgba(255,255,255,0.15) inset"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform="translateY(0)"; el.style.boxShadow="0 4px 22px rgba(37,99,235,0.38), 0 1px 0 rgba(255,255,255,0.15) inset"; }}
            >
              Start Experimenting
              <svg width="15" height="15" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 7h8M8 4l3 3-3 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>

            <a href="#elements"
              onClick={e => { e.preventDefault(); document.getElementById("elements")?.scrollIntoView({ behavior:"smooth" }); }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 24px", borderRadius: 14,
                background: "rgba(255,255,255,0.95)", border: "1px solid rgba(148,163,184,0.22)",
                color: "var(--lab-text-secondary)", fontSize: "15px", fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 2px 12px rgba(15,23,42,0.07)",
                transition: "transform 0.18s ease, box-shadow 0.18s ease",
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform="translateY(-2px)"; el.style.boxShadow="0 8px 24px rgba(15,23,42,0.10)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform="translateY(0)"; el.style.boxShadow="0 2px 12px rgba(15,23,42,0.07)"; }}
            >
              <svg width="15" height="15" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                <text x="7" y="9.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="currentColor">Pt</text>
              </svg>
              Periodic Table
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.42, ease: [0.22,1,0.36,1] }}
            style={{ display: "flex", gap: "clamp(20px, 3vw, 36px)", flexWrap: "wrap", alignItems: "flex-start" }}
          >
            {STATS.map(({ value, label }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <p style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--lab-text-primary)", lineHeight: 1, letterSpacing: "-0.03em" }}>
                  {value}
                </p>
                <p style={{ fontSize: 10, fontWeight: 600, color: "var(--lab-text-muted)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  {label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ─── Right column: animated lab scene ─── */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.85, delay: 0.15, ease: [0.22,1,0.36,1] }}
          style={{
            position: "relative",
            height: "clamp(320px, 45vw, 500px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Radial glow behind scene */}
          <div style={{
            position: "absolute", inset: "10%",
            background: "radial-gradient(ellipse, rgba(37,99,235,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <LabScene reduced={reduced} />
        </motion.div>
      </div>

      {/* Responsive: stack on mobile */}
      <style>{`
        @media (max-width: 768px) {
          #lab > div > div:last-child { display: none !important; }
          #lab > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
