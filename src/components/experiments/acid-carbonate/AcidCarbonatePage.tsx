"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useAcidCarbonateStore } from "@/lib/store/acid-carbonate-store";
import AcidCarbonateWorkspace from "./AcidCarbonateWorkspace";
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

export default function AcidCarbonatePage() {
  const [showPopup, setShowPopup] = useState(false);
  const [viewMode, setViewMode] = useState<"macro" | "micro">("macro");
  const [carbInput, setCarbInput] = useState<"marble-chips" | "caco3-powder" | "na2co3">("marble-chips");
  const [massInput, setMassInput] = useState(2.0);
  const [acidInput, setAcidInput] = useState<"hcl" | "h2so4">("hcl");
  const [acidVolInput, setAcidVolInput] = useState(50);
  const [acidConcInput, setAcidConcInput] = useState(1.0);
  const [sealedInput, setSealedInput] = useState(true);

  const store = useAcidCarbonateStore();
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
      {/* Step 1: Select Carbonate */}
      {store.status === "setup" && store.selectedCarbonate === null && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">🪨</span>
            <span className="lab-ctrl-section-hdr-title">Step 1 — Carbonate Reagent</span>
          </div>
          <div className="p-3.5 space-y-2">
            {[
              { id: "marble-chips", label: "Marble Chips (CaCO₃)", info: "Slow reaction, surface area limited" },
              { id: "caco3-powder", label: "Calcium Carbonate Powder", info: "Moderate/fast reaction" },
              { id: "na2co3", label: "Sodium Carbonate (Soluble)", info: "Vigorous, rapid reaction kinetics" },
            ].map((carb) => (
              <button
                key={carb.id}
                onClick={() => store.selectCarbonateAction(carb.id as any)}
                className="w-full p-3 text-left rounded-xl border hover:bg-slate-50 transition-all active:scale-[0.98]"
                style={{ borderColor: "var(--lab-glass-border)" }}
              >
                <div className="font-bold text-xs text-slate-800">{carb.label}</div>
                <div className="text-[10px] text-slate-500">{carb.info}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Weigh mass */}
      {store.status === "setup" && store.selectedCarbonate !== null && store.carbonateMass === 0 && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">⚖️</span>
            <span className="lab-ctrl-section-hdr-title">Step 2 — Weigh Carbonate solid</span>
          </div>
          <div className="p-3.5 space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 flex justify-between">
                <span>Solid Mass:</span>
                <span className="text-emerald-600 font-extrabold">{massInput.toFixed(1)} g</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.5"
                value={massInput}
                onChange={(e) => setMassInput(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
            <button
              onClick={() => store.weighCarbonateAction(massInput)}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
              style={{ background: "linear-gradient(135deg, #059669 0%, #047857 100%)", boxShadow: "0 4px 14px rgba(5,150,105,0.3)" }}
            >
              Weigh Carbonate Reagent
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Configure Acid & Stopper */}
      {store.status === "setup" && store.carbonateMass > 0 && store.selectedAcid === null && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">💧</span>
            <span className="lab-ctrl-section-hdr-title">Step 3 — Configure Acid & Stopper</span>
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
                      acidInput === a ? "bg-emerald-500 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
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
                <span className="text-emerald-600 font-extrabold">{acidConcInput.toFixed(1)} M</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.5"
                value={acidConcInput}
                onChange={(e) => setAcidConcInput(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div className="space-y-1.5 flex justify-between items-center py-1.5 border-t border-b border-slate-100">
              <span className="text-[10px] font-bold text-slate-500">Seal Rubber Stopper?</span>
              <button
                onClick={() => setSealedInput(!sealedInput)}
                className={`py-1 px-3 text-xs font-bold rounded-lg transition-all ${
                  sealedInput ? "bg-green-500 text-white" : "bg-red-500 text-white"
                }`}
              >
                {sealedInput ? "SEALED" : "UNSEALED (Leak!)"}
              </button>
            </div>

            <button
              onClick={() => store.configureAcidAction(acidInput, acidVolInput, acidConcInput, sealedInput)}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: "linear-gradient(135deg, #059669 0%, #047857 100%)", boxShadow: "0 4px 14px rgba(5,150,105,0.3)" }}
            >
              Pour Acid & Assemble Stopper
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Start reaction */}
      {store.status === "setup" && store.selectedAcid !== null && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">⚡</span>
            <span className="lab-ctrl-section-hdr-title">Step 4 — Trigger Reaction</span>
          </div>
          <div className="p-3.5 space-y-2">
            <button
              onClick={() => store.startReactionAction()}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
              style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", boxShadow: "0 4px 14px rgba(16,185,129,0.3)" }}
            >
              Mix Carbonate & Acid
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Watch reaction, bubble into Limewater */}
      {(store.status === "reacting" || store.status === "completed") && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">🔬</span>
            <span className="lab-ctrl-section-hdr-title">Step 5 — Gas routing & Limewater</span>
          </div>
          <div className="p-3.5 space-y-3.5">
            <div className="rounded-lg p-2.5 bg-slate-50 border border-slate-100 text-[10px] space-y-1 font-mono">
              <p className="flex justify-between"><span>Gas volume:</span><span className="font-bold text-sky-600">{store.gasVolumeCollected.toFixed(1)} mL</span></p>
              <p className="flex justify-between"><span>Carbonate remaining:</span><span className="font-bold text-slate-700">{store.carbonateLeft.toFixed(2)} g</span></p>
              <p className="flex justify-between"><span>Stopper Seal:</span><span className={`font-bold ${store.stopperSealed ? "text-green-600" : "text-red-500"}`}>{store.stopperSealed ? "Sealed (Normal)" : "Unsealed (Gas Leak!)"}</span></p>
              <p className="flex justify-between"><span>Limewater status:</span><span className="font-bold text-sky-600">{store.limeWaterMilky ? "Milky white precipitate" : "Clear solution"}</span></p>
            </div>

            <button
              onClick={() => store.toggleLimeWaterTestAction(!store.limeWaterTestActive)}
              className={`w-full py-2 rounded-xl text-xs font-bold text-white transition-all duration-150 active:scale-95 ${
                store.limeWaterTestActive ? "bg-slate-700 hover:bg-slate-800" : "bg-emerald-500 hover:bg-emerald-600"
              }`}
            >
              {store.limeWaterTestActive ? "Stop Limewater Gas Flow" : "Bubble CO₂ into Limewater"}
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
      title="Acid-Carbonate Reactions"
      accent={ACCENT}
      summary="Study stoichiometry of carbonates reacting with acid. Evolved carbon dioxide is verified by bubbling through calcium hydroxide limewater."
      formula="CaCO₃(s) + 2H⁺(aq) → Ca²⁺(aq) + CO₂(g) ↑ + H₂O(l)"
      formulaLabel="Gas evolution and precipitation"
      facts={[
        { icon: "🪨", label: "Carbonate", value: store.selectedCarbonate || "Select" },
        { icon: "⚖️", label: "Weighed Mass", value: `${store.carbonateMass.toFixed(1)} g` },
        { icon: "⚡", label: "Pressure", value: `${store.pressure.toFixed(2)} atm` },
        { icon: "💧", label: "Limewater milky", value: store.limeWaterMilky ? "✓ Milky" : "No" },
      ]}
      steps={[
        { number: 1, title: "Choose Carbonate", body: "Pick marble chips, CaCO3 powder, or sodium carbonate." },
        { number: 2, title: "Weigh Mass", body: "Weigh the required mass on the scale." },
        { number: 3, title: "Configure Stopper", body: "Choose acid properties. Set stopper connection carefully." },
        { number: 4, title: "Bubbling CO2", body: "Bubble CO2 into limewater. Watch it milky, then clear." },
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
            { label: "Carbonate left", value: `${store.carbonateLeft.toFixed(2)} g` },
            { label: "CO2 collected", value: `${store.gasVolumeCollected.toFixed(1)} mL` },
            { label: "Limewater", value: store.limeWaterMilky ? "Milky (CaCO3)" : "Clear" },
          ]}
        />
      }
      workspace={
        <div className="flex flex-col gap-3 w-full h-full">
          <div className="flex justify-end pr-4">
            <MacroMicroViewToggle view={viewMode} onChange={setViewMode} />
          </div>
          {viewMode === "macro" ? (
            <AcidCarbonateWorkspace state={store} />
          ) : (
            <MicroscopicViewer
              experimentType="acid-carbonate"
              temperatureK={store.temperature + 273.15}
              concentration={store.acidConcentration}
              isTriggered={store.isReacting}
              extraParam={store.selectedCarbonate || ""}
            />
          )}
        </div>
      }
      education={EXPERIMENT_EDUCATION["acid-carbonate"]}
      reactionNote={
        store.status === "completed"
          ? "Stoichiometry analysis complete. Evolved carbon dioxide is confirmed by milky limewater."
          : store.status === "reacting"
          ? `Gas evolving at rate: ${store.reactionRate.toFixed(4)} mol/s. Limewater: ${store.limeWaterMilky ? "Milky" : "Clear"}`
          : "Weigh carbonate chips and pour acid to collect carbon dioxide."
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
          nextHref="/experiments/states-of-matter"
          nextLabel="Next: States of Matter →"
          observations={store.observations}
          experimentKey="acid-carbonate"
        />
      }
    />
  );
}
