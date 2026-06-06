"use client";

import type { FlameTestSampleId, ExperimentStatus, FlameTestRecord } from "@/lib/engine/types";
import { FLAME_SAMPLES } from "@/lib/engine/flame-test-engine";

const SAMPLES = Object.values(FLAME_SAMPLES);

interface Props {
  status:          ExperimentStatus;
  flameLit:        boolean;
  selectedSample:  FlameTestSampleId | null;
  loopDipped:      boolean;
  loopClean:       boolean;
  contaminated:    boolean;
  testHistory:     FlameTestRecord[];
  onLightBurner:   () => void;
  onSelectSample:  (id: FlameTestSampleId) => void;
  onDipLoop:       () => void;
  onPerformTest:   () => void;
  onCleanLoop:     () => void;
  onComplete:      () => void;
  onReset:         () => void;
}

function Btn({
  onClick, disabled, label, variant = "default",
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  variant?: "default" | "primary" | "danger" | "warning" | "success";
}) {
  const bg =
    variant === "primary"  ? "var(--lab-blue-600)"  :
    variant === "danger"   ? "#dc2626"              :
    variant === "warning"  ? "#d97706"              :
    variant === "success"  ? "#059669"              : "transparent";
  const fg = variant !== "default" ? "white" : "var(--lab-text-secondary)";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-2 rounded-lg text-xs font-semibold border transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
      style={{
        background: disabled ? "transparent" : bg,
        color: disabled ? "var(--lab-text-subtle)" : fg,
        borderColor: disabled ? "var(--lab-glass-border)" : (variant === "default" ? "var(--lab-glass-border)" : "transparent"),
      }}
    >
      {label}
    </button>
  );
}

export default function FlameTestControls({
  status, flameLit, selectedSample, loopDipped, loopClean,
  contaminated, testHistory,
  onLightBurner, onSelectSample, onDipLoop, onPerformTest,
  onCleanLoop, onComplete, onReset,
}: Props) {
  const isDone    = status === "completed" || status === "failed";
  const isRunning = status === "running";
  const uniqueSamples = new Set(testHistory.map((r) => r.sampleId)).size;

  return (
    <div className="flex flex-col gap-0 divide-y" style={{ borderColor: "var(--lab-glass-border)" }}>

      {/* 1 — Light burner */}
      <div className="px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1"
           style={{ color: "var(--lab-text-subtle)" }}>
          Step 1 — Light the Bunsen Burner
        </p>
        <p className="text-[9.5px] mb-2" style={{ color: "#64748b", lineHeight: 1.4 }}>
          The Bunsen burner heats the sample to ~1700 °C, exciting metal ions.
        </p>
        <Btn
          onClick={onLightBurner}
          disabled={flameLit || isDone}
          variant="primary"
          label={flameLit ? "✓ Burner lit" : "🔥 Light Burner"}
        />
      </div>

      {/* 2 — Sample selection */}
      <div className="px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1"
           style={{ color: "var(--lab-text-subtle)" }}>
          Step 2 — Choose a Metal Salt
        </p>
        <p className="text-[9.5px] mb-2" style={{ color: "#64748b", lineHeight: 1.4 }}>
          Each metal ion emits a unique colour when heated. Select one to test.
        </p>
        <div className="grid grid-cols-1 gap-1">
          {SAMPLES.map((s) => {
            const isSelected = selectedSample === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onSelectSample(s.id)}
                disabled={!flameLit || isRunning || isDone}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs text-left transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  borderColor: isSelected ? s.flameColor : "var(--lab-glass-border)",
                  background:  isSelected ? `${s.flameColor}18` : "transparent",
                  color: "var(--lab-text-secondary)",
                }}
                aria-pressed={isSelected}
              >
                <span
                  className="w-4 h-4 rounded-full flex-shrink-0 border"
                  style={{ background: s.flameColor, borderColor: s.flameColor }}
                />
                <span className="flex-1 truncate font-medium">{s.name}</span>
                <span className="text-[9px] font-mono" style={{ color: "var(--lab-text-subtle)" }}>
                  {s.ion}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 — Loop operations */}
      <div className="px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1"
           style={{ color: "var(--lab-text-subtle)" }}>
          Step 3 — Coat the Wire Loop
        </p>
        <p className="text-[9.5px] mb-2" style={{ color: "#64748b", lineHeight: 1.4 }}>
          Dip the nichrome wire into the sample to coat it. Must be clean for each test.
        </p>
        <div className="flex flex-col gap-1.5">
          {!loopClean && (
            <Btn
              onClick={onCleanLoop}
              disabled={loopClean || isRunning || isDone}
              variant="warning"
              label="🧪 Clean Loop (HCl)"
            />
          )}
          <Btn
            onClick={onDipLoop}
            disabled={!flameLit || !selectedSample || loopDipped || isRunning || isDone}
            variant="default"
            label={loopDipped ? "✓ Loop coated" : "Dip Loop in Sample"}
          />
          {contaminated && (
            <p className="text-[10px] px-1" style={{ color: "#d97706" }}>
              ⚠ Contamination risk — clean before testing for accurate results.
            </p>
          )}
        </div>
      </div>

      {/* 4 — Test */}
      <div className="px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1"
           style={{ color: "var(--lab-text-subtle)" }}>
          Step 4 — Observe the Flame Colour
        </p>
        <p className="text-[9.5px] mb-2" style={{ color: "#64748b", lineHeight: 1.4 }}>
          Hold the coated loop in the flame. The metal ions excite and emit a characteristic colour.
        </p>
        <Btn
          onClick={onPerformTest}
          disabled={!loopDipped || isRunning || isDone}
          variant="success"
          label={isRunning ? "🔬 Observing flame colour…" : "Hold Loop in Flame →"}
        />
      </div>

      {/* Summary + Complete */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2 text-[10px]"
             style={{ color: "var(--lab-text-subtle)" }}>
          <span>Tests completed: <strong style={{ color: "var(--lab-text-secondary)" }}>{testHistory.length}</strong></span>
          <span>Unique ions: <strong style={{ color: "var(--lab-blue-600)" }}>{uniqueSamples}</strong></span>
        </div>

        {testHistory.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {testHistory.map((rec) => (
              <span
                key={rec.id}
                className="px-1.5 py-0.5 rounded text-[9px] font-semibold border"
                style={{
                  background: `${rec.flameColor}22`,
                  borderColor: rec.flameColor,
                  color: "var(--lab-text-secondary)",
                }}
                title={`${FLAME_SAMPLES[rec.sampleId].name}: ${rec.colorName}`}
              >
                {FLAME_SAMPLES[rec.sampleId].ion}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Btn
            onClick={onComplete}
            disabled={testHistory.length < 1 || isRunning || isDone}
            variant="primary"
            label="Complete Experiment"
          />
          <Btn
            onClick={onReset}
            disabled={false}
            variant="danger"
            label="Reset Experiment"
          />
        </div>
      </div>
    </div>
  );
}
