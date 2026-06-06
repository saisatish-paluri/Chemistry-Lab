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
}: Props) {
  const mat    = selectedMaterial ? DENSITY_MATERIALS[selectedMaterial] : null;
  const floats = mat?.floats ?? true;

  const [showRipple, setShowRipple] = useState(false);

  // Resting Y: floating near surface, sinking to bottom
  const restY    = floats ? WATER_TOP - 8  : WATER_BOT - 16;
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
    ? Math.min(264, Math.max(20, 140 + (mat.density - 1.0) * 70))
    : null;

  return (
    <div
      className="relative rounded-3xl overflow-hidden select-none"
      style={{
        aspectRatio: "460/370",
        width:       "100%",
        height:      "auto",
        maxHeight:   "100%",
        background:  "linear-gradient(180deg, #e0f2fe 0%, #bfdbfe 40%, #f0f9ff 100%)",
        border:      "1px solid rgba(148,163,184,0.28)",
        boxShadow:   "0 10px 30px rgba(15,23,42,0.06), 0 0 0 1px rgba(2,132,199,0.18) inset",
      }}
    >
      <svg viewBox="0 0 460 370" width="100%" style={{ display: "block", position: "relative", zIndex: 10 }}>
        <defs>
          <linearGradient id="dw-water-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(59,130,246,0.55)" />
            <stop offset="100%" stopColor="rgba(14,165,233,0.72)" />
          </linearGradient>
          <filter id="dw-blur">
            <feGaussianBlur stdDeviation="1" />
          </filter>
        </defs>

        {/* ── Tank Background ── */}
        <rect x={TANK_L} y="52" width={TANK_W} height="278" rx="10"
          fill="rgba(248,250,252,0.30)" stroke="rgba(71,85,105,0.35)" strokeWidth="2" />

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
          fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5"
        />

        {/* Water label */}
        <text x={TANK_L + TANK_W / 2} y={WATER_TOP + 20} textAnchor="middle"
          fontSize="8" fill="rgba(255,255,255,0.80)" fontWeight="700" letterSpacing="0.10em">
          WATER  ·  ρ = 1.00 g/cm³
        </text>

        {/* ── Ripple on water impact ── */}
        <AnimatePresence>
          {showRipple && (
            <>
              <motion.ellipse key="rip1" cx={OBJ_X} cy={WATER_TOP}
                fill="none" stroke="rgba(255,255,255,0.70)" strokeWidth="2"
                initial={{ rx: 6, ry: 3, opacity: 0.9 }}
                animate={{ rx: 68, ry: 15, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.88, ease: "easeOut" }}
              />
              <motion.ellipse key="rip2" cx={OBJ_X} cy={WATER_TOP}
                fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5"
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
          const y = m.floats ? WATER_TOP - 8 : WATER_BOT - 14;
          return (
            <g key={mId} transform={`translate(${x}, ${y})`} opacity={0.38}>
              <MaterialShape materialId={mId} floats={m.floats} color={m.color} settled />
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
                    ? { type: "spring", stiffness: 90, damping: 10 }
                    : { type: "spring", stiffness: 55, damping: 9 }
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
                    fill="rgba(59,130,246,0.28)" />
                )}

                {/* Density badge — appears after settling */}
                {isSettled && (
                  <motion.g
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.3 }}
                  >
                    <rect x="-56" y="-42" width="112" height="22" rx="6"
                      fill="rgba(255,255,255,0.96)"
                      stroke={floats ? "#059669" : "#dc2626"}
                      strokeWidth="1.4"
                    />
                    <text y="-27" textAnchor="middle"
                      fontSize="10" fill={floats ? "#059669" : "#dc2626"} fontWeight="800">
                      ρ = {mat.density} g/cm³ — {floats ? "FLOATS ▲" : "SINKS ▼"}
                    </text>
                  </motion.g>
                )}
              </motion.g>
            </motion.g>
          )}
        </AnimatePresence>

        {/* ── Tank glass sheen ── */}
        <rect x={TANK_L + 3} y="54" width="12" height="274" rx="4"
          fill="rgba(255,255,255,0.18)" />
        {/* Tank outline (on top) */}
        <rect x={TANK_L} y="52" width={TANK_W} height="278" rx="10"
          fill="none" stroke="rgba(71,85,105,0.30)" strokeWidth="2" />

        {/* ── Density scale ── */}
        <g transform="translate(392, 52)">
          <rect x="0" y="0" width="58" height="280" rx="6"
            fill="rgba(255,255,255,0.65)" stroke="#e2e8f0" strokeWidth="1" />
          <text x="29" y="14" textAnchor="middle" fontSize="7" fill="#64748b" fontWeight="700">ρ (g/cm³)</text>

          {/* 1.0 water line */}
          <line x1="2" y1={140} x2="56" y2={140}
            stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 2" />
          <text x="34" y={137} textAnchor="middle" fontSize="7.5" fill="#2563eb" fontWeight="800">1.00</text>
          <text x="34" y={148} textAnchor="middle" fontSize="6" fill="#64748b">water</text>

          {/* Zone labels */}
          <text x="29" y="80"  textAnchor="middle" fontSize="6.5" fill="#059669" fontWeight="700">FLOATS</text>
          <text x="29" y="91"  textAnchor="middle" fontSize="6"   fill="#059669">&lt; 1.0</text>
          <text x="29" y="208" textAnchor="middle" fontSize="6.5" fill="#dc2626" fontWeight="700">SINKS</text>
          <text x="29" y="219" textAnchor="middle" fontSize="6"   fill="#dc2626">&gt; 1.0</text>

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
              textAnchor="middle" fontSize="8" fill="rgba(5,150,105,0.70)" fontWeight="700" letterSpacing="0.08em">
              ▲ FLOAT ZONE (ρ &lt; 1.0)
            </text>
            <text x={TANK_L + TANK_W / 2} y={WATER_BOT - 15}
              textAnchor="middle" fontSize="8" fill="rgba(220,38,38,0.50)" fontWeight="700" letterSpacing="0.08em">
              ▼ SINK ZONE (ρ &gt; 1.0)
            </text>
          </>
        )}

        {/* ── Bottom label ── */}
        <text x="215" y="352" textAnchor="middle" fontSize="8.5" fill="#475569" fontWeight="600">
          {mat
            ? `${mat.name}  ·  ${mat.density} g/cm³  ·  ${floats ? "Less dense than water → FLOATS" : "Denser than water → SINKS"}`
            : "Select a material from the controls panel to begin"}
        </text>
      </svg>
    </div>
  );
}
