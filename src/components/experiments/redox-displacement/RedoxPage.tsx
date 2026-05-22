"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { motion }                                        from "framer-motion";
import { useRedoxDisplacementStore }                     from "@/lib/store/redox-displacement-store";
import StepGuide                                         from "@/components/lab/StepGuide";
import ObservationPanel                                  from "@/components/lab/ObservationPanel";
import StatusBar                                         from "@/components/lab/StatusBar";
import ResultModal                                       from "@/components/lab/ResultModal";
import ContextPopup, { obsToPopup }                      from "@/components/lab/ContextPopup";
import PreLabIntro                                       from "@/components/lab/PreLabIntro";
import LabPageShell                                      from "@/components/lab/LabPageShell";
import { METALS, cuSolutionColor, CUPRIC_INITIAL_CONC }  from "@/lib/engine/redox-displacement-engine";
import type { MetalId }                                  from "@/lib/engine/types";

const INTRO = {
  title:     "Redox Displacement — Metal Activity Series",
  objective: "Place different metals into copper(II) sulfate solution and observe whether displacement occurs. Compare reactivity using the electrochemical series and calculate the cell potential for each reaction.",
  apparatus: ["Beaker (100 mL)", "Metal rods/strips (Mg, Zn, Fe, Pb, Cu, Ag)", "CuSO₄ solution", "Tongs", "Sandpaper"],
  reagents: [
    { name: "CuSO₄ (copper sulfate)", concentration: "0.5 M — 100 mL" },
  ],
  safetyNotes: [
    "CuSO₄ is toxic if ingested — wash hands after contact.",
    "Use tongs to handle metal strips — avoid touching with bare hands.",
    "Magnesium reacts vigorously — add slowly and observe from a safe distance.",
    "Dispose of all solutions in heavy-metal waste containers.",
  ],
};

const METAL_ORDER: MetalId[] = ["magnesium", "zinc", "iron", "lead", "copper", "silver"];

export default function RedoxPage() {
  const [mounted, setMounted]     = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const store    = useRedoxDisplacementStore();
  const tickRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const popupRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    store.hydrate();
    startTransition(() => setMounted(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const lastObsId = store.observations[0]?.id;
  useEffect(() => {
    if (!lastObsId) return;
    startTransition(() => setShowPopup(true));
    if (popupRef.current) clearTimeout(popupRef.current);
    popupRef.current = setTimeout(() => setShowPopup(false), 3200);
  }, [lastObsId]);
  useEffect(() => () => { if (popupRef.current) clearTimeout(popupRef.current); }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  const lastObs       = store.observations[0];
  const popup         = lastObs ? obsToPopup(lastObs.type, lastObs.message) : null;
  const solColor      = cuSolutionColor(store.cupricConc);
  const metalProfile  = store.selectedMetal ? METALS[store.selectedMetal] : null;
  const pctConsumed   = ((CUPRIC_INITIAL_CONC - store.cupricConc) / CUPRIC_INITIAL_CONC) * 100;
  const cellPotential = metalProfile ? (0.34 - metalProfile.stdPotential) : null;

  const infoCards = metalProfile ? (
    <div
      className="rounded-xl p-4 text-xs"
      style={{
        background: "var(--lab-glass-heavy)",
        border:     "1px solid var(--lab-glass-border)",
        boxShadow:  "var(--lab-shadow-sm)",
      }}
    >
      <p className="font-semibold text-sm mb-2" style={{ color: "var(--lab-blue-600)" }}>
        {metalProfile.name} in CuSO₄
      </p>
      <div className="space-y-1.5 font-mono text-[10.5px]" style={{ color: "var(--lab-text-muted)" }}>
        <p>Oxidation: <strong>{metalProfile.halfEquation}</strong></p>
        <p>Reduction: <strong>Cu²⁺ + 2e⁻ → Cu  E° = +0.34 V</strong></p>
        {cellPotential !== null && (
          <p>E°cell = 0.34 − ({metalProfile.stdPotential.toFixed(2)}) = <strong
            style={{ color: cellPotential > 0 ? "#16a34a" : "#dc2626" }}>
            {cellPotential.toFixed(2)} V
          </strong></p>
        )}
      </div>
      {store.reactionOccurs && store.status === "running" && (
        <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--lab-slate-100)" }}>
          <motion.div
            animate={{ width: `${pctConsumed}%` }}
            transition={{ duration: 0.8 }}
            className="h-full rounded-full"
            style={{ background: "#b87333" }}
          />
        </div>
      )}
    </div>
  ) : undefined;

  const controls = (
    <div>
      <p
        className="text-[10px] font-semibold uppercase tracking-widest mb-2"
        style={{ color: "var(--lab-blue-600)" }}
      >
        Select Metal
      </p>
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {METAL_ORDER.map((id) => {
          const m = METALS[id];
          return (
            <button
              key={id}
              onClick={() => store.selectMetalAction(id)}
              disabled={store.status === "running" || store.status === "completed"}
              className="rounded-xl p-2 text-center border transition-all duration-150 hover:scale-105 disabled:opacity-40"
              style={{
                background:    store.selectedMetal === id ? `${m.rodColor}22` : "var(--lab-glass-heavy)",
                borderColor:   store.selectedMetal === id ? m.rodColor : "var(--lab-glass-border)",
                outline:       store.selectedMetal === id ? `2px solid ${m.rodColor}` : "none",
                outlineOffset: "1px",
              }}
            >
              <div className="w-4 h-4 rounded-full mx-auto mb-0.5" style={{ background: m.rodColor, border: "1px solid rgba(0,0,0,0.15)" }} />
              <span className="text-[9px] font-bold block" style={{ color: "var(--lab-text-secondary)" }}>
                {m.symbol}
              </span>
              <span className="text-[7px]" style={{ color: m.displacesCu ? "#16a34a" : "#ef4444" }}>
                {m.displacesCu ? "active" : "inactive"}
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={store.addMetalAction}
        disabled={!store.selectedMetal || store.status === "running" || store.status === "completed"}
        className="w-full py-1.5 text-xs font-semibold rounded-lg border transition-all hover:bg-blue-50 disabled:opacity-40"
        style={{ borderColor: "var(--lab-glass-border)", color: "var(--lab-blue-600)" }}
      >
        Place Metal in Solution
      </button>

      <button
        onClick={store.resetAction}
        className="mt-2 w-full py-1.5 text-xs font-semibold rounded-lg border transition-all hover:bg-red-50"
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
            { label: "[Cu²⁺]",    value: `${store.cupricConc.toFixed(3)} M` },
            { label: "Cu deposit", value: `${store.cuDepositedG.toFixed(3)} g` },
            ...(cellPotential !== null ? [{ label: "E°cell", value: `${cellPotential.toFixed(2)} V` }] : []),
          ]}
        />
      }

      workspace={
        <RedoxWorkspace
          solColor={solColor}
          metalProfile={metalProfile}
          cuDepositedG={store.cuDepositedG}
          metalMassG={store.metalMassG}
          isRunning={store.status === "running"}
          reactionOccurs={store.reactionOccurs}
        />
      }
      workspaceMaxW="max-w-sm"

      controls={controls}

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
          nextHref="/experiments/calorimetry"
          nextLabel="Next: Calorimetry →"
          observations={store.observations}
          experimentKey="redox-displacement"
        />
      }
    />
  );
}

// ── Inline workspace ──────────────────────────────────────────────────────────

function RedoxWorkspace({
  solColor, metalProfile, cuDepositedG, metalMassG, isRunning, reactionOccurs,
}: {
  solColor:      string;
  metalProfile:  typeof METALS[MetalId] | null;
  cuDepositedG:  number;
  metalMassG:    number;
  isRunning:     boolean;
  reactionOccurs: boolean;
}) {
  const rodColor    = metalProfile ? metalProfile.rodColor : "#a0a0a0";
  const depositFrac = metalMassG > 0 ? Math.min(1, cuDepositedG / (metalMassG * 0.5)) : 0;

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
          Metal rod in CuSO₄ solution
        </p>

        <svg viewBox="0 0 300 200" width="100%" aria-label="Redox displacement beaker">
          <path d="M60 30 L60 165 Q60 180 75 180 L225 180 Q240 180 240 165 L240 30"
                fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1="60" y1="30" x2="240" y2="30" stroke="#cbd5e1" strokeWidth="1.5" />

          <motion.rect x="61" y="70" width="178" height="109"
            animate={{ fill: solColor }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />

          <text x="250" y="72" fontSize="8" fill="#64748b">0.5 M</text>
          <text x="250" y="178" fontSize="8" fill="#64748b">0 M</text>

          {metalProfile && (
            <g>
              <rect x="138" y="25" width="24" height="145" rx="4"
                fill={rodColor} stroke="rgba(0,0,0,0.15)" strokeWidth="0.8" />
              {reactionOccurs && cuDepositedG > 0 && (
                <rect x="139" y={165 - depositFrac * 100} width="22"
                  height={depositFrac * 100}
                  rx="2"
                  fill="#b87333" opacity="0.85"
                />
              )}
              <text x="150" y="18" textAnchor="middle" fontSize="9" fill={rodColor} fontWeight="bold">
                {metalProfile.symbol}
              </text>
            </g>
          )}

          {isRunning && reactionOccurs && [0,1,2].map((i) => (
            <motion.circle key={i}
              cx={130 + i * 20} cy={165} r={2.5}
              fill="rgba(184,115,51,0.6)"
              animate={{ cy: [165, 120, 80], opacity: [0.8, 0.4, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: i * 0.7, ease: "easeOut" }}
            />
          ))}

          <text x="150" y="155" textAnchor="middle" fontSize="10" fill="#1d4ed8" opacity="0.8">
            CuSO₄
          </text>
          <text x="150" y="170" textAnchor="middle" fontSize="8.5" fill="#1d4ed8" opacity="0.7">
            [{cuDepositedG > 0
              ? (0.5 - (cuDepositedG / 63.55) / 0.1).toFixed(3)
              : "0.500"} M]
          </text>

          {cuDepositedG > 0.001 && (
            <text x="200" y="140" fontSize="8" fill="#b87333">
              Cu: {cuDepositedG.toFixed(3)}g
            </text>
          )}

          {metalProfile && !reactionOccurs && metalMassG > 0 && (
            <text x="150" y="130" textAnchor="middle" fontSize="10" fill="#64748b">
              No reaction
            </text>
          )}
        </svg>

        <div className="mt-2 flex justify-center gap-1">
          {METAL_ORDER.map((id) => {
            const m   = METALS[id];
            const act = m.displacesCu;
            return (
              <div key={id} className="flex flex-col items-center"
                style={{ opacity: metalProfile?.id === id ? 1 : 0.4 }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold"
                  style={{ background: act ? "#dcfce7" : "#fee2e2", color: act ? "#16a34a" : "#dc2626" }}>
                  {m.symbol}
                </div>
                <span className="text-[6px] mt-0.5" style={{ color: act ? "#16a34a" : "#dc2626" }}>
                  {act ? "↑" : "✗"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
