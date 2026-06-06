"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useGasLawsStore }                               from "@/lib/store/gas-laws-store";
import GasLawsWorkspace, { DataGraph }                   from "./GasLawsWorkspace";
import GasLawsControls                                   from "./GasLawsControls";
import StepGuide                                         from "@/components/lab/StepGuide";
import ObservationPanel                                  from "@/components/lab/ObservationPanel";
import StatusBar                                         from "@/components/lab/StatusBar";
import ResultModal                                       from "@/components/lab/ResultModal";
import ContextPopup, { obsToPopup }                      from "@/components/lab/ContextPopup";
import LabPageShell                                      from "@/components/lab/LabPageShell";
import LabContextPanel                                   from "@/components/lab/LabContextPanel";
import { GAS_N_MOLES, GAS_R }                            from "@/lib/engine/gas-laws-engine";
import { EXPERIMENT_EDUCATION }                          from "@/lib/experiment-education";

export default function GasLawsPage() {
  const [showPopup, setShowPopup] = useState(false);
  const store      = useGasLawsStore();
  const popupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    store.hydrate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => { if (popupTimer.current) clearTimeout(popupTimer.current); }, []);

  const lastObsId = store.observations[0]?.id;
  useEffect(() => {
    if (!lastObsId) return;
    startTransition(() => setShowPopup(true));
    if (popupTimer.current) clearTimeout(popupTimer.current);
    popupTimer.current = setTimeout(() => setShowPopup(false), 3200);
  }, [lastObsId]);


  const lawLabel = store.law === "boyle" ? "Boyle's Law" : store.law === "charles" ? "Charles's Law" : null;
  const lastObs  = store.observations[0];
  const popup    = lastObs ? obsToPopup(lastObs.type, lastObs.message) : null;

  // Graph + constants combined in one centerBottom panel
  const centerBottom = store.law ? (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", height: "100%" }}>
      {/* Graph header */}
      <div className="flex items-center justify-between" style={{ flexShrink: 0 }}>
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--lab-blue-600)" }}>
          {store.law === "boyle" ? "P–V Relationship" : "V–T Relationship"}
        </p>
        <span
          className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: "rgba(37,99,235,0.08)",
            color: "var(--lab-blue-600)",
            border: "1px solid rgba(37,99,235,0.18)",
          }}
        >
          {store.dataPoints.length} point{store.dataPoints.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* The actual graph */}
      <div style={{ flexShrink: 0 }}>
        <DataGraph law={store.law} dataPoints={store.dataPoints} />
      </div>

      {/* Constants table */}
      <div
        className="rounded-xl p-3 text-xs"
        style={{
          background:  "rgba(255,255,255,0.80)",
          border:      "1px solid var(--lab-glass-border)",
          flexShrink:  0,
        }}
      >
        <p className="font-bold text-[10px] uppercase tracking-wide mb-2" style={{ color: "var(--lab-blue-600)" }}>
          {lawLabel} — Fixed Constants
        </p>
        <div className="space-y-1">
          {[
            { k: "n", v: `${GAS_N_MOLES} mol` },
            { k: "R", v: `${GAS_R} L·atm/mol·K` },
            {
              k: store.law === "boyle" ? "T (constant)" : "P (constant)",
              v: store.law === "boyle"
                ? `${store.referenceTemp} K`
                : `${store.referencePressure} atm`,
            },
          ].map(({ k, v }) => (
            <div key={k} className="flex justify-between items-center">
              <span style={{ color: "var(--lab-text-muted)", fontWeight: 500 }}>{k}</span>
              <span className="font-mono font-bold text-[10px]" style={{ color: "var(--lab-text-secondary)" }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Live reading divider */}
        <div className="mt-2 pt-2" style={{ borderTop: "1px solid var(--lab-glass-border)" }}>
          <p className="font-bold text-[10px] uppercase tracking-wide mb-1.5" style={{ color: "var(--lab-text-muted)" }}>
            Current Reading
          </p>
          {[
            { k: "Volume",   v: `${store.volume.toFixed(3)} L` },
            { k: "Pressure", v: `${store.pressure.toFixed(3)} atm` },
            {
              k: store.law === "boyle" ? "PV product" : "V/T ratio",
              v: store.law === "boyle"
                ? `${(store.pressure * store.volume).toFixed(4)}`
                : `${(store.volume / store.temperature).toFixed(6)}`,
            },
          ].map(({ k, v }) => (
            <div key={k} className="flex justify-between items-center">
              <span style={{ color: "var(--lab-text-muted)", fontWeight: 500 }}>{k}</span>
              <span className="font-mono font-bold text-[10px]" style={{ color: "var(--lab-blue-600)" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ) : undefined;

  const gasLawsLeftPanel = (
    <LabContextPanel
      title="Gas Laws"
      accent="#db2777"
      summary="Explore how pressure, volume, and temperature of a fixed gas sample relate. Record data points to plot the characteristic curves."
      formula="PV = nRT"
      formulaLabel="Ideal Gas Equation"
      facts={[
        { icon: "🔬", label: "Gas amount",   value: `${GAS_N_MOLES} mol`      },
        { icon: "📐", label: "Gas constant", value: `${GAS_R} L·atm/mol·K` },
        { icon: "🌡️", label: "Temp range",   value: "100–500 K"               },
        { icon: "📊", label: "Pressure",     value: "0.1–5.0 atm"             },
      ]}
      steps={[
        { number: 1, title: "Select a law",       body: "Choose Boyle's (constant T) or Charles's (constant P) from Controls." },
        { number: 2, title: "Adjust the variable", body: "Move the slider to change pressure or temperature." },
        { number: 3, title: "Record a data point", body: "Click Record Point — each dot plots on the graph." },
        { number: 4, title: "Complete the curve",  body: "Record ≥ 5 points to see the hyperbolic P–V or linear V–T curve." },
      ]}
    />
  );

  return (
    <LabPageShell
      leftPanel={gasLawsLeftPanel}
      statusBar={
        <StatusBar
          status={store.status}
          error={store.lastError}
          metrics={[
            ...(lawLabel ? [{ label: "Law", value: lawLabel }] : []),
            { label: "n", value: `${GAS_N_MOLES} mol` },
            { label: "T", value: `${store.temperature} K` },
            { label: "V", value: `${store.volume.toFixed(2)} L` },
            { label: "P", value: `${store.pressure.toFixed(3)} atm` },
            ...(store.dataPoints.length > 0 ? [{ label: "Points", value: `${store.dataPoints.length}` }] : []),
          ]}
        />
      }

      workspace={
        <GasLawsWorkspace
          law={store.law}
          temperature={store.temperature}
          volume={store.volume}
          pressure={store.pressure}
          dataPoints={store.dataPoints}
          isRunning={store.status === "running"}
        />
      }

      education={EXPERIMENT_EDUCATION["gas-laws"]}

      reactionNote={
        store.law === "boyle"
          ? `Boyle's Law (T = ${store.temperature} K): P × V = ${(store.pressure * store.volume).toFixed(2)} L·atm — record ≥ 5 points to plot the curve.`
          : store.law === "charles"
          ? `Charles's Law (P = ${store.pressure.toFixed(2)} atm): V/T = ${(store.volume / store.temperature).toFixed(4)} L/K — record points for the linear relationship.`
          : "Select Boyle's Law or Charles's Law, then record data points to build the graph."
      }

      centerBottom={centerBottom}

      controls={
        <GasLawsControls
          status={store.status}
          law={store.law}
          temperature={store.temperature}
          volume={store.volume}
          pressure={store.pressure}
          dataPoints={store.dataPoints}
          onSelectLaw={store.selectLawAction}
          onStartExp={store.startExplorationAction}
          onSetVolume={store.setVolumeAction}
          onSetTemp={store.setTemperatureAction}
          onRecordPoint={store.recordDataPointAction}
          onComplete={store.completeExperimentAction}
          onReset={store.resetAction}
        />
      }

      stepGuide={store.steps.length > 0 ? <StepGuide steps={store.steps} objectives={store.objectives} /> : undefined}
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
          nextHref="/experiments/titration"
          nextLabel="← Back: Titration"
          observations={store.observations}
          experimentKey="gas-laws"
        />
      }
    />
  );
}
