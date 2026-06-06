"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useChromatographyStore }  from "@/lib/store/chromatography-store";
import ChromatographyWorkspace     from "./ChromatographyWorkspace";
import StepGuide                   from "@/components/lab/StepGuide";
import ObservationPanel            from "@/components/lab/ObservationPanel";
import StatusBar                   from "@/components/lab/StatusBar";
import ResultModal                 from "@/components/lab/ResultModal";
import ContextPopup, { obsToPopup } from "@/components/lab/ContextPopup";
import LabPageShell                from "@/components/lab/LabPageShell";
import LabContextPanel             from "@/components/lab/LabContextPanel";
import { EXPERIMENT_EDUCATION }    from "@/lib/experiment-education";
import { INKS }                    from "@/lib/engine/chromatography-engine";
import type { InkId }              from "@/lib/engine/types";

const ACCENT   = "#0ea5e9";
const INK_IDS: InkId[] = ["black-ink", "blue-ink", "green-ink", "red-ink"];

export default function ChromatographyPage() {
  const [showPopup, setShowPopup] = useState(false);
  const store      = useChromatographyStore();
  const runTimer   = useRef<ReturnType<typeof setInterval> | null>(null);
  const popupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    store.hydrate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => {
    if (runTimer.current)   clearInterval(runTimer.current);
    if (popupTimer.current) clearTimeout(popupTimer.current);
  }, []);

  const lastObsId = store.observations[0]?.id;
  useEffect(() => {
    if (!lastObsId) return;
    startTransition(() => setShowPopup(true));
    if (popupTimer.current) clearTimeout(popupTimer.current);
    popupTimer.current = setTimeout(() => setShowPopup(false), 3600);
  }, [lastObsId]);

  // Drive solvent front animation
  useEffect(() => {
    if (!store.isRunning) {
      if (runTimer.current) { clearInterval(runTimer.current); runTimer.current = null; }
      return;
    }
    let front = store.solventFrontCm;
    runTimer.current = setInterval(() => {
      front = Math.min(10, front + 0.08);
      startTransition(() => store.updateSolventFrontAction(front));
      if (front >= 10) {
        if (runTimer.current) clearInterval(runTimer.current);
      }
    }, 120);
    return () => { if (runTimer.current) clearInterval(runTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.isRunning]);


  const popup = store.observations[0] ? obsToPopup(store.observations[0].type, store.observations[0].message) : null;
  const ink   = store.selectedInk ? INKS[store.selectedInk] : null;

  const controls = (
    <div className="space-y-4">
      {/* Ink selector */}
      <div className="lab-ctrl-section">
        <div className="lab-ctrl-section-hdr">
          <span className="lab-ctrl-section-hdr-icon">🖊️</span>
          <span className="lab-ctrl-section-hdr-title">Select Ink Sample</span>
        </div>
        <div className="p-2 space-y-1.5">
          {INK_IDS.map((id) => {
            const i      = INKS[id];
            const active = store.selectedInk === id;
            return (
              <button
                key={id}
                onClick={() => !store.isRunning && store.status !== "completed" && store.selectInkAction(id)}
                disabled={store.isRunning || store.status === "completed"}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all duration-150 text-left"
                style={{
                  background:  active ? `${ACCENT}10` : "rgba(255,255,255,0.65)",
                  borderColor: active ? `${ACCENT}40` : "var(--lab-glass-border)",
                  color:       active ? ACCENT : "var(--lab-text-secondary)",
                }}
              >
                <span className="flex gap-0.5">
                  {i.dyes.slice(0, 3).map((d, idx) => (
                    <span key={idx} className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  ))}
                </span>
                <span className="flex-1">{i.name}</span>
                <span className="text-[8.5px]" style={{ color: "var(--lab-text-subtle)" }}>
                  {i.dyes.length} dye{i.dyes.length > 1 ? "s" : ""}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Apply ink */}
      {store.selectedInk && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">📍</span>
            <span className="lab-ctrl-section-hdr-title">Step 2 — Apply Ink Spot</span>
          </div>
          <div className="p-2">
            <button
              disabled={store.inkApplied || store.isRunning}
              onClick={() => store.applyInkAction()}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #0284c7 100%)`, boxShadow: `0 4px 14px ${ACCENT}40` }}
            >
              {store.inkApplied ? "✓ Spot Applied" : "Apply Ink Spot (capillary)"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Place paper */}
      {store.inkApplied && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">📄</span>
            <span className="lab-ctrl-section-hdr-title">Step 3 — Place in Chamber</span>
          </div>
          <div className="p-2">
            <button
              disabled={store.paperInChamber}
              onClick={() => store.placePaperAction()}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #64748b 0%, #475569 100%)", boxShadow: "0 4px 14px rgba(100,116,139,0.3)" }}
            >
              {store.paperInChamber ? "✓ Paper in Chamber" : "Place Paper in Chamber"}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Add solvent */}
      {store.paperInChamber && !store.solventAdded && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">💧</span>
            <span className="lab-ctrl-section-hdr-title">Step 4 — Add Solvent</span>
          </div>
          <div className="p-2">
            <button
              onClick={() => store.addSolventAction()}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
              style={{ background: `linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)`, boxShadow: "0 4px 14px rgba(124,58,237,0.35)" }}
            >
              Add Solvent — Start Development →
            </button>
            <p className="text-[9.5px] mt-1.5 text-center" style={{ color: "var(--lab-text-subtle)" }}>
              Solvent rises up by capillary action
            </p>
          </div>
        </div>
      )}

      {/* Running status */}
      {store.isRunning && (
        <div className="rounded-xl p-3 text-center" style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}20` }}>
          <div className="w-4 h-4 rounded-full border-2 border-sky-400 border-t-transparent animate-spin mx-auto mb-1.5" />
          <p className="text-[10.5px] font-semibold" style={{ color: ACCENT }}>
            Solvent front: {store.solventFrontCm.toFixed(1)} cm
          </p>
          <p className="text-[9.5px]" style={{ color: "var(--lab-text-subtle)" }}>
            Dyes separating — wait for front to reach top
          </p>
        </div>
      )}

      {/* Step 5: Calculate Rf */}
      {store.runComplete && store.rfValues.length === 0 && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">📐</span>
            <span className="lab-ctrl-section-hdr-title">Step 5 — Calculate Rf Values</span>
          </div>
          <div className="p-2">
            <button
              onClick={() => store.calculateRfAction()}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
              style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", boxShadow: "0 4px 14px rgba(249,115,22,0.35)" }}
            >
              Mark Front & Calculate Rf →
            </button>
          </div>
        </div>
      )}

      {/* Rf table */}
      {store.rfValues.length > 0 && (
        <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid var(--lab-glass-border)" }}>
          <p className="text-[10px] font-bold mb-2" style={{ color: "var(--lab-text-secondary)" }}>
            Rf = d_spot / d_front
          </p>
          {store.rfValues.map((r) => (
            <div key={r.name} className="flex items-center gap-2 py-1">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: r.color }} />
              <span className="text-[10px] flex-1" style={{ color: "var(--lab-text-muted)" }}>{r.name}</span>
              <span className="text-[10px] font-bold" style={{ color: "#1d4ed8" }}>Rf = {r.rf.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Complete */}
      {store.rfValues.length > 0 && store.status !== "completed" && (
        <button
          onClick={() => store.completeAction()}
          className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
          style={{ background: "linear-gradient(135deg, #059669 0%, #047857 100%)", boxShadow: "0 4px 14px rgba(5,150,105,0.35)" }}
        >
          Complete Experiment ✓
        </button>
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
      title="Paper Chromatography"
      accent={ACCENT}
      summary="Separate ink dyes using paper chromatography. The mobile phase (solvent) carries dyes at different rates based on their polarity. Calculate Rf values to identify each component."
      formula="Rf = distance of spot / distance of solvent front"
      formulaLabel="Retention factor"
      facts={[
        { icon: "📄", label: "Stationary", value: "Cellulose paper" },
        { icon: "💧", label: "Mobile",     value: "Organic solvent" },
        { icon: "📏", label: "Rf range",   value: "0.00 – 1.00" },
        { icon: "🌈", label: "Principle",  value: "Polarity difference" },
      ]}
      steps={[
        { number: 1, title: "Select ink",     body: "Choose an ink sample to analyse. Mixed inks contain multiple dyes." },
        { number: 2, title: "Apply spot",     body: "Apply concentrated ink 2 cm from bottom using a capillary tube." },
        { number: 3, title: "Develop",        body: "Solvent rises by capillary action, carrying dyes at different rates." },
        { number: 4, title: "Calculate Rf",   body: "Mark solvent front. Rf = spot distance / front distance." },
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
            { label: "Ink", value: ink ? ink.name : "—" },
            { label: "Solvent front", value: `${store.solventFrontCm.toFixed(1)} cm` },
            { label: "Dyes found", value: `${store.dyes.filter(d => d.distanceCm > 0.3).length}` },
            ...(store.rfValues.length > 0 ? [{ label: "Rf values", value: `${store.rfValues.length} calculated` }] : []),
          ]}
        />
      }
      workspace={<ChromatographyWorkspace state={store} />}
      education={EXPERIMENT_EDUCATION["chromatography"]}
      reactionNote={
        store.runComplete
          ? `${store.dyes.length} dye(s) separated · Rf values: ${store.rfValues.map(r => `${r.name.split(" ")[0]}: ${r.rf}`).join(", ") || "calculate →"}`
          : store.isRunning
          ? `Solvent front at ${store.solventFrontCm.toFixed(1)} cm — dyes separating by polarity difference`
          : "Apply ink spot, add solvent, watch the dyes separate by chromatography."
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
          nextHref="/experiments"
          nextLabel="Back to All Experiments →"
          observations={store.observations}
          experimentKey="chromatography"
        />
      }
    />
  );
}
