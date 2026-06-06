"use client";

import { motion } from "framer-motion";
import type { GasLaw, GasDataPoint } from "@/lib/engine/types";
import {
  BOYLE_V_MIN, BOYLE_V_MAX,
  CHARLES_T_MIN, CHARLES_T_MAX,
  boylePressure, charlesVolume,
} from "@/lib/engine/gas-laws-engine";

interface Props {
  law:         GasLaw | null;
  temperature: number;
  volume:      number;
  pressure:    number;
  dataPoints:  GasDataPoint[];
  isRunning:   boolean;
}

function PressureGauge({ pressure, maxP = 12 }: { pressure: number; maxP?: number }) {
  const fraction = Math.min(1, pressure / maxP);
  const angle    = -150 + fraction * 300;
  const rad      = (angle * Math.PI) / 180;
  const cx = 64, cy = 64, r = 50;
  const needleX = cx + (r - 6) * Math.cos(rad);
  const needleY = cy + (r - 6) * Math.sin(rad);
  const startAngle = (-150 * Math.PI) / 180;
  const endAngle   = (150 * Math.PI) / 180;
  const sx = cx + r * Math.cos(startAngle);
  const sy = cy + r * Math.sin(startAngle);
  const ex = cx + r * Math.cos(endAngle);
  const ey = cy + r * Math.sin(endAngle);

  const zones = [
    { start: -150, end: -30, color: "#34d399" },
    { start: -30,  end:  60, color: "#fbbf24" },
    { start:  60,  end: 150, color: "#f87171" },
  ];

  function arcPath(a1: number, a2: number) {
    const r1 = (a1 * Math.PI) / 180;
    const r2 = (a2 * Math.PI) / 180;
    const x1 = cx + r * Math.cos(r1); const y1 = cy + r * Math.sin(r1);
    const x2 = cx + r * Math.cos(r2); const y2 = cy + r * Math.sin(r2);
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  }

  const pct = Math.round(fraction * 100);
  const zoneColor = pct < 40 ? "#059669" : pct < 70 ? "#d97706" : "#ef4444";

  return (
    <svg viewBox="0 0 128 96" width="100%" style={{ display: "block" }}>
      <circle cx={cx} cy={cy} r={r + 6} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={r} fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
      <path d={`M ${sx} ${sy} A ${r} ${r} 0 1 1 ${ex} ${ey}`}
        fill="none" stroke="#e2e8f0" strokeWidth="7" strokeLinecap="round" />
      {zones.map((z, i) => (
        <path key={i} d={arcPath(z.start, z.end)}
          fill="none" stroke={z.color} strokeWidth="7" strokeLinecap="round" opacity={0.6} />
      ))}
      <motion.line x1={cx} y1={cy} x2={needleX} y2={needleY}
        stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round"
        animate={{ x2: cx + (r - 6) * Math.cos(rad), y2: cy + (r - 6) * Math.sin(rad) }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      />
      <circle cx={cx} cy={cy} r="5" fill="#334155" />
      <circle cx={cx} cy={cy} r="2.5" fill="#94a3b8" />
      <rect x={cx - 28} y={cy + 14} width="56" height="22" rx="5" fill="white" stroke="#e2e8f0" strokeWidth="1" />
      <text x={cx} y={cy + 29} textAnchor="middle" fontSize="9.5" fill={zoneColor} fontWeight="800" fontFamily="monospace">
        {pressure.toFixed(2)} atm
      </text>
      <text x={sx - 4} y={sy + 4} textAnchor="end" fontSize="6" fill="#64748b" fontWeight="600">0</text>
      <text x={ex + 4} y={ey + 4} textAnchor="start" fontSize="6" fill="#64748b" fontWeight="600">{maxP}</text>
    </svg>
  );
}

export function DataGraph({ law, dataPoints }: { law: GasLaw; dataPoints: GasDataPoint[] }) {
  const W = 320, H = 160;
  const PAD = { l: 44, r: 14, t: 16, b: 34 };
  const iW  = W - PAD.l - PAD.r;
  const iH  = H - PAD.t - PAD.b;

  const xLabel = law === "boyle" ? "Volume (L)" : "Temperature (K)";
  const yLabel = law === "boyle" ? "Pressure (atm)" : "Volume (L)";
  const xMin = law === "boyle" ? BOYLE_V_MIN : CHARLES_T_MIN;
  const xMax = law === "boyle" ? BOYLE_V_MAX : CHARLES_T_MAX;
  const yMin = 0;
  const yMax = law === "boyle" ? boylePressure(BOYLE_V_MIN) * 1.05 : charlesVolume(CHARLES_T_MAX) * 1.05;

  const toSvg = (x: number, y: number) => ({
    sx: PAD.l + ((x - xMin) / (xMax - xMin)) * iW,
    sy: PAD.t + iH - ((y - yMin) / (yMax - yMin)) * iH,
  });

  const curvePoints = law === "boyle"
    ? Array.from({ length: 60 }, (_, i) => {
        const v = BOYLE_V_MIN + (i / 59) * (BOYLE_V_MAX - BOYLE_V_MIN);
        return toSvg(v, boylePressure(v));
      })
    : Array.from({ length: 60 }, (_, i) => {
        const t = CHARLES_T_MIN + (i / 59) * (CHARLES_T_MAX - CHARLES_T_MIN);
        return toSvg(t, charlesVolume(t));
      });

  const curvePath = curvePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.sx} ${p.sy}`).join(" ");
  const curveColor = law === "boyle" ? "#2563eb" : "#ea580c";
  const dotColor   = law === "boyle" ? "#818cf8" : "#fb923c";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      {[0.25, 0.5, 0.75, 1].map((t) => {
        const y = PAD.t + (1 - t) * iH;
        return (
          <line key={`hg-${t}`} x1={PAD.l} y1={y} x2={PAD.l + iW} y2={y}
            stroke="#f1f5f9" strokeWidth="1" />
        );
      })}
      <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t + iH} stroke="#cbd5e1" strokeWidth="1.2" />
      <line x1={PAD.l} y1={PAD.t + iH} x2={PAD.l + iW} y2={PAD.t + iH} stroke="#cbd5e1" strokeWidth="1.2" />
      <text x={PAD.l + iW / 2} y={H - 4} textAnchor="middle" fontSize="8" fill="#64748b">{xLabel}</text>
      <text x={9} y={PAD.t + iH / 2} textAnchor="middle" fontSize="8" fill="#64748b"
        transform={`rotate(-90, 9, ${PAD.t + iH / 2})`}>{yLabel}</text>
      {[0.25, 0.5, 0.75, 1].map((t) => {
        const x = PAD.l + t * iW;
        const xVal = xMin + t * (xMax - xMin);
        return (
          <g key={`xt-${t}`}>
            <line x1={x} y1={PAD.t + iH} x2={x} y2={PAD.t + iH + 4} stroke="#cbd5e1" strokeWidth="1" />
            <text x={x} y={PAD.t + iH + 13} textAnchor="middle" fontSize="6.5" fill="#64748b">
              {xVal.toFixed(law === "boyle" ? 1 : 0)}
            </text>
          </g>
        );
      })}
      {[0.25, 0.5, 0.75, 1].map((t) => {
        const y = PAD.t + (1 - t) * iH;
        const yVal = yMin + t * (yMax - yMin);
        return (
          <g key={`yt-${t}`}>
            <line x1={PAD.l - 4} y1={y} x2={PAD.l} y2={y} stroke="#cbd5e1" strokeWidth="1" />
            <text x={PAD.l - 7} y={y + 2.5} textAnchor="end" fontSize="6" fill="#64748b">
              {yVal.toFixed(1)}
            </text>
          </g>
        );
      })}
      <path d={curvePath} fill="none" stroke={curveColor} strokeWidth="1.8"
        strokeDasharray="5 3" opacity="0.6" />
      {dataPoints.map((dp, i) => {
        const { sx, sy } = toSvg(dp.x, dp.y);
        return (
          <motion.g key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ transformOrigin: `${sx}px ${sy}px` }}
          >
            <circle cx={sx} cy={sy} r={5.5} fill={dotColor} stroke="white" strokeWidth="1.5" />
          </motion.g>
        );
      })}
      {dataPoints.length === 0 && (
        <text x={PAD.l + iW / 2} y={PAD.t + iH / 2} textAnchor="middle"
          fontSize="8.5" fill="#94a3b8" fontStyle="italic">
          Record data points to plot here
        </text>
      )}
    </svg>
  );
}

// ── Beginner explanation banner ───────────────────────────────────────────────
function BeginnerHint({ law, pressure, volume: _volume, temperature }: {
  law: GasLaw; pressure: number; volume: number; temperature: number;
}) {
  const boyleHint = pressure > 6
    ? "High pressure! The piston has compressed the gas — particles hit the walls more often, so pressure rises."
    : pressure < 1.5
    ? "Low pressure. The gas has lots of room — particles hit the walls less often."
    : pressure > 3.5
    ? "Drag the volume slider left to compress the gas and watch pressure jump."
    : "Use the Volume slider to compress or expand the gas. Boyle's Law: P × V = constant.";

  const charlesHint = temperature > 380
    ? "Hot gas! Faster particles push harder — the container expands to maintain constant pressure."
    : temperature < 200
    ? "Cold gas. Slow-moving particles need less room — the container shrinks."
    : temperature > 320
    ? "Warm gas — particles gain speed and volume increases proportionally."
    : "Use the Temperature slider. Charles's Law: at constant pressure, V ∝ T (in Kelvin).";

  const hint = law === "boyle" ? boyleHint : charlesHint;
  const color = law === "boyle" ? "#2563eb" : "#ea580c";

  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 8,
      padding: "8px 12px", borderRadius: 10,
      background: `${color}0a`, border: `1px solid ${color}22`,
    }}>
      <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>
        {law === "boyle" ? "🔵" : "🔴"}
      </span>
      <p style={{ fontSize: 11, lineHeight: 1.55, color: "#334155", margin: 0 }}>
        {hint}
      </p>
    </div>
  );
}

// ── Variable legend ───────────────────────────────────────────────────────────
function VariableLegend({ law, temperature, volume, pressure }: {
  law: GasLaw; temperature: number; volume: number; pressure: number;
}) {
  const vars = law === "boyle"
    ? [
        { sym: "V", name: "Volume",      val: `${volume.toFixed(2)} L`,        color: "#2563eb", changing: true },
        { sym: "P", name: "Pressure",    val: `${pressure.toFixed(3)} atm`,    color: "#ef4444", changing: true },
        { sym: "T", name: "Temperature", val: `${temperature} K (fixed)`,       color: "#94a3b8", changing: false },
        { sym: "n", name: "Gas amount",  val: "1 mol (fixed)",                  color: "#94a3b8", changing: false },
      ]
    : [
        { sym: "T", name: "Temperature", val: `${temperature} K`,              color: "#ea580c", changing: true },
        { sym: "V", name: "Volume",      val: `${volume.toFixed(3)} L`,        color: "#2563eb", changing: true },
        { sym: "P", name: "Pressure",    val: "1 atm (fixed)",                  color: "#94a3b8", changing: false },
        { sym: "n", name: "Gas amount",  val: "1 mol (fixed)",                  color: "#94a3b8", changing: false },
      ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 10px" }}>
      {vars.map(({ sym, name, val, color, changing }) => (
        <div key={sym} style={{
          display: "flex", alignItems: "center", gap: 7,
          padding: "5px 8px", borderRadius: 8,
          background: changing ? `${color}0c` : "rgba(148,163,184,0.06)",
          border: `1px solid ${changing ? color + "25" : "rgba(148,163,184,0.14)"}`,
          opacity: changing ? 1 : 0.65,
        }}>
          <span style={{
            fontSize: 13, fontWeight: 900, fontFamily: "monospace",
            color: changing ? color : "#94a3b8", minWidth: 14,
          }}>{sym}</span>
          <div>
            <p style={{ fontSize: 9, color: "#64748b", margin: 0, lineHeight: 1, fontWeight: 600 }}>{name}</p>
            <p style={{ fontSize: 10.5, color: changing ? "#1e293b" : "#94a3b8", margin: "2px 0 0", lineHeight: 1, fontWeight: 700, fontFamily: "monospace" }}>{val}</p>
          </div>
          {changing && (
            <span style={{ marginLeft: "auto", fontSize: 8, fontWeight: 700, color, background: `${color}18`, borderRadius: 4, padding: "1px 5px" }}>VARIES</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main workspace ─────────────────────────────────────────────────────────────
export default function GasLawsWorkspace({ law, temperature, volume, pressure, isRunning }: Props) {
  if (!law) {
    return (
      <div
        className="relative rounded-3xl flex items-center justify-center overflow-hidden"
        style={{
          aspectRatio: "480/320",
          width:       "100%",
          height:      "auto",
          maxHeight:   "100%",
          background: "radial-gradient(ellipse at 50% 25%, rgba(219,39,119,0.08) 0%, transparent 50%), linear-gradient(180deg, #fdf4ff 0%, #faf0fd 40%, #fdf4ff 100%)",
          boxShadow: "0 24px 64px rgba(15,23,42,0.08), 0 0 0 1px rgba(219,39,119,0.18) inset",
          border: "1px solid rgba(148, 163, 184, 0.28)",
        }}
      >
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.13) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }} />
        <div className="text-center relative z-10 flex flex-col items-center gap-4 px-6">
          {/* Syringe/container icon */}
          <svg width="64" height="48" viewBox="0 0 64 48" fill="none" aria-hidden="true">
            {/* Container body */}
            <rect x="4" y="12" width="44" height="26" rx="4" stroke="#db2777" strokeWidth="1.8" strokeDasharray="4 3" fill="rgba(219,39,119,0.05)" />
            {/* Piston */}
            <rect x="36" y="12" width="8" height="26" rx="2" fill="#db277710" stroke="#db2777" strokeWidth="1.5" />
            {/* Piston rod */}
            <rect x="44" y="22" width="14" height="6" rx="3" fill="#db277730" stroke="#db2777" strokeWidth="1" />
            {/* Gas particles */}
            <circle cx="15" cy="22" r="3" fill="#db2777" opacity="0.4" />
            <circle cx="24" cy="30" r="3" fill="#db2777" opacity="0.4" />
            <circle cx="12" cy="33" r="3" fill="#db2777" opacity="0.4" />
          </svg>

          <div>
            <p className="text-base font-bold mb-1" style={{ color: "#1e293b" }}>
              Select a Gas Law to Begin
            </p>
            <p className="text-xs" style={{ color: "#64748b", lineHeight: 1.6, maxWidth: 300 }}>
              <strong>Boyle&apos;s Law</strong> — compress gas and watch pressure rise.<br />
              <strong>Charles&apos;s Law</strong> — heat gas and watch it expand.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const containerMaxW = 264;
  const containerMinW = 52;
  const containerH    = 118;
  const volMin = law === "boyle" ? BOYLE_V_MIN : charlesVolume(CHARLES_T_MIN);
  const volMax = law === "boyle" ? BOYLE_V_MAX : charlesVolume(CHARLES_T_MAX);
  const volFraction   = (volume - volMin) / (volMax - volMin);
  const containerW    = containerMinW + volFraction * (containerMaxW - containerMinW);
  const particleCount = Math.max(5, Math.min(32, Math.round(pressure * 2.8)));
  const lawColor      = law === "boyle" ? "#3b82f6" : "#ea580c";
  const lawBg         = law === "boyle" ? "rgba(59,130,246,0.16)" : "rgba(245,158,11,0.15)";
  const lawBgMid      = law === "boyle" ? "rgba(96,165,250,0.20)" : "rgba(251,146,60,0.20)";
  const particleSpeed = law === "boyle"
    ? 1 + (pressure / 6) * 0.8
    : 1 + ((temperature - 273) / 100) * 1.2;

  const lawTitle = law === "boyle" ? "Boyle's Law" : "Charles's Law";
  const lawSubtitle = law === "boyle"
    ? "Compress → pressure rises · Expand → pressure drops"
    : "Heat → gas expands · Cool → gas contracts";
  const svgH = law === "charles" ? 268 : 208;
  const formulaBannerY = svgH - 46;

  return (
    <div className="flex flex-col gap-3" style={{ width: "100%" }}>
      {/* Law title banner */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 14px", borderRadius: 12,
        background: `${lawColor}0c`, border: `1px solid ${lawColor}25`,
      }}>
        <span style={{ fontSize: 18 }}>{law === "boyle" ? "🔵" : "🔴"}</span>
        <div>
          <p style={{ fontSize: 13, fontWeight: 800, color: lawColor, margin: 0, lineHeight: 1.2 }}>{lawTitle}</p>
          <p style={{ fontSize: 10.5, color: "#475569", margin: 0, marginTop: 2, lineHeight: 1.3 }}>{lawSubtitle}</p>
        </div>
      </div>

      {/* SVG workspace */}
      <div
        className="relative rounded-2xl overflow-hidden select-none"
        style={{
          background:
            `radial-gradient(ellipse at 50% 30%, ${lawColor}14 0%, transparent 50%),` +
            "linear-gradient(180deg, #fdf4ff 0%, #faf0fd 40%, #f8effe 100%)",
          boxShadow:
            "0 12px 36px rgba(15,23,42,0.08), " +
            `0 0 0 1px ${lawColor}25 inset`,
          border: `1px solid ${lawColor}22`,
        }}
      >
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `radial-gradient(circle, ${lawColor}09 1px, transparent 1px)`,
          backgroundSize: "22px 22px",
        }} />

        <svg viewBox={`0 0 480 ${svgH}`} width="100%" style={{ display: "block", position: "relative", zIndex: 10 }}>
          <defs>
            <filter id="gl-shadow-v2" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="rgba(0,0,0,0.40)" />
            </filter>
            <filter id="gl-inner-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <linearGradient id="gl-gas-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor={lawBgMid} />
              <stop offset="60%"  stopColor={lawBg} />
              <stop offset="100%" stopColor={lawBg} stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="gl-glass-sheen" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="rgba(255,255,255,0.30)" />
              <stop offset="28%"  stopColor="rgba(255,255,255,0.06)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.04)" />
            </linearGradient>
            <linearGradient id="gl-piston-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  stopColor="#cbd5e1" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
          </defs>

          {/* ── GAS CONTAINER ── */}
          <g transform="translate(16, 22)">
            {/* Label */}
            <text x={containerMaxW / 2 + 4} y="-8" textAnchor="middle" fontSize="8" fill="#475569" fontWeight="700" letterSpacing="0.06em">
              GAS CONTAINER (Syringe)
            </text>

            {/* Shadow */}
            <rect x="4" y="4" width={containerMaxW + 2} height={containerH + 2} rx="6"
              fill="rgba(0,0,0,0.08)" />

            {/* Outer shell */}
            <rect x="0" y="0" width={containerMaxW} height={containerH} rx="6"
              fill="rgba(255,255,255,0.52)" stroke="rgba(71,85,105,0.46)" strokeWidth="1.8"
              filter="url(#gl-shadow-v2)" />

            {/* Gas fill */}
            <motion.rect x="2" y="2" height={containerH - 4} rx="5"
              fill="url(#gl-gas-grad)"
              animate={{ width: Math.max(8, containerW - 4) }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />

            {/* Pressure pulse rings when high */}
            {pressure > 6 && isRunning && (
              <motion.rect
                x="1" y="1" width={Math.max(6, containerW - 2)} height={containerH - 2} rx="6"
                fill="none" stroke={lawColor} strokeOpacity="0.35" strokeWidth="2"
                animate={{ strokeOpacity: [0.2, 0.45, 0.2] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
              />
            )}

            {/* Piston (Boyle's only) */}
            {law === "boyle" && (
              <motion.g animate={{ x: Math.max(containerW - 16, 8) }} transition={{ duration: 0.35, ease: "easeOut" }}>
                <rect y="0" width="16" height={containerH} rx="3"
                  fill="url(#gl-piston-grad)" stroke="#64748b" strokeWidth="1.2" />
                <rect x="4" y="6" width="4" height={containerH - 14} rx="2" fill="rgba(255,255,255,0.32)" />
                {[0.25, 0.5, 0.75].map((f) => (
                  <line key={f} x1="2" y1={containerH * f} x2="14" y2={containerH * f}
                    stroke="rgba(100,116,139,0.40)" strokeWidth="0.8" />
                ))}
                <rect x="14" y={containerH / 2 - 4} width="36" height="8" rx="3"
                  fill="#94a3b8" stroke="#64748b" strokeWidth="0.8" />
                {/* Piston label */}
                <text x="32" y={containerH / 2 - 9} textAnchor="middle" fontSize="6.5" fill="#64748b" fontWeight="600">
                  Piston
                </text>
              </motion.g>
            )}

            {/* Temperature heat glow for Charles's */}
            {law === "charles" && temperature > 350 && (
              <motion.rect x="2" y="2" height={containerH - 4} rx="5"
                fill="rgba(239,68,68,0.08)"
                animate={{ width: Math.max(8, containerW - 4), opacity: [0.05, 0.15, 0.05] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}

            {/* Gas particles */}
            {Array.from({ length: particleCount }, (_, i) => {
              const seed = i * 7919;
              const maxPX = Math.max(containerW - (law === "boyle" ? 26 : 18), 22);
              const bx = 5 + ((seed * 1234567) % 1000) / 1000 * maxPX;
              const by = 6 + ((seed * 7654321) % 1000) / 1000 * (containerH - 18);
              const dx = (((seed * 2345678) % 1000) / 1000 - 0.5) * 14 * particleSpeed;
              const dy = (((seed * 3456789) % 1000) / 1000 - 0.5) * 14 * particleSpeed;
              const r  = law === "boyle" ? 3 + (i % 3) * 0.6 : 3.5 + (i % 3) * 0.5;
              return (
                <motion.circle key={i}
                  r={r}
                  fill={lawColor} fillOpacity={0.80}
                  filter={i % 4 === 0 ? "url(#gl-inner-glow)" : undefined}
                  animate={isRunning
                    ? {
                        cx: [bx, bx + dx, bx - dx * 0.5, bx + dx * 0.3, bx],
                        cy: [by, by + dy, by - dy * 0.6, by + dy * 0.2, by],
                      }
                    : { cx: bx, cy: by }
                  }
                  transition={{
                    duration: (1.1 + (i % 5) * 0.18) / particleSpeed,
                    repeat: Infinity, ease: "easeInOut", delay: (i % 7) * 0.14,
                  }}
                />
              );
            })}

            {/* Glass sheen */}
            <path d={`M 6 6 L 6 ${containerH - 6}`} stroke="rgba(255,255,255,0.42)" strokeWidth="5" strokeLinecap="round" />
            <rect x="0" y="0" width={containerMaxW} height={containerH} rx="6" fill="url(#gl-glass-sheen)" />

            {/* Volume label */}
            <text x={containerMaxW / 2} y={containerH + 18} textAnchor="middle" fontSize="11" fill="#334155" fontWeight="800">
              Volume = {volume.toFixed(2)} L
            </text>

            {/* Gas particles label */}
            <text x="8" y={containerH + 30} fontSize="7" fill="#94a3b8" fontStyle="italic">
              Each dot = a gas molecule
            </text>
          </g>

          {/* ── PRESSURE GAUGE ── */}
          <g transform="translate(300, 6)">
            <text x="64" y="12" textAnchor="middle" fontSize="8" fill="#475569" fontWeight="700" letterSpacing="0.06em">
              PRESSURE GAUGE
            </text>
            <g transform="translate(0, 14)">
              <PressureGauge pressure={pressure} maxP={12} />
            </g>
          </g>

          {/* ── FIXED VARIABLE DISPLAY ── */}
          <g transform="translate(410, 6)">
            {law === "boyle" ? (
              <>
                <text x="34" y="12" textAnchor="middle" fontSize="7.5" fill="#475569" fontWeight="700" letterSpacing="0.05em">
                  TEMP (fixed)
                </text>
                <rect x="0" y="17" width="66" height="72" rx="10"
                  fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.2"
                  filter="url(#gl-shadow-v2)" />
                {/* Mini thermometer */}
                <rect x="28" y="26" width="10" height="42" rx="5"
                  fill="rgba(255,255,255,0.50)" stroke="#cbd5e1" strokeWidth="1" />
                <rect x="30" y={26 + 42 * (1 - (temperature - 273) / 100)} width="6"
                  height={42 * ((temperature - 273) / 100)} rx="3" fill="#f97316" />
                <circle cx="33" cy="72" r="7" fill="#f97316" />
                <text x="33" y="89" textAnchor="middle" fontSize="10.5" fill="#ea580c" fontWeight="900" fontFamily="monospace">
                  {temperature} K
                </text>
                <text x="33" y="100" textAnchor="middle" fontSize="7" fill="#64748b">
                  {(temperature - 273).toFixed(0)} °C
                </text>
              </>
            ) : (
              <>
                <text x="34" y="12" textAnchor="middle" fontSize="7.5" fill="#475569" fontWeight="700" letterSpacing="0.05em">
                  P (fixed)
                </text>
                <rect x="0" y="17" width="66" height="72" rx="10"
                  fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.2"
                  filter="url(#gl-shadow-v2)" />
                <text x="33" y="57" textAnchor="middle" fontSize="22" fill="#059669" fontWeight="900" fontFamily="monospace">
                  1
                </text>
                <text x="33" y="74" textAnchor="middle" fontSize="10" fill="#059669" fontWeight="700">atm</text>
                <text x="33" y="86" textAnchor="middle" fontSize="7.5" fill="#64748b">constant</text>
              </>
            )}
          </g>

          {/* ── CHARLES'S LAW: Bunsen burner heat source ── */}
          {law === "charles" && (
            <g>
              {/* Outer flame — orange-yellow, animated flicker */}
              <motion.path
                d="M 141 196 Q 131 178 148 162 Q 165 178 155 196 Z"
                fill="rgba(251,146,60,0.88)"
                animate={{ d: [
                  "M 141 196 Q 131 178 148 162 Q 165 178 155 196 Z",
                  "M 141 196 Q 129 176 148 160 Q 167 176 155 196 Z",
                  "M 141 196 Q 132 180 149 163 Q 164 177 155 196 Z",
                  "M 141 196 Q 131 178 148 162 Q 165 178 155 196 Z",
                ]}}
                transition={{ duration: 0.90, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Inner flame — blue-white hot core */}
              <motion.path
                d="M 144 196 Q 141 185 148 177 Q 155 185 152 196 Z"
                fill="rgba(186,230,253,0.92)"
                animate={{ scaleY: [1, 1.10, 0.94, 1.06, 1] }}
                transition={{ duration: 0.60, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformBox: "fill-box", transformOrigin: "center bottom" }}
              />
              {/* Bunsen burner barrel */}
              <rect x="141" y="196" width="14" height="22" rx="3"
                fill="#64748b" stroke="#475569" strokeWidth="0.9" />
              {/* Air inlet collar */}
              <ellipse cx="148" cy="198" rx="8" ry="2.5"
                fill="none" stroke="#94a3b8" strokeWidth="1" />
              {/* Gas supply tube */}
              <line x1="141" y1="211" x2="118" y2="211"
                stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="118" cy="211" r="3.5" fill="#94a3b8" />
              {/* Base foot */}
              <rect x="136" y="218" width="24" height="5" rx="2.5"
                fill="#475569" stroke="#334155" strokeWidth="0.7" />
              {/* Bunsen burner label */}
              <text x="148" y="234" textAnchor="middle" fontSize="6.5"
                fill="#64748b" fontWeight="600" letterSpacing="0.04em">
                BUNSEN BURNER
              </text>
              {/* Rising heat arrows — visible when temp above ambient */}
              {temperature > 280 && (
                <>
                  <motion.text x="124" y="180" fontSize="10"
                    fill="rgba(251,146,60,0.50)" textAnchor="middle"
                    animate={{ y: [180, 160, 180], opacity: [0.50, 0.12, 0.50] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0 }}>
                    ↑
                  </motion.text>
                  <motion.text x="148" y="176" fontSize="10"
                    fill="rgba(251,146,60,0.60)" textAnchor="middle"
                    animate={{ y: [176, 155, 176], opacity: [0.60, 0.12, 0.60] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.35 }}>
                    ↑
                  </motion.text>
                  <motion.text x="172" y="180" fontSize="10"
                    fill="rgba(251,146,60,0.50)" textAnchor="middle"
                    animate={{ y: [180, 160, 180], opacity: [0.50, 0.12, 0.50] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.70 }}>
                    ↑
                  </motion.text>
                </>
              )}
            </g>
          )}

          {/* ── LIVE FORMULA READING ── */}
          <g transform={`translate(16, ${formulaBannerY})`}>
            <rect width="452" height="30" rx="8"
              fill="rgba(255,255,255,0.96)" stroke="rgba(148,163,184,0.24)" strokeWidth="1.2" />
            <text x="226" y="13" textAnchor="middle" fontSize="8" fill="#64748b" fontWeight="700" letterSpacing="0.06em">
              {law === "boyle" ? "BOYLE'S LAW" : "CHARLES'S LAW"}  ·  PV = nRT
            </text>
            <text x="226" y="26" textAnchor="middle" fontSize="11" fill="#1d4ed8" fontFamily="monospace" fontWeight="800">
              {law === "boyle"
                ? `${pressure.toFixed(3)} atm × ${volume.toFixed(2)} L = ${(pressure * volume).toFixed(3)} L·atm (constant)`
                : `${volume.toFixed(3)} L / ${temperature} K = ${(volume / temperature).toFixed(5)} L/K (constant)`}
            </text>
          </g>

          {/* Lab bench */}
          <rect x="0" y={svgH - 8} width="480" height="8" fill="#c8d0db" />
          <rect x="0" y={svgH - 12} width="480" height="4" fill="#cbd5e1" />
          <rect x="0" y={svgH - 12} width="480" height="1.5" fill="rgba(255,255,255,0.50)" />
        </svg>
      </div>

      {/* Variable legend */}
      <VariableLegend law={law} temperature={temperature} volume={volume} pressure={pressure} />

      {/* Beginner hint — always visible once a law is selected */}
      <BeginnerHint law={law} pressure={pressure} volume={volume} temperature={temperature} />
    </div>
  );
}
