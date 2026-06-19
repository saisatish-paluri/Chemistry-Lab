"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CrystallizationState } from "@/lib/engine/types";
import { getCuSO4Solubility } from "@/lib/engine/crystallization-engine";

interface Props {
  state: CrystallizationState;
}

const W = 540;
const H = 600;

export default function CrystallizationWorkspace({ state }: Props) {
  const {
    status,
    impureSaltMass,
    waterVolume,
    temperature,
    dissolvedMass,
    undissolvedMass,
    crystalsFormedMass,
    crystalSize,
    coolingRate,
    isHeating,
    isCooling,
    pureProductCollected,
    productPurity,
    isFiltered,
    isCollected,
    solidImpurityMass,
    dissolvedImpurityMass,
  } = state;

  const [steamLines, setSteamLines] = useState<number[]>([1, 2, 3]);

  // Steam lines animation during heating
  useEffect(() => {
    if (!isHeating || temperature < 50) return;
    const interval = setInterval(() => {
      startTransition(() => {
        setSteamLines(prev => prev.map(id => (id + 1) % 4));
      });
    }, 600);
    return () => clearInterval(interval);
  }, [isHeating, temperature]);

  // Apparatus scaling: occupy 95% workspace
  // Beaker dimensions
  const beakerX = 140;
  const beakerY = 160;
  const beakerW = 200;
  const beakerH = 220;

  // Hot plate dimensions
  const plateX = 110;
  const plateY = beakerY + beakerH;
  const plateW = 260;
  const plateH = 24;

  // Water level height scaling
  const maxWaterH = beakerH * 0.7;
  const waterH = waterVolume > 0 ? (waterVolume / 100) * maxWaterH : 0;
  const waterY = beakerY + beakerH - waterH;

  // Crystals formed coordinates for cooling dish
  const dishX = 130;
  const dishY = 410;
  const dishW = 280;
  const dishH = 100;
  const dishWaterH = waterVolume > 0 ? 35 : 0;
  const dishWaterY = dishY + dishH - 12 - dishWaterH;

  // Helper to draw crystals
  const renderCrystals = () => {
    if (crystalsFormedMass <= 0.1) return null;
    const count = coolingRate === "slow" ? 6 : coolingRate === "medium" ? 18 : 60;
    const list = [];
    
    // Seed points for crystals
    const seedPoints = [
      { x: 270, y: 490, sizeMult: 1.1, rot: 12 },
      { x: 210, y: 495, sizeMult: 0.95, rot: -22 },
      { x: 330, y: 492, sizeMult: 1.05, rot: 45 },
      { x: 240, y: 488, sizeMult: 0.85, rot: 5 },
      { x: 300, y: 494, sizeMult: 0.9, rot: -30 },
      { x: 170, y: 493, sizeMult: 0.7, rot: 75 },
      { x: 370, y: 491, sizeMult: 0.75, rot: -60 },
      { x: 225, y: 478, sizeMult: 1.0, rot: 15 },
      { x: 315, y: 476, sizeMult: 1.15, rot: -10 },
      { x: 265, y: 480, sizeMult: 0.8, rot: 40 },
    ];

    if (coolingRate === "slow") {
      // Large, well-defined blue hexagons
      const baseWidth = 12 * crystalSize;
      const baseHeight = 16 * crystalSize;
      for (let i = 0; i < Math.min(count, seedPoints.length); i++) {
        const pt = seedPoints[i];
        const w = baseWidth * pt.sizeMult;
        const h = baseHeight * pt.sizeMult;
        list.push(
          <polygon
            key={i}
            points={`${pt.x - w/2},${pt.y - h/2} ${pt.x + w/2},${pt.y - h/2} ${pt.x + w},${pt.y} ${pt.x + w/2},${pt.y + h/2} ${pt.x - w/2},${pt.y + h/2} ${pt.x - w},${pt.y}`}
            fill="#2563eb"
            stroke="#1d4ed8"
            strokeWidth="1.2"
            opacity="0.92"
            transform={`rotate(${pt.rot} ${pt.x} ${pt.y})`}
          />
        );
      }
    } else if (coolingRate === "medium") {
      // Medium rhombic shapes
      const baseSize = 5 * crystalSize;
      for (let i = 0; i < count; i++) {
        const seedIndex = i % seedPoints.length;
        const pt = seedPoints[seedIndex];
        const ox = pt.x + (i % 3 - 1) * 20 + Math.sin(i) * 10;
        const oy = pt.y - (i % 2) * 8 - (isFiltered ? 6 : 0);
        const w = baseSize * (0.8 + (i % 4) * 0.15);
        list.push(
          <polygon
            key={i}
            points={`${ox},${oy - w} ${ox + w * 1.3},${oy} ${ox},${oy + w} ${ox - w * 1.3},${oy}`}
            fill="#3b82f6"
            stroke="#1d4ed8"
            strokeWidth="0.8"
            opacity="0.88"
            transform={`rotate(${i * 15} ${ox} ${oy})`}
          />
        );
      }
    } else {
      // Fast cooling: tiny powder crystals (small dots)
      const baseRadius = 1.2 * crystalSize;
      for (let i = 0; i < count; i++) {
        const seedIndex = i % seedPoints.length;
        const pt = seedPoints[seedIndex];
        const ox = pt.x + (i % 7 - 3) * 16 + Math.cos(i) * 12;
        const oy = pt.y - (i % 3) * 6 - (isFiltered ? 6 : 0);
        const r = baseRadius * (0.6 + (i % 3) * 0.3);
        list.push(
          <circle
            key={i}
            cx={ox}
            cy={oy}
            r={r}
            fill="#60a5fa"
            opacity="0.85"
          />
        );
      }
    }
    return list;
  };

  return (
    <div style={{ width: "100%", height: "auto", maxHeight: "100%", aspectRatio: "540/600" }}>
      <svg viewBox="0 0 540 600" style={{ width: "100%", height: "100%" }}>
        <defs>
          <pattern id="lab-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.75" fill="rgba(148,163,184,0.06)" />
          </pattern>
          <linearGradient id="wall-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#eff6ff" />
          </linearGradient>
          <linearGradient id="bench-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="3%" stopColor="#e2e8f0" />
            <stop offset="10%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="liquid-grad" x1="0" y1="0" x2="1" y2="0">
            {/* Intensity of blue matches dissolved CuSO4 concentration */}
            <stop offset="0%" stopColor={`rgba(56, 189, 248, ${Math.min(0.9, dissolvedMass / 50 + 0.18)})`} />
            <stop offset="100%" stopColor={`rgba(14, 165, 233, ${Math.min(0.9, dissolvedMass / 50 + 0.28)})`} />
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
          <linearGradient id="metal-clamp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="50%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <filter id="shadow" x="-10%" y="-10%" width="125%" height="125%">
            <feDropShadow dx="3" dy="12" stdDeviation="6" floodColor="#020617" floodOpacity="0.45" />
          </filter>
          <clipPath id="beaker-clip">
            <rect x={beakerX + 2.5} y={beakerY + 2.5} width={beakerW - 5} height={beakerH - 5} rx="6" />
          </clipPath>
        </defs>

        {/* Background Wall */}
        <rect width={W} height={H} fill="url(#wall-grad)" />
        <rect width={W} height={H} fill="url(#lab-dots)" opacity="0.4" />

        {/* Benchtop */}
        <rect x="0" y={H-140} width={W} height="140" fill="url(#bench-grad)" />
        <rect x="0" y={H-140} width={W} height="3" fill="rgba(255,255,255,0.18)" />

        {/* ─── HEATING SETUP ─── */}
        <AnimatePresence>
          {status !== "cooling" && !isFiltered && (
            <motion.g
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              filter="url(#shadow)"
            >
              {/* Hot Plate Burner Base */}
              <rect x={plateX} y={plateY} width={plateW} height={plateH} rx="5" fill="url(#metal-clamp)" stroke="#1e293b" strokeWidth="1" />
              {/* Heating surface ring */}
              <rect
                x={plateX + 15}
                y={plateY - 4}
                width={plateW - 30}
                height="6"
                rx="2"
                fill={isHeating ? "#ef4444" : "#475569"}
                stroke={isHeating ? "#f87171" : "#334155"}
                strokeWidth="1.2"
              />
              {/* Thermal expansion indicators */}
              {isHeating && (
                <g opacity="0.7">
                  <path d="M 160 310 Q 165 300 160 290 Q 155 280 160 270" fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M 270 310 Q 275 300 270 290 Q 265 280 270 270" fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M 380 310 Q 385 300 380 290 Q 375 280 380 270" fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
                </g>
              )}

              {/* Temperature display dial on burner */}
              <circle cx={plateX + 40} cy={plateY + plateH/2} r="6" fill="#0f172a" />
              <line x1={plateX + 40} y1={plateY + plateH/2} x2={plateX + (isHeating ? 44 : 36)} y2={plateY + plateH/2 - 3} stroke="#ef4444" strokeWidth="1.8" />
              <text x={plateX + 55} y={plateY + plateH/2 + 3} fontSize="9.5" fontWeight="bold" fill="#cbd5e1" fontFamily="monospace">
                {isHeating ? "HEATER: ON" : "HEATER: OFF"}
              </text>

              {/* Beaker Glass Body Outer */}
              <rect
                x={beakerX}
                y={beakerY}
                width={beakerW}
                height={beakerH}
                rx="8"
                fill="url(#glass-grad)"
                stroke="rgba(255,255,255,0.45)"
                strokeWidth="1.5"
              />
              {/* Beaker Glass Body Inner (Thickness) */}
              <rect
                x={beakerX + 2.5}
                y={beakerY + 2.5}
                width={beakerW - 5}
                height={beakerH - 5}
                rx="6"
                fill="none"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="1.2"
              />
              {/* Beaker spout lip */}
              <path d={`M ${beakerX} ${beakerY+12} L ${beakerX-8} ${beakerY+4} L ${beakerX+8} ${beakerY+12}`} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
              
              {/* Water Liquid Layer with curved meniscus */}
              {waterVolume > 0 && (
                <g clipPath="url(#beaker-clip)">
                  <path
                    d={`M ${beakerX - 10} ${waterY} Q ${beakerX + beakerW/2} ${waterY + 6} ${beakerX + beakerW + 10} ${waterY} L ${beakerX + beakerW + 10} ${beakerY + beakerH + 10} L ${beakerX - 10} ${beakerY + beakerH + 10} Z`}
                    fill="url(#liquid-grad)"
                  />
                  {/* Meniscus curve highlight */}
                  <path
                    d={`M ${beakerX + 2} ${waterY} Q ${beakerX + beakerW/2} ${waterY + 6} ${beakerX + beakerW - 2} ${waterY}`}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.7)"
                    strokeWidth="2.2"
                  />
                </g>
              )}

              {/* Solid Residue Layer (Undissolved CuSO4 + Sand) */}
              {undissolvedMass > 0 && (
                <g>
                  {/* Blue copper sulfate crystals at bottom */}
                  <ellipse cx={beakerX + beakerW/2 - 20} cy={beakerY + beakerH - 10} rx="65" ry="8" fill="#1d4ed8" opacity="0.8" />
                  <ellipse cx={beakerX + beakerW/2 - 40} cy={beakerY + beakerH - 8} rx="40" ry="6" fill="#2563eb" opacity="0.9" />
                </g>
              )}
              {solidImpurityMass > 0 && (
                <g>
                  {/* Grey sand impurity at bottom */}
                  <ellipse cx={beakerX + beakerW/2 + 30} cy={beakerY + beakerH - 12} rx="45" ry="7" fill="#78716c" opacity="0.8" />
                  <ellipse cx={beakerX + beakerW/2 + 10} cy={beakerY + beakerH - 8} rx="30" ry="5" fill="#a8a29e" opacity="0.9" />
                </g>
              )}

              {/* Glass Stirrer Rod inside beaker */}
              {waterVolume > 0 && (
                <g>
                  <line
                    x1={beakerX + beakerW/2 - 30}
                    y1={beakerY - 20}
                    x2={beakerX + beakerW/2 - 5}
                    y2={beakerY + beakerH - 12}
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="6.5"
                    strokeLinecap="round"
                  />
                  <line
                    x1={beakerX + beakerW/2 - 30}
                    y1={beakerY - 20}
                    x2={beakerX + beakerW/2 - 5}
                    y2={beakerY + beakerH - 12}
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </g>
              )}

              {/* Glass Sheen overlay */}
              <rect x={beakerX + 3} y={beakerY + 3} width="20" height={beakerH - 6} fill="url(#glass-sheen)" rx="4" />
              <rect x={beakerX + beakerW - 23} y={beakerY + 3} width="20" height={beakerH - 6} fill="url(#glass-sheen)" rx="4" />

              {/* Beaker Grad markings */}
              {[50, 100, 150, 200].map(mark => {
                const markY = beakerY + beakerH - (mark / 250) * beakerH;
                return (
                  <g key={mark}>
                    <line x1={beakerX + beakerW - 12} y1={markY} x2={beakerX + beakerW} y2={markY} stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
                    <text x={beakerX + beakerW - 35} y={markY + 3} fontSize="8.5" fill="#94a3b8" textAnchor="end">{mark} mL</text>
                  </g>
                );
              })}

              {/* Temperature Reading Overlay */}
              <rect x={beakerX + 15} y={beakerY + 15} width="80" height="30" rx="6" fill="rgba(15,23,42,0.85)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              <text x={beakerX + 25} y={beakerY + 35} fontSize="14" fontWeight="bold" fill="#38bdf8" fontFamily="monospace">
                {temperature.toFixed(1)}°C
              </text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* ─── COOLING & CRYSTALLIZATION DISH ─── */}
        <AnimatePresence>
          {(status === "cooling" || isFiltered || isCollected) && (
            <motion.g
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              filter="url(#shadow)"
            >
              {/* Crystallizing dish glass body outer */}
              <path
                d={`M ${dishX} ${dishY} L ${dishX + 15} ${dishY + dishH} L ${dishX + dishW - 15} ${dishY + dishH} L ${dishX + dishW} ${dishY} Z`}
                fill="url(#glass-grad)"
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="1.5"
              />
              {/* Crystallizing dish inner wall for glass thickness */}
              <path
                d={`M ${dishX + 3} ${dishY + 2} L ${dishX + 17} ${dishY + dishH - 3} L ${dishX + dishW - 17} ${dishY + dishH - 3} L ${dishX + dishW - 3} ${dishY + 2}`}
                fill="none"
                stroke="rgba(255,255,255,0.22)"
                strokeWidth="1"
              />
              
              {/* Dissolved blue liquid in dish with curved meniscus */}
              {!isFiltered && waterVolume > 0 && (
                <g>
                  <path
                    d={`M ${dishX + 5} ${dishWaterY} Q ${dishX + dishW/2} ${dishWaterY + 4} ${dishX + dishW - 5} ${dishWaterY} L ${dishX + dishW - 17} ${dishY + dishH - 3} L ${dishX + 17} ${dishY + dishH - 3} Z`}
                    fill="url(#liquid-grad)"
                  />
                  {/* Meniscus curve highlight */}
                  <path
                    d={`M ${dishX + 5} ${dishWaterY} Q ${dishX + dishW/2} ${dishWaterY + 4} ${dishX + dishW - 5} ${dishWaterY}`}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.7)"
                    strokeWidth="2.2"
                  />
                </g>
              )}

              {/* Render Crystal Growth Seeds or Solid Crystal Lattice */}
              {renderCrystals()}

              {/* Temperature Monitor next to dish */}
              {!isFiltered && (
                <g>
                  <rect x={dishX + dishW + 15} y={dishY + 20} width="65" height="42" rx="8" fill="rgba(15,23,42,0.85)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  <text x={dishX + dishW + 22} y={dishY + 36} fontSize="8.5" fontWeight="bold" fill="#cbd5e1">TEMP</text>
                  <text x={dishX + dishW + 22} y={dishY + 53} fontSize="13" fontWeight="bold" fill="#60a5fa" fontFamily="monospace">
                    {temperature.toFixed(1)}°C
                  </text>
                </g>
              )}

              {/* Cooling rate tag overlay */}
              {!isFiltered && (
                <g>
                  <rect x={dishX} y={dishY - 24} width="95" height="18" rx="4" fill="rgba(15,23,42,0.8)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
                  <text x={dishX + 8} y={dishY - 12} fontSize="8.5" fontWeight="bold" fill="#38bdf8">
                    COOLING: {coolingRate.toUpperCase()}
                  </text>
                </g>
              )}
            </motion.g>
          )}
        </AnimatePresence>

        {/* ─── FILTRATION INTERACTION ─── */}
        <AnimatePresence>
          {status === "heating" && stepsCompleted(state) >= 3 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none"
            >
              {/* Funnel design */}
              <path d="M 230 400 L 270 450 L 310 400 Z" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="4,4" />
              <text x="270" y="390" textAnchor="middle" fontSize="10" fill="#38bdf8" fontWeight="bold">
                Funnel Filter Setup Ready
              </text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* ─── WEIGHT SCALES & DRY COLLECTED CRYSTALS ─── */}
        <AnimatePresence>
          {isCollected && (
            <motion.g
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              filter="url(#shadow)"
            >
              {/* Watch Glass Dish */}
              <ellipse cx="270" cy={H-140} rx="70" ry="12" fill="rgba(241,245,249,0.7)" stroke="#64748b" strokeWidth="1.5" />
              <ellipse cx="270" cy={H-140} rx="66" ry="10" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              {/* Heaped pile of pure bright blue crystals on scale */}
              <path d="M 220 450 Q 270 410 320 450 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1.2" />
              <path d="M 235 450 Q 270 422 305 450 Z" fill="#3b82f6" />
              <path d="M 250 450 Q 270 432 290 450 Z" fill="#60a5fa" />

              {/* Weight Scale Digital Display Card */}
              <rect x="180" y="320" width="180" height="70" rx="12" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
              <rect x="182" y="322" width="176" height="66" rx="10" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <text x="270" y="340" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#94a3b8">DIGITAL BALANCE</text>
              <text x="270" y="372" textAnchor="middle" fontSize="28" fontWeight="black" fill="#38bdf8" fontFamily="monospace">
                {pureProductCollected.toFixed(2)} g
              </text>

              {/* Purity certificate card */}
              <g transform="translate(370, 200)">
                <rect x="0" y="0" width="140" height="96" rx="8" fill="rgba(15,23,42,0.9)" stroke="#22c55e" strokeWidth="1.5" />
                <rect x="2" y="2" width="136" height="92" rx="6" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <text x="70" y="22" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#22c55e">PURITY ANALYSIS</text>
                <line x1="15" y1="30" x2="125" y2="30" stroke="rgba(255,255,255,0.15)" />
                <text x="70" y="54" textAnchor="middle" fontSize="19" fontWeight="black" fill="#4ade80" fontFamily="monospace">
                  {productPurity.toFixed(1)}%
                </text>
                <text x="70" y="76" textAnchor="middle" fontSize="10" fill="#cbd5e1" fontWeight="bold">
                  {productPurity >= 95 ? "Excellent (Large)" : productPurity >= 90 ? "Good (Medium)" : "Impure (Powder)"}
                </text>
              </g>
            </motion.g>
          )}
        </AnimatePresence>

        {/* Dynamic calculation display overlay - Sleek Digital HUD */}
        <g transform="translate(15, 60)" filter="url(#shadow)">
          <rect x="0" y="0" width="235" height="94" rx="8" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1.5" />
          <rect x="2" y="2" width="231" height="90" rx="6" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
          <text x="15" y="22" fontSize="11" fontWeight="bold" fill="#38bdf8" letterSpacing="0.5">THERMODYNAMIC EQUILIBRIUM</text>
          <text x="15" y="38" fontSize="9.5" fill="#94a3b8" fontFamily="monospace">
            Solubility S(T) = 32·e^(0.0158·(T-20))
          </text>
          <text x="15" y="54" fontSize="10" fill="#e2e8f0">
            Solubility limit: <tspan fontWeight="bold" fill="#fbbf24">
              {waterVolume > 0 ? (getCuSO4Solubility(temperature) * (waterVolume / 100)).toFixed(1) : "0.0"} g
            </tspan>
          </text>
          <line x1="15" y1="62" x2="220" y2="62" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <text x="15" y="78" fontSize="10.5" fontWeight="bold" fill="#a5f3fc">
            Excess: {Math.max(0, dissolvedMass - getCuSO4Solubility(temperature) * (waterVolume / 100)).toFixed(1)} g
          </text>
        </g>
      </svg>
    </div>
  );
}

function stepsCompleted(state: CrystallizationState): number {
  return state.steps.filter(s => s.completed).length;
}
