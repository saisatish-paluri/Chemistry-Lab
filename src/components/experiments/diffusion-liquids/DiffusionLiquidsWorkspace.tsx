"use client";

import { useEffect, useState, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DiffusionLiquidsState } from "@/lib/engine/types";
import { getDiffusionCoefficient } from "@/lib/engine/diffusion-liquids-engine";

interface Props {
  state: DiffusionLiquidsState;
  onAddDroplet?: () => void;
}

const W = 540;
const H = 600;

export default function DiffusionLiquidsWorkspace({ state, onAddDroplet }: Props) {
  const {
    selectedSolute,
    temperature,
    stirringSpeed,
    addedDroplets,
    diffusionProgress,
    status,
  } = state;

  const [dropAnimation, setDropAnimation] = useState(false);
  const [stirAngle, setStirAngle] = useState(0);

  // Stir bar rotation animation
  useEffect(() => {
    if (stirringSpeed === 0) return;
    let animId: number;
    let lastTime = performance.now();
    const updateStir = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      // Angle change speed depends on RPM
      const speedDegPerSec = (stirringSpeed / 60) * 360;
      setStirAngle(prev => (prev + speedDegPerSec * delta) % 360);
      animId = requestAnimationFrame(updateStir);
    };
    animId = requestAnimationFrame(updateStir);
    return () => cancelAnimationFrame(animId);
  }, [stirringSpeed]);

  const handlePipetteClick = () => {
    if (status === "ready" && onAddDroplet && !dropAnimation) {
      setDropAnimation(true);
      setTimeout(() => {
        onAddDroplet();
        setDropAnimation(false);
      }, 800); // Wait for drop to reach water
    }
  };

  // Dimensions
  const beakerX = 130;
  const beakerY = 160;
  const beakerW = 280;
  const beakerH = 290;

  const waterLevelH = BeakerLiquidHeight(addedDroplets);
  const waterY = beakerY + beakerH - 20 - waterLevelH;

  function BeakerLiquidHeight(droplets: number) {
    // 220px base water level + slightly increases per drop
    return 200 + droplets * 4;
  }

  // Chemistry math parameters
  const D = selectedSolute ? getDiffusionCoefficient(selectedSolute, temperature, stirringSpeed) : 0;
  const tempK = temperature + 273.15;
  const soluteLabel = selectedSolute === "kmno4" ? "KMnO₄" : selectedSolute === "dye" ? "Methyl Red" : selectedSolute === "cuso4" ? "CuSO₄" : "None";
  const diffusionMethod = stirringSpeed > 0 ? "Convection + Molecular Diffusion" : "Pure Molecular Diffusion";

  // Color calculation for dispersing solute
  const getSoluteColorRGB = () => {
    if (selectedSolute === "kmno4") return "139, 92, 246"; // purple
    if (selectedSolute === "dye") return "239, 68, 68";     // red
    if (selectedSolute === "cuso4") return "59, 130, 246";   // blue
    return "255, 255, 255";
  };

  const rgb = getSoluteColorRGB();

  return (
    <div style={{ width: "100%", height: "auto", maxHeight: "100%", aspectRatio: "540/600" }} className="relative select-none">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "100%" }}
        className="drop-shadow-xl"
      >
        {/* Gradients */}
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
          <linearGradient id="waterBathGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="thermometerFluid" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#f87171" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
          <linearGradient id="teflonStirGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <radialGradient id="rubberBulbGrad" cx="35%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="60%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </radialGradient>
          <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#0f172a" floodOpacity="0.65" />
          </filter>

          {/* Dynamic diffusion radial pattern */}
          {selectedSolute && addedDroplets > 0 && (
            <radialGradient id="soluteSpread" cx="50%" cy="15%" r={`${15 + diffusionProgress * 85}%`}>
              <stop offset="0%" stopColor={`rgba(${rgb}, ${0.85 - diffusionProgress * 0.4})`} />
              <stop offset={`${Math.min(100, diffusionProgress * 100)}%`} stopColor={`rgba(${rgb}, ${0.4 - diffusionProgress * 0.15})`} />
              <stop offset="100%" stopColor={`rgba(${rgb}, 0)`} />
            </radialGradient>
          )}
        </defs>

        {/* ── BACKGROUND LAB STAGE ── */}
        <rect x="0" y="440" width="540" height="160" fill="url(#benchtopGrad)" />
        <line x1="0" y1="440" x2="540" y2="440" stroke="#0ea5e9" strokeWidth="2.5" strokeOpacity="0.4" />

        {/* ── STIRRER BASE ── */}
        <g id="magnetic-stirrer-base" filter="url(#shadowFilter)">
          {/* Base plate body */}
          <rect x="110" y="430" width="320" height="40" rx="8" fill="url(#ironBaseGrad)" stroke="#475569" strokeWidth="1" />
          <rect x="110" y="430" width="320" height="8" rx="4" fill="url(#chromeRodGrad)" />
          {/* Knob */}
          <circle cx="270" cy="455" r="12" fill="url(#chromeRodGrad)" stroke="#64748b" strokeWidth="2" />
          <line
            x1="270"
            y1="455"
            x2={270 + 10 * Math.cos((stirringSpeed / 600) * 2 * Math.PI - Math.PI / 2)}
            y2={455 + 10 * Math.sin((stirringSpeed / 600) * 2 * Math.PI - Math.PI / 2)}
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Indicator Light */}
          <circle cx="140" cy="450" r="5" fill={stirringSpeed > 0 ? "#10b981" : "#ef4444"} className={stirringSpeed > 0 ? "animate-pulse" : ""} />
          <text x="152" y="454" fill="#94a3b8" fontSize="10" fontFamily="monospace">STIRRER</text>
        </g>

        {/* ── BEAKER & LIQUID ── */}
        <g id="beaker">
          {/* Water liquid mass */}
          <rect
            x={beakerX + 3.5}
            y={waterY}
            width={beakerW - 7}
            height={waterLevelH}
            fill="url(#waterBathGrad)"
            opacity="0.75"
            rx="4.5"
          />

          {/* Solute spreading gradient layer */}
          {selectedSolute && addedDroplets > 0 && (
            <rect
              x={beakerX + 3.5}
              y={waterY}
              width={beakerW - 7}
              height={waterLevelH}
              fill="url(#soluteSpread)"
              rx="4.5"
            />
          )}

          {/* Water meniscus line */}
          {addedDroplets >= 0 && (
            <path
              d={`M ${beakerX + 3.5} ${waterY} Q ${beakerX + beakerW/2} ${waterY + 5} ${beakerX + beakerW - 3.5} ${waterY}`}
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="2.5"
              opacity="0.85"
            />
          )}

          {/* Beaker Glass Silhouette with Shadow */}
          <g filter="url(#shadowFilter)">
            {/* Outer wall */}
            <rect x={beakerX} y={beakerY} width={beakerW} height={beakerH} rx="8" fill="none" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="2.5" />
            {/* Inner refraction */}
            <rect x={beakerX + 2.5} y={beakerY + 2.5} width={beakerW - 5} height={beakerH - 5} rx="5.5" fill="url(#glassRefractionGrad)" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />
            {/* Specular sheens */}
            <path d={`M ${beakerX + 5} ${beakerY + 5} L ${beakerX + 5} ${beakerY + beakerH - 10}`} stroke="url(#glassHighlightGrad)" strokeWidth="1.5" />
            <path d={`M ${beakerX + beakerW - 5} ${beakerY + 5} L ${beakerX + beakerW - 5} ${beakerY + beakerH - 10}`} stroke="url(#glassHighlightGrad)" strokeWidth="1.5" />
            {/* Beaker Lip */}
            <path
              d={`M ${beakerX - 8} ${beakerY} Q ${beakerX} ${beakerY + 6} ${beakerX + 8} ${beakerY} L ${beakerX + beakerW - 8} ${beakerY} Q ${beakerX + beakerW} ${beakerY + 6} ${beakerX + beakerW + 8} ${beakerY} Z`}
              fill="url(#glassHighlightGrad)"
              opacity="0.6"
            />
          </g>

          {/* Graduations (Ticks on Beaker) */}
          {Array.from({ length: 5 }).map((_, idx) => {
            const tickVal = (idx + 1) * 100;
            const tickY = beakerY + beakerH - 40 - idx * 45;
            return (
              <g key={idx} opacity="0.35">
                <line x1={beakerX + 10} y1={tickY} x2={beakerX + 28} y2={tickY} stroke="#0f172a" strokeWidth="1.5" />
                <text x={beakerX + 34} y={tickY + 3.5} fill="#0f172a" fontSize="9" fontFamily="sans-serif">{tickVal}mL</text>
              </g>
            );
          })}
        </g>

        {/* ── ROTATING STIR BAR ── */}
        {stirringSpeed > 0 && (
          <g transform={`translate(${beakerX + beakerW/2}, ${beakerY + beakerH - 22})`}>
            <g transform={`rotate(${stirAngle})`}>
              <rect x="-35" y="-6" width="70" height="12" rx="6" fill="url(#teflonStirGrad)" stroke="#cbd5e1" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="3" fill="#cbd5e1" />
            </g>
          </g>
        )}

        {/* ── THERMOMETER (Dipped) ── */}
        <g id="thermometer" transform="translate(340, 100)" filter="url(#shadowFilter)">
          {/* Glass tube backing */}
          <rect x="0" y="0" width="14" height="280" rx="7" fill="rgba(255, 255, 255, 0.9)" stroke="#cbd5e1" strokeWidth="1.5" />
          <circle cx="7" cy="275" r="14" fill="rgba(255, 255, 255, 0.9)" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x="1" y="2" width="2" height="276" fill="rgba(255, 255, 255, 0.8)" opacity="0.6" />

          {/* Thermometer fluid (red column) */}
          {(() => {
            const minTempY = 240;
            const maxTempY = 40;
            const fillHeight = minTempY - ((temperature - 10) / 85) * (minTempY - maxTempY);
            return (
              <>
                <rect x="5" y={fillHeight} width="4" height={270 - fillHeight} fill="url(#thermometerFluid)" rx="2" />
                <circle cx="7" cy="275" r="10" fill="url(#thermometerFluid)" />
                <circle cx="5" cy="273" r="3" fill="#ffffff" opacity="0.6" />
              </>
            );
          })()}

          {/* Ticks & numbers */}
          {[10, 30, 50, 70, 90].map((tVal) => {
            const tY = 240 - ((tVal - 10) / 85) * 200;
            return (
              <g key={tVal} opacity="0.4">
                <line x1="10" y1={tY} x2="14" y2={tY} stroke="#0f172a" strokeWidth="1" />
                <text x="18" y={tY + 3} fill="#0f172a" fontSize="8" fontFamily="monospace">{tVal}°C</text>
              </g>
            );
          })}
        </g>

        {/* ── PIPETTE / DROPPER (Interactive at Top Center) ── */}
        {selectedSolute && (
          <g
            id="pipette"
            transform="translate(245, 20)"
            className="cursor-pointer group"
            onClick={handlePipetteClick}
          >
            {/* Rubber bulb with 3D gradient */}
            <path d="M 10 30 C 10 5, 40 5, 40 30 C 40 42, 32 45, 30 55 L 20 55 C 18 45, 10 42, 10 30 Z" fill="url(#rubberBulbGrad)" stroke="#b91c1c" strokeWidth="1" />
            {/* Glass body with refraction and sheen */}
            <rect x="22" y="55" width="6" height="50" fill="url(#glassRefractionGrad)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
            <rect x="22" y="55" width="1" height="50" fill="#ffffff" opacity="0.6" />
            <path d="M 22 105 L 25 120 L 25 122 L 23 122 L 23 124 L 27 124 L 27 122 L 25 122 L 25 120 Z" fill="url(#glassRefractionGrad)" stroke="#cbd5e1" strokeWidth="1" />
            {/* Liquid inside pipette */}
            {addedDroplets === 0 && (
              <rect x="23" y="75" width="4" height="30" fill={`rgb(${rgb})`} opacity="0.8" />
            )}

            {/* Pulsing indicator when ready to drip */}
            {status === "ready" && !dropAnimation && (
              <circle cx="25" cy="132" r="6" fill="#10b981" className="animate-ping" opacity="0.6" />
            )}
          </g>
        )}

        {/* ── DROP ANIMATION ── */}
        <AnimatePresence>
          {dropAnimation && (
            <motion.circle
              key="drop"
              cx="270"
              cy="144"
              r="4"
              fill={`rgb(${rgb})`}
              initial={{ y: 0, opacity: 1, scale: 1 }}
              animate={{ y: waterY - 144, opacity: [1, 1, 0.9, 0], scale: [1, 1, 0.8, 1.2] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeIn" }}
            />
          )}
        </AnimatePresence>

        {/* Water ripple on impact */}
        {status === "running" && diffusionProgress < 0.08 && (
          <circle cx="270" cy={waterY} r={10 + diffusionProgress * 150} fill="none" stroke={`rgba(${rgb}, ${1.0 - diffusionProgress * 12})`} strokeWidth="1.5" opacity="0.8" />
        )}
      </svg>

      {/* ── LIVE CALCULATIONS OVERLAY ── */}
      <div
        className="absolute top-4 left-4 bg-slate-900/90 text-slate-100 rounded-xl p-4 border border-slate-700/80 shadow-2xl font-mono text-[11px] space-y-2.5 backdrop-blur-md w-[220px]"
      >
        <div className="text-sky-400 font-extrabold text-[12px] border-b border-slate-700 pb-1.5 flex justify-between items-center">
          <span>📊 Live Physics</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800">Fick's 2nd Law</span>
        </div>
        <div className="space-y-1.5">
          <p className="flex justify-between">
            <span className="text-slate-400">Solute:</span>
            <span className="font-bold text-white">{soluteLabel}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-slate-400">Temp (T):</span>
            <span className="font-bold text-orange-400">{tempK.toFixed(1)} K</span>
          </p>
          <p className="flex justify-between">
            <span className="text-slate-400">Stir Speed:</span>
            <span className="font-bold text-emerald-400">{stirringSpeed} RPM</span>
          </p>
          <p className="flex justify-between">
            <span className="text-slate-400">Diff Coeff (D):</span>
            <span className="font-bold text-sky-300">{(D * 10).toFixed(4)} × 10⁻⁵</span>
          </p>
          <p className="text-[10px] text-slate-500 italic mt-1 border-t border-slate-800/80 pt-1.5 leading-normal">
            Method: {diffusionMethod}
          </p>
          <div className="space-y-1 border-t border-slate-800/80 pt-2">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Mixing uniformity:</span>
              <span className="font-bold text-white">{(diffusionProgress * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-150"
                style={{ width: `${diffusionProgress * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
