"use client";

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
}

const SAMPLES_LIST = Object.values(FLAME_SAMPLES);

// Flame layer definitions — concentric ellipses for realistic layered combustion
const FLAME_LAYERS = [
  { ry: [52, 64, 56], rx: [40, 48, 44], opacity: [0.05, 0.10, 0.07], delay: 0,    dur: 1.4, cy: -44 },
  { ry: [36, 44, 39], rx: [28, 35, 30], opacity: [0.14, 0.24, 0.17], delay: 0.20, dur: 1.1, cy: -28 },
  { ry: [22, 29, 25], rx: [16, 21, 18], opacity: [0.52, 0.72, 0.60], delay: 0.09, dur: 0.88, cy: -16 },
  { ry: [12, 17, 14], rx: [7,  11, 9],  opacity: [0.90, 1.00, 0.94], delay: 0,    dur: 0.65, cy: -5  },
];

// Viewport constants
const VW = 420;
const VH = 380;

// Flame base (barrel tip of Bunsen)
const FX = 194;
const FY = 228;

// Wire loop at rest position
const LOOP_CX_REST = 290;
const LOOP_CY_REST = 168;

export default function FlameTestWorkspace({
  flameLit, selectedSample, loopDipped,
  loopClean, testInProgress, currentFlameColor,
  contaminated, testHistory,
}: Props) {
  const activeColor = testInProgress && currentFlameColor ? currentFlameColor : null;
  const profile     = selectedSample ? FLAME_SAMPLES[selectedSample] : null;

  const loopX = loopDipped || testInProgress ? FX + 8 : LOOP_CX_REST;
  const loopY = loopDipped || testInProgress ? FY - 18 : LOOP_CY_REST;

  return (
    <div
      className="relative rounded-3xl overflow-hidden select-none"
      style={{
        aspectRatio: `${VW}/${VH}`,
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
        viewBox={`0 0 ${VW} ${VH}`}
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
        <rect x="0" y="328" width={VW} height={VH - 328} fill="#c8d0db" />
        <rect x="0" y="326" width={VW} height="5" fill="#dde4ef" />
        <rect x="0" y="326" width={VW} height="2" fill="rgba(255,255,255,0.52)" />

        {/* ══════════════════════════════════════
            OBSERVATION CHAMBER — premium scientific
        ══════════════════════════════════════ */}
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

        {/* ══════════════════════════════════════
            BUNSEN BURNER
        ══════════════════════════════════════ */}
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
              {/* Blue Bunsen base-flame cone */}
              <motion.ellipse
                cx={FX} cy={FY - 3} rx={6} ry={5}
                fill="#1d4ed8" fillOpacity="0.70"
                filter="url(#ft-soft)"
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: [0.6, 0.85, 0.65], scaleY: [1, 1.12, 1] }}
                exit={{ opacity: 0, scaleY: 0 }}
                transition={{ duration: 0.75, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Colored ion-emission flame */}
              {activeColor ? (
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
                      stroke={activeColor} strokeOpacity="0.55"
                      animate={{ r: [6, 20 + i * 8, 40 + i * 8], opacity: [0.8, 0.35, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay }}
                    />
                  ))}
                  {/* Outer luminous halo layers */}
                  {FLAME_LAYERS.map((layer, i) => (
                    <motion.ellipse key={i}
                      cx={FX} cy={FY + layer.cy}
                      fill={activeColor}
                      filter={i < 2 ? "url(#ft-deep-glow)" : i < 3 ? "url(#ft-glow)" : "url(#ft-soft)"}
                      animate={{ ry: layer.ry, rx: layer.rx, fillOpacity: layer.opacity }}
                      transition={{ duration: layer.dur, repeat: Infinity, ease: "easeInOut", delay: layer.delay }}
                    />
                  ))}
                  {/* Bright white-hot core */}
                  <motion.ellipse
                    cx={FX} cy={FY - 8} rx={4} ry={6}
                    fill="white" fillOpacity="0.90"
                    filter="url(#ft-soft)"
                    animate={{ ry: [5, 7.5, 6], opacity: [0.88, 1.0, 0.90] }}
                    transition={{ duration: 0.52, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.g>
              ) : (
                /* Default blue Bunsen flame */
                <motion.g key="blue-flame">
                  <motion.ellipse
                    cx={FX} cy={FY - 24} rx={12} ry={28}
                    fill="#60a5fa" fillOpacity="0.16"
                    animate={{ ry: [26, 32, 28], rx: [11, 14, 12] }}
                    transition={{ duration: 0.92, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.path
                    d={`M ${FX - 8} ${FY} Q ${FX - 3} ${FY - 28} ${FX} ${FY - 40} Q ${FX + 3} ${FY - 28} ${FX + 8} ${FY} Z`}
                    fill="#3b82f6" fillOpacity="0.75"
                    animate={{ d: [
                      `M ${FX - 8} ${FY} Q ${FX - 3} ${FY - 28} ${FX} ${FY - 40} Q ${FX + 3} ${FY - 28} ${FX + 8} ${FY} Z`,
                      `M ${FX - 7} ${FY} Q ${FX - 4} ${FY - 26} ${FX} ${FY - 42} Q ${FX + 4} ${FY - 26} ${FX + 7} ${FY} Z`,
                      `M ${FX - 8} ${FY} Q ${FX - 3} ${FY - 28} ${FX} ${FY - 40} Q ${FX + 3} ${FY - 28} ${FX + 8} ${FY} Z`,
                    ]}}
                    transition={{ duration: 0.82, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.ellipse
                    cx={FX} cy={FY - 14} rx={5} ry={7}
                    fill="#93c5fd" fillOpacity="0.72"
                    animate={{ rx: [4.5, 6, 5], ry: [6.5, 8, 7] }}
                    transition={{ duration: 0.68, repeat: Infinity }}
                  />
                </motion.g>
              )}
            </g>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════
            NICHROME WIRE + LOOP
        ══════════════════════════════════════ */}
        {/* Wooden handle */}
        <rect x="330" y="313" width="22" height="14" rx="4"
          fill="#92400e" stroke="#78350f" strokeWidth="0.9" />
        <rect x="332" y="315" width="8" height="8" rx="2"
          fill="rgba(255,255,255,0.16)" />
        {/* Metal ferrule */}
        <rect x="330" y="307" width="22" height="9" rx="3"
          fill="#6b7280" stroke="#4b5563" strokeWidth="0.7" />
        {/* Wire shaft (vertical part) */}
        <line x1="341" y1="307" x2="341" y2={LOOP_CY_REST + 10}
          stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="342.5" y1="307" x2="342.5" y2={LOOP_CY_REST + 10}
          stroke="rgba(255,255,255,0.36)" strokeWidth="0.9" />

        {/* Animated wire arm */}
        <motion.line
          x1="341" y1="272"
          animate={{ x2: loopX, y2: loopY }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          stroke={loopClean ? "#9ca3af" : "#d97706"}
          strokeWidth="2" strokeLinecap="round"
        />

        {/* Animated loop circle */}
        <motion.circle
          animate={{ cx: loopX, cy: loopY }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          r="10"
          fill="none"
          stroke={loopClean ? "#9ca3af" : "#d97706"}
          strokeWidth="2.2"
        />

        {/* Sample blob on loop when dipped */}
        {(loopDipped || testInProgress) && profile && (
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

        {/* Contamination warning */}
        {contaminated && (
          <g>
            <rect x="278" y="120" width="82" height="22" rx="6"
              fill="rgba(245,158,11,0.12)" stroke="rgba(245,158,11,0.55)" strokeWidth="1.1" />
            <text x="319" y="134" textAnchor="middle" fontSize="8.5" fill="#d97706" fontWeight="700">
              ⚠ Contaminated
            </text>
          </g>
        )}

        {/* ══════════════════════════════════════
            SAMPLE VIALS RACK
        ══════════════════════════════════════ */}
        {/* Rack body */}
        <rect x="10" y="254" width="108" height="68" rx="7"
          fill="rgba(255,255,255,0.90)" stroke="rgba(148,163,184,0.40)" strokeWidth="1.3"
          filter="url(#ft-shadow)" />
        <rect x="10" y="254" width="108" height="11" rx="7" fill="#f1f5f9" />
        <text x="64" y="263.5" textAnchor="middle" fontSize="7" fill="#475569" fontWeight="700" letterSpacing="0.10em">
          METAL SALT SAMPLES
        </text>
        {/* Rack slots */}
        {SAMPLES_LIST.map((s, i) => {
          const x = 16 + i * 14;
          const isSelected = selectedSample === s.id;
          return (
            <g key={s.id}>
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
            TEST HISTORY + STATUS
        ══════════════════════════════════════ */}
        {testHistory.length > 0 && (
          <>
            <text x="12" y="248" fontSize="6.5" fill="#64748b" fontWeight="700" letterSpacing="0.10em">HISTORY</text>
            {testHistory.slice(0, 13).map((rec, i) => (
              <g key={rec.id}>
                <circle cx={12 + i * 15} cy={240} r={6}
                  fill={rec.flameColor} fillOpacity={rec.contaminated ? 0.38 : 0.90}
                  stroke={rec.contaminated ? "#d97706" : "rgba(255,255,255,0.22)"} strokeWidth="1.5" />
                {rec.contaminated && (
                  <text x={12 + i * 15} y={244} textAnchor="middle" fontSize="7" fill="#d97706" fontWeight="700">!</text>
                )}
              </g>
            ))}
          </>
        )}

        {/* Status text */}
        {!flameLit && (
          <text x={VW / 2} y={VH - 18} textAnchor="middle" fontSize="10" fill="#475569" fontWeight="500">
            Light the Bunsen burner to begin
          </text>
        )}
        {flameLit && !selectedSample && (
          <text x={VW / 2} y={VH - 18} textAnchor="middle" fontSize="10" fill="#475569" fontWeight="500">
            Select a metal salt sample from the rack
          </text>
        )}
        {testInProgress && profile && (
          <motion.g>
            <motion.text
              x={VW / 2} y={VH - 22} textAnchor="middle" fontSize="10"
              fill={currentFlameColor ?? "#22c55e"} fontWeight="700"
              animate={{ opacity: [1, 0.55, 1] }}
              transition={{ duration: 0.85, repeat: Infinity }}
            >
              {profile.colorName} · {profile.wavelength}
            </motion.text>
            <motion.text
              x={VW / 2} y={VH - 10} textAnchor="middle" fontSize="8.5"
              fill="#64748b" fontWeight="500"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            >
              {profile.ion} ion emission
            </motion.text>
          </motion.g>
        )}
      </svg>
    </div>
  );
}
