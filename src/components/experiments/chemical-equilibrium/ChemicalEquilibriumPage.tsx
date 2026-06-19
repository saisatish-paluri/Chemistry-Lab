"use client";

import { useEffect, useState, startTransition, useRef } from "react";
import { motion }                                from "framer-motion";
import { useChemicalEquilibriumStore }           from "@/lib/store/chemical-equilibrium-store";
import StepGuide                                 from "@/components/lab/StepGuide";
import ObservationPanel                          from "@/components/lab/ObservationPanel";
import StatusBar                                 from "@/components/lab/StatusBar";
import ResultModal                               from "@/components/lab/ResultModal";
import ContextPopup, { obsToPopup }              from "@/components/lab/ContextPopup";
import LabPageShell                              from "@/components/lab/LabPageShell";
import LabContextPanel                          from "@/components/lab/LabContextPanel";
import type { EquilibriumPerturbation }          from "@/lib/engine/types";
import { equilibriumSolutionColor, keqAtTemp }  from "@/lib/engine/chemical-equilibrium-engine";
import { EXPERIMENT_EDUCATION }                 from "@/lib/experiment-education";
import EquilibriumWorkspace                      from "./EquilibriumWorkspace";

const PERTURBATIONS: Array<{
  id:    EquilibriumPerturbation;
  label: string;
  icon:  string;
  color: string;
  desc:  string;
  effect: string;
}> = [
  { id: "add-fe3",      label: "Add Fe³⁺",       icon: "⬆", color: "#ef4444", desc: "+0.020 M Fe³⁺",      effect: "More reactant → shifts right → deeper red" },
  { id: "add-scn",      label: "Add SCN⁻",       icon: "⬆", color: "#f97316", desc: "+0.020 M SCN⁻",      effect: "More reactant → shifts right → deeper red" },
  { id: "remove-fescn", label: "Remove FeSCN²⁺", icon: "⬇", color: "#8b5cf6", desc: "−0.010 M product",   effect: "Remove product → shifts right to replace it" },
  { id: "dilute",       label: "Dilute (Water)",  icon: "💧", color: "#0ea5e9", desc: "50% dilution",       effect: "More water → all concentrations drop → lighter" },
  { id: "heat",         label: "Heat (+20 K)",    icon: "🔥", color: "#dc2626", desc: "+20 K",              effect: "Heat → reverse reaction favoured → lighter" },
  { id: "cool",         label: "Cool (−20 K)",    icon: "❄",  color: "#2563eb", desc: "−20 K",              effect: "Cool → forward reaction favoured → deeper red" },
];

export default function ChemicalEquilibriumPage() {
  const [showPopup, setShowPopup] = useState(false);
  const store = useChemicalEquilibriumStore();
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    store.hydrate();
    if (store.status === "idle") store.startAction();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tick loop when not at equilibrium
  useEffect(() => {
    if (!store.atEquilibrium && store.status === "running") {
      tickTimer.current = setInterval(() => {
        store.tickAction(0.08); // Tick by 80ms
      }, 80);
    } else {
      if (tickTimer.current) {
        clearInterval(tickTimer.current);
        tickTimer.current = null;
      }
    }
    return () => {
      if (tickTimer.current) {
        clearInterval(tickTimer.current);
        tickTimer.current = null;
      }
    };
  }, [store.atEquilibrium, store.status, store.tickAction]);

  const lastObsId = store.observations[0]?.id;
  useEffect(() => {
    if (!lastObsId) return;
    startTransition(() => setShowPopup(true));
    const t = setTimeout(() => setShowPopup(false), 3400);
    return () => clearTimeout(t);
  }, [lastObsId]);

  const solColor   = equilibriumSolutionColor(store.concFeSCN);
  const keqNow     = keqAtTemp(store.temperatureK);
  const lastObs    = store.observations[0];
  const popup      = lastObs ? obsToPopup(lastObs.type, lastObs.message) : null;
  const shiftLabel =
    store.shiftDirection === "forward" ? "⟶ Forward shift (more FeSCN²⁺)"
    : store.shiftDirection === "reverse" ? "⟵ Reverse shift (less FeSCN²⁺)"
    : "⇌ At equilibrium";
  const shiftColor =
    store.shiftDirection === "forward" ? "#16a34a"
    : store.shiftDirection === "reverse" ? "#dc2626"
    : "#64748b";

  const concCard = (
    <div
      className="rounded-xl p-4"
      style={{
        background: "var(--lab-glass-heavy)",
        border:     "1px solid var(--lab-glass-border)",
        boxShadow:  "var(--lab-shadow-sm)",
      }}
    >
      <p className="text-xs font-bold mb-3 text-center" style={{ color: shiftColor }}>
        {shiftLabel}
      </p>
      {[
        { label: "Fe³⁺",    val: store.concFe3,   max: 0.07, color: "#ef4444" },
        { label: "SCN⁻",    val: store.concSCN,   max: 0.07, color: "#f97316" },
        { label: "FeSCN²⁺", val: store.concFeSCN, max: 0.07, color: "#7c3aed" },
      ].map(({ label, val, max, color }) => (
        <div key={label} className="mb-2">
          <div className="flex justify-between text-[10px] mb-0.5" style={{ color: "var(--lab-text-muted)" }}>
            <span className="font-mono">[{label}]</span>
            <span className="tabular-nums">{val.toFixed(4)} M</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--lab-slate-100)" }}>
            <motion.div
              animate={{ width: `${Math.min(100, (val / max) * 100)}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: color }}
            />
          </div>
        </div>
      ))}
      <div
        className="mt-3 pt-3 text-[10.5px] flex justify-between"
        style={{ borderTop: "1px solid var(--lab-glass-border)", color: "var(--lab-text-subtle)" }}
      >
        <span>Keq @ {store.temperatureK} K</span>
        <span className="font-semibold tabular-nums" style={{ color: "var(--lab-blue-600)" }}>
          {keqNow.toFixed(1)} L/mol
        </span>
      </div>
    </div>
  );

  const lastPerturb = store.perturbHistory.length > 0
    ? PERTURBATIONS.find((p) => p.id === store.perturbHistory[store.perturbHistory.length - 1])
    : null;

  const perturbControls = (
    <div className="flex flex-col gap-3">
      {/* What is happening guide */}
      <div style={{
        borderRadius: 10, overflow: "hidden",
        border: "1px solid rgba(180,83,9,0.18)",
      }}>
        <div style={{
          padding: "6px 12px",
          background: "rgba(180,83,9,0.08)",
          borderBottom: "1px solid rgba(180,83,9,0.14)",
        }}>
          <p style={{ fontSize: 9.5, fontWeight: 800, color: "#d97706", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Le Chatelier&apos;s Principle
          </p>
        </div>
        <div style={{ padding: "8px 12px" }}>
          <p style={{ fontSize: 10.5, color: "#334155", margin: 0, lineHeight: 1.55 }}>
            When you disturb an equilibrium (add a chemical, change temperature, dilute), the system <strong>shifts to undo the disturbance</strong> and reach a new balance.
          </p>
          {lastPerturb && (
            <div style={{
              marginTop: 8, padding: "5px 8px", borderRadius: 7,
              background: `${lastPerturb.color}0a`,
              border: `1px solid ${lastPerturb.color}30`,
            }}>
              <p style={{ fontSize: 10, color: lastPerturb.color, margin: 0, fontWeight: 700, lineHeight: 1.4 }}>
                Last action: {lastPerturb.label}
              </p>
              <p style={{ fontSize: 9.5, color: "#475569", margin: "2px 0 0", lineHeight: 1.4 }}>
                {lastPerturb.effect}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stress buttons */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--lab-blue-600)" }}>
          Apply a Stress
        </p>
        <div className="grid grid-cols-2 gap-2">
          {PERTURBATIONS.map((p) => (
            <button
              key={p.id}
              onClick={() => store.perturbAction(p.id)}
              disabled={store.status === "completed"}
              className="flex flex-col gap-1 rounded-xl p-2.5 border transition-all duration-150 hover:scale-[1.02] active:scale-95 disabled:opacity-40"
              style={{
                background:  `${p.color}0d`,
                borderColor: `${p.color}44`,
                color:       p.color,
                textAlign:   "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 12 }}>{p.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 800, lineHeight: 1.2 }}>{p.label}</span>
              </div>
              <span style={{ fontSize: 8.5, opacity: 0.75, lineHeight: 1.3 }}>{p.effect}</span>
            </button>
          ))}
        </div>
      </div>

      {store.perturbHistory.length > 0 && (
        <p className="text-[9px]" style={{ color: "var(--lab-text-subtle)" }}>
          {store.perturbHistory.length} stress(es) applied — watch the colour change
        </p>
      )}

      <button
        onClick={store.resetAction}
        className="w-full py-1.5 text-xs font-semibold rounded-lg border transition-all hover:bg-red-50"
        style={{ borderColor: "var(--lab-glass-border)", color: "var(--lab-text-muted)" }}
      >
        Reset
      </button>
    </div>
  );

  const eqLeftPanel = (
    <LabContextPanel
      title="Chemical Equilibrium"
      accent="#d97706"
      summary="Disturb the Fe³⁺/SCN⁻ equilibrium and watch the system respond via Le Chatelier's Principle — more reactant shifts the colour deeper red; dilution lightens it."
      formula="Fe³⁺ + SCN⁻ ⇌ FeSCN²⁺"
      formulaLabel="The equilibrium"
      facts={[
        { icon: "🔴", label: "Blood-red colour",  value: "FeSCN²⁺"             },
        { icon: "📊", label: "Keq (298 K)",        value: `${keqAtTemp(298).toFixed(0)}` },
        { icon: "🌡️", label: "Temp effect",        value: "Exothermic fwd"       },
        { icon: "⚖️", label: "Principle",          value: "Le Chatelier's"       },
      ]}
      steps={[
        { number: 1, title: "Observe baseline",   body: "Note the deep blood-red colour of the FeSCN²⁺ equilibrium solution." },
        { number: 2, title: "Add a reactant",      body: "Click Add Fe³⁺ or Add SCN⁻ — the colour should deepen." },
        { number: 3, title: "Try dilution",        body: "Dilute the system — the colour lightens as Keq is maintained." },
        { number: 4, title: "Heat/Cool",           body: "Temperature shifts Keq — heating favours the reverse reaction." },
      ]}
    />
  );

  return (
    <LabPageShell
      leftPanel={eqLeftPanel}
      statusBar={
        <StatusBar
          status={store.status}
          error={store.lastError}
          metrics={[
            { label: "[Fe³⁺]",    value: `${store.concFe3.toFixed(4)} M` },
            { label: "[SCN⁻]",    value: `${store.concSCN.toFixed(4)} M` },
            { label: "[FeSCN²⁺]", value: `${store.concFeSCN.toFixed(4)} M` },
            { label: "Keq",       value: keqNow.toFixed(0) },
            { label: "T",         value: `${store.temperatureK} K` },
          ]}
        />
      }

      workspace={
        <EquilibriumWorkspace
          solColor={solColor}
          concFe3={store.concFe3}
          concSCN={store.concSCN}
          concFeSCN={store.concFeSCN}
          shiftDirection={store.shiftDirection}
          temperatureK={store.temperatureK}
        />
      }
      education={EXPERIMENT_EDUCATION["chemical-equilibrium"]}
      reactionNote={
        store.shiftDirection === "forward"
          ? `Shifted FORWARD → [FeSCN²⁺]↑ — deeper red. Le Chatelier: system opposes stress by producing more product.`
          : store.shiftDirection === "reverse"
            ? `Shifted REVERSE ← [FeSCN²⁺]↓ — lighter colour. Le Chatelier: system consumes product to restore balance.`
            : store.concFeSCN > 0
              ? "System at equilibrium — forward and reverse rates are equal. Apply a stress to shift the position."
              : "Establish the Fe³⁺/SCN⁻ equilibrium, then add stresses to observe Le Chatelier's principle."
      }

      centerBottom={concCard}

      controls={perturbControls}

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
          nextHref="/experiments/gas-collection"
          nextLabel="Next: Gas Collection →"
          observations={store.observations}
          experimentKey="chemical-equilibrium"
        />
      }
    />
  );
}
