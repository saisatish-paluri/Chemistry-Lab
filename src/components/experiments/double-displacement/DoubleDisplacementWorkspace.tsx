"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DoubleDisplacementState } from "@/lib/engine/types";
import { getSolubilityProductKsp } from "@/lib/engine/double-displacement-engine";

interface Props {
  state: DoubleDisplacementState;
  onMix?: () => void;
}

const W = 540;
const H = 600;

export default function DoubleDisplacementWorkspace({ state, onMix }: Props) {
  const {
    system,
    solution1Volume,
    solution2Volume,
    solution1Conc,
    solution2Conc,
    temperature,
    precipitateMass,
    mixingProgress,
    status,
  } = state;

  const [pouringAnimation, setPouringAnimation] = useState(false);

  const handleMixClick = () => {
    if (status === "ready" && onMix && !pouringAnimation) {
      setPouringAnimation(true);
      setTimeout(() => {
        onMix();
        setPouringAnimation(false);
      }, 1500); // Pouring time
    }
  };

  // Solubility calculations for the panel
  const Ksp = system ? getSolubilityProductKsp(system, temperature) : 0;
  
  // Calculate ion product Qsp
  const volTotalL = (solution1Volume + solution2Volume) / 1000.0;
  const n1 = solution1Conc * (solution1Volume / 1000.0);
  const n2 = solution2Conc * (solution2Volume / 1000.0);
  const cCation = n1 / volTotalL;
  const cAnion = n2 / volTotalL;
  
  // Qsp = [Cation][Anion] or [Cation][Anion]^2 for PbI2
  const Qsp = system === "pbno3-ki" 
    ? cCation * Math.pow(cAnion * 2, 2) 
    : cCation * cAnion;

  // Reactant system labels
  const getPrecipitateFormula = () => {
    if (system === "agno3-nacl") return "AgCl(s)";
    if (system === "pbno3-ki") return "PbI₂(s)";
    if (system === "bacl2-na2so4") return "BaSO₄(s)";
    return "None";
  };

  const getSystemDetails = () => {
    if (system === "agno3-nacl") return { label: "Silver Chloride", color: "#f8fafc", equation: "Ag⁺ + Cl⁻ → AgCl↓" };
    if (system === "pbno3-ki") return { label: "Lead Iodide", color: "#fbbf24", equation: "Pb²⁺ + 2I⁻ → PbI₂↓" };
    if (system === "bacl2-na2so4") return { label: "Barium Sulfate", color: "#cbd5e1", equation: "Ba²⁺ + SO₄²⁻ → BaSO₄↓" };
    return { label: "No system", color: "#ffffff", equation: "" };
  };

  const sysInfo = getSystemDetails();
  const beakerX = 140;
  const beakerY = 180;
  const beakerW = 260;
  const beakerH = 260;

  const totalVol = solution1Volume + solution2Volume;
  const liquidH = Math.min(beakerH * 0.8, (totalVol / 100) * (beakerH * 0.7));
  const liquidY = beakerY + beakerH - 5 - liquidH;

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
          <linearGradient id="reactant1Grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="reactant2Grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="mixedLiquidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f1f5f9" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="hotPlateActiveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="50%" stopColor="#f87171" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#0f172a" floodOpacity="0.65" />
          </filter>
        </defs>

        {/* ── STAGE TABLE ── */}
        <rect x="0" y="460" width="540" height="140" fill="url(#benchtopGrad)" />
        <line x1="0" y1="460" x2="540" y2="460" stroke="#06b6d4" strokeWidth="2.5" strokeOpacity="0.4" />

        {/* ── HEATER / HOT PLATE BASE ── */}
        <g id="hot-plate" filter="url(#shadowFilter)">
          {/* Base body */}
          <rect x="110" y="440" width="320" height="20" rx="4" fill="url(#ironBaseGrad)" stroke="#475569" strokeWidth="1" />
          {/* Chrome trim element */}
          <rect x="118" y="432" width="304" height="8" rx="2" fill="url(#chromeRodGrad)" stroke="#334155" strokeWidth="0.5" />
          {/* Hot plate top element */}
          <rect x="120" y="430" width="300" height="7" rx="1.5" fill="url(#ironBaseGrad)" />
          {/* Heat glow */}
          {temperature > 50 && (
            <rect x="120" y="430" width="300" height="7" rx="1.5" fill="url(#hotPlateActiveGrad)" opacity={Math.min(0.85, (temperature - 50) / 100)} />
          )}
        </g>

        {/* ── POURING TEST TUBES ANIMATION ── */}
        {system && status === "ready" && !pouringAnimation && (
          <g id="interactive-mix-prompt" className="cursor-pointer" onClick={handleMixClick}>
            <circle cx="270" cy="120" r="30" fill="#2563eb" className="animate-ping" opacity="0.15" />
            <circle cx="270" cy="120" r="24" fill="#2563eb" opacity="0.85" />
            <text x="270" y="124" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">POUR</text>
          </g>
        )}

        {/* Reactant 1 Test Tube (Left) */}
        {system && (status === "setup" || status === "ready" || pouringAnimation) && (
          <g
            id="tube-left"
            transform={
              pouringAnimation 
                ? "translate(170, 150) rotate(70)" 
                : "translate(80, 160) rotate(-15)"
            }
            className="transition-transform duration-[1500ms] ease-in-out"
            filter="url(#shadowFilter)"
          >
            {/* Tube outer body */}
            <rect x="-10" y="-80" width="20" height="100" rx="10" fill="none" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="1.8" />
            {/* Tube inner body (refraction) */}
            <rect x="-8.8" y="-78.8" width="17.6" height="97.6" rx="8.8" fill="url(#glassRefractionGrad)" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.6" />
            {/* Sheen highlight */}
            <path d="M -7 -76 L -7 10" stroke="url(#glassHighlightGrad)" strokeWidth="0.8" />
            
            {/* Liquid inside */}
            {mixingProgress < 0.5 && (
              <g>
                <rect x="-8.8" y="-60" width="17.6" height="78" rx="8.8" fill="url(#reactant1Grad)" opacity="0.65" />
                <path d="M -8.8 -60 Q 0 -58.5 8.8 -60" fill="none" stroke="#e2e8f0" strokeWidth="1.2" opacity="0.95" />
              </g>
            )}
          </g>
        )}

        {/* Reactant 2 Test Tube (Right) */}
        {system && (status === "setup" || status === "ready" || pouringAnimation) && (
          <g
            id="tube-right"
            transform={
              pouringAnimation 
                ? "translate(370, 150) rotate(-70)" 
                : "translate(460, 160) rotate(15)"
            }
            className="transition-transform duration-[1500ms] ease-in-out"
            filter="url(#shadowFilter)"
          >
            {/* Tube outer body */}
            <rect x="-10" y="-80" width="20" height="100" rx="10" fill="none" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="1.8" />
            {/* Tube inner body (refraction) */}
            <rect x="-8.8" y="-78.8" width="17.6" height="97.6" rx="8.8" fill="url(#glassRefractionGrad)" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.6" />
            {/* Sheen highlight */}
            <path d="M -7 -76 L -7 10" stroke="url(#glassHighlightGrad)" strokeWidth="0.8" />
            
            {/* Liquid inside */}
            {mixingProgress < 0.5 && (
              <g>
                <rect x="-8.8" y="-60" width="17.6" height="78" rx="8.8" fill="url(#reactant2Grad)" opacity="0.65" />
                <path d="M -8.8 -60 Q 0 -58.5 8.8 -60" fill="none" stroke="#bae6fd" strokeWidth="1.2" opacity="0.95" />
              </g>
            )}
          </g>
        )}

        {/* ── POURING LIQUID STREAMS ── */}
        {pouringAnimation && (
          <g stroke="#e2e8f0" strokeWidth="4" opacity="0.7">
            <line x1="165" y1="140" x2="210" y2="190" strokeDasharray="5 5" className="animate-pulse" />
            <line x1="375" y1="140" x2="330" y2="190" strokeDasharray="5 5" className="animate-pulse" />
          </g>
        )}

        {/* ── REACTION BEAKER ── */}
        <g id="reaction-beaker">
          {/* Liquid content inside beaker */}
          {mixingProgress > 0 && (
            <g>
              <rect
                x={beakerX + 3.5}
                y={liquidY}
                width={beakerW - 7}
                height={liquidH}
                fill="url(#mixedLiquidGrad)"
                opacity="0.55"
                rx="4.5"
              />
              {/* Meniscus */}
              <path
                d={`M ${beakerX + 3.5} ${liquidY} Q ${beakerX + beakerW/2} ${liquidY + 4} ${beakerX + beakerW - 3.5} ${liquidY}`}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="2.5"
              />
            </g>
          )}

          {/* Precipitate Cloud! */}
          {precipitateMass > 0 && (
            <g opacity={Math.min(0.9, (precipitateMass / (system === "pbno3-ki" ? 0.9 : 0.2)))}>
              {/* Cloud mass */}
              <ellipse cx="270" cy={liquidY + liquidH/2} rx={110 * mixingProgress} ry={liquidH/2.5} fill={sysInfo.color} opacity="0.75" />
              {/* Turbulence dots */}
              <circle cx="200" cy={liquidY + 50} r="12" fill={sysInfo.color} opacity="0.4" />
              <circle cx="230" cy={liquidY + 65} r="18" fill={sysInfo.color} opacity="0.45" />
              <circle cx="310" cy={liquidY + 55} r="16" fill={sysInfo.color} opacity="0.4" />
              <circle cx="330" cy={liquidY + 70} r="14" fill={sysInfo.color} opacity="0.45" />

              {/* Crystal grains settling at bottom */}
              {mixingProgress >= 0.8 && (
                <g>
                  {/* Scatter tiny triangles/polygons to look like crystal lattice solids */}
                  <polygon points="170,428 176,424 178,430" fill={sysInfo.color} stroke="rgba(0,0,0,0.15)" />
                  <polygon points="210,431 214,425 220,429" fill={sysInfo.color} stroke="rgba(0,0,0,0.15)" />
                  <polygon points="260,432 268,428 265,434" fill={sysInfo.color} stroke="rgba(0,0,0,0.15)" />
                  <polygon points="310,431 314,426 320,430" fill={sysInfo.color} stroke="rgba(0,0,0,0.15)" />
                  <polygon points="350,429 358,425 355,431" fill={sysInfo.color} stroke="rgba(0,0,0,0.15)" />
                </g>
              )}
            </g>
          )}

          {/* Glass body outer wall */}
          <g filter="url(#shadowFilter)">
            <rect x={beakerX} y={beakerY} width={beakerW} height={beakerH} rx="10" fill="none" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="2.5" />
            <rect x={beakerX + 2.5} y={beakerY + 2.5} width={beakerW - 5} height={beakerH - 5} rx="7.5" fill="url(#glassRefractionGrad)" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />
            {/* Specular highlights */}
            <path d={`M ${beakerX + 5} ${beakerY + 5} L ${beakerX + 5} ${beakerY + beakerH - 10}`} stroke="url(#glassHighlightGrad)" strokeWidth="1.5" />
            <path d={`M ${beakerX + beakerW - 5} ${beakerY + 5} L ${beakerX + beakerW - 5} ${beakerY + beakerH - 10}`} stroke="url(#glassHighlightGrad)" strokeWidth="1.5" />
            {/* Lip / Rim */}
            <path d={`M ${beakerX - 6} ${beakerY} Q ${beakerX} ${beakerY + 6} ${beakerX + 8} ${beakerY} L ${beakerX + beakerW - 8} ${beakerY} Q ${beakerX + beakerW} ${beakerY + 6} ${beakerX + beakerW + 6} ${beakerY}`} fill="url(#glassHighlightGrad)" opacity="0.6" />
          </g>
        </g>
      </svg>

      {/* ── LIVE CALCULATIONS OVERLAY ── */}
      <div
        className="absolute top-4 left-4 bg-slate-900/90 text-slate-100 rounded-xl p-4 border border-slate-700/80 shadow-2xl font-mono text-[11px] space-y-2.5 backdrop-blur-md w-[220px]"
      >
        <div className="text-cyan-400 font-extrabold text-[12px] border-b border-slate-700 pb-1.5 flex justify-between items-center">
          <span>📊 Solubility Product</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800">Equilibrium</span>
        </div>
        {system ? (
          <div className="space-y-1.5">
            <p className="text-[10px] text-yellow-400 font-semibold">{sysInfo.equation}</p>
            <p className="flex justify-between">
              <span className="text-slate-400">Temp (T):</span>
              <span className="font-bold text-white">{temperature.toFixed(1)} °C</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">Ion Product Q:</span>
              <span className="font-bold text-sky-300">
                {Qsp > 1e-3 ? Qsp.toFixed(4) : Qsp.toExponential(3)}
              </span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">Const Ksp(T):</span>
              <span className="font-bold text-emerald-400">{Ksp.toExponential(3)}</span>
            </p>
            <p className="flex justify-between border-t border-slate-800/80 pt-1.5 font-bold">
              <span className="text-slate-400">Precipitate:</span>
              <span className={precipitateMass > 0.01 ? "text-emerald-400" : "text-slate-300"}>
                {getPrecipitateFormula()}: {precipitateMass.toFixed(4)} g
              </span>
            </p>
            <p className="text-[9.5px] text-slate-500 italic mt-1 leading-normal">
              {Qsp > Ksp 
                ? "Status: Qsp > Ksp (Precipitation supersaturated)" 
                : "Status: Qsp ≤ Ksp (Soluble, no solid)"}
            </p>
          </div>
        ) : (
          <p className="text-slate-500 italic">Select a reactant system from the cabinet panel.</p>
        )}
      </div>
    </div>
  );
}
