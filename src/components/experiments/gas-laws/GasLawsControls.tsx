"use client";

import type { GasLaw, ExperimentStatus, GasDataPoint } from "@/lib/engine/types";
import {
  BOYLE_V_MIN, BOYLE_V_MAX,
  CHARLES_T_MIN, CHARLES_T_MAX,
  GAYL_T_MIN, GAYL_T_MAX,
} from "@/lib/engine/gas-laws-engine";

interface Props {
  status:        ExperimentStatus;
  law:           GasLaw | null;
  temperature:   number;
  volume:        number;
  pressure:      number;
  dataPoints:    GasDataPoint[];
  gasType?:      "he" | "n2" | "co2";
  sealQuality?:  number;
  onSelectLaw:   (law: GasLaw) => void;
  onStartExp:    () => void;
  onSetVolume:   (v: number) => void;
  onSetTemp:     (t: number) => void;
  onSetGasType?: (gasType: "he" | "n2" | "co2") => void;
  onSetSealQuality?: (quality: number) => void;
  onRecordPoint: () => void;
  onComplete:    () => void;
  onReset:       () => void;
}

function sliderPct(value: number, min: number, max: number) {
  return `${Math.round(((value - min) / (max - min)) * 100)}%`;
}

const LAW_CARDS: Array<{
  id: GasLaw;
  title: string;
  emoji: string;
  what: string;
  changes: string;
  fixed: string;
  color: string;
}> = [
  {
    id:      "boyle",
    title:   "Boyle's Law",
    emoji:   "🔵",
    what:    "Squeeze the syringe — pressure rises",
    changes: "Drag the Volume slider left/right",
    fixed:   "Temperature stays constant",
    color:   "#2563eb",
  },
  {
    id:      "charles",
    title:   "Charles's Law",
    emoji:   "🔴",
    what:    "Heat the gas — it expands",
    changes: "Drag the Temperature slider up/down",
    fixed:   "Pressure stays constant",
    color:   "#ea580c",
  },
  {
    id:      "gay-lussac",
    title:   "Gay-Lussac's Law",
    emoji:   "🟢",
    what:    "Heat fixed volume — pressure rises",
    changes: "Drag the Temperature slider up/down",
    fixed:   "Volume stays constant",
    color:   "#10b981",
  },
];

// Step indicator shown when experiment is running
function StepBadge({ step, total, label }: { step: number; total: number; label: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "6px 10px", borderRadius: 9,
      background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.18)",
      marginBottom: 2,
    }}>
      <span style={{
        width: 20, height: 20, borderRadius: "50%",
        background: "var(--lab-blue-600)", color: "white",
        fontSize: 10, fontWeight: 800,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>{step}</span>
      <p style={{ fontSize: 10.5, color: "#334155", margin: 0, lineHeight: 1.4 }}>{label}</p>
      <span style={{ marginLeft: "auto", fontSize: 9, color: "#94a3b8" }}>{step}/{total}</span>
    </div>
  );
}

export default function GasLawsControls({
  status, law, temperature, volume, pressure, dataPoints,
  gasType = "co2", sealQuality = 1.0,
  onSelectLaw, onStartExp, onSetVolume, onSetTemp,
  onSetGasType, onSetSealQuality,
  onRecordPoint, onComplete, onReset,
}: Props) {
  const isDone    = status === "completed" || status === "failed";
  const isRunning = status === "running";
  const isSetup   = status === "setup";

  // Derive current step for guidance
  const currentStep = !law ? 1 : isSetup ? 2 : isRunning && dataPoints.length < 3 ? 3 : isRunning ? 4 : 5;

  return (
    <div className="flex flex-col gap-3">

      {/* Current step guidance */}
      {!isDone && (
        <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid rgba(37,99,235,0.14)" }}>
          <div style={{
            padding: "7px 12px",
            background: "rgba(37,99,235,0.07)",
            borderBottom: "1px solid rgba(37,99,235,0.12)",
          }}>
            <p style={{ fontSize: 9.5, fontWeight: 800, color: "#2563eb", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              What to do now
            </p>
          </div>
          <div style={{ padding: "8px 12px" }}>
            {currentStep === 1 && (
              <p style={{ fontSize: 11, color: "#334155", margin: 0, lineHeight: 1.55 }}>
                <strong>Step 1:</strong> Choose which gas law you want to explore below.
              </p>
            )}
            {currentStep === 2 && (
              <p style={{ fontSize: 11, color: "#334155", margin: 0, lineHeight: 1.55 }}>
                <strong>Step 2:</strong> Click <em>Start Exploration</em> to activate the controls.
              </p>
            )}
            {currentStep === 3 && (
              <p style={{ fontSize: 11, color: "#334155", margin: 0, lineHeight: 1.55 }}>
                <strong>Step 3:</strong> Move the slider and click <em>Record Data Point</em> (need 3 points).
              </p>
            )}
            {currentStep === 4 && (
              <p style={{ fontSize: 11, color: "#334155", margin: 0, lineHeight: 1.55 }}>
                <strong>Step 4:</strong> Keep recording points to build the curve, then click <em>Complete</em>.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── GAS LAW selection ── */}
      <div className="lab-ctrl-section">
        <div className="lab-ctrl-section-hdr">
          <span className="lab-ctrl-section-hdr-icon">⚗</span>
          <span className="lab-ctrl-section-hdr-title">Choose a Gas Law</span>
        </div>
        <div className="p-3 flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            {LAW_CARDS.map((card) => (
              <button
                key={card.id}
                onClick={() => onSelectLaw(card.id)}
                disabled={isDone}
                style={{
                  borderRadius: 10,
                  border: `2px solid ${law === card.id ? card.color : "rgba(148,163,184,0.25)"}`,
                  background: law === card.id ? `${card.color}0d` : "rgba(255,255,255,0.6)",
                  padding: "10px 12px",
                  textAlign: "left",
                  cursor: isDone ? "not-allowed" : "pointer",
                  opacity: isDone ? 0.4 : 1,
                  transition: "all 0.15s ease",
                }}
                aria-pressed={law === card.id}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                  <span style={{ fontSize: 14 }}>{card.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: law === card.id ? card.color : "#334155" }}>
                    {card.title}
                  </span>
                  {law === card.id && (
                    <span style={{
                      marginLeft: "auto", fontSize: 9, fontWeight: 700,
                      color: card.color, background: `${card.color}18`,
                      borderRadius: 4, padding: "1px 6px",
                    }}>SELECTED</span>
                  )}
                </div>
                <p style={{ fontSize: 10, color: "#475569", margin: 0, lineHeight: 1.4 }}>{card.what}</p>
                <p style={{ fontSize: 9.5, color: "#94a3b8", margin: "2px 0 0", lineHeight: 1.3 }}>Fixed: {card.fixed}</p>
              </button>
            ))}
          {/* Gas Type Selector */}
          {!isDone && (
            <div className="flex flex-col gap-1.5 mt-2 pt-2" style={{ borderTop: "1.5px solid var(--lab-glass-border)" }}>
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Select Gas Type</span>
              <div className="flex gap-2">
                {(["he", "n2", "co2"] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => onSetGasType?.(g)}
                    disabled={isRunning || isDone}
                    className="flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all duration-150"
                    style={{
                      borderColor: gasType === g ? "var(--lab-blue-500)" : "rgba(148,163,184,0.25)",
                      background: gasType === g ? "rgba(37,99,235,0.08)" : "rgba(255,255,255,0.6)",
                      color: gasType === g ? "var(--lab-blue-600)" : "#475569",
                      cursor: isRunning || isDone ? "not-allowed" : "pointer",
                      opacity: isRunning ? 0.6 : 1,
                    }}
                  >
                    {g === "he" ? "Helium (He)" : g === "n2" ? "Nitrogen (N₂)" : "CO₂"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Seal Quality Slider */}
          {!isDone && (
            <div className="flex flex-col gap-1 mt-2.5 pt-2" style={{ borderTop: "1.5px solid var(--lab-glass-border)" }}>
              <div className="flex justify-between items-center text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
                <span>Seal Quality</span>
                <span style={{ color: sealQuality < 1.0 ? "#ef4444" : "#059669" }}>
                  {Math.round(sealQuality * 100)}% {sealQuality < 1.0 && " (💨 LEAKING)"}
                </span>
              </div>
              <input
                type="range"
                min={0.3} max={1.0} step={0.05}
                value={sealQuality}
                onChange={(e) => onSetSealQuality?.(Number(e.target.value))}
                disabled={isDone}
                className="lab-ctrl-slider w-full font-bold"
                style={{
                  "--slider-accent": sealQuality < 1.0 ? "#ef4444" : "#059669",
                  "--slider-pct": `${((sealQuality - 0.3) / 0.7) * 100}%`,
                } as React.CSSProperties}
                aria-label="Seal quality slider"
              />
              <div className="flex justify-between text-[8.5px] text-slate-400">
                <span>30% (Leak)</span>
                <span>100% (Hermetic)</span>
              </div>
            </div>
          )}
          </div>

          {law && !isRunning && !isDone && (
            <button
              onClick={onStartExp}
              className="w-full py-2 rounded-lg text-xs font-semibold text-white transition-all duration-150 hover:opacity-90"
              style={{ background: "var(--lab-blue-600)", marginTop: 4 }}
            >
              Start Exploration →
            </button>
          )}
        </div>
      </div>

      {/* ── PARAMETERS section (Boyle's: Volume) ── */}
      {law === "boyle" && isRunning && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">📐</span>
            <span className="lab-ctrl-section-hdr-title">Adjust Volume</span>
          </div>
          <div className="lab-ctrl-param">
            <div className="lab-ctrl-param-top">
              <span className="lab-ctrl-param-label">Volume (V)</span>
              <span style={{ fontWeight: 700, color: "var(--lab-blue-600)", fontSize: 13 }}>
                {volume.toFixed(2)}
              </span>
              <span className="lab-ctrl-param-unit">L</span>
            </div>
            <input
              type="range"
              min={BOYLE_V_MIN} max={BOYLE_V_MAX} step={0.1}
              value={volume}
              onChange={(e) => onSetVolume(Number(e.target.value))}
              disabled={isDone}
              className="lab-ctrl-slider"
              style={{
                "--slider-pct": sliderPct(volume, BOYLE_V_MIN, BOYLE_V_MAX),
              } as React.CSSProperties}
              aria-label="Volume slider"
            />
            <div className="lab-ctrl-range-row">
              <span>{BOYLE_V_MIN} L (small)</span>
              <span>{BOYLE_V_MAX} L (large)</span>
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between",
              padding: "4px 8px", borderRadius: 7, marginTop: 4,
              background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)",
            }}>
              <span style={{ fontSize: 10, color: "#64748b" }}>Resulting Pressure</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#ef4444", fontFamily: "monospace" }}>
                {pressure.toFixed(3)} atm
              </span>
            </div>
            <p style={{ fontSize: 9.5, color: "#94a3b8", marginTop: 4 }}>
              Smaller volume → higher pressure (particles collide more)
            </p>
          </div>
        </div>
      )}

      {/* ── PARAMETERS section (Charles's / Gay-Lussac's: Temperature) ── */}
      {(law === "charles" || law === "gay-lussac") && isRunning && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">🌡️</span>
            <span className="lab-ctrl-section-hdr-title">Adjust Temperature</span>
          </div>
          <div className="lab-ctrl-param">
            <div className="lab-ctrl-param-top">
              <span className="lab-ctrl-param-label">Temperature (T)</span>
              <span style={{ fontWeight: 700, color: law === "charles" ? "#ea580c" : "#10b981", fontSize: 13 }}>
                {temperature}
              </span>
              <span className="lab-ctrl-param-unit">K</span>
            </div>
            <input
              type="range"
              min={law === "charles" ? CHARLES_T_MIN : GAYL_T_MIN}
              max={law === "charles" ? CHARLES_T_MAX : GAYL_T_MAX}
              step={10}
              value={temperature}
              onChange={(e) => onSetTemp(Number(e.target.value))}
              disabled={isDone}
              className="lab-ctrl-slider"
              style={{
                "--slider-accent": law === "charles" ? "#ea580c" : "#10b981",
                "--slider-pct":    sliderPct(temperature, law === "charles" ? CHARLES_T_MIN : GAYL_T_MIN, law === "charles" ? CHARLES_T_MAX : GAYL_T_MAX),
              } as React.CSSProperties}
              aria-label="Temperature slider"
            />
            <div className="lab-ctrl-range-row">
              <span>{law === "charles" ? CHARLES_T_MIN : GAYL_T_MIN} K (cold)</span>
              <span>{law === "charles" ? CHARLES_T_MAX : GAYL_T_MAX} K (hot)</span>
            </div>
            <p style={{ fontSize: 9.5, color: "#94a3b8", marginTop: 2 }}>
              {(temperature - 273).toFixed(0)} °C — {law === "charles" ? "hotter gas expands" : `volume fixed at ${volume.toFixed(2)} L`}
            </p>
            <div style={{
              display: "flex", justifyContent: "space-between",
              padding: "4px 8px", borderRadius: 7, marginTop: 4,
              background: law === "charles" ? "rgba(37,99,235,0.07)" : "rgba(239,68,68,0.07)",
              border: law === "charles" ? "1px solid rgba(37,99,235,0.18)" : "1px solid rgba(239,68,68,0.18)",
            }}>
              <span style={{ fontSize: 10, color: "#64748b" }}>{law === "charles" ? "Resulting Volume" : "Resulting Pressure"}</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: law === "charles" ? "#2563eb" : "#ef4444", fontFamily: "monospace" }}>
                {law === "charles" ? `${volume.toFixed(3)} L` : `${pressure.toFixed(3)} atm`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Record data point ── */}
      {isRunning && (
        <div className="flex flex-col gap-1">
          <button
            onClick={onRecordPoint}
            className="w-full py-2.5 rounded-xl text-xs font-semibold border transition-all duration-150 hover:bg-blue-50 active:scale-[0.98]"
            style={{ borderColor: "var(--lab-blue-500)", color: "var(--lab-blue-600)" }}
          >
            📍 Record This Data Point
          </button>
          <StepBadge
            step={3}
            total={5}
            label={
              dataPoints.length === 0
                ? "Record your first measurement"
                : dataPoints.length < 3
                ? `${3 - dataPoints.length} more needed for a valid graph`
                : `${dataPoints.length} points — keep going or complete`
            }
          />
        </div>
      )}

      {/* ── Data table ── */}
      {dataPoints.length > 0 && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">📊</span>
            <span className="lab-ctrl-section-hdr-title">My Data ({dataPoints.length} points)</span>
          </div>
          <div className="p-3">
            <table className="w-full text-[9.5px]" style={{ color: "var(--lab-text-secondary)" }}>
              <thead>
                <tr style={{ color: "var(--lab-text-subtle)" }}>
                  <th className="text-left pb-1 font-semibold">#</th>
                  <th className="text-right pb-1 font-semibold">{law === "boyle" ? "V (L)" : "T (K)"}</th>
                  <th className="text-right pb-1 font-semibold">{law === "boyle" ? "P (atm)" : "V (L)"}</th>
                  {law === "boyle" && <th className="text-right pb-1 font-semibold">P×V</th>}
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
            {law === "boyle" && dataPoints.length >= 2 && (
              <p style={{ fontSize: 9, color: "#94a3b8", marginTop: 6 }}>
                P×V stays nearly constant — that is Boyle&apos;s Law!
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Complete / Reset ── */}
      <div className="flex flex-col gap-1.5">
        {!isDone && (
          <button
            onClick={onComplete}
            disabled={dataPoints.length < 1}
            className="w-full py-2 rounded-xl text-xs font-semibold text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
            style={{ background: "#059669" }}
          >
            Complete Experiment ✓
          </button>
        )}
        <button
          onClick={onReset}
          className="w-full py-2 rounded-xl text-xs font-semibold border transition-all duration-150 hover:bg-red-50 active:scale-[0.98]"
          style={{ borderColor: "#fca5a5", color: "#dc2626" }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
