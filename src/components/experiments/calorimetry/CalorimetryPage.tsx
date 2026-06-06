"use client";

import { useEffect, useState, startTransition } from "react";
import { motion }                                from "framer-motion";
import { useCalorimetryStore }                   from "@/lib/store/calorimetry-store";
import StepGuide                                 from "@/components/lab/StepGuide";
import ObservationPanel                          from "@/components/lab/ObservationPanel";
import StatusBar                                 from "@/components/lab/StatusBar";
import ResultModal                               from "@/components/lab/ResultModal";
import ContextPopup, { obsToPopup }              from "@/components/lab/ContextPopup";
import LabPageShell                              from "@/components/lab/LabPageShell";
import LabContextPanel                           from "@/components/lab/LabContextPanel";
import { calcCalorimetryTemp }                   from "@/lib/engine/calorimetry-engine";
import { EXPERIMENT_EDUCATION }                 from "@/lib/experiment-education";


export default function CalorimetryPage() {
  const [showPopup, setShowPopup] = useState(false);
  const store = useCalorimetryStore();

  useEffect(() => {
    store.hydrate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastObsId = store.observations[0]?.id;
  useEffect(() => {
    if (!lastObsId) return;
    startTransition(() => setShowPopup(true));
    const t = setTimeout(() => setShowPopup(false), 3200);
    return () => clearTimeout(t);
  }, [lastObsId]);


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

  const calorimetryLeftPanel = (
    <LabContextPanel
      title="Calorimetry"
      accent="#f59e0b"
      summary="Measure the enthalpy of neutralisation by recording the temperature rise when acid and base react in an insulated polystyrene cup calorimeter."
      formula="ΔH = −q / n = −(mcΔT) / n"
      formulaLabel="Enthalpy of neutralisation"
      facts={[
        { icon: "🧪", label: "HCl (flask)",   value: "25 mL, 2.0 M" },
        { icon: "🧪", label: "NaOH (burette)", value: "1.0 M" },
        { icon: "📐", label: "Specific heat",  value: "4.18 J g⁻¹ °C⁻¹" },
        { icon: "📚", label: "Literature ΔH",  value: "−57.1 kJ mol⁻¹" },
      ]}
      steps={[
        { number: 1, title: "Record T₀",      body: "Note the initial temperature before adding any NaOH." },
        { number: 2, title: "Add NaOH",        body: "Add NaOH in 5 mL or 10 mL portions. Watch the temperature rise." },
        { number: 3, title: "Find T_max",      body: "Temperature peaks at the equivalence point (equimolar HCl and NaOH)." },
        { number: 4, title: "Calculate ΔH",    body: "Use q = mcΔT, then ΔH = −q/n. Compare with −57.1 kJ mol⁻¹." },
      ]}
    />
  );

  return (
    <LabPageShell
      leftPanel={calorimetryLeftPanel}
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
      education={EXPERIMENT_EDUCATION.calorimetry}
      reactionNote={
        store.naohAddedMl > 0
          ? `HCl + NaOH → NaCl + H₂O · ΔT = ${(store.currentTempC - store.initialTempC).toFixed(1)} °C · q = ${((store.hclVolumeMl + store.naohAddedMl) * 4.18 * (store.currentTempC - store.initialTempC) / 1000).toFixed(2)} kJ${store.calculatedDeltaH !== null ? ` · ΔH = ${store.calculatedDeltaH.toFixed(1)} kJ/mol` : ""}`
          : "Add NaOH in measured portions — record temperature rise after each addition."
      }

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
      className="relative rounded-3xl overflow-hidden select-none"
      style={{
        aspectRatio: "300/240",
        width:       "100%",
        height:      "auto",
        maxHeight:   "100%",
        background: `radial-gradient(ellipse at 50% 25%, rgba(239,68,68,${0.06 + warmFrac * 0.10}) 0%, transparent 50%), linear-gradient(180deg, #fef2f2 0%, #fde8e8 40%, #fef2f4 100%)`,
        border: "1px solid rgba(148,163,184,0.28)",
        boxShadow:
          "0 24px 64px rgba(15,23,42,0.08), " +
          "0 4px 12px rgba(15,23,42,0.04), " +
          "0 0 0 1px rgba(255,255,255,0.92) inset",
        transition: "background 1s ease",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(239,68,68,0.14) 1px, transparent 1px)",
          backgroundSize:  "22px 22px",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          top: "-48px", left: "50%", transform: "translateX(-50%)",
          width: "288px", height: "192px",
          background: `radial-gradient(ellipse at center, rgba(239,68,68,${0.08 + warmFrac * 0.28}) 0%, transparent 70%)`,
          transition: "background 1.2s ease",
        }}
      />
      {/* Heat glow around cup when warm */}
      {warmFrac > 0.15 && (
        <div
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{
            bottom: "20%", left: "50%", transform: "translateX(-50%)",
            width: "200px", height: "100px",
            background: `radial-gradient(ellipse at center, rgba(${r},${g},${b},${warmFrac * 0.22}) 0%, transparent 70%)`,
            filter: "blur(16px)",
            transition: "background 1s ease",
            animation: warmFrac > 0.5 ? "lab-glow-pulse 2s ease-in-out infinite" : "none",
          }}
        />
      )}

      <svg
        viewBox="0 0 300 240"
        width="100%"
        style={{ display: "block", position: "relative", zIndex: 10 }}
        aria-label="Calorimeter"
        role="img"
      >
        <defs>
          <filter id="cal-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="rgba(0,0,0,0.50)" />
          </filter>
          <clipPath id="cal-cup-clip">
            <path d="M84 42 L74 194 Q74 208 94 208 L206 208 Q226 208 226 194 L216 42 Z" />
          </clipPath>
        </defs>

        {/* ── Lab bench — light theme ── */}
        <rect x="0" y="224" width="300" height="16" fill="#b8c4d0" />
        <rect x="0" y="220" width="300" height="6"  fill="#cbd5e1" />
        <rect x="0" y="220" width="300" height="2"  fill="rgba(255,255,255,0.55)" />

        <text x="150" y="18" textAnchor="middle" fontSize="9" fill="#3b6690" fontWeight="600">
          Calorimeter — HCl + NaOH
        </text>

        {/* ── Outer polystyrene cup — light gray ── */}
        <path d="M80 40 L70 195 Q70 210 90 210 L210 210 Q230 210 230 195 L220 40 Z"
              fill="rgba(255,255,255,0.52)" stroke="rgba(71,85,105,0.50)" strokeWidth="2"
              filter="url(#cal-shadow)" />
        {/* Inner cup wall — insulation layers */}
        <path d="M84 42 L74 194 Q74 208 94 208 L206 208 Q226 208 226 194 L216 42 Z"
              fill="rgba(241,245,249,0.72)" stroke="rgba(148,163,184,0.35)" strokeWidth="1.2" />
        <path d="M84 46 L84 194" stroke="rgba(255,255,255,0.45)" strokeWidth="4" strokeLinecap="round" />

        {/* Solution — rises from bottom, clipped to inner cup shape */}
        {totalMl > 0 && (() => {
          const maxVol = 125;
          const cupBottom = 208;
          const cupTop = 46;
          const liqH = Math.min(1, totalMl / maxVol) * (cupBottom - cupTop);
          const liqY = cupBottom - liqH;
          return (
            <motion.rect
              x="75" width="150"
              clipPath="url(#cal-cup-clip)"
              animate={{ y: liqY, height: Math.max(4, liqH), fill: solColor }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          );
        })()}

        {/* ── Temperature badge ── */}
        <rect x="105" y="108" width="90" height="42" rx="10"
              fill="rgba(255,255,255,0.96)" stroke="rgba(148,163,184,0.28)" strokeWidth="1.2"
              filter="url(#cal-shadow)" />
        <text x="150" y="130" textAnchor="middle" fontSize="19" fill={`rgb(${r},${g},${b})`} fontWeight="900" fontFamily="monospace">
          {currentTempC.toFixed(1)}
        </text>
        <text x="150" y="143" textAnchor="middle" fontSize="8.5" fill="#64748b" fontWeight="600">°C</text>

        {/* ── Thermometer ── */}
        <rect x="145" y="40" width="10" height="62" rx="5"
              fill="rgba(255,255,255,0.60)" stroke="rgba(148,163,184,0.50)" strokeWidth="1.2" />
        <motion.rect
          x="147"
          width="6"
          rx="3"
          animate={{
            y:      100 - warmFrac * 48,
            height: Math.max(4, 10 + warmFrac * 52),
            fill:   `rgb(${r},${g},${b})`,
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        <circle cx="150" cy="106" r="8" fill={`rgb(${r},${g},${b})`} style={{ transition: "fill 0.6s ease" }} />
        <circle cx="150" cy="106" r="4" fill="rgba(255,255,255,0.28)" />

        {/* ── Stirrer ── */}
        <line x1="192" y1="40" x2="186" y2="178" stroke="rgba(71,85,105,0.45)" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="192.5" y1="40" x2="186.5" y2="178" stroke="rgba(255,255,255,0.30)" strokeWidth="0.8" strokeLinecap="round" />
        <ellipse cx="184" cy="178" rx="13" ry="3.5" fill="none" stroke="rgba(71,85,105,0.40)" strokeWidth="1.5" />

        <text x="150" y="200" textAnchor="middle" fontSize="8.5" fill="#334155" fontWeight="700">
          ΔT = +{deltaT.toFixed(2)} °C
        </text>

        {/* ── Warm scale bar ── */}
        <text x="55"  y="216" fontSize="7" fill="#64748b">25°C</text>
        <text x="245" y="216" textAnchor="end" fontSize="7" fill="#64748b">
          {calcCalorimetryTemp(100).toFixed(0)}°C
        </text>
        <rect x="55" y="217" width="190" height="5" rx="2.5" fill="rgba(148,163,184,0.22)" />
        <motion.rect
          x="55" y="217" height="5" rx="2.5"
          animate={{ width: Math.round(190 * warmFrac) }}
          transition={{ duration: 0.8 }}
          fill={`rgb(${r},${g},${b})`}
        />
      </svg>
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
  const W = 280, H = 140;
  const pad = { l: 34, r: 12, t: 10, b: 24 };
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
      {/* Grid lines */}
      {[25, 27, 29, 31, 33].filter((t) => t >= yMin && t <= yMax).map((t) => (
        <g key={t}>
          <line x1={pad.l} y1={scaleY(t)} x2={W - pad.r} y2={scaleY(t)} stroke="#e2e8f0" strokeWidth="0.8" />
          <text x={pad.l - 4} y={scaleY(t) + 3.5} textAnchor="end" fontSize="8" fill="#94a3b8">{t}</text>
        </g>
      ))}

      {/* Axes */}
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + iH} stroke="#94a3b8" strokeWidth="1.2" />
      <line x1={pad.l} y1={pad.t + iH} x2={W - pad.r} y2={pad.t + iH} stroke="#94a3b8" strokeWidth="1.2" />

      {/* X-axis labels */}
      {[0, 50, 100].map((v) => (
        <text key={v} x={scaleX(v)} y={pad.t + iH + 14} textAnchor="middle" fontSize="8" fill="#94a3b8">{v}</text>
      ))}
      <text x={W / 2} y={H} textAnchor="middle" fontSize="8" fill="#64748b">mL NaOH added</text>

      {/* Equivalence point dashed line */}
      <line x1={scaleX(100)} y1={pad.t} x2={scaleX(100)} y2={pad.t + iH}
            stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 2" />
      <text x={scaleX(100)} y={pad.t - 2} textAnchor="middle" fontSize="7" fill="#94a3b8">equiv.</text>

      {/* Y-axis label */}
      <text x={8} y={pad.t + iH / 2} textAnchor="middle" fontSize="8" fill="#64748b"
        transform={`rotate(-90, 8, ${pad.t + iH / 2})`}>°C</text>

      {/* Data line */}
      {dataPoints.length > 1 && (
        <polyline points={pts} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      )}

      {/* Current point dot */}
      {dataPoints.length > 0 && (() => {
        const last = dataPoints[dataPoints.length - 1];
        return (
          <motion.circle cx={scaleX(last.naohVolumeMl)} cy={scaleY(last.tempC)} r={4}
            fill="#ef4444" stroke="white" strokeWidth="1.5"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
          />
        );
      })()}

      {/* Empty state hint */}
      {dataPoints.length === 0 && (
        <text x={W / 2} y={pad.t + iH / 2} textAnchor="middle" fontSize="9" fill="#cbd5e1" fontStyle="italic">
          Add NaOH to record points
        </text>
      )}
    </svg>
  );
}
