"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { motion }                                        from "framer-motion";
import { useGasCollectionStore }                         from "@/lib/store/gas-collection-store";
import StepGuide                                         from "@/components/lab/StepGuide";
import ObservationPanel                                  from "@/components/lab/ObservationPanel";
import StatusBar                                         from "@/components/lab/StatusBar";
import ResultModal                                       from "@/components/lab/ResultModal";
import ContextPopup, { obsToPopup }                      from "@/components/lab/ContextPopup";
import LabPageShell                                      from "@/components/lab/LabPageShell";
import LabContextPanel                                   from "@/components/lab/LabContextPanel";
import { COLLECTION_CAP_ML, CACO3_MOLAR_MASS }           from "@/lib/engine/gas-collection-engine";
import { EXPERIMENT_EDUCATION }                          from "@/lib/experiment-education";

export default function GasCollectionPage() {
  const [showPopup, setShowPopup]   = useState(false);
  const [chipsToAdd, setChipsToAdd] = useState(1);
  const [hclToAdd, setHclToAdd]     = useState(25);
  const store    = useGasCollectionStore();
  const tickRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const popupRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    store.hydrate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (store.status === "running") {
      tickRef.current = setInterval(() => store.tickAction(1), 1000);
    } else {
      if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    }
    return () => { if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; } };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.status]);

  const lastObsId = store.observations[0]?.id;
  useEffect(() => {
    if (!lastObsId) return;
    startTransition(() => setShowPopup(true));
    if (popupRef.current) clearTimeout(popupRef.current);
    popupRef.current = setTimeout(() => setShowPopup(false), 3200);
  }, [lastObsId]);
  useEffect(() => () => { if (popupRef.current) clearTimeout(popupRef.current); }, []);


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
      {/* Step guidance */}
      <div style={{
        borderRadius: 10, overflow: "hidden",
        border: "1px solid rgba(16,185,129,0.22)",
      }}>
        <div style={{
          padding: "6px 12px",
          background: "rgba(16,185,129,0.07)",
          borderBottom: "1px solid rgba(16,185,129,0.14)",
        }}>
          <p style={{ fontSize: 9.5, fontWeight: 800, color: "#059669", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {store.status === "idle" || store.status === "setup" ? "Setup" : store.status === "running" ? "Reaction in progress" : "Complete"}
          </p>
        </div>
        <div style={{ padding: "8px 12px" }}>
          {!store.caco3Grams && (
            <p style={{ fontSize: 10.5, color: "#334155", margin: 0, lineHeight: 1.55 }}>
              <strong>Step 1:</strong> Add marble chips (CaCO₃) — these react with acid to produce CO₂ gas.
            </p>
          )}
          {store.caco3Grams > 0 && store.hclVolumeMl === 0 && (
            <p style={{ fontSize: 10.5, color: "#334155", margin: 0, lineHeight: 1.55 }}>
              <strong>Step 2:</strong> Add dilute hydrochloric acid (HCl). When it meets the marble, CO₂ is produced.
            </p>
          )}
          {store.caco3Grams > 0 && store.hclVolumeMl > 0 && store.status === "setup" && (
            <p style={{ fontSize: 10.5, color: "#334155", margin: 0, lineHeight: 1.55 }}>
              <strong>Step 3:</strong> Click <em>Start Reaction</em>. CO₂ travels through the tube and pushes water out of the inverted cylinder.
            </p>
          )}
          {store.status === "running" && (
            <p style={{ fontSize: 10.5, color: "#334155", margin: 0, lineHeight: 1.55 }}>
              CO₂ is pushing water down and out of the cylinder. Volume = {store.co2CollectedMl.toFixed(0)} mL collected.
            </p>
          )}
        </div>
      </div>

      {/* CaCO₃ reagent card */}
      <div
        className="rounded-xl p-3 space-y-2"
        style={{ background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.14)" }}
      >
        <div className="flex items-center justify-between">
          <label
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "var(--lab-blue-600)" }}
          >
            CaCO₃ — Marble chips
          </label>
          <span
            className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-md"
            style={{ background: "rgba(37,99,235,0.10)", color: "var(--lab-blue-600)" }}
          >
            {chipsToAdd} g
          </span>
        </div>
        <input
          type="range" min={0.5} max={5} step={0.5}
          value={chipsToAdd}
          onChange={(e) => setChipsToAdd(Number(e.target.value))}
          className="w-full"
          disabled={store.status === "completed"}
        />
        <button
          onClick={() => store.addChipsAction(chipsToAdd)}
          disabled={store.status === "completed"}
          className="w-full py-2 text-xs font-bold rounded-lg transition-all active:scale-95 disabled:opacity-40"
          style={{
            background:  store.status === "completed" ? "var(--lab-glass)" : "rgba(37,99,235,0.12)",
            border:      "1px solid rgba(37,99,235,0.30)",
            color:       "var(--lab-blue-600)",
          }}
        >
          + Add CaCO₃
        </button>
      </div>

      {/* HCl reagent card */}
      <div
        className="rounded-xl p-3 space-y-2"
        style={{ background: "rgba(5,150,105,0.05)", border: "1px solid rgba(5,150,105,0.14)" }}
      >
        <div className="flex items-center justify-between">
          <label
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "#059669" }}
          >
            HCl — 1.0 M acid
          </label>
          <span
            className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-md"
            style={{ background: "rgba(5,150,105,0.10)", color: "#059669" }}
          >
            {hclToAdd} mL
          </span>
        </div>
        <input
          type="range" min={10} max={100} step={10}
          value={hclToAdd}
          onChange={(e) => setHclToAdd(Number(e.target.value))}
          className="w-full"
          disabled={store.status === "completed"}
        />
        <button
          onClick={() => store.addHClAction(hclToAdd)}
          disabled={store.status === "completed" || store.caco3Grams <= 0}
          className="w-full py-2 text-xs font-bold rounded-lg transition-all active:scale-95 disabled:opacity-40"
          style={{
            background:  (store.status === "completed" || store.caco3Grams <= 0) ? "var(--lab-glass)" : "rgba(5,150,105,0.10)",
            border:      "1px solid rgba(5,150,105,0.28)",
            color:       "#059669",
          }}
        >
          + Add HCl (1.0 M)
        </button>
        {store.caco3Grams <= 0 && (
          <p className="text-[9px]" style={{ color: "var(--lab-text-subtle)" }}>
            Add marble chips first
          </p>
        )}
      </div>

      {/* Environmental Conditions */}
      <div className="lab-ctrl-section mb-3">
        <div className="lab-ctrl-section-hdr">
          <span>🌡</span>
          <span className="lab-ctrl-section-hdr-title">Environmental Conditions</span>
        </div>
        <div className="p-3 space-y-3">
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="font-medium">Water Temp</span>
              <span className="font-bold text-sky-600">{store.temperature} °C</span>
            </div>
            <input
              type="range" min={10} max={60} step={1}
              value={store.temperature}
              onChange={(e) => store.updateParametersAction({ temperature: Number(e.target.value) })}
              disabled={store.status === "running" || store.status === "completed"}
              className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-sky-600"
            />
          </div>
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="font-medium">Atmospheric Pressure</span>
              <span className="font-bold text-sky-600">{store.pressure.toFixed(2)} atm</span>
            </div>
            <input
              type="range" min={0.8} max={1.2} step={0.02}
              value={store.pressure}
              onChange={(e) => store.updateParametersAction({ pressure: Number(e.target.value) })}
              disabled={store.status === "running" || store.status === "completed"}
              className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-sky-600"
            />
          </div>
        </div>
      </div>

      {/* Apparatus Condition */}
      <div className="lab-ctrl-section mb-3">
        <div className="lab-ctrl-section-hdr">
          <span>🔧</span>
          <span className="lab-ctrl-section-hdr-title">Apparatus Condition</span>
        </div>
        <div className="p-3 space-y-3">
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="font-medium">Apparatus Leak Rate</span>
              <span className="font-bold text-red-600">{store.leakRate} %</span>
            </div>
            <input
              type="range" min={0} max={25} step={1}
              value={store.leakRate}
              onChange={(e) => store.updateParametersAction({ leakRate: Number(e.target.value) })}
              disabled={store.status === "running" || store.status === "completed"}
              className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-red-600"
            />
          </div>
        </div>
      </div>

      <button
        onClick={store.resetAction}
        className="w-full py-1.5 text-xs font-semibold rounded-lg border transition-all hover:bg-red-50 active:scale-95"
        style={{ borderColor: "var(--lab-glass-border)", color: "var(--lab-text-muted)" }}
      >
        Reset Experiment
      </button>
    </div>
  );

  const gasLeftPanel = (
    <LabContextPanel
      title="Gas Collection"
      accent="#10b981"
      summary="Collect CO₂ by downward displacement of water (water displacement method). The gas produced pushes water out of an inverted graduated cylinder."
      formula="CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑"
      formulaLabel="Reaction equation"
      facts={[
        { icon: "⚗️", label: "Gas source",    value: "Marble chips + dilute HCl" },
        { icon: "💧", label: "Collection",     value: "Water displacement method" },
        { icon: "📐", label: "Molar volume",   value: "24 L mol⁻¹ at RTP" },
        { icon: "📊", label: "Yield check",    value: "n(CO₂) = m(CaCO₃) / 100 g/mol" },
      ]}
      steps={[
        { number: 1, title: "Add marble chips",   body: "Set the mass of CaCO₃ (marble chips) using the slider. More mass = more CO₂." },
        { number: 2, title: "Pour HCl",           body: "Add a measured volume of dilute HCl. Concentration affects the reaction rate." },
        { number: 3, title: "Start reaction",     body: "Click Start to initiate. CO₂ bubbles through the tubing into the collection cylinder." },
        { number: 4, title: "Calculate yield",    body: "Compare collected volume to the theoretical prediction using stoichiometry." },
      ]}
    />
  );

  return (
    <LabPageShell
      leftPanel={gasLeftPanel}
      statusBar={
        <StatusBar
          status={store.status}
          error={store.lastError}
          metrics={[
            { label: "CaCO₃",         value: `${store.caco3Grams.toFixed(1)} g` },
            { label: "HCl",           value: `${store.hclVolumeMl.toFixed(0)} mL` },
            { label: "CO₂ collected", value: `${store.co2CollectedMl.toFixed(0)} mL` },
            { label: "Theoretical",   value: `${store.theoreticalCo2Ml.toFixed(0)} mL` },
            { label: "Purity",        value: `${store.gasPurity.toFixed(1)}%` },
            { label: "Efficiency",    value: `${store.collectionEfficiency.toFixed(1)}%` },
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
          leakRate={store.leakRate}
          bubbleRate={store.bubbleRate}
        />
      }
      education={EXPERIMENT_EDUCATION["gas-collection"]}
      reactionNote={
        store.status === "running"
          ? `CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑ · ${store.co2CollectedMl.toFixed(1)} mL collected`
          : store.status === "completed"
            ? `Complete — ${store.co2CollectedMl.toFixed(1)} mL CO₂ collected. Apply PV = nRT to find moles.`
            : "Add marble chips and HCl — CO₂ will displace water into the inverted cylinder."
      }

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
  caco3Grams, hclVolumeMl, co2CollectedMl, pctFilled, isRunning, leakRate, bubbleRate,
}: {
  caco3Grams:     number;
  hclVolumeMl:    number;
  co2CollectedMl: number;
  pctFilled:      number;
  isRunning:      boolean;
  leakRate:       number;
  bubbleRate:     number;
}) {
  const flaskHasLiquid   = hclVolumeMl > 0;
  const hasChips         = caco3Grams > 0;
  const hasBothReactants = flaskHasLiquid && hasChips;
  const statusLabel      = isRunning
    ? "Collecting"
    : pctFilled > 0
    ? `${pctFilled.toFixed(0)}% filled`
    : "Ready";

  // ── Layout constants (viewBox 440 × 292) ────────────────────────────────────
  // Flask (Erlenmeyer) — realistic bezier curves
  const F_NL = 138, F_NR = 174;           // neck left/right x
  const F_NT = 44,  F_NB = 84;            // neck top/bottom y (+12px)
  const F_BL = 68,  F_BR = 244;           // base left/right x
  const F_BY = 238;                        // base bottom y (+12px, so bottom-most is F_BY + 8 = 246)
  const F_CX = (F_NL + F_NR) / 2;        // 156 — flask centre-x

  const FLASK_PATH =
    `M${F_NL} ${F_NT} L${F_NL} ${F_NB} ` +
    `C${F_NL - 14} ${F_NB + 26} ${F_BL + 4} ${F_BY - 60} ${F_BL} ${F_BY} ` +
    `Q${F_BL - 2} ${F_BY + 8} ${F_BL + 14} ${F_BY + 8} ` +
    `L${F_BR - 14} ${F_BY + 8} ` +
    `Q${F_BR + 2} ${F_BY + 8} ${F_BR} ${F_BY} ` +
    `C${F_BR - 4} ${F_BY - 60} ${F_NR + 14} ${F_NB + 26} ${F_NR} ${F_NB} ` +
    `L${F_NR} ${F_NT} Z`;

  // Clip path for HCl liquid (slightly inset, starts at stopper bottom)
  const FLASK_CLIP =
    `M${F_NL + 2} ${F_NT + 4} L${F_NL + 2} ${F_NB + 2} ` +
    `C${F_NL - 12} ${F_NB + 28} ${F_BL + 6} ${F_BY - 58} ${F_BL + 2} ${F_BY} ` +
    `L${F_BR - 2} ${F_BY} ` +
    `C${F_BR - 6} ${F_BY - 58} ${F_NR + 12} ${F_NB + 28} ${F_NR - 2} ${F_NB + 2} ` +
    `L${F_NR - 2} ${F_NT + 4} Z`;

  // Liquid height — proportional to HCl volume added
  const liquidFill = Math.min(1, hclVolumeMl / 80);
  const bodyH      = F_BY - F_NB;
  const liquidH    = Math.max(0, liquidFill * bodyH * 0.72);
  const liquidY    = F_BY - liquidH;

  // Rubber bung (brown trapezoid)
  const BUNG_T = 28, BUNG_B = F_NT + 2;  // top y=28, bottom y=46 (+12px)
  const BUNG_PATH = `M${F_NL + 8} ${BUNG_B} L${F_NL + 3} ${BUNG_T} L${F_NR - 3} ${BUNG_T} L${F_NR - 8} ${BUNG_B} Z`;
  // Glass delivery tube passes through center of bung
  const TUBE_X = F_CX;                   // 156

  // Delivery tube path: exits bung top → up → right → down into cylinder
  const TUBE_TOP_Y = 30;                 // (+12px)
  const TUBE_CYL_X = 308;
  const TUBE_CYL_Y = 64;                 // (+12px)
  const TUBE_PATH  = `M${TUBE_X} ${BUNG_T} L${TUBE_X} ${TUBE_TOP_Y} L${TUBE_CYL_X} ${TUBE_TOP_Y} L${TUBE_CYL_X} ${TUBE_CYL_Y}`;

  // Collection cylinder (inverted, open bottom submerged in trough)
  const CYL_X = 294, CYL_Y = 64, CYL_W = 44, CYL_H = 164; // bottom at 228 (+12px)

  // Water trough
  const TRG_X = 260, TRG_Y = 218, TRG_W = 114, TRG_H = 28; // bottom at 246 (+4px so it rests on bench)

  // Lab bench
  const BENCH_Y = 246;

  // CO₂ and water levels inside cylinder
  const co2H   = Math.max(0, (pctFilled / 100) * (CYL_H - 4));
  const waterH = (CYL_H - 4) - co2H;
  const waterY = CYL_Y + 2 + co2H;

  return (
    <div
      className="relative overflow-hidden select-none"
      style={{
        aspectRatio: "320/292",
        width:       "100%",
        height:      "auto",
        maxHeight:   "100%",
      }}
    >
      {/* Dot-grid texture */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(20,184,166,0.12) 1px, transparent 1px)",
          backgroundSize:  "24px 24px",
        }}
      />
      {/* Running reaction glow behind flask */}
      {isRunning && (
        <motion.div aria-hidden="true" className="absolute pointer-events-none"
          animate={{ opacity: [0.15, 0.42, 0.15] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            top: "28%", left: "8%", width: "190px", height: "140px",
            background: "radial-gradient(ellipse, rgba(20,184,166,0.55) 0%, transparent 70%)",
          }}
        />
      )}
      {/* Status badge */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
        style={{
          fontSize:   "9.5px", fontWeight: 700,
          background: isRunning ? "rgba(20,184,166,0.12)" : "rgba(241,245,249,0.92)",
          border:     `1px solid ${isRunning ? "rgba(20,184,166,0.45)" : "rgba(148,163,184,0.35)"}`,
          color:      isRunning ? "#0d9488" : "#64748b",
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{
            background: isRunning ? "#2dd4bf" : "#94a3b8",
            animation:  isRunning ? "blink-dot 1.4s ease-in-out infinite" : "none",
          }} />
        {statusLabel}
      </div>

      <svg viewBox="60 0 320 292" width="100%"
        style={{ display: "block", position: "relative", zIndex: 10 }}
        aria-label="Gas collection apparatus" role="img"
      >
        <defs>
          <filter id="gc-shadow" x="-22%" y="-22%" width="144%" height="144%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="rgba(15,23,42,0.22)" />
          </filter>
          <filter id="gc-soft" x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="3" />
          </filter>

          <linearGradient id="gc-flask-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.28)" />
            <stop offset="20%"  stopColor="rgba(255,255,255,0.06)" />
            <stop offset="85%"  stopColor="rgba(255,255,255,0.03)" />
            <stop offset="95%"  stopColor="rgba(255,255,255,0.25)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.08)" />
          </linearGradient>
          <linearGradient id="gc-glass-highlight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.45)" />
            <stop offset="12%" stopColor="rgba(255, 255, 255, 0.12)" />
            <stop offset="88%" stopColor="rgba(255, 255, 255, 0.08)" />
            <stop offset="92%" stopColor="rgba(255, 255, 255, 0.32)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.55)" />
          </linearGradient>
          <linearGradient id="gc-bench-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="15%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="gc-stopper-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6b21a8" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#a855f7" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.9" />
          </linearGradient>
          <radialGradient id="gc-marble-grad" cx="35%" cy="30%" r="55%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="65%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#94a3b8" />
          </radialGradient>
          <linearGradient id="gc-co2-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(56,189,248,0.42)" />
            <stop offset="100%" stopColor="rgba(14,165,233,0.18)" />
          </linearGradient>
          <linearGradient id="gc-hcl-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(224,242,254,0.48)" />
            <stop offset="100%" stopColor="rgba(186,230,253,0.68)" />
          </linearGradient>
          <linearGradient id="gc-water-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(20,184,166,0.30)" />
            <stop offset="100%" stopColor="rgba(13,148,136,0.56)" />
          </linearGradient>

          <clipPath id="gc-flask-clip"><path d={FLASK_CLIP} /></clipPath>
          <clipPath id="gc-cyl-clip">
            <rect x={CYL_X + 1} y={CYL_Y + 1} width={CYL_W - 2} height={CYL_H - 2} />
          </clipPath>
        </defs>

        {/* ── Soft shadows under apparatus (grounds them on table) ── */}
        <ellipse cx={F_CX} cy={BENCH_Y + 4} rx="85" ry="6" fill="rgba(15,23,42,0.22)" filter="url(#gc-soft)" />
        <ellipse cx={TRG_X + TRG_W / 2} cy={BENCH_Y + 4} rx="65" ry="5" fill="rgba(15,23,42,0.22)" filter="url(#gc-soft)" />

        {/* ── Sleek lab benchtop ── */}
        <rect x="0" y={BENCH_Y} width="440" height="34" fill="url(#gc-bench-grad)" />
        <rect x="0" y={BENCH_Y} width="440" height="4" fill="rgba(255,255,255,0.12)" />
        <rect x="0" y={BENCH_Y + 4} width="440" height="2" fill="rgba(0,0,0,0.35)" />

        {/* ── Delivery tube label ── */}
        <text x="220" y="12" textAnchor="middle" fontSize="7" fill="#0d9488" fontWeight="700"
          letterSpacing="0.04em" opacity="0.85">
          DELIVERY TUBE — CO₂ DISPLACEMENT
        </text>

        {/* ── Delivery tube — glass body (Entering from bottom of cylinder) ── */}
        <path d={`M156 28 L156 20 L278 20 L278 232 L316 232 L316 210`}
          fill="none" stroke="rgba(147,197,253,0.42)" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M156 28 L156 20 L278 20 L278 232 L316 232 L316 210`}
          fill="none" stroke="rgba(255,255,255,0.60)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Animated gas bubble flow when reaction is running */}
        {isRunning && (
          <motion.path d={`M156 28 L156 20 L278 20 L278 232 L316 232 L316 210`}
            fill="none" stroke="rgba(56,189,248,0.9)" strokeWidth="2.2"
            strokeDasharray="9 8" strokeLinecap="round" strokeLinejoin="round"
            animate={{ strokeDashoffset: [48, 0] }}
            transition={{ duration: 0.65, repeat: Infinity, ease: "linear" }}
          />
        )}

        {/* ── Erlenmeyer flask — glass shell ── */}
        {/* Double-line styling for glass thickness */}
        <path d={FLASK_PATH}
          fill="rgba(255,255,255,0.36)" stroke="rgba(71,85,105,0.48)" strokeWidth="2.2"
          filter="url(#gc-shadow)" />
        <path d={FLASK_PATH}
          fill="url(#gc-glass-highlight)" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" />
        
        {/* 3D reflection highlight lines */}
        <path
          d={`M${F_NL + 3} ${F_NT + 8} L${F_NL + 3} ${F_NB + 6} C${F_NL - 10} ${F_NB + 30} ${F_BL + 14} ${F_BY - 50} ${F_BL + 10} ${F_BY}`}
          fill="none" stroke="rgba(255,255,255,0.48)" strokeWidth="2.5" strokeLinecap="round" />

        {/* ── HCl liquid fill ── */}
        {flaskHasLiquid && (
          <>
            <rect
              x={F_BL - 4} y={liquidY}
              width={F_BR - F_BL + 8}
              height={F_BY - liquidY + 6}
              fill="url(#gc-hcl-grad)"
              clipPath="url(#gc-flask-clip)"
            />
            {/* Liquid wave meniscus */}
            <motion.path
              animate={{ d: [
                `M ${F_BL + 14} ${liquidY} Q ${F_CX} ${liquidY - 3} ${F_BR - 14} ${liquidY}`,
                `M ${F_BL + 14} ${liquidY} Q ${F_CX} ${liquidY + 3} ${F_BR - 14} ${liquidY}`,
                `M ${F_BL + 14} ${liquidY} Q ${F_CX} ${liquidY - 3} ${F_BR - 14} ${liquidY}`,
              ]}}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              fill="none" stroke="rgba(125,200,235,0.72)" strokeWidth="1.5"
              clipPath="url(#gc-flask-clip)"
            />
          </>
        )}

        {/* HCl label inside liquid */}
        {flaskHasLiquid && liquidH > 22 && (
          <text x={F_CX} y={liquidY + 16} textAnchor="middle" fontSize="8" fill="#0284c7" fontWeight="700">
            HCl {hclVolumeMl} mL (1.0 M)
          </text>
        )}

        {/* ── Marble chips at flask bottom (3D radial shading) ── */}
        {hasChips && [
          { cx: F_CX - 50, cy: F_BY - 5,  rx: 11, ry: 6,   rot: 15  },
          { cx: F_CX - 28, cy: F_BY - 3,  rx: 10, ry: 5.5, rot: -8  },
          { cx: F_CX,      cy: F_BY - 6,  rx: 9.5,ry: 6,   rot: 25  },
          { cx: F_CX + 26, cy: F_BY - 3,  rx: 10.5,ry: 5.5,rot: -15 },
          { cx: F_CX + 48, cy: F_BY - 5,  rx: 10, ry: 5.5, rot: 10  },
          { cx: F_CX - 14, cy: F_BY - 14, rx: 9,  ry: 5,   rot: -20 },
          { cx: F_CX + 14, cy: F_BY - 14, rx: 8.5,ry: 5,   rot: 30  },
        ].map((c, i) => (
          <ellipse key={i} cx={c.cx} cy={c.cy} rx={c.rx} ry={c.ry}
            fill="url(#gc-marble-grad)" stroke="#8e9aa8" strokeWidth="0.8"
            transform={`rotate(${c.rot}, ${c.cx}, ${c.cy})`}
            filter="drop-shadow(0 1px 1px rgba(0,0,0,0.15))"
          />
        ))}

        {/* ── CO₂ bubbles rising through acid ── */}
        {isRunning && hasBothReactants && bubbleRate > 0.1 && Array.from({ length: Math.min(10, Math.ceil(bubbleRate * 1.5)) }).map((_, i) => (
          <motion.circle key={i}
            cx={F_BL + 20 + i * (F_BR - F_BL - 40) / Math.min(10, Math.ceil(bubbleRate * 1.5))} r={1.6 + (i % 3) * 0.8}
            fill="rgba(255,255,255,0.85)" stroke="rgba(125,200,235,0.4)" strokeWidth="0.5"
            initial={{ cy: F_BY - 8 }}
            animate={{ cy: F_NT + 22, opacity: [0.90, 0.55, 0] }}
            transition={{
              repeat: Infinity,
              duration: Math.max(0.3, 1.8 / Math.sqrt(bubbleRate)) + (i % 3) * 0.1,
              delay: i * 0.15,
              ease: "easeOut"
            }}
          />
        ))}

        {/* ── Leak mist escaping from rubber bung ── */}
        {isRunning && leakRate > 0 && Array.from({ length: Math.ceil(leakRate / 3) }).map((_, i) => (
          <motion.circle key={`leak-${i}`}
            r={1.5 + (i % 3) * 1.2}
            fill="rgba(241, 245, 249, 0.80)"
            filter="url(#gc-soft)"
            initial={{ cx: F_NL + 10 + (i * 3), cy: BUNG_T }}
            animate={{
              cx: [F_NL + 10 + (i * 3), F_NL - 10, F_NL - 30],
              cy: [BUNG_T, BUNG_T - 15, BUNG_T - 30],
              opacity: [0, 0.7 * (leakRate / 25), 0]
            }}
            transition={{
              repeat: Infinity,
              duration: 1.0 + (i % 3) * 0.25,
              delay: i * 0.15,
              ease: "easeOut"
            }}
          />
        ))}

        {/* ── Rubber bung stopper (realistic 3D lighting) ── */}
        <path d={BUNG_PATH} fill="url(#gc-stopper-grad)" stroke="#1e1b4b" strokeWidth="0.8" />
        <line x1={F_NL + 12} y1={BUNG_B - 3} x2={F_NL + 16} y2={BUNG_T + 4}
          stroke="rgba(255,255,255,0.25)" strokeWidth="1.8" strokeLinecap="round" />
        
        {/* Glass tube through stopper */}
        <rect x={TUBE_X - 1.5} y={BUNG_T - 3} width="3" height={BUNG_B - BUNG_T + 5} rx="0.5"
          fill="rgba(191,219,254,0.78)" stroke="rgba(71,85,105,0.4)" strokeWidth="0.5" />

        {/* ── Inverted collection cylinder (drawn FIRST so it is submerged in trough) ── */}
        <g id="cylinder-group">
          {/* Outer glass cylinder */}
          <rect x={CYL_X} y={CYL_Y} width={CYL_W} height={CYL_H} rx="3"
            fill="rgba(255,255,255,0.38)" stroke="rgba(71,85,105,0.52)" strokeWidth="2.0"
            filter="url(#gc-shadow)" />
          <rect x={CYL_X} y={CYL_Y} width={CYL_W} height={CYL_H} rx="3"
            fill="url(#gc-glass-highlight)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.6" />
          
          {/* Sealed top cap */}
          <rect x={CYL_X} y={CYL_Y - 5} width={CYL_W} height="7" rx="2" fill="rgba(71,85,105,0.44)" />
          
          {/* Vertical sheen highlight */}
          <rect x={CYL_X + 3} y={CYL_Y + 4} width="4.5" height={CYL_H - 10} rx="2" fill="rgba(255,255,255,0.32)" />

          {/* Water inside cylinder (displaced by CO₂) */}
          {waterH > 0 && (
            <rect x={CYL_X + 1} y={waterY} width={CYL_W - 2} height={waterH}
              fill="url(#gc-water-grad)" clipPath="url(#gc-cyl-clip)" />
          )}

          {/* CO₂ fill from top downward */}
          <motion.rect
            x={CYL_X + 1} y={CYL_Y + 1} width={CYL_W - 2}
            animate={{ height: Math.max(0, co2H) }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            rx="2"
            fill="url(#gc-co2-grad)"
            clipPath="url(#gc-cyl-clip)"
          />

          {/* Gas/water interface meniscus */}
          {pctFilled > 0 && (
            <motion.path
              stroke="rgba(14,165,233,0.78)" strokeWidth="1.5" fill="none"
              animate={{ d: `M ${CYL_X + 1} ${waterY} Q ${CYL_X + CYL_W/2} ${waterY + 3} ${CYL_X + CYL_W - 1} ${waterY}` }}
              transition={{ duration: 0.8 }}
            />
          )}

          {/* ── Bubbles rising inside collection cylinder ── */}
          {isRunning && bubbleRate > 0.1 && waterH > 10 && Array.from({ length: 5 }).map((_, i) => (
            <motion.circle key={`cyl-bub-${i}`}
              cx={316 + (i % 2 === 0 ? 2.2 : -2.2) * Math.random()}
              r={1.6 + (i % 2) * 0.7}
              fill="rgba(255,255,255,0.82)"
              stroke="rgba(56,189,248,0.4)"
              strokeWidth="0.5"
              initial={{ cy: 210, opacity: 0.95 }}
              animate={{
                cy: [210, (waterY + 210)/2, waterY],
                opacity: [0.95, 0.95, 0]
              }}
              transition={{
                repeat: Infinity,
                duration: 0.85 + Math.random() * 0.4,
                delay: i * 0.22,
                ease: "linear"
              }}
              clipPath="url(#gc-cyl-clip)"
            />
          ))}

          {/* Scale markers on cylinder */}
          {[100, 200, 300, 400, 500, 600].map((ml) => {
            const y = CYL_Y + (ml / COLLECTION_CAP_ML) * (CYL_H - 4);
            return (
              <g key={ml}>
                <line x1={CYL_X} y1={y} x2={CYL_X + 8} y2={y}
                  stroke="rgba(99,179,237,0.55)" strokeWidth="0.8" />
                <text x={CYL_X - 4} y={y + 2.5} textAnchor="end" fontSize="6.5" fill="#446182" fontWeight="600">{ml}</text>
              </g>
            );
          })}

          {/* CO₂ volume badge inside cylinder */}
          {co2CollectedMl > 0 && (
            <g>
              <rect x={CYL_X - 10} y={CYL_Y + 8} width={CYL_W + 20} height="22" rx="4"
                fill="rgba(15, 23, 42, 0.88)" stroke="rgba(34, 211, 238, 0.35)" strokeWidth="0.8" />
              <text x={CYL_X + CYL_W / 2} y={CYL_Y + 22} textAnchor="middle"
                fontSize="11" fill="#22d3ee" fontWeight="900" fontFamily="monospace">
                {co2CollectedMl.toFixed(0)} mL
              </text>
            </g>
          )}

          {/* CO₂ ↑ label above cylinder */}
          <text x={CYL_X + CYL_W / 2} y={CYL_Y - 9} textAnchor="middle"
            fontSize="11" fill="#0ea5e9" fontWeight="800">CO₂ ↑</text>
        </g>

        {/* ── Water trough (drawn AFTER cylinder to submerge cylinder bottom) ── */}
        <g id="trough-group">
          {/* Double-line glass styling for trough */}
          <rect x={TRG_X} y={TRG_Y} width={TRG_W} height={TRG_H} rx="5"
            fill="rgba(255,255,255,0.12)" stroke="rgba(20,184,166,0.38)" strokeWidth="2.0"
            filter="url(#gc-shadow)" />
          <rect x={TRG_X} y={TRG_Y} width={TRG_W} height={TRG_H} rx="5"
            fill="url(#gc-water-grad)" stroke="rgba(20,184,166,0.56)" strokeWidth="0.8" />
          
          {/* Animated water surface ripples */}
          <motion.path
            animate={{ d: [
              `M ${TRG_X + 6} ${TRG_Y + 3} Q ${TRG_X + TRG_W / 2} ${TRG_Y} ${TRG_X + TRG_W - 6} ${TRG_Y + 3}`,
              `M ${TRG_X + 6} ${TRG_Y + 3} Q ${TRG_X + TRG_W / 2} ${TRG_Y + 5} ${TRG_X + TRG_W - 6} ${TRG_Y + 3}`,
              `M ${TRG_X + 6} ${TRG_Y + 3} Q ${TRG_X + TRG_W / 2} ${TRG_Y} ${TRG_X + TRG_W - 6} ${TRG_Y + 3}`,
            ]}}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            fill="none" stroke="rgba(20,184,166,0.6)" strokeWidth="1"
          />
          <text x={TRG_X + TRG_W / 2} y={TRG_Y + 18} textAnchor="middle" fontSize="7" fill="#047857" fontWeight="700" opacity="0.85">
            WATER TROUGH
          </text>
        </g>

        {/* ── Bottom apparatus labels (on bench surface) ── */}
        <text x={F_CX} y={BENCH_Y + 14} textAnchor="middle" fontSize="8.5" fill="#334155" fontWeight="700">
          Conical flask
        </text>
        <text x={F_CX} y={BENCH_Y + 24} textAnchor="middle" fontSize="7" fill="#64748b">
          (CaCO₃ + HCl react here)
        </text>
        <text x={CYL_X + CYL_W / 2} y={BENCH_Y + 14} textAnchor="middle" fontSize="8.5" fill="#334155" fontWeight="700">
          Collection cylinder
        </text>
        <text x={CYL_X + CYL_W / 2} y={BENCH_Y + 24} textAnchor="middle" fontSize="7" fill="#64748b">
          (CO₂ collects by displacement)
        </text>
      </svg>
    </div>
  );
}
