"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useSeparationMixturesStore } from "@/lib/store/separation-mixtures-store";
import SeparationMixturesWorkspace from "./SeparationMixturesWorkspace";
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

const ACCENT = "#059669";

export default function SeparationMixturesPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [viewMode, setViewMode] = useState<"macro" | "micro">("macro");

  const store = useSeparationMixturesStore();
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
      if (store.status === "running") {
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
      {/* Step 1: Magnetic Sweep */}
      {store.separationStep === "initial" && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">🧲</span>
            <span className="lab-ctrl-section-hdr-title">Step 1 — Magnet Sweep</span>
          </div>
          <div className="p-3.5 space-y-2">
            <p className="text-[11px] text-slate-500 leading-normal">
              Click the sweep button or the magnet itself in the workspace to sweep filings.
            </p>
            <button
              onClick={() => store.sweepMagnetAction(2.0)}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 bg-rose-600 hover:bg-rose-700 shadow-md"
            >
              Sweep Magnet (2 sec)
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Dissolving */}
      {store.separationStep === "magnetic" && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">💧</span>
            <span className="lab-ctrl-section-hdr-title">Step 2 — Dissolve Salt</span>
          </div>
          <div className="p-3.5 space-y-2">
            <p className="text-[11px] text-slate-500 leading-normal">
              Pour 50 mL distilled water into the beaker to dissolve salt. Sand is insoluble and remains solid.
            </p>
            <button
              onClick={() => store.addWaterAndDissolveAction()}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 bg-sky-600 hover:bg-sky-700 shadow-md"
            >
              Pour Water & Dissolve
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Filtration */}
      {store.separationStep === "dissolving" && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">🏺</span>
            <span className="lab-ctrl-section-hdr-title">Step 3 — Filter Sand</span>
          </div>
          <div className="p-3.5 space-y-2">
            <p className="text-[11px] text-slate-500 leading-normal">
              Pour the sand-salt mixture slurry through the filter paper cone. Sand is trapped as residue; salt filtrate passes.
            </p>
            <button
              onClick={() => store.startFiltrationAction()}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 bg-emerald-600 hover:bg-emerald-700 shadow-md"
            >
              Pour Mixture in Funnel
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Evaporation */}
      {store.separationStep === "filtration" && store.status === "ready" && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">🔥</span>
            <span className="lab-ctrl-section-hdr-title">Step 4 — Evaporate Water</span>
          </div>
          <div className="p-3.5 space-y-2">
            <p className="text-[11px] text-slate-500 leading-normal">
              Pour salt solution into the evaporating dish. Ignite the Bunsen burner to boil water off, leaving pure salt crystals.
            </p>
            <button
              onClick={() => store.startEvaporationAction()}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 bg-amber-600 hover:bg-amber-700 shadow-md"
            >
              Pour Solution & Evaporate
            </button>
          </div>
        </div>
      )}

      {/* Reset options */}
      {(store.status === "completed" || store.status === "running") && (
        <button onClick={store.resetAction}
          className="w-full py-2.5 rounded-xl text-[12px] font-semibold border transition-all duration-150 hover:bg-slate-50 border-slate-200 text-slate-500">
          Reset Mixture Lab
        </button>
      )}
    </div>
  );

  const leftPanel = (
    <LabContextPanel
      title="Separation of Mixtures"
      accent={ACCENT}
      summary="Separate a solid-liquid mixture containing magnetic iron filings, insoluble silica sand, and soluble sodium chloride using physical and thermal methodologies."
      formula="Mixture \xrightarrow{Magnet} Fe(s) \xrightarrow{H_2O} NaCl(aq) + Sand(s) \xrightarrow{Filter} Sand(s) \xrightarrow{\Delta} NaCl(s)"
      formulaLabel="Multi-Stage Separation Path"
      facts={[
        { icon: "🧲", label: "Iron Recovered", value: `${store.separatedIron.toFixed(1)} g` },
        { icon: "🏖️", label: "Sand Recovered", value: `${store.separatedSand.toFixed(1)} g` },
        { icon: "🧂", label: "Salt Recovered", value: `${store.separatedSalt.toFixed(1)} g` },
        { icon: "🌡️", label: "Burner Temp", value: `${store.temperature.toFixed(1)}°C` },
      ]}
      steps={[
        { number: 1, title: "Magnetic Extraction", body: "Draw out all magnetic iron filings from dry mixture." },
        { number: 2, title: "Solvent Dissolution", body: "Add water to dissolve soluble salt. Sand remains solid." },
        { number: 3, title: "Gravity Filtration", body: "Separate sand residue by filter paper wicking." },
        { number: 4, title: "Thermal Crystallization", body: "Boil water off to recover sodium chloride." },
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
            { label: "Step", value: store.separationStep.toUpperCase() },
            { label: "Iron Separated", value: `${store.separatedIron.toFixed(1)}g` },
            { label: "Sand Separated", value: `${store.separatedSand.toFixed(1)}g` },
            { label: "Salt Separated", value: `${store.separatedSalt.toFixed(1)}g` },
          ]}
        />
      }
      workspace={
        <div className="flex flex-col gap-3 w-full h-full">
          <div className="flex justify-end pr-4">
            <MacroMicroViewToggle view={viewMode} onChange={setViewMode} />
          </div>
          {viewMode === "macro" ? (
            <SeparationMixturesWorkspace state={store} onSweepMagnet={store.sweepMagnetAction} />
          ) : (
            <MicroscopicViewer
              experimentType="separation-mixtures"
              temperatureK={store.temperature + 273.15}
              concentration={store.waterVolume > 0 ? store.dissolvedSalt / store.waterVolume : 0}
              isTriggered={store.separationStep !== "initial"}
              extraParam={store.separationStep}
            />
          )}
        </div>
      }
      education={EXPERIMENT_EDUCATION["separation-mixtures"]}
      reactionNote={
        store.status === "completed"
          ? "Purification complete! Iron, sand, and salt recovered successfully."
          : store.separationStep === "evaporation"
          ? `Evaporating solvent water: ${(store.evaporationProgress * 100).toFixed(1)}% complete. Temp: ${store.temperature.toFixed(1)}°C`
          : store.separationStep === "filtration"
          ? `Gravity filtering slurry: ${(store.filtrationProgress * 100).toFixed(1)}% complete.`
          : store.separationStep === "dissolving"
          ? "Salt dissolved. Sand remains as an insoluble precipitate. Ready to filter."
          : "Sweep the magnet across the dry mixture to collect iron filings."
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
          nextHref="/experiments/double-displacement"
          nextLabel="Next: Double Displacement →"
          observations={store.observations}
          experimentKey="separation-mixtures"
        />
      }
    />
  );
}
