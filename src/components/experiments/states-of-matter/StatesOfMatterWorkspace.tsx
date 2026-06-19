"use client";

import { useEffect, useState, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { StatesOfMatterState } from "@/lib/engine/types";
import { getPhaseTransitionPoints } from "@/lib/engine/states-of-matter-engine";

interface Props {
  state: StatesOfMatterState;
}

const W = 540;
const H = 600;

export default function StatesOfMatterWorkspace({ state }: Props) {
  const {
    selectedSubstance,
    temperature,
    phase,
    heatingPower,
    isHeating,
    isCooling,
    latentHeatProgress,
    altitude,
    pressure,
    splatterTriggered,
    thermometerEyeLevelOffset,
  } = state;

  const [steamBubbles, setSteamBubbles] = useState<{ id: number; x: number; y: number; r: number }[]>([]);

  // Calculate transition points
  const points = selectedSubstance ? getPhaseTransitionPoints(selectedSubstance, pressure) : { Tm: 0, Tb: 100 };
  const { Tm, Tb } = points;

  // Temperature reading with parallax offset error
  const displayedTemperature = temperature + thermometerEyeLevelOffset;

  // Steam bubbles in liquid phase during boiling
  useEffect(() => {
    if (phase !== "liquid-gas" && phase !== "gas") {
      setSteamBubbles([]);
      return;
    }
    const interval = setInterval(() => {
      startTransition(() => {
        setSteamBubbles(prev => {
          const next = prev.filter(b => b.y > 280).map(b => ({ ...b, y: b.y - 3 }));
          if (next.length < 12) {
            next.push({
              id: Math.random(),
              x: 245 + Math.random() * 50,
              y: 390,
              r: 1.5 + Math.random() * 2.5,
            });
          }
          return next;
        });
      });
    }, 100);
    return () => clearInterval(interval);
  }, [phase]);

  // Geometry
  const beakerX = 170;
  const beakerY = 250;
  const beakerW = 200;
  const beakerH = 210;

  // Test tube
  const tubeX = 240;
  const tubeY = 180;
  const tubeW = 60;
  const tubeH = 230;

  // Colors
  const subColor = selectedSubstance === "water" ? "#38bdf8" : selectedSubstance === "ethanol" ? "#fb923c" : "#cbd5e1";

  // Height of substance inside test tube (solid shrinks, liquid behaves)
  let substanceHeight = 70;
  if (phase === "solid") substanceHeight = 70;
  else if (phase === "solid-liquid") substanceHeight = 70 - latentHeatProgress * 15;
  else if (phase === "liquid") substanceHeight = 55;
  else if (phase === "liquid-gas") substanceHeight = 55 - latentHeatProgress * 45;
  else substanceHeight = 10; // turned to gas / vapor

  const subY = tubeY + tubeH - substanceHeight - 15;

  return (
    <div style={{ width: "100%", height: "auto", maxHeight: "100%", aspectRatio: "540/600" }}>
      <svg viewBox="0 0 540 600" style={{ width: "100%", height: "100%" }}>
        <defs>
          <pattern id="sm-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.75" fill="rgba(148,163,184,0.12)" />
          </pattern>
          <linearGradient id="sm-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#faf5ff" />
            <stop offset="100%" stopColor="#ede9fe" />
          </linearGradient>
          <linearGradient id="glassRefractionGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.35)" />
            <stop offset="15%" stopColor="rgba(240, 246, 252, 0.05)" />
            <stop offset="85%" stopColor="rgba(240, 246, 252, 0.05)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.45)" />
          </linearGradient>
          <linearGradient id="glassHighlightGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.8)" />
            <stop offset="15%" stopColor="rgba(255, 255, 255, 0.15)" />
            <stop offset="85%" stopColor="rgba(255, 255, 255, 0.15)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.6)" />
          </linearGradient>
          <linearGradient id="chromeRodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="25%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#f8fafc" />
            <stop offset="75%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <linearGradient id="ironBaseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="50%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="benchtopGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="10%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="waterBathGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.45" />
          </linearGradient>
          <linearGradient id="thermometerFluid" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#f87171" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
          <linearGradient id="hotPlateActiveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="50%" stopColor="#f87171" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#0f172a" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Background & Bench */}
        <rect width={W} height={H} fill="url(#sm-wall)" />
        <rect width={W} height={H} fill="url(#sm-dots)" opacity="0.6" />
        <rect x="0" y={H-140} width={W} height="140" fill="url(#benchtopGrad)" />
        <line x1="0" y1={H-140} x2={W} y2={H-140} stroke="#7c3aed" strokeWidth="2.5" strokeOpacity="0.4" />

        {/* ─── HOT PLATE BURNER ─── */}
        <g filter="url(#shadowFilter)">
          <rect x="140" y="460" width="260" height="20" rx="4" fill="url(#ironBaseGrad)" stroke="#475569" strokeWidth="1" />
          <rect x="153" y="454" width="234" height="7" rx="2" fill="url(#chromeRodGrad)" stroke="#334155" strokeWidth="0.5" />
          <rect x="155" y="452" width="230" height="4" rx="1.5" fill={isHeating ? "url(#hotPlateActiveGrad)" : "url(#ironBaseGrad)"} />
          
          {/* Heat glow rising */}
          {isHeating && (
            <g opacity="0.7">
              <path d="M 200 440 Q 205 430 200 420 Q 195 410 200 400 M 270 440 Q 275 430 270 420 M 340 440 Q 345 430 340 420" fill="none" stroke="#ef4444" strokeWidth="1.5" />
              <path d="M 202 440 Q 205 432 202 422 M 272 440 Q 275 432 272 422 M 342 440 Q 345 432 342 422" fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.5" />
            </g>
          )}
        </g>

        {/* ─── WATER BATH BEAKER ─── */}
        <g filter="url(#shadowFilter)">
          {/* Outer beaker wall */}
          <rect x={beakerX} y={beakerY} width={beakerW} height={beakerH} rx="8" fill="none" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="2.5" />
          {/* Inner beaker wall */}
          <rect x={beakerX + 2.5} y={beakerY + 2.5} width={beakerW - 5} height={beakerH - 5} rx="5.5" fill="url(#glassRefractionGrad)" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />
          {/* Glass sheen */}
          <path d={`M ${beakerX + 5} ${beakerY + 5} L ${beakerX + 5} ${beakerY + beakerH - 10}`} stroke="url(#glassHighlightGrad)" strokeWidth="1.5" />
          <path d={`M ${beakerX + beakerW - 5} ${beakerY + 5} L ${beakerX + beakerW - 5} ${beakerY + beakerH - 10}`} stroke="url(#glassHighlightGrad)" strokeWidth="1.5" />
          
          {/* Beaker water (heating bath) with curved meniscus */}
          <g>
            <rect x={beakerX + 3.5} y={beakerY + 60} width={beakerW - 7} height={beakerH - 63.5} fill="url(#waterBathGrad)" rx="4.5" />
            <path d={`M ${beakerX + 3.5} ${beakerY + 60} Q ${beakerX + beakerW/2} ${beakerY + 64} ${beakerX + beakerW - 3.5} ${beakerY + 60}`} fill="none" stroke="#0ea5e9" strokeWidth="2" opacity="0.85" />
          </g>
        </g>

        {/* ─── PHASE TEST SUBSTANCE IN TUBE ─── */}
        <g filter="url(#shadowFilter)">
          {/* Outer glass body */}
          <path
            d={`M ${tubeX} ${tubeY} L ${tubeX} ${tubeY + tubeH - 20} Q ${tubeX} ${tubeY + tubeH} ${tubeX + tubeW/2} ${tubeY + tubeH} Q ${tubeX + tubeW} ${tubeY + tubeH} ${tubeX + tubeW} ${tubeY + tubeH - 20} L ${tubeX + tubeW} ${tubeY} Z`}
            fill="none"
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="2.5"
          />
          {/* Inner refraction */}
          <path
            d={`M ${tubeX + 2.5} ${tubeY} L ${tubeX + 2.5} ${tubeY + tubeH - 20} Q ${tubeX + 2.5} ${tubeY + tubeH - 2.5} ${tubeX + tubeW/2} ${tubeY + tubeH - 2.5} Q ${tubeX + tubeW - 2.5} ${tubeY + tubeH - 2.5} ${tubeX + tubeW - 2.5} ${tubeY + tubeH - 20} L ${tubeX + tubeW - 2.5} ${tubeY} Z`}
            fill="url(#glassRefractionGrad)"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="0.8"
          />
          {/* Specular highlights on tube sides */}
          <path d={`M ${tubeX + 4} ${tubeY} L ${tubeX + 4} ${tubeY + tubeH - 20}`} stroke="url(#glassHighlightGrad)" strokeWidth="1" />
          <path d={`M ${tubeX + tubeW - 4} ${tubeY} L ${tubeX + tubeW - 4} ${tubeY + tubeH - 20}`} stroke="url(#glassHighlightGrad)" strokeWidth="1" />

          {/* Solid block drawing */}
          {selectedSubstance && (phase === "solid" || phase === "solid-liquid") && (
            <rect
              x={tubeX + 4}
              y={tubeY + tubeH - substanceHeight - 10}
              width={tubeW - 8}
              height={substanceHeight}
              rx="4"
              fill={subColor}
              opacity="0.9"
            />
          )}

          {/* Liquid level drawing with curved meniscus */}
          {selectedSubstance && (phase === "liquid" || phase === "solid-liquid" || phase === "liquid-gas") && (
            <g>
              <path
                d={`M ${tubeX + 3} ${subY} L ${tubeX + tubeW - 3} ${subY} L ${tubeX + tubeW - 3} ${tubeY + tubeH - 15} Q ${tubeX + tubeW - 3} ${tubeY + tubeH - 3} ${tubeX + tubeW/2} ${tubeY + tubeH - 3} Q ${tubeX + 3} ${tubeY + tubeH - 3} ${tubeX + 3} ${tubeY + tubeH - 15} Z`}
                fill={subColor}
                opacity="0.65"
              />
              {/* Meniscus */}
              <path d={`M ${tubeX + 3} ${subY} Q ${tubeX + tubeW/2} ${subY + 2.5} ${tubeX + tubeW - 3} ${subY}`} fill="none" stroke={subColor} strokeWidth="2" opacity="0.9" />
            </g>
          )}

          {/* Steam / Boiling bubbles rising */}
          {steamBubbles.map(b => (
            <circle key={b.id} cx={b.x} cy={b.y} r={b.r} fill="#ffffff" opacity="0.8" />
          ))}

          {/* Overheating splattering droplets */}
          {splatterTriggered && (
            <g fill={subColor} opacity="0.8">
              <circle cx="260" cy="230" r="3" />
              <circle cx="280" cy="210" r="2.5" />
              <circle cx="245" cy="240" r="2.2" />
              <circle cx="295" cy="225" r="3.2" />
            </g>
          )}

          {/* Thermometer in test tube */}
          {selectedSubstance && (
            <g filter="url(#shadowFilter)">
              {/* Thermometer glass backing */}
              <rect x="266" y="90" width="8" height="300" fill="rgba(255,255,255,0.95)" stroke="#64748b" strokeWidth="1" rx="4" />
              <rect x="267" y="91" width="2" height="298" fill="rgba(255,255,255,0.8)" opacity="0.6" />
              {/* Red liquid line showing actual temperature */}
              <line x1="270" y1="94" x2="270" y2="384" stroke="url(#thermometerFluid)" strokeWidth="2" />
              <circle cx="270" cy="384" r="6" fill="url(#thermometerFluid)" />
              {/* Specular sheen on bulb */}
              <circle cx="268" cy="382" r="2" fill="#ffffff" opacity="0.6" />
            </g>
          )}
        </g>

        {/* ─── INTERACTIVE EYE PARALLAX ADJUSTER ─── */}
        <g>
          <text x="360" y="325" fontSize="9" fontWeight="bold" fill="#64748b">THERMOMETER READING ALIGNMENT</text>
          
          {/* Alignment guideline */}
          <line
            x1="270"
            y1={240 - thermometerEyeLevelOffset * 10}
            x2="450"
            y2={240}
            stroke="#ef4444"
            strokeWidth="1.2"
            strokeDasharray="3,3"
            opacity="0.75"
          />

          {/* Interactive slider display for parallax eye offset */}
          <rect x="360" y="335" width="160" height="50" rx="10" fill="rgba(15,23,42,0.85)" stroke="rgba(124,58,237,0.3)" />
          <text x="375" y="353" fontSize="10" fontWeight="bold" fill="#a7f3d0">PARALLAX ERROR CORRECTION</text>
          <text x="375" y="367" fontSize="9" fill="#cbd5e1">Eye Offset: {thermometerEyeLevelOffset.toFixed(1)}°C</text>
          <text x="375" y="378" fontSize="8" fill="#94a3b8">Thermometer: {displayedTemperature.toFixed(1)}°C</text>
        </g>

        {/* Calculations display overlay - MUST BE VISIBLE */}
        <g transform="translate(15, 60)">
          <rect x="0" y="0" width="225" height="114" rx="10" fill="rgba(15,23,42,0.85)" stroke="rgba(124,58,237,0.3)" strokeWidth="1" />
          <text x="15" y="20" fontSize="10.5" fontWeight="bold" fill="#c084fc">THERMODYNAMICS PLATETAU</text>
          
          {/* Sensible Heat Calculation Formula */}
          <g opacity={phase.includes("-") ? 0.35 : 1.0}>
            <rect x="10" y="28" width="205" height="24" rx="4" fill="rgba(255,255,255,0.05)" />
            <text x="18" y="43" fontSize="9" fill="#e2e8f0" fontFamily="monospace">
              q = m·c_p·ΔT = 10g·c·({temperature.toFixed(1)} - T₀)
            </text>
          </g>

          {/* Latent Heat Calculation Formula */}
          <g opacity={phase.includes("-") ? 1.0 : 0.35}>
            <rect x="10" y="58" width="205" height="24" rx="4" fill="rgba(255,255,255,0.05)" />
            <text x="18" y="73" fontSize="9" fill="#e2e8f0" fontFamily="monospace">
              q = m·L (Plateau Progress: {(latentHeatProgress * 100).toFixed(0)}%)
            </text>
          </g>

          <line x1="15" y1="90" x2="210" y2="90" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
          <text x="15" y="103" fontSize="9.5" fill="#a5f3fc" fontWeight="bold" fontFamily="monospace">
            Atmospheric Pressure: {pressure.toFixed(3)} atm
          </text>
        </g>
      </svg>
    </div>
  );
}
