"use client";

import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState, useEffect, startTransition } from "react";

const ROTATING_WORDS = [
  "Titration", "Flame Tests", "Electrolysis",
  "Chromatography", "Calorimetry", "Gas Laws", "Redox Reactions",
];

const STATS = [
  { value: "20",       label: "Experiments",   color: "#2563eb" },
  { value: "118",      label: "Elements",      color: "#7c3aed" },
  { value: "Class 6–12", label: "Curriculum",  color: "#0891b2" },
  { value: "Free",     label: "No signup",     color: "#059669" },
];

// ── Element ticker data (all 118 symbols with category class) ─────────────────
const TICKER_ELEMENTS: { sym: string; cls?: string }[] = [
  { sym:"H",cls:"is-nonmetal" },  { sym:"He",cls:"is-noble" },
  { sym:"Li",cls:"is-alkali" },   { sym:"Be" }, { sym:"B" },
  { sym:"C",cls:"is-nonmetal" },  { sym:"N",cls:"is-nonmetal" },
  { sym:"O",cls:"is-nonmetal" },  { sym:"F",cls:"is-nonmetal" },
  { sym:"Ne",cls:"is-noble" },    { sym:"Na",cls:"is-alkali" },
  { sym:"Mg" }, { sym:"Al" }, { sym:"Si" },
  { sym:"P",cls:"is-nonmetal" },  { sym:"S",cls:"is-nonmetal" },
  { sym:"Cl",cls:"is-nonmetal" }, { sym:"Ar",cls:"is-noble" },
  { sym:"K",cls:"is-alkali" },    { sym:"Ca" },
  { sym:"Sc",cls:"is-transition" }, { sym:"Ti",cls:"is-transition" },
  { sym:"V",cls:"is-transition" },  { sym:"Cr",cls:"is-transition" },
  { sym:"Mn",cls:"is-transition" }, { sym:"Fe",cls:"is-transition" },
  { sym:"Co",cls:"is-transition" }, { sym:"Ni",cls:"is-transition" },
  { sym:"Cu",cls:"is-transition" }, { sym:"Zn" },
  { sym:"Ga" }, { sym:"Ge" },
  { sym:"As" }, { sym:"Se" }, { sym:"Br",cls:"is-nonmetal" },
  { sym:"Kr",cls:"is-noble" },    { sym:"Rb",cls:"is-alkali" },
  { sym:"Sr" }, { sym:"Y" },
  { sym:"Zr",cls:"is-transition" }, { sym:"Nb",cls:"is-transition" },
  { sym:"Mo",cls:"is-transition" }, { sym:"Tc",cls:"is-transition" },
  { sym:"Ru",cls:"is-transition" }, { sym:"Rh",cls:"is-transition" },
  { sym:"Pd",cls:"is-transition" }, { sym:"Ag",cls:"is-transition" },
  { sym:"Cd" }, { sym:"In" }, { sym:"Sn" },
  { sym:"Sb" }, { sym:"Te" },
  { sym:"I",cls:"is-nonmetal" },  { sym:"Xe",cls:"is-noble" },
  { sym:"Cs",cls:"is-alkali" },   { sym:"Ba" },
  { sym:"La" }, { sym:"Ce" }, { sym:"Pr" }, { sym:"Nd" },
  { sym:"Pm" }, { sym:"Sm" }, { sym:"Eu" }, { sym:"Gd" },
  { sym:"Tb" }, { sym:"Dy" }, { sym:"Ho" }, { sym:"Er" },
  { sym:"Tm" }, { sym:"Yb" }, { sym:"Lu" },
  { sym:"Hf",cls:"is-transition" }, { sym:"Ta",cls:"is-transition" },
  { sym:"W",cls:"is-transition" },  { sym:"Re",cls:"is-transition" },
  { sym:"Os",cls:"is-transition" }, { sym:"Ir",cls:"is-transition" },
  { sym:"Pt",cls:"is-transition" }, { sym:"Au",cls:"is-transition" },
  { sym:"Hg" }, { sym:"Tl" }, { sym:"Pb" },
  { sym:"Bi" }, { sym:"Po" },
  { sym:"At" }, { sym:"Rn",cls:"is-noble" },
  { sym:"Fr",cls:"is-alkali" }, { sym:"Ra" },
  { sym:"Ac" }, { sym:"Th" }, { sym:"Pa" }, { sym:"U" },
  { sym:"Np" }, { sym:"Pu" }, { sym:"Am" }, { sym:"Cm" },
  { sym:"Bk" }, { sym:"Cf" }, { sym:"Es" }, { sym:"Fm" },
  { sym:"Md" }, { sym:"No" }, { sym:"Lr" },
  { sym:"Rf",cls:"is-transition" }, { sym:"Db",cls:"is-transition" },
  { sym:"Sg",cls:"is-transition" }, { sym:"Bh",cls:"is-transition" },
  { sym:"Hs",cls:"is-transition" }, { sym:"Mt",cls:"is-transition" },
  { sym:"Ds",cls:"is-transition" }, { sym:"Rg",cls:"is-transition" },
  { sym:"Cn" }, { sym:"Nh" }, { sym:"Fl" },
  { sym:"Mc" }, { sym:"Lv" }, { sym:"Ts" }, { sym:"Og",cls:"is-noble" },
];

// Ambient formula labels floating in background
const AMBIENT_FORMULAS = [
  { text:"H₂SO₄", x:"4%",  y:"13%", size:10, opacity:0.052, delay:0,   rot:-5 },
  { text:"NaOH",   x:"91%", y:"18%", size:10, opacity:0.045, delay:1.4, rot:6  },
  { text:"Fe³⁺",   x:"6%",  y:"62%", size:9,  opacity:0.048, delay:2.1, rot:-8 },
  { text:"CH₄",    x:"87%", y:"72%", size:9,  opacity:0.04,  delay:0.7, rot:9  },
  { text:"ΔG=0",   x:"47%", y:"6%",  size:13, opacity:0.036, delay:1.8, rot:2  },
  { text:"PV=nRT", x:"73%", y:"54%", size:8,  opacity:0.035, delay:3.0, rot:-3 },
  { text:"pH",     x:"17%", y:"38%", size:13, opacity:0.048, delay:0.4, rot:4  },
  { text:"⇌",      x:"93%", y:"44%", size:17, opacity:0.038, delay:2.5, rot:0  },
  { text:"Ksp",    x:"30%", y:"91%", size:10, opacity:0.038, delay:1.1, rot:-6 },
  { text:"E°cell", x:"59%", y:"95%", size:9,  opacity:0.035, delay:1.6, rot:3  },
  { text:"λ",      x:"78%", y:"8%",  size:15, opacity:0.032, delay:0.9, rot:-2 },
  { text:"ΔH",     x:"22%", y:"88%", size:12, opacity:0.038, delay:2.8, rot:7  },
];

// Floating particle dots
const PARTICLES = [
  { x:"11%",  y:"28%", s:3.5, c:"#2563eb", o:0.22, dur:6,  delay:0   },
  { x:"89%",  y:"26%", s:2.5, c:"#7c3aed", o:0.18, dur:7.5,delay:1.2 },
  { x:"21%",  y:"78%", s:3,   c:"#0ea5e9", o:0.20, dur:5.5,delay:2.4 },
  { x:"79%",  y:"62%", s:2,   c:"#2563eb", o:0.16, dur:8,  delay:0.6 },
  { x:"54%",  y:"86%", s:2.5, c:"#7c3aed", o:0.15, dur:6.5,delay:1.8 },
  { x:"36%",  y:"10%", s:3,   c:"#0ea5e9", o:0.18, dur:7,  delay:3.1 },
  { x:"66%",  y:"20%", s:2,   c:"#2563eb", o:0.15, dur:5,  delay:0.3 },
  { x:"7%",   y:"50%", s:2.5, c:"#7c3aed", o:0.18, dur:9,  delay:2.0 },
  { x:"93%",  y:"58%", s:2,   c:"#0ea5e9", o:0.14, dur:6,  delay:1.5 },
  { x:"48%",  y:"93%", s:3.5, c:"#2563eb", o:0.20, dur:7,  delay:0.8 },
  { x:"15%",  y:"88%", s:2,   c:"#059669", o:0.16, dur:8,  delay:2.8 },
  { x:"83%",  y:"86%", s:3,   c:"#f97316", o:0.14, dur:5.5,delay:1.1 },
];

// ── Element ticker strip ────────────────────────────────────────────────────────
function ElementTicker() {
  const doubled = [...TICKER_ELEMENTS, ...TICKER_ELEMENTS];
  return (
    <div className="hero-ticker-wrap" aria-hidden="true">
      <div className="hero-ticker-inner">
        {doubled.map((el, i) => (
          <span key={i} className={`hero-ticker-item${el.cls ? ` ${el.cls}` : ""}`}>
            {el.sym}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Chemistry ambient background ───────────────────────────────────────────────
function ChemistryBackground({ reduced }: { reduced: boolean }) {
  if (reduced) return null;
  return (
    <>
      {/* Floating formula labels */}
      {AMBIENT_FORMULAS.map((f, i) => (
        <div
          key={i}
          className="hero-ambient-label"
          style={{
            left:           f.x,
            top:            f.y,
            fontSize:       f.size,
            fontWeight:     700,
            color:          `rgba(15,23,42,${f.opacity})`,
            letterSpacing:  "0.05em",
            zIndex:         0,
            "--f-rot":      `${f.rot}deg`,
            animationDelay: `${f.delay}s`,
          } as React.CSSProperties}
        >
          {f.text}
        </div>
      ))}

      {/* Floating particle dots */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="hero-particle"
          style={{
            left:            p.x,
            top:             p.y,
            width:           p.s,
            height:          p.s,
            background:      p.c,
            boxShadow:       `0 0 ${p.s * 4}px ${p.c}60`,
            "--p-o":         p.o,
            "--p-dur":       `${p.dur}s`,
            "--p-delay":     `${p.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
}

// ── Orbital atom decoration (SVG, placed in lab scene) ─────────────────────────
function AtomOrbitalSVG({ reduced }: { reduced: boolean }) {
  const cx = 375, cy = 115, r1 = 38, r2 = 52, r3 = 44;
  const e1 = [
    { cx: cx + r1, cy }, { cx, cy: cy + r1 * 0.4 },
    { cx: cx - r1, cy }, { cx, cy: cy - r1 * 0.4 }, { cx: cx + r1, cy },
  ];
  const e2 = [
    { cx: cx + r2 * 0.7, cy: cy + r2 * 0.5 },
    { cx: cx - r2 * 0.5, cy: cy + r2 * 0.7 },
    { cx: cx - r2 * 0.7, cy: cy - r2 * 0.5 },
    { cx: cx + r2 * 0.5, cy: cy - r2 * 0.7 },
    { cx: cx + r2 * 0.7, cy: cy + r2 * 0.5 },
  ];
  const e3 = [
    { cx: cx - r3 * 0.6, cy: cy + r3 * 0.6 },
    { cx: cx + r3 * 0.8, cy: cy + r3 * 0.2 },
    { cx: cx + r3 * 0.2, cy: cy - r3 * 0.8 },
    { cx: cx - r3 * 0.7, cy: cy - r3 * 0.5 },
    { cx: cx - r3 * 0.6, cy: cy + r3 * 0.6 },
  ];

  return (
    <g opacity="0.38">
      {/* Nucleus */}
      <circle cx={cx} cy={cy} r={10} fill="#2563eb" />
      <circle cx={cx} cy={cy} r={16} fill="none" stroke="#2563eb" strokeWidth="0.8" opacity="0.5" />
      {/* Orbit rings */}
      <ellipse cx={cx} cy={cy} rx={r1} ry={r1 * 0.38} stroke="#2563eb" strokeWidth="0.9" fill="none" opacity="0.7" />
      <ellipse cx={cx} cy={cy} rx={r2} ry={r2 * 0.7} stroke="#7c3aed" strokeWidth="0.9" fill="none" opacity="0.7" transform={`rotate(55 ${cx} ${cy})`} />
      <ellipse cx={cx} cy={cy} rx={r3} ry={r3 * 0.5} stroke="#0ea5e9" strokeWidth="0.9" fill="none" opacity="0.7" transform={`rotate(-40 ${cx} ${cy})`} />
      {/* Orbiting electrons */}
      {!reduced && (
        <>
          <motion.circle r={4} fill="#2563eb"
            animate={{ cx: e1.map(p=>p.cx), cy: e1.map(p=>p.cy) }}
            transition={{ duration:3.2, repeat:Infinity, ease:"linear" }}
          />
          <motion.circle r={3.5} fill="#7c3aed"
            animate={{ cx: e2.map(p=>p.cx), cy: e2.map(p=>p.cy) }}
            transition={{ duration:4.8, repeat:Infinity, ease:"linear" }}
          />
          <motion.circle r={3} fill="#0ea5e9"
            animate={{ cx: e3.map(p=>p.cx), cy: e3.map(p=>p.cy) }}
            transition={{ duration:3.8, repeat:Infinity, ease:"linear", delay:1.2 }}
          />
        </>
      )}
    </g>
  );
}

// ── Animated SVG lab scene ─────────────────────────────────────────────────────
function LabScene({ reduced }: { reduced: boolean }) {
  return (
    <svg viewBox="0 0 420 490" style={{ width:"100%", height:"100%", overflow:"visible" }} aria-hidden="true">
      <defs>
        <linearGradient id="hero-bench" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e2e8f0"/>
          <stop offset="100%" stopColor="#cbd5e1"/>
        </linearGradient>
        <linearGradient id="hero-flask-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(59,130,246,0.4)"/>
          <stop offset="100%" stopColor="rgba(37,99,235,0.75)"/>
        </linearGradient>
        <linearGradient id="hero-burette-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(34,197,94,0.7)"/>
          <stop offset="100%" stopColor="rgba(22,163,74,0.9)"/>
        </linearGradient>
        <linearGradient id="hero-flask2-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(168,85,247,0.35)"/>
          <stop offset="100%" stopColor="rgba(124,58,237,0.70)"/>
        </linearGradient>
        <filter id="hero-glow">
          <feGaussianBlur stdDeviation="5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="hero-glow-soft">
          <feGaussianBlur stdDeviation="8" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="hero-shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(37,99,235,0.14)"/>
        </filter>
        <clipPath id="flask-clip">
          <path d="M152 300 L132 415 Q130 428 148 428 L272 428 Q290 428 288 415 L268 300Z"/>
        </clipPath>
        <clipPath id="flask2-clip">
          <path d="M300 335 L284 415 Q282 426 296 426 L374 426 Q388 426 386 415 L370 335Z"/>
        </clipPath>
      </defs>

      {/* Lab bench */}
      <rect x="0" y="426" width="420" height="64" fill="url(#hero-bench)"/>
      <rect x="0" y="424" width="420" height="4" fill="#94a3b8" opacity="0.28"/>
      <rect x="16" y="428" width="388" height="2" fill="rgba(255,255,255,0.5)" rx="1"/>

      {/* ── Atom orbital decoration (top right) ── */}
      <AtomOrbitalSVG reduced={reduced} />

      {/* ── Floating molecules ── */}

      {/* H₂O */}
      <motion.g
        animate={reduced ? {} : { y:[-6,6,-6], rotate:[-4,4,-4] }}
        transition={{ duration:5.5, repeat:Infinity, ease:"easeInOut" }}
        style={{ transformOrigin:"62px 98px" }}
      >
        <circle cx="62" cy="98" r="14" fill="rgba(59,130,246,0.12)" stroke="rgba(37,99,235,0.25)" strokeWidth="1.5"/>
        <circle cx="42" cy="116" r="9"  fill="rgba(239,68,68,0.10)"  stroke="rgba(220,38,38,0.22)" strokeWidth="1.2"/>
        <circle cx="84" cy="116" r="9"  fill="rgba(239,68,68,0.10)"  stroke="rgba(220,38,38,0.22)" strokeWidth="1.2"/>
        <line x1="62" y1="108" x2="50" y2="115" stroke="rgba(148,163,184,0.38)" strokeWidth="1.4"/>
        <line x1="62" y1="108" x2="74" y2="115" stroke="rgba(148,163,184,0.38)" strokeWidth="1.4"/>
        <text x="62" y="103" textAnchor="middle" fontSize="9" fontWeight="700" fill="rgba(37,99,235,0.65)">O</text>
        <text x="42" y="121" textAnchor="middle" fontSize="8" fill="rgba(220,38,38,0.65)">H</text>
        <text x="84" y="121" textAnchor="middle" fontSize="8" fill="rgba(220,38,38,0.65)">H</text>
      </motion.g>

      {/* CO₂ */}
      <motion.g
        animate={reduced ? {} : { y:[5,-8,5], x:[-3,3,-3] }}
        transition={{ duration:6.8, repeat:Infinity, ease:"easeInOut", delay:1.2 }}
        style={{ transformOrigin:"360px 76px" }}
      >
        <circle cx="330" cy="76" r="10" fill="rgba(239,68,68,0.10)" stroke="rgba(220,38,38,0.22)" strokeWidth="1.2"/>
        <circle cx="360" cy="76" r="13" fill="rgba(15,23,42,0.07)"  stroke="rgba(30,41,59,0.20)"  strokeWidth="1.5"/>
        <circle cx="390" cy="76" r="10" fill="rgba(239,68,68,0.10)" stroke="rgba(220,38,38,0.22)" strokeWidth="1.2"/>
        <line x1="341" y1="76" x2="348" y2="76" stroke="rgba(148,163,184,0.45)" strokeWidth="1.8"/>
        <line x1="372" y1="76" x2="379" y2="76" stroke="rgba(148,163,184,0.45)" strokeWidth="1.8"/>
        <text x="330" y="80" textAnchor="middle" fontSize="8" fill="rgba(220,38,38,0.65)">O</text>
        <text x="360" y="80" textAnchor="middle" fontSize="8" fill="rgba(30,41,59,0.65)">C</text>
        <text x="390" y="80" textAnchor="middle" fontSize="8" fill="rgba(220,38,38,0.65)">O</text>
      </motion.g>

      {/* CH₄ — methane tetrahedral */}
      <motion.g
        animate={reduced ? {} : { rotate:[0,5,-5,0], y:[-4,4,-4] }}
        transition={{ duration:7.2, repeat:Infinity, ease:"easeInOut", delay:0.5 }}
        style={{ transformOrigin:"64px 230px" }}
      >
        <circle cx="64" cy="230" r="13" fill="rgba(51,65,85,0.08)" stroke="rgba(51,65,85,0.22)" strokeWidth="1.4"/>
        {[[44,212],[84,212],[44,248],[84,248]].map(([hx,hy],i)=>(
          <g key={i}>
            <line x1="64" y1="230" x2={hx} y2={hy} stroke="rgba(148,163,184,0.38)" strokeWidth="1.2"/>
            <circle cx={hx} cy={hy} r={8} fill="rgba(239,68,68,0.10)" stroke="rgba(220,38,38,0.20)" strokeWidth="1"/>
          </g>
        ))}
        <text x="64"  y="234" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="rgba(30,41,59,0.6)">C</text>
        {[[44,217],[84,217],[44,253],[84,253]].map(([hx,hy],i)=>(
          <text key={i} x={hx} y={hy} textAnchor="middle" fontSize="7.5" fill="rgba(220,38,38,0.6)">H</text>
        ))}
      </motion.g>

      {/* NaCl ion pair */}
      <motion.g
        animate={reduced ? {} : { rotate:[0,360] }}
        transition={{ duration:18, repeat:Infinity, ease:"linear" }}
        style={{ transformOrigin:"368px 208px" }}
      >
        <circle cx="354" cy="208" r="10" fill="rgba(251,191,36,0.15)" stroke="rgba(245,158,11,0.30)" strokeWidth="1.2"/>
        <circle cx="382" cy="208" r="12" fill="rgba(168,85,247,0.12)" stroke="rgba(139,92,246,0.25)" strokeWidth="1.2"/>
        <line x1="364" y1="208" x2="370" y2="208" stroke="rgba(148,163,184,0.38)" strokeWidth="1.5"/>
        <text x="354" y="212" textAnchor="middle" fontSize="8" fill="rgba(217,119,6,0.75)">Na⁺</text>
        <text x="382" y="212" textAnchor="middle" fontSize="8" fill="rgba(109,40,217,0.75)">Cl⁻</text>
      </motion.g>

      {/* ── Erlenmeyer Flask (main, center) ── */}
      <g filter="url(#hero-shadow)">
        <path d="M152 300 L132 415 Q130 428 148 428 L272 428 Q290 428 288 415 L268 300Z"
          fill="rgba(241,245,249,0.52)" stroke="#64748b" strokeWidth="2.2"/>
        <rect x="186" y="228" width="48" height="76" rx="4"
          fill="rgba(241,245,249,0.50)" stroke="#64748b" strokeWidth="1.9"/>
        {/* Liquid — color cycling */}
        <motion.path
          d="M146 395 L286 395 L285 415 Q283 428 268 428 L152 428 Q137 428 135 415Z"
          clipPath="url(#flask-clip)"
          animate={reduced ? {} : {
            fill:["rgba(59,130,246,0.62)","rgba(239,68,68,0.58)","rgba(34,197,94,0.62)","rgba(168,85,247,0.58)","rgba(59,130,246,0.62)"],
          }}
          style={{ fill:"rgba(59,130,246,0.62)" }}
          transition={{ duration:9, repeat:Infinity, ease:"easeInOut" }}
        />
        {/* Meniscus curve */}
        <path d="M148 395 Q210 388 286 395" fill="none" stroke="rgba(148,163,184,0.45)" strokeWidth="1.4"/>
        {/* Bubbles */}
        {!reduced && [160,178,196,214,232].map((x,i)=>(
          <motion.circle key={x} cx={x} cy={418} r={3.5}
            fill="rgba(255,255,255,0.58)" stroke="rgba(148,163,184,0.28)" strokeWidth="0.8"
            animate={{ cy:[418,398,378], opacity:[0.8,0.55,0], scale:[1,0.9,0.7] }}
            transition={{ duration:2.5, repeat:Infinity, delay:i*0.5, ease:"easeOut" }}
          />
        ))}
        {/* Sheen */}
        <rect x="140" y="302" width="12" height="122" fill="rgba(255,255,255,0.28)" rx="5"/>
        <rect x="282" y="302" width="6" height="80" fill="rgba(255,255,255,0.12)" rx="3"/>
      </g>

      {/* ── Second flask (right, purple) ── */}
      <g opacity="0.78">
        <path d="M300 335 L284 415 Q282 426 296 426 L374 426 Q388 426 386 415 L370 335Z"
          fill="rgba(241,245,249,0.48)" stroke="#64748b" strokeWidth="1.8"/>
        <rect x="323" y="278" width="34" height="60" rx="3"
          fill="rgba(241,245,249,0.46)" stroke="#64748b" strokeWidth="1.6"/>
        <motion.path
          d="M286 405 L372 405 L371 415 Q369 426 354 426 L296 426 Q284 426 284 415Z"
          clipPath="url(#flask2-clip)"
          animate={reduced ? {} : {
            fill:["rgba(168,85,247,0.58)","rgba(245,158,11,0.55)","rgba(168,85,247,0.58)"],
          }}
          style={{ fill:"rgba(168,85,247,0.58)" }}
          transition={{ duration:7, repeat:Infinity, ease:"easeInOut" }}
        />
        <path d="M287 405 Q330 399 372 405" fill="none" stroke="rgba(148,163,184,0.42)" strokeWidth="1.2"/>
        <rect x="284" y="337" width="8" height="88" fill="rgba(255,255,255,0.22)" rx="3"/>
      </g>

      {/* ── Burette + retort stand ── */}
      <g opacity="0.88">
        <rect x="84" y="148" width="10" height="278" rx="4" fill="#94a3b8" opacity="0.42"/>
        <rect x="72" y="152" width="34" height="10" rx="3" fill="#64748b" opacity="0.48"/>
        <rect x="78" y="155" width="28" height="200" rx="3"
          fill="rgba(241,245,249,0.50)" stroke="#64748b" strokeWidth="1.6"/>
        <motion.rect x="80" y="158" width="24" height="150"
          fill="url(#hero-burette-fill)"
          animate={reduced ? {} : { height:[150,110,78,50,112,150] }}
          transition={{ duration:10, repeat:Infinity, ease:"easeInOut" }}
        />
        <rect x="74" y="352" width="36" height="12" rx="3" fill="#475569" opacity="0.68"/>
        {!reduced && (
          <motion.ellipse cx="92" cy="370" rx="3" ry="4"
            fill="rgba(34,197,94,0.80)"
            animate={{ cy:[370,296], opacity:[0.9,0], scaleY:[1,1.35] }}
            transition={{ duration:0.9, repeat:Infinity, repeatDelay:1.1, ease:"easeIn" }}
          />
        )}
        <rect x="80" y="157" width="7" height="194" fill="rgba(255,255,255,0.28)" rx="2"/>
        {/* Burette graduation marks */}
        {[0,0.25,0.5,0.75,1].map((t,i)=>(
          <line key={i} x1="108" y1={162+t*190} x2={i%2===0?117:113} y2={162+t*190} stroke="#94a3b8" strokeWidth="0.8" opacity="0.6"/>
        ))}
      </g>

      {/* ── Bunsen burner (right) ── */}
      <g>
        <rect x="322" y="390" width="50" height="36" rx="5" fill="#94a3b8" opacity="0.58"/>
        <rect x="335" y="324" width="24" height="68" rx="5" fill="#64748b" opacity="0.62"/>
        <rect x="329" y="320" width="36" height="6" rx="3" fill="#475569" opacity="0.55"/>
        {/* Flame */}
        <motion.path
          d="M347 324 Q338 300 347 280 Q356 300 366 280 Q356 317 347 324"
          fill="#f97316" opacity="0.82"
          animate={reduced ? {} : { scaleY:[1,1.18,0.93,1], scaleX:[1,0.88,1.06,1] }}
          transition={{ duration:1.1, repeat:Infinity, ease:"easeInOut" }}
          style={{ transformOrigin:"347px 324px" }}
        />
        <motion.path
          d="M347 324 Q342 308 347 292 Q352 308 347 324"
          fill="#fcd34d" opacity="0.68"
          animate={reduced ? {} : { scaleY:[1,1.12,0.9,1] }}
          transition={{ duration:0.82, repeat:Infinity, ease:"easeInOut" }}
          style={{ transformOrigin:"347px 324px" }}
        />
        <motion.path
          d="M347 324 Q344 318 347 310 Q350 318 347 324"
          fill="#93c5fd" opacity="0.78"
          animate={reduced ? {} : { scaleY:[1,1.08,0.94,1] }}
          transition={{ duration:0.6, repeat:Infinity, ease:"easeInOut" }}
          style={{ transformOrigin:"347px 324px" }}
        />
        {/* Heat shimmer */}
        {!reduced && (
          <motion.path
            d="M340 278 Q347 268 354 278 Q347 270 340 278"
            fill="none" stroke="rgba(249,115,22,0.22)" strokeWidth="1.5"
            animate={{ opacity:[0.5,0,0.5], y:[-3,-8,-3] }}
            transition={{ duration:1.4, repeat:Infinity, ease:"easeInOut" }}
          />
        )}
      </g>

      {/* ── Test tube (left, tilted) ── */}
      <motion.g
        animate={reduced ? {} : { rotate:[-3,3,-3] }}
        transition={{ duration:3.2, repeat:Infinity, ease:"easeInOut" }}
        style={{ transformOrigin:"52px 344px" }}
      >
        <path d="M44 292 L44 378 Q44 388 52 388 Q60 388 60 378 L60 292Z"
          fill="rgba(241,245,249,0.52)" stroke="#94a3b8" strokeWidth="1.5"/>
        <motion.rect x="46" y="326" width="12" height="56"
          animate={reduced ? {} : { fill:["rgba(239,68,68,0.58)","rgba(168,85,247,0.58)","rgba(239,68,68,0.58)"] }}
          style={{ fill:"rgba(239,68,68,0.58)" }}
          transition={{ duration:5, repeat:Infinity }}
        />
        <rect x="46" y="294" width="4" height="90" fill="rgba(255,255,255,0.28)" rx="2"/>
      </motion.g>

      {/* ── pH meter display ── */}
      <motion.g
        animate={reduced ? {} : { y:[-2,2,-2] }}
        transition={{ duration:4, repeat:Infinity, ease:"easeInOut", delay:1.4 }}
      >
        <rect x="4" y="310" width="42" height="28" rx="5" fill="rgba(15,23,42,0.82)" stroke="#475569" strokeWidth="1"/>
        <rect x="6" y="312" width="38" height="24" rx="4" fill="rgba(34,197,94,0.15)"/>
        <text x="25" y="323" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#4ade80">pH</text>
        <text x="25" y="333" textAnchor="middle" fontSize="7" fill="#4ade80" fontFamily="monospace">7.03</text>
      </motion.g>

      {/* ── Floating element tiles ── */}
      {/* Carbon */}
      <motion.g
        animate={reduced ? {} : { y:[-5,5,-5], x:[-2,2,-2] }}
        transition={{ duration:4.8, repeat:Infinity, ease:"easeInOut", delay:2 }}
      >
        <rect x="10" y="158" width="56" height="64" rx="10"
          fill="rgba(37,99,235,0.88)" filter="url(#hero-glow)"/>
        <text x="38" y="178" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.68)">6</text>
        <text x="38" y="200" textAnchor="middle" fontSize="22" fontWeight="900" fill="white">C</text>
        <text x="38" y="214" textAnchor="middle" fontSize="8.5" fill="rgba(255,255,255,0.78)">Carbon</text>
      </motion.g>

      {/* Gold */}
      <motion.g
        animate={reduced ? {} : { y:[4,-4,4], x:[2,-2,2] }}
        transition={{ duration:5.6, repeat:Infinity, ease:"easeInOut", delay:0.8 }}
      >
        <rect x="356" y="290" width="50" height="58" rx="9"
          fill="rgba(234,88,12,0.85)" filter="url(#hero-glow)"/>
        <text x="381" y="307" textAnchor="middle" fontSize="8.5" fill="rgba(255,255,255,0.68)">79</text>
        <text x="381" y="328" textAnchor="middle" fontSize="19" fontWeight="900" fill="white">Au</text>
        <text x="381" y="341" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.78)">Gold</text>
      </motion.g>

      {/* Iron */}
      <motion.g
        animate={reduced ? {} : { y:[-3,3,-3], x:[3,-3,3] }}
        transition={{ duration:6.2, repeat:Infinity, ease:"easeInOut", delay:3.4 }}
      >
        <rect x="0" y="260" width="44" height="50" rx="8"
          fill="rgba(124,58,237,0.82)" filter="url(#hero-glow)"/>
        <text x="22" y="275" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.68)">26</text>
        <text x="22" y="293" textAnchor="middle" fontSize="17" fontWeight="900" fill="white">Fe</text>
        <text x="22" y="305" textAnchor="middle" fontSize="7.5" fill="rgba(255,255,255,0.75)">Iron</text>
      </motion.g>

      {/* Connection line: burette drop to flask */}
      {!reduced && (
        <motion.line
          x1="92" y1="370" x2="210" y2="390"
          stroke="rgba(34,197,94,0.12)" strokeWidth="1" strokeDasharray="4 4"
          animate={{ opacity:[0,0.6,0] }}
          transition={{ duration:3, repeat:Infinity, ease:"easeInOut", delay:0.6 }}
        />
      )}
    </svg>
  );
}

// ── Main HeroSection ───────────────────────────────────────────────────────────
export default function HeroSection() {
  const [wordIdx, setWordIdx] = useState(0);
  const reduced = useReducedMotion() ?? false;

  useEffect(() => {
    const t = setInterval(
      () => startTransition(() => setWordIdx((i) => (i + 1) % ROTATING_WORDS.length)),
      2600,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <section
        id="lab"
        style={{
          position:      "relative",
          overflow:      "hidden",
          paddingTop:    "clamp(4rem, 8vw, 7.5rem)",
          paddingBottom: "clamp(3rem, 6vw, 5.5rem)",
          background:    "transparent",
        }}
      >
        {/* Enhanced dot grid */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle, rgba(59,130,246,0.042) 1px, transparent 1px)",
          backgroundSize:  "36px 36px",
          pointerEvents:   "none",
        }} />

        {/* Ambient background layer */}
        <ChemistryBackground reduced={reduced} />

        <div style={{
          position: "relative", zIndex: 10,
          maxWidth: "1200px", margin: "0 auto",
          padding:  "0 clamp(16px, 4vw, 48px)",
          display:  "grid",
          gridTemplateColumns: "1fr 1fr",
          gap:      "clamp(2rem, 5vw, 5rem)",
          alignItems: "center",
        }}>

          {/* ── Left column: text ── */}
          <div>
            {/* Live badge */}
            <motion.div
              initial={{ opacity:0, y:-12 }}
              animate={{ opacity:1, y:0 }}
              transition={{ duration:0.55, ease:[0.22,1,0.36,1] }}
              style={{ marginBottom:24 }}
            >
              <span style={{
                display:"inline-flex", alignItems:"center", gap:7,
                padding:"5px 16px", borderRadius:100,
                background:"rgba(37,99,235,0.07)", border:"1px solid rgba(37,99,235,0.18)",
                fontSize:11, fontWeight:700, color:"#2563eb",
                textTransform:"uppercase", letterSpacing:"0.10em",
              }}>
                <span style={{
                  width:7, height:7, borderRadius:"50%",
                  background:"#2563eb", boxShadow:"0 0 8px rgba(37,99,235,0.70)",
                  animation:"blink-dot 1.4s ease-in-out infinite", flexShrink:0,
                }} />
                Virtual Chemistry Laboratory
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity:0, y:20 }}
              animate={{ opacity:1, y:0 }}
              transition={{ duration:0.72, delay:0.08, ease:[0.22,1,0.36,1] }}
              style={{
                fontSize:"clamp(2.3rem, 4.6vw, 3.8rem)",
                fontWeight:900, lineHeight:1.06,
                letterSpacing:"-0.040em",
                color:"var(--lab-text-primary)",
                marginBottom:"1.1rem",
              }}
            >
              Learn Chemistry
              <br />
              by{" "}
              <span style={{
                background:"linear-gradient(128deg, #1d4ed8 0%, #2563eb 38%, #0ea5e9 72%, #7c3aed 100%)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
              }}>
                Doing It
              </span>
            </motion.h1>

            {/* Rotating experiment word */}
            <motion.div
              initial={{ opacity:0 }}
              animate={{ opacity:1 }}
              transition={{ duration:0.5, delay:0.22 }}
              style={{ marginBottom:"1.85rem", height:"2rem", display:"flex", alignItems:"center", flexWrap:"nowrap", overflow:"hidden" }}
            >
              <span style={{ fontSize:"1.01rem", color:"var(--lab-text-muted)", fontWeight:500, whiteSpace:"nowrap", marginRight:6 }}>
                Perform interactive
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIdx}
                  initial={reduced ? false : { opacity:0, y:12 }}
                  animate={{ opacity:1, y:0 }}
                  exit={reduced ? {} : { opacity:0, y:-12 }}
                  transition={{ duration:reduced ? 0 : 0.32 }}
                  style={{
                    fontSize:"1.01rem", fontWeight:800, whiteSpace:"nowrap",
                    background:"linear-gradient(128deg, #1d4ed8, #0ea5e9)",
                    WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
                  }}
                >
                  {ROTATING_WORDS[wordIdx]}
                </motion.span>
              </AnimatePresence>
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity:0, y:12 }}
              animate={{ opacity:1, y:0 }}
              transition={{ duration:0.60, delay:0.30, ease:[0.22,1,0.36,1] }}
              style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:"2.5rem" }}
            >
              <Link href="/experiments" style={{
                display:"inline-flex", alignItems:"center", gap:9,
                padding:"14px 28px", borderRadius:14,
                background:"linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%)",
                color:"white", fontSize:"15px", fontWeight:700,
                textDecoration:"none",
                boxShadow:"0 4px 22px rgba(37,99,235,0.38), 0 1px 0 rgba(255,255,255,0.14) inset",
                transition:"transform 0.18s ease, box-shadow 0.18s ease",
                letterSpacing:"-0.01em",
              }}
                onMouseEnter={(e) => { const el=e.currentTarget as HTMLElement; el.style.transform="translateY(-2px)"; el.style.boxShadow="0 10px 34px rgba(37,99,235,0.44), 0 1px 0 rgba(255,255,255,0.14) inset"; }}
                onMouseLeave={(e) => { const el=e.currentTarget as HTMLElement; el.style.transform="translateY(0)"; el.style.boxShadow="0 4px 22px rgba(37,99,235,0.38), 0 1px 0 rgba(255,255,255,0.14) inset"; }}
              >
                Start Experimenting
                <svg width="15" height="15" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M3 7h8M8 4l3 3-3 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>

              <a href="#elements"
                onClick={(e) => { e.preventDefault(); document.getElementById("elements")?.scrollIntoView({ behavior:"smooth" }); }}
                style={{
                  display:"inline-flex", alignItems:"center", gap:8,
                  padding:"14px 24px", borderRadius:14,
                  background:"rgba(255,255,255,0.95)", border:"1px solid rgba(148,163,184,0.22)",
                  color:"var(--lab-text-secondary)", fontSize:"15px", fontWeight:600,
                  textDecoration:"none",
                  boxShadow:"0 2px 12px rgba(15,23,42,0.07)",
                  transition:"transform 0.18s ease, box-shadow 0.18s ease",
                }}
                onMouseEnter={(e) => { const el=e.currentTarget as HTMLElement; el.style.transform="translateY(-2px)"; el.style.boxShadow="0 8px 24px rgba(15,23,42,0.10)"; }}
                onMouseLeave={(e) => { const el=e.currentTarget as HTMLElement; el.style.transform="translateY(0)"; el.style.boxShadow="0 2px 12px rgba(15,23,42,0.07)"; }}
              >
                <svg width="15" height="15" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                  <text x="7" y="9.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="currentColor">Pt</text>
                </svg>
                Periodic Table
              </a>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity:0, y:10 }}
              animate={{ opacity:1, y:0 }}
              transition={{ duration:0.55, delay:0.42, ease:[0.22,1,0.36,1] }}
              style={{ display:"flex", gap:"clamp(18px, 3vw, 32px)", flexWrap:"wrap", alignItems:"flex-start" }}
            >
              {STATS.map(({ value, label, color }) => (
                <div key={label} style={{ textAlign:"center" }}>
                  <p style={{ fontSize:"1.42rem", fontWeight:900, color, lineHeight:1, letterSpacing:"-0.03em" }}>
                    {value}
                  </p>
                  <p style={{ fontSize:10, fontWeight:600, color:"var(--lab-text-muted)", marginTop:4, textTransform:"uppercase", letterSpacing:"0.07em" }}>
                    {label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right column: lab scene ── */}
          <motion.div
            initial={{ opacity:0, x:30 }}
            animate={{ opacity:1, x:0 }}
            transition={{ duration:0.88, delay:0.15, ease:[0.22,1,0.36,1] }}
            style={{
              position:"relative",
              height:"clamp(340px, 48vw, 520px)",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}
          >
            {/* Radial glow behind scene */}
            <div aria-hidden="true" style={{
              position:"absolute", inset:"8%",
              background:"radial-gradient(ellipse, rgba(37,99,235,0.065) 0%, transparent 68%)",
              pointerEvents:"none",
            }} />
            {/* Subtle scene backdrop circle */}
            <div aria-hidden="true" style={{
              position:"absolute", inset:"20%",
              background:"radial-gradient(ellipse, rgba(37,99,235,0.035) 0%, transparent 72%)",
              borderRadius:"50%",
              pointerEvents:"none",
            }} />
            <LabScene reduced={reduced} />
          </motion.div>
        </div>

        {/* Responsive: hide scene on mobile */}
        <style>{`
          @media (max-width: 768px) {
            #lab > div > div:nth-child(2) { display: none !important; }
            #lab > div { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* ── Element ticker strip ── */}
      <ElementTicker />
    </>
  );
}
