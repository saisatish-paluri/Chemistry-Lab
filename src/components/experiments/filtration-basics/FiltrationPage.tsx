"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useFiltrationStore }          from "@/lib/store/filtration-basics-store";
import FiltrationWorkspace             from "./FiltrationWorkspace";
import ObservationPanel                from "@/components/lab/ObservationPanel";
import StatusBar                       from "@/components/lab/StatusBar";
import ResultModal                     from "@/components/lab/ResultModal";
import ContextPopup, { obsToPopup }    from "@/components/lab/ContextPopup";
import LabPageShell                    from "@/components/lab/LabPageShell";
import StepGuide                       from "@/components/lab/StepGuide";
import { EXPERIMENT_EDUCATION }        from "@/lib/experiment-education";

const ACCENT = "#d97706";


export default function FiltrationPage() {
  const [showPopup, setShowPopup] = useState(false);
  const store      = useFiltrationStore();
  const tickRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const popupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    store.hydrate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-advance animations
  useEffect(() => {
    const stage = store.stage;
    if (stage === "mixing" || stage === "filtering") {
      tickRef.current = setInterval(() => {
        if (stage === "mixing")    store.tickMixAction(0.1);
        if (stage === "filtering") store.tickFilterAction(0.1);
      }, 100);
    } else {
      if (tickRef.current) clearInterval(tickRef.current);
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.stage]);

  useEffect(() => () => {
    if (tickRef.current)  clearInterval(tickRef.current);
    if (popupTimer.current) clearTimeout(popupTimer.current);
  }, []);

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

  const controls = (
    <div className="space-y-4">
      {/* Concept card */}
      <div className="rounded-xl p-3 text-[11px]"
        style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}22` }}>
        <p className="font-bold mb-1.5" style={{ color: ACCENT }}>Key Concept</p>
        <p className="leading-relaxed" style={{ color: "var(--lab-text-secondary)" }}>
          Filtration separates an <strong>insoluble solid</strong> (sand) from a <strong>liquid</strong> (salt solution). The filter paper has tiny pores that block solid particles but allow liquid through.
        </p>
      </div>

      {/* Mixture & Fluid Properties */}
      <div className="lab-ctrl-section">
        <div className="lab-ctrl-section-hdr">
          <span className="lab-ctrl-section-hdr-icon">🧪</span>
          <span className="lab-ctrl-section-hdr-title">Mixture & Fluid Properties</span>
        </div>
        <div className="p-3 space-y-3">
          {store.stage === "setup" ? (
            <>
              {/* Sliders for setup */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-medium">Sand (SiO₂) Mass</span>
                  <span className="font-bold text-amber-700">{store.sandGrams} g</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={store.sandGrams}
                  onChange={(e) => store.updateCompositionAction({ sandGrams: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-amber-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-medium">Salt (NaCl) Mass</span>
                  <span className="font-bold text-emerald-700">{store.saltGrams} g</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={store.saltGrams}
                  onChange={(e) => store.updateCompositionAction({ saltGrams: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-medium">Water Volume</span>
                  <span className="font-bold text-sky-700">{store.waterMl} mL</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  step="5"
                  value={store.waterMl}
                  onChange={(e) => store.updateCompositionAction({ waterMl: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-sky-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-medium">Water Temperature</span>
                  <span className="font-bold text-red-600">{store.temperature} °C</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  step="1"
                  value={store.temperature}
                  onChange={(e) => store.updateCompositionAction({ temperature: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-red-600"
                />
              </div>
            </>
          ) : (
            <>
              {/* Static display during run */}
              <div className="space-y-1.5 text-[11.5px]">
                {[
                  { label: "Sand (SiO₂)",    value: `${store.sandGrams}g`, note: "Insoluble" },
                  { label: "Salt (NaCl)",    value: `${store.saltGrams}g`, note: "Soluble" },
                  { label: "Water (H₂O)",    value: `${store.waterMl}mL`, note: "Solvent" },
                  { label: "Temperature",    value: `${store.temperature}°C`, note: "Thermal" },
                ].map(({ label, value, note }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="flex-1" style={{ color: "var(--lab-text-muted)" }}>{label}</span>
                    <span className="font-bold font-mono" style={{ color: "var(--lab-text-secondary)" }}>{value}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded"
                      style={{ background: note === "Soluble" ? "rgba(5,150,105,0.08)" : note === "Thermal" ? "rgba(239,68,68,0.08)" : "rgba(37,99,235,0.08)",
                               color:      note === "Soluble" ? "#059669" : note === "Thermal" ? "#ef4444" : "var(--lab-text-muted)" }}>
                      {note}
                    </span>
                  </div>
                ))}
              </div>

              {/* Dynamic properties */}
              <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-500">
                <div className="flex justify-between">
                  <span>Fluid Viscosity:</span>
                  <span className="font-bold text-slate-700">{store.viscosity.toFixed(3)} cP</span>
                </div>
                <div className="flex justify-between">
                  <span>Clogging Factor:</span>
                  <span className="font-bold text-slate-700">{store.cloggingFactor.toFixed(2)}x</span>
                </div>
                {store.flowRate > 0 && (
                  <div className="flex justify-between">
                    <span>Filter Flow Rate:</span>
                    <span className="font-bold text-amber-700">{store.flowRate.toFixed(2)} mL/s</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stage buttons */}
      <div className="space-y-2">
        {store.stage === "setup" && (
          <button
            onClick={store.addWaterAction}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
            style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #b45309 100%)`, boxShadow: `0 4px 14px ${ACCENT}40` }}
          >
            Add Water →
          </button>
        )}
        {store.stage === "mixing" && (
          <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: `${ACCENT}10`, color: ACCENT }}>
            <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
            Stirring... {Math.round(store.mixProgress * 100)}%
          </div>
        )}
        {store.stage === "mixed" && (
          <button
            onClick={store.setupFilterAction}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
            style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #b45309 100%)`, boxShadow: `0 4px 14px ${ACCENT}40` }}
          >
            Set Up Filter Funnel →
          </button>
        )}
        {store.stage === "pouring" && (
          <button
            onClick={store.startPourAction}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
            style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #b45309 100%)`, boxShadow: `0 4px 14px ${ACCENT}40` }}
          >
            Pour Mixture Through Funnel →
          </button>
        )}
        {store.stage === "filtering" && (
          <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: `${ACCENT}10`, color: ACCENT }}>
            <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
            Filtering... {Math.round(store.filterProgress * 100)}%
          </div>
        )}
        {(store.stage === "complete" || (store.filterProgress > 0.3 && store.stage !== "setup")) && store.status !== "completed" && (
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

      {/* Results */}
      {store.stage === "complete" && (
        <div className="space-y-2">
          {[
            { label: "Filtrate collected",  value: `${store.filtrateVolume.toFixed(0)} mL`, color: "#0284c7" },
            { label: "Sand residue",        value: `${store.residueMass.toFixed(1)} g`,     color: "#78350f" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between px-3 py-2 rounded-xl text-[11.5px]"
              style={{ background: "rgba(255,255,255,0.70)", border: "1px solid var(--lab-glass-border)" }}>
              <span style={{ color: "var(--lab-text-muted)" }}>{label}</span>
              <span className="font-bold font-mono" style={{ color }}>{value}</span>
            </div>
          ))}
          <p className="text-[10.5px] leading-relaxed px-1" style={{ color: "var(--lab-text-muted)" }}>
            The filtrate still contains dissolved salt. To recover pure salt, you would need to evaporate the water.
          </p>
        </div>
      )}
    </div>
  );

  const reactionNotes: Record<string, string> = {
    setup:     "Sand (insoluble) + salt (soluble) mixture — add water to dissolve the salt.",
    mixing:    "NaCl → Na⁺ + Cl⁻ dissolving; sand remains as suspended particles.",
    mixed:     "Salt dissolved; mixture turbid with suspended sand — set up the filter funnel.",
    pouring:   "Filter paper pores allow liquid through but retain sand particles.",
    filtering: "Filtration in progress — clear salt filtrate collects; sand builds as residue.",
    complete:  `Complete — ${store.filtrateVolume.toFixed(0)} mL filtrate collected · ${store.residueMass.toFixed(1)} g sand residue on paper.`,
  };

  return (
    <LabPageShell
      statusBar={
        <StatusBar
          status={store.status}
          error={null}
          metrics={[
            { label: "Stage",    value: store.stage },
            ...(store.stage !== "setup" ? [{ label: "Filtrate", value: `${store.filtrateVolume.toFixed(0)} mL` }] : []),
            ...(store.filterProgress > 0 ? [{ label: "Filter %", value: `${Math.round(store.filterProgress * 100)}%` }] : []),
          ]}
        />
      }
      workspace={
        <FiltrationWorkspace
          stage={store.stage}
          mixProgress={store.mixProgress}
          filterProgress={store.filterProgress}
          filtrateVolume={store.filtrateVolume}
          residueMass={store.residueMass}
          sandGrams={store.sandGrams}
          waterMl={store.waterMl}
          cloggingFactor={store.cloggingFactor}
          flowRate={store.flowRate}
          onSetupFilter={store.setupFilterAction}
          onStartPour={store.startPourAction}
        />
      }
      education={EXPERIMENT_EDUCATION["filtration-basics"]}
      reactionNote={reactionNotes[store.stage]}
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
          nextHref="/experiments/titration"
          nextLabel="Try Advanced: Titration →"
          observations={store.observations}
          experimentKey="filtration-basics"
        />
      }
    />
  );
}
