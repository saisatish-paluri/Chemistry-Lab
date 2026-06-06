"use client";

import { useEffect, useState, useRef, startTransition, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TitrationFlask, TitrationBurette } from "@/lib/engine/types";

// ── SVG layout constants ──────────────────────────────────────────────────────
const VW = 520;
const VH = 650;

// Burette — 50 mL tall glass tube
const B        = { x: 170, y: 50,  w: 22, h: 318 };
const STOPCOCK = { x: 161, y: 362, w: 36, h: 14  };
const TIP      = { x: 177, y: 376, w: 6,  h: 30  };

// Erlenmeyer flask — cubic-bezier shoulders for a true conical shape
const NL = 162, NR = 198, NY = 432;          // neck: left, right, top-y
const BL = 108, BR = 268, BY = 562;          // base: left, right, bottom-y
const FCX = (BL + BR) / 2;                   // flask centre-x = 188

const FLASK_PATH =
  `M ${NL} ${NY} L ${NL} 462 ` +
  `C ${NL - 14} 492, ${BL + 4} 532, ${BL} ${BY} ` +
  `L ${BR} ${BY} ` +
  `C ${BR - 4} 532, ${NR + 14} 492, ${NR} 462 ` +
  `L ${NR} ${NY} Z`;

const MAX_VOL = 75;
const TIP_CX  = TIP.x + TIP.w / 2;
const TIP_CY  = TIP.y + TIP.h;

// Graduated burette ticks — every 1 mL (51 total: 0–50)
const GRAD_TICKS = Array.from({ length: 51 }, (_, i) => ({
  vol:   i,
  y:     B.y + (i / 50) * B.h,
  major: i % 10 === 0,
  mid:   i % 5 === 0 && i % 10 !== 0,
}));

interface Drip   { id: number; size: number; xOff: number }
interface Ripple { id: number; cx: number;  cy: number    }

interface Props {
  flask:           TitrationFlask;
  burette:         TitrationBurette;
  volumeAdded:     number;
  isTitrating:     boolean;
  endpointReached: boolean;
}

export default function TitrationWorkspace({
  flask, burette, volumeAdded, isTitrating, endpointReached,
}: Props) {
  const [drips,   setDrips]   = useState<Drip[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextId = useRef(0);

  // ── Drip animation ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isTitrating) { startTransition(() => setDrips([])); return; }
    const count    = burette.flowRate >= 5 ? 5 : burette.flowRate >= 1 ? 3 : burette.flowRate >= 0.5 ? 2 : 1;
    const interval = Math.max(70, 380 / count);
    const id = setInterval(() => {
      nextId.current += 1;
      const nid  = nextId.current;
      const drip: Drip = { id: nid, size: 5 + Math.random() * 4.5, xOff: (Math.random() - 0.5) * 7 };
      setDrips((prev) => [...prev.slice(-7), drip]);
      setTimeout(() => {
        setRipples((prev) => [
          ...prev.slice(-4),
          { id: nid, cx: TIP_CX + drip.xOff, cy: dripTargetCy(flask.volume) },
        ]);
        setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== nid)), 900);
      }, 600);
      setTimeout(() => setDrips((prev) => prev.filter((d) => d.id !== nid)), 680);
    }, interval);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTitrating, burette.flowRate]);

  // ── Derived geometry ────────────────────────────────────────────────────────
  const buretteFillH    = Math.max(0, (burette.volumeRemaining / 50) * B.h);
  const buretteFillY    = B.y + (B.h - buretteFillH);
  const flaskFill       = Math.min(1, flask.volume / MAX_VOL);
  const flaskLiqH       = Math.max(0, flaskFill * (BY - 465));
  const flaskLiqY       = BY - flaskLiqH;
  const stopcockOpen    = burette.stopcockOpen || isTitrating;
  const flaskDispColor  = flask.indicatorAdded ? flask.color : "rgba(186,230,253,0.55)";

  // Live chemistry values for the calculation panel
  const acidMoles0    = 0.1 * 0.025;                               // 0.0025 mol
  const baseMolesIn   = 0.1 * (volumeAdded / 1000);
  const acidLeft      = Math.max(0, acidMoles0 - baseMolesIn);
  const baseExcess    = Math.max(0, baseMolesIn - acidMoles0);
  const volNeeded     = Math.max(0, 25 - volumeAdded);
  const pastEquiv     = volumeAdded > 25;

  const meniscusPath = useCallback((liqY: number, liqH: number): string => {
    if (liqH < 4) return "";
    const progress = Math.max(0, Math.min(1, (BY - liqY) / (BY - 465)));
    const halfW    = Math.min(72, 12 + progress * 60);
    return `M ${FCX - halfW} ${liqY} Q ${FCX} ${liqY + 6} ${FCX + halfW} ${liqY}`;
  }, []);

  return (
    <div
      className="relative select-none rounded-3xl overflow-hidden"
      style={{
        aspectRatio: `${VW}/${VH}`,
        width:       "100%",
        height:      "auto",
        maxHeight:   "100%",
        background:
          "radial-gradient(ellipse at 54% 18%, rgba(37,99,235,0.11) 0%, transparent 44%)," +
          "radial-gradient(ellipse at 18% 82%, rgba(14,165,233,0.07) 0%, transparent 40%)," +
          "linear-gradient(180deg,#eef5ff 0%,#e8f0fe 38%,#edf4ff 68%,#f3f7ff 100%)",
        boxShadow:
          "0 20px 60px rgba(15,23,42,0.09),0 4px 12px rgba(15,23,42,0.04)," +
          "0 0 0 1px rgba(255,255,255,0.9) inset",
        border: "1px solid rgba(148,163,184,0.22)",
      }}
    >
      {/* Dot-grid texture */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle,rgba(37,99,235,0.07) 1px,transparent 1px)",
          backgroundSize:  "24px 24px",
        }}
      />

      {/* Endpoint bloom */}
      {endpointReached && (
        <div
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{
            bottom: "6%", left: "50%", transform: "translateX(-50%)",
            width: "280px", height: "130px",
            background: `radial-gradient(ellipse at center,${flask.color} 0%,transparent 68%)`,
            filter: "blur(34px)",
            opacity: 0.36,
            animation: "endpoint-pulse 2.2s ease-in-out infinite",
          }}
        />
      )}

      <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full h-full relative z-10">
        <defs>
          <clipPath id="tw-flask-clip"><path d={FLASK_PATH} /></clipPath>
          <clipPath id="tw-bur-clip">
            <rect x={B.x} y={B.y} width={B.w} height={B.h} />
          </clipPath>

          <linearGradient id="tw-bur-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.26)" />
            <stop offset="32%"  stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.08)"       />
          </linearGradient>
          <linearGradient id="tw-flask-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.19)" />
            <stop offset="38%"  stopColor="rgba(255,255,255,0.04)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.06)"       />
          </linearGradient>
          <linearGradient id="tw-naoh-liq" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(134,239,172,0.95)" />
            <stop offset="58%"  stopColor="rgba(74,222,128,0.88)"  />
            <stop offset="100%" stopColor="rgba(34,197,94,0.76)"   />
          </linearGradient>

          <filter id="tw-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="rgba(0,0,0,0.32)" />
          </filter>
          <filter id="tw-glow">
            <feGaussianBlur stdDeviation="10" />
          </filter>
          <filter id="tw-soft">
            <feGaussianBlur stdDeviation="3.5" />
          </filter>
          <filter id="tw-dot-glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ── Lab bench top ── */}
        <rect x={0} y={BY + 10} width={VW} height={VH - BY - 10}
          fill="#dde5ef" />
        <rect x={0} y={BY + 10} width={VW} height={5}
          fill="#f0f4f8" opacity="0.7" />

        {/* ── Retort stand ── */}
        {/* Base plate */}
        <rect x={22} y={BY + 4} width={238} height={18} rx={6}
          fill="#94a3b8" stroke="#64748b" strokeWidth="1" />
        <rect x={22} y={BY + 4} width={238} height={6} rx={3}
          fill="#cbd5e1" opacity="0.6" />
        {/* Vertical rod */}
        <rect x={42} y={54} width={10} height={BY - 52} rx={3}
          fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8" />
        <rect x={43} y={54} width={2.5} height={BY - 52} rx={1}
          fill="rgba(255,255,255,0.65)" />
        {/* Upper clamp bar */}
        <rect x={52} y={72} width={122} height={9} rx={4}
          fill="#64748b" stroke="#475569" strokeWidth="0.7" />
        <rect x={52} y={72} width={122} height={3.5} rx={2}
          fill="rgba(255,255,255,0.22)" />
        {/* Clamp ring */}
        <rect x={163} y={64} width={14} height={23} rx={5}
          fill="#475569" stroke="#334155" strokeWidth="0.6" />
        <rect x={164} y={66} width={4} height={19} rx={2}
          fill="rgba(255,255,255,0.22)" />

        {/* ── Burette outer glow ── */}
        <rect x={B.x - 7} y={B.y - 7} width={B.w + 14} height={B.h + 14} rx={7}
          fill="rgba(255,255,255,0.32)" filter="url(#tw-soft)" />

        {/* Burette glass tube */}
        <rect x={B.x} y={B.y} width={B.w} height={B.h} rx={3}
          fill="rgba(255,255,255,0.52)"
          stroke="rgba(71,85,105,0.44)"
          strokeWidth="1.3"
          filter="url(#tw-shadow)" />

        {/* NaOH liquid */}
        <motion.rect
          x={B.x + 2} width={B.w - 4}
          clipPath="url(#tw-bur-clip)"
          animate={{ y: buretteFillY, height: buretteFillH }}
          transition={{ type: "spring", stiffness: 48, damping: 14 }}
          fill="url(#tw-naoh-liq)"
        />
        {/* Meniscus */}
        {buretteFillH > 8 && (
          <motion.path
            animate={{
              d: `M ${B.x + 2} ${buretteFillY} Q ${B.x + B.w / 2} ${buretteFillY + 4} ${B.x + B.w - 2} ${buretteFillY}`,
            }}
            transition={{ type: "spring", stiffness: 48, damping: 14 }}
            fill="rgba(134,239,172,0.28)"
            stroke="rgba(134,239,172,0.55)"
            strokeWidth="0.7"
          />
        )}
        {/* Sheen + highlight */}
        <rect x={B.x} y={B.y} width={B.w} height={B.h} rx={3}
          fill="url(#tw-bur-sheen)" clipPath="url(#tw-bur-clip)" />
        <rect x={B.x + 3.5} y={B.y + 8} width={3} height={B.h - 24} rx={1.5}
          fill="rgba(255,255,255,0.12)" />

        {/* ── Graduation marks ── */}
        {GRAD_TICKS.map(({ vol, y: yy, major, mid }) => (
          <g key={vol}>
            <line
              x1={B.x + B.w} y1={yy}
              x2={B.x + B.w + (major ? 12 : mid ? 7 : 4)} y2={yy}
              stroke={major ? "rgba(99,179,237,0.60)" : "rgba(148,163,184,0.35)"}
              strokeWidth={major ? 1.1 : mid ? 0.65 : 0.4}
            />
            {major && (
              <text
                x={B.x + B.w + 16} y={yy + 3.5}
                fontSize="7.5"
                fill="#3b6690"
                fontVariant="tabular-nums"
              >
                {vol}
              </text>
            )}
          </g>
        ))}
        {/* Volume axis label */}
        <text x={B.x + B.w + 16} y={B.y - 8}
          fontSize="6.5" fill="#64748b">mL</text>

        {/* Burette header */}
        <text x={B.x + B.w / 2} y={B.y - 15}
          fontSize="8.5" fill="#059669" textAnchor="middle" fontWeight="700">0.1 M NaOH</text>
        <text x={B.x + B.w / 2} y={B.y - 6}
          fontSize="7" fill="#475569" textAnchor="middle">sodium hydroxide</text>
        {/* Remaining volume readout */}
        <text x={B.x + B.w / 2} y={B.y + B.h + 13}
          fontSize="8" fill="#475569" textAnchor="middle">
          {burette.volumeRemaining.toFixed(1)} mL left
        </text>

        {/* ── Stopcock ── */}
        <rect
          x={STOPCOCK.x} y={STOPCOCK.y}
          width={STOPCOCK.w} height={STOPCOCK.h} rx={7}
          fill={stopcockOpen ? "#059669" : "#991b1b"}
          stroke={stopcockOpen ? "rgba(52,211,153,0.45)" : "rgba(239,68,68,0.32)"}
          strokeWidth="1"
          style={{ transition: "fill 0.28s ease" }}
        />
        <rect
          x={STOPCOCK.x + 2} y={STOPCOCK.y + 2}
          width={STOPCOCK.w - 4} height={5} rx={3}
          fill="rgba(255,255,255,0.19)"
        />
        <text
          x={STOPCOCK.x + STOPCOCK.w / 2} y={STOPCOCK.y + 9.5}
          fontSize="5.8" fill="white" textAnchor="middle" fontWeight="800" letterSpacing="0.08em"
        >
          {stopcockOpen ? "OPEN" : "CLOSED"}
        </text>

        {/* ── Tapered burette tip ── */}
        <path
          d={`M ${TIP.x} ${TIP.y}
              L ${TIP.x} ${TIP.y + TIP.h - 6}
              L ${TIP.x + TIP.w / 2} ${TIP.y + TIP.h}
              L ${TIP.x + TIP.w} ${TIP.y + TIP.h - 6}
              L ${TIP.x + TIP.w} ${TIP.y} Z`}
          fill="rgba(71,85,105,0.65)"
          stroke="rgba(99,163,184,0.38)"
          strokeWidth="0.7"
        />
        {stopcockOpen && (
          <path
            d={`M ${TIP.x + 1} ${TIP.y}
                L ${TIP.x + 1} ${TIP.y + TIP.h - 7}
                L ${TIP.x + TIP.w / 2} ${TIP.y + TIP.h - 1}
                L ${TIP.x + TIP.w - 1} ${TIP.y + TIP.h - 7}
                L ${TIP.x + TIP.w - 1} ${TIP.y} Z`}
            fill="rgba(74,222,128,0.62)"
          />
        )}

        {/* Dashed flow guide */}
        {isTitrating && (
          <line
            x1={TIP_CX} y1={TIP_CY}
            x2={TIP_CX} y2={dripTargetCy(flask.volume)}
            stroke="rgba(74,222,128,0.10)"
            strokeWidth="1.5"
            strokeDasharray="3 4"
          />
        )}

        {/* ── Endpoint glow ellipses ── */}
        {endpointReached && (
          <>
            <ellipse cx={FCX} cy={BY - 55} rx={92} ry={46}
              fill={flask.color} fillOpacity="0.20" filter="url(#tw-glow)"
              style={{ animation: "endpoint-pulse 2.4s ease-in-out infinite", transformBox: "fill-box", transformOrigin: "center" }}
            />
            <ellipse cx={FCX} cy={BY - 68} rx={54} ry={26}
              fill={flask.color} fillOpacity="0.15"
              style={{ animation: "endpoint-pulse 2.0s ease-in-out infinite 0.4s", transformBox: "fill-box", transformOrigin: "center" }}
            />
          </>
        )}

        {/* ── Erlenmeyer flask — glass shell ── */}
        <path
          d={FLASK_PATH}
          fill="rgba(255,255,255,0.38)"
          stroke="rgba(71,85,105,0.52)"
          strokeWidth="1.8"
          strokeLinejoin="round"
          filter="url(#tw-shadow)"
        />

        {/* Flask liquid fill */}
        <motion.rect
          x={BL - 4} width={BR - BL + 8}
          clipPath="url(#tw-flask-clip)"
          animate={{ y: flaskLiqY, height: Math.max(1, BY - flaskLiqY + 2) }}
          transition={{ type: "spring", stiffness: 32, damping: 11 }}
          style={{ fill: flaskDispColor, transition: "fill 0.70s ease", fillOpacity: 0.88 }}
        />
        {/* Meniscus in flask */}
        {flaskLiqH > 6 && (
          <motion.path
            animate={{ d: meniscusPath(flaskLiqY, flaskLiqH) }}
            transition={{ type: "spring", stiffness: 32, damping: 11 }}
            fill="rgba(255,255,255,0.09)"
            stroke={flask.indicatorAdded ? flask.color : "rgba(99,179,237,0.30)"}
            strokeWidth="1.1"
            clipPath="url(#tw-flask-clip)"
            style={{ transition: "stroke 0.70s ease" }}
          />
        )}
        {/* Glass sheen overlay */}
        <path d={FLASK_PATH} fill="url(#tw-flask-sheen)" />
        {/* Left inner highlight stroke */}
        <path
          d={`M ${NL + 4} ${NY + 5} L ${NL + 4} 464 C ${NL} 494,${BL + 12} 533,${BL + 8} ${BY - 4}`}
          fill="none"
          stroke="rgba(255,255,255,0.09)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Neck rim highlight */}
        <line x1={NL} y1={NY} x2={NR} y2={NY}
          stroke="rgba(99,179,237,0.48)" strokeWidth="2.2" />

        {/* Flask labels */}
        <text x={FCX} y={BY - 26} fontSize="9.5" fill="#1e3a8a"
          textAnchor="middle" fontWeight="700">0.1 M HCl · 25 mL</text>
        <text x={FCX} y={BY - 14} fontSize="8" fill="#475569" textAnchor="middle">
          {flask.volume.toFixed(1)} mL total · pH {flask.pH.toFixed(2)}
        </text>
        {!flask.indicatorAdded && (
          <text x={FCX} y={BY - 48} fontSize="8.5" fill="#64748b"
            textAnchor="middle" fontStyle="italic">↑ add indicator to begin</text>
        )}

        {/* ── White tile ── */}
        <rect x={BL - 18} y={BY + 1} width={BR - BL + 36} height={12} rx={3}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.9" />
        <text x={FCX} y={BY + 10} fontSize="5.5" fill="#64748b"
          textAnchor="middle" letterSpacing="0.14em">WHITE TILE</text>

        {/* Indicator dot badge */}
        {flask.indicatorAdded && (
          <g>
            <circle cx={NR + 22} cy={NY + 6} r={7}
              fill={flask.color}
              stroke="rgba(71,85,105,0.26)"
              strokeWidth="1.5"
              filter="url(#tw-dot-glow)"
              style={{ transition: "fill 0.70s ease" }}
            />
            <text x={NR + 36} y={NY + 10} fontSize="7" fill="#475569" fontWeight="600">
              indicator
            </text>
          </g>
        )}

        {/* ── Teardrop drips ── */}
        <AnimatePresence>
          {drips.map((drip) => {
            const target = dripTargetCy(flask.volume);
            const r = drip.size / 2;
            return (
              <motion.g key={drip.id}>
                <motion.path
                  d={
                    `M ${TIP_CX + drip.xOff - r * 0.7} ${TIP_CY}` +
                    ` Q ${TIP_CX + drip.xOff - r} ${TIP_CY + drip.size * 0.55}` +
                    ` ${TIP_CX + drip.xOff} ${TIP_CY + drip.size * 1.5}` +
                    ` Q ${TIP_CX + drip.xOff + r} ${TIP_CY + drip.size * 0.55}` +
                    ` ${TIP_CX + drip.xOff + r * 0.7} ${TIP_CY} Z`
                  }
                  fill="rgba(134,239,172,0.94)"
                  stroke="rgba(74,222,128,0.50)"
                  strokeWidth="0.5"
                  initial={{ opacity: 1, translateY: 0 }}
                  animate={{ opacity: [1, 0.85, 0.3, 0], translateY: target - TIP_CY }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.65, ease: [0.32, 0, 0.8, 1] }}
                />
              </motion.g>
            );
          })}
        </AnimatePresence>

        {/* ── Ripples ── */}
        <AnimatePresence>
          {ripples.map((rip) => (
            <motion.ellipse
              key={rip.id}
              cx={rip.cx} cy={rip.cy}
              fill="none"
              stroke={flask.indicatorAdded ? flask.color : "rgba(99,179,237,0.50)"}
              strokeWidth="1.5"
              initial={{ rx: 2,  ry: 1, opacity: 0.9 }}
              animate={{ rx: 26, ry: 9, opacity: 0   }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>

        {/* ── pH Meter — digital LCD ── */}
        <g filter="url(#tw-shadow)">
          {/* Meter body */}
          <rect x={316} y={392} width={128} height={78} rx={11}
            fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.3" />
          {/* Header band */}
          <rect x={316} y={392} width={128} height={28} rx={11} fill="#f1f5f9" />
          <rect x={316} y={412} width={128} height={8} fill="#f1f5f9" />
          <text x={380} y={408} fontSize="7.5" fill="#475569"
            textAnchor="middle" fontWeight="700" letterSpacing="0.15em">pH METER</text>
          {/* Big pH reading */}
          <text
            x={380} y={453}
            fontSize="26" fontWeight="900"
            fill={endpointReached ? "#e11d48" : flask.pH > 8 ? "#059669" : flask.pH > 7.2 ? "#0284c7" : "#2563eb"}
            textAnchor="middle"
            fontFamily="monospace"
            style={{ transition: "fill 0.9s ease" }}
          >
            {flask.pH.toFixed(2)}
          </text>
          {/* Status micro-label */}
          <text x={380} y={464} fontSize="7" fill="#94a3b8" textAnchor="middle">
            {flask.pH < 6.8 ? "Acidic ▼" : flask.pH > 7.2 ? "Basic ▲" : "Neutral ≈ 7"}
          </text>
        </g>

        {/* ── Volume readout badge ── */}
        <g filter="url(#tw-shadow)">
          <rect x={316} y={480} width={128} height={52} rx={10}
            fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.2" />
          <text x={380} y={498} fontSize="7" fill="#475569"
            textAnchor="middle" letterSpacing="0.10em" fontWeight="600">NaOH ADDED</text>
          <text x={380} y={517}
            fontSize="17" fontWeight="800" fill="#059669"
            textAnchor="middle" fontFamily="monospace">
            {volumeAdded.toFixed(2)} mL
          </text>
          <text x={380} y={527} fontSize="6.5" fill="#94a3b8" textAnchor="middle">
            equiv. point: 25.00 mL
          </text>
        </g>

        {/* ── Endpoint badge ── */}
        {endpointReached && (
          <g filter="url(#tw-shadow)">
            <rect x={316} y={350} width={128} height={34} rx={8}
              fill="rgba(5,150,105,0.07)" stroke="#059669" strokeWidth="1.4" />
            <text x={380} y={372} fontSize="10" fill="#059669"
              textAnchor="middle" fontWeight="800">✓ ENDPOINT REACHED</text>
          </g>
        )}

        {/* ── Live Calculations panel ── */}
        <g opacity="0.97">
          <rect x={314} y={540} width={132} height={100} rx={11}
            fill="rgba(239,246,255,0.98)"
            stroke="rgba(147,197,253,0.55)"
            strokeWidth="1.2"
            filter="url(#tw-shadow)"
          />
          <rect x={314} y={540} width={132} height={20} rx={11}
            fill="rgba(219,234,254,0.80)" />
          <rect x={314} y={552} width={132} height={8}
            fill="rgba(219,234,254,0.80)" />
          <text x={380} y={554} fontSize="7.5" fill="#2563eb"
            textAnchor="middle" fontWeight="800" letterSpacing="0.10em">CALCULATIONS</text>
          <line x1={320} y1={561} x2={440} y2={561}
            stroke="rgba(147,197,253,0.40)" strokeWidth="0.8" />

          {/* Row: n(HCl) initial */}
          <text x={320} y={573} fontSize="8" fill="#475569">n(HCl₀)</text>
          <text x={440} y={573} fontSize="8" fill="#1e40af"
            textAnchor="end" fontFamily="monospace" fontWeight="700">
            0.00250 mol
          </text>

          {/* Row: n(NaOH) added */}
          <text x={320} y={584} fontSize="8" fill="#475569">n(NaOH)</text>
          <text x={440} y={584} fontSize="8" fill="#059669"
            textAnchor="end" fontFamily="monospace" fontWeight="700">
            {baseMolesIn.toFixed(5)} mol
          </text>

          {/* Row: excess or remaining */}
          {!pastEquiv ? (
            <>
              <text x={320} y={595} fontSize="8" fill="#475569">HCl left</text>
              <text x={440} y={595} fontSize="8"
                fill={acidLeft < 0.0002 ? "#059669" : "#dc2626"}
                textAnchor="end" fontFamily="monospace" fontWeight="700">
                {acidLeft.toFixed(5)} mol
              </text>
            </>
          ) : (
            <>
              <text x={320} y={595} fontSize="8" fill="#475569">NaOH xs</text>
              <text x={440} y={595} fontSize="8" fill="#7c3aed"
                textAnchor="end" fontFamily="monospace" fontWeight="700">
                {baseExcess.toFixed(5)} mol
              </text>
            </>
          )}

          {/* Row: volume still needed */}
          <text x={320} y={606} fontSize="8" fill="#475569">V to add</text>
          <text x={440} y={606} fontSize="8"
            fill={volNeeded <= 0 ? "#059669" : "#475569"}
            textAnchor="end" fontFamily="monospace" fontWeight="700">
            {volNeeded <= 0 ? "✓ done" : `${volNeeded.toFixed(2)} mL`}
          </text>

          {/* Row: M₁V₁ = M₂V₂ */}
          <text x={320} y={617} fontSize="7.5" fill="#475569">M₁V₁=M₂V₂</text>
          <text x={440} y={617} fontSize="7.5" fill="#7c3aed"
            textAnchor="end" fontFamily="monospace" fontWeight="700">
            {(0.1 * 25).toFixed(1)}={(0.1 * volumeAdded).toFixed(2)}
          </text>

          {/* Row: current pH */}
          <text x={320} y={628} fontSize="8" fill="#475569">pH now</text>
          <text x={440} y={628} fontSize="8"
            fill={endpointReached ? "#e11d48" : "#2563eb"}
            textAnchor="end" fontFamily="monospace" fontWeight="800">
            {flask.pH.toFixed(2)}
          </text>
        </g>
      </svg>
    </div>
  );
}

function dripTargetCy(flaskVolume: number): number {
  const flaskFill = Math.min(1, flaskVolume / MAX_VOL);
  const flaskLiqH = Math.max(0, flaskFill * (BY - 465));
  const flaskLiqY = BY - flaskLiqH;
  return Math.min(BY - 10, Math.max(flaskLiqY + 18, BY - 88));
}
