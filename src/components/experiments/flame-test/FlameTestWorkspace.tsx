"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { FlameTestSampleId, FlameTestRecord } from "@/lib/engine/types";
import { FLAME_SAMPLES } from "@/lib/engine/flame-test-engine";

interface Props {
  flameLit:          boolean;
  selectedSample:    FlameTestSampleId | null;
  loopDipped:        boolean;
  loopClean:         boolean;
  testInProgress:    boolean;   // status === "running"
  currentFlameColor: string | null;
  contaminated:      boolean;
  testHistory:       FlameTestRecord[];
}

const SAMPLES_LIST = Object.values(FLAME_SAMPLES);

// Wire loop tip position
const LOOP_CX = 200;
const LOOP_CY = 152;

export default function FlameTestWorkspace({
  flameLit,
  selectedSample,
  loopDipped,
  loopClean,
  testInProgress,
  currentFlameColor,
  contaminated,
  testHistory,
}: Props) {
  const activeColor = testInProgress && currentFlameColor ? currentFlameColor : null;
  const profile = selectedSample ? FLAME_SAMPLES[selectedSample] : null;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--lab-glass-heavy)",
        border: "1px solid var(--lab-glass-border)",
        boxShadow: "var(--lab-shadow-md)",
      }}
    >
      <svg
        viewBox="0 0 400 360"
        width="100%"
        style={{ display: "block" }}
        aria-label="Flame test apparatus"
        role="img"
      >
        {/* ── Lab bench background ── */}
        <rect x="0" y="310" width="400" height="50" fill="#cbd5e1" rx="0" />
        <rect x="0" y="306" width="400" height="8"  fill="#94a3b8" />

        {/* ── Sample vials rack ── */}
        <rect x="18" y="260" width="120" height="48" rx="4" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
        <text x="78" y="276" textAnchor="middle" fontSize="7" fill="#64748b" fontWeight="600">SAMPLES</text>

        {/* Render sample vials */}
        {SAMPLES_LIST.map((s, i) => {
          const x    = 24 + i * 16;
          const isSelected = selectedSample === s.id;
          return (
            <g key={s.id}>
              {/* Vial body */}
              <rect x={x} y={282} width="12" height="22" rx="2"
                fill={isSelected ? s.flameColor : "#f8fafc"}
                fillOpacity={isSelected ? 0.35 : 1}
                stroke={isSelected ? s.flameColor : "#94a3b8"}
                strokeWidth={isSelected ? 1.5 : 0.8} />
              {/* Vial cap */}
              <rect x={x+1} y={280} width="10" height="4" rx="1"
                fill={isSelected ? s.flameColor : "#64748b"}
                fillOpacity={isSelected ? 0.7 : 1} />
              {/* Ion label */}
              <text x={x + 6} y={299} textAnchor="middle" fontSize="5" fill={isSelected ? "#1e293b" : "#94a3b8"} fontWeight={isSelected ? "700" : "400"}>
                {s.ion.split("⁺")[0].split("²")[0]}
              </text>
            </g>
          );
        })}

        {/* ── Bunsen burner ── */}
        {/* Base */}
        <rect x="168" y="282" width="32" height="28" rx="4" fill="#64748b" />
        {/* Air hole collar */}
        <rect x="172" y="262" width="24" height="22" rx="3" fill="#475569" />
        {/* Barrel */}
        <rect x="177" y="222" width="14" height="42" rx="2" fill="#334155" />
        {/* Barrel tip */}
        <rect x="179" y="215" width="10" height="10" rx="1" fill="#1e293b" />

        {/* Gas tube */}
        <path d="M 184 310 Q 280 310 280 340" fill="none" stroke="#64748b" strokeWidth="4" />

        {/* ── Flame ── */}
        <AnimatePresence>
          {flameLit && (
            <g>
              {/* Base blue flame (always present when lit) */}
              <motion.ellipse
                cx="184" cy="208" rx="6" ry="4"
                fill="#60a5fa"
                fillOpacity="0.5"
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 0.5, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0 }}
              />

              {/* Coloured flame (during test) */}
              {activeColor ? (
                <motion.g
                  key="colored-flame"
                  initial={{ opacity: 0, scaleY: 0.3 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  exit={{ opacity: 0, scaleY: 0.3 }}
                  style={{ transformOrigin: "184px 215px" }}
                >
                  {/* Outer glow */}
                  <motion.ellipse
                    cx="184" cy="185" rx="28" ry="38"
                    fill={activeColor}
                    fillOpacity="0.15"
                    animate={{ ry: [36, 42, 38], opacity: [0.12, 0.2, 0.15] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  {/* Mid flame */}
                  <motion.ellipse
                    cx="184" cy="188" rx="18" ry="28"
                    fill={activeColor}
                    fillOpacity="0.5"
                    animate={{ ry: [26, 32, 28], cx: [183, 185, 184] }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                  />
                  {/* Inner bright core */}
                  <motion.ellipse
                    cx="184" cy="196" rx="9" ry="16"
                    fill={activeColor}
                    fillOpacity="0.9"
                    animate={{ ry: [15, 18, 16] }}
                    transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut" }}
                  />
                  {/* Hot white core */}
                  <ellipse cx="184" cy="204" rx="4" ry="6" fill="white" fillOpacity="0.7" />
                </motion.g>
              ) : (
                <motion.g key="blue-flame">
                  {/* Normal blue Bunsen flame */}
                  <motion.path
                    d="M 178 215 Q 181 195 184 183 Q 187 195 190 215 Z"
                    fill="#3b82f6"
                    fillOpacity="0.7"
                    animate={{ d: ["M 178 215 Q 181 195 184 183 Q 187 195 190 215 Z",
                                   "M 179 215 Q 182 192 184 180 Q 186 192 189 215 Z",
                                   "M 178 215 Q 181 195 184 183 Q 187 195 190 215 Z"] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.ellipse
                    cx="184" cy="210" rx="5" ry="3"
                    fill="#93c5fd"
                    fillOpacity="0.6"
                    animate={{ rx: [4, 6, 5] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                </motion.g>
              )}
            </g>
          )}
        </AnimatePresence>

        {/* ── Wire handle + loop ── */}
        {/* Handle (nichrome wire + rod) */}
        <line x1="240" y1="308" x2="240" y2="168" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="232" y="305" width="16" height="6" rx="2" fill="#64748b" />

        {/* Wire loop stem — angled toward flame when dipped/testing */}
        <motion.line
          x1="240" y1="250"
          x2={loopDipped || testInProgress ? "202" : "200"}
          y2={loopDipped || testInProgress ? "165" : "155"}
          stroke={loopClean ? "#94a3b8" : "#f59e0b"}
          strokeWidth="1.8"
          strokeLinecap="round"
          animate={{
            x2: loopDipped || testInProgress ? 202 : 200,
            y2: loopDipped || testInProgress ? 165 : 155,
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />

        {/* Loop circle */}
        <motion.circle
          cx={LOOP_CX}
          cy={LOOP_CY}
          r="9"
          fill="none"
          stroke={loopClean ? "#94a3b8" : "#f59e0b"}
          strokeWidth="2"
          animate={{
            cx: loopDipped || testInProgress ? 202 : LOOP_CX,
            cy: loopDipped || testInProgress ? 162 : LOOP_CY,
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />

        {/* Sample coating on loop when dipped */}
        {(loopDipped || testInProgress) && profile && (
          <motion.circle
            cx={202}
            cy={162}
            r="7"
            fill={testInProgress && currentFlameColor ? currentFlameColor : profile.flameColor}
            fillOpacity={testInProgress ? 0.8 : 0.4}
            stroke={profile.flameColor}
            strokeWidth="1"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          />
        )}

        {/* Contamination warning badge */}
        {contaminated && (
          <g>
            <rect x="215" y="135" width="62" height="18" rx="4" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
            <text x="246" y="147" textAnchor="middle" fontSize="8" fill="#92400e" fontWeight="600">⚠ Contaminated</text>
          </g>
        )}

        {/* ── Test history dots ── */}
        <text x="20" y="248" fontSize="7" fill="#64748b" fontWeight="600">TEST HISTORY</text>
        {testHistory.slice(0, 12).map((rec, i) => (
          <g key={rec.id}>
            <circle
              cx={22 + i * 18}
              cy={240}
              r={6}
              fill={rec.flameColor}
              fillOpacity={rec.contaminated ? 0.4 : 0.85}
              stroke={rec.contaminated ? "#f59e0b" : "white"}
              strokeWidth="1.5"
            />
            {rec.contaminated && (
              <text x={22 + i * 18} y={244} textAnchor="middle" fontSize="7" fill="#92400e">!</text>
            )}
          </g>
        ))}

        {/* ── Status labels ── */}
        {!flameLit && (
          <text x="200" y="340" textAnchor="middle" fontSize="10" fill="#94a3b8">
            Light the Bunsen burner to begin
          </text>
        )}
        {flameLit && !selectedSample && (
          <text x="200" y="340" textAnchor="middle" fontSize="10" fill="#64748b">
            Select a metal salt sample →
          </text>
        )}
        {testInProgress && profile && (
          <motion.text
            x="200" y="340"
            textAnchor="middle"
            fontSize="11"
            fill={currentFlameColor ?? "#22c55e"}
            fontWeight="700"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            {profile.colorName} flame — {profile.wavelength}
          </motion.text>
        )}
      </svg>
    </div>
  );
}
