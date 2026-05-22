"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { motion }                                        from "framer-motion";
import { useGasCollectionStore }                         from "@/lib/store/gas-collection-store";
import StepGuide                                         from "@/components/lab/StepGuide";
import ObservationPanel                                  from "@/components/lab/ObservationPanel";
import StatusBar                                         from "@/components/lab/StatusBar";
import ResultModal                                       from "@/components/lab/ResultModal";
import ContextPopup, { obsToPopup }                      from "@/components/lab/ContextPopup";
import PreLabIntro                                       from "@/components/lab/PreLabIntro";
import LabPageShell                                      from "@/components/lab/LabPageShell";
import { COLLECTION_CAP_ML, CACO3_MOLAR_MASS }           from "@/lib/engine/gas-collection-engine";

const INTRO = {
  title:     "Gas Collection — CO₂ from Marble Chips",
  objective: "React marble chips (CaCO₃) with hydrochloric acid (HCl) and collect the CO₂ gas produced by upward displacement of air. Measure the volume collected and compare to the stoichiometric theoretical value.",
  apparatus: ["Conical flask (250 mL)", "Delivery tube + bung", "Inverted measuring cylinder", "Water trough", "Balance", "Dropping funnel"],
  reagents: [
    { name: "CaCO₃ (marble chips)", concentration: "solid, ~1 g per test" },
    { name: "HCl (hydrochloric acid)", concentration: "1.0 M" },
  ],
  safetyNotes: [
    "HCl is corrosive — wear gloves and eye protection.",
    "CO₂ displaces oxygen — ensure ventilation.",
    "Handle glassware carefully — check all joints are tight before starting.",
    "If acid spills, neutralise with sodium bicarbonate and rinse with water.",
  ],
};

export default function GasCollectionPage() {
  const [mounted, setMounted]       = useState(false);
  const [showPopup, setShowPopup]   = useState(false);
  const [chipsToAdd, setChipsToAdd] = useState(1);
  const [hclToAdd, setHclToAdd]     = useState(25);
  const store    = useGasCollectionStore();
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

  const lastObs   = store.observations[0];
  const popup     = lastObs ? obsToPopup(lastObs.type, lastObs.message) : null;
  const pctFilled = (store.co2CollectedMl / COLLECTION_CAP_ML) * 100;
  const yieldPct  = store.theoreticalCo2Ml > 0
    ? (store.co2CollectedMl / store.theoreticalCo2Ml) * 100
    : 0;

  const stoichCard = (
    <div
      className="rounded-xl p-4 text-xs"
      style={{
        background: "var(--lab-glass-heavy)",
        border:     "1px solid var(--lab-glass-border)",
        boxShadow:  "var(--lab-shadow-sm)",
      }}
    >
      <p className="font-semibold text-sm mb-3" style={{ color: "var(--lab-blue-600)" }}>
        Stoichiometry Check
      </p>
      <div className="space-y-2 font-mono text-[10.5px]" style={{ color: "var(--lab-text-muted)" }}>
        <p>CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂</p>
        <p>Moles CaCO₃: <strong>{(store.caco3Grams / CACO3_MOLAR_MASS).toFixed(5)} mol</strong></p>
        <p>Moles HCl: <strong>{((store.hclVolumeMl / 1000) * 1.0).toFixed(5)} mol</strong></p>
        <p>Expected CO₂: <strong>{store.theoreticalCo2Ml.toFixed(0)} mL</strong></p>
        <p>Collected: <strong style={{ color: "#16a34a" }}>{store.co2CollectedMl.toFixed(0)} mL</strong></p>
        {store.theoreticalCo2Ml > 0 && (
          <p>Yield: <strong style={{ color: yieldPct > 90 ? "#16a34a" : "#d97706" }}>
            {yieldPct.toFixed(1)}%
          </strong></p>
        )}
      </div>
    </div>
  );

  const controls = (
    <div className="space-y-3">
      <div>
        <label
          className="text-[10px] font-semibold uppercase tracking-widest block mb-1.5"
          style={{ color: "var(--lab-text-muted)" }}
        >
          Marble chips
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="range" min={0.5} max={5} step={0.5}
            value={chipsToAdd}
            onChange={(e) => setChipsToAdd(Number(e.target.value))}
            className="flex-1"
            disabled={store.status === "completed"}
          />
          <span className="text-xs tabular-nums w-10 text-right" style={{ color: "var(--lab-text-secondary)" }}>
            {chipsToAdd}g
          </span>
        </div>
        <button
          onClick={() => store.addChipsAction(chipsToAdd)}
          disabled={store.status === "completed"}
          className="mt-1.5 w-full py-1.5 text-xs font-semibold rounded-lg border transition-all hover:bg-blue-50 disabled:opacity-40"
          style={{ borderColor: "var(--lab-glass-border)", color: "var(--lab-blue-600)" }}
        >
          + Add CaCO₃
        </button>
      </div>

      <div>
        <label
          className="text-[10px] font-semibold uppercase tracking-widest block mb-1.5"
          style={{ color: "var(--lab-text-muted)" }}
        >
          Hydrochloric acid
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="range" min={10} max={100} step={10}
            value={hclToAdd}
            onChange={(e) => setHclToAdd(Number(e.target.value))}
            className="flex-1"
            disabled={store.status === "completed"}
          />
          <span className="text-xs tabular-nums w-14 text-right" style={{ color: "var(--lab-text-secondary)" }}>
            {hclToAdd} mL
          </span>
        </div>
        <button
          onClick={() => store.addHClAction(hclToAdd)}
          disabled={store.status === "completed" || store.caco3Grams <= 0}
          className="mt-1.5 w-full py-1.5 text-xs font-semibold rounded-lg border transition-all hover:bg-green-50 disabled:opacity-40"
          style={{ borderColor: "var(--lab-glass-border)", color: "#16a34a" }}
        >
          + Add HCl (1.0 M)
        </button>
      </div>

      <button
        onClick={store.resetAction}
        className="w-full py-1.5 text-xs font-semibold rounded-lg border transition-all hover:bg-red-50"
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
            { label: "CaCO₃",         value: `${store.caco3Grams.toFixed(1)} g` },
            { label: "HCl",           value: `${store.hclVolumeMl.toFixed(0)} mL` },
            { label: "CO₂ collected", value: `${store.co2CollectedMl.toFixed(0)} mL` },
            { label: "Theoretical",   value: `${store.theoreticalCo2Ml.toFixed(0)} mL` },
            ...(store.theoreticalCo2Ml > 0 ? [{ label: "Yield", value: `${yieldPct.toFixed(1)}%` }] : []),
          ]}
        />
      }

      workspace={
        <GasCollectionWorkspace
          caco3Grams={store.caco3Grams}
          hclVolumeMl={store.hclVolumeMl}
          co2CollectedMl={store.co2CollectedMl}
          pctFilled={pctFilled}
          isRunning={store.status === "running"}
        />
      }
      workspaceMaxW="max-w-sm"

      centerBottom={stoichCard}

      controls={controls}

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
          nextHref="/experiments/redox-displacement"
          nextLabel="Next: Redox Displacement →"
          observations={store.observations}
          experimentKey="gas-collection"
        />
      }
    />
  );
}

// ── Inline workspace ──────────────────────────────────────────────────────────

function GasCollectionWorkspace({
  caco3Grams, hclVolumeMl, co2CollectedMl, pctFilled, isRunning,
}: {
  caco3Grams:     number;
  hclVolumeMl:    number;
  co2CollectedMl: number;
  pctFilled:      number;
  isRunning:      boolean;
}) {
  const flaskHasLiquid = hclVolumeMl > 0;
  const flaskColor     = hclVolumeMl > 0 ? "rgba(220,240,255,0.8)" : "transparent";
  const hasChips       = caco3Grams > 0;

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
          CaCO₃ + 2HCl → CO₂ gas collection
        </p>

        <svg viewBox="0 0 340 220" width="100%" aria-label="Gas collection apparatus">
          {/* Conical flask */}
          <path d="M120 30 L120 80 L80 170 Q80 185 95 185 L185 185 Q200 185 200 170 L160 80 L160 30 Z"
                fill={flaskHasLiquid ? flaskColor : "rgba(240,248,255,0.3)"}
                stroke="#94a3b8" strokeWidth="1.5" />
          {hasChips && [0,1,2,3,4].map((i) => (
            <ellipse key={i}
              cx={110 + (i % 3) * 18} cy={175 - Math.floor(i / 3) * 8}
              rx="7" ry="4"
              fill="#d4d4d4" stroke="#a3a3a3" strokeWidth="0.8" opacity="0.9"
            />
          ))}
          {flaskHasLiquid && (
            <text x="140" y="160" textAnchor="middle" fontSize="9" fill="#475569">
              HCl {hclVolumeMl}mL
            </text>
          )}
          {isRunning && [1,2,3].map((i) => (
            <motion.circle key={i}
              cx={125 + i * 15} r={3} fill="white" fillOpacity="0.7"
              initial={{ cy: 170 }} animate={{ cy: 90, fillOpacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.5, ease: "easeOut" }}
            />
          ))}
          <rect x="119" y="22" width="42" height="12" rx="3" fill="#475569" />

          {/* Delivery tube */}
          <path d="M140 22 L140 10 L260 10 L260 40"
                fill="none" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />

          {/* Inverted collection cylinder */}
          <rect x="240" y="40" width="40" height="160" rx="4" fill="rgba(240,248,255,0.5)" stroke="#94a3b8" strokeWidth="1.5" />
          <motion.rect
            x="241" y="41" width="38"
            animate={{ height: (pctFilled / 100) * 158 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            rx="3"
            fill="rgba(186,230,253,0.5)"
          />
          <text x="260" y="125" textAnchor="middle" fontSize="9" fill="#0369a1">CO₂</text>
          <text x="260" y="138" textAnchor="middle" fontSize="8" fill="#0369a1">
            {co2CollectedMl.toFixed(0)} mL
          </text>
          {[100,200,300,400,500,600].map((ml) => {
            const y = 41 + (ml / COLLECTION_CAP_ML) * 158;
            return (
              <g key={ml}>
                <line x1="240" y1={y} x2="248" y2={y} stroke="#94a3b8" strokeWidth="0.7" />
                <text x="237" y={y + 3} textAnchor="end" fontSize="7" fill="#94a3b8">{ml}</text>
              </g>
            );
          })}
          <rect x="240" y="194" width="40" height="7" rx="2" fill="rgba(186,230,253,0.8)" />

          <text x="140" y="208" textAnchor="middle" fontSize="9" fill="#64748b">Flask</text>
          <text x="260" y="208" textAnchor="middle" fontSize="9" fill="#64748b">Collection tube</text>
        </svg>
      </div>
    </div>
  );
}
