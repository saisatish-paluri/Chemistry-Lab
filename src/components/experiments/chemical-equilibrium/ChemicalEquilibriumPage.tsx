"use client";

import { useEffect, useState, startTransition } from "react";
import { motion }                                from "framer-motion";
import { useChemicalEquilibriumStore }           from "@/lib/store/chemical-equilibrium-store";
import StepGuide                                 from "@/components/lab/StepGuide";
import ObservationPanel                          from "@/components/lab/ObservationPanel";
import StatusBar                                 from "@/components/lab/StatusBar";
import ResultModal                               from "@/components/lab/ResultModal";
import ContextPopup, { obsToPopup }              from "@/components/lab/ContextPopup";
import PreLabIntro                               from "@/components/lab/PreLabIntro";
import LabPageShell                              from "@/components/lab/LabPageShell";
import type { EquilibriumPerturbation }          from "@/lib/engine/types";
import { equilibriumSolutionColor, keqAtTemp }  from "@/lib/engine/chemical-equilibrium-engine";

const INTRO = {
  title:     "Chemical Equilibrium — Le Chatelier's Principle",
  objective: "Investigate the Fe³⁺ + SCN⁻ ⇌ FeSCN²⁺ equilibrium. Apply stresses (adding ions, dilution, temperature change) and observe how the system shifts to restore equilibrium, demonstrating Le Chatelier's Principle.",
  apparatus: ["Beaker (250 mL)", "Dropping pipette", "Thermometer", "Colorimeter (simulated)", "Stirring rod"],
  reagents: [
    { name: "FeCl₃ (iron(III) chloride)",    concentration: "0.1 M — source of Fe³⁺" },
    { name: "KSCN (potassium thiocyanate)",  concentration: "0.1 M — source of SCN⁻" },
    { name: "Distilled water",               concentration: "for dilution" },
  ],
  safetyNotes: [
    "Fe³⁺ and SCN⁻ solutions are mild irritants — avoid skin contact.",
    "Wear eye protection at all times.",
    "Do not heat solutions beyond 80 °C.",
    "Dispose of all solutions in designated waste containers.",
  ],
};

const PERTURBATIONS: Array<{
  id:    EquilibriumPerturbation;
  label: string;
  icon:  string;
  color: string;
  desc:  string;
}> = [
  { id: "add-fe3",      label: "Add Fe³⁺",      icon: "⬆", color: "#ef4444", desc: "+0.020 M Fe³⁺" },
  { id: "add-scn",      label: "Add SCN⁻",      icon: "⬆", color: "#f97316", desc: "+0.020 M SCN⁻" },
  { id: "remove-fescn", label: "Remove FeSCN²⁺", icon: "⬇", color: "#8b5cf6", desc: "−0.010 M product" },
  { id: "dilute",       label: "Dilute",         icon: "💧", color: "#0ea5e9", desc: "50% dilution" },
  { id: "heat",         label: "Heat (+20 K)",   icon: "🔥", color: "#dc2626", desc: "+20 K" },
  { id: "cool",         label: "Cool (−20 K)",   icon: "❄",  color: "#2563eb", desc: "−20 K" },
];

export default function ChemicalEquilibriumPage() {
  const [mounted, setMounted]     = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const store = useChemicalEquilibriumStore();

  useEffect(() => {
    store.hydrate();
    store.startAction();
    startTransition(() => setMounted(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastObsId = store.observations[0]?.id;
  useEffect(() => {
    if (!lastObsId) return;
    startTransition(() => setShowPopup(true));
    const t = setTimeout(() => setShowPopup(false), 3400);
    return () => clearTimeout(t);
  }, [lastObsId]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
      </div>
    );
  }

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

  const perturbControls = (
    <div>
      <p
        className="text-[10px] font-semibold uppercase tracking-widest mb-2"
        style={{ color: "var(--lab-blue-600)" }}
      >
        Apply Stress
      </p>
      <div className="grid grid-cols-2 gap-2">
        {PERTURBATIONS.map((p) => (
          <button
            key={p.id}
            onClick={() => store.perturbAction(p.id)}
            disabled={store.status === "completed"}
            className="flex flex-col items-center gap-1 rounded-xl p-2.5 text-center border transition-all duration-150 hover:scale-105 active:scale-95 disabled:opacity-40"
            style={{
              background:  `${p.color}0d`,
              borderColor: `${p.color}44`,
              color:       p.color,
            }}
          >
            <span className="text-base">{p.icon}</span>
            <span className="text-[9px] font-bold leading-tight">{p.label}</span>
            <span className="text-[8px] opacity-70">{p.desc}</span>
          </button>
        ))}
      </div>

      {store.perturbHistory.length > 0 && (
        <p className="text-[9px] mt-2" style={{ color: "var(--lab-text-subtle)" }}>
          {store.perturbHistory.length} perturbation(s) applied
        </p>
      )}

      <button
        onClick={store.resetAction}
        className="mt-3 w-full py-1.5 text-xs font-semibold rounded-lg border transition-all hover:bg-red-50"
        style={{ borderColor: "var(--lab-glass-border)", color: "var(--lab-text-muted)" }}
      >
        Reset
      </button>
    </div>
  );

  return (
    <LabPageShell
      preLabIntro={<PreLabIntro {...INTRO} />}

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
      workspaceMaxW="max-w-sm"

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
  const arrowOpacity = shiftDirection !== "none" ? 1 : 0.15;
  const arrowForward = shiftDirection === "forward";
  const temp = temperatureK - 273;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--lab-glass-heavy)",
        border:     "1px solid var(--lab-glass-border)",
        boxShadow:  "var(--lab-shadow-md)",
      }}
    >
      <div className="p-4">
        <p
          className="text-[10px] font-semibold uppercase tracking-widest mb-3 text-center"
          style={{ color: "var(--lab-text-muted)" }}
        >
          Fe³⁺ + SCN⁻ ⇌ FeSCN²⁺
        </p>

        <svg viewBox="0 0 320 200" width="100%" aria-label="Equilibrium beaker">
          <path d="M60 20 L60 160 Q60 175 75 175 L245 175 Q260 175 260 160 L260 20 Z"
                fill="none" stroke="#cbd5e1" strokeWidth="2" />

          <motion.rect
            x="61" y="60" width="198" height="114"
            rx="0"
            animate={{ fill: solColor }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          <motion.path
            d="M61 60 Q120 55 160 60 Q200 65 259 60"
            fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.5"
            animate={{ d: ["M61 60 Q120 55 160 60 Q200 65 259 60", "M61 60 Q120 65 160 60 Q200 55 259 60"] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", repeatType: "mirror" }}
          />

          <path d="M60 20 L60 160 Q60 175 75 175 L245 175 Q260 175 260 160 L260 20 Z"
                fill="none" stroke="#94a3b8" strokeWidth="1.5" />

          <g opacity={arrowOpacity} style={{ transition: "opacity 0.5s" }}>
            <motion.g
              animate={{ x: arrowForward ? [0, 4, 0] : 0 }}
              transition={{ repeat: arrowForward ? Infinity : 0, duration: 0.8 }}
            >
              <line x1="100" y1="30" x2="220" y2="30" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
              <polygon points="220,26 228,30 220,34" fill="#16a34a" />
            </motion.g>
            <motion.g
              animate={{ x: !arrowForward && shiftDirection !== "none" ? [0, -4, 0] : 0 }}
              transition={{ repeat: !arrowForward && shiftDirection !== "none" ? Infinity : 0, duration: 0.8 }}
            >
              <line x1="220" y1="40" x2="100" y2="40" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
              <polygon points="100,36 92,40 100,44" fill="#dc2626" />
            </motion.g>
          </g>

          <text x="160" y="145" textAnchor="middle" fontSize="11" fill="white" fontWeight="600" opacity="0.85">
            {temperatureK} K ({temp > 0 ? "+" : ""}{temp} °C)
          </text>
          <text x="160" y="165" textAnchor="middle" fontSize="9" fill="white" opacity="0.7">
            [FeSCN²⁺] = {concFeSCN.toFixed(4)} M
          </text>
        </svg>

        <div className="flex justify-around mt-3 text-[9px]" style={{ color: "var(--lab-text-subtle)" }}>
          <span><span style={{ color: "#ef4444" }}>●</span> Fe³⁺ = {concFe3.toFixed(4)} M</span>
          <span><span style={{ color: "#f97316" }}>●</span> SCN⁻ = {concSCN.toFixed(4)} M</span>
          <span><span style={{ color: "#7c3aed" }}>●</span> FeSCN²⁺ = {concFeSCN.toFixed(4)} M</span>
        </div>
      </div>
    </div>
  );
}
