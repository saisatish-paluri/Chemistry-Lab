"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useWaterHardnessStore }  from "@/lib/store/water-hardness-store";
import WaterHardnessWorkspace     from "./WaterHardnessWorkspace";
import StepGuide                  from "@/components/lab/StepGuide";
import ObservationPanel           from "@/components/lab/ObservationPanel";
import StatusBar                  from "@/components/lab/StatusBar";
import ResultModal                from "@/components/lab/ResultModal";
import ContextPopup, { obsToPopup } from "@/components/lab/ContextPopup";
import LabPageShell               from "@/components/lab/LabPageShell";
import LabContextPanel            from "@/components/lab/LabContextPanel";
import { EXPERIMENT_EDUCATION }   from "@/lib/experiment-education";
import { ENDPOINT_ML }            from "@/lib/engine/water-hardness-engine";
import MacroMicroViewToggle        from "@/components/lab/MacroMicroViewToggle";
import MicroscopicViewer           from "@/components/lab/MicroscopicViewer";

const ACCENT = "#0284c7";

export default function WaterHardnessPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [viewMode, setViewMode]   = useState<"macro" | "micro">("macro");
  const store      = useWaterHardnessStore();
  const titrTimer  = useRef<ReturnType<typeof setInterval> | null>(null);
  const popupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    store.hydrate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => {
    if (titrTimer.current)  clearInterval(titrTimer.current);
    if (popupTimer.current) clearTimeout(popupTimer.current);
  }, []);

  const lastObsId = store.observations[0]?.id;
  useEffect(() => {
    if (!lastObsId) return;
    startTransition(() => setShowPopup(true));
    if (popupTimer.current) clearTimeout(popupTimer.current);
    popupTimer.current = setTimeout(() => setShowPopup(false), 3800);
  }, [lastObsId]);


  const popup       = store.observations[0] ? obsToPopup(store.observations[0].type, store.observations[0].message) : null;
  const catColor    = { soft: "#22c55e", "moderately-hard": "#f59e0b", hard: "#f97316", "very-hard": "#ef4444" };
  const catLabel    = { soft: "Soft", "moderately-hard": "Moderately Hard", hard: "Hard", "very-hard": "Very Hard" };

  const controls = (
    <div className="space-y-4">
      {/* Step 1 */}
      <div className="lab-ctrl-section">
        <div className="lab-ctrl-section-hdr">
          <span className="lab-ctrl-section-hdr-icon">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M4 2v7L1 12h11L9 9V2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          <span className="lab-ctrl-section-hdr-title">Step 1 — Fill Burette</span>
        </div>
        <div className="p-2">
          <button
            disabled={store.buretteFilled}
            onClick={() => store.fillBuretteAction()}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: `linear-gradient(135deg, #22c55e 0%, #16a34a 100%)`, boxShadow: "0 4px 14px rgba(34,197,94,0.3)" }}
          >
            {store.buretteFilled ? "✓ Burette Filled" : "Fill Burette with EDTA"}
          </button>
        </div>
      </div>

      {/* Step 2 */}
      <div className="lab-ctrl-section">
        <div className="lab-ctrl-section-hdr">
          <span className="lab-ctrl-section-hdr-icon">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.2"/></svg>
          </span>
          <span className="lab-ctrl-section-hdr-title">Step 2 — Prepare Sample</span>
        </div>
        <div className="p-2">
          <button
            disabled={!store.buretteFilled || store.samplePrepared}
            onClick={() => store.prepareSampleAction()}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #0369a1 100%)`, boxShadow: `0 4px 14px ${ACCENT}40` }}
          >
            {store.samplePrepared ? "✓ Sample Ready" : "Pipette 100 mL Hard Water"}
          </button>
        </div>
      </div>

      {/* Step 3 */}
      <div className="lab-ctrl-section">
        <div className="lab-ctrl-section-hdr">
          <span className="lab-ctrl-section-hdr-icon">🔴</span>
          <span className="lab-ctrl-section-hdr-title">Step 3 — Add EBT Indicator</span>
        </div>
        <div className="p-2">
          <button
            disabled={!store.samplePrepared || store.indicatorAdded}
            onClick={() => store.addIndicatorAction()}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #9f1239 0%, #881337 100%)", boxShadow: "0 4px 14px rgba(159,18,57,0.35)" }}
          >
            {store.indicatorAdded ? "✓ Indicator Added (Wine-Red)" : "Add EBT + Buffer (pH 10)"}
          </button>
          {store.indicatorAdded && (
            <p className="text-[9.5px] mt-1.5 text-center" style={{ color: "#9f1239" }}>
              Solution is wine-red — Ca²⁺/Mg²⁺ complexed with EBT
            </p>
          )}
        </div>
      </div>

      {/* Step 4: Titrate */}
      {store.indicatorAdded && !store.endpointReached && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">💧</span>
            <span className="lab-ctrl-section-hdr-title">Step 4 — Add EDTA Dropwise</span>
          </div>
          <div className="p-2 space-y-1.5">
            {[{ label: "Add 0.5 mL", val: 0.5 }, { label: "Add 1 mL", val: 1 }, { label: "Add 5 mL", val: 5 }].map(({ label, val }) => (
              <button
                key={val}
                onClick={() => store.addEDTAAction(val)}
                className="w-full py-2 rounded-xl text-[12px] font-bold text-white transition-all hover:-translate-y-0.5 active:scale-95"
                style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #0369a1 100%)`, boxShadow: `0 3px 10px ${ACCENT}35` }}
              >
                {label} EDTA
              </button>
            ))}
            <p className="text-[9.5px] text-center mt-1" style={{ color: "var(--lab-text-subtle)" }}>
              Endpoint at ~{ENDPOINT_ML.toFixed(0)} mL — watch for blue colour
            </p>
          </div>
        </div>
      )}

      {/* Step 5: Endpoint reached */}
      {store.endpointReached && store.hardnessMgL === null && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">🔵</span>
            <span className="lab-ctrl-section-hdr-title">Step 5 — Calculate Hardness</span>
          </div>
          <div className="p-2">
            <div className="rounded-lg p-2 mb-2 text-[10px]"
              style={{ background: "rgba(219,234,254,0.7)", border: "1px solid rgba(37,99,235,0.2)" }}>
              <p style={{ color: "#1d4ed8" }}>
                Endpoint reached at <strong>{store.edtaAddedMl.toFixed(1)} mL</strong> EDTA. Solution turned blue!
              </p>
            </div>
            <button
              onClick={() => store.calculateAction()}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
              style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", boxShadow: "0 4px 14px rgba(59,130,246,0.35)" }}
            >
              Calculate Hardness →
            </button>
          </div>
        </div>
      )}

      {/* Step 6: Complete */}
      {store.hardnessMgL !== null && store.status !== "completed" && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">📊</span>
            <span className="lab-ctrl-section-hdr-title">Step 6 — Result</span>
          </div>
          <div className="p-2">
            {store.hardnessCategory && (
              <div className="rounded-lg p-2.5 mb-2 text-center"
                style={{ background: catColor[store.hardnessCategory] + "15", border: `1px solid ${catColor[store.hardnessCategory]}35` }}>
                <p className="text-xl font-bold" style={{ color: catColor[store.hardnessCategory] }}>
                  {store.hardnessMgL.toFixed(1)} mg/L
                </p>
                <p className="text-[11px]" style={{ color: catColor[store.hardnessCategory] }}>
                  {catLabel[store.hardnessCategory]}
                </p>
              </div>
            )}
            <button
              onClick={() => store.completeAction()}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
              style={{ background: "linear-gradient(135deg, #059669 0%, #047857 100%)", boxShadow: "0 4px 14px rgba(5,150,105,0.35)" }}
            >
              Complete Experiment ✓
            </button>
          </div>
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
      title="Water Hardness (EDTA)"
      accent={ACCENT}
      summary="Titrate a hard water sample with EDTA to determine total hardness (Ca²⁺ + Mg²⁺). EBT indicator changes from wine-red to blue at the endpoint."
      formula="M²⁺ + EDTA⁴⁻ → [M-EDTA]²⁻"
      formulaLabel="Chelation reaction"
      facts={[
        { icon: "🧪", label: "EDTA", value: "0.01 M, 50 mL" },
        { icon: "💧", label: "Sample", value: "100 mL hard water" },
        { icon: "🔴", label: "EBT", value: "pH 10 indicator" },
        { icon: "🔵", label: "Endpoint", value: "~200 mg/L" },
      ]}
      steps={[
        { number: 1, title: "Fill burette", body: "Load 0.01 M EDTA into the burette." },
        { number: 2, title: "Prepare sample", body: "Pipette 100 mL hard water into the conical flask." },
        { number: 3, title: "Add EBT", body: "Add Eriochrome Black T indicator + pH 10 buffer. Solution turns wine-red." },
        { number: 4, title: "Titrate to blue", body: "Add EDTA dropwise. Stop at the first pure blue colour — that is the endpoint." },
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
            { label: "EDTA added", value: `${store.edtaAddedMl.toFixed(1)} mL` },
            ...(store.hardnessMgL !== null ? [{ label: "Hardness", value: `${store.hardnessMgL.toFixed(0)} mg/L` }] : []),
            ...(store.hardnessCategory ? [{ label: "Category", value: catLabel[store.hardnessCategory] }] : []),
            ...(store.endpointReached ? [{ label: "Endpoint", value: "✓ Blue" }] : []),
          ]}
        />
      }
      workspace={
        <div className="flex flex-col gap-3 w-full h-full">
          <div className="flex justify-end pr-4">
            <MacroMicroViewToggle view={viewMode} onChange={setViewMode} />
          </div>
          {viewMode === "macro" ? (
            <WaterHardnessWorkspace state={store} />
          ) : (
            <MicroscopicViewer
              experimentType="water-hardness"
              temperatureK={298}
              concentration={store.edtaConc}
              pH={10}
              isTriggered={store.indicatorAdded}
            />
          )}
        </div>
      }
      education={EXPERIMENT_EDUCATION["water-hardness"]}
      reactionNote={
        store.endpointReached
          ? `Endpoint: all Ca²⁺/Mg²⁺ chelated · EDTA used: ${store.edtaAddedMl.toFixed(1)} mL · Hardness: ${store.hardnessMgL?.toFixed(0) ?? "—"} mg/L`
          : store.indicatorAdded
          ? `Wine-red → Add EDTA dropwise → endpoint turns blue · ${store.edtaAddedMl.toFixed(1)} / ${ENDPOINT_ML} mL added`
          : "Fill burette with EDTA, prepare sample, add EBT indicator, then titrate to blue endpoint."
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
          nextHref="/experiments/functional-groups"
          nextLabel="Next: Functional Groups →"
          observations={store.observations}
          experimentKey="water-hardness"
        />
      }
    />
  );
}
