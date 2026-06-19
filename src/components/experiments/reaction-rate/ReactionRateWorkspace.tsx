"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { SurfaceAreaType } from "@/lib/engine/types";
import { SURFACE_AREA_LABELS } from "@/lib/engine/reaction-rate-engine";
import MacroMicroViewToggle from "@/components/lab/MacroMicroViewToggle";
import MicroscopicViewer from "@/components/lab/MicroscopicViewer";

interface Props {
  temperature:    number;
  concentration:  number;
  surfaceArea:    SurfaceAreaType;
  rateMultiplier: number;
  progress:       number;
  isRunning:      boolean;
  catalystAdded?: boolean;
}

const PARTICLE_COUNT = 32;
type Particle = { id: number; cx: number; cy: number; r: number; dx: number; dy: number; phase: number };

function makeParticles(): Particle[] {
  const ps: Particle[] = [];
  let s = 0xdeadbeef;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const cx = 14 + (s % 1000) / 1000 * 170;
    s = (s * 1664525 + 1013904223) >>> 0;
    const cy = 14 + (s % 1000) / 1000 * 130;
    s = (s * 1664525 + 1013904223) >>> 0;
    const r  = 2.5 + (s % 100) / 100 * 3;
    s = (s * 1664525 + 1013904223) >>> 0;
    const dx = (((s % 100) / 100) - 0.5) * 24;
    s = (s * 1664525 + 1013904223) >>> 0;
    const dy = (((s % 100) / 100) - 0.5) * 24;
    s = (s * 1664525 + 1013904223) >>> 0;
    const phase = (s % 100) / 100;
    ps.push({ id: i, cx, cy, r, dx, dy, phase });
  }
  return ps;
}

const PARTICLES = makeParticles();

const SA_VISUAL: Record<SurfaceAreaType, string> = {
  solid: "▪", chips: "■■", granules: "◆◆◆", powder: "⋮⋮⋮",
};

// Temperature color: cool=blue → warm=amber → hot=red
function tempColor(temp: number): string {
  const t = (temp - 15) / 65; // 0→1
  if (t < 0.4) {
    // cool → neutral
    const r = Math.round(96 + t * 2.5 * 120);
    const g = Math.round(165 - t * 2.5 * 40);
    const b = Math.round(250 - t * 2.5 * 100);
    return `rgb(${r},${g},${b})`;
  } else if (t < 0.7) {
    // neutral → warm
    const r = Math.round(240 + (t - 0.4) * 3.3 * 15);
    const g = Math.round(130 - (t - 0.4) * 3.3 * 60);
    const b = Math.round(60 - (t - 0.4) * 3.3 * 55);
    return `rgb(${r},${g},${b})`;
  } else {
    // warm → hot
    const r = Math.round(239);
    const g = Math.round(68 - (t - 0.7) * 3.3 * 40);
    const b = Math.round(20);
    return `rgb(${r},${Math.max(0, g)},${b})`;
  }
}

// Liquid color in vessel changes with temperature
function vesselLiquidColor(temp: number, progress: number): string {
  const t = (temp - 15) / 65;
  const alpha = 0.35 + t * 0.18;
  const reacted = progress / 100;
  if (reacted > 0.8) return `rgba(52,211,153,${alpha})`;
  if (t < 0.4) return `rgba(96,165,250,${alpha})`;
  if (t < 0.7) return `rgba(251,146,60,${alpha})`;
  return `rgba(248,113,113,${alpha})`;
}

export default function ReactionRateWorkspace({
  temperature, concentration, surfaceArea, rateMultiplier, progress, isRunning, catalystAdded = false,
}: Props) {
  const [viewMode, setViewMode] = useState<"macro" | "micro">("macro");

  const particleDuration = Math.max(0.25, 2.2 / (rateMultiplier + 0.1));
  const pColor = tempColor(temperature);
  const reactedFraction = progress / 100;
  const tempFraction = (temperature - 15) / 65;
  const liqColor = vesselLiquidColor(temperature, progress);
  const isHot = temperature > 55;
  const isWarm = temperature > 35;

  // Bubble generation rate from kinetics
  const bubbleRate = isRunning ? Math.max(0, (rateMultiplier - 0.5) * 0.8) : 0;

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      <div className="flex justify-end pr-4">
        <MacroMicroViewToggle view={viewMode} onChange={setViewMode} />
      </div>

      {viewMode === "macro" ? (
        <div
          className="relative rounded-3xl overflow-hidden select-none"
          style={{
            aspectRatio: "352/305",
            width:       "100%",
            height:      "auto",
            maxHeight:   "100%",
            background:
              `radial-gradient(ellipse at 50% 25%, ${pColor}14 0%, transparent 50%),` +
              "linear-gradient(180deg, #f5f3ff 0%, #ede9fe 40%, #f0eeff 100%)",
            boxShadow:
              "0 24px 64px rgba(15, 23, 42, 0.08), " +
              "0 4px 12px rgba(15, 23, 42, 0.04), " +
              "0 0 0 1px rgba(255, 255, 255, 0.92) inset",
            border: "1px solid rgba(148, 163, 184, 0.28)",
            transition: "background 0.7s ease",
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
          {/* Heat glow when temperature is high */}
          {isWarm && (
            <div
              aria-hidden="true"
              className="absolute pointer-events-none"
              style={{
                bottom: "22%", left: "10%",
                width: "210px", height: "140px",
                background: `radial-gradient(ellipse at center, ${isHot ? "rgba(239,68,68,0.14)" : "rgba(251,146,60,0.10)"} 0%, transparent 70%)`,
                transition: "background 0.8s ease",
                filter: "blur(18px)",
                animation: isHot ? "lab-glow-pulse 1.8s ease-in-out infinite" : "lab-glow-pulse 3s ease-in-out infinite",
              }}
            />
          )}
          {/* Lab bench */}
          <div
            aria-hidden="true"
            className="absolute pointer-events-none lab-bench-light"
            style={{ bottom: 0, left: 0, right: 0, height: "44px", borderRadius: "0 0 24px 24px" }}
          />

          <svg
            viewBox="44 15 352 305"
            width="100%"
            style={{ display: "block", position: "relative", zIndex: 10 }}
            aria-label="Reaction rate simulation"
            role="img"
          >
            <defs>
              <clipPath id="rr-vessel-clip">
                <rect x="48" y="26" width="204" height="164" rx="10" />
              </clipPath>
              <filter id="rr-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="rgba(0,0,0,0.42)" />
              </filter>
              <filter id="rr-heat-blur" x="-20%" y="-30%" width="140%" height="160%">
                <feTurbulence type="turbulence" baseFrequency="0.015" numOctaves="2" seed="2" result="noise">
                  <animate attributeName="baseFrequency" values="0.015;0.022;0.015" dur="1.8s" repeatCount="indefinite" />
                </feTurbulence>
                <feDisplacementMap in="SourceGraphic" in2="noise" scale={isHot ? 5 : isWarm ? 2.5 : 0} xChannelSelector="R" yChannelSelector="G" />
              </filter>
              <filter id="rr-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <linearGradient id="rr-glass-sheen" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor="rgba(255,255,255,0.30)" />
                <stop offset="30%"  stopColor="rgba(255,255,255,0.06)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.04)" />
              </linearGradient>
              <linearGradient id="rr-therm-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#f97316" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>

            {/* Lab bench */}
            <rect x="0" y="272" width="400" height="48" fill="#1e293b" />
            <rect x="0" y="272" width="400" height="4"  fill="#334155" />
            <line x1="0" y1="272" x2="400" y2="272" stroke="#475569" strokeWidth="1" />
            <rect x="0" y="270" width="400" height="2"  fill="#64748b" opacity="0.8" />

            {/* ── Reaction vessel — premium beaker ── */}
            {/* Glass shadow/depth */}
            <rect x="48" y="26" width="204" height="164" rx="10"
              fill="rgba(255,255,255,0.06)"
              filter="url(#rr-shadow)" />

            {/* Liquid fill — temperature-reactive */}
            <motion.rect
              x={52} width={196} rx={7}
              fill={liqColor}
              animate={{
                y: 186 - Math.max(0, 155 * 0.72),
                height: Math.max(0, 155 * 0.72),
              }}
              style={{ transition: "fill 0.8s cubic-bezier(0.4,0,0.2,1)" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />

            {/* Reactant solid */}
            <g transform="translate(53, 153)" filter={isHot ? "url(#rr-heat-blur)" : undefined}>
              <rect width="44" height="30" rx="4"
                fill={`hsl(${Math.round(230 - tempFraction * 160)}, 35%, ${Math.round(28 + reactedFraction * 18)}%)`}
                stroke={`hsl(${Math.round(230 - tempFraction * 160)}, 35%, 42%)`}
                strokeWidth="1.1" opacity={Math.max(0.08, 1 - reactedFraction * 0.88)} />
              <text x="22" y="19" textAnchor="middle" fontSize="11.5"
                fill="rgba(255,255,255,0.82)" fontWeight="700">
                {SA_VISUAL[surfaceArea]}
              </text>
              <text x="22" y="31" textAnchor="middle" fontSize="6.5" fill="rgba(200,220,255,0.80)">
                {SURFACE_AREA_LABELS[surfaceArea]}
              </text>
            </g>

            {/* Meniscus surface wave */}
            <motion.path
              fill="none"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1.2"
              clipPath="url(#rr-vessel-clip)"
              animate={{ d: [
                "M 52 75 Q 100 72 148 75 Q 196 78 248 75",
                "M 52 75 Q 100 78 148 75 Q 196 72 248 75",
                "M 52 75 Q 100 72 148 75 Q 196 78 248 75",
              ]}}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Glass vessel walls - double outline */}
            <rect x="47" y="25" width="206" height="166" rx="11"
              fill="none" stroke="rgba(148,163,184,0.7)" strokeWidth="2.0" />
            <rect x="49" y="27" width="202" height="162" rx="9"
              fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.0" />
            {/* Glass sheen */}
            <path d="M 54 32 L 54 186" stroke="rgba(255,255,255,0.40)" strokeWidth="4" strokeLinecap="round" />
            <path d="M 62 32 L 62 186" stroke="rgba(255,255,255,0.12)" strokeWidth="1.8" strokeLinecap="round" />
            <rect x="48" y="26" width="204" height="164" rx="10" fill="url(#rr-glass-sheen)" />

            {/* Vessel title */}
            <text x="150" y="20" textAnchor="middle" fontSize="8.5" fill="#334155" fontWeight="700" letterSpacing="0.06em">
              REACTION VESSEL
            </text>

            {/* Kinetic particles */}
            {PARTICLES.map((p) => {
              const isReacted = p.id < PARTICLE_COUNT * reactedFraction;
              const speedFactor = 1 + tempFraction * 1.8 + (concentration / 2) * 0.6;
              return (
                <motion.circle key={p.id}
                  r={p.r}
                  fill={isReacted ? "#34d399" : pColor}
                  fillOpacity={isReacted ? 0.30 : 0.88}
                  animate={
                    isRunning && !isReacted
                      ? {
                          cx: [p.cx + 48, p.cx + 48 + p.dx * speedFactor, p.cx + 48 - p.dx * speedFactor * 0.6, p.cx + 48 + p.dx * speedFactor * 0.3, p.cx + 48],
                          cy: [p.cy + 28, p.cy + 28 + p.dy * speedFactor, p.cy + 28 - p.dy * speedFactor * 0.7, p.cy + 28 + p.dy * speedFactor * 0.2, p.cy + 28],
                        }
                      : { cx: p.cx + 48, cy: p.cy + 28 }
                  }
                  transition={{
                    duration: particleDuration * (0.75 + p.phase * 0.5),
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: p.phase * particleDuration * 0.8,
                  }}
                />
              );
            })}

            {/* Reaction foam / surface bubbles when running hot */}
            {isRunning && bubbleRate > 0.3 && [1, 2, 3, 4, 5].map((i) => (
              <motion.circle key={`foam-${i}`}
                cx={60 + i * 34} r={2.2 + (i % 2) * 0.8}
                fill="rgba(255,255,255,0.72)"
                initial={{ cy: 74 }}
                animate={{ cy: [74, 60, 48, 32], fillOpacity: [0.8, 0.55, 0.30, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: Math.max(0.6, 1.4 / bubbleRate) * (0.85 + (i % 3) * 0.12),
                  delay: (i / 5) * Math.max(0.5, 1.2 / bubbleRate),
                  ease: "easeOut",
                }}
              />
            ))}

            {/* Heat shimmer effect ring when hot */}
            {isHot && isRunning && (
              <motion.ellipse
                cx="150" cy="195"
                rx="98" ry="8"
                fill="none"
                stroke={`rgba(239,68,68,0.18)`}
                strokeWidth="2"
                animate={{ rx: [95, 104, 96], ry: [7, 10, 8], opacity: [0.18, 0.32, 0.18] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              />
            )}

            {/* ── Thermometer ── */}
            <g transform="translate(275, 28)">
              <text x="22" y="10" textAnchor="middle" fontSize="8" fill="#475569" fontWeight="700" letterSpacing="0.05em">TEMP</text>
              <rect x="13" y="16" width="18" height="104" rx="9"
                fill="rgba(255,255,255,0.50)" stroke="#cbd5e1" strokeWidth="1.2"
                filter="url(#rr-shadow)" />
              {/* Track fill */}
              <motion.rect
                x="17" rx="5" width="10"
                fill="url(#rr-therm-fill)"
                animate={{
                  height: 100 * tempFraction,
                  y: 20 + 100 * (1 - tempFraction),
                }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              />
              {/* Bulb */}
              <circle cx="22" cy="128" r="11" fill="#ef4444" />
              <circle cx="22" cy="128" r="6" fill="rgba(255,255,255,0.25)" />
              {/* Tick marks */}
              {[0, 0.25, 0.5, 0.75, 1].map((f) => (
                <g key={f}>
                  <line x1="31" y1={20 + (1 - f) * 100} x2={35 + (f === 0 || f === 0.5 || f === 1 ? 3 : 0)} y2={20 + (1 - f) * 100}
                    stroke="rgba(148,163,184,0.60)" strokeWidth="0.9" />
                  {(f === 0 || f === 0.5 || f === 1) && (
                    <text x="38" y={24 + (1 - f) * 100} fontSize="6.5" fill="#64748b">
                      {Math.round(15 + f * 65)}°
                    </text>
                  )}
                </g>
              ))}
              <rect x="0" y="141" width="44" height="16" rx="4" fill="rgba(15,23,42,0.7)" stroke="rgba(239,68,68,0.25)" strokeWidth="0.8" />
              <text x="22" y="153" textAnchor="middle" fontSize="11" fill="#f87171" fontWeight="800">{temperature}°C</text>
            </g>

            {/* ── Concentration bar ── */}
            <g transform="translate(326, 28)">
              <text x="32" y="10" textAnchor="middle" fontSize="8" fill="#475569" fontWeight="700" letterSpacing="0.05em">CONC</text>
              <rect x="14" y="16" width="36" height="108" rx="5"
                fill="rgba(255,255,255,0.50)" stroke="#cbd5e1" strokeWidth="1.2"
                filter="url(#rr-shadow)" />
              <motion.rect
                x="16" rx="4" width="32"
                fill="#818cf8"
                animate={{
                  height: Math.max(4, 104 * (concentration / 2.0)),
                  y: 20 + 104 * (1 - concentration / 2.0),
                }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              />
              {/* Sheen */}
              <rect x="18" y={20 + 104 * (1 - concentration / 2.0)} width={4} height={Math.max(4, 104 * (concentration / 2.0))} rx={2} fill="rgba(255,255,255,0.22)" />
              {[0, 0.5, 1.0, 1.5, 2.0].map((v, i) => (
                <text key={v} x="56" y={120 - i * 26} fontSize="6.5" fill="#64748b">{v.toFixed(1)}M</text>
              ))}
              <rect x="10" y="127" width="44" height="16" rx="4" fill="rgba(15,23,42,0.7)" stroke="rgba(129,140,248,0.25)" strokeWidth="0.8" />
              <text x="32" y="139" textAnchor="middle" fontSize="11" fill="#a5b4fc" fontWeight="800">{concentration.toFixed(1)} M</text>
            </g>

            {/* ── Rate multiplier badge ── */}
            <g transform="translate(50, 204)">
              <rect width="202" height="42" rx="8"
                fill="rgba(15, 23, 42, 0.85)" stroke="rgba(124, 58, 237, 0.3)" strokeWidth="1.2"
                filter="url(#rr-shadow)" />
              <text x="8" y="16" fontSize="9.5" fill="#a78bfa" fontWeight="800" letterSpacing="0.05em">RATE MULTIPLIER</text>
              <text x="101" y="34" textAnchor="middle" fontSize="22" fill="#8b5cf6" fontWeight="950">
                ×{rateMultiplier.toFixed(2)}
              </text>
            </g>

            {/* ── Progress bar ── */}
            <g transform="translate(50, 254)">
              <text x="0" y="10" fontSize="8.5" fill="#475569" fontWeight="700" letterSpacing="0.05em">REACTION PROGRESS</text>
              <rect x="0" y="15" width="202" height="14" rx="7" fill="rgba(148,163,184,0.18)" stroke="rgba(148,163,184,0.28)" strokeWidth="0.8" />
              <motion.rect
                x="0" y="15" height="14" rx="7"
                fill={pColor}
                animate={{ width: Math.max(14, 202 * progress / 100) }}
                style={{ transition: "fill 0.7s ease" }}
                transition={{ duration: 0.35, ease: "linear" }}
              />
              <text x="202" y="26" textAnchor="end" fontSize="10.5" fill="#cbd5e1" fontWeight="900">
                {progress.toFixed(1)}%
              </text>
            </g>

            {/* ── Status indicator ── */}
            {isRunning && (
              <motion.g animate={{ opacity: [1, 0.45, 1] }} transition={{ duration: 1.1, repeat: Infinity }}>
                <circle cx="278" cy="278" r="5.5" fill="#34d399" filter="url(#rr-glow)" />
                <text x="290" y="282" fontSize="9" fill="#059669" fontWeight="700">Reaction in progress</text>
              </motion.g>
            )}
            {!isRunning && progress > 0 && progress < 100 && (
              <g>
                <circle cx="278" cy="278" r="5" fill="#f59e0b" />
                <text x="290" y="282" fontSize="9" fill="#d97706" fontWeight="600">Paused at {progress.toFixed(0)}%</text>
              </g>
            )}
            {progress >= 100 && (
              <g>
                <circle cx="278" cy="278" r="5.5" fill="#60a5fa" />
                <text x="290" y="282" fontSize="9" fill="#2563eb" fontWeight="700">Reaction complete!</text>
              </g>
            )}
          </svg>
        </div>
      ) : (
        <MicroscopicViewer
          experimentType="kinetics"
          temperatureK={temperature + 273.15}
          concentration={concentration}
          catalystActive={catalystAdded}
          isTriggered={isRunning}
        />
      )}
    </div>
  );
}
