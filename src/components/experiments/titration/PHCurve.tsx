"use client";

import { useMemo } from "react";

const W   = 300; const H   = 170;
const PAD = { t: 14, r: 14, b: 30, l: 34 };
const CW  = W - PAD.l - PAD.r;
const CH  = H - PAD.t - PAD.b;

function mapX(v: number)   { return PAD.l + (v / 50) * CW; }
function mapY(pH: number)  { return PAD.t + ((14 - pH) / 14) * CH; }

interface Props {
  curve:          Array<{ v: number; pH: number }>;
  equivalenceVol: number;
}

export default function PHCurve({ curve, equivalenceVol }: Props) {
  const points = useMemo(
    () => curve.map((p) => `${mapX(p.v).toFixed(1)},${mapY(p.pH).toFixed(1)}`).join(" "),
    [curve],
  );

  // Build area polygon: curve points + bottom-right + bottom-left corners
  const areaPoints = useMemo(() => {
    if (curve.length < 2) return "";
    const pts = curve.map((p) => `${mapX(p.v).toFixed(1)},${mapY(p.pH).toFixed(1)}`);
    const last  = curve[curve.length - 1];
    const first = curve[0];
    pts.push(`${mapX(last.v).toFixed(1)},${(H - PAD.b).toFixed(1)}`);
    pts.push(`${mapX(first.v).toFixed(1)},${(H - PAD.b).toFixed(1)}`);
    return pts.join(" ");
  }, [curve]);

  const eqX = mapX(equivalenceVol);
  const last = curve.length > 0 ? curve[curve.length - 1] : null;

  return (
    <div className="w-full">
      <p className="text-xs font-semibold mb-1.5" style={{ color: "var(--lab-text-muted)" }}>
        pH Curve
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 180 }}>
        <defs>
          <linearGradient id="ph-area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#2563eb" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.02" />
          </linearGradient>

          <clipPath id="ph-chart-clip">
            <rect x={PAD.l} y={PAD.t} width={CW} height={CH} />
          </clipPath>

          <filter id="ph-dot-glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ── Grid lines ── */}
        {[0, 2, 4, 6, 7, 8, 10, 12, 14].map((pH) => (
          <line key={pH}
            x1={PAD.l} y1={mapY(pH)} x2={W - PAD.r} y2={mapY(pH)}
            stroke={pH === 7 ? "#94a3b8" : "#f1f5f9"}
            strokeWidth={pH === 7 ? 1 : 0.7}
            strokeDasharray={pH === 7 ? "3,3" : "none"}
          />
        ))}

        {/* Equivalence vertical dashed line */}
        <line x1={eqX} y1={PAD.t} x2={eqX} y2={H - PAD.b}
          stroke="#2563eb" strokeWidth="1" strokeDasharray="3,3" opacity="0.45" />

        {/* ── Axes ── */}
        <line x1={PAD.l} y1={PAD.t}    x2={PAD.l}    y2={H - PAD.b} stroke="#cbd5e1" strokeWidth="1" />
        <line x1={PAD.l} y1={H - PAD.b} x2={W - PAD.r} y2={H - PAD.b} stroke="#cbd5e1" strokeWidth="1" />

        {/* Y-axis labels */}
        {[0, 7, 14].map((pH) => (
          <text key={pH} x={PAD.l - 5} y={mapY(pH) + 3.5}
            fontSize="7.5" fill="#94a3b8" textAnchor="end">{pH}</text>
        ))}

        {/* X-axis labels */}
        {[0, 25, 50].map((v) => (
          <text key={v} x={mapX(v)} y={H - 4}
            fontSize="7.5" fill="#94a3b8" textAnchor="middle">{v}</text>
        ))}

        {/* Axis labels */}
        <text x={PAD.l - 22} y={H / 2} fontSize="7.5" fill="#64748b"
          textAnchor="middle" transform={`rotate(-90, ${PAD.l - 22}, ${H / 2})`}>
          pH
        </text>
        <text x={PAD.l + CW / 2} y={H - 1} fontSize="7.5" fill="#64748b" textAnchor="middle">
          NaOH added (mL)
        </text>

        {/* ── Area fill under curve ── */}
        {curve.length > 1 && (
          <polygon
            points={areaPoints}
            fill="url(#ph-area-grad)"
            clipPath="url(#ph-chart-clip)"
          />
        )}

        {/* Equivalence label */}
        <text x={eqX + 3} y={PAD.t + 9} fontSize="7" fill="#2563eb" opacity="0.65">Eq.</text>

        {/* pH=7 label */}
        <text x={W - PAD.r + 2} y={mapY(7) + 3.5} fontSize="7" fill="#94a3b8">7</text>

        {/* ── Curve ── */}
        {curve.length > 1 && (
          <polyline
            points={points}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            clipPath="url(#ph-chart-clip)"
          />
        )}

        {/* ── Current point dot with glow ── */}
        {last && (
          <>
            <circle
              cx={mapX(last.v)} cy={mapY(last.pH)} r={5.5}
              fill="#2563eb" fillOpacity="0.15"
              filter="url(#ph-dot-glow)"
            />
            <circle
              cx={mapX(last.v)} cy={mapY(last.pH)} r={3}
              fill="#2563eb" stroke="white" strokeWidth="1.5"
            />
          </>
        )}
      </svg>
    </div>
  );
}
