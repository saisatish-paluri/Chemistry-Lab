"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useAcidMetalStore } from "@/lib/store/acid-metal-store";
import AcidMetalWorkspace from "./AcidMetalWorkspace";
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

const ACCENT = "#ea580c";

export default function AcidMetalPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [viewMode, setViewMode] = useState<"macro" | "micro">("macro");
  const [metalInput, setMetalInput] = useState<"mg" | "zn" | "fe" | "cu">("mg");
  const [sizeInput, setSizeInput] = useState<"powder" | "turnings" | "ribbon" | "strip">("turnings");
  const [massInput, setMassInput] = useState(1.5);
  const [acidInput, setAcidInput] = useState<"hcl" | "h2so4">("hcl");
  const [acidVolInput, setAcidVolInput] = useState(50);
  const [acidConcInput, setAcidConcInput] = useState(1.0);
  
  const store = useAcidMetalStore();
  const popupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    store.hydrate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Frame ticking logic
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    const loop = (now: number) => {
      const delta = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      if (store.isReacting) {
        store.tickAction(delta);
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [store]);

  useEffect(() => {
    if (popupTimer.current) clearTimeout(popupTimer.current);
    return () => { if (popupTimer.current) clearTimeout(popupTimer.current); };
  }, []);

  const lastObsId = store.observations[0]?.id;
  useEffect(() => {
    if (!lastObsId) return;
    startTransition(() => setShowPopup(true));
    if (popupTimer.current) clearTimeout(popupTimer.current);
    popupTimer.current = setTimeout(() => setShowPopup(false), 3800);
  }, [lastObsId]);

  const popup = store.observations[0] ? obsToPopup(store.observations[0].type, store.observations[0].message) : null;

  const controls = (
    <div className="space-y-4">
      {/* Step 1: Select Metal & size */}
      {store.status === "setup" && store.selectedMetal === null && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">⛓️</span>
            <span className="lab-ctrl-section-hdr-title">Step 1 — Configure Reactant Metal</span>
          </div>
          <div className="p-3.5 space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500">Select Metal:</label>
              <div className="grid grid-cols-4 gap-1">
                {(["mg", "zn", "fe", "cu"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMetalInput(m)}
                    className={`py-1 text-xs font-bold rounded ${
                      metalInput === m ? "bg-orange-500 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    {m.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500">Particle Size / Form:</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(["powder", "turnings", "ribbon", "strip"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSizeInput(s)}
                    className={`py-1 text-xs font-bold rounded ${
                      sizeInput === s ? "bg-orange-500 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => store.selectMetalAndSizeAction(metalInput, sizeInput)}
              className="w-full py-2 rounded-xl text-xs font-bold text-white transition-all duration-150"
              style={{ background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)", boxShadow: "0 4px 14px rgba(234,88,12,0.3)" }}
            >
              Select Reagent configuration
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Weigh Metal */}
      {store.status === "setup" && store.selectedMetal !== null && store.metalMass === 0 && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">⚖️</span>
            <span className="lab-ctrl-section-hdr-title">Step 2 — Weigh Metal mass</span>
          </div>
          <div className="p-3.5 space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 flex justify-between">
                <span>Configure Mass:</span>
                <span className="text-orange-600 font-extrabold">{massInput.toFixed(2)} g</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={massInput}
                onChange={(e) => setMassInput(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>
            <button
              onClick={() => store.weighMetalAction(massInput)}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
              style={{ background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)", boxShadow: "0 4px 14px rgba(234,88,12,0.3)" }}
            >
              Transfer Metal to Balance Scale
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Configure Acid */}
      {store.status === "setup" && store.metalMass > 0 && store.selectedAcid === null && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">💧</span>
            <span className="lab-ctrl-section-hdr-title">Step 3 — Configure Acid reactant</span>
          </div>
          <div className="p-3.5 space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500">Select Acid:</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(["hcl", "h2so4"] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => setAcidInput(a)}
                    className={`py-1 text-xs font-bold rounded ${
                      acidInput === a ? "bg-orange-500 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    {a.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 flex justify-between">
                <span>Concentration:</span>
                <span className="text-orange-600 font-extrabold">{acidConcInput.toFixed(1)} M</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.5"
                value={acidConcInput}
                onChange={(e) => setAcidConcInput(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 flex justify-between">
                <span>Volume:</span>
                <span className="text-orange-600 font-extrabold">{acidVolInput} mL</span>
              </label>
              <input
                type="range"
                min="20"
                max="100"
                step="10"
                value={acidVolInput}
                onChange={(e) => setAcidVolInput(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>

            <button
              onClick={() => store.configureAcidAction(acidInput, acidVolInput, acidConcInput)}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)", boxShadow: "0 4px 14px rgba(234,88,12,0.3)" }}
            >
              Pour Acid into Flask
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Seal stopper */}
      {store.status === "setup" && store.selectedAcid !== null && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">🔌</span>
            <span className="lab-ctrl-section-hdr-title">Step 4 — Initiate Gas Collection</span>
          </div>
          <div className="p-3.5 space-y-2">
            <button
              onClick={() => store.startReactionAction()}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
              style={{ background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", boxShadow: "0 4px 14px rgba(34,197,94,0.3)" }}
            >
              Connect Rubber Stopper & Tubing
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Monitor Reaction & Pop Test */}
      {(store.status === "reacting" || store.status === "completed") && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">💥</span>
            <span className="lab-ctrl-section-hdr-title">Step 5 — Pop Splint Test</span>
          </div>
          <div className="p-3.5 space-y-3">
            <div className="rounded-lg p-2.5 bg-slate-50 border border-slate-100 text-[10px] space-y-1 font-mono">
              <p className="flex justify-between"><span>Gas collected:</span><span className="font-bold text-sky-600">{store.gasVolumeCollected.toFixed(1)} mL</span></p>
              <p className="flex justify-between"><span>Metal mass remaining:</span><span className="font-bold text-slate-700">{store.metalLeft.toFixed(2)} g</span></p>
              <p className="flex justify-between"><span>Exothermic Temperature:</span><span className="font-bold text-orange-600">{store.temperature.toFixed(1)} °C</span></p>
            </div>

            <button
              disabled={store.gasVolumeCollected < 10 || store.popTestTriggered}
              onClick={() => store.triggerPopTestAction()}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", boxShadow: "0 4px 14px rgba(239,68,68,0.3)" }}
            >
              Expose plunger to Lighted Splint
            </button>
          </div>
        </div>
      )}

      {/* Reset options */}
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
      title="Acid-Metal Reactions"
      accent={ACCENT}
      summary="Investigate the reactivity kinetics of metals with strong acids. Collect hydrogen gas evolved and run the splint pop test."
      formula="Metal(s) + 2H⁺(aq) → Metal²⁺(aq) + H₂(g) ↑"
      formulaLabel="Single Displacement"
      facts={[
        { icon: "⛓️", label: "Metal", value: `${store.selectedMetal?.toUpperCase() || "Select"} (${store.particleSize})` },
        { icon: "⚖️", label: "Reactant Mass", value: `${store.metalMass.toFixed(2)} g` },
        { icon: "🧪", label: "Acid", value: `${store.acidVolume}mL of ${store.acidConcentration}M ${store.selectedAcid?.toUpperCase() || "None"}` },
        { icon: "🎈", label: "H2 collected", value: `${store.gasVolumeCollected.toFixed(1)} mL` },
      ]}
      steps={[
        { number: 1, title: "Choose Metal", body: "Select active metal and particle form factor." },
        { number: 2, title: "Weigh Reagent", body: "Check measured weight on balance scale." },
        { number: 3, title: "Pour Acid", body: "Determine acid volume and concentration coefficients." },
        { number: 4, title: "Connect Stopper", body: "Seal flask and collect hydrogen in syringe." },
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
            { label: "Metal left", value: `${store.metalLeft.toFixed(2)} g` },
            { label: "H2 collected", value: `${store.gasVolumeCollected.toFixed(1)} mL` },
            { label: "Temperature", value: `${store.temperature.toFixed(1)} °C` },
            ...(store.popTestTriggered ? [{ label: "Pop Test", value: store.popTestSuccess ? "Positive pop" : "No reaction" }] : []),
          ]}
        />
      }
      workspace={
        <div className="flex flex-col gap-3 w-full h-full">
          <div className="flex justify-end pr-4">
            <MacroMicroViewToggle view={viewMode} onChange={setViewMode} />
          </div>
          {viewMode === "macro" ? (
            <AcidMetalWorkspace state={store} />
          ) : (
            <MicroscopicViewer
              experimentType="acid-metal"
              temperatureK={store.temperature + 273.15}
              concentration={store.acidConcentration}
              isTriggered={store.isReacting}
              extraParam={store.selectedMetal || ""}
            />
          )}
        </div>
      }
      education={EXPERIMENT_EDUCATION["acid-metal"]}
      reactionNote={
        store.status === "completed"
          ? `Analysis complete. Evolved ${store.gasVolumeCollected.toFixed(1)}mL of H2. Splint Pop test: ${store.popTestSuccess ? "Positive pop" : "Negative"}`
          : store.status === "reacting"
          ? `Displacement in progress. Rate: ${store.reactionRate.toFixed(4)} mol/s. Temp: ${store.temperature.toFixed(1)}°C`
          : "Prepare metal and configure acid concentration to analyze kinetics."
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
          nextHref="/experiments/acid-carbonate"
          nextLabel="Next: Acid-Carbonate Reactions →"
          observations={store.observations}
          experimentKey="acid-metal"
        />
      }
    />
  );
}
