"use client";

import { useEffect, useState, startTransition } from "react";
import { motion }                                from "framer-motion";
import { useCalorimetryStore }                   from "@/lib/store/calorimetry-store";
import StepGuide                                 from "@/components/lab/StepGuide";
import ObservationPanel                          from "@/components/lab/ObservationPanel";
import StatusBar                                 from "@/components/lab/StatusBar";
import ResultModal                               from "@/components/lab/ResultModal";
import ContextPopup, { obsToPopup }              from "@/components/lab/ContextPopup";
import PreLabIntro                               from "@/components/lab/PreLabIntro";
import LabPageShell                              from "@/components/lab/LabPageShell";
import { calcCalorimetryTemp }                   from "@/lib/engine/calorimetry-engine";

const INTRO = {
  title:     "Calorimetry — Heat of Neutralisation",
  objective: "Add sodium hydroxide (NaOH) to hydrochloric acid (HCl) in a polystyrene calorimeter and record the temperature at each addition. Plot temperature vs. volume of NaOH to find the equivalence point, then calculate the molar enthalpy of neutralisation.",
  apparatus: ["Polystyrene cup calorimeter", "Thermometer (0.1 °C precision)", "Burette (50 mL)", "Measuring cylinder", "Stirring rod"],
  reagents: [
    { name: "HCl (hydrochloric acid)", concentration: "1.0 M — 100 mL" },
    { name: "NaOH (sodium hydroxide)", concentration: "1.0 M" },
  ],
  safetyNotes: [
    "Both HCl and NaOH are corrosive — wear gloves and eye protection.",
    "Handle the calorimeter carefully — polystyrene is fragile.",
    "Ensure thorough mixing after each addition before reading temperature.",
    "Do not exceed 80 °C — this indicates a calculation error.",
  ],
};

export default function CalorimetryPage() {
  const [mounted, setMounted]     = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const store = useCalorimetryStore();

  useEffect(() => {
    store.hydrate();
    startTransition(() => setMounted(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastObsId = store.observations[0]?.id;
  useEffect(() => {
    if (!lastObsId) return;
    startTransition(() => setShowPopup(true));
    const t = setTimeout(() => setShowPopup(false), 3200);
    return () => clearTimeout(t);
  }, [lastObsId]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  const lastObs        = store.observations[0];
  const popup          = lastObs ? obsToPopup(lastObs.type, lastObs.message) : null;
  const deltaT         = store.currentTempC - store.initialTempC;
  const maxTemp        = calcCalorimetryTemp(100);
  const hclMoles       = (store.hclVolumeMl / 1000) * store.hclConc;
  const naohMoles      = (store.naohAddedMl / 1000) * store.naohConc;
  const pctNeutralised = Math.min(100, (naohMoles / hclMoles) * 100);

  const tempGraph = (
    <div
      className="rounded-xl p-4"
      style={{
        background: "var(--lab-glass-heavy)",
        border:     "1px solid var(--lab-glass-border)",
        boxShadow:  "var(--lab-shadow-sm)",
      }}
    >
      <p className="text-xs font-semibold mb-3" style={{ color: "var(--lab-blue-600)" }}>
        Temperature vs. NaOH Volume
      </p>
      <TempGraph
        dataPoints={store.dataPoints}
        maxTemp={maxTemp + 2}
        initialTemp={store.initialTempC}
      />
      {store.calculatedDeltaH !== null && (
        <div
          className="mt-3 p-2 rounded-lg text-[10.5px]"
          style={{ background: "rgba(5,150,105,0.07)", border: "1px solid rgba(5,150,105,0.2)" }}
        >
          <span className="font-semibold" style={{ color: "#059669" }}>ΔH = </span>
          <span style={{ color: "var(--lab-text-secondary)" }}>{store.calculatedDeltaH.toFixed(1)} kJ/mol</span>
          <span className="ml-2 text-[9px]" style={{ color: "var(--lab-text-subtle)" }}>
            (literature: −57.1 kJ/mol)
          </span>
        </div>
      )}
    </div>
  );

  const controls = (
    <div className="space-y-3">
      <div>
        <p
          className="text-[10px] font-semibold uppercase tracking-widest mb-2"
          style={{ color: "var(--lab-blue-600)" }}
        >
          Add NaOH (1.0 M)
        </p>
        <p className="text-[10px] mb-3" style={{ color: "var(--lab-text-muted)" }}>
          Added: {store.naohAddedMl} / 100 mL
        </p>
        <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: "var(--lab-slate-100)" }}>
          <motion.div
            animate={{ width: `${Math.min(100, (store.naohAddedMl / 100) * 100)}%` }}
            transition={{ duration: 0.4 }}
            className="h-full rounded-full"
            style={{ background: pctNeutralised >= 100 ? "#16a34a" : "var(--lab-blue-600)" }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => store.addNaOHAction(5)}
            disabled={store.status === "completed" || store.naohAddedMl >= 120}
            className="py-2 text-xs font-semibold rounded-lg border transition-all hover:bg-blue-50 disabled:opacity-40"
            style={{ borderColor: "var(--lab-glass-border)", color: "var(--lab-blue-600)" }}
          >
            +5 mL
          </button>
          <button
            onClick={() => store.addNaOHAction(10)}
            disabled={store.status === "completed" || store.naohAddedMl >= 120}
            className="py-2 text-xs font-semibold rounded-lg border transition-all hover:bg-blue-50 disabled:opacity-40"
            style={{ borderColor: "var(--lab-glass-border)", color: "var(--lab-blue-600)" }}
          >
            +10 mL
          </button>
        </div>

        <div
          className="mt-2 p-2 rounded-lg text-[10px]"
          style={{ background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.1)" }}
        >
          <p className="font-semibold mb-1" style={{ color: "var(--lab-blue-600)" }}>Formula:</p>
          <p className="font-mono" style={{ color: "var(--lab-text-muted)" }}>
            q = m × 4.18 × ΔT<br />
            ΔH = −q / n (kJ/mol)
          </p>
        </div>
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
            { label: "T",          value: `${store.currentTempC.toFixed(2)} °C` },
            { label: "ΔT",         value: `+${deltaT.toFixed(2)} °C` },
            { label: "NaOH added", value: `${store.naohAddedMl} mL` },
            { label: "Neutralised", value: `${pctNeutralised.toFixed(1)}%` },
            ...(store.calculatedDeltaH !== null
              ? [{ label: "ΔH", value: `${store.calculatedDeltaH.toFixed(1)} kJ/mol` }]
              : []),
          ]}
        />
      }

      workspace={
        <CalorimetryWorkspace
          currentTempC={store.currentTempC}
          initialTempC={store.initialTempC}
          naohAddedMl={store.naohAddedMl}
          hclVolumeMl={store.hclVolumeMl}
        />
      }
      workspaceMaxW="max-w-sm"

      centerBottom={tempGraph}

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
          nextHref="/experiments/chemical-equilibrium"
          nextLabel="← Back: Equilibrium"
          observations={store.observations}
          experimentKey="calorimetry"
        />
      }
    />
  );
}

// ── Calorimeter workspace ─────────────────────────────────────────────────────

function CalorimetryWorkspace({
  currentTempC, initialTempC, naohAddedMl, hclVolumeMl,
}: {
  currentTempC: number;
  initialTempC: number;
  naohAddedMl:  number;
  hclVolumeMl:  number;
}) {
  const deltaT   = currentTempC - initialTempC;
  const maxDT    = calcCalorimetryTemp(100) - initialTempC;
  const warmFrac = Math.min(1, deltaT / maxDT);
  const r        = Math.round(220 + warmFrac * 35);
  const g        = Math.round(240 - warmFrac * 100);
  const b        = Math.round(255 - warmFrac * 180);
  const solColor = `rgb(${r},${g},${b})`;
  const totalMl  = hclVolumeMl + naohAddedMl;

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
          Calorimeter — HCl + NaOH
        </p>

        <svg viewBox="0 0 300 200" width="100%" aria-label="Calorimeter">
          <path d="M80 40 L70 180 Q70 190 90 190 L210 190 Q230 190 230 180 L220 40 Z"
                fill="rgba(248,250,252,0.9)" stroke="#cbd5e1" strokeWidth="1.5" />
          <path d="M75 40 L65 185 Q65 198 90 198 L210 198 Q235 198 235 185 L225 40 Z"
                fill="none" stroke="#e2e8f0" strokeWidth="3" />

          <motion.path
            d={`M81 80 L${81 + (totalMl - 100) * 0.3} 80 L${221 - (totalMl - 100) * 0.3} 80 L221 80 L${225 - (totalMl - 100) * 0.3} 185 Q225 190 210 190 L90 190 Q75 190 ${75 + (totalMl - 100) * 0.3} 185 Z`}
            animate={{ fill: solColor }}
            transition={{ duration: 1, ease: "easeOut" }}
          />

          <rect x="105" y="100" width="90" height="36" rx="8"
                fill="rgba(255,255,255,0.85)" stroke="#cbd5e1" strokeWidth="1" />
          <text x="150" y="119" textAnchor="middle" fontSize="16" fill="#0f172a" fontWeight="bold">
            {currentTempC.toFixed(1)}
          </text>
          <text x="150" y="131" textAnchor="middle" fontSize="8.5" fill="#64748b">°C</text>

          <rect x="145" y="40" width="10" height="55" rx="5" fill="white" stroke="#94a3b8" strokeWidth="1" />
          <motion.rect
            x="147" y={94 - warmFrac * 40}
            width="6"
            animate={{ height: 40 + warmFrac * 40 }}
            transition={{ duration: 0.6 }}
            rx="3"
            fill="#ef4444"
          />
          <circle cx="150" cy="98" r="7" fill="#ef4444" />

          <line x1="190" y1="40" x2="185" y2="170" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="183" cy="170" rx="12" ry="3" fill="none" stroke="#94a3b8" strokeWidth="1.5" />

          <text x="150" y="178" textAnchor="middle" fontSize="8.5" fill="white" opacity="0.9">
            ΔT = +{deltaT.toFixed(2)} °C
          </text>
        </svg>

        <div className="mt-2">
          <div className="flex justify-between text-[9px] mb-1" style={{ color: "var(--lab-text-subtle)" }}>
            <span>25 °C (initial)</span>
            <span>{calcCalorimetryTemp(100).toFixed(1)} °C (max)</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "linear-gradient(90deg, #bfdbfe, #fca5a5)" }}>
            <motion.div
              animate={{ width: `${(warmFrac * 100).toFixed(1)}%` }}
              transition={{ duration: 0.8 }}
              className="h-full rounded-full"
              style={{ background: `rgb(${r},${g},${b})` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Temperature graph ─────────────────────────────────────────────────────────

function TempGraph({
  dataPoints, maxTemp, initialTemp,
}: {
  dataPoints:  Array<{ naohVolumeMl: number; tempC: number }>;
  maxTemp:     number;
  initialTemp: number;
}) {
  const W = 240, H = 100;
  const pad = { l: 30, r: 10, t: 8, b: 20 };
  const iW  = W - pad.l - pad.r;
  const iH  = H - pad.t - pad.b;

  const xMax = 120;
  const yMin = initialTemp - 1;
  const yMax = maxTemp;

  const scaleX = (v: number) => pad.l + (v / xMax) * iW;
  const scaleY = (t: number) => pad.t + iH - ((t - yMin) / (yMax - yMin)) * iH;

  const pts = dataPoints.map((p) => `${scaleX(p.naohVolumeMl).toFixed(1)},${scaleY(p.tempC).toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" aria-label="Temperature graph">
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + iH} stroke="#e2e8f0" strokeWidth="1" />
      <line x1={pad.l} y1={pad.t + iH} x2={W - pad.r} y2={pad.t + iH} stroke="#e2e8f0" strokeWidth="1" />

      {[25, 27, 29, 31, 33].filter((t) => t >= yMin && t <= yMax).map((t) => (
        <g key={t}>
          <line x1={pad.l} y1={scaleY(t)} x2={W - pad.r} y2={scaleY(t)} stroke="#f1f5f9" strokeWidth="0.8" />
          <text x={pad.l - 3} y={scaleY(t) + 3} textAnchor="end" fontSize="7" fill="#94a3b8">{t}</text>
        </g>
      ))}

      {[0, 50, 100].map((v) => (
        <text key={v} x={scaleX(v)} y={H - 5} textAnchor="middle" fontSize="7" fill="#94a3b8">{v}</text>
      ))}
      <text x={W / 2} y={H} textAnchor="middle" fontSize="7" fill="#94a3b8">mL NaOH</text>

      <line x1={scaleX(100)} y1={pad.t} x2={scaleX(100)} y2={pad.t + iH}
            stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 2" />

      {dataPoints.length > 1 && (
        <polyline points={pts} fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      )}

      {dataPoints.length > 0 && (() => {
        const last = dataPoints[dataPoints.length - 1];
        return (
          <circle cx={scaleX(last.naohVolumeMl)} cy={scaleY(last.tempC)} r={3}
                  fill="#ef4444" stroke="white" strokeWidth="1" />
        );
      })()}
    </svg>
  );
}
