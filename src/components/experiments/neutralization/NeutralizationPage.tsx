"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useNeutralizationStore } from "@/lib/store/neutralization-store";
import NeutralizationWorkspace   from "./NeutralizationWorkspace";
import StepGuide                 from "@/components/lab/StepGuide";
import ObservationPanel          from "@/components/lab/ObservationPanel";
import StatusBar                 from "@/components/lab/StatusBar";
import ResultModal               from "@/components/lab/ResultModal";
import ContextPopup, { obsToPopup } from "@/components/lab/ContextPopup";
import LabPageShell              from "@/components/lab/LabPageShell";
import LabContextPanel           from "@/components/lab/LabContextPanel";
import { EXPERIMENT_EDUCATION }  from "@/lib/experiment-education";

const ACCENT = "#10b981";
const HCL_VOL  = 25;
const NAOH_VOL = 25;

export default function NeutralizationPage() {
  const [showPopup, setShowPopup] = useState(false);
  const store = useNeutralizationStore();

  const mixTimer   = useRef<ReturnType<typeof setInterval> | null>(null);
  const popupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Titration valve and burette local states
  const [valvePosition, setValvePosition] = useState<number>(0);
  const [isBuretteFilled, setIsBuretteFilled] = useState<boolean>(false);
  const [isFillingBurette, setIsFillingBurette] = useState<boolean>(false);
  const [fillProgress, setFillProgress] = useState<number>(0);

  const startFillingBurette = () => {
    setIsFillingBurette(true);
    setFillProgress(0);
    let currentProgress = 0;
    const timer = setInterval(() => {
      currentProgress = Math.min(1.0, currentProgress + 0.05);
      setFillProgress(currentProgress);
      if (currentProgress >= 1.0) {
        clearInterval(timer);
        setIsFillingBurette(false);
        setIsBuretteFilled(true);
        store.startMixingAction();
      }
    }, 50);
  };

  const handleReset = () => {
    setIsBuretteFilled(false);
    setIsFillingBurette(false);
    setFillProgress(0);
    setValvePosition(0);
    store.resetAction();
  };

  useEffect(() => {
    store.hydrate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => {
    if (mixTimer.current)   clearInterval(mixTimer.current);
    if (popupTimer.current) clearTimeout(popupTimer.current);
  }, []);

  const lastObsId = store.observations[0]?.id;
  useEffect(() => {
    if (!lastObsId) return;
    startTransition(() => setShowPopup(true));
    if (popupTimer.current) clearTimeout(popupTimer.current);
    popupTimer.current = setTimeout(() => setShowPopup(false), 3600);
  }, [lastObsId]);

  // Drive mix animation based on burette valve selection
  useEffect(() => {
    if (!store.isMixing || valvePosition === 0) {
      if (mixTimer.current) { clearInterval(mixTimer.current); mixTimer.current = null; }
      return;
    }
    let progress = store.mixProgress;
    // Speed: position 1 = 0.002 (slow drops), position 2 = 0.007 (fast drops), position 3 = 0.035 (stream)
    const increment = valvePosition === 1 ? 0.002 : valvePosition === 2 ? 0.0075 : 0.035;

    mixTimer.current = setInterval(() => {
      progress = Math.min(1.0, progress + increment);
      startTransition(() => store.updateMixProgressAction(progress));
      if (progress >= 1.0) {
        if (mixTimer.current) clearInterval(mixTimer.current);
        setValvePosition(0); // automatic stop at empty
      }
    }, 80);
    return () => { if (mixTimer.current) clearInterval(mixTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.isMixing, valvePosition]);


  const popup   = store.observations[0] ? obsToPopup(store.observations[0].type, store.observations[0].message) : null;
  const deltaT  = (store.currentTempC - store.initialTempC).toFixed(1);
  
  const acidName = store.acidType === "strong" ? "HCl" : "CH₃COOH";
  const baseName = store.baseType === "strong" ? "NaOH" : "NH₃";
  const saltName = (store.acidType === "strong" && store.baseType === "strong") ? "NaCl" 
                 : (store.acidType === "weak" && store.baseType === "strong") ? "CH₃COONa"
                 : (store.acidType === "strong" && store.baseType === "weak") ? "NH₄Cl"
                 : "CH₃COONH₄";

  const n_acid = (HCL_VOL / 1000) * store.acidConc;
  const n_base = (NAOH_VOL / 1000) * store.baseConc;
  const n_reacted = Math.min(n_acid, n_base);
  const saltMolarMass = (store.acidType === "strong" && store.baseType === "strong") ? 58.44
                      : (store.acidType === "weak" && store.baseType === "strong") ? 82.03
                      : (store.acidType === "strong" && store.baseType === "weak") ? 53.49
                      : 77.08;
  const saltMg  = store.saltFormed ? (n_reacted * saltMolarMass * 1000).toFixed(1) : "—";

  const controls = (
    <div className="space-y-4">
      {/* Configuration Section */}
      <div className="lab-ctrl-section">
        <div className="lab-ctrl-section-hdr">
          <span className="lab-ctrl-section-hdr-icon">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 4h12M2 8h12M2 12h12M4 2v4M12 6v4M7 10v4" strokeLinecap="round"/>
            </svg>
          </span>
          <span className="lab-ctrl-section-hdr-title">Titration Configuration</span>
        </div>
        <div className="p-3 space-y-3">
          {/* Acid Config */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Acid Solution</label>
            <div className="grid grid-cols-2 gap-1.5 mb-1.5">
              <button
                disabled={store.status !== "idle"}
                onClick={() => store.updateParametersAction({ acidType: "strong" })}
                className={`py-1 text-[11px] font-bold rounded-lg border transition-all ${
                  store.acidType === "strong"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-700"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                HCl (Strong)
              </button>
              <button
                disabled={store.status !== "idle"}
                onClick={() => store.updateParametersAction({ acidType: "weak" })}
                className={`py-1 text-[11px] font-bold rounded-lg border transition-all ${
                  store.acidType === "weak"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-700"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                CH₃COOH (Weak)
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-500">Acid Concentration:</span>
              <span className="font-bold text-slate-700">{store.acidConc.toFixed(2)} M</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="2.0"
              step="0.05"
              disabled={store.status !== "idle"}
              value={store.acidConc}
              onChange={(e) => store.updateParametersAction({ acidConc: parseFloat(e.target.value) })}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-50"
            />
          </div>

          {/* Base Config */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Base Solution</label>
            <div className="grid grid-cols-2 gap-1.5 mb-1.5">
              <button
                disabled={store.status !== "idle"}
                onClick={() => store.updateParametersAction({ baseType: "strong" })}
                className={`py-1 text-[11px] font-bold rounded-lg border transition-all ${
                  store.baseType === "strong"
                    ? "bg-green-500/10 border-green-500/30 text-green-700"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                NaOH (Strong)
              </button>
              <button
                disabled={store.status !== "idle"}
                onClick={() => store.updateParametersAction({ baseType: "weak" })}
                className={`py-1 text-[11px] font-bold rounded-lg border transition-all ${
                  store.baseType === "weak"
                    ? "bg-green-500/10 border-green-500/30 text-green-700"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                NH₃ (Weak)
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-500">Base Concentration:</span>
              <span className="font-bold text-slate-700">{store.baseConc.toFixed(2)} M</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="2.0"
              step="0.05"
              disabled={store.status !== "idle"}
              value={store.baseConc}
              onChange={(e) => store.updateParametersAction({ baseConc: parseFloat(e.target.value) })}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-500 disabled:opacity-50"
            />
          </div>

          {/* Indicator Select */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">pH Indicator</label>
            <select
              disabled={store.status !== "idle"}
              value={store.indicator}
              onChange={(e) => store.updateParametersAction({ indicator: e.target.value as "universal" | "phenolphthalein" | "bromothymol" | "methyl-orange" })}
              className="w-full px-2 py-1.5 text-xs rounded-md border border-slate-200 text-slate-600 focus:outline-none focus:border-emerald-500 bg-white disabled:opacity-50"
            >
              <option value="universal">Universal Indicator</option>
              <option value="phenolphthalein">Phenolphthalein</option>
              <option value="bromothymol">Bromothymol Blue</option>
              <option value="methyl-orange">Methyl Orange</option>
            </select>
          </div>

          {/* Insulation Toggle */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-medium text-slate-600">Insulation:</span>
            <button
              disabled={store.status !== "idle"}
              onClick={() => store.updateParametersAction({ beakerInsulated: !store.beakerInsulated })}
              className={`px-2 py-1 text-xs font-bold rounded-lg border transition-all ${
                store.beakerInsulated
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {store.beakerInsulated ? "Insulated (Calorimeter)" : "Open Glass Beaker"}
            </button>
          </div>
        </div>
      </div>

      {/* Step 1: Measure HCl */}
      <div className="lab-ctrl-section">
        <div className="lab-ctrl-section-hdr">
          <span className="lab-ctrl-section-hdr-icon">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M4 2v7L1 12h11L9 9V2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          <span className="lab-ctrl-section-hdr-title">Step 1 — Measure {acidName}</span>
        </div>
        <div className="p-2">
          <button
            disabled={store.currentStep !== "measure-hcl"}
            onClick={() => store.measureHClAction(HCL_VOL)}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: `linear-gradient(135deg, #f59e0b 0%, #d97706 100%)`, boxShadow: "0 4px 14px rgba(245,158,11,0.35)" }}
          >
            Measure {HCL_VOL} mL {acidName}
          </button>
          {store.hclVolumeMl > 0 && (
            <p className="text-[10px] mt-1.5 text-center" style={{ color: "#b45309" }}>
              ✓ {store.hclVolumeMl} mL {acidName} in beaker
            </p>
          )}
        </div>
      </div>

      {/* Step 2: Measure NaOH */}
      <div className="lab-ctrl-section">
        <div className="lab-ctrl-section-hdr">
          <span className="lab-ctrl-section-hdr-icon">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M4 2v7L1 12h11L9 9V2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          <span className="lab-ctrl-section-hdr-title">Step 2 — Measure {baseName}</span>
        </div>
        <div className="p-2">
          <button
            disabled={store.currentStep !== "measure-naoh"}
            onClick={() => store.measureNaOHAction(NAOH_VOL)}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: `linear-gradient(135deg, #22c55e 0%, #16a34a 100%)`, boxShadow: "0 4px 14px rgba(34,197,94,0.35)" }}
          >
            Measure {NAOH_VOL} mL {baseName}
          </button>
          {store.naohVolumeMl > 0 && (
            <p className="text-[10px] mt-1.5 text-center" style={{ color: "#166534" }}>
              ✓ {store.naohVolumeMl} mL {baseName} ready
            </p>
          )}
        </div>
      </div>

      {/* Step 3: Mix / Titrate */}
      <div className="lab-ctrl-section">
        <div className="lab-ctrl-section-hdr">
          <span className="lab-ctrl-section-hdr-icon">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 2v12M5 5h6M5 9h6M5 13h6" strokeLinecap="round"/>
            </svg>
          </span>
          <span className="lab-ctrl-section-hdr-title">Step 3 — Titration Controls</span>
        </div>
        <div className="p-2.5 space-y-2.5">
          {!isBuretteFilled && !isFillingBurette ? (
            <button
              disabled={store.currentStep !== "mix"}
              onClick={startFillingBurette}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: `linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)`, boxShadow: "0 4px 12px rgba(59,130,246,0.3)" }}
            >
              Fill Burette with {baseName}
            </button>
          ) : isFillingBurette ? (
            <div className="w-full py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-center text-xs font-bold text-slate-500 animate-pulse">
              Filling Burette... {Math.round(fillProgress * 100)}%
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Burette Valve Control</span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { pos: 0, label: "Closed (0%)", bg: "bg-slate-700 text-white border-slate-700" },
                  { pos: 1, label: "Slow Drops", bg: "bg-emerald-600 text-white border-emerald-600" },
                  { pos: 2, label: "Fast Drops", bg: "bg-amber-600 text-white border-amber-600" },
                  { pos: 3, label: "Stream (100%)", bg: "bg-rose-600 text-white border-rose-600" },
                ].map((btn) => (
                  <button
                    key={btn.pos}
                    onClick={() => setValvePosition(btn.pos)}
                    className={`py-1.5 px-1 text-[11px] font-bold rounded-lg border transition-all ${
                      valvePosition === btn.pos
                        ? `${btn.bg} shadow-sm`
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
              <div className="text-[9.5px] text-slate-400 text-center italic mt-1 leading-snug">
                {valvePosition === 0 ? "Titration paused. Open valve to start dripping." :
                 valvePosition === 1 ? "Slow dropwise flow. Watch for endpoint flashes." :
                 valvePosition === 2 ? "Fast dropwise flow. Near neutral point, slow down!" :
                 "Continuous stream of NaOH. High risk of overshooting the equivalence point!"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 4 & 5 */}
      {(store.currentStep === "observe" || store.currentStep === "record") && (
        <div className="lab-ctrl-section">
          <div className="lab-ctrl-section-hdr">
            <span className="lab-ctrl-section-hdr-icon">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 7l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <span className="lab-ctrl-section-hdr-title">Step 4 — Record Observations</span>
          </div>
          <div className="p-2 space-y-2">
            {store.currentStep === "observe" && (
              <button
                onClick={() => store.recordObservationsAction()}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
                style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", boxShadow: "0 4px 14px rgba(249,115,22,0.35)" }}
              >
                Record Temperature & pH
              </button>
            )}
            {store.currentStep === "record" && store.status !== "completed" && (
              <button
                onClick={() => store.completeAction()}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
                style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", boxShadow: "0 4px 14px rgba(59,130,246,0.35)" }}
              >
                Complete Experiment ✓
              </button>
            )}
          </div>
        </div>
      )}

      {/* Observations display */}
      <div className="rounded-xl p-3" style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}20` }}>
        <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: ACCENT }}>Live Readings</p>
        <div className="space-y-1.5">
          {[
            { label: "Initial T", value: `${store.initialTempC.toFixed(1)}°C` },
            { label: "Current T", value: `${store.currentTempC.toFixed(1)}°C`, hot: store.currentTempC > store.initialTempC + 0.5 },
            { label: "ΔT",        value: `+${deltaT}°C`,                       hot: parseFloat(deltaT) > 0.5 },
            { label: "Current pH", value: store.hclVolumeMl > 0 ? store.currentPh.toFixed(2) : "—" },
            { label: `${saltName} formed`, value: store.saltFormed ? `${saltMg} mg` : "—" },
          ].map(({ label, value, hot }) => (
            <div key={label} className="flex justify-between text-[10.5px]">
              <span style={{ color: "var(--lab-text-muted)" }}>{label}</span>
              <span style={{ color: hot ? "#ef4444" : "var(--lab-text-secondary)", fontWeight: 700 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {store.status === "completed" && (
        <button onClick={handleReset}
          className="w-full py-2 rounded-xl text-[12px] font-semibold border transition-all duration-150 hover:bg-slate-50"
          style={{ borderColor: "var(--lab-glass-border)", color: "var(--lab-text-muted)" }}>
          Reset Lab
        </button>
      )}
    </div>
  );

  const leftPanel = (
    <LabContextPanel
      title="Neutralisation Reaction"
      accent={ACCENT}
      summary={`Combine solution of an acid (${acidName}) and a base (${baseName}). The exothermic neutralisation reaction produces water and a dissolved salt (${saltName}), releasing thermal energy.`}
      formula={`${acidName}(aq) + ${baseName}(aq) → ${saltName}(aq) + H₂O(l)`}
      formulaLabel="Neutralisation equation"
      facts={[
        { icon: "🧪", label: `${acidName} volume`,  value: `${HCL_VOL} mL, ${store.acidConc.toFixed(2)} M` },
        { icon: "⚗️", label: `${baseName} volume`, value: `${NAOH_VOL} mL, ${store.baseConc.toFixed(2)} M` },
        { icon: "🌡️", label: "Heat released", value: store.acidType === "strong" && store.baseType === "strong" ? "~55.8 kJ/mol" : "~51.5 kJ/mol" },
        { icon: "🧂", label: "Product Salt", value: saltName },
      ]}
      steps={[
        { number: 1, title: `Measure ${acidName}`, body: `Measure 25 mL of ${store.acidConc.toFixed(2)} M ${acidName} in beaker.` },
        { number: 2, title: `Measure ${baseName}`, body: `Measure 25 mL of ${store.baseConc.toFixed(2)} M ${baseName} in cylinder.` },
        { number: 3, title: "Mix & observe", body: "Pour base into acid. Observe temperature changes and indicator transitions." },
        { number: 4, title: "Record results", body: "Note temperature rise and final pH." },
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
            { label: "Step", value: store.currentStep.replace("-", " ") },
            { label: "T (current)", value: `${store.currentTempC.toFixed(1)}°C` },
            { label: "ΔT", value: `+${deltaT}°C` },
            ...(store.saltFormed ? [{ label: "NaCl formed", value: "✓" }] : []),
          ]}
        />
      }
      workspace={
        <NeutralizationWorkspace
          state={store}
          valvePosition={valvePosition}
          isFillingBurette={isFillingBurette}
          fillProgress={fillProgress}
          isBuretteFilled={isBuretteFilled}
        />
      }
      education={EXPERIMENT_EDUCATION.neutralization}
      reactionNote={
        store.reactionDone
          ? "HCl + NaOH → NaCl + H₂O · Reaction complete · Salt formed in solution"
          : store.isMixing
          ? `HCl + NaOH → NaCl + H₂O · Mixing… T = ${store.currentTempC.toFixed(1)}°C`
          : "Measure HCl and NaOH, then combine them to observe the neutralisation."
      }
      controls={controls}
      stepGuide={<StepGuide steps={store.steps} objectives={store.objectives} />}
      mode={store.mode}
      onSetMode={store.setMode}
      observations={<ObservationPanel observations={store.observations} />}
      obsNotif={
        popup ? (
          <ContextPopup visible={showPopup} what={popup.what} why={popup.why} kind={popup.kind} />
        ) : null
      }
      resultModal={
        <ResultModal
          result={store.result}
          onReset={handleReset}
          nextHref="/experiments/salt-analysis"
          nextLabel="Next: Salt Analysis →"
          observations={store.observations}
          experimentKey="neutralization"
        />
      }
    />
  );
}
