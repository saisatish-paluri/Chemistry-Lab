"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useNaturalIndicatorsStore } from "@/lib/store/natural-indicators-store";
import NaturalIndicatorsWorkspace from "./NaturalIndicatorsWorkspace";
import StepGuide from "@/components/lab/StepGuide";
import ObservationPanel from "@/components/lab/ObservationPanel";
import StatusBar from "@/components/lab/StatusBar";
import ResultModal from "@/components/lab/ResultModal";
import ContextPopup, { obsToPopup } from "@/components/lab/ContextPopup";
import LabPageShell from "@/components/lab/LabPageShell";
import LabContextPanel from "@/components/lab/LabContextPanel";
import { EXPERIMENT_EDUCATION } from "@/lib/experiment-education";
import MacroMicroViewToggle from "@/components/lab/MacroMicroViewToggle";
import MicroscopicViewer from "@/components/lab/MicroscopicViewer";

const ACCENT = "#db2777";

export default function NaturalIndicatorsPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [viewMode, setViewMode] = useState<"macro" | "micro">("macro");
  const [steepSeconds, setSteepSeconds] = useState(0);
  const [isSteeping, setIsSteeping] = useState(false);
  
  const store = useNaturalIndicatorsStore();
  const steepingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const popupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    store.hydrate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Steeping timer tick
  useEffect(() => {
    if (isSteeping) {
      steepingTimer.current = setInterval(() => {
        setSteepSeconds(s => s + 1);
      }, 1000);
    } else {
      if (steepingTimer.current) clearInterval(steepingTimer.current);
    }
    return () => { if (steepingTimer.current) clearInterval(steepingTimer.current); };
  }, [isSteeping]);

  // Mix animation tick
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    const loop = (now: number) => {
      const delta = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      if (store.addedIndicatorDrops > 0 && store.colorMixProgress < 1.0) {
        store.tickAction(delta);
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [store]);

  const lastObsId = store.observations[0]?.id;
  useEffect(() => {
    if (!lastObsId) return;
    startTransition(() => setShowPopup(true));
    if (popupTimer.current) clearTimeout(popupTimer.current);
    popupTimer.current = setTimeout(() => setShowPopup(false), 3800);
  }, [lastObsId]);

  const popup = store.observations[0] ? obsToPopup(store.observations[0].type, store.observations[0].message) : null;

  const solutions = [
    { id: "hcl", label: "HCl (Strong Acid)" },
    { id: "vinegar", label: "Vinegar (Weak Acid)" },
    { id: "lemon-juice", label: "Lemon Juice (Weak Acid)" },
    { id: "water", label: "Distilled Water (Neutral)" },
    { id: "soap", label: "Soap Solution (Weak Base)" },
    { id: "naoh", label: "NaOH (Strong Base)" },
  ] as const;

  const controls = (
    <div className="space-y-4">
      {/* Step 1: Select indicator source */}
      {store.status === "setup" && store.selectedIndicator === null && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">🌿</span>
            <span className="lab-ctrl-section-hdr-title">Step 1 — Select Pigment Source</span>
          </div>
          <div className="p-3.5 space-y-2">
            {[
              { id: "red-cabbage", label: "Red Cabbage Leaves", info: "Universal range (anthocyanins)" },
              { id: "turmeric", label: "Turmeric Root", info: "Basic transition (curcumin)" },
              { id: "china-rose", label: "China Rose Petals", info: "Acidic/Basic transitions" },
            ].map((src) => (
              <button
                key={src.id}
                onClick={() => store.selectIndicatorAction(src.id as any)}
                className="w-full p-3 text-left rounded-xl border hover:bg-slate-50 transition-all active:scale-[0.98]"
                style={{ borderColor: "var(--lab-glass-border)" }}
              >
                <div className="font-bold text-xs text-slate-800">{src.label}</div>
                <div className="text-[10px] text-slate-500">{src.info}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Mash in Mortar */}
      {store.preparationStep === "mortar" && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">🔨</span>
            <span className="lab-ctrl-section-hdr-title">Step 2 — Mortar & Pestle Mashing</span>
          </div>
          <div className="p-3.5 space-y-3">
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-pink-500 transition-all duration-150"
                style={{ width: `${store.extractProgress * 100}%` }}
              />
            </div>
            <button
              onClick={() => store.mashMaterialAction(0.18)}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
              style={{ background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)", boxShadow: "0 4px 14px rgba(236,72,153,0.3)" }}
            >
              Pound & Grind Reagent (Mash)
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Solvent extraction (steeping timer) */}
      {store.preparationStep === "solvent" && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">⏳</span>
            <span className="lab-ctrl-section-hdr-title">Step 3 — Pigment Steeping</span>
          </div>
          <div className="p-3.5 space-y-3.5">
            <div className="text-center p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
              <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest">Steeping Timer</div>
              <div className="text-2xl font-black text-pink-600 font-mono">{steepSeconds} s</div>
              <p className="text-[9px] text-slate-500">Steep at least 10s to get good pigment concentration</p>
            </div>
            
            <div className="flex gap-2">
              <button
                disabled={isSteeping}
                onClick={() => setIsSteeping(true)}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-green-500 hover:bg-green-600 transition-all active:scale-95 disabled:opacity-50"
              >
                Pour Hot Water
              </button>
              <button
                disabled={!isSteeping}
                onClick={() => {
                  setIsSteeping(false);
                  store.addSolventAction(steepSeconds);
                }}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 transition-all active:scale-95 disabled:opacity-50"
              >
                Filter Extract
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Extract Ready, Select Test Solution */}
      {store.preparationStep === "extracted" && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">🧪</span>
            <span className="lab-ctrl-section-hdr-title">Step 4 — Select Test Solution</span>
          </div>
          <div className="p-3.5 space-y-3">
            <div className="grid grid-cols-2 gap-1.5">
              {solutions.map((sol) => (
                <button
                  key={sol.id}
                  onClick={() => store.selectTestSolutionAction(sol.id)}
                  className={`py-2 px-1.5 rounded-lg text-[10px] font-bold transition-all border text-center ${
                    store.selectedSolution === sol.id
                      ? "bg-pink-500 text-white border-pink-600 shadow-sm"
                      : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  {sol.label}
                </button>
              ))}
            </div>

            {store.selectedSolution && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => store.addIndicatorDropAction()}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", boxShadow: "0 4px 14px rgba(16,185,129,0.3)" }}
                >
                  Dispense Dropper Drop
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reset & completion options */}
      {store.preparationStep === "extracted" && store.observations.length >= 3 && (
        <button
          onClick={() => store.submitResultAction()}
          className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
          style={{ background: "linear-gradient(135deg, #059669 0%, #047857 100%)", boxShadow: "0 4px 14px rgba(5,150,105,0.3)" }}
        >
          Submit Observations ✓
        </button>
      )}

      {store.status === "completed" && (
        <button onClick={store.resetAction}
          className="w-full py-2 rounded-xl text-[12px] font-semibold border transition-all duration-150 hover:bg-slate-50"
          style={{ borderColor: "var(--lab-glass-border)", color: "var(--lab-text-muted)" }}>
          Reset Experiment
        </button>
      )}
    </div>
  );

  const leftPanel = (
    <LabContextPanel
      title="Natural pH Indicators"
      accent={ACCENT}
      summary="Extract pigments from plant materials and test them against household acids and bases to observe color transitions."
      formula="HInd(aq) ⇌ Ind⁻(aq) + H⁺(aq)"
      formulaLabel="Pigment Equilibrium"
      facts={[
        { icon: "🌿", label: "Source", value: store.selectedIndicator || "Select" },
        { icon: "🔬", label: "Concentration", value: `${(store.extractConcentration * 100).toFixed(0)}%` },
        { icon: "🧪", label: "Test Solution", value: store.selectedSolution || "None" },
        { icon: "🎨", label: "Drops added", value: `${store.addedIndicatorDrops}` },
      ]}
      steps={[
        { number: 1, title: "Select Source", body: "Pick cabbage, turmeric, or china rose." },
        { number: 2, title: "Mash Material", body: "Grind petals or roots to break cell walls." },
        { number: 3, title: "Extract Pigment", body: "Pour solvent and let it steep, then filter." },
        { number: 4, title: "Test Solutions", body: "Dispense drops to watch pH transitions." },
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
            { label: "Indicator", value: store.selectedIndicator || "None" },
            { label: "Concentration", value: `${(store.extractConcentration * 100).toFixed(0)}%` },
            ...(store.selectedSolution ? [{ label: "Solution pH", value: `${store.solutionPh.toFixed(1)}` }] : []),
          ]}
        />
      }
      workspace={
        <div className="flex flex-col gap-3 w-full h-full">
          <div className="flex justify-end pr-4">
            <MacroMicroViewToggle view={viewMode} onChange={setViewMode} />
          </div>
          {viewMode === "macro" ? (
            <NaturalIndicatorsWorkspace state={store} />
          ) : (
            <MicroscopicViewer
              experimentType="natural-indicators"
              temperatureK={298}
              pH={store.solutionPh}
              isTriggered={store.addedIndicatorDrops > 0}
              extraParam={store.selectedIndicator || ""}
            />
          )}
        </div>
      }
      education={EXPERIMENT_EDUCATION["natural-indicators"]}
      reactionNote={
        store.status === "completed"
          ? "Analysis complete. Explored pigment transitions under acidic, neutral, and alkaline conditions."
          : store.addedIndicatorDrops > 0
          ? `pH ${store.solutionPh.toFixed(1)} color transition mixed. Pigment concentration: ${(store.extractConcentration * 100).toFixed(0)}%`
          : store.selectedSolution
          ? `Prepare to add indicator extract drops to ${store.selectedSolution}.`
          : "Mash the leaves/roots, steep in hot water, and prepare the indicator extract."
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
          nextHref="/experiments/acid-metal"
          nextLabel="Next: Acid-Metal Reactions →"
          observations={store.observations}
          experimentKey="natural-indicators"
        />
      }
    />
  );
}
