"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { motion }                                        from "framer-motion";
import { useRedoxDisplacementStore }                     from "@/lib/store/redox-displacement-store";
import StepGuide                                         from "@/components/lab/StepGuide";
import ObservationPanel                                  from "@/components/lab/ObservationPanel";
import StatusBar                                         from "@/components/lab/StatusBar";
import ResultModal                                       from "@/components/lab/ResultModal";
import ContextPopup, { obsToPopup }                      from "@/components/lab/ContextPopup";
import LabPageShell                                      from "@/components/lab/LabPageShell";
import LabContextPanel                                   from "@/components/lab/LabContextPanel";
import { METALS, cuSolutionColor, CUPRIC_INITIAL_CONC }  from "@/lib/engine/redox-displacement-engine";
import type { MetalId }                                  from "@/lib/engine/types";
import { EXPERIMENT_EDUCATION }                          from "@/lib/experiment-education";

const METAL_ORDER: MetalId[] = ["magnesium", "zinc", "iron", "lead", "copper", "silver"];

export default function RedoxPage() {
  const [showPopup, setShowPopup] = useState(false);
  const store    = useRedoxDisplacementStore();
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


  const lastObs       = store.observations[0];
  const popup         = lastObs ? obsToPopup(lastObs.type, lastObs.message) : null;
  const solColor      = cuSolutionColor(store.cupricConc);
  const metalProfile  = store.selectedMetal ? METALS[store.selectedMetal] : null;
  const pctConsumed   = ((store._cuConc - store.cupricConc) / Math.max(0.01, store._cuConc)) * 100;
  const cellPotential = metalProfile ? store.cellPotential : null;

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

  const selectedMetal = store.selectedMetal ? METALS[store.selectedMetal] : null;

  const controls = (
    <div className="flex flex-col gap-3">

      {/* Step guidance */}
      <div style={{
        borderRadius: 10, overflow: "hidden",
        border: "1px solid rgba(124,58,237,0.18)",
      }}>
        <div style={{
          padding: "6px 12px",
          background: "rgba(124,58,237,0.07)",
          borderBottom: "1px solid rgba(124,58,237,0.12)",
        }}>
          <p style={{ fontSize: 9.5, fontWeight: 800, color: "#7c3aed", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {store.status === "idle" || store.status === "setup" ? "Step 1 — Choose a Metal" : store.status === "running" ? "Step 2 — Observing Reaction" : "Complete"}
          </p>
        </div>
        <div style={{ padding: "8px 12px" }}>
          {(store.status === "idle" || store.status === "setup") && !store.selectedMetal && (
            <p style={{ fontSize: 10.5, color: "#334155", margin: 0, lineHeight: 1.55 }}>
              Select a metal strip below. Metals <strong>higher than copper</strong> in the reactivity series will displace Cu from the solution.
            </p>
          )}
          {store.selectedMetal && (store.status === "setup" || store.status === "idle") && (
            <p style={{ fontSize: 10.5, color: "#334155", margin: 0, lineHeight: 1.55 }}>
              {selectedMetal?.displacesCu
                ? `${selectedMetal.name} is more reactive than copper — it will displace Cu²⁺. Click "Place Metal" to begin.`
                : `${selectedMetal?.name} is less reactive than copper — no reaction will occur.`}
            </p>
          )}
          {store.status === "running" && (
            <p style={{ fontSize: 10.5, color: "#334155", margin: 0, lineHeight: 1.55 }}>
              {store.reactionOccurs
                ? "Watch the blue solution fade as Cu²⁺ is consumed. A reddish-brown copper deposit forms on the metal."
                : "No reaction — this metal cannot displace copper from the solution."}
            </p>
          )}
        </div>
      </div>

      {/* Metal selector */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--lab-blue-600)" }}>
          Select Metal Strip
        </p>
        {/* Reactivity ladder */}
        <div style={{
          padding: "6px 8px", borderRadius: 8, marginBottom: 8,
          background: "rgba(5,150,105,0.05)", border: "1px solid rgba(5,150,105,0.18)",
          fontSize: 9, color: "#475569", lineHeight: 1.5,
        }}>
          <span style={{ fontWeight: 700, color: "#059669" }}>Reactivity (high → low): </span>
          Mg &gt; Zn &gt; Fe &gt; Pb &gt;&nbsp;
          <span style={{ fontWeight: 800, color: "#b45309" }}>Cu</span>
          &nbsp;&gt; Ag — only metals above Cu will react
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {METAL_ORDER.map((id) => {
            const m   = METALS[id];
            const disabled = store.status === "running" || store.status === "completed";
            return (
              <button
                key={id}
                onClick={() => store.selectMetalAction(id)}
                disabled={disabled}
                className="rounded-xl p-2 text-center border transition-all duration-150 hover:scale-105 disabled:opacity-40"
                style={{
                  background:    store.selectedMetal === id ? `${m.rodColor}22` : "var(--lab-glass-heavy)",
                  borderColor:   store.selectedMetal === id ? m.rodColor : "var(--lab-glass-border)",
                  outline:       store.selectedMetal === id ? `2px solid ${m.rodColor}` : "none",
                  outlineOffset: "1px",
                }}
              >
                <div className="w-4 h-4 rounded-full mx-auto mb-0.5" style={{ background: m.rodColor, border: "1px solid rgba(0,0,0,0.15)" }} />
                <span className="text-[9.5px] font-bold block" style={{ color: "var(--lab-text-secondary)" }}>
                  {m.symbol}
                </span>
                <span className="text-[7.5px] font-semibold" style={{ color: m.displacesCu ? "#16a34a" : "#ef4444" }}>
                  {m.displacesCu ? "✓ reacts" : "✗ no reaction"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulation Controls (Sliders) */}
      <div style={{
        padding: "10px 12px", borderRadius: 10,
        background: "rgba(148,163,184,0.06)", border: "1px solid rgba(148,163,184,0.18)",
      }} className="flex flex-col gap-3">
        <p style={{ fontSize: 9.5, fontWeight: 800, color: "#475569", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Solution Settings
        </p>

        {/* Temperature slider */}
        <div>
          <div className="flex justify-between text-[10px] mb-1 font-medium">
            <span style={{ color: "var(--lab-text-secondary)" }}>Solution Temperature:</span>
            <span className="font-mono text-purple-600 font-semibold">{store.temperature.toFixed(0)} °C</span>
          </div>
          <input
            type="range"
            min="10"
            max="80"
            step="1"
            value={store.temperature}
            onChange={(e) => store.updateParametersAction({ temperature: parseInt(e.target.value, 10) })}
            disabled={store.status === "running" || store.status === "completed"}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
        </div>

        {/* Concentration slider */}
        <div>
          <div className="flex justify-between text-[10px] mb-1 font-medium">
            <span style={{ color: "var(--lab-text-secondary)" }}>Initial [Cu²⁺] Conc:</span>
            <span className="font-mono text-blue-600 font-semibold">{store.cupricConc.toFixed(2)} M</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="1.00"
            step="0.05"
            value={store.cupricConc}
            onChange={(e) => store.updateParametersAction({ cupricConc: parseFloat(e.target.value) })}
            disabled={store.status === "running" || store.status === "completed"}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>

      <button
        onClick={store.addMetalAction}
        disabled={!store.selectedMetal || store.status === "running" || store.status === "completed"}
        className="w-full py-2 text-xs font-semibold rounded-lg border transition-all hover:bg-blue-50 disabled:opacity-40"
        style={{ borderColor: "var(--lab-glass-border)", color: "var(--lab-blue-600)" }}
      >
        Place Metal in CuSO₄ Solution →
      </button>

      <button
        onClick={store.resetAction}
        className="w-full py-1.5 text-xs font-semibold rounded-lg border transition-all hover:bg-red-50"
        style={{ borderColor: "var(--lab-glass-border)", color: "var(--lab-text-muted)" }}
      >
        Reset
      </button>
    </div>
  );

  const redoxLeftPanel = (
    <LabContextPanel
      title="Redox Displacement"
      accent="#7c3aed"
      summary="A more reactive metal displaces a less reactive metal from its salt solution. The more reactive metal is oxidised; the dissolved metal ion is reduced."
      formula="Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s)"
      formulaLabel="Example displacement"
      facts={[
        { icon: "⚡", label: "Activity series", value: "Mg > Zn > Fe > Pb > Cu > Ag" },
        { icon: "🔵", label: "Blue CuSO₄",      value: "Fades as Cu²⁺ is consumed" },
        { icon: "🟠", label: "Cu deposit",      value: "Reddish-brown coating on metal" },
        { icon: "📐", label: "E°cell",          value: "Positive = spontaneous reaction" },
      ]}
      steps={[
        { number: 1, title: "Select metal",     body: "Choose a metal strip from the list. Metals above Cu in the activity series will react." },
        { number: 2, title: "Immerse in CuSO₄", body: "Click Start to immerse the metal in blue copper sulfate solution." },
        { number: 3, title: "Observe colour",   body: "Blue solution fades as Cu²⁺ ions are reduced to Cu(s) metal deposit." },
        { number: 4, title: "Read E°cell",      body: "Check the standard electrode potential in the Info panel." },
      ]}
    />
  );

  return (
    <LabPageShell
      leftPanel={redoxLeftPanel}
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
          cupricConc={store.cupricConc}
          isRunning={store.status === "running"}
          reactionOccurs={store.reactionOccurs}
          initConc={store._cuConc}
        />
      }
      education={EXPERIMENT_EDUCATION["redox-displacement"]}
      reactionNote={
        store.selectedMetal && store.reactionOccurs
          ? `${METALS[store.selectedMetal].symbol} → ${METALS[store.selectedMetal].symbol}²⁺ + 2e⁻ (oxidised) · Cu²⁺ + 2e⁻ → Cu (reduced) · blue fades as Cu²⁺ is consumed`
          : store.selectedMetal && !store.reactionOccurs
            ? `${METALS[store.selectedMetal].name} is below copper in the reactivity series — no displacement occurs.`
            : "Select a metal and immerse it in CuSO₄ solution to test for displacement."
      }

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
  solColor: _solColor, metalProfile, cuDepositedG, metalMassG, cupricConc, isRunning, reactionOccurs, initConc,
}: {
  solColor:       string;
  metalProfile:   typeof METALS[MetalId] | null;
  cuDepositedG:   number;
  metalMassG:     number;
  cupricConc:     number;
  isRunning:      boolean;
  reactionOccurs: boolean;
  initConc:       number;
}) {
  const rodColor    = metalProfile ? metalProfile.rodColor : "#a0a0a0";
  const depositFrac = metalMassG > 0 ? Math.min(1, cuDepositedG / (metalMassG * 0.5)) : 0;
  const depositThickness = Math.min(6, depositFrac * 6);

  // Derive a correct CuSO4 blue that fades to near-colorless as Cu2+ is consumed
  const t = Math.max(0, Math.min(1, cupricConc / (initConc || 0.5)));
  const dissolvedFraction = 1.0 - t;

  let solColor = `rgba(37,99,235, ${(0.08 + t * 0.60).toFixed(2)})`;
  if (metalProfile?.id === "iron") {
    const r = Math.round(37 * t + 16 * dissolvedFraction);
    const g = Math.round(99 * t + 185 * dissolvedFraction);
    const b = Math.round(235 * t + 129 * dissolvedFraction);
    const alpha = 0.08 + t * 0.60 + dissolvedFraction * 0.25;
    solColor = `rgba(${r},${g},${b},${alpha.toFixed(2)})`;
  } else {
    solColor = `rgba(37,99,235, ${(0.08 + t * 0.62).toFixed(2)})`;
  }

  return (
    <div
      className="relative rounded-3xl overflow-hidden select-none"
      style={{
        aspectRatio: "240/280",
        width:       "100%",
        height:      "auto",
        maxHeight:   "100%",
        background: "radial-gradient(ellipse at 50% 25%, rgba(71,85,105,0.08) 0%, transparent 50%), linear-gradient(180deg, #f8fafc 0%, #f1f5f9 40%, #f8fafc 100%)",
        border: "1px solid rgba(148,163,184,0.28)",
        boxShadow:
          "0 10px 30px rgba(15,23,42,0.06), " +
          "0 2px 6px rgba(15,23,42,0.03), " +
          "0 0 0 1px rgba(255,255,255,0.80) inset",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(184,115,51,0.16) 1px, transparent 1px)",
          backgroundSize:  "22px 22px",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          top: "-48px", left: "50%", transform: "translateX(-50%)",
          width: "288px", height: "192px",
          background: "radial-gradient(ellipse at center, rgba(184,115,51,0.35) 0%, transparent 70%)",
        }}
      />

      <svg
        viewBox="55 0 240 280"
        width="100%"
        style={{ display: "block", position: "relative", zIndex: 10 }}
        aria-label="Redox displacement beaker"
        role="img"
      >
        <defs>
          <filter id="rdx-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="rgba(0,0,0,0.40)" />
          </filter>
          <filter id="rdx-soft" x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <clipPath id="rdx-beaker-clip">
            <path d="M80 79 L80 256 Q80 271 95 271 L245 271 Q260 271 260 256 L260 79 Z" />
          </clipPath>
        </defs>

        {/* ── Lab bench ── */}
        <rect x="0" y="275" width="340" height="20" fill="#b8c4d0" />
        <rect x="0" y="271" width="340" height="6"  fill="#cbd5e1" />
        <rect x="0" y="271" width="340" height="2"  fill="rgba(255,255,255,0.55)" />

        {/* Soft shadow under beaker */}
        <ellipse cx="170" cy="274" rx="90" ry="5" fill="rgba(15,23,42,0.28)" filter="url(#rdx-soft)" />

        <text x="170" y="70" textAnchor="middle" fontSize="8" fill="#3b6690" fontWeight="700" opacity="0.8">
          REACTION VESSEL
        </text>

        {/* ── Beaker — clear glass ── */}
        <path d="M80 79 L80 256 Q80 271 95 271 L245 271 Q260 271 260 256 L260 79"
              fill="rgba(255,255,255,0.48)" stroke="rgba(71,85,105,0.50)" strokeWidth="2"
              filter="url(#rdx-shadow)" />
        <line x1="80" y1="79" x2="260" y2="79" stroke="rgba(71,85,105,0.50)" strokeWidth="2" />
        <path d="M84 85 L84 256" stroke="rgba(255,255,255,0.40)" strokeWidth="4" strokeLinecap="round" />
        <path d="M92 85 L92 256" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round" />

        {/* CuSO₄ solution — correct medium blue, fades as Cu²⁺ consumed */}
        <motion.rect x="81" y="121" width="178" height="149"
          animate={{ fill: solColor }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          clipPath="url(#rdx-beaker-clip)"
        />

        {/* Animated solution surface */}
        <motion.path
          animate={{ d: [
            "M 82 121 Q 170 117 258 121",
            "M 82 121 Q 170 125 258 121",
            "M 82 121 Q 170 117 258 121",
          ]}}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          fill="none" stroke={`rgba(37,99,235,${(0.08 + t * 0.30).toFixed(2)})`} strokeWidth="1.2"
          clipPath="url(#rdx-beaker-clip)"
        />

        {/* Concentration scale */}
        <text x="268" y="125"  fontSize="7.5" fill="#3b6690">0.5 M</text>
        <text x="268" y="269" fontSize="7.5" fill="#3b6690">0 M</text>
        <line x1="264" y1="121" x2="270" y2="121"
          stroke="#3b6690" strokeWidth="0.8" />
        <line x1="264" y1="269" x2="270" y2="269"
          stroke="#3b6690" strokeWidth="0.8" />

        {/* Metal rod */}
        {metalProfile && (
          <motion.g
            key={metalProfile.id}
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 80, damping: 14 }}
          >
            {/* Rod body — spans from above beaker rim into solution */}
            <rect x="158" y="61" width="24" height="198" rx="4"
              fill={rodColor} stroke="rgba(0,0,0,0.18)" strokeWidth="0.8" />
            {/* Rod highlight */}
            <rect x="160" y="63" width="6" height="190" rx="3"
              fill="rgba(255,255,255,0.22)" />

            {/* Cu deposit coating — grows upward and gets thicker */}
            {reactionOccurs && cuDepositedG > 0 && (
              <motion.rect
                x={159 - depositThickness}
                width={22 + 2 * depositThickness} rx="2"
                fill="#b87333"
                stroke="rgba(154,52,18,0.85)"
                strokeWidth={depositThickness > 0.5 ? 0.8 + depositThickness / 4 : 0}
                animate={{
                  y:      254 - depositFrac * 120,
                  height: Math.max(2, depositFrac * 120),
                  opacity: 0.88,
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            )}

            {/* Rod symbol label above beaker */}
            <rect x="152" y="53" width="36" height="12" rx="3"
              fill={rodColor} opacity="0.85" />
            <text x="170" y="63" textAnchor="middle" fontSize="9"
              fill="rgba(255,255,255,0.95)" fontWeight="800">
              {metalProfile.symbol}
            </text>
          </motion.g>
        )}

        {/* Cu²⁺ ions being reduced (small brown dots floating from rod) */}
        {isRunning && reactionOccurs && [0, 1, 2, 3].map((i) => (
          <motion.circle key={i}
            cx={155 + i * 14} r={2 + (i % 2) * 0.8}
            fill="rgba(184,115,51,0.65)"
            animate={{ cy: [251, 206, 161], opacity: [0.8, 0.4, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, delay: i * 0.55, ease: "easeOut" }}
          />
        ))}

        {/* Solution labels */}
        <text x="120" y="236" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.90)" fontWeight="700">
          CuSO₄
        </text>
        <text x="120" y="249" textAnchor="middle" fontSize="8" fill="rgba(186,230,253,0.90)" fontWeight="600">
          [{cupricConc.toFixed(3)} M]
        </text>

        {/* Cu deposit label */}
        {cuDepositedG > 0.001 && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <rect x="195" y="211" width="56" height="18" rx="5"
              fill="rgba(184,115,51,0.12)" stroke="rgba(184,115,51,0.35)" strokeWidth="0.8" />
            <text x="223" y="223" textAnchor="middle" fontSize="7.5" fill="#b45309" fontWeight="700">
              Cu: {cuDepositedG.toFixed(3)} g
            </text>
          </motion.g>
        )}

        {/* No-reaction feedback */}
        {metalProfile && !reactionOccurs && metalMassG > 0 && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <rect x="100" y="171" width="140" height="26" rx="8"
              fill="rgba(220,38,38,0.09)" stroke="rgba(220,38,38,0.30)" strokeWidth="1" />
            <text x="170" y="187" textAnchor="middle" fontSize="10" fill="#dc2626" fontWeight="700">
              No reaction — not reactive enough
            </text>
          </motion.g>
        )}

        {/* ── Metal activity series strip (moved to top of SVG canvas) ── */}
        <text x="170" y="15" textAnchor="middle" fontSize="7" fill="#475569" fontWeight="700" letterSpacing="0.08em">
          ACTIVITY SERIES
        </text>
        {METAL_ORDER.map((id, i) => {
          const m   = METALS[id];
          const act = m.displacesCu;
          return (
            <g key={id} transform={`translate(${27 + i * 48}, 20)`}
              opacity={metalProfile?.id === id ? 1 : 0.38}>
              <circle cx="18" cy="10" r="10.5"
                fill={act ? "rgba(5,150,105,0.12)" : "rgba(185,28,28,0.10)"}
                stroke={act ? "rgba(5,150,105,0.50)" : "rgba(220,38,38,0.45)"}
                strokeWidth="1.2" />
              <text x="18" y="14" textAnchor="middle" fontSize="8.5" fontWeight="700"
                fill={act ? "#059669" : "#dc2626"}>
                {m.symbol}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
