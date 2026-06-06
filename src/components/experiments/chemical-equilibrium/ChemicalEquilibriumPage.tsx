"use client";

import { useEffect, useState, startTransition } from "react";
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

  useEffect(() => {
    store.hydrate();
    if (store.status === "idle") store.startAction();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

// ── Inline workspace ──────────────────────────────────────────────────────────

function EquilibriumWorkspace({
  solColor, concFe3, concSCN, concFeSCN, shiftDirection, temperatureK,
}: {
  solColor:       string;
  concFe3:        number;
  concSCN:        number;
  concFeSCN:      number;
  shiftDirection: "forward" | "reverse" | "none";
  temperatureK:   number;
}) {
  const arrowForward = shiftDirection === "forward";
  const arrowReverse = shiftDirection === "reverse";
  const temp = temperatureK - 273;

  const shiftColor =
    arrowForward ? "#16a34a" :
    arrowReverse ? "#dc2626" :
    "#64748b";

  const shiftText =
    arrowForward ? "⟶ Forward shift" :
    arrowReverse ? "⟵ Reverse shift" :
    "⇌ At equilibrium";

  return (
    <div
      className="relative rounded-3xl overflow-hidden select-none"
      style={{
        aspectRatio: "320/250",
        width:       "100%",
        height:      "auto",
        maxHeight:   "100%",
        background: "radial-gradient(ellipse at 50% 25%, rgba(180,83,9,0.10) 0%, transparent 50%), linear-gradient(180deg, #fffbeb 0%, #fef3c7 40%, #fffdf0 100%)",
        border: "1px solid rgba(148,163,184,0.28)",
        boxShadow:
          "0 10px 30px rgba(15,23,42,0.06), " +
          "0 2px 6px rgba(15,23,42,0.03), " +
          "0 0 0 1px rgba(255,255,255,0.80) inset",
      }}
    >
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(212,119,6,0.14) 1px, transparent 1px)",
          backgroundSize:  "22px 22px",
        }}
      />

      <svg viewBox="0 0 320 250" width="100%"
        style={{ display: "block", position: "relative", zIndex: 10 }}
        aria-label="Equilibrium beaker" role="img"
      >
        <defs>
          <filter id="eq-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="rgba(0,0,0,0.50)" />
          </filter>
          <filter id="eq-glow">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <clipPath id="eq-vessel-clip">
            <path d="M61 28 L61 170 Q61 185 76 185 L244 185 Q259 185 259 170 L259 28 Z" />
          </clipPath>
        </defs>

        {/* Equation header */}
        <text x="160" y="16" textAnchor="middle" fontSize="9" fill="#92400e" fontWeight="700">
          Fe³⁺  +  SCN⁻  ⇌  FeSCN²⁺
        </text>

        {/* ── Reaction vessel ── */}
        <path d="M60 28 L60 170 Q60 185 75 185 L245 185 Q260 185 260 170 L260 28 Z"
          fill="rgba(255,255,255,0.48)" stroke="rgba(71,85,105,0.50)" strokeWidth="2"
          filter="url(#eq-shadow)" />
        <path d="M64 34 L64 170" stroke="rgba(255,255,255,0.40)" strokeWidth="4" strokeLinecap="round" />
        <path d="M72 34 L72 170" stroke="rgba(255,255,255,0.14)" strokeWidth="2" strokeLinecap="round" />

        {/* Solution fill — blood red for FeSCN²⁺ */}
        <motion.rect x="61" y="62" width="198" height="122"
          clipPath="url(#eq-vessel-clip)"
          animate={{ fill: solColor }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
        {/* Solution surface wave */}
        <motion.path
          fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"
          animate={{ d: [
            "M 62 62 Q 120 58 160 62 Q 200 66 258 62",
            "M 62 62 Q 120 66 160 62 Q 200 58 258 62",
          ]}}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut", repeatType: "mirror" }}
          clipPath="url(#eq-vessel-clip)"
        />
        {/* Ambient solution glow when FeSCN²⁺ is high */}
        {concFeSCN > 0.02 && (
          <ellipse cx="160" cy="123" rx="95" ry="55"
            fill={solColor} opacity="0.15" filter="url(#eq-glow)" />
        )}

        {/* Vessel outline overlay */}
        <path d="M60 28 L60 170 Q60 185 75 185 L245 185 Q260 185 260 170 L260 28 Z"
          fill="none" stroke="rgba(99,179,237,0.25)" strokeWidth="1.5" />

        {/* ── Reaction arrows — animate when shifted ── */}
        <g style={{ transition: "opacity 0.5s" }}>
          {/* Forward arrow (top) — thicker and bolder when active */}
          <motion.g
            animate={{ x: arrowForward ? [0, 6, 0] : 0 }}
            transition={{ repeat: arrowForward ? Infinity : 0, duration: 0.65, ease: "easeInOut" }}
          >
            <line x1="96" y1="34" x2="216" y2="34"
              stroke={arrowForward ? "#16a34a" : "#94a3b8"} strokeWidth={arrowForward ? 3.5 : 2}
              strokeLinecap="round"
              style={{ transition: "stroke 0.5s, stroke-width 0.3s" }} />
            <polygon
              points="216,29 228,34 216,39"
              fill={arrowForward ? "#16a34a" : "#94a3b8"}
              style={{ transition: "fill 0.5s" }}
            />
            {arrowForward && (
              <text x="156" y="30" textAnchor="middle" fontSize="7.5" fill="#16a34a" fontWeight="800">
                FORWARD →
              </text>
            )}
          </motion.g>
          {/* Reverse arrow (bottom) */}
          <motion.g
            animate={{ x: arrowReverse ? [0, -6, 0] : 0 }}
            transition={{ repeat: arrowReverse ? Infinity : 0, duration: 0.65, ease: "easeInOut" }}
          >
            <line x1="216" y1="47" x2="96" y2="47"
              stroke={arrowReverse ? "#dc2626" : "#94a3b8"} strokeWidth={arrowReverse ? 3.5 : 2}
              strokeLinecap="round"
              style={{ transition: "stroke 0.5s, stroke-width 0.3s" }} />
            <polygon
              points="96,42 84,47 96,52"
              fill={arrowReverse ? "#dc2626" : "#94a3b8"}
              style={{ transition: "fill 0.5s" }}
            />
            {arrowReverse && (
              <text x="156" y="58" textAnchor="middle" fontSize="7.5" fill="#dc2626" fontWeight="800">
                ← REVERSE
              </text>
            )}
          </motion.g>
        </g>

        {/* Shift label badge — always visible when shifted */}
        {shiftDirection !== "none" && (
          <motion.g
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <rect x="90" y="54" width="140" height="18" rx="5"
              fill={`${shiftColor}1a`} stroke={`${shiftColor}70`} strokeWidth="1.2" />
            <text x="160" y="66" textAnchor="middle" fontSize="8.5"
              fill={shiftColor} fontWeight="900">
              {shiftText}
            </text>
          </motion.g>
        )}

        {/* Temperature + FeSCN²⁺ reading inside vessel */}
        <text x="160" y="148" textAnchor="middle" fontSize="10"
          fill="rgba(255,240,210,0.85)" fontWeight="700">
          {temperatureK} K  ({temp > 0 ? "+" : ""}{temp} °C)
        </text>
        <text x="160" y="165" textAnchor="middle" fontSize="9"
          fill="rgba(255,220,180,0.90)" fontWeight="600">
          [FeSCN²⁺] = {concFeSCN.toFixed(4)} M
        </text>

        {/* ── Concentration readouts ── */}
        <g transform="translate(0, 192)">
          {/* Fe3+ */}
          <text x="72" y="12" textAnchor="middle" fontSize="8" fill="#64748b">
            <tspan fill="#f87171">●</tspan>  [Fe³⁺] = {concFe3.toFixed(4)} M
          </text>
          {/* SCN⁻ */}
          <text x="248" y="12" textAnchor="middle" fontSize="8" fill="#64748b">
            <tspan fill="#fb923c">●</tspan>  [SCN⁻] = {concSCN.toFixed(4)} M
          </text>
          {/* FeSCN²⁺ */}
          <text x="160" y="26" textAnchor="middle" fontSize="8.5" fill="#92400e" fontWeight="700">
            <tspan fill="#a78bfa">●</tspan>  [FeSCN²⁺] = {concFeSCN.toFixed(4)} M
          </text>
          {/* Keq hint */}
          <text x="160" y="40" textAnchor="middle" fontSize="7.5" fill="#94a3b8">
            Blood-red colour = high [FeSCN²⁺]  ·  light = low [FeSCN²⁺]
          </text>
        </g>
      </svg>
    </div>
  );
}
