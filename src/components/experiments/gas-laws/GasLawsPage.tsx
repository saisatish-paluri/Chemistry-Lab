"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useGasLawsStore }                               from "@/lib/store/gas-laws-store";
import GasLawsWorkspace                                  from "./GasLawsWorkspace";
import GasLawsControls                                   from "./GasLawsControls";
import StepGuide                                         from "@/components/lab/StepGuide";
import ObservationPanel                                  from "@/components/lab/ObservationPanel";
import StatusBar                                         from "@/components/lab/StatusBar";
import ResultModal                                       from "@/components/lab/ResultModal";
import ContextPopup, { obsToPopup }                      from "@/components/lab/ContextPopup";
import LabPageShell                                      from "@/components/lab/LabPageShell";
import { GAS_N_MOLES, GAS_R }                            from "@/lib/engine/gas-laws-engine";

export default function GasLawsPage() {
  const [mounted, setMounted]     = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const store      = useGasLawsStore();
  const popupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    store.hydrate();
    startTransition(() => setMounted(true));
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

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  const lawLabel = store.law === "boyle" ? "Boyle's Law" : store.law === "charles" ? "Charles's Law" : null;
  const lastObs  = store.observations[0];
  const popup    = lastObs ? obsToPopup(lastObs.type, lastObs.message) : null;

  const constantsCard = store.law ? (
    <div
      className="rounded-xl p-4 text-xs"
      style={{
        background: "var(--lab-glass-heavy)",
        border:     "1px solid var(--lab-glass-border)",
        boxShadow:  "var(--lab-shadow-sm)",
      }}
    >
      <p className="font-semibold text-sm mb-2" style={{ color: "var(--lab-blue-600)" }}>
        {lawLabel} — Ideal Gas Law
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[9px] mb-1.5" style={{ color: "var(--lab-text-subtle)" }}>FIXED CONSTANTS</p>
          {[
            { k: "n (moles)", v: `${GAS_N_MOLES} mol` },
            { k: "R (gas constant)", v: `${GAS_R} L·atm/mol·K` },
            {
              k: store.law === "boyle" ? "T (temperature)" : "P (pressure)",
              v: store.law === "boyle"
                ? `${store.referenceTemp} K (${store.referenceTemp - 273} °C)`
                : `${store.referencePressure} atm`,
            },
          ].map(({ k, v }) => (
            <div key={k} className="flex justify-between items-center py-0.5">
              <span style={{ color: "var(--lab-text-muted)" }}>{k}</span>
              <span className="font-mono font-semibold" style={{ color: "var(--lab-text-secondary)" }}>{v}</span>
            </div>
          ))}
        </div>
        <div>
          <p className="text-[9px] mb-1.5" style={{ color: "var(--lab-text-subtle)" }}>CURRENT READING</p>
          {[
            { k: "Volume",   v: `${store.volume.toFixed(3)} L` },
            { k: "Pressure", v: `${store.pressure.toFixed(3)} atm` },
            {
              k: store.law === "boyle" ? "PV (constant)" : "V/T (constant)",
              v: store.law === "boyle"
                ? `${(store.pressure * store.volume).toFixed(4)} L·atm`
                : `${(store.volume / store.temperature).toFixed(6)} L/K`,
            },
          ].map(({ k, v }) => (
            <div key={k} className="flex justify-between items-center py-0.5">
              <span style={{ color: "var(--lab-text-muted)" }}>{k}</span>
              <span className="font-mono font-semibold" style={{ color: "var(--lab-blue-600)" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ) : undefined;

  return (
    <LabPageShell
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
      workspaceMaxW="max-w-2xl"

      centerBottom={constantsCard}

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
