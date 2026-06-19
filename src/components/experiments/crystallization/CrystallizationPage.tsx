"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useCrystallizationStore } from "@/lib/store/crystallization-store";
import CrystallizationWorkspace from "./CrystallizationWorkspace";
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

const ACCENT = "#0ea5e9";

export default function CrystallizationPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [viewMode, setViewMode] = useState<"macro" | "micro">("macro");
  const [saltMassInput, setSaltMassInput] = useState(30);
  const [waterVolInput, setWaterVolInput] = useState(60);
  
  const store = useCrystallizationStore();
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
      if (store.status === "heating" || (store.status === "cooling" && store.isCooling)) {
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
      {/* Step 1: Add Impure Salt */}
      {store.status === "setup" && store.impureSaltMass === 0 && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">⚖️</span>
            <span className="lab-ctrl-section-hdr-title">Step 1 — Weigh Impure Salt</span>
          </div>
          <div className="p-3.5 space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 flex justify-between">
                <span>Mass of Impure CuSO₄:</span>
                <span className="text-sky-600 font-extrabold">{saltMassInput} g</span>
              </label>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={saltMassInput}
                onChange={(e) => setSaltMassInput(Number(e.target.value))}
                className="w-full accent-sky-500"
              />
            </div>
            <button
              onClick={() => store.addImpureSaltAction(saltMassInput)}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
              style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)", boxShadow: "0 4px 14px rgba(14,165,233,0.3)" }}
            >
              Transfer Salt to Beaker
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Add Water */}
      {store.status === "setup" && store.impureSaltMass > 0 && store.waterVolume === 0 && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">💧</span>
            <span className="lab-ctrl-section-hdr-title">Step 2 — Add Solvent</span>
          </div>
          <div className="p-3.5 space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 flex justify-between">
                <span>Volume of Water:</span>
                <span className="text-sky-600 font-extrabold">{waterVolInput} mL</span>
              </label>
              <input
                type="range"
                min="40"
                max="100"
                step="5"
                value={waterVolInput}
                onChange={(e) => setWaterVolInput(Number(e.target.value))}
                className="w-full accent-sky-500"
              />
            </div>
            <button
              onClick={() => store.addWaterAction(waterVolInput)}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
              style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)", boxShadow: "0 4px 14px rgba(14,165,233,0.3)" }}
            >
              Pour Water into Beaker
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Heat and Dissolve */}
      {store.status === "heating" && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">🔥</span>
            <span className="lab-ctrl-section-hdr-title">Step 3 — Heat & Dissolve</span>
          </div>
          <div className="p-3.5 space-y-3">
            <button
              onClick={() => store.toggleHeatingAction(!store.isHeating)}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
              style={{
                background: store.isHeating
                  ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                  : "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                boxShadow: store.isHeating ? "0 4px 14px rgba(239,68,68,0.3)" : "0 4px 14px rgba(34,197,94,0.3)"
              }}
            >
              {store.isHeating ? "Turn Off Heating" : "Turn On Hot Plate"}
            </button>

            <div className="rounded-lg p-2.5 bg-slate-50 border border-slate-100 text-[10px] space-y-1 font-mono">
              <p className="flex justify-between"><span>Soluble Salt dissolved:</span><span className="font-bold">{store.dissolvedMass.toFixed(1)} g / {(store.impureSaltMass * 0.9).toFixed(1)} g</span></p>
              <p className="flex justify-between"><span>Impurities dissolved:</span><span className="font-bold">{store.dissolvedImpurityMass.toFixed(1)} g / {(store.impureSaltMass * 0.1).toFixed(1)} g</span></p>
              <p className="flex justify-between"><span>Temperature:</span><span className={`font-bold ${store.temperature > 75 ? "text-red-500" : "text-slate-700"}`}>{store.temperature.toFixed(1)} °C</span></p>
            </div>

            {/* Filter to dish button */}
            <button
              disabled={store.undissolvedMass > 0.5 || store.isHeating}
              onClick={() => store.transferToDishAction()}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", boxShadow: "0 4px 14px rgba(139,92,246,0.3)" }}
            >
              Filter & Transfer to Dish →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Cooling crystallization */}
      {store.status === "cooling" && !store.isFiltered && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">❄️</span>
            <span className="lab-ctrl-section-hdr-title">Step 4 — Crystallization kinetics</span>
          </div>
          <div className="p-3.5 space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500">Select Cooling Method:</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["slow", "medium", "fast"] as const).map((rate) => (
                  <button
                    key={rate}
                    onClick={() => store.setCoolingRateAction(rate)}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      store.coolingRate === rate
                        ? "bg-sky-500 text-white shadow-sm"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    {rate.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg p-2.5 bg-slate-50 border border-slate-100 text-[10px] space-y-1 font-mono">
              <p className="flex justify-between"><span>Crystals formed:</span><span className="font-bold text-sky-600">{store.crystalsFormedMass.toFixed(1)} g</span></p>
              <p className="flex justify-between"><span>Average Crystal size:</span><span className="font-bold text-sky-600">{store.crystalSize.toFixed(2)} mm</span></p>
              <p className="flex justify-between"><span>Cooling Temperature:</span><span className="font-bold text-slate-700">{store.temperature.toFixed(1)} °C</span></p>
            </div>

            <button
              disabled={store.crystalsFormedMass < 0.5}
              onClick={() => store.filterCrystalsAction()}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", boxShadow: "0 4px 14px rgba(16,185,129,0.3)" }}
            >
              Separate Crystals (Filter)
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Filtrate Separated, Collect Product */}
      {store.isFiltered && !store.isCollected && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">🔬</span>
            <span className="lab-ctrl-section-hdr-title">Step 5 — Collect & Dry Product</span>
          </div>
          <div className="p-3.5 space-y-2">
            <button
              onClick={() => store.collectProductAction()}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
              style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", boxShadow: "0 4px 14px rgba(245,158,11,0.35)" }}
            >
              Collect Product (Dry and Weigh)
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
      title="Crystallization & Purification"
      accent={ACCENT}
      summary="Purify Copper(II) Sulfate from an impure salt mixture by hot saturation filtration and recrystallization under controlled cooling rates."
      formula="CuSO₄(aq) + 5H₂O(l) → CuSO₄·5H₂O(s) ↓"
      formulaLabel="Hydrated Crystallization"
      facts={[
        { icon: "🧪", label: "Starting material", value: `${store.impureSaltMass.toFixed(0)}g impure CuSO4` },
        { icon: "💧", label: "Distilled Water", value: `${store.waterVolume.toFixed(0)} mL` },
        { icon: "❄️", label: "Cooling Rate", value: store.coolingRate },
        { icon: "💎", label: "Purity", value: store.isCollected ? `${store.productPurity.toFixed(1)}%` : "Pending" },
      ]}
      steps={[
        { number: 1, title: "Add Impure Salt", body: "Weigh out the impure starting material." },
        { number: 2, title: "Dissolve in Water", body: "Pour solvent water to prepare solution." },
        { number: 3, title: "Heat & Dissolve", body: "Activate heater to dissolve salt completely, leaving insoluble impurities." },
        { number: 4, title: "Filter & Crystallize", body: "Filter the hot solution into a dish. Set the cooling rate to grow crystals." },
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
            { label: "Dissolved", value: `${store.dissolvedMass.toFixed(1)} g` },
            { label: "Crystals Formed", value: `${store.crystalsFormedMass.toFixed(1)} g` },
            { label: "Temperature", value: `${store.temperature.toFixed(1)} °C` },
            ...(store.isCollected ? [{ label: "Purity", value: `${store.productPurity.toFixed(1)}%` }] : []),
          ]}
        />
      }
      workspace={
        <div className="flex flex-col gap-3 w-full h-full">
          <div className="flex justify-end pr-4">
            <MacroMicroViewToggle view={viewMode} onChange={setViewMode} />
          </div>
          {viewMode === "macro" ? (
            <CrystallizationWorkspace state={store} />
          ) : (
            <MicroscopicViewer
              experimentType="crystallization"
              temperatureK={store.temperature + 273.15}
              concentration={store.waterVolume > 0 ? store.dissolvedMass / store.waterVolume : 0}
              isTriggered={store.status === "cooling"}
            />
          )}
        </div>
      }
      education={EXPERIMENT_EDUCATION["crystallization"]}
      reactionNote={
        store.status === "completed"
          ? `Crystallization finished. Purity: ${store.productPurity.toFixed(1)}% (Recovery: ${store.pureProductCollected.toFixed(1)}g pure crystals)`
          : store.status === "cooling"
          ? `Cooling and crystallization: ${store.crystalsFormedMass.toFixed(1)}g grown. Temperature: ${store.temperature.toFixed(1)}°C`
          : store.status === "heating"
          ? `Dissolution: ${store.dissolvedMass.toFixed(1)}g dissolved. Temperature: ${store.temperature.toFixed(1)}°C`
          : "Add impure copper(II) sulfate salt to start the purification process."
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
          nextHref="/experiments/natural-indicators"
          nextLabel="Next: Natural Indicators →"
          observations={store.observations}
          experimentKey="crystallization"
        />
      }
    />
  );
}
