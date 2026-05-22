"use client";

import { AnimatePresence, motion } from "framer-motion";

export interface ContextPopupContent {
  what:      string;
  why?:      string;
  equation?: string;
  kind?:     "info" | "success" | "warning";
}

interface Props extends ContextPopupContent {
  visible:    boolean;
  className?: string;
}

const COLORS = {
  info: {
    bg: "linear-gradient(135deg, #f0f7ff 0%, #f8fbff 100%)",
    border: "#bfdbfe", titleColor: "#1d4ed8", bodyColor: "#1e40af",
    dot: "#3b82f6", dotGlow: "rgba(59,130,246,0.28)",
    eqBg: "rgba(29,78,216,0.05)", eqBorder: "#bfdbfe",
    label: "Info",
  },
  success: {
    bg: "linear-gradient(135deg, #f0fdf4 0%, #f5fef7 100%)",
    border: "#86efac", titleColor: "#15803d", bodyColor: "#166534",
    dot: "#22c55e", dotGlow: "rgba(34,197,94,0.28)",
    eqBg: "rgba(21,128,61,0.05)", eqBorder: "#bbf7d0",
    label: "Result",
  },
  warning: {
    bg: "linear-gradient(135deg, #fffbeb 0%, #fefce8 100%)",
    border: "#fde68a", titleColor: "#92400e", bodyColor: "#78350f",
    dot: "#f59e0b", dotGlow: "rgba(245,158,11,0.28)",
    eqBg: "rgba(146,64,14,0.05)", eqBorder: "#fde68a",
    label: "Alert",
  },
};

export default function ContextPopup({ visible, what, why, equation, kind = "info", className = "" }: Props) {
  const c = COLORS[kind];
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0,  scale: 1 }}
          exit={{ opacity: 0, y: 6,  scale: 0.94, transition: { duration: 0.16 } }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className={`select-none ${className}`}
          style={{
            background:   c.bg,
            border:       `1.5px solid ${c.border}`,
            borderRadius: 12,
            padding:      "10px 12px",
            boxShadow:    `0 4px 20px rgba(15,23,42,0.10), 0 1px 4px rgba(15,23,42,0.06), 0 0 0 1px rgba(255,255,255,0.6) inset`,
          }}
        >
          {/* Header row */}
          <div className="flex items-start gap-2 mb-1.5">
            {/* Pulsing dot */}
            <div className="relative mt-[3px] flex-shrink-0">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: c.dot, boxShadow: `0 0 5px ${c.dotGlow}` }}
              />
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: c.dot, opacity: 0.35 }}
                animate={{ scale: [1, 2.4, 1], opacity: [0.35, 0, 0.35] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span
                  className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                  style={{ background: `${c.dot}18`, color: c.titleColor }}
                >
                  {c.label}
                </span>
              </div>
              <p className="text-[11px] font-bold leading-snug" style={{ color: c.titleColor }}>
                {what}
              </p>
            </div>
          </div>

          {/* Body text */}
          {why && (
            <p
              className="text-[10px] leading-snug ml-4"
              style={{ color: c.bodyColor, opacity: 0.85 }}
            >
              {why}
            </p>
          )}

          {/* Chemical equation */}
          {equation && (
            <div
              className="mt-2 ml-4 px-2.5 py-1.5 rounded-lg font-mono text-[9.5px] leading-snug"
              style={{ background: c.eqBg, border: `1px solid ${c.eqBorder}`, color: c.titleColor }}
            >
              {equation}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Map observation type to contextual popup content
export function obsToPopup(type: string, message: string): ContextPopupContent {
  switch (type) {
    // ── Titration ──────────────────────────────────────────────
    case "reaction-start":
      return {
        what: "Neutralisation begins",
        why:  "NaOH neutralising HCl — watch for colour change as pH climbs",
        equation: "NaOH + HCl → NaCl + H₂O",
        kind: "info",
      };
    case "color-change":
      return {
        what: "Colour change detected",
        why:  "Indicator responding to pH shift — approaching endpoint",
        kind: "info",
      };
    case "endpoint-reached":
      return {
        what: "Endpoint reached",
        why:  "Permanent faint colour — acid fully neutralised at equivalence point",
        equation: "H⁺ + OH⁻ → H₂O  (pH 7)",
        kind: "success",
      };
    case "neutralization":
      return {
        what: "Half-way point",
        why:  "50% of acid neutralised — slow the flow rate for precision",
        kind: "info",
      };
    case "contamination":
      return {
        what: "Endpoint overshot",
        why:  "Excess base added — solution is now alkaline (pH > 10)",
        equation: "Excess OH⁻ → deep pink colour",
        kind: "warning",
      };

    // ── Electrolysis ───────────────────────────────────────────
    case "gas-evolution":
      return {
        what: "Gas evolution at electrodes",
        why:  "Electrolysis splitting electrolyte ions — bubbles rising in tubes",
        equation: "2H₂O → 2H₂↑ + O₂↑",
        kind: "info",
      };
    case "conductivity-change":
      return {
        what: "Conductivity changed",
        why:  "Ion concentration altered — current adjusting proportionally",
        kind: "info",
      };

    // ── Precipitation ──────────────────────────────────────────
    case "precipitation":
      return {
        what: "Precipitate formed",
        why:  "Insoluble salt crashing out of solution — observe cloudiness",
        kind: "success",
      };
    case "no-reaction":
      return {
        what: "No precipitate",
        why:  "All product ions remain dissolved — solution stays clear",
        kind: "info",
      };

    // ── Reaction rate ──────────────────────────────────────────
    case "rate-change":
      return {
        what: "Reaction rate changed",
        why:  "Temperature / concentration / surface area updated",
        kind: "info",
      };

    // ── Gas laws ───────────────────────────────────────────────
    case "pressure-change":
      return {
        what: "Pressure changed",
        why:  "Volume adjustment shifted gas pressure (Boyle's Law)",
        equation: "P₁V₁ = P₂V₂",
        kind: "info",
      };

    // ── Chemical equilibrium ───────────────────────────────────
    case "equilibrium-shift":
      return {
        what: "Equilibrium shifted",
        why:  "System responds to minimise the disturbance — Le Chatelier's Principle",
        kind: "info",
      };
    case "temperature-change":
      return {
        what: "Temperature changed",
        why:  "Keq altered — equilibrium position shifts with temperature",
        kind: "warning",
      };

    // ── Redox displacement ─────────────────────────────────────
    case "deposition":
      return {
        what: "Copper depositing",
        why:  "More reactive metal displacing Cu²⁺ from solution",
        equation: "Cu²⁺ + 2e⁻ → Cu(s)",
        kind: "success",
      };

    // ── Calorimetry ────────────────────────────────────────────
    case "heat-released":
      return {
        what: "Exothermic — heat released",
        why:  "Neutralisation releasing energy — temperature rising",
        equation: "H⁺ + OH⁻ → H₂O  ΔH = −57.3 kJ/mol",
        kind: "success",
      };

    // ── Completion ─────────────────────────────────────────────
    case "reaction-complete":
      return {
        what: "Reaction complete",
        why:  "All reactants consumed — review your results",
        kind: "success",
      };

    // ── Overheating ────────────────────────────────────────────
    case "overheating":
      return {
        what: "Temperature too high",
        why:  "Exceeded safe limit — reduce heat source immediately",
        kind: "warning",
      };

    default:
      return { what: message.slice(0, 72), why: undefined, kind: "info" };
  }
}
