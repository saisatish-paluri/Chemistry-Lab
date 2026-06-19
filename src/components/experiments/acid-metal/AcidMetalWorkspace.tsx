"use client";

import { useEffect, useState, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AcidMetalState } from "@/lib/engine/types";

interface Props {
  state: AcidMetalState;
}

const W = 540;
const H = 600;

export default function AcidMetalWorkspace({ state }: Props) {
  const {
    selectedMetal,
    metalMass,
    particleSize,
    selectedAcid,
    acidVolume,
    acidConcentration,
    temperature,
    isReacting,
    metalLeft,
    gasVolumeCollected,
    reactionRate,
    popTestTriggered,
    popTestSuccess,
  } = state;

  // Render bubbles inside the flask
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number; r: number; speed: number }[]>([]);

  useEffect(() => {
    if (!isReacting || reactionRate <= 0.005) {
      setBubbles([]);
      return;
    }
    // Spawn bubbles depending on reaction rate
    const interval = setInterval(() => {
      startTransition(() => {
        setBubbles(prev => {
          // Cap bubble counts
          const maxCount = Math.round(5 + reactionRate * 35);
          const next = prev.filter(b => b.y > 330).map(b => ({ ...b, y: b.y - b.speed }));
          if (next.length < maxCount) {
            next.push({
              id: Math.random(),
              x: 140 + Math.random() * 80,
              y: 470,
              r: 2.2 + Math.random() * 2.8,
              speed: 1.5 + Math.random() * 2,
            });
          }
          return next;
        });
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isReacting, reactionRate]);

  // Geometry
  // Flask:
  const flaskX = 180;
  const flaskY = 280;
  const flaskW = 160;
  const flaskH = 200;

  // Acid liquid height
  const liquidFill = acidVolume > 0 ? 0.55 : 0;
  const liquidH = 100 * liquidFill;
  const liquidY = flaskY + flaskH - liquidH - 10;

  // Gas collection syringe: horizontal alignment at top right
  const syrX = 350;
  const syrY = 140;
  const syrW = 160;
  const syrH = 36;
  
  // Plunger position: 0 mL is at x = syrX, 100 mL is at x = syrX + syrW
  const plungerX = syrX + (gasVolumeCollected / 100) * syrW;

  return (
    <div style={{ width: "100%", height: "auto", maxHeight: "100%", aspectRatio: "540/600" }}>
      <svg viewBox="0 0 540 600" style={{ width: "100%", height: "100%" }}>
        <defs>
          <pattern id="am-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.75" fill="rgba(148,163,184,0.06)" />
          </pattern>
          <linearGradient id="am-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#eff6ff" />
          </linearGradient>
          <linearGradient id="am-bench" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="3%" stopColor="#e2e8f0" />
            <stop offset="10%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="am-acid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(191, 219, 254, 0.2)" />
            <stop offset="70%" stopColor="rgba(147, 197, 253, 0.45)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.65)" />
          </linearGradient>
          <linearGradient id="glass-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.65)" />
            <stop offset="10%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="50%" stopColor="rgba(240,253,250,0.03)" />
            <stop offset="85%" stopColor="rgba(240,253,250,0.12)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.4)" />
          </linearGradient>
          <linearGradient id="syr-glass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
            <stop offset="40%" stopColor="rgba(248,250,252,0.08)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.35)" />
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
          <linearGradient id="stopper-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="50%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <filter id="shadow" x="-10%" y="-10%" width="125%" height="125%">
            <feDropShadow dx="3" dy="12" stdDeviation="6" floodColor="#020617" floodOpacity="0.45" />
          </filter>
          <filter id="pop-glow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <clipPath id="flask-clip">
            <path d="M 237 310 L 222 370 L 143 468 Q 143 479 155 479 L 305 479 Q 317 479 317 468 L 238 370 L 223 310 Z" />
          </clipPath>
        </defs>

        {/* Wall & Bench */}
        <rect width={W} height={H} fill="url(#am-wall)" />
        <rect width={W} height={H} fill="url(#am-dots)" opacity="0.4" />
        <rect x="0" y={H-140} width={W} height="140" fill="url(#am-bench)" />
        <rect x="0" y={H-140} width={W} height="3" fill="rgba(255,255,255,0.18)" />

        {/* Retort Stand (Grounded behind the setup) */}
        <g opacity="0.85">
          {/* Base */}
          <rect x="270" y="450" width="130" height="15" rx="2" fill="url(#metal-clamp)" stroke="#1e293b" strokeWidth="1" filter="url(#shadow)" />
          {/* Rod */}
          <rect x="330" y="100" width="8" height="360" fill="url(#chrome-tube)" stroke="#334155" strokeWidth="0.5" />
          {/* Bosshead / Clamps */}
          <rect x="324" y="145" width="20" height="12" rx="1" fill="url(#metal-clamp)" stroke="#1e293b" />
          <rect x="300" y="149" width="25" height="4" fill="url(#metal-clamp)" />
          {/* Clamp holding syringe */}
          <path d="M 290 135 C 290 135, 302 142, 302 153 C 302 164, 290 171, 290 171" fill="none" stroke="url(#metal-clamp)" strokeWidth="3" />
        </g>

        {/* ─── CONNECTING TUBING (flask to syringe) ─── */}
        <g>
          <path
            d={`M 230 230 C 230 150, 310 150, ${syrX - 8} 158`}
            fill="none"
            stroke="#64748b"
            strokeWidth="5.5"
            strokeLinecap="round"
            opacity="0.85"
          />
          {/* Inner core line of tubing */}
          <path
            d={`M 230 230 C 230 150, 310 150, ${syrX - 8} 158`}
            fill="none"
            stroke={isReacting ? "#e0f2fe" : "rgba(255,255,255,0.15)"}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* ─── REACTION FLASK ─── */}
        <g filter="url(#shadow)">
          {/* Flask glass outer */}
          <path
            d="M 219 248 L 241 248 L 241 310 L 321 450 Q 331 471 310 471 L 150 471 Q 129 471 139 450 L 219 310 Z"
            fill="url(#glass-grad)"
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Inner glass wall for thickness */}
          <path
            d="M 221 251 L 239 251 L 239 308 L 318 448 Q 327 468 308 468 L 152 468 Q 133 468 142 448 L 221 308 Z"
            fill="none"
            stroke="rgba(255, 255, 255, 0.22)"
            strokeWidth="1.2"
          />
          <ellipse cx="230" cy="248" rx="11" ry="2" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1" />

          {/* Acid Liquid Fill */}
          {acidVolume > 0 && (
            <g clipPath="url(#flask-clip)">
              <path
                d={`M 120 ${liquidY} Q 230 ${liquidY + 5} 340 ${liquidY} L 340 480 L 120 480 Z`}
                fill="url(#am-acid)"
              />
              {/* Meniscus curve highlight */}
              <path
                d={`M 120 ${liquidY} Q 230 ${liquidY + 5} 340 ${liquidY}`}
                fill="none"
                stroke="rgba(255, 255, 255, 0.65)"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Metal pieces dissolving at bottom */}
          {selectedMetal && metalLeft > 0 && (
            <g>
              {selectedMetal === "mg" && (
                <path d="M 170 462 Q 200 454 230 464 Q 260 457 290 462" fill="none" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
              )}
              {selectedMetal === "zn" && (
                <g fill="url(#metal-clamp)" stroke="#1e293b" strokeWidth="0.5">
                  <circle cx="180" cy="464" r="5" />
                  <circle cx="180" cy="464" r="3" fill="rgba(255,255,255,0.3)" stroke="none" />
                  <circle cx="210" cy="466" r="4.5" />
                  <circle cx="210" cy="466" r="2.5" fill="rgba(255,255,255,0.3)" stroke="none" />
                  <circle cx="240" cy="463" r="6" />
                  <circle cx="240" cy="463" r="3.5" fill="rgba(255,255,255,0.3)" stroke="none" />
                  <circle cx="270" cy="465" r="5.2" />
                  <circle cx="270" cy="465" r="3" fill="rgba(255,255,255,0.3)" stroke="none" />
                </g>
              )}
              {selectedMetal === "fe" && (
                <g fill="#475569" opacity="0.95">
                  <ellipse cx="230" cy="465" rx="55" ry="5" />
                </g>
              )}
              {selectedMetal === "cu" && (
                <g>
                  <path d="M 180 464 Q 225 450 270 464" fill="none" stroke="#ea580c" strokeWidth="2.5" />
                  <path d="M 180 464 Q 225 450 270 464" fill="none" stroke="#ffedd5" strokeWidth="0.8" opacity="0.6" />
                </g>
              )}
            </g>
          )}

          {/* Rising bubbles from react */}
          {bubbles.map(b => (
            <circle key={b.id} cx={b.x} cy={b.y} r={b.r} fill="#ffffff" opacity="0.85" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
          ))}

          {/* Rubber Stopper bung with hole */}
          {isReacting && (
            <polygon points="218,248 242,248 238,266 222,266" fill="url(#stopper-grad)" stroke="#1e293b" strokeWidth="1" />
          )}

          {/* Thermometer */}
          {acidVolume > 0 && (
            <g>
              {/* Outer glass body */}
              <rect x="226" y="200" width="8" height="230" fill="rgba(255,255,255,0.4)" stroke="rgba(255,255,255,0.7)" strokeWidth="1" rx="4" />
              {/* Scale marks */}
              <line x1="226" y1="230" x2="230" y2="230" stroke="#475569" strokeWidth="0.8" />
              <line x1="226" y1="260" x2="230" y2="260" stroke="#475569" strokeWidth="0.8" />
              <line x1="226" y1="290" x2="230" y2="290" stroke="#475569" strokeWidth="0.8" />
              <line x1="226" y1="320" x2="230" y2="320" stroke="#475569" strokeWidth="0.8" />
              <line x1="226" y1="350" x2="230" y2="350" stroke="#475569" strokeWidth="0.8" />
              <line x1="226" y1="380" x2="230" y2="380" stroke="#475569" strokeWidth="0.8" />
              <line x1="226" y1="410" x2="230" y2="410" stroke="#475569" strokeWidth="0.8" />
              {/* Red liquid thread */}
              <line x1="230" y1="215" x2="230" y2="424" stroke="#ef4444" strokeWidth="1.5" />
              <circle cx="230" cy="424" r="5.5" fill="#ef4444" stroke="#fca5a5" strokeWidth="0.8" />
            </g>
          )}
        </g>

        {/* ─── GAS COLLECTION SYRINGE ─── */}
        <g filter="url(#shadow)">
          {/* Glass Barrel */}
          <rect x={syrX} y={syrY} width={syrW} height={syrH} rx="5" fill="rgba(241,245,249,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          {/* Glass sheen */}
          <rect x={syrX} y={syrY + 2} width={syrW} height={syrH - 4} fill="url(#syr-glass)" />

          {/* Plunger Shaft & Head */}
          {/* Shaft rod */}
          <rect x={plungerX} y={syrY + syrH/2 - 4} width={syrW * 0.8} height="8" fill="url(#chrome-tube)" stroke="#475569" strokeWidth="0.5" />
          {/* Plunger rubber head stopper */}
          <rect x={plungerX - 8} y={syrY + 2} width="10" height={syrH - 4} rx="2" fill="url(#stopper-grad)" />

          {/* Graduation lines (0 to 100 mL) */}
          {[0, 20, 40, 60, 80, 100].map((v) => {
            const markX = syrX + (v / 100) * syrW;
            return (
              <g key={v}>
                <line x1={markX} y1={syrY} x2={markX} y2={syrY + 9} stroke="#f8fafc" strokeWidth="1" opacity="0.75" />
                <line x1={markX} y1={syrY} x2={markX} y2={syrY + 9} stroke="#1e293b" strokeWidth="1" opacity="0.4" />
                <text x={markX} y={syrY - 4} fontSize="8.5" textAnchor="middle" fill="#cbd5e1" fontWeight="bold">
                  {v}
                </text>
              </g>
            );
          })}

          {/* Gas syringe tip nozzle */}
          <path d={`M ${syrX - 8} ${syrY + syrH/2 - 4} L ${syrX} ${syrY + syrH/2 - 6} L ${syrX} ${syrY + syrH/2 + 6} L ${syrX - 8} ${syrY + syrH/2 + 4} Z`} fill="url(#metal-clamp)" />

          {/* Gas label */}
          <text x={syrX + syrW/2} y={syrY + syrH + 15} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#cbd5e1" filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.8))">
            H₂ Gas Volume: {gasVolumeCollected.toFixed(1)} mL
          </text>
        </g>

        {/* ─── POP TEST BURST SPARK EFFECT ─── */}
        <AnimatePresence>
          {popTestTriggered && popTestSuccess && (
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              filter="url(#pop-glow)"
              transform={`translate(${syrX - 15}, ${syrY + syrH/2})`}
            >
              {/* Explosion burst star shape */}
              <path
                d="M 0,-30 L 8,-10 L 28,-14 L 14,4 L 26,24 L 5,14 L -8,32 L -8,10 L -28,8 L -10,-4 Z"
                fill="#fbbf24"
                stroke="#f59e0b"
                strokeWidth="2"
              />
              <text x="35" y="-35" fontSize="18" fontWeight="black" fill="#ef4444" fontStyle="italic">
                *POP!*
              </text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* Calculations overlay - Sleek Digital HUD */}
        <g transform="translate(15, 60)" filter="url(#shadow)">
          <rect x="0" y="0" width="230" height="98" rx="8" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(251, 191, 36, 0.3)" strokeWidth="1.5" />
          <rect x="2" y="2" width="226" height="94" rx="6" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
          <text x="15" y="22" fontSize="11" fontWeight="bold" fill="#fbbf24" letterSpacing="0.5">ARRHENIUS REACTION RATE</text>
          <text x="15" y="38" fontSize="9.5" fill="#94a3b8" fontFamily="monospace">
            Rate = k·A·[Acid]^1.2 · e^(-Ea/RT)
          </text>
          <text x="15" y="54" fontSize="10" fill="#e2e8f0">
            Current Rate: <tspan fontWeight="bold" fill="#ef4444">{reactionRate.toFixed(4)} mol/s</tspan>
          </text>
          <line x1="15" y1="62" x2="215" y2="62" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <text x="15" y="76" fontSize="10" fill="#cbd5e1">
            Hydrogen Moles: <tspan fill="#38bdf8" fontWeight="bold">{(gasVolumeCollected / 24400).toFixed(4)} mol</tspan>
          </text>
          <text x="15" y="89" fontSize="10" fill="#a5f3fc" fontWeight="bold">
            Flask Temperature: {temperature.toFixed(1)} °C
          </text>
        </g>
      </svg>
    </div>
  );
}
