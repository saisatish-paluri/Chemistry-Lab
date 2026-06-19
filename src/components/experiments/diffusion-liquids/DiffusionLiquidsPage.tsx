"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useDiffusionLiquidsStore } from "@/lib/store/diffusion-liquids-store";
import DiffusionLiquidsWorkspace from "./DiffusionLiquidsWorkspace";
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

const ACCENT = "#7c3aed";

export default function DiffusionLiquidsPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [viewMode, setViewMode] = useState<"macro" | "micro">("macro");
  const [tempInput, setTempInput] = useState(25);
  const [rpmInput, setRpmInput] = useState(0);

  const store = useDiffusionLiquidsStore();
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

  // Sync range inputs back to store if changed outside
  useEffect(() => {
    setTempInput(store.temperature);
  }, [store.temperature]);

  useEffect(() => {
    setRpmInput(store.stirringSpeed);
  }, [store.stirringSpeed]);

  const controls = (
    <div className="space-y-4">
      {/* Step 1: Select Solute Dye */}
      {store.status === "setup" && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">🧪</span>
            <span className="lab-ctrl-section-hdr-title">Select Solute Chemical</span>
          </div>
          <div className="p-3.5 space-y-2">
            <button
              onClick={() => store.selectSoluteAction("kmno4")}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 bg-purple-600 hover:bg-purple-700 shadow-md"
            >
              Potassium Permanganate (KMnO₄)
            </button>
            <button
              onClick={() => store.selectSoluteAction("cuso4")}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 bg-blue-600 hover:bg-blue-700 shadow-md"
            >
              Copper(II) Sulfate (CuSO₄)
            </button>
            <button
              onClick={() => store.selectSoluteAction("dye")}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 bg-red-600 hover:bg-red-700 shadow-md"
            >
              Methyl Red Food Dye
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Configure Environment Variables */}
      {store.selectedSolute && (store.status === "ready" || store.status === "running") && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">⚙️</span>
            <span className="lab-ctrl-section-hdr-title">Control Variables</span>
          </div>
          <div className="p-3.5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 flex justify-between">
                <span>Water Temperature:</span>
                <span className="text-orange-500 font-extrabold">{tempInput} °C</span>
              </label>
              <input
                type="range"
                min="10"
                max="95"
                step="5"
                value={tempInput}
                disabled={store.status === "running"}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setTempInput(val);
                  store.setTemperatureAction(val);
                }}
                className="w-full accent-orange-500 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 flex justify-between">
                <span>Magnetic Stirrer RPM:</span>
                <span className="text-emerald-500 font-extrabold">{rpmInput} RPM</span>
              </label>
              <input
                type="range"
                min="0"
                max="600"
                step="50"
                value={rpmInput}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setRpmInput(val);
                  store.setStirringSpeedAction(val);
                }}
                className="w-full accent-emerald-500"
              />
            </div>

            {store.status === "ready" && (
              <button
                onClick={() => store.addDropletAction()}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 bg-violet-600 hover:bg-violet-700 shadow-lg"
              >
                Dispense Solute Drop
              </button>
            )}
          </div>
        </div>
      )}

      {/* Reset options */}
      {(store.status === "completed" || store.status === "running") && (
        <button onClick={store.resetAction}
          className="w-full py-2.5 rounded-xl text-[12px] font-semibold border transition-all duration-150 hover:bg-slate-50 border-slate-200 text-slate-500">
          Reset Lab Simulation
        </button>
      )}
    </div>
  );

  const leftPanel = (
    <LabContextPanel
      title="Diffusion in Liquids"
      accent={ACCENT}
      summary="Investigate the physical kinetics of liquid diffusion. Explore Fick's Second Law and the Einstein-Stokes relation by adjusting temperature, stirring speed, and solute molecular size."
      formula="J = -D \frac{\partial \phi}{\partial x}"
      formulaLabel="Fick's First Law of Diffusion"
      facts={[
        { icon: "🌡️", label: "Water Temperature", value: `${store.temperature}°C` },
        { icon: "🌀", label: "Stirring Rate", value: `${store.stirringSpeed} RPM` },
        { icon: "⚛️", label: "Solute", value: store.selectedSolute ? store.selectedSolute.toUpperCase() : "None Selected" },
        { icon: "📈", label: "Uniformity", value: `${(store.diffusionProgress * 100).toFixed(0)}%` },
      ]}
      steps={[
        { number: 1, title: "Select Solute Dyes", body: "Pick between small KMnO4, medium CuSO4, or large food dye particles." },
        { number: 2, title: "Configure Variables", body: "Change water temperature and magnetic stirrer RPM." },
        { number: 3, title: "Release Pipette Drop", body: "Trigger solute drop release into water." },
        { number: 4, title: "Observe Radial Spreading", body: "Observe concentration gradients fading under Brownian motion." },
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
            { label: "Solute", value: store.selectedSolute?.toUpperCase() || "None" },
            { label: "Temperature", value: `${store.temperature}°C` },
            { label: "Stirrer Speed", value: `${store.stirringSpeed} RPM` },
            { label: "Mixing Progress", value: `${(store.diffusionProgress * 100).toFixed(1)}%` },
          ]}
        />
      }
      workspace={
        <div className="flex flex-col gap-3 w-full h-full">
          <div className="flex justify-end pr-4">
            <MacroMicroViewToggle view={viewMode} onChange={setViewMode} />
          </div>
          {viewMode === "macro" ? (
            <DiffusionLiquidsWorkspace state={store} onAddDroplet={store.addDropletAction} />
          ) : (
            <MicroscopicViewer
              experimentType="diffusion-liquids"
              temperatureK={store.temperature + 273.15}
              concentration={store.addedDroplets > 0 ? store.diffusionProgress : 0}
              isTriggered={store.addedDroplets > 0}
              extraParam={store.selectedSolute || undefined}
            />
          )}
        </div>
      }
      education={EXPERIMENT_EDUCATION["diffusion-liquids"]}
      reactionNote={
        store.status === "completed"
          ? `Diffusion complete! Solute molecules are uniformly distributed. Time elapsed: ${store.elapsedTime.toFixed(1)}s`
          : store.status === "running"
          ? `Solute spreading in progress. Uniformity: ${(store.diffusionProgress * 100).toFixed(1)}% (Time: ${store.elapsedTime.toFixed(1)}s)`
          : "Select a chemical solute and set the variables to begin."
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
          nextHref="/experiments/separation-mixtures"
          nextLabel="Next: Separation of Mixtures →"
          observations={store.observations}
          experimentKey="diffusion-liquids"
        />
      }
    />
  );
}
