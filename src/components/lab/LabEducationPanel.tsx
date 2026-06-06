"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LabEducation } from "@/lib/experiment-education";

type EduTab = "aim" | "theory" | "apparatus" | "procedure" | "safety";

interface TabConfig {
  id:      EduTab;
  label:   string;
  icon:    ReactNode;
  accent:  string;
  bg:      string;
}

function AimIcon()       { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.4"/><circle cx="6" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.4"/><circle cx="6" cy="6" r="0.8" fill="currentColor"/></svg>; }
function TheoryIcon()    { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 3h8M2 6h6M2 9h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>; }
function ApparatusIcon() { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M4.5 2v4L2 10h8L7.5 6V2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><line x1="4.5" y1="2" x2="7.5" y2="2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>; }
function ProcedureIcon() { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 10l3-3 2 2 4-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function SafetyIcon()    { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M6 1L2 3v4c0 2.5 1.8 4.3 4 5 2.2-.7 4-2.5 4-5V3L6 1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>; }

const TABS: TabConfig[] = [
  { id: "aim",       label: "Aim",       icon: <AimIcon />,       accent: "#2563eb", bg: "#eff6ff" },
  { id: "theory",    label: "Theory",    icon: <TheoryIcon />,    accent: "#4f46e5", bg: "#eef2ff" },
  { id: "apparatus", label: "Apparatus", icon: <ApparatusIcon />, accent: "#d97706", bg: "#fffbeb" },
  { id: "procedure", label: "Procedure", icon: <ProcedureIcon />, accent: "#059669", bg: "#ecfdf5" },
  { id: "safety",    label: "Safety",    icon: <SafetyIcon />,    accent: "#dc2626", bg: "#fef2f2" },
];

interface Props {
  data:   LabEducation;
  accent: string;
}

export default function LabEducationPanel({ data, accent }: Props) {
  const [open, setOpen] = useState<EduTab | null>(null);

  const activeTab = open ? TABS.find((t) => t.id === open) : null;

  return (
    <div
      style={{
        background:   "#ffffff",
        borderBottom: "1px solid var(--lab-glass-border)",
        flexShrink:   0,
      }}
    >
      {/* Tab strip */}
      <div
        className="flex items-center gap-0 overflow-x-auto"
        style={{
          background:  "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
          borderBottom: open ? "none" : "none",
          height:      38,
        }}
        role="tablist"
        aria-label="Experiment education sections"
      >
        {/* Label */}
        <span
          className="px-3 text-[10px] font-bold uppercase tracking-widest flex-shrink-0"
          style={{ color: "var(--lab-slate-400)" }}
        >
          Lab Info
        </span>

        <div
          className="w-px h-4 flex-shrink-0"
          style={{ background: "var(--lab-glass-border)" }}
        />

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
                color:      isActive ? tab.accent : "var(--lab-text-muted)",
                background: isActive ? `${tab.accent}08` : "transparent",
                fontSize:   "11px",
                fontWeight: 600,
              }}
            >
              <span style={{ color: isActive ? tab.accent : "var(--lab-slate-400)" }}>
                {tab.icon}
              </span>
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="edu-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: tab.accent }}
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
              style={{
                background:  `${accent}0e`,
                border:      `1px solid ${accent}28`,
                maxWidth:    "min(380px, 35vw)",
              }}
            >
              <span
                className="text-[9px] font-bold uppercase tracking-widest flex-shrink-0"
                style={{ color: `${accent}99` }}
              >
                {data.keyEquationLabel ?? "Equation"}
              </span>
              <span
                className="font-mono text-[10px] truncate"
                style={{ color: accent }}
              >
                {data.keyEquation}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Expandable content panel */}
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
                padding:    "14px 20px 16px",
                borderTop:  `2px solid ${activeTab.accent}22`,
                background: `linear-gradient(180deg, ${activeTab.bg} 0%, #ffffff 100%)`,
              }}
            >
              {open === "aim"       && <AimContent       data={data} accent={activeTab.accent} />}
              {open === "theory"    && <TheoryContent    data={data} accent={activeTab.accent} />}
              {open === "apparatus" && <ApparatusContent data={data} accent={activeTab.accent} />}
              {open === "procedure" && <ProcedureContent data={data} accent={activeTab.accent} />}
              {open === "safety"    && <SafetyContent    data={data} accent={activeTab.accent} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Tab content sections ──────────────────────────────────────────────────────

function AimContent({ data, accent }: { data: LabEducation; accent: string }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: `${accent}99` }}>
          Experiment Objective
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "var(--lab-text-secondary)" }}>
          {data.aim}
        </p>
      </div>
      {data.keyEquation && (
        <div
          className="sm:w-[220px] flex-shrink-0 rounded-xl p-3 flex flex-col gap-1"
          style={{ background: `${accent}08`, border: `1px solid ${accent}20` }}
        >
          <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: `${accent}99` }}>
            Key Equation
          </p>
          <p className="font-mono text-sm font-semibold" style={{ color: accent }}>
            {data.keyEquation}
          </p>
          {data.keyEquationLabel && (
            <p className="text-[10px]" style={{ color: "var(--lab-text-muted)" }}>
              {data.keyEquationLabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function TheoryContent({ data, accent }: { data: LabEducation; accent: string }) {
  return (
    <div className="flex flex-col sm:flex-row gap-5">
      <div className="flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: `${accent}99` }}>
          Scientific Background
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "var(--lab-text-secondary)" }}>
          {data.theory}
        </p>
      </div>
      {data.chemicals.length > 0 && (
        <div className="sm:w-[200px] flex-shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: `${accent}99` }}>
            Chemicals Used
          </p>
          <div className="flex flex-col gap-1.5">
            {data.chemicals.map((c) => (
              <div key={c.formula} className="flex items-center gap-2">
                {c.color && (
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: c.color, border: "1px solid rgba(0,0,0,0.1)" }}
                  />
                )}
                <span className="font-mono text-[11px] font-semibold" style={{ color: accent }}>
                  {c.formula}
                </span>
                <span className="text-[10.5px] truncate" style={{ color: "var(--lab-text-muted)" }}>
                  {c.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ApparatusContent({ data, accent }: { data: LabEducation; accent: string }) {
  return (
    <div className="flex flex-col sm:flex-row gap-5">
      <div className="flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: `${accent}99` }}>
          Equipment Required
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
          {data.apparatus.map((item, i) => (
            <div key={i} className="flex items-start gap-2 py-0.5">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="mt-0.5 flex-shrink-0">
                <rect x="1" y="1" width="12" height="12" rx="3" fill={`${accent}15`} stroke={`${accent}40`} strokeWidth="1"/>
                <path d="M4 7h6M7 4v6" stroke={accent} strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <span className="text-[12px] leading-snug" style={{ color: "var(--lab-text-secondary)" }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
      {data.chemicals.length > 0 && (
        <div className="sm:w-[240px] flex-shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: `${accent}99` }}>
            Chemicals &amp; Reagents
          </p>
          <div className="flex flex-col gap-2">
            {data.chemicals.map((c) => (
              <div
                key={c.formula}
                className="flex items-start gap-2 rounded-lg px-2.5 py-2"
                style={{ background: `${accent}06`, border: `1px solid ${accent}18` }}
              >
                {c.color && (
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
                    style={{ background: c.color, border: "1px solid rgba(0,0,0,0.12)" }}
                  />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold" style={{ color: accent }}>{c.formula}</span>
                    {c.concentration && (
                      <span className="text-[10px]" style={{ color: "var(--lab-text-muted)" }}>{c.concentration}</span>
                    )}
                  </div>
                  <p className="text-[10.5px] mt-0.5 leading-snug" style={{ color: "var(--lab-text-muted)" }}>{c.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProcedureContent({ data, accent }: { data: LabEducation; accent: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: `${accent}99` }}>
        Step-by-Step Method
      </p>
      <ol className="space-y-2">
        {data.procedure.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <div
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
              style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}30` }}
            >
              {i + 1}
            </div>
            <p className="text-[12.5px] leading-relaxed flex-1" style={{ color: "var(--lab-text-secondary)" }}>
              {step}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function SafetyContent({ data }: { data: LabEducation; accent: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(220,38,38,0.7)" }}>
        Safety Precautions
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {data.safetyNotes.map((note, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 rounded-lg px-3 py-2.5"
            style={{ background: "#fef2f2", border: "1px solid #fecaca" }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true" className="mt-0.5 flex-shrink-0">
              <path d="M6.5 1L12 12H1L6.5 1Z" fill="#ef4444" fillOpacity="0.18" stroke="#ef4444" strokeWidth="1.1" strokeLinejoin="round"/>
              <line x1="6.5" y1="5" x2="6.5" y2="7.5" stroke="#ef4444" strokeWidth="1.1" strokeLinecap="round"/>
              <circle cx="6.5" cy="9.2" r="0.65" fill="#ef4444"/>
            </svg>
            <p className="text-[12px] leading-snug" style={{ color: "#7f1d1d" }}>
              {note}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
