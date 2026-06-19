"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { DecompositionState } from "@/lib/engine/types";

interface Props {
  state: DecompositionState;
  onToggleHeat?: (active: boolean) => void;
}

const W = 540;
const H = 600;

export default function DecompositionWorkspace({ state, onToggleHeat }: Props) {
  const {
    reactant,
    initialMass,
    remainingMass,
    hasCatalyst,
    temperature,
    gasVolumeEvolved,
    isHeating,
    heatingPower,
    status,
  } = state;

  const [bubbleOffset, setBubbleOffset] = useState(0);

  // Bubble stream animation in delivery tube
  useEffect(() => {
    if (status !== "running" || gasVolumeEvolved <= 0) return;
    const interval = setInterval(() => {
      setBubbleOffset(prev => (prev + 1) % 5);
    }, 200);
    return () => clearInterval(interval);
  }, [status, gasVolumeEvolved]);

  // Arrhenius parameter display
  const R = 8.314;
  const tempK = temperature + 273.15;
  
  const kinetics = reactant 
    ? {
        caco3: { ea: 180, eaCat: 180, A: 1.2e10, label: "CaCO₃ → CaO + CO₂", gas: "CO₂" },
        kclo3: { ea: 220, eaCat: 120, A: 8.5e11, label: "2KClO₃ → 2KCl + 3O₂", gas: "O₂" },
        h2o2:  { ea: 75,  eaCat: 49,  A: 1.5e8,  label: "2H₂O₂ → 2H₂O + O₂", gas: "O₂" },
      }[reactant]
    : null;

  const Ea = kinetics ? (hasCatalyst ? kinetics.eaCat : kinetics.ea) : 0;
  const k = kinetics ? kinetics.A * Math.exp(-(Ea * 1000) / (R * tempK)) : 0;

  // Syringe plunger translation
  const plungerMaxTravel = 150; // max px
  const plungerTravel = Math.min(plungerMaxTravel, (gasVolumeEvolved / 250) * plungerMaxTravel);

  const massRatio = initialMass > 0 ? remainingMass / initialMass : 1;

  return (
    <div style={{ width: "100%", height: "auto", maxHeight: "100%", aspectRatio: "540/600" }} className="relative select-none">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "100%" }}
        className="drop-shadow-xl"
      >
        <defs>
          <linearGradient id="boilingTubeGlass" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.4)" />
            <stop offset="30%" stopColor="rgba(255, 255, 255, 0.15)" />
            <stop offset="70%" stopColor="rgba(255, 255, 255, 0.15)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.55)" />
          </linearGradient>
          <linearGradient id="glassRefractionGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.35)" />
            <stop offset="15%" stopColor="rgba(240, 246, 252, 0.05)" />
            <stop offset="85%" stopColor="rgba(240, 246, 252, 0.05)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.45)" />
          </linearGradient>
          <linearGradient id="glassHighlightGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.8)" />
            <stop offset="5%" stopColor="rgba(255, 255, 255, 0.15)" />
            <stop offset="95%" stopColor="rgba(255, 255, 255, 0.15)" />
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
            <stop offset="30%" stopColor="#d97706" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          <linearGradient id="rubberStopperGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="liquidReactantGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <radialGradient id="powderGrad" cx="50%" cy="30%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </radialGradient>
          <radialGradient id="catalystGrad" cx="40%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="70%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>
          <linearGradient id="benchtopGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="10%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#020617" floodOpacity="0.8" />
          </filter>
          <filter id="flameBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
        </defs>

        {/* ── GROUND LAB TABLE ── */}
        <rect x="0" y="480" width="540" height="120" fill="url(#benchtopGrad)" />
        <line x1="0" y1="480" x2="540" y2="480" stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.4" />

        {/* ── RETORT STAND ── */}
        <g id="stand" filter="url(#shadowFilter)">
          {/* Base plate */}
          <rect x="80" y="460" width="220" height="20" rx="3" fill="url(#ironBaseGrad)" stroke="#475569" strokeWidth="1" />
          <rect x="82" y="461" width="216" height="4" fill="rgba(255,255,255,0.15)" />
          {/* Vertical rod */}
          <rect x="110" y="100" width="10" height="360" fill="url(#chromeRodGrad)" />
          <line x1="112" y1="100" x2="112" y2="460" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.5" />
          {/* Clamps holding test tube */}
          <rect x="115" y="179" width="40" height="10" rx="2" fill="url(#chromeRodGrad)" stroke="#334155" strokeWidth="0.5" />
          <path d="M 155 174 L 165 174 A 14 14 0 0 1 165 194 L 155 194 Z" fill="none" stroke="url(#chromeRodGrad)" strokeWidth="4" />
        </g>

        {/* ── BUNSEN BURNER ── */}
        <g id="bunsen-burner" transform="translate(130, 370)" filter="url(#shadowFilter)">
          {/* Burner Body */}
          <rect x="35" y="60" width="40" height="30" rx="4" fill="url(#ironBaseGrad)" stroke="#475569" strokeWidth="1" />
          <rect x="50" y="20" width="10" height="40" fill="url(#chromeRodGrad)" />
          <line x1="52" y1="20" x2="52" y2="60" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.5" />
          <rect x="47" y="10" width="16" height="10" fill="url(#brassGrad)" />

          {/* Burner Flame */}
          {isHeating && (
            <g className="animate-pulse" style={{ transformOrigin: "55px 10px" }}>
              {/* Outer flame: Blue aura */}
              <path
                d="M 44 12 Q 55 -75 66 12 Z"
                fill="#3b82f6"
                opacity="0.4"
                filter="url(#flameBlur)"
              />
              {/* Mid flame: Hot orange/pink */}
              <path
                d="M 47 11 Q 55 -50 63 11 Z"
                fill="#f97316"
                opacity="0.75"
                filter="url(#flameBlur)"
              />
              {/* Inner core: Bright cyan/white */}
              <path
                d="M 51 10 Q 55 -25 59 10 Z"
                fill="#e0f2fe"
                opacity="0.95"
                filter="url(#flameBlur)"
              />
            </g>
          )}
        </g>

        {/* ── BOILING TUBE & REACTANTS ── */}
        <g id="boiling-tube" filter="url(#shadowFilter)">
          {/* Horizontal Tube at angle */}
          <g transform="translate(140, 150) rotate(15)">
            {/* Liquid / solid mass inside */}
            {reactant && remainingMass > 0.1 && (
              <g>
                {reactant === "h2o2" ? (
                  // Liquid reactant
                  <path
                    d={`M 20 8 L ${20 + 110 * massRatio} 8 Q ${20 + 110 * massRatio + 2} 17 ${20 + 110 * massRatio} 26 L 20 26 Q 22 17 20 8 Z`}
                    fill="url(#liquidReactantGrad)"
                    opacity="0.7"
                  />
                ) : (
                  // Powder reactant (CaCO3 white, KClO3 white)
                  <ellipse cx={20 + 40 * massRatio} cy="18" rx={40 * massRatio} ry={10 * Math.max(0.4, massRatio)} fill="url(#powderGrad)" />
                )}

                {/* Manganese Dioxide black catalyst spots */}
                {hasCatalyst && (
                  <g opacity={Math.max(0.2, massRatio)}>
                    <circle cx={20 + 30 * massRatio} cy="18" r="2.5" fill="url(#catalystGrad)" />
                    <circle cx={20 + 45 * massRatio} cy="15" r="2.5" fill="url(#catalystGrad)" />
                    <circle cx={20 + 20 * massRatio} cy="16" r="2" fill="url(#catalystGrad)" />
                    <circle cx={20 + 55 * massRatio} cy="19" r="2" fill="url(#catalystGrad)" />
                  </g>
                )}
              </g>
            )}

            {/* Outer glass body */}
            <rect x="10" y="4" width="150" height="26" rx="13" fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="2" />
            {/* Inner thickness line */}
            <rect x="11.5" y="5.5" width="147" height="23" rx="11.5" fill="url(#glassRefractionGrad)" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />
            {/* Specular sheen reflection */}
            <path d="M 20 6 L 140 6" fill="none" stroke="url(#glassHighlightGrad)" strokeWidth="1.2" strokeLinecap="round" />
            
            {/* Rubber Stopper */}
            <rect x="150" y="2" width="12" height="30" rx="3" fill="url(#rubberStopperGrad)" stroke="#0f172a" strokeWidth="0.5" />
            <line x1="153" y1="2" x2="153" y2="32" stroke="#475569" strokeWidth="0.8" opacity="0.5" />
            <line x1="156" y1="2" x2="156" y2="32" stroke="#475569" strokeWidth="0.8" opacity="0.5" />
            <line x1="159" y1="2" x2="159" y2="32" stroke="#475569" strokeWidth="0.8" opacity="0.5" />
          </g>
        </g>

        {/* ── GAS SYRINGE (COLLECTOR) ── */}
        <g id="gas-syringe" transform="translate(290, 110)" filter="url(#shadowFilter)">
          {/* Syringe outer barrel */}
          <rect x="20" y="20" width="170" height="40" rx="6" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          {/* Inner thickness */}
          <rect x="21.5" y="21.5" width="167" height="37" rx="4.5" fill="url(#glassRefractionGrad)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          {/* Specular sheen */}
          <path d="M 25 22 L 185 22" stroke="url(#glassHighlightGrad)" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M 25 58 L 185 58" stroke="url(#glassHighlightGrad)" strokeWidth="1.2" strokeLinecap="round" />
          
          {/* Nozzle connecting to tube */}
          <rect x="0" y="35" width="20" height="10" rx="1" fill="url(#chromeRodGrad)" stroke="#475569" strokeWidth="0.5" />

          {/* Graduations */}
          {[0, 50, 100, 150, 200, 250].map((vVal, idx) => {
            const tX = 35 + idx * 25;
            return (
              <g key={vVal} opacity="0.45">
                <line x1={tX} y1="20" x2={tX} y2="28" stroke="#0f172a" strokeWidth="1.2" />
                <text x={tX - 4} y="16" fill="#0f172a" fontSize="7" fontFamily="monospace">{vVal}</text>
              </g>
            );
          })}
          <text x="175" y="52" fill="#475569" fontSize="8" fontWeight="bold">mL</text>

          {/* Plunger (slides right dynamically!) */}
          <g transform={`translate(${plungerTravel}, 0)`}>
            {/* Rubber tip */}
            <rect x="20" y="22" width="12" height="36" fill="url(#rubberStopperGrad)" stroke="#0f172a" strokeWidth="0.5" />
            {/* Shaft */}
            <rect x="32" y="34" width="160" height="12" fill="url(#chromeRodGrad)" stroke="#cbd5e1" strokeWidth="1" />
            {/* Handle flange */}
            <rect x="192" y="15" width="8" height="50" rx="2" fill="url(#chromeRodGrad)" />
          </g>

          {/* Gas collection area */}
          {gasVolumeEvolved > 0 && (
            <rect x="32" y="22" width={plungerTravel} height="36" fill="#e0f2fe" opacity="0.3" />
          )}
        </g>

        {/* ── GAS DELIVERY TUBE ── */}
        <g id="delivery-tube" fill="none">
          {/* Shadow / Outer outline */}
          <path d="M 286 207 L 305 207 L 305 145 L 290 145" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 286 207 L 305 207 L 305 145 L 290 145" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {/* Inner glass sheen line */}
          <path d="M 286 207 L 305 207 L 305 145 L 290 145" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />

          {/* Flowing bubbles inside the tube when reacting */}
          {status === "running" && gasVolumeEvolved > 0 && (
            <g fill="#38bdf8" stroke="none">
              <circle cx={286 + bubbleOffset * 3.8} cy="207" r="2.5" />
              <circle cx="305" cy={207 - bubbleOffset * 12.4} r="2.5" />
              <circle cx={305 - bubbleOffset * 3.8} cy="145" r="2.5" />
            </g>
          )}
        </g>
      </svg>

      {/* ── LIVE CALCULATIONS OVERLAY ── */}
      <div
        className="absolute top-4 left-4 bg-slate-900/90 text-slate-100 rounded-xl p-4 border border-slate-700/80 shadow-2xl font-mono text-[11px] space-y-2.5 backdrop-blur-md w-[220px]"
      >
        <div className="text-orange-400 font-extrabold text-[12px] border-b border-slate-700 pb-1.5 flex justify-between items-center">
          <span>🔥 Arrhenius Kinetics</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-950/80 text-orange-300 border border-orange-800">Gas Evolution</span>
        </div>
        {reactant ? (
          <div className="space-y-1.5">
            <p className="text-[10px] text-yellow-400 font-semibold">{kinetics?.label}</p>
            <p className="flex justify-between">
              <span className="text-slate-400">Temp (T):</span>
              <span className="font-bold text-white">{temperature.toFixed(1)} °C</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">Ea barrier:</span>
              <span className={`font-bold ${hasCatalyst ? "text-emerald-400" : "text-white"}`}>
                {Ea.toFixed(0)} kJ/mol
              </span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">Rate Coeff (k):</span>
              <span className="font-bold text-sky-300">
                {k > 1e-4 ? k.toFixed(5) : k.toExponential(3)} s⁻¹
              </span>
            </p>
            <p className="flex justify-between border-t border-slate-800/80 pt-1.5">
              <span className="text-slate-400">Reactant Mass:</span>
              <span className="font-bold text-white">{remainingMass.toFixed(3)} g</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">Gas Volume:</span>
              <span className="font-bold text-sky-400">{gasVolumeEvolved.toFixed(1)} mL</span>
            </p>
          </div>
        ) : (
          <p className="text-slate-500 italic">Select a reactant to begin decomposition study.</p>
        )}
      </div>
    </div>
  );
}
