"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useDensityStore }            from "@/lib/store/density-floats-sinks-store";
import DensityWorkspace               from "./DensityWorkspace";
import ObservationPanel               from "@/components/lab/ObservationPanel";
import StatusBar                      from "@/components/lab/StatusBar";
import ResultModal                    from "@/components/lab/ResultModal";
import ContextPopup, { obsToPopup }   from "@/components/lab/ContextPopup";
import LabPageShell                   from "@/components/lab/LabPageShell";
import StepGuide                      from "@/components/lab/StepGuide";
import { DENSITY_MATERIALS, ORDERED_MATERIALS } from "@/lib/engine/density-floats-sinks-engine";
import { EXPERIMENT_EDUCATION }       from "@/lib/experiment-education";

const ACCENT = "#0284c7";

export default function DensityPage() {
  const [showPopup, setShowPopup] = useState(false);
  const store      = useDensityStore();
  const popupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    store.hydrate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const mat = store.selectedMaterial ? DENSITY_MATERIALS[store.selectedMaterial] : null;

  // Material selector controls
  const controls = (
    <div className="space-y-4">
      {/* Density reference card */}
      <div className="rounded-xl p-3" style={{ background: "rgba(2,132,199,0.06)", border: "1px solid rgba(2,132,199,0.18)" }}>
        <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: ACCENT }}>
          Key Concept
        </p>
        <p className="text-[11.5px] leading-relaxed" style={{ color: "var(--lab-text-secondary)" }}>
          Objects float if their density is <strong>less than</strong> water (1.0 g/cm³).
          They sink if their density is <strong>greater than</strong> 1.0 g/cm³.
        </p>
      </div>

      {/* Material picker */}
      <div className="lab-ctrl-section">
        <div className="lab-ctrl-section-hdr">
          <span className="lab-ctrl-section-hdr-icon">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1.5" y="1.5" width="10" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.3"/><line x1="4" y1="6.5" x2="9" y2="6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
          </span>
          <span className="lab-ctrl-section-hdr-title">Select Material</span>
        </div>
        <div className="p-2 grid grid-cols-2 gap-1.5">
          {ORDERED_MATERIALS.map((id) => {
            const m       = DENSITY_MATERIALS[id];
            const tested  = store.testedMaterials.includes(id);
            const active  = store.selectedMaterial === id;
            return (
              <button
                key={id}
                onClick={() => {
                  if (store.status !== "running") store.selectMaterialAction(id);
                }}
                disabled={store.status === "running" || store.status === "completed"}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left text-[11px] font-semibold transition-all duration-150 border"
                style={{
                  background:   active ? `${ACCENT}10` : "rgba(255,255,255,0.7)",
                  borderColor:  active ? `${ACCENT}40` : "var(--lab-glass-border)",
                  color:        active ? ACCENT : "var(--lab-text-secondary)",
                  opacity:      store.status === "completed" ? 0.5 : 1,
                }}
              >
                <span
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ background: m.color }}
                />
                <span className="truncate">{m.name}</span>
                {tested && (
                  <span className="ml-auto text-[9px]" style={{ color: (m.density < store.fluidDensity) ? "#059669" : "#dc2626" }}>
                    {(m.density < store.fluidDensity) ? "↑" : "↓"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Liquid Properties (Always Visible) */}
      <div className="lab-ctrl-section mb-3">
        <div className="lab-ctrl-section-hdr">
          <span className="lab-ctrl-section-hdr-icon">🧪</span>
          <span className="lab-ctrl-section-hdr-title">Fluid Properties</span>
        </div>
        <div className="p-3 space-y-3">
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="font-medium">Water Temperature</span>
              <span className="font-bold text-sky-600">{store.temperature} °C</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={store.temperature}
              onChange={(e) => store.updateParametersAction({ temperature: parseFloat(e.target.value) })}
              disabled={store.status === "running" || store.status === "completed"}
              className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-sky-600"
            />
          </div>
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="font-medium">Salinity (NaCl)</span>
              <span className="font-bold text-sky-600">{store.salinity} %</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="0.5"
              value={store.salinity}
              onChange={(e) => store.updateParametersAction({ salinity: parseFloat(e.target.value) })}
              disabled={store.status === "running" || store.status === "completed"}
              className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-sky-600"
            />
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex justify-between">
            <span>Calculated Fluid Density:</span>
            <span className="font-bold text-slate-700">{store.fluidDensity} g/mL</span>
          </div>
        </div>
      </div>

      {/* Solid Dimensions (Visible only when material is selected) */}
      {mat && (
        <div className="lab-ctrl-section mb-3">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">📐</span>
            <span className="lab-ctrl-section-hdr-title">Solid Dimensions</span>
          </div>
          <div className="p-3 space-y-3">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="font-medium">Mass</span>
                <span className="font-bold text-sky-600">{store.mass} g</span>
              </div>
              <input
                type="range"
                min="5"
                max="500"
                step="0.5"
                value={store.mass}
                onChange={(e) => store.updateParametersAction({ mass: parseFloat(e.target.value) })}
                disabled={store.status === "running" || store.status === "completed"}
                className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-sky-600"
              />
            </div>
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="font-medium">Volume</span>
                <span className="font-bold text-sky-600">{store.volume} cm³</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="1"
                value={store.volume}
                onChange={(e) => store.updateParametersAction({ volume: parseFloat(e.target.value) })}
                disabled={store.status === "running" || store.status === "completed"}
                className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-sky-600"
              />
            </div>
            <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex justify-between">
              <span>Calculated Solid Density:</span>
              <span className="font-bold text-slate-700">{store.solidDensity} g/cm³</span>
            </div>
          </div>
        </div>
      )}

      {/* Current material info */}
      {mat && (
        <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.70)", border: "1px solid var(--lab-glass-border)" }}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-4 h-4 rounded" style={{ background: mat.color, flexShrink: 0 }} />
            <p className="text-[12px] font-bold" style={{ color: "var(--lab-text-primary)" }}>{mat.name}</p>
          </div>
          <p className="text-[11.5px] leading-relaxed" style={{ color: "var(--lab-text-muted)" }}>
            {mat.description}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        {mat && !store.isDropping && !store.isSettled && store.status !== "completed" && (
          <button
            onClick={store.dropAction}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${ACCENT} 0%, #0369a1 100%)`,
              boxShadow:  `0 4px 14px ${ACCENT}40`,
            }}
          >
            Drop {mat.name} into water →
          </button>
        )}
        {store.isSettled && store.status !== "completed" && (
          <button
            onClick={() => store.selectMaterialAction(store.selectedMaterial!)}
            className="w-full py-2 rounded-xl text-[12px] font-semibold border transition-all duration-150 hover:bg-slate-50"
            style={{ borderColor: "var(--lab-glass-border)", color: "var(--lab-text-muted)" }}
          >
            Test another material
          </button>
        )}
        {store.testedMaterials.length >= 4 && store.status !== "completed" && (
          <button
            onClick={store.completeAction}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
            style={{ background: "linear-gradient(135deg, #059669 0%, #047857 100%)", boxShadow: "0 4px 14px rgba(5,150,105,0.35)" }}
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

      {/* Progress */}
      <div className="rounded-xl p-3" style={{ background: "rgba(2,132,199,0.05)", border: "1px solid rgba(2,132,199,0.15)" }}>
        <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: ACCENT }}>
          Progress — {store.testedMaterials.length} / {ORDERED_MATERIALS.length} tested
        </p>
        <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: "var(--lab-slate-200)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width:      `${(store.testedMaterials.length / ORDERED_MATERIALS.length) * 100}%`,
              background: ACCENT,
            }}
          />
        </div>
      </div>
    </div>
  );

  // Summary panel for centerBottom
  const centerBottom = store.testedMaterials.length > 0 ? (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: ACCENT }}>
        Tested Materials
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
        {store.testedMaterials.map((id) => {
          const m = DENSITY_MATERIALS[id];
          return (
            <div key={id}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10.5px] font-semibold"
              style={{
                background:  (m.density < store.fluidDensity) ? "rgba(5,150,105,0.07)" : "rgba(220,38,38,0.07)",
                border:      `1px solid ${(m.density < store.fluidDensity) ? "rgba(5,150,105,0.20)" : "rgba(220,38,38,0.20)"}`,
                color:       (m.density < store.fluidDensity) ? "#059669" : "#dc2626",
              }}
            >
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: m.color }} />
              <span className="truncate">{m.name}</span>
              <span className="ml-auto flex-shrink-0">{(m.density < store.fluidDensity) ? "↑" : "↓"}</span>
            </div>
          );
        })}
      </div>
    </div>
  ) : undefined;

  return (
    <LabPageShell
      statusBar={
        <StatusBar
          status={store.status}
          error={null}
          metrics={[
            { label: "Tested", value: `${store.testedMaterials.length}/${ORDERED_MATERIALS.length}` },
            ...(mat ? [{ label: "Selected", value: mat.name }] : []),
            ...(mat ? [{ label: "Density", value: `${store.solidDensity.toFixed(2)} g/cm³` }] : []),
          ]}
        />
      }
      workspace={
        <DensityWorkspace
          selectedMaterial={store.selectedMaterial}
          isDropping={store.isDropping}
          isSettled={store.isSettled}
          testedMaterials={store.testedMaterials}
          onSettle={store.settleAction}
          fluidDensity={store.fluidDensity}
          solidDensity={store.solidDensity}
          displacementRatio={store.displacementRatio}
        />
      }
      education={EXPERIMENT_EDUCATION["density-floats-sinks"]}
      reactionNote={
        mat
          ? store.solidDensity < store.fluidDensity
            ? `${mat.name} ρ_solid = ${store.solidDensity.toFixed(2)} g/cm³ < ρ_fluid = ${store.fluidDensity.toFixed(2)} g/cm³ → floats (buoyant force = weight displaced).`
            : `${mat.name} ρ_solid = ${store.solidDensity.toFixed(2)} g/cm³ > ρ_fluid = ${store.fluidDensity.toFixed(2)} g/cm³ → sinks (weight > buoyant force).`
          : "Select a material to compare its density with water."
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
          nextHref="/experiments/dissolving-rate"
          nextLabel="Next: Dissolving Rate →"
          observations={store.observations}
          experimentKey="density-floats-sinks"
        />
      }
    />
  );
}
