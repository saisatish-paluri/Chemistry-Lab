"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { SaltAnalysisState } from "@/lib/engine/types";
import { SALTS, CATION_TESTS, ANION_TESTS } from "@/lib/engine/salt-analysis-engine";

interface Props {
  state: Pick<SaltAnalysisState,
    "selectedSalt" | "phase" | "cationResults" | "anionResults" |
    "identifiedCation" | "identifiedAnion" | "isTesting" | "testProgress"
  >;
}

const W = 560;
const H = 620;

// ── Test tube rendering component ────────────────────────────────────────────
function TestTube({
  x, y, liquidColor, pptColor, showBubbles, showSilver, label, sublabel, highlight,
}: {
  x: number; y: number; liquidColor: string; pptColor?: string;
  showBubbles?: boolean; showSilver?: boolean;
  label: string; sublabel?: string; highlight?: boolean;
}) {
  const tw = 34;
  const th = 155;
  return (
    <g>
      {/* Outer glow when active */}
      {highlight && (
        <motion.rect x={x-4} y={y-4} width={tw+8} height={th+20} rx="6"
          fill="rgba(37,99,235,0.06)" stroke="rgba(37,99,235,0.2)" strokeWidth="1"
          animate={{ opacity:[0.5,1,0.5] }} transition={{ duration:1.8, repeat:Infinity }}
        />
      )}
      {/* Glass body */}
      <path d={`M${x} ${y} L${x} ${y+th-18} Q${x} ${y+th} ${x+tw/2} ${y+th} Q${x+tw} ${y+th} ${x+tw} ${y+th-18} L${x+tw} ${y} Z`}
        fill="rgba(241,245,249,0.52)" stroke="#94a3b8" strokeWidth="1.8" />
      {/* Liquid */}
      <motion.rect
        x={x+2} y={y+35} width={tw-4} height={th-55}
        fill={liquidColor} opacity="0.78" rx="0"
        style={{ clipPath: `inset(0px 0px ${-(th-55)}px 0px round 0 0 ${tw/2-2}px ${tw/2-2}px)` }}
        initial={{ height:0, y:y+th-20 }}
        animate={{ height:th-55, y:y+35 }}
        transition={{ duration:1.4, ease:"easeOut" }}
      />
      {/* Precipitate layer */}
      <AnimatePresence>
        {pptColor && (
          <motion.rect
            x={x+2} y={y+th-36} width={tw-4} height={22}
            fill={pptColor} opacity="0.9" rx="0"
            style={{ clipPath:`inset(0px 0px 0px 0px round 0 0 ${tw/2-2}px ${tw/2-2}px)` }}
            initial={{ height:0, y:y+th-14 }}
            animate={{ height:22, y:y+th-36 }}
            transition={{ duration:1.2, ease:"easeOut", delay:0.6 }}
          />
        )}
      </AnimatePresence>
      {/* Bubbles */}
      <AnimatePresence>
        {showBubbles && (
          <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            {[x+6, x+tw/2, x+tw-8].map((bx, i) => (
              <motion.circle key={i} cx={bx} cy={y+th-40} r="3"
                fill="rgba(255,255,255,0.75)" stroke="rgba(148,163,184,0.4)" strokeWidth="0.7"
                animate={{ cy:[y+th-40, y+40], opacity:[0.85,0] }}
                transition={{ duration:1.7, repeat:Infinity, delay:i*0.45, ease:"easeOut" }}
              />
            ))}
            <motion.text x={x+tw/2} y={y+22} textAnchor="middle" fontSize="8.5" fill="#059669"
              animate={{ opacity:[0.7,1,0.7] }} transition={{ duration:1.4, repeat:Infinity }}>
              CO₂↑
            </motion.text>
          </motion.g>
        )}
      </AnimatePresence>
      {/* Silver mirror layer */}
      <AnimatePresence>
        {showSilver && (
          <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <rect x={x+2} y={y+36} width={tw-4} height={32} fill="rgba(200,215,230,0.85)" />
            <rect x={x+2} y={y+36} width={tw-4} height="8" fill="rgba(240,248,255,0.95)" />
            <text x={x+tw/2} y={y+th+18} textAnchor="middle" fontSize="8" fill="#64748b">Ag mirror</text>
          </motion.g>
        )}
      </AnimatePresence>
      {/* Sheen */}
      <rect x={x+2} y={y+2} width="7" height={th-22} fill="rgba(255,255,255,0.42)" rx="3" />
      {/* Labels */}
      <text x={x+tw/2} y={y+th+16} textAnchor="middle" fontSize="10" fontWeight="700" fill="#475569">{label}</text>
      {sublabel && <text x={x+tw/2} y={y+th+28} textAnchor="middle" fontSize="8.5" fill="#94a3b8">{sublabel}</text>}
    </g>
  );
}

// ── Reagent dropper ───────────────────────────────────────────────────────────
function ReagentDropper({ x, y, color, label, dropping }: {
  x: number; y: number; color: string; label: string; dropping?: boolean;
}) {
  return (
    <g>
      {/* Bulb */}
      <ellipse cx={x} cy={y} rx="10" ry="12" fill={color} opacity="0.85" stroke="#94a3b8" strokeWidth="1.2" />
      {/* Nozzle */}
      <rect x={x-3} y={y+11} width="6" height="18" rx="3" fill="rgba(241,245,249,0.7)" stroke="#94a3b8" strokeWidth="1" />
      {/* Label */}
      <text x={x} y={y-16} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#475569">{label}</text>
      {/* Drop */}
      <AnimatePresence>
        {dropping && (
          <motion.ellipse
            cx={x} cy={y+29} rx="2.5" ry="3.5"
            fill={color} opacity="0.9"
            animate={{ cy:[y+29, y+70], opacity:[0.9,0], scaleY:[1,1.4] }}
            transition={{ duration:0.6, repeat:Infinity, ease:"easeIn" }}
          />
        )}
      </AnimatePresence>
    </g>
  );
}

export default function SaltAnalysisWorkspace({ state }: Props) {
  const { selectedSalt, phase, cationResults, anionResults, identifiedCation, identifiedAnion, isTesting } = state;

  const salt       = selectedSalt ? SALTS[selectedSalt] : null;
  const cationTest = identifiedCation ? CATION_TESTS[identifiedCation] : null;
  const anionTest  = identifiedAnion  ? ANION_TESTS[identifiedAnion]   : null;

  const unknownColor = salt?.color ?? "rgba(203,213,225,0.4)";
  const cationColor  = cationTest?.color ?? "rgba(203,213,225,0.35)";
  const anionColor   = anionTest?.color  ?? "rgba(203,213,225,0.35)";

  const showCationPpt  = !!cationTest?.precipitate  && (phase === "anion" || phase === "identify");
  const showAnionPpt   = !!anionTest?.precipitate   && phase === "identify";
  const showCationBub  = !!cationTest?.effervescence && (phase === "anion" || phase === "identify");
  const showAnionBub   = !!anionTest?.effervescence  && phase === "identify";

  return (
    <div className="lab-ws-area" style={{ width: "100%", height: "auto", maxHeight: "100%", aspectRatio: `${W}/${H}` }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
        <defs>
          <pattern id="sa-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.75" fill="rgba(148,163,184,0.22)" />
          </pattern>
          <linearGradient id="sa-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f3f0ff" />
            <stop offset="100%" stopColor="#f8fafc" />
          </linearGradient>
          <linearGradient id="sa-bench" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <filter id="sa-shadow">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="rgba(0,0,0,0.10)" />
          </filter>
          <filter id="sa-glow">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width={W} height={H} fill="url(#sa-wall)" />
        <rect width={W} height={H} fill="url(#sa-dots)" opacity="0.7" />

        {/* Header */}
        <rect x="0" y="0" width={W} height="50" fill="rgba(248,250,252,0.97)" />
        <line x1="0" y1="50" x2={W} y2="50" stroke="rgba(226,232,240,0.9)" strokeWidth="1" />
        <text x={W/2} y="29" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e293b">
          Qualitative Salt Analysis
        </text>
        <text x={W/2} y="43" textAnchor="middle" fontSize="9.5" fill="#94a3b8">
          Systematic cation + anion tests → unknown salt identification
        </text>

        {/* Bench */}
        <rect x="0" y={H-118} width={W} height="118" fill="url(#sa-bench)" />
        <rect x="0" y={H-120} width={W} height="4" fill="#94a3b8" opacity="0.35" />

        {/* ─── TEST TUBE RACK ─── */}
        {/* Wooden rack body */}
        <rect x="50" y="384" width="420" height="14" rx="5" fill="#92400e" opacity="0.55" />
        <rect x="50" y="394" width="420" height="8"  rx="3" fill="#78350f" opacity="0.45" />
        {/* Rack holes (circles indicating tube slots) */}
        {[96, 192, 288, 384, 456].map((x, i) => (
          <g key={i}>
            <ellipse cx={x} cy="386" rx="18" ry="6" fill="rgba(0,0,0,0.25)" />
            <ellipse cx={x} cy="386" rx="14" ry="4" fill="rgba(0,0,0,0.18)" />
          </g>
        ))}
        {/* Rack legs */}
        <rect x="65"  y="400" width="12" height="88" rx="4" fill="#92400e" opacity="0.45" />
        <rect x="452" y="400" width="12" height="88" rx="4" fill="#92400e" opacity="0.45" />

        {/* ─── UNKNOWN SALT TUBE ─── */}
        <text x="96" y="192" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#7c3aed">Unknown Salt</text>
        <TestTube
          x={79} y={205}
          liquidColor={selectedSalt ? unknownColor : "rgba(203,213,225,0.25)"}
          label={salt ? salt.formula : "???"}
          sublabel={salt ? "solution" : "select salt"}
          highlight={phase === "preliminary" && !!selectedSalt}
        />

        {/* ─── CATION RESULT TUBE ─── */}
        <text x="222" y="162" textAnchor="middle" fontSize="10.5" fontWeight="700"
          fill={identifiedCation ? "#2563eb" : "#94a3b8"}>
          Cation Test
        </text>
        {cationTest && (
          <text x="222" y="175" textAnchor="middle" fontSize="9" fill="#64748b">
            {cationTest.reagent.slice(0, 22)}
          </text>
        )}
        <TestTube
          x={205} y={186}
          liquidColor={phase==="cation"||phase==="anion"||phase==="identify" ? cationColor : "rgba(203,213,225,0.15)"}
          pptColor={showCationPpt ? cationTest?.color : undefined}
          showBubbles={showCationBub}
          label={cationTest ? "Result ✓" : "—"}
          sublabel={identifiedCation || ""}
          highlight={phase === "cation" && isTesting}
        />

        {/* ─── ANION RESULT TUBE ─── */}
        <text x="348" y="162" textAnchor="middle" fontSize="10.5" fontWeight="700"
          fill={identifiedAnion ? "#059669" : "#94a3b8"}>
          Anion Test
        </text>
        {anionTest && (
          <text x="348" y="175" textAnchor="middle" fontSize="9" fill="#64748b">
            {anionTest.reagent.slice(0, 22)}
          </text>
        )}
        <TestTube
          x={331} y={186}
          liquidColor={phase==="anion"||phase==="identify" ? anionColor : "rgba(203,213,225,0.15)"}
          pptColor={showAnionPpt ? anionTest?.color : undefined}
          showBubbles={showAnionBub}
          label={anionTest ? "Result ✓" : "—"}
          sublabel={identifiedAnion || ""}
          highlight={phase === "anion" && isTesting}
        />

        {/* ─── REAGENT DROPPERS ─── */}
        {phase === "cation" && cationTest && (
          <motion.g initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
            <ReagentDropper
              x={222} y={140}
              color={cationTest.color}
              label={cationTest.reagent.split(" ").slice(0,2).join(" ")}
              dropping={isTesting}
            />
          </motion.g>
        )}
        {phase === "anion" && anionTest && (
          <motion.g initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
            <ReagentDropper
              x={348} y={140}
              color={anionTest.color}
              label={anionTest.reagent.split(" ").slice(0,2).join(" ")}
              dropping={isTesting}
            />
          </motion.g>
        )}

        {/* ─── FLAME TEST LAMP (Ca flame) ─── */}
        {identifiedCation === "calcium" && (
          <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }}>
            {/* Spirit lamp body */}
            <ellipse cx="472" cy="430" rx="22" ry="8" fill="#fbbf24" opacity="0.7" />
            <rect x="450" y="406" width="44" height="26" rx="5" fill="#d97706" opacity="0.65" />
            <rect x="466" y="394" width="12" height="16" rx="3" fill="#b45309" opacity="0.8" />
            {/* Flame */}
            <motion.path
              d="M472 406 Q465 388 472 372 Q479 388 486 372 Q481 400 472 406"
              fill={identifiedCation === "calcium" ? "#ea580c" : identifiedCation === "sodium" ? "#fbbf24" : "#f97316"}
              opacity="0.88"
              animate={{ scaleY:[1,1.18,0.92,1], scaleX:[1,0.88,1.06,1] }}
              transition={{ duration:1.1, repeat:Infinity, ease:"easeInOut" }}
              style={{ transformOrigin:"472px 406px" }}
            />
            <motion.path
              d="M472 406 Q469 394 472 382 Q475 394 472 406"
              fill="#fcd34d" opacity="0.72"
              animate={{ scaleY:[1,1.12,0.9,1] }}
              transition={{ duration:0.85, repeat:Infinity, ease:"easeInOut" }}
              style={{ transformOrigin:"472px 406px" }}
            />
            <text x="472" y="462" textAnchor="middle" fontSize="8.5" fontWeight="600" fill="#92400e">
              Flame Test
            </text>
            {/* Flame color label */}
            <rect x="444" y="466" width="56" height="16" rx="5"
              fill={identifiedCation === "calcium" ? "rgba(234,88,12,0.12)" : "rgba(251,191,36,0.18)"}
              stroke={identifiedCation === "calcium" ? "rgba(234,88,12,0.3)" : "rgba(251,191,36,0.4)"} strokeWidth="0.8" />
            <text x="472" y="477" textAnchor="middle" fontSize="7.5" fontWeight="700"
              fill={identifiedCation === "calcium" ? "#c2410c" : "#92400e"}>
              {identifiedCation === "calcium" ? "Brick Red" : "Golden Yellow"}
            </text>
          </motion.g>
        )}

        {/* ─── OBSERVATION TABLE ─── */}
        {(cationResults.length > 0 || anionResults.length > 0) && (
          <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }}>
            <rect x="14" y="58" width="160" height={20 + (cationResults.length + anionResults.length) * 17 + 14} rx="10"
              fill="rgba(255,255,255,0.93)" stroke="rgba(148,163,184,0.28)" strokeWidth="1" />
            <text x="94" y="76" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#7c3aed">Observations</text>
            <line x1="18" y1="80" x2="170" y2="80" stroke="rgba(148,163,184,0.2)" strokeWidth="0.7" />
            {[...cationResults, ...anionResults].slice(0, 6).map((r, i) => (
              <g key={i}>
                <circle cx="28" cy={94+i*17} r="5" fill={r.color} />
                <text x="37" y={98+i*17} fontSize="8" fill="#475569">{r.testName.slice(0, 20)}</text>
              </g>
            ))}
          </motion.g>
        )}

        {/* ─── PHASE PILL ─── */}
        <rect x="408" y="58" width="138" height="24" rx="8"
          fill="rgba(255,255,255,0.92)" stroke="rgba(148,163,184,0.25)" strokeWidth="1" />
        <circle cx="421" cy="70" r="5"
          fill={phase==="identify" ? "#22c55e" : phase==="anion" ? "#059669" : phase==="cation" ? "#2563eb" : "#94a3b8"}
        />
        <text x="430" y="74" fontSize="10" fontWeight="600" fill="#475569">
          Phase: {phase.charAt(0).toUpperCase() + phase.slice(1)}
        </text>

        {/* ─── TESTING SPINNER ─── */}
        <AnimatePresence>
          {isTesting && (
            <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              <rect x="195" y="88" width="170" height="36" rx="10"
                fill="rgba(239,246,255,0.98)" stroke="rgba(37,99,235,0.3)" strokeWidth="1.2" />
              <motion.circle cx="213" cy="106" r="8"
                stroke="#3b82f6" strokeWidth="2.5" fill="none"
                strokeDasharray="22 6"
                animate={{ rotate:360 }}
                transition={{ duration:0.9, repeat:Infinity, ease:"linear" }}
                style={{ transformOrigin:"213px 106px" }}
              />
              <text x="228" y="110" fontSize="11" fontWeight="600" fill="#1d4ed8">Running test...</text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* ─── IDENTIFICATION CARD ─── */}
        <AnimatePresence>
          {phase === "identify" && salt && (
            <motion.g
              initial={{ opacity:0, y:18, scale:0.92 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0 }}
              style={{ transformOrigin:`${W/2}px 100px` }}
            >
              <rect x="118" y="60" width="326" height="80" rx="14"
                fill="rgba(240,253,244,0.98)" stroke="rgba(34,197,94,0.45)" strokeWidth="1.8"
                filter="url(#sa-glow)"
              />
              <text x={W/2} y="86" textAnchor="middle" fontSize="11" fontWeight="600" fill="#166534">
                Salt Identified ✓
              </text>
              <text x={W/2} y="108" textAnchor="middle" fontSize="16" fontWeight="800" fill="#15803d">
                {salt.name}
              </text>
              <text x={W/2} y="128" textAnchor="middle" fontSize="10" fontWeight="600" fill="#166534">
                {salt.formula} · {salt.cation} cation + {salt.anion} anion
              </text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* ─── TEST RESULT INDICATORS (small badges on tubes) ─── */}
        {cationTest && (phase === "anion" || phase === "identify") && (
          <motion.g initial={{ opacity:0, scale:0.7 }} animate={{ opacity:1, scale:1 }}
            style={{ transformOrigin:"239px 186px" }}>
            <rect x="218" y="172" width="42" height="16" rx="5"
              fill="rgba(240,253,244,0.97)" stroke="rgba(34,197,94,0.4)" strokeWidth="0.9" />
            <text x="239" y="183" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#166534">✓ {identifiedCation}</text>
          </motion.g>
        )}
        {anionTest && phase === "identify" && (
          <motion.g initial={{ opacity:0, scale:0.7 }} animate={{ opacity:1, scale:1 }}
            style={{ transformOrigin:"365px 172px" }}>
            <rect x="344" y="172" width="42" height="16" rx="5"
              fill="rgba(240,253,244,0.97)" stroke="rgba(34,197,94,0.4)" strokeWidth="0.9" />
            <text x="365" y="183" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#166534">✓ {identifiedAnion}</text>
          </motion.g>
        )}

        {/* ─── REAGENT LEGEND (bottom-right) ─── */}
        {!identifiedCation && phase === "select" && (
          <g opacity="0.65">
            <rect x="388" y="58" width="158" height="106" rx="9"
              fill="rgba(255,255,255,0.9)" stroke="rgba(148,163,184,0.25)" strokeWidth="1" />
            <text x="467" y="75" textAnchor="middle" fontSize="9" fontWeight="700" fill="#475569">Test Guide</text>
            {[
              { c:"#3b82f6", t:"NaOH → Blue ppt (Cu²⁺)" },
              { c:"#92400e", t:"NaOH → Brown ppt (Fe³⁺)" },
              { c:"#ffffff", t:"BaCl₂ → White ppt (SO₄²⁻)" },
              { c:"#e2e8f0", t:"HCl → Effervescence (CO₃²⁻)" },
              { c:"#fbbf24", t:"Flame → Yellow (Na⁺)" },
            ].map(({ c, t }, i) => (
              <g key={i}>
                <circle cx="400" cy={88+i*14} r="4" fill={c} stroke="rgba(148,163,184,0.4)" strokeWidth="0.7" />
                <text x="410" y={92+i*14} fontSize="8" fill="#64748b">{t}</text>
              </g>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}
