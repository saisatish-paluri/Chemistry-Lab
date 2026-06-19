"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChromatographyState } from "@/lib/engine/types";
import { INKS } from "@/lib/engine/chromatography-engine";

interface Props {
  state: Pick<ChromatographyState,
    "selectedInk" | "inkApplied" | "paperInChamber" | "solventAdded" |
    "isRunning" | "solventFrontCm" | "dyes" | "rfValues" | "runComplete" | "spotWidths"
  >;
  onApplyInk?:   () => void;
  onPlacePaper?: () => void;
  onAddSolvent?: () => void;
  onCalculate?:  () => void;
}

const W = 560;
const H = 640;

// Chromatography paper layout
const PAPER_X  = 178;
const PAPER_Y  = 76;
const PAPER_W  = 140;
const PAPER_H  = 395;
const INK_Y    = PAPER_Y + PAPER_H - 38;   // baseline at 2 cm from bottom in real units
const MAX_DIST = PAPER_H - 58;             // max travel in SVG px (from baseline to top)

export default function ChromatographyWorkspace({
  state, onApplyInk, onPlacePaper, onAddSolvent, onCalculate,
}: Props) {
  const { selectedInk, inkApplied, paperInChamber, solventAdded, isRunning,
          solventFrontCm, dyes, rfValues, runComplete, spotWidths } = state;

  const ink = selectedInk ? INKS[selectedInk] : null;

  // Convert cm → SVG px (front travels upward from INK_Y)
  const frontPx = (solventFrontCm / 10) * MAX_DIST;
  const frontY  = INK_Y - frontPx;

  // Local state for capillary animation
  const [capillarySpotting, setCapillarySpotting] = useState(false);

  // Trigger spotting animation locally
  const handleCapillaryClick = () => {
    if (selectedInk && !inkApplied && !capillarySpotting && onApplyInk) {
      setCapillarySpotting(true);
      setTimeout(() => {
        onApplyInk();
        setCapillarySpotting(false);
      }, 1000);
    }
  };

  // Determine paper translation
  // If paper is not in chamber yet but ink is applied, show it resting outside to the right
  let paperTransform = "translate(0, 0)";
  if (inkApplied && !paperInChamber) {
    paperTransform = "translate(170, -30)"; // resting on the bench next to the chamber
  }

  return (
    <div
      className="relative rounded-3xl overflow-hidden select-none"
      style={{
        aspectRatio: "520/640",
        width:       "100%",
        height:      "auto",
        maxHeight:   "100%",
        background:  "linear-gradient(180deg, #f0f9ff 0%, #f8fafc 100%)",
        border:      "1px solid rgba(2, 132, 199, 0.18)",
        boxShadow:   "0 10px 30px rgba(15,23,42,0.05)",
      }}
    >
      <svg viewBox="20 0 520 640" width="100%" style={{ display: "block", position: "relative", zIndex: 10 }}>
        <defs>
          <pattern id="ch-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.75" fill="rgba(148,163,184,0.22)" />
          </pattern>
          <pattern id="ch-paper" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="#fafaf9" />
            <line x1="0" y1="0" x2="6" y2="0" stroke="rgba(203,213,225,0.28)" strokeWidth="0.5" />
          </pattern>
          <pattern id="ch-paper-wet" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="#f0f9ff" />
            <line x1="0" y1="0" x2="6" y2="0" stroke="rgba(186,230,253,0.3)" strokeWidth="0.5" />
          </pattern>
          <linearGradient id="ch-bench" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="ch-chamber-glass" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="rgba(255,255,255,0.18)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.03)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.12)" />
          </linearGradient>
          <filter id="ch-shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="rgba(0,0,0,0.12)" />
          </filter>
          <filter id="ch-glow">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <clipPath id="ch-paper-c">
            <rect x={PAPER_X+1} y={PAPER_Y} width={PAPER_W-2} height={PAPER_H} />
          </clipPath>
        </defs>

        <rect width={W} height={H} fill="url(#ch-dots)" opacity="0.7" />

        {/* Bench */}
        <rect x="0" y={H-118} width={W} height="118" fill="url(#ch-bench)" />
        <rect x="0" y={H-120} width={W} height="4" fill="#94a3b8" opacity="0.38" />

        {/* ─── DEVELOPING CHAMBER ─── */}
        <g 
          filter="url(#ch-shadow)"
          style={{ cursor: paperInChamber && !solventAdded ? "pointer" : "default" }}
          onClick={() => { if (paperInChamber && !solventAdded && onAddSolvent) onAddSolvent(); }}
        >
          {/* Glass walls */}
          <rect x={PAPER_X - 35} y={PAPER_Y - 24} width={PAPER_W + 70} height={PAPER_H + 54} rx="6"
            fill={paperInChamber ? "rgba(219,234,254,0.18)" : "rgba(241,245,249,0.28)"}
            stroke="#64748b" strokeWidth="1.9" />
          {/* Solvent pool at bottom */}
          {solventAdded && (
            <motion.rect
              x={PAPER_X - 31} y={INK_Y + 22}
              width={PAPER_W + 62}
              height={PAPER_Y + PAPER_H + 28 - (INK_Y + 22)}
              fill="rgba(186,230,253,0.42)"
              initial={{ height:0, y:PAPER_Y+PAPER_H+28 }}
              animate={{ height:PAPER_Y+PAPER_H+28-(INK_Y+22), y:INK_Y+22 }}
              transition={{ duration:1.5 }}
            />
          )}
          {/* Glass sheen */}
          <rect x={PAPER_X-32} y={PAPER_Y-21} width="18" height={PAPER_H+48}
            fill="url(#ch-chamber-glass)" rx="4" />
          {/* Chamber label */}
          <text x={PAPER_X + PAPER_W/2} y={PAPER_Y+PAPER_H+46}
            textAnchor="middle" fontSize="10" fontWeight="600" fill="#475569">
            Developing Chamber
          </text>
        </g>

        {/* ─── CHROMATOGRAPHY PAPER ─── */}
        {(inkApplied || paperInChamber) && (
          <motion.g
            animate={{ transform: paperTransform }}
            transition={{ type: "spring", stiffness: 40, damping: 12 }}
            style={{ cursor: inkApplied && !paperInChamber ? "pointer" : "default" }}
            onClick={() => { if (inkApplied && !paperInChamber && onPlacePaper) onPlacePaper(); }}
          >
            {/* Dry section */}
            <rect x={PAPER_X} y={PAPER_Y} width={PAPER_W} height={PAPER_H}
              fill="url(#ch-paper)" stroke="rgba(203,213,225,0.5)" strokeWidth={inkApplied && !paperInChamber ? 1.8 : 1} />

            {/* Wet section (below solvent front) */}
            {solventAdded && solventFrontCm > 0 && (
              <motion.rect
                x={PAPER_X+1} y={frontY}
                width={PAPER_W-2}
                height={INK_Y - frontY + 28}
                fill="url(#ch-paper-wet)"
                clipPath="url(#ch-paper-c)"
                animate={{ y:frontY, height:INK_Y-frontY+28 }}
                transition={{ duration:0.35 }}
              />
            )}

            {/* Scale ruler on right */}
            {[0, 2, 4, 6, 8, 10].map(cm => {
              const lineY = INK_Y - (cm / 10) * MAX_DIST;
              return (
                <g key={cm}>
                  <line x1={PAPER_X+PAPER_W} y1={lineY} x2={PAPER_X+PAPER_W+16} y2={lineY}
                    stroke="#94a3b8" strokeWidth={cm%2===0 ? 1.2 : 0.7} />
                  {cm % 2 === 0 && (
                    <text x={PAPER_X+PAPER_W+20} y={lineY+4} fontSize="8.5" fill="#64748b">{cm} cm</text>
                  )}
                </g>
              );
            })}

            {/* Baseline (pencil mark) */}
            <line x1={PAPER_X} y1={INK_Y+2} x2={PAPER_X+PAPER_W} y2={INK_Y+2}
              stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="4 3" />
            <text x={PAPER_X-5} y={INK_Y+6} fontSize="8" fill="#64748b" textAnchor="end">Start</text>

            {/* ─── INK SPOT ─── */}
            {inkApplied && (
              <motion.ellipse
                cx={PAPER_X + PAPER_W/2} cy={INK_Y}
                rx={solventFrontCm > 0.8 ? 6 : 9}
                ry={solventFrontCm > 0.8 ? 3 : 4}
                fill={ink?.dyes[0]?.color ?? "#1e293b"}
                opacity={solventFrontCm > 0.8 ? 0.55 : 0.88}
                animate={{
                  rx:   solventFrontCm > 0.8 ? 6 : 9,
                  ry:   solventFrontCm > 0.8 ? 3 : 4,
                  opacity: solventFrontCm > 0.8 ? 0.55 : 0.88,
                }}
                transition={{ duration:0.8 }}
              />
            )}

            {/* ─── SOLVENT FRONT LINE ─── */}
            {solventAdded && solventFrontCm > 0 && (
              <motion.g 
                style={{ cursor: runComplete && rfValues.length === 0 ? "pointer" : "default" }}
                onClick={() => { if (runComplete && rfValues.length === 0 && onCalculate) onCalculate(); }}
              >
                <motion.line
                  x1={PAPER_X} y1={frontY} x2={PAPER_X+PAPER_W} y2={frontY}
                  stroke={runComplete && rfValues.length === 0 ? "#10b981" : "#3b82f6"} 
                  strokeWidth={runComplete && rfValues.length === 0 ? 2.5 : 1.8} 
                  strokeDasharray="5 3" 
                  opacity={0.85}
                  animate={{ y1:frontY, y2:frontY }}
                  transition={{ duration:0.35 }}
                />
                <text x={PAPER_X-5} y={frontY+4} fontSize="8" fill={runComplete && rfValues.length === 0 ? "#10b981" : "#3b82f6"} textAnchor="end" fontWeight={runComplete ? "700" : "400"}>
                  {runComplete ? "Mark Front" : "Front"}
                </text>
                {/* Running indicator dot */}
                {isRunning && (
                  <motion.circle cx={PAPER_X-12} cy={frontY} r="4"
                    fill="#3b82f6"
                    animate={{ opacity:[0.4,1,0.4] }}
                    transition={{ duration:0.8, repeat:Infinity }}
                  />
                )}
                {/* Front distance label */}
                <text x={PAPER_X+PAPER_W/2} y={PAPER_Y-6} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#3b82f6">
                  Front: {solventFrontCm.toFixed(1)} cm
                </text>
              </motion.g>
            )}

            {/* ─── DYE BANDS ─── */}
            <AnimatePresence>
              {dyes.map((dye, idx) => {
                if (dye.distanceCm < 0.28) return null;
                const dyeY  = INK_Y - (dye.distanceCm / 10) * MAX_DIST;
                const rfVal = rfValues.find(r => r.name === dye.name);
                const width = spotWidths?.[idx] ?? 13;
                return (
                  <motion.g key={dye.name}>
                    <defs>
                      <linearGradient id={`dye-${dye.name}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"  stopColor={dye.color} stopOpacity="0.55" />
                        <stop offset="50%" stopColor={dye.color} stopOpacity="0.80" />
                        <stop offset="100%" stopColor={dye.color} stopOpacity="0.55" />
                      </linearGradient>
                    </defs>
                    <motion.rect
                      x={PAPER_X + 8} y={dyeY - width / 2}
                      width={PAPER_W - 16} height={width}
                      fill={`url(#dye-${dye.name})`} rx="3"
                      animate={{ y: dyeY - width / 2, height: width }}
                      transition={{ duration:0.4 }}
                    />
                    {/* Dye label on the right edge */}
                    <motion.text
                      x={PAPER_X + PAPER_W + 52}
                      y={dyeY + 4}
                      fontSize="8.5" fontWeight="700" fill={dye.color}
                      animate={{ y: dyeY + 4 }}
                      transition={{ duration:0.4 }}
                    >
                      {dye.name}
                    </motion.text>
                    {/* Rf label directly on right of band */}
                    {rfVal && (
                      <motion.text
                        x={PAPER_X + PAPER_W + 52}
                        y={dyeY + 15}
                        fontSize="8" fill="#64748b"
                        animate={{ y: dyeY + 15 }}
                        transition={{ duration:0.4 }}
                      >
                        Rf = {rfVal.rf.toFixed(2)}
                      </motion.text>
                    )}
                  </motion.g>
                );
              })}
            </AnimatePresence>
          </motion.g>
        )}

        {/* ─── RF VALUE TABLE (left panel) ─── */}
        {rfValues.length > 0 && (
          <motion.g initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}>
            <rect x="24" y="58" width="152" height={44 + rfValues.length * 24} rx="11"
              fill="rgba(255,255,255,0.97)" stroke="rgba(148,163,184,0.28)" strokeWidth="1.2" />
            <rect x="24" y="58" width="152" height="28" rx="11"
              fill="rgba(239,246,255,0.55)" />
            <text x="100" y="76" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#1d4ed8">Rf Values</text>
            <line x1="28" y1="86" x2="172" y2="86" stroke="rgba(148,163,184,0.2)" strokeWidth="0.7" />
            <text x="34" y="98" fontSize="7.5" fill="#94a3b8">Rf = d(spot) / d(front)</text>
            {rfValues.map((r, i) => (
              <g key={r.name}>
                <circle cx="38" cy="112 + i*24" r="6" fill={r.color} />
                <circle cx="38" cy={112 + i*24} r="6" fill={r.color} />
                <text x="50" y={116 + i*24} fontSize="9" fontWeight="600" fill="#1e293b">
                  {r.name.split(" ")[0]}
                </text>
                <text x="165" y={116 + i*24} textAnchor="end" fontSize="10" fontWeight="800" fill="#1d4ed8">
                  {r.rf.toFixed(2)}
                </text>
              </g>
            ))}
          </motion.g>
        )}

        {/* ─── INK PREVIEW (before paper placed) ─── */}
        {!paperInChamber && selectedInk && ink && (
          <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }}>
            <rect x="24" y="58" width="152" height="82" rx="11"
              fill="rgba(255,255,255,0.93)" stroke="rgba(148,163,184,0.25)" strokeWidth="1" />
            <text x="100" y="76" textAnchor="middle" fontSize="10" fontWeight="700" fill="#475569">
              {ink.name}
            </text>
            <text x="100" y="90" textAnchor="middle" fontSize="8.5" fill="#64748b">
              {ink.dyes.length} dye component{ink.dyes.length > 1 ? "s" : ""}
            </text>
            <g>
              {ink.dyes.slice(0,4).map((d, i) => (
                <g key={i}>
                  <circle cx={38 + i*28} cy="112" r="10" fill={d.color} opacity="0.82" />
                  <text x={38+i*28} y="130" textAnchor="middle" fontSize="7" fill="#64748b">
                    {d.name?.split(" ")[0]?.slice(0,6)}
                  </text>
                </g>
              ))}
            </g>
          </motion.g>
        )}

        {/* ─── RUNNING INDICATOR ─── */}
        <AnimatePresence>
          {isRunning && (
            <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              <rect x="24" y="58" width="152" height="32" rx="9"
                fill="rgba(239,246,255,0.98)" stroke="rgba(37,99,235,0.3)" strokeWidth="1.2" />
              <motion.circle cx="38" cy="74" r="6"
                stroke="#3b82f6" strokeWidth="2" fill="none"
                strokeDasharray="16 6"
                animate={{ rotate:360 }}
                transition={{ duration:0.9, repeat:Infinity, ease:"linear" }}
                style={{ transformOrigin:"38px 74px" }}
              />
              <text x="50" y="78" fontSize="9.5" fontWeight="600" fill="#1d4ed8">
                Developing… {solventFrontCm.toFixed(1)} cm
              </text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* ─── COMPLETE BADGE ─── */}
        <AnimatePresence>
          {runComplete && (
            <motion.g
              initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
              style={{ transformOrigin:"100px 62px" }}
            >
              <rect x="24" y={rfValues.length > 0 ? 44+rfValues.length*24+52 : 58} width="152" height="30" rx="9"
                fill="rgba(240,253,244,0.98)" stroke="rgba(34,197,94,0.42)" strokeWidth="1.3"
                filter="url(#ch-glow)"
              />
              <text x="100" y={rfValues.length > 0 ? 44+rfValues.length*24+70 : 77}
                textAnchor="middle" fontSize="10" fontWeight="700" fill="#166534">
                ✓ Dev Complete
              </text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* ─── STEP GUIDE PILL (shifted left) ─── */}
        <rect x="300" y="58" width="210" height="22" rx="7"
          fill="rgba(255,255,255,0.90)" stroke="rgba(148,163,184,0.26)" strokeWidth="0.9" />
        <text x="310" y="73" fontSize="9" fontWeight="600" fill="#475569">
          {!selectedInk    ? "① Select ink sample in controls"    :
           !inkApplied     ? "② Click capillary to spot ink"       :
           !paperInChamber ? "③ Click paper to place in chamber"     :
           !solventAdded   ? "④ Click chamber bottom to add solvent"  :
           isRunning       ? "⏳ Developing front rising…"            :
           runComplete && rfValues.length === 0 ? "⑤ Click front line to calculate Rf" :
           "✓ Experiment complete!"}
        </text>

        {/* ─── CAPILLARY TUBE (interactive spotter) ─── */}
        {selectedInk && !inkApplied && (
          <motion.g
            animate={capillarySpotting ? {
              x: [0, -112, 0],
              y: [0, 192, 0]
            } : { x: 0, y: 0 }}
            transition={{ duration: 1.0, ease: "easeInOut" }}
            style={{ cursor: "pointer" }}
            onClick={handleCapillaryClick}
          >
            {/* Capillary tube body */}
            <rect x="358" y="168" width="5" height="72" rx="2" fill="rgba(203,213,225,0.85)" stroke="#94a3b8" strokeWidth="0.9" />
            {/* Ink inside tip */}
            <rect x="359" y="230" width="3" height="9" fill={ink?.dyes[0]?.color ?? "#1e293b"} />
            <text x="360" y="255" textAnchor="middle" fontSize="8.5" fill="#64748b" fontWeight="600">
              {capillarySpotting ? "Spotting..." : "Capillary (click)"}
            </text>
          </motion.g>
        )}

        {/* Wash bottle / solvent addition bottle */}
        {paperInChamber && !solventAdded && (
          <g filter="url(#ft-shadow)" style={{ cursor: "pointer" }} onClick={() => { if (onAddSolvent) onAddSolvent(); }}>
            <rect x="420" y="475" width="22" height="38" rx="4" fill="rgba(255,255,255,0.8)" stroke="#94a3b8" strokeWidth="1" />
            <rect x="422" y="485" width="18" height="26" fill="rgba(186,230,253,0.3)" />
            <text x="431" y="468" textAnchor="middle" fontSize="7" fill="#475569" fontWeight="700">Solvent</text>
            <path d="M431 475 Q431 465 425 460" fill="none" stroke="#64748b" strokeWidth="1.5" />
          </g>
        )}
      </svg>
    </div>
  );
}
