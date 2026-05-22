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
import PreLabIntro                                       from "@/components/lab/PreLabIntro";
import LabPageShell                                      from "@/components/lab/LabPageShell";
import { FLAME_SAMPLES }                                 from "@/lib/engine/flame-test-engine";

const FLAME_TEST_INTRO = {
  title:     "Flame Test",
  objective: "Identify metal ions by the characteristic colours they emit when heated in a Bunsen burner flame. Dip the nichrome loop in a salt solution, then hold the loop in the flame and observe the emission colour.",
  apparatus: ["Bunsen Burner", "Nichrome Wire Loop", "Sample Vials (×7)", "Dilute HCl (cleaning)", "Eye Protection"],
  reagents: [
    { name: "LiCl — Lithium chloride",    concentration: "crimson red flame" },
    { name: "NaCl — Sodium chloride",     concentration: "persistent yellow flame" },
    { name: "KCl — Potassium chloride",   concentration: "lilac / violet flame" },
    { name: "CaCl₂ — Calcium chloride",   concentration: "brick red / orange-red flame" },
    { name: "SrCl₂ — Strontium chloride", concentration: "crimson / scarlet flame" },
    { name: "BaCl₂ — Barium chloride",    concentration: "pale green / apple green flame" },
    { name: "CuSO₄ — Copper sulphate",    concentration: "blue-green flame" },
  ],
  safetyNotes: [
    "Keep flammable materials away from the Bunsen burner flame.",
    "Clean the nichrome loop with dilute HCl between each sample to avoid contamination.",
    "Wear eye protection when observing flame colours.",
    "Never leave the Bunsen burner unattended.",
  ],
};

const TEST_DURATION_MS = 3500;

export default function FlameTestPage() {
  const [mounted, setMounted]     = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const store      = useFlameTestStore();
  const testTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    store.hydrate();
    startTransition(() => setMounted(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (store.status === "running") {
      testTimer.current = setTimeout(() => store.completeTestAction(), TEST_DURATION_MS);
    } else {
      if (testTimer.current) { clearTimeout(testTimer.current); testTimer.current = null; }
    }
    return () => { if (testTimer.current) { clearTimeout(testTimer.current); testTimer.current = null; } };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.status, mounted]);

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

  return (
    <LabPageShell
      preLabIntro={<PreLabIntro {...FLAME_TEST_INTRO} />}

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
        />
      }
      workspaceMaxW="max-w-md"

      controls={
        <FlameTestControls
          status={store.status}
          flameLit={store.flameLit}
          selectedSample={store.selectedSample}
          loopDipped={store.loopDipped}
          loopClean={store.loopClean}
          contaminated={store.contaminated}
          testHistory={store.testHistory}
          onLightBurner={store.lightBurnerAction}
          onSelectSample={store.selectSampleAction}
          onDipLoop={store.dipLoopAction}
          onPerformTest={store.performTestAction}
          onCleanLoop={store.cleanLoopAction}
          onComplete={store.completeExperimentAction}
          onReset={store.resetAction}
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
