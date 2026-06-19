"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FlameTestSampleId, FlameTestRecord } from "@/lib/engine/types";
import { FLAME_SAMPLES } from "@/lib/engine/flame-test-engine";

interface Props {
  flameLit:          boolean;
  selectedSample:    FlameTestSampleId | null;
  loopDipped:        boolean;
  loopClean:         boolean;
  testInProgress:    boolean;
  currentFlameColor: string | null;
  contaminated:      boolean;
  testHistory:       FlameTestRecord[];
  concentration:     number;
  airCollarOpen:     boolean;
  contaminationLevel: number;
  cobaltGlass:       boolean;
  flameIntensity:    number;
  onLightBurner?:    () => void;
  onSelectSample?:   (id: FlameTestSampleId) => void;
  onDipLoop?:        () => void;
  onPerformTest?:    () => void;
  onCleanLoop?:      () => void;
}

const SAMPLES_LIST = Object.values(FLAME_SAMPLES);

// Flame layer definitions
const FLAME_LAYERS = [
  { ry: [52, 64, 56], rx: [40, 48, 44], opacity: [0.05, 0.10, 0.07], delay: 0,    dur: 1.4, cy: -44 },
  { ry: [36, 44, 39], rx: [28, 35, 30], opacity: [0.14, 0.24, 0.17], delay: 0.20, dur: 1.1, cy: -28 },
  { ry: [22, 29, 25], rx: [16, 21, 18], opacity: [0.52, 0.72, 0.60], delay: 0.09, dur: 0.88, cy: -16 },
  { ry: [12, 17, 14], rx: [7,  11, 9],  opacity: [0.90, 1.00, 0.94], delay: 0,    dur: 0.65, cy: -5  },
];

// Viewport constants (cropped)
const VW = 340;
const VH = 340;

// Flame base (barrel tip of Bunsen)
const FX = 194;
const FY = 228;

// Wire loop at rest position
const LOOP_CX_REST = 290;
const LOOP_CY_REST = 168;

export default function FlameTestWorkspace({
  flameLit, selectedSample, loopDipped,
  loopClean, testInProgress, currentFlameColor,
  contaminated, testHistory, concentration, airCollarOpen,
  contaminationLevel, cobaltGlass, flameIntensity,
  onLightBurner, onSelectSample, onDipLoop, onPerformTest, onCleanLoop,
}: Props) {
  const activeColor = testInProgress && currentFlameColor ? currentFlameColor : null;
  const profile     = selectedSample ? FLAME_SAMPLES[selectedSample] : null;

  // Local procedural states
  const [hclDipped, setHclDipped] = useState(false);
  const [burnOffActive, setBurnOffActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Clear local error after a few seconds
  useEffect(() => {
    if (localError) {
      const t = setTimeout(() => setLocalError(null), 3500);
      return () => clearTimeout(t);
    }
  }, [localError]);

  // Reset dipped status when sample changes
  useEffect(() => {
    if (!selectedSample) {
      setHclDipped(false);
    }
  }, [selectedSample]);

  // Determine wire loop position
  let loopX = LOOP_CX_REST;
  let loopY = LOOP_CY_REST;

  if (burnOffActive) {
    loopX = FX + 8;
    loopY = FY - 18;
  } else if (hclDipped) {
    loopX = 96;
    loopY = 285; // Dipped in HCl wash beaker
  } else if (loopDipped || testInProgress) {
    loopX = FX + 8;
    loopY = FY - 18; // In the burner flame
  } else if (selectedSample && !loopClean) {
    // If we have selected a sample but haven't dipped it yet, show it near the rack
    const idx = SAMPLES_LIST.findIndex((s) => s.id === selectedSample);
    if (idx !== -1) {
      loopX = 35 + idx * 14 + 5.5;
      loopY = 250; // hovering above the vial
    }
  } else if (selectedSample && loopClean) {
    // Dipped in sample vial
    const idx = SAMPLES_LIST.findIndex((s) => s.id === selectedSample);
    if (idx !== -1) {
      loopX = 35 + idx * 14 + 5.5;
      loopY = 286; // dipped into the vial
    }
  }

  // Handle HCl wash beaker click
  const handleHclClick = () => {
    if (testInProgress || burnOffActive) return;
    if (loopClean && !contaminated) {
      setLocalError("The loop is already clean! No need to wash.");
      return;
    }
    setHclDipped(true);
    setLocalError(null);
  };

  // Handle Bunsen burner click (light it or perform burn-off/test)
  const handleBurnerClick = () => {
    if (!flameLit) {
      if (onLightBurner) onLightBurner();
      return;
    }

    if (hclDipped) {
      // Perform burn-off of contaminants in flame
      setHclDipped(false);
      setBurnOffActive(true);
      setTimeout(() => {
        setBurnOffActive(false);
        if (onCleanLoop) onCleanLoop();
      }, 1200);
      return;
    }

    if (!loopClean || contaminated) {
      setLocalError("⚠ Dip loop in dilute HCl first to dissolve contaminants!");
      return;
    }

    if (loopDipped && selectedSample) {
      if (onPerformTest) onPerformTest();
      setLocalError(null);
    } else {
      setLocalError("Dip the loop in a salt sample first!");
    }
  };

  // Handle sample vial click
  const handleVialClick = (id: FlameTestSampleId) => {
    if (testInProgress || burnOffActive) return;
    if (!loopClean || contaminated) {
      setLocalError("⚠ Clean the loop in HCl first to avoid cross-contamination!");
      return;
    }

    if (onSelectSample) onSelectSample(id);
    // Auto dip after selecting
    setTimeout(() => {
      if (onDipLoop) onDipLoop();
    }, 400);
    setLocalError(null);
  };

  return (
    <div
      className="relative rounded-3xl overflow-hidden select-none"
      style={{
        aspectRatio: "1/1",
        width:       "100%",
        height:      "auto",
        maxHeight:   "100%",
        background:
          "radial-gradient(ellipse at 50% 28%, rgba(234,88,12,0.09) 0%, transparent 55%)," +
          "linear-gradient(180deg, #fef8f3 0%, #fdf2e9 40%, #faf6f2 100%)",
        border:    "1px solid rgba(234,88,12,0.15)",
        boxShadow:
          "0 24px 64px rgba(15,23,42,0.10), " +
          "0 4px 12px rgba(15,23,42,0.05), " +
          "0 0 0 1px rgba(255,255,255,0.9) inset",
      }}
    >
      {/* Dot-grid background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(234,88,12,0.055) 1px, transparent 1px)",
          backgroundSize:  "22px 22px",
        }}
      />

      {/* Warm ambient glow around flame area */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          top: "2%", left: "50%", transform: "translateX(-52%)",
          width: "300px", height: "240px",
          background: activeColor
            ? `radial-gradient(ellipse at center, ${activeColor}30 0%, transparent 68%)`
            : flameLit
              ? "radial-gradient(ellipse at center, rgba(234,88,12,0.12) 0%, transparent 68%)"
              : "radial-gradient(ellipse at center, rgba(234,88,12,0.04) 0%, transparent 68%)",
          transition: "background 0.85s ease",
          filter: "blur(28px)",
        }}
      />

      <svg
        viewBox="32 15 340 340"
        width="100%"
        style={{ display: "block", position: "relative", zIndex: 10 }}
        aria-label="Flame test apparatus"
        role="img"
      >
        <defs>
          {/* Glow filters */}
          <filter id="ft-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="9" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="ft-soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="ft-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="rgba(0,0,0,0.36)" />
          </filter>
          <filter id="ft-deep-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="14" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* Observation chamber gradient */}
          <radialGradient id="ft-chamber-bg" cx="50%" cy="62%" r="55%">
            <stop offset="0%"   stopColor="rgba(28,18,8,0.92)" />
            <stop offset="65%"  stopColor="rgba(10,10,16,0.96)" />
            <stop offset="100%" stopColor="rgba(6,6,12,0.98)" />
          </radialGradient>

          {/* Colored halo for flame color preview in chamber */}
          <radialGradient id="ft-flame-halo" cx="50%" cy="70%" r="55%">
            <stop offset="0%"   stopColor={activeColor ?? "transparent"} stopOpacity="0.32" />
            <stop offset="100%" stopColor={activeColor ?? "transparent"} stopOpacity="0" />
          </radialGradient>

          {/* Burner gradients */}
          <linearGradient id="ft-burner-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#9ca3af" />
            <stop offset="50%" stopColor="#6b7280" />
            <stop offset="100%" stopColor="#4b5563" />
          </linearGradient>
          <linearGradient id="ft-burner-collar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#aab3c0" />
            <stop offset="100%" stopColor="#78808a" />
          </linearGradient>
        </defs>

        {/* ── Lab bench ── */}
        <rect x="0" y="328" width="420" height="60" fill="#c8d0db" />
        <rect x="0" y="326" width="420" height="5" fill="#dde4ef" />
        <rect x="0" y="326" width="420" height="2" fill="rgba(255,255,255,0.52)" />

        {/* ══════════════════════════════════════
            OBSERVATION CHAMBER — premium scientific
        ══════════════════════════════════════ */}
        <g style={{ cursor: flameLit ? "pointer" : "default" }} onClick={handleBurnerClick}>
          {/* Outer metal frame */}
          <rect x="114" y="54" width="176" height="196" rx="12"
            fill="#d0d8e4" stroke="#94a3b8" strokeWidth="1.8"
            filter="url(#ft-shadow)" />
          {/* Frame bevel / top highlight */}
          <rect x="116" y="56" width="172" height="14" rx="5" fill="rgba(255,255,255,0.38)" />
          {/* Corner screws */}
          {[[120,61],[282,61],[120,240],[282,240]].map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3.5" fill="#94a3b8" stroke="#64748b" strokeWidth="0.6" />
              <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#64748b" strokeWidth="0.7" />
              <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#64748b" strokeWidth="0.7" />
            </g>
          ))}
          {/* "FLAME CHAMBER" badge top */}
          <rect x="158" y="60" width="88" height="14" rx="4"
            fill="rgba(0,0,0,0.18)" stroke="rgba(148,163,184,0.20)" strokeWidth="0.7" />
          <text x="202" y="70" textAnchor="middle" fontSize="6.5" fill="rgba(148,163,184,0.80)"
            fontWeight="700" letterSpacing="0.12em">FLAME CHAMBER</text>

          {/* Dark observation window */}
          <rect x="120" y="72" width="164" height="178" rx="8"
            fill="url(#ft-chamber-bg)" />

          {/* Colored ambient halo inside chamber when flame is active */}
          {flameLit && (
            <rect x="120" y="72" width="164" height="178" rx="8"
              fill="url(#ft-flame-halo)"
              style={{ transition: "fill 0.9s ease" }} />
          )}

          {/* Chamber glass glare strips */}
          <rect x="122" y="74" width="26" height="172" rx="3"
            fill="rgba(255,255,255,0.042)" />
          <rect x="125" y="76" width="7" height="168" rx="3"
            fill="rgba(255,255,255,0.055)" />

          {/* Viewport active border glow */}
          {flameLit && (
            <rect x="120" y="72" width="164" height="178" rx="8"
              fill="none"
              stroke={activeColor ? activeColor : "rgba(234,88,12,0.40)"}
              strokeWidth="1.8"
              style={{ transition: "stroke 0.65s ease" }} />
          )}

          {/* Grid lines inside chamber for depth */}
          <g opacity="0.06">
            {[100,120,140,160,180,200,220].map((y) => (
              <line key={y} x1="122" y1={y} x2="282" y2={y} stroke="rgba(255,255,255,0.8)" strokeWidth="0.5" />
            ))}
            {[150,180,210,240,260].map((x) => (
              <line key={x} x1={x} y1="74" x2={x} y2="248" stroke="rgba(255,255,255,0.8)" strokeWidth="0.5" />
            ))}
          </g>
        </g>

        {/* Cobalt Blue Glass Filter Overlay */}
        <AnimatePresence>
          {cobaltGlass && (
            <motion.rect
              x="120" y="72" width="164" height="178" rx="8"
              fill="rgba(15, 32, 167, 0.45)"
              stroke="rgba(79, 70, 229, 0.65)"
              strokeWidth="2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ pointerEvents: "none", mixBlendMode: "multiply" }}
            />
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════
            BUNSEN BURNER
        ══════════════════════════════════════ */}
        <g style={{ cursor: "pointer" }} onClick={handleBurnerClick}>
          {/* Base plate */}
          <rect x="162" y="292" width="64" height="38" rx="8"
            fill="url(#ft-burner-body)" stroke="#64748b" strokeWidth="0.9" />
          <rect x="166" y="293" width="56" height="8" rx="4"
            fill="rgba(255,255,255,0.18)" />
          {/* Air-flow collar */}
          <rect x="168" y="268" width="52" height="28" rx="6"
            fill="url(#ft-burner-collar)" stroke="#6b7280" strokeWidth="0.8" />
          {/* Air inlet holes */}
          {[0,1,2].map((i) => (
            <rect key={i} x={173 + i * 13} y={278} width="8" height="5" rx="2"
              fill="#374151" opacity="0.65" />
          ))}
          {/* Barrel */}
          <rect x="178" y="230" width="32" height="40" rx="4"
            fill="#b0b8c5" stroke="#8892a0" strokeWidth="0.8" />
          {/* Barrel sheen */}
          <rect x="181" y="232" width="7" height="34" rx="3"
            fill="rgba(255,255,255,0.30)" />
          {/* Barrel tip */}
          <rect x="181" y="223" width="26" height="9" rx="3"
            fill="#6b7280" stroke="#475569" strokeWidth="0.6" />
          {/* Barrel tip opening highlight */}
          <rect x="184" y="225" width="10" height="5" rx="2"
            fill="rgba(255,255,255,0.20)" />
        </g>

        {/* Gas tube */}
        <path d="M 194 330 Q 310 330 310 360"
          fill="none" stroke="#5e6b7a" strokeWidth="5" strokeLinecap="round" />
        <path d="M 194 330 Q 310 330 310 360"
          fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" strokeLinecap="round" />

        {/* ══════════════════════════════════════
            FLAME ANIMATIONS
        ══════════════════════════════════════ */}
        <AnimatePresence>
          {flameLit && (
            <g>
              {/* Bunsen base-flame cone */}
              <motion.ellipse
                cx={FX} cy={FY - 3} rx={6} ry={5}
                fill={airCollarOpen ? "#1d4ed8" : "#ea580c"} fillOpacity="0.70"
                filter="url(#ft-soft)"
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: [0.6, 0.85, 0.65], scaleY: [1, 1.12, 1] }}
                exit={{ opacity: 0, scaleY: 0 }}
                transition={{ duration: 0.75, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Contaminant burn-off soot flame animation */}
              {burnOffActive && (
                <motion.g key="soot-burnoff">
                  <motion.ellipse
                    cx={FX} cy={FY - 24} rx={12} ry={28}
                    fill="#ea580c" fillOpacity="0.5"
                    animate={{ ry: [26, 32, 28], rx: [11, 14, 12] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                  <motion.path
                    d={`M ${FX - 8} ${FY} Q ${FX - 3} ${FY - 28} ${FX} ${FY - 40} Q ${FX + 3} ${FY - 28} ${FX + 8} ${FY} Z`}
                    fill="#d97706" fillOpacity="0.85"
                    animate={{ d: [
                      `M ${FX - 8} ${FY} Q ${FX - 3} ${FY - 28} ${FX} ${FY - 40} Q ${FX + 3} ${FY - 28} ${FX + 8} ${FY} Z`,
                      `M ${FX - 7} ${FY} Q ${FX - 4} ${FY - 26} ${FX} ${FY - 42} Q ${FX + 4} ${FY - 26} ${FX + 7} ${FY} Z`,
                      `M ${FX - 8} ${FY} Q ${FX - 3} ${FY - 28} ${FX} ${FY - 40} Q ${FX + 3} ${FY - 28} ${FX + 8} ${FY} Z`,
                    ]}}
                    transition={{ duration: 0.4, repeat: Infinity }}
                  />
                </motion.g>
              )}

              {/* Colored ion-emission flame */}
              {activeColor && !burnOffActive && (
                <motion.g
                  key="colored-flame"
                  initial={{ opacity: 0, scaleY: 0.25 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  exit={{ opacity: 0, scaleY: 0.25 }}
                  style={{ transformOrigin: `${FX}px ${FY}px` }}
                >
                  {/* Expanding spectral rings */}
                  {[0, 0.5, 1.0].map((delay, i) => (
                    <motion.circle key={i}
                      cx={FX} cy={FY - 34}
                      fill="none"
                      stroke={activeColor} strokeOpacity={0.55 * flameIntensity}
                      animate={{ r: [6, 20 + i * 8, 40 + i * 8], opacity: [0.8 * flameIntensity, 0.35 * flameIntensity, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay }}
                    />
                  ))}
                  {/* Outer luminous halo layers */}
                  {FLAME_LAYERS.map((layer, i) => (
                    <motion.ellipse key={i}
                      cx={FX} cy={FY + layer.cy}
                      fill={activeColor}
                      filter={i < 2 ? "url(#ft-deep-glow)" : i < 3 ? "url(#ft-glow)" : "url(#ft-soft)"}
                      animate={{ ry: layer.ry, rx: layer.rx, fillOpacity: layer.opacity.map((op) => op * flameIntensity) }}
                      transition={{ duration: layer.dur, repeat: Infinity, ease: "easeInOut", delay: layer.delay }}
                    />
                  ))}
                  {/* Bright white-hot core */}
                  <motion.ellipse
                    cx={FX} cy={FY - 8} rx={4} ry={6}
                    fill="white" fillOpacity={0.90 * flameIntensity}
                    filter="url(#ft-soft)"
                    animate={{ ry: [5, 7.5, 6], opacity: [0.88 * flameIntensity, 1.0 * flameIntensity, 0.90 * flameIntensity] }}
                    transition={{ duration: 0.52, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.g>
              )}

              {/* Default Bunsen flame (blue if open, yellow-orange soot if closed) */}
              {!activeColor && !burnOffActive && (
                <motion.g key={airCollarOpen ? "blue-flame" : "soot-flame"}>
                  <motion.ellipse
                    cx={FX} cy={FY - 24} rx={12} ry={28}
                    fill={airCollarOpen ? "#60a5fa" : "#f97316"} fillOpacity={airCollarOpen ? 0.16 : 0.45}
                    animate={{ ry: [26, 32, 28], rx: [11, 14, 12] }}
                    transition={{ duration: 0.92, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.path
                    d={`M ${FX - 8} ${FY} Q ${FX - 3} ${FY - 28} ${FX} ${FY - 40} Q ${FX + 3} ${FY - 28} ${FX + 8} ${FY} Z`}
                    fill={airCollarOpen ? "#3b82f6" : "#f97316"} fillOpacity={airCollarOpen ? 0.75 : 0.90}
                    animate={{ d: [
                      `M ${FX - 8} ${FY} Q ${FX - 3} ${FY - 28} ${FX} ${FY - 40} Q ${FX + 3} ${FY - 28} ${FX + 8} ${FY} Z`,
                      `M ${FX - 7} ${FY} Q ${FX - 4} ${FY - 26} ${FX} ${FY - 42} Q ${FX + 4} ${FY - 26} ${FX + 7} ${FY} Z`,
                      `M ${FX - 8} ${FY} Q ${FX - 3} ${FY - 28} ${FX} ${FY - 40} Q ${FX + 3} ${FY - 28} ${FX + 8} ${FY} Z`,
                    ]}}
                    transition={{ duration: 0.82, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.ellipse
                    cx={FX} cy={FY - 14} rx={5} ry={7}
                    fill={airCollarOpen ? "#93c5fd" : "#ffedd5"} fillOpacity={airCollarOpen ? 0.72 : 0.95}
                    animate={{ rx: [4.5, 6, 5], ry: [6.5, 8, 7] }}
                    transition={{ duration: 0.68, repeat: Infinity }}
                  />
                </motion.g>
              )}
            </g>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════
            NICHROME WIRE + LOOP (moves procedurally)
        ══════════════════════════════════════ */}
        <g>
          {/* Wooden handle */}
          <rect x="330" y="313" width="22" height="14" rx="4"
            fill="#92400e" stroke="#78350f" strokeWidth="0.9" />
          <rect x="332" y="315" width="8" height="8" rx="2"
            fill="rgba(255,255,255,0.16)" />
          {/* Metal ferrule */}
          <rect x="330" y="307" width="22" height="9" rx="3"
            fill="#6b7280" stroke="#4b5563" strokeWidth="0.7" />
          {/* Wire shaft */}
          <line x1="341" y1="307" x2="341" y2={LOOP_CY_REST + 10}
            stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="342.5" y1="307" x2="342.5" y2={LOOP_CY_REST + 10}
            stroke="rgba(255,255,255,0.36)" strokeWidth="0.9" />

          {/* Animated wire arm */}
          <motion.line
            x1="341" y1="272"
            initial={false}
            animate={{ x2: loopX, y2: loopY }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            stroke={loopClean ? "#9ca3af" : "#d97706"}
            strokeWidth="2" strokeLinecap="round"
          />

          {/* Animated loop circle */}
          <motion.circle
            initial={false}
            animate={{ cx: loopX, cy: loopY }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            r="10"
            fill="none"
            stroke={loopClean ? "#9ca3af" : "#d97706"}
            strokeWidth="2.2"
          />

          {/* Sample blob on loop when dipped */}
          {((loopDipped && selectedSample) || testInProgress) && profile && !burnOffActive && (
            <motion.circle
              animate={{ cx: loopX, cy: loopY }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              r="7"
              fill={testInProgress && currentFlameColor ? currentFlameColor : profile.flameColor}
              fillOpacity={testInProgress ? 0.90 : 0.52}
              stroke={profile.flameColor}
              strokeWidth="1.4"
              filter={testInProgress ? "url(#ft-soft)" : undefined}
              initial={{ opacity: 0, scale: 0 }}
            />
          )}

          {/* Residue on loop when contaminated */}
          {contaminated && !loopDipped && !burnOffActive && !hclDipped && (
            <motion.circle
              animate={{ cx: loopX, cy: loopY }}
              transition={{ duration: 0.5 }}
              r="8"
              fill="none"
              stroke="#d97706"
              strokeWidth="3.2"
              strokeDasharray="4 6"
            />
          )}
        </g>

        {/* ══════════════════════════════════════
            DILUTE HCl WASH BEAKER (left side)
        ══════════════════════════════════════ */}
        <g filter="url(#ft-shadow)" style={{ cursor: "pointer" }} onClick={handleHclClick}>
          {/* Beaker body */}
          <rect x="85" y="278" width="22" height="36" rx="3"
            fill="rgba(255,255,255,0.70)" stroke="rgba(148,163,184,0.50)" strokeWidth="1.2" />
          {/* Liquid fill */}
          <rect x="86.5" y="290" width="19" height="23" rx="1" fill="rgba(186,230,253,0.35)" />
          <text x="96" y="273" textAnchor="middle" fontSize="6" fill="#475569" fontWeight="700">Dil. HCl</text>
          {/* Sheen */}
          <rect x="87" y="279" width="3" height="34" rx="1" fill="rgba(255,255,255,0.45)" />
        </g>

        {/* Contamination warning */}
        {contaminated && (
          <g>
            <rect x="250" y="100" width="82" height="22" rx="6"
              fill="rgba(245,158,11,0.12)" stroke="rgba(245,158,11,0.55)" strokeWidth="1.1" />
            <text x="291" y="114" textAnchor="middle" fontSize="8.5" fill="#d97706" fontWeight="700">
              ⚠ Contaminated
            </text>
          </g>
        )}

        {/* ══════════════════════════════════════
            SAMPLE VIALS RACK (shifted right to fit)
        ══════════════════════════════════════ */}
        {/* Rack body */}
        <rect x="35" y="254" width="108" height="68" rx="7"
          fill="rgba(255,255,255,0.90)" stroke="rgba(148,163,184,0.40)" strokeWidth="1.3"
          filter="url(#ft-shadow)" />
        <rect x="35" y="254" width="108" height="11" rx="7" fill="#f1f5f9" />
        <text x="89" y="263.5" textAnchor="middle" fontSize="7" fill="#475569" fontWeight="700" letterSpacing="0.08em">
          METAL SALTS
        </text>
        {/* Rack slots */}
        {SAMPLES_LIST.map((s, i) => {
          const x = 41 + i * 14;
          const isSelected = selectedSample === s.id;
          return (
            <g key={s.id} style={{ cursor: "pointer" }} onClick={() => handleVialClick(s.id)}>
              {/* vial body */}
              <rect x={x} y={276} width="11" height="36" rx="3"
                fill={isSelected ? `${s.flameColor}40` : "rgba(255,255,255,0.94)"}
                stroke={isSelected ? s.flameColor : "rgba(148,163,184,0.45)"}
                strokeWidth={isSelected ? 1.6 : 0.9} />
              {/* liquid fill */}
              <rect x={x + 1} y={284} width="9" height="24" rx="1.5"
                fill={s.flameColor} fillOpacity={isSelected ? 0.55 : 0.25} />
              {/* cap */}
              <rect x={x} y={274} width="11" height="6" rx="2"
                fill={isSelected ? s.flameColor : "#94a3b8"}
                fillOpacity={isSelected ? 0.85 : 0.65} />
              {/* sheen */}
              <rect x={x + 2} y={278} width="2.5" height="28" rx="1"
                fill="rgba(255,255,255,0.45)" />
              {/* element label below */}
              <text x={x + 5.5} y={316} textAnchor="middle" fontSize="5.5"
                fill={isSelected ? "#0f172a" : "#64748b"}
                fontWeight={isSelected ? "700" : "400"}>
                {s.ion.split("⁺")[0].split("²")[0]}
              </text>
            </g>
          );
        })}

        {/* ══════════════════════════════════════
            TEST HISTORY
        ══════════════════════════════════════ */}
        {testHistory.length > 0 && (
          <g transform="translate(35, 0)">
            <text x="0" y="248" fontSize="6.5" fill="#64748b" fontWeight="700" letterSpacing="0.10em">HISTORY</text>
            {testHistory.slice(0, 10).map((rec, i) => (
              <g key={rec.id}>
                <circle cx={i * 15 + 6} cy={240} r={6}
                  fill={rec.flameColor} fillOpacity={rec.contaminated ? 0.38 : 0.90}
                  stroke={rec.contaminated ? "#d97706" : "rgba(255,255,255,0.22)"} strokeWidth="1.5" />
                {rec.contaminated && (
                  <text x={i * 15 + 6} y={244} textAnchor="middle" fontSize="7" fill="#d97706" fontWeight="700">!</text>
                )}
              </g>
            ))}
          </g>
        )}

        {/* Procedural local error overlay */}
        {localError && (
          <g>
            <rect x="114" y="254" width="176" height="26" rx="6"
              fill="rgba(239,68,68,0.96)" stroke="#f87171" strokeWidth="1" />
            <text x="202" y="270" textAnchor="middle" fontSize="8" fill="white" fontWeight="700">
              {localError}
            </text>
          </g>
        )}

        {/* Status text */}
        {!flameLit && (
          <text x="202" y="342" textAnchor="middle" fontSize="8.5" fill="#475569" fontWeight="700" style={{ animation: "blink-dot 1.8s ease-in-out infinite" }}>
            🔥 Click Bunsen burner to light it
          </text>
        )}
        {flameLit && !selectedSample && !contaminated && !hclDipped && (
          <text x="202" y="342" textAnchor="middle" fontSize="8.5" fill="#7c3aed" fontWeight="700" style={{ animation: "blink-dot 1.8s ease-in-out infinite" }}>
            🖐 Click a sample vial in the rack to dip loop
          </text>
        )}
        {flameLit && contaminated && !hclDipped && !burnOffActive && (
          <text x="202" y="342" textAnchor="middle" fontSize="8.5" fill="#d97706" fontWeight="700" style={{ animation: "blink-dot 1.8s ease-in-out infinite" }}>
            🧪 Click Dil. HCl beaker to wash loop
          </text>
        )}
        {flameLit && hclDipped && (
          <text x="202" y="342" textAnchor="middle" fontSize="8.5" fill="#2563eb" fontWeight="700" style={{ animation: "blink-dot 1.8s ease-in-out infinite" }}>
            🔥 Click burner flame to burn off impurities
          </text>
        )}
        {burnOffActive && (
          <text x="202" y="342" textAnchor="middle" fontSize="8.5" fill="#d97706" fontWeight="700">
            ⏳ Burning off contaminants...
          </text>
        )}
        {flameLit && loopDipped && selectedSample && !testInProgress && (
          <text x="202" y="342" textAnchor="middle" fontSize="8.5" fill="#059669" fontWeight="700" style={{ animation: "blink-dot 1.8s ease-in-out infinite" }}>
            🔥 Click burner flame to test emission
          </text>
        )}
        {testInProgress && profile && (
          <g transform="translate(0, 10)">
            <motion.text
              x="202" y="322" textAnchor="middle" fontSize="9"
              fill={currentFlameColor ?? "#22c55e"} fontWeight="700"
              animate={{ opacity: [1, 0.55, 1] }}
              transition={{ duration: 0.85, repeat: Infinity }}
            >
              {profile.colorName} · {profile.wavelength}
            </motion.text>
            <motion.text
              x="202" y="331" textAnchor="middle" fontSize="7.5"
              fill="#64748b" fontWeight="600"
            >
              {profile.ion} ion emission
            </motion.text>
          </g>
        )}
      </svg>
    </div>
  );
}
