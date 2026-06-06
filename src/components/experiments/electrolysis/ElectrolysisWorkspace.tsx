"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BubbleParticles from "./BubbleParticles";
import type { ElectrodeState, ElectrolyteId } from "@/lib/engine/types";
import { ELECTROLYTES, GAS_TUBE_CAPACITY_ML } from "@/lib/engine/electrolysis-engine";

// ── SVG layout ────────────────────────────────────────────────────────────────
const W = 480;
const H = 500;

const LTUBE  = { x: 44,  y: 28,  w: 96,  h: 290, rx: 12 };
const RTUBE  = { x: 340, y: 28,  w: 96,  h: 290, rx: 12 };
const LI     = { x: LTUBE.x + 11, y: LTUBE.y + 15, w: LTUBE.w - 22, h: LTUBE.h - 26 };
const RI     = { x: RTUBE.x + 11, y: RTUBE.y + 15, w: RTUBE.w - 22, h: RTUBE.h - 26 };
const BRIDGE = {
  x: LTUBE.x + LTUBE.w - 1,
  y: LTUBE.y + LTUBE.h - 38,
  w: RTUBE.x - (LTUBE.x + LTUBE.w) + 2,
  h: 38,
};
const LE = { x: LTUBE.x + LTUBE.w / 2 - 8, y: LTUBE.y + LTUBE.h - 82, w: 16, h: 76 };
const RE = { x: RTUBE.x + RTUBE.w / 2 - 8, y: RTUBE.y + RTUBE.h - 82, w: 16, h: 76 };

const WIRE_Y  = LTUBE.y - 22;
const LCENTER = LTUBE.x + LTUBE.w / 2;
const RCENTER = RTUBE.x + RTUBE.w / 2;
const BATT    = { x: W / 2 - 70, y: H - 78, w: 140, h: 54 };

const LCENTER_PCT = (LCENTER / W) * 100;
const RCENTER_PCT = (RCENTER / W) * 100;

const ANODE_TUBE_CAPACITY_ML = GAS_TUBE_CAPACITY_ML * 0.6;
const MIN_LIQ_FRAC = 0.22;

const GAS_COLOR: Record<string, string> = {
  "H₂":  "rgba(186,230,253,0.68)",
  "O₂":  "rgba(254,240,138,0.60)",
  "Cl₂": "rgba(217,249,157,0.68)",
};

interface Props {
  electrolyte:     ElectrolyteId | null;
  anode:           ElectrodeState;
  cathode:         ElectrodeState;
  circuitComplete: boolean;
  current:         number;
  voltage:         number;
  runTimeSeconds:  number;
  isRunning:       boolean;
  anodeGasMl:      number;
  cathodeGasMl:    number;
}

export default function ElectrolysisWorkspace({
  electrolyte, anode, cathode, circuitComplete, current, voltage,
  isRunning, anodeGasMl, cathodeGasMl,
}: Props) {
  const profile  = electrolyte ? ELECTROLYTES[electrolyte] : null;
  const liqColor = profile?.liquidColor ?? "#0c2040";

  const cathodeColor = useMemo(() => {
    if (electrolyte === "copper-sulfate" && cathode.gasMoles > 0.0001) {
      const depositPct = Math.min(1, cathode.gasMoles / 0.001);
      const r = Math.round(55 + depositPct * 145);
      const g = Math.round(71 + depositPct * 46);
      const b = Math.round(79 - depositPct * 49);
      return `rgb(${r},${g},${b})`;
    }
    return cathode.material === "carbon" ? "#1a2535" : "#c0c8d8";
  }, [electrolyte, cathode.gasMoles, cathode.material]);

  const cathFrac  = Math.min(1, cathodeGasMl / GAS_TUBE_CAPACITY_ML);
  const anodeFrac = Math.min(1, anodeGasMl   / ANODE_TUBE_CAPACITY_ML);
  const rawCathLiqFrac  = 1 - cathFrac;
  const rawAnodeLiqFrac = 1 - anodeFrac;
  const cathLiqFrac  = electrolyte ? Math.max(MIN_LIQ_FRAC, rawCathLiqFrac)  : 0;
  const anodeLiqFrac = electrolyte ? Math.max(MIN_LIQ_FRAC, rawAnodeLiqFrac) : 0;

  const lGasH = cathFrac * LI.h;
  const rGasH = anodeFrac * RI.h;
  const lLiqH = cathLiqFrac * LI.h;
  const rLiqH = anodeLiqFrac * RI.h;
  const lLiqY = LI.y + LI.h - lLiqH;
  const rLiqY = RI.y + RI.h - rLiqH;

  const cathGasColor  = cathode.gasFormula ? (GAS_COLOR[cathode.gasFormula] ?? "rgba(186,230,253,0.65)") : "rgba(186,230,253,0.65)";
  const anodeGasColor = anode.gasFormula   ? (GAS_COLOR[anode.gasFormula]  ?? "rgba(254,240,138,0.60)") : "rgba(254,240,138,0.60)";

  const flowStyle     = isRunning ? { strokeDasharray: "8 5", animation: "flow-dashes 0.55s linear infinite"         } : { strokeDasharray: "8 5" };
  const cathFlowStyle = isRunning ? { strokeDasharray: "8 5", animation: "flow-dashes 0.55s linear infinite reverse" } : { strokeDasharray: "8 5" };

  const copperDepositH = electrolyte === "copper-sulfate" && cathode.gasMoles > 0.0001
    ? Math.min(LE.h * 0.7, Math.max(2, (cathode.gasMoles / 0.0015) * LE.h * 0.7))
    : 0;

  return (
    <div
      className="relative select-none rounded-3xl overflow-hidden"
      style={{
        aspectRatio: `${W}/${H + 30}`,
        width:       "100%",
        height:      "auto",
        maxHeight:   "100%",
        background:
          "radial-gradient(ellipse at 50% 20%, rgba(8,145,178,0.12) 0%, transparent 50%)," +
          "linear-gradient(180deg, #f0fcff 0%, #e8f9ff 40%, #f0faff 100%)",
        boxShadow:
          "0 20px 60px rgba(15,23,42,0.08), " +
          "0 4px 12px rgba(15,23,42,0.04), " +
          "0 0 0 1px rgba(8,145,178,0.22) inset",
        border: "1px solid rgba(8,145,178,0.18)",
      }}
    >
      {/* Dot grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.15) 1px, transparent 1px)",
          backgroundSize:  "22px 22px",
        }}
      />
      {/* Top ambient glow */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          top: "-48px", left: "50%", transform: "translateX(-50%)",
          width: "288px", height: "192px",
          background: "radial-gradient(ellipse at center, rgba(8,145,178,0.08) 0%, transparent 70%)",
        }}
      />

      <svg viewBox={`0 -30 ${W} ${H + 30}`} className="w-full h-full relative z-10">
        <defs>
          <clipPath id="e-ltube-clip">
            <rect x={LI.x} y={LI.y} width={LI.w} height={LI.h} />
          </clipPath>
          <clipPath id="e-rtube-clip">
            <rect x={RI.x} y={RI.y} width={RI.w} height={RI.h} />
          </clipPath>

          <linearGradient id="e-tube-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.22)" />
            <stop offset="32%"  stopColor="rgba(255,255,255,0.04)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.10)" />
          </linearGradient>
          <linearGradient id="e-liq-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.22)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.05)" />
          </linearGradient>
          <linearGradient id="e-electrode-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.22)" />
            <stop offset="40%"  stopColor="rgba(255,255,255,0.04)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.14)" />
          </linearGradient>
          <linearGradient id="e-copper-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(255,180,100,0.50)" />
            <stop offset="50%"  stopColor="rgba(200,100,50,0.80)" />
            <stop offset="100%" stopColor="rgba(160,70,30,0.60)" />
          </linearGradient>

          <filter id="e-drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="rgba(0,0,0,0.45)" />
          </filter>
          <filter id="e-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="e-electrode-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ══ LEFT TUBE (Cathode −) ══ */}
        <rect x={LTUBE.x} y={LTUBE.y} width={LTUBE.w} height={LTUBE.h} rx={LTUBE.rx}
          fill="rgba(255,255,255,0.45)" stroke="rgba(71,85,105,0.45)" strokeWidth="1.5"
          filter="url(#e-drop-shadow)" />

        {electrolyte && lLiqH > 0 && (
          <motion.rect x={LI.x} width={LI.w} clipPath="url(#e-ltube-clip)"
            fill={liqColor} fillOpacity={0.86}
            animate={{ y: lLiqY, height: lLiqH }}
            transition={{ type: "spring", stiffness: 26, damping: 10 }}
          />
        )}

        <AnimatePresence>
          {cathodeGasMl > 0.05 && (
            <motion.rect key="l-gas" x={LI.x} width={LI.w} y={LI.y}
              clipPath="url(#e-ltube-clip)" fill={cathGasColor}
              initial={{ height: 0 }}
              animate={{ height: Math.max(2, lGasH) }}
              transition={{ type: "spring", stiffness: 20, damping: 10 }}
            />
          )}
        </AnimatePresence>

        {electrolyte && lLiqH > 4 && (
          <motion.path
            animate={{ d: `M ${LI.x} ${lLiqY} Q ${LI.x + LI.w / 2} ${lLiqY + 5} ${LI.x + LI.w} ${lLiqY}` }}
            transition={{ type: "spring", stiffness: 26, damping: 10 }}
            fill="rgba(255,255,255,0.12)" stroke="rgba(99,179,237,0.35)" strokeWidth="1"
            clipPath="url(#e-ltube-clip)"
          />
        )}

        {electrolyte && (
          <rect x={LI.x} y={LI.y} width={LI.w} height={LI.h}
            fill="url(#e-liq-grad)" clipPath="url(#e-ltube-clip)" />
        )}

        <rect x={LTUBE.x} y={LTUBE.y} width={LTUBE.w} height={LTUBE.h} rx={LTUBE.rx}
          fill="url(#e-tube-sheen)" />
        <rect x={LTUBE.x + 4} y={LTUBE.y + 10} width={5} height={LTUBE.h - 30} rx={2.5}
          fill="rgba(255,255,255,0.13)" />

        {cathodeGasMl >= 0.1 && (
          <g filter="url(#e-drop-shadow)">
            <rect x={LI.x - 3} y={LI.y + 6} width={LI.w + 6} height={22} rx={6}
              fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.2" />
            <text x={LI.x + LI.w / 2} y={LI.y + 20} fontSize="10" fontWeight="800"
              fill="#2563eb" textAnchor="middle" fontFamily="monospace">
              {cathodeGasMl.toFixed(2)} mL
            </text>
          </g>
        )}

        {[0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}>
            <line x1={LTUBE.x + LTUBE.w} y1={LI.y + f * LI.h}
              x2={LTUBE.x + LTUBE.w + 8} y2={LI.y + f * LI.h}
              stroke="rgba(99,179,237,0.35)" strokeWidth="0.9" />
            <text x={LTUBE.x + LTUBE.w + 11} y={LI.y + f * LI.h + 3.5}
              fontSize="7.5" fill="#3b6690">
              {(GAS_TUBE_CAPACITY_ML * (1 - f)).toFixed(0)}
            </text>
          </g>
        ))}

        {/* ══ RIGHT TUBE (Anode +) ══ */}
        <rect x={RTUBE.x} y={RTUBE.y} width={RTUBE.w} height={RTUBE.h} rx={RTUBE.rx}
          fill="rgba(255,255,255,0.45)" stroke="rgba(71,85,105,0.45)" strokeWidth="1.5"
          filter="url(#e-drop-shadow)" />

        {electrolyte && rLiqH > 0 && (
          <motion.rect x={RI.x} width={RI.w} clipPath="url(#e-rtube-clip)"
            fill={liqColor} fillOpacity={0.86}
            animate={{ y: rLiqY, height: rLiqH }}
            transition={{ type: "spring", stiffness: 26, damping: 10 }}
          />
        )}

        <AnimatePresence>
          {anodeGasMl > 0.05 && (
            <motion.rect key="r-gas" x={RI.x} width={RI.w} y={RI.y}
              clipPath="url(#e-rtube-clip)" fill={anodeGasColor}
              initial={{ height: 0 }}
              animate={{ height: Math.max(2, rGasH) }}
              transition={{ type: "spring", stiffness: 20, damping: 10 }}
            />
          )}
        </AnimatePresence>

        {electrolyte && rLiqH > 4 && (
          <motion.path
            animate={{ d: `M ${RI.x} ${rLiqY} Q ${RI.x + RI.w / 2} ${rLiqY + 5} ${RI.x + RI.w} ${rLiqY}` }}
            transition={{ type: "spring", stiffness: 26, damping: 10 }}
            fill="rgba(255,255,255,0.12)" stroke="rgba(99,179,237,0.35)" strokeWidth="1"
            clipPath="url(#e-rtube-clip)"
          />
        )}

        {electrolyte && (
          <rect x={RI.x} y={RI.y} width={RI.w} height={RI.h}
            fill="url(#e-liq-grad)" clipPath="url(#e-rtube-clip)" />
        )}

        <rect x={RTUBE.x} y={RTUBE.y} width={RTUBE.w} height={RTUBE.h} rx={RTUBE.rx}
          fill="url(#e-tube-sheen)" />
        <rect x={RTUBE.x + 4} y={RTUBE.y + 10} width={5} height={RTUBE.h - 30} rx={2.5}
          fill="rgba(255,255,255,0.13)" />

        {anodeGasMl >= 0.1 && (
          <g filter="url(#e-drop-shadow)">
            <rect x={RI.x - 3} y={RI.y + 6} width={RI.w + 6} height={22} rx={6}
              fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.2" />
            <text x={RI.x + RI.w / 2} y={RI.y + 20} fontSize="10" fontWeight="800"
              fill="#059669" textAnchor="middle" fontFamily="monospace">
              {anodeGasMl.toFixed(2)} mL
            </text>
          </g>
        )}

        {[0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}>
            <line x1={RTUBE.x} y1={RI.y + f * RI.h}
              x2={RTUBE.x - 8} y2={RI.y + f * RI.h}
              stroke="rgba(99,179,237,0.35)" strokeWidth="0.9" />
            <text x={RTUBE.x - 11} y={RI.y + f * RI.h + 3.5}
              fontSize="7.5" fill="#3b6690" textAnchor="end">
              {(ANODE_TUBE_CAPACITY_ML * (1 - f)).toFixed(1)}
            </text>
          </g>
        ))}

        {/* ══ BRIDGE ══ */}
        {electrolyte && (
          <rect x={BRIDGE.x} y={BRIDGE.y} width={BRIDGE.w} height={BRIDGE.h}
            fill={liqColor} fillOpacity={0.84} rx={2} />
        )}
        <rect x={BRIDGE.x} y={BRIDGE.y} width={BRIDGE.w} height={BRIDGE.h}
          fill="none" stroke="rgba(71,85,105,0.45)" strokeWidth="1.2" rx={2} />

        {profile && (
          <>
            <text x={BRIDGE.x + BRIDGE.w / 2} y={BRIDGE.y + BRIDGE.h / 2 - 2}
              fontSize="11" fill="#93c5fd" textAnchor="middle" fontWeight="700">
              {profile.formula}
            </text>
            <text x={BRIDGE.x + BRIDGE.w / 2} y={BRIDGE.y + BRIDGE.h / 2 + 12}
              fontSize="8.5" fill="#3b6690" textAnchor="middle">
              {profile.name.split("—")[0].trim()}
            </text>
          </>
        )}
        {!electrolyte && (
          <text x={W / 2} y={BRIDGE.y + BRIDGE.h / 2 + 4}
            fontSize="10.5" fill="#3b6690" textAnchor="middle">
            Select electrolyte
          </text>
        )}

        {isRunning && electrolyte && (
          <g opacity="0.7">
            {[0.25, 0.5, 0.75].map((f) => (
              <motion.text key={f}
                x={BRIDGE.x + BRIDGE.w * f}
                y={BRIDGE.y + 8}
                fontSize="9" fill="#60a5fa" textAnchor="middle"
                animate={{ opacity: [0, 1, 0], y: [BRIDGE.y + 8, BRIDGE.y + 22, BRIDGE.y + 8] }}
                transition={{ duration: 2, delay: f * 0.7, repeat: Infinity, ease: "easeInOut" }}
              >
                ⇄
              </motion.text>
            ))}
          </g>
        )}

        {/* ══ CATHODE ELECTRODE (−) ══ */}
        <rect x={LE.x} y={LE.y} width={LE.w} height={LE.h} rx={4}
          fill={cathodeColor}
          stroke={cathode.connected ? "rgba(99,179,237,0.50)" : "rgba(99,179,237,0.15)"}
          strokeWidth="1.4"
          opacity={cathode.connected ? 1 : 0.32}
          filter={isRunning ? "url(#e-electrode-glow)" : "url(#e-drop-shadow)"}
          style={isRunning ? { animation: "electrode-glow 2s ease-in-out infinite" } as React.CSSProperties : undefined}
        />
        {cathode.connected && (
          <rect x={LE.x + 2} y={LE.y + 8} width={4} height={LE.h - 20} rx={2}
            fill="url(#e-electrode-grad)" />
        )}
        {copperDepositH > 0 && (
          <AnimatePresence>
            <motion.rect key="cu-deposit" x={LE.x} width={LE.w}
              y={LE.y + LE.h - copperDepositH}
              fill="url(#e-copper-grad)" rx={2}
              initial={{ height: 0, y: LE.y + LE.h }}
              animate={{ height: copperDepositH, y: LE.y + LE.h - copperDepositH }}
              transition={{ type: "spring", stiffness: 18, damping: 10 }}
            />
          </AnimatePresence>
        )}

        {/* ══ ANODE ELECTRODE (+) ══ */}
        <rect x={RE.x} y={RE.y} width={RE.w} height={RE.h} rx={4}
          fill={anode.material === "carbon" ? "#1a2535" : "#c0c8d8"}
          stroke={anode.connected ? "rgba(99,179,237,0.50)" : "rgba(99,179,237,0.15)"}
          strokeWidth="1.4"
          opacity={anode.connected ? 1 : 0.32}
          filter={isRunning ? "url(#e-electrode-glow)" : "url(#e-drop-shadow)"}
          style={isRunning ? { animation: "electrode-glow 2s ease-in-out infinite 0.5s" } as React.CSSProperties : undefined}
        />
        {anode.connected && (
          <rect x={RE.x + 2} y={RE.y + 8} width={4} height={RE.h - 20} rx={2}
            fill="url(#e-electrode-grad)" />
        )}

        {/* Polarity labels */}
        <text x={LE.x + LE.w / 2} y={LE.y - 9}
          fontSize="20" fontWeight="900" fill="#ef4444" textAnchor="middle">−</text>
        <text x={LE.x + LE.w / 2} y={LE.y - 22}
          fontSize="8.5" fill="#475569" textAnchor="middle" fontWeight="700">Cathode</text>
        <text x={RE.x + RE.w / 2} y={RE.y - 9}
          fontSize="20" fontWeight="900" fill="#22c55e" textAnchor="middle">+</text>
        <text x={RE.x + RE.w / 2} y={RE.y - 22}
          fontSize="8.5" fill="#475569" textAnchor="middle" fontWeight="700">Anode</text>

        {/* Column headings */}
        <text x={LCENTER} y={LTUBE.y - 38}
          fontSize="11.5" fontWeight="800" fill="#1e3a8a" textAnchor="middle">
          {cathode.connected && cathode.gasFormula && cathode.gasFormula !== "Cu (deposited)"
            ? cathode.gasFormula
            : electrolyte === "copper-sulfate" ? "Cu deposit" : "Hydrogen (H₂)"}
        </text>
        <text x={RCENTER} y={RTUBE.y - 38}
          fontSize="11.5" fontWeight="800" fill="#1e3a8a" textAnchor="middle">
          {anode.connected && anode.gasFormula ? anode.gasFormula : "Oxygen (O₂)"}
        </text>

        {cathodeGasMl > 0.05 && (
          <text x={LCENTER} y={LTUBE.y - 26} fontSize="8" fill="#60a5fa" textAnchor="middle" fontStyle="italic">
            {cathode.gasFormula === "H₂" ? "(blue tint)" : electrolyte === "copper-sulfate" ? "(Cu²⁺ → Cu)" : ""}
          </text>
        )}
        {anodeGasMl > 0.05 && (
          <text x={RCENTER} y={RTUBE.y - 26} fontSize="8"
            fill={anode.gasFormula === "Cl₂" ? "#86efac" : "#fde68a"}
            textAnchor="middle" fontStyle="italic">
            {anode.gasFormula === "Cl₂" ? "(yellow-green)" : anode.gasFormula === "O₂" ? "(pale yellow)" : ""}
          </text>
        )}

        {/* ══ DC POWER SOURCE ══ */}
        <rect x={BATT.x} y={BATT.y} width={BATT.w} height={BATT.h} rx={12}
          fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" filter="url(#e-drop-shadow)" />
        <rect x={BATT.x + 8} y={BATT.y + 8} width={BATT.w - 16} height={BATT.h - 16} rx={8}
          fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
        <text x={BATT.x + BATT.w / 2} y={BATT.y + BATT.h / 2 + 6}
          fontSize="15" fontWeight="900" textAnchor="middle"
          fill={circuitComplete ? "#2563eb" : "#475569"} fontFamily="monospace">
          {voltage.toFixed(1)} V
        </text>
        <text x={BATT.x + BATT.w / 2} y={BATT.y - 10}
          fontSize="9" fill="#475569" textAnchor="middle" fontWeight="600">
          DC POWER SUPPLY {circuitComplete ? `· ${current.toFixed(2)} A` : "(off)"}
        </text>
        <text x={BATT.x + 14}           y={BATT.y + 36} fontSize="20" fill="#ef4444" fontWeight="900">−</text>
        <text x={BATT.x + BATT.w - 14}  y={BATT.y + 36} fontSize="20" fill="#22c55e" fontWeight="900" textAnchor="end">+</text>

        {/* ══ WIRES ══ */}
        {circuitComplete && (
          <>
            <polyline
              points={`${LCENTER},${LTUBE.y - 2} ${LCENTER},${WIRE_Y} ${BATT.x + 14},${WIRE_Y} ${BATT.x + 14},${BATT.y + BATT.h / 2}`}
              fill="none" stroke="#ef4444" strokeWidth="3"
              strokeLinecap="round" strokeLinejoin="round"
              style={cathFlowStyle as React.CSSProperties}
            />
            <polyline
              points={`${RCENTER},${RTUBE.y - 2} ${RCENTER},${WIRE_Y} ${BATT.x + BATT.w - 14},${WIRE_Y} ${BATT.x + BATT.w - 14},${BATT.y + BATT.h / 2}`}
              fill="none" stroke="#22c55e" strokeWidth="3"
              strokeLinecap="round" strokeLinejoin="round"
              style={flowStyle as React.CSSProperties}
            />
            <circle cx={LCENTER} cy={WIRE_Y} r={5} fill="#ef4444" />
            <circle cx={RCENTER} cy={WIRE_Y} r={5} fill="#22c55e" />
            {isRunning && (
              <>
                <motion.polygon
                  points={`${LCENTER - 5},${WIRE_Y - 18} ${LCENTER + 5},${WIRE_Y - 18} ${LCENTER},${WIRE_Y - 8}`}
                  fill="#ef4444" opacity={0.9}
                  animate={{ opacity: [0.9, 0.3, 0.9] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
                <motion.polygon
                  points={`${RCENTER - 5},${WIRE_Y - 18} ${RCENTER + 5},${WIRE_Y - 18} ${RCENTER},${WIRE_Y - 8}`}
                  fill="#22c55e" opacity={0.9}
                  animate={{ opacity: [0.9, 0.3, 0.9] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                />
              </>
            )}
          </>
        )}

        {!circuitComplete && (anode.connected || cathode.connected) && (
          <>
            {cathode.connected && (
              <line x1={LCENTER} y1={LTUBE.y - 2} x2={LCENTER} y2={WIRE_Y}
                stroke="rgba(99,179,237,0.22)" strokeWidth="1.8" strokeDasharray="5,4" />
            )}
            {anode.connected && (
              <line x1={RCENTER} y1={RTUBE.y - 2} x2={RCENTER} y2={WIRE_Y}
                stroke="rgba(99,179,237,0.22)" strokeWidth="1.8" strokeDasharray="5,4" />
            )}
          </>
        )}

        {!circuitComplete && anode.connected && cathode.connected && (
          <text x={W / 2} y={WIRE_Y - 8} fontSize="10" fill="#f59e0b"
            textAnchor="middle" fontWeight="700">
            ↑ Connect wires to power source ↑
          </text>
        )}

        {copperDepositH > 4 && (
          <g>
            <rect x={LE.x - 2} y={LE.y + LE.h - copperDepositH - 4} width={LE.w + 4} height={14} rx={4}
              fill="rgba(217,119,6,0.18)" stroke="#f6c89a" strokeWidth="0.8" />
            <text x={LE.x + LE.w / 2} y={LE.y + LE.h - copperDepositH + 7}
              fontSize="7" fill="#fbbf24" textAnchor="middle" fontWeight="700">Cu↓</text>
          </g>
        )}

        {(cathodeGasMl >= GAS_TUBE_CAPACITY_ML * 0.94 || anodeGasMl >= ANODE_TUBE_CAPACITY_ML * 0.94) && (
          <g>
            <rect x={W / 2 - 112} y={LTUBE.y + LTUBE.h / 2 - 16} width={224} height={30} rx={9}
              fill="rgba(239,68,68,0.12)" stroke="rgba(239,68,68,0.35)" strokeWidth="1.2" />
            <text x={W / 2} y={LTUBE.y + LTUBE.h / 2 + 5} fontSize="10" fill="#f87171"
              textAnchor="middle" fontWeight="800">
              ⚠ Gas collection limit reached
            </text>
          </g>
        )}

        {isRunning && (
          <g>
            <text x={W / 2} y={BATT.y + BATT.h + 18} fontSize="8.5" fill="#3b6690" textAnchor="middle" fontWeight="600">
              Electrolysis Rate
            </text>
            <rect x={W / 2 - 58} y={BATT.y + BATT.h + 23} width={116} height={6} rx={3}
              fill="rgba(148,163,184,0.28)" />
            <motion.rect
              x={W / 2 - 58} y={BATT.y + BATT.h + 23}
              height={6} rx={3}
              fill="#0ea5e9"
              animate={{ width: Math.min(116, (current / 3) * 116) }}
              transition={{ duration: 0.4 }}
            />
          </g>
        )}
      </svg>

      {cathode.connected && (
        <BubbleParticles
          active={isRunning}
          rate={cathode.bubbleRate}
          color={cathode.gasFormula === "H₂" ? "rgba(147,197,253,0.90)" : "rgba(209,250,229,0.85)"}
          xPct={LCENTER_PCT}
          spread={12}
          bottom={23}
          label={cathode.gasFormula ?? undefined}
        />
      )}
      {anode.connected && (
        <BubbleParticles
          active={isRunning}
          rate={anode.bubbleRate}
          color={anode.gasFormula === "Cl₂" ? "rgba(190,242,100,0.85)" : "rgba(253,224,71,0.82)"}
          xPct={RCENTER_PCT}
          spread={12}
          bottom={23}
          label={anode.gasFormula ?? undefined}
        />
      )}

      {/* Beginner explanation banner */}
      {circuitComplete && profile && (
        <div style={{
          position: "absolute", bottom: 8, left: 8, right: 8,
          borderRadius: 10,
          background: "rgba(255,255,255,0.94)",
          border: "1px solid rgba(8,145,178,0.20)",
          padding: "7px 12px",
          display: "flex", gap: 12,
          backdropFilter: "blur(8px)",
          pointerEvents: "none",
        }}>
          <div style={{ flex: 1, borderRight: "1px solid rgba(148,163,184,0.22)", paddingRight: 10 }}>
            <p style={{ fontSize: 9, fontWeight: 800, color: "#ef4444", margin: 0, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Cathode (−) — Reduction
            </p>
            <p style={{ fontSize: 9.5, color: "#334155", margin: "2px 0 0", lineHeight: 1.45 }}>
              {profile.cathodeReaction}
            </p>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 9, fontWeight: 800, color: "#22c55e", margin: 0, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Anode (+) — Oxidation
            </p>
            <p style={{ fontSize: 9.5, color: "#334155", margin: "2px 0 0", lineHeight: 1.45 }}>
              {profile.anodeReaction}
            </p>
          </div>
        </div>
      )}

      {!electrolyte && (
        <div style={{
          position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)",
          borderRadius: 10, background: "rgba(255,255,255,0.94)",
          border: "1px solid rgba(8,145,178,0.20)",
          padding: "7px 16px", pointerEvents: "none",
          whiteSpace: "nowrap",
        }}>
          <p style={{ fontSize: 10.5, color: "#334155", margin: 0, fontWeight: 600 }}>
            Select an electrolyte in the controls to begin
          </p>
        </div>
      )}
    </div>
  );
}
