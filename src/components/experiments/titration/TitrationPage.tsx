"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useTitrationStore }                             from "@/lib/store/titration-store";
import TitrationWorkspace                                from "./TitrationWorkspace";
import TitrationControls                                 from "./TitrationControls";
import PHCurve                                           from "./PHCurve";
import StepGuide                                         from "@/components/lab/StepGuide";
import ObservationPanel                                  from "@/components/lab/ObservationPanel";
import StatusBar                                         from "@/components/lab/StatusBar";
import ResultModal                                       from "@/components/lab/ResultModal";
import ContextPopup, { obsToPopup }                      from "@/components/lab/ContextPopup";
import ChemicalAddPopup, { type ChemicalAddEvent }       from "@/components/lab/ChemicalAddPopup";
import SetupPhase                                        from "@/components/lab/SetupPhase";
import LabPageShell                                      from "@/components/lab/LabPageShell";
import LabContextPanel                                   from "@/components/lab/LabContextPanel";
import { INDICATORS }                                    from "@/lib/engine/chemistry";
import type { IndicatorName }                            from "@/lib/engine/types";
import { EXPERIMENT_EDUCATION }                          from "@/lib/experiment-education";


// ── Indicator popup events ────────────────────────────────────────────────────
const INDICATOR_ADD_EVENTS: Record<IndicatorName, ChemicalAddEvent> = {
  phenolphthalein: {
    chemicalName:  "Phenolphthalein",
    formula:       "C₂₀H₁₄O₄",
    amount:        "2–3 drops",
    concentration: "~0.1% solution",
    swatchColor:   "#f472b6",
    kind:          "indicator",
    reaction:      "Colourless in acid (pH < 8.2). Turns pink/magenta when pH exceeds 8.2 at the equivalence point.",
    equation:      "H-In (colourless) ⇌ H⁺ + In⁻ (pink)",
  },
  litmus: {
    chemicalName:  "Litmus",
    formula:       "C₁₂H₁₄O₅S",
    amount:        "2–3 drops",
    concentration: "~0.1% solution",
    swatchColor:   "#5555d5",
    kind:          "indicator",
    reaction:      "Red in acid, blue in base. Broad transition zone pH 6–8 makes it less precise for titrations.",
    equation:      "HLit (red) ⇌ H⁺ + Lit⁻ (blue)  pH 6–8",
  },
  methylOrange: {
    chemicalName:  "Methyl Orange",
    formula:       "C₁₄H₁₄N₃NaO₃S",
    amount:        "2–3 drops",
    concentration: "~0.1% solution",
    swatchColor:   "#f97316",
    kind:          "indicator",
    reaction:      "Red/orange in acid (pH < 3.1), yellow in base (pH > 4.4). Best for weak base titrations.",
    equation:      "H-MO (red) ⇌ H⁺ + MO⁻ (yellow)  pH 3.1–4.4",
  },
};

function makeTitrantEvent(volumeMl: number, pH: number): ChemicalAddEvent {
  return {
    chemicalName:  "Sodium Hydroxide",
    formula:       "NaOH",
    amount:        `${volumeMl.toFixed(1)} mL`,
    concentration: "0.1 M",
    swatchColor:   "#86efac",
    kind:          "base",
    reaction:      `NaOH is a strong base. Adding it raises the pH from ${pH.toFixed(2)} — neutralisation is underway.`,
    equation:      "NaOH + HCl → NaCl + H₂O",
  };
}

// ── Page component ────────────────────────────────────────────────────────────
export default function TitrationPage() {
  const [isTitrating, setIsTitrating]     = useState(false);
  const [showObsPopup, setShowObsPopup]   = useState(false);
  const [chemEvent, setChemEvent]         = useState<ChemicalAddEvent | null>(null);
  const [showChemPopup, setShowChemPopup] = useState(false);
  const [setupDone, setSetupDone]         = useState(false);

  const titrationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const obsPopupTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chemPopupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const store = useTitrationStore();

  useEffect(() => {
    store.hydrate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => {
    if (titrationTimer.current) clearTimeout(titrationTimer.current);
    if (obsPopupTimer.current)  clearTimeout(obsPopupTimer.current);
    if (chemPopupTimer.current) clearTimeout(chemPopupTimer.current);
  }, []);

  // Show context popup on new observation
  const lastObsId = store.observations[0]?.id;
  useEffect(() => {
    if (!lastObsId) return;
    startTransition(() => setShowObsPopup(true));
    if (obsPopupTimer.current) clearTimeout(obsPopupTimer.current);
    obsPopupTimer.current = setTimeout(() => setShowObsPopup(false), 3800);
  }, [lastObsId]);


  // ── Chemical popup helper ──────────────────────────────────────────────────
  function fireChemPopup(ev: ChemicalAddEvent) {
    setChemEvent(ev);
    startTransition(() => setShowChemPopup(true));
    if (chemPopupTimer.current) clearTimeout(chemPopupTimer.current);
    chemPopupTimer.current = setTimeout(() => setShowChemPopup(false), 4500);
  }

  const handleAddIndicator = (ind: IndicatorName) => {
    store.addIndicatorAction(ind);
    fireChemPopup(INDICATOR_ADD_EVENTS[ind]);
  };

  const handleAddTitrant = () => {
    const prevPH = store.flask.pH;
    store.addTitrantAction();
    setIsTitrating(true);
    if (titrationTimer.current) clearTimeout(titrationTimer.current);
    titrationTimer.current = setTimeout(() => setIsTitrating(false), 750);
    fireChemPopup(makeTitrantEvent(store.burette.flowRate, prevPH));
  };

  const ind     = store.flask.indicator ? INDICATORS[store.flask.indicator] : null;
  const lastObs = store.observations[0];
  const popup   = lastObs ? obsToPopup(lastObs.type, lastObs.message) : null;

  // ── Info cards (shown in Info tab) ────────────────────────────────────────
  const infoCards = (
    <>
      {setupDone && (
        <FlaskContentsCard
          flask={store.flask}
          volumeAdded={store.volumeAdded}
          ind={ind}
        />
      )}

      {/* Indicator info */}
      {ind && (
        <InfoCard>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: ind.baseColor }} />
            <p className="font-bold text-sm" style={{ color: "var(--lab-blue-600)" }}>{ind.name}</p>
          </div>
          <p className="mb-2.5" style={{ color: "var(--lab-text-muted)" }}>{ind.description}</p>
          <div className="flex gap-3 flex-wrap text-[10px]">
            <span style={{ color: "var(--lab-text-subtle)" }}>
              Acid: <span style={{ color: ind.acidColor, fontWeight: 700 }}>■</span>
            </span>
            <span style={{ color: "var(--lab-text-subtle)" }}>
              Base: <span style={{ color: ind.baseColor, fontWeight: 700 }}>■</span>
            </span>
            <span style={{ color: "var(--lab-text-subtle)" }}>Range: pH {ind.transitionLow}–{ind.transitionHigh}</span>
          </div>
        </InfoCard>
      )}

      {/* Reaction equation */}
      <InfoCard>
        <p className="font-semibold mb-2 text-[11px]" style={{ color: "var(--lab-text-secondary)" }}>
          Reaction Occurring
        </p>
        <div
          className="font-mono text-[10.5px] rounded-lg px-3 py-2.5 leading-relaxed mb-2"
          style={{ background: "rgba(37,99,235,0.05)", border: "1px solid rgba(147,197,253,0.40)", color: "#1e40af" }}
        >
          HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)
        </div>
        <p className="text-[10.5px] leading-relaxed" style={{ color: "var(--lab-text-subtle)" }}>
          Strong acid–strong base neutralisation. Equivalence point at pH 7 when{" "}
          moles HCl = moles NaOH ({store.equivalenceVolume.toFixed(1)} mL at 0.1 M).
        </p>
      </InfoCard>
    </>
  );

  const titrationLeftPanel = (
    <LabContextPanel
      title="Acid-Base Titration"
      accent="#2563eb"
      summary="Add NaOH drop-by-drop from the burette into the HCl flask. The indicator changes colour at the equivalence point (pH 7)."
      formula="HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)"
      formulaLabel="Net ionic equation"
      facts={[
        { icon: "⚗️", label: "Flask acid",   value: "25 mL HCl"   },
        { icon: "🧪", label: "Burette base",  value: "0.1 M NaOH"  },
        { icon: "📍", label: "Equiv. vol.",   value: "25.0 mL"      },
        { icon: "⚡", label: "Equiv. pH",     value: "7.00"         },
      ]}
      steps={[
        { number: 1, title: "Add indicator",   body: "Select phenolphthalein (best for this titration) from Controls." },
        { number: 2, title: "Open stopcock",   body: "Set flow rate then click Add NaOH to deliver titrant." },
        { number: 3, title: "Watch the curve", body: "The pH curve in the centre panel shows the sigmoid. Slow down near pH 6." },
        { number: 4, title: "Detect endpoint", body: "One drop past pH 8.2 turns the flask pink — stop immediately." },
      ]}
    />
  );

  return (
    <LabPageShell
      leftPanel={titrationLeftPanel}
      statusBar={
        <StatusBar
          status={store.status}
          error={store.lastError}
          metrics={[
            { label: "pH",         value: store.flask.pH.toFixed(2) },
            { label: "NaOH Added", value: `${store.volumeAdded.toFixed(2)} mL` },
            { label: "Remaining",  value: `${store.burette.volumeRemaining.toFixed(1)} mL` },
            ...(store.endpointReached ? [{ label: "Endpoint", value: "✓ Reached" }] : []),
          ]}
        />
      }

      workspace={
        <TitrationWorkspace
          flask={store.flask}
          burette={store.burette}
          volumeAdded={store.volumeAdded}
          isTitrating={isTitrating}
          endpointReached={store.endpointReached}
        />
      }
      education={EXPERIMENT_EDUCATION.titration}
      reactionNote={
        store.flask.indicatorAdded
          ? store.endpointReached
            ? "Endpoint reached — neutralisation complete. Stop adding base."
            : `HCl + NaOH → NaCl + H₂O · pH ${store.flask.pH.toFixed(2)} · indicator changes near pH ${store.flask.indicator === "methylOrange" ? "3.1–4.4" : store.flask.indicator === "litmus" ? "6–8" : "8.2–10"}`
          : "Add an indicator to track the neutralisation endpoint."
      }

      centerBottom={
        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--lab-glass-heavy)",
            border:     "1px solid var(--lab-glass-border)",
            boxShadow:  "var(--lab-shadow-sm)",
          }}
        >
          <PHCurve
            curve={store.titrationCurve}
            equivalenceVol={store.equivalenceVolume}
            indicator={store.flask.indicator}
          />
        </div>
      }

      setupPhase={
        !setupDone ? (
          <SetupPhase
            steps={[
              {
                id:          "hcl",
                label:       "HCl loaded in conical flask",
                description: "25 mL of 0.1 M HCl is pre-loaded in the flask.",
                done:        true,
                required:    true,
              },
              {
                id:          "burette",
                label:       "Burette filled with NaOH",
                description: "50 mL of 0.1 M NaOH is loaded in the burette.",
                done:        true,
                required:    true,
              },
              {
                id:          "indicator",
                label:       "Add indicator to flask",
                description: "Select an indicator using the controls below.",
                done:        store.flask.indicatorAdded,
                required:    true,
              },
            ]}
            onBegin={() => setSetupDone(true)}
          />
        ) : null
      }

      controls={
        <TitrationControls
          indicatorAdded={store.flask.indicatorAdded}
          selectedIndicator={store.flask.indicator}
          flowRate={store.burette.flowRate}
          status={store.status}
          isRunning={store.status === "running"}
          volumeAdded={store.volumeAdded}
          pH={store.flask.pH}
          onAddIndicator={handleAddIndicator}
          onAddTitrant={handleAddTitrant}
          onSetFlowRate={store.setFlowRateAction}
          onReset={store.resetAction}
        />
      }

      stepGuide={<StepGuide steps={store.steps} objectives={store.objectives} />}
      mode={store.mode}
      onSetMode={store.setMode}

      observations={<ObservationPanel observations={store.observations} />}

      infoCards={infoCards}

      chemNotif={<ChemicalAddPopup event={chemEvent} visible={showChemPopup} />}
      obsNotif={
        !showChemPopup && popup ? (
          <ContextPopup
            visible={showObsPopup}
            what={popup.what}
            why={popup.why}
            equation={popup.equation}
            kind={popup.kind}
          />
        ) : null
      }

      resultModal={
        <ResultModal
          result={store.result}
          onReset={store.resetAction}
          nextHref="/experiments/electrolysis"
          nextLabel="Next: Electrolysis →"
          observations={store.observations}
          experimentKey="titration"
        />
      }
    />
  );
}

// ── Shared info card wrapper ──────────────────────────────────────────────────
function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-3 text-xs"
      style={{
        background: "var(--lab-glass-heavy)",
        border:     "1px solid var(--lab-glass-border)",
        boxShadow:  "var(--lab-shadow-sm)",
      }}
    >
      {children}
    </div>
  );
}

// ── Flask contents info card ──────────────────────────────────────────────────
interface FlaskContentsProps {
  flask:       { pH: number; volume: number; color: string; indicator: IndicatorName | null; indicatorAdded: boolean };
  volumeAdded: number;
  ind:         import("@/lib/engine/chemistry").IndicatorDef | null;
}

function FlaskContentsCard({ flask, volumeAdded, ind }: FlaskContentsProps) {
  const acidMolesLeft  = Math.max(0, 0.1 * 0.025 - 0.1 * (volumeAdded / 1000));
  const baseMolesIn    = 0.1 * (volumeAdded / 1000);
  const baseExcess     = Math.max(0, baseMolesIn - 0.1 * 0.025);
  const neutralPct     = Math.min(100, (volumeAdded / 25) * 100);
  const pastEquiv      = volumeAdded > 25;

  return (
    <InfoCard>
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-5 h-5 rounded-full flex-shrink-0 shadow-sm"
          style={{
            background: flask.indicatorAdded
              ? `radial-gradient(circle at 40% 40%, ${flask.color}cc, ${flask.color})`
              : "radial-gradient(circle at 40% 40%, #bfdbfe, #93c5fd)",
            border: "1.5px solid rgba(147,197,253,0.60)",
            transition: "background 0.65s ease",
          }}
        />
        <p className="font-bold text-[12px]" style={{ color: "var(--lab-text-primary)" }}>
          Flask Contents
        </p>
        <span
          className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: "rgba(37,99,235,0.10)", color: "var(--lab-blue-600)" }}
        >
          {flask.volume.toFixed(1)} mL
        </span>
      </div>

      <div className="space-y-1.5 mb-3">
        <ContentRow
          dot="#f87171" label="HCl (0.1 M)"
          value={`${acidMolesLeft.toFixed(4)} mol`}
          sub={`${(25 - Math.min(25, volumeAdded)).toFixed(1)} mL equiv.`}
        />
        {volumeAdded > 0 && (
          <ContentRow
            dot="#86efac" label="NaOH added"
            value={`${volumeAdded.toFixed(2)} mL`}
            sub={`${baseMolesIn.toFixed(5)} mol`}
          />
        )}
        {volumeAdded > 0 && (
          <ContentRow dot="#94a3b8" label="NaCl (product)" value="in solution" sub="neutralisation salt" />
        )}
        {pastEquiv && baseExcess > 0 && (
          <ContentRow
            dot="#a78bfa" label="NaOH excess"
            value={`${baseExcess.toFixed(5)} mol`}
            sub="past equivalence point"
          />
        )}
        {flask.indicatorAdded && ind && (
          <ContentRow
            dot={ind.baseColor} label={`${ind.name}`}
            value="monitoring pH"
            sub={`pH ${ind.transitionLow}–${ind.transitionHigh}`}
          />
        )}
      </div>

      <div>
        <div className="flex justify-between mb-1 text-[9px]" style={{ color: "var(--lab-text-subtle)" }}>
          <span>Neutralisation progress</span>
          <span className="font-semibold" style={{ color: "var(--lab-text-secondary)" }}>
            {neutralPct.toFixed(0)}%
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(148,163,184,0.18)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width:      `${neutralPct}%`,
              background: neutralPct >= 100
                ? "linear-gradient(90deg,#22c55e,#4ade80)"
                : "linear-gradient(90deg,#3b82f6,#0ea5e9)",
            }}
          />
        </div>
        <p className="mt-1 text-[9px]" style={{ color: "var(--lab-text-subtle)" }}>
          {neutralPct < 100
            ? `${(25 - volumeAdded).toFixed(2)} mL NaOH still needed`
            : "Equivalence point reached — reaction complete"}
        </p>
      </div>
    </InfoCard>
  );
}

function ContentRow({
  dot, label, value, sub,
}: { dot: string; label: string; value: string; sub: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: dot }} />
      <div className="min-w-0 flex-1">
        <div className="flex justify-between gap-2">
          <span className="font-semibold truncate" style={{ color: "var(--lab-text-secondary)" }}>{label}</span>
          <span className="flex-shrink-0" style={{ color: "var(--lab-text-muted)" }}>{value}</span>
        </div>
        <span className="text-[9.5px]" style={{ color: "var(--lab-text-subtle)" }}>{sub}</span>
      </div>
    </div>
  );
}
