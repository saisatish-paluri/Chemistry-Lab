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
}

// Beaker geometry (left mixture beaker)
// Outline: M 26 55 L 36 225 Q 38 240 52 240 L 152 240 Q 166 240 168 225 L 178 55
// Clip: M 30 60 L 38 220 Q 40 235 52 235 L 152 235 Q 164 235 166 220 L 174 60
// Interior bottom at y≈235, rim at y=60 → liquid fills upward from bottom

function FunnelLiquid({ filterProgress, liquidR, liquidG, liquidB, isPouring }: {
  filterProgress: number;
  liquidR: number; liquidG: number; liquidB: number;
  isPouring: boolean;
}) {
  const fillFrac = isPouring ? 0.70 : Math.max(0.04, 0.70 - filterProgress * 0.65);
  const topY = 150 - fillFrac * 82;
  const lx   = 25 + (1 - fillFrac) * 19;
  const rx   = 63 - (1 - fillFrac) * 19;
  return (
    <motion.path
      animate={{ d: `M 26 150 L ${lx.toFixed(1)} ${topY.toFixed(1)} L ${rx.toFixed(1)} ${topY.toFixed(1)} L 62 150 Z` }}
      fill={`rgba(${liquidR},${liquidG},${liquidB},0.45)`}
      transition={{ duration: 0.5, ease: "easeOut" }}
    />
  );
}

export default function FiltrationWorkspace({
  stage, mixProgress, filterProgress, filtrateVolume, residueMass, sandGrams, waterMl,
}: Props) {
  const hasWater    = stage !== "setup";
  const isMixing    = stage === "mixing";
  const isMixed     = ["mixed","pouring","filtering","complete"].includes(stage);
  const isPouring   = stage === "pouring";
  const isFiltering = ["filtering","complete"].includes(stage);
  const done        = stage === "complete";

  // Liquid color: murky brown-grey → clearer as mixing progresses
  const liquidR = Math.round(148 - mixProgress * 80);
  const liquidG = Math.round(163 + mixProgress * 30);
  const liquidB = Math.round(184 + mixProgress * 20);

  // Water level rises from bottom of beaker (y=235) up to y=100 as water is added
  const waterTopY  = hasWater ? 100 : 235;
  const waterH     = 235 - waterTopY;

  const filtrateH = filterProgress * 90;
  const filtrateY = 200 - filtrateH;

  return (
    <div
      className="relative rounded-3xl overflow-hidden select-none"
      style={{
        aspectRatio: "480/336",
        width:       "100%",
        height:      "auto",
        maxHeight:   "100%",
        background:  "linear-gradient(180deg, #fffbeb 0%, #fef9c3 30%, #f8fafc 100%)",
        border:      "1px solid rgba(217,119,6,0.22)",
        boxShadow:   "0 10px 30px rgba(15,23,42,0.05), 0 0 0 1px rgba(217,119,6,0.12) inset",
      }}
    >
      <svg viewBox="0 0 480 336" width="100%" style={{ display: "block", position: "relative", zIndex: 10 }}>
        <defs>
          <filter id="fw-shadow">
            <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="rgba(0,0,0,0.35)" />
          </filter>
          {/* Mixture beaker clip */}
          <clipPath id="fw-beaker-clip">
            <path d="M 30 60 L 38 220 Q 40 235 52 235 L 152 235 Q 164 235 166 220 L 174 60 Z" />
          </clipPath>
          {/* Filtrate beaker clip */}
          <clipPath id="fw-filtrate-clip">
            <path d="M 300 210 L 306 285 Q 308 295 316 295 L 400 295 Q 408 295 410 285 L 416 210 Z" />
          </clipPath>
          <linearGradient id="fw-liquid-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`rgba(${liquidR},${liquidG},${liquidB},0.35)`} />
            <stop offset="100%" stopColor={`rgba(${liquidR},${liquidG},${liquidB},0.65)`} />
          </linearGradient>
          <linearGradient id="fw-filtrate-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(107,164,184,0.40)" />
            <stop offset="100%" stopColor="rgba(107,164,184,0.70)" />
          </linearGradient>
        </defs>

        {/* ── MIXTURE BEAKER (left) ── */}

        {/* Water / liquid fill — RISES from bottom up */}
        <motion.rect
          x="33" width="138"
          clipPath="url(#fw-beaker-clip)"
          fill="url(#fw-liquid-grad)"
          initial={{ height: 0, y: 235 }}
          animate={{
            height: hasWater ? waterH : 0,
            y:      hasWater ? waterTopY : 235,
          }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />

        {/* Sand particles — floating/mixing */}
        {isMixed && Array.from({ length: 8 }).map((_, i) => (
          <motion.rect key={i}
            x={40 + i * 16} width="8" height="5" rx="2"
            fill="rgba(161,120,80,0.75)"
            animate={{ y: isMixing ? [208, 130, 208] : 218 }}
            transition={{
              duration: 1.5, delay: i * 0.12,
              repeat: isMixing ? Infinity : 0, ease: "easeInOut",
            }}
          />
        ))}

        {/* Dry sand layer (before water) */}
        {stage === "setup" && (
          <>
            <rect x="36" y="210" width="132" height="18" rx="3"
              fill="rgba(194,154,108,0.60)" clipPath="url(#fw-beaker-clip)" />
            {Array.from({ length: 10 }).map((_, i) => (
              <circle key={i}
                cx={42 + i * 13} cy={215} r="3"
                fill="rgba(139,90,43,0.55)" />
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

        {/* Labels */}
        <text x="102" y="48" textAnchor="middle" fontSize="8.5" fill="#475569" fontWeight="700" letterSpacing="0.06em">
          MIXTURE BEAKER
        </text>
        <text x="102" y="260" textAnchor="middle" fontSize="8" fill="#64748b">
          {stage === "setup"
            ? `${sandGrams}g sand + 3g salt (dry)`
            : isMixed
            ? "Dissolved salt + suspended sand"
            : `Adding ${waterMl} mL water…`}
        </text>

        {/* ── FUNNEL + FILTER PAPER (center) ── */}
        <g transform="translate(220, 30)">
          {/* Retort stand */}
          <rect x="10" y="0"   width="4" height="260" rx="2" fill="#94a3b8" />
          <rect x="-20" y="255" width="64" height="8"   rx="3" fill="#94a3b8" />
          {/* Ring / clamp */}
          <rect x="14" y="60" width="60" height="6" rx="3" fill="#64748b" />
          <circle cx="44" cy="63" r="3" fill="#475569" />

          {/* Funnel glass */}
          <path d="M 14 66 L 24 155 L 64 155 L 74 66 Z"
            fill="rgba(255,255,255,0.55)" stroke="rgba(71,85,105,0.40)" strokeWidth="1.8"
            filter="url(#fw-shadow)" />
          {/* Funnel sheen */}
          <path d="M 17 68 L 25 148"
            fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeLinecap="round" />

          {/* Filter paper — cone shape, visible after setup */}
          {(isPouring || isFiltering || done) && (
            <>
              <path d="M 16 68 L 25 150 L 63 150 L 72 68 Z"
                fill="#fffde7" stroke="#fde68a" strokeWidth="1.2" />
              {/* Filter paper fold line */}
              <line x1="44" y1="68" x2="44" y2="150"
                stroke="#fde68a" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
              {/* Filter paper label */}
              <text x="44" y="64" textAnchor="middle" fontSize="7" fill="#92400e" fontWeight="600">
                filter paper
              </text>
            </>
          )}

          {/* Liquid in funnel — appears during pouring and drains during filtering */}
          {(isPouring || isFiltering) && (
            <FunnelLiquid
              filterProgress={isFiltering ? filterProgress : 0}
              liquidR={liquidR} liquidG={liquidG} liquidB={liquidB}
              isPouring={isPouring}
            />
          )}

          {/* Wet sand residue on filter paper — grows as filtering progresses */}
          {isFiltering && (
            <motion.g
              animate={{ opacity: Math.min(1, filterProgress * 1.5) }}
              transition={{ duration: 0.5 }}
            >
              <path d="M 28 143 Q 44 137 60 143 L 62 150 L 26 150 Z"
                fill="rgba(161,120,80,0.70)" />
              {/* Sand particles on filter paper */}
              {[32, 38, 44, 50, 56].map((x, i) => (
                <ellipse key={i} cx={x} cy={147} rx="3" ry="2"
                  fill="rgba(120,80,40,0.65)" />
              ))}
            </motion.g>
          )}

          {/* Funnel stem */}
          <rect x="40" y="155" width="8" height="60" rx="2" fill="rgba(71,85,105,0.40)" />

          {/* Pour stream from beaker lip to funnel opening */}
          {isPouring && (
            <motion.path
              d="M -42 25 Q -12 50 14 66"
              fill="none" stroke={`rgba(${liquidR},${liquidG},${liquidB},0.70)`}
              strokeWidth="7" strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          )}

          {/* Animated drip from funnel stem */}
          {isFiltering && (
            <motion.ellipse cx="44" cy="220"
              rx="3" ry="5"
              fill="rgba(107,164,184,0.75)"
              animate={{ cy: [215, 248, 215], opacity: [0.9, 0.25, 0.9] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
            />
          )}

          {/* Flow guide dashes while filtering */}
          {isFiltering && (
            <motion.line x1="44" y1="215" x2="44" y2="248"
              stroke="rgba(107,164,184,0.30)"
              strokeWidth="1.5" strokeDasharray="3 4"
              animate={{ strokeDashoffset: [0, -14] }}
              transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
            />
          )}
        </g>

        {/* ── FILTRATE BEAKER (right) ── */}
        <g transform="translate(292, 0)">
          {/* Filtrate liquid — rises from bottom */}
          {isFiltering && (
            <motion.rect x="8" width="110"
              clipPath="url(#fw-filtrate-clip)"
              fill="url(#fw-filtrate-grad)"
              animate={{
                height: filtrateH,
                y:      filtrateY,
              }}
              initial={{ height: 0, y: 200 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          )}

          {/* Beaker outline */}
          <path d="M 0 205 L 8 290 Q 10 300 18 300 L 102 300 Q 110 300 112 290 L 120 205"
            fill="none" stroke="rgba(71,85,105,0.40)" strokeWidth="2" strokeLinecap="round"
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

        {/* ── Stage label at bottom ── */}
        <text x="240" y="324" textAnchor="middle" fontSize="8.5" fill="#475569" fontWeight="600">
          {stage === "setup"
            ? "Step 1: Observe sand + salt mixture (dry)"
            : stage === "mixing"
            ? "Step 2–3: Adding water — liquid rises, salt dissolves"
            : stage === "mixed"
            ? "Step 4: Set up funnel with filter paper"
            : stage === "pouring"
            ? "Step 5: Pouring mixture into funnel"
            : stage === "filtering"
            ? `Step 5–6: Filtering… sand trapped · filtrate dripping (${Math.round(filterProgress * 100)}%)`
            : `Complete — ${filtrateVolume.toFixed(0)} mL filtrate, ${residueMass.toFixed(1)} g sand residue`}
        </text>
      </svg>
    </div>
  );
}
