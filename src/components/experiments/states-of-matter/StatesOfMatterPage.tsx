"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useStatesOfMatterStore } from "@/lib/store/states-of-matter-store";
import StatesOfMatterWorkspace from "./StatesOfMatterWorkspace";
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

export default function StatesOfMatterPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [viewMode, setViewMode] = useState<"macro" | "micro">("macro");
  const [substanceInput, setSubstanceInput] = useState<"water" | "ethanol" | "wax">("water");
  const [altitudeInput, setAltitudeInput] = useState(0);
  const [parallaxInput, setParallaxInput] = useState(1.5);
  const [heatingPowerInput, setHeatingPowerInput] = useState(150);

  const store = useStatesOfMatterStore();
  const displayedTemperature = store.temperature + store.thermometerEyeLevelOffset;
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
      if (store.isHeating || store.isCooling) {
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
      {/* Step 1: Select Substance & Altitude */}
      {store.status === "setup" && store.selectedSubstance === null && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">🔬</span>
            <span className="lab-ctrl-section-hdr-title">Step 1 — Configure Phase Study</span>
          </div>
          <div className="p-3.5 space-y-3.5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500">Select Substance:</label>
              <div className="grid grid-cols-3 gap-1">
                {(["water", "ethanol", "wax"] as const).map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSubstanceInput(sub)}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                      substanceInput === sub ? "bg-violet-500 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    {sub.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 flex justify-between">
                <span>Configure Altitude:</span>
                <span className="text-violet-600 font-extrabold">{altitudeInput} m</span>
              </label>
              <input
                type="range"
                min="0"
                max="4000"
                step="500"
                value={altitudeInput}
                onChange={(e) => setAltitudeInput(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
              <p className="text-[8.5px] text-slate-400">Higher altitude reduces boiling point thresholds.</p>
            </div>

            <button
              onClick={() => store.selectSubstanceAction(substanceInput, altitudeInput)}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150"
              style={{ background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)", boxShadow: "0 4px 14px rgba(124,58,237,0.3)" }}
            >
              Assemble Phase Setup
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Parallax Alignment & Reading */}
      {store.selectedSubstance !== null && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">👁️</span>
            <span className="lab-ctrl-section-hdr-title">Thermometer Alignment</span>
          </div>
          <div className="p-3.5 space-y-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 flex justify-between">
                <span>Eye-Level Reading Offset:</span>
                <span className="text-violet-600 font-extrabold">{parallaxInput.toFixed(1)} °C</span>
              </label>
              <input
                type="range"
                min="-3.0"
                max="3.0"
                step="0.5"
                value={parallaxInput}
                onChange={(e) => {
                  setParallaxInput(Number(e.target.value));
                  store.adjustThermometerParallaxAction(Number(e.target.value));
                }}
                className="w-full accent-violet-500"
              />
              <p className="text-[8.5px] text-slate-400">Keep eye level aligned at 0.0 to avoid parallax offsets.</p>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Heating & Cooling Controls */}
      {store.selectedSubstance !== null && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">🔥</span>
            <span className="lab-ctrl-section-hdr-title">Thermodynamic Controls</span>
          </div>
          <div className="p-3.5 space-y-3.5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 flex justify-between">
                <span>Burner heating Power:</span>
                <span className="text-violet-600 font-extrabold">{heatingPowerInput} W</span>
              </label>
              <input
                type="range"
                min="100"
                max="500"
                step="50"
                value={heatingPowerInput}
                onChange={(e) => {
                  setHeatingPowerInput(Number(e.target.value));
                  store.setHeatingPowerAction(Number(e.target.value));
                }}
                className="w-full accent-violet-500"
              />
              <p className="text-[8.5px] text-red-400">WARNING: High power (&gt;350W) can cause volatile splattering.</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => store.toggleHeatingAction(!store.isHeating)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all ${
                  store.isHeating ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {store.isHeating ? "Stop Heating" : "Heat Substance"}
              </button>

              <button
                onClick={() => store.toggleCoolingAction(!store.isCooling)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all ${
                  store.isCooling ? "bg-blue-600 hover:bg-blue-700" : "bg-cyan-500 hover:bg-cyan-600"
                }`}
              >
                {store.isCooling ? "Stop Cooling" : "Cool Setup"}
              </button>
            </div>
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
      title="States of Matter"
      accent={ACCENT}
      summary="Heat or cool Water, Ethanol, and Wax. Examine plateaus at melting and boiling thresholds, and study pressure dependent shifts at high altitudes."
      formula="q = m·c_p·ΔT \quad | \quad q = m·L"
      formulaLabel="Sensible vs Latent Heat"
      facts={[
        { icon: "🔬", label: "Substance", value: store.selectedSubstance || "Select" },
        { icon: "⛰️", label: "Altitude", value: `${store.altitude} m` },
        { icon: "🌋", label: "Pressure", value: `${store.pressure.toFixed(3)} atm` },
        { icon: "📈", label: "Phase", value: store.phase.toUpperCase() },
      ]}
      steps={[
        { number: 1, title: "Configure Setup", body: "Select substance and pressure altitude." },
        { number: 2, title: "Adjust eye level", body: "Align thermometer view to minimize parallax offsets." },
        { number: 3, title: "Heat & Cool", body: "Trigger heating/cooling. Note latent heat plateaus." },
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
            { label: "Substance", value: store.selectedSubstance || "None" },
            { label: "Actual Temp", value: `${store.temperature.toFixed(1)} °C` },
            { label: "Thermometer", value: `${displayedTemperature.toFixed(1)} °C` },
            { label: "Phase State", value: store.phase.toUpperCase() },
          ]}
        />
      }
      workspace={
        <div className="flex flex-col gap-3 w-full h-full">
          <div className="flex justify-end pr-4">
            <MacroMicroViewToggle view={viewMode} onChange={setViewMode} />
          </div>
          {viewMode === "macro" ? (
            <StatesOfMatterWorkspace state={store} />
          ) : (
            <MicroscopicViewer
              experimentType="states-of-matter"
              temperatureK={store.temperature + 273.15}
              isTriggered={store.isHeating || store.isCooling}
              extraParam={store.phase}
              gasType={store.selectedSubstance || "water"}
            />
          )}
        </div>
      }
      education={EXPERIMENT_EDUCATION["states-of-matter"]}
      reactionNote={
        store.status === "completed"
          ? "Analysis complete. Recorded sensible/latent curves and transition points."
          : store.splatterTriggered
          ? "WARNING: Splattering! Excess power causing rapid vaporization!"
          : store.isHeating
          ? `Heating in progress... Current Phase: ${store.phase.toUpperCase()} (Plateau: ${(store.latentHeatProgress * 100).toFixed(0)}%)`
          : store.isCooling
          ? `Cooling in progress... Current Phase: ${store.phase.toUpperCase()}`
          : "Choose configuration parameters to initiate phase transition studies."
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
          nextLabel="View Catalog"
          observations={store.observations}
          experimentKey="states-of-matter"
        />
      }
    />
  );
}
