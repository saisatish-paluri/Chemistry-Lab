"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useNeutralizationStore } from "@/lib/store/neutralization-store";
import NeutralizationWorkspace   from "./NeutralizationWorkspace";
import StepGuide                 from "@/components/lab/StepGuide";
import ObservationPanel          from "@/components/lab/ObservationPanel";
import StatusBar                 from "@/components/lab/StatusBar";
import ResultModal               from "@/components/lab/ResultModal";
import ContextPopup, { obsToPopup } from "@/components/lab/ContextPopup";
import LabPageShell              from "@/components/lab/LabPageShell";
import LabContextPanel           from "@/components/lab/LabContextPanel";
import { EXPERIMENT_EDUCATION }  from "@/lib/experiment-education";

const ACCENT = "#10b981";
const HCL_VOL  = 25;
const NAOH_VOL = 25;

export default function NeutralizationPage() {
  const [showPopup, setShowPopup] = useState(false);
  const store = useNeutralizationStore();

  const mixTimer   = useRef<ReturnType<typeof setInterval> | null>(null);
  const popupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    store.hydrate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => {
    if (mixTimer.current)   clearInterval(mixTimer.current);
    if (popupTimer.current) clearTimeout(popupTimer.current);
  }, []);

  const lastObsId = store.observations[0]?.id;
  useEffect(() => {
    if (!lastObsId) return;
    startTransition(() => setShowPopup(true));
    if (popupTimer.current) clearTimeout(popupTimer.current);
    popupTimer.current = setTimeout(() => setShowPopup(false), 3600);
  }, [lastObsId]);

  // Drive mix animation
  useEffect(() => {
    if (!store.isMixing) {
      if (mixTimer.current) { clearInterval(mixTimer.current); mixTimer.current = null; }
      return;
    }
    let progress = store.mixProgress;
    mixTimer.current = setInterval(() => {
      progress = Math.min(1, progress + 0.04);
      startTransition(() => store.updateMixProgressAction(progress));
      if (progress >= 1) {
        if (mixTimer.current) clearInterval(mixTimer.current);
      }
    }, 80);
    return () => { if (mixTimer.current) clearInterval(mixTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.isMixing]);


  const popup   = store.observations[0] ? obsToPopup(store.observations[0].type, store.observations[0].message) : null;
  const deltaT  = (store.currentTempC - store.initialTempC).toFixed(1);
  const saltMg  = store.saltFormed ? ((Math.min(HCL_VOL, NAOH_VOL) / 1000 * 0.1) * 58.44 * 1000).toFixed(1) : "—";

  const controls = (
    <div className="space-y-4">
      {/* Step 1: Measure HCl */}
      <div className="lab-ctrl-section">
        <div className="lab-ctrl-section-hdr">
          <span className="lab-ctrl-section-hdr-icon">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M4 2v7L1 12h11L9 9V2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          <span className="lab-ctrl-section-hdr-title">Step 1 — Measure HCl</span>
        </div>
        <div className="p-2">
          <button
            disabled={store.currentStep !== "measure-hcl"}
            onClick={() => store.measureHClAction(HCL_VOL)}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: `linear-gradient(135deg, #f59e0b 0%, #d97706 100%)`, boxShadow: "0 4px 14px rgba(245,158,11,0.35)" }}
          >
            Measure {HCL_VOL} mL HCl
          </button>
          {store.hclVolumeMl > 0 && (
            <p className="text-[10px] mt-1.5 text-center" style={{ color: "#b45309" }}>
              ✓ {store.hclVolumeMl} mL HCl in beaker
            </p>
          )}
        </div>
      </div>

      {/* Step 2: Measure NaOH */}
      <div className="lab-ctrl-section">
        <div className="lab-ctrl-section-hdr">
          <span className="lab-ctrl-section-hdr-icon">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M4 2v7L1 12h11L9 9V2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          <span className="lab-ctrl-section-hdr-title">Step 2 — Measure NaOH</span>
        </div>
        <div className="p-2">
          <button
            disabled={store.currentStep !== "measure-naoh"}
            onClick={() => store.measureNaOHAction(NAOH_VOL)}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: `linear-gradient(135deg, #22c55e 0%, #16a34a 100%)`, boxShadow: "0 4px 14px rgba(34,197,94,0.35)" }}
          >
            Measure {NAOH_VOL} mL NaOH
          </button>
          {store.naohVolumeMl > 0 && (
            <p className="text-[10px] mt-1.5 text-center" style={{ color: "#166534" }}>
              ✓ {store.naohVolumeMl} mL NaOH ready
            </p>
          )}
        </div>
      </div>

      {/* Step 3: Mix */}
      <div className="lab-ctrl-section">
        <div className="lab-ctrl-section-hdr">
          <span className="lab-ctrl-section-hdr-icon">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.2"/><path d="M4 6.5h5M6.5 4v5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
          </span>
          <span className="lab-ctrl-section-hdr-title">Step 3 — Mix Solutions</span>
        </div>
        <div className="p-2">
          <button
            disabled={store.currentStep !== "mix" || store.isMixing}
            onClick={() => store.startMixingAction()}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #059669 100%)`, boxShadow: `0 4px 14px ${ACCENT}40` }}
          >
            {store.isMixing ? "Mixing..." : "Pour NaOH & Mix →"}
          </button>
        </div>
      </div>

      {/* Step 4 & 5 */}
      {(store.currentStep === "observe" || store.currentStep === "record") && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 7l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <span className="lab-ctrl-section-hdr-title">Step 4 — Record Observations</span>
          </div>
          <div className="p-2 space-y-2">
            {store.currentStep === "observe" && (
              <button
                onClick={() => store.recordObservationsAction()}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
                style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", boxShadow: "0 4px 14px rgba(249,115,22,0.35)" }}
              >
                Record Temperature ↑
              </button>
            )}
            {store.currentStep === "record" && store.status !== "completed" && (
              <button
                onClick={() => store.completeAction()}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
                style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", boxShadow: "0 4px 14px rgba(59,130,246,0.35)" }}
              >
                Complete Experiment ✓
              </button>
            )}
          </div>
        </div>
      )}

      {/* Observations display */}
      <div className="rounded-xl p-3" style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}20` }}>
        <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: ACCENT }}>Live Readings</p>
        <div className="space-y-1.5">
          {[
            { label: "Initial T", value: `${store.initialTempC.toFixed(1)}°C` },
            { label: "Current T", value: `${store.currentTempC.toFixed(1)}°C`, hot: store.currentTempC > store.initialTempC + 0.5 },
            { label: "ΔT",        value: `+${deltaT}°C`,                       hot: parseFloat(deltaT) > 0.5 },
            { label: "NaCl formed", value: store.saltFormed ? `${saltMg} mg` : "—" },
          ].map(({ label, value, hot }) => (
            <div key={label} className="flex justify-between text-[10.5px]">
              <span style={{ color: "var(--lab-text-muted)" }}>{label}</span>
              <span style={{ color: hot ? "#ef4444" : "var(--lab-text-secondary)", fontWeight: 700 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

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
      title="Neutralisation Reaction"
      accent={ACCENT}
      summary="Combine equal volumes of HCl and NaOH. The exothermic neutralisation produces common salt (NaCl) and water. Observe the temperature rise."
      formula="HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)"
      formulaLabel="Neutralisation equation"
      facts={[
        { icon: "🧪", label: "HCl volume",  value: "25 mL, 0.1 M" },
        { icon: "⚗️", label: "NaOH volume", value: "25 mL, 0.1 M" },
        { icon: "🌡️", label: "Heat released", value: "~55.8 kJ/mol" },
        { icon: "🧂", label: "Product", value: "NaCl + H₂O" },
      ]}
      steps={[
        { number: 1, title: "Measure HCl", body: "Use measuring cylinder for accurate 25 mL of 0.1 M HCl." },
        { number: 2, title: "Measure NaOH", body: "Measure 25 mL of 0.1 M NaOH separately." },
        { number: 3, title: "Mix & observe", body: "Pour NaOH into HCl. Temperature rises — neutralisation is exothermic." },
        { number: 4, title: "Record results", body: "Note final temperature and calculate heat released." },
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
            { label: "Step", value: store.currentStep.replace("-", " ") },
            { label: "T (current)", value: `${store.currentTempC.toFixed(1)}°C` },
            { label: "ΔT", value: `+${deltaT}°C` },
            ...(store.saltFormed ? [{ label: "NaCl formed", value: "✓" }] : []),
          ]}
        />
      }
      workspace={<NeutralizationWorkspace state={store} />}
      education={EXPERIMENT_EDUCATION.neutralization}
      reactionNote={
        store.reactionDone
          ? "HCl + NaOH → NaCl + H₂O · Reaction complete · Salt formed in solution"
          : store.isMixing
          ? `HCl + NaOH → NaCl + H₂O · Mixing… T = ${store.currentTempC.toFixed(1)}°C`
          : "Measure HCl and NaOH, then combine them to observe the neutralisation."
      }
      controls={controls}
      stepGuide={<StepGuide steps={store.steps} objectives={store.objectives} />}
      mode={store.mode}
      onSetMode={store.setMode}
      observations={<ObservationPanel observations={store.observations} />}
      obsNotif={
        popup ? (
          <ContextPopup visible={showPopup} what={popup.what} why={popup.why} kind={popup.kind} />
        ) : null
      }
      resultModal={
        <ResultModal
          result={store.result}
          onReset={store.resetAction}
          nextHref="/experiments/salt-analysis"
          nextLabel="Next: Salt Analysis →"
          observations={store.observations}
          experimentKey="neutralization"
        />
      }
    />
  );
}
