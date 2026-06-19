"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { SolutionId, PrecipitateInfo } from "@/lib/engine/types";
import { SOLUTIONS } from "@/lib/engine/solubility-engine";

interface Props {
  solutionA:      SolutionId | null;
  solutionB:      SolutionId | null;
  mixProgress:    number;
  hasPrecipitate: boolean;
  precipitate:    PrecipitateInfo | null;
  isRunning:      boolean;
  turbidity:      number;
}

/** Deterministic particle seed for precipitate settling */
function seedParticles(count: number, containerW: number, containerH: number, seed: number) {
  const particles = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const x = 8 + ((Math.abs(s) % 1000) / 1000) * (containerW - 16);
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const r = 1.5 + ((Math.abs(s) % 1000) / 1000) * 3;
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const delay = ((Math.abs(s) % 1000) / 1000) * 1.4;
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const dur = 1.6 + ((Math.abs(s) % 1000) / 1000) * 1.8;
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const swirl = (((Math.abs(s) % 1000) / 1000) - 0.5) * 18;
    particles.push({
      x, r, delay, dur, swirl,
      finalY: containerH * 0.62 + ((Math.abs(s) % 1000) / 1000) * containerH * 0.30,
    });
  }
  return particles;
}

/** Liquid stream arc path from beaker lip to center beaker */
function pourArc(fromX: number, fromY: number, toX: number, toY: number, sag: number): string {
  const mx = (fromX + toX) / 2;
  const my = Math.min(fromY, toY) - sag;
  return `M ${fromX} ${fromY} Q ${mx} ${my} ${toX} ${toY}`;
}

export default function SolubilityWorkspace({
  solutionA, solutionB, mixProgress, hasPrecipitate, precipitate, isRunning, turbidity,
}: Props) {
  const profA = solutionA ? SOLUTIONS[solutionA] : null;
  const profB = solutionB ? SOLUTIONS[solutionB] : null;
  
  // Calculate alpha hex based on turbidity
  const opacityHex = Math.min(255, Math.max(10, Math.round(turbidity * 0.45 * 255)))
    .toString(16)
    .padStart(2, '0');
    
  const combinedColor = mixProgress > 0
    ? (hasPrecipitate && precipitate ? `${precipitate.color}${opacityHex}` : "rgba(14,165,233,0.22)")
    : "rgba(224,242,254,0.35)";
  // Seed from formula so each precipitate has a distinct particle layout
  const precipitateSeed = precipitate
    ? precipitate.formula.split("").reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 31), 0)
    : 42;
  const particles = precipitate ? seedParticles(26, 96, 98, precipitateSeed) : [];

  // Pour stream paths
  const pourAPathA = pourArc(152, 185, 195, 200, 18);  // A to center
  const pourAPathB = pourArc(328, 185, 285, 200, 18);  // B to center

  return (
    <div
      className="relative rounded-3xl overflow-hidden select-none"
      style={{
        aspectRatio: "480/270",
        width:       "100%",
        height:      "auto",
        maxHeight:   "100%",
        background: "radial-gradient(ellipse at 50% 25%, rgba(5,150,105,0.10) 0%, transparent 50%), linear-gradient(180deg, #f0fdf7 0%, #ecfdf5 40%, #f0fdf9 100%)",
        boxShadow:
          "0 24px 64px rgba(15, 23, 42, 0.08), " +
          "0 4px 12px rgba(15, 23, 42, 0.04), " +
          "0 0 0 1px rgba(255, 255, 255, 0.92) inset",
        border: "1px solid rgba(148, 163, 184, 0.28)",
      }}
    >
      {/* Dot grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.13) 1px, transparent 1px)",
          backgroundSize:  "22px 22px",
        }}
      />
      {/* Top ambient glow */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          top: "-48px", left: "50%", transform: "translateX(-50%)",
          width: "288px", height: "192px",
          background: "radial-gradient(ellipse at center, rgba(59,130,246,0.07) 0%, transparent 70%)",
        }}
      />
      {/* Lab bench */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none lab-bench-light"
        style={{ bottom: 0, left: 0, right: 0, height: "44px", borderRadius: "0 0 24px 24px" }}
      />

      <svg
        viewBox="0 40 480 270"
        width="100%"
        style={{ display: "block", position: "relative", zIndex: 10 }}
        aria-label="Solubility reaction vessels"
        role="img"
      >
        <defs>
          <filter id="sol-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="rgba(0,0,0,0.42)" />
          </filter>
          <filter id="sol-soft" x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
          <linearGradient id="sol-glass-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.28)" />
            <stop offset="30%"  stopColor="rgba(255,255,255,0.06)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.05)" />
          </linearGradient>
        </defs>

        {/* ── Lab bench — dark slate ── */}
        <rect x="0" y="274" width="480" height="46" fill="#cbd5e1" />
        <rect x="0" y="274" width="480" height="4"  fill="#f1f5f9" />
        <line x1="0" y1="274" x2="480" y2="274" stroke="#475569" strokeWidth="1" />
        <rect x="0" y="272" width="480" height="2"  fill="#cbd5e1" opacity="0.8" />

        {/* ══ BEAKER A (left) ══ */}
        <g>
          {/* Beaker A base shadow */}
          <ellipse cx="100" cy="272" rx="54" ry="6" fill="rgba(9,13,22,0.45)" filter="url(#sol-soft)" />
          {/* Outer glass border (double glass thickness effect) */}
          <path d="M 60 118 L 48 270 L 152 270 L 140 118 Z"
            fill="none" stroke="rgba(148,163,184,0.75)" strokeWidth="2.2" />
          <path d="M 61.5 119 L 50 268 L 150 268 L 138.5 119 Z"
            fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" />
          {/* Liquid fill */}
          {profA && (
            <motion.path
              d={`M 62 143 L 50 270 L 150 270 L 138 143 Z`}
              fill={profA.color} fillOpacity="0.78"
              animate={{ fillOpacity: [0.74, 0.82, 0.78] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          {/* Beaker rim */}
          <rect x="46" y="114" width="108" height="7" rx="2.5" fill="#b0bac5" stroke="#94a3b8" strokeWidth="0.8" />
          <rect x="48" y="115" width="40" height="3" rx="1.5" fill="rgba(255,255,255,0.5)" />
          {/* Glass sheen */}
          <path d="M 64 122 L 55 266" stroke="rgba(255,255,255,0.32)" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 70 122 L 62 266" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round" />
          {/* Glass sheen using gradient */}
          <path d="M 60 118 L 48 270 L 152 270 L 140 118 Z" fill="url(#sol-glass-sheen)" />
          {/* Labels */}
          <text x="100" y="134" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#1e3a8a">A</text>
          {profA && (
            <text x="100" y="152" textAnchor="middle" fontSize="7.5" fill="#334155" fontWeight="600">{profA.formula}</text>
          )}
          {!profA && (
            <text x="100" y="200" textAnchor="middle" fontSize="9" fill="#64748b" fontStyle="italic">Select A</text>
          )}
          {/* Meniscus wave */}
          {profA && (
            <motion.path
              d="M 62 143 Q 100 140 138 143"
              fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2"
              animate={{ d: ["M 62 143 Q 100 140 138 143", "M 62 143 Q 100 146 138 143", "M 62 143 Q 100 140 138 143"] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </g>

        {/* ══ BEAKER B (right) ══ */}
        <g>
          {/* Beaker B base shadow */}
          <ellipse cx="380" cy="272" rx="54" ry="6" fill="rgba(9,13,22,0.45)" filter="url(#sol-soft)" />
          {/* Outer glass border (double glass thickness effect) */}
          <path d="M 340 118 L 328 270 L 432 270 L 420 118 Z"
            fill="none" stroke="rgba(148,163,184,0.75)" strokeWidth="2.2" />
          <path d="M 341.5 119 L 330 268 L 430 268 L 418.5 119 Z"
            fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" />
          {profB && (
            <motion.path
              d="M 342 143 L 330 270 L 430 270 L 418 143 Z"
              fill={profB.color} fillOpacity="0.78"
              animate={{ fillOpacity: [0.74, 0.82, 0.78] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            />
          )}
          <rect x="326" y="114" width="108" height="7" rx="2.5" fill="#b0bac5" stroke="#94a3b8" strokeWidth="0.8" />
          <rect x="328" y="115" width="40" height="3" rx="1.5" fill="rgba(255,255,255,0.5)" />
          <path d="M 344 122 L 335 266" stroke="rgba(255,255,255,0.32)" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 350 122 L 342 266" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 340 118 L 328 270 L 432 270 L 420 118 Z" fill="url(#sol-glass-sheen)" />
          <text x="380" y="134" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#1e3a8a">B</text>
          {profB && (
            <text x="380" y="152" textAnchor="middle" fontSize="7.5" fill="#334155" fontWeight="600">{profB.formula}</text>
          )}
          {!profB && (
            <text x="380" y="200" textAnchor="middle" fontSize="9" fill="#64748b" fontStyle="italic">Select B</text>
          )}
          {profB && (
            <motion.path
              d="M 342 143 Q 380 140 418 143"
              fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2"
              animate={{ d: ["M 342 143 Q 380 140 418 143", "M 342 143 Q 380 146 418 143", "M 342 143 Q 380 140 418 143"] }}
              transition={{ duration: 3.0, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            />
          )}
        </g>

        {/* ══ COMBINED BEAKER (center) ══ */}
        <g>
          {/* Combined Beaker base shadow */}
          <ellipse cx="240" cy="272" rx="64" ry="7" fill="rgba(9,13,22,0.45)" filter="url(#sol-soft)" />
          {/* Outer glass border (double glass thickness effect) */}
          <path d="M 195 138 L 178 270 L 302 270 L 285 138 Z"
            fill="none" stroke="rgba(148,163,184,0.75)" strokeWidth="2.2" />
          <path d="M 196.5 139 L 180 268 L 300 268 L 283.5 139 Z"
            fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" />

          {/* Mixed liquid */}
          {mixProgress > 0 && (
            <motion.path
              d={`M ${195 + (1 - mixProgress) * 10} ${138 + (1 - mixProgress) * 90} L ${178 + (1 - mixProgress) * 8} 270 L ${302 - (1 - mixProgress) * 8} 270 L ${285 - (1 - mixProgress) * 10} ${138 + (1 - mixProgress) * 90} Z`}
              fill={combinedColor}
              fillOpacity={mixProgress * 0.88 + 0.12}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
            />
          )}

          {/* Precipitate particles */}
          <AnimatePresence>
            {hasPrecipitate && precipitate && mixProgress >= 0.55 && (
              <>
                {particles.map((p, i) => (
                  <motion.circle key={i}
                    cx={186 + p.x * 0.88}
                    r={p.r}
                    fill={precipitate.color} fillOpacity={0.88 * turbidity}
                    initial={{ cy: 150, opacity: 0, cx: 186 + p.x * 0.88 + p.swirl }}
                    animate={{
                      cy: p.finalY,
                      opacity: [0, 0.9 * turbidity, 0.9 * turbidity],
                      cx: [186 + p.x * 0.88 + p.swirl, 186 + p.x * 0.88 - p.swirl * 0.4, 186 + p.x * 0.88],
                    }}
                    transition={{
                      duration: p.dur,
                      delay: p.delay * (1 - mixProgress + 0.15),
                      ease: "easeOut",
                    }}
                  />
                ))}
                {/* Sediment layer */}
                {mixProgress >= 0.9 && (
                  <motion.rect
                    x={185} y={256} height={8} rx={3}
                    fill={precipitate.color} fillOpacity={0.45 * turbidity}
                    initial={{ width: 0 }}
                    animate={{ width: Math.min(100, (mixProgress - 0.9) * 1000) }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    style={{ x: 190 }}
                  />
                )}
              </>
            )}
          </AnimatePresence>

          {/* Combined beaker rim */}
          <rect x="176" y="134" width="128" height="8" rx="2.5" fill="#b0bac5" stroke="#94a3b8" strokeWidth="0.8" />
          <rect x="178" y="135" width="44" height="3" rx="1.5" fill="rgba(255,255,255,0.5)" />
          {/* Glass sheen */}
          <path d="M 200 144 L 185 266" stroke="rgba(255,255,255,0.32)" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 206 144 L 192 266" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 195 138 L 178 270 L 302 270 L 285 138 Z" fill="url(#sol-glass-sheen)" />

          <text x="240" y="152" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#1e3a8a">Combined</text>

          {/* Result badge */}
          {mixProgress >= 1 && (
            <motion.g initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              {hasPrecipitate && precipitate ? (
                <>
                  <rect x="192" y="160" width="96" height="24" rx="5"
                    fill={`${precipitate.color}18`} stroke={precipitate.color} strokeWidth="1.2" />
                  <text x="240" y="176" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={precipitate.color}>
                    {precipitate.formula}↓ precipitate
                  </text>
                </>
              ) : (
                <>
                  <rect x="192" y="160" width="96" height="24" rx="5"
                    fill="rgba(5,150,105,0.12)" stroke="rgba(52,211,153,0.50)" strokeWidth="1.2" />
                  <text x="240" y="176" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#059669">
                    No reaction
                  </text>
                </>
              )}
            </motion.g>
          )}

          {/* Meniscus wave on combined */}
          {mixProgress > 0.1 && (
            <motion.path
              d={`M ${195 + (1 - mixProgress) * 10} ${138 + (1 - mixProgress) * 90}`}
              fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.2"
              animate={{
                d: [
                  `M ${196} ${200} Q 240 196 ${284} 200`,
                  `M ${196} ${200} Q 240 204 ${284} 200`,
                  `M ${196} ${200} Q 240 196 ${284} 200`,
                ],
              }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </g>

        {/* ══ POUR ANIMATIONS ══ */}
        <AnimatePresence>
          {isRunning && (
            <>
              {/* Solution A pour stream */}
              <motion.g key="pour-a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Stream arc */}
                <motion.path
                  d={pourAPathA}
                  fill="none"
                  stroke={profA?.color ?? "#60a5fa"}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeOpacity="0.45"
                  animate={{ strokeOpacity: [0.38, 0.55, 0.42] }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.path
                  d={pourAPathA}
                  fill="none"
                  stroke={profA?.color ?? "#60a5fa"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="6 3"
                  animate={{ strokeDashoffset: [0, -18] }}
                  transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                />
                {/* Drop splash */}
                {[0, 1, 2].map(i => (
                  <motion.circle key={i}
                    cx={195 + (i - 1) * 5}
                    fill={profA?.color ?? "#60a5fa"} fillOpacity="0.60"
                    r={2 + i * 0.5}
                    animate={{ cy: [200, 196, 202, 200] }}
                    transition={{ duration: 0.45, repeat: Infinity, delay: i * 0.14, ease: "easeInOut" }}
                  />
                ))}
              </motion.g>

              {/* Solution B pour stream */}
              <motion.g key="pour-b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.path
                  d={pourAPathB}
                  fill="none"
                  stroke={profB?.color ?? "#34d399"}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeOpacity="0.45"
                  animate={{ strokeOpacity: [0.38, 0.55, 0.42] }}
                  transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.path
                  d={pourAPathB}
                  fill="none"
                  stroke={profB?.color ?? "#34d399"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="6 3"
                  animate={{ strokeDashoffset: [0, -18] }}
                  transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                />
                {[0, 1, 2].map(i => (
                  <motion.circle key={i}
                    cx={285 + (i - 1) * 5}
                    fill={profB?.color ?? "#34d399"} fillOpacity="0.60"
                    r={2 + i * 0.5}
                    animate={{ cy: [200, 196, 202, 200] }}
                    transition={{ duration: 0.45, repeat: Infinity, delay: i * 0.14, ease: "easeInOut" }}
                  />
                ))}
              </motion.g>
            </>
          )}
        </AnimatePresence>

        {/* ══ NET IONIC EQUATION ══ */}
        {mixProgress >= 1 && hasPrecipitate && precipitate && (
          <motion.g initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.45 }}>
            <rect x="96" y="40" width="288" height="36" rx="8"
              fill="rgba(255,255,255,0.96)" stroke="rgba(148,163,184,0.28)" strokeWidth="1.2" />
            <text x="240" y="52" textAnchor="middle" fontSize="7.5" fill="#475569" fontWeight="600" letterSpacing="0.04em">
              NET IONIC EQUATION
            </text>
            <text x="240" y="67" textAnchor="middle" fontSize="9" fill="#1d4ed8" fontFamily="monospace" fontWeight="700">
              {precipitate.netIonic}
            </text>
          </motion.g>
        )}

        {mixProgress >= 1 && !hasPrecipitate && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <rect x="126" y="46" width="228" height="28" rx="7"
              fill="rgba(5,150,105,0.08)" stroke="rgba(5,150,105,0.25)" strokeWidth="1.2" />
            <text x="240" y="56" textAnchor="middle" fontSize="8" fill="#059669" fontWeight="700">No precipitation occurs</text>
            <text x="240" y="68" textAnchor="middle" fontSize="7.5" fill="#334155">All product ions remain soluble in water</text>
          </motion.g>
        )}

        {/* Mix progress bar */}
        {isRunning && (
          <g>
            <rect x="160" y="298" width="160" height="5" rx="2.5" fill="rgba(148,163,184,0.25)" />
            <motion.rect
              x="160" y="298" height="5" rx="2.5"
              fill="#0ea5e9"
              initial={{ width: 0 }}
              animate={{ width: 160 * mixProgress }}
            />
          </g>
        )}
      </svg>
    </div>
  );
}
