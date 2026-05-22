"use client";

import type { SurfaceAreaType, ExperimentStatus } from "@/lib/engine/types";
import {
  SURFACE_AREA_LABELS, SURFACE_AREA_FACTORS,
  temperatureFactor, concentrationFactor,
} from "@/lib/engine/reaction-rate-engine";

const SURFACE_AREA_OPTIONS: SurfaceAreaType[] = ["solid", "chips", "granules", "powder"];

interface Props {
  status:         ExperimentStatus;
  temperature:    number;
  concentration:  number;
  surfaceArea:    SurfaceAreaType;
  rateMultiplier: number;
  progress:       number;
  onSetTemp:      (t: number) => void;
  onSetConc:      (c: number) => void;
  onSetSurface:   (sa: SurfaceAreaType) => void;
  onStart:        () => void;
  onStop:         () => void;
  onResetRun:     () => void;
  onReset:        () => void;
}

export default function ReactionRateControls({
  status, temperature, concentration, surfaceArea, rateMultiplier, progress,
  onSetTemp, onSetConc, onSetSurface, onStart, onStop, onResetRun, onReset,
}: Props) {
  const isRunning = status === "running";
  const isDone    = status === "completed" || status === "failed";

  return (
    <div className="flex flex-col gap-0 divide-y" style={{ borderColor: "var(--lab-glass-border)" }}>

      {/* Temperature */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider"
             style={{ color: "var(--lab-text-subtle)" }}>
            Temperature
          </p>
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold font-mono" style={{ color: "#ef4444" }}>{temperature} °C</span>
            <span className="text-[9px]" style={{ color: "var(--lab-text-subtle)" }}>
              (×{temperatureFactor(temperature).toFixed(2)})
            </span>
          </div>
        </div>
        <input
          type="range"
          min={15} max={80} step={1}
          value={temperature}
          onChange={(e) => onSetTemp(Number(e.target.value))}
          disabled={isDone}
          className="w-full h-2 rounded-full appearance-none cursor-pointer disabled:opacity-40"
          style={{ accentColor: "#ef4444" }}
          aria-label="Temperature slider"
        />
        <div className="flex justify-between text-[9px] mt-0.5" style={{ color: "var(--lab-text-subtle)" }}>
          <span>15 °C (slow)</span>
          <span>80 °C (fast)</span>
        </div>
      </div>

      {/* Concentration */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider"
             style={{ color: "var(--lab-text-subtle)" }}>
            Concentration
          </p>
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold font-mono" style={{ color: "#3b82f6" }}>{concentration.toFixed(1)} M</span>
            <span className="text-[9px]" style={{ color: "var(--lab-text-subtle)" }}>
              (×{concentrationFactor(concentration).toFixed(2)})
            </span>
          </div>
        </div>
        <input
          type="range"
          min={0.1} max={2.0} step={0.1}
          value={concentration}
          onChange={(e) => onSetConc(Number(e.target.value))}
          disabled={isDone}
          className="w-full h-2 rounded-full appearance-none cursor-pointer disabled:opacity-40"
          style={{ accentColor: "#3b82f6" }}
          aria-label="Concentration slider"
        />
        <div className="flex justify-between text-[9px] mt-0.5" style={{ color: "var(--lab-text-subtle)" }}>
          <span>0.1 M (dilute)</span>
          <span>2.0 M (concentrated)</span>
        </div>
      </div>

      {/* Surface area */}
      <div className="px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-2"
           style={{ color: "var(--lab-text-subtle)" }}>
          Surface Area
        </p>
        <div className="grid grid-cols-2 gap-1">
          {SURFACE_AREA_OPTIONS.map((sa) => {
            const isSelected = surfaceArea === sa;
            return (
              <button
                key={sa}
                onClick={() => onSetSurface(sa)}
                disabled={isRunning || isDone}
                className="flex flex-col items-center py-2 px-1 rounded-lg border text-xs transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  borderColor: isSelected ? "var(--lab-blue-500)" : "var(--lab-glass-border)",
                  background:  isSelected ? "var(--lab-blue-50)" : "transparent",
                  color: "var(--lab-text-secondary)",
                }}
                aria-pressed={isSelected}
              >
                <span className="font-semibold">{SURFACE_AREA_LABELS[sa]}</span>
                <span className="text-[9px]" style={{ color: "var(--lab-text-subtle)" }}>
                  ×{SURFACE_AREA_FACTORS[sa]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rate summary */}
      <div className="px-4 py-2.5"
           style={{ background: "var(--lab-surface)", borderColor: "var(--lab-glass-border)" }}>
        <div className="flex items-center justify-between text-[10px]">
          <span style={{ color: "var(--lab-text-muted)" }}>Combined rate multiplier</span>
          <span className="text-sm font-black" style={{ color: "#2563eb" }}>×{rateMultiplier.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-[9px] mt-0.5"
             style={{ color: "var(--lab-text-subtle)" }}>
          <span>Estimated completion time</span>
          <span className="font-mono">~{(100 / (1.5 * rateMultiplier)).toFixed(0)} s</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 flex flex-col gap-1.5">
        {!isRunning && !isDone && (
          <button
            onClick={progress > 0 ? onStart : onStart}
            className="w-full py-2 rounded-lg text-xs font-semibold text-white transition-all duration-150 hover:opacity-90"
            style={{ background: "#22c55e" }}
          >
            {progress > 0 ? "Resume Reaction" : "Start Reaction"}
          </button>
        )}
        {isRunning && (
          <button
            onClick={onStop}
            className="w-full py-2 rounded-lg text-xs font-semibold text-white transition-all duration-150 hover:opacity-90"
            style={{ background: "#f59e0b" }}
          >
            Pause Reaction
          </button>
        )}

        {(progress > 0 || isDone) && (
          <button
            onClick={onResetRun}
            disabled={isRunning}
            className="w-full py-2 rounded-lg text-xs font-semibold border transition-all duration-150 hover:bg-blue-50 disabled:opacity-40"
            style={{ borderColor: "var(--lab-glass-border)", color: "var(--lab-text-muted)" }}
          >
            Reset Run (keep settings)
          </button>
        )}

        <button
          onClick={onReset}
          className="w-full py-2 rounded-lg text-xs font-semibold border transition-all duration-150 hover:bg-red-50"
          style={{ borderColor: "#fca5a5", color: "#dc2626" }}
        >
          Reset All
        </button>
      </div>
    </div>
  );
}
