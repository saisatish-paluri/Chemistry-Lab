"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { SaltAnalysisState } from "@/lib/engine/types";
import { SALTS, CATION_TESTS, ANION_TESTS } from "@/lib/engine/salt-analysis-engine";

interface Props {
  state: SaltAnalysisState;
}

const W = 560;
const H = 620;

// ── Test tube rendering component ────────────────────────────────────────────
function TestTube({
  x, y, liquidColor, pptColor, showBubbles, gasLabel, showSilver, label, sublabel, highlight,
}: {
  x: number; y: number; liquidColor: string; pptColor?: string;
  showBubbles?: boolean; gasLabel?: string; showSilver?: boolean;
  label: string; sublabel?: string; highlight?: boolean;
}) {
  const tw = 34;
  const th = 155;
  return (
    <g>
      {/* Ground shadow on the rack */}
      <ellipse cx={x + tw/2} cy={y + th} rx={tw/2 + 2} ry={4} fill="rgba(9,13,22,0.22)" />

      {/* Outer glow when active */}
      {highlight && (
        <motion.rect x={x-4} y={y-4} width={tw+8} height={th+20} rx="6"
          fill="rgba(37,99,235,0.06)" stroke="rgba(37,99,235,0.2)" strokeWidth="1"
          animate={{ opacity:[0.5,1,0.5] }} transition={{ duration:1.8, repeat:Infinity }}
        />
      )}

      {/* Glass body - Outer outline */}
      <path d={`M${x} ${y} L${x} ${y+th-18} Q${x} ${y+th} ${x+tw/2} ${y+th} Q${x+tw} ${y+th} ${x+tw} ${y+th-18} L${x+tw} ${y} Z`}
        fill="rgba(241,245,249,0.25)" stroke="#64748b" strokeWidth="2.0" />

      {/* Glass body - Inner outline for glass thickness */}
      <path d={`M${x+1.8} ${y} L${x+1.8} ${y+th-17.5} Q${x+1.8} ${y+th-1.8} ${x+tw/2} ${y+th-1.8} Q${x+tw-1.8} ${y+th-1.8} ${x+tw-1.8} ${y+th-17.5} L${x+tw-1.8} ${y}`}
        fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />

      {/* Liquid */}
      <motion.rect
        x={x+2.5} y={y+35} width={tw-5} height={th-55}
        fill={liquidColor} opacity="0.85" rx="0"
        style={{ clipPath: `inset(0px 0px ${-(th-55)}px 0px round 0 0 ${tw/2-2.5}px ${tw/2-2.5}px)` }}
        initial={{ height:0, y:y+th-20 }}
        animate={{ height:th-55, y:y+35 }}
        transition={{ duration:1.4, ease:"easeOut" }}
      />

      {/* Meniscus */}
      <motion.path
        initial={false}
        d={`M${x+2.5} 0 Q${x+tw/2} 3.5 ${x+tw-2.5} 0`}
        fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1"
        animate={{ y: y+35 }}
        transition={{ duration:1.4, ease:"easeOut" }}
      />

      {/* Precipitate layer */}
      <AnimatePresence>
        {pptColor && (
          <motion.rect
            x={x+2.5} y={y+th-36} width={tw-5} height={22}
            fill={pptColor} opacity="0.92" rx="0"
            style={{ clipPath:`inset(0px 0px 0px 0px round 0 0 ${tw/2-2.5}px ${tw/2-2.5}px)` }}
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
              {gasLabel || "CO₂"}↑
            </motion.text>
          </motion.g>
        )}
      </AnimatePresence>

      {/* Silver mirror layer */}
      <AnimatePresence>
        {showSilver && (
          <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <rect x={x+2.5} y={y+36} width={tw-5} height={32} fill="rgba(200,215,230,0.85)" />
            <rect x={x+2.5} y={y+36} width={tw-5} height="8" fill="rgba(240,248,255,0.95)" />
            <text x={x+tw/2} y={y+th+18} textAnchor="middle" fontSize="8" fill="#64748b">Ag mirror</text>
          </motion.g>
        )}
      </AnimatePresence>

      {/* Sheen */}
      <path d={`M${x+2.5} ${y+2} L${x+2.5} ${y+th-16}`} stroke="url(#glass-specular)" strokeWidth="3" fill="none" pointerEvents="none" />
      <path d={`M${x+6} ${y+2} L${x+6} ${y+th-16}`} stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" fill="none" pointerEvents="none" />

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

  // Determine current active observation image and text descriptions
  let activeObs: {
    title: string;
    formula: string;
    image: string;
    desc: string;
    color: string;
  } | null = null;

  if (phase === "cation" || (phase !== "select" && phase !== "preliminary" && identifiedCation)) {
    // Show cation details if in cation phase or if cation is already identified
    if (identifiedCation || (isTesting && salt)) {
      const catId = identifiedCation || salt!.cation;
      if (catId === "copper") {
        activeObs = {
          title: "Copper(II) Hydroxide",
          formula: "Cu(OH)₂",
          image: "/images/qualitative/copper.png",
          desc: "A gelatinous light blue precipitate forms immediately upon addition of sodium hydroxide. It is completely insoluble in excess sodium hydroxide reagent.",
          color: "#3b82f6",
        };
      } else if (catId === "iron") {
        activeObs = {
          title: "Iron(III) Hydroxide",
          formula: "Fe(OH)₃",
          image: "/images/qualitative/iron.png",
          desc: "A thick reddish-brown precipitate resembling rust forms immediately. It is insoluble in excess sodium hydroxide reagent.",
          color: "#b45309",
        };
      } else if (catId === "zinc") {
        activeObs = {
          title: "Zinc Hydroxide",
          formula: "Zn(OH)₂",
          image: "/images/qualitative/white_precipitate.png",
          desc: "A gelatinous white precipitate forms in dilute NaOH. Being amphoteric, this precipitate completely dissolves in excess NaOH to form a clear, colorless zincate solution.",
          color: "#94a3b8",
        };
      } else if (catId === "calcium") {
        activeObs = {
          title: "Calcium Flame Emission",
          formula: "Ca²⁺ ions",
          image: "/images/qualitative/calcium.png",
          desc: "Excited calcium ions in the non-luminous flame emit light at approximately 622 nm, producing a characteristic brick-red (orange-red) flame.",
          color: "#ea580c",
        };
      } else if (catId === "ammonium") {
        activeObs = {
          title: "Ammonia Gas Evolution",
          formula: "NH₃ (g)",
          image: "/images/qualitative/effervescence.png",
          desc: "Heating ammonium salt with sodium hydroxide evolves alkaline ammonia gas. The pungent gas escapes and turns a moist red litmus paper strip blue.",
          color: "#10b981",
        };
      }
    }
  }

  // Override with anion details if currently in anion phase or if anion is identified and we are inspecting it
  if (phase === "anion" || (phase === "identify" && identifiedAnion)) {
    if (identifiedAnion || (isTesting && salt)) {
      const anId = identifiedAnion || salt!.anion;
      if (anId === "chloride") {
        activeObs = {
          title: "Silver Chloride",
          formula: "AgCl",
          image: "/images/qualitative/white_precipitate.png",
          desc: "A white curdy precipitate of silver chloride forms on adding silver nitrate. It is insoluble in dilute nitric acid, but dissolves in aqueous ammonia.",
          color: "#94a3b8",
        };
      } else if (anId === "sulfate") {
        activeObs = {
          title: "Barium Sulfate",
          formula: "BaSO₄",
          image: "/images/qualitative/white_precipitate.png",
          desc: "A dense, chalky white precipitate of barium sulfate forms on adding barium chloride. It is insoluble in all dilute acids including hydrochloric acid.",
          color: "#94a3b8",
        };
      } else if (anId === "carbonate") {
        activeObs = {
          title: "Carbon Dioxide Effervescence",
          formula: "CO₂ (g)",
          image: "/images/qualitative/effervescence.png",
          desc: "Adding dilute hydrochloric acid to solid carbonate causes vigorous effervescence as carbon dioxide gas bubbles rapidly escape. The gas turns limewater milky.",
          color: "#10b981",
        };
      } else if (anId === "nitrate") {
        activeObs = {
          title: "Iron-Nitrosyl Complex (Brown Ring)",
          formula: "[Fe(H₂O)₅(NO)]²⁺",
          image: "/images/qualitative/nitrate.png",
          desc: "A dark brown ring forms slowly at the interface of the concentrated sulfuric acid and iron(II) sulfate layers, confirming the presence of nitrate ions.",
          color: "#78350f",
        };
      }
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-5xl items-stretch justify-center p-1.5">
      {/* ─── Left Side: Interactive SVG Bench ─── */}
      <div 
        className="w-full max-w-[500px] aspect-[510/575] relative flex-shrink-0 border rounded-3xl p-3 shadow-md backdrop-blur-[6px]"
        style={{
          background: "var(--lab-glass-heavy)",
          borderColor: "var(--lab-glass-border)",
        }}
      >
        <svg viewBox="40 45 510 575" style={{ width: "100%", height: "100%", display: "block" }}>
          <defs>
            <pattern id="sa-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="0.75" fill="rgba(148,163,184,0.14)" />
            </pattern>
            <linearGradient id="sa-wall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(248, 250, 252, 0.4)" />
              <stop offset="100%" stopColor="rgba(241, 245, 249, 0.2)" />
            </linearGradient>
            <linearGradient id="sa-bench" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="20%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            <linearGradient id="sa-metal-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="30%" stopColor="#94a3b8" />
              <stop offset="50%" stopColor="#f1f5f9" />
              <stop offset="70%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            <linearGradient id="glass-specular" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0.75)" />
              <stop offset="25%" stopColor="rgba(255,255,255,0.15)" />
              <stop offset="75%" stopColor="rgba(255,255,255,0.0)" />
              <stop offset="85%" stopColor="rgba(255,255,255,0.25)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.55)" />
            </linearGradient>
            <filter id="bench-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="8" stdDeviation="5" floodColor="#090d16" floodOpacity="0.45" />
            </filter>
            <filter id="flame-blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" />
            </filter>
            <filter id="inner-flame-blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1" />
            </filter>
            <filter id="sa-glow">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Bench Wall Background */}
          <rect width={W} height={H} fill="url(#sa-wall)" />
          <rect width={W} height={H} fill="url(#sa-dots)" opacity="0.6" />

          {/* Bench Countertop */}
          <rect x="0" y={H-118} width={W} height="118" fill="url(#sa-bench)" />
          <rect x="0" y={H-120} width={W} height="2" fill="#cbd5e1" />

          {/* ─── TEST TUBE RACK ─── */}
          {/* Metal rack base on the benchtop */}
          <rect x="50" y="476" width="420" height="12" rx="4" fill="url(#sa-metal-grad)" filter="url(#bench-shadow)" />
          {/* Metal rack top plate */}
          <rect x="50" y="380" width="420" height="8" rx="3" fill="url(#sa-metal-grad)" />
          {/* Rack holes */}
          {[96, 192, 288, 384, 456].map((rxVal, i) => (
            <g key={i}>
              <ellipse cx={rxVal} cy="384" rx="18" ry="4" fill="rgba(9,13,22,0.6)" />
            </g>
          ))}
          {/* Metal rack vertical posts */}
          <rect x="62"  y="388" width="10" height="88" fill="url(#sa-metal-grad)" />
          <rect x="448" y="388" width="10" height="88" fill="url(#sa-metal-grad)" />

          {/* ─── UNKNOWN SALT TUBE ─── */}
          <text x="96" y="192" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#7c3aed">Unknown Salt</text>
          <TestTube
            x={79} y={205}
            liquidColor={selectedSalt ? unknownColor : "rgba(203,213,225,0.20)"}
            label={salt ? salt.formula : "???"}
            sublabel={salt ? "solution" : "select salt"}
            highlight={phase === "preliminary" && !!selectedSalt}
          />

          {/* ─── CATION RESULT TUBE ─── */}
          <text x="222" y="162" textAnchor="middle" fontSize="10.5" fontWeight="800"
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
            liquidColor={state.cationLiquidColor}
            pptColor={state.cationPptColor || undefined}
            showBubbles={state.cationBubbles}
            gasLabel={state.cationGasLabel}
            label={cationTest ? "Result ✓" : "—"}
            sublabel={identifiedCation || ""}
            highlight={phase === "cation" && isTesting}
          />

          {/* ─── ANION RESULT TUBE ─── */}
          <text x="348" y="162" textAnchor="middle" fontSize="10.5" fontWeight="800"
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
            liquidColor={state.anionLiquidColor}
            pptColor={state.anionPptColor || undefined}
            showBubbles={state.anionBubbles}
            gasLabel={state.anionGasLabel}
            label={anionTest ? "Result ✓" : "—"}
            sublabel={identifiedAnion || ""}
            highlight={phase === "anion" && isTesting}
          />

          {/* ─── REAGENT DROPPERS ─── */}
          {phase === "cation" && cationTest && salt && salt.cation !== "calcium" && (
            <motion.g initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
              <ReagentDropper
                x={222} y={140}
                color="#e2e8f0"
                label={cationTest.reagent.split(" ").slice(0,2).join(" ")}
                dropping={isTesting}
              />
            </motion.g>
          )}
          {phase === "anion" && anionTest && (
            <motion.g initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
              <ReagentDropper
                x={348} y={140}
                color={anionTest.anion === "carbonate" ? "#e2e8f0" : anionTest.anion === "chloride" ? "rgba(240,248,255,0.9)" : "#cbd5e1"}
                label={anionTest.reagent.split(" ").slice(0,2).join(" ")}
                dropping={isTesting}
              />
            </motion.g>
          )}

          {/* ─── FLAME TEST LAMP ─── */}
          {state.flameColor && (
            <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }}>
              {/* Spirit lamp body */}
              <ellipse cx="472" cy="430" rx="22" ry="8" fill="#1e293b" opacity="0.6" />
              <rect x="450" y="406" width="44" height="26" rx="5" fill="url(#sa-metal-grad)" stroke="#94a3b8" strokeWidth="1" />
              <rect x="466" y="394" width="12" height="16" rx="3" fill="url(#sa-metal-grad)" stroke="#64748b" strokeWidth="1" />
              {/* Flame */}
              <motion.path
                initial={false}
                d="M472 406 Q465 388 472 372 Q479 388 486 372 Q481 400 472 406"
                fill={state.flameColor}
                filter="url(#flame-blur)"
                opacity="0.88"
                animate={{ scaleY:[1,1.18,0.92,1], scaleX:[1,0.88,1.06,1] }}
                transition={{ duration:1.1, repeat:Infinity, ease:"easeInOut" }}
                style={{ transformOrigin:"472px 406px" }}
              />
              <motion.path
                initial={false}
                d="M472 406 Q469 394 472 382 Q475 394 472 406"
                fill="#fcd34d" opacity="0.72"
                filter="url(#inner-flame-blur)"
                animate={{ scaleY:[1,1.12,0.9,1] }}
                transition={{ duration:0.85, repeat:Infinity, ease:"easeInOut" }}
                style={{ transformOrigin:"472px 406px" }}
              />
              <text x="472" y="462" textAnchor="middle" fontSize="8.5" fontWeight="600" fill="#475569">
                Flame Test
              </text>
              {/* Flame color label */}
              <rect x="444" y="466" width="56" height="16" rx="5"
                fill="rgba(226,232,240,0.9)"
                stroke="#cbd5e1" strokeWidth="0.8" />
              <text x="472" y="477" textAnchor="middle" fontSize="7.5" fontWeight="800"
                fill="#c2410c">
                {state.contamination > 2 ? "Contaminated" : "Brick Red"}
              </text>
            </motion.g>
          )}

          {/* ─── OBSERVATIONS LOG ─── */}
          {(cationResults.length > 0 || anionResults.length > 0) && (
            <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }}>
              <rect x="14" y="58" width="160" height={20 + (cationResults.length + anionResults.length) * 17 + 14} rx="10"
                fill="rgba(255,255,255,0.92)" stroke="rgba(148,163,184,0.2)" strokeWidth="1" />
              <text x="94" y="76" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#7c3aed">Observations</text>
              <line x1="18" y1="80" x2="170" y2="80" stroke="rgba(148,163,184,0.12)" strokeWidth="0.7" />
              {[...cationResults, ...anionResults].slice(0, 6).map((r, i) => (
                <g key={i}>
                  <circle cx="28" cy={94+i*17} r="5" fill={r.color} />
                  <text x="37" y="98+i*17" fontSize="8" fill="#475569">{r.testName.slice(0, 20)}</text>
                </g>
              ))}
            </motion.g>
          )}

          {/* ─── PHASE PILL ─── */}
          <rect x="408" y="58" width="138" height="24" rx="8"
            fill="rgba(255,255,255,0.90)" stroke="rgba(148,163,184,0.2)" strokeWidth="1" />
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
                  fill="rgba(255,255,255,0.96)" stroke="rgba(37,99,235,0.2)" strokeWidth="1" />
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

          {/* ─── IDENTIFICATION COMPLETED CELEBRATION CARD ─── */}
          <AnimatePresence>
            {phase === "identify" && salt && (
              <motion.g
                initial={{ opacity:0, y:18, scale:0.92 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0 }}
                style={{ transformOrigin:`${W/2}px 100px` }}
              >
                <rect x="110" y="58" width="340" height="84" rx="14"
                  fill="rgba(15, 23, 42, 0.90)" stroke="rgba(34,197,94,0.4)" strokeWidth="1.8"
                  filter="url(#sa-glow)"
                />
                <text x={W/2} y="82" textAnchor="middle" fontSize="12.5" fontWeight="800" fill="#34d399">
                  Salt Identified ✓
                </text>
                <text x={W/2} y="106" textAnchor="middle" fontSize="18" fontWeight="950" fill="#10b981">
                  {salt.name}
                </text>
                <text x={W/2} y="127" textAnchor="middle" fontSize="11" fontWeight="700" fill="#e2e8f0">
                  {salt.formula} · {salt.cation} cation + {salt.anion} anion
                </text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* ─── TEST RESULT INDICATORS (small badges on tubes) ─── */}
          {cationTest && (phase === "anion" || phase === "identify") && (
            <motion.g initial={{ opacity:0, scale:0.7 }} animate={{ opacity:1, scale:1 }}
              style={{ transformOrigin:"239px 186px" }}>
              <rect x="210" y="170" width="58" height="18" rx="5"
                fill="rgba(15, 23, 42, 0.85)" stroke="rgba(34,197,94,0.3)" strokeWidth="0.9" />
              <text x="239" y="183" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#34d399">✓ {identifiedCation || "tested"}</text>
            </motion.g>
          )}
          {anionTest && phase === "identify" && (
            <motion.g initial={{ opacity:0, scale:0.7 }} animate={{ opacity:1, scale:1 }}
              style={{ transformOrigin:"365px 172px" }}>
              <rect x="336" y="170" width="58" height="18" rx="5"
                fill="rgba(15, 23, 42, 0.85)" stroke="rgba(34,197,94,0.3)" strokeWidth="0.9" />
              <text x="365" y="183" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#34d399">✓ {identifiedAnion || "tested"}</text>
            </motion.g>
          )}
        </svg>
      </div>

      {/* ─── Right Side: Real-life Observation Camera Panel ─── */}
      <div 
        className="flex-1 flex flex-col justify-between border rounded-3xl p-6 shadow-lg relative min-h-[300px] lg:min-h-0 overflow-hidden"
        style={{
          background: "var(--lab-glass-heavy)",
          borderColor: "var(--lab-glass-border)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-600 opacity-80" />
        
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse" />
          <span className="text-[10px] font-black text-violet-400 tracking-widest uppercase">REAL-LIFE OBSERVATION SCANNER</span>
        </div>

        <AnimatePresence mode="wait">
          {activeObs ? (
            <motion.div
              key={activeObs.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col gap-4"
            >
              {/* Image Container with high quality photography */}
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-950 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeObs.image}
                  alt={activeObs.title}
                  className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md font-mono text-[9px] font-extrabold uppercase tracking-wide bg-slate-950/80 text-violet-400 border border-violet-500/20">
                  {activeObs.formula}
                </div>
              </div>

              {/* Observation Detail Card */}
              <div className="space-y-2.5">
                <h4 className="text-sm font-black text-slate-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: activeObs.color }} />
                  {activeObs.title}
                </h4>
                <p className="text-[11.5px] text-slate-400 leading-relaxed font-semibold">
                  {activeObs.desc}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-center p-6"
            >
              <div className="w-16 h-16 rounded-2xl border border-slate-800 bg-slate-950/40 flex items-center justify-center mb-4 text-2xl animate-pulse text-slate-600">
                🔬
              </div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1.5">Awaiting reaction catalyst</h4>
              <p className="text-[10px] text-slate-500 max-w-[240px] leading-relaxed">
                Run a cation test (NaOH/Flame) or anion test (AgNO₃/BaCl₂/HCl) to capture high-definition real photographic scans of experimental reactions.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer status readout */}
        <div className="border-t border-slate-800/80 pt-4 mt-4 flex items-center justify-between text-[9px] text-slate-500 font-semibold tracking-wide uppercase">
          <span>Camera feed: ONLINE</span>
          <span>Res: 1080p HD</span>
        </div>
      </div>
    </div>
  );
}
