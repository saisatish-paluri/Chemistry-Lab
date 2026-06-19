"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useDissolvingStore }          from "@/lib/store/dissolving-rate-store";
import DissolvingWorkspace             from "./DissolvingWorkspace";
import ObservationPanel                from "@/components/lab/ObservationPanel";
import StatusBar                       from "@/components/lab/StatusBar";
import ResultModal                     from "@/components/lab/ResultModal";
import ContextPopup, { obsToPopup }    from "@/components/lab/ContextPopup";
import LabPageShell                    from "@/components/lab/LabPageShell";
import StepGuide                       from "@/components/lab/StepGuide";
import type { DissolveGranularity }    from "@/lib/engine/types";
import { EXPERIMENT_EDUCATION }        from "@/lib/experiment-education";

const ACCENT = "#059669";

const GRAIN_OPTIONS: { value: DissolveGranularity; label: string; desc: string }[] = [
  { value: "coarse", label: "Coarse",  desc: "Large crystals" },
  { value: "fine",   label: "Fine",    desc: "Small crystals" },
  { value: "powder", label: "Powder",  desc: "Ground to dust" },
];

// Water color interpolated from cold (blue) → warm (orange) → hot (red)
function waterColorFromCelsius(t: number): string {
  if (t <= 22) return "#3b82f6";
  if (t <= 60) {
    const p = (t - 22) / 38;
    const r = Math.round(59  + p * (249 - 59));
    const g = Math.round(130 + p * (115 - 130));
    const b = Math.round(246 + p * (22  - 246));
    return `rgb(${r},${g},${b})`;
  }
  const p = (t - 60) / 40;
  const r = Math.round(249 + p * (239 - 249));
  const g = Math.round(115 + p * (68  - 115));
  const b = Math.round(22  + p * (22  - 22));
  return `rgb(${r},${g},${b})`;
}

export default function DissolvingPage() {
  const [showPopup, setShowPopup] = useState(false);
  const store      = useDissolvingStore();
  const tickRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const popupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    store.hydrate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Real-time tick to advance dissolving progress
  useEffect(() => {
    if (store.isDissolving) {
      tickRef.current = setInterval(() => {
        store.tickAction(0.1); // 100ms interval → 0.1s delta
      }, 100);
    } else {
      if (tickRef.current) clearInterval(tickRef.current);
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.isDissolving]);

  useEffect(() => () => { if (popupTimer.current) clearTimeout(popupTimer.current); }, []);

  const lastObsId = store.observations[0]?.id;
  useEffect(() => {
    if (!lastObsId) return;
    startTransition(() => setShowPopup(true));
    if (popupTimer.current) clearTimeout(popupTimer.current);
    popupTimer.current = setTimeout(() => setShowPopup(false), 3500);
  }, [lastObsId]);


  const popup = store.observations[0]
    ? obsToPopup(store.observations[0].type, store.observations[0].message)
    : null;

  const celsius       = store.customTempCelsius;
  const wColor        = waterColorFromCelsius(celsius);
  const isLocked      = store.isDissolving || store.status === "completed";

  const controls = (
    <div className="space-y-4">

      {/* ── Temperature Slider ── */}
      <div className="lab-ctrl-section">
        <div className="lab-ctrl-section-hdr">
          <span className="lab-ctrl-section-hdr-icon">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <line x1="6.5" y1="2" x2="6.5" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <circle cx="6.5" cy="10" r="2" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
          </span>
          <span className="lab-ctrl-section-hdr-title">Water Temperature</span>
        </div>

        <div className="p-3 flex flex-col gap-2">
          {/* Value readout */}
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-semibold" style={{ color: "var(--lab-text-muted)" }}>
              Temperature
            </span>
            <span
              className="text-[14px] font-black font-mono tabular-nums"
              style={{ color: wColor, transition: "color 0.3s ease" }}
            >
              {Math.round(celsius)} °C
            </span>
          </div>

          {/* Slider */}
          <input
            type="range"
            min={5}
            max={100}
            step={1}
            value={celsius}
            disabled={isLocked}
            onChange={(e) => store.setCustomTempCelsiusAction(Number(e.target.value))}
            className="lab-temp-slider"
            style={{
              "--slider-color": wColor,
              "--slider-pct":   `${((celsius - 5) / 95) * 100}%`,
              opacity:          isLocked ? 0.45 : 1,
              cursor:           isLocked ? "not-allowed" : "pointer",
            } as React.CSSProperties}
            aria-label={`Water temperature: ${Math.round(celsius)} °C`}
          />

          {/* Scale labels */}
          <div className="flex justify-between text-[9.5px] font-semibold" style={{ color: "var(--lab-text-subtle)" }}>
            <span style={{ color: "#3b82f6" }}>5 °C (Cold)</span>
            <span style={{ color: "#f97316" }}>~40°</span>
            <span style={{ color: "#ef4444" }}>100 °C (Hot)</span>
          </div>

          {/* Temp tier badge */}
          <div className="flex justify-center">
            <span
              className="text-[10px] font-bold px-3 py-1 rounded-full"
              style={{
                background: `${wColor}15`,
                color:      wColor,
                border:     `1px solid ${wColor}30`,
                transition: "all 0.3s ease",
              }}
            >
              {celsius <= 22 ? "❄ Cold water" : celsius <= 60 ? "🌡 Warm water" : "🔥 Hot water"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Particle Size ── */}
      <div className="lab-ctrl-section">
        <div className="lab-ctrl-section-hdr">
          <span className="lab-ctrl-section-hdr-icon">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="4" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
              <circle cx="9" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
              <circle cx="7" cy="10" r="1" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
          </span>
          <span className="lab-ctrl-section-hdr-title">Particle Size</span>
        </div>
        <div className="p-2 flex flex-col gap-1.5">
          {GRAIN_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => !isLocked && store.setGranularityAction(opt.value)}
              disabled={isLocked}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11.5px] font-semibold border transition-all duration-150"
              style={{
                background:  store.granularity === opt.value ? `${ACCENT}12` : "rgba(255,255,255,0.65)",
                borderColor: store.granularity === opt.value ? `${ACCENT}40` : "var(--lab-glass-border)",
                color:       store.granularity === opt.value ? ACCENT : "var(--lab-text-secondary)",
                opacity:     isLocked ? 0.5 : 1,
              }}
            >
              <span className="font-bold">{opt.label}</span>
              <span style={{ color: "var(--lab-text-muted)", fontWeight: 400 }}> — {opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Stirring ── */}
      <div className="lab-ctrl-section">
        <div className="lab-ctrl-section-hdr">
          <span className="lab-ctrl-section-hdr-icon">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 3 C9 3 11 5 11 7 C11 9 9 11 6.5 11 C4 11 2 9 2 7 C2 5 4 3 6.5 3Z" stroke="currentColor" strokeWidth="1.2" fill="none" strokeDasharray="3 2"/>
            </svg>
          </span>
          <span className="lab-ctrl-section-hdr-title">Stirring</span>
        </div>
        <div className="p-2">
          <button
            onClick={() => !isLocked && store.setStirringAction(!store.stirring)}
            disabled={isLocked}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11.5px] font-semibold border transition-all duration-150"
            style={{
              background:  store.stirring ? `${ACCENT}10` : "rgba(255,255,255,0.65)",
              borderColor: store.stirring ? `${ACCENT}40` : "var(--lab-glass-border)",
              color:       store.stirring ? ACCENT : "var(--lab-text-muted)",
              opacity:     isLocked ? 0.5 : 1,
            }}
          >
            <span>{store.stirring ? "Stirring: ON" : "Stirring: OFF"}</span>
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background:  store.stirring ? `${ACCENT}15` : "var(--lab-slate-100)",
                color:       store.stirring ? ACCENT : "var(--lab-text-muted)",
              }}
            >
              {store.stirring ? "×0.5 time" : "×1.0 time"}
            </span>
          </button>
        </div>
      </div>

      {/* ── Sugar Mass ── */}
      <div className="lab-ctrl-section mb-3">
        <div className="lab-ctrl-section-hdr">
          <span className="lab-ctrl-section-hdr-icon">⚖️</span>
          <span className="lab-ctrl-section-hdr-title">Solute Mass (Sugar)</span>
        </div>
        <div className="p-3">
          <div className="flex justify-between text-[11px] mb-1">
            <span className="font-medium">Mass to Add</span>
            <span className="font-bold text-emerald-600">{store.massAdded} g</span>
          </div>
          <input
            type="range"
            min="5"
            max="300"
            step="5"
            value={store.massAdded}
            disabled={isLocked}
            onChange={(e) => store.updateSugarMassAction(Number(e.target.value))}
            className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-emerald-600"
            style={{ opacity: isLocked ? 0.45 : 1 }}
          />
          <div className="flex justify-between text-[9.5px] text-slate-400 mt-1">
            <span>5 g (Dilute)</span>
            <span>300 g (Excess)</span>
          </div>
        </div>
      </div>

      {/* Thermodynamic Saturation Info */}
      <div className="rounded-xl p-3" style={{ background: "rgba(5,150,105,0.06)", border: "1px solid rgba(5,150,105,0.18)" }}>
        <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: ACCENT }}>
          Thermodynamic Properties
        </p>
        <div className="space-y-1.5 text-[11.5px] text-slate-700">
          <div className="flex justify-between">
            <span>Solubility Limit (Cs):</span>
            <span className="font-bold">{store.solubilityLimit.toFixed(1)} g/100mL</span>
          </div>
          <div className="flex justify-between">
            <span>Current concentration:</span>
            <span className="font-bold">{(store.dissolvedMass * (100 / store.waterVolume)).toFixed(1)} g/100mL</span>
          </div>
          <div className="flex justify-between">
            <span>Dissolved Sugar:</span>
            <span className="font-bold text-emerald-600">{store.dissolvedMass.toFixed(1)}g / {store.massAdded}g</span>
          </div>
          <div className="flex justify-between border-t border-emerald-100 pt-1 text-[11px]">
            <span>Solution Status:</span>
            <span className="font-bold" style={{ color: store.isSaturated ? "#d97706" : store.dissolvedMass >= store.massAdded ? "#059669" : "#0284c7" }}>
              {store.isSaturated ? "SATURATED" : store.dissolvedMass >= store.massAdded ? "FULLY DISSOLVED" : store.isDissolving ? "DISSOLVING..." : "IDLE"}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {!store.isDissolving && store.status !== "completed" && (
          <button
            onClick={store.startAction}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${ACCENT} 0%, #047857 100%)`,
              boxShadow:  `0 4px 14px ${ACCENT}40`,
            }}
          >
            Start Dissolving
          </button>
        )}
        {store.isDissolving && (
          <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "rgba(5,150,105,0.08)", color: ACCENT }}>
            <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
            Dissolving… {Math.round(store.dissolveProgress)}%
          </div>
        )}
        {store.dataPoints.length >= 2 && !store.isDissolving && store.status !== "completed" && (
          <button
            onClick={store.completeAction}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
            style={{ background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", boxShadow: "0 4px 14px rgba(37,99,235,0.35)" }}
          >
            Complete Lab ✓
          </button>
        )}
        {store.status === "completed" && (
          <button
            onClick={store.resetAction}
            className="w-full py-2 rounded-xl text-[12px] font-semibold border transition-all duration-150 hover:bg-slate-50"
            style={{ borderColor: "var(--lab-glass-border)", color: "var(--lab-text-muted)" }}
          >
            Reset Lab
          </button>
        )}
      </div>
    </div>
  );

  // Bar chart in centerBottom
  const centerBottom = store.dataPoints.length > 0 ? (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: ACCENT }}>
        Dissolving Time Comparison
      </p>
      {store.dataPoints.map((dp, i) => {
        const maxTime = Math.max(...store.dataPoints.map((d) => d.time), 1);
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <p className="text-[9px]" style={{ width: 120, flexShrink: 0, color: "var(--lab-text-muted)", lineHeight: 1.3 }}>
              {dp.label}
            </p>
            <div style={{ flex: 1, background: "var(--lab-slate-100)", borderRadius: 4, height: 12, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${(dp.time / maxTime) * 100}%`,
                  background: `linear-gradient(90deg, ${ACCENT}, #34d399)`,
                  borderRadius: 4,
                  transition: "width 0.6s ease",
                }}
              />
            </div>
            <p className="text-[9px] font-bold font-mono" style={{ width: 30, textAlign: "right", color: ACCENT, flexShrink: 0 }}>
              {dp.time}s
            </p>
          </div>
        );
      })}
    </div>
  ) : undefined;

  return (
    <LabPageShell
      statusBar={
        <StatusBar
          status={store.status}
          error={null}
          metrics={[
            { label: "Temperature", value: `${Math.round(celsius)} °C` },
            { label: "Size",        value: store.granularity },
            { label: "Stirring",    value: store.stirring ? "Yes" : "No" },
            { label: "Progress",    value: `${Math.round(store.dissolveProgress)}%` },
            ...(store.dataPoints.length > 0 ? [{ label: "Data Points", value: `${store.dataPoints.length}` }] : []),
          ]}
        />
      }
      workspace={
        <DissolvingWorkspace
          temperature={store.temperature}
          customTempCelsius={celsius}
          granularity={store.granularity}
          stirring={store.stirring}
          isDissolving={store.isDissolving}
          dissolveProgress={store.dissolveProgress}
          dissolveTime={store.dissolveTime}
          dataPoints={store.dataPoints}
          isSaturated={store.isSaturated}
        />
      }
      education={EXPERIMENT_EDUCATION["dissolving-rate"]}
      reactionNote={
        store.isDissolving
          ? `Dissolving: ${store.massAdded}g sugar at ${Math.round(celsius)}°C (${store.granularity}, ${store.stirring ? "Stirred" : "Unstirred"})`
          : store.isSaturated
            ? `Saturated: reached solubility limit of ${store.solubilityLimit.toFixed(1)} g/100mL.`
            : store.dataPoints.length > 0
              ? `${store.dataPoints.length} point${store.dataPoints.length !== 1 ? "s" : ""} recorded — change variables and run again to compare.`
              : "Set temperature, particle size, sugar mass, and stirring, then click Start."
      }
      centerBottom={centerBottom}
      controls={controls}
      stepGuide={store.steps.length > 0 ? <StepGuide steps={store.steps} objectives={store.objectives} /> : undefined}
      mode={store.mode}
      onSetMode={store.setMode}
      observations={<ObservationPanel observations={store.observations} />}
      obsNotif={
        popup ? <ContextPopup visible={showPopup} what={popup.what} why={popup.why} kind={popup.kind} /> : null
      }
      resultModal={
        <ResultModal
          result={store.result}
          onReset={store.resetAction}
          nextHref="/experiments/indicator-test"
          nextLabel="Next: Indicator Test →"
          observations={store.observations}
          experimentKey="dissolving-rate"
        />
      }
    />
  );
}
