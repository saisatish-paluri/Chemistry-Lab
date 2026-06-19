"use client";

/**
 * InstrumentReadout
 *
 * Renders a single instrument's current reading in a professional LCD-panel style.
 * Shows:
 *   • Instrument name and unit
 *   • Displayed value (rounded to instrument resolution)
 *   • ± uncertainty (when showUncertainty is true)
 *   • Calibration status LED
 *   • Error indicator when a systematic error is active
 */

import { memo } from "react";
import type { InstrumentReading } from "@/lib/instruments/types";
import { INSTRUMENT_SPECS } from "@/lib/instruments/instruments";

// ── Instrument icon map (Unicode / ASCII — no external lib required) ──────────
const ICONS: Record<string, string> = {
  "analytical-balance":  "⚖",
  "thermometer":         "🌡",
  "burette":             "🧪",
  "pipette":             "💧",
  "measuring-cylinder":  "🥃",
  "stopwatch":           "⏱",
  "ph-meter":            "⚗",
  "conductivity-meter":  "⚡",
};

interface Props {
  reading:          InstrumentReading;
  showUncertainty?: boolean;
  showCalibration?: boolean;
  showPercentage?:  boolean;
  compact?:         boolean;
  className?:       string;
}

export default memo(function InstrumentReadout({
  reading,
  showUncertainty = true,
  showCalibration = true,
  showPercentage  = false,
  compact         = false,
  className       = "",
}: Props) {
  const spec       = INSTRUMENT_SPECS[reading.instrument];
  const icon       = ICONS[reading.instrument] ?? "📏";
  const hasError   = reading.hasActiveError;
  const calibrated = reading.calibrated;

  // Colour of the displayed value: green = good, amber = error bias active, red = uncalibrated
  const valueColor = !calibrated
    ? "#ef4444"
    : hasError
    ? "#f59e0b"
    : "#4ade80";

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${className}`}
        style={{
          background: "rgba(15,23,42,0.92)",
          border:     `1px solid ${hasError ? "rgba(245,158,11,0.4)" : "rgba(74,222,128,0.2)"}`,
        }}
      >
        <span className="text-sm opacity-60">{icon}</span>
        <span className="text-[10px] opacity-50 font-medium tracking-wider" style={{ color: "#94a3b8" }}>
          {reading.label.split(" ")[0].toUpperCase()}
        </span>
        <span
          className="font-mono text-sm font-bold ml-auto"
          style={{ color: valueColor, fontFeatureSettings: "'tnum'" }}
        >
          {reading.displayedValue.toFixed(spec.decimalPlaces)}
        </span>
        <span className="text-[9px] opacity-50" style={{ color: "#64748b" }}>
          {reading.unit}
        </span>
        {showUncertainty && (
          <span className="text-[9px]" style={{ color: "#475569" }}>
            ±{reading.uncertainty.toFixed(spec.decimalPlaces)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl overflow-hidden ${className}`}
      style={{
        background: "linear-gradient(160deg, #0f172a 0%, #1e293b 100%)",
        border:     `1px solid ${hasError ? "rgba(245,158,11,0.35)" : calibrated ? "rgba(74,222,128,0.20)" : "rgba(239,68,68,0.30)"}`,
        boxShadow:  "0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Header band */}
      <div
        className="flex items-center justify-between px-3 py-1.5"
        style={{
          background: "rgba(255,255,255,0.03)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{icon}</span>
          <span
            className="text-[9px] font-bold tracking-widest uppercase"
            style={{ color: "#64748b" }}
          >
            {reading.label}
          </span>
        </div>

        {/* Status LEDs */}
        <div className="flex items-center gap-2">
          {showCalibration && (
            <div className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background: calibrated ? "#4ade80" : "#ef4444",
                  boxShadow:  calibrated
                    ? "0 0 6px rgba(74,222,128,0.8)"
                    : "0 0 6px rgba(239,68,68,0.8)",
                }}
              />
              <span className="text-[8px]" style={{ color: calibrated ? "#4ade80" : "#ef4444" }}>
                {calibrated ? "CAL" : "UNCAL"}
              </span>
            </div>
          )}
          {hasError && (
            <div className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: "#f59e0b", boxShadow: "0 0 6px rgba(245,158,11,0.8)" }}
              />
              <span className="text-[8px]" style={{ color: "#f59e0b" }}>ERR</span>
            </div>
          )}
        </div>
      </div>

      {/* Main display area */}
      <div className="px-4 py-3">
        {/* Large value display */}
        <div className="flex items-baseline gap-1.5 justify-center mb-1">
          <span
            className="font-mono font-black leading-none"
            style={{
              fontSize:           "1.9rem",
              color:              valueColor,
              fontFeatureSettings: "'tnum'",
              textShadow:         `0 0 20px ${valueColor}55`,
              letterSpacing:      "0.02em",
            }}
          >
            {reading.displayedValue.toFixed(spec.decimalPlaces)}
          </span>
          <span
            className="text-sm font-semibold"
            style={{ color: "#475569" }}
          >
            {reading.unit}
          </span>
        </div>

        {/* Uncertainty row */}
        {showUncertainty && (
          <div className="flex items-center justify-center gap-2 mb-1">
            <span
              className="text-[10px] font-mono"
              style={{ color: "#64748b" }}
            >
              ± {reading.uncertainty.toFixed(spec.decimalPlaces)} {reading.unit}
            </span>
            {showPercentage && (
              <span
                className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
                style={{
                  background: "rgba(100,116,139,0.15)",
                  color:      "#94a3b8",
                }}
              >
                {reading.percentageUncertainty.toFixed(2)}%
              </span>
            )}
          </div>
        )}

        {/* Sig figs + resolution row */}
        <div
          className="flex items-center justify-between text-[8.5px] pt-1.5"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.05)",
            color:     "#334155",
          }}
        >
          <span>res: {spec.resolution} {spec.unit}</span>
          <span>{reading.sigFigs} s.f.</span>
          <span>±{((reading.uncertainty / Math.max(Math.abs(reading.displayedValue), 0.001)) * 100).toFixed(1)}%</span>
        </div>
      </div>

      {/* Error label strip (only when error is active) */}
      {hasError && reading.activeErrorLabel && (
        <div
          className="px-3 py-1.5 text-[9px] font-medium truncate"
          style={{
            background:   "rgba(245,158,11,0.08)",
            borderTop:    "1px solid rgba(245,158,11,0.2)",
            color:        "#f59e0b",
          }}
        >
          ⚠ {reading.activeErrorLabel}
        </div>
      )}
    </div>
  );
});
