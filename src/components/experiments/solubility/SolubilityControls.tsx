"use client";

import type { SolutionId, ExperimentStatus, SolubilityTestRecord, SolubilityState } from "@/lib/engine/types";
import { SOLUTIONS, calculatePrecipitation } from "@/lib/engine/solubility-engine";

const SOLUTION_LIST = Object.values(SOLUTIONS);

interface Props {
  status:          ExperimentStatus;
  solutionA:       SolutionId | null;
  solutionB:       SolutionId | null;
  testHistory:     SolubilityTestRecord[];
  onSelectA:       (id: SolutionId) => void;
  onSelectB:       (id: SolutionId) => void;
  onCombine:       () => void;
  onResetMix:      () => void;
  onComplete:      () => void;
  onReset:         () => void;
  temperature:     number;
  volumeA:         number;
  volumeB:         number;
  concA:           number;
  concB:           number;
  onUpdateComposition: (changes: Partial<Pick<SolubilityState, "temperature" | "volumeA" | "volumeB" | "concA" | "concB">>) => void;
}

export default function SolubilityControls({
  status, solutionA, solutionB, testHistory,
  onSelectA, onSelectB, onCombine, onResetMix, onComplete, onReset,
  temperature, volumeA, volumeB, concA, concB, onUpdateComposition,
}: Props) {
  const isDone    = status === "completed" || status === "failed";
  const isRunning = status === "running";
  const canCombine = !!solutionA && !!solutionB && !isRunning && !isDone;

  // Preview the precipitate for selected pair
  const calc = solutionA && solutionB
    ? calculatePrecipitation(solutionA, solutionB, temperature, volumeA, volumeB, concA, concB)
    : null;

  return (
    <div className="flex flex-col gap-0 divide-y" style={{ borderColor: "var(--lab-glass-border)" }}>

      {/* Solution A Selection */}
      <div className="px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-2"
           style={{ color: "var(--lab-text-subtle)" }}>
          Solution A
        </p>
        <div className="flex flex-col gap-1">
          {SOLUTION_LIST.map((sol) => {
            const isSelected = solutionA === sol.id;
            const isDisabled = sol.id === solutionB || isRunning || isDone;
            return (
              <button
                key={sol.id}
                onClick={() => onSelectA(sol.id)}
                disabled={isDisabled}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs text-left transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  borderColor: isSelected ? "var(--lab-blue-500)" : "var(--lab-glass-border)",
                  background:  isSelected ? "var(--lab-blue-50)" : "transparent",
                  color: "var(--lab-text-secondary)",
                }}
                aria-pressed={isSelected}
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0 border"
                  style={{ background: sol.color, borderColor: "#94a3b8" }}
                />
                <span className="flex-1">{sol.name}</span>
                {isSelected && (
                  <span className="font-mono text-[9px] text-cyan-600 font-bold">
                    {concA.toFixed(2)} M
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Solution B Selection */}
      <div className="px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-2"
           style={{ color: "var(--lab-text-subtle)" }}>
          Solution B
        </p>
        <div className="flex flex-col gap-1">
          {SOLUTION_LIST.map((sol) => {
            const isSelected = solutionB === sol.id;
            const isDisabled = sol.id === solutionA || isRunning || isDone;
            return (
              <button
                key={sol.id}
                onClick={() => onSelectB(sol.id)}
                disabled={isDisabled}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs text-left transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  borderColor: isSelected ? "#059669" : "var(--lab-glass-border)",
                  background:  isSelected ? "#f0fdf4" : "transparent",
                  color: "var(--lab-text-secondary)",
                }}
                aria-pressed={isSelected}
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0 border"
                  style={{ background: sol.color, borderColor: "#94a3b8" }}
                />
                <span className="flex-1">{sol.name}</span>
                {isSelected && (
                  <span className="font-mono text-[9px] text-emerald-600 font-bold">
                    {concB.toFixed(2)} M
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reaction Conditions */}
      {solutionA && solutionB && (
        <div className="px-4 py-3 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider"
             style={{ color: "var(--lab-text-subtle)" }}>
            Reaction Conditions
          </p>
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span>Reaction Temperature</span>
              <span className="font-bold text-cyan-600">{temperature} °C</span>
            </div>
            <input
              type="range"
              min="5"
              max="90"
              step="1"
              value={temperature}
              disabled={isRunning || isDone}
              onChange={(e) => onUpdateComposition({ temperature: parseFloat(e.target.value) })}
              className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-cyan-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-2.5">
              <p className="text-[9.5px] font-bold text-slate-500 uppercase">Solution A</p>
              <div>
                <div className="flex justify-between text-[10.5px] mb-0.5">
                  <span>Volume</span>
                  <span className="font-bold text-slate-700">{volumeA} mL</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="30"
                  step="1"
                  value={volumeA}
                  disabled={isRunning || isDone}
                  onChange={(e) => onUpdateComposition({ volumeA: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-cyan-600"
                />
              </div>
              <div>
                <div className="flex justify-between text-[10.5px] mb-0.5">
                  <span>Conc.</span>
                  <span className="font-bold text-slate-700">{concA.toFixed(2)} M</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="1.0"
                  step="0.01"
                  value={concA}
                  disabled={isRunning || isDone}
                  onChange={(e) => onUpdateComposition({ concA: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-cyan-600"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="text-[9.5px] font-bold text-slate-500 uppercase">Solution B</p>
              <div>
                <div className="flex justify-between text-[10.5px] mb-0.5">
                  <span>Volume</span>
                  <span className="font-bold text-slate-700">{volumeB} mL</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="30"
                  step="1"
                  value={volumeB}
                  disabled={isRunning || isDone}
                  onChange={(e) => onUpdateComposition({ volumeB: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-cyan-600"
                />
              </div>
              <div>
                <div className="flex justify-between text-[10.5px] mb-0.5">
                  <span>Conc.</span>
                  <span className="font-bold text-slate-700">{concB.toFixed(2)} M</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="1.0"
                  step="0.01"
                  value={concB}
                  disabled={isRunning || isDone}
                  onChange={(e) => onUpdateComposition({ concB: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-cyan-600"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {solutionA && solutionB && calc && (
        <div className="px-4 py-2.5 text-[10.5px]"
             style={{ background: calc.hasPrecipitate ? "rgba(254,243,199,0.5)" : "rgba(240,253,244,0.5)" }}>
          <span style={{ color: "var(--lab-text-subtle)" }}>Prediction: </span>
          <span className="font-semibold" style={{ color: calc.hasPrecipitate ? "#92400e" : "#166534" }}>
            {calc.hasPrecipitate
              ? `${calc.netIonic.split("→")[1].trim()}↓ (mass ≈ ${(calc.precipitateMass * 1000).toFixed(1)} mg)`
              : "No precipitate expected (Qsp < Ksp)"}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 flex flex-col gap-1.5">
        <button
          onClick={onCombine}
          disabled={!canCombine}
          className="w-full py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
          style={{
            background: canCombine ? "var(--lab-blue-600)" : "transparent",
            color: canCombine ? "white" : "var(--lab-text-subtle)",
            border: canCombine ? "none" : "1px solid var(--lab-glass-border)",
          }}
        >
          Pour & Combine Solutions
        </button>

        {testHistory.length > 0 && !isDone && (
          <button
            onClick={onResetMix}
            disabled={isRunning}
            className="w-full py-2 rounded-lg text-xs font-semibold border transition-all duration-150 disabled:opacity-40 hover:bg-blue-50"
            style={{ borderColor: "var(--lab-glass-border)", color: "var(--lab-text-muted)" }}
          >
            New Combination
          </button>
        )}
      </div>

      {/* History */}
      {testHistory.length > 0 && (
        <div className="px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2"
             style={{ color: "var(--lab-text-subtle)" }}>
            History ({testHistory.length})
          </p>
          <div className="flex flex-col gap-1">
            {testHistory.map((rec) => (
              <div key={rec.id} className="flex items-center gap-2 text-[10px] px-2 py-1.5 rounded-lg"
                   style={{ background: rec.hasPrecipitate ? "rgba(254,243,199,0.6)" : "rgba(240,253,244,0.6)" }}>
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    background: rec.hasPrecipitate && rec.precipitate ? rec.precipitate.color : "#d1fae5",
                    border: "1px solid #94a3b8",
                  }}
                />
                <span style={{ color: "var(--lab-text-secondary)" }}>
                  {SOLUTIONS[rec.solutionA].formula.split(" ")[0]} + {SOLUTIONS[rec.solutionB].formula.split(" ")[0]}
                </span>
                <span className="ml-auto font-semibold" style={{ color: rec.hasPrecipitate ? "#92400e" : "#166534" }}>
                  {rec.hasPrecipitate && rec.precipitate ? `${rec.precipitate.formula}↓` : "NR"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complete / Reset */}
      <div className="px-4 py-3 flex flex-col gap-1.5">
        <button
          onClick={onComplete}
          disabled={testHistory.length < 1 || isRunning || isDone}
          className="w-full py-2 rounded-lg text-xs font-semibold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
          style={{ background: "#059669", color: "white" }}
        >
          Complete Experiment
        </button>
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
