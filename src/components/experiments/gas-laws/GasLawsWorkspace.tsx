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

// Gauge: draws a semicircle needle gauge for pressure
function PressureGauge({ pressure, maxP = 12 }: { pressure: number; maxP?: number }) {
  const fraction = Math.min(1, pressure / maxP);
  const angle    = -150 + fraction * 300; // -150° to +150° sweep
  const rad      = (angle * Math.PI) / 180;
  const cx = 60, cy = 60, r = 44;
  const needleX = cx + r * Math.cos(rad);
  const needleY = cy + r * Math.sin(rad);

  // Arc path
  const startAngle = (-150 * Math.PI) / 180;
  const endAngle   = (150 * Math.PI) / 180;
  const sx = cx + r * Math.cos(startAngle);
  const sy = cy + r * Math.sin(startAngle);
  const ex = cx + r * Math.cos(endAngle);
  const ey = cy + r * Math.sin(endAngle);

  // Colour zones
  const zones = [
    { start: -150, end: -30, color: "#86efac" },   // 0–40% green
    { start: -30,  end:  60, color: "#fde68a" },   // 40–70% yellow
    { start:  60,  end: 150, color: "#fca5a5" },   // 70–100% red
  ];

  function arcPath(a1: number, a2: number) {
    const r1 = (a1 * Math.PI) / 180;
    const r2 = (a2 * Math.PI) / 180;
    const x1 = cx + r * Math.cos(r1);
    const y1 = cy + r * Math.sin(r1);
    const x2 = cx + r * Math.cos(r2);
    const y2 = cy + r * Math.sin(r2);
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  }

  return (
    <svg viewBox="0 0 120 80" width="100%" style={{ display: "block" }}>
      {/* Track */}
      <path d={`M ${sx} ${sy} A ${r} ${r} 0 1 1 ${ex} ${ey}`}
        fill="none" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
      {/* Colour zones */}
      {zones.map((z, i) => (
        <path key={i} d={arcPath(z.start, z.end)}
          fill="none" stroke={z.color} strokeWidth="6" strokeLinecap="round" opacity={0.6} />
      ))}
      {/* Needle */}
      <motion.line
        x1={cx} y1={cy}
        x2={needleX} y2={needleY}
        stroke="#1e293b" strokeWidth="2" strokeLinecap="round"
        animate={{ x2: cx + r * Math.cos(rad), y2: cy + r * Math.sin(rad) }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      />
      <circle cx={cx} cy={cy} r="4" fill="#334155" />
      {/* Labels */}
      <text x={cx} y={cy + 18} textAnchor="middle" fontSize="9" fill="#1e293b" fontWeight="700">
        {pressure.toFixed(2)} atm
      </text>
      <text x={sx - 2} y={sy + 4} textAnchor="end" fontSize="6" fill="#94a3b8">0</text>
      <text x={ex + 2} y={ey + 4} textAnchor="start" fontSize="6" fill="#94a3b8">{maxP}</text>
    </svg>
  );
}

// Mini graph for data points
function DataGraph({
  law, dataPoints,
}: {
  law: GasLaw;
  dataPoints: GasDataPoint[];
}) {
  const W = 340, H = 140;
  const PAD = { l: 40, r: 12, t: 12, b: 30 };
  const iW  = W - PAD.l - PAD.r;
  const iH  = H - PAD.t - PAD.b;

  const xLabel = law === "boyle" ? "Volume (L)" : "Temperature (K)";
  const yLabel = law === "boyle" ? "Pressure (atm)" : "Volume (L)";

  // Domain from the law ranges
  const xMin = law === "boyle" ? BOYLE_V_MIN : CHARLES_T_MIN;
  const xMax = law === "boyle" ? BOYLE_V_MAX : CHARLES_T_MAX;
  const yMin = 0;
  const yMax = law === "boyle" ? boylePressure(BOYLE_V_MIN) * 1.05 : charlesVolume(CHARLES_T_MAX) * 1.05;

  const toSvg = (x: number, y: number) => ({
    sx: PAD.l + ((x - xMin) / (xMax - xMin)) * iW,
    sy: PAD.t + iH - ((y - yMin) / (yMax - yMin)) * iH,
  });

  // Draw theoretical curve
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

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      {/* Axes */}
      <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t + iH} stroke="#e2e8f0" strokeWidth="1" />
      <line x1={PAD.l} y1={PAD.t + iH} x2={PAD.l + iW} y2={PAD.t + iH} stroke="#e2e8f0" strokeWidth="1" />

      {/* Axis labels */}
      <text x={PAD.l + iW / 2} y={H - 2} textAnchor="middle" fontSize="7.5" fill="#94a3b8">{xLabel}</text>
      <text x={8} y={PAD.t + iH / 2} textAnchor="middle" fontSize="7.5" fill="#94a3b8"
            transform={`rotate(-90, 8, ${PAD.t + iH / 2})`}>{yLabel}</text>

      {/* Tick marks */}
      {[0.25, 0.5, 0.75, 1].map((t) => {
        const x = PAD.l + t * iW;
        const xVal = xMin + t * (xMax - xMin);
        return (
          <g key={t}>
            <line x1={x} y1={PAD.t + iH} x2={x} y2={PAD.t + iH + 4} stroke="#cbd5e1" strokeWidth="1" />
            <text x={x} y={PAD.t + iH + 11} textAnchor="middle" fontSize="6" fill="#94a3b8">
              {xVal.toFixed(law === "boyle" ? 1 : 0)}
            </text>
          </g>
        );
      })}

      {/* Theoretical curve */}
      <path d={curvePath} fill="none" stroke="#bfdbfe" strokeWidth="1.5" strokeDasharray="4 2" />

      {/* Data points */}
      {dataPoints.map((dp, i) => {
        const { sx, sy } = toSvg(dp.x, dp.y);
        return (
          <motion.circle
            key={i}
            cx={sx} cy={sy} r={4}
            fill="#2563eb"
            stroke="white"
            strokeWidth="1.5"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        );
      })}

      {/* No data message */}
      {dataPoints.length === 0 && (
        <text x={PAD.l + iW / 2} y={PAD.t + iH / 2} textAnchor="middle" fontSize="8" fill="#cbd5e1">
          Record data points to plot here
        </text>
      )}
    </svg>
  );
}

export default function GasLawsWorkspace({ law, temperature, volume, pressure, dataPoints, isRunning }: Props) {
  if (!law) {
    return (
      <div
        className="rounded-2xl flex items-center justify-center"
        style={{
          background: "var(--lab-glass-heavy)",
          border: "1px solid var(--lab-glass-border)",
          boxShadow: "var(--lab-shadow-md)",
          minHeight: 260,
        }}
      >
        <p className="text-sm text-center" style={{ color: "var(--lab-text-subtle)" }}>
          Select Boyle&apos;s Law or Charles&apos;s Law to begin
        </p>
      </div>
    );
  }

  // Gas container visual: width proportional to volume
  const containerMaxW = 180;
  const containerMinW = 40;
  const containerH    = 80;
  const volMin = law === "boyle" ? BOYLE_V_MIN : charlesVolume(CHARLES_T_MIN);
  const volMax = law === "boyle" ? BOYLE_V_MAX : charlesVolume(CHARLES_T_MAX);
  const containerW = containerMinW + ((volume - volMin) / (volMax - volMin)) * (containerMaxW - containerMinW);

  // Particle density (more particles = higher pressure visually)
  const particleCount = Math.max(4, Math.min(20, Math.round(pressure * 2)));

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--lab-glass-heavy)",
        border: "1px solid var(--lab-glass-border)",
        boxShadow: "var(--lab-shadow-md)",
      }}
    >
      <svg viewBox="0 0 480 340" width="100%" style={{ display: "block" }}>
        {/* ── Container ── */}
        <g transform="translate(20, 28)">
          <text x="95" y="-8" textAnchor="middle" fontSize="8" fill="#64748b" fontWeight="600">
            GAS CONTAINER
          </text>

          {/* Container walls (fixed height, variable width) */}
          <rect x="0" y="0" width="190" height={containerH} rx="4"
            fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />

          {/* Gas fill */}
          <motion.rect
            x="2" y="2"
            height={containerH - 4}
            rx="3"
            fill={law === "boyle" ? "#dbeafe" : "#fef3c7"}
            fillOpacity="0.7"
            animate={{ width: Math.max(6, containerW - 4) }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />

          {/* Moveable piston */}
          {law === "boyle" && (
            <motion.rect
              y="0"
              width="10"
              height={containerH}
              rx="2"
              fill="#94a3b8"
              stroke="#64748b"
              strokeWidth="1"
              animate={{ x: Math.max(containerW - 10, 4) }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          )}

          {/* Gas particles */}
          {Array.from({ length: particleCount }, (_, i) => {
            const seed = i * 7919;
            const bx = 5 + ((seed * 1234567) % 1000) / 1000 * Math.max(containerW - 20, 20);
            const by = 4 + ((seed * 7654321) % 1000) / 1000 * (containerH - 12);
            return (
              <motion.circle
                key={i}
                cx={bx}
                cy={by}
                r={3}
                fill={law === "boyle" ? "#3b82f6" : "#f59e0b"}
                fillOpacity={0.75}
                animate={
                  isRunning
                    ? {
                        cx: [bx, bx + 8 * (i % 2 === 0 ? 1 : -1), bx - 5, bx],
                        cy: [by, by + 6 * (i % 3 === 0 ? 1 : -1), by - 4, by],
                      }
                    : {}
                }
                transition={{ duration: 1.2 + (i % 5) * 0.2, repeat: Infinity, ease: "easeInOut", delay: (i % 7) * 0.15 }}
              />
            );
          })}

          {/* Volume label */}
          <text x="95" y={containerH + 14} textAnchor="middle" fontSize="9" fill="#475569" fontWeight="600">
            V = {volume.toFixed(2)} L
          </text>
        </g>

        {/* ── Pressure gauge ── */}
        <g transform="translate(218, 8)">
          <text x="60" y="10" textAnchor="middle" fontSize="8" fill="#64748b" fontWeight="600">
            PRESSURE
          </text>
          <g transform="translate(0, 14)">
            <PressureGauge pressure={pressure} maxP={12} />
          </g>
        </g>

        {/* ── T or P readout ── */}
        <g transform="translate(340, 8)">
          {law === "boyle" ? (
            <>
              <text x="60" y="10" textAnchor="middle" fontSize="8" fill="#64748b" fontWeight="600">
                TEMPERATURE (fixed)
              </text>
              <rect x="18" y="18" width="84" height="46" rx="6"
                fill="#fef3c7" stroke="#fde68a" strokeWidth="1" />
              <text x="60" y="38" textAnchor="middle" fontSize="11" fill="#d97706" fontWeight="800">
                {temperature} K
              </text>
              <text x="60" y="54" textAnchor="middle" fontSize="8" fill="#92400e">
                ({(temperature - 273).toFixed(0)} °C) — constant
              </text>
            </>
          ) : (
            <>
              <text x="60" y="10" textAnchor="middle" fontSize="8" fill="#64748b" fontWeight="600">
                PRESSURE (fixed)
              </text>
              <rect x="18" y="18" width="84" height="46" rx="6"
                fill="#f0fdf4" stroke="#86efac" strokeWidth="1" />
              <text x="60" y="38" textAnchor="middle" fontSize="14" fill="#059669" fontWeight="800">
                1.00 atm
              </text>
              <text x="60" y="54" textAnchor="middle" fontSize="8" fill="#166534">
                constant
              </text>
            </>
          )}
        </g>

        {/* ── Formula display ── */}
        <g transform="translate(20, 130)">
          <rect width="440" height="34" rx="6" fill="var(--lab-surface)" stroke="var(--lab-glass-border)" strokeWidth="1" />
          <text x="220" y="13" textAnchor="middle" fontSize="8" fill="#64748b" fontWeight="600">
            {law === "boyle" ? "Boyle's Law: PV = nRT (T constant)" : "Charles's Law: V/T = nR/P (P constant)"}
          </text>
          <text x="220" y="27" textAnchor="middle" fontSize="9" fill="#1e293b" fontFamily="monospace">
            {law === "boyle"
              ? `${pressure.toFixed(3)} × ${volume.toFixed(2)} = ${(pressure * volume).toFixed(3)} L·atm`
              : `${volume.toFixed(3)} / ${temperature} = ${(volume / temperature).toFixed(5)} L/K`}
          </text>
        </g>

        {/* ── Graph ── */}
        <g transform="translate(20, 174)">
          <DataGraph law={law} dataPoints={dataPoints} />
        </g>
      </svg>
    </div>
  );
}
