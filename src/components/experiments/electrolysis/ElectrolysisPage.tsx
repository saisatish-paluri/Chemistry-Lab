"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useElectrolysisStore }                           from "@/lib/store/electrolysis-store";
import ElectrolysisWorkspace                              from "./ElectrolysisWorkspace";
import ElectrolysisControls                               from "./ElectrolysisControls";
import StepGuide                                          from "@/components/lab/StepGuide";
import ObservationPanel                                   from "@/components/lab/ObservationPanel";
import StatusBar                                          from "@/components/lab/StatusBar";
import ResultModal                                        from "@/components/lab/ResultModal";
import ContextPopup, { obsToPopup }                       from "@/components/lab/ContextPopup";
import ChemicalAddPopup, { type ChemicalAddEvent }        from "@/components/lab/ChemicalAddPopup";
import PreLabIntro                                        from "@/components/lab/PreLabIntro";
import SetupPhase                                         from "@/components/lab/SetupPhase";
import LabPageShell                                       from "@/components/lab/LabPageShell";
import { ELECTROLYTES }                                   from "@/lib/engine/electrolysis-engine";
import type { ElectrolyteId }                             from "@/lib/engine/types";

// ── Pre-lab data ──────────────────────────────────────────────────────────────
const ELECTROLYSIS_INTRO = {
  title:     "Electrolysis of Ionic Solutions",
  objective: "Investigate electrolysis using a Hofmann voltameter. Select an ionic electrolyte, insert carbon electrodes, connect the DC power source, and observe gas evolution and electrode reactions.",
  apparatus: ["Hofmann Voltameter", "DC Power Supply (0–12 V)", "Carbon Electrodes (×2)", "Connecting Wires", "Gas Collection Tubes (×2)"],
  reagents: [
    { name: "NaCl — sodium chloride",  concentration: "aqueous, select before start" },
    { name: "H₂SO₄ — sulphuric acid",  concentration: "dilute, aqueous" },
    { name: "CuSO₄ — copper sulphate", concentration: "aqueous (blue)" },
    { name: "NaOH — sodium hydroxide", concentration: "aqueous" },
    { name: "Distilled water",          concentration: "non-electrolyte control" },
  ],
  safetyNotes: [
    "Electric shock hazard — never handle connections while power is on.",
    "Chlorine gas may evolve from NaCl — work in a well-ventilated area.",
    "Do not exceed 12 V — follow the voltage safety limit.",
    "H₂SO₄ is highly corrosive — wear gloves and safety goggles at all times.",
  ],
};

// ── Popup events ─────────────────────────────────────────────────────────────
const ELECTROLYTE_EVENTS: Record<ElectrolyteId, ChemicalAddEvent> = {
  "sodium-chloride": {
    chemicalName: "Sodium Chloride", formula: "NaCl (aq)",
    amount: "Select", concentration: "Aqueous solution", swatchColor: "#e0f2fe", kind: "electrolyte",
    reaction: "NaCl fully dissociates into Na⁺ and Cl⁻ ions, providing a conductive medium. Cl⁻ will be oxidised at the anode.",
    equation: "NaCl → Na⁺ + Cl⁻   (high conductivity)",
  },
  "sulfuric-acid": {
    chemicalName: "Sulfuric Acid", formula: "H₂SO₄ (aq)",
    amount: "Select", concentration: "Dilute aqueous", swatchColor: "#fef08a", kind: "acid",
    reaction: "H₂SO₄ fully ionises to give H⁺ and SO₄²⁻ ions. H⁺ reduced at cathode (H₂↑), water oxidised at anode (O₂↑).",
    equation: "H₂SO₄ → 2H⁺ + SO₄²⁻   (very high conductivity)",
  },
  "copper-sulfate": {
    chemicalName: "Copper Sulfate", formula: "CuSO₄ (aq)",
    amount: "Select", concentration: "Aqueous (blue)", swatchColor: "#60a5fa", kind: "electrolyte",
    reaction: "CuSO₄ gives Cu²⁺ ions. Cu²⁺ is preferentially reduced at cathode — copper metal deposits on the electrode surface.",
    equation: "CuSO₄ → Cu²⁺ + SO₄²⁻   Cu²⁺ + 2e⁻ → Cu(s)",
  },
  "sodium-hydroxide": {
    chemicalName: "Sodium Hydroxide", formula: "NaOH (aq)",
    amount: "Select", concentration: "Aqueous", swatchColor: "#86efac", kind: "base",
    reaction: "NaOH provides OH⁻ ions. OH⁻ oxidised at anode (O₂↑), water reduced at cathode (H₂↑). Same gases as sulfuric acid but alkaline.",
    equation: "4OH⁻ → O₂↑ + 2H₂O + 4e⁻  (anode)",
  },
  "distilled-water": {
    chemicalName: "Distilled Water", formula: "H₂O (l)",
    amount: "Select", concentration: "Pure — non-electrolyte", swatchColor: "#e0f2fe", kind: "electrolyte",
    reaction: "Pure water has virtually no free ions — extremely poor conductor. No appreciable electrolysis occurs. This is the control experiment.",
    equation: "H₂O → H⁺ + OH⁻  (Kw = 10⁻¹⁴, negligible)",
  },
};

const ELECTRODE_EVENT: ChemicalAddEvent = {
  chemicalName: "Carbon Electrodes", formula: "C (graphite)",
  amount: "2 electrodes", swatchColor: "#374151", kind: "electrode",
  reaction: "Carbon (graphite) electrodes are inert — they do not react with the electrolyte. They act as surfaces for oxidation (anode) and reduction (cathode) half-reactions.",
  equation: "Cathode (−): reduction  |  Anode (+): oxidation",
};

// ── Page component ────────────────────────────────────────────────────────────
export default function ElectrolysisPage() {
  const [mounted, setMounted]             = useState(false);
  const [showObsPopup, setShowObsPopup]   = useState(false);
  const [chemEvent, setChemEvent]         = useState<ChemicalAddEvent | null>(null);
  const [showChemPopup, setShowChemPopup] = useState(false);
  const [setupDone, setSetupDone]         = useState(false);

  const store     = useElectrolysisStore();
  const tickRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const obsTimer  = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const chemTimer = useRef<ReturnType<typeof setTimeout>  | null>(null);

  useEffect(() => {
    store.hydrate();
    startTransition(() => setMounted(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Simulation tick — 1 Hz when running
  useEffect(() => {
    if (!mounted) return;
    if (store.status === "running") {
      tickRef.current = setInterval(() => store.tickAction(1), 1000);
    } else {
      if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    }
    return () => { if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; } };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.status, mounted]);

  useEffect(() => () => {
    if (obsTimer.current)  clearTimeout(obsTimer.current);
    if (chemTimer.current) clearTimeout(chemTimer.current);
  }, []);

  const lastObsId = store.observations[0]?.id;
  useEffect(() => {
    if (!lastObsId) return;
    startTransition(() => setShowObsPopup(true));
    if (obsTimer.current) clearTimeout(obsTimer.current);
    obsTimer.current = setTimeout(() => setShowObsPopup(false), 3800);
  }, [lastObsId]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  function fireChemPopup(ev: ChemicalAddEvent) {
    setChemEvent(ev);
    startTransition(() => setShowChemPopup(true));
    if (chemTimer.current) clearTimeout(chemTimer.current);
    chemTimer.current = setTimeout(() => setShowChemPopup(false), 4500);
  }

  const handleSetElectrolyte = (id: ElectrolyteId) => {
    store.setElectrolyteAction(id);
    fireChemPopup(ELECTROLYTE_EVENTS[id]);
  };

  const handleInsertElectrodes = () => {
    store.insertElectrodesAction();
    fireChemPopup(ELECTRODE_EVENT);
  };

  const isRunning = store.status === "running";
  const profile   = store.electrolyte ? ELECTROLYTES[store.electrolyte] : null;
  const lastObs   = store.observations[0];
  const popup     = lastObs ? obsToPopup(lastObs.type, lastObs.message) : null;

  // ── Info cards ────────────────────────────────────────────────────────────
  const infoCards = (
    <>
      {setupDone && profile && <ApparatusContentsCard profile={profile} store={store} />}

      {setupDone && profile && (
        <InfoCard>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: profile.liquidColor, border: "1.5px solid rgba(147,197,253,0.6)" }} />
            <p className="font-bold text-sm" style={{ color: "var(--lab-blue-600)" }}>{profile.name}</p>
            <span
              className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: profile.isConductive ? "rgba(5,150,105,0.10)" : "rgba(245,158,11,0.10)",
                color:      profile.isConductive ? "#059669" : "#d97706",
              }}
            >
              {profile.isConductive ? `${(profile.conductivity * 100).toFixed(0)}% conductive` : "non-conductive"}
            </span>
          </div>

          {profile.isConductive ? (
            <>
              <div className="space-y-1.5 mb-3">
                <HalfReactionRow polarity="Cathode −" color="#ef4444" bg="rgba(239,68,68,0.05)" border="rgba(248,113,113,0.25)" text={profile.cathodeReaction} />
                <HalfReactionRow polarity="Anode +"   color="#22c55e" bg="rgba(34,197,94,0.05)"  border="rgba(74,222,128,0.25)"  text={profile.anodeReaction}  />
              </div>
              <p className="text-[10.5px] leading-relaxed" style={{ color: "var(--lab-text-muted)" }}>
                {profile.education}
              </p>
              {profile.cathodeGas === "H₂" && profile.anodeGas === "O₂" && (
                <div
                  className="mt-3 flex items-start gap-2 rounded-xl p-2.5 text-[10.5px]"
                  style={{ background: "rgba(37,99,235,0.05)", border: "1px solid var(--lab-glass-border-blue)" }}
                >
                  <span className="font-bold flex-shrink-0" style={{ color: "var(--lab-blue-600)" }}>ℹ</span>
                  <span style={{ color: "var(--lab-text-muted)" }}>
                    <strong style={{ color: "var(--lab-text-secondary)" }}>2 : 1 Volume Ratio</strong>
                    <br />For every 1 vol O₂, 2 vol H₂ are produced — observe this in the tubes.
                  </span>
                </div>
              )}
            </>
          ) : (
            <p className="text-[10.5px]" style={{ color: "#d97706" }}>{profile.education}</p>
          )}
        </InfoCard>
      )}

      {isRunning && profile?.isConductive && (
        <InfoCard>
          <p className="font-semibold mb-2 text-[11px]" style={{ color: "var(--lab-text-secondary)" }}>
            Faraday&apos;s Law in Action
          </p>
          <div
            className="font-mono text-[10px] rounded-lg px-3 py-2.5 leading-loose mb-2"
            style={{ background: "rgba(37,99,235,0.05)", border: "1px solid rgba(147,197,253,0.40)", color: "#1e40af" }}
          >
            m = (I × t) / (n × F)<br />
            I = {store.current.toFixed(2)} A · t = {store.runTimeSeconds.toFixed(0)} s<br />
            F = 96,485 C mol⁻¹
          </div>
          <p className="text-[10.5px]" style={{ color: "var(--lab-text-subtle)" }}>
            Mass deposited/evolved is proportional to charge passed (I × t).
          </p>
        </InfoCard>
      )}
    </>
  );

  return (
    <LabPageShell
      preLabIntro={<PreLabIntro {...ELECTROLYSIS_INTRO} />}

      statusBar={
        <StatusBar
          status={store.status}
          error={store.lastError}
          metrics={[
            { label: "Voltage",  value: `${store.voltage.toFixed(1)} V` },
            { label: "Current",  value: `${store.current.toFixed(2)} A` },
            { label: "Time",     value: `${store.runTimeSeconds.toFixed(0)} s` },
            ...(profile ? [{ label: "Conductivity", value: `${(profile.conductivity * 100).toFixed(0)}%` }] : []),
            ...(store.cathodeGasMl > 0 ? [{ label: "H₂", value: `${store.cathodeGasMl.toFixed(1)} mL` }] : []),
          ]}
        />
      }

      workspace={
        <ElectrolysisWorkspace
          electrolyte={store.electrolyte}
          anode={store.anode}
          cathode={store.cathode}
          circuitComplete={store.circuitComplete}
          current={store.current}
          voltage={store.voltage}
          runTimeSeconds={store.runTimeSeconds}
          isRunning={isRunning}
          anodeGasMl={store.anodeGasMl}
          cathodeGasMl={store.cathodeGasMl}
        />
      }
      workspaceMaxW="max-w-xl"

      setupPhase={
        !setupDone ? (
          <SetupPhase
            steps={[
              {
                id:          "electrolyte",
                label:       "Select electrolyte",
                description: "Choose your ionic solution from the controls below.",
                done:        store.electrolyte !== null,
                required:    true,
              },
              {
                id:          "electrodes",
                label:       "Insert carbon electrodes",
                description: "Use the controls below to insert the carbon electrodes.",
                done:        store.anode.connected && store.cathode.connected,
                required:    true,
              },
              {
                id:          "circuit",
                label:       "Connect power supply",
                description: "Circuit connects automatically when ready.",
                done:        store.circuitComplete,
                required:    false,
              },
            ]}
            onBegin={() => setSetupDone(true)}
          />
        ) : null
      }

      controls={
        <ElectrolysisControls
          electrolyte={store.electrolyte}
          electrodesIn={store.anode.connected && store.cathode.connected}
          circuitComplete={store.circuitComplete}
          current={store.current}
          voltage={store.voltage}
          status={store.status}
          isRunning={isRunning}
          onSetElectrolyte={handleSetElectrolyte}
          onInsertElectrodes={handleInsertElectrodes}
          onConnectCircuit={store.connectCircuitAction}
          onDisconnectCircuit={store.disconnectCircuitAction}
          onStart={store.startAction}
          onStop={store.stopAction}
          onSetVoltage={store.setVoltageAction}
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
          nextHref="/experiments/titration"
          nextLabel="← Back: Titration"
          observations={store.observations}
          experimentKey="electrolysis"
        />
      }
    />
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-3 text-xs"
      style={{ background: "var(--lab-glass-heavy)", border: "1px solid var(--lab-glass-border)", boxShadow: "var(--lab-shadow-sm)" }}
    >
      {children}
    </div>
  );
}

function HalfReactionRow({ polarity, color, bg, border, text }: { polarity: string; color: string; bg: string; border: string; text: string }) {
  return (
    <div
      className="flex items-start gap-2 rounded-lg px-3 py-2"
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      <span className="text-[10px] font-bold w-16 flex-shrink-0 mt-0.5" style={{ color }}>
        {polarity}
      </span>
      <span className="font-mono text-[10px] leading-snug" style={{ color: "#374151" }}>
        {text}
      </span>
    </div>
  );
}

interface ApparatusContentsProps {
  profile: import("@/lib/engine/electrolysis-engine").ElectrolyteProfile;
  store: {
    anode:           { connected: boolean; gasFormula: string | null; gasMoles: number };
    cathode:         { connected: boolean; gasFormula: string | null; gasMoles: number };
    circuitComplete: boolean;
    voltage:         number;
    current:         number;
    anodeGasMl:      number;
    cathodeGasMl:    number;
    status:          string;
  };
}

function ApparatusContentsCard({ profile, store }: ApparatusContentsProps) {
  const anodePct   = (store.anodeGasMl  / 6)  * 100;
  const cathodePct = (store.cathodeGasMl / 10) * 100;

  return (
    <InfoCard>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded-md flex-shrink-0" style={{ background: profile.liquidColor, border: "1.5px solid rgba(147,197,253,0.60)" }} />
        <p className="font-bold text-[12px]" style={{ color: "var(--lab-text-primary)" }}>Apparatus Contents</p>
      </div>

      <div className="space-y-1.5 mb-3">
        <ContentRow dot={profile.liquidColor} label={`${profile.name} (${profile.formula})`} value="filled" sub="electrolyte" />
        {store.cathode.connected && <ContentRow dot="#374151" label="Carbon cathode (−)" value="inserted" sub="reduction" />}
        {store.anode.connected   && <ContentRow dot="#374151" label="Carbon anode (+)"   value="inserted" sub="oxidation" />}
        {store.circuitComplete   && (
          <ContentRow dot="#22c55e" label={`DC Supply (${store.voltage.toFixed(1)} V)`} value={`${store.current.toFixed(2)} A`} sub="circuit on" />
        )}
        {store.cathodeGasMl > 0 && (
          <ContentRow dot="rgba(186,230,253,1)" label={`${store.cathode.gasFormula ?? "Gas"} at cathode`} value={`${store.cathodeGasMl.toFixed(2)} mL`} sub="collecting" />
        )}
        {store.anodeGasMl > 0 && (
          <ContentRow dot="rgba(254,240,138,1)" label={`${store.anode.gasFormula ?? "Gas"} at anode`} value={`${store.anodeGasMl.toFixed(2)} mL`} sub="collecting" />
        )}
      </div>

      {(store.cathodeGasMl > 0 || store.anodeGasMl > 0) && (
        <div className="space-y-2">
          <GasBar label={`Cathode (${store.cathode.gasFormula ?? "gas"})`} pct={cathodePct} color="linear-gradient(90deg,#3b82f6,#93c5fd)" textColor="#1d4ed8" />
          <GasBar label={`Anode (${store.anode.gasFormula ?? "gas"})`}    pct={anodePct}   color="linear-gradient(90deg,#22c55e,#86efac)" textColor="#15803d" />
        </div>
      )}
    </InfoCard>
  );
}

function GasBar({ label, pct, color, textColor }: { label: string; pct: number; color: string; textColor: string }) {
  return (
    <div>
      <div className="flex justify-between mb-1 text-[9px]" style={{ color: "var(--lab-text-subtle)" }}>
        <span>{label}</span>
        <span className="font-semibold" style={{ color: textColor }}>{Math.min(100, pct).toFixed(0)}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(148,163,184,0.18)" }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, pct)}%`, background: color }} />
      </div>
    </div>
  );
}

function ContentRow({ dot, label, value, sub }: { dot: string; label: string; value: string; sub: string }) {
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
