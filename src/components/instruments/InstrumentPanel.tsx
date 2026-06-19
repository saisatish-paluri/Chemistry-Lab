"use client";

/**
 * InstrumentPanel
 *
 * Groups multiple InstrumentReadout tiles into a professional dark-glass panel
 * for display in an experiment's Info sidebar or below the workspace.
 *
 * Features:
 *   • Responsive grid: 1 column on mobile, 2+ on wider panels
 *   • Optional uncertainty budget summary
 *   • Optional ErrorNotification section
 *   • "Beginner mode" hides uncertainty details
 */

import { memo } from "react";
import type { InstrumentReading, ExperimentalError, UncertaintyBudget } from "@/lib/instruments/types";
import InstrumentReadout from "./InstrumentReadout";
import ErrorNotification from "./ErrorNotification";
import { buildUncertaintyBudget } from "@/lib/instruments/uncertainty";

interface Props {
  title?:              string;
  readings:            InstrumentReading[];
  errors?:             ExperimentalError[];
  showUncertainty?:    boolean;
  showBudget?:         boolean;
  showErrors?:         boolean;
  /** When true, collapses to compact single-line readouts. */
  compact?:            boolean;
  className?:          string;
}

export default memo(function InstrumentPanel({
  title           = "Laboratory Instruments",
  readings,
  errors          = [],
  showUncertainty = true,
  showBudget      = false,
  showErrors      = true,
  compact         = false,
  className       = "",
}: Props) {
  const budget: UncertaintyBudget | null = showBudget && readings.length > 1
    ? buildUncertaintyBudget(readings)
    : null;

  const hasActiveError = errors.some((e) => e.active);

  return (
    <div
      className={`rounded-xl overflow-hidden ${className}`}
      style={{
        background: "linear-gradient(180deg, rgba(15,23,42,0.97) 0%, rgba(15,23,42,0.93) 100%)",
        border:     `1px solid ${hasActiveError ? "rgba(245,158,11,0.20)" : "rgba(74,222,128,0.12)"}`,
        boxShadow:  "0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Panel header */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{
          background:   "rgba(255,255,255,0.025)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-2">
          {/* Power indicator */}
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: "#4ade80", boxShadow: "0 0 6px rgba(74,222,128,0.7)" }}
          />
          <span
            className="text-[9.5px] font-bold tracking-widest uppercase"
            style={{ color: "#64748b" }}
          >
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[8.5px]" style={{ color: "#334155" }}>
          <span>{readings.length} instrument{readings.length !== 1 ? "s" : ""}</span>
          {hasActiveError && (
            <span
              className="px-1.5 py-0.5 rounded font-bold"
              style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}
            >
              {errors.filter((e) => e.active).length} error{errors.filter((e) => e.active).length !== 1 ? "s" : ""} active
            </span>
          )}
        </div>
      </div>

      {/* Instrument grid */}
      <div className="p-3 grid gap-2.5" style={{ gridTemplateColumns: compact ? "1fr" : "repeat(auto-fill, minmax(180px, 1fr))" }}>
        {readings.map((r) => (
          <InstrumentReadout
            key={r.instrument + r.label}
            reading={r}
            showUncertainty={showUncertainty}
            showPercentage={showBudget}
            compact={compact}
          />
        ))}
      </div>

      {/* Uncertainty budget strip */}
      {budget && (
        <div
          className="px-4 py-2.5 text-[9.5px] space-y-1"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.05)",
            background: "rgba(37,99,235,0.04)",
          }}
        >
          <p className="font-bold uppercase tracking-widest text-[8.5px]" style={{ color: "#3b82f6" }}>
            Combined Uncertainty Budget
          </p>
          {budget.measurements.map((r) => (
            <div key={r.instrument} className="flex justify-between" style={{ color: "#475569" }}>
              <span>{r.label}</span>
              <span className="font-mono" style={{ color: "#64748b" }}>
                {r.withUncertainty} ({r.percentageUncertainty.toFixed(2)}%)
              </span>
            </div>
          ))}
          <div
            className="flex justify-between font-bold pt-1"
            style={{ borderTop: "1px solid rgba(59,130,246,0.15)", color: "#3b82f6" }}
          >
            <span>Combined (quadrature)</span>
            <span className="font-mono">
              ± {budget.combinedAbsolute.toFixed(3)}  ({budget.combinedPercentage.toFixed(2)}%)
            </span>
          </div>
        </div>
      )}

      {/* Active error notifications */}
      {showErrors && errors.length > 0 && (
        <ErrorNotification
          errors={errors}
          className="rounded-none border-0 border-t border-white/5"
        />
      )}
    </div>
  );
});
