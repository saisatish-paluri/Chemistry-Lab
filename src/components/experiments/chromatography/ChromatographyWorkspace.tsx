"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ChromatographyState } from "@/lib/engine/types";
import { INKS } from "@/lib/engine/chromatography-engine";

interface Props {
  state: Pick<ChromatographyState,
    "selectedInk" | "inkApplied" | "paperInChamber" | "solventAdded" |
    "isRunning" | "solventFrontCm" | "dyes" | "rfValues" | "runComplete"
  >;
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

export default function ChromatographyWorkspace({ state }: Props) {
  const { selectedInk, inkApplied, paperInChamber, solventAdded, isRunning,
          solventFrontCm, dyes, rfValues, runComplete } = state;

  const ink = selectedInk ? INKS[selectedInk] : null;

  // Convert cm → SVG px (front travels upward from INK_Y)
  const frontPx = (solventFrontCm / 10) * MAX_DIST;
  const frontY  = INK_Y - frontPx;

  return (
    <div className="lab-ws-area" style={{ width: "100%", height: "auto", maxHeight: "100%", aspectRatio: `${W}/${H}` }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
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
          <linearGradient id="ch-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0f9ff" />
            <stop offset="100%" stopColor="#f8fafc" />
          </linearGradient>
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
          <clipPath id="ch-solvent-c">
            <rect x={PAPER_X+1} y={PAPER_Y} width={PAPER_W-2} height={PAPER_H} />
          </clipPath>
        </defs>

        {/* Background */}
        <rect width={W} height={H} fill="url(#ch-wall)" />
        <rect width={W} height={H} fill="url(#ch-dots)" opacity="0.7" />

        {/* Header */}
        <rect x="0" y="0" width={W} height="50" fill="rgba(248,250,252,0.97)" />
        <line x1="0" y1="50" x2={W} y2="50" stroke="rgba(226,232,240,0.9)" strokeWidth="1" />
        <text x={W/2} y="29" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e293b">
          Paper Chromatography — Ink Separation
        </text>
        <text x={W/2} y="43" textAnchor="middle" fontSize="9.5" fill="#94a3b8">
          Rf = d(spot) / d(front) · dyes separate by polarity difference
        </text>

        {/* Bench */}
        <rect x="0" y={H-118} width={W} height="118" fill="url(#ch-bench)" />
        <rect x="0" y={H-120} width={W} height="4" fill="#94a3b8" opacity="0.38" />

        {/* ─── DEVELOPING CHAMBER ─── */}
        <g filter="url(#ch-shadow)">
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
          <g>
            {/* Dry section */}
            <rect x={PAPER_X} y={PAPER_Y} width={PAPER_W} height={PAPER_H}
              fill="url(#ch-paper)" stroke="rgba(203,213,225,0.5)" strokeWidth="1" />

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
              <motion.g>
                <motion.line
                  x1={PAPER_X} y1={frontY} x2={PAPER_X+PAPER_W} y2={frontY}
                  stroke="#3b82f6" strokeWidth="1.8" strokeDasharray="5 3" opacity="0.85"
                  animate={{ y1:frontY, y2:frontY }}
                  transition={{ duration:0.35 }}
                />
                <text x={PAPER_X-5} y={frontY+4} fontSize="8" fill="#3b82f6" textAnchor="end">Front</text>
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
              {dyes.map(dye => {
                if (dye.distanceCm < 0.28) return null;
                const dyeY  = INK_Y - (dye.distanceCm / 10) * MAX_DIST;
                const rfVal = rfValues.find(r => r.name === dye.name);
                return (
                  <motion.g key={dye.name}>
                    {/* Band with gradient */}
                    <defs>
                      <linearGradient id={`dye-${dye.name}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"  stopColor={dye.color} stopOpacity="0.55" />
                        <stop offset="50%" stopColor={dye.color} stopOpacity="0.80" />
                        <stop offset="100%" stopColor={dye.color} stopOpacity="0.55" />
                      </linearGradient>
                    </defs>
                    <motion.rect
                      x={PAPER_X + 8} y={dyeY - 6}
                      width={PAPER_W - 16} height="13"
                      fill={`url(#dye-${dye.name})`} rx="3"
                      animate={{ y: dyeY - 6 }}
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
          </g>
        )}

        {/* ─── RF VALUE TABLE (left panel) ─── */}
        {rfValues.length > 0 && (
          <motion.g initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}>
            <rect x="14" y="58" width="152" height={44 + rfValues.length * 24} rx="11"
              fill="rgba(255,255,255,0.97)" stroke="rgba(148,163,184,0.28)" strokeWidth="1.2" />
            <rect x="14" y="58" width="152" height="28" rx="11"
              fill="rgba(239,246,255,0.55)" />
            <text x="90" y="76" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#1d4ed8">Rf Values</text>
            <line x1="18" y1="86" x2="162" y2="86" stroke="rgba(148,163,184,0.2)" strokeWidth="0.7" />
            <text x="24" y="98" fontSize="7.5" fill="#94a3b8">Rf = d(spot) / d(front)</text>
            {rfValues.map((r, i) => (
              <g key={r.name}>
                <circle cx="28" cy={112 + i*24} r="6" fill={r.color} />
                <text x="40" y={116 + i*24} fontSize="9" fontWeight="600" fill="#1e293b">
                  {r.name.split(" ")[0]}
                </text>
                <text x="155" y={116 + i*24} textAnchor="end" fontSize="10" fontWeight="800" fill="#1d4ed8">
                  {r.rf.toFixed(2)}
                </text>
              </g>
            ))}
          </motion.g>
        )}

        {/* ─── INK PREVIEW (before paper placed) ─── */}
        {!paperInChamber && selectedInk && ink && (
          <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }}>
            <rect x="14" y="58" width="152" height="82" rx="11"
              fill="rgba(255,255,255,0.93)" stroke="rgba(148,163,184,0.25)" strokeWidth="1" />
            <text x="90" y="76" textAnchor="middle" fontSize="10" fontWeight="700" fill="#475569">
              {ink.name}
            </text>
            <text x="90" y="90" textAnchor="middle" fontSize="8.5" fill="#64748b">
              {ink.dyes.length} dye component{ink.dyes.length > 1 ? "s" : ""}
            </text>
            <g>
              {ink.dyes.slice(0,4).map((d, i) => (
                <g key={i}>
                  <circle cx={28 + i*28} cy="112" r="10" fill={d.color} opacity="0.82" />
                  <text x={28+i*28} y="130" textAnchor="middle" fontSize="7" fill="#64748b">
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
              <rect x="14" y="58" width="152" height="32" rx="9"
                fill="rgba(239,246,255,0.98)" stroke="rgba(37,99,235,0.3)" strokeWidth="1.2" />
              <motion.circle cx="28" cy="74" r="6"
                stroke="#3b82f6" strokeWidth="2" fill="none"
                strokeDasharray="16 6"
                animate={{ rotate:360 }}
                transition={{ duration:0.9, repeat:Infinity, ease:"linear" }}
                style={{ transformOrigin:"28px 74px" }}
              />
              <text x="40" y="78" fontSize="9.5" fontWeight="600" fill="#1d4ed8">
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
              style={{ transformOrigin:"90px 62px" }}
            >
              <rect x="14" y={rfValues.length > 0 ? 44+rfValues.length*24+52 : 58} width="152" height="30" rx="9"
                fill="rgba(240,253,244,0.98)" stroke="rgba(34,197,94,0.42)" strokeWidth="1.3"
                filter="url(#ch-glow)"
              />
              <text x="90" y={rfValues.length > 0 ? 44+rfValues.length*24+70 : 77}
                textAnchor="middle" fontSize="10" fontWeight="700" fill="#166534">
                ✓ Development Complete
              </text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* ─── STEP GUIDE PILL ─── */}
        <rect x="334" y="58" width="210" height="22" rx="7"
          fill="rgba(255,255,255,0.90)" stroke="rgba(148,163,184,0.26)" strokeWidth="0.9" />
        <text x="344" y="73" fontSize="9" fontWeight="600" fill="#475569">
          {!selectedInk    ? "① Select ink sample →"    :
           !inkApplied     ? "② Apply ink spot →"       :
           !paperInChamber ? "③ Place in chamber →"     :
           !solventAdded   ? "④ Add solvent →"          :
           isRunning       ? "⏳ Developing…"            :
           runComplete && rfValues.length === 0 ? "⑤ Calculate Rf values →" :
           runComplete ? "✓ Rf values calculated!" : "Developing…"}
        </text>

        {/* ─── CAPILLARY TUBE (shown when ink applied, before chamber) ─── */}
        {inkApplied && !paperInChamber && (
          <g>
            <rect x="358" y="168" width="5" height="72" rx="2" fill="rgba(203,213,225,0.85)" stroke="#94a3b8" strokeWidth="0.9" />
            <text x="360" y="255" textAnchor="middle" fontSize="8.5" fill="#64748b">Capillary</text>
          </g>
        )}
      </svg>
    </div>
  );
}
