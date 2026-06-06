"use client";

import { useMemo } from "react";
import { INDICATORS } from "@/lib/engine/chemistry";
import type { IndicatorName } from "@/lib/engine/types";

const W   = 400; const H   = 220;
const PAD = { t: 18, r: 18, b: 36, l: 40 };
const CW  = W - PAD.l - PAD.r;
const CH  = H - PAD.t - PAD.b;

function mapX(v: number)  { return PAD.l + (v / 50) * CW; }
function mapY(pH: number) { return PAD.t + ((14 - pH) / 14) * CH; }

const PH_GRID = [0, 2, 4, 6, 7, 8, 10, 12, 14];

interface Props {
  curve:          Array<{ v: number; pH: number }>;
  equivalenceVol: number;
  indicator?:     IndicatorName | null;
}

export default function PHCurve({ curve, equivalenceVol, indicator }: Props) {
  const points = useMemo(
    () => curve.map((p) => `${mapX(p.v).toFixed(1)},${mapY(p.pH).toFixed(1)}`).join(" "),
    [curve],
  );

  const areaPoints = useMemo(() => {
    if (curve.length < 2) return "";
    const pts  = curve.map((p) => `${mapX(p.v).toFixed(1)},${mapY(p.pH).toFixed(1)}`);
    const last  = curve[curve.length - 1];
    const first = curve[0];
    pts.push(`${mapX(last.v).toFixed(1)},${(H - PAD.b).toFixed(1)}`);
    pts.push(`${mapX(first.v).toFixed(1)},${(H - PAD.b).toFixed(1)}`);
    return pts.join(" ");
  }, [curve]);

  const eqX = mapX(equivalenceVol);
  const last = curve.length > 0 ? curve[curve.length - 1] : null;
  const ind  = indicator ? INDICATORS[indicator] : null;

  // Indicator transition band
  const bandY1 = ind ? mapY(ind.transitionHigh) : 0;
  const bandY2 = ind ? mapY(ind.transitionLow)  : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs font-semibold" style={{ color: "var(--lab-text-muted)" }}>
          pH Curve — Titration Progress
        </p>
        {ind && (
          <div className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{ background: ind.baseColor, opacity: 0.65 }}
            />
            <span className="text-[10px]" style={{ color: "var(--lab-text-subtle)" }}>
              {ind.name} zone pH {ind.transitionLow}–{ind.transitionHigh}
            </span>
          </div>
        )}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 220 }}>
        <defs>
          <linearGradient id="ph-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#2563eb" stopOpacity="0.20" />
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

        {/* ── Region background shading ── */}
        {/* Acidic region (below pH 7) */}
        <rect
          x={PAD.l} y={mapY(7)}
          width={CW} height={mapY(0) - mapY(7)}
          fill="rgba(239,68,68,0.04)"
          clipPath="url(#ph-chart-clip)"
        />
        {/* Basic region (above pH 7) */}
        <rect
          x={PAD.l} y={PAD.t}
          width={CW} height={mapY(7) - PAD.t}
          fill="rgba(34,197,94,0.04)"
          clipPath="url(#ph-chart-clip)"
        />

        {/* ── Indicator transition band ── */}
        {ind && (
          <rect
            x={PAD.l} y={bandY1}
            width={CW} height={Math.max(1, bandY2 - bandY1)}
            fill={ind.baseColor}
            fillOpacity="0.12"
            clipPath="url(#ph-chart-clip)"
          />
        )}

        {/* ── Grid lines ── */}
        {PH_GRID.map((pH) => (
          <line key={pH}
            x1={PAD.l} y1={mapY(pH)} x2={W - PAD.r} y2={mapY(pH)}
            stroke={pH === 7 ? "#94a3b8" : "#f0f4f8"}
            strokeWidth={pH === 7 ? 1.1 : 0.6}
            strokeDasharray={pH === 7 ? "3,3" : "none"}
          />
        ))}

        {/* Equivalence point vertical line */}
        <line x1={eqX} y1={PAD.t} x2={eqX} y2={H - PAD.b}
          stroke="#2563eb" strokeWidth="1.1" strokeDasharray="3,3" opacity="0.45" />

        {/* ── Axes ── */}
        <line x1={PAD.l} y1={PAD.t}     x2={PAD.l}    y2={H - PAD.b} stroke="#d1d5db" strokeWidth="1.1" />
        <line x1={PAD.l} y1={H - PAD.b} x2={W - PAD.r} y2={H - PAD.b} stroke="#d1d5db" strokeWidth="1.1" />

        {/* Y-axis labels */}
        {[0, 2, 4, 6, 7, 8, 10, 12, 14].map((pH) => (
          <text key={pH} x={PAD.l - 6} y={mapY(pH) + 3.5}
            fontSize="7.5" fill={pH === 7 ? "#64748b" : "#94a3b8"} textAnchor="end"
            fontWeight={pH === 7 ? "700" : "400"}>{pH}</text>
        ))}

        {/* X-axis labels */}
        {[0, 10, 20, 25, 30, 40, 50].map((v) => (
          <text key={v} x={mapX(v)} y={H - PAD.b + 12}
            fontSize="7.5"
            fill={v === 25 ? "#2563eb" : "#94a3b8"}
            textAnchor="middle"
            fontWeight={v === 25 ? "700" : "400"}>{v}</text>
        ))}

        {/* Axis labels */}
        <text
          x={PAD.l - 28} y={PAD.t + CH / 2}
          fontSize="7.5" fill="#64748b" textAnchor="middle"
          transform={`rotate(-90,${PAD.l - 28},${PAD.t + CH / 2})`}
        >pH</text>
        <text x={PAD.l + CW / 2} y={H - 4}
          fontSize="7.5" fill="#64748b" textAnchor="middle">
          Volume NaOH added (mL)
        </text>

        {/* ── Region annotations ── */}
        <text x={PAD.l + 8} y={mapY(2.5)}
          fontSize="7" fill="rgba(239,68,68,0.50)" fontStyle="italic">acidic</text>
        <text x={PAD.l + 8} y={mapY(10)}
          fontSize="7" fill="rgba(34,197,94,0.50)" fontStyle="italic">basic</text>

        {/* ── Area fill ── */}
        {curve.length > 1 && (
          <polygon points={areaPoints} fill="url(#ph-area)" clipPath="url(#ph-chart-clip)" />
        )}

        {/* Equivalence label */}
        <text x={eqX + 3} y={PAD.t + 10}
          fontSize="7" fill="#2563eb" opacity="0.70" fontWeight="600">eq.</text>

        {/* pH = 7 label */}
        <text x={W - PAD.r + 3} y={mapY(7) + 3.5}
          fontSize="7" fill="#64748b" fontWeight="700">7</text>

        {/* Indicator band label */}
        {ind && (
          <text
            x={W - PAD.r - 2} y={(bandY1 + bandY2) / 2 + 3}
            fontSize="6.5" fill={ind.baseColor} textAnchor="end" fontWeight="600">
            {ind.name.slice(0, 4)}.
          </text>
        )}

        {/* ── Titration curve ── */}
        {curve.length > 1 && (
          <polyline
            points={points}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            clipPath="url(#ph-chart-clip)"
          />
        )}

        {/* ── Current point glow dot ── */}
        {last && (
          <>
            <circle
              cx={mapX(last.v)} cy={mapY(last.pH)} r={7}
              fill="#2563eb" fillOpacity="0.13"
              filter="url(#ph-dot-glow)"
            />
            <circle
              cx={mapX(last.v)} cy={mapY(last.pH)} r={3.5}
              fill="#2563eb" stroke="white" strokeWidth="1.8"
            />
            {/* pH tooltip */}
            <g>
              <rect
                x={mapX(last.v) + 6} y={mapY(last.pH) - 12}
                width={36} height={13} rx={4}
                fill="rgba(37,99,235,0.88)"
              />
              <text
                x={mapX(last.v) + 24} y={mapY(last.pH) - 2.5}
                fontSize="7.5" fill="white" textAnchor="middle" fontWeight="700"
                fontFamily="monospace">
                {last.pH.toFixed(2)}
              </text>
            </g>
          </>
        )}
      </svg>
    </div>
  );
}
