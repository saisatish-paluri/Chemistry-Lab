"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { FunctionalGroupsState } from "@/lib/engine/types";
import { COMPOUNDS, TESTS } from "@/lib/engine/functional-groups-engine";

interface Props {
  state: Pick<FunctionalGroupsState,
    "selectedCompound" | "selectedTest" | "testResults" | "isTesting" | "identified"
  >;
}

const W = 560;
const H = 610;

// ── Functional group structural formulas (SVG text representations) ──────────
const GROUP_STRUCTURES: Record<string, { symbol: string; name: string; color: string }> = {
  "alcohol":         { symbol: "–OH",   name: "Hydroxyl group",      color: "#22c55e" },
  "aldehyde":        { symbol: "–CHO",  name: "Aldehyde group",      color: "#f97316" },
  "ketone":          { symbol: "C=O",   name: "Carbonyl group",      color: "#a855f7" },
  "carboxylic-acid": { symbol: "–COOH", name: "Carboxyl group",      color: "#ef4444" },
  "amine":           { symbol: "–NH₂",  name: "Amino group",         color: "#3b82f6" },
};

const REAGENT_COLORS: Record<string, string> = {
  "lucas-test":    "#22c55e",
  "tollens-test":  "#f97316",
  "dnp-test":      "#f59e0b",
  "nahco3-test":   "#ef4444",
  "hinsberg-test": "#3b82f6",
};

// ── Compact reagent bottle ────────────────────────────────────────────────────
function ReagentBottle({ x, y, color, topLabel, label, active }: {
  x: number; y: number; color: string; topLabel: string; label: string; active?: boolean;
}) {
  return (
    <g>
      {active && (
        <motion.rect x={x-5} y={y-5} width="65" height="105" rx="7"
          fill={color} opacity="0.06"
          stroke={color} strokeWidth="1"
          animate={{ opacity:[0.06,0.14,0.06] }} transition={{ duration:1.6, repeat:Infinity }}
        />
      )}
      {/* Bottle neck */}
      <rect x={x+13} y={y} width="20" height="16" rx="4"
        fill="rgba(241,245,249,0.58)" stroke="#94a3b8" strokeWidth="1.3" />
      {/* Bottle body */}
      <rect x={x+4} y={y+14} width="38" height="76" rx="6"
        fill={active ? `${color}18` : "rgba(241,245,249,0.52)"} stroke="#94a3b8" strokeWidth="1.4" />
      {/* Label background */}
      <rect x={x+7} y={y+30} width="32" height="40" rx="4"
        fill="rgba(255,255,255,0.82)" stroke="rgba(148,163,184,0.25)" strokeWidth="0.8" />
      <text x={x+23} y={y+43} textAnchor="middle" fontSize="7.5" fontWeight="800" fill={active ? color : "#334155"}>
        {topLabel}
      </text>
      <text x={x+23} y={y+55} textAnchor="middle" fontSize="6.5" fill="#64748b">{label.slice(0,10)}</text>
      {/* Liquid inside */}
      <rect x={x+6} y={y+55} width="34" height="33" rx="0 0 4 4"
        fill={active ? `${color}38` : "rgba(203,213,225,0.3)"} />
      {/* Sheen */}
      <rect x={x+6} y={y+16} width="7" height="72" fill="rgba(255,255,255,0.35)" rx="3" />
    </g>
  );
}

export default function FunctionalGroupsWorkspace({ state }: Props) {
  const { selectedCompound, selectedTest, testResults, isTesting, identified } = state;

  const compound   = selectedCompound ? COMPOUNDS[selectedCompound] : null;
  const test       = selectedTest ? TESTS[selectedTest] : null;
  const lastResult = testResults[0] ?? null;

  const tubeColor     = lastResult ? lastResult.color : "rgba(219,234,254,0.45)";
  const showSilver    = lastResult?.testId === "tollens-test"   && lastResult.positive;
  const showOrangePpt = lastResult?.testId === "dnp-test"       && lastResult.positive;
  const showBubbles   = lastResult?.testId === "nahco3-test"    && lastResult.positive;
  const showCloudy    = lastResult?.testId === "lucas-test"     && lastResult.positive;
  const showPurple    = lastResult?.testId === "hinsberg-test"  && lastResult.positive;

  const groupInfo = identified ? GROUP_STRUCTURES[identified] : null;

  return (
    <div className="lab-ws-area" style={{ width: "100%", height: "auto", maxHeight: "100%", aspectRatio: `${W}/${H}` }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
        <defs>
          <pattern id="fg-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.75" fill="rgba(148,163,184,0.22)" />
          </pattern>
          <linearGradient id="fg-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="100%" stopColor="#f8fafc" />
          </linearGradient>
          <linearGradient id="fg-bench" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="fg-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="rgba(255,255,255,0.62)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
          </linearGradient>
          <filter id="fg-shadow">
            <feDropShadow dx="0" dy="3" stdDeviation="4.5" floodColor="rgba(0,0,0,0.11)" />
          </filter>
          <filter id="fg-glow">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="fg-silver">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
            <feColorMatrix type="saturate" values="0" in="noise" result="grey" />
            <feBlend in="SourceGraphic" in2="grey" mode="multiply" />
          </filter>
          <clipPath id="fg-tube-c">
            <path d="M230 210 L230 418 Q230 435 248 435 Q266 435 266 418 L266 210 Z" />
          </clipPath>
        </defs>

        {/* Background */}
        <rect width={W} height={H} fill="url(#fg-wall)" />
        <rect width={W} height={H} fill="url(#fg-dots)" opacity="0.7" />

        {/* Header */}
        <rect x="0" y="0" width={W} height="50" fill="rgba(248,250,252,0.97)" />
        <line x1="0" y1="50" x2={W} y2="50" stroke="rgba(226,232,240,0.9)" strokeWidth="1" />
        <text x={W/2} y="29" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e293b">
          Functional Group Identification
        </text>
        <text x={W/2} y="43" textAnchor="middle" fontSize="9.5" fill="#94a3b8">
          Characteristic chemical tests identify organic functional groups
        </text>

        {/* Bench */}
        <rect x="0" y={H-120} width={W} height="120" fill="url(#fg-bench)" />
        <rect x="0" y={H-122} width={W} height="4" fill="#94a3b8" opacity="0.38" />

        {/* ─── REAGENT BOTTLE ROW ─── */}
        <text x={W/2} y="70" textAnchor="middle" fontSize="9" fontWeight="600" fill="#94a3b8">Reagent Bottles</text>
        {[
          { id:"lucas-test",    topLabel:"Lucas",   label:"ZnCl₂/HCl",  color:"#22c55e" },
          { id:"tollens-test",  topLabel:"Tollen's", label:"Ag(NH₃)₂⁺", color:"#f97316" },
          { id:"dnp-test",      topLabel:"2,4-DNP",  label:"DNPH/H₂SO₄", color:"#f59e0b" },
          { id:"nahco3-test",   topLabel:"NaHCO₃",  label:"Na₂CO₃(aq)", color:"#ef4444" },
          { id:"hinsberg-test", topLabel:"Hinsberg", label:"BzCl/NaOH",  color:"#3b82f6" },
        ].map(({ id, topLabel, label, color }, i) => (
          <ReagentBottle key={id}
            x={30 + i * 102} y={72}
            color={color}
            topLabel={topLabel}
            label={label}
            active={selectedTest === id}
          />
        ))}

        {/* ─── POUR ANIMATION (bottle to tube) ─── */}
        <AnimatePresence>
          {isTesting && test && (
            <motion.g initial={{ opacity:0 }} animate={{ opacity:0.85 }} exit={{ opacity:0 }}>
              <motion.path
                d="M248 185 Q248 205 248 210"
                fill="none" stroke={REAGENT_COLORS[selectedTest ?? ""] ?? "#94a3b8"} strokeWidth="4" strokeLinecap="round"
                strokeDasharray="6 4"
                animate={{ strokeDashoffset:[0,-14] }}
                transition={{ duration:0.4, repeat:Infinity, ease:"linear" }}
              />
            </motion.g>
          )}
        </AnimatePresence>

        {/* ─── COMPOUND VIAL (right side) ─── */}
        <g filter="url(#fg-shadow)">
          <rect x="400" y="195" width="65" height="100" rx="7"
            fill="rgba(241,245,249,0.55)" stroke="#94a3b8" strokeWidth="1.5" />
          <rect x="414" y="180" width="38" height="18" rx="4"
            fill="rgba(241,245,249,0.55)" stroke="#94a3b8" strokeWidth="1.3" />
          <rect x="405" y="215" width="55" height="52" rx="4"
            fill="rgba(255,255,255,0.78)" stroke="rgba(148,163,184,0.28)" strokeWidth="0.8" />
          <text x="432" y="232" textAnchor="middle" fontSize="10" fontWeight="800" fill="#7c3aed">
            {compound ? compound.label : "Unknown"}
          </text>
          <text x="432" y="247" textAnchor="middle" fontSize="8" fill="#475569">
            {compound ? compound.formula.slice(0,10) : "Select"}
          </text>
          <text x="432" y="259" textAnchor="middle" fontSize="7.5" fill="#64748b">
            {compound ? compound.groupName : "compound"}
          </text>
          <rect x="402" y="265" width="61" height="28" rx="0 0 5 5" fill="rgba(199,210,254,0.45)" />
          <rect x="404" y="196" width="9" height="96" fill="rgba(255,255,255,0.35)" rx="3" />
        </g>
        <text x="432" y="310" textAnchor="middle" fontSize="9" fontWeight="600" fill="#64748b">
          Unknown compound
        </text>

        {/* ─── MAIN TEST TUBE ─── */}
        <g filter="url(#fg-shadow)">
          {/* Test tube holder (metal ring stand) */}
          <rect x="210" y="207" width="80" height="8" rx="3" fill="#64748b" opacity="0.45" />
          <rect x="210" y="205" width="6" height="215" rx="3" fill="#94a3b8" opacity="0.45" />
          <rect x="284" y="205" width="6" height="215" rx="3" fill="#94a3b8" opacity="0.45" />
          {/* Glass tube */}
          <path d="M230 210 L230 418 Q230 436 248 436 Q266 436 266 418 L266 210 Z"
            fill="rgba(241,245,249,0.52)" stroke="#64748b" strokeWidth="2.1" />
          {/* Base liquid */}
          <motion.rect x="232" y="255" width="32" height="173"
            fill="rgba(219,234,254,0.5)"
            clipPath="url(#fg-tube-c)"
            initial={{ height:0, y:428 }}
            animate={{ height: selectedTest ? 173 : 0, y: selectedTest ? 255 : 428 }}
            transition={{ duration:1.1, ease:"easeOut" }}
          />
          {/* Reaction product */}
          <AnimatePresence>
            {lastResult && (
              <motion.rect key={lastResult.testId}
                x="232" y="255" width="32" height="173"
                fill={tubeColor} opacity="0.85"
                clipPath="url(#fg-tube-c)"
                initial={{ height:0, y:428 }}
                animate={{ height:173, y:255 }}
                transition={{ duration:1.3 }}
              />
            )}
          </AnimatePresence>

          {/* Silver mirror */}
          <AnimatePresence>
            {showSilver && (
              <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <rect x="232" y="310" width="32" height="118"
                  fill="rgba(200,215,228,0.88)" filter="url(#fg-silver)" />
                <rect x="232" y="310" width="32" height="10" fill="rgba(248,250,252,0.96)" />
                <rect x="232" y="318" width="32" height="4"  fill="rgba(226,232,240,0.7)" />
                <text x="248" y="450" textAnchor="middle" fontSize="8" fontWeight="600" fill="#475569">Ag° mirror</text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* Orange DNP precipitate */}
          <AnimatePresence>
            {showOrangePpt && (
              <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <motion.rect x="232" y="385" width="32" height="43"
                  fill="#f97316" opacity="0.88"
                  clipPath="url(#fg-tube-c)"
                  initial={{ height:0, y:428 }}
                  animate={{ height:43, y:385 }}
                  transition={{ duration:1.1, delay:0.5 }}
                />
                <text x="248" y="450" textAnchor="middle" fontSize="8" fontWeight="600" fill="#ea580c">Orange ppt</text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* Purple Hinsberg precipitate */}
          <AnimatePresence>
            {showPurple && (
              <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <motion.rect x="232" y="380" width="32" height="48"
                  fill="#8b5cf6" opacity="0.82"
                  clipPath="url(#fg-tube-c)"
                  initial={{ height:0, y:428 }}
                  animate={{ height:48, y:380 }}
                  transition={{ duration:1.1, delay:0.5 }}
                />
                <text x="248" y="450" textAnchor="middle" fontSize="8" fontWeight="600" fill="#7c3aed">Sulfonamide</text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* CO₂ bubbles */}
          <AnimatePresence>
            {showBubbles && (
              <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                {[235,242,250,257,263].map((bx, i) => (
                  <motion.circle key={i} cx={bx} cy={412} r="3"
                    fill="rgba(255,255,255,0.78)" stroke="rgba(148,163,184,0.4)" strokeWidth="0.7"
                    animate={{ cy:[412,258], opacity:[0.9,0] }}
                    transition={{ duration:1.6, repeat:Infinity, delay:i*0.38, ease:"easeOut" }}
                  />
                ))}
                <text x="248" y="245" textAnchor="middle" fontSize="9" fontWeight="700" fill="#059669">CO₂↑</text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* Cloudiness (Lucas – turbid) */}
          <AnimatePresence>
            {showCloudy && (
              <motion.g initial={{ opacity:0 }} animate={{ opacity:0.75 }} exit={{ opacity:0 }}>
                {[[235,310],[248,330],[258,355],[236,375],[248,395]].map(([cx,cy],i) => (
                  <motion.circle key={i} cx={cx} cy={cy} r="8"
                    fill="rgba(248,250,252,0.92)"
                    animate={{ scale:[1,1.2,0.9,1], opacity:[0.7,1,0.6,0.7] }}
                    transition={{ duration:2.1, repeat:Infinity, delay:i*0.48 }}
                  />
                ))}
                <text x="248" y="450" textAnchor="middle" fontSize="8" fontWeight="600" fill="#64748b">Turbid / cloudy</text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* Sheen */}
          <rect x="232" y="212" width="7" height="205" fill="rgba(255,255,255,0.42)" rx="3" />
        </g>
        <text x="248" y="460" textAnchor="middle" fontSize="10" fontWeight="600" fill="#64748b">Test Tube</text>

        {/* ─── TEST SPINNER ─── */}
        <AnimatePresence>
          {isTesting && (
            <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              <motion.circle cx="248" cy="326" r="22"
                stroke={REAGENT_COLORS[selectedTest ?? ""] ?? "#d97706"} strokeWidth="3.5" fill="none"
                strokeDasharray="52 24"
                animate={{ rotate:360 }}
                transition={{ duration:0.85, repeat:Infinity, ease:"linear" }}
                style={{ transformOrigin:"248px 326px" }}
              />
              <text x="248" y="330" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={REAGENT_COLORS[selectedTest ?? ""] ?? "#d97706"}>
                Testing
              </text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* ─── RESULT CARD ─── */}
        <AnimatePresence>
          {lastResult && !isTesting && (
            <motion.g
              initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            >
              <rect x="292" y="210" width="250" height="190" rx="14"
                fill="rgba(255,255,255,0.97)"
                stroke={lastResult.positive ? "rgba(34,197,94,0.45)" : "rgba(148,163,184,0.32)"} strokeWidth="1.6" />
              {/* Header strip */}
              <rect x="292" y="210" width="250" height="38" rx="14 14 0 0"
                fill={lastResult.positive ? "rgba(240,253,244,0.9)" : "rgba(241,245,249,0.9)"} />
              <circle cx="312" cy="229" r="9"
                fill={lastResult.positive ? "#22c55e" : "#94a3b8"} />
              <text x="322" y="223" fontSize="10" fontWeight="800"
                fill={lastResult.positive ? "#166534" : "#475569"}>
                {lastResult.positive ? "POSITIVE ✓" : "NEGATIVE ✗"}
              </text>
              <text x="322" y="236" fontSize="8.5" fill="#64748b">
                {lastResult.testName}
              </text>
              {/* Test details */}
              <text x="306" y="266" fontSize="10" fontWeight="700" fill="#1d4ed8">
                Compound: {compound?.label}
              </text>
              <text x="306" y="282" fontSize="9" fill="#475569">
                Reagent: {test?.reagent?.slice(0,28)}
              </text>
              {/* Observation (multiline via text, NOT foreignObject) */}
              <text x="306" y="300" fontSize="8.5" fill="#64748b">
                {lastResult.observation?.slice(0,46)}
              </text>
              <text x="306" y="313" fontSize="8.5" fill="#64748b">
                {lastResult.observation?.slice(46,90)}
              </text>
              <text x="306" y="326" fontSize="8.5" fill="#64748b">
                {lastResult.observation?.slice(90,134)}
              </text>
              {/* Detects badge */}
              <rect x="306" y="334" width="90" height="16" rx="5"
                fill={lastResult.positive ? "rgba(34,197,94,0.12)" : "rgba(148,163,184,0.12)"} />
              <text x="351" y="345" textAnchor="middle" fontSize="8" fontWeight="700"
                fill={lastResult.positive ? "#166534" : "#64748b"}>
                Detects: {test?.detects?.replace("-"," ")}
              </text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* ─── IDENTIFIED GROUP CARD ─── */}
        <AnimatePresence>
          {identified && groupInfo && (
            <motion.g
              initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
              style={{ transformOrigin:`${W/2}px 100px` }}
            >
              <rect x="106" y="58" width={W-212} height="68" rx="14"
                fill="rgba(240,253,244,0.98)" stroke={groupInfo.color+"55"} strokeWidth="2.2"
                filter="url(#fg-glow)"
              />
              <text x={W/2} y="80" textAnchor="middle" fontSize="11" fontWeight="600" fill="#166534">
                Functional Group Identified ✓
              </text>
              <text x={W/2} y="100" textAnchor="middle" fontSize="20" fontWeight="900" fill={groupInfo.color}>
                {groupInfo.symbol}
              </text>
              <text x={W/2} y="115" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#475569">
                {groupInfo.name}
              </text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* ─── TEST HISTORY DOTS ─── */}
        {testResults.slice(0, 5).map((r, i) => (
          <g key={r.testId + i}>
            <circle cx={26 + i*26} cy={H-30} r="10" fill={r.positive ? "#22c55e" : "#f87171"} />
            <text x={26 + i*26} y={H-26} textAnchor="middle" fontSize="9" fontWeight="700" fill="white">
              {r.positive ? "+" : "–"}
            </text>
            <text x={26 + i*26} y={H-15} textAnchor="middle" fontSize="6.5" fill="#64748b">
              {r.testName?.split(" ")[0]?.slice(0,5)}
            </text>
          </g>
        ))}

        {/* ─── STEP HINT ─── */}
        <rect x="14" y="62" width="205" height="22" rx="7"
          fill="rgba(255,255,255,0.9)" stroke="rgba(148,163,184,0.28)" strokeWidth="0.9" />
        <text x="24" y="77" fontSize="9.5" fontWeight="600" fill="#475569">
          {!selectedCompound   ? "① Select unknown compound →" :
           !selectedTest       ? "② Choose a reagent test →"   :
           isTesting           ? "⏳ Reaction in progress…"    :
           lastResult?.positive ? "③ Positive — group identified!" :
           "③ Negative — try another test →"}
        </text>
      </svg>
    </div>
  );
}
