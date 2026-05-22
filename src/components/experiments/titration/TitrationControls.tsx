"use client";

import type { IndicatorName, TitrantFlowRate } from "@/lib/engine/types";
import { INDICATORS } from "@/lib/engine/chemistry";

const INDICATOR_LIST: Array<{ id: IndicatorName; color: string }> = [
  { id: "phenolphthalein", color: "#f472b6" },
  { id: "litmus",          color: "#5555d5" },
  { id: "methylOrange",    color: "#f97316" },
];

const FLOW_RATES: Array<{ rate: TitrantFlowRate; label: string; hint: string }> = [
  { rate: 0.1, label: "0.1", hint: "Drop-by-drop" },
  { rate: 0.5, label: "0.5", hint: "Slow"         },
  { rate: 1,   label: "1.0", hint: "Normal"       },
  { rate: 5,   label: "5.0", hint: "Fast"         },
];

interface Props {
  indicatorAdded:    boolean;
  selectedIndicator: IndicatorName | null;
  flowRate:          TitrantFlowRate;
  status:            string;
  isRunning:         boolean;
  onAddIndicator:    (ind: IndicatorName) => void;
  onAddTitrant:      () => void;
  onSetFlowRate:     (rate: TitrantFlowRate) => void;
  onReset:           () => void;
}

export default function TitrationControls({
  indicatorAdded, selectedIndicator, flowRate, status, isRunning,
  onAddIndicator, onAddTitrant, onSetFlowRate, onReset,
}: Props) {
  const done = status === "completed" || status === "failed";
  const canTitrate = indicatorAdded && !done;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* ── Indicator selection ── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-1.5"
          style={{ color: "var(--lab-text-muted)" }}>
          Indicator
        </p>
        <div className="flex flex-col gap-1.5">
          {INDICATOR_LIST.map(({ id, color }) => {
            const def      = INDICATORS[id];
            const isActive = selectedIndicator === id;
            const disabled = indicatorAdded || done;
            return (
              <button
                key={id}
                onClick={() => !disabled && onAddIndicator(id)}
                disabled={disabled}
                className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-medium text-left transition-all duration-150"
                style={{
                  borderColor: isActive ? color : "var(--lab-glass-border)",
                  background:  isActive ? `${color}18` : "transparent",
                  color:       isActive ? color : "var(--lab-text-secondary)",
                  opacity:     (indicatorAdded && !isActive) || done ? 0.4 : 1,
                  cursor:      disabled ? "not-allowed" : "pointer",
                }}
              >
                <span className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
                  style={{ background: color }} />
                <span className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-semibold">{def.name}</span>
                  <span className="text-[9.5px] leading-tight opacity-70 truncate"
                    style={{ color: isActive ? color : "var(--lab-text-subtle)" }}>
                    pH {def.transitionLow}–{def.transitionHigh}
                  </span>
                </span>
                {isActive && (
                  <span className="ml-auto text-[10px] font-bold flex-shrink-0"
                    style={{ color }}>✓</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Flow rate ── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-1.5"
          style={{ color: "var(--lab-text-muted)" }}>
          Flow Rate (mL / addition)
        </p>
        <div className="grid grid-cols-4 gap-1">
          {FLOW_RATES.map(({ rate, label, hint }) => (
            <button
              key={rate}
              onClick={() => onSetFlowRate(rate)}
              disabled={done}
              title={hint}
              className="py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150"
              style={{
                borderColor: flowRate === rate ? "var(--lab-blue-600)" : "var(--lab-glass-border)",
                background:  flowRate === rate ? "var(--lab-blue-600)" : "transparent",
                color:       flowRate === rate ? "white" : "var(--lab-text-secondary)",
                opacity:     done ? 0.45 : 1,
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-[9.5px] mt-1" style={{ color: "var(--lab-text-subtle)" }}>
          Near endpoint, use 0.1 mL for precision
        </p>
      </div>

      {/* ── Add titrant ── */}
      <button
        onClick={onAddTitrant}
        disabled={!canTitrate}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150
                   hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: canTitrate
            ? "linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)"
            : "var(--lab-slate-300)",
          boxShadow: canTitrate ? "0 4px 14px rgba(37,99,235,0.28)" : "none",
        }}
      >
        {isRunning ? `Add ${flowRate} mL NaOH` : indicatorAdded ? "Add Titrant" : "Add Indicator First"}
      </button>

      {/* ── Reset ── */}
      <button
        onClick={onReset}
        className="w-full py-2 rounded-xl text-xs font-semibold border transition-all duration-150 hover:bg-red-50"
        style={{ borderColor: "#fecaca", color: "#dc2626" }}
      >
        Reset Experiment
      </button>
    </div>
  );
}
