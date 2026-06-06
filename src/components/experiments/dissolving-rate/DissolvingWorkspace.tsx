"use client";

import { motion } from "framer-motion";
import type { DissolveTemp, DissolveGranularity, DissolvingDataPoint } from "@/lib/engine/types";

interface Props {
  temperature:       DissolveTemp; // kept for store compatibility — visual uses customTempCelsius
  customTempCelsius: number;
  granularity:       DissolveGranularity;
  stirring:          boolean;
  isDissolving:      boolean;
  dissolveProgress:  number;
  dissolveTime:      number | null;
  dataPoints:        DissolvingDataPoint[];
}

const GRAIN_SIZES: Record<DissolveGranularity, number> = {
  coarse: 10,
  fine:   5,
  powder: 2,
};

/** Interpolate water colour from cold-blue → warm-orange → hot-red */
function waterColor(celsius: number): string {
  if (celsius <= 22) return "#3b82f6";
  if (celsius <= 60) {
    const p = (celsius - 22) / 38;
    const r = Math.round(59  + p * (249 - 59));
    const g = Math.round(130 + p * (115 - 130));
    const b = Math.round(246 + p * (22  - 246));
    return `rgb(${r},${g},${b})`;
  }
  const p = (celsius - 60) / 40;
  const r = Math.round(249 + p * (239 - 249));
  const g = Math.round(115 + p * (68  - 115));
  const b = 22;
  return `rgb(${r},${g},${b})`;
}

export default function DissolvingWorkspace({
  temperature: _temperature, customTempCelsius, granularity, stirring, isDissolving,
  dissolveProgress, dissolveTime, dataPoints,
}: Props) {
  const wColor    = waterColor(customTempCelsius);
  const grainSize = GRAIN_SIZES[granularity];
  const sugarLeft = Math.max(0, 100 - dissolveProgress);
  const isHot     = customTempCelsius > 60;
  const isWarm    = customTempCelsius > 30;

  return (
    <div
      className="relative rounded-3xl overflow-hidden select-none"
      style={{
        aspectRatio: "480/300",
        width:       "100%",
        height:      "auto",
        maxHeight:   "100%",
        background:  "radial-gradient(ellipse at 50% 25%, rgba(5,150,105,0.09) 0%, transparent 50%), linear-gradient(180deg, #f0fdf7 0%, #ecfdf5 40%, #f0fdf9 100%)",
        border:      "1px solid rgba(148,163,184,0.28)",
        boxShadow:   "0 10px 30px rgba(15,23,42,0.05), 0 0 0 1px rgba(5,150,105,0.15) inset",
      }}
    >
      <svg viewBox="0 0 480 300" width="100%" style={{ display: "block", position: "relative", zIndex: 10 }}>
        <defs>
          <linearGradient id="beaker-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={wColor} stopOpacity={0.30} />
            <stop offset="100%" stopColor={wColor} stopOpacity={0.55} />
          </linearGradient>
          <filter id="beaker-shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="rgba(0,0,0,0.35)" />
          </filter>
          <clipPath id="beaker-clip">
            <path d="M 148 38 L 158 208 Q 161 224 173 224 L 307 224 Q 319 224 322 208 L 332 38 Z" />
          </clipPath>
        </defs>

        {/* ── Lab bench ── */}
        <rect x="0" y="248" width="480" height="52" fill="#c8d0db" />
        <rect x="0" y="246" width="480" height="4"  fill="#dde4ef" />
        <rect x="0" y="246" width="480" height="1.5" fill="rgba(255,255,255,0.55)" />

        {/* ── Beaker ── */}
        {/* Water fill */}
        <rect x="151" y="82" width="178" height="142" fill="url(#beaker-water)" clipPath="url(#beaker-clip)" />

        {/* Heat bubbles */}
        {(isHot || (isWarm && isDissolving)) && isDissolving && (
          [10, 35, 60, 90, 115, 145, 160].map((x, i) => (
            <motion.circle
              key={i}
              cx={153 + x}
              cy={224}
              r={isHot ? 3.5 : 2.5}
              fill="rgba(255,255,255,0.55)"
              animate={{
                cy:      [224, 180 + i * 5, 82],
                opacity: [0.7, 0.5, 0],
                r:       [isHot ? 3.5 : 2.5, 4, 1.5],
              }}
              transition={{
                duration: isHot ? 1.0 : 1.8,
                repeat:   Infinity,
                delay:    i * 0.28,
                ease:     "easeOut",
              }}
            />
          ))
        )}

        {/* Glass rod stirrer — swings left/right inside beaker */}
        {stirring && isDissolving && (
          <>
            {/* Rod body */}
            <motion.g
              animate={{ rotate: [-14, 14, -14] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "240px 108px" }}
            >
              <rect x="236" y="32" width="8" height="180" rx="4"
                fill="rgba(200,228,255,0.82)"
                stroke="rgba(170,210,240,0.55)"
                strokeWidth="1"
              />
              {/* Highlight on rod */}
              <rect x="237" y="34" width="3" height="170" rx="1.5"
                fill="rgba(255,255,255,0.38)" />
              {/* Curved bottom tip */}
              <ellipse cx="240" cy="212" rx="4" ry="3" fill="rgba(180,215,245,0.90)" />
            </motion.g>

            {/* Swirl rings in liquid */}
            {[0, 1].map((i) => (
              <motion.ellipse key={i}
                cx={240} cy={190}
                rx={48} ry={8}
                fill="none"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="1.5"
                animate={{ rx: [48, 68, 48], opacity: [0.25, 0.05, 0.25] }}
                transition={{
                  duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.8,
                }}
              />
            ))}
          </>
        )}

        {/* Sugar particles */}
        {Array.from({ length: Math.ceil((sugarLeft / 100) * 16) }).map((_, i) => {
          const sx = 168 + (i % 8) * 20;
          const sy = 206 - Math.floor(i / 8) * (grainSize + 4);
          return (
            <motion.rect
              key={i}
              x={sx} y={sy}
              width={grainSize} height={grainSize}
              rx={grainSize / 4}
              fill="white"
              fillOpacity={0.82}
              animate={isDissolving ? {
                opacity: [0.82, 0.1, 0],
                y:       [sy, sy - 30, sy - 60],
              } : {}}
              transition={{
                duration: 1.2 + i * 0.15,
                repeat:   isDissolving ? Infinity : 0,
                ease:     "easeOut",
                delay:    i * 0.09,
              }}
            />
          );
        })}

        {/* Beaker outline */}
        <path d="M 142 34 L 154 212 Q 158 228 173 228 L 307 228 Q 322 228 326 212 L 338 34"
          fill="none" stroke="rgba(71,85,105,0.45)" strokeWidth="2.2" strokeLinecap="round"
          filter="url(#beaker-shadow)" />
        {/* Beaker rim */}
        <line x1="140" y1="34" x2="340" y2="34" stroke="rgba(71,85,105,0.40)" strokeWidth="3" strokeLinecap="round" />
        {/* Glass sheen */}
        <path d="M 149 50 L 155 200 Q 157 212 165 216" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="3.5" strokeLinecap="round" />
        {/* Graduation marks */}
        {[120, 150, 180, 210].map((y) => (
          <line key={y} x1="334" y1={y} x2="342" y2={y} stroke="rgba(100,116,139,0.40)" strokeWidth="1" />
        ))}
        {/* Beaker condition label */}
        <text x="240" y="242" textAnchor="middle" fontSize="8.5" fill="#475569" fontWeight="600">
          {Math.round(customTempCelsius)} °C · {stirring ? "Stirring ↺" : "Still"} · {granularity} grains
        </text>
        {/* Dissolved fraction hint */}
        {dissolveProgress > 0 && dissolveProgress < 100 && (
          <text x="240" y="256" textAnchor="middle" fontSize="7.5" fill="#059669" fontWeight="600">
            {Math.round(dissolveProgress)}% dissolved — {Math.round(sugarLeft)}% remaining
          </text>
        )}
        {dissolveProgress >= 100 && (
          <text x="240" y="256" textAnchor="middle" fontSize="8" fill="#059669" fontWeight="800">
            ✓ Fully dissolved
          </text>
        )}

        {/* ── Thermometer ── */}
        <g transform="translate(364, 36)">
          {/* Thermometer body */}
          <rect x="10" y="0" width="16" height="96" rx="8" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.2" />
          {/* Liquid fill — height scales with celsius 5→100 */}
          <motion.rect
            x="13"
            rx="5"
            fill={wColor}
            animate={{
              height: Math.max(4, ((customTempCelsius - 5) / 95) * 86),
              y:      96 - Math.max(4, ((customTempCelsius - 5) / 95) * 86),
            }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            width="10"
          />
          {/* Bulb */}
          <circle cx="18" cy="98" r="9" fill={wColor} stroke="#f1f5f9" strokeWidth="1" />
          {/* Scale ticks */}
          {[25, 50, 75].map((pct) => {
            const y = 96 - pct / 100 * 86;
            return <line key={pct} x1="24" y1={y} x2="30" y2={y} stroke="rgba(100,116,139,0.45)" strokeWidth="0.8" />;
          })}
          {/* Temp reading */}
          <text x="18" y="116" textAnchor="middle" fontSize="8" fill={wColor} fontWeight="900">
            {Math.round(customTempCelsius)}°C
          </text>
          <text x="18" y="126" textAnchor="middle" fontSize="6" fill="#64748b">TEMP</text>
        </g>

        {/* ── Progress ring ── */}
        <g transform="translate(38, 60)">
          <circle cx="40" cy="40" r="35" fill="white" stroke="#e2e8f0" strokeWidth="2" />
          <motion.circle
            cx="40" cy="40" r="35"
            fill="none"
            stroke="#059669" strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 35}`}
            animate={{ strokeDashoffset: 2 * Math.PI * 35 * (1 - dissolveProgress / 100) }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ transform: "rotate(-90deg)", transformOrigin: "40px 40px" }}
          />
          <text x="40" y="37" textAnchor="middle" fontSize="14" fontWeight="900" fill="#059669">
            {Math.round(dissolveProgress)}%
          </text>
          <text x="40" y="50" textAnchor="middle" fontSize="7" fill="#64748b">dissolved</text>
          {dissolveTime && (
            <text x="40" y="62" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#059669">
              {dissolveTime}s
            </text>
          )}
        </g>

        {/* ── Data count hint ── */}
        {dataPoints.length > 0 && (
          <text x="240" y="278" textAnchor="middle" fontSize="8" fill="#475569" fontWeight="600">
            {dataPoints.length} comparison{dataPoints.length !== 1 ? "s" : ""} recorded — see chart below
          </text>
        )}
      </svg>
    </div>
  );
}
