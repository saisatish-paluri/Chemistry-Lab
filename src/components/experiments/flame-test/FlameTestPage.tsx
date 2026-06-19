"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useFlameTestStore }                             from "@/lib/store/flame-test-store";
import FlameTestWorkspace                                from "./FlameTestWorkspace";
import FlameTestControls                                 from "./FlameTestControls";
import StepGuide                                         from "@/components/lab/StepGuide";
import ObservationPanel                                  from "@/components/lab/ObservationPanel";
import StatusBar                                         from "@/components/lab/StatusBar";
import ResultModal                                       from "@/components/lab/ResultModal";
import ContextPopup, { obsToPopup }                      from "@/components/lab/ContextPopup";
import LabPageShell                                      from "@/components/lab/LabPageShell";
import LabContextPanel                                   from "@/components/lab/LabContextPanel";
import { FLAME_SAMPLES }                                 from "@/lib/engine/flame-test-engine";
import { EXPERIMENT_EDUCATION }                          from "@/lib/experiment-education";

const TEST_DURATION_MS = 3500;

export default function FlameTestPage() {
  const [showPopup, setShowPopup] = useState(false);
  const store      = useFlameTestStore();
  const testTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    store.hydrate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (store.status === "running") {
      testTimer.current = setTimeout(() => store.completeTestAction(), TEST_DURATION_MS);
    } else {
      if (testTimer.current) { clearTimeout(testTimer.current); testTimer.current = null; }
    }
    return () => { if (testTimer.current) { clearTimeout(testTimer.current); testTimer.current = null; } };
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


  const profile = store.selectedSample ? FLAME_SAMPLES[store.selectedSample] : null;
  const lastObs = store.observations[0];
  const popup   = lastObs ? obsToPopup(lastObs.type, lastObs.message) : null;

  const infoCards = profile ? (
    <>
      {store.status === "running" && (
        <div
          className="rounded-xl p-4 text-center text-xs"
          style={{
            background: `${profile.flameColor}12`,
            border:     `1px solid ${profile.flameColor}55`,
            boxShadow:  `0 0 20px ${profile.flameColor}22`,
          }}
        >
          <p className="text-sm font-bold mb-1" style={{ color: profile.flameColor }}>
            {profile.colorName} Flame
          </p>
          <p style={{ color: "var(--lab-text-muted)" }}>
            {profile.ion} electrons transitioning from excited → ground state
          </p>
          <p className="mt-1 font-mono text-[10px]" style={{ color: "var(--lab-text-subtle)" }}>
            λ = {profile.wavelength}
          </p>
        </div>
      )}

      {store.status !== "running" && store.testHistory.length > 0 && (
        <div
          className="rounded-xl p-4 text-xs"
          style={{
            background: "var(--lab-glass-heavy)",
            border:     `1px solid ${profile.flameColor}44`,
            boxShadow:  "var(--lab-shadow-sm)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full flex-shrink-0" style={{ background: profile.flameColor }} />
            <p className="font-semibold text-sm" style={{ color: "var(--lab-blue-600)" }}>
              {profile.name} — {profile.colorName}
            </p>
            <span
              className="ml-auto px-2 py-0.5 rounded text-[9px] font-semibold"
              style={{
                background: `${profile.flameColor}22`,
                color:      "var(--lab-text-secondary)",
                border:     `1px solid ${profile.flameColor}55`,
              }}
            >
              {profile.wavelength}
            </span>
          </div>
          <p style={{ color: "var(--lab-text-muted)", lineHeight: 1.6 }}>{profile.explanation}</p>
        </div>
      )}
    </>
  ) : undefined;

  const flameLeftPanel = (
    <LabContextPanel
      title="Flame Test"
      accent="#ef4444"
      summary="Metal ions emit characteristic flame colours when electrons jump to excited states and return to ground state, releasing photons of specific wavelengths."
      formula="M⁺ → M⁺* → M⁺ + hν"
      formulaLabel="Electron transition"
      facts={[
        { icon: "🔥", label: "Bunsen flame", value: "~1700 °C" },
        { icon: "🎨", label: "Na⁺",          value: "Golden Yellow (~589 nm)" },
        { icon: "🎨", label: "Li⁺",          value: "Crimson Red (~670 nm)" },
        { icon: "🎨", label: "K⁺",           value: "Lilac/Violet (~767 nm)" },
      ]}
      steps={[
        { number: 1, title: "Light burner",   body: "Click 'Light Bunsen Burner' to reach ~1700 °C." },
        { number: 2, title: "Select sample",  body: "Pick a metal salt from the controls panel." },
        { number: 3, title: "Dip the loop",   body: "Click 'Dip Loop' to coat the nichrome wire." },
        { number: 4, title: "Test in flame",  body: "Hold loop in flame — observe the colour produced." },
        { number: 5, title: "Clean & repeat", body: "Clean loop in distilled water between tests to avoid contamination." },
      ]}
    />
  );

  return (
    <LabPageShell
      leftPanel={flameLeftPanel}
      statusBar={
        <StatusBar
          status={store.status}
          error={store.lastError}
          metrics={[
            { label: "Tests",  value: `${store.testHistory.length}` },
            { label: "Burner", value: store.flameLit ? "Lit" : "Off" },
            ...(profile ? [{ label: "Sample", value: profile.formula }] : []),
            ...(store.currentFlameColor ? [{ label: "Colour", value: profile?.colorName ?? "—" }] : []),
          ]}
        />
      }

      workspace={
        <FlameTestWorkspace
          flameLit={store.flameLit}
          selectedSample={store.selectedSample}
          loopDipped={store.loopDipped}
          loopClean={store.loopClean}
          testInProgress={store.status === "running"}
          currentFlameColor={store.currentFlameColor}
          contaminated={store.contaminated}
          testHistory={store.testHistory}
          concentration={store.concentration}
          airCollarOpen={store.airCollarOpen}
          contaminationLevel={store.contaminationLevel}
          cobaltGlass={store.cobaltGlass}
          flameIntensity={store.flameIntensity}
          onLightBurner={store.lightBurnerAction}
          onSelectSample={store.selectSampleAction}
          onDipLoop={store.dipLoopAction}
          onPerformTest={store.performTestAction}
          onCleanLoop={store.cleanLoopAction}
        />
      }
      education={EXPERIMENT_EDUCATION["flame-test"]}
      reactionNote={
        store.selectedSample && store.status === "running"
          ? `${FLAME_SAMPLES[store.selectedSample].name} → ${FLAME_SAMPLES[store.selectedSample].colorName} (${FLAME_SAMPLES[store.selectedSample].wavelength}) — excited ${FLAME_SAMPLES[store.selectedSample].ion} electrons emit characteristic photons.`
          : store.flameLit && store.loopDipped
            ? "Loop dipped — hold it in the hottest part of the flame and note the colour."
            : store.flameLit
              ? "Flame lit — select a sample and dip the nichrome loop."
              : "Light the Bunsen burner, then select a metal salt to test."
      }

      controls={
        <FlameTestControls
          status={store.status}
          flameLit={store.flameLit}
          selectedSample={store.selectedSample}
          loopDipped={store.loopDipped}
          loopClean={store.loopClean}
          contaminated={store.contaminated}
          testHistory={store.testHistory}
          concentration={store.concentration}
          airCollarOpen={store.airCollarOpen}
          contaminationLevel={store.contaminationLevel}
          cobaltGlass={store.cobaltGlass}
          onLightBurner={store.lightBurnerAction}
          onSelectSample={store.selectSampleAction}
          onDipLoop={store.dipLoopAction}
          onPerformTest={store.performTestAction}
          onCleanLoop={store.cleanLoopAction}
          onComplete={store.completeExperimentAction}
          onReset={store.resetAction}
          onUpdateParameters={store.updateParametersAction}
        />
      }

      stepGuide={<StepGuide steps={store.steps} objectives={store.objectives} />}
      mode={store.mode}
      onSetMode={store.setMode}

      infoCards={infoCards}
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
          nextHref="/experiments/solubility"
          nextLabel="Next: Solubility →"
          observations={store.observations}
          experimentKey="flame-test"
        />
      }
    />
  );
}
