"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useIndicatorStore }           from "@/lib/store/indicator-test-store";
import IndicatorWorkspace              from "./IndicatorWorkspace";
import ObservationPanel                from "@/components/lab/ObservationPanel";
import StatusBar                       from "@/components/lab/StatusBar";
import ResultModal                     from "@/components/lab/ResultModal";
import ContextPopup, { obsToPopup }    from "@/components/lab/ContextPopup";
import LabPageShell                    from "@/components/lab/LabPageShell";
import StepGuide                       from "@/components/lab/StepGuide";
import { INDICATORS, SUBSTANCES, getIndicatorColor } from "@/lib/engine/indicator-test-engine";
import type { IndicatorTestId, TestSubstanceId } from "@/lib/engine/types";
import { EXPERIMENT_EDUCATION }        from "@/lib/experiment-education";

const ACCENT = "#7c3aed";

const INDICATOR_IDS: IndicatorTestId[]  = ["turmeric", "red-litmus", "blue-litmus", "cabbage-juice"];
const SUBSTANCE_IDS: TestSubstanceId[]  = [
  "vinegar", "lemon-juice", "baking-soda", "soap-solution",
  "milk", "distilled-water", "ammonia", "salt-solution",
];

export default function IndicatorPage() {
  const [showPopup, setShowPopup] = useState(false);
  const store      = useIndicatorStore();
  const testTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    store.hydrate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => {
    if (testTimer.current)  clearTimeout(testTimer.current);
    if (popupTimer.current) clearTimeout(popupTimer.current);
  }, []);

  const lastObsId = store.observations[0]?.id;
  useEffect(() => {
    if (!lastObsId) return;
    startTransition(() => setShowPopup(true));
    if (popupTimer.current) clearTimeout(popupTimer.current);
    popupTimer.current = setTimeout(() => setShowPopup(false), 3500);
  }, [lastObsId]);

  // Auto-finish the test animation after 1.2s
  useEffect(() => {
    if (!store.isTesting) return;
    testTimer.current = setTimeout(() => {
      store.finishTestAction();
    }, 1200);
    return () => { if (testTimer.current) clearTimeout(testTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.isTesting]);


  const popup = store.observations[0]
    ? obsToPopup(store.observations[0].type, store.observations[0].message)
    : null;

  const ind = store.selectedIndicator ? INDICATORS[store.selectedIndicator] : null;
  const sub = store.selectedSubstance ? SUBSTANCES[store.selectedSubstance] : null;

  const controls = (
    <div className="space-y-4">
      {/* Indicator selector */}
      <div className="lab-ctrl-section">
        <div className="lab-ctrl-section-hdr">
          <span className="lab-ctrl-section-hdr-icon">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="5" width="11" height="6" rx="2" stroke="currentColor" strokeWidth="1.2"/><rect x="4" y="2" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/></svg>
          </span>
          <span className="lab-ctrl-section-hdr-title">Indicator</span>
        </div>
        <div className="p-2 space-y-1.5">
          {INDICATOR_IDS.map((id) => {
            const i = INDICATORS[id];
            const active = store.selectedIndicator === id;
            return (
              <button
                key={id}
                onClick={() => !store.isTesting && store.selectIndicatorAction(id)}
                disabled={store.isTesting || store.status === "completed"}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all duration-150 text-left"
                style={{
                  background:  active ? `${ACCENT}10` : "rgba(255,255,255,0.65)",
                  borderColor: active ? `${ACCENT}40` : "var(--lab-glass-border)",
                  color:       active ? ACCENT : "var(--lab-text-secondary)",
                  opacity:     store.isTesting || store.status === "completed" ? 0.5 : 1,
                }}
              >
                <span className="flex-1 truncate">{i.name}</span>
                <span className="text-[8.5px] font-normal flex-shrink-0" style={{ color: "var(--lab-text-muted)" }}>{i.origin}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Substance selector */}
      <div className="lab-ctrl-section">
        <div className="lab-ctrl-section-hdr">
          <span className="lab-ctrl-section-hdr-icon">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M5 2v5L2 10h9L8 7V2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          <span className="lab-ctrl-section-hdr-title">Substance to Test</span>
        </div>
        <div className="p-2 grid grid-cols-2 gap-1">
          {SUBSTANCE_IDS.map((id) => {
            const s      = SUBSTANCES[id];
            const active = store.selectedSubstance === id;
            const color  = s.classification === "acidic" ? "#dc2626" : s.classification === "basic" ? "#7c3aed" : "#6b7280";
            return (
              <button
                key={id}
                onClick={() => !store.isTesting && store.selectSubstanceAction(id)}
                disabled={store.isTesting || store.status === "completed"}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10.5px] font-semibold border transition-all duration-150 text-left"
                style={{
                  background:  active ? `${color}10` : "rgba(255,255,255,0.65)",
                  borderColor: active ? `${color}40` : "var(--lab-glass-border)",
                  color:       active ? color : "var(--lab-text-secondary)",
                  opacity:     store.isTesting || store.status === "completed" ? 0.5 : 1,
                }}
              >
                <span className="truncate">{s.name.split(" (")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview of result */}
      {ind && sub && (
        <div className="rounded-xl p-3 text-[11px]"
          style={{ background: "rgba(255,255,255,0.70)", border: "1px solid var(--lab-glass-border)" }}>
          <p className="font-bold mb-1.5" style={{ color: "var(--lab-text-primary)" }}>
            Expected Result
          </p>
          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-full flex-shrink-0 border-2 border-white"
              style={{
                background: getIndicatorColor(store.selectedIndicator!, store.selectedSubstance!).color,
                boxShadow:  "0 1px 3px rgba(0,0,0,0.15)",
              }}
            />
            <span style={{ color: "var(--lab-text-secondary)" }}>
              {getIndicatorColor(store.selectedIndicator!, store.selectedSubstance!).label}
            </span>
          </div>
        </div>
      )}

      {/* Test button */}
      <div className="space-y-2">
        {ind && sub && !store.isTesting && store.status !== "completed" && (
          <button
            onClick={store.testAction}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${ACCENT} 0%, #6d28d9 100%)`,
              boxShadow:  `0 4px 14px ${ACCENT}40`,
            }}
          >
            Test Now →
          </button>
        )}
        {store.isTesting && (
          <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: `${ACCENT}10`, color: ACCENT }}>
            <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
            Testing...
          </div>
        )}
        {store.testHistory.length >= 3 && store.status !== "completed" && !store.isTesting && (
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
      <div className="rounded-xl p-3" style={{ background: `${ACCENT}06`, border: `1px solid ${ACCENT}18` }}>
        <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: ACCENT }}>
          Tests Done — {store.testHistory.length} results
        </p>
        <div className="flex gap-1 flex-wrap">
          {store.testHistory.slice(0, 8).map((r) => (
            <span
              key={r.id}
              className="w-4 h-4 rounded-full border-2 border-white"
              style={{ background: r.resultColor, boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }}
              title={`${INDICATORS[r.indicator].name} + ${SUBSTANCES[r.substance].name}`}
            />
          ))}
        </div>
      </div>
    </div>
  );

  // History in centerBottom
  const centerBottom = store.testHistory.length > 0 ? (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: ACCENT }}>
        Test History
      </p>
      {store.testHistory.slice(0, 8).map((r) => {
        const sData = SUBSTANCES[r.substance];
        const clsColor = r.classification === "acidic" ? "#dc2626" : r.classification === "basic" ? "#7c3aed" : "#6b7280";
        return (
          <div key={r.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[10px]"
            style={{ background: "rgba(255,255,255,0.65)", border: "1px solid var(--lab-glass-border)" }}>
            <span className="w-3 h-3 rounded-full flex-shrink-0 border border-white" style={{ background: r.resultColor }} />
            <span className="truncate flex-1" style={{ color: "var(--lab-text-muted)" }}>
              {sData.name.split(" (")[0]}
            </span>
            <span className="font-bold flex-shrink-0" style={{ color: clsColor, fontSize: 9 }}>
              {r.classification.toUpperCase()}
            </span>
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
            { label: "Tests", value: `${store.testHistory.length}` },
            ...(ind ? [{ label: "Indicator", value: ind.name }] : []),
            ...(sub ? [{ label: "Substance", value: sub.name.split(" (")[0] }] : []),
          ]}
        />
      }
      workspace={
        <IndicatorWorkspace
          selectedIndicator={store.selectedIndicator}
          selectedSubstance={store.selectedSubstance}
          isTesting={store.isTesting}
          currentResult={store.currentResult}
          onTest={store.testAction}
        />
      }
      education={EXPERIMENT_EDUCATION["indicator-test"]}
      reactionNote={
        store.currentResult
          ? `${sub?.name ?? "Substance"}: ${store.currentResult.classification.toUpperCase()} · pH ≈ ${store.currentResult.pH} · ${ind?.name ?? "Indicator"} shows this colour`
          : "Select an indicator and a substance, then click Test to see the colour change."
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
          nextHref="/experiments/filtration-basics"
          nextLabel="Next: Filtration Basics →"
          observations={store.observations}
          experimentKey="indicator-test"
        />
      }
    />
  );
}
