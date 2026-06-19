"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import MacroMicroViewToggle from "@/components/lab/MacroMicroViewToggle";
import MicroscopicViewer from "@/components/lab/MicroscopicViewer";

interface Props {
  solColor: string;
  concFe3: number;
  concSCN: number;
  concFeSCN: number;
  shiftDirection: "forward" | "reverse" | "none";
  temperatureK: number;
}

export default function EquilibriumWorkspace({
  solColor,
  concFe3,
  concSCN,
  concFeSCN,
  shiftDirection,
  temperatureK,
}: Props) {
  const [viewMode, setViewMode] = useState<"macro" | "micro">("macro");

  const arrowForward = shiftDirection === "forward";
  const arrowReverse = shiftDirection === "reverse";
  const temp = temperatureK - 273;

  const shiftColor =
    arrowForward ? "#16a34a" :
    arrowReverse ? "#dc2626" :
    "#64748b";

  const shiftText =
    arrowForward ? "⟶ Forward shift" :
    arrowReverse ? "⟵ Reverse shift" :
    "⇌ At equilibrium";

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      <div className="flex justify-end pr-4">
        <MacroMicroViewToggle view={viewMode} onChange={setViewMode} />
      </div>

      {viewMode === "macro" ? (
        <div
          className="relative rounded-3xl overflow-hidden select-none"
          style={{
            aspectRatio: "210/180",
            width:       "100%",
            height:      "auto",
            maxHeight:   "100%",
            background: "radial-gradient(ellipse at 50% 25%, rgba(180,83,9,0.10) 0%, transparent 50%), linear-gradient(180deg, #fffbeb 0%, #fef3c7 40%, #fffdf0 100%)",
            border: "1px solid rgba(148,163,184,0.28)",
            boxShadow:
              "0 10px 30px rgba(15,23,42,0.06), " +
              "0 2px 6px rgba(15,23,42,0.03), " +
              "0 0 0 1px rgba(255,255,255,0.80) inset",
          }}
        >
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(212,119,6,0.14) 1px, transparent 1px)",
              backgroundSize:  "22px 22px",
            }}
          />

          <svg viewBox="55 10 210 180" width="100%"
            style={{ display: "block", position: "relative", zIndex: 10 }}
            aria-label="Equilibrium beaker" role="img"
          >
            <defs>
              <filter id="eq-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="rgba(0,0,0,0.50)" />
              </filter>
              <filter id="eq-glow">
                <feGaussianBlur stdDeviation="6" />
              </filter>
              <clipPath id="eq-vessel-clip">
                <path d="M61 28 L61 170 Q61 185 76 185 L244 185 Q259 185 259 170 L259 28 Z" />
              </clipPath>
            </defs>

            {/* Equation header */}
            <text x="160" y="16" textAnchor="middle" fontSize="9" fill="#92400e" fontWeight="700">
              Fe³⁺  +  SCN⁻  ⇌  FeSCN²⁺
            </text>

            {/* ── Reaction vessel ── */}
            <path d="M60 28 L60 170 Q60 185 75 185 L245 185 Q260 185 260 170 L260 28 Z"
              fill="rgba(255,255,255,0.48)" stroke="rgba(71,85,105,0.50)" strokeWidth="2"
              filter="url(#eq-shadow)" />
            <path d="M64 34 L64 170" stroke="rgba(255,255,255,0.40)" strokeWidth="4" strokeLinecap="round" />
            <path d="M72 34 L72 170" stroke="rgba(255,255,255,0.14)" strokeWidth="2" strokeLinecap="round" />

            {/* Solution fill — blood red for FeSCN²⁺ */}
            <motion.rect x="61" y="62" width="198" height="122"
              clipPath="url(#eq-vessel-clip)"
              animate={{ fill: solColor }}
              transition={{ duration: 1.4, ease: "easeOut" }}
            />
            {/* Solution surface wave */}
            <motion.path
              fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"
              animate={{ d: [
                "M 62 62 Q 120 58 160 62 Q 200 66 258 62",
                "M 62 62 Q 120 66 160 62 Q 200 58 258 62",
              ]}}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut", repeatType: "mirror" }}
              clipPath="url(#eq-vessel-clip)"
            />
            {/* Ambient solution glow when FeSCN²⁺ is high */}
            {concFeSCN > 0.02 && (
              <ellipse cx="160" cy="123" rx="95" ry="55"
                fill={solColor} opacity="0.15" filter="url(#eq-glow)" />
            )}

            {/* Vessel outline overlay */}
            <path d="M60 28 L60 170 Q60 185 75 185 L245 185 Q260 185 260 170 L260 28 Z"
              fill="none" stroke="rgba(99,179,237,0.25)" strokeWidth="1.5" />

            {/* ── Reaction arrows — animate when shifted ── */}
            <g style={{ transition: "opacity 0.5s" }}>
              {/* Forward arrow (top) — thicker and bolder when active */}
              <motion.g
                animate={{ x: arrowForward ? [0, 6, 0] : 0 }}
                transition={{ repeat: arrowForward ? Infinity : 0, duration: 0.65, ease: "easeInOut" }}
              >
                <line x1="96" y1="34" x2="216" y2="34"
                  stroke={arrowForward ? "#16a34a" : "#94a3b8"} strokeWidth={arrowForward ? 3.5 : 2}
                  strokeLinecap="round"
                  style={{ transition: "stroke 0.5s, stroke-width 0.3s" }} />
                <polygon
                  points="216,29 228,34 216,39"
                  fill={arrowForward ? "#16a34a" : "#94a3b8"}
                  style={{ transition: "fill 0.5s" }}
                />
                {arrowForward && (
                  <text x="156" y="30" textAnchor="middle" fontSize="7.5" fill="#16a34a" fontWeight="800">
                    FORWARD →
                  </text>
                )}
              </motion.g>
              {/* Reverse arrow (bottom) */}
              <motion.g
                animate={{ x: arrowReverse ? [0, -6, 0] : 0 }}
                transition={{ repeat: arrowReverse ? Infinity : 0, duration: 0.65, ease: "easeInOut" }}
              >
                <line x1="216" y1="47" x2="96" y2="47"
                  stroke={arrowReverse ? "#dc2626" : "#94a3b8"} strokeWidth={arrowReverse ? 3.5 : 2}
                  strokeLinecap="round"
                  style={{ transition: "stroke 0.5s, stroke-width 0.3s" }} />
                <polygon
                  points="96,42 84,47 96,52"
                  fill={arrowReverse ? "#dc2626" : "#94a3b8"}
                  style={{ transition: "fill 0.5s" }}
                />
                {arrowReverse && (
                  <text x="156" y="58" textAnchor="middle" fontSize="7.5" fill="#dc2626" fontWeight="800">
                    ← REVERSE
                  </text>
                )}
              </motion.g>
            </g>

            {/* Shift label badge — always visible when shifted */}
            {shiftDirection !== "none" && (
              <motion.g
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <rect x="90" y="54" width="140" height="18" rx="5"
                  fill={`${shiftColor}1a`} stroke={`${shiftColor}70`} strokeWidth="1.2" />
                <text x="160" y="66" textAnchor="middle" fontSize="8.5"
                  fill={shiftColor} fontWeight="900">
                  {shiftText}
                </text>
              </motion.g>
            )}

            {/* Temperature + FeSCN²⁺ reading inside vessel */}
            <rect x="90" y="132" width="140" height="42" rx="8"
              fill="rgba(15, 23, 42, 0.75)" stroke="rgba(34, 211, 238, 0.2)" strokeWidth="1" />
            <text x="160" y="148" textAnchor="middle" fontSize="12"
              fill="#22d3ee" fontWeight="800">
              {temperatureK} K  ({temp > 0 ? "+" : ""}{temp} °C)
            </text>
            <text x="160" y="164" textAnchor="middle" fontSize="11.5"
              fill="#e2e8f0" fontWeight="700">
              [FeSCN²⁺] = {concFeSCN.toFixed(4)} M
            </text>


          </svg>
        </div>
      ) : (
        <MicroscopicViewer
          experimentType="equilibrium"
          temperatureK={temperatureK}
          concentration={concFe3} // Use concFe3 as representative concentration
          pH={7}
        />
      )}
    </div>
  );
}
