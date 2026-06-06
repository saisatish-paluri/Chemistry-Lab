"use client";

import { motion } from "framer-motion";
import { useActiveLabStore, DIFFICULTY_STYLE } from "@/lib/store/active-lab-store";

// Renders a premium card inside the lab env — same quality as home page LabPreview cards.
export default function LabInfoCard() {
  const title      = useActiveLabStore((s) => s.title);
  const accent     = useActiveLabStore((s) => s.accent);
  const bg         = useActiveLabStore((s) => s.bg);
  const difficulty = useActiveLabStore((s) => s.difficulty);
  const features   = useActiveLabStore((s) => s.features);
  const desc       = useActiveLabStore((s) => s.desc);
  const isActive   = useActiveLabStore((s) => s.isActive);

  if (!isActive) return null;

  const ds = DIFFICULTY_STYLE[difficulty];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border overflow-hidden"
      style={{
        background:     "var(--lab-glass-heavy)",
        borderColor:    accent + "30",
        boxShadow:      `0 8px 32px ${accent}14, var(--lab-shadow-sm)`,
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Accent bar */}
      <div
        className="h-0.5 w-full"
        style={{ background: `linear-gradient(90deg, ${accent}70, ${accent}, ${accent}70)` }}
      />

      {/* Icon area — tinted bg like home page cards */}
      <div
        className="relative flex items-center gap-3 px-4 py-3.5 border-b"
        style={{
          background:  bg,
          borderColor: accent + "20",
        }}
      >
        {/* Subtle radial glow */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 0% 50%, ${accent}12 0%, transparent 60%)`,
          }}
        />
        <div
          className="relative w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: `${accent}14`,
            border:     `1.5px solid ${accent}24`,
            color:      accent,
          }}
        >
          <LabFlaskIcon />
        </div>
        <div className="min-w-0 relative">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
            style={{ color: accent + "cc" }}>
            Current Experiment
          </p>
          <p className="text-sm font-bold leading-tight truncate"
            style={{ color: "var(--lab-text-primary)" }}>
            {title}
          </p>
        </div>
        {/* Difficulty badge */}
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ml-auto"
          style={{ background: ds.bg, color: ds.color, borderColor: ds.border }}
        >
          {difficulty}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Description */}
        <p className="text-[11.5px] leading-relaxed" style={{ color: "var(--lab-text-muted)" }}>
          {desc}
        </p>

        {/* Feature pills — exact same style as home page */}
        {features.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {features.map((f) => (
              <span
                key={f}
                className="text-[9.5px] px-2 py-0.5 rounded-full border font-medium"
                style={{
                  background:  bg,
                  borderColor: accent + "40",
                  color:       accent,
                }}
              >
                {f}
              </span>
            ))}
          </div>
        )}

        {/* Status row */}
        <div className="flex items-center justify-between pt-1 border-t"
          style={{ borderColor: "var(--lab-glass-border)" }}>
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full live-dot flex-shrink-0"
              style={{ background: accent, boxShadow: `0 0 6px ${accent}99` }}
            />
            <span className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: accent }}>
              Lab Active
            </span>
          </div>
          <span className="text-[9px] font-medium" style={{ color: "var(--lab-text-subtle)" }}>
            Real-time simulation
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function LabFlaskIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M6 2.5h6M6 2.5v5.5L3 14.5h12L12 8V2.5"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
      <path d="M5.5 12 Q9 10.5 12.5 12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}
