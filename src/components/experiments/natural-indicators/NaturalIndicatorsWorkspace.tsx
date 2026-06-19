"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { NaturalIndicatorsState } from "@/lib/engine/types";
import { getIndicatorColor } from "@/lib/engine/natural-indicators-engine";

interface Props {
  state: NaturalIndicatorsState;
}

const W = 540;
const H = 600;

export default function NaturalIndicatorsWorkspace({ state }: Props) {
  const {
    selectedIndicator,
    preparationStep,
    extractProgress,
    extractConcentration,
    selectedSolution,
    solutionPh,
    addedIndicatorDrops,
    colorMixProgress,
  } = state;

  const [isMashingAnim, setIsMashingAnim] = useState(false);
  const [mashRotation, setMashRotation] = useState(0);

  // Mashing animation triggers
  useEffect(() => {
    if (extractProgress > 0 && extractProgress < 1.0) {
      setIsMashingAnim(true);
      const interval = setInterval(() => {
        setMashRotation(r => (r + 45) % 360);
      }, 150);
      return () => clearInterval(interval);
    } else {
      setIsMashingAnim(false);
    }
  }, [extractProgress]);

  // Color propagation math
  // Color starts at the top of the test tube and travels to the bottom
  const targetColor = selectedIndicator && selectedSolution
    ? getIndicatorColor(selectedIndicator, solutionPh)
    : "#f1f5f9";

  // Scale color intensity based on extract concentration
  const getConcentrationColor = (baseColor: string) => {
    // If concentration is low, color is washed out/faint
    if (extractConcentration >= 0.9) return baseColor;
    // Simple hex opacity scale
    const alpha = Math.max(0.12, extractConcentration).toFixed(2);
    return `${baseColor}bf`; // 75% opacity for faint results
  };

  const finalColor = getConcentrationColor(targetColor);

  // Particle drops animation
  const [drops, setDrops] = useState<{ id: number }[]>([]);
  const dropId = useRef(0);

  useEffect(() => {
    if (addedIndicatorDrops > 0) {
      dropId.current += 1;
      const nid = dropId.current;
      startTransition(() => setDrops(p => [...p, { id: nid }]));
      setTimeout(() => startTransition(() => setDrops(p => p.filter(d => d.id !== nid))), 650);
    }
  }, [addedIndicatorDrops]);

  return (
    <div style={{ width: "100%", height: "auto", maxHeight: "100%", aspectRatio: "540/600" }}>
      <svg viewBox="0 0 540 600" style={{ width: "100%", height: "100%" }}>
        <defs>
          <pattern id="ind-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.75" fill="rgba(148,163,184,0.06)" />
          </pattern>
          <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#eff6ff" />
          </linearGradient>
          <linearGradient id="bench" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="3%" stopColor="#e2e8f0" />
            <stop offset="10%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* Color propagation gradient: top gets colored first, bottom stays clear/light grey */}
          <linearGradient id="propagate-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={finalColor} />
            <stop offset={`${Math.min(100, colorMixProgress * 100)}%`} stopColor={finalColor} />
            <stop offset={`${Math.min(100, colorMixProgress * 100 + 10)}%`} stopColor="#cbd5e1" opacity="0.3" />
            <stop offset="100%" stopColor="#cbd5e1" opacity="0.15" />
          </linearGradient>

          <linearGradient id="glass-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.65)" />
            <stop offset="10%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="50%" stopColor="rgba(240,253,250,0.03)" />
            <stop offset="85%" stopColor="rgba(240,253,250,0.12)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.4)" />
          </linearGradient>
          <linearGradient id="glass-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.15)" />
          </linearGradient>
          <linearGradient id="mortar-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="30%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
          <linearGradient id="pestle-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="30%" stopColor="#f1f5f9" />
            <stop offset="70%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="metal-clamp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="50%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <filter id="shadow" x="-10%" y="-10%" width="125%" height="125%">
            <feDropShadow dx="3" dy="12" stdDeviation="6" floodColor="#020617" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Background */}
        <rect width={W} height={H} fill="url(#wall)" />
        <rect width={W} height={H} fill="url(#ind-dots)" opacity="0.4" />

        {/* Benchtop */}
        <rect x="0" y={H-140} width={W} height="140" fill="url(#bench)" />
        <rect x="0" y={H-140} width={W} height="3" fill="rgba(255,255,255,0.18)" />

        {/* ─── PHASE 1: MASHING IN MORTAR ─── */}
        {preparationStep === "mortar" && (
          <g filter="url(#shadow)">
            {/* Mortar Bowl */}
            <path d="M 180 320 Q 270 420 360 320 Q 380 320 370 300 L 170 300 Q 160 320 180 320 Z" fill="url(#mortar-grad)" stroke="#334155" strokeWidth="2" />
            <path d="M 185 304 Q 270 310 355 304" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
            {/* Inside pulp material */}
            <motion.ellipse
              cx="270"
              cy="345"
              rx={65 * Math.min(1.0, 0.4 + extractProgress * 0.6)}
              ry={24 * Math.min(1.0, 0.4 + extractProgress * 0.6)}
              fill={selectedIndicator === "turmeric" ? "#f59e0b" : selectedIndicator === "china-rose" ? "#ec4899" : "#8b5cf6"}
              animate={{ scale: isMashingAnim ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 0.2, repeat: Infinity }}
            />
            {/* Pestle grinder tool */}
            <motion.g
              animate={isMashingAnim ? { rotate: mashRotation, x: [0, 15, -15, 0], y: [0, -10, 5, 0] } : {}}
              style={{ transformOrigin: "270px 300px" }}
            >
              <rect x="255" y="160" width="30" height="130" rx="15" fill="url(#pestle-grad)" stroke="#475569" strokeWidth="1.5" />
              <ellipse cx="270" cy="285" rx="20" ry="12" fill="#64748b" />
              <line x1="258" y1="170" x2="258" y2="280" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
            </motion.g>
            
            <text x="270" y="420" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#cbd5e1">
              {isMashingAnim ? "Mashing petals & roots..." : "Click MASH to grind indicator material"}
            </text>
          </g>
        )}

        {/* ─── PHASE 2: SOLVENT STEEPING ─── */}
        {preparationStep === "solvent" && (
          <g filter="url(#shadow)">
            {/* Beaker for extraction outer */}
            <rect x="180" y="220" width="180" height="180" rx="8" fill="url(#glass-grad)" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
            {/* Beaker inner glass for thickness */}
            <rect x="182.5" y="222.5" width="175" height="175" rx="6" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
            
            {/* Steeping Liquid with curved meniscus */}
            <g>
              <path
                d="M 183 310 Q 270 314 357 310 L 357 395 Q 357 397.5 354 397.5 L 186 397.5 Q 183 397.5 183 395 Z"
                fill={selectedIndicator === "turmeric" ? "#fbbf24" : selectedIndicator === "china-rose" ? "#f472b6" : "#c084fc"}
                opacity={0.3 + extractConcentration * 0.6}
              />
              <path
                d="M 183 310 Q 270 314 357 310"
                fill="none"
                stroke="rgba(255,255,255,0.65)"
                strokeWidth="2"
              />
            </g>

            {/* Mashed pulp settling at bottom */}
            <ellipse cx="270" cy="388" rx="70" ry="8" fill={selectedIndicator === "turmeric" ? "#d97706" : selectedIndicator === "china-rose" ? "#db2777" : "#7c3aed"} />

            {/* Steeping steam lines */}
            <g opacity="0.5">
              <path d="M 230 200 Q 235 190 230 180" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 270 200 Q 275 190 270 180" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 310 200 Q 315 190 310 180" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
            </g>

            <rect x="183" y="223" width="18" height="174" fill="url(#glass-sheen)" />

            <text x="270" y="425" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#cbd5e1">
              Steeping... wait for pigment extraction concentration.
            </text>
          </g>
        )}

        {/* ─── PHASE 3: ADDING DROPS TO TEST SOLUTION ─── */}
        {(preparationStep === "extracted" || preparationStep === "mortar" || preparationStep === "solvent") && selectedSolution && (
          <g filter="url(#shadow)">
            {/* Test Tube Rack Base */}
            <rect x="90" y="430" width="360" height="20" rx="5" fill="url(#metal-clamp)" stroke="#1e293b" strokeWidth="1" />
            <rect x="90" y="432" width="360" height="4" fill="rgba(255,255,255,0.25)" />
            
            {/* Test Tube Glass Outer */}
            <rect x="230" y="180" width="80" height="270" rx="40" fill="url(#glass-grad)" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
            {/* Test Tube Glass Inner */}
            <rect x="232.5" y="182.5" width="75" height="265" rx="37.5" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <ellipse cx="270" cy="180" rx="42" ry="3.5" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
            
            {/* Test Solution Liquid inside test tube with curved meniscus */}
            <g>
              <path
                d="M 232.5 310 Q 270 314 307.5 310 L 307.5 410 Q 307.5 447.5 270 447.5 Q 232.5 447.5 232.5 410 Z"
                fill={addedIndicatorDrops > 0 ? "url(#propagate-grad)" : "#94a3b8"}
                opacity={addedIndicatorDrops > 0 ? 0.95 : 0.15}
              />
              <path
                d="M 232.5 310 Q 270 314 307.5 310"
                fill="none"
                stroke="rgba(255, 255, 255, 0.75)"
                strokeWidth="2.2"
              />
            </g>

            {/* Dropper Tool */}
            <g transform="translate(195, 50)">
              {/* Rubber bulb */}
              <path d="M 60 10 C 50 10 45 25 45 35 C 45 42 50 48 60 48 C 70 48 75 42 75 35 C 75 25 70 10 60 10 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
              <path d="M 52 20 C 50 20 48 28 48 35" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" />
              {/* Glass barrel */}
              <rect x="56" y="48" width="8" height="60" fill="rgba(255,255,255,0.4)" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
              {/* Tip nozzle */}
              <path d="M 56 108 L 59 116 L 61 116 L 64 108 Z" fill="rgba(255,255,255,0.6)" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
              
              {/* Filled indicator concentrate in dropper tip */}
              {addedIndicatorDrops === 0 && (
                <path
                  d="M 57.2 88 L 62.8 88 L 62.8 107.5 L 57.2 107.5 Z"
                  fill={selectedIndicator === "turmeric" ? "#fbbf24" : selectedIndicator === "china-rose" ? "#ec4899" : "#8b5cf6"}
                />
              )}
            </g>

            {/* Dropping Teardrop Animation */}
            <AnimatePresence>
              {drops.map(d => (
                <motion.g key={d.id}>
                  <motion.path
                    d="M 255 170 Q 251 180 255 184 Q 259 180 255 170"
                    fill={selectedIndicator === "turmeric" ? "#fbbf24" : selectedIndicator === "china-rose" ? "#ec4899" : "#8b5cf6"}
                    animate={{ y: [0, 138], scaleY: [1, 1.4, 0.8], opacity: [1, 1, 0] }}
                    transition={{ duration: 0.6, ease: "easeIn" }}
                  />
                </motion.g>
              ))}
            </AnimatePresence>

            {/* Solution Info Labels - Sleek Digital Card */}
            <g transform="translate(360, 240)" filter="url(#shadow)">
              <rect x="0" y="0" width="160" height="56" rx="8" fill="rgba(15,23,42,0.85)" stroke="rgba(251,191,36,0.3)" strokeWidth="1.2" />
              <rect x="2" y="2" width="156" height="52" rx="6" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <text x="12" y="18" fontSize="10" fontWeight="bold" fill="#fbbf24">TEST TUBE DETAILS</text>
              <text x="12" y="32" fontSize="9.5" fill="#e2e8f0" fontFamily="monospace">pH value: {solutionPh.toFixed(1)}</text>
              <text x="12" y="44" fontSize="9.5" fill="#cbd5e1">Drops added: <tspan fill="#38bdf8" fontWeight="bold">{addedIndicatorDrops}</tspan></text>
            </g>
          </g>
        )}

        {/* Real pH color scale overlay - Sleek Digital HUD */}
        {selectedIndicator && (
          <g transform="translate(15, 60)" filter="url(#shadow)">
            <rect x="0" y="0" width="230" height="98" rx="8" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(251, 191, 36, 0.3)" strokeWidth="1.5" />
            <rect x="2" y="2" width="226" height="94" rx="6" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
            <text x="15" y="22" fontSize="11" fontWeight="bold" fill="#fbbf24" letterSpacing="0.5">pH SPECTRAL TRANSITION</text>
            
            {/* Color spectrum swatches */}
            {[
              { pH: 2, c: getIndicatorColor(selectedIndicator, 2) },
              { pH: 5, c: getIndicatorColor(selectedIndicator, 5) },
              { pH: 7, c: getIndicatorColor(selectedIndicator, 7) },
              { pH: 9, c: getIndicatorColor(selectedIndicator, 9) },
              { pH: 12, c: getIndicatorColor(selectedIndicator, 12) },
            ].map((sw, i) => (
              <g key={i} transform={`translate(${15 + i * 41}, 32)`}>
                <rect x="0" y="0" width="32" height="15" fill={sw.c} rx="3" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
                <text x="16" y="26" textAnchor="middle" fontSize="8" fill="#e2e8f0" fontWeight="bold">pH {sw.pH}</text>
              </g>
            ))}

            <line x1="15" y1="64" x2="215" y2="64" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <text x="15" y="80" fontSize="9.5" fontWeight="bold" fill="#60a5fa" fontFamily="monospace">
              Calculated Color: {finalColor.toUpperCase()}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
