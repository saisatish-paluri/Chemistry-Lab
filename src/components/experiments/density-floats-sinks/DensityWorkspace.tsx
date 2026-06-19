"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { DensityMaterialId } from "@/lib/engine/types";
import { DENSITY_MATERIALS } from "@/lib/engine/density-floats-sinks-engine";

interface Props {
  selectedMaterial: DensityMaterialId | null;
  isDropping:       boolean;
  isSettled:        boolean;
  testedMaterials:  DensityMaterialId[];
  onSettle:         () => void;
  fluidDensity:     number;
  solidDensity:     number;
  displacementRatio: number;
}

// Water level in SVG coords (viewBox 460×370)
const WATER_TOP = 195;
const WATER_BOT = 322;
const TANK_L    = 42;
const TANK_R    = 378;
const TANK_W    = TANK_R - TANK_L;
const OBJ_X     = 210;

function MaterialShape({ materialId, color }: {
  materialId: DensityMaterialId;
  floats:     boolean;
  color:      string;
  settled?:   boolean;
}) {
  const mat = DENSITY_MATERIALS[materialId];
  if (mat.shape === "sphere") {
    return (
      <g>
        <ellipse cx="0" cy="0" rx="18" ry="14"
          fill={color} stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
        <ellipse cx="-5" cy="-4" rx="5" ry="3" fill="rgba(255,255,255,0.28)" />
      </g>
    );
  }
  if (mat.shape === "irregular") {
    return (
      <g>
        <path d="M -18 8 L -14 -12 L -2 -18 L 14 -14 L 20 2 L 12 16 L -6 18 Z"
          fill={color} stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
        <path d="M -12 -2 L -4 -10 L 6 -6"
          fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1" strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g>
      <rect x="-18" y="-14" width="36" height="28" rx="4"
        fill={color} stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
      <rect x="-13" y="-11" width="10" height="6" rx="2"
        fill="rgba(255,255,255,0.22)" />
    </g>
  );
}

export default function DensityWorkspace({
  selectedMaterial, isDropping, isSettled, testedMaterials, onSettle,
  fluidDensity, solidDensity, displacementRatio,
}: Props) {
  const mat    = selectedMaterial ? DENSITY_MATERIALS[selectedMaterial] : null;
  const floats = solidDensity < fluidDensity;

  const [showRipple, setShowRipple] = useState(false);

  // Resting Y: floating near surface based on displacement ratio, or sinking to bottom
  const restY    = floats ? WATER_TOP - 14 + displacementRatio * 14  : WATER_BOT - 16;
  const preDropY = floats ? WATER_TOP - 52 : 75;
  const targetY  = isDropping ? restY : preDropY;

  function handleAnimComplete() {
    if (!isDropping) return;
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 1000);
    onSettle();
  }

  // Map density to Y on the scale widget (water line at y=140 local)
  const scaleMarkerY = mat
    ? Math.min(264, Math.max(20, 140 + (solidDensity - fluidDensity) * 70))
    : null;

  return (
    <div
      className="relative rounded-3xl overflow-hidden select-none"
      style={{
        aspectRatio: "420/338",
        width:       "100%",
        height:      "auto",
        maxHeight:   "100%",
        background:  "radial-gradient(ellipse at 50% 25%, rgba(15,23,42,0.6) 0%, transparent 60%), linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
        border:      "1px solid rgba(255,255,255,0.1)",
        boxShadow:   "0 15px 35px rgba(0,0,0,0.5)",
      }}
    >
      <svg viewBox="35 25 420 338" width="100%" style={{ display: "block", position: "relative", zIndex: 10 }}>
        <defs>
          <pattern id="ac-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.75" fill="rgba(148,163,184,0.06)" />
          </pattern>
          <linearGradient id="ac-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#eff6ff" />
          </linearGradient>
          <linearGradient id="ac-bench" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="3%" stopColor="#e2e8f0" />
            <stop offset="10%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="dw-water-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(56, 189, 248, 0.4)" />
            <stop offset="100%" stopColor="rgba(14, 165, 233, 0.65)" />
          </linearGradient>
          <linearGradient id="glass-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.65)" />
            <stop offset="10%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="50%" stopColor="rgba(240,253,250,0.03)" />
            <stop offset="85%" stopColor="rgba(240,253,250,0.12)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.4)" />
          </linearGradient>
          <linearGradient id="glass-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
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

        {/* ── Background Wall & Dots ── */}
        <rect x="0" y="25" width="480" height="338" fill="url(#ac-wall)" />
        <rect x="0" y="25" width="480" height="338" fill="url(#ac-dots)" opacity="0.4" />

        {/* ── Lab bench ── */}
        <rect x="0" y="325" width="480" height="40" fill="url(#ac-bench)" />
        <rect x="0" y="325" width="480" height="2"  fill="rgba(255,255,255,0.18)" />

        {/* ── Tank Background ── */}
        <rect x={TANK_L} y="52" width={TANK_W} height="273" rx="10"
          fill="url(#glass-grad)" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" filter="url(#shadow)" />
        <rect x={TANK_L + 2.5} y="54.5" width={TANK_W - 5} height="268" rx="8"
          fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />

        {/* ── Water Fill ── */}
        <rect x={TANK_L + 3} y={WATER_TOP} width={TANK_W - 6} height={WATER_BOT - WATER_TOP}
          fill="url(#dw-water-grad)" rx="3" />

        {/* Animated water surface wave */}
        <motion.path
          animate={{ d: [
            `M ${TANK_L+3} ${WATER_TOP} Q ${TANK_L+TANK_W/4} ${WATER_TOP-4} ${TANK_L+TANK_W/2} ${WATER_TOP} Q ${TANK_L+3*TANK_W/4} ${WATER_TOP+4} ${TANK_R-3} ${WATER_TOP}`,
            `M ${TANK_L+3} ${WATER_TOP} Q ${TANK_L+TANK_W/4} ${WATER_TOP+4} ${TANK_L+TANK_W/2} ${WATER_TOP} Q ${TANK_L+3*TANK_W/4} ${WATER_TOP-4} ${TANK_R-3} ${WATER_TOP}`,
          ]}}
          transition={{ duration: 3.0, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
          fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8"
        />

        {/* Water label */}
        <text x={TANK_L + TANK_W / 2} y={WATER_TOP + 20} textAnchor="middle"
          fontSize="8.5" fill="rgba(255,255,255,0.85)" fontWeight="800" letterSpacing="0.10em" filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.8))">
          FLUID  ·  ρ = {fluidDensity.toFixed(3)} g/cm³
        </text>

        {/* ── Ripple on water impact ── */}
        <AnimatePresence>
          {showRipple && (
            <>
              <motion.ellipse key="rip1" cx={OBJ_X} cy={WATER_TOP}
                fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="2.2"
                initial={{ rx: 6, ry: 3, opacity: 0.9 }}
                animate={{ rx: 68, ry: 15, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.88, ease: "easeOut" }}
              />
              <motion.ellipse key="rip2" cx={OBJ_X} cy={WATER_TOP}
                fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"
                initial={{ rx: 4, ry: 2, opacity: 0.7 }}
                animate={{ rx: 42, ry: 9, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.62, delay: 0.12, ease: "easeOut" }}
              />
            </>
          )}
        </AnimatePresence>

        {/* ── Previously tested materials (ghosted) ── */}
        {testedMaterials.filter((m) => m !== selectedMaterial).map((mId, i) => {
          const m = DENSITY_MATERIALS[mId];
          const x = TANK_L + 28 + (i % 6) * 50;
          const mFloats = m.density < fluidDensity;
          const y = mFloats ? WATER_TOP - 8 : WATER_BOT - 14;
          return (
            <g key={mId} transform={`translate(${x}, ${y})`} opacity={0.38}>
              <MaterialShape materialId={mId} floats={mFloats} color={m.color} settled />
            </g>
          );
        })}

        {/* ── Active material ── */}
        <AnimatePresence>
          {mat && (
            <motion.g
              key={selectedMaterial}
              initial={{ x: OBJ_X, y: 55 }}
              animate={{ x: OBJ_X, y: targetY }}
              transition={
                isDropping
                  ? floats
                    ? { type: "spring", stiffness: 50 + 80 * (1 - displacementRatio), damping: 5 + 10 * displacementRatio }
                    : { duration: 0.5 + 1.5 * (fluidDensity / solidDensity) }
                  : { duration: 0 }
              }
              onAnimationComplete={handleAnimComplete}
            >
              {/* Gentle bob for floating objects after settling */}
              <motion.g
                animate={isSettled && floats ? { y: [0, -3, 0, -2, 0] } : { y: 0 }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <MaterialShape
                  materialId={selectedMaterial!}
                  floats={floats}
                  color={mat.color}
                  settled={isSettled}
                />

                {/* Waterline reflection for floating objects */}
                {isSettled && floats && (
                  <ellipse cx="0" cy="9" rx="15" ry="4"
                    fill="rgba(56,189,248,0.35)" />
                )}

                {/* Density badge — appears after settling */}
                {isSettled && (
                  <motion.g
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.3 }}
                  >
                    <rect x="-72" y="-44" width="144" height="24" rx="6"
                      fill="rgba(15, 23, 42, 0.85)"
                      stroke={floats ? "#10b981" : "#ef4444"}
                      strokeWidth="1.6"
                    />
                    <text y="-28" textAnchor="middle"
                      fontSize="11.5" fill={floats ? "#10b981" : "#ef4444"} fontWeight="900" fontFamily="monospace">
                      ρ = {solidDensity.toFixed(2)} g/cm³ — {floats ? "FLOATS ▲" : "SINKS ▼"}
                    </text>
                  </motion.g>
                )}
              </motion.g>
            </motion.g>
          )}
        </AnimatePresence>

        {/* ── Tank glass sheen ── */}
        <rect x={TANK_L + 3} y="54" width="15" height="269" fill="url(#glass-sheen)" rx="4" />
        {/* Tank outline (on top) */}
        <rect x={TANK_L} y="52" width={TANK_W} height="273" rx="10"
          fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />

        {/* ── Density scale ── */}
        <g transform="translate(390, 52)" filter="url(#shadow)">
          <rect x="0" y="0" width="62" height="273" rx="6"
            fill="rgba(15, 23, 42, 0.85)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" />
          <text x="31" y="16" textAnchor="middle" fontSize="10.5" fill="#94a3b8" fontWeight="800">ρ (g/cm³)</text>

          {/* fluid density line */}
          <line x1="2" y1={140} x2="60" y2={140}
            stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="3 2" />
          <text x="31" y={134} textAnchor="middle" fontSize="13" fill="#38bdf8" fontWeight="950">
            {fluidDensity.toFixed(2)}
          </text>
          <text x="31" y={148} textAnchor="middle" fontSize="8" fill="#94a3b8" fontWeight="700">fluid</text>

          {/* Zone labels */}
          <text x="31" y="78"  textAnchor="middle" fontSize="10.5" fill="#34d399" fontWeight="800">FLOATS</text>
          <text x="31" y="90"  textAnchor="middle" fontSize="8.5"   fill="#34d399" fontWeight="700">&lt; {fluidDensity.toFixed(2)}</text>
          <text x="31" y="210" textAnchor="middle" fontSize="10.5" fill="#f87171" fontWeight="800">SINKS</text>
          <text x="31" y="222" textAnchor="middle" fontSize="8.5"   fill="#f87171" fontWeight="700">&gt; {fluidDensity.toFixed(2)}</text>

          {/* Animated density marker */}
          {scaleMarkerY !== null && isSettled && (
            <>
              <motion.circle
                cx="29" cy={scaleMarkerY} r="6"
                fill={floats ? "#059669" : "#dc2626"}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 14 }}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              />
              <line x1="2" y1={scaleMarkerY} x2="52" y2={scaleMarkerY}
                stroke={floats ? "#059669" : "#dc2626"}
                strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
            </>
          )}
        </g>

        {/* ── Float/Sink zone labels in tank ── */}
        {!mat && (
          <>
            <text x={TANK_L + TANK_W / 2} y={WATER_TOP - 15}
              textAnchor="middle" fontSize="8.5" fill="rgba(52,211,153,0.75)" fontWeight="800" letterSpacing="0.08em" filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.8))">
              ▲ FLOAT ZONE (ρ &lt; {fluidDensity.toFixed(2)})
            </text>
            <text x={TANK_L + TANK_W / 2} y={WATER_BOT - 15}
              textAnchor="middle" fontSize="8.5" fill="rgba(248,113,113,0.65)" fontWeight="800" letterSpacing="0.08em" filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.8))">
              ▼ SINK ZONE (ρ &gt; {fluidDensity.toFixed(2)})
            </text>
          </>
        )}

        {/* ── Bottom label ── */}
        <text x="215" y="348" textAnchor="middle" fontSize="9" fill="#cbd5e1" fontWeight="600" filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.8))">
          {mat
            ? `${mat.name}  ·  Solid ρ = ${solidDensity.toFixed(2)} g/cm³  ·  Fluid ρ = ${fluidDensity.toFixed(3)} g/cm³`
            : "Select a material from the controls panel to begin"}
        </text>
      </svg>
    </div>
  );
}
