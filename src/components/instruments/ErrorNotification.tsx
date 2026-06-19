"use client";

/**
 * ErrorNotification
 *
 * Displays a dismissible list of active experimental errors with educational notes.
 * Severity is colour-coded:
 *   minor    → blue-grey
 *   moderate → amber
 *   major    → red
 */

import { useState, memo } from "react";
import type { ExperimentalError } from "@/lib/instruments/types";

const SEVERITY_STYLES: Record<ExperimentalError["severity"], { border: string; bg: string; badge: string; text: string }> = {
  minor: {
    border: "rgba(100,116,139,0.35)",
    bg:     "rgba(100,116,139,0.07)",
    badge:  "rgba(100,116,139,0.20)",
    text:   "#94a3b8",
  },
  moderate: {
    border: "rgba(245,158,11,0.35)",
    bg:     "rgba(245,158,11,0.07)",
    badge:  "rgba(245,158,11,0.20)",
    text:   "#fbbf24",
  },
  major: {
    border: "rgba(239,68,68,0.35)",
    bg:     "rgba(239,68,68,0.07)",
    badge:  "rgba(239,68,68,0.20)",
    text:   "#f87171",
  },
};

interface Props {
  errors:     ExperimentalError[];
  className?: string;
}

export default memo(function ErrorNotification({ errors, className = "" }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const active = errors.filter((e) => e.active);
  if (active.length === 0) return null;

  return (
    <div
      className={`rounded-xl overflow-hidden ${className}`}
      style={{
        background: "rgba(15,23,42,0.96)",
        border:     "1px solid rgba(245,158,11,0.25)",
        boxShadow:  "0 4px 16px rgba(0,0,0,0.4)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{
          background:   "rgba(245,158,11,0.08)",
          borderBottom: "1px solid rgba(245,158,11,0.15)",
        }}
      >
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: "#f59e0b", boxShadow: "0 0 6px rgba(245,158,11,0.8)" }}
        />
        <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#f59e0b" }}>
          Active Experimental Errors ({active.length})
        </span>
      </div>

      {/* Error list */}
      <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        {active.map((err) => {
          const s           = SEVERITY_STYLES[err.severity];
          const isExpanded  = expanded === err.type;
          return (
            <div key={err.type} style={{ background: s.bg }}>
              <button
                onClick={() => setExpanded(isExpanded ? null : err.type)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:brightness-110 transition-all"
              >
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex-shrink-0"
                  style={{ background: s.badge, color: s.text, border: `1px solid ${s.border}` }}
                >
                  {err.severity}
                </span>
                <span className="text-[10px] font-semibold flex-1" style={{ color: s.text }}>
                  {err.label}
                </span>
                <span className="text-[9px]" style={{ color: "#475569" }}>
                  {isExpanded ? "▲" : "▼"}
                </span>
              </button>

              {/* Expanded educational note */}
              {isExpanded && (
                <div
                  className="px-3 pb-3 text-[10px] leading-relaxed"
                  style={{ color: "#94a3b8" }}
                >
                  <div
                    className="pt-2 pl-2 border-l-2"
                    style={{ borderColor: s.border }}
                  >
                    <p className="mb-1.5 font-semibold text-[9px] uppercase tracking-wider" style={{ color: s.text }}>
                      Why this matters:
                    </p>
                    {err.educationalNote}
                    <p className="mt-2 text-[9px]" style={{ color: "#475569" }}>
                      Affects: {err.affectsInstruments.join(", ")}
                      {" · "}Systematic bias: {err.systematicBias > 0 ? "+" : ""}{err.systematicBias.toFixed(3)} {err.affectsInstruments[0]}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
