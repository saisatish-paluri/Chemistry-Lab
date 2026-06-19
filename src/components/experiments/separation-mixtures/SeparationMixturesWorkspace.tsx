"use client";

import { useEffect, useState, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SeparationMixturesState } from "@/lib/engine/types";

interface Props {
  state: SeparationMixturesState;
  onSweepMagnet?: (sweepSec: number) => void;
}

const W = 540;
const H = 600;

export default function SeparationMixturesWorkspace({ state, onSweepMagnet }: Props) {
  const {
    separationStep,
    currentVessel,
    ironMass,
    sandMass,
    saltMass,
    separatedIron,
    separatedSand,
    separatedSalt,
    waterVolume,
    temperature,
    filtrationProgress,
    evaporationProgress,
  } = state;

  const [steamLineOffset, setSteamLineOffset] = useState(0);

  // Steam animation during boiling
  useEffect(() => {
    if (separationStep !== "evaporation" || temperature < 80) return;
    const interval = setInterval(() => {
      startTransition(() => {
        setSteamLineOffset(prev => (prev + 1) % 4);
      });
    }, 450);
    return () => clearInterval(interval);
  }, [separationStep, temperature]);

  // Live calculations
  const totalSolid = ironMass + sandMass + saltMass;
  const ironPercent = ((separatedIron / ironMass) * 100).toFixed(0);
  const sandPercent = ((separatedSand / sandMass) * 100).toFixed(0);
  const saltPercent = ((separatedSalt / saltMass) * 100).toFixed(0);

  // Seed coordinates for mixture particles to ensure stability
  const [beakerParticles, setBeakerParticles] = useState<{ x: number, y: number, type: "iron" | "salt" | "sand" }[]>([]);

  useEffect(() => {
    // Generate particles once
    const parts: typeof beakerParticles = [];
    // Iron: black, Sand: brown/yellow, Salt: white/grey
    for (let i = 0; i < 40; i++) {
      parts.push({ x: 190 + Math.random() * 160, y: 390 + Math.random() * 40, type: "iron" });
    }
    for (let i = 0; i < 50; i++) {
      parts.push({ x: 190 + Math.random() * 160, y: 395 + Math.random() * 35, type: "sand" });
    }
    for (let i = 0; i < 40; i++) {
      parts.push({ x: 190 + Math.random() * 160, y: 390 + Math.random() * 40, type: "salt" });
    }
    setBeakerParticles(parts);
  }, []);

  return (
    <div style={{ width: "100%", height: "auto", maxHeight: "100%", aspectRatio: "540/600" }} className="relative select-none">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "100%" }}
        className="drop-shadow-xl"
      >
        <defs>
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
            <stop offset="20%" stopColor="#94a3b8" />
            <stop offset="40%" stopColor="#f8fafc" />
            <stop offset="60%" stopColor="#cbd5e1" />
            <stop offset="80%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <linearGradient id="ironBaseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="50%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="35%" stopColor="#f59e0b" />
            <stop offset="65%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          <linearGradient id="benchtopGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="10%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="liquidWetGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="filtrateGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d1fae5" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.65" />
          </linearGradient>
          <linearGradient id="magnetRedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
          <linearGradient id="magnetBlueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <radialGradient id="ceramicDishGrad" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fafaf9" />
            <stop offset="70%" stopColor="#e7e5e4" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </radialGradient>
          <linearGradient id="ceramicRimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e7e5e4" />
            <stop offset="50%" stopColor="#fafaf9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <filter id="shadowFilter" x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#020617" floodOpacity="0.85" />
          </filter>
          <filter id="flameBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
        </defs>

        {/* ── STAGE TABLE ── */}
        <rect x="0" y="480" width="540" height="120" fill="url(#benchtopGrad)" />
        <line x1="0" y1="480" x2="540" y2="480" stroke="#10b981" strokeWidth="2" strokeOpacity="0.4" />

        {/* ── CASE 1: INITIAL BEAKER STAGES ── */}
        {(currentVessel === "beaker") && (
          <g id="initial-beaker-setup">
            {/* Beaker Body with Shadow */}
            <g filter="url(#shadowFilter)">
              {/* Outer wall */}
              <rect x="170" y="200" width="200" height="250" rx="8" fill="none" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="2.5" />
              {/* Inner refraction */}
              <rect x="172.5" y="202.5" width="195" height="245" rx="5.5" fill="url(#glassRefractionGrad)" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />
              {/* Vertical sheens */}
              <path d="M 175 205 L 175 445" stroke="url(#glassHighlightGrad)" strokeWidth="1.5" />
              <path d="M 365 205 L 365 445" stroke="url(#glassHighlightGrad)" strokeWidth="1.5" />
              {/* Beaker Lip */}
              <path d="M 162 200 Q 170 204 178 200 L 362 200 Q 370 204 378 200 Z" fill="url(#glassHighlightGrad)" opacity="0.6" />
            </g>

            {/* Liquid if wet */}
            {state.isWet && (
              <g>
                <rect x="173.5" y="320" width="193" height="125" fill="url(#liquidWetGrad)" rx="3" />
                <path d="M 173.5 320 Q 270 325 366.5 320" fill="none" stroke="#38bdf8" strokeWidth="2.5" opacity="0.8" />
              </g>
            )}

            {/* Particles rendered inside beaker */}
            {beakerParticles.map((pt, idx) => {
              // Hide iron if separated
              if (pt.type === "iron" && separatedIron > (idx % 10) * 0.5) return null;
              // Hide salt if dissolved
              if (pt.type === "salt" && state.isWet) return null;

              const color = pt.type === "iron" ? "#0f172a" : pt.type === "sand" ? "#b45309" : "#cbd5e1";
              const r = pt.type === "sand" ? 3.5 : 2.5;

              return (
                <circle key={idx} cx={pt.x} cy={pt.y} r={r} fill={color} opacity="0.85" />
              );
            })}

            {/* Magnet representation when in initial stage */}
            {separationStep === "initial" && (
              <g
                id="interactive-magnet"
                className="cursor-pointer group"
                onClick={() => onSweepMagnet?.(1.5)}
              >
                {/* U-Shape Magnet with metallic/realistic 3D gradient */}
                <g filter="url(#shadowFilter)">
                  <path
                    d="M 230 130 L 230 90 A 20 20 0 0 1 250 90"
                    fill="none"
                    stroke="url(#magnetRedGrad)"
                    strokeWidth="16"
                  />
                  <path
                    d="M 250 90 A 20 20 0 0 1 270 90 L 270 130"
                    fill="none"
                    stroke="url(#magnetBlueGrad)"
                    strokeWidth="16"
                  />
                  {/* Magnetic poles */}
                  <rect x="222" y="122" width="16" height="8" fill="url(#chromeRodGrad)" />
                  <rect x="262" y="122" width="16" height="8" fill="url(#chromeRodGrad)" />
                </g>
                <text x="226" y="116" fill="#ffffff" fontSize="9" fontWeight="bold">S</text>
                <text x="266" y="116" fill="#ffffff" fontSize="9" fontWeight="bold">N</text>

                {/* Sticking Iron Filings */}
                {separatedIron > 0 && (
                  <g>
                    <circle cx="230" cy="142" r="3" fill="#0f172a" />
                    <circle cx="234" cy="144" r="2.5" fill="#0f172a" />
                    <circle cx="266" cy="143" r="2.5" fill="#0f172a" />
                    <circle cx="270" cy="145" r="3" fill="#0f172a" />
                  </g>
                )}

                <circle cx="250" cy="100" r="28" fill="transparent" stroke="#2563eb" strokeWidth="2" strokeDasharray="4 4" className="animate-spin" style={{ transformOrigin: "250px 100px" }} />
                <text x="210" y="65" fill="#2563eb" fontSize="10" fontWeight="bold" className="animate-pulse">CLICK MAGNET TO SWEEP</text>
              </g>
            )}
          </g>
        )}

        {/* ── CASE 2: FILTRATION FUNNEL SETUP ── */}
        {currentVessel === "filter" && (
          <g id="filter-setup">
            {/* Top Funnel */}
            <g filter="url(#shadowFilter)">
              {/* Outer wall */}
              <path
                d="M 180 140 L 360 140 L 285 240 L 285 300 L 255 300 L 255 240 Z"
                fill="none"
                stroke="rgba(255, 255, 255, 0.45)"
                strokeWidth="2"
              />
              {/* Inner refraction */}
              <path
                d="M 182 142 L 358 142 L 283 239 L 283 298 L 257 298 L 257 239 Z"
                fill="url(#glassRefractionGrad)"
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth="0.8"
              />
              {/* Funnel rim highlight */}
              <path d="M 180 140 Q 270 143 360 140" fill="none" stroke="url(#glassHighlightGrad)" strokeWidth="1.5" />
            </g>

            {/* Filter paper cone outline */}
            <path
              d="M 195 150 L 345 150 L 270 230 Z"
              fill="#f8fafc"
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />

            {/* Insoluble Sand Residue in funnel paper */}
            {separatedSand < sandMass && (
              <ellipse cx="270" cy="210" rx="30" ry="15" fill="#b45309" opacity={1.0 - filtrationProgress} />
            )}
            {separatedSand >= sandMass - 0.2 && (
              <ellipse cx="270" cy="218" rx="20" ry="8" fill="#78350f" />
            )}

            {/* Slurry level in filter funnel */}
            {filtrationProgress < 1.0 && (
              <path
                d={`M ${195 + filtrationProgress * 65} ${150 + filtrationProgress * 65} L ${345 - filtrationProgress * 65} ${150 + filtrationProgress * 65} L 270 230 Z`}
                fill="#fed7aa"
                opacity="0.6"
              />
            )}

            {/* Bottom Beaker (Filtrate collector) */}
            <g filter="url(#shadowFilter)">
              <rect x="190" y="320" width="160" height="150" rx="8" fill="none" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="2" />
              <rect x="192" y="322" width="156" height="146" rx="6" fill="url(#glassRefractionGrad)" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.8" />
              <path d="M 194 324 L 194 466" stroke="url(#glassHighlightGrad)" strokeWidth="1.2" />
              <path d="M 346 324 L 346 466" stroke="url(#glassHighlightGrad)" strokeWidth="1.2" />
            </g>

            {filtrationProgress > 0 && (
              <g>
                <rect
                  x="193"
                  y={470 - filtrationProgress * 70}
                  width="154"
                  height={filtrationProgress * 70 - 2}
                  fill="url(#filtrateGrad)"
                  opacity="0.6"
                  rx="2"
                />
                {/* Meniscus */}
                <path
                  d={`M 193 ${470 - filtrationProgress * 70} Q 270 ${470 - filtrationProgress * 70 + 3} 347 ${470 - filtrationProgress * 70}`}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                />
              </g>
            )}

            {/* Dripping drops */}
            {filtrationProgress > 0 && filtrationProgress < 1.0 && (
              <circle cx="270" cy="305" r="3" fill="#10b981" className="animate-bounce" />
            )}
          </g>
        )}

        {/* ── CASE 3: EVAPORATION SETUP ── */}
        {(currentVessel === "evaporate" || currentVessel === "complete") && (
          <g id="evaporation-dish-setup">
            {/* Bunsen Burner body */}
            <g filter="url(#shadowFilter)">
              <rect x="230" y="410" width="80" height="60" rx="4" fill="url(#ironBaseGrad)" stroke="#475569" strokeWidth="1" />
              <rect x="230" y="410" width="80" height="8" fill="url(#chromeRodGrad)" />
              {/* Collar */}
              <rect x="260" y="390" width="20" height="20" fill="url(#brassGrad)" stroke="#475569" strokeWidth="0.5" />
            </g>

            {/* Tripod Stand */}
            <g stroke="url(#ironBaseGrad)" strokeLinecap="round" filter="url(#shadowFilter)">
              <path d="M 180 340 L 360 340" strokeWidth="7" />
              <path d="M 180 340 L 190 480" strokeWidth="6" />
              <path d="M 360 340 L 350 480" strokeWidth="6" />
            </g>

            {/* Burner Flame if heating */}
            {separationStep === "evaporation" && (
              <g className="animate-pulse" style={{ transformOrigin: "270px 390px" }}>
                {/* Outer flame: Blue aura */}
                <path d="M 252 392 Q 270 300 288 392 Z" fill="#3b82f6" opacity="0.35" filter="url(#flameBlur)" />
                {/* Mid flame: Hot orange */}
                <path d="M 257 391 Q 270 315 283 391 Z" fill="#f97316" opacity="0.75" filter="url(#flameBlur)" />
                {/* Inner core: Bright cyan/white */}
                <path d="M 263 390 Q 270 340 277 390 Z" fill="#e0f2fe" opacity="0.9" filter="url(#flameBlur)" />
              </g>
            )}

            {/* Evaporating Dish (Clay crucible shape) */}
            <g filter="url(#shadowFilter)">
              {/* Outer Ceramic Dish */}
              <path d="M 200 310 A 70 70 0 0 0 340 310 Z" fill="url(#ceramicDishGrad)" stroke="#cbd5e1" strokeWidth="2.5" />
              {/* Ceramic Rim */}
              <line x1="190" y1="310" x2="350" y2="310" stroke="url(#ceramicRimGrad)" strokeWidth="5" strokeLinecap="round" />
              <line x1="192" y1="310" x2="348" y2="310" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
            </g>

            {/* Salt Solution level in Dish */}
            {waterVolume > 0 && (
              <path
                d={`M ${200 + evaporationProgress * 30} ${310 + evaporationProgress * 15} A ${70 - evaporationProgress * 30} ${70 - evaporationProgress * 25} 0 0 0 ${340 - evaporationProgress * 30} ${310 + evaporationProgress * 15} Z`}
                fill="#bae6fd"
                opacity="0.75"
              />
            )}

            {/* Purified salt crystallizing at bottom */}
            {evaporationProgress > 0.4 && (
              <g transform="translate(270, 350)">
                <circle cx="-15" cy="15" r="3" fill="#ffffff" />
                <circle cx="15" cy="16" r="2.5" fill="#ffffff" />
                <circle cx="-5" cy="18" r="3" fill="#ffffff" />
                <circle cx="5" cy="19" r="4" fill="#ffffff" />
                <circle cx="-25" cy="10" r="2" fill="#ffffff" />
                <circle cx="25" cy="11" r="2.5" fill="#ffffff" />
              </g>
            )}

            {/* Steam lines during boiling */}
            {separationStep === "evaporation" && temperature >= 90 && (
              <g opacity="0.55" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round">
                <path d={`M 230 280 Q 235 ${260 - steamLineOffset * 8} 230 ${240 - steamLineOffset * 8}`} />
                <path d={`M 270 270 Q 275 ${250 - steamLineOffset * 8} 270 ${230 - steamLineOffset * 8}`} />
                <path d={`M 310 280 Q 315 ${260 - steamLineOffset * 8} 310 ${240 - steamLineOffset * 8}`} />
              </g>
            )}
          </g>
        )}
      </svg>

      {/* ── LIVE CALCULATIONS OVERLAY ── */}
      <div
        className="absolute top-4 left-4 bg-slate-900/90 text-slate-100 rounded-xl p-4 border border-slate-700/80 shadow-2xl font-mono text-[11px] space-y-2.5 backdrop-blur-md w-[220px]"
      >
        <div className="text-emerald-400 font-extrabold text-[12px] border-b border-slate-700 pb-1.5 flex justify-between items-center">
          <span>⚙️ Separation Efficiency</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">Mass Balance</span>
        </div>
        <div className="space-y-1.5">
          <p className="flex justify-between">
            <span className="text-slate-400">Iron Filings:</span>
            <span className={`font-bold ${separatedIron >= ironMass ? "text-emerald-400" : "text-white"}`}>
              {separatedIron.toFixed(1)}g / {ironMass.toFixed(0)}g ({ironPercent}%)
            </span>
          </p>
          <p className="flex justify-between">
            <span className="text-slate-400">Insoluble Sand:</span>
            <span className={`font-bold ${separatedSand >= sandMass ? "text-emerald-400" : "text-white"}`}>
              {separatedSand.toFixed(1)}g / {sandMass.toFixed(0)}g ({sandPercent}%)
            </span>
          </p>
          <p className="flex justify-between">
            <span className="text-slate-400">Soluble Salt:</span>
            <span className={`font-bold ${separatedSalt >= saltMass ? "text-emerald-400" : "text-white"}`}>
              {separatedSalt.toFixed(1)}g / {saltMass.toFixed(0)}g ({saltPercent}%)
            </span>
          </p>
          <p className="flex justify-between border-t border-slate-800/80 pt-1.5">
            <span className="text-slate-400">Vessel Water:</span>
            <span className="font-bold text-sky-400">{waterVolume.toFixed(0)} mL</span>
          </p>
          <p className="flex justify-between">
            <span className="text-slate-400">Burner Temp:</span>
            <span className="font-bold text-orange-400">{temperature.toFixed(1)} °C</span>
          </p>
        </div>
      </div>
    </div>
  );
}
