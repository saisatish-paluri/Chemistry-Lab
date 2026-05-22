"use client";

import { useEffect, useState, useRef, startTransition, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TitrationFlask, TitrationBurette } from "@/lib/engine/types";

// ── SVG layout constants ─────────────────────────────────────────────────────
const B        = { x: 167, y: 82,  w: 22, h: 288 };
const STOPCOCK = { x: 162, y: 363, w: 32, h: 13  };
const TIP      = { x: 175, y: 376, w: 6,  h: 28  };
const NECK_L   = 160; const NECK_R = 196; const NECK_Y = 428;
const BASE_L   = 115; const BASE_R = 258; const BASE_Y = 555;

const FLASK_PATH =
  `M ${NECK_L} ${NECK_Y} L ${NECK_L} 460 ` +
  `Q 128 482 ${BASE_L} 542 L ${BASE_L} ${BASE_Y} ` +
  `L ${BASE_R} ${BASE_Y} L ${BASE_R} 542 ` +
  `Q 244 482 ${NECK_R} 460 L ${NECK_R} ${NECK_Y} Z`;

const MAX_VOL  = 75;
const TIP_CX   = TIP.x + TIP.w / 2;   // 178
const TIP_CY   = TIP.y + TIP.h;        // 404
const FLASK_CX = (BASE_L + BASE_R) / 2;

interface Drip { id: number; size: number; xOff: number }
interface Ripple { id: number; cx: number; cy: number }

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

  // Drip-spawn logic — teardrop falls from tip to flask surface
  useEffect(() => {
    if (!isTitrating) { startTransition(() => setDrips([])); return; }

    const count    = burette.flowRate >= 5 ? 5 : burette.flowRate >= 1 ? 3 : burette.flowRate >= 0.5 ? 2 : 1;
    const interval = Math.max(70, 380 / count);

    const id = setInterval(() => {
      nextId.current += 1;
      const nid  = nextId.current;
      const drip: Drip = {
        id:   nid,
        size: 5 + Math.random() * 4.5,
        xOff: (Math.random() - 0.5) * 7,
      };
      setDrips((prev) => [...prev.slice(-7), drip]);
      // Spawn ripple ~600 ms later (drop landing time)
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

  const buretteFillH = Math.max(0, (burette.volumeRemaining / 50) * B.h);
  const buretteFillY = B.y + (B.h - buretteFillH);
  const flaskFill    = Math.min(1, flask.volume / MAX_VOL);
  const flaskLiqH    = Math.max(0, flaskFill * (BASE_Y - 460));
  const flaskLiqY    = BASE_Y - flaskLiqH;
  const stopcockOpen = burette.stopcockOpen || isTitrating;

  const flaskDisplayColor = flask.indicatorAdded ? flask.color : "rgba(219,234,254,0.35)";

  // Meniscus path — curved concave surface on liquid top
  const meniscusPath = useCallback((liqY: number, liqH: number) => {
    if (liqH < 4) return "";
    // Determine width at the meniscus level (within the flask shape)
    const progress = Math.max(0, Math.min(1, (BASE_Y - liqY) / (BASE_Y - 460)));
    const halfW = 55 + progress * 16; // narrower at top, wider at bottom
    const cx    = FLASK_CX;
    const sag   = 6; // how deep the meniscus curves down
    return `M ${cx - halfW} ${liqY} Q ${cx} ${liqY + sag} ${cx + halfW} ${liqY}`;
  }, []);

  return (
    <div className="relative w-full select-none" style={{ aspectRatio: "480/600" }}>
      <svg viewBox="0 0 480 600" className="w-full h-full">
        <defs>
          <clipPath id="t-flask-clip"><path d={FLASK_PATH} /></clipPath>
          <clipPath id="t-bur-clip">
            <rect x={B.x} y={B.y} width={B.w} height={B.h} />
          </clipPath>

          {/* Burette glass sheen */}
          <linearGradient id="t-bur-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.62)" />
            <stop offset="28%"  stopColor="rgba(255,255,255,0.08)" />
            <stop offset="70%"  stopColor="rgba(0,0,0,0.03)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.10)" />
          </linearGradient>

          {/* Flask glass sheen */}
          <linearGradient id="t-flask-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.50)" />
            <stop offset="35%"  stopColor="rgba(255,255,255,0.08)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.07)" />
          </linearGradient>

          {/* Liquid surface sheen */}
          <linearGradient id="t-liq-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.38)" />
            <stop offset="55%"  stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.05)" />
          </linearGradient>

          {/* NaOH gradient in burette (green, top-lit) */}
          <linearGradient id="t-naoh-liq" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(187,247,208,0.95)" />
            <stop offset="40%"  stopColor="rgba(134,239,172,0.90)" />
            <stop offset="100%" stopColor="rgba(74,222,128,0.75)"  />
          </linearGradient>

          {/* Drop shadow */}
          <filter id="t-drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="rgba(15,23,42,0.12)" />
          </filter>

          {/* Glow blur for endpoint */}
          <filter id="t-glow-blur">
            <feGaussianBlur stdDeviation="10" />
          </filter>

          {/* Subtle glass inner reflection filter */}
          <filter id="t-glass-inner">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>

        {/* ── Retort stand ── */}
        {/* Base plate */}
        <rect x={28} y={572} width={236} height={20} rx={7} fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
        <rect x={28} y={569} width={236} height={5}  rx={3} fill="#94a3b8" opacity="0.30" />
        {/* Vertical pole */}
        <rect x={40} y={82} width={10} height={490} rx={3} fill="#b0bec5" stroke="#78909c" strokeWidth="0.7" />
        <rect x={41} y={82} width={2}  height={490} rx={1} fill="rgba(255,255,255,0.30)" />
        {/* Clamp arm */}
        <rect x={50} y={104} width={118} height={9}  rx={3.5} fill="#607d8b" />
        <rect x={50} y={104} width={118} height={3.5} rx={1.5} fill="rgba(255,255,255,0.22)" />
        {/* Burette collar */}
        <rect x={159} y={98} width={14} height={22} rx={5} fill="#455a64" stroke="#607d8b" strokeWidth="0.6" />
        <rect x={160} y={100} width={4} height={18} rx={2} fill="rgba(255,255,255,0.18)" />

        {/* ── Burette glass tube ── */}
        {/* Outer glass */}
        <rect x={B.x} y={B.y} width={B.w} height={B.h} rx={3}
          fill="rgba(219,234,254,0.12)" stroke="#93c5fd" strokeWidth="1.6"
          filter="url(#t-drop-shadow)" />

        {/* NaOH liquid */}
        <motion.rect
          x={B.x + 2} width={B.w - 4}
          clipPath="url(#t-bur-clip)"
          animate={{ y: buretteFillY, height: buretteFillH }}
          transition={{ type: "spring", stiffness: 52, damping: 14 }}
          fill="url(#t-naoh-liq)"
        />

        {/* Burette meniscus (concave curve at liquid top) */}
        {buretteFillH > 8 && (
          <motion.path
            animate={{ d: `M ${B.x + 2} ${buretteFillY} Q ${B.x + B.w / 2} ${buretteFillY + 4} ${B.x + B.w - 2} ${buretteFillY}` }}
            transition={{ type: "spring", stiffness: 52, damping: 14 }}
            fill="rgba(134,239,172,0.40)"
            stroke="rgba(134,239,172,0.65)"
            strokeWidth="0.8"
          />
        )}

        {/* Glass sheen overlay on burette */}
        <rect x={B.x} y={B.y} width={B.w} height={B.h} rx={3}
          fill="url(#t-bur-sheen)" clipPath="url(#t-bur-clip)" />
        {/* Inner secondary highlight */}
        <rect x={B.x + 3} y={B.y + 8} width={4} height={B.h - 24} rx={2}
          fill="rgba(255,255,255,0.22)" />

        {/* Graduation marks */}
        {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].map((t) => {
          const yy    = B.y + t * B.h;
          const major = t === 0 || t === 0.5 || t === 1;
          const mid   = t === 0.25 || t === 0.75;
          return (
            <g key={t}>
              <line x1={B.x + B.w} y1={yy}
                x2={B.x + B.w + (major ? 10 : mid ? 6 : 4)} y2={yy}
                stroke="#94a3b8" strokeWidth={major ? 1.1 : 0.6} />
              {major && (
                <text x={B.x + B.w + 14} y={yy + 3.5} fontSize="8.5" fill="#64748b">
                  {(t * 50).toFixed(0)}
                </text>
              )}
            </g>
          );
        })}
        <text x={B.x + B.w / 2} y={B.y - 12} fontSize="8.5" fill="#334155"
          textAnchor="middle" fontWeight="700">0.1 M NaOH</text>
        <text x={B.x + B.w / 2} y={B.y - 3} fontSize="7.5" fill="#64748b" textAnchor="middle">
          (sodium hydroxide)
        </text>
        <text x={B.x + B.w / 2} y={B.y + B.h + 14} fontSize="8" fill="#64748b" textAnchor="middle">
          {burette.volumeRemaining.toFixed(1)} mL left
        </text>

        {/* ── Stopcock ── */}
        <rect x={STOPCOCK.x} y={STOPCOCK.y} width={STOPCOCK.w} height={STOPCOCK.h} rx={6}
          fill={stopcockOpen ? "#4ade80" : "#f87171"} stroke="#e2e8f0" strokeWidth="1"
          style={{ transition: "fill 0.30s ease" }} />
        <rect x={STOPCOCK.x + 2} y={STOPCOCK.y + 1.5} width={STOPCOCK.w - 4} height={4.5} rx={3}
          fill="rgba(255,255,255,0.28)" />
        <text x={STOPCOCK.x + STOPCOCK.w / 2} y={STOPCOCK.y + 9.5}
          fontSize="6.5" fill="white" textAnchor="middle" fontWeight="800" letterSpacing="0.06em">
          {stopcockOpen ? "OPEN" : "CLOSED"}
        </text>

        {/* ── Tip (nozzle) ── */}
        <rect x={TIP.x} y={TIP.y} width={TIP.w} height={TIP.h} rx={1.5}
          fill="rgba(219,234,254,0.55)" stroke="#93c5fd" strokeWidth="1" />
        {stopcockOpen && (
          <rect x={TIP.x + 1} y={TIP.y} width={TIP.w - 2} height={TIP.h}
            fill="rgba(134,239,172,0.70)" />
        )}

        {/* Drop-path guide line */}
        {isTitrating && (
          <line
            x1={TIP_CX} y1={TIP_CY}
            x2={TIP_CX} y2={dripTargetCy(flask.volume)}
            stroke="rgba(134,239,172,0.18)"
            strokeWidth="1.5"
            strokeDasharray="4 5"
          />
        )}

        {/* ── Endpoint glow ── */}
        {endpointReached && (
          <ellipse
            cx={FLASK_CX} cy={BASE_Y - 60}
            rx={74} ry={38}
            fill={flask.color}
            filter="url(#t-glow-blur)"
            style={{
              animation: "endpoint-pulse 2.2s ease-in-out infinite",
              transformBox: "fill-box",
              transformOrigin: "center",
            }}
          />
        )}

        {/* ── Flask outline ── */}
        <path d={FLASK_PATH} fill="rgba(219,234,254,0.10)" stroke="#93c5fd"
          strokeWidth="1.9" strokeLinejoin="round" filter="url(#t-drop-shadow)" />

        {/* Flask liquid fill */}
        <motion.rect
          x={BASE_L - 4} width={BASE_R - BASE_L + 8}
          clipPath="url(#t-flask-clip)"
          animate={{ y: flaskLiqY, height: Math.max(1, BASE_Y - flaskLiqY + 2) }}
          transition={{ type: "spring", stiffness: 36, damping: 11 }}
          style={{ fill: flaskDisplayColor, transition: "fill 0.65s ease", fillOpacity: 0.90 }}
        />

        {/* Flask liquid meniscus (concave top surface) */}
        {flaskLiqH > 6 && (
          <motion.path
            animate={{ d: meniscusPath(flaskLiqY, flaskLiqH) }}
            transition={{ type: "spring", stiffness: 36, damping: 11 }}
            fill="rgba(255,255,255,0.18)"
            stroke={flask.indicatorAdded ? flask.color : "rgba(147,197,253,0.55)"}
            strokeWidth="1.2"
            clipPath="url(#t-flask-clip)"
            style={{ transition: "stroke 0.65s ease" }}
          />
        )}

        {/* Flask liquid sheen */}
        <rect x={BASE_L - 4} y={flaskLiqY} width={BASE_R - BASE_L + 8}
          height={Math.max(0, BASE_Y - flaskLiqY + 2)}
          fill="url(#t-liq-sheen)" clipPath="url(#t-flask-clip)" />

        {/* Flask glass highlight */}
        <path d={FLASK_PATH} fill="url(#t-flask-sheen)" />
        {/* Secondary inner edge highlight */}
        <path
          d={`M ${NECK_L + 4} ${NECK_Y + 4} L ${NECK_L + 4} 462 Q 134 484 ${BASE_L + 8} 544`}
          fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="3" strokeLinecap="round"
        />

        {/* Flask rim */}
        <line x1={NECK_L} y1={NECK_Y} x2={NECK_R} y2={NECK_Y} stroke="#93c5fd" strokeWidth="2.2" />
        {/* Rim inner top highlight */}
        <line x1={NECK_L + 3} y1={NECK_Y + 1} x2={NECK_R - 3} y2={NECK_Y + 1}
          stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" />

        {/* Flask label */}
        <text x={FLASK_CX} y={537} fontSize="10" fill="#334155"
          textAnchor="middle" fontWeight="700">0.1 M HCl</text>
        <text x={FLASK_CX} y={549} fontSize="8.5" fill="#64748b" textAnchor="middle">
          (hydrochloric acid)
        </text>
        <text x={FLASK_CX} y={561} fontSize="8" fill="#94a3b8" textAnchor="middle">
          {flask.volume.toFixed(1)} mL · pH {flask.pH.toFixed(2)}
        </text>

        {/* ── Teardrop drip animation ── */}
        <AnimatePresence>
          {drips.map((drip) => {
            const target = dripTargetCy(flask.volume);
            const r = drip.size / 2;
            return (
              <motion.g key={drip.id}>
                <motion.path
                  d={`M ${TIP_CX + drip.xOff - r * 0.7} ${TIP_CY}
                      Q ${TIP_CX + drip.xOff - r} ${TIP_CY + drip.size * 0.55}
                        ${TIP_CX + drip.xOff} ${TIP_CY + drip.size * 1.5}
                      Q ${TIP_CX + drip.xOff + r} ${TIP_CY + drip.size * 0.55}
                        ${TIP_CX + drip.xOff + r * 0.7} ${TIP_CY} Z`}
                  fill="rgba(134,239,172,0.94)"
                  stroke="rgba(74,222,128,0.50)"
                  strokeWidth="0.5"
                  initial={{ opacity: 1,  translateY: 0       }}
                  animate={{ opacity: [1, 0.85, 0.3, 0], translateY: target - TIP_CY }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.65, ease: [0.32, 0, 0.8, 1] }}
                />
              </motion.g>
            );
          })}
        </AnimatePresence>

        {/* ── Ripple effect where drop lands ── */}
        <AnimatePresence>
          {ripples.map((rip) => (
            <motion.ellipse
              key={rip.id}
              cx={rip.cx}
              cy={rip.cy}
              fill="none"
              stroke={flask.indicatorAdded ? flask.color : "rgba(147,197,253,0.70)"}
              strokeWidth="1.5"
              initial={{ rx: 2, ry: 1, opacity: 0.9 }}
              animate={{ rx: 22, ry: 8,  opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>

        {/* ── pH badge ── */}
        <g filter="url(#t-drop-shadow)">
          <rect x={282} y={434} width={106} height={60} rx={14}
            fill="rgba(255,255,255,0.97)" stroke="rgba(148,163,184,0.20)" strokeWidth="1.2" />
          <rect x={282} y={434} width={106} height={22} rx={14}
            fill="rgba(241,245,249,0.95)" />
          <rect x={282} y={448} width={106} height={8}
            fill="rgba(241,245,249,0.95)" />
          <text x={335} y={449} fontSize="7.5" fill="#64748b"
            textAnchor="middle" fontWeight="700" letterSpacing="0.12em">pH METER</text>
          <text x={335} y={481} fontSize="20" fontWeight="900" fill="#0f172a"
            textAnchor="middle" fontFamily="monospace">
            {flask.pH.toFixed(2)}
          </text>
        </g>

        {/* ── Volume badge ── */}
        <g filter="url(#t-drop-shadow)">
          <rect x={282} y={504} width={106} height={44} rx={14}
            fill="rgba(255,255,255,0.97)" stroke="rgba(148,163,184,0.20)" strokeWidth="1.2" />
          <text x={335} y={520} fontSize="7.5" fill="#64748b"
            textAnchor="middle" letterSpacing="0.08em" fontWeight="600">NaOH ADDED</text>
          <text x={335} y={538} fontSize="14" fontWeight="800" fill="#2563eb"
            textAnchor="middle" fontFamily="monospace">{volumeAdded.toFixed(2)} mL</text>
        </g>

        {/* ── Endpoint badge ── */}
        {endpointReached && (
          <g filter="url(#t-drop-shadow)">
            <rect x={282} y={388} width={106} height={36} rx={11}
              fill="rgba(5,150,105,0.10)" stroke="#86efac" strokeWidth="1.2" />
            <text x={335} y={411} fontSize="10" fill="#059669"
              textAnchor="middle" fontWeight="800">✓ ENDPOINT</text>
          </g>
        )}

        {/* Indicator dot on flask neck */}
        {flask.indicatorAdded && (
          <g>
            <circle cx={NECK_R + 20} cy={NECK_Y + 5} r={6}
              fill={flask.color} stroke="#93c5fd" strokeWidth="1.4"
              style={{ transition: "fill 0.65s ease" }} />
            <text x={NECK_R + 36} y={NECK_Y + 9} fontSize="7.5" fill="#475569" fontWeight="600">
              Indicator
            </text>
          </g>
        )}

        {/* "Add indicator" prompt */}
        {!flask.indicatorAdded && (
          <text x={FLASK_CX} y={BASE_Y - 34} fontSize="9.5" fill="#94a3b8"
            textAnchor="middle" fontStyle="italic">↑ Add indicator to begin</text>
        )}

        {/* White tile behind flask (lab realism) */}
        <rect x={BASE_L - 16} y={BASE_Y + 2} width={BASE_R - BASE_L + 32} height={12} rx={3}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" opacity="0.9" />
        <text x={FLASK_CX} y={BASE_Y + 11} fontSize="6" fill="#cbd5e1"
          textAnchor="middle" letterSpacing="0.12em">WHITE TILE</text>
      </svg>
    </div>
  );
}

function dripTargetCy(flaskVolume: number): number {
  const flaskFill = Math.min(1, flaskVolume / MAX_VOL);
  const flaskLiqH = Math.max(0, flaskFill * (BASE_Y - 460));
  const flaskLiqY = BASE_Y - flaskLiqH;
  return Math.min(BASE_Y - 10, Math.max(flaskLiqY + 16, BASE_Y - 85));
}
