"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { usePhysicalChemicalStore } from "@/lib/store/physical-chemical-store";
import PhysicalChemicalWorkspace from "./PhysicalChemicalWorkspace";
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

export default function PhysicalChemicalPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [viewMode, setViewMode] = useState<"macro" | "micro">("macro");

  const store = usePhysicalChemicalStore();
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

  const getFormula = () => {
    if (store.selectedProcess === "melting-wax") return "C_{25}H_{52}(s) \\xrightarrow{\\Delta} C_{25}H_{52}(l)";
    if (store.selectedProcess === "freezing-water") return "H₂O(l) \\xrightarrow{Cool} H₂O(s)";
    if (store.selectedProcess === "dissolving-sugar") return "C_{12}H_{22}O_{11}(s) \\xrightarrow{H₂O} C_{12}H_{22}O_{11}(aq)";
    if (store.selectedProcess === "burning-paper") return "Cellulose(s) + O₂(g) \\rightarrow CO₂(g) + H₂O(g) + Carbon(s) \\downarrow";
    if (store.selectedProcess === "rusting-iron") return "4Fe(s) + 3O₂(g) + 6H₂O(l) \\rightarrow 4Fe(OH)₃(s)";
    if (store.selectedProcess === "neutralization") return "HCl(aq) + NaOH(aq) \\rightarrow NaCl(aq) + H₂O(l)";
    return "Study of Changes";
  };

  const getProcessLabel = () => {
    if (store.selectedProcess === "melting-wax") return "Melting Paraffin Wax";
    if (store.selectedProcess === "freezing-water") return "Freezing Water";
    if (store.selectedProcess === "dissolving-sugar") return "Dissolving Sugar Cube";
    if (store.selectedProcess === "burning-paper") return "Combustion of Cellulose (Paper)";
    if (store.selectedProcess === "rusting-iron") return "Slow Oxidation (Rusting Steel Wool)";
    if (store.selectedProcess === "neutralization") return "Acid-Base Neutralization";
    return "Physical vs Chemical";
  };

  const getTriggerButtonText = () => {
    if (store.selectedProcess === "melting-wax") return "Apply Bunsen Heat";
    if (store.selectedProcess === "freezing-water") return "Immerse Tube in Ice Bath";
    if (store.selectedProcess === "dissolving-sugar") return "Drop & Stir Sugar Cube";
    if (store.selectedProcess === "burning-paper") return "Ignite Paper Sheet";
    if (store.selectedProcess === "rusting-iron") return "Expose Steel Wool to Moisture";
    if (store.selectedProcess === "neutralization") return "Pour NaOH base into HCl acid";
    return "Trigger Process";
  };

  const getReversibilityButtonText = () => {
    if (store.processType === "physical") return "Try to Reverse Process";
    return "Test Chemical Reversibility";
  };

  const controls = (
    <div className="space-y-4">
      {/* Step 1: Select Process */}
      {store.status === "setup" && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">📥</span>
            <span className="lab-ctrl-section-hdr-title">Select Change Process</span>
          </div>
          <div className="p-3.5 space-y-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block border-b border-slate-100 pb-1">PHYSICAL CHANGES</span>
              <button
                onClick={() => store.selectProcessAction("melting-wax")}
                className="w-full py-2 rounded-lg text-xs font-semibold text-sky-600 bg-sky-50 border border-sky-200 hover:bg-sky-100 transition-all duration-150"
              >
                Melting Wax
              </button>
              <button
                onClick={() => store.selectProcessAction("freezing-water")}
                className="w-full py-2 rounded-lg text-xs font-semibold text-sky-600 bg-sky-50 border border-sky-200 hover:bg-sky-100 transition-all duration-150"
              >
                Freezing Water
              </button>
              <button
                onClick={() => store.selectProcessAction("dissolving-sugar")}
                className="w-full py-2 rounded-lg text-xs font-semibold text-sky-600 bg-sky-50 border border-sky-200 hover:bg-sky-100 transition-all duration-150"
              >
                Dissolving Sugar
              </button>
            </div>

            <div className="space-y-1 pt-1.5">
              <span className="text-[10px] font-bold text-slate-400 block border-b border-slate-100 pb-1">CHEMICAL REACTIONS</span>
              <button
                onClick={() => store.selectProcessAction("burning-paper")}
                className="w-full py-2 rounded-lg text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-all duration-150"
              >
                Burning Paper
              </button>
              <button
                onClick={() => store.selectProcessAction("rusting-iron")}
                className="w-full py-2 rounded-lg text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-all duration-150"
              >
                Rusting Iron
              </button>
              <button
                onClick={() => store.selectProcessAction("neutralization")}
                className="w-full py-2 rounded-lg text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-all duration-150"
              >
                Acid-Base Neutralization
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Trigger process */}
      {store.selectedProcess && store.status === "ready" && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">⚡</span>
            <span className="lab-ctrl-section-hdr-title">Execute Change</span>
          </div>
          <div className="p-3.5 space-y-2">
            <button
              onClick={() => store.triggerProcessAction()}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 bg-orange-600 hover:bg-orange-700 shadow-md"
            >
              {getTriggerButtonText()}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Check Reversibility */}
      {store.selectedProcess && store.status === "completed" && !store.reversibilityChecked && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">🔄</span>
            <span className="lab-ctrl-section-hdr-title">Verify Reversibility</span>
          </div>
          <div className="p-3.5 space-y-2">
            <p className="text-[11px] text-slate-500 leading-normal">
              Test whether the change is temporary (physical) or permanent (chemical bonds changed).
            </p>
            <button
              onClick={() => store.checkReversibilityAction()}
              className={`w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 shadow-md ${
                store.processType === "physical" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {getReversibilityButtonText()}
            </button>
          </div>
        </div>
      )}

      {/* Reset options */}
      {(store.status === "completed" || store.status === "running") && (
        <button onClick={store.resetAction}
          className="w-full py-2.5 rounded-xl text-[12px] font-semibold border transition-all duration-150 hover:bg-slate-50 border-slate-200 text-slate-500">
          Reset Cabinet Setup
        </button>
      )}
    </div>
  );

  const leftPanel = (
    <LabContextPanel
      title="Physical vs Chemical Changes"
      accent={ACCENT}
      summary="Compare physical alterations (phase transitions, solutions) with chemical reactions (combustion, neutralization, oxidation). Verify reversibility, enthalpy changes, and atomic structure configurations."
      formula={getFormula()}
      formulaLabel="Generic Process Equation"
      facts={[
        { icon: "🌡️", label: "Temperature", value: `${store.temperature.toFixed(1)}°C` },
        { icon: "📈", label: "Progress", value: `${(store.reactionProgress * 100).toFixed(0)}%` },
        { icon: "⚖️", label: "Process Type", value: store.processType ? store.processType.toUpperCase() : "Pending" },
        { icon: "🔄", label: "Reversibility", value: store.reversibilityChecked ? (store.processType === "physical" ? "Reversible" : "Irreversible") : "Untested" },
      ]}
      steps={[
        { number: 1, title: "Select Process type", body: "Choose a chemical reaction or physical phase shift." },
        { number: 2, title: "Trigger energy input", body: "Apply burner heat, freeze, or combine reagents." },
        { number: 3, title: "Reversibility Test", body: "Verify whether starting molecules are easily recovered." },
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
            { label: "Process", value: getProcessLabel() },
            { label: "Type", value: store.processType?.toUpperCase() || "None" },
            { label: "Temp", value: `${store.temperature.toFixed(1)}°C` },
          ]}
        />
      }
      workspace={
        <div className="flex flex-col gap-3 w-full h-full">
          <div className="flex justify-end pr-4">
            <MacroMicroViewToggle view={viewMode} onChange={setViewMode} />
          </div>
          {viewMode === "macro" ? (
            <PhysicalChemicalWorkspace
              state={store}
              onTrigger={store.triggerProcessAction}
              onCheckReversibility={store.checkReversibilityAction}
            />
          ) : (
            <MicroscopicViewer
              experimentType="physical-chemical"
              temperatureK={store.temperature + 273.15}
              concentration={store.reactionProgress}
              isTriggered={store.isTriggered}
              extraParam={store.selectedProcess || undefined}
            />
          )}
        </div>
      }
      education={EXPERIMENT_EDUCATION["physical-chemical"]}
      reactionNote={
        store.status === "completed"
          ? store.reversibilityChecked
            ? `Study completed. ${getProcessLabel()} is a ${store.processType} change.`
            : "Process complete. Perform Reversibility Test to confirm characteristics."
          : store.status === "running"
          ? `Change in progress: ${(store.reactionProgress * 100).toFixed(1)}% complete. Temp: ${store.temperature.toFixed(1)}°C`
          : "Select a process to load variables."
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
          nextLabel="Finish Experiments"
          observations={store.observations}
          experimentKey="physical-chemical"
        />
      }
    />
  );
}
