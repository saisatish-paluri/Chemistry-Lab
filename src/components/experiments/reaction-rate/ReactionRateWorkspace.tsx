"use client";

import { motion } from "framer-motion";
import type { SurfaceAreaType } from "@/lib/engine/types";
import { SURFACE_AREA_LABELS } from "@/lib/engine/reaction-rate-engine";

interface Props {
  temperature:    number;
  concentration:  number;
  surfaceArea:    SurfaceAreaType;
  rateMultiplier: number;
  progress:       number;    // 0–100
  isRunning:      boolean;
}

// Deterministic particle layout — seeded so it never changes
const PARTICLE_COUNT = 28;
type Particle = { id: number; cx: number; cy: number; r: number; dx: number; dy: number };

function makeParticles(): Particle[] {
  const ps: Particle[] = [];
  let s = 0xdeadbeef;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const cx = 12 + (s % 1000) / 1000 * 176;
    s = (s * 1664525 + 1013904223) >>> 0;
    const cy = 12 + (s % 1000) / 1000 * 136;
    s = (s * 1664525 + 1013904223) >>> 0;
    const r  = 3 + (s % 100) / 100 * 3;
    s = (s * 1664525 + 1013904223) >>> 0;
    const dx = (((s % 100) / 100) - 0.5) * 20;
    s = (s * 1664525 + 1013904223) >>> 0;
    const dy = (((s % 100) / 100) - 0.5) * 20;
    ps.push({ id: i, cx, cy, r, dx, dy });
  }
  return ps;
}

const PARTICLES = makeParticles();

// Map surface area type to visual representation label
const SA_VISUAL: Record<SurfaceAreaType, string> = {
  solid:    "▪",
  chips:    "■",
  granules: "◆◆",
  powder:   "░░░",
};

export default function ReactionRateWorkspace({
  temperature, concentration, surfaceArea, rateMultiplier, progress, isRunning,
}: Props) {
  // Animation duration inversely proportional to rate — faster particles = higher rate
  const particleDuration = Math.max(0.3, 2.5 / (rateMultiplier + 0.1));

  // Color of particles: redder = hotter/faster, bluer = cooler/slower
  const particleHue = Math.round(200 - (temperature - 15) / 65 * 160); // 200 (blue) → 40 (orange)
  const particleColor = `hsl(${particleHue}, 75%, 55%)`;
  const reactedFraction = progress / 100;

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
        viewBox="0 0 400 320"
        width="100%"
        style={{ display: "block" }}
        aria-label="Reaction rate simulation"
        role="img"
      >
        {/* ── Background ── */}
        <rect x="0" y="0" width="400" height="320" fill="#f8fafc" />

        {/* ── Reaction vessel ── */}
        <rect x="50" y="30" width="200" height="160" rx="8"
          fill={`hsl(${particleHue}, 30%, 97%)`}
          stroke="#cbd5e1" strokeWidth="2" />

        {/* Vessel label */}
        <text x="150" y="24" textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="600">
          REACTION VESSEL
        </text>

        {/* ── Solid reactant visual ── */}
        <g transform="translate(55, 155)">
          <rect width="40" height="28" rx="3"
            fill={`hsl(${particleHue}, 20%, 75%)`}
            stroke={`hsl(${particleHue}, 20%, 60%)`}
            strokeWidth="1"
            opacity={1 - reactedFraction * 0.85} />
          <text x="20" y="18" textAnchor="middle" fontSize="12" fill="white" fontWeight="700">
            {SA_VISUAL[surfaceArea]}
          </text>
          <text x="20" y="30" textAnchor="middle" fontSize="6" fill="#64748b">
            {SURFACE_AREA_LABELS[surfaceArea]}
          </text>
        </g>

        {/* ── Particles (reactant molecules) ── */}
        {PARTICLES.map((p) => {
          const isReacted = p.id < PARTICLE_COUNT * reactedFraction;
          return (
            <motion.circle
              key={p.id}
              cx={p.cx + 50}
              cy={p.cy + 30}
              r={p.r}
              fill={isReacted ? "#22c55e" : particleColor}
              fillOpacity={isReacted ? 0.4 : 0.85}
              animate={
                isRunning && !isReacted
                  ? {
                      cx: [p.cx + 50, p.cx + 50 + p.dx, p.cx + 50 - p.dx * 0.5, p.cx + 50],
                      cy: [p.cy + 30, p.cy + 30 + p.dy, p.cy + 30 - p.dy * 0.7, p.cy + 30],
                    }
                  : {}
              }
              transition={{
                duration: particleDuration * (0.8 + (p.id % 5) * 0.08),
                repeat: Infinity,
                ease: "easeInOut",
                delay: (p.id % 7) * 0.1,
              }}
            />
          );
        })}

        {/* ── Thermometer ── */}
        <g transform="translate(278, 30)">
          <text x="18" y="9" textAnchor="middle" fontSize="8" fill="#64748b" fontWeight="600">TEMP</text>
          {/* Thermometer body */}
          <rect x="10" y="14" width="16" height="100" rx="8" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Mercury fill */}
          <motion.rect
            x="13" y={14 + 100 * (1 - (temperature - 15) / 65)}
            width="10"
            height={100 * ((temperature - 15) / 65)}
            rx="3"
            fill="#ef4444"
            animate={{ height: 100 * ((temperature - 15) / 65), y: 14 + 100 * (1 - (temperature - 15) / 65) }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          {/* Bulb */}
          <circle cx="18" cy="122" r="10" fill="#ef4444" />
          {/* Labels */}
          <text x="32" y="18"  fontSize="6.5" fill="#94a3b8">80°</text>
          <text x="32" y="68"  fontSize="6.5" fill="#94a3b8">47°</text>
          <text x="32" y="118" fontSize="6.5" fill="#94a3b8">15°</text>
          {/* Reading */}
          <text x="18" y="148" textAnchor="middle" fontSize="9" fill="#1e293b" fontWeight="700">{temperature}°C</text>
        </g>

        {/* ── Concentration indicator ── */}
        <g transform="translate(320, 30)">
          <text x="30" y="9" textAnchor="middle" fontSize="8" fill="#64748b" fontWeight="600">[CONC]</text>
          {/* Bar chart */}
          <rect x="14" y="14" width="32" height="106" rx="4" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
          <motion.rect
            x="16"
            width="28"
            rx="3"
            fill="#3b82f6"
            animate={{
              height: Math.round(106 * (concentration / 2.0)),
              y: Math.round(14 + 106 * (1 - concentration / 2.0)),
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
          {/* Ticks */}
          {[0, 0.5, 1.0, 1.5, 2.0].map((v, i) => (
            <text key={v} x="50" y={120 - i * 26.5} fontSize="6" fill="#94a3b8">{v}M</text>
          ))}
          <text x="30" y="134" textAnchor="middle" fontSize="9" fill="#1e293b" fontWeight="700">{concentration.toFixed(1)} M</text>
        </g>

        {/* ── Rate multiplier display ── */}
        <g transform="translate(52, 205)">
          <rect width="196" height="40" rx="6" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1" />
          <text x="8" y="16" fontSize="9" fill="#2563eb" fontWeight="600">Rate Multiplier</text>
          <text x="98" y="30" textAnchor="middle" fontSize="20" fill="#1d4ed8" fontWeight="900">
            ×{rateMultiplier.toFixed(2)}
          </text>
        </g>

        {/* ── Progress bar ── */}
        <g transform="translate(52, 254)">
          <text x="0" y="10" fontSize="9" fill="#64748b" fontWeight="600">REACTION PROGRESS</text>
          <rect x="0" y="15" width="196" height="14" rx="7" fill="#e2e8f0" />
          <motion.rect
            x="0" y="15" height="14" rx="7"
            fill={`hsl(${particleHue}, 70%, 50%)`}
            animate={{ width: Math.max(14, 196 * progress / 100) }}
            transition={{ duration: 0.3, ease: "linear" }}
          />
          <text x="196" y="26" textAnchor="end" fontSize="9" fill="#1e293b" fontWeight="700">
            {progress.toFixed(1)}%
          </text>
        </g>

        {/* ── Status pill ── */}
        {isRunning && (
          <motion.g
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.0, repeat: Infinity }}
          >
            <circle cx="270" cy="278" r="5" fill="#22c55e" />
            <text x="280" y="282" fontSize="9" fill="#166534" fontWeight="600">Reaction in progress</text>
          </motion.g>
        )}
        {!isRunning && progress > 0 && progress < 100 && (
          <text x="270" y="282" fontSize="9" fill="#f59e0b" fontWeight="600">Paused at {progress.toFixed(0)}%</text>
        )}
        {progress >= 100 && (
          <text x="270" y="282" fontSize="9" fill="#2563eb" fontWeight="700">Complete!</text>
        )}
      </svg>
    </div>
  );
}
