"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { IndicatorTestId, TestSubstanceId, AcidityClass } from "@/lib/engine/types";
import { INDICATORS, SUBSTANCES, getIndicatorColor } from "@/lib/engine/indicator-test-engine";

interface Props {
  selectedIndicator: IndicatorTestId | null;
  selectedSubstance: TestSubstanceId | null;
  isTesting:         boolean;
  currentResult:     { color: string; classification: AcidityClass; pH: number } | null;
}

const CLASS_LABEL: Record<AcidityClass, string> = {
  acidic:  "ACIDIC",
  neutral: "NEUTRAL",
  basic:   "BASIC",
};

const CLASS_BG: Record<AcidityClass, string> = {
  acidic:  "rgba(220,38,38,0.10)",
  neutral: "rgba(107,114,128,0.10)",
  basic:   "rgba(124,58,237,0.10)",
};

const CLASS_COLOR: Record<AcidityClass, string> = {
  acidic:  "#dc2626",
  neutral: "#6b7280",
  basic:   "#7c3aed",
};

export default function IndicatorWorkspace({
  selectedIndicator, selectedSubstance, isTesting, currentResult,
}: Props) {
  const ind = selectedIndicator ? INDICATORS[selectedIndicator] : null;
  const sub = selectedSubstance ? SUBSTANCES[selectedSubstance] : null;
  const previewColor = (ind && sub)
    ? getIndicatorColor(selectedIndicator!, selectedSubstance!).color
    : null;
  const displayColor = currentResult?.color ?? previewColor ?? "#e2e8f0";

  return (
    <div
      className="relative rounded-3xl overflow-hidden select-none"
      style={{
        aspectRatio: "480/300",
        width:       "100%",
        height:      "auto",
        maxHeight:   "100%",
        background:  "linear-gradient(180deg, #faf5ff 0%, #f3e8ff 30%, #f5f3ff 100%)",
        border:      "1px solid rgba(124,58,237,0.20)",
        boxShadow:   "0 10px 30px rgba(15,23,42,0.05), 0 0 0 1px rgba(124,58,237,0.12) inset",
      }}
    >
      <svg viewBox="0 0 480 300" width="100%" style={{ display: "block", position: "relative", zIndex: 10 }}>
        <defs>
          <filter id="ind-shadow">
            <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="rgba(0,0,0,0.35)" />
          </filter>
          <filter id="ind-soft">
            <feGaussianBlur stdDeviation="2" />
          </filter>

          {/* pH scale gradient */}
          <linearGradient id="ph-scale" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#dc2626" />
            <stop offset="14%"  stopColor="#ea580c" />
            <stop offset="29%"  stopColor="#f97316" />
            <stop offset="43%"  stopColor="#fbbf24" />
            <stop offset="50%"  stopColor="#a3e635" />
            <stop offset="57%"  stopColor="#4ade80" />
            <stop offset="71%"  stopColor="#2dd4bf" />
            <stop offset="86%"  stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>

        {/* ── Petri dish (test container) — centre ── */}
        {/* Dish shadow */}
        <ellipse cx="240" cy="197" rx="84" ry="32"
          fill="rgba(0,0,0,0.12)" filter="url(#ind-soft)" />

        {/* Dish base */}
        <ellipse cx="240" cy="195" rx="82" ry="30"
          fill="rgba(248,250,252,0.90)" stroke="rgba(71,85,105,0.35)" strokeWidth="1.8"
          filter="url(#ind-shadow)" />

        {/* Substance liquid fill — colour from substance */}
        <motion.ellipse
          cx="240" cy="196" rx="76" ry="24"
          animate={{ fill: sub ? "rgba(59,130,246,0.18)" : "rgba(226,232,240,0.40)" }}
          transition={{ duration: 0.5 }}
          stroke="rgba(71,85,105,0.20)" strokeWidth="1"
        />

        {/* Dish label */}
        <text x="240" y="200" textAnchor="middle" fontSize="9" fill="#475569" fontWeight="700">
          {sub ? sub.name : "Select a substance"}
        </text>
        {sub && (
          <text x="240" y="212" textAnchor="middle" fontSize="7.5" fill="#64748b">
            pH ≈ {sub.pH}
          </text>
        )}

        {/* ── Indicator strip (litmus/turmeric paper) — left of dish ── */}
        <g transform="translate(148, 88)">
          {/* Paper strip */}
          <rect x="0" y="0" width="40" height="90" rx="5"
            fill={ind ? "#fffbeb" : "#f1f5f9"}
            stroke="rgba(71,85,105,0.30)" strokeWidth="1.2"
            filter="url(#ind-shadow)"
          />
          {/* Paper texture lines */}
          {[15, 30, 45, 60, 75].map((y) => (
            <line key={y} x1="5" y1={y} x2="35" y2={y}
              stroke="rgba(148,163,184,0.20)" strokeWidth="0.5" />
          ))}
          {/* Indicator stain area — animates from grey to result colour */}
          <AnimatePresence>
            {(isTesting || currentResult) && (
              <motion.rect
                key={displayColor}
                x="5" y="55" width="30" height="28" rx="4"
                initial={{ fill: "#e2e8f0", opacity: 0.3 }}
                animate={{ fill: displayColor, opacity: 0.95 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            )}
          </AnimatePresence>
          {/* Indicator label */}
          <text x="20" y="10" textAnchor="middle" fontSize="6" fill="#475569" fontWeight="700">
            {ind ? ind.name.slice(0, 14) : "Select"}
          </text>
          <text x="20" y="20" textAnchor="middle" fontSize="5.5" fill="#64748b">
            {ind ? ind.name.slice(14) : "indicator"}
          </text>
        </g>

        {/* ── Dropper bottle — right side ── */}
        {ind && (
          <g transform="translate(310, 50)">
            {/* Bottle body */}
            <rect x="8" y="30" width="28" height="55" rx="6"
              fill="rgba(255,255,255,0.75)" stroke="rgba(107,114,128,0.45)" strokeWidth="1.2" />
            {/* Liquid in bottle */}
            <rect x="10" y="42" width="24" height="36" rx="4"
              fill={ind ? "rgba(99,102,241,0.20)" : "rgba(226,232,240,0.40)"} />
            {/* Bottle neck */}
            <rect x="15" y="16" width="14" height="16" rx="3"
              fill="rgba(220,220,230,0.80)" stroke="rgba(107,114,128,0.35)" strokeWidth="1" />
            {/* Dropper bulb */}
            <ellipse cx="22" cy="10" rx="10" ry="8"
              fill="rgba(180,180,200,0.70)" stroke="rgba(107,114,128,0.35)" strokeWidth="1" />
            {/* Dropper tip */}
            <path d="M 20 30 L 20 38 Q 22 40 24 38 L 24 30 Z"
              fill="rgba(180,180,200,0.80)" stroke="rgba(107,114,128,0.30)" strokeWidth="0.8" />
            {/* Label */}
            <text x="22" y="96" textAnchor="middle" fontSize="6" fill="#6b7280" fontWeight="600">
              indicator
            </text>
          </g>
        )}

        {/* ── Falling drop animation (when testing) ── */}
        <AnimatePresence>
          {isTesting && (
            <>
              {/* Drop from dropper tip to dish */}
              <motion.ellipse
                cx="332" cy={92}
                rx="4" ry="5"
                fill={previewColor ?? "rgba(99,102,241,0.75)"}
                initial={{ cy: 92, opacity: 0.95 }}
                animate={{ cy: 190, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeIn" }}
              />
              {/* Second drop with slight delay */}
              <motion.ellipse
                cx="332" cy={92}
                rx="3" ry="4"
                fill={previewColor ?? "rgba(99,102,241,0.65)"}
                initial={{ cy: 92, opacity: 0.80 }}
                animate={{ cy: 190, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: "easeIn" }}
              />
              {/* Dashed guide line */}
              <motion.line
                x1="332" y1="93"
                x2="332" y2="175"
                stroke="rgba(99,102,241,0.20)"
                strokeWidth="1.2" strokeDasharray="3 4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </>
          )}
        </AnimatePresence>

        {/* ── Dipping animation (for strip) ── */}
        {isTesting && (
          <motion.line
            x1="188" y1="178"
            x2="220" y2="190"
            stroke="rgba(71,85,105,0.35)"
            strokeWidth="1.5" strokeDasharray="4 3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        )}

        {/* ── Result display ── */}
        {currentResult && (
          <motion.g
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Result badge */}
            <rect x="50" y="90" width="84" height="80" rx="12"
              fill={CLASS_BG[currentResult.classification]}
              stroke={CLASS_COLOR[currentResult.classification]}
              strokeOpacity={0.35} strokeWidth="1.2"
              filter="url(#ind-shadow)"
            />
            <text x="92" y="115" textAnchor="middle" fontSize="8" fontWeight="700"
              fill={CLASS_COLOR[currentResult.classification]} letterSpacing="0.10em">
              RESULT
            </text>
            <circle cx="92" cy="135" r="14"
              fill={currentResult.color} stroke="white" strokeWidth="2" />
            <text x="92" y="162" textAnchor="middle" fontSize="9.5" fontWeight="900"
              fill={CLASS_COLOR[currentResult.classification]}>
              {CLASS_LABEL[currentResult.classification]}
            </text>

            {/* pH readout */}
            <rect x="370" y="90" width="84" height="80" rx="12"
              fill="rgba(255,255,255,0.80)" stroke="var(--lab-glass-border)" strokeWidth="1"
              filter="url(#ind-shadow)" />
            <text x="412" y="110" textAnchor="middle" fontSize="8" fontWeight="700" fill="#475569" letterSpacing="0.08em">
              pH VALUE
            </text>
            <text x="412" y="145" textAnchor="middle" fontSize="24" fontWeight="900"
              fill={CLASS_COLOR[currentResult.classification]} fontFamily="monospace">
              {currentResult.pH}
            </text>
            <text x="412" y="162" textAnchor="middle" fontSize="8" fill="#64748b">
              {currentResult.pH < 7 ? "Acidic" : currentResult.pH > 7 ? "Basic" : "Neutral"}
            </text>
          </motion.g>
        )}

        {/* ── Staged helper text ── */}
        {!selectedIndicator && !selectedSubstance && (
          <text x="240" y="145" textAnchor="middle" fontSize="11" fill="#94a3b8" fontStyle="italic">
            Select an indicator and a substance to test
          </text>
        )}
        {selectedIndicator && !selectedSubstance && (
          <text x="240" y="145" textAnchor="middle" fontSize="10" fill="#7c3aed" fontWeight="600">
            Now select a substance to test ↓
          </text>
        )}
        {selectedIndicator && selectedSubstance && !isTesting && !currentResult && (
          <text x="240" y="145" textAnchor="middle" fontSize="10" fill="#475569" fontWeight="600">
            Ready — click Test to apply indicator
          </text>
        )}
        {isTesting && (
          <text x="240" y="145" textAnchor="middle" fontSize="10" fill="#7c3aed" fontWeight="700"
            style={{ animation: "blink-dot 1.2s ease-in-out infinite" }}>
            Applying indicator…
          </text>
        )}

        {/* ── pH scale bar ── */}
        <rect x="40" y="258" width="400" height="12" rx="6" fill="url(#ph-scale)" />
        {[0, 7, 14].map((ph) => (
          <g key={ph}>
            <text x={40 + (ph / 14) * 400} y="252" textAnchor="middle" fontSize="7" fill="#475569" fontWeight="700">
              {ph}
            </text>
            <line x1={40 + (ph / 14) * 400} y1="254" x2={40 + (ph / 14) * 400} y2="258"
              stroke="#64748b" strokeWidth="0.8" />
          </g>
        ))}
        <text x="40"  y="285" textAnchor="start"  fontSize="6.5" fill="#dc2626" fontWeight="700">Acidic ←</text>
        <text x="240" y="285" textAnchor="middle" fontSize="6.5" fill="#4ade80" fontWeight="700">Neutral</text>
        <text x="440" y="285" textAnchor="end"    fontSize="6.5" fill="#8b5cf6" fontWeight="700">→ Basic</text>

        {/* pH marker on scale */}
        {currentResult && (
          <motion.line
            x1={40 + (currentResult.pH / 14) * 400}
            y1="254"
            x2={40 + (currentResult.pH / 14) * 400}
            y2="272"
            stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </svg>
    </div>
  );
}
