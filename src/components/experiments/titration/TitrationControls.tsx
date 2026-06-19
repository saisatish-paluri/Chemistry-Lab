"use client";

import type { IndicatorName, TitrantFlowRate } from "@/lib/engine/types";
import { INDICATORS } from "@/lib/engine/chemistry";

const INDICATOR_LIST: Array<{ id: IndicatorName; color: string }> = [
  { id: "phenolphthalein", color: "#f472b6" },
  { id: "litmus",          color: "#5555d5" },
  { id: "methylOrange",    color: "#f97316" },
];

const FLOW_RATES: Array<{ rate: TitrantFlowRate; label: string; hint: string }> = [
  { rate: 0.1, label: "0.1", hint: "Drop-by-drop (precise)"  },
  { rate: 0.5, label: "0.5", hint: "Slow"                    },
  { rate: 1,   label: "1.0", hint: "Normal"                  },
  { rate: 5,   label: "5.0", hint: "Fast (coarse)"           },
];

interface Props {
  indicatorAdded:    boolean;
  selectedIndicator: IndicatorName | null;
  flowRate:          TitrantFlowRate;
  status:            string;
  isRunning:         boolean;
  volumeAdded:       number;
  pH:                number;
  trialCount?:       number;
  onAddIndicator:    (ind: IndicatorName) => void;
  onAddTitrant:      () => void;
  onSetFlowRate:     (rate: TitrantFlowRate) => void;
  onReset:           () => void;
  onReplicate?:      () => void;
}

// ── SVG icons ─────────────────────────────────────────────────────────────────
function IndicatorIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="5.2" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="6.5" cy="6.5" r="2.2" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function FlowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M6.5 2v3.5M5 4l1.5 1.5L8 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="6.5" cy="9" rx="2.8" ry="2" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function TitrantIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <rect x="5" y="1.5" width="3" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 6.5L2.5 10a1 1 0 00.9 1.5h6.2a1 1 0 00.9-1.5L9 6.5"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalcIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 4h5M4 6.5h3M4 9h5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

export default function TitrationControls({
  indicatorAdded, selectedIndicator, flowRate, status, isRunning,
  volumeAdded, pH, trialCount = 0,
  onAddIndicator, onAddTitrant, onSetFlowRate, onReset, onReplicate,
}: Props) {
  const done      = status === "completed" || status === "failed";
  const canTitrate = indicatorAdded && !done;

  // Live chemistry
  const acidMoles0  = 0.1 * 0.025;
  const baseMolesIn = 0.1 * (volumeAdded / 1000);
  const acidLeft    = Math.max(0, acidMoles0 - baseMolesIn);
  const baseExcess  = Math.max(0, baseMolesIn - acidMoles0);
  const volNeeded   = Math.max(0, 25 - volumeAdded);
  const pastEquiv   = volumeAdded > 25;
  const neutralPct  = Math.min(100, (volumeAdded / 25) * 100);

  return (
    <div className="flex flex-col gap-3">

      {/* ── INDICATOR ── */}
      <div className="lab-ctrl-section">
        <div className="lab-ctrl-section-hdr">
          <span className="lab-ctrl-section-hdr-icon"><IndicatorIcon /></span>
          <span className="lab-ctrl-section-hdr-title">Indicator</span>
          {indicatorAdded && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: "rgba(5,150,105,0.10)", color: "#059669" }}>
              ✓ Added
            </span>
          )}
        </div>
        <div className="flex flex-col">
          {INDICATOR_LIST.map(({ id, color }) => {
            const def      = INDICATORS[id];
            const isActive = selectedIndicator === id;
            const disabled = indicatorAdded || done;
            return (
              <button
                key={id}
                onClick={() => !disabled && onAddIndicator(id)}
                disabled={disabled}
                className="flex items-start gap-2.5 px-3 py-2.5 text-xs font-medium text-left transition-all duration-150 border-b last:border-b-0"
                style={{
                  borderColor: "rgba(148,163,184,0.14)",
                  background:  isActive ? `${color}12` : "transparent",
                  color:       isActive ? color : "var(--lab-text-secondary)",
                  opacity:     (indicatorAdded && !isActive) || done ? 0.38 : 1,
                  cursor:      disabled ? "not-allowed" : "pointer",
                }}
              >
                <span className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5" style={{ background: color }} />
                <span className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-semibold">{def.name}</span>
                  <span className="text-[9.5px] leading-tight opacity-70 truncate"
                    style={{ color: isActive ? color : "var(--lab-text-subtle)" }}>
                    pH {def.transitionLow}–{def.transitionHigh}
                  </span>
                </span>
                {isActive && (
                  <span className="ml-auto text-[10px] font-bold flex-shrink-0" style={{ color }}>✓</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── FLOW RATE ── */}
      <div className="lab-ctrl-section">
        <div className="lab-ctrl-section-hdr">
          <span className="lab-ctrl-section-hdr-icon"><FlowIcon /></span>
          <span className="lab-ctrl-section-hdr-title">Flow Rate</span>
          <span className="text-[10px] font-bold font-mono flex-shrink-0"
            style={{ color: "var(--lab-blue-600)" }}>
            {flowRate} mL/click
          </span>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-4 gap-1.5 mb-2">
            {FLOW_RATES.map(({ rate, label, hint }) => (
              <button
                key={rate}
                onClick={() => onSetFlowRate(rate)}
                disabled={done}
                title={hint}
                className="py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150"
                style={{
                  borderColor: flowRate === rate ? "var(--lab-blue-600)" : "var(--lab-glass-border)",
                  background:  flowRate === rate ? "var(--lab-blue-600)" : "rgba(255,255,255,0.6)",
                  color:       flowRate === rate ? "white" : "var(--lab-text-secondary)",
                  opacity:     done ? 0.45 : 1,
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-[9.5px]" style={{ color: "var(--lab-text-subtle)" }}>
            Switch to 0.1 mL within ±3 mL of the endpoint
          </p>
        </div>
      </div>

      {/* ── ADD TITRANT ── */}
      <div className="lab-ctrl-section">
        <div className="lab-ctrl-section-hdr">
          <span className="lab-ctrl-section-hdr-icon"><TitrantIcon /></span>
          <span className="lab-ctrl-section-hdr-title">Add Titrant</span>
        </div>
        <div className="p-3 flex flex-col gap-2">
          <button
            onClick={onAddTitrant}
            disabled={!canTitrate}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-150
                       hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: canTitrate
                ? "linear-gradient(135deg,#2563eb 0%,#0ea5e9 100%)"
                : "var(--lab-slate-300)",
              boxShadow: canTitrate ? "0 4px 14px rgba(37,99,235,0.28)" : "none",
            }}
          >
            {isRunning
              ? `Add ${flowRate} mL NaOH`
              : indicatorAdded
                ? "Add Titrant (NaOH)"
                : "Add Indicator First"}
          </button>

          {/* Neutralisation progress bar */}
          {indicatorAdded && (
            <div>
              <div className="flex justify-between mb-1 text-[9px]"
                style={{ color: "var(--lab-text-subtle)" }}>
                <span>Neutralisation</span>
                <span className="font-semibold" style={{ color: "var(--lab-text-secondary)" }}>
                  {neutralPct.toFixed(0)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden"
                style={{ background: "rgba(148,163,184,0.18)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${neutralPct}%`,
                    background: neutralPct >= 100
                      ? "linear-gradient(90deg,#22c55e,#4ade80)"
                      : "linear-gradient(90deg,#3b82f6,#0ea5e9)",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── LIVE CALCULATIONS ── */}
      <div className="lab-ctrl-section">
        <div className="lab-ctrl-section-hdr">
          <span className="lab-ctrl-section-hdr-icon"><CalcIcon /></span>
          <span className="lab-ctrl-section-hdr-title">Calculations</span>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ background: "rgba(37,99,235,0.08)", color: "var(--lab-blue-600)" }}>
            Live
          </span>
        </div>
        <div className="p-3 space-y-2.5">

          {/* n = MV formula block */}
          <div className="rounded-lg px-2.5 py-2 text-[10px]"
            style={{ background: "rgba(37,99,235,0.05)", border: "1px solid rgba(147,197,253,0.35)" }}>
            <p className="font-mono text-[9px] mb-0.5" style={{ color: "#1e40af" }}>
              n = M × V
            </p>
            <CalcRow
              label="n(HCl₀)"
              value="0.1 mol/L × 25 mL"
              result="= 0.00250 mol"
              color="#1e40af"
            />
            <CalcRow
              label="n(NaOH)"
              value={`0.1 mol/L × ${volumeAdded.toFixed(2)} mL`}
              result={`= ${baseMolesIn.toFixed(5)} mol`}
              color="#059669"
            />
          </div>

          {/* Acid / base balance */}
          <div className="rounded-lg px-2.5 py-2 text-[10px]"
            style={{ background: "rgba(148,163,184,0.06)", border: "1px solid rgba(148,163,184,0.18)" }}>
            {!pastEquiv ? (
              <CalcRow
                label="HCl remaining"
                value="n(HCl₀) − n(NaOH)"
                result={`= ${acidLeft.toFixed(5)} mol`}
                color="#dc2626"
              />
            ) : (
              <CalcRow
                label="NaOH excess"
                value="n(NaOH) − n(HCl₀)"
                result={`= ${baseExcess.toFixed(5)} mol`}
                color="#7c3aed"
              />
            )}
            <CalcRow
              label="Vol. still needed"
              value={volNeeded > 0 ? "n(HCl) ÷ M(NaOH)" : "Equivalence reached"}
              result={volNeeded > 0 ? `≈ ${volNeeded.toFixed(2)} mL` : "✓ Done"}
              color={volNeeded <= 0 ? "#059669" : "#475569"}
            />
          </div>

          {/* M₁V₁ = M₂V₂ */}
          <div className="rounded-lg px-2.5 py-2 text-[10px]"
            style={{ background: "rgba(124,58,237,0.04)", border: "1px solid rgba(167,139,250,0.22)" }}>
            <p className="font-mono text-[9px] mb-1" style={{ color: "#7c3aed" }}>
              M₁V₁ = M₂V₂  (at equiv. point)
            </p>
            <p className="font-mono text-[9px]" style={{ color: "#6d28d9" }}>
              0.1 × 25 = 0.1 × V₂  →  V₂ = 25.0 mL
            </p>
            <p className="font-mono text-[9px] mt-0.5" style={{ color: "#94a3b8" }}>
              Current: (0.1)(25) = (0.1)({volumeAdded.toFixed(2)}) = {(0.1 * volumeAdded).toFixed(3)}
            </p>
          </div>

          {/* pH live */}
          <div className="rounded-lg px-2.5 py-2"
            style={{ background: "rgba(37,99,235,0.04)", border: "1px solid rgba(147,197,253,0.28)" }}>
            <p className="text-[9px] mb-1" style={{ color: "var(--lab-text-subtle)" }}>
              Current pH
            </p>
            <p className="font-mono text-[18px] font-black leading-none"
              style={{
                color: pH < 6.5 ? "#dc2626" : pH > 7.5 ? "#059669" : "#2563eb",
                transition: "color 0.8s ease",
              }}>
              {pH.toFixed(3)}
            </p>
            <p className="text-[9px] mt-0.5" style={{ color: "var(--lab-text-subtle)" }}>
              {pH < 7 ? `[H⁺] = ${Math.pow(10, -pH).toExponential(2)} mol/L` : `[OH⁻] = ${Math.pow(10, -(14 - pH)).toExponential(2)} mol/L`}
            </p>
          </div>
        </div>
      </div>

      {/* ── Replicate / Reset ── */}
      <div className="flex flex-col gap-2">
        {done && onReplicate && (
          <button
            onClick={onReplicate}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
              boxShadow: "0 4px 12px rgba(16,185,129,0.2)",
            }}
          >
            Run Replicate Trial (completed: {trialCount})
          </button>
        )}
        <button
          onClick={onReset}
          className="w-full py-2 rounded-xl text-xs font-semibold border transition-all duration-150 hover:bg-red-50 active:scale-[0.98]"
          style={{ borderColor: "#fecaca", color: "#dc2626" }}
        >
          Reset Entire Session
        </button>
      </div>
    </div>
  );
}

// ── Shared calc row ───────────────────────────────────────────────────────────
function CalcRow({
  label, value, result, color,
}: { label: string; value: string; result: string; color: string }) {
  return (
    <div className="flex items-start justify-between gap-1 mb-0.5 last:mb-0">
      <div className="flex flex-col min-w-0">
        <span className="font-semibold text-[9.5px]" style={{ color: "var(--lab-text-tertiary)" }}>
          {label}
        </span>
        <span className="font-mono text-[8.5px]" style={{ color: "var(--lab-text-subtle)" }}>
          {value}
        </span>
      </div>
      <span className="font-mono text-[9.5px] font-bold flex-shrink-0" style={{ color }}>
        {result}
      </span>
    </div>
  );
}
