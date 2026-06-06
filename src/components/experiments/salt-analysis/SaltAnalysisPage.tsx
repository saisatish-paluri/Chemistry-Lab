"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useSaltAnalysisStore }   from "@/lib/store/salt-analysis-store";
import SaltAnalysisWorkspace      from "./SaltAnalysisWorkspace";
import StepGuide                  from "@/components/lab/StepGuide";
import ObservationPanel           from "@/components/lab/ObservationPanel";
import StatusBar                  from "@/components/lab/StatusBar";
import ResultModal                from "@/components/lab/ResultModal";
import ContextPopup, { obsToPopup } from "@/components/lab/ContextPopup";
import LabPageShell               from "@/components/lab/LabPageShell";
import LabContextPanel            from "@/components/lab/LabContextPanel";
import { EXPERIMENT_EDUCATION }   from "@/lib/experiment-education";
import { SALTS, CATION_TESTS, ANION_TESTS } from "@/lib/engine/salt-analysis-engine";
import type { UnknownSaltId } from "@/lib/engine/types";

const ACCENT     = "#7c3aed";
const SALT_IDS: UnknownSaltId[] = [
  "copper-sulfate", "iron-chloride", "zinc-carbonate",
  "calcium-nitrate", "ammonium-chloride",
];

export default function SaltAnalysisPage() {
  const [showPopup, setShowPopup] = useState(false);
  const store      = useSaltAnalysisStore();
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
    popupTimer.current = setTimeout(() => setShowPopup(false), 3800);
  }, [lastObsId]);

  // Auto-complete cation test animation
  useEffect(() => {
    if (!store.isTesting) return;
    testTimer.current = setTimeout(() => {
      if (store.currentTest === "cation") store.finishCationTestAction();
      else if (store.currentTest === "anion") store.finishAnionTestAction();
    }, 1800);
    return () => { if (testTimer.current) clearTimeout(testTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.isTesting]);


  const popup = store.observations[0] ? obsToPopup(store.observations[0].type, store.observations[0].message) : null;
  const salt  = store.selectedSalt ? SALTS[store.selectedSalt] : null;
  const cationTest = store.identifiedCation ? CATION_TESTS[store.identifiedCation] : null;
  const anionTest  = store.identifiedAnion  ? ANION_TESTS[store.identifiedAnion]   : null;

  const controls = (
    <div className="space-y-4">
      {/* Salt selector */}
      <div className="lab-ctrl-section">
        <div className="lab-ctrl-section-hdr">
          <span className="lab-ctrl-section-hdr-icon">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1.5" y="3" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4 3V2.5a2.5 2.5 0 015 0V3" stroke="currentColor" strokeWidth="1.2"/></svg>
          </span>
          <span className="lab-ctrl-section-hdr-title">Select Unknown Salt</span>
        </div>
        <div className="p-2 space-y-1.5">
          {SALT_IDS.map((id) => {
            const s      = SALTS[id];
            const active = store.selectedSalt === id;
            return (
              <button
                key={id}
                onClick={() => !store.isTesting && store.status !== "completed" && store.selectSaltAction(id)}
                disabled={store.isTesting || store.status === "completed"}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all duration-150 text-left"
                style={{
                  background:  active ? `${ACCENT}10` : "rgba(255,255,255,0.65)",
                  borderColor: active ? `${ACCENT}40` : "var(--lab-glass-border)",
                  color:       active ? ACCENT : "var(--lab-text-secondary)",
                }}
              >
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color }} />
                <span className="flex-1">{s.formula}</span>
                <span className="text-[9px]" style={{ color: "var(--lab-text-subtle)" }}>Unknown</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Phase 2: Preliminary */}
      {store.phase === "preliminary" && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">👁️</span>
            <span className="lab-ctrl-section-hdr-title">Preliminary Observations</span>
          </div>
          <div className="p-2">
            <button
              onClick={() => store.preliminaryAction()}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
              style={{ background: `linear-gradient(135deg, #64748b 0%, #475569 100%)`, boxShadow: "0 4px 14px rgba(100,116,139,0.35)" }}
            >
              Record Appearance →
            </button>
          </div>
        </div>
      )}

      {/* Phase 3: Cation test */}
      {store.phase === "cation" && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">⚗️</span>
            <span className="lab-ctrl-section-hdr-title">Cation Test</span>
          </div>
          <div className="p-2">
            {salt && (
              <div className="rounded-lg p-2 mb-2 text-[10px]"
                style={{ background: "rgba(239,246,255,0.7)", border: "1px solid rgba(37,99,235,0.2)" }}>
                <p style={{ color: "var(--lab-text-muted)" }}>
                  Reagent: <strong style={{ color: "#1d4ed8" }}>{CATION_TESTS[salt.cation].reagent}</strong>
                </p>
              </div>
            )}
            <button
              disabled={store.isTesting}
              onClick={() => store.runCationTestAction()}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: `linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)`, boxShadow: "0 4px 14px rgba(37,99,235,0.35)" }}
            >
              {store.isTesting ? "Running test..." : "Run Cation Test →"}
            </button>
          </div>
        </div>
      )}

      {/* Phase 4: Anion test */}
      {store.phase === "anion" && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">🔬</span>
            <span className="lab-ctrl-section-hdr-title">Anion Test</span>
          </div>
          <div className="p-2">
            {salt && (
              <div className="rounded-lg p-2 mb-2 text-[10px]"
                style={{ background: "rgba(240,253,244,0.7)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <p style={{ color: "var(--lab-text-muted)" }}>
                  Reagent: <strong style={{ color: "#166534" }}>{ANION_TESTS[salt.anion].reagent}</strong>
                </p>
              </div>
            )}
            <button
              disabled={store.isTesting}
              onClick={() => store.runAnionTestAction()}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: `linear-gradient(135deg, #059669 0%, #047857 100%)`, boxShadow: "0 4px 14px rgba(5,150,105,0.35)" }}
            >
              {store.isTesting ? "Running test..." : "Run Anion Test →"}
            </button>
          </div>
        </div>
      )}

      {/* Phase 5: Identify */}
      {store.phase === "identify" && store.status !== "completed" && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">✅</span>
            <span className="lab-ctrl-section-hdr-title">Identify Salt</span>
          </div>
          <div className="p-2">
            {salt && (
              <div className="rounded-lg p-2.5 mb-2 text-[10.5px]"
                style={{ background: "rgba(240,253,244,0.85)", border: "1px solid rgba(34,197,94,0.3)" }}>
                <p className="font-bold mb-1" style={{ color: "#166534" }}>{salt.name}</p>
                <p style={{ color: "var(--lab-text-muted)" }}>Cation: {store.identifiedCation} · Anion: {store.identifiedAnion}</p>
              </div>
            )}
            <button
              onClick={() => store.completeAction()}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
              style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #6d28d9 100%)`, boxShadow: `0 4px 14px ${ACCENT}40` }}
            >
              Confirm Identification ✓
            </button>
          </div>
        </div>
      )}

      {/* Results summary */}
      {(cationTest || anionTest) && (
        <div className="rounded-xl p-3 space-y-2" style={{ background: `${ACCENT}06`, border: `1px solid ${ACCENT}18` }}>
          <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: ACCENT }}>Test Results</p>
          {cationTest && (
            <div className="flex items-center gap-2 text-[10px]">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: cationTest.color }} />
              <span style={{ color: "var(--lab-text-muted)" }}>{cationTest.observation.slice(0, 35)}</span>
            </div>
          )}
          {anionTest && (
            <div className="flex items-center gap-2 text-[10px]">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: anionTest.color }} />
              <span style={{ color: "var(--lab-text-muted)" }}>{anionTest.observation.slice(0, 35)}</span>
            </div>
          )}
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
      title="Qualitative Salt Analysis"
      accent={ACCENT}
      summary="Systematically identify an unknown salt using cation tests (NaOH / flame test) and anion tests (AgNO₃ / BaCl₂ / HCl). Match results to identify the compound."
      facts={[
        { icon: "🔵", label: "Cu²⁺ test", value: "Blue ppt (NaOH)" },
        { icon: "🟤", label: "Fe³⁺ test", value: "Brown ppt (NaOH)" },
        { icon: "⚪", label: "SO₄²⁻ test", value: "White ppt (BaCl₂)" },
        { icon: "💨", label: "CO₃²⁻ test", value: "CO₂ gas (HCl)" },
      ]}
      steps={[
        { number: 1, title: "Select unknown salt", body: "Choose one of the 5 unknown solutions." },
        { number: 2, title: "Cation test", body: "Add NaOH (or flame test for Ca). Observe precipitate colour or flame colour." },
        { number: 3, title: "Anion test", body: "Add AgNO₃, BaCl₂, or HCl. Observe precipitate or gas." },
        { number: 4, title: "Identify", body: "Combine results to name the complete salt." },
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
            { label: "Phase",  value: store.phase },
            ...(salt ? [{ label: "Sample", value: salt.formula }] : []),
            ...(store.identifiedCation ? [{ label: "Cation ✓", value: store.identifiedCation }] : []),
            ...(store.identifiedAnion  ? [{ label: "Anion ✓",  value: store.identifiedAnion  }] : []),
          ]}
        />
      }
      workspace={<SaltAnalysisWorkspace state={store} />}
      education={EXPERIMENT_EDUCATION["salt-analysis"]}
      reactionNote={
        store.phase === "identify" && salt
          ? `Identified: ${salt.name} (${salt.formula}) — ${salt.cation} cation + ${salt.anion} anion`
          : store.identifiedCation
          ? `Cation: ${store.identifiedCation} ✓ — Now run the anion test to complete identification.`
          : store.selectedSalt
          ? `Unknown salt selected — perform cation test with NaOH to begin analysis.`
          : "Select an unknown salt and run systematic tests to identify it."
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
          nextHref="/experiments/water-hardness"
          nextLabel="Next: Water Hardness →"
          observations={store.observations}
          experimentKey="salt-analysis"
        />
      }
    />
  );
}
