"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { WaterHardnessState } from "@/lib/engine/types";
import { ENDPOINT_ML } from "@/lib/engine/water-hardness-engine";

interface Props {
  state: Pick<WaterHardnessState,
    "buretteFilled" | "samplePrepared" | "indicatorAdded" |
    "edtaAddedMl" | "endpointReached" | "solutionColor" |
    "hardnessMgL" | "hardnessCategory" | "isTitrating"
  >;
}

interface Drop { id: number }

const W = 540;
const H = 660;

const CAT_COLOR: Record<string,string> = {
  "soft":            "#22c55e",
  "moderately-hard": "#f59e0b",
  "hard":            "#f97316",
  "very-hard":       "#ef4444",
};
const CAT_LABEL: Record<string,string> = {
  "soft":            "Soft",
  "moderately-hard": "Moderately Hard",
  "hard":            "Hard",
  "very-hard":       "Very Hard",
};

export default function WaterHardnessWorkspace({ state }: Props) {
  const { buretteFilled, samplePrepared, indicatorAdded, edtaAddedMl,
          endpointReached, solutionColor, hardnessMgL, hardnessCategory, isTitrating } = state;

  const [drops, setDrops]   = useState<Drop[]>([]);
  const dropId = useRef(0);
  const dropTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isTitrating || endpointReached) {
      if (dropTimer.current) clearInterval(dropTimer.current);
      return;
    }
    dropTimer.current = setInterval(() => {
      dropId.current += 1;
      const nid = dropId.current;
      startTransition(() => setDrops(p => [...p.slice(-3), { id: nid }]));
      setTimeout(() => startTransition(() => setDrops(p => p.filter(d => d.id !== nid))), 750);
    }, 320);
    return () => { if (dropTimer.current) clearInterval(dropTimer.current); };
  }, [isTitrating, endpointReached]);

  // Geometry
  const buretteH    = 252;
  const buretteY    = 66;
  const buretteX    = 244;
  const buretteW    = 38;
  const tipCY       = buretteY + buretteH + 22; // stopcock tip

  const edtaFill    = buretteFilled ? Math.max(0, (50 - edtaAddedMl) / 50) : 0;
  const edtaLiqH    = buretteH * edtaFill;
  const edtaLiqY    = buretteY + (buretteH - edtaLiqH);

  const flaskFill   = samplePrepared ? 0.68 : 0;
  const flaskBaseY  = 540;
  const flaskLiqH   = 148 * flaskFill;

  const edtaPct     = Math.min(edtaAddedMl / ENDPOINT_ML, 1);

  return (
    <div className="lab-ws-area" style={{ width: "100%", height: "auto", maxHeight: "100%", aspectRatio: `${W}/${H}` }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
        <defs>
          <pattern id="wh-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.75" fill="rgba(148,163,184,0.22)" />
          </pattern>
          <linearGradient id="wh-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0f9ff" />
            <stop offset="100%" stopColor="#f8fafc" />
          </linearGradient>
          <linearGradient id="wh-bench" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="wh-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="rgba(255,255,255,0.6)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.22)" />
          </linearGradient>
          <linearGradient id="wh-edta" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="rgba(167,243,208,0.9)" />
            <stop offset="100%" stopColor="rgba(134,239,172,0.7)" />
          </linearGradient>
          <filter id="wh-shadow">
            <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="rgba(0,0,0,0.11)" />
          </filter>
          <filter id="wh-endpoint">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <clipPath id="wh-bur-c">
            <rect x={buretteX+2} y={buretteY} width={buretteW-4} height={buretteH} />
          </clipPath>
          <clipPath id="wh-flask-c">
            <path d={`M196 ${flaskBaseY-148} L176 ${flaskBaseY} Q174 ${flaskBaseY+14} 192 ${flaskBaseY+14} L348 ${flaskBaseY+14} Q364 ${flaskBaseY+14} 362 ${flaskBaseY} L342 ${flaskBaseY-148} Z`} />
          </clipPath>
        </defs>

        {/* Background */}
        <rect width={W} height={H} fill="url(#wh-wall)" />
        <rect width={W} height={H} fill="url(#wh-dots)" opacity="0.7" />

        {/* Header */}
        <rect x="0" y="0" width={W} height="50" fill="rgba(248,250,252,0.97)" />
        <line x1="0" y1="50" x2={W} y2="50" stroke="rgba(226,232,240,0.9)" strokeWidth="1" />
        <text x={W/2} y="29" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e293b">
          Water Hardness — EDTA Complexometric Titration
        </text>
        <text x={W/2} y="43" textAnchor="middle" fontSize="9.5" fill="#94a3b8">
          M²⁺ + EDTA⁴⁻ → [M·EDTA]²⁻ · EBT indicator: wine-red → blue at endpoint
        </text>

        {/* Bench */}
        <rect x="0" y={H-120} width={W} height="120" fill="url(#wh-bench)" />
        <rect x="0" y={H-122} width={W} height="4" fill="#94a3b8" opacity="0.38" />

        {/* ─── RETORT STAND ─── */}
        {/* Base plate */}
        <rect x="232" y={H-130} width="76" height="12" rx="4" fill="#64748b" opacity="0.55" />
        {/* Upright rod */}
        <rect x="257" y="56" width="14" height={H-180} rx="5" fill="#94a3b8" opacity="0.55" />
        {/* Upper boss/clamp */}
        <rect x="238" y="62" width="64" height="12" rx="4" fill="#64748b" opacity="0.6" />
        <rect x="235" y="66" width="70" height="6"  rx="3" fill="#475569" opacity="0.5" />
        {/* Lower boss */}
        <rect x="235" y="316" width="70" height="10" rx="4" fill="#64748b" opacity="0.5" />

        {/* ─── BURETTE ─── */}
        <g filter="url(#wh-shadow)">
          {/* Glass tube */}
          <rect x={buretteX} y={buretteY} width={buretteW} height={buretteH} rx="4"
            fill="rgba(241,245,249,0.55)" stroke="#64748b" strokeWidth="1.9" />
          {/* EDTA liquid */}
          <motion.rect
            x={buretteX+2} y={edtaLiqY} width={buretteW-4} height={edtaLiqH}
            fill="url(#wh-edta)"
            clipPath="url(#wh-bur-c)"
            animate={{ y: edtaLiqY, height: edtaLiqH }}
            transition={{ duration: 0.55 }}
          />
          {/* Meniscus */}
          {edtaFill > 0.05 && (
            <motion.path
              d={`M${buretteX+2} ${edtaLiqY} Q${buretteX+buretteW/2} ${edtaLiqY-5} ${buretteX+buretteW-2} ${edtaLiqY}`}
              fill="none" stroke="rgba(134,239,172,0.7)" strokeWidth="1.5"
              animate={{ d: `M${buretteX+2} ${edtaLiqY} Q${buretteX+buretteW/2} ${edtaLiqY-5} ${buretteX+buretteW-2} ${edtaLiqY}` }}
            />
          )}
          {/* Grad marks */}
          {[0,10,20,30,40,50].map((val, i) => {
            const y = buretteY + 4 + i * (buretteH / 5);
            return (
              <g key={val}>
                <line x1={buretteX+buretteW} y1={y} x2={buretteX+buretteW+14} y2={y} stroke="#94a3b8" strokeWidth="1" />
                <text x={buretteX+buretteW+18} y={y+4} fontSize="9" fill="#64748b">{val}</text>
              </g>
            );
          })}
          {/* Minor ticks */}
          {Array.from({length:25},(_,i)=>(i+1)*2).map(val => {
            const y = buretteY + 4 + (val/50)*(buretteH);
            return (
              <line key={val} x1={buretteX+buretteW} y1={y} x2={buretteX+buretteW+7} y2={y} stroke="#94a3b8" strokeWidth="0.7" />
            );
          })}
          {/* Stopcock */}
          <rect x={buretteX-4} y={buretteY+buretteH+2} width={buretteW+8} height="18" rx="4" fill="#475569" opacity="0.75" />
          <rect x={buretteX-12} y={buretteY+buretteH+7} width={buretteW+24} height="7" rx="3" fill="#334155" opacity="0.7" />
          {/* Tip */}
          <path d={`M${buretteX+buretteW/2-4} ${buretteY+buretteH+20} L${buretteX+buretteW/2-3} ${tipCY} L${buretteX+buretteW/2+3} ${tipCY} L${buretteX+buretteW/2+4} ${buretteY+buretteH+20} Z`}
            fill="rgba(241,245,249,0.62)" stroke="#64748b" strokeWidth="1.2" />
          {/* Sheen */}
          <rect x={buretteX+2} y={buretteY+2} width="9" height={buretteH-4} fill="url(#wh-sheen)" opacity="0.85" rx="2" />
          {/* Volume label above */}
          <text x={buretteX+buretteW/2} y={buretteY-6} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#166534">
            EDTA · {buretteFilled ? `${edtaAddedMl.toFixed(1)} mL added` : "— mL"}
          </text>
        </g>

        {/* ─── TEARDROP DROPS ─── */}
        <AnimatePresence>
          {drops.map(d => (
            <motion.g key={d.id}>
              <motion.path
                d={`M${buretteX+buretteW/2} ${tipCY} Q${buretteX+buretteW/2-4} ${tipCY+14} ${buretteX+buretteW/2} ${tipCY+18} Q${buretteX+buretteW/2+4} ${tipCY+14} ${buretteX+buretteW/2} ${tipCY}`}
                fill="rgba(167,243,208,0.9)"
                animate={{ y:[0, flaskBaseY-148 - tipCY - 12], opacity:[1,0], scaleY:[1,1.3] }}
                transition={{ duration:0.72, ease:"easeIn" }}
              />
            </motion.g>
          ))}
        </AnimatePresence>

        {/* ─── CONICAL FLASK ─── */}
        <g filter="url(#wh-shadow)">
          {/* Neck */}
          <rect x="247" y="320" width="56" height="70" rx="4"
            fill="rgba(241,245,249,0.52)" stroke="#64748b" strokeWidth="1.9" />
          {/* Body */}
          <path d={`M196 ${flaskBaseY-148} L176 ${flaskBaseY} Q174 ${flaskBaseY+14} 192 ${flaskBaseY+14} L348 ${flaskBaseY+14} Q364 ${flaskBaseY+14} 362 ${flaskBaseY} L342 ${flaskBaseY-148} Z`}
            fill="rgba(241,245,249,0.50)" stroke="#64748b" strokeWidth="2.1" />
          {/* Solution */}
          <motion.path
            d={`M${198+4*flaskFill} ${flaskBaseY-flaskLiqH} L${340-4*flaskFill} ${flaskBaseY-flaskLiqH} L352 ${flaskBaseY} Q358 ${flaskBaseY+14} 344 ${flaskBaseY+14} L196 ${flaskBaseY+14} Q180 ${flaskBaseY+14} 188 ${flaskBaseY} Z`}
            fill={solutionColor}
            clipPath="url(#wh-flask-c)"
            animate={{ fill: solutionColor,
              d:`M${198+4*flaskFill} ${flaskBaseY-flaskLiqH} L${340-4*flaskFill} ${flaskBaseY-flaskLiqH} L352 ${flaskBaseY} Q358 ${flaskBaseY+14} 344 ${flaskBaseY+14} L196 ${flaskBaseY+14} Q180 ${flaskBaseY+14} 188 ${flaskBaseY} Z`
            }}
            transition={{ fill:{ duration:1.6 }, d:{ duration:0.9 } }}
          />
          {/* Endpoint glow */}
          <AnimatePresence>
            {endpointReached && (
              <motion.ellipse cx="270" cy={flaskBaseY-50} rx="65" ry="42"
                fill="rgba(59,130,246,0.22)"
                filter="url(#wh-endpoint)"
                initial={{ opacity:0, scale:0.5 }}
                animate={{ opacity:[0.5,1,0.5], scale:[1,1.12,1] }}
                transition={{ duration:2.2, repeat:Infinity }}
              />
            )}
          </AnimatePresence>
          {/* Flask sheen */}
          <rect x="190" y={flaskBaseY-146} width="13" height="158" fill="rgba(255,255,255,0.32)" rx="5" />
        </g>
        <text x="270" y={flaskBaseY+32} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#475569">
          Hard Water Sample (100 mL)
        </text>

        {/* ─── EBT COLOR INDICATOR STRIP ─── */}
        {indicatorAdded && (
          <motion.g initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }}>
            <rect x="375" y="445" width="148" height="56" rx="10"
              fill="rgba(255,255,255,0.94)" stroke="rgba(148,163,184,0.28)" strokeWidth="1" />
            <text x="449" y="462" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#475569">EBT Indicator</text>
            {/* Color swatch */}
            <defs>
              <linearGradient id="ebt-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"  stopColor="#9f1239" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <rect x="385" y="466" width="128" height="10" rx="5" fill="url(#ebt-grad)" opacity="0.7" />
            <motion.circle
              cx={385 + 128 * edtaPct} cy="471" r="6"
              fill={endpointReached ? "#3b82f6" : "#9f1239"}
              stroke="white" strokeWidth="1.5"
              animate={{ cx: 385 + 128 * edtaPct, fill: endpointReached ? "#3b82f6" : "#9f1239" }}
              transition={{ duration:0.5 }}
            />
            <text x="385" y="489" fontSize="8" fill="#9f1239">Wine-red</text>
            <text x="513" y="489" textAnchor="end" fontSize="8" fill="#3b82f6">Blue</text>
            <text x="449" y="496" textAnchor="middle" fontSize="8.5" fontWeight="600"
              fill={endpointReached ? "#1d4ed8" : "#9f1239"}>
              {endpointReached ? "Endpoint reached!" : `${edtaAddedMl.toFixed(1)} / ${ENDPOINT_ML.toFixed(0)} mL`}
            </text>
          </motion.g>
        )}

        {/* ─── TITRATION PROGRESS BAR ─── */}
        {indicatorAdded && (
          <g>
            <text x="16" y="362" fontSize="10" fontWeight="600" fill="#475569">
              EDTA added: {edtaAddedMl.toFixed(1)} mL / {ENDPOINT_ML.toFixed(0)} mL endpoint
            </text>
            <rect x="16" y="368" width="215" height="12" rx="6" fill="rgba(148,163,184,0.2)" />
            <motion.rect x="16" y="368" width={215 * edtaPct} height="12" rx="6"
              fill={endpointReached ? "#3b82f6" : "#22c55e"}
              animate={{ width:215*edtaPct, fill:endpointReached?"#3b82f6":"#22c55e" }}
              transition={{ duration:0.45 }}
            />
            <text x="16" y="392" fontSize="8.5" fill="#94a3b8">
              {endpointReached ? "✓ Endpoint — all Ca²⁺/Mg²⁺ chelated" : "Add EDTA — watch for colour change to pure blue"}
            </text>
          </g>
        )}

        {/* ─── HARDNESS RESULT CARD ─── */}
        <AnimatePresence>
          {hardnessMgL !== null && hardnessCategory && (
            <motion.g
              initial={{ opacity:0, y:14, scale:0.9 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0 }}
              style={{ transformOrigin:"96px 440px" }}
            >
              <rect x="14" y="400" width="175" height="124" rx="13"
                fill="rgba(255,255,255,0.96)"
                stroke={CAT_COLOR[hardnessCategory]+"55"} strokeWidth="2" />
              <text x="101" y="424" textAnchor="middle" fontSize="10" fontWeight="700" fill="#475569">
                Water Hardness
              </text>
              <text x="101" y="452" textAnchor="middle" fontSize="26" fontWeight="900" fill={CAT_COLOR[hardnessCategory]}>
                {hardnessMgL.toFixed(0)}
              </text>
              <text x="101" y="468" textAnchor="middle" fontSize="9" fill="#64748b">mg/L as CaCO₃</text>
              <rect x="24" y="478" width="155" height="30" rx="8"
                fill={CAT_COLOR[hardnessCategory]+"18"} />
              <text x="101" y="498" textAnchor="middle" fontSize="13" fontWeight="800" fill={CAT_COLOR[hardnessCategory]}>
                {CAT_LABEL[hardnessCategory]}
              </text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* ─── CALCULATION BOX ─── */}
        <AnimatePresence>
          {endpointReached && hardnessMgL !== null && (
            <motion.g initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}>
              <rect x="14" y="58" width="222" height="96" rx="11"
                fill="rgba(239,246,255,0.97)" stroke="rgba(37,99,235,0.22)" strokeWidth="1.3" />
              <text x="28" y="76" fontSize="9.5" fontWeight="800" fill="#1d4ed8">CALCULATION</text>
              <text x="28" y="90" fontSize="8" fill="#475569">H = V(EDTA) × M(EDTA) × M(CaCO₃) × 1000</text>
              <text x="28" y="103" fontSize="8" fill="#475569">        V(sample) / 1000</text>
              <line x1="28" y1="108" x2="228" y2="108" stroke="rgba(148,163,184,0.3)" strokeWidth="0.7" />
              <text x="28" y="121" fontSize="8" fill="#475569">
                = {edtaAddedMl.toFixed(1)}×0.01×100.09×1000 / 100
              </text>
              <text x="28" y="136" fontSize="9.5" fontWeight="800" fill="#1d4ed8">
                = {hardnessMgL.toFixed(1)} mg/L as CaCO₃
              </text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* ─── SCALE BAR (hardness categories) ─── */}
        {indicatorAdded && (
          <g opacity="0.85">
            <text x="375" y="412" fontSize="9" fontWeight="600" fill="#475569">Hardness Scale (mg/L)</text>
            {[
              { x:375, w:30, c:"#22c55e", t:"Soft" },
              { x:405, w:40, c:"#f59e0b", t:"Mod" },
              { x:445, w:38, c:"#f97316", t:"Hard" },
              { x:483, w:40, c:"#ef4444", t:"V.Hard" },
            ].map(({ x, w, c, t }) => (
              <g key={t}>
                <rect x={x} y="416" width={w} height="12" fill={c} opacity="0.7" />
                <text x={x+w/2} y="441" textAnchor="middle" fontSize="7.5" fill={c}>{t}</text>
              </g>
            ))}
            {hardnessCategory && (
              <motion.rect
                x={{soft:375,"moderately-hard":405,hard:445,"very-hard":483}[hardnessCategory]}
                y="413"
                width={{soft:30,"moderately-hard":40,hard:38,"very-hard":40}[hardnessCategory]}
                height="18"
                rx="3"
                fill="none" stroke={CAT_COLOR[hardnessCategory]} strokeWidth="2"
                animate={{ opacity:[0.5,1,0.5] }}
                transition={{ duration:1.8, repeat:Infinity }}
              />
            )}
          </g>
        )}

        {/* ─── SWIRL inside flask (when titrating) ─── */}
        <AnimatePresence>
          {isTitrating && !endpointReached && samplePrepared && (
            <motion.g initial={{ opacity:0 }} animate={{ opacity:0.65 }} exit={{ opacity:0 }}>
              {[0, 90, 180].map((a, i) => (
                <motion.path key={i}
                  d={`M270 ${flaskBaseY-50} Q${270+25*Math.cos((a+45)*Math.PI/180)} ${flaskBaseY-50+25*Math.sin((a+45)*Math.PI/180)} ${270+30*Math.cos(a*Math.PI/180)} ${flaskBaseY-50+30*Math.sin(a*Math.PI/180)}`}
                  fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round"
                  animate={{ rotate:360 }}
                  transition={{ duration:1.5, repeat:Infinity, ease:"linear", delay:i*0.5 }}
                  style={{ transformOrigin:`270px ${flaskBaseY-50}px` }}
                />
              ))}
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
}
