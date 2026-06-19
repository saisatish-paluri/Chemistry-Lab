"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { FunctionalGroupsState } from "@/lib/engine/types";
import { COMPOUNDS, TESTS } from "@/lib/engine/functional-groups-engine";

interface Props {
  state: Pick<FunctionalGroupsState,
    "selectedCompound" | "selectedTest" | "testResults" | "isTesting" | "identified" | "temperature"
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
  const { selectedCompound, selectedTest, testResults, isTesting, identified, temperature } = state;

  const compound   = selectedCompound ? COMPOUNDS[selectedCompound] : null;
  const test       = selectedTest ? TESTS[selectedTest] : null;
  const lastResult = testResults[0] ?? null;

  const tubeColor     = lastResult ? lastResult.color : "rgba(219,234,254,0.45)";
  const showSilver    = lastResult?.testId === "tollens-test"   && lastResult.positive;
  const showOrangePpt = lastResult?.testId === "dnp-test"       && lastResult.positive;
  const showBubbles   = lastResult?.testId === "nahco3-test"    && lastResult.positive;
  const showCloudy    = lastResult?.testId === "lucas-test"     && lastResult.positive;
  const showPurple    = lastResult?.testId === "hinsberg-test"  && lastResult.positive;
  const showHinsbergOil = lastResult?.testId === "hinsberg-test" && !lastResult.positive;

  const groupInfo = identified ? GROUP_STRUCTURES[identified] : null;

  return (
    <div style={{ width: "100%", height: "auto", maxHeight: "100%", aspectRatio: `${W}/${H}` }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
        <defs>
          <pattern id="fg-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.75" fill="rgba(148,163,184,0.22)" />
          </pattern>
          <linearGradient id="fg-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#f1f5f9" />
          </linearGradient>
          <linearGradient id="fg-bench" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="20%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="fg-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="rgba(255,255,255,0.62)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
          </linearGradient>
          <linearGradient id="metal-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="30%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#f1f5f9" />
            <stop offset="70%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <linearGradient id="glass-specular" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
            <stop offset="25%" stopColor="rgba(255,255,255,0.15)" />
            <stop offset="75%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="85%" stopColor="rgba(255,255,255,0.25)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.55)" />
          </linearGradient>
          <filter id="fg-shadow">
            <feDropShadow dx="0" dy="3" stdDeviation="4.5" floodColor="rgba(0,0,0,0.15)" />
          </filter>
          <filter id="bench-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="10" stdDeviation="6" floodColor="#090d16" floodOpacity="0.45" />
          </filter>
          <filter id="fg-glow">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          
          {/* Reflective Tollens Silver Mirror Gradient */}
          <linearGradient id="tollens-silver" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="20%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#94a3b8" />
            <stop offset="70%" stopColor="#f8fafc" />
            <stop offset="85%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Silver Mirror Shine Overlay */}
          <linearGradient id="silver-shine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="50%" stopColor="white" stopOpacity="0.5" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>

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
        <rect x="0" y={H-120} width={W} height="6" fill="rgba(255,255,255,0.08)" />
        <line x1="0" y1={H-120} x2={W} y2={H-120} stroke="#475569" strokeWidth="1.5" />
        <rect x="0" y={H-122} width={W} height="2" fill="#64748b" opacity="0.8" />

        {/* Reagent Bottle Row */}
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

        {/* Pour animation (pour stream from bottle to tube) */}
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

        {/* Compound Vial (right side) */}
        <g transform="translate(432.5, 245) scale(1.4) translate(-432.5, -245)" filter="url(#fg-shadow)">
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
        <text x="432" y="340" textAnchor="middle" fontSize="9" fontWeight="600" fill="#64748b">
          Unknown compound
        </text>

        {/* MAIN TEST TUBE */}
        <g transform="translate(248, 210) scale(1.6) translate(-248, -210)" filter="url(#bench-shadow)">
          {/* Test tube holder (metal stand) */}
          <rect x="195" y="415" width="106" height="10" rx="4" fill="url(#metal-grad)" />
          <rect x="210" y="207" width="80" height="8" rx="3" fill="url(#metal-grad)" />
          <rect x="210" y="205" width="6" height="215" rx="3" fill="url(#metal-grad)" />
          <rect x="284" y="205" width="6" height="215" rx="3" fill="url(#metal-grad)" />

          {/* Base liquid */}
          <motion.rect x="232" y="255" width="32" height="173"
            fill="rgba(219,234,254,0.5)"
            clipPath="url(#fg-tube-c)"
            initial={{ height:0, y:428 }}
            animate={{ height: selectedTest ? 173 : 0, y: selectedTest ? 255 : 428 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />

          {/* Reaction product solution color */}
          <AnimatePresence>
            {lastResult && (
              <motion.rect key={lastResult.testId}
                x="232" y="255" width="32" height="173"
                fill={tubeColor} opacity="0.80"
                clipPath="url(#fg-tube-c)"
                initial={{ height:0, y:428 }}
                animate={{ height:173, y:255 }}
                transition={{ duration:1.3 }}
              />
            )}
          </AnimatePresence>

          {/* Animated liquid meniscus */}
          <motion.path
            initial={false}
            d="M232 0 Q248 4 264 0"
            fill="none"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="1.5"
            animate={{ y: selectedTest ? 255 : 428 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />

          {/* Glass tube outer outline (double glass thickness effect) */}
          <path d="M229 210 L229 418 Q229 437 248 437 Q267 437 267 418 L267 210 Z"
            fill="none" stroke="#64748b" strokeWidth="2.0" opacity="0.85" />
          <path d="M231 210 L231 417 Q231 434 248 434 Q265 434 265 417 L265 210"
            fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.0" />
          <path d="M230 210 L230 418 Q230 435 248 435 Q266 435 266 418 L266 210 Z"
            fill="url(#glass-specular)" pointerEvents="none" opacity="0.9" />

          {/* Tollens Metallic Silver Mirror Formation */}
          <AnimatePresence>
            {showSilver && (
              <motion.g
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 0.95, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0 }}
                style={{ transformOrigin: "248px 428px" }}
                transition={{ duration: 2.2, ease: "easeInOut" }}
              >
                {/* Metallic silver fill on tube wall */}
                <rect x="231" y="300" width="34" height="128"
                  fill="url(#tollens-silver)" clipPath="url(#fg-tube-c)" />
                {/* Shiny highlights */}
                <rect x="233" y="300" width="5" height="128" fill="rgba(255,255,255,0.4)" clipPath="url(#fg-tube-c)" />
                {/* Moving reflection sheen */}
                <motion.rect
                  x="231" y="300" width="34" height="40"
                  fill="url(#silver-shine)"
                  clipPath="url(#fg-tube-c)"
                  animate={{ y: [260, 428] }}
                  transition={{ duration: 2.0, repeat: Infinity, ease: "linear" }}
                />
                <text x="248" y="452" textAnchor="middle" fontSize="8" fontWeight="600" fill="#475569">Silver Mirror (Ag°)</text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* Orange DNP Precipitate (crystals growing and settling) */}
          <AnimatePresence>
            {showOrangePpt && (
              <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                {/* Settled precipitate bed at the bottom */}
                <motion.path
                  d="M 232 428 Q 248 408 264 428 Z"
                  fill="#ea580c"
                  clipPath="url(#fg-tube-c)"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 1.5, delay: 0.8 }}
                  style={{ transformOrigin: "248px 428px" }}
                />
                <motion.rect x="232" y="385" width="32" height="43"
                  fill="#f97316" opacity="0.80"
                  clipPath="url(#fg-tube-c)"
                  initial={{ height:0, y:428 }}
                  animate={{ height:43, y:385 }}
                  transition={{ duration:1.2, delay:0.4 }}
                />
                {/* Orange crystal flakes falling down */}
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.polygon
                    key={i}
                    points="0,0 -2,3 0,6 2,3"
                    fill="#c2410c"
                    clipPath="url(#fg-tube-c)"
                    animate={{
                      y: [260, 410 + (i % 3) * 6],
                      x: [248 + (i % 3 - 1) * 8, 248 + (i % 2 - 0.5) * 6],
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 1.8 + i * 0.2,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  />
                ))}
                <text x="248" y="452" textAnchor="middle" fontSize="8" fontWeight="600" fill="#ea580c">2,4-DNPH ppt</text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* Purple Hinsberg Precipitate (sulfonamide complex) */}
          <AnimatePresence>
            {showPurple && (
              <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <motion.rect x="232" y="380" width="32" height="48"
                  fill="#7c3aed" opacity="0.85"
                  clipPath="url(#fg-tube-c)"
                  initial={{ height:0, y:428 }}
                  animate={{ height:48, y:380 }}
                  transition={{ duration:1.1, delay:0.5 }}
                />
                <text x="248" y="452" textAnchor="middle" fontSize="8" fontWeight="600" fill="#7c3aed">Sulfonamide</text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* Hinsberg Negative: insoluble dense benzenesulfonyl chloride oil droplets settling */}
          {showHinsbergOil && (
            <g clipPath="url(#fg-tube-c)">
              {/* Dense organic oil layer at the bottom (d = 1.38 g/mL, settles under water) */}
              <motion.path
                d="M 232 428 Q 248 420 264 428 Z"
                fill="rgba(148, 163, 184, 0.75)"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 1.0 }}
                style={{ transformOrigin: "248px 428px" }}
              />
              {/* Droplets sliding down the walls and pool at the bottom */}
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.circle
                  key={i}
                  r={2.5 + (i % 2) * 1.5}
                  fill="rgba(100, 116, 139, 0.70)"
                  animate={{
                    y: [265, 422 - (i % 3) * 3],
                    x: [236 + i * 3.5, 238 + i * 3.2],
                    scale: [1, 1.2, 0.95]
                  }}
                  transition={{
                    duration: 2.2 + i * 0.3,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </g>
          )}

          {/* NaHCO3 CO2 gas bubbles rising */}
          <AnimatePresence>
            {showBubbles && (
              <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                {Array.from({ length: 12 }).map((_, i) => {
                  const seed = i * 29;
                  const bx = 236 + (seed % 7) * 4;
                  const size = 1.2 + (seed % 3) * 1.2;
                  const speed = 1.1 + (seed % 3) * 0.45;
                  return (
                    <motion.circle key={i} cx={bx} cy={425} r={size}
                      fill="rgba(255,255,255,0.8)" stroke="rgba(148,163,184,0.3)" strokeWidth="0.6"
                      animate={{
                        cy: [425, 258],
                        x: [bx, bx + (seed % 5 - 2) * 1.5, bx],
                        opacity: [0.95, 0.95, 0]
                      }}
                      transition={{
                        duration: speed,
                        repeat: Infinity,
                        delay: i * 0.18,
                        ease: "easeOut"
                      }}
                    />
                  );
                })}
                <text x="248" y="245" textAnchor="middle" fontSize="9" fontWeight="700" fill="#059669">CO₂↑</text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* Lucas positive SN1: Emulsion droplets coalescing & Phase separation */}
          <AnimatePresence>
            {showCloudy && (
              <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                {/* Upper organic layer (alkyl chloride product, d ≈ 0.88, floats at top) */}
                <motion.rect
                  x="232" y="255" width="32" height="48"
                  fill="rgba(240, 240, 240, 0.88)"
                  clipPath="url(#fg-tube-c)"
                  initial={{ height: 0 }}
                  animate={{ height: 48 }}
                  transition={{ duration: 2.0, ease: "easeOut" }}
                />
                
                {/* Curved meniscus phase boundary between organic and aqueous */}
                <motion.path
                  d="M 232 303 Q 248 305 264 303"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                />

                {/* Cloudiness / emulsion droplets floating up to the boundary */}
                {Array.from({ length: 15 }).map((_, i) => {
                  const seed = i * 23;
                  const dx = 235 + (seed % 5) * 6;
                  const size = 1.2 + (seed % 3) * 1.5;
                  const speed = 2.0 + (seed % 3) * 0.5;
                  return (
                    <motion.circle key={i} cx={dx} cy={420} r={size}
                      fill="rgba(255, 255, 255, 0.85)"
                      animate={{
                        cy: [420, 303],
                        opacity: [0.75, 0.75, 0.0],
                        scale: [1.0, 0.8, 1.2]
                      }}
                      transition={{
                        duration: speed,
                        repeat: Infinity,
                        delay: i * 0.25,
                        ease: "easeInOut"
                      }}
                    />
                  );
                })}
                <text x="248" y="452" textAnchor="middle" fontSize="8" fontWeight="600" fill="#64748b">2-Phase Emulsion</text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* Sheen */}
          <rect x="232" y="212" width="7" height="205" fill="rgba(255,255,255,0.42)" rx="3" />
        </g>
        <text x="248" y="595" textAnchor="middle" fontSize="10" fontWeight="600" fill="#64748b">Test Tube</text>

        {/* Test Spinner */}
        <AnimatePresence>
          {isTesting && (
            <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              <motion.circle cx="248" cy="396" r="35"
                stroke={REAGENT_COLORS[selectedTest ?? ""] ?? "#d97706"} strokeWidth="3.5" fill="none"
                strokeDasharray="52 24"
                animate={{ rotate:360 }}
                transition={{ duration:0.85, repeat:Infinity, ease:"linear" }}
                style={{ transformOrigin:"248px 396px" }}
              />
              <text x="248" y="400" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={REAGENT_COLORS[selectedTest ?? ""] ?? "#d97706"}>
                Testing
              </text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* Result Card */}
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
              <text x="306" y="266" fontSize="10" fontWeight="700" fill="#7c3aed">
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

        {/* Identified Group Card */}
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

        {/* Test History Dots */}
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

        {/* Step Hint */}
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
