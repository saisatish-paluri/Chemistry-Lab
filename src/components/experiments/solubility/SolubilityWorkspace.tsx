"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { SolutionId, PrecipitateInfo } from "@/lib/engine/types";
import { SOLUTIONS } from "@/lib/engine/solubility-engine";

interface Props {
  solutionA:      SolutionId | null;
  solutionB:      SolutionId | null;
  mixProgress:    number;           // 0–1
  hasPrecipitate: boolean;
  precipitate:    PrecipitateInfo | null;
  isRunning:      boolean;
}

// Deterministic particle positions from seed
function seedParticles(count: number, containerW: number, containerH: number, seed: number) {
  const particles = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const x = 8 + ((Math.abs(s) % 1000) / 1000) * (containerW - 16);
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const r = 1.5 + ((Math.abs(s) % 1000) / 1000) * 2.5;
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const delay = ((Math.abs(s) % 1000) / 1000) * 1.2;
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const dur = 1.5 + ((Math.abs(s) % 1000) / 1000) * 1.5;
    particles.push({ x, r, delay, dur, finalY: containerH * 0.55 + ((Math.abs(s) % 1000) / 1000) * containerH * 0.35 });
  }
  return particles;
}

export default function SolubilityWorkspace({
  solutionA, solutionB, mixProgress, hasPrecipitate, precipitate, isRunning,
}: Props) {
  const profA = solutionA ? SOLUTIONS[solutionA] : null;
  const profB = solutionB ? SOLUTIONS[solutionB] : null;

  // Combined beaker color
  const combinedColor = mixProgress > 0
    ? (hasPrecipitate && precipitate ? `${precipitate.color}33` : "#e0f2fe")
    : "#f8fafc";

  // Precipitate particles
  const particles = precipitate ? seedParticles(22, 90, 90, 42) : [];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--lab-glass-heavy)",
        border: "1px solid var(--lab-glass-border)",
        boxShadow: "var(--lab-shadow-md)",
      }}
    >
      <svg
        viewBox="0 0 480 320"
        width="100%"
        style={{ display: "block" }}
        aria-label="Solubility reaction vessels"
        role="img"
      >
        {/* ── Lab bench ── */}
        <rect x="0" y="280" width="480" height="40" fill="#cbd5e1" />
        <rect x="0" y="276" width="480" height="6" fill="#94a3b8" />

        {/* ── Beaker A (left) ── */}
        <g>
          {/* Beaker body */}
          <path d="M 60 120 L 48 272 L 152 272 L 140 120 Z" fill="#f1f5f9" fillOpacity="0.6" stroke="#94a3b8" strokeWidth="1.5" />
          {/* Solution fill */}
          {profA && (
            <path d="M 62 145 L 50 272 L 150 272 L 138 145 Z" fill={profA.color} fillOpacity="0.85" />
          )}
          {/* Beaker rim */}
          <rect x="46" y="116" width="108" height="8" rx="2" fill="#94a3b8" />
          {/* Label */}
          <text x="100" y="136" textAnchor="middle" fontSize="9" fontWeight="700" fill="#475569">A</text>
          {profA && (
            <text x="100" y="155" textAnchor="middle" fontSize="7.5" fill="#64748b">{profA.formula}</text>
          )}
          {!profA && (
            <text x="100" y="200" textAnchor="middle" fontSize="9" fill="#94a3b8">Select A</text>
          )}
        </g>

        {/* ── Beaker B (right) ── */}
        <g>
          <path d="M 340 120 L 328 272 L 432 272 L 420 120 Z" fill="#f1f5f9" fillOpacity="0.6" stroke="#94a3b8" strokeWidth="1.5" />
          {profB && (
            <path d="M 342 145 L 330 272 L 430 272 L 418 145 Z" fill={profB.color} fillOpacity="0.85" />
          )}
          <rect x="326" y="116" width="108" height="8" rx="2" fill="#94a3b8" />
          <text x="380" y="136" textAnchor="middle" fontSize="9" fontWeight="700" fill="#475569">B</text>
          {profB && (
            <text x="380" y="155" textAnchor="middle" fontSize="7.5" fill="#64748b">{profB.formula}</text>
          )}
          {!profB && (
            <text x="380" y="200" textAnchor="middle" fontSize="9" fill="#94a3b8">Select B</text>
          )}
        </g>

        {/* ── Combined beaker (centre) ── */}
        <g>
          <path d="M 195 140 L 178 272 L 302 272 L 285 140 Z" fill="#f8fafc" fillOpacity="0.6" stroke="#475569" strokeWidth="1.8" />

          {/* Solution fill — grows as mixing progresses */}
          {mixProgress > 0 && (
            <motion.path
              d={`M ${195 + (1 - mixProgress) * 10} ${140 + (1 - mixProgress) * 90} L ${178 + (1 - mixProgress) * 8} 272 L ${302 - (1 - mixProgress) * 8} 272 L ${285 - (1 - mixProgress) * 10} ${140 + (1 - mixProgress) * 90} Z`}
              fill={combinedColor}
              fillOpacity={mixProgress * 0.9 + 0.1}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}

          {/* Precipitate particles */}
          <AnimatePresence>
            {hasPrecipitate && precipitate && mixProgress >= 0.6 && (
              <>
                {particles.map((p, i) => (
                  <motion.circle
                    key={i}
                    cx={188 + p.x * 0.88}
                    cy={145}
                    r={p.r}
                    fill={precipitate.color}
                    fillOpacity={0.85}
                    initial={{ cy: 145, opacity: 0 }}
                    animate={{ cy: p.finalY, opacity: 1 }}
                    transition={{ duration: p.dur, delay: p.delay * (1 - mixProgress + 0.2), ease: "easeIn" }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          <rect x="176" y="136" width="128" height="8" rx="2" fill="#475569" />
          <text x="240" y="155" textAnchor="middle" fontSize="9" fontWeight="700" fill="#334155">Combined</text>

          {/* Result label */}
          {mixProgress >= 1 && (
            <motion.g
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {hasPrecipitate && precipitate ? (
                <>
                  <rect x="192" y="160" width="96" height="22" rx="4" fill={`${precipitate.color}22`} stroke={precipitate.color} strokeWidth="1" />
                  <text x="240" y="175" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#334155">
                    {precipitate.formula}↓ precipitate
                  </text>
                </>
              ) : (
                <>
                  <rect x="192" y="160" width="96" height="22" rx="4" fill="#f0fdf4" stroke="#86efac" strokeWidth="1" />
                  <text x="240" y="175" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#166534">
                    No reaction
                  </text>
                </>
              )}
            </motion.g>
          )}
        </g>

        {/* ── Pour animation (arrows) ── */}
        <AnimatePresence>
          {isRunning && (
            <>
              {/* Left pour */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.path
                  d="M 152 190 Q 185 200 195 200"
                  fill="none"
                  stroke={profA?.color ?? "#93c5fd"}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="5 3"
                  animate={{ strokeDashoffset: [0, -16] }}
                  transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                />
                <motion.circle cx="195" cy="200" r="4" fill={profA?.color ?? "#93c5fd"} fillOpacity="0.6"
                  animate={{ cy: [198, 202, 200] }} transition={{ duration: 0.4, repeat: Infinity }} />
              </motion.g>

              {/* Right pour */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.path
                  d="M 328 190 Q 295 200 285 200"
                  fill="none"
                  stroke={profB?.color ?? "#86efac"}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="5 3"
                  animate={{ strokeDashoffset: [0, -16] }}
                  transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                />
                <motion.circle cx="285" cy="200" r="4" fill={profB?.color ?? "#86efac"} fillOpacity="0.6"
                  animate={{ cy: [198, 202, 200] }} transition={{ duration: 0.4, repeat: Infinity }} />
              </motion.g>
            </>
          )}
        </AnimatePresence>

        {/* ── Net ionic equation overlay ── */}
        {mixProgress >= 1 && hasPrecipitate && precipitate && (
          <motion.g
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <rect x="100" y="44" width="280" height="34" rx="6"
              fill="rgba(255,255,255,0.92)" stroke="var(--lab-glass-border)" strokeWidth="1" />
            <text x="240" y="58" textAnchor="middle" fontSize="8" fill="#64748b" fontWeight="600">Net ionic equation</text>
            <text x="240" y="72" textAnchor="middle" fontSize="8.5" fill="#1e293b" fontFamily="monospace">
              {precipitate.netIonic}
            </text>
          </motion.g>
        )}

        {mixProgress >= 1 && !hasPrecipitate && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <rect x="130" y="50" width="220" height="28" rx="6"
              fill="rgba(240,253,244,0.95)" stroke="#86efac" strokeWidth="1" />
            <text x="240" y="60" textAnchor="middle" fontSize="8" fill="#166534" fontWeight="600">No precipitation</text>
            <text x="240" y="72" textAnchor="middle" fontSize="7.5" fill="#15803d">All product ions remain soluble</text>
          </motion.g>
        )}

        {/* Mixing progress bar */}
        {isRunning && (
          <g>
            <rect x="160" y="298" width="160" height="6" rx="3" fill="#e2e8f0" />
            <motion.rect
              x="160" y="298"
              width={160 * mixProgress}
              height="6" rx="3"
              fill="var(--lab-blue-500)"
              initial={{ width: 0 }}
              animate={{ width: 160 * mixProgress }}
            />
          </g>
        )}
      </svg>
    </div>
  );
}
