"use client";

import type { GasLaw, ExperimentStatus, GasDataPoint } from "@/lib/engine/types";
import {
  BOYLE_V_MIN, BOYLE_V_MAX,
  CHARLES_T_MIN, CHARLES_T_MAX,
} from "@/lib/engine/gas-laws-engine";

interface Props {
  status:        ExperimentStatus;
  law:           GasLaw | null;
  temperature:   number;
  volume:        number;
  pressure:      number;
  dataPoints:    GasDataPoint[];
  onSelectLaw:   (law: GasLaw) => void;
  onStartExp:    () => void;
  onSetVolume:   (v: number) => void;
  onSetTemp:     (t: number) => void;
  onRecordPoint: () => void;
  onComplete:    () => void;
  onReset:       () => void;
}

export default function GasLawsControls({
  status, law, temperature, volume, pressure, dataPoints,
  onSelectLaw, onStartExp, onSetVolume, onSetTemp,
  onRecordPoint, onComplete, onReset,
}: Props) {
  const isDone    = status === "completed" || status === "failed";
  const isRunning = status === "running";
  const isSetup   = status === "setup";

  return (
    <div className="flex flex-col gap-0 divide-y" style={{ borderColor: "var(--lab-glass-border)" }}>

      {/* Law selection */}
      <div className="px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-2"
           style={{ color: "var(--lab-text-subtle)" }}>
          Gas Law
        </p>
        <div className="flex gap-2">
          {(["boyle", "charles"] as const).map((l) => (
            <button
              key={l}
              onClick={() => onSelectLaw(l)}
              disabled={isDone}
              className="flex-1 py-2 rounded-lg border text-xs font-semibold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                borderColor: law === l ? "var(--lab-blue-500)" : "var(--lab-glass-border)",
                background:  law === l ? "var(--lab-blue-600)" : "transparent",
                color: law === l ? "white" : "var(--lab-text-secondary)",
              }}
              aria-pressed={law === l}
            >
              {l === "boyle" ? "Boyle's" : "Charles's"}
            </button>
          ))}
        </div>
        {law && (
          <p className="text-[9px] mt-1.5" style={{ color: "var(--lab-text-subtle)" }}>
            {law === "boyle"
              ? "Vary volume → observe pressure (T fixed at 300 K)"
              : "Vary temperature → observe volume (P fixed at 1 atm)"}
          </p>
        )}
      </div>

      {/* Start exploration */}
      {law && !isRunning && !isDone && (
        <div className="px-4 py-3">
          <button
            onClick={onStartExp}
            disabled={isRunning}
            className="w-full py-2 rounded-lg text-xs font-semibold text-white transition-all duration-150 hover:opacity-90"
            style={{ background: "var(--lab-blue-600)" }}
          >
            {isSetup ? "Start Exploration" : "Continue"}
          </button>
        </div>
      )}

      {/* Boyle's: Volume slider */}
      {law === "boyle" && isRunning && (
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider"
               style={{ color: "var(--lab-text-subtle)" }}>
              Volume (L)
            </p>
            <span className="text-xs font-bold font-mono" style={{ color: "var(--lab-blue-600)" }}>
              {volume.toFixed(2)} L
            </span>
          </div>
          <input
            type="range"
            min={BOYLE_V_MIN} max={BOYLE_V_MAX} step={0.1}
            value={volume}
            onChange={(e) => onSetVolume(Number(e.target.value))}
            disabled={isDone}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: "var(--lab-blue-500)" }}
            aria-label="Volume slider"
          />
          <div className="flex justify-between text-[9px] mt-0.5" style={{ color: "var(--lab-text-subtle)" }}>
            <span>{BOYLE_V_MIN} L</span>
            <span className="font-mono text-[10px]" style={{ color: "#ef4444" }}>
              P = {pressure.toFixed(3)} atm
            </span>
            <span>{BOYLE_V_MAX} L</span>
          </div>
        </div>
      )}

      {/* Charles's: Temperature slider */}
      {law === "charles" && isRunning && (
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider"
               style={{ color: "var(--lab-text-subtle)" }}>
              Temperature (K)
            </p>
            <span className="text-xs font-bold font-mono" style={{ color: "#f59e0b" }}>
              {temperature} K ({(temperature - 273).toFixed(0)} °C)
            </span>
          </div>
          <input
            type="range"
            min={CHARLES_T_MIN} max={CHARLES_T_MAX} step={10}
            value={temperature}
            onChange={(e) => onSetTemp(Number(e.target.value))}
            disabled={isDone}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: "#f59e0b" }}
            aria-label="Temperature slider"
          />
          <div className="flex justify-between text-[9px] mt-0.5" style={{ color: "var(--lab-text-subtle)" }}>
            <span>{CHARLES_T_MIN} K</span>
            <span className="font-mono text-[10px]" style={{ color: "#3b82f6" }}>
              V = {volume.toFixed(3)} L
            </span>
            <span>{CHARLES_T_MAX} K</span>
          </div>
        </div>
      )}

      {/* Record data point */}
      {isRunning && (
        <div className="px-4 py-3">
          <button
            onClick={onRecordPoint}
            className="w-full py-2 rounded-lg text-xs font-semibold border transition-all duration-150 hover:bg-blue-50"
            style={{ borderColor: "var(--lab-blue-500)", color: "var(--lab-blue-600)" }}
          >
            📍 Record Data Point
          </button>
          <p className="text-[9px] mt-1 text-center" style={{ color: "var(--lab-text-subtle)" }}>
            {dataPoints.length} point{dataPoints.length !== 1 ? "s" : ""} recorded
            {dataPoints.length < 3 ? ` (${3 - dataPoints.length} more needed)` : " ✓"}
          </p>
        </div>
      )}

      {/* Data table */}
      {dataPoints.length > 0 && (
        <div className="px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2"
             style={{ color: "var(--lab-text-subtle)" }}>
            Data Table
          </p>
          <table className="w-full text-[9px]" style={{ color: "var(--lab-text-secondary)" }}>
            <thead>
              <tr style={{ color: "var(--lab-text-subtle)" }}>
                <th className="text-left pb-1">#</th>
                <th className="text-right pb-1">{law === "boyle" ? "V (L)" : "T (K)"}</th>
                <th className="text-right pb-1">{law === "boyle" ? "P (atm)" : "V (L)"}</th>
                {law === "boyle" && <th className="text-right pb-1">PV</th>}
              </tr>
            </thead>
            <tbody>
              {dataPoints.map((dp, i) => (
                <tr key={i} className="border-t" style={{ borderColor: "var(--lab-glass-border)" }}>
                  <td className="py-0.5">{i + 1}</td>
                  <td className="text-right font-mono">{dp.x.toFixed(law === "boyle" ? 2 : 0)}</td>
                  <td className="text-right font-mono">{dp.y.toFixed(3)}</td>
                  {law === "boyle" && (
                    <td className="text-right font-mono">{(dp.x * dp.y).toFixed(3)}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Complete / Reset */}
      <div className="px-4 py-3 flex flex-col gap-1.5">
        {!isDone && (
          <button
            onClick={onComplete}
            disabled={dataPoints.length < 1}
            className="w-full py-2 rounded-lg text-xs font-semibold text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
            style={{ background: "#059669" }}
          >
            Complete Experiment
          </button>
        )}
        <button
          onClick={onReset}
          className="w-full py-2 rounded-lg text-xs font-semibold border transition-all duration-150 hover:bg-red-50"
          style={{ borderColor: "#fca5a5", color: "#dc2626" }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
