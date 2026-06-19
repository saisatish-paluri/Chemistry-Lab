"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { NeutralizationState } from "@/lib/engine/types";

interface Props {
  state: Pick<NeutralizationState,
    "currentStep" | "hclVolumeMl" | "naohVolumeMl" | "isMixing" |
    "mixProgress" | "initialTempC" | "currentTempC" | "saltFormed" | "reactionDone" |
    "acidType" | "baseType" | "acidConc" | "baseConc" | "beakerInsulated" | "currentPh" |
    "heatEvolvedJ" | "indicator"
  >;
  valvePosition: number;
  isFillingBurette: boolean;
  fillProgress: number;
  isBuretteFilled: boolean;
}

interface Ripple { id: number; cx: number; cy: number }

const W = 560;
const H = 660;

function getIndicatorColor(indicator: string, pH: number): string {
  if (indicator === "phenolphthalein") {
    if (pH < 8.2) {
      return "rgba(224, 242, 254, 0.35)"; // colorless / faint blue
    } else if (pH >= 10.0) {
      return "rgba(236, 72, 153, 0.75)"; // magenta
    } else {
      const t = (pH - 8.2) / (10.0 - 8.2);
      const r = Math.round(224 + t * (236 - 224));
      const g = Math.round(242 + t * (72 - 242));
      const b = Math.round(254 + t * (153 - 254));
      const opacity = 0.35 + t * 0.40;
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
  }

  if (indicator === "bromothymol") {
    if (pH < 6.0) {
      return "rgba(253, 224, 71, 0.65)"; // yellow
    } else if (pH > 7.6) {
      return "rgba(37, 99, 235, 0.65)"; // blue
    } else {
      const t = (pH - 6.0) / (7.6 - 6.0);
      const r = Math.round(253 + t * (37 - 253));
      const g = Math.round(224 + t * (99 - 224));
      const b = Math.round(71 + t * (235 - 71));
      return `rgba(${r}, ${g}, ${b}, 0.65)`;
    }
  }

  if (indicator === "methyl-orange") {
    if (pH < 3.1) {
      return "rgba(239, 68, 68, 0.70)"; // red
    } else if (pH > 4.4) {
      return "rgba(251, 191, 36, 0.70)"; // yellow-orange
    } else {
      const t = (pH - 3.1) / (4.4 - 3.1);
      const r = Math.round(239 + t * (251 - 239));
      const g = Math.round(68 + t * (191 - 68));
      const b = Math.round(68 + t * (36 - 68));
      return `rgba(${r}, ${g}, ${b}, 0.70)`;
    }
  }

  // Universal Indicator color map
  const colors = [
    { ph: 3,  rgb: [239, 68, 68] },   // red
    { ph: 4,  rgb: [249, 115, 22] },  // orange-red
    { ph: 5,  rgb: [245, 158, 11] },  // orange
    { ph: 6,  rgb: [234, 179, 8] },   // yellow
    { ph: 7,  rgb: [34, 197, 94] },   // green
    { ph: 8,  rgb: [13, 148, 136] },  // blue-green
    { ph: 9,  rgb: [37, 99, 235] },   // blue
    { ph: 10, rgb: [124, 58, 237] },  // violet
    { ph: 11, rgb: [162, 28, 175] },  // purple
  ];

  if (pH <= 3) return "rgba(239, 68, 68, 0.70)";
  if (pH >= 11) return "rgba(162, 28, 175, 0.70)";

  for (let i = 0; i < colors.length - 1; i++) {
    const c1 = colors[i];
    const c2 = colors[i+1];
    if (pH >= c1.ph && pH <= c2.ph) {
      const t = (pH - c1.ph) / (c2.ph - c1.ph);
      const r = Math.round(c1.rgb[0] + t * (c2.rgb[0] - c1.rgb[0]));
      const g = Math.round(c1.rgb[1] + t * (c2.rgb[1] - c1.rgb[1]));
      const b = Math.round(c1.rgb[2] + t * (c2.rgb[2] - c1.rgb[2]));
      return `rgba(${r}, ${g}, ${b}, 0.70)`;
    }
  }
  return "rgba(34, 197, 94, 0.70)";
}

function getBasicIndicatorColor(indicator: string): string {
  if (indicator === "phenolphthalein") return "rgba(236, 72, 153, 0.75)"; // magenta
  if (indicator === "bromothymol")     return "rgba(37, 99, 235, 0.75)"; // blue
  if (indicator === "methyl-orange")   return "rgba(251, 191, 36, 0.75)"; // yellow
  return "rgba(162, 28, 175, 0.75)"; // universal violet
}

export default function NeutralizationWorkspace({
  state, valvePosition, isFillingBurette, fillProgress, isBuretteFilled,
}: Props) {
  const {
    currentStep, hclVolumeMl, naohVolumeMl, isMixing, mixProgress,
    initialTempC, currentTempC, saltFormed, acidType, baseType,
    acidConc, baseConc, beakerInsulated, currentPh, heatEvolvedJ, indicator
  } = state;
  
  const rxnPhase = ["mix", "observe", "record"].includes(currentStep);
  const rxnFill  = rxnPhase ? 0.36 + mixProgress * 0.36 : 0;

  const [ripples, setRipples] = useState<Ripple[]>([]);
  const rippleId  = useRef(0);
  const rippleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (valvePosition === 0) { if (rippleRef.current) clearInterval(rippleRef.current); return; }
    const interval = valvePosition === 1 ? 1000 : valvePosition === 2 ? 280 : 80;
    
    rippleRef.current = setInterval(() => {
      rippleId.current += 1;
      const nid = rippleId.current;
      const cx  = 258 + (Math.random() - 0.5) * 45;
      const cy  = 470 - 196 * rxnFill + (Math.random() - 0.5) * 5;
      startTransition(() => setRipples(p => [...p.slice(-5), { id: nid, cx, cy }]));
      setTimeout(() => startTransition(() => setRipples(p => p.filter(r => r.id !== nid))), 900);
    }, interval);
    
    return () => { if (rippleRef.current) clearInterval(rippleRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valvePosition, currentPh]);

  const hclFill      = currentStep === "measure-hcl" ? 0 : Math.min(hclVolumeMl / 40, 1);

  const prog = Math.min(mixProgress, 1);
  const rColor = getIndicatorColor(indicator, currentPh);

  // Thermometer mapping: 20°C is at y = 396, 45°C is at y = 313.5 (span of 25°C, 82.5px)
  const T = Math.max(20, Math.min(45, currentTempC));
  const mercH = 6 + (T - 20) * 3.3; // top of mercury matches tick exactly
  const tempPct = (T - 20) / 25;
  const mercColor = T > 35 ? "#dc2626" : T > 28 ? "#f97316" : "#3b82f6";

  const acidName = acidType === "strong" ? "HCl" : "CH₃COOH";
  const baseName = baseType === "strong" ? "NaOH" : "NH₃";
  const saltName = (acidType === "strong" && baseType === "strong") ? "NaCl" 
                 : (acidType === "weak" && baseType === "strong") ? "CH₃COONa"
                 : (acidType === "strong" && baseType === "weak") ? "NH₄Cl"
                 : "CH₃COONH₄";

  const nMol      = (hclVolumeMl / 1000) * acidConc;
  const nReacted  = Math.min(nMol, (naohVolumeMl / 1000) * baseConc * prog);
  const heatKJ    = heatEvolvedJ / 1000;
  const deltaT    = (currentTempC - initialTempC).toFixed(1);
  const showCalc  = prog > 0.01 && currentStep !== "measure-hcl";

  // Cylinder tilt and pour animations
  const cylinderRotate = isFillingBurette ? -75 : 0;
  const cylinderX = isFillingBurette ? -145 : 0;
  const cylinderY = isFillingBurette ? -161 : 0;

  // Cylinder liquid level drains during pouring
  const isNaOHMeasured = naohVolumeMl > 0;
  const cylinderFill = isFillingBurette ? 0.72 * (1 - fillProgress) : (isBuretteFilled || rxnPhase ? 0 : (isNaOHMeasured ? 0.72 : 0));

  // Burette liquid column height (bottom y = 215, height up to 170)
  const buretteLiquidHeight = isFillingBurette 
    ? 165 * fillProgress 
    : (isBuretteFilled || rxnPhase ? 165 * (1 - prog) : 0);
  const buretteLiquidY = 215 - buretteLiquidHeight;

  // Rotating stopcock valve angle
  const stopcockAngle = valvePosition === 0 ? 0 : valvePosition === 1 ? 30 : valvePosition === 2 ? 60 : 90;

  // Local indicator flash opacity: flashes pink/basic color near the titration stream impact point
  const flashOpacity = valvePosition > 0 && currentPh < 8.5 ? (valvePosition === 1 ? [0.2, 0.8, 0.2] : [0.4, 0.9, 0.4]) : 0;

  return (
    <div style={{ width: "100%", height: "auto", maxHeight: "100%", aspectRatio: "518/612" }}>
      <svg viewBox="14 48 518 612" style={{ width: "100%", height: "100%" }}>
        <defs>
          <pattern id="neut-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.75" fill="rgba(148,163,184,0.22)" />
          </pattern>
          <linearGradient id="ng-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#f1f5f9" />
          </linearGradient>
          <linearGradient id="ng-bench" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="15%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="metal-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="25%" stopColor="#64748b" />
            <stop offset="50%" stopColor="#cbd5e1" />
            <stop offset="75%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="ng-glass-specular" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.45)" />
            <stop offset="10%" stopColor="rgba(255, 255, 255, 0.15)" />
            <stop offset="85%" stopColor="rgba(255, 255, 255, 0.08)" />
            <stop offset="92%" stopColor="rgba(255, 255, 255, 0.35)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.65)" />
          </linearGradient>
          <linearGradient id="ng-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="rgba(255,255,255,0.65)" />
            <stop offset="45%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.25)" />
          </linearGradient>
          <filter id="ng-soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" />
          </filter>
          <linearGradient id="burette-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(187, 247, 208, 0.65)" />
            <stop offset="45%" stopColor="rgba(255, 255, 255, 0.3)" />
            <stop offset="100%" stopColor="rgba(187, 247, 208, 0.85)" />
          </linearGradient>
          <filter id="ng-drop">
            <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="rgba(0,0,0,0.15)" />
          </filter>
          <filter id="ng-glow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="heat-aura" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="15" result="blur" />
          </filter>
          
          <clipPath id="hcl-c"><path d="M48 190 Q58 198 58 200 L58 390 Q58 402 70 402 L150 402 Q162 402 162 390 L162 200 L58 200 C54 200 50 198 48 190 Z" /></clipPath>
          <clipPath id="naoh-c"><rect x="380" y="186" width="54" height="212" /></clipPath>
          <clipPath id="rxn-c"><path d="M172 258 Q182 266 182 268 L182 456 Q182 470 196 470 L328 470 Q342 470 342 456 L342 268 L182 268 C178 268 174 266 172 258 Z" /></clipPath>
          <clipPath id="thm-c"><rect x="476" y="198" width="12" height="206" /></clipPath>
          <clipPath id="burette-clip"><rect x="257" y="44" width="10" height="171" rx="1" /></clipPath>
        </defs>

        {/* Background */}
        <rect width={W} height={H} fill="url(#ng-wall)" />
        <rect width={W} height={H} fill="url(#neut-dots)" opacity="0.7" />

        {/* Header bar */}
        <rect x="0" y="0" width={W} height="52" fill="rgba(248,250,252,0.97)" />
        <line x1="0" y1="52" x2={W} y2="52" stroke="rgba(226,232,240,0.9)" strokeWidth="1" />
        <text x={W/2} y="32" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e293b" letterSpacing="-0.3">
          Neutralisation Titration: {acidName}(aq) + {baseName}(aq) → {saltName}(aq) + H₂O(l)
        </text>
        <text x={W/2} y="45" textAnchor="middle" fontSize="9.5" fill="#94a3b8">
          Burette Titrator apparatus · Exothermic neutralisation
        </text>

        {/* Lab bench */}
        <rect x="0" y={H - 128} width={W} height="128" fill="url(#ng-bench)" />
        <rect x="0" y={H - 128} width={W} height="6" fill="rgba(255,255,255,0.06)" />
        <line x1="0" y1={H - 128} x2={W} y2={H - 128} stroke="#475569" strokeWidth="1.5" />
        <rect x="0" y={H - 130} width={W} height="2"   fill="#94a3b8" opacity="0.8" />
        {[1, 2, 3].map(i => (
          <line key={i} x1={i * 140} y1={H-128} x2={i*140} y2={H} stroke="rgba(148,163,184,0.08)" strokeWidth="1" />
        ))}

        {/* Retort Stand Base on bench */}
        {rxnPhase && (
          <>
            <rect x="156" y={H-138} width="112" height="10" rx="3" fill="url(#metal-grad)" filter="url(#ng-drop)" />
            <rect x="210" y="52" width="6" height={H-190} rx="2" fill="url(#metal-grad)" />
          </>
        )}

        {/* Step Guide Pill */}
        <rect x="14" y="62" width="190" height="24" rx="7"
          fill="rgba(255,255,255,0.94)" stroke="rgba(148,163,184,0.3)" strokeWidth="1" />
        <circle cx="26" cy="74" r="4.5" fill="#2563eb" />
        <text x="35" y="78" fontSize="10" fontWeight="600" fill="#1d4ed8">
          {currentStep === "measure-hcl"  ? `Step 1 — Measure ${acidName}` :
           currentStep === "measure-naoh" ? `Step 2 — Measure ${baseName}` :
           currentStep === "mix"          ? (isBuretteFilled ? "Step 3 — Titration Run" : "Step 3 — Fill Burette") :
           currentStep === "observe"      ? "Step 4 — Observe Temp." :
           "Step 5 — Record Results"}
        </text>

        {/* Left Beaker Drop Shadow */}
        <ellipse cx="110" cy="404" rx="55" ry="5.5" fill="rgba(15,23,42,0.22)" filter="url(#ng-soft)" />

        {/* ─── HCl BEAKER (left) ─── */}
        <g filter="url(#ng-drop)">
          <path d="M48 190 Q58 198 58 200 L58 390 Q58 402 70 402 L150 402 Q162 402 162 390 L162 200 L58 200 C54 200 50 198 48 190 Z"
            fill="url(#ng-glass-specular)" stroke="#94a3b8" strokeWidth="2.0" />
          {/* Glass specular sheen highlight */}
          <path d="M54 206 L54 382 Q54 394 66 394" fill="none" stroke="rgba(255,255,255,0.48)" strokeWidth="2.5" strokeLinecap="round" />
          {[{y:250,v:"30"},{y:297,v:"20"},{y:344,v:"10"}].map(({y,v}) => (
            <g key={v}>
              <line x1="60" y1={y} x2="72" y2={y} stroke="#94a3b8" strokeWidth="1" />
              <text x="75" y={y+4} fontSize="8.5" fill="#64748b">{v}</text>
            </g>
          ))}
          <motion.rect x="60" y={402 - 190*hclFill} width="100" height={190*hclFill}
            fill="rgba(224, 242, 254, 0.45)" clipPath="url(#hcl-c)"
            animate={{ y: 402-190*hclFill, height: 190*hclFill }}
            transition={{ duration: 1.3, ease: "easeOut" }}
          />
          {hclFill > 0.05 && (
            <motion.path
              d={`M60 ${402-190*hclFill} Q110 ${402-190*hclFill-7} 160 ${402-190*hclFill}`}
              fill="none" stroke="rgba(147, 197, 253, 0.6)" strokeWidth="1.5"
              animate={{ d: `M60 ${402-190*hclFill} Q110 ${402-190*hclFill-7} 160 ${402-190*hclFill}` }}
            />
          )}
          <rect x="60" y="202" width="14" height="196" fill="url(#ng-sheen)" opacity="0.85" rx="4" />
          {hclFill > 0.05 && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <rect x="163" y={402-190*hclFill-11} width="38" height="17" rx="4"
                fill="rgba(219,234,254,0.95)" stroke="rgba(147,197,253,0.4)" strokeWidth="0.8" />
              <text x="182" y={402-190*hclFill+1} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#1e40af">
                {(hclFill*40).toFixed(0)} mL
              </text>
            </motion.g>
          )}
        </g>
        <text x="110" y="424" textAnchor="middle" fontSize="12.5" fontWeight="800" fill="#1e3a8a">{acidName}</text>
        <text x="110" y="438" textAnchor="middle" fontSize="9" fill="#78716c">{acidConc.toFixed(2)} M · 25 mL</text>

        {/* ─── NaOH CYLINDER (right) ─── */}
        {/* Tilts and translates to top of burette during fill phase */}
        {/* Shadow on the bench for the cylinder (only visible when not tilted/moved) */}
        {cylinderRotate === 0 && (
          <ellipse cx="407" cy="402" rx="32" ry="4.5" fill="rgba(15,23,42,0.22)" filter="url(#ng-soft)" />
        )}
        <motion.g
          animate={{ rotate: cylinderRotate, x: cylinderX, y: cylinderY }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{ transformOrigin: "407px 181px" }}
          filter="url(#ng-drop)"
        >
          <rect x="380" y="186" width="54" height="212" rx="5"
            fill="url(#ng-glass-specular)" stroke="#94a3b8" strokeWidth="2.0" />
          {/* Glass specular sheen highlight */}
          <rect x="383" y="190" width="4" height="204" rx="2" fill="rgba(255,255,255,0.48)" />
          <rect x="378" y="181" width="58" height="9" rx="5"
            fill="url(#ng-glass-specular)" stroke="#94a3b8" strokeWidth="1.3" />
          {[{y:220,v:"25"},{y:258,v:"18"},{y:300,v:"11"},{y:342,v:"5"}].map(({y,v}) => (
            <g key={v}>
              <line x1="382" y1={y} x2="392" y2={y} stroke="#94a3b8" strokeWidth="0.9" />
              <text x="394" y={y+3} fontSize="7.5" fill="#64748b">{v}</text>
            </g>
          ))}
          {isNaOHMeasured && (
            <>
              <motion.rect x="382" y={398-200*cylinderFill} width="50" height={200*cylinderFill}
                fill="rgba(187,247,208,0.72)" clipPath="url(#naoh-c)"
                animate={{ height: 200*cylinderFill, y: 398-200*cylinderFill }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
              {cylinderFill > 0.05 && (
                <path d={`M382 ${398-200*cylinderFill} Q407 ${398-200*cylinderFill-6} 432 ${398-200*cylinderFill}`}
                  fill="none" stroke="rgba(34,197,94,0.55)" strokeWidth="1.5"
                />
              )}
            </>
          )}
          <rect x="382" y="188" width="9" height="208" fill="url(#ng-sheen)" opacity="0.75" rx="3" />
        </motion.g>
        {isNaOHMeasured && !isBuretteFilled && !rxnPhase && (
          <>
            <text x="407" y="422" textAnchor="middle" fontSize="12.5" fontWeight="800" fill="#166534">{baseName}</text>
            <text x="407" y="436" textAnchor="middle" fontSize="9" fill="#78716c">{baseConc.toFixed(2)} M · 25 mL</text>
          </>
        )}

        {/* Pour stream from cylinder to burette during filling */}
        {isFillingBurette && fillProgress < 0.95 && (
          <motion.line
            x1="262" y1="20" x2="262" y2="45"
            stroke="rgba(187,247,208,0.9)"
            strokeWidth="3.2"
            strokeDasharray="6 4"
            animate={{ strokeDashoffset: [0, -10] }}
            transition={{ duration: 0.3, repeat: Infinity, ease: "linear" }}
          />
        )}

        {/* Beaker Heat Aura (scaled with energy released) */}
        <AnimatePresence>
          {heatEvolvedJ > 50 && (
            <motion.path
              d="M178 266 L178 456 Q178 474 196 474 L328 474 Q346 474 346 456 L346 266"
              fill="none"
              stroke="#ef4444"
              strokeWidth="20"
              strokeLinecap="round"
              filter="url(#heat-aura)"
              initial={{ opacity: 0 }}
              animate={{ opacity: Math.min(0.65, 0.15 + (heatEvolvedJ / 3000) * 0.50) }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </AnimatePresence>

        {/* Central Beaker Drop Shadow */}
        <ellipse cx="262" cy="472" rx="85" ry="6" fill="rgba(15,23,42,0.24)" filter="url(#ng-soft)" />

        {/* ─── REACTION BEAKER (center) ─── */}
        <g filter="url(#ng-drop)">
          <path d="M172 258 Q182 266 182 268 L182 456 Q182 470 196 470 L328 470 Q342 470 342 456 L342 268 L182 268 C178 268 174 266 172 258 Z"
            fill="url(#ng-glass-specular)" stroke="#475569" strokeWidth="2.4" />
          {/* Glass specular sheen highlight */}
          <path d="M178 274 L178 448 Q178 462 190 462" fill="none" stroke="rgba(255,255,255,0.48)" strokeWidth="2.5" strokeLinecap="round" />
          {[{y:315,v:"50"},{y:358,v:"35"},{y:400,v:"20"}].map(({y,v}) => (
            <g key={v}>
              <line x1="185" y1={y} x2="200" y2={y} stroke="#94a3b8" strokeWidth="1" />
              <text x="203" y={y+4} fontSize="8.5" fill="#64748b">{v}</text>
            </g>
          ))}
          {rxnFill > 0.05 && (
            <motion.rect x="185" y={470-196*rxnFill} width="155" height={196*rxnFill}
              fill={rColor} clipPath="url(#rxn-c)"
              animate={{ y:470-196*rxnFill, height:196*rxnFill, fill:rColor }}
              transition={{ duration:0.3, ease: "easeOut" }}
            />
          )}
          {rxnFill > 0.06 && (
            <motion.path
              d={`M185 ${470-196*rxnFill} Q262 ${470-196*rxnFill-9} 339 ${470-196*rxnFill}`}
              fill="none" stroke="rgba(148,163,184,0.5)" strokeWidth="1.5"
              animate={{ d:`M185 ${470-196*rxnFill} Q262 ${470-196*rxnFill-9} 339 ${470-196*rxnFill}` }}
            />
          )}
          <rect x="185" y="270" width="16" height="198" fill="url(#ng-sheen)" opacity="0.88" rx="4" />
        </g>
        <text x="262" y="494" textAnchor="middle" fontSize="11" fontWeight="700" fill="#475569">
          {beakerInsulated ? "Calorimeter Vessel" : "Reaction Beaker"}
        </text>

        {/* Local indicator color flash near dripping point */}
        {valvePosition > 0 && rxnFill > 0.1 && (
          <motion.ellipse
            cx="262"
            cy={470 - 196 * rxnFill}
            rx="16" ry="6"
            fill={getBasicIndicatorColor(indicator)}
            filter="url(#ng-glow)"
            animate={{
              opacity: flashOpacity,
              scale: valvePosition === 1 ? [0.8, 1.2, 0.8] : [0.9, 1.4, 0.9]
            }}
            transition={{
              duration: valvePosition === 1 ? 0.9 : 0.45,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}

        {/* Calorimeter Sleeve Shield */}
        <AnimatePresence>
          {beakerInsulated && (
            <motion.g
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0 }}
              style={{ transformOrigin: "262px 470px" }}
              transition={{ duration: 0.4 }}
            >
              <path
                d="M174 274 L174 456 Q174 478 196 478 L328 478 Q350 478 350 456 L350 274 L336 274 L336 454 Q336 464 328 464 L196 464 Q188 464 188 454 L188 274 Z"
                fill="#f1f5f9"
                stroke="#cbd5e1"
                strokeWidth="1.5"
              />
              <rect x="170" y="262" width="184" height="12" rx="4" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
              <text x="262" y="271" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#94a3b8">
                CALORIMETER SHIELD
              </text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* Drip Ripples */}
        <AnimatePresence>
          {ripples.map(r => (
            <motion.ellipse key={r.id}
              cx={r.cx} cy={r.cy} rx="0" ry="0"
              fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"
              animate={{ rx:24, ry:6, opacity:[0.9,0] }}
              transition={{ duration:0.8, ease:"easeOut" }}
            />
          ))}
        </AnimatePresence>

        {/* Liquid Swirl indicator (when actively dripping/mixing) */}
        <AnimatePresence>
          {valvePosition > 0 && (
            <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              {[0,120,240].map((ang, i) => (
                <motion.path key={i}
                  d={`M262 420 Q${262+34*Math.cos((ang+42)*Math.PI/180)} ${420+34*Math.sin((ang+42)*Math.PI/180)} ${262+40*Math.cos(ang*Math.PI/180)} ${420+40*Math.sin(ang*Math.PI/180)}`}
                  fill="none" stroke="rgba(255,255,255,0.52)" strokeWidth="2.2" strokeLinecap="round"
                  animate={{ rotate:360 }}
                  transition={{ duration:1.1, repeat:Infinity, ease:"linear", delay:i*0.35 }}
                  style={{ transformOrigin:"262px 420px" }}
                />
              ))}
            </motion.g>
          )}
        </AnimatePresence>

        {/* Exothermic Heat waves */}
        <AnimatePresence>
          {prog > 0.05 && !state.reactionDone && (
            <motion.g initial={{ opacity:0 }} animate={{ opacity: beakerInsulated ? 0.12 : 0.78 }} exit={{ opacity:0 }}>
              {[218,248,278,308].map((x, i) => (
                <motion.path key={x}
                  d={`M${x} ${470-196*rxnFill-7} Q${x+10} ${470-196*rxnFill-26} ${x} ${470-196*rxnFill-44}`}
                  fill="none"
                  stroke={tempPct>0.55 ? "rgba(239,68,68,0.55)" : "rgba(249,115,22,0.48)"}
                  strokeWidth="2" strokeLinecap="round"
                  animate={{ y:[-3,3,-3] }}
                  transition={{ duration:1.5+i*0.2, repeat:Infinity, delay:i*0.28 }}
                />
              ))}
            </motion.g>
          )}
        </AnimatePresence>

        {/* Stirring rod body */}
        {(isMixing || currentStep==="observe" || currentStep==="record") && (
          <motion.g>
            <motion.line x1="258" y1="236" x2="266" y2="463"
              stroke="#94a3b8" strokeWidth="4.5" strokeLinecap="round"
              animate={valvePosition > 0 ? { x1:[253,272,253], x2:[258,275,258] } : {}}
              transition={{ duration:1.1, repeat:Infinity, ease:"easeInOut" }}
            />
            <motion.circle cx="262" cy="236" r="5.5" fill="#64748b"
              animate={valvePosition > 0 ? { cx:[255,272,255] } : {}}
              transition={{ duration:1.1, repeat:Infinity, ease:"easeInOut" }}
            />
          </motion.g>
        )}

        {/* Salt crystals precipitation at base */}
        <AnimatePresence>
          {saltFormed && (
            <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              {[[228,445],[252,460],[276,452],[298,459],[243,440],[270,444]].map(([cx,cy],i) => (
                <motion.rect key={i}
                  x={cx-4} y={cy-4} width="8" height="8"
                  fill="rgba(255,255,255,0.9)" stroke="rgba(186,230,253,0.6)" strokeWidth="0.9"
                  transform={`rotate(45 ${cx} ${cy})`}
                  animate={{ opacity:[0.4,1,0.4] }}
                  transition={{ duration:2.2, repeat:Infinity, delay:i*0.38 }}
                />
              ))}
            </motion.g>
          )}
        </AnimatePresence>

        {/* ─── THERMOMETER (right) ─── */}
        <g>
          <rect x="473" y="200" width="18" height="205" rx="9"
            fill="rgba(241,245,249,0.72)" stroke="#94a3b8" strokeWidth="1.6" />
          <circle cx="482" cy="414" r="14" fill="rgba(241,245,249,0.72)" stroke="#94a3b8" strokeWidth="1.6" />
          <motion.rect x="478" y={402-mercH} width="8" height={mercH}
            fill={mercColor} rx="2" clipPath="url(#thm-c)"
            animate={{ y:402-mercH, height:mercH, fill:mercColor }}
            transition={{ duration:1.6, ease:"easeOut" }}
          />
          <motion.circle cx="482" cy="411" r="11" fill={mercColor}
            animate={{ fill:mercColor }} transition={{ duration:1.6 }}
          />
          {[20,25,30,35,40,45].map((t,i) => {
            const ty = 396 - i*16.5;
            return (
              <g key={t}>
                <line x1="491" y1={ty} x2="498" y2={ty} stroke="#94a3b8" strokeWidth="1" />
                <text x="501" y={ty+4} fontSize="8" fill="#64748b">{t}°</text>
              </g>
            );
          })}
          {/* Float temp overlay badge */}
          <motion.g
            animate={{ y: -(402-mercH-220) }}
            style={{ y: -(402-mercH-220) }}
          >
            <rect x="456" y={398-mercH-26} width="52" height="18" rx="5"
              fill={tempPct>0.3 ? "rgba(254,226,226,0.97)" : "rgba(219,234,254,0.97)"}
              stroke={tempPct>0.3 ? "rgba(239,68,68,0.3)" : "rgba(37,99,235,0.22)"} strokeWidth="1" />
            <motion.text x="482" y={398-mercH-14} textAnchor="middle" fontSize="9.5" fontWeight="700"
              fill={tempPct>0.3 ? "#dc2626" : "#2563eb"}
              animate={{ fill:tempPct>0.3?"#dc2626":"#2563eb" }}
            >
              {currentTempC.toFixed(1)}°C
            </motion.text>
          </motion.g>
        </g>

        {/* ─── BURETTE APPARATUS (centered vertical column) ─── */}
        {rxnPhase && (
          <g>
            {/* Clamps holding the burette on stands */}
            <line x1="213" y1="80" x2="257" y2="80" stroke="url(#metal-grad)" strokeWidth="4.0" />
            <line x1="213" y1="170" x2="257" y2="170" stroke="url(#metal-grad)" strokeWidth="4.0" />
            <circle cx="213" cy="80" r="5.5" fill="url(#metal-grad)" />
            <circle cx="213" cy="170" r="5.5" fill="url(#metal-grad)" />

            {/* Burette Glass outline */}
            <rect x="256" y="40" width="12" height="180" rx="2"
              fill="rgba(241,245,249,0.35)" stroke="#64748b" strokeWidth="1.5" />
            
            {/* NaOH liquid column in burette */}
            {buretteLiquidHeight > 0.5 && (
              <rect
                x="257" y={buretteLiquidY}
                width="10" height={buretteLiquidHeight}
                fill="url(#burette-grad)"
                clipPath="url(#burette-clip)"
              />
            )}

            {/* Graduation marks on burette */}
            {Array.from({ length: 6 }).map((_, idx) => {
              const y = 50 + idx * 30;
              const vol = idx * 5;
              return (
                <g key={idx}>
                  <line x1="265" y1={y} x2="268" y2={y} stroke="#475569" strokeWidth="0.8" />
                  <text x="272" y={y + 3} fontSize="6.5" fill="#475569" fontWeight="600">{vol} mL</text>
                </g>
              );
            })}

            {/* Stopcock valve assembly at y = 220 */}
            <circle cx="262" cy="220" r="5" fill="#475569" />
            <circle cx="262" cy="220" r="3" fill="#cbd5e1" />
            
            {/* Rotating stopcock handle */}
            <motion.line
              x1="252" y1="220" x2="272" y2="220"
              stroke="#dc2626" strokeWidth="2.8" strokeLinecap="round"
              animate={{ rotate: stopcockAngle }}
              style={{ transformOrigin: "262px 220px" }}
              transition={{ duration: 0.3 }}
            />

            {/* Glass tip */}
            <path d="M 259 225 L 259 250 L 262 255 L 265 250 L 265 225 Z"
              fill="rgba(241,245,249,0.6)" stroke="#64748b" strokeWidth="1.1" />

            {/* Titration drip animation */}
            {valvePosition > 0 && valvePosition < 3 && rxnFill > 0.1 && (
              <motion.ellipse
                cx="262"
                cy="255"
                rx="1.8" ry="3.5"
                fill="rgba(187,247,208,0.9)"
                animate={{
                  cy: [255, 470 - 196 * rxnFill],
                  opacity: [0.95, 0.95, 0.0]
                }}
                transition={{
                  duration: valvePosition === 1 ? 0.9 : 0.45,
                  repeat: Infinity,
                  ease: "easeIn"
                }}
              />
            )}

            {/* Continuous stream flow */}
            {valvePosition === 3 && rxnFill > 0.1 && (
              <line
                x1="262" y1="255"
                x2="262" y2={470 - 196 * rxnFill}
                stroke="rgba(187,247,208,0.85)"
                strokeWidth="2.2"
              />
            )}
          </g>
        )}

        {/* ΔT badge */}
        <AnimatePresence>
          {currentTempC > initialTempC + 0.6 && (
            <motion.g
              initial={{ opacity:0, scale:0.7 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
              style={{ transformOrigin:"418px 140px" }}
            >
              <rect x="384" y="118" width="104" height="46" rx="11"
                fill="rgba(15, 23, 42, 0.85)" stroke="rgba(239,68,68,0.45)" strokeWidth="1.6" />
              <text x="436" y="137" textAnchor="middle" fontSize="13" fontWeight="900" fill="#f87171">
                ΔT = +{deltaT}°C
              </text>
              <text x="436" y="152" textAnchor="middle" fontSize="10.5" fill="#fca5a5" fontWeight="700">Exothermic ↑</text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* ─── LIVE CALCULATION PANEL ─── */}
        <AnimatePresence>
          {showCalc && (
            <motion.g initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}>
              <rect x="14" y="62" width="162" height="158" rx="11"
                fill="rgba(239,246,255,0.97)" stroke="rgba(37,99,235,0.22)" strokeWidth="1.3" />
              <rect x="14" y="62" width="162" height="30" rx="11"
                fill="rgba(219,234,254,0.55)" />
              <rect x="14" y="86" width="162" height="6" rx="0"
                fill="rgba(219,234,254,0.35)" />
              <text x="95" y="82" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#1d4ed8" letterSpacing="0.4">
                LIVE CALCULATIONS
              </text>
              {[
                { label:`n(${acidName})  = C×V`,  value:`${nMol.toFixed(4)} mol`, color:"#b45309" },
                { label:`n(${baseName}) = C×V`,  value:`${((naohVolumeMl / 1000) * baseConc).toFixed(4)} mol`, color:"#166534" },
                { label:`Titr. Vol`,       value:`${(prog*25).toFixed(1)} mL`,  color:"#7c3aed" },
                { label:"n reacted",       value:`${nReacted.toFixed(5)} mol`, color:"#0284c7" },
                { label:`ΔH = n×${acidType === "strong" && baseType === "strong" ? "55.8" : "51.5"}`,    value:`${heatKJ.toFixed(3)} kJ`,    color:"#dc2626" },
                { label:"ΔT (observed)",   value:`+${deltaT}°C`,              color:tempPct>0.3?"#dc2626":"#64748b" },
                { label:"pH",              value:currentPh.toFixed(2),        color:"#059669" },
              ].map(({ label, value, color }, i) => (
                <g key={label}>
                  {i > 0 && <line x1="24" y1={107+i*16} x2="168" y2={107+i*16} stroke="rgba(148,163,184,0.18)" strokeWidth="0.6" />}
                  <text x="24" y={118+i*16} fontSize="8" fill="#475569">{label}</text>
                  <text x="168" y={118+i*16} textAnchor="end" fontSize="8.5" fontWeight="700" fill={color}>
                    {value}
                  </text>
                </g>
              ))}
            </motion.g>
          )}
        </AnimatePresence>

        {/* PRODUCT BADGE */}
        <AnimatePresence>
          {saltFormed && (
            <motion.g
              initial={{ opacity:0, scale:0.65, y:18 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0 }}
              style={{ transformOrigin:"262px 560px" }}
            >
              <rect x="182" y="500" width="162" height="44" rx="11"
                fill="rgba(240,253,244,0.98)" stroke="rgba(34,197,94,0.48)" strokeWidth="1.8"
                filter="url(#ng-glow)"
              />
              <text x="263" y="519" textAnchor="middle" fontSize="13.5" fontWeight="800" fill="#166534">
                {saltName}(aq) + H₂O formed ✓
              </text>
              <text x="263" y="534" textAnchor="middle" fontSize="11" fill="#059669" fontWeight="700">
                pH = {currentPh.toFixed(2)} · Exothermic complete
              </text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* empty reaction beaker placeholder */}
        {!rxnPhase && (
          <g opacity="0.4">
            <rect x="182" y="268" width="162" height="200" rx="6"
              fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="6 4" />
            <text x="263" y="366" textAnchor="middle" fontSize="10" fill="#94a3b8">
              Reaction beaker
            </text>
          </g>
        )}

        {/* EQUATION OVERLAY (final) */}
        <AnimatePresence>
          {state.reactionDone && (
            <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              <rect x="14" y="228" width="162" height="34" rx="9"
                fill="rgba(240,253,244,0.97)" stroke="rgba(34,197,94,0.35)" strokeWidth="1.2" />
              <text x="95" y="243" textAnchor="middle" fontSize="11" fontWeight="800" fill="#166534">
                Reaction Complete ✓
              </text>
              <text x="95" y="255" textAnchor="middle" fontSize="9.5" fill="#059669" fontWeight="750">
                1:1 stoichiometry confirmed
              </text>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
}
