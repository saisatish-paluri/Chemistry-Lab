"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useReactionRateStore }                          from "@/lib/store/reaction-rate-store";
import ReactionRateWorkspace                             from "./ReactionRateWorkspace";
import ReactionRateControls                              from "./ReactionRateControls";
import StepGuide                                         from "@/components/lab/StepGuide";
import ObservationPanel                                  from "@/components/lab/ObservationPanel";
import StatusBar                                         from "@/components/lab/StatusBar";
import ResultModal                                       from "@/components/lab/ResultModal";
import ContextPopup, { obsToPopup }                      from "@/components/lab/ContextPopup";
import LabPageShell                                      from "@/components/lab/LabPageShell";
import LabContextPanel                                   from "@/components/lab/LabContextPanel";
import { SURFACE_AREA_LABELS }                           from "@/lib/engine/reaction-rate-engine";
import { EXPERIMENT_EDUCATION }                          from "@/lib/experiment-education";

export default function ReactionRatePage() {
  const [showPopup, setShowPopup] = useState(false);
  const store      = useReactionRateStore();
  const tickRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const popupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    store.hydrate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (store.status === "running") {
      tickRef.current = setInterval(() => store.tickAction(1), 1000);
    } else {
      if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    }
    return () => { if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; } };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.status]);

  useEffect(() => () => { if (popupTimer.current) clearTimeout(popupTimer.current); }, []);

  const lastObsId = store.observations[0]?.id;
  useEffect(() => {
    if (!lastObsId) return;
    startTransition(() => setShowPopup(true));
    if (popupTimer.current) clearTimeout(popupTimer.current);
    popupTimer.current = setTimeout(() => setShowPopup(false), 3200);
  }, [lastObsId]);


  const lastObs = store.observations[0];
  const popup   = lastObs ? obsToPopup(lastObs.type, lastObs.message) : null;

  const rateFactorCard = (
    <div
      className="rounded-xl p-4 text-xs"
      style={{
        background: "var(--lab-glass-heavy)",
        border:     "1px solid var(--lab-glass-border)",
        boxShadow:  "var(--lab-shadow-sm)",
      }}
    >
      <p className="font-semibold text-sm mb-3" style={{ color: "var(--lab-blue-600)" }}>
        Rate Factor Breakdown
      </p>
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label:  "Temperature",
            value:  `${store.temperature} °C`,
            factor: Math.pow(2, (store.temperature - 25) / 10),
            color:  "#ef4444",
            note:   "Doubles per 10°C rise",
          },
          {
            label:  "Concentration",
            value:  `${store.concentration.toFixed(1)} M`,
            factor: store.concentration / 0.5,
            color:  "#3b82f6",
            note:   "Linear proportionality",
          },
          {
            label:  "Surface Area",
            value:  SURFACE_AREA_LABELS[store.surfaceArea],
            factor: ({ solid: 1.0, chips: 1.8, granules: 3.5, powder: 7.0 } as Record<string, number>)[store.surfaceArea],
            color:  "#22c55e",
            note:   "More surface = faster",
          },
        ].map(({ label, value, factor, color, note }) => (
          <div
            key={label}
            className="flex flex-col items-center text-center p-2 rounded-lg"
            style={{ background: `${color}0d`, border: `1px solid ${color}22` }}
          >
            <span className="text-[9px] mb-1 font-semibold uppercase tracking-wider" style={{ color }}>
              {label}
            </span>
            <span className="font-bold text-sm" style={{ color: "var(--lab-text-primary)" }}>{value}</span>
            <span className="text-lg font-black my-0.5" style={{ color }}>×{factor.toFixed(2)}</span>
            <span className="text-[8px]" style={{ color: "var(--lab-text-subtle)" }}>{note}</span>
          </div>
        ))}
      </div>
      <div
        className="mt-3 flex items-center justify-center gap-2 pt-2"
        style={{ borderTop: "1px solid var(--lab-glass-border)" }}
      >
        <span style={{ color: "var(--lab-text-muted)" }}>Combined:</span>
        <span className="text-lg font-black" style={{ color: "var(--lab-blue-600)" }}>
          ×{store.rateMultiplier.toFixed(2)}
        </span>
        <span className="text-[10px]" style={{ color: "var(--lab-text-subtle)" }}>
          (~{(100 / (1.5 * store.rateMultiplier)).toFixed(0)} s to complete)
        </span>
      </div>
    </div>
  );

  const rateLeftPanel = (
    <LabContextPanel
      title="Reaction Rate"
      accent="#f59e0b"
      summary="Three factors control how fast reactant molecules collide and overcome the activation energy barrier."
      formula="k = A · e^(−Ea/RT)"
      formulaLabel="Arrhenius equation"
      facts={[
        { icon: "🌡️", label: "Temperature",   value: "Rate doubles per 10 °C rise" },
        { icon: "🧪", label: "Concentration", value: "Rate ∝ [reactant]" },
        { icon: "📐", label: "Surface area",  value: "Powder fastest, solid slowest" },
        { icon: "⚗️", label: "Reaction",      value: "CaCO₃ + 2HCl → CO₂↑ + …" },
      ]}
      steps={[
        { number: 1, title: "Set temperature",   body: "Use the slider to set temperature (25–80 °C). Higher T = more energetic collisions." },
        { number: 2, title: "Set concentration", body: "Adjust [HCl] (0.1–2.0 M). Higher concentration = more frequent collisions." },
        { number: 3, title: "Set surface area",  body: "Choose from solid lump, chips, granules, or powder." },
        { number: 4, title: "Run reaction",      body: "Click Start to observe CO₂ gas evolution rate. Monitor the rate factor display." },
      ]}
    />
  );

  return (
    <LabPageShell
      leftPanel={rateLeftPanel}
      statusBar={
        <StatusBar
          status={store.status}
          error={store.lastError}
          metrics={[
            { label: "Rate ×",   value: store.rateMultiplier.toFixed(2) },
            { label: "Progress", value: `${store.progress.toFixed(1)}%` },
            { label: "Time",     value: `${store.timeElapsed.toFixed(0)} s` },
            { label: "T",        value: `${store.temperature} °C` },
            { label: "[C]",      value: `${store.concentration.toFixed(1)} M` },
            { label: "SA",       value: SURFACE_AREA_LABELS[store.surfaceArea] },
          ]}
        />
      }

      workspace={
        <ReactionRateWorkspace
          temperature={store.temperature}
          concentration={store.concentration}
          surfaceArea={store.surfaceArea}
          rateMultiplier={store.rateMultiplier}
          progress={store.progress}
          isRunning={store.status === "running"}
          catalystAdded={store.catalystAdded}
        />
      }
      education={EXPERIMENT_EDUCATION["reaction-rate"]}
      reactionNote={
        store.status === "running"
          ? `Rate × ${store.rateMultiplier.toFixed(1)} vs baseline · T = ${store.temperature} °C · ${store.concentration.toFixed(1)}× conc · ${SURFACE_AREA_LABELS[store.surfaceArea]}`
          : "Set temperature, concentration, and surface area, then run to observe collision theory in action."
      }

      centerBottom={rateFactorCard}

      controls={
        <ReactionRateControls
          status={store.status}
          temperature={store.temperature}
          concentration={store.concentration}
          surfaceArea={store.surfaceArea}
          rateMultiplier={store.rateMultiplier}
          progress={store.progress}
          onSetTemp={store.setTemperatureAction}
          onSetConc={store.setConcentrationAction}
          onSetSurface={store.setSurfaceAreaAction}
          onStart={store.startAction}
          onStop={store.stopAction}
          onResetRun={store.resetRunAction}
          onReset={store.resetAction}
        />
      }

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
          onReset={store.resetAction}
          nextHref="/experiments/gas-laws"
          nextLabel="Next: Gas Laws →"
          observations={store.observations}
          experimentKey="reaction-rate"
        />
      }
    />
  );
}
