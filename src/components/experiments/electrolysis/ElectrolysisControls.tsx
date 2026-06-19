"use client";

import type { ElectrolyteId, ElectrodeMaterial } from "@/lib/engine/types";
import { ELECTROLYTES } from "@/lib/engine/electrolysis-engine";

const ELECTROLYTE_IDS: ElectrolyteId[] = [
  "sodium-chloride", "sulfuric-acid", "copper-sulfate", "sodium-hydroxide", "distilled-water",
];

const ELECTRODE_MATERIALS: ElectrodeMaterial[] = ["carbon", "platinum", "copper"];

interface Props {
  electrolyte:     ElectrolyteId | null;
  electrodesIn:    boolean;
  electrodeMaterial?: string;
  circuitComplete: boolean;
  current:         number;
  voltage:         number;
  status:          string;
  isRunning:       boolean;
  onSetElectrolyte:    (id: ElectrolyteId) => void;
  onInsertElectrodes:  (material: import("@/lib/engine/types").ElectrodeMaterial) => void;
  onConnectCircuit:    () => void;
  onDisconnectCircuit: () => void;
  onStart:             () => void;
  onStop:              () => void;
  onSetVoltage:        (v: number) => void;
  onReset:             () => void;
}

export default function ElectrolysisControls({
  electrolyte, electrodesIn, electrodeMaterial, circuitComplete, current, voltage, status, isRunning,
  onSetElectrolyte, onInsertElectrodes, onConnectCircuit, onDisconnectCircuit,
  onStart, onStop, onSetVoltage, onReset,
}: Props) {
  const done = status === "completed" || status === "failed";

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* ── Electrolyte ── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-1.5"
          style={{ color: "var(--lab-text-muted)" }}>
          Electrolyte
        </p>
        <div className="flex flex-col gap-1.5">
          {ELECTROLYTE_IDS.map((id) => {
            const p        = ELECTROLYTES[id];
            const isActive = electrolyte === id;
            return (
              <button
                key={id}
                onClick={() => !done && onSetElectrolyte(id)}
                disabled={done || isRunning}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium text-left transition-all duration-150"
                style={{
                  borderColor: isActive ? "var(--lab-blue-600)" : "var(--lab-glass-border)",
                  background:  isActive ? "rgba(37,99,235,0.08)" : "transparent",
                  color:       isActive ? "var(--lab-blue-700)" : "var(--lab-text-secondary)",
                  opacity:     (done || isRunning) && !isActive ? 0.45 : 1,
                  cursor:      done || isRunning ? "not-allowed" : "pointer",
                }}
              >
                <span className="w-3 h-3 rounded-full flex-shrink-0 border"
                  style={{ background: p.liquidColor, borderColor: "rgba(0,0,0,0.1)" }} />
                <span className="flex-1 font-medium">{p.name}</span>
                {!p.isConductive && (
                  <span className="text-[9px] text-amber-600 font-semibold">non-cond.</span>
                )}
                {isActive && (
                  <span className="text-[10px] font-bold" style={{ color: "var(--lab-blue-600)" }}>✓</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Electrode Material Selection ── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-1.5"
          style={{ color: "var(--lab-text-muted)" }}>
          Electrode Material
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {ELECTRODE_MATERIALS.map((mat) => {
            const isActive = electrodeMaterial === mat;
            return (
              <button
                key={mat}
                disabled={electrodesIn || !electrolyte || done}
                onClick={() => onInsertElectrodes(mat)}
                className="py-2 text-[10px] font-bold rounded-xl border transition-all uppercase"
                style={{
                  borderColor: isActive ? "var(--lab-blue-600)" : "var(--lab-glass-border)",
                  background:  isActive ? "rgba(37,99,235,0.08)" : "transparent",
                  color:       isActive ? "var(--lab-blue-700)" : "var(--lab-text-secondary)",
                  opacity:     (electrodesIn && !isActive) || !electrolyte || done ? 0.4 : 1,
                }}
              >
                {mat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Setup steps ── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl border"
             style={{
               borderColor: electrodesIn ? "#86efac" : "var(--lab-glass-border)",
               background: electrodesIn ? "rgba(134,239,172,0.12)" : "transparent",
               color: electrodesIn ? "#15803d" : "var(--lab-text-secondary)"
             }}>
          <span className="w-5 h-5 rounded-full flex items-center justify-center border text-[10px]"
                style={{ background: electrodesIn ? "#22c55e" : "transparent", color: electrodesIn ? "white" : "inherit" }}>
            {electrodesIn ? "✓" : "⚡"}
          </span>
          {electrodesIn ? `Electrodes Inserted (${electrodeMaterial?.toUpperCase()})` : "Select material to insert"}
        </div>

        <StepBtn
          label={circuitComplete ? "Disconnect Circuit" : "Connect Circuit"}
          done={circuitComplete}
          disabled={!electrodesIn || done}
          onClick={circuitComplete ? onDisconnectCircuit : onConnectCircuit}
          icon="🔌"
        />
      </div>

      {/* ── DC Voltage slider ── */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--lab-text-muted)" }}>
            DC Voltage (V)
          </span>
          <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md"
            style={{ background: "rgba(37,99,235,0.08)", color: "var(--lab-blue-600)" }}>
            {voltage.toFixed(1)} V
          </span>
        </div>
        <input
          type="range" min={0} max={12} step={0.5}
          value={voltage}
          onChange={(e) => onSetVoltage(parseFloat(e.target.value))}
          disabled={done}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-[9.5px] mt-0.5"
          style={{ color: "var(--lab-text-subtle)" }}>
          <span>0V</span><span>12V</span>
        </div>

        {/* Derived current readout */}
        {electrolyte && current > 0 && (
          <div className="flex items-center justify-between mt-1.5 px-2.5 py-1.5 rounded-lg text-[10px]"
            style={{ background: "rgba(37,99,235,0.05)", border: "1px solid var(--lab-glass-border)" }}>
            <span style={{ color: "var(--lab-text-subtle)" }}>Effective current</span>
            <span className="font-bold font-mono" style={{ color: "var(--lab-blue-600)" }}>
              {current.toFixed(2)} A
            </span>
          </div>
        )}
        <p className="text-[9.5px] mt-1" style={{ color: "var(--lab-text-subtle)" }}>
          Higher voltage → faster gas evolution
        </p>
      </div>

      {/* ── Start / Stop ── */}
      <button
        onClick={isRunning ? onStop : onStart}
        disabled={!circuitComplete || done}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150
                   hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: (!circuitComplete || done)
            ? "var(--lab-slate-300)"
            : isRunning
              ? "linear-gradient(135deg, #ef4444 0%, #f97316 100%)"
              : "linear-gradient(135deg, #059669 0%, #22d3ee 100%)",
          boxShadow: (!circuitComplete || done) ? "none" : "0 4px 14px rgba(37,99,235,0.2)",
        }}
      >
        {isRunning ? "⏹ Stop Power" : "▶ Start Electrolysis"}
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

function StepBtn({ label, done, disabled, onClick, icon }: {
  label: string; done: boolean; disabled: boolean;
  onClick: () => void; icon: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled && !done}
      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-150"
      style={{
        borderColor: done ? "#86efac" : "var(--lab-glass-border)",
        background:  done ? "rgba(134,239,172,0.12)" : "transparent",
        color:       done ? "#15803d" : "var(--lab-text-secondary)",
        opacity:     disabled && !done ? 0.4 : 1,
        cursor:      disabled && !done ? "not-allowed" : "pointer",
      }}
    >
      <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border text-[10px]"
        style={{
          background:  done ? "#22c55e" : "transparent",
          borderColor: done ? "#22c55e" : "var(--lab-slate-300)",
          color:       done ? "white"   : "var(--lab-text-subtle)",
        }}>
        {done ? "✓" : icon}
      </span>
      {label}
    </button>
  );
}
