"use client";

import { AnimatePresence, motion } from "framer-motion";

export interface ChemicalAddEvent {
  chemicalName: string;
  formula:      string;
  amount:       string;           // e.g. "3 drops", "0.5 mL"
  concentration?: string;
  swatchColor:  string;           // color swatch
  reaction?:    string;           // plain-text description
  equation?:    string;           // balanced equation to display
  kind: "acid" | "base" | "indicator" | "electrolyte" | "electrode" | "deposit";
}

interface Props {
  event:   ChemicalAddEvent | null;
  visible: boolean;
  /** Additional Tailwind / inline className for positioning */
  className?: string;
}

const KIND: Record<ChemicalAddEvent["kind"], {
  bg: string; border: string; accent: string; label: string; dot: string;
}> = {
  acid:        { bg: "#fff7ed", border: "#fed7aa", accent: "#c2410c", label: "ACID",        dot: "#f97316" },
  base:        { bg: "#f0fdf4", border: "#86efac", accent: "#15803d", label: "BASE",        dot: "#22c55e" },
  indicator:   { bg: "#fdf4ff", border: "#d8b4fe", accent: "#7c3aed", label: "INDICATOR",  dot: "#a855f7" },
  electrolyte: { bg: "#eff6ff", border: "#bfdbfe", accent: "#1d4ed8", label: "ELECTROLYTE",dot: "#3b82f6" },
  electrode:   { bg: "#f8fafc", border: "#cbd5e1", accent: "#334155", label: "ELECTRODE",  dot: "#64748b" },
  deposit:     { bg: "#fdf3e3", border: "#f6c89a", accent: "#92400e", label: "DEPOSIT",    dot: "#d97706" },
};

export default function ChemicalAddPopup({ event, visible, className = "" }: Props) {
  if (!event) return null;
  const cfg = KIND[event.kind];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={event.chemicalName + event.amount}
          initial={{ opacity: 0, y: -16, scale: 0.88 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.93, transition: { duration: 0.18 } }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={`pointer-events-none select-none ${className}`}
          style={{
            background:   cfg.bg,
            border:       `1.5px solid ${cfg.border}`,
            borderRadius: 18,
            padding:      "14px 16px 12px",
            boxShadow:    "0 16px 48px rgba(15,23,42,0.18), 0 4px 12px rgba(15,23,42,0.10)",
            maxWidth:     290,
            zIndex:       60,
          }}
        >
          {/* ── Top row: color swatch + name + kind badge ── */}
          <div className="flex items-center gap-2.5 mb-2.5">
            <div
              className="w-9 h-9 rounded-xl flex-shrink-0 shadow-sm"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${event.swatchColor}ff, ${event.swatchColor}99)`,
                border: `2px solid ${cfg.border}`,
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-bold leading-tight truncate" style={{ color: cfg.accent }}>
                {event.chemicalName}
              </p>
              <p
                className="text-[10px] font-mono font-semibold mt-0.5"
                style={{ color: cfg.accent, opacity: 0.75 }}
              >
                {event.formula}
              </p>
            </div>
            <span
              className="text-[8.5px] font-bold tracking-wider px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: `${cfg.accent}18`, color: cfg.accent }}
            >
              {cfg.label}
            </span>
          </div>

          {/* ── Amount + concentration row ── */}
          <div className="flex gap-2 mb-2.5">
            <div
              className="flex-1 rounded-lg px-2.5 py-1.5"
              style={{ background: `${cfg.accent}0d`, border: `1px solid ${cfg.border}` }}
            >
              <p className="text-[9px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: cfg.accent, opacity: 0.7 }}>
                Amount
              </p>
              <p className="text-[11.5px] font-bold" style={{ color: cfg.accent }}>
                {event.amount}
              </p>
            </div>
            {event.concentration && (
              <div
                className="flex-1 rounded-lg px-2.5 py-1.5"
                style={{ background: `${cfg.accent}0d`, border: `1px solid ${cfg.border}` }}
              >
                <p className="text-[9px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: cfg.accent, opacity: 0.7 }}>
                  Conc.
                </p>
                <p className="text-[11.5px] font-bold" style={{ color: cfg.accent }}>
                  {event.concentration}
                </p>
              </div>
            )}
          </div>

          {/* ── Reaction description ── */}
          {event.reaction && (
            <p
              className="text-[10.5px] leading-snug mb-2"
              style={{ color: "#374151" }}
            >
              {event.reaction}
            </p>
          )}

          {/* ── Chemical equation ── */}
          {event.equation && (
            <div
              className="rounded-xl px-3 py-2 font-mono text-[10px] leading-relaxed"
              style={{
                background: "rgba(15,23,42,0.045)",
                border:     `1px solid ${cfg.border}`,
                color:      cfg.accent,
              }}
            >
              {event.equation}
            </div>
          )}

          {/* ── Subtle added indicator strip ── */}
          <div
            className="mt-2.5 flex items-center gap-1.5"
            style={{ color: "#64748b" }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
            <span className="text-[9px] font-semibold uppercase tracking-wider">Added to vessel</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
