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
  isSaturated:       boolean;
}

const GRAIN_SIZES: Record<DissolveGranularity, number> = {
  coarse: 5.0,
  fine:   2.5,
  powder: 1.0,
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
  dissolveProgress, dissolveTime, dataPoints, isSaturated,
}: Props) {
  const wColor    = waterColor(customTempCelsius);
  const grainSize = GRAIN_SIZES[granularity];
  const sugarLeft = Math.max(0, 100 - dissolveProgress);
  const isHot     = customTempCelsius > 60;
  const isWarm    = customTempCelsius > 30;

  // Diffusion factor based on Noyes-Whitney equation (D = 0.5 + 0.015 * T)
  const D = 0.5 + 0.015 * customTempCelsius;

  // Swirling/convection speed factor
  const flowSpeedFactor = stirring ? 1.0 : (customTempCelsius - 5) / 95 * 0.35 + 0.05;

  // Generate 45 deterministic particles representing sugar grains
  const particles = Array.from({ length: 45 }).map((_, idx) => {
    const seed = idx * 37;
    const orbitRadiusX = 25 + (seed % 6) * 10;
    const orbitRadiusY = 8 + (seed % 4) * 35 * (82 / 142); // proportional y height
    const startX = 200 + (seed % 8) * 10;
    const startY = 220 - (idx % 3) * 4;
    const delay = (seed % 10) * 0.12;
    const speed = 1.0 + (seed % 3) * 0.4;
    return { idx, startX, startY, orbitRadiusX, orbitRadiusY, delay, speed };
  });

  return (
    <div
      className="relative rounded-3xl overflow-hidden select-none"
      style={{
        aspectRatio: "410/300",
        width:       "100%",
        height:      "auto",
        maxHeight:   "100%",
        background:  "radial-gradient(ellipse at 50% 25%, rgba(15,23,42,0.6) 0%, transparent 60%), linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
        border:      "1px solid rgba(255,255,255,0.1)",
        boxShadow:   "0 15px 35px rgba(0,0,0,0.5)",
      }}
    >
      <svg viewBox="35 0 410 300" width="100%" style={{ display: "block", position: "relative", zIndex: 10 }}>
        <defs>
          <linearGradient id="beaker-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={wColor} stopOpacity={0.35} />
            <stop offset="100%" stopColor={wColor} stopOpacity={0.60} />
          </linearGradient>

          <linearGradient id="bench-grad-dw" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="4%" stopColor="#e2e8f0" />
            <stop offset="15%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          <linearGradient id="glass-grad-dw" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.65)" />
            <stop offset="10%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="50%" stopColor="rgba(240,253,250,0.03)" />
            <stop offset="85%" stopColor="rgba(240,253,250,0.12)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.4)" />
          </linearGradient>

          <filter id="beaker-shadow">
            <feDropShadow dx="2" dy="8" stdDeviation="5" floodColor="#020617" floodOpacity="0.5" />
          </filter>

          <clipPath id="beaker-clip">
            <path d="M 149.5 38 L 159 207 Q 161.5 222.5 173.5 222.5 L 306.5 222.5 Q 318.5 222.5 321 207 L 330.5 38 Z" />
          </clipPath>

          <radialGradient id="saturation-cloud" cx="50%" cy="90%" r="50%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.45)" />
            <stop offset="40%" stopColor="rgba(255, 255, 255, 0.2)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.0)" />
          </radialGradient>
        </defs>

        {/* ── Lab bench ── */}
        <rect x="0" y="248" width="480" height="52" fill="url(#bench-grad-dw)" />
        <rect x="0" y="248" width="480" height="2"  fill="rgba(255,255,255,0.15)" />

        {/* ── Beaker Liquids & Grains ── */}
        <g filter="url(#beaker-shadow)">
          {/* Water fill with curved meniscus */}
          <path d="M 140 82 Q 240 86 340 82 L 340 230 L 140 230 Z" fill="url(#beaker-water)" clipPath="url(#beaker-clip)" />
          {/* Meniscus curve highlight */}
          <path d="M 140 82 Q 240 86 340 82" fill="none" stroke="rgba(255, 255, 255, 0.65)" strokeWidth="2" clipPath="url(#beaker-clip)" />

          {/* Saturation Cloud (Density Boundary Layer) */}
          {dissolveProgress > 5 && (
            <rect
              x="151" y="140" width="178" height="84"
              fill="url(#saturation-cloud)"
              clipPath="url(#beaker-clip)"
              opacity={isSaturated ? 0.95 : (dissolveProgress / 100) * 0.65}
            />
          )}

          {/* Heat bubbles (thermal convection helper) */}
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

          {/* Concentration gradients & Convection currents lines */}
          {isDissolving && (
            <g clipPath="url(#beaker-clip)">
              {/* Wave 1 */}
              <motion.path
                d="M 160 200 C 190 200, 210 120, 240 120 C 270 120, 290 200, 320 200"
                fill="none"
                stroke="rgba(255,255,255,0.22)"
                strokeWidth="2.5"
                animate={stirring ? {
                  rotate: 360
                } : {
                  strokeDashoffset: [0, -40]
                }}
                style={{ transformOrigin: "240px 150px" }}
                transition={{
                  duration: stirring ? 2.5 : 5.0 / flowSpeedFactor,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              {/* Wave 2 */}
              <motion.path
                d="M 170 160 C 200 130, 220 180, 240 150 C 260 120, 280 170, 310 140"
                fill="none"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="2.0"
                strokeDasharray="5 5"
                animate={stirring ? {
                  rotate: -360
                } : {
                  strokeDashoffset: [0, 50]
                }}
                style={{ transformOrigin: "240px 150px" }}
                transition={{
                  duration: stirring ? 3.5 : 6.0 / flowSpeedFactor,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </g>
          )}

          {/* Glass rod stirrer — swings left/right inside beaker */}
          {stirring && isDissolving && (
            <>
              {/* Rod body */}
              <motion.g
                animate={{ rotate: [-14, 14, -14] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: "240px 108px" }}
              >
                <rect x="236" y="32" width="8" height="180" rx="4"
                  fill="rgba(240,248,255,0.75)"
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth="1.2"
                />
                {/* Highlight on rod */}
                <rect x="237" y="34" width="3" height="170" rx="1.5"
                  fill="rgba(255,255,255,0.38)" />
                {/* Curved bottom tip */}
                <ellipse cx="240" cy="212" rx="4" ry="3" fill="rgba(255,255,255,0.85)" />
              </motion.g>

              {/* Swirl rings in liquid */}
              {[0, 1].map((i) => (
                <motion.ellipse key={i}
                  cx={240} cy={190}
                  rx={48} ry={8}
                  fill="none"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="2.0"
                  animate={{ rx: [48, 72, 48], opacity: [0.35, 0.05, 0.35] }}
                  transition={{
                    duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.6,
                  }}
                />
              ))}
            </>
          )}

          {/* Noyes-Whitney Solid Sugar Heap at Beaker Bottom */}
          {sugarLeft > 0.1 && (
            <g clipPath="url(#beaker-clip)">
              {/* Smooth pile base path */}
              <path
                d={`M 160 224 Q 240 ${224 - 42 * (sugarLeft / 100)} 320 224 Z`}
                fill="rgba(240,248,255,0.95)"
                stroke="rgba(200,210,224,0.6)"
                strokeWidth="0.8"
              />
              {/* Heap grain textures based on granularity */}
              {granularity === "coarse" && Array.from({ length: 12 }).map((_, i) => {
                const seed = i * 43;
                const gx = 180 + (seed % 11) * 11;
                const gy = 224 - (seed % 4) * (25 * (sugarLeft / 100) / 4) - 2;
                return (
                  <circle key={i} cx={gx} cy={gy} r="3.2" fill="rgba(255,255,255,0.9)" stroke="rgba(200,210,220,0.5)" strokeWidth="0.5" />
                );
              })}
              {granularity === "fine" && Array.from({ length: 24 }).map((_, i) => {
                const seed = i * 31;
                const gx = 175 + (seed % 17) * 7;
                const gy = 224 - (seed % 5) * (30 * (sugarLeft / 100) / 5) - 1.5;
                return (
                  <circle key={i} cx={gx} cy={gy} r="1.6" fill="rgba(255,255,255,0.95)" />
                );
              })}
            </g>
          )}

          {/* Particle-level Sugar Dispersion */}
          {isDissolving && sugarLeft > 0.1 && (
            <g clipPath="url(#beaker-clip)">
              {particles.map(({ idx, startX, startY, orbitRadiusX, orbitRadiusY, delay, speed }) => {
                let particleCX: number | number[];
                let particleCY: number | number[];
                let particleOpacity: number[];
                let pDuration = 1.6;

                if (stirring) {
                  // Stirred swirling
                  particleCX = [240 - orbitRadiusX, 240 + orbitRadiusX, 240 - orbitRadiusX];
                  particleCY = [150 - orbitRadiusY, 150 + orbitRadiusY, 150 - orbitRadiusY];
                  particleOpacity = [0.95, 0.4, 0.0];
                  pDuration = 1.3 / speed;
                } else if (customTempCelsius > 30) {
                  // Convection currents
                  particleCX = [startX, startX + (idx % 6 - 3) * 15];
                  particleCY = [startY, startY - 95 * (D / 1.7)];
                  particleOpacity = [0.95, 0.0];
                  pDuration = Math.max(0.6, 2.5 - customTempCelsius * 0.018);
                } else {
                  // Cold slow dissolution
                  particleCX = [startX, startX + (idx % 4 - 2) * 8];
                  particleCY = [startY, startY - 18 * D];
                  particleOpacity = [0.95, 0.0];
                  pDuration = 3.5;
                }

                return (
                  <motion.rect
                    key={idx}
                    width={grainSize}
                    height={grainSize}
                    rx={grainSize / 3}
                    fill="white"
                    fillOpacity={0.9}
                    animate={{
                      cx: particleCX,
                      cy: particleCY,
                      opacity: particleOpacity,
                      scale: [1, 0.8, 0.2]
                    }}
                    transition={{
                      duration: pDuration,
                      repeat: Infinity,
                      ease: stirring ? "linear" : "easeOut",
                      delay: delay,
                    }}
                  />
                );
              })}
            </g>
          )}

          {/* Beaker Glass Body Outer */}
          <path d="M 142 34 L 154 212 Q 158 228 173 228 L 307 228 Q 322 228 326 212 L 338 34"
            fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
          {/* Beaker Glass Body Inner for thickness */}
          <path d="M 144.5 35.5 L 156.5 210 Q 160.5 225.5 173.5 225.5 L 306.5 225.5 Q 319.5 225.5 323.5 210 L 335.5 35.5"
            fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeLinecap="round" />

          {/* Beaker rim */}
          <ellipse cx="240" cy="34" rx="98" ry="3.5" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" />
          
          {/* Glass sheen */}
          <path d="M 149 50 L 155 200 Q 157 212 165 216" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" strokeLinecap="round" />
          
          {/* Graduation marks */}
          {[120, 150, 180, 210].map((y) => (
            <line key={y} x1="324" y1={y} x2="331" y2={y} stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          ))}
        </g>
        
        {/* Beaker condition label */}
        <text x="240" y="242" textAnchor="middle" fontSize="9" fill="#cbd5e1" fontWeight="600">
          {Math.round(customTempCelsius)} °C · {stirring ? "Stirring ↺" : "Still"} · {granularity} grains
        </text>
        {/* Dissolved fraction hint */}
        {dissolveProgress > 0 && dissolveProgress < 100 && (
          <text x="240" y="256" textAnchor="middle" fontSize="8" fill="#10b981" fontWeight="600">
            {Math.round(dissolveProgress)}% dissolved — {Math.round(sugarLeft)}% remaining
          </text>
        )}
        {isSaturated ? (
          <text x="240" y="256" textAnchor="middle" fontSize="8.5" fill="#f59e0b" fontWeight="800">
            ⚠️ Saturated (Excess Sugar)
          </text>
        ) : dissolveProgress >= 100 ? (
          <text x="240" y="256" textAnchor="middle" fontSize="8.5" fill="#10b981" fontWeight="800">
            ✓ Fully dissolved
          </text>
        ) : null}

        {/* ── Thermometer ── */}
        <g transform="translate(364, 36)" filter="url(#beaker-shadow)">
          {/* Thermometer body */}
          <rect x="10" y="0" width="16" height="96" rx="8" fill="rgba(255,255,255,0.35)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" />
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
          <circle cx="18" cy="98" r="9.5" fill={wColor} stroke="#e2e8f0" strokeWidth="1" />
          <circle cx="16" cy="96" r="3" fill="rgba(255,255,255,0.4)" />
          {/* Scale ticks */}
          {[25, 50, 75].map((pct) => {
            const y = 96 - pct / 100 * 86;
            return <line key={pct} x1="24" y1={y} x2="30" y2={y} stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />;
          })}
          {/* Temp reading */}
          <rect x="1" y="110" width="34" height="24" rx="4" fill="rgba(15,23,42,0.85)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
          <text x="18" y="123" textAnchor="middle" fontSize="11" fill={wColor} fontWeight="900" fontFamily="monospace">
            {Math.round(customTempCelsius)}°C
          </text>
          <text x="18" y="131" textAnchor="middle" fontSize="7" fill="#cbd5e1" fontWeight="700">TEMP</text>
        </g>

        {/* ── Progress ring ── */}
        <g transform="translate(38, 60)" filter="url(#beaker-shadow)">
          <circle cx="40" cy="40" r="35" fill="rgba(15,23,42,0.75)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <motion.circle
            cx="40" cy="40" r="35"
            fill="none"
            stroke="#10b981" strokeWidth="4.5"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 35}`}
            animate={{ strokeDashoffset: 2 * Math.PI * 35 * (1 - dissolveProgress / 100) }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ transform: "rotate(-90deg)", transformOrigin: "40px 40px" }}
          />
          <text x="40" y="36" textAnchor="middle" fontSize="15" fontWeight="950" fill="#10b981">
            {Math.round(dissolveProgress)}%
          </text>
          <text x="40" y="47" textAnchor="middle" fontSize="8" fill="#cbd5e1" fontWeight="700">dissolved</text>
          {dissolveTime && (
            <text x="40" y="58" textAnchor="middle" fontSize="10" fontWeight="800" fill="#38bdf8">
              {dissolveTime}s
            </text>
          )}
        </g>

        {/* ── Data count hint ── */}
        {dataPoints.length > 0 && (
          <text x="240" y="278" textAnchor="middle" fontSize="8" fill="#94a3b8" fontWeight="600">
            {dataPoints.length} comparison{dataPoints.length !== 1 ? "s" : ""} recorded — see chart below
          </text>
        )}
      </svg>
    </div>
  );
}
