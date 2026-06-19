"use client";

import { useEffect, useState, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AcidCarbonateState } from "@/lib/engine/types";

interface Props {
  state: AcidCarbonateState;
}

const W = 540;
const H = 600;

export default function AcidCarbonateWorkspace({ state }: Props) {
  const {
    selectedCarbonate,
    carbonateMass,
    selectedAcid,
    acidVolume,
    acidConcentration,
    isReacting,
    stopperSealed,
    carbonateLeft,
    gasVolumeCollected,
    reactionRate,
    limeWaterMilky,
    limeWaterTestActive,
  } = state;

  // Effervescence bubbles inside the flask
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number; r: number; speed: number }[]>([]);
  // Bubbles in the limewater beaker
  const [limeBubbles, setLimeBubbles] = useState<{ id: number; x: number; y: number; r: number; speed: number }[]>([]);

  useEffect(() => {
    if (!isReacting || reactionRate <= 0.005) {
      setBubbles([]);
      setLimeBubbles([]);
      return;
    }

    const interval = setInterval(() => {
      startTransition(() => {
        // Flask reaction bubbles
        setBubbles(prev => {
          const maxCount = Math.round(5 + reactionRate * 35);
          const next = prev.filter(b => b.y > 330).map(b => ({ ...b, y: b.y - b.speed }));
          if (next.length < maxCount) {
            next.push({
              id: Math.random(),
              x: 140 + Math.random() * 80,
              y: 470,
              r: 2.0 + Math.random() * 3.0,
              speed: 2.0 + Math.random() * 2,
            });
          }
          return next;
        });

        // Limewater bubbles if routed and stopper is sealed
        if (limeWaterTestActive && stopperSealed) {
          setLimeBubbles(prev => {
            const maxCount = 8;
            const next = prev.filter(b => b.y > 400).map(b => ({ ...b, y: b.y - b.speed }));
            if (next.length < maxCount) {
              next.push({
                id: Math.random(),
                x: 395 + Math.random() * 20,
                y: 470,
                r: 1.5 + Math.random() * 2.0,
                speed: 1.2 + Math.random() * 1.5,
              });
            }
            return next;
          });
        } else {
          setLimeBubbles([]);
        }
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isReacting, reactionRate, limeWaterTestActive, stopperSealed]);

  // Geometry
  const flaskX = 140;
  const flaskY = 280;
  const flaskW = 160;
  const flaskH = 200;

  // Acid liquid height
  const liquidFill = acidVolume > 0 ? 0.55 : 0;
  const liquidH = 100 * liquidFill;
  const liquidY = flaskY + flaskH - liquidH - 10;

  // Syringe
  const syrX = 320;
  const syrY = 140;
  const syrW = 160;
  const syrH = 36;
  const plungerX = syrX + (gasVolumeCollected / 100) * syrW;

  // Limewater beaker
  const lwX = 370;
  const lwY = 380;
  const lwW = 90;
  const lwH = 110;

  // Limewater turbidity color
  // Clear at first -> milky white -> clear again when CaCO3 redissolves
  let limeWaterColor = "rgba(186, 230, 253, 0.25)"; // clear light blueish water
  if (limeWaterMilky) {
    limeWaterColor = "rgba(255, 255, 255, 0.85)"; // milky white CaCO3 precipitate
  } else if (gasVolumeCollected > 48) {
    limeWaterColor = "rgba(238, 242, 246, 0.35)"; // clear calcium bicarbonate
  }

  return (
    <div style={{ width: "100%", height: "auto", maxHeight: "100%", aspectRatio: "540/600" }}>
      <svg viewBox="0 0 540 600" style={{ width: "100%", height: "100%" }}>
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
          <linearGradient id="ac-acid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(204, 251, 241, 0.25)" />
            <stop offset="70%" stopColor="rgba(45, 212, 191, 0.45)" />
            <stop offset="100%" stopColor="rgba(13, 148, 136, 0.65)" />
          </linearGradient>
          <linearGradient id="glass-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.65)" />
            <stop offset="10%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="50%" stopColor="rgba(240,253,250,0.03)" />
            <stop offset="85%" stopColor="rgba(240,253,250,0.12)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.4)" />
          </linearGradient>
          <linearGradient id="syr-glass-ac" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
            <stop offset="40%" stopColor="rgba(240,253,250,0.08)" />
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
          <radialGradient id="powder-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="80%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </radialGradient>
          <filter id="shadow" x="-10%" y="-10%" width="125%" height="125%">
            <feDropShadow dx="3" dy="12" stdDeviation="6" floodColor="#020617" floodOpacity="0.45" />
          </filter>
          <filter id="glow-filter" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" />
          </filter>
          <clipPath id="flask-clip-ac">
            <path d="M 197 310 L 182 370 L 103 468 Q 103 479 115 479 L 265 479 Q 277 479 277 468 L 198 370 L 183 310 Z" />
          </clipPath>
        </defs>

        {/* Wall & Bench */}
        <rect width={W} height={H} fill="url(#ac-wall)" />
        <rect width={W} height={H} fill="url(#ac-dots)" opacity="0.4" />
        <rect x="0" y={H-140} width={W} height="140" fill="url(#ac-bench)" />
        {/* Sleek metallic strip edge for laboratory tabletop */}
        <rect x="0" y={H-140} width={W} height="3" fill="rgba(255,255,255,0.18)" />

        {/* Retort Stand (Grounded behind the setup) */}
        <g opacity="0.85">
          {/* Base */}
          <rect x="230" y="450" width="130" height="15" rx="2" fill="url(#metal-clamp)" stroke="#1e293b" strokeWidth="1" filter="url(#shadow)" />
          {/* Rod */}
          <rect x="290" y="100" width="8" height="360" fill="url(#chrome-tube)" stroke="#334155" strokeWidth="0.5" />
          {/* Bosshead / Clamps */}
          <rect x="284" y="145" width="20" height="12" rx="1" fill="url(#metal-clamp)" stroke="#1e293b" />
          <rect x="260" y="149" width="25" height="4" fill="url(#metal-clamp)" />
          {/* Clamp holding syringe */}
          <path d="M 250 135 C 250 135, 262 142, 262 153 C 262 164, 250 171, 250 171" fill="none" stroke="url(#metal-clamp)" strokeWidth="3" />
        </g>

        {/* ─── STICK TUBING (Syringe Connection) ─── */}
        {stopperSealed && (
          <g>
            <path
              d={`M 190 230 C 190 150, 270 150, ${syrX - 8} 158`}
              fill="none"
              stroke="#64748b"
              strokeWidth="5"
              opacity="0.85"
            />
            <path
              d={`M 190 230 C 190 150, 270 150, ${syrX - 8} 158`}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="1.5"
              opacity="0.9"
            />
          </g>
        )}

        {/* ─── LIMEWATER DELIVERY TUBE ─── */}
        {limeWaterTestActive && (
          <g>
            <path
              d="M 190 220 L 190 170 L 390 170 L 390 450"
              fill="none"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            {/* Inner gas pathway core */}
            <path
              d="M 190 220 L 190 170 L 390 170 L 390 450"
              fill="none"
              stroke={isReacting && stopperSealed ? "#a5f3fc" : "rgba(255,255,255,0.15)"}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Specular highlight on glass tube */}
            <path
              d="M 189 220 L 189 171 L 389 171 L 389 450"
              fill="none"
              stroke="rgba(255,255,255,0.8)"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* ─── REACTION FLASK ─── */}
        <g filter="url(#shadow)">
          {/* Glass flask outer */}
          <path
            d="M 179 248 L 201 248 L 201 310 L 281 450 Q 291 471 270 471 L 110 471 Q 89 471 99 450 L 179 310 Z"
            fill="url(#glass-grad)"
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="1.5"
          />
          {/* Inner glass wall for thickness */}
          <path
            d="M 181 251 L 199 251 L 199 308 L 278 448 Q 287 468 268 468 L 112 468 Q 93 468 102 448 L 181 308 Z"
            fill="none"
            stroke="rgba(255, 255, 255, 0.22)"
            strokeWidth="1.2"
          />
          <ellipse cx="190" cy="248" rx="11" ry="2" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1" />

          {/* Acid Liquid Fill */}
          {acidVolume > 0 && (
            <g clipPath="url(#flask-clip-ac)">
              <path
                d={`M 80 ${liquidY} Q 190 ${liquidY + 5} 300 ${liquidY} L 300 480 L 80 480 Z`}
                fill="url(#ac-acid)"
              />
              {/* Meniscus curve highlight */}
              <path
                d={`M 80 ${liquidY} Q 190 ${liquidY + 5} 300 ${liquidY}`}
                fill="none"
                stroke="rgba(255, 255, 255, 0.65)"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Carbonate pieces at bottom */}
          {selectedCarbonate && carbonateLeft > 0 && (
            <g>
              {selectedCarbonate === "marble-chips" && (
                <g fill="url(#metal-clamp)" stroke="#334155" strokeWidth="0.6">
                  <polygon points="130,466 142,455 150,466" />
                  <polygon points="130,466 137,462 142,455" fill="rgba(255,255,255,0.3)" stroke="none" />
                  <polygon points="152,468 165,458 172,468" />
                  <polygon points="152,468 160,463 165,458" fill="rgba(255,255,255,0.3)" stroke="none" />
                  <polygon points="175,466 188,454 198,466" />
                  <polygon points="175,466 182,460 188,454" fill="rgba(255,255,255,0.3)" stroke="none" />
                  <polygon points="210,467 225,456 235,467" />
                  <polygon points="210,467 218,462 225,456" fill="rgba(255,255,255,0.3)" stroke="none" />
                </g>
              )}
              {selectedCarbonate === "caco3-powder" && (
                <g fill="url(#powder-grad)" opacity="0.95">
                  <ellipse cx="190" cy="465" rx="55" ry="5.5" />
                </g>
              )}
              {selectedCarbonate === "na2co3" && (
                <g fill="#ffffff" opacity="0.9">
                  <ellipse cx="190" cy="465" rx="40" ry="4" />
                </g>
              )}
            </g>
          )}

          {/* Rising bubbles from effervescence */}
          {bubbles.map(b => (
            <circle key={b.id} cx={b.x} cy={b.y} r={b.r} fill="#ffffff" opacity="0.85" />
          ))}

          {/* Stopper Connection Bung (Tilted if unsealed/leaking!) */}
          {isReacting && (
            <g>
              {stopperSealed ? (
                // Sealed bung
                <polygon points="178,248 202,248 198,266 182,266" fill="url(#stopper-grad)" stroke="#1e293b" strokeWidth="1" />
              ) : (
                // Unsealed tilted stopper (Gas leak!)
                <g>
                  <polygon points="173,242 197,246 193,264 179,259" fill="url(#stopper-grad)" stroke="#1e293b" strokeWidth="1" opacity="0.9" />
                  {/* Gas leaking vapor particle clouds */}
                  <circle cx="210" cy="245" r="6" fill="#cbd5e1" opacity="0.45" filter="url(#glow-filter)" />
                  <circle cx="218" cy="238" r="9" fill="#cbd5e1" opacity="0.3" filter="url(#glow-filter)" />
                  <circle cx="228" cy="232" r="12" fill="#e2e8f0" opacity="0.15" filter="url(#glow-filter)" />
                </g>
              )}
            </g>
          )}
        </g>

        {/* ─── GAS SYRINGE ─── */}
        <g filter="url(#shadow)">
          <rect x={syrX} y={syrY} width={syrW} height={syrH} rx="5" fill="rgba(241,245,249,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <rect x={syrX} y={syrY + 2} width={syrW} height={syrH - 4} fill="url(#syr-glass-ac)" />

          {/* Plunger rod (metallic) */}
          <rect x={plungerX} y={syrY + syrH/2 - 4} width={syrW * 0.8} height="8" fill="url(#chrome-tube)" stroke="#475569" strokeWidth="0.5" />
          {/* Plunger rubber seal */}
          <rect x={plungerX - 8} y={syrY + 2} width="10" height={syrH - 4} rx="2" fill="url(#stopper-grad)" />

          {/* Syringe graduations */}
          {[0, 20, 40, 60, 80, 100].map((v) => {
            const markX = syrX + (v / 100) * syrW;
            return (
              <g key={v}>
                <line x1={markX} y1={syrY} x2={markX} y2={syrY + 9} stroke="#f8fafc" strokeWidth="1" opacity="0.75" />
                <line x1={markX} y1={syrY} x2={markX} y2={syrY + 9} stroke="#1e293b" strokeWidth="1" opacity="0.4" />
              </g>
            );
          })}
          <path d={`M ${syrX - 8} ${syrY + syrH/2 - 4} L ${syrX} ${syrY + syrH/2 - 6} L ${syrX} ${syrY + syrH/2 + 6} L ${syrX - 8} ${syrY + syrH/2 + 4} Z`} fill="url(#metal-clamp)" />

          <text x={syrX + syrW/2} y={syrY + syrH + 15} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#cbd5e1" filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.8))">
            Syringe: {gasVolumeCollected.toFixed(1)} mL CO₂
          </text>
        </g>

        {/* ─── LIMEWATER FLASK / BEAKER (Far Right) ─── */}
        <g filter="url(#shadow)">
          {/* Beaker Outer Frame */}
          <path
            d={`M ${lwX} ${lwY} L ${lwX} ${lwY + lwH - 10} Q ${lwX} ${lwY + lwH} ${lwX + 10} ${lwY + lwH} L ${lwX + lwW - 10} ${lwY + lwH} Q ${lwX + lwW} ${lwY + lwH} ${lwX + lwW} ${lwY + lwH - 10} L ${lwX + lwW} ${lwY}`}
            fill="url(#glass-grad)"
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="1.5"
          />
          {/* Beaker Inner Rim Line for thickness */}
          <path
            d={`M ${lwX + 2} ${lwY + 2} L ${lwX + 2} ${lwY + lwH - 11} Q ${lwX + 2} ${lwY + lwH - 2} ${lwX + 11} ${lwY + lwH - 2} L ${lwX + lwW - 11} ${lwY + lwH - 2} Q ${lwX + lwW - 2} ${lwY + lwH - 2} ${lwX + lwW - 2} ${lwY + lwH - 11} L ${lwX + lwW - 2} ${lwY + 2}`}
            fill="none"
            stroke="rgba(255, 255, 255, 0.18)"
            strokeWidth="1"
          />
          <ellipse cx={lwX + lwW/2} cy={lwY} rx={lwW/2 + 2} ry="3.5" fill="none" stroke="rgba(255, 255, 255, 0.75)" strokeWidth="1.5" />

          {/* Graduations */}
          <line x1={lwX + 12} y1={lwY + 30} x2={lwX + 22} y2={lwY + 30} stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <line x1={lwX + 12} y1={lwY + 50} x2={lwX + 19} y2={lwY + 50} stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <line x1={lwX + 12} y1={lwY + 70} x2={lwX + 22} y2={lwY + 70} stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <line x1={lwX + 12} y1={lwY + 90} x2={lwX + 19} y2={lwY + 90} stroke="rgba(255,255,255,0.4)" strokeWidth="1" />

          {/* Limewater liquid with dynamic milky-white precipitation transition */}
          <g>
            <path
              d={`M ${lwX + 2.5} ${lwY + 30} Q ${lwX + lwW/2} ${lwY + 34} ${lwX + lwW - 2.5} ${lwY + 30} L ${lwX + lwW - 2.5} ${lwY + lwH - 8} Q ${lwX + lwW - 2.5} ${lwY + lwH - 2.5} ${lwX + lwW - 8} ${lwY + lwH - 2.5} L ${lwX + 8} ${lwY + lwH - 2.5} Q ${lwX + 2.5} ${lwY + lwH - 2.5} ${lwX + 2.5} ${lwY + lwH - 8} Z`}
              fill={limeWaterColor}
              className="transition-all duration-700"
            />
            {/* Meniscus curve highlight */}
            <path
              d={`M ${lwX + 2.5} ${lwY + 30} Q ${lwX + lwW/2} ${lwY + 34} ${lwX + lwW - 2.5} ${lwY + 30}`}
              fill="none"
              stroke="rgba(255, 255, 255, 0.7)"
              strokeWidth="2"
            />
          </g>

          {/* Bubbles in limewater */}
          {limeBubbles.map(b => (
            <circle key={b.id} cx={b.x} cy={b.y} r={b.r} fill="#ffffff" opacity="0.8" />
          ))}

          <text x={lwX + lwW/2} y={lwY + lwH + 15} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#cbd5e1">
            Limewater Ca(OH)₂
          </text>
        </g>

        {/* Calculations display overlay - Sleek Digital HUD */}
        <g transform="translate(15, 60)" filter="url(#shadow)">
          <rect x="0" y="0" width="230" height="98" rx="8" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1.5" />
          <rect x="2" y="2" width="226" height="94" rx="6" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
          <text x="15" y="22" fontSize="11" fontWeight="bold" fill="#10b981" letterSpacing="0.5">CARBONATE STOICHIOMETRY</text>
          <text x="15" y="38" fontSize="9.5" fill="#94a3b8" fontFamily="monospace">
            CaCO₃ + 2HCl → CaCl₂ + CO₂ + H₂O
          </text>
          <text x="15" y="54" fontSize="10" fill="#e2e8f0">
            Carbonate Reacted: <tspan fill="#38bdf8" fontWeight="bold">{(carbonateMass - carbonateLeft).toFixed(2)} g</tspan>
          </text>
          <line x1="15" y1="62" x2="215" y2="62" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <text x="15" y="76" fontSize="10.5" fill="#a5f3fc" fontWeight="bold">
            CO₂ yielded: {(gasVolumeCollected).toFixed(1)} mL
          </text>
          <text x="15" y="89" fontSize="9" fill="#94a3b8" fontFamily="monospace">
            Solubility check: {limeWaterMilky ? "Milky CaCO₃↓" : gasVolumeCollected > 48 ? "Redissolving..." : "Clear"}
          </text>
        </g>
      </svg>
    </div>
  );
}
