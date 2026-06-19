"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PhysicalChemicalState } from "@/lib/engine/types";

interface Props {
  state: PhysicalChemicalState;
  onTrigger?: () => void;
  onCheckReversibility?: () => void;
}

const W = 540;
const H = 600;

export default function PhysicalChemicalWorkspace({ state, onTrigger, onCheckReversibility }: Props) {
  const {
    selectedProcess,
    processType,
    temperature,
    reactionProgress,
    heatReleasedJ,
    reversibilityChecked,
    isTriggered,
    status,
  } = state;

  const [flameOffset, setFlameOffset] = useState(0);

  // Flame particle jitter
  useEffect(() => {
    if (selectedProcess === "burning-paper" && isTriggered && reactionProgress < 0.95) {
      const interval = setInterval(() => {
        setFlameOffset(prev => (prev + 1) % 3);
      }, 150);
      return () => clearInterval(interval);
    }
  }, [selectedProcess, isTriggered, reactionProgress]);

  // Labels and math values
  const entropyLabel = processType === "physical" ? "Reversible Phase/Mix" : "Irreversible Covalent Bond Shift";
  const heatLabel = heatReleasedJ > 0 ? `Exothermic (${heatReleasedJ.toFixed(0)} J released)` : heatReleasedJ < 0 ? `Endothermic (${Math.abs(heatReleasedJ).toFixed(0)} J absorbed)` : "Thermally neutral";

  const beakerX = 140;
  const beakerY = 180;
  const beakerW = 260;
  const beakerH = 260;

  return (
    <div style={{ width: "100%", height: "auto", maxHeight: "100%", aspectRatio: "540/600" }} className="relative select-none">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "100%" }}
        className="drop-shadow-xl"
      >
        <defs>
          <pattern id="ac-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.75" fill="rgba(148,163,184,0.06)" />
          </pattern>
          <linearGradient id="ac-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="ac-bench" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="3%" stopColor="#475569" />
            <stop offset="10%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>
          <linearGradient id="beakerGlassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.65)" />
            <stop offset="15%" stopColor="rgba(255, 255, 255, 0.18)" />
            <stop offset="50%" stopColor="rgba(240, 253, 250, 0.03)" />
            <stop offset="85%" stopColor="rgba(240, 253, 250, 0.12)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.4)" />
          </linearGradient>
          <linearGradient id="metal-clamp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="50%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <linearGradient id="chrome-tube" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="25%" stopColor="#f8fafc" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="80%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="glass-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.15)" />
          </linearGradient>
          <filter id="shadow" x="-10%" y="-10%" width="125%" height="125%">
            <feDropShadow dx="3" dy="12" stdDeviation="6" floodColor="#020617" floodOpacity="0.45" />
          </filter>
          <filter id="flame-blur" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.5" />
          </filter>
          <clipPath id="beaker-clip-pc">
            <rect x={beakerX + 2.5} y={beakerY + 2.5} width={beakerW - 5} height={beakerH - 5} rx="6" />
          </clipPath>
        </defs>

        {/* ── GROUND LAB TABLE & WALL ── */}
        <rect width={W} height={H} fill="url(#ac-wall)" />
        <rect width={W} height={H} fill="url(#ac-dots)" opacity="0.4" />
        <rect x="0" y="470" width={W} height="130" fill="url(#ac-bench)" />
        <rect x="0" y="470" width={W} height="3" fill="rgba(255,255,255,0.18)" />

        {/* ── CONFIG 1: MELTING WAX ── */}
        {selectedProcess === "melting-wax" && (
          <g id="melting-wax-setup" filter="url(#shadow)">
            {/* Bunsen burner stand */}
            <path d="M 170 360 L 370 360 M 170 360 L 180 470 M 370 360 L 360 470" stroke="url(#metal-clamp)" strokeWidth="6" strokeLinecap="round" />
            <path d="M 170 360 L 370 360" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
            {/* Bunsen burner body */}
            <rect x="245" y="410" width="50" height="60" rx="3" fill="url(#chrome-tube)" stroke="#1e293b" strokeWidth="1" />
            
            {/* Multi-layered Soft Bunsen Flame */}
            {isTriggered && reactionProgress < 0.98 && (
              <g filter="url(#flame-blur)" transform={`translate(0, ${flameOffset})`}>
                {/* Outer flame */}
                <path d="M 252 410 Q 270 290 288 410 Z" fill="#ef4444" opacity="0.35" />
                {/* Mid flame */}
                <path d="M 258 410 Q 270 315 282 410 Z" fill="#f97316" opacity="0.7" />
                {/* Inner flame */}
                <path d="M 263 410 Q 270 355 277 410 Z" fill="#06b6d4" opacity="0.85" />
                {/* Core */}
                <path d="M 266 410 Q 270 375 274 410 Z" fill="#ffffff" opacity="0.95" />
              </g>
            )}

            {/* Beaker Glass Body Outer */}
            <rect x={beakerX} y={beakerY} width={beakerW} height={beakerH} rx="8" fill="url(#beakerGlassGrad)" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
            {/* Beaker Glass Body Inner (Thickness) */}
            <rect x={beakerX + 2.5} y={beakerY + 2.5} width={beakerW - 5} height={beakerH - 5} rx="6" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />
            
            {/* Molten wax pool at bottom */}
            {reactionProgress > 0 && (
              <g clipPath="url(#beaker-clip-pc)">
                <path
                  d={`M ${beakerX - 10} ${beakerY + beakerH - 4 - (50 * reactionProgress)} Q ${beakerX + beakerW/2} ${beakerY + beakerH - 4 - (50 * reactionProgress) + 4} ${beakerX + beakerW + 10} ${beakerY + beakerH - 4 - (50 * reactionProgress)} L ${beakerX + beakerW + 10} ${beakerY + beakerH + 10} L ${beakerX - 10} ${beakerY + beakerH + 10} Z`}
                  fill="#fef08a"
                  opacity="0.8"
                />
                <path
                  d={`M ${beakerX + 2} ${beakerY + beakerH - 4 - (50 * reactionProgress)} Q ${beakerX + beakerW/2} ${beakerY + beakerH - 4 - (50 * reactionProgress) + 4} ${beakerX + beakerW - 2} ${beakerY + beakerH - 4 - (50 * reactionProgress)}`}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.85)"
                  strokeWidth="1.8"
                />
              </g>
            )}

            {/* Solid wax chunks melting */}
            {reactionProgress < 0.95 && (
              <g opacity={1.0 - reactionProgress * 0.9}>
                <rect x="180" y="400" width="30" height="30" rx="4" fill="#fef08a" stroke="#facc15" strokeWidth="1" />
                <rect x="220" y="405" width="25" height="25" rx="4" fill="#fef08a" stroke="#facc15" strokeWidth="1" />
                <rect x="260" y="395" width="35" height="30" rx="4" fill="#fef08a" stroke="#facc15" strokeWidth="1" />
                <rect x="310" y="400" width="28" height="28" rx="4" fill="#fef08a" stroke="#facc15" strokeWidth="1" />
              </g>
            )}

            {/* Reversibility Frozen Wax Layer */}
            {reversibilityChecked && (
              <g clipPath="url(#beaker-clip-pc)">
                <rect x={beakerX + 2} y={beakerY + beakerH - 53} width={beakerW - 4} height="50" fill="#fef08a" stroke="#facc15" strokeWidth="1" rx="4" />
                <line x1={beakerX + 2} y1={beakerY + beakerH - 53} x2={beakerX + beakerW - 2} y2={beakerY + beakerH - 53} stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
              </g>
            )}

            {/* Beaker sheen */}
            <rect x={beakerX + 3} y={beakerY + 3} width="20" height={beakerH - 6} fill="url(#glass-sheen)" rx="4" />
          </g>
        )}

        {/* ── CONFIG 2: FREEZING WATER ── */}
        {selectedProcess === "freezing-water" && (
          <g id="freezing-water-setup" filter="url(#shadow)">
            {/* Ice tub beaker outer */}
            <rect x="150" y="240" width="240" height="220" rx="10" fill="url(#beakerGlassGrad)" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
            {/* Ice tub inner wall */}
            <rect x="152.5" y="242.5" width="235" height="215" rx="8" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />
            
            {/* Ice cubes inside tub */}
            <g opacity="0.7">
              <rect x="160" y="380" width="40" height="40" rx="4" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="0.8" />
              <rect x="210" y="390" width="45" height="40" rx="4" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="0.8" />
              <rect x="260" y="370" width="40" height="40" rx="4" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="0.8" />
              <rect x="310" y="380" width="40" height="40" rx="4" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="0.8" />
              <rect x="180" y="340" width="40" height="40" rx="4" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="0.8" />
              <rect x="230" y="330" width="45" height="45" rx="4" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="0.8" />
              <rect x="290" y="340" width="40" height="40" rx="4" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="0.8" />
            </g>

            {/* Test tube dipped inside ice bath */}
            <g transform="translate(250, 180)">
              {/* Test tube glass outline outer */}
              <rect x="-16" y="0" width="32" height="200" rx="16" fill="url(#beakerGlassGrad)" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
              {/* Test tube inner wall */}
              <rect x="-14" y="2.5" width="28" height="195" rx="14" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />
              
              {/* Liquid / ice inside */}
              {reversibilityChecked ? (
                // Re-melted back to water
                <rect x="-14" y="60" width="28" height="125" rx="8" fill="#bae6fd" opacity="0.65" />
              ) : (
                <>
                  {/* Liquid water */}
                  {reactionProgress < 0.98 && (
                    <rect x="-14" y="60" width="28" height="125" rx="8" fill="#bae6fd" opacity="0.65" />
                  )}
                  {/* Freezing ice crystalline layer starting from bottom */}
                  {reactionProgress > 0 && (
                    <rect x="-14" y={185 - (125 * reactionProgress)} width="28" height={125 * reactionProgress} rx="8" fill="#ffffff" opacity="0.95" />
                  )}
                </>
              )}
            </g>

            {/* Glass sheen */}
            <rect x="153" y="243" width="20" height="214" fill="url(#glass-sheen)" rx="4" />
          </g>
        )}

        {/* ── CONFIG 3: DISSOLVING SUGAR ── */}
        {selectedProcess === "dissolving-sugar" && (
          <g id="dissolving-sugar-setup" filter="url(#shadow)">
            {/* Beaker Glass Body Outer */}
            <rect x={beakerX} y={beakerY} width={beakerW} height={beakerH} rx="8" fill="url(#beakerGlassGrad)" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
            {/* Beaker Glass Body Inner */}
            <rect x={beakerX + 2.5} y={beakerY + 2.5} width={beakerW - 5} height={beakerH - 5} rx="6" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />
            
            {/* Water liquid with curved meniscus */}
            <g clipPath="url(#beaker-clip-pc)">
              <path
                d={`M ${beakerX - 10} ${beakerY + 80} Q ${beakerX + beakerW/2} ${beakerY + 84} ${beakerX + beakerW + 10} ${beakerY + 80} L ${beakerX + beakerW + 10} ${beakerY + beakerH + 10} L ${beakerX - 10} ${beakerY + beakerH + 10} Z`}
                fill="#bae6fd"
                opacity="0.5"
              />
              <path
                d={`M ${beakerX + 2} ${beakerY + 80} Q ${beakerX + beakerW/2} ${beakerY + 84} ${beakerX + beakerW - 2} ${beakerY + 80}`}
                fill="none"
                stroke="rgba(255, 255, 255, 0.7)"
                strokeWidth="2"
              />
            </g>
            
            {/* Stirring rod (detailed glass rod) */}
            <g transform="rotate(15 260 80)">
              <rect x="259" y="80" width="12" height="200" rx="6" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
              <rect x="261" y="82" width="3" height="196" fill="rgba(255,255,255,0.5)" rx="1.5" />
            </g>

            {/* Sugar cube shrinking */}
            {reactionProgress < 0.99 && (
              <g transform={`translate(270, 410) scale(${1.0 - reactionProgress})`}>
                <rect x="-15" y="-15" width="30" height="30" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="-15" y1="-5" x2="15" y2="-5" stroke="#cbd5e1" strokeWidth="0.5" />
                <line x1="-5" y1="-15" x2="-5" y2="15" stroke="#cbd5e1" strokeWidth="0.5" />
              </g>
            )}

            {/* Reversibility crystallizing sugar at bottom */}
            {reversibilityChecked && (
              <g transform="translate(270, 428)">
                <circle cx="-15" cy="5" r="2.5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" />
                <circle cx="0" cy="4" r="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" />
                <circle cx="15" cy="6" r="2.5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" />
                <circle cx="-5" cy="7" r="3.5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" />
                <circle cx="10" cy="5" r="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" />
              </g>
            )}

            {/* Beaker sheen */}
            <rect x={beakerX + 3} y={beakerY + 3} width="20" height={beakerH - 6} fill="url(#glass-sheen)" rx="4" />
          </g>
        )}

        {/* ── CONFIG 4: BURNING PAPER ── */}
        {selectedProcess === "burning-paper" && (
          <g id="burning-paper-setup" filter="url(#shadow)">
            {/* Metal Tongs holding paper */}
            <path d="M 80 180 Q 200 120 220 170" fill="none" stroke="url(#metal-clamp)" strokeWidth="6" strokeLinecap="round" />
            <path d="M 80 180 Q 200 120 220 170" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />

            {/* Clay Dish to catch ash */}
            <path d="M 180 430 Q 270 470 360 430 Z" fill="url(#metal-clamp)" stroke="#1e293b" strokeWidth="1.5" />
            <ellipse cx="270" cy="430" rx="87" ry="12" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />

            {/* Paper Sheet being consumed */}
            {reactionProgress < 0.98 && (
              <g transform={`translate(220, 160) scale(${1.0 - reactionProgress * 0.9})`}>
                <rect x="0" y="0" width="90" height="120" fill="#f8fafc" stroke="#cbd5e1" rx="2" />
                <line x1="10" y1="20" x2="80" y2="20" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="10" y1="40" x2="80" y2="40" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="10" y1="60" x2="80" y2="60" stroke="#cbd5e1" strokeWidth="1" />
              </g>
            )}

            {/* Flames during reaction - Bunsen Style multi-layered */}
            {isTriggered && reactionProgress > 0.1 && reactionProgress < 0.98 && (
              <g filter="url(#flame-blur)" transform={`translate(${flameOffset * 2}, 0)`}>
                <path
                  d={`M ${225} ${260 - reactionProgress * 80} Q 260 ${140 - reactionProgress * 90} 295 ${260 - reactionProgress * 80} Z`}
                  fill="#ef4444"
                  opacity="0.4"
                />
                <path
                  d={`M ${235} ${260 - reactionProgress * 80} Q 260 ${165 - reactionProgress * 90} 285 ${260 - reactionProgress * 80} Z`}
                  fill="#f97316"
                  opacity="0.7"
                />
                <path
                  d={`M ${245} ${260 - reactionProgress * 80} Q 260 ${195 - reactionProgress * 90} 275 ${260 - reactionProgress * 80} Z`}
                  fill="#fbbf24"
                  opacity="0.9"
                />
              </g>
            )}

            {/* Ash pile at bottom */}
            {reactionProgress > 0.4 && (
              <path
                d={`M 230 432 Q 270 ${432 - reactionProgress * 25} 310 432 Z`}
                fill="#27272a"
                opacity={reactionProgress}
              />
            )}
          </g>
        )}

        {/* ── CONFIG 5: RUSTING IRON ── */}
        {selectedProcess === "rusting-iron" && (
          <g id="rusting-iron-setup" filter="url(#shadow)">
            {/* Beaker Glass Outer */}
            <rect x={beakerX} y={beakerY} width={beakerW} height={beakerH} rx="8" fill="url(#beakerGlassGrad)" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
            {/* Beaker Glass Inner */}
            <rect x={beakerX + 2.5} y={beakerY + 2.5} width={beakerW - 5} height={beakerH - 5} rx="6" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />

            {/* Moist environment indicator (droplets on beaker wall) */}
            <circle cx="160" cy="220" r="2.5" fill="#38bdf8" opacity="0.7" />
            <circle cx="163" cy="225" r="1.8" fill="#38bdf8" opacity="0.7" />
            <circle cx="370" cy="230" r="3" fill="#38bdf8" opacity="0.7" />
            <circle cx="374" cy="236" r="2" fill="#38bdf8" opacity="0.7" />

            {/* Steel Wool Pad changing color from gray to reddish brown */}
            <g transform="translate(200, 335)">
              {/* Layer 1: Gray steel wool */}
              <ellipse cx="70" cy="60" rx="60" ry="40" fill="url(#chrome-tube)" opacity={1.0 - reactionProgress} />
              {/* Layer 2: Reddish brown rust */}
              <ellipse cx="70" cy="60" rx="60" ry="40" fill="#a16207" opacity={reactionProgress} />
              {/* Wool texture lines */}
              <path d="M 20 60 Q 60 40 120 70 M 30 70 Q 70 50 110 50 M 40 40 Q 80 80 120 50" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="2.5" />
            </g>

            {/* Beaker sheen */}
            <rect x={beakerX + 3} y={beakerY + 3} width="20" height={beakerH - 6} fill="url(#glass-sheen)" rx="4" />
          </g>
        )}

        {/* ── CONFIG 6: NEUTRALIZATION ── */}
        {selectedProcess === "neutralization" && (
          <g id="neutralization-setup" filter="url(#shadow)">
            {/* Beaker Glass Outer */}
            <rect x={beakerX} y={beakerY} width={beakerW} height={beakerH} rx="8" fill="url(#beakerGlassGrad)" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
            {/* Beaker Glass Inner */}
            <rect x={beakerX + 2.5} y={beakerY + 2.5} width={beakerW - 5} height={beakerH - 5} rx="6" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />
            
            {/* Liquid solution with curved meniscus */}
            <g clipPath="url(#beaker-clip-pc)">
              <path
                d={`M ${beakerX - 10} ${beakerY + 90} Q ${beakerX + beakerW/2} ${beakerY + 94} ${beakerX + beakerW + 10} ${beakerY + 90} L ${beakerX + beakerW + 10} ${beakerY + beakerH + 10} L ${beakerX - 10} ${beakerY + beakerH + 10} Z`}
                fill="#bae6fd"
                opacity="0.65"
              />
              <path
                d={`M ${beakerX + 2} ${beakerY + 90} Q ${beakerX + beakerW/2} ${beakerY + 94} ${beakerX + beakerW - 2} ${beakerY + 90}`}
                fill="none"
                stroke="rgba(255, 255, 255, 0.7)"
                strokeWidth="2.2"
              />
            </g>

            {/* Thermometer dipped in beaker */}
            <g transform="translate(330, 100)">
              {/* Glass Tube body outer */}
              <rect x="0" y="0" width="10" height="260" rx="5" fill="rgba(255,255,255,0.4)" stroke="rgba(255,255,255,0.75)" strokeWidth="1.2" />
              <rect x="2" y="2" width="6" height="256" rx="3" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
              {/* Temperature level indicator */}
              <rect x="3.5" y={220 - ((temperature - 10) / 90) * 180} width="3" height={245 - (220 - ((temperature - 10) / 90) * 180)} fill="#ef4444" rx="1.5" />
              <circle cx="5" cy="245" r="7.5" fill="#ef4444" stroke="#fca5a5" strokeWidth="0.8" />
            </g>

            {/* Exothermic vapor lines rising when temperature increases */}
            {isTriggered && temperature > 35 && (
              <g stroke="#e2e8f0" strokeWidth="1.5" fill="none" opacity="0.6">
                <path d="M 180 230 Q 185 210 180 190" strokeLinecap="round" />
                <path d="M 230 220 Q 235 200 230 180" strokeLinecap="round" />
                <path d="M 280 230 Q 285 210 280 190" strokeLinecap="round" />
              </g>
            )}

            {/* Beaker sheen */}
            <rect x={beakerX + 3} y={beakerY + 3} width="20" height={beakerH - 6} fill="url(#glass-sheen)" rx="4" />
          </g>
        )}
      </svg>

      {/* ── LIVE CALCULATIONS OVERLAY ── */}
      <div
        className="absolute top-4 left-4 bg-slate-900/90 text-slate-100 rounded-xl p-4 border border-slate-700/80 shadow-2xl font-mono text-[11px] space-y-2.5 backdrop-blur-md w-[220px]"
      >
        <div className="text-amber-400 font-extrabold text-[12px] border-b border-slate-700 pb-1.5 flex justify-between items-center">
          <span>⚙️ State & Bonds</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">Enthalpy</span>
        </div>
        {selectedProcess ? (
          <div className="space-y-1.5">
            <p className="flex justify-between">
              <span className="text-slate-400">Change:</span>
              <span className="font-bold text-white capitalize">{processType}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">Temp (T):</span>
              <span className="font-bold text-white">{temperature.toFixed(1)} °C</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">Progress:</span>
              <span className="font-bold text-sky-400">{(reactionProgress * 100).toFixed(0)}%</span>
            </p>
            <p className="text-[10px] text-yellow-500 font-medium leading-normal border-t border-slate-800/80 pt-1.5">
              Heat: {heatLabel}
            </p>
            <p className="text-[9.5px] text-slate-500 italic mt-0.5 leading-normal">
              {entropyLabel}
            </p>
          </div>
        ) : (
          <p className="text-slate-500 italic">Select a change process from the control cabinet.</p>
        )}
      </div>
    </div>
  );
}
