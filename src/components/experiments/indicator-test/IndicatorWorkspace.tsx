"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { IndicatorTestId, TestSubstanceId, AcidityClass } from "@/lib/engine/types";
import { INDICATORS, SUBSTANCES, getIndicatorColor } from "@/lib/engine/indicator-test-engine";

interface Props {
  selectedIndicator: IndicatorTestId | null;
  selectedSubstance: TestSubstanceId | null;
  isTesting:         boolean;
  currentResult:     { color: string; classification: AcidityClass; pH: number } | null;
  onTest?:           () => void;
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
  selectedIndicator, selectedSubstance, isTesting, currentResult, onTest,
}: Props) {
  const ind = selectedIndicator ? INDICATORS[selectedIndicator] : null;
  const sub = selectedSubstance ? SUBSTANCES[selectedSubstance] : null;
  const previewColor = (ind && sub)
    ? getIndicatorColor(selectedIndicator!, selectedSubstance!).color
    : null;
  const displayColor = currentResult?.color ?? previewColor ?? "#e2e8f0";

  const [stripPicked, setStripPicked] = useState(false);
  const [dropperPicked, setDropperPicked] = useState(false);

  // Reset local interactive steps when user selects another indicator or substance
  useEffect(() => {
    setStripPicked(false);
    setDropperPicked(false);
  }, [selectedIndicator, selectedSubstance]);

  const isStrip = selectedIndicator && selectedIndicator !== "cabbage-juice";
  const isLiquid = selectedIndicator === "cabbage-juice";

  // Decide strip group transform
  let stripTransform = "translate(148, 88)";
  if (isTesting || currentResult) {
    stripTransform = "translate(220, 120)"; // dipped in petri dish
  } else if (stripPicked) {
    stripTransform = "translate(220, 96)";  // hovering above petri dish
  }

  // Decide dropper group transform
  let dropperTransform = "translate(310, 50)";
  if (isTesting || currentResult) {
    dropperTransform = "translate(218, 90)"; // positioned above petri dish
  } else if (dropperPicked) {
    dropperTransform = "translate(218, 90)"; // hovering above petri dish
  }

  const handleStripClick = () => {
    if (selectedIndicator && selectedSubstance && !isTesting && !currentResult && !stripPicked) {
      setStripPicked(true);
    }
  };

  const handleDropperClick = () => {
    if (selectedIndicator && selectedSubstance && !isTesting && !currentResult && !dropperPicked) {
      setDropperPicked(true);
    }
  };

  const handlePetriDishClick = () => {
    if (isStrip && stripPicked && !isTesting && !currentResult && onTest) {
      onTest();
    }
  };

  const handleDropperBulbClick = () => {
    if (isLiquid && dropperPicked && !isTesting && !currentResult && onTest) {
      onTest();
    }
  };

  return (
    <div
      className="relative rounded-3xl overflow-hidden select-none"
      style={{
        aspectRatio: "320/250",
        width:       "100%",
        height:      "auto",
        maxHeight:   "100%",
        background:  "linear-gradient(180deg, #faf5ff 0%, #f3e8ff 30%, #f5f3ff 100%)",
        border:      "1px solid rgba(124,58,237,0.20)",
        boxShadow:   "0 10px 30px rgba(15,23,42,0.05), 0 0 0 1px rgba(124,58,237,0.12) inset",
      }}
    >
      <svg viewBox="80 30 320 250" width="100%" style={{ display: "block", position: "relative", zIndex: 10 }}>
        <defs>
          <filter id="ind-shadow">
            <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="rgba(0,0,0,0.35)" />
          </filter>
          <filter id="ind-soft">
            <feGaussianBlur stdDeviation="2" />
          </filter>
          <linearGradient id="ind-bench" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="20%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="glass-specular" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0.75)" />
            <stop offset="25%" stopColor="rgba(255,255,255,0.15)" />
            <stop offset="75%" stopColor="rgba(255,255,255,0.0)" />
            <stop offset="85%" stopColor="rgba(255,255,255,0.25)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.55)" />
          </linearGradient>

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

          {/* Wet paper stain wicking clip path */}
          <clipPath id="wicking-clip">
            <motion.rect
              initial={false}
              x="5"
              width="30"
              animate={isTesting ? { y: [83, 55], height: [0, 28] } : { y: 55, height: 28 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </clipPath>
        </defs>

        {/* Lab benchtop behind petri dish */}
        <rect x="80" y="160" width="320" height="90" fill="url(#ind-bench)" />
        <line x1="80" y1="160" x2="400" y2="160" stroke="#475569" strokeWidth="1.2" />
        <rect x="80" y="160" width="320" height="4" fill="rgba(255,255,255,0.06)" />

        {/* ── Petri dish (test container) ── */}
        <g 
          style={{ cursor: isStrip && stripPicked && !isTesting && !currentResult ? "pointer" : "default" }}
          onClick={handlePetriDishClick}
        >
          {/* Dish shadow */}
          <ellipse cx="240" cy="210" rx="84" ry="22"
            fill="rgba(9,13,22,0.4)" filter="url(#ind-soft)" />

          {/* Dish base - Double outline glass thickness effect */}
          <ellipse cx="240" cy="195" rx="83" ry="31"
            fill="none" stroke="rgba(148,163,184,0.7)" strokeWidth="1.5" />
          <ellipse cx="240" cy="195" rx="80" ry="29"
            fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" />
          <ellipse cx="240" cy="195" rx="74" ry="25"
            fill="none" stroke="url(#glass-specular)" strokeWidth="1.5" opacity="0.4" />

          {/* Substance liquid fill */}
          <motion.ellipse
            cx="240" cy="196" rx="76" ry="24"
            animate={{ fill: sub ? "rgba(59,130,246,0.25)" : "rgba(226,232,240,0.15)" }}
            transition={{ duration: 0.5 }}
            stroke="rgba(255,255,255,0.20)" strokeWidth="1"
          />

          {/* Curved liquid meniscus highlight on top of liquid */}
          {sub && (
            <ellipse cx="240" cy="173" rx="74" ry="4" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1" />
          )}

          {/* Dish label */}
          <text x="240" y="200" textAnchor="middle" fontSize="9" fill="#e2e8f0" fontWeight="700">
            {sub ? sub.name : "Select a substance"}
          </text>
          {sub && (
            <text x="240" y="212" textAnchor="middle" fontSize="7.5" fill="#94a3b8">
              pH ≈ {sub.pH}
            </text>
          )}
        </g>

        {/* ── Indicator strip (litmus/turmeric paper) ── */}
        {isStrip && (
          <motion.g
            animate={{ transform: stripTransform }}
            transition={{ type: "spring", stiffness: 45, damping: 12 }}
            style={{ cursor: selectedIndicator && selectedSubstance && !stripPicked && !isTesting && !currentResult ? "pointer" : "default" }}
            onClick={handleStripClick}
          >
            {/* Paper strip */}
            <rect x="0" y="0" width="40" height="90" rx="5"
              fill={ind ? "#fffbeb" : "#f1f5f9"}
              stroke={stripPicked && !isTesting && !currentResult ? "#2563eb" : "rgba(71,85,105,0.30)"}
              strokeWidth={stripPicked && !isTesting && !currentResult ? 2.0 : 1.2}
              filter="url(#ind-shadow)"
            />
            {/* Paper texture lines */}
            {[15, 30, 45, 60, 75].map((y) => (
              <line key={y} x1="5" y1={y} x2="35" y2={y}
                stroke="rgba(148,163,184,0.20)" strokeWidth="0.5" />
            ))}
            {/* Indicator stain area */}
            <AnimatePresence>
              {(isTesting || currentResult) && (
                <motion.rect
                  key={displayColor}
                  x="5" y="55" width="30" height="28" rx="4"
                  initial={{ fill: "#e2e8f0", opacity: 0.3 }}
                  animate={{ fill: displayColor, opacity: 0.95 }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  clipPath="url(#wicking-clip)"
                />
              )}
            </AnimatePresence>
            {/* Indicator labels */}
            <text x="20" y="10" textAnchor="middle" fontSize="6" fill="#475569" fontWeight="700">
              {ind ? ind.name.slice(0, 14) : "Select"}
            </text>
            <text x="20" y="20" textAnchor="middle" fontSize="5.5" fill="#64748b">
              {ind ? ind.name.slice(14) : "indicator"}
            </text>
          </motion.g>
        )}

        {/* ── Dropper bottle ── */}
        {isLiquid && ind && (
          <motion.g
            animate={{ transform: dropperTransform }}
            transition={{ type: "spring", stiffness: 45, damping: 12 }}
            style={{ cursor: selectedIndicator && selectedSubstance && !dropperPicked && !isTesting && !currentResult ? "pointer" : "default" }}
            onClick={handleDropperClick}
          >
            {/* Bottle body */}
            <rect x="8" y="30" width="28" height="55" rx="6"
              fill="rgba(255,255,255,0.75)" 
              stroke={dropperPicked && !isTesting && !currentResult ? "#2563eb" : "rgba(107,114,128,0.45)"} 
              strokeWidth={dropperPicked && !isTesting && !currentResult ? 2.0 : 1.2} />
            {/* Liquid in bottle */}
            <rect x="10" y="42" width="24" height="36" rx="4"
              fill="rgba(99,102,241,0.20)" />
            {/* Bottle neck */}
            <rect x="15" y="16" width="14" height="16" rx="3"
              fill="rgba(220,220,230,0.80)" stroke="rgba(107,114,128,0.35)" strokeWidth="1" />
            
            {/* Dropper bulb (interactive to trigger drop) */}
            <ellipse 
              cx="22" cy="10" rx="10" ry="8"
              fill="rgba(180,180,200,0.70)" 
              stroke="rgba(107,114,128,0.35)" 
              strokeWidth="1"
              style={{ cursor: dropperPicked && !isTesting && !currentResult ? "pointer" : "default" }}
              onClick={handleDropperBulbClick}
            />
            {/* Dropper tip */}
            <path d="M 20 30 L 20 38 Q 22 40 24 38 L 24 30 Z"
              fill="rgba(180,180,200,0.80)" stroke="rgba(107,114,128,0.30)" strokeWidth="0.8" />
            {/* Label */}
            <text x="22" y="96" textAnchor="middle" fontSize="6" fill="#6b7280" fontWeight="600">
              cabbage
            </text>
          </motion.g>
        )}

        {/* ── Falling drop animation ── */}
        <AnimatePresence>
          {isTesting && isLiquid && (
            <>
              {/* Drop from dropper tip to dish */}
              <motion.ellipse
                cx="240" cy={130}
                rx="4" ry="5"
                fill={previewColor ?? "rgba(99,102,241,0.75)"}
                initial={{ cy: 130, opacity: 0.95 }}
                animate={{ cy: 190, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeIn" }}
              />
              {/* Second drop with slight delay */}
              <motion.ellipse
                cx="240" cy={130}
                rx="3" ry="4"
                fill={previewColor ?? "rgba(99,102,241,0.65)"}
                initial={{ cy: 130, opacity: 0.80 }}
                animate={{ cy: 190, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: "easeIn" }}
              />
              {/* Dashed guide line */}
              <motion.line
                x1="240" y1="131"
                x2="240" y2="182"
                stroke="rgba(99,102,241,0.20)"
                strokeWidth="1.2" strokeDasharray="3 4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </>
          )}
        </AnimatePresence>

        {/* ── Dipping animation line (legacy path removed) ── */}

        {/* ── Result display ── */}
        {currentResult && (
          <motion.g
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Result badge */}
            <rect x="90" y="90" width="44" height="74" rx="8"
              fill={CLASS_BG[currentResult.classification]}
              stroke={CLASS_COLOR[currentResult.classification]}
              strokeOpacity={0.35} strokeWidth="1.2"
              filter="url(#ind-shadow)"
            />
            <text x="112" y="105" textAnchor="middle" fontSize="6.5" fontWeight="700"
              fill={CLASS_COLOR[currentResult.classification]} letterSpacing="0.05em">
              RESULT
            </text>
            <circle cx="112" cy="124" r="10"
              fill={currentResult.color} stroke="white" strokeWidth="1.5" />
            <text x="112" y="148" textAnchor="middle" fontSize="7.5" fontWeight="900"
              fill={CLASS_COLOR[currentResult.classification]}>
              {CLASS_LABEL[currentResult.classification]}
            </text>

            {/* pH readout */}
            <rect x="346" y="90" width="44" height="74" rx="8"
              fill="rgba(255,255,255,0.80)" stroke="rgba(148, 163, 184, 0.25)" strokeWidth="1"
              filter="url(#ind-shadow)" />
            <text x="368" y="105" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#475569" letterSpacing="0.05em">
              pH
            </text>
            <text x="368" y="132" textAnchor="middle" fontSize="18" fontWeight="900"
              fill={CLASS_COLOR[currentResult.classification]} fontFamily="monospace">
              {currentResult.pH}
            </text>
            <text x="368" y="148" textAnchor="middle" fontSize="6.5" fill="#64748b">
              {currentResult.pH < 7 ? "Acid" : currentResult.pH > 7 ? "Base" : "Neut"}
            </text>
          </motion.g>
        )}

        {/* ── Staged helper text ── */}
        {!selectedIndicator && !selectedSubstance && (
          <text x="240" y="145" textAnchor="middle" fontSize="10" fill="#94a3b8" fontStyle="italic">
            Select indicator & substance to test
          </text>
        )}
        {selectedIndicator && !selectedSubstance && (
          <text x="240" y="145" textAnchor="middle" fontSize="9.5" fill="#7c3aed" fontWeight="600">
            Now select a substance to test ↓
          </text>
        )}
        {selectedIndicator && selectedSubstance && !isTesting && !currentResult && (
          <>
            {isStrip && !stripPicked && (
              <text x="240" y="145" textAnchor="middle" fontSize="9" fill="#7c3aed" fontWeight="700" style={{ animation: "blink-dot 1.8s ease-in-out infinite" }}>
                🖐 Click the paper strip to pick it up
              </text>
            )}
            {isStrip && stripPicked && (
              <text x="240" y="145" textAnchor="middle" fontSize="9" fill="#2563eb" fontWeight="700" style={{ animation: "blink-dot 1.8s ease-in-out infinite" }}>
                🧪 Click the petri dish to dip the strip
              </text>
            )}
            {isLiquid && !dropperPicked && (
              <text x="240" y="145" textAnchor="middle" fontSize="9" fill="#7c3aed" fontWeight="700" style={{ animation: "blink-dot 1.8s ease-in-out infinite" }}>
                🖐 Click the dropper bottle to pick it up
              </text>
            )}
            {isLiquid && dropperPicked && (
              <text x="240" y="145" textAnchor="middle" fontSize="9" fill="#2563eb" fontWeight="700" style={{ animation: "blink-dot 1.8s ease-in-out infinite" }}>
                💧 Click the dropper bulb to squeeze a drop
              </text>
            )}
          </>
        )}
        {isTesting && (
          <text x="240" y="145" textAnchor="middle" fontSize="9" fill="#7c3aed" fontWeight="700"
            style={{ animation: "blink-dot 1.2s ease-in-out infinite" }}>
            {isStrip ? "Wetting paper (wicking)..." : "Applying indicator drop..."}
          </text>
        )}

        {/* ── pH scale bar ── */}
        <rect x="90" y="258" width="300" height="12" rx="6" fill="url(#ph-scale)" />
        {[0, 7, 14].map((ph) => (
          <g key={ph}>
            <text x={90 + (ph / 14) * 300} y="252" textAnchor="middle" fontSize="7" fill="#475569" fontWeight="700">
              {ph}
            </text>
            <line x1={90 + (ph / 14) * 300} y1="254" x2={90 + (ph / 14) * 300} y2="258"
              stroke="#64748b" strokeWidth="0.8" />
          </g>
        ))}
        <text x="90"  y="285" textAnchor="start"  fontSize="6.5" fill="#dc2626" fontWeight="700">Acidic ←</text>
        <text x="240" y="285" textAnchor="middle" fontSize="6.5" fill="#4ade80" fontWeight="700">Neutral</text>
        <text x="390" y="285" textAnchor="end"    fontSize="6.5" fill="#8b5cf6" fontWeight="700">→ Basic</text>

        {/* pH marker on scale */}
        {currentResult && (
          <motion.line
            x1={90 + (currentResult.pH / 14) * 300}
            y1="254"
            x2={90 + (currentResult.pH / 14) * 300}
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
