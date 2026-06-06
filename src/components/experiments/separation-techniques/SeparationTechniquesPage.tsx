"use client";

import { useEffect, useState, useRef, startTransition } from "react";
import { motion, AnimatePresence }                       from "framer-motion";
import { useSeparationTechniquesStore, type SeparationTechniquesStore } from "@/lib/store/separation-techniques-store";
import StepGuide                                         from "@/components/lab/StepGuide";
import ObservationPanel                                  from "@/components/lab/ObservationPanel";
import StatusBar                                         from "@/components/lab/StatusBar";
import ResultModal                                       from "@/components/lab/ResultModal";
import ContextPopup, { obsToPopup }                      from "@/components/lab/ContextPopup";
import LabPageShell                                      from "@/components/lab/LabPageShell";
import LabContextPanel                                   from "@/components/lab/LabContextPanel";
import { EXPERIMENT_EDUCATION }                          from "@/lib/experiment-education";
import type {
  SeparationTechnique,
  FiltrationState,
  EvaporationState,
  DistillationState,
  ChromatographyState,
} from "@/lib/engine/separation-techniques-engine";

const TECHNIQUES: Array<{
  id:        SeparationTechnique;
  label:     string;
  principle: string;
  use:       string;
  accent:    string;
  bg:        string;
  icon:      React.ReactNode;
}> = [
  {
    id:        "filtration",
    label:     "Filtration",
    principle: "Separates insoluble solids from liquids using a porous barrier",
    use:       "Separating sand from water, purifying drinking water",
    accent:    "#2563eb",
    bg:        "#eff6ff",
    icon:      <FiltrationIcon />,
  },
  {
    id:        "evaporation",
    label:     "Evaporation",
    principle: "Removes solvent by heating to recover dissolved solids as crystals",
    use:       "Recovering salt from seawater, recrystallisation",
    accent:    "#ea580c",
    bg:        "#fff7ed",
    icon:      <EvaporationIcon />,
  },
  {
    id:        "distillation",
    label:     "Distillation",
    principle: "Separates miscible liquids by exploiting different boiling points",
    use:       "Purifying ethanol, desalinating water, petroleum refining",
    accent:    "#059669",
    bg:        "#ecfdf5",
    icon:      <DistillationIcon />,
  },
  {
    id:        "chromatography",
    label:     "Chromatography",
    principle: "Separates solutes by differential migration through a stationary phase",
    use:       "Identifying dyes, toxicology screening, forensic analysis",
    accent:    "#7c3aed",
    bg:        "#f5f3ff",
    icon:      <ChromatographyIcon />,
  },
];

export default function SeparationTechniquesPage() {
  const [showPopup, setShowPopup] = useState(false);
  const tickRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const store    = useSeparationTechniquesStore();
  // Keep a stable ref to the latest store so interval callbacks never go stale
  const storeRef = useRef(store);
  useEffect(() => { storeRef.current = store; });

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

  // Tick interval — only restarts when technique or status meaningfully changes,
  // NOT on every store update (fixing the exponential interval accumulation bug).
  const { technique, status } = store;
  useEffect(() => {
    if (!technique || status === "completed") {
      if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
      return;
    }

    const id = setInterval(() => {
      const s = storeRef.current;
      if (s.technique === "filtration" && s.filtration.pourStarted && !s.filtration.filtrateCollected) {
        s.filtrationTickAction();
      } else if (s.technique === "evaporation" && s.evaporation.heatApplied && !s.evaporation.complete) {
        s.evaporationTickAction();
      } else if (s.technique === "distillation" && s.distillation.heaterOn && !s.distillation.complete) {
        s.distillationTickAction();
      } else if (s.technique === "chromatography" && s.chromatography.solventAdded && !s.chromatography.developed) {
        s.chromatographyTickAction();
      }
    }, 600);

    tickRef.current = id;
    return () => { clearInterval(id); tickRef.current = null; };
  }, [technique, status]);


  const lastObs = store.observations[0];
  const popup   = lastObs ? obsToPopup(lastObs.type, lastObs.message) : null;
  const tech    = store.technique ? TECHNIQUES.find((t) => t.id === store.technique) : null;

  const metrics = store.technique === "filtration"
    ? [
        { label: "Filter set up",    value: store.filtration.filterSetUp ? "Yes" : "No" },
        { label: "Pour progress",    value: `${store.filtration.pourProgress.toFixed(0)}%` },
        { label: "Filtrate clear",   value: store.filtration.filtrateClear ? "Yes" : "—" },
        { label: "Residue",          value: store.filtration.residueDried ? `${store.filtration.solidRecoveredG} g` : "—" },
      ]
    : store.technique === "evaporation"
    ? [
        { label: "Evaporation",      value: `${store.evaporation.evapProgress.toFixed(0)}%` },
        { label: "Crystals forming", value: store.evaporation.crystalsForming ? "Yes" : "No" },
        { label: "Crystals mass",    value: store.evaporation.crystalsMassG > 0 ? `${store.evaporation.crystalsMassG} g` : "—" },
      ]
    : store.technique === "distillation"
    ? [
        { label: "Temperature",       value: `${store.distillation.tempC.toFixed(1)} °C` },
        { label: "Fraction 1 (EtOH)", value: `${store.distillation.fraction1Ml.toFixed(1)} mL` },
        { label: "Fraction 2 (H₂O)", value: `${store.distillation.fraction2Ml.toFixed(1)} mL` },
      ]
    : store.technique === "chromatography"
    ? [
        { label: "Solvent front", value: `${store.chromatography.solventFrontMm.toFixed(1)} mm` },
        { label: "Progress",      value: `${store.chromatography.runProgress.toFixed(0)}%` },
        { label: "Spots",         value: String(store.chromatography.spotsData.length) },
      ]
    : [];

  const workspace = !store.technique ? (
    <div className="w-full">
      <p
        className="text-xs font-semibold uppercase tracking-widest mb-5 text-center"
        style={{ color: "#3b6690" }}
      >
        Select a Separation Technique to Begin
      </p>
      <div className="grid grid-cols-2 gap-4">
        {TECHNIQUES.map((t) => (
          <motion.button
            key={t.id}
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.97 }}
            onClick={() => store.selectTechniqueAction(t.id)}
            className="rounded-2xl p-5 border text-left transition-all duration-150"
            style={{
              background:  "rgba(9,24,52,0.80)",
              borderColor: `${t.accent}55`,
              boxShadow:   "0 4px 20px rgba(0,0,0,0.40)",
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
              style={{ background: `${t.accent}18`, color: t.accent }}
            >
              {t.icon}
            </div>
            <p className="text-sm font-bold mb-1" style={{ color: "#f1f5f9" }}>
              {t.label}
            </p>
            <p className="text-[10.5px] leading-snug mb-2" style={{ color: "#94a3b8" }}>
              {t.principle}
            </p>
            <p className="text-[9.5px]" style={{ color: `${t.accent}ee` }}>
              Used for: {t.use}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  ) : (
    <TechniqueWorkspace store={store} tech={tech!} />
  );

  const controls = store.technique ? (
    <div>
      <TechniqueControls store={store} />
      {store.status !== "completed" && (
        <button
          onClick={store.resetAction}
          className="mt-3 w-full py-1.5 text-xs font-semibold rounded-lg border transition-all hover:bg-slate-50"
          style={{ borderColor: "var(--lab-glass-border)", color: "var(--lab-text-muted)" }}
        >
          ← Change Technique
        </button>
      )}
    </div>
  ) : (
    <div className="text-xs text-center py-4" style={{ color: "var(--lab-text-subtle)" }}>
      Select a technique from the workspace to see controls.
    </div>
  );

  const sepLeftPanel = (
    <LabContextPanel
      title="Separation Techniques"
      accent="#0891b2"
      summary="Each technique exploits a different physical property: particle size (filtration), boiling point (distillation), or solubility/affinity (chromatography)."
      facts={[
        { icon: "🔽", label: "Filtration",     value: "Solid/liquid — particle size" },
        { icon: "💨", label: "Distillation",   value: "Liquids — boiling point diff." },
        { icon: "📊", label: "Chromatography", value: "Rf = dist. spot / dist. solvent" },
        { icon: "🧂", label: "Evaporation",    value: "Dissolve solute from solution" },
      ]}
      steps={[
        { number: 1, title: "Choose technique", body: "Click a technique card in the workspace: Filtration, Distillation, or Chromatography." },
        { number: 2, title: "Set up apparatus", body: "Follow the setup steps in the Controls panel. Each technique has its own procedure." },
        { number: 3, title: "Start separation", body: "Click Run/Start to begin the separation process and collect data." },
        { number: 4, title: "Analyse results",  body: "For chromatography, calculate Rf values. For distillation, record boiling points." },
      ]}
    />
  );

  return (
    <LabPageShell
      leftPanel={sepLeftPanel}
      statusBar={
        <StatusBar
          status={store.status}
          error={store.lastError}
          metrics={metrics}
        />
      }

      workspace={workspace}
      education={EXPERIMENT_EDUCATION["separation-techniques"]}
      reactionNote={
        store.technique === "filtration"
          ? "Filtration: filter paper retains the insoluble residue; liquid filtrate passes through by gravity."
          : store.technique === "evaporation"
            ? "Evaporation: heating drives off the solvent as vapour, leaving the dissolved solute as dry crystals."
            : store.technique === "distillation"
              ? "Distillation: the most volatile component boils first, condenses, and is collected as the distillate."
              : store.technique === "chromatography"
                ? "Chromatography: Rf = spot distance ÷ solvent front — unique per compound under fixed conditions."
                : "Select Filtration, Evaporation, Distillation, or Chromatography to begin."
      }

      centerBottom={store.technique ? <NarratorPanel store={store} /> : undefined}

      controls={controls}

      stepGuide={store.steps.length > 0 ? <StepGuide steps={store.steps} objectives={store.objectives} /> : undefined}
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
          nextHref="/experiments/titration"
          nextLabel="Try Titration →"
          observations={store.observations}
          experimentKey="separation-techniques"
        />
      }
    />
  );
}

// ── Technique Workspace ───────────────────────────────────────────────────────

function TechniqueWorkspace({
  store, tech,
}: {
  store: SeparationTechniquesStore;
  tech:  (typeof TECHNIQUES)[number];
}) {
  return (
    <div
      className="relative rounded-3xl overflow-hidden"
      style={{
        width:     "100%",
        maxHeight: "100%",
        background: "radial-gradient(ellipse at 50% 25%, rgba(2,132,199,0.08) 0%, transparent 50%), linear-gradient(180deg, #f0f7ff 0%, #e8f3ff 40%, #f0f7ff 100%)",
        border: "1px solid rgba(148,163,184,0.28)",
        boxShadow: `0 10px 30px rgba(15,23,42,0.06), 0 2px 6px rgba(15,23,42,0.03), 0 0 0 1px rgba(255,255,255,0.80) inset`,
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(99,179,237,0.10) 1px, transparent 1px)",
          backgroundSize:  "22px 22px",
        }}
      />
      <div className="relative flex items-center gap-2 px-4 py-3 border-b z-10"
        style={{ borderColor: "rgba(99,179,237,0.18)" }}>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${tech.accent}20`, color: tech.accent }}
        >
          {tech.icon}
        </div>
        <p className="text-xs font-bold flex-shrink-0" style={{ color: tech.accent }}>{tech.label}</p>
        <span
          className="text-[9px] ml-2 font-mono min-w-0 overflow-hidden"
          style={{
            color: "#4b7096",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {tech.principle}
        </span>
      </div>
      <div className="relative p-4 z-10">
        {store.technique === "filtration"     && <FiltrationDiagram    state={store.filtration} />}
        {store.technique === "evaporation"    && <EvaporationDiagram   state={store.evaporation} />}
        {store.technique === "distillation"   && <DistillationDiagram  state={store.distillation} />}
        {store.technique === "chromatography" && <ChromatographyDiagram state={store.chromatography} />}
      </div>
    </div>
  );
}

// ── SVG Diagrams ──────────────────────────────────────────────────────────────

function FiltrationDiagram({ state }: { state: FiltrationState }) {
  const fillH     = (state.pourProgress / 100) * 80;
  const filtrateH = state.filtrateCollected ? 40 : (state.filtrateClear ? (state.pourProgress / 100) * 40 : 0);

  return (
    <svg viewBox="0 0 300 220" width="100%" aria-label="Filtration apparatus">
      <defs>
        <clipPath id="sep-funnel-clip">
          <path d="M100 30 L200 30 L170 80 L130 80 Z" />
        </clipPath>
      </defs>
      {/* Retort stand */}
      <line x1="150" y1="20" x2="150" y2="180" stroke="rgba(99,179,237,0.35)" strokeWidth="3" />
      <line x1="110" y1="180" x2="190" y2="180" stroke="rgba(99,179,237,0.35)" strokeWidth="3" />

      {/* Funnel — dark glass */}
      <path d="M100 30 L200 30 L170 80 L130 80 Z"
            fill="rgba(255,255,255,0.48)" stroke="#60a5fa" strokeWidth="1.5" />
      <path d="M130 80 L135 100 M170 80 L165 100" stroke="#60a5fa" strokeWidth="1.5" />
      <rect x="133" y="100" width="34" height="30" rx="2" fill="rgba(255,255,255,0.48)" stroke="#60a5fa" strokeWidth="1.5" />

      {state.filterSetUp && (
        <>
          <path d="M100 30 L155 82" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" strokeDasharray="3 2" />
          <text x="150" y="52" textAnchor="middle" fontSize="8" fill="#60a5fa" fontWeight="600">Filter Paper</text>
        </>
      )}

      {state.mixtureAdded && (
        <motion.rect
          x="101" y={80 - fillH}
          width="98" height={fillH}
          animate={{ height: fillH, y: 80 - fillH }}
          fill="rgba(99,179,237,0.25)"
          transition={{ duration: 0.5 }}
          clipPath="url(#sep-funnel-clip)"
        />
      )}

      {state.filtrateClear && (
        <>
          <motion.line
            x1="150" y1="130" x2="150" y2="160"
            stroke="#60a5fa" strokeWidth="1.5"
            animate={{ y2: [150, 160, 150] }}
            transition={{ repeat: Infinity, duration: 0.6 }}
          />
          <text x="150" y="138" textAnchor="middle" fontSize="7.5" fill="#60a5fa">filtrate</text>
        </>
      )}

      {/* Collection beaker — dark glass */}
      <path d="M115 155 L110 205 Q110 210 150 210 Q190 210 190 205 L185 155 Z"
            fill="rgba(255,255,255,0.48)" stroke="rgba(71,85,105,0.50)" strokeWidth="1.5" />
      {filtrateH > 0 && (
        <motion.rect
          x="111" y={210 - filtrateH}
          width="78" height={filtrateH}
          animate={{ height: filtrateH }}
          fill="rgba(59,130,246,0.30)"
          transition={{ duration: 0.8 }}
        />
      )}
      <text x="150" y="200" textAnchor="middle" fontSize="8" fill="#7db8ef">
        {state.filtrateCollected ? "Filtrate (clear)" : "Beaker"}
      </text>

      <text x="80" y="57"  fontSize="8"   fill="#3b6690" textAnchor="end">Mixture:</text>
      <text x="80" y="67"  fontSize="7.5" fill="#3b6690" textAnchor="end">Sand + Water</text>
      <text x="80" y="77"  fontSize="7"   fill="#2d4a6a" textAnchor="end">(liquid state)</text>

      {state.residueDried && (
        <text x="150" y="95" textAnchor="middle" fontSize="8" fill="#fb923c" fontWeight="600">
          Residue: {state.solidRecoveredG} g sand
        </text>
      )}
    </svg>
  );
}

function EvaporationDiagram({ state }: { state: EvaporationState }) {
  const solutionLevel = Math.max(0, 1 - state.evapProgress / 100);

  return (
    <svg viewBox="0 0 300 220" width="100%" aria-label="Evaporation apparatus">
      {/* Tripod stand */}
      <line x1="90"  y1="180" x2="150" y2="130" stroke="rgba(99,179,237,0.35)" strokeWidth="2" />
      <line x1="210" y1="180" x2="150" y2="130" stroke="rgba(99,179,237,0.35)" strokeWidth="2" />
      <line x1="150" y1="185" x2="150" y2="130" stroke="rgba(99,179,237,0.35)" strokeWidth="2" />
      <ellipse cx="150" cy="128" rx="40" ry="6" fill="none" stroke="rgba(99,179,237,0.35)" strokeWidth="1.5" strokeDasharray="4 2" />

      {/* Evaporating dish — dark glass */}
      <path d="M110 110 Q110 130 150 132 Q190 130 190 110 Z"
            fill="rgba(255,255,255,0.48)" stroke="rgba(71,85,105,0.50)" strokeWidth="1.5" />
      <ellipse cx="150" cy="110" rx="40" ry="8" fill="rgba(255,255,255,0.48)" stroke="rgba(71,85,105,0.50)" strokeWidth="1.5" />

      {state.solutionAdded && (
        <motion.ellipse
          cx="150" cy="116"
          rx={38 * solutionLevel}
          ry={6 * solutionLevel}
          animate={{ rx: 38 * solutionLevel, ry: 6 * solutionLevel }}
          fill={state.crystalsForming ? "rgba(59,130,246,0.40)" : "rgba(59,130,246,0.25)"}
          transition={{ duration: 0.8 }}
        />
      )}

      {state.crystalsForming && (
        <>
          {[135, 145, 155, 165].map((x, i) => (
            <rect key={i} x={x} y="112" width="4" height="4" fill="rgba(226,232,240,0.80)" stroke="rgba(99,179,237,0.35)" strokeWidth="0.5"
                  transform={`rotate(${i * 20}, ${x + 2}, 114)`} />
          ))}
          <text x="150" y="126" textAnchor="middle" fontSize="7.5" fill="#fb923c" fontWeight="600">
            NaCl crystals forming
          </text>
        </>
      )}

      {state.heatApplied && state.evapProgress < 100 && (
        <>
          {[130, 150, 170].map((x, i) => (
            <motion.path
              key={i}
              d={`M${x} 108 Q${x + 5} 95 ${x} 82`}
              fill="none" stroke="rgba(148,163,184,0.22)" strokeWidth="1.5"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.2 + i * 0.3 }}
            />
          ))}
          <text x="150" y="76" textAnchor="middle" fontSize="8" fill="#3b6690">H₂O vapour</text>
          <text x="210" y="80" fontSize="7.5" fill="#3b6690">(gas state)</text>
        </>
      )}

      {state.heatApplied && (
        <>
          <motion.path
            d="M140 175 C140 165 148 160 150 155 C152 160 160 165 160 175"
            fill="#f97316" stroke="none"
            animate={{ d: ["M140 175 C140 165 148 160 150 155 C152 160 160 165 160 175",
                           "M142 175 C142 163 149 158 150 153 C151 158 158 163 158 175"] }}
            transition={{ repeat: Infinity, duration: 0.4, repeatType: "mirror" }}
          />
          <motion.path
            d="M144 175 C144 168 150 164 150 159 C150 164 156 168 156 175"
            fill="#fcd34d" stroke="none"
            animate={{ d: ["M144 175 C144 168 150 164 150 159 C150 164 156 168 156 175",
                           "M145 175 C145 166 150 162 150 157 C150 162 155 166 155 175"] }}
            transition={{ repeat: Infinity, duration: 0.3, repeatType: "mirror" }}
          />
        </>
      )}

      <text x="68" y="115" fontSize="8"   fill="#3b6690" textAnchor="end">NaCl(aq):</text>
      <text x="68" y="125" fontSize="7.5" fill="#2d4a6a" textAnchor="end">liquid state</text>
      {state.solutionAdded && (
        <text x="68" y="135" fontSize="7" fill="#2d4a6a" textAnchor="end">0.5 M, 50 mL</text>
      )}

      <rect x="80" y="192" width="140" height="8" rx="4" fill="rgba(148,163,184,0.22)" />
      <motion.rect
        x="80" y="192"
        animate={{ width: state.evapProgress * 1.4 }}
        height="8" rx="4"
        fill="#fb923c"
        transition={{ duration: 0.6 }}
      />
      <text x="150" y="210" textAnchor="middle" fontSize="7.5" fill="#3b6690">
        {state.evapProgress.toFixed(0)}% evaporated
      </text>
    </svg>
  );
}

function DistillationDiagram({ state }: { state: DistillationState }) {
  const warmFrac = Math.max(0, (state.tempC - 20) / 90);

  return (
    <svg viewBox="0 0 320 220" width="100%" aria-label="Distillation apparatus">
      {/* Distillation flask — dark glass */}
      <ellipse cx="80" cy="140" rx="40" ry="14" fill="rgba(255,255,255,0.48)" stroke="#60a5fa" strokeWidth="1.5" />
      <rect x="40" y="126" width="80" height="14" fill="rgba(255,255,255,0.48)" />
      <path d="M40 126 L40 155 Q40 165 80 165 Q120 165 120 155 L120 126"
            fill="rgba(255,255,255,0.48)" stroke="#60a5fa" strokeWidth="1.5" />
      <line x1="80" y1="112" x2="80" y2="126" stroke="#60a5fa" strokeWidth="4" strokeLinecap="round" />
      <line x1="100" y1="118" x2="175" y2="90" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" />

      <motion.ellipse
        cx="80" cy="155" rx="38" ry="8"
        animate={{ fill: `rgba(${Math.round(30 + warmFrac * 80)}, ${Math.round(100 - warmFrac * 40)}, ${Math.round(180 - warmFrac * 80)}, 0.55)` }}
        transition={{ duration: 0.8 }}
      />

      {state.flaskSetUp && (
        <>
          <rect x="76" y="92" width="8" height="24" rx="4"
                fill="rgba(255,255,255,0.55)" stroke="rgba(99,179,237,0.35)" strokeWidth="1" />
          <motion.rect
            x="78" y={112 - warmFrac * 18}
            width="4"
            animate={{ height: 4 + warmFrac * 18 }}
            rx="2" fill="#ef4444"
            transition={{ duration: 0.5 }}
          />
          <circle cx="80" cy="116" r="5" fill="#ef4444" />
          <text x="68" y="105" fontSize="8" fill="#3b6690" textAnchor="end">
            {state.tempC.toFixed(0)}°C
          </text>
        </>
      )}

      {/* Condenser */}
      <rect x="170" y="72" width="80" height="16" rx="3"
            fill="rgba(255,255,255,0.48)" stroke="#0ea5e9" strokeWidth="1.5"
            transform="rotate(-20, 210, 80)" />
      {state.condenserOn && (
        <text x="210" y="68" textAnchor="middle" fontSize="7.5" fill="#0ea5e9" transform="rotate(-20, 210, 68)">
          Condenser (cooling)
        </text>
      )}

      {/* Collection flask — dark glass */}
      <path d="M250 130 L240 170 Q240 180 260 180 Q280 180 280 170 L270 130 Z"
            fill="rgba(255,255,255,0.48)" stroke="#34d399" strokeWidth="1.5" />
      {state.fraction1Ml > 0 && (
        <motion.rect
          x="241" y={180 - state.fraction1Ml * 2}
          width="38"
          animate={{ height: state.fraction1Ml * 2 }}
          fill={state.firstFractionDone ? "rgba(52,211,153,0.35)" : "rgba(251,191,36,0.35)"}
          transition={{ duration: 0.5 }}
        />
      )}
      <text x="260" y="192" textAnchor="middle" fontSize="7.5" fill="#34d399">
        {state.firstFractionDone ? `EtOH: ${state.fraction1Ml.toFixed(1)} mL` : "Fraction 1"}
      </text>

      {state.heaterOn && state.tempC >= 76 && (
        <motion.path
          d="M100 118 Q138 95 175 88"
          fill="none" stroke="rgba(148,163,184,0.30)" strokeWidth="2" strokeDasharray="4 3"
          animate={{ strokeDashoffset: [-24, 0] }}
          transition={{ repeat: Infinity, duration: 0.6 }}
        />
      )}

      {state.heaterOn && (
        <motion.path
          d="M72 175 C72 168 78 163 80 158 C82 163 88 168 88 175"
          fill="#f97316"
          animate={{ d: ["M72 175 C72 168 78 163 80 158 C82 163 88 168 88 175",
                         "M73 175 C73 166 79 161 80 156 C81 161 87 166 87 175"] }}
          transition={{ repeat: Infinity, duration: 0.35, repeatType: "mirror" }}
        />
      )}

      <text x="80" y="208" textAnchor="middle" fontSize="7.5" fill="#3b6690">EtOH/H₂O mixture</text>
      <text x="80" y="218" textAnchor="middle" fontSize="7"   fill="#2d4a6a">(liquid, ~40% EtOH)</text>
    </svg>
  );
}

function ChromatographyDiagram({ state }: { state: ChromatographyState }) {
  const paperH = 160;
  const frontY = state.solventAdded ? Math.max(0, paperH - (state.solventFrontMm / 80) * paperH) : paperH;

  return (
    <svg viewBox="0 0 300 230" width="100%" aria-label="Chromatography">
      {/* Tank — dark glass */}
      <rect x="60" y="40" width="180" height="175" rx="4"
            fill="rgba(255,255,255,0.48)" stroke="rgba(71,85,105,0.50)" strokeWidth="1.5" />
      {/* Chromatography paper */}
      <rect x="90" y="50" width="120" height={paperH}
            fill="rgba(248,244,232,0.96)" stroke="rgba(180,140,60,0.55)" strokeWidth="1" />

      {state.paperPrepared && (
        <>
          <line x1="90" y1="195" x2="210" y2="195" stroke="rgba(99,179,237,0.35)" strokeWidth="1" strokeDasharray="3 2" />
          <text x="215" y="198" fontSize="7.5" fill="#3b6690">baseline</text>
        </>
      )}

      {state.sampleSpotted && (
        <>
          {[120, 150, 180].map((x, i) => {
            const spot  = state.spotsData[i];
            const color = spot ? spot.color : ["#60a5fa", "#f87171", "#4ade80"][i];
            const distY = spot ? 195 - (spot.distanceMm / 80) * paperH : 195;
            return (
              <g key={i}>
                {state.solventAdded && (
                  <motion.line
                    x1={x} y1="195" x2={x} y2={distY}
                    stroke={color} strokeWidth="1" opacity="0.35"
                    animate={{ y2: distY }}
                    transition={{ duration: 0.5 }}
                  />
                )}
                <motion.circle
                  cx={x} cy={distY} r="5"
                  fill={color} opacity="0.85"
                  animate={{ cy: distY }}
                  transition={{ duration: 0.5 }}
                />
                {state.developed && spot && (
                  <text x={x + 8} y={distY + 3} fontSize="6.5" fill={color}>
                    Rf={spot.rf.toFixed(2)}
                  </text>
                )}
              </g>
            );
          })}
        </>
      )}

      {state.solventAdded && frontY < paperH + 50 && (
        <motion.line
          x1="90" y1={frontY} x2="210" y2={frontY}
          stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="4 2"
          animate={{ y1: frontY, y2: frontY }}
          transition={{ duration: 0.4 }}
        />
      )}

      {state.solventAdded && (
        <rect x="61" y="196" width="178" height="18" rx="2" fill="rgba(8,145,178,0.20)" />
      )}

      <text x="150" y="222" textAnchor="middle" fontSize="7.5" fill="#0ea5e9">
        {state.solventAdded ? "Ethanol solvent (mobile phase)" : "Solvent tank"}
      </text>

      {state.sampleSpotted && (
        <g>
          {["Blue dye", "Red dye", "Yellow dye"].map((name, i) => {
            const colors = ["#60a5fa", "#f87171", "#4ade80"];
            return (
              <g key={i}>
                <circle cx="68" cy={170 - i * 14} r="4" fill={colors[i]} />
                <text x="75" y={173 - i * 14} fontSize="7" fill="#3b6690">{name}</text>
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
}

// ── Narrator Panel ────────────────────────────────────────────────────────────

function NarratorPanel({ store }: { store: SeparationTechniquesStore }) {
  const getText = (): { title: string; body: string; color: string } => {
    if (store.technique === "filtration") {
      const f = store.filtration;
      if (!f.filterSetUp) return { title: "Ready to begin", body: "Set up the filter funnel with folded filter paper. The paper acts as a physical barrier — only particles smaller than its pores can pass through.", color: "#2563eb" };
      if (!f.mixtureAdded) return { title: "Filter paper in place", body: "The filter paper cone is in the funnel over a beaker. You can now add the sand–water mixture. Sand particles (~0.1–2 mm) are far too large to pass through the paper's micron-scale pores.", color: "#2563eb" };
      if (f.pourProgress < 100) return { title: "Filtration in progress", body: `${f.pourProgress.toFixed(0)}% poured. Water molecules and dissolved ions pass through freely. Sand grains are physically blocked and accumulate on the paper surface as the residue.`, color: "#0891b2" };
      if (!f.residueDried) return { title: "Filtrate collected", body: "The filtrate (clear water below) has passed through. The residue (sand) remains on the filter paper. Remove and dry the filter paper to recover and weigh the sand.", color: "#059669" };
      return { title: "Filtration complete", body: `${f.solidRecoveredG} g sand (residue) recovered on filter paper. ~50 mL clear filtrate collected. The two components have been physically separated by particle size.`, color: "#059669" };
    }
    if (store.technique === "evaporation") {
      const e = store.evaporation;
      if (!e.solutionAdded) return { title: "Ready to begin", body: "Add the NaCl solution to the evaporating dish. The solution contains Na⁺ and Cl⁻ ions dissolved in water — currently a clear, colourless liquid.", color: "#ea580c" };
      if (!e.heatApplied) return { title: "Solution in dish", body: "50 mL of 0.5 M NaCl(aq) in the evaporating dish. Content: water (solvent, liquid) + NaCl (solute, dissolved ionic solid). Apply heat to begin evaporation.", color: "#ea580c" };
      if (!e.crystalsForming) return { title: "Evaporating", body: `${e.evapProgress.toFixed(0)}% of water removed. As water evaporates, [Na⁺] and [Cl⁻] increase. The solution is concentrating — approaching saturation point.`, color: "#d97706" };
      if (!e.complete) return { title: "Crystals forming!", body: "NaCl crystals appearing — the solution is now supersaturated. Stop heating now to preserve crystal structure. Excessive heat causes small, impure crystals or decomposition.", color: "#dc2626" };
      return { title: "Evaporation complete", body: `${e.crystalsMassG} g of pure NaCl crystals recovered. The water has been removed by evaporation; the ionic solid remains as the crystalline residue.`, color: "#059669" };
    }
    if (store.technique === "distillation") {
      const d = store.distillation;
      if (!d.flaskSetUp) return { title: "Ready to begin", body: "Assemble the distillation apparatus. The mixture contains ethanol (b.p. ≈ 78 °C) and water (b.p. = 100 °C). Both are in the liquid state in the distillation flask.", color: "#059669" };
      if (!d.heaterOn) return { title: "Apparatus assembled", body: "Flask loaded with ethanol–water mixture (~40% EtOH v/v). Condenser connected to water supply. Starting condenser water flow before heating prevents uncondensed vapour loss.", color: "#059669" };
      if (d.tempC < 78) return { title: `Heating — ${d.tempC.toFixed(0)} °C`, body: "Temperature rising. Both components are still fully liquid. No vapour collected yet. The vapour space above the liquid is filling with the more volatile component (ethanol) vapour.", color: "#0891b2" };
      if (!d.firstFractionDone) return { title: `Collecting ethanol — ${d.tempC.toFixed(0)} °C`, body: `Ethanol boiling point reached. Ethanol vapour rising up neck, entering condenser, condensing back to liquid, dripping into collection flask. Fraction 1 collected: ${d.fraction1Ml.toFixed(1)} mL.`, color: "#f59e0b" };
      if (!d.complete) return { title: `Collecting water — ${d.tempC.toFixed(0)} °C`, body: `Ethanol fraction complete (${d.fraction1Ml.toFixed(1)} mL). Temperature now rising toward 100 °C for water fraction. Change collection vessel. Water condensing as second fraction.`, color: "#dc2626" };
      return { title: "Distillation complete", body: `Two fractions separated: Fraction 1 (ethanol) ${d.fraction1Ml.toFixed(1)} mL, Fraction 2 (water) ${d.fraction2Ml.toFixed(1)} mL. Identified by their boiling temperatures.`, color: "#059669" };
    }
    if (store.technique === "chromatography") {
      const c = store.chromatography;
      if (!c.paperPrepared) return { title: "Ready to begin", body: "Prepare the chromatography paper by drawing a pencil baseline 2 cm from the bottom. Use pencil (not pen) — pen ink would be separated by the solvent along with the sample.", color: "#7c3aed" };
      if (!c.sampleSpotted) return { title: "Paper prepared", body: "Baseline drawn in pencil. The paper is the stationary phase — it will attract molecules to different degrees depending on their polarity, causing them to separate.", color: "#7c3aed" };
      if (!c.solventAdded) return { title: "Sample spotted", body: "Three concentrated spots of mixed ink on the baseline. Each spot contains all three dye components (blue, red, yellow) mixed together. Solvent will migrate up and separate them.", color: "#7c3aed" };
      if (c.runProgress < 100) return { title: `Running — ${c.runProgress.toFixed(0)}% complete`, body: `Solvent front at ${c.solventFrontMm.toFixed(1)} mm. The three dyes are separating: they migrate at different speeds depending on their solubility in ethanol vs. attraction to paper fibres.`, color: "#0891b2" };
      return { title: "Chromatogram developed", body: `Three components separated. Rf values: Blue=${c.spotsData[0]?.rf.toFixed(2)}, Red=${c.spotsData[1]?.rf.toFixed(2)}, Yellow=${c.spotsData[2]?.rf.toFixed(2)}. Rf is characteristic of each substance under these conditions.`, color: "#059669" };
    }
    return { title: "Select a technique", body: "Choose one of the four separation techniques from the workspace to begin the procedure.", color: "#64748b" };
  };

  const { title, body, color } = getText();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={title}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.25 }}
        className="rounded-xl p-4"
        style={{
          background: "var(--lab-glass-heavy)",
          border:     "1px solid var(--lab-glass-border)",
          boxShadow:  "var(--lab-shadow-sm)",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
          <p className="text-xs font-bold" style={{ color }}>{title}</p>
        </div>
        <p className="text-[11px] leading-relaxed" style={{ color: "var(--lab-text-muted)" }}>
          {body}
        </p>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Technique Controls ────────────────────────────────────────────────────────

function TechniqueControls({ store }: { store: SeparationTechniquesStore }) {
  const disabled = store.status === "completed";

  if (store.technique === "filtration") {
    return (
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "#2563eb" }}>
          Filtration Controls
        </p>
        <CtrlBtn disabled={disabled || store.filtration.filterSetUp} onClick={store.filtrationSetupFilterAction} color="#2563eb">
          1. Set Up Filter Funnel
        </CtrlBtn>
        <CtrlBtn disabled={disabled || !store.filtration.filterSetUp || store.filtration.mixtureAdded} onClick={store.filtrationAddMixtureAction} color="#0891b2">
          2. Add Mixture (Sand + Water)
        </CtrlBtn>
        <CtrlBtn disabled={disabled || !store.filtration.filtrateCollected || store.filtration.residueDried} onClick={store.filtrationDryResidueAction} color="#059669">
          3. Remove &amp; Dry Residue
        </CtrlBtn>
      </div>
    );
  }
  if (store.technique === "evaporation") {
    return (
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "#ea580c" }}>
          Evaporation Controls
        </p>
        <CtrlBtn disabled={disabled || store.evaporation.solutionAdded} onClick={store.evaporationAddSolutionAction} color="#ea580c">
          1. Add NaCl Solution
        </CtrlBtn>
        <CtrlBtn disabled={disabled || !store.evaporation.solutionAdded || store.evaporation.heatApplied} onClick={store.evaporationApplyHeatAction} color="#d97706">
          2. Apply Bunsen Burner Heat
        </CtrlBtn>
      </div>
    );
  }
  if (store.technique === "distillation") {
    return (
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "#059669" }}>
          Distillation Controls
        </p>
        <CtrlBtn disabled={disabled || store.distillation.flaskSetUp} onClick={store.distillationSetUpAction} color="#059669">
          1. Assemble Apparatus
        </CtrlBtn>
        <CtrlBtn disabled={disabled || !store.distillation.flaskSetUp || store.distillation.heaterOn} onClick={store.distillationStartHeatAction} color="#0891b2">
          2. Start Condenser &amp; Heater
        </CtrlBtn>
      </div>
    );
  }
  if (store.technique === "chromatography") {
    return (
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "#7c3aed" }}>
          Chromatography Controls
        </p>
        <CtrlBtn disabled={disabled || store.chromatography.paperPrepared} onClick={store.chromatographyPreparePaperAction} color="#7c3aed">
          1. Prepare Paper (draw baseline)
        </CtrlBtn>
        <CtrlBtn disabled={disabled || !store.chromatography.paperPrepared || store.chromatography.sampleSpotted} onClick={store.chromatographySpotSampleAction} color="#7c3aed">
          2. Spot Sample on Baseline
        </CtrlBtn>
        <CtrlBtn disabled={disabled || !store.chromatography.sampleSpotted || store.chromatography.solventAdded} onClick={store.chromatographyAddSolventAction} color="#0891b2">
          3. Place in Solvent Tank
        </CtrlBtn>
      </div>
    );
  }
  return null;
}

function CtrlBtn({
  disabled, onClick, color, children,
}: {
  disabled:  boolean;
  onClick:   () => void;
  color:     string;
  children:  React.ReactNode;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="w-full py-2 px-3 text-xs font-semibold rounded-lg border text-left transition-all duration-150 disabled:opacity-35 disabled:cursor-not-allowed hover:opacity-85 active:scale-95"
      style={{
        background:  disabled ? "var(--lab-glass)" : `${color}0d`,
        borderColor: disabled ? "var(--lab-glass-border)" : `${color}40`,
        color:       disabled ? "var(--lab-text-subtle)" : color,
      }}
    >
      {children}
    </button>
  );
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────

function FiltrationIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M4 4 L18 4 L14 10 L8 10 Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <line x1="11" y1="10" x2="11" y2="18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <ellipse cx="11" cy="18" rx="4" ry="1.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function EvaporationIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M5 16 Q11 14 17 16 L17 20 L5 20 Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M8 13 Q8 9 11 7 Q14 9 14 13" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.6" />
      <path d="M9 10 Q9 7 11 5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function DistillationIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="7" cy="14" r="4" stroke="currentColor" strokeWidth="1.4" />
      <line x1="11" y1="11" x2="16" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="14" y="5" width="6" height="3" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <line x1="17" y1="8" x2="17" y2="14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="17" cy="16" r="2" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function ChromatographyIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="8" y="2" width="6" height="18" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <line x1="8" y1="17" x2="14" y2="17" stroke="currentColor" strokeWidth="1" opacity="0.5" strokeDasharray="2 1" />
      <circle cx="11" cy="13" r="1.5" fill="currentColor" opacity="0.7" />
      <circle cx="10" cy="9" r="1.5" fill="currentColor" opacity="0.5" />
      <circle cx="12" cy="6" r="1.5" fill="currentColor" opacity="0.3" />
    </svg>
  );
}
