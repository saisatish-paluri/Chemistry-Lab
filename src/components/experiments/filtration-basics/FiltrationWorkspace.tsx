"use client";

import { motion } from "framer-motion";
import type { FiltrationStage } from "@/lib/engine/types";

interface Props {
  stage:          FiltrationStage;
  mixProgress:    number;
  filterProgress: number;
  filtrateVolume: number;
  residueMass:    number;
  sandGrams:      number;
  waterMl:        number;
  cloggingFactor: number;
  flowRate:       number;
  onSetupFilter?: () => void;
  onStartPour?:   () => void;
}

function FunnelLiquid({ filterProgress, liquidR, liquidG, liquidB, isPouring }: {
  filterProgress: number;
  liquidR: number; liquidG: number; liquidB: number;
  isPouring: boolean;
}) {
  const fillFrac = isPouring ? 0.70 : Math.max(0.0, 0.70 - filterProgress * 0.70);
  if (fillFrac <= 0.01) return null;
  const topY = 150 - fillFrac * 82;
  const lx   = 25 + (1 - fillFrac) * 19;
  const rx   = 63 - (1 - fillFrac) * 19;
  return (
    <motion.path
      animate={{ d: `M 26 150 L ${lx.toFixed(1)} ${topY.toFixed(1)} L ${rx.toFixed(1)} ${topY.toFixed(1)} L 62 150 Z` }}
      fill={`rgba(${liquidR},${liquidG},${liquidB},0.55)`}
      transition={{ duration: 0.2, ease: "easeOut" }}
    />
  );
}

export default function FiltrationWorkspace({
  stage, mixProgress, filterProgress, filtrateVolume, residueMass, sandGrams, waterMl, cloggingFactor, flowRate,
  onSetupFilter, onStartPour,
}: Props) {
  const hasWater    = stage !== "setup";
  const isMixing    = stage === "mixing";
  const isMixed     = ["mixed","pouring","filtering","complete"].includes(stage);
  const isPouring   = stage === "pouring";
  const isFiltering = ["filtering","complete"].includes(stage);
  const done        = stage === "complete";

  // Pour ratio runs at the beginning of the filtering stage (from filterProgress 0 to 0.15)
  // This simulates the actual pouring process from the beaker into the funnel.
  const pourRatio = isFiltering ? Math.min(1, filterProgress / 0.15) : 0;
  const isBeakerPouring = isFiltering && pourRatio < 1;

  // Beaker rotation: tilt during pouring, then return to bench
  const beakerRotation = isBeakerPouring ? -35 * (1 - pourRatio) : 0;
  // Beaker liquid level drains as it pours
  const beakerLiquidFrac = isBeakerPouring ? (1 - pourRatio) : (isFiltering || done ? 0 : 1);
  const waterTopY  = 100 + (135 * (1 - beakerLiquidFrac));
  const waterH     = 235 - waterTopY;

  // Liquid color: murky brown-grey (turbid slurry) for the mixture
  const liquidR = Math.round(140 - mixProgress * 40);
  const liquidG = Math.round(110 - mixProgress * 30);
  const liquidB = Math.round(80 - mixProgress * 20);

  // Filtrate height and position in right beaker
  const filtrateH = filterProgress * 85;
  const filtrateY = 295 - filtrateH;

  // Sand cake buildup height in filter funnel based on residue mass
  const cakeH = Math.min(22, (residueMass / Math.max(0.1, sandGrams)) * 18);
  const cakeL = 25 + cakeH * 0.42;
  const cakeR = 63 - cakeH * 0.42;

  // Dynamic dripping speed based on engine flowRate
  const dripDuration = flowRate > 0 ? Math.max(0.12, 1.8 / flowRate) : 1.5;

  return (
    <div
      className="relative rounded-3xl overflow-hidden select-none"
      style={{
        aspectRatio: "420/315",
        width:       "100%",
        height:      "auto",
        maxHeight:   "100%",
        background:  "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)",
        border:      "1px solid rgba(217,119,6,0.18)",
        boxShadow:   "0 10px 30px rgba(15,23,42,0.05)",
      }}
    >
      {/* HUD display showing real physics values */}
      <div className="absolute top-4 left-4 z-20 bg-slate-900/80 backdrop-blur-md rounded-xl p-2.5 border border-slate-700/50 text-[10px] font-mono text-slate-300 space-y-1 shadow-lg">
        <div className="flex justify-between gap-4">
          <span className="text-amber-400">Flow Rate:</span>
          <span className="font-bold text-white">{(flowRate).toFixed(2)} mL/s</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-amber-400">Clogging Factor:</span>
          <span className="font-bold text-white">{(cloggingFactor).toFixed(2)}x</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-amber-400">Residue Mass:</span>
          <span className="font-bold text-white">{residueMass.toFixed(2)} g</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-amber-400">Filtrate:</span>
          <span className="font-bold text-white">{filtrateVolume.toFixed(1)} mL</span>
        </div>
      </div>

      <svg viewBox="15 10 420 315" width="100%" style={{ display: "block", position: "relative", zIndex: 10 }}>
        <defs>
          <filter id="fw-shadow">
            <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="rgba(0,0,0,0.25)" />
          </filter>
          
          {/* Mixture beaker clip */}
          <clipPath id="fw-beaker-clip">
            <path d="M 30 60 L 38 220 Q 40 235 52 235 L 152 235 Q 164 235 166 220 L 174 60 Z" />
          </clipPath>
          
          {/* Filtrate beaker clip */}
          <clipPath id="fw-filtrate-clip">
            <path d="M 300 210 L 306 285 Q 308 295 316 295 L 400 295 Q 408 295 410 285 L 416 210 Z" />
          </clipPath>

          {/* Turbid slurry gradient */}
          <linearGradient id="fw-slurry-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`rgba(${liquidR},${liquidG},${liquidB},0.55)`} />
            <stop offset="100%" stopColor={`rgba(${liquidR-20},${liquidG-20},${liquidB-15},0.80)`} />
          </linearGradient>

          {/* Crystal clear filtrate gradient */}
          <linearGradient id="fw-filtrate-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(186,230,253,0.30)" />
            <stop offset="100%" stopColor="rgba(125,211,252,0.55)" />
          </linearGradient>

          {/* Wet paper paper gradient (amber/brown wicking upwards) */}
          <linearGradient id="fw-paper-grad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#a17850" />
            <stop offset={`${Math.min(100, filterProgress * 130)}%`} stopColor="#b48c58" />
            <stop offset={`${Math.min(100, filterProgress * 130 + 15)}%`} stopColor="#fffde7" />
          </linearGradient>
        </defs>

        {/* ── MIXTURE BEAKER (left) ── */}
        <motion.g
          animate={{
            rotate: beakerRotation,
            x: isBeakerPouring ? 14 : 0,
            y: isBeakerPouring ? -16 : 0,
          }}
          transition={{ duration: 0.3 }}
          style={{ transformOrigin: "178px 55px", cursor: stage === "pouring" ? "pointer" : "default" }}
          onClick={() => { if (stage === "pouring" && onStartPour) onStartPour(); }}
        >
          <g transform="translate(102, 148) scale(1.15) translate(-102, -148)">
            {/* Water / turbid liquid fill */}
            {hasWater && (
              <motion.rect
                x="33" width="138"
                clipPath="url(#fw-beaker-clip)"
                fill="url(#fw-slurry-grad)"
                animate={{
                  height: waterH,
                  y:      waterTopY,
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            )}

            {/* Sand particles inside mixture beaker */}
            {hasWater && !isFiltering && !done && Array.from({ length: 24 }).map((_, i) => {
              const seed = i * 17;
              const radius = 6 + (seed % 4) * 8;
              const speed = 1.0 + (seed % 3) * 0.8;
              const particleY = isMixing 
                ? [215, 140, 215] // Swirling y loop
                : [140 + (seed % 5) * 15, 222 + (seed % 3) * 3]; // Settling y loop from top to bottom
              const duration = isMixing ? 1.8 / speed : 2.5;

              return (
                <motion.circle
                  key={i}
                  r="2.5"
                  fill="rgba(100, 70, 40, 0.85)"
                  stroke="rgba(160, 120, 80, 0.5)"
                  strokeWidth="0.5"
                  animate={{
                    cx: isMixing 
                      ? [90 - radius, 90 + radius, 90 - radius]
                      : 45 + (seed % 10) * 11,
                    y: particleY,
                  }}
                  transition={{
                    duration,
                    repeat: isMixing ? Infinity : 0,
                    ease: isMixing ? "easeInOut" : "easeOut",
                    delay: (seed % 6) * 0.1,
                  }}
                />
              );
            })}

            {/* Settled sand sediment layer at the bottom of the beaker */}
            {isMixed && beakerLiquidFrac > 0 && (
              <path
                d={`M 35 220 Q 70 ${226 - 10 * beakerLiquidFrac} 100 ${222 - 6 * beakerLiquidFrac} T 165 224 L 165 235 L 35 235 Z`}
                fill="rgba(120, 85, 45, 0.85)"
                clipPath="url(#fw-beaker-clip)"
              />
            )}

            {/* Dry sand layer */}
            {stage === "setup" && (
              <>
                <rect x="36" y="210" width="132" height="18" rx="3"
                  fill="rgba(194,154,108,0.65)" clipPath="url(#fw-beaker-clip)" />
                {Array.from({ length: 14 }).map((_, i) => (
                  <circle key={i}
                    cx={42 + i * 9.5} cy={215 + (i % 2) * 3} r="3"
                    fill="rgba(139,90,43,0.7)" />
                ))}
              </>
            )}

            {/* Beaker outline */}
            <path d="M 26 55 L 36 225 Q 38 240 52 240 L 152 240 Q 166 240 168 225 L 178 55"
              fill="none" stroke="rgba(71,85,105,0.45)" strokeWidth="2.2" strokeLinecap="round"
              filter="url(#fw-shadow)" />
            <line x1="24" y1="55" x2="180" y2="55"
              stroke="rgba(71,85,105,0.40)" strokeWidth="3" strokeLinecap="round" />
            <path d="M 32 68 L 37 212"
              fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="4" strokeLinecap="round" />

            {/* Beaker Label */}
            <text x="102" y="48" textAnchor="middle" fontSize="8.5" fill="#475569" fontWeight="700" letterSpacing="0.06em">
              MIXTURE
            </text>
          </g>
        </motion.g>

        {/* ── FUNNEL + FILTER PAPER (center) ── */}
        <g transform="translate(200, 20)">
          {/* Retort stand */}
          <rect x="10" y="0"   width="4" height="260" rx="2" fill="#94a3b8" />
          <rect x="-20" y="255" width="64" height="8"   rx="3" fill="#94a3b8" />
          {/* Ring / clamp */}
          <rect x="14" y="60" width="60" height="6" rx="3" fill="#64748b" />
          <circle cx="44" cy="63" r="3" fill="#475569" />

          {/* Funnel & contents scaled up */}
          <g 
            transform="translate(44, 130) scale(1.25) translate(-44, -130)"
            style={{ cursor: stage === "mixed" ? "pointer" : "default" }}
            onClick={() => { if (stage === "mixed" && onSetupFilter) onSetupFilter(); }}
          >
            {/* Funnel glass */}
            <path d="M 14 66 L 24 155 L 64 155 L 74 66 Z"
              fill="rgba(255,255,255,0.55)" stroke="rgba(71,85,105,0.40)" strokeWidth="1.8"
              filter="url(#fw-shadow)" />
            {/* Funnel sheen */}
            <path d="M 17 68 L 25 148"
              fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeLinecap="round" />

            {/* Filter paper */}
            {(isPouring || isFiltering || done) && (
              <>
                <path d="M 16 68 L 25 150 L 63 150 L 72 68 Z"
                  fill="url(#fw-paper-grad)" stroke="#d97706" strokeWidth="1.2" />
                <line x1="44" y1="68" x2="44" y2="150"
                  stroke="#d97706" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
                <text x="44" y="64" textAnchor="middle" fontSize="7" fill="#92400e" fontWeight="600">
                  filter paper
                </text>
              </>
            )}

            {/* Liquid in funnel */}
            {(isPouring || isFiltering) && (
              <FunnelLiquid
                filterProgress={isFiltering ? filterProgress : 0}
                liquidR={liquidR} liquidG={liquidG} liquidB={liquidB}
                isPouring={isBeakerPouring}
              />
            )}

            {/* Physical wet sand cake buildup */}
            {isFiltering && residueMass > 0.05 && (
              <g>
                <motion.path
                  d={`M 25 150 L ${cakeL} ${150 - cakeH} Q 44 ${150 - cakeH - 4} ${cakeR} ${150 - cakeH} L 63 150 Z`}
                  fill="rgba(100, 70, 40, 0.85)"
                  animate={{ d: `M 25 150 L ${cakeL} ${150 - cakeH} Q 44 ${150 - cakeH - 4} ${cakeR} ${150 - cakeH} L 63 150 Z` }}
                  transition={{ duration: 0.3 }}
                />
                {/* Texture speckles */}
                {Array.from({ length: 12 }).map((_, idx) => {
                  const px = 28 + (idx % 4) * 8 + (idx % 3) * 2;
                  const py = 150 - (idx % 3) * (cakeH / 4) - 2;
                  return (
                    <circle key={idx} cx={px} cy={py} r="1.2" fill="rgba(65, 40, 20, 0.9)" />
                  );
                })}
              </g>
            )}

            {/* Progressive clogging speckles */}
            {isFiltering && cloggingFactor > 1.05 && (
              <g opacity={Math.min(1, (cloggingFactor - 1) / 1.5)}>
                <circle cx="21" cy="110" r="1.5" fill="rgba(80, 50, 25, 0.8)" />
                <circle cx="23" cy="130" r="1.5" fill="rgba(80, 50, 25, 0.8)" />
                <circle cx="25" cy="144" r="1.8" fill="rgba(60, 35, 15, 0.9)" />
                <circle cx="67" cy="115" r="1.5" fill="rgba(80, 50, 25, 0.8)" />
                <circle cx="65" cy="132" r="1.5" fill="rgba(80, 50, 25, 0.8)" />
                <circle cx="62" cy="146" r="1.8" fill="rgba(60, 35, 15, 0.9)" />
                <circle cx="43" cy="100" r="1.2" fill="rgba(80, 50, 25, 0.7)" />
                <circle cx="45" cy="125" r="1.6" fill="rgba(80, 50, 25, 0.8)" />
                <circle cx="44" cy="142" r="2.0" fill="rgba(50, 30, 10, 0.9)" />
              </g>
            )}

            {/* Funnel stem */}
            <rect x="40" y="155" width="8" height="60" rx="2" fill="rgba(71,85,105,0.40)" />

            {/* Pour stream */}
            {isBeakerPouring && (
              <motion.path
                d="M -42 25 Q -12 50 14 66"
                fill="none" stroke={`rgba(${liquidR},${liquidG},${liquidB},0.78)`}
                strokeWidth="6" strokeLinecap="round"
                strokeDasharray="8 5"
                animate={{ strokeDashoffset: [0, -13] }}
                transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
              />
            )}

            {/* Pour stream particles */}
            {isBeakerPouring && Array.from({ length: 3 }).map((_, idx) => (
              <motion.circle
                key={idx}
                r="2"
                fill="rgba(90, 60, 30, 0.9)"
                animate={{
                  cx: [-30, 0, 14],
                  cy: [30, 52, 66],
                }}
                transition={{
                  duration: 0.4,
                  repeat: Infinity,
                  delay: idx * 0.13,
                  ease: "easeIn",
                }}
              />
            ))}

            {/* Dripping */}
            {isFiltering && flowRate > 0.04 && (
              <motion.ellipse cx="44" cy="220"
                rx="3" ry="5"
                fill="rgba(125,211,252,0.85)"
                animate={{
                  cy: [215, 245 - (filterProgress * 15), 215],
                  opacity: [0.95, 0.2, 0.95]
                }}
                transition={{
                  duration: dripDuration,
                  repeat: Infinity,
                  ease: "easeIn"
                }}
              />
            )}

            {/* Flow guide dashes */}
            {isFiltering && flowRate > 0.04 && (
              <motion.line x1="44" y1="215" x2="44" y2="245 - (filterProgress * 15)"
                stroke="rgba(125,211,252,0.45)"
                strokeWidth="2.0" strokeDasharray="3 4"
                animate={{ strokeDashoffset: [0, -14] }}
                transition={{ duration: Math.max(0.1, dripDuration * 0.6), repeat: Infinity, ease: "linear" }}
              />
            )}
          </g>
        </g>

        {/* ── FILTRATE BEAKER (right) ── */}
        <g transform="translate(292, 10)">
          <g transform="translate(60, 250) scale(1.15) translate(-60, -250)">
            {/* Filtrate liquid */}
            {isFiltering && (
              <motion.rect x="8" width="110"
                clipPath="url(#fw-filtrate-clip)"
                fill="url(#fw-filtrate-grad)"
                animate={{
                  height: filtrateH,
                  y:      filtrateY,
                }}
                initial={{ height: 0, y: 295 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            )}

            {/* Beaker outline */}
            <path d="M 0 205 L 8 290 Q 10 300 18 300 L 102 300 Q 110 300 112 290 L 120 205"
              fill="none" stroke="rgba(71,85,105,0.40)" strokeWidth="2.2" strokeLinecap="round"
              filter="url(#fw-shadow)" />
            <line x1="-2" y1="205" x2="122" y2="205"
              stroke="rgba(71,85,105,0.38)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 5 215 L 8 282"
              fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="3.5" strokeLinecap="round" />

            <text x="60" y="198" textAnchor="middle" fontSize="8.5" fill="#475569" fontWeight="700" letterSpacing="0.06em">
              FILTRATE
            </text>
            <text x="60" y="320" textAnchor="middle" fontSize="8" fill="#64748b">
              {done
                ? `${filtrateVolume.toFixed(0)} mL clear salt solution`
                : isFiltering
                ? `${(filterProgress * 100).toFixed(0)}% collected…`
                : "Empty"}
            </text>
          </g>
        </g>

        {/* ── Stage label at bottom ── */}
        <text x="220" y="316" textAnchor="middle" fontSize="8.5" fill="#475569" fontWeight="600">
          {stage === "setup"
            ? "Step 1: Set water volume, sand & salt mass in controls"
            : stage === "mixing"
            ? "Step 2: Stirring solution — salt dissolves, sand remains insoluble"
            : stage === "mixed"
            ? "Step 3: Click the filter funnel in the workspace to place filter paper"
            : stage === "pouring"
            ? "Step 4: Click the mixture beaker in the workspace to pour it"
            : stage === "filtering"
            ? `Step 5: Filtering… sand trapped · filtrate dripping (${Math.round(filterProgress * 100)}%)`
            : `Complete — ${filtrateVolume.toFixed(1)} mL filtrate, ${residueMass.toFixed(2)} g sand residue`}
        </text>
      </svg>
    </div>
  );
}
