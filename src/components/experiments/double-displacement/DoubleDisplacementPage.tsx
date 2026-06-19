"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useDoubleDisplacementStore } from "@/lib/store/double-displacement-store";
import DoubleDisplacementWorkspace from "./DoubleDisplacementWorkspace";
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

const ACCENT = "#0891b2";

export default function DoubleDisplacementPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [viewMode, setViewMode] = useState<"macro" | "micro">("macro");

  const [vol1, setVol1] = useState(25);
  const [vol2, setVol2] = useState(25);
  const [conc1, setConc1] = useState(0.1);
  const [conc2, setConc2] = useState(0.1);
  const [temp, setTemp] = useState(25);

  const store = useDoubleDisplacementStore();
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
      if (store.status === "running" || store.status === "completed") {
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

  // Sync state values to local sliders on load
  useEffect(() => {
    setVol1(store.solution1Volume);
    setVol2(store.solution2Volume);
    setConc1(store.solution1Conc);
    setConc2(store.solution2Conc);
    setTemp(store.temperature);
  }, [store.solution1Volume, store.solution2Volume, store.solution1Conc, store.solution2Conc, store.temperature]);

  const handleVariableChange = (v1: number, v2: number, c1: number, c2: number, t: number) => {
    setVol1(v1);
    setVol2(v2);
    setConc1(c1);
    setConc2(c2);
    setTemp(t);
    store.configureReactantsAction(v1, v2, c1, c2, t);
  };

  const getSystemTitle = () => {
    if (store.system === "agno3-nacl") return "AgNO₃ + NaCl System";
    if (store.system === "pbno3-ki") return "Pb(NO₃)₂ + KI (Golden Rain) System";
    if (store.system === "bacl2-na2so4") return "BaCl₂ + Na₂SO₄ System";
    return "Select System";
  };

  const getSystemEquationText = () => {
    if (store.system === "agno3-nacl") return "AgNO₃(aq) + NaCl(aq) → AgCl(s)↓ + NaNO₃(aq)";
    if (store.system === "pbno3-ki") return "Pb(NO₃)₂(aq) + 2KI(aq) → PbI₂(s)↓ + 2KNO₃(aq)";
    if (store.system === "bacl2-na2so4") return "BaCl₂(aq) + Na₂SO₄(aq) → BaSO₄(s)↓ + 2NaCl(aq)";
    return "";
  };

  const controls = (
    <div className="space-y-4">
      {/* Step 1: Select Reactant System */}
      {store.status === "setup" && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">📥</span>
            <span className="lab-ctrl-section-hdr-title">Select Reactants Cabinet</span>
          </div>
          <div className="p-3.5 space-y-2">
            <button
              onClick={() => store.selectSystemAction("agno3-nacl")}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 bg-sky-600 hover:bg-sky-700 shadow-md"
            >
              Silver Nitrate & Sodium Chloride
            </button>
            <button
              onClick={() => store.selectSystemAction("pbno3-ki")}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 bg-amber-600 hover:bg-amber-700 shadow-md"
            >
              Lead Nitrate & Potassium Iodide
            </button>
            <button
              onClick={() => store.selectSystemAction("bacl2-na2so4")}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 bg-indigo-600 hover:bg-indigo-700 shadow-md"
            >
              Barium Chloride & Sodium Sulfate
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Configure variables */}
      {store.system && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">⚙️</span>
            <span className="lab-ctrl-section-hdr-title">Configure Reaction Variables</span>
          </div>
          <div className="p-3.5 space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 flex justify-between">
                <span>Reactant 1 Concentration:</span>
                <span className="text-cyan-600 font-extrabold">{conc1} M</span>
              </label>
              <input
                type="range"
                min="0.01"
                max="0.50"
                step="0.01"
                value={conc1}
                disabled={store.status === "running" || store.status === "completed"}
                onChange={(e) => handleVariableChange(vol1, vol2, Number(e.target.value), conc2, temp)}
                className="w-full accent-cyan-500 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 flex justify-between">
                <span>Reactant 2 Concentration:</span>
                <span className="text-cyan-600 font-extrabold">{conc2} M</span>
              </label>
              <input
                type="range"
                min="0.01"
                max="0.50"
                step="0.01"
                value={conc2}
                disabled={store.status === "running" || store.status === "completed"}
                onChange={(e) => handleVariableChange(vol1, vol2, conc1, Number(e.target.value), temp)}
                className="w-full accent-cyan-500 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 flex justify-between">
                <span>Solution Temperature:</span>
                <span className="text-orange-500 font-extrabold">{temp} °C</span>
              </label>
              <input
                type="range"
                min="10"
                max="95"
                step="5"
                value={temp}
                disabled={store.status === "running" || (store.status === "completed" && store.system !== "pbno3-ki")}
                onChange={(e) => handleVariableChange(vol1, vol2, conc1, conc2, Number(e.target.value))}
                className="w-full accent-orange-500 disabled:opacity-50"
              />
            </div>

            {store.status === "ready" && (
              <button
                onClick={() => store.mixReactantsAction()}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 bg-teal-600 hover:bg-teal-700 shadow-md"
              >
                Pour and Mix Solutions
              </button>
            )}
          </div>
        </div>
      )}

      {/* Reset options */}
      {(store.status === "completed" || store.status === "running") && (
        <button onClick={store.resetAction}
          className="w-full py-2.5 rounded-xl text-[12px] font-semibold border transition-all duration-150 hover:bg-slate-50 border-slate-200 text-slate-500">
          Reset Reactants Lab
        </button>
      )}
    </div>
  );

  const leftPanel = (
    <LabContextPanel
      title="Double Displacement Reactions"
      accent={ACCENT}
      summary="Combine aqueous solutions to trigger double displacement precipitation. Analyze dynamic solubility constants Ksp, ion product coefficients Qsp, and crystallization behavior under changing temperature."
      formula="AB(aq) + CD(aq) \rightarrow AD(s) \downarrow + CB(aq)"
      formulaLabel="Generic Precipitation Equation"
      facts={[
        { icon: "🌡️", label: "Temperature", value: `${store.temperature}°C` },
        { icon: "💎", label: "Precipitate Mass", value: `${store.precipitateMass.toFixed(4)} g` },
        { icon: "⚖️", label: "R1 Conc", value: `${store.solution1Conc} M` },
        { icon: "🧪", label: "Reaction", value: getSystemTitle() },
      ]}
      steps={[
        { number: 1, title: " reactant system", body: "Select a combination of cations and anions." },
        { number: 2, title: "Define stoichiometry", body: "Change concentrations and starting volumes." },
        { number: 3, title: "Combine in beaker", body: "Pour solutions together to check if Qsp > Ksp." },
        { number: 4, title: "Recrystallize", body: "Adjust temperature to study precipitation limits." },
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
            { label: "Reactants", value: store.system?.toUpperCase() || "None" },
            { label: "Temp", value: `${store.temperature}°C` },
            { label: "Precipitate", value: `${store.precipitateMass.toFixed(3)}g` },
          ]}
        />
      }
      workspace={
        <div className="flex flex-col gap-3 w-full h-full">
          <div className="flex justify-end pr-4">
            <MacroMicroViewToggle view={viewMode} onChange={setViewMode} />
          </div>
          {viewMode === "macro" ? (
            <DoubleDisplacementWorkspace state={store} onMix={store.mixReactantsAction} />
          ) : (
            <MicroscopicViewer
              experimentType="double-displacement"
              temperatureK={store.temperature + 273.15}
              concentration={store.mixingProgress}
              isTriggered={store.status === "completed"}
              extraParam={store.system || undefined}
            />
          )}
        </div>
      }
      education={EXPERIMENT_EDUCATION["double-displacement"]}
      reactionNote={
        store.status === "completed"
          ? `Precipitation equilibrium established. solid formed: ${store.precipitateMass.toFixed(4)}g. Equation: ${getSystemEquationText()}`
          : store.status === "running"
          ? "Precipitate particles nucleating from mixed solution..."
          : "Configure reactant values and select 'Pour' to mix solutions."
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
          nextHref="/experiments/decomposition"
          nextLabel="Next: Decomposition Reactions →"
          observations={store.observations}
          experimentKey="double-displacement"
        />
      }
    />
  );
}
