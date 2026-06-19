"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useDecompositionStore } from "@/lib/store/decomposition-store";
import DecompositionWorkspace from "./DecompositionWorkspace";
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

export default function DecompositionPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [viewMode, setViewMode] = useState<"macro" | "micro">("macro");
  const [powerInput, setPowerInput] = useState(150);

  const store = useDecompositionStore();
  
  // Calculate Arrhenius rate coefficient k locally
  const R = 8.314;
  const tempK = store.temperature + 273.15;
  const kinetics = store.reactant 
    ? {
        caco3: { ea: 180, A: 1.2e10 },
        kclo3: { ea: store.hasCatalyst ? 120 : 220, A: 8.5e11 },
        h2o2:  { ea: store.hasCatalyst ? 49 : 75, A: 1.5e8 },
      }[store.reactant]
    : null;
  const Ea = kinetics ? kinetics.ea : 0;
  const k = kinetics ? kinetics.A * Math.exp(-(Ea * 1000) / (R * tempK)) : 0;
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
      // Decomposition ticks always, cooling down if burner off
      store.tickAction(delta);
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

  useEffect(() => {
    setPowerInput(store.heatingPower);
  }, [store.heatingPower]);

  const getFormula = () => {
    if (store.reactant === "caco3") return "CaCO₃(s) \\rightarrow CaO(s) + CO₂(g)";
    if (store.reactant === "kclo3") return "2KClO₃(s) \\xrightarrow{MnO₂} 2KCl(s) + 3O₂(g)";
    if (store.reactant === "h2o2") return "2H₂O₂(aq) \\xrightarrow{MnO₂} 2H₂O(l) + O₂(g)";
    return "Reactant Decomposition";
  };

  const getReactantLabel = () => {
    if (store.reactant === "caco3") return "Calcium Carbonate (Limestone)";
    if (store.reactant === "kclo3") return "Potassium Chlorate";
    if (store.reactant === "h2o2") return "Hydrogen Peroxide (10% aq)";
    return "Reactant";
  };

  const controls = (
    <div className="space-y-4">
      {/* Step 1: Select Reactant */}
      {store.status === "setup" && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">🔬</span>
            <span className="lab-ctrl-section-hdr-title">Select Reactant Chemical</span>
          </div>
          <div className="p-3.5 space-y-2">
            <button
              onClick={() => store.selectReactantAction("caco3")}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 bg-slate-600 hover:bg-slate-700 shadow-md"
            >
              Calcium Carbonate (CaCO₃)
            </button>
            <button
              onClick={() => store.selectReactantAction("kclo3")}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 bg-orange-600 hover:bg-orange-700 shadow-md"
            >
              Potassium Chlorate (KClO₃)
            </button>
            <button
              onClick={() => store.selectReactantAction("h2o2")}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 bg-cyan-600 hover:bg-cyan-700 shadow-md"
            >
              Hydrogen Peroxide (H₂O₂ 10%)
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Add Catalyst (MnO2) */}
      {store.reactant && !store.hasCatalyst && (store.status === "ready" || store.status === "running") && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">🧪</span>
            <span className="lab-ctrl-section-hdr-title">Option — Add Catalyst</span>
          </div>
          <div className="p-3.5 space-y-2">
            <p className="text-[11px] text-slate-500 leading-normal">
              MnO₂ catalyst lowers the activation energy of decomposition reactions (especially for KClO₃ and H₂O₂).
            </p>
            <button
              onClick={() => store.addMnO2CatalystAction()}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 bg-emerald-600 hover:bg-emerald-700 shadow-md"
            >
              Add Manganese Dioxide (MnO₂)
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Burner & Heating Power */}
      {store.reactant && (store.status === "ready" || store.status === "running") && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">🔥</span>
            <span className="lab-ctrl-section-hdr-title">Bunsen Burner Controls</span>
          </div>
          <div className="p-3.5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 flex justify-between">
                <span>Burner Heating Power:</span>
                <span className="text-orange-500 font-extrabold">{powerInput} W</span>
              </label>
              <input
                type="range"
                min="50"
                max="600"
                step="50"
                value={powerInput}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPowerInput(val);
                  store.setHeatingPowerAction(val);
                }}
                className="w-full accent-orange-500"
              />
            </div>

            <button
              onClick={() => store.toggleHeatingAction(!store.isHeating)}
              className={`w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 shadow-md ${
                store.isHeating ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              {store.isHeating ? "Turn Off Burner" : "Ignite Bunsen Burner"}
            </button>
          </div>
        </div>
      )}

      {/* Reset options */}
      {(store.status === "completed" || store.status === "running") && (
        <button onClick={store.resetAction}
          className="w-full py-2.5 rounded-xl text-[12px] font-semibold border transition-all duration-150 hover:bg-slate-50 border-slate-200 text-slate-500">
          Reset Kinetics Lab
        </button>
      )}
    </div>
  );

  const leftPanel = (
    <LabContextPanel
      title="Decomposition Reactions"
      accent={ACCENT}
      summary="Study chemical kinetics and thermal breakdown. Measure Arrhenius parameters, activation barriers, catalyst effects, and collect gas evolved using a gas syringe."
      formula={getFormula()}
      formulaLabel="Chemical Decomposition Path"
      facts={[
        { icon: "🌡️", label: "Temperature", value: `${store.temperature.toFixed(1)}°C` },
        { icon: "⚖️", label: "Reactant Mass", value: `${store.remainingMass.toFixed(2)} g` },
        { icon: "💉", label: "Gas Collected", value: `${store.gasVolumeEvolved.toFixed(1)} mL` },
        { icon: "⚡", label: "Catalyst Loaded", value: store.hasCatalyst ? "Yes (MnO2)" : "None" },
      ]}
      steps={[
        { number: 1, title: "Select Compounds", body: "Choose marble chips, potassium chlorate, or hydrogen peroxide." },
        { number: 2, title: "Lower Activation Barrier", body: "Decide whether to add MnO2 catalyst." },
        { number: 3, title: "Apply Thermal Input", body: "Ignite burner and set heat wattage." },
        { number: 4, title: "Collect Gas Volume", body: "Evolve gas and monitor the plunger." },
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
            { label: "Reactant", value: store.reactant?.toUpperCase() || "None" },
            { label: "Temp", value: `${store.temperature.toFixed(1)}°C` },
            { label: "Remaining Mass", value: `${store.remainingMass.toFixed(2)}g` },
            { label: "Gas Vol", value: `${store.gasVolumeEvolved.toFixed(1)} mL` },
          ]}
        />
      }
      workspace={
        <div className="flex flex-col gap-3 w-full h-full">
          <div className="flex justify-end pr-4">
            <MacroMicroViewToggle view={viewMode} onChange={setViewMode} />
          </div>
          {viewMode === "macro" ? (
            <DecompositionWorkspace state={store} onToggleHeat={store.toggleHeatingAction} />
          ) : (
            <MicroscopicViewer
              experimentType="decomposition"
              temperatureK={store.temperature + 273.15}
              concentration={store.remainingMass / store.initialMass}
              isTriggered={store.status === "running" || store.status === "completed"}
              extraParam={store.reactant || undefined}
            />
          )}
        </div>
      }
      education={EXPERIMENT_EDUCATION["decomposition"]}
      reactionNote={
        store.status === "completed"
          ? "Decomposition reaction finalized! Reactant decomposed and gas collected."
          : store.status === "running"
          ? `Decomposing... Rate k = ${k.toExponential(3)} s⁻¹. Evolving gas.`
          : "Select a chemical compound and weigh it to begin."
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
          nextHref="/experiments/physical-chemical"
          nextLabel="Next: Physical vs Chemical Changes →"
          observations={store.observations}
          experimentKey="decomposition"
        />
      }
    />
  );
}
