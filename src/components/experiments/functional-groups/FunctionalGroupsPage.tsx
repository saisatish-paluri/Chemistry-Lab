"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useFunctionalGroupsStore } from "@/lib/store/functional-groups-store";
import FunctionalGroupsWorkspace    from "./FunctionalGroupsWorkspace";
import StepGuide                    from "@/components/lab/StepGuide";
import ObservationPanel             from "@/components/lab/ObservationPanel";
import StatusBar                    from "@/components/lab/StatusBar";
import ResultModal                  from "@/components/lab/ResultModal";
import ContextPopup, { obsToPopup } from "@/components/lab/ContextPopup";
import LabPageShell                 from "@/components/lab/LabPageShell";
import LabContextPanel              from "@/components/lab/LabContextPanel";
import { EXPERIMENT_EDUCATION }     from "@/lib/experiment-education";
import { COMPOUNDS, TESTS }         from "@/lib/engine/functional-groups-engine";
import type { UnknownCompoundId, FGTestId } from "@/lib/engine/types";

const ACCENT       = "#d97706";
const COMPOUND_IDS: UnknownCompoundId[] = ["compound-a", "compound-b", "compound-c", "compound-d", "compound-e"];
const TEST_IDS: FGTestId[]              = ["lucas-test", "tollens-test", "dnp-test", "nahco3-test", "hinsberg-test"];

export default function FunctionalGroupsPage() {
  const [showPopup, setShowPopup] = useState(false);
  const store      = useFunctionalGroupsStore();
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
    popupTimer.current = setTimeout(() => setShowPopup(false), 4000);
  }, [lastObsId]);

  // Auto-finish test animation
  useEffect(() => {
    if (!store.isTesting) return;
    testTimer.current = setTimeout(() => store.finishTestAction(), 1500);
    return () => { if (testTimer.current) clearTimeout(testTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.isTesting]);


  const popup    = store.observations[0] ? obsToPopup(store.observations[0].type, store.observations[0].message) : null;
  const compound = store.selectedCompound ? COMPOUNDS[store.selectedCompound] : null;
  const test     = store.selectedTest ? TESTS[store.selectedTest] : null;
  const lastResult = store.testResults[0] ?? null;

  const controls = (
    <div className="space-y-4">
      {/* Compound selector */}
      <div className="lab-ctrl-section">
        <div className="lab-ctrl-section-hdr">
          <span className="lab-ctrl-section-hdr-icon">🧬</span>
          <span className="lab-ctrl-section-hdr-title">Select Unknown Compound</span>
        </div>
        <div className="p-2 space-y-1.5">
          {COMPOUND_IDS.map((id) => {
            const c      = COMPOUNDS[id];
            const active = store.selectedCompound === id;
            const done   = store.testResults.some(r => r.positive);
            return (
              <button
                key={id}
                onClick={() => !store.isTesting && store.status !== "completed" && store.selectCompoundAction(id)}
                disabled={store.isTesting || store.status === "completed"}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all duration-150 text-left"
                style={{
                  background:  active ? `${ACCENT}12` : "rgba(255,255,255,0.65)",
                  borderColor: active ? `${ACCENT}45` : "var(--lab-glass-border)",
                  color:       active ? ACCENT : "var(--lab-text-secondary)",
                }}
              >
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded font-bold"
                  style={{ background: active ? `${ACCENT}18` : "rgba(148,163,184,0.15)", color: active ? ACCENT : "var(--lab-text-muted)" }}>
                  {c.label}
                </span>
                <span className="flex-1">{c.formula}</span>
                {active && done && store.identified && (
                  <span className="text-[9px] font-bold" style={{ color: "#22c55e" }}>✓</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Test selector */}
      {store.selectedCompound && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">⚗️</span>
            <span className="lab-ctrl-section-hdr-title">Choose Reagent Test</span>
          </div>
          <div className="p-2 space-y-1.5">
            {TEST_IDS.map((id) => {
              const t      = TESTS[id];
              const active = store.selectedTest === id;
              return (
                <button
                  key={id}
                  onClick={() => !store.isTesting && store.selectTestAction(id)}
                  disabled={store.isTesting}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10.5px] font-semibold border transition-all duration-150 text-left"
                  style={{
                    background:  active ? "rgba(239,246,255,0.85)" : "rgba(255,255,255,0.65)",
                    borderColor: active ? "rgba(37,99,235,0.4)"    : "var(--lab-glass-border)",
                    color:       active ? "#1d4ed8"                : "var(--lab-text-secondary)",
                  }}
                >
                  <span className="flex-1">{t.name}</span>
                  <span className="text-[8.5px]" style={{ color: "var(--lab-text-subtle)" }}>
                    {t.detects.replace("-", " ")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Run test button */}
      {store.selectedCompound && store.selectedTest && (
        <div className="space-y-3">
          <div className="lab-ctrl-section p-2.5 space-y-3.5">
            <div className="lab-ctrl-section-hdr pb-1 border-b border-slate-100">
              <span className="lab-ctrl-section-hdr-title text-[10px]">Reaction Parameters</span>
            </div>
            <div>
              <div className="flex justify-between text-[10px] mb-0.5">
                <span>Reaction Temperature:</span>
                <span className="font-bold text-slate-700">{store.temperature} °C</span>
              </div>
              <input
                type="range"
                min="15"
                max="85"
                step="1"
                value={store.temperature}
                disabled={store.isTesting}
                onChange={(e) => store.updateParamsAction({ temperature: parseInt(e.target.value) })}
                className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-amber-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] mb-0.5">
                <span>Reagent Concentration:</span>
                <span className="font-bold text-slate-700">{store.reagentConc.toFixed(1)} M</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="6.0"
                step="0.1"
                value={store.reagentConc}
                disabled={store.isTesting}
                onChange={(e) => store.updateParamsAction({ reagentConc: parseFloat(e.target.value) })}
                className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-amber-600"
              />
            </div>
          </div>

          {!store.isTesting && (
            <button
              onClick={() => store.runTestAction()}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 active:scale-95"
              style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #b45309 100%)`, boxShadow: `0 4px 14px ${ACCENT}45` }}
            >
              Add Reagent & React →
            </button>
          )}
          {store.isTesting && (
            <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: `${ACCENT}10`, color: ACCENT }}>
              <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
              Reaction in progress...
            </div>
          )}
        </div>
      )}

      {/* Last result card */}
      {lastResult && (
        <div className="rounded-xl p-3"
          style={{ background: lastResult.positive ? "rgba(240,253,244,0.9)" : "rgba(241,245,249,0.9)",
                   border: `1px solid ${lastResult.positive ? "rgba(34,197,94,0.3)" : "rgba(148,163,184,0.25)"}` }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: lastResult.positive ? "rgba(34,197,94,0.15)" : "rgba(148,163,184,0.15)",
                       color: lastResult.positive ? "#166534" : "#64748b" }}>
              {lastResult.positive ? "POSITIVE ✓" : "NEGATIVE ✗"}
            </span>
            <span className="text-[9.5px]" style={{ color: "var(--lab-text-muted)" }}>{lastResult.testName}</span>
          </div>
          <p className="text-[9.5px] leading-relaxed" style={{ color: "var(--lab-text-muted)" }}>
            {lastResult.observation}
          </p>
        </div>
      )}

      {/* Identified group */}
      {store.identified && store.status !== "completed" && (
        <div className="rounded-xl p-3" style={{ background: `${ACCENT}10`, border: `1px solid ${ACCENT}30` }}>
          <p className="text-[10px] font-bold mb-1" style={{ color: ACCENT }}>
            Functional Group Identified ✓
          </p>
          <p className="text-[12px] font-bold" style={{ color: "#92400e" }}>
            {store.identified.charAt(0).toUpperCase() + store.identified.slice(1).replace("-", " ")}
          </p>
          <button
            onClick={() => store.completeAction()}
            className="w-full mt-2 py-2 rounded-xl text-[12px] font-bold text-white"
            style={{ background: "linear-gradient(135deg, #059669 0%, #047857 100%)", boxShadow: "0 3px 10px rgba(5,150,105,0.3)" }}
          >
            Complete Experiment ✓
          </button>
        </div>
      )}

      {/* Test history */}
      {store.testResults.length > 0 && (
        <div className="rounded-xl p-3" style={{ background: "rgba(241,245,249,0.85)", border: "1px solid var(--lab-glass-border)" }}>
          <p className="text-[9.5px] font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--lab-text-secondary)" }}>
            Tests Run
          </p>
          {store.testResults.slice(0, 4).map((r, i) => (
            <div key={i} className="flex items-center gap-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: r.positive ? "#22c55e" : "#f87171" }} />
              <span className="text-[9.5px]" style={{ color: "var(--lab-text-muted)" }}>{r.testName.slice(0, 18)}</span>
              <span className="ml-auto text-[9px] font-bold" style={{ color: r.positive ? "#166534" : "#dc2626" }}>
                {r.positive ? "+" : "–"}
              </span>
            </div>
          ))}
        </div>
      )}

      {store.status === "completed" && (
        <button onClick={store.resetAction}
          className="w-full py-2 rounded-xl text-[12px] font-semibold border transition-all duration-150 hover:bg-slate-50"
          style={{ borderColor: "var(--lab-glass-border)", color: "var(--lab-text-muted)" }}>
          Reset Lab
        </button>
      )}
    </div>
  );

  const leftPanel = (
    <LabContextPanel
      title="Functional Group Tests"
      accent={ACCENT}
      summary="Identify organic functional groups using characteristic chemical tests. Each compound contains one functional group — match the positive test to identify it."
      facts={[
        { icon: "🍷", label: "Lucas Test",  value: "Alcohol (–OH)" },
        { icon: "🪞", label: "Tollen's",    value: "Aldehyde (–CHO)" },
        { icon: "🟠", label: "2,4-DNP",     value: "Ketone (C=O)" },
        { icon: "💨", label: "NaHCO₃",      value: "Acid (–COOH)" },
      ]}
      steps={[
        { number: 1, title: "Select compound",  body: "Pick an unknown compound A–E from the list." },
        { number: 2, title: "Choose test",      body: "Select the reagent that detects the suspected group." },
        { number: 3, title: "Add & observe",    body: "Run the test and observe colour, precipitate, or gas." },
        { number: 4, title: "Identify",         body: "A positive result confirms the functional group." },
      ]}
    />
  );

  return (
    <LabPageShell
      leftPanel={leftPanel}
      statusBar={
        <StatusBar
          status={store.status}
          error={null}
          metrics={[
            { label: "Tests run", value: `${store.testResults.length}` },
            ...(compound ? [{ label: "Compound", value: compound.label }] : []),
            ...(test ? [{ label: "Reagent", value: test.name.split(" ")[0] }] : []),
            ...(store.identified ? [{ label: "Group ✓", value: store.identified.replace("-", " ") }] : []),
          ]}
        />
      }
      workspace={<FunctionalGroupsWorkspace state={store} />}
      education={EXPERIMENT_EDUCATION["functional-groups"]}
      reactionNote={
        store.identified
          ? `${compound?.label ?? "Compound"} identified as ${store.identified.replace("-", " ")} — confirmed by ${test?.name ?? "chemical test"}`
          : store.selectedCompound && store.selectedTest
          ? `Testing ${compound?.label}: ${test?.name ?? ""} — ${test?.detects ? "detects " + test.detects.replace("-", " ") : ""}`
          : "Select an unknown compound, choose a reagent test, and observe the reaction."
      }
      controls={controls}
      stepGuide={<StepGuide steps={store.steps} objectives={store.objectives} />}
      mode={store.mode}
      onSetMode={store.setMode}
      observations={<ObservationPanel observations={store.observations} />}
      obsNotif={popup ? <ContextPopup visible={showPopup} what={popup.what} why={popup.why} kind={popup.kind} /> : null}
      resultModal={
        <ResultModal
          result={store.result}
          onReset={store.resetAction}
          nextHref="/experiments/chromatography"
          nextLabel="Next: Chromatography →"
          observations={store.observations}
          experimentKey="functional-groups"
        />
      }
    />
  );
}
