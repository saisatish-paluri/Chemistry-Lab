"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useSolubilityStore }                            from "@/lib/store/solubility-store";
import SolubilityWorkspace                               from "./SolubilityWorkspace";
import SolubilityControls                                from "./SolubilityControls";
import StepGuide                                         from "@/components/lab/StepGuide";
import ObservationPanel                                  from "@/components/lab/ObservationPanel";
import StatusBar                                         from "@/components/lab/StatusBar";
import ResultModal                                       from "@/components/lab/ResultModal";
import ContextPopup, { obsToPopup }                      from "@/components/lab/ContextPopup";
import PreLabIntro                                       from "@/components/lab/PreLabIntro";
import LabPageShell                                      from "@/components/lab/LabPageShell";
import { SOLUTIONS }                                     from "@/lib/engine/solubility-engine";

const SOLUBILITY_INTRO = {
  title:     "Solubility & Precipitation",
  objective: "Mix pairs of ionic solutions to observe precipitation reactions. Select Solution A and Solution B, combine them, and identify whether an insoluble precipitate forms. Record the net ionic equation and precipitate colour.",
  apparatus: ["Dropping Pipettes", "Test Tubes", "Test Tube Rack", "Wash Bottle", "White Background Card"],
  reagents:  [
    { name: "AgNO₃ — Silver nitrate" },
    { name: "NaCl — Sodium chloride" },
    { name: "BaCl₂ — Barium chloride" },
    { name: "Na₂SO₄ — Sodium sulphate" },
    { name: "Pb(NO₃)₂ — Lead(II) nitrate" },
    { name: "KI — Potassium iodide" },
    { name: "FeCl₃ — Iron(III) chloride" },
    { name: "NaOH — Sodium hydroxide" },
    { name: "CuSO₄ — Copper sulphate" },
  ],
  safetyNotes: [
    "Ag⁺ and Pb²⁺ solutions are toxic — dispose of properly, do not pour down the drain.",
    "NaOH is corrosive — avoid skin contact.",
    "Some combinations may produce gas — work in a ventilated area.",
    "Wear gloves and eye protection when handling all solutions.",
  ],
};

const MIX_TICK_FRACTION = 0.05;
const MIX_INTERVAL_MS   = 50;

export default function SolubilityPage() {
  const [mounted, setMounted]     = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const store      = useSolubilityStore();
  const mixRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const popupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    store.hydrate();
    startTransition(() => setMounted(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (store.status === "running") {
      mixRef.current = setInterval(() => store.tickMixingAction(MIX_TICK_FRACTION), MIX_INTERVAL_MS);
    } else {
      if (mixRef.current) { clearInterval(mixRef.current); mixRef.current = null; }
    }
    return () => { if (mixRef.current) { clearInterval(mixRef.current); mixRef.current = null; } };
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

  const profA   = store.solutionA ? SOLUTIONS[store.solutionA] : null;
  const profB   = store.solutionB ? SOLUTIONS[store.solutionB] : null;
  const lastObs = store.observations[0];
  const popup   = lastObs ? obsToPopup(lastObs.type, lastObs.message) : null;

  const infoCards = (store.mixProgress >= 1 && store.precipitate) ? (
    <div
      className="rounded-xl p-4 text-xs"
      style={{
        background: "var(--lab-glass-heavy)",
        border:     "1px solid var(--lab-glass-border)",
        boxShadow:  "var(--lab-shadow-sm)",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-4 h-4 rounded-full flex-shrink-0 border"
          style={{ background: store.precipitate.color, borderColor: "#94a3b8" }}
        />
        <p className="font-semibold text-sm" style={{ color: "var(--lab-blue-600)" }}>
          {store.precipitate.formula} — {store.precipitate.colorName} precipitate
        </p>
      </div>
      <p
        className="font-mono text-[11px] mb-2 px-3 py-2 rounded-lg"
        style={{ background: "var(--lab-surface)", color: "var(--lab-text-tertiary)" }}
      >
        {store.precipitate.netIonic}
      </p>
      <p style={{ color: "var(--lab-text-muted)", lineHeight: 1.6 }}>
        {store.precipitate.explanation}
      </p>
    </div>
  ) : (store.mixProgress >= 1 && !store.hasPrecipitate && store.solutionA && store.solutionB) ? (
    <div
      className="rounded-xl p-4 text-xs"
      style={{ background: "#f0fdf4", border: "1px solid #86efac", boxShadow: "var(--lab-shadow-sm)" }}
    >
      <p className="font-semibold text-sm mb-1" style={{ color: "#166534" }}>
        No precipitation occurred
      </p>
      <p style={{ color: "#15803d", lineHeight: 1.6 }}>
        {profA?.name} and {profB?.name} do not produce an insoluble product.{" "}
        All ions remain dissolved as spectator ions.
      </p>
    </div>
  ) : undefined;

  return (
    <LabPageShell
      preLabIntro={<PreLabIntro {...SOLUBILITY_INTRO} />}

      statusBar={
        <StatusBar
          status={store.status}
          error={store.lastError}
          metrics={[
            { label: "Tests", value: `${store.testHistory.length}` },
            ...(profA ? [{ label: "A", value: profA.formula.split(" ")[0] }] : []),
            ...(profB ? [{ label: "B", value: profB.formula.split(" ")[0] }] : []),
            ...(store.hasPrecipitate && store.precipitate
              ? [{ label: "Precipitate", value: store.precipitate.formula }]
              : store.mixProgress >= 1 && !store.hasPrecipitate
              ? [{ label: "Result", value: "No reaction" }]
              : []),
          ]}
        />
      }

      workspace={
        <SolubilityWorkspace
          solutionA={store.solutionA}
          solutionB={store.solutionB}
          mixProgress={store.mixProgress}
          hasPrecipitate={store.hasPrecipitate}
          precipitate={store.precipitate}
          isRunning={store.status === "running"}
        />
      }
      workspaceMaxW="max-w-lg"

      controls={
        <SolubilityControls
          status={store.status}
          solutionA={store.solutionA}
          solutionB={store.solutionB}
          testHistory={store.testHistory}
          onSelectA={store.selectSolutionAAction}
          onSelectB={store.selectSolutionBAction}
          onCombine={store.combineAction}
          onResetMix={store.resetMixAction}
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
          nextHref="/experiments/reaction-rate"
          nextLabel="Next: Reaction Rate →"
          observations={store.observations}
          experimentKey="solubility"
        />
      }
    />
  );
}
