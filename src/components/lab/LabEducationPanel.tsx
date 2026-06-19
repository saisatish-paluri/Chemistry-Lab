"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LabEducation } from "@/lib/experiment-education";

type EduTab = "aim" | "theory" | "apparatus" | "procedure" | "safety";

// ── Compact tab icons ─────────────────────────────────────────────────────────
function AimIcon()       { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.4"/><circle cx="6" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.4"/><circle cx="6" cy="6" r="0.8" fill="currentColor"/></svg>; }
function TheoryIcon()    { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 3h8M2 6h6M2 9h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>; }
function ApparatusIcon() { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M4.5 2v4L2 10h8L7.5 6V2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><line x1="4.5" y1="2" x2="7.5" y2="2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>; }
function ProcedureIcon() { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 10l3-3 2 2 4-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function SafetyIcon()    { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M6 1L2 3v4c0 2.5 1.8 4.3 4 5 2.2-.7 4-2.5 4-5V3L6 1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>; }

const TABS = [
  { id: "aim"       as EduTab, label: "Aim",     icon: <AimIcon />,       color: "#2563eb", bg: "#eff6ff" },
  { id: "theory"    as EduTab, label: "Theory",  icon: <TheoryIcon />,    color: "#4f46e5", bg: "#eef2ff" },
  { id: "apparatus" as EduTab, label: "Tools",   icon: <ApparatusIcon />, color: "#d97706", bg: "#fffbeb" },
  { id: "procedure" as EduTab, label: "Method",  icon: <ProcedureIcon />, color: "#059669", bg: "#ecfdf5" },
  { id: "safety"    as EduTab, label: "Safety",  icon: <SafetyIcon />,    color: "#dc2626", bg: "#fef2f2" },
];

interface Props {
  data:   LabEducation;
  accent: string;
}

export default function LabEducationPanel({ data, accent }: Props) {
  const [open, setOpen] = useState<EduTab | null>(null);
  const activeTab = open ? TABS.find((t) => t.id === open) : null;

  return (
    <div style={{ background: "var(--lab-white)", borderBottom: "1px solid var(--lab-glass-border)", flexShrink: 0 }}>
      {/* ── Tab strip ── */}
      <div
        className="flex items-center gap-0 overflow-x-auto"
        style={{ background: "linear-gradient(180deg, var(--lab-off-white) 0%, var(--lab-white) 100%)", height: 38 }}
        role="tablist"
        aria-label="Experiment education sections"
      >
        {TABS.map((tab) => {
          const isActive = open === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`edu-panel-${tab.id}`}
              onClick={() => setOpen(isActive ? null : tab.id)}
              className="relative flex items-center gap-1.5 px-3.5 h-full flex-shrink-0 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
              style={{
                color:      isActive ? tab.color : "var(--lab-text-muted)",
                background: isActive ? `${tab.color}08` : "transparent",
                fontSize:   "11px",
                fontWeight: 600,
              }}
            >
              <span style={{ color: isActive ? tab.color : "var(--lab-slate-400)" }}>{tab.icon}</span>
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="edu-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: tab.color }}
                  transition={{ duration: 0.18, ease: "easeInOut" }}
                />
              )}
            </button>
          );
        })}

        {/* Key equation pill — always visible */}
        {data.keyEquation && (
          <>
            <div className="flex-1 min-w-4" />
            <div
              className="hidden md:flex items-center gap-2 mr-3 px-3 py-1 rounded-full flex-shrink-0"
              style={{ background: `${accent}0e`, border: `1px solid ${accent}28`, maxWidth: "min(380px, 35vw)" }}
            >
              <span className="text-[9px] font-bold uppercase tracking-widest flex-shrink-0" style={{ color: `${accent}99` }}>
                {data.keyEquationLabel ?? "Equation"}
              </span>
              <span className="font-mono text-[10px] truncate" style={{ color: accent }}>
                {data.keyEquation}
              </span>
            </div>
          </>
        )}
      </div>

      {/* ── Expandable visual panel ── */}
      <AnimatePresence initial={false}>
        {open && activeTab && (
          <motion.div
            key={open}
            id={`edu-panel-${open}`}
            role="tabpanel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                padding:    "12px 16px 14px",
                borderTop:  `2px solid ${activeTab.color}22`,
                background: `linear-gradient(180deg, ${activeTab.bg} 0%, var(--lab-white) 100%)`,
              }}
            >
              {open === "aim"       && <AimContent       data={data} color={activeTab.color} />}
              {open === "theory"    && <TheoryContent    data={data} color={activeTab.color} />}
              {open === "apparatus" && <ApparatusContent data={data} color={activeTab.color} />}
              {open === "procedure" && <ProcedureContent data={data} color={activeTab.color} />}
              {open === "safety"    && <SafetyContent    data={data} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Tab content sections ──────────────────────────────────────────────────────

// AIM — objective headline + equation card
function AimContent({ data, color }: { data: LabEducation; color: string }) {
  const firstSentence = data.aim.split(/\.\s/)[0].replace(/\.$/, "").trim();
  const short = firstSentence.length > 120 ? firstSentence.slice(0, 118) + "…" : firstSentence;

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <p style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: `${color}88`, marginBottom: 6 }}>
          Objective
        </p>
        <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.5, color: "var(--lab-text-primary)" }}>
          {short}.
        </p>
      </div>

      {data.keyEquation && (
        <div
          style={{
            display: "flex", flexDirection: "column", gap: 3,
            background: `${color}0d`, border: `1px solid ${color}22`,
            borderRadius: 12, padding: "10px 14px", flexShrink: 0,
          }}
        >
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: `${color}80` }}>
            {data.keyEquationLabel ?? "Key Equation"}
          </p>
          <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 15, fontWeight: 800, color, lineHeight: 1.3 }}>
            {data.keyEquation}
          </p>
        </div>
      )}
    </div>
  );
}

// THEORY — equation hero + chemical swatches + collapsed text
function TheoryContent({ data, color }: { data: LabEducation; color: string }) {
  const [showText, setShowText] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Equation hero */}
      {data.keyEquation && (
        <div
          style={{
            background: `linear-gradient(135deg, ${color}09, ${color}04)`,
            border: `1px solid ${color}1c`, borderRadius: 12,
            padding: "10px 16px", textAlign: "center",
          }}
        >
          <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 16, fontWeight: 800, color, letterSpacing: "0.02em" }}>
            {data.keyEquation}
          </p>
          {data.keyEquationLabel && (
            <p style={{ fontSize: 10, color: "var(--lab-text-muted)", marginTop: 4 }}>{data.keyEquationLabel}</p>
          )}
        </div>
      )}

      {/* Chemical swatches */}
      {data.chemicals.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center" }}>
          <span style={{ fontSize: 9.5, fontWeight: 700, color: "var(--lab-text-muted)", textTransform: "uppercase", letterSpacing: "0.09em", marginRight: 2 }}>
            Chemicals:
          </span>
          {data.chemicals.map((c) => (
            <div
              key={c.formula}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                background:  c.color ? `${c.color}14` : `${color}0e`,
                border:      `1px solid ${c.color ? c.color + "2a" : color + "22"}`,
                borderRadius: 20, padding: "2px 9px",
              }}
            >
              {c.color && (
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: c.color, border: "1px solid rgba(0,0,0,0.10)", flexShrink: 0 }} />
              )}
              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 10.5, fontWeight: 700, color: c.color ?? color }}>
                {c.formula}
              </span>
              <span style={{ fontSize: 9.5, color: "var(--lab-text-muted)" }}>{c.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Collapsed background text */}
      <button
        onClick={() => setShowText((s) => !s)}
        style={{
          display: "flex", alignItems: "center", gap: 5,
          background: "none", border: `1px solid ${color}1e`,
          borderRadius: 8, padding: "4px 10px", cursor: "pointer",
          fontSize: 10.5, fontWeight: 600, color: "var(--lab-text-muted)",
          alignSelf: "flex-start", transition: "all 0.15s",
        }}
      >
        <InfoSVG color={color} />
        {showText ? "Hide background" : "Scientific background"}
        <motion.span
          animate={{ rotate: showText ? 180 : 0 }}
          transition={{ duration: 0.18 }}
          style={{ display: "inline-block", fontSize: 9, lineHeight: 1 }}
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {showText && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <p style={{ fontSize: 11.5, lineHeight: 1.72, color: "var(--lab-text-secondary)" }}>
              {data.theory}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// APPARATUS — icon badge grid
function ApparatusContent({ data, color }: { data: LabEducation; color: string }) {
  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
      {/* Equipment grid */}
      <div style={{ flex: 1, minWidth: 180 }}>
        <p style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: `${color}88`, marginBottom: 8 }}>
          Equipment
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {data.apparatus.map((item, i) => (
            <div
              key={i}
              title={item}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                background: `${color}09`, border: `1px solid ${color}1c`,
                borderRadius: 8, padding: "5px 10px",
              }}
            >
              <LabItemIcon name={item} color={color} />
              <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--lab-text-secondary)" }}>
                {shortApparatusName(item)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reagent swatches */}
      {data.chemicals.length > 0 && (
        <div style={{ minWidth: 130 }}>
          <p style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: `${color}88`, marginBottom: 8 }}>
            Reagents
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {data.chemicals.map((c) => (
              <div
                key={c.formula}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background:  c.color ? `${c.color}12` : `${color}09`,
                  border:      `1px solid ${c.color ? c.color + "25" : color + "1e"}`,
                  borderRadius: 8, padding: "4px 9px",
                }}
              >
                {c.color && (
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: c.color, flexShrink: 0, border: "1px solid rgba(0,0,0,0.08)" }} />
                )}
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 10.5, fontWeight: 700, color: c.color ?? color }}>
                  {c.formula}
                </span>
                {c.concentration && (
                  <span style={{ fontSize: 9.5, color: "var(--lab-text-muted)" }}>{c.concentration}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// PROCEDURE — visual numbered flow
function ProcedureContent({ data, color }: { data: LabEducation; color: string }) {
  const steps = data.procedure.slice(0, 7);
  const extra = data.procedure.length - steps.length;

  return (
    <div>
      <p style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: `${color}88`, marginBottom: 8 }}>
        Method Overview
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center" }}>
        {steps.map((step, i) => (
          <span key={i} style={{ display: "contents" }}>
            {/* Step pill */}
            <div
              title={step}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: `${color}09`, border: `1px solid ${color}1e`,
                borderRadius: 20, padding: "4px 10px",
              }}
            >
              <span
                style={{
                  width: 16, height: 16, borderRadius: "50%",
                  background: `${color}1e`, border: `1px solid ${color}30`,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: 8.5, fontWeight: 800, color,
                  flexShrink: 0, lineHeight: 1,
                }}
              >
                {i + 1}
              </span>
              <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--lab-text-secondary)", whiteSpace: "nowrap" }}>
                {shortStep(step)}
              </span>
            </div>

            {/* Arrow connector */}
            {i < steps.length - 1 && (
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ color: "var(--lab-slate-300)", flexShrink: 0 }}>
                <path d="M1.5 4h5M4.5 2l2 2-2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </span>
        ))}

        {extra > 0 && (
          <span style={{ fontSize: 10, color: "var(--lab-text-muted)", padding: "4px 6px" }}>
            +{extra} steps
          </span>
        )}
      </div>
    </div>
  );
}

// SAFETY — icon + short label grid (title attribute carries full text)
function SafetyContent({ data }: { data: LabEducation }) {
  return (
    <div>
      <p style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: "rgba(220,38,38,0.65)", marginBottom: 8 }}>
        Safety Precautions
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {data.safetyNotes.map((note, i) => {
          const { icon, short } = classifySafety(note);
          return (
            <div
              key={i}
              title={note}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                background: "#fef2f2", border: "1px solid #fecaca",
                borderRadius: 8, padding: "4px 9px",
              }}
            >
              {icon}
              <span style={{ fontSize: 10.5, fontWeight: 600, color: "#9f1239" }}>
                {short}
              </span>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 9.5, color: "var(--lab-text-muted)", marginTop: 8, fontStyle: "italic" }}>
        Hover any badge to read the full precaution.
      </p>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function shortApparatusName(name: string): string {
  const clean = name.replace(/\([^)]*\)/g, "").trim();
  const words = clean.split(/\s+/);
  return words.slice(0, 3).join(" ");
}

function shortStep(step: string): string {
  const words = step.split(/\s+/);
  if (words.length <= 5) return step;
  return words.slice(0, 5).join(" ") + "…";
}

// Classify safety notes into short icon + label pairs
function classifySafety(note: string): { icon: ReactNode; short: string } {
  const n = note.toLowerCase();

  if (n.includes("goggles") || n.includes("ppe") || n.includes("protective") || n.includes("gloves") || n.includes("lab coat")) {
    return { icon: <SafetyPPEIcon />, short: "Wear PPE" };
  }
  if (n.includes("flammable") || n.includes("flame") || n.includes("open flame") || n.includes("fire")) {
    return { icon: <SafetyFlameIcon />, short: "Away from flames" };
  }
  if (n.includes("acid") || n.includes("corrosive") || n.includes("burn") || n.includes("caustic") || n.includes("alkali")) {
    return { icon: <SafetyCorrosiveIcon />, short: "Corrosive" };
  }
  if (n.includes("eat") || n.includes("drink") || n.includes("ingest") || n.includes("consume")) {
    return { icon: <SafetyNoFoodIcon />, short: "No food/drink" };
  }
  if (n.includes("dispos") || n.includes("drain") || n.includes("pour") || n.includes("neutralis")) {
    return { icon: <SafetyDisposalIcon />, short: "Safe disposal" };
  }
  if (n.includes("electric") || n.includes("disconnect") || n.includes("circuit") || n.includes("current")) {
    return { icon: <SafetyElectricalIcon />, short: "Electrical caution" };
  }
  if (n.includes("wash") || n.includes("hands") || n.includes("clean up")) {
    return { icon: <SafetyWashIcon />, short: "Wash hands" };
  }
  if (n.includes("report") || n.includes("accident") || n.includes("spill") || n.includes("injur")) {
    return { icon: <SafetyAlertIcon />, short: "Report incidents" };
  }
  if (n.includes("exit") || n.includes("location") || n.includes("first aid") || n.includes("eye wash")) {
    return { icon: <SafetyExitIcon />, short: "Know exits" };
  }
  if (n.includes("fume") || n.includes("ventilat") || n.includes("gas") || n.includes("odour")) {
    return { icon: <SafetyFumeIcon />, short: "Ventilate" };
  }

  // Fallback: first 3 words
  const words = note.replace(/[,;—–]/g, " ").trim().split(/\s+/);
  return { icon: <SafetyCautionIcon />, short: words.slice(0, 3).join(" ") + "…" };
}

// ── Inline SVG micro-icons ────────────────────────────────────────────────────

function InfoSVG({ color }: { color: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
      <circle cx="5.5" cy="5.5" r="4.5" stroke={color} strokeWidth="1.2"/>
      <line x1="5.5" y1="4.8" x2="5.5" y2="7.8" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="5.5" cy="3.4" r="0.65" fill={color}/>
    </svg>
  );
}

// Lab item icon — assign by keyword category
function LabItemIcon({ name, color }: { name: string; color: string }) {
  const n = name.toLowerCase();
  if (n.includes("burette")) return <BuretteIcon c={color} />;
  if (n.includes("flask") || n.includes("erlenmeyer") || n.includes("conical")) return <FlaskIcon c={color} />;
  if (n.includes("beaker")) return <BeakerIcon c={color} />;
  if (n.includes("thermometer")) return <ThermometerIcon c={color} />;
  if (n.includes("pipette") || n.includes("dropper")) return <PipetteIcon c={color} />;
  if (n.includes("test tube")) return <TestTubeIcon c={color} />;
  if (n.includes("stand") || n.includes("clamp") || n.includes("retort")) return <StandIcon c={color} />;
  if (n.includes("cylinder") || n.includes("measuring")) return <CylinderIcon c={color} />;
  if (n.includes("bunsen") || n.includes("burner")) return <BurnerIcon c={color} />;
  if (n.includes("balance") || n.includes("scale")) return <BalanceIcon c={color} />;
  if (n.includes("stirr") || n.includes("rod")) return <RodIcon c={color} />;
  if (n.includes("funnel") || n.includes("separating")) return <FunnelIcon c={color} />;
  if (n.includes("electrode") || n.includes("graphite") || n.includes("copper rod")) return <ElectrodeIcon c={color} />;
  if (n.includes("power") || n.includes("battery") || n.includes("d.c") || n.includes("d.c.")) return <PowerIcon c={color} />;
  if (n.includes("wire") || n.includes("lead") || n.includes("connect")) return <WireIcon c={color} />;
  if (n.includes("filter") || n.includes("paper")) return <FilterIcon c={color} />;
  if (n.includes("watch") || n.includes("petri") || n.includes("dish")) return <DishIcon c={color} />;
  if (n.includes("ph") || n.includes("meter")) return <MeterIcon c={color} />;
  if (n.includes("trough") || n.includes("tank") || n.includes("pneumatic")) return <TroughIcon c={color} />;
  return <GenericLabIcon c={color} />;
}

// ── Compact apparatus SVG icons (16×16 viewBox 0 0 16 16) ──────────────────────
function BuretteIcon({ c }: { c: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="6" y="1" width="4" height="11" rx="1.5" stroke={c} strokeWidth="1.2"/>
      <rect x="6.3" y="2" width="3.4" height="6" fill={c} fillOpacity="0.2" rx="1"/>
      <line x1="6" y1="5" x2="10" y2="5" stroke={c} strokeWidth="0.7" opacity="0.5"/>
      <line x1="6" y1="7" x2="10" y2="7" stroke={c} strokeWidth="0.7" opacity="0.5"/>
      <line x1="8" y1="12" x2="8" y2="15" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
function FlaskIcon({ c }: { c: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 2v5L2 13h12L10 7V2" stroke={c} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="6" y1="2" x2="10" y2="2" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M4 12 Q8 10.5 12 12" stroke={c} strokeWidth="0.9" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
}
function BeakerIcon({ c }: { c: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 2h8M4 2v12h8V2" stroke={c} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 11 Q8 10 12 11" stroke={c} strokeWidth="0.9" strokeLinecap="round" opacity="0.5"/>
      <path d="M12 4 L14 4" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
function ThermometerIcon({ c }: { c: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="6.5" y="2" width="3" height="9" rx="1.5" stroke={c} strokeWidth="1.2"/>
      <circle cx="8" cy="13" r="2.2" stroke={c} strokeWidth="1.2"/>
      <line x1="8" y1="11.5" x2="8" y2="7" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
function PipetteIcon({ c }: { c: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2 Q8 3 8 4" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="6" y="4" width="4" height="4" rx="1" stroke={c} strokeWidth="1.2"/>
      <line x1="8" y1="8" x2="8" y2="13" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="8" cy="13.5" r="0.8" fill={c}/>
    </svg>
  );
}
function TestTubeIcon({ c }: { c: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M5 2 L5 11 Q5 14 8 14 Q11 14 11 11 L11 2" stroke={c} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="5" y1="2" x2="11" y2="2" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M5 9 Q8 8 11 9" stroke={c} strokeWidth="0.9" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
}
function StandIcon({ c }: { c: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <line x1="8" y1="2" x2="8" y2="14" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="4" y1="14" x2="12" y2="14" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="8" y1="5" x2="13" y2="5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
function CylinderIcon({ c }: { c: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="5" y="3" width="6" height="11" rx="1.5" stroke={c} strokeWidth="1.2"/>
      <line x1="5" y1="7" x2="8" y2="7" stroke={c} strokeWidth="0.8" opacity="0.5"/>
      <line x1="5" y1="10" x2="8" y2="10" stroke={c} strokeWidth="0.8" opacity="0.5"/>
      <path d="M5 2 Q8 1 11 2" stroke={c} strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}
function BurnerIcon({ c }: { c: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="5" y="9" width="6" height="4" rx="1.5" stroke={c} strokeWidth="1.2"/>
      <rect x="3" y="13" width="10" height="2" rx="1" stroke={c} strokeWidth="1" fill={c} fillOpacity="0.1"/>
      <path d="M8 9 Q6 6 8 3 Q10 6 8 9" fill={c} fillOpacity="0.25" stroke={c} strokeWidth="0.9"/>
    </svg>
  );
}
function BalanceIcon({ c }: { c: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <line x1="8" y1="14" x2="8" y2="2" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="4" y1="14" x2="12" y2="14" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="4" y1="6" x2="12" y2="6" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M4 6 Q2 8 4 10" stroke={c} strokeWidth="0.9" fill="none"/>
      <path d="M12 6 Q14 8 12 10" stroke={c} strokeWidth="0.9" fill="none"/>
    </svg>
  );
}
function RodIcon({ c }: { c: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <line x1="4" y1="2" x2="12" y2="14" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
function FunnelIcon({ c }: { c: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 3 L8 9 L8 14 M13 3 L8 9" stroke={c} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="3" y1="3" x2="13" y2="3" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
function ElectrodeIcon({ c }: { c: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="6.5" y="1" width="3" height="13" rx="1" stroke={c} strokeWidth="1.2"/>
      <line x1="5" y1="4" x2="11" y2="4" stroke={c} strokeWidth="0.9" opacity="0.5"/>
      <line x1="5" y1="7" x2="11" y2="7" stroke={c} strokeWidth="0.9" opacity="0.5"/>
    </svg>
  );
}
function PowerIcon({ c }: { c: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="12" height="8" rx="2" stroke={c} strokeWidth="1.2"/>
      <line x1="5" y1="4" x2="5" y2="7" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="8" y1="4" x2="8" y2="6" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="11" y1="4" x2="11" y2="7" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
function WireIcon({ c }: { c: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M1 8 Q4 4 8 8 Q12 12 15 8" stroke={c} strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      <circle cx="1" cy="8" r="1.5" fill={c}/>
      <circle cx="15" cy="8" r="1.5" fill={c}/>
    </svg>
  );
}
function FilterIcon({ c }: { c: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 2 L8 8 L13 2 Z" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M8 8 L8 14" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
function DishIcon({ c }: { c: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 8 Q2 13 8 13 Q14 13 14 8" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="2" y1="8" x2="14" y2="8" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
function MeterIcon({ c }: { c: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="12" height="10" rx="2" stroke={c} strokeWidth="1.2"/>
      <text x="8" y="10" textAnchor="middle" fontSize="5" fontWeight="700" fill={c}>pH</text>
    </svg>
  );
}
function TroughIcon({ c }: { c: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 6 L2 12 Q2 14 4 14 L12 14 Q14 14 14 12 L14 6" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="1" y1="6" x2="15" y2="6" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
function GenericLabIcon({ c }: { c: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="9" r="4" stroke={c} strokeWidth="1.2"/>
      <line x1="8" y1="1" x2="8" y2="5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

// ── Safety icons ──────────────────────────────────────────────────────────────
function SafetyPPEIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <rect x="1" y="4" width="3.5" height="3" rx="1.2" stroke="#dc2626" strokeWidth="1"/>
      <rect x="7.5" y="4" width="3.5" height="3" rx="1.2" stroke="#dc2626" strokeWidth="1"/>
      <line x1="4.5" y1="5.5" x2="7.5" y2="5.5" stroke="#dc2626" strokeWidth="1"/>
    </svg>
  );
}
function SafetyFlameIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M6 11 Q3 9 3.5 6.5 Q4.5 7.5 5.5 7 Q5.5 5 7 2 Q7.5 5 9 5.5 Q9.5 7 7.5 8.5 Q8 10 6 11Z"
        fill="#dc2626" fillOpacity="0.2" stroke="#dc2626" strokeWidth="1" strokeLinejoin="round"/>
    </svg>
  );
}
function SafetyCorrosiveIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M1.5 2 L5 2 L4.5 5 Q5.5 4.5 6.5 5 Q7 6.5 5.5 7.5 L5 10" stroke="#dc2626" strokeWidth="1" strokeLinecap="round"/>
      <path d="M8 5.5 Q9 5 9.5 6.5 Q10 8 8.5 9" stroke="#dc2626" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}
function SafetyNoFoodIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="5" stroke="#dc2626" strokeWidth="1"/>
      <line x1="2.5" y1="2.5" x2="9.5" y2="9.5" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
function SafetyDisposalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M6 2 Q9 2 9 5 L9 9 Q9 10.5 7.5 10.5 L4.5 10.5 Q3 10.5 3 9 L3 5 Q3 2 6 2Z" stroke="#dc2626" strokeWidth="1"/>
      <line x1="2" y1="2" x2="10" y2="2" stroke="#dc2626" strokeWidth="1" strokeLinecap="round"/>
      <path d="M5 5 L5 8.5 M7 5 L7 8.5" stroke="#dc2626" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
}
function SafetyElectricalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M6.5 1.5 L3.5 6.5 H6 L5.5 10.5 L8.5 5.5 H6 Z" fill="#dc2626" fillOpacity="0.2" stroke="#dc2626" strokeWidth="1" strokeLinejoin="round"/>
    </svg>
  );
}
function SafetyWashIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M4 3 Q3 5 4 7 Q5 9 6 9 Q7 9 8 7 Q9 5 8 3" stroke="#dc2626" strokeWidth="1" strokeLinecap="round"/>
      <path d="M3 9 Q3.5 11 6 11 Q8.5 11 9 9" stroke="#dc2626" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}
function SafetyAlertIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M6 1.5 L11 10.5 H1 Z" fill="#dc2626" fillOpacity="0.15" stroke="#dc2626" strokeWidth="1" strokeLinejoin="round"/>
      <line x1="6" y1="5" x2="6" y2="7.5" stroke="#dc2626" strokeWidth="1.1" strokeLinecap="round"/>
      <circle cx="6" cy="9" r="0.65" fill="#dc2626"/>
    </svg>
  );
}
function SafetyExitIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="5" stroke="#dc2626" strokeWidth="1"/>
      <line x1="6" y1="4" x2="6" y2="8" stroke="#dc2626" strokeWidth="1.1" strokeLinecap="round"/>
      <circle cx="6" cy="3" r="0.65" fill="#dc2626"/>
    </svg>
  );
}
function SafetyFumeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 10 Q4 7 6 8 Q8 9 9 6 Q10 3 8 2" stroke="#dc2626" strokeWidth="1.1" strokeLinecap="round"/>
      <path d="M5 10 Q6 8 7 9 Q8 10 9 8" stroke="#dc2626" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
    </svg>
  );
}
function SafetyCautionIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M6 1 L11 10 H1 Z" fill="#dc2626" fillOpacity="0.12" stroke="#dc2626" strokeWidth="1" strokeLinejoin="round"/>
      <line x1="6" y1="4.5" x2="6" y2="7" stroke="#dc2626" strokeWidth="1.1" strokeLinecap="round"/>
      <circle cx="6" cy="8.5" r="0.6" fill="#dc2626"/>
    </svg>
  );
}
