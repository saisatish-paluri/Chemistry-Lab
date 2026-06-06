"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface Reagent {
  name:           string;
  concentration?: string;
}

export type SafetyLevel = "danger" | "warning" | "caution" | "mandatory";

export interface SafetyNote {
  level:   SafetyLevel;
  message: string;
}

export interface PreLabIntroProps {
  title:       string;
  objective:   string;
  apparatus:   string[];
  reagents?:   Reagent[];
  safetyNotes: (string | SafetyNote)[];
}

const SAFETY_CONFIG: Record<SafetyLevel, {
  bg: string; border: string; text: string; label: string;
  icon: () => React.ReactNode;
}> = {
  danger: {
    bg: "#fef2f2", border: "#fecaca", text: "#7f1d1d", label: "Danger",
    icon: () => (
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
        <path d="M5.5 1L10 10H1L5.5 1Z" fill="#ef4444" fillOpacity="0.18" stroke="#ef4444" strokeWidth="1" strokeLinejoin="round" />
        <line x1="5.5" y1="4.5" x2="5.5" y2="6.5" stroke="#ef4444" strokeWidth="1.1" strokeLinecap="round" />
        <circle cx="5.5" cy="8" r="0.55" fill="#ef4444" />
      </svg>
    ),
  },
  warning: {
    bg: "#fffbeb", border: "#fde68a", text: "#78350f", label: "Warning",
    icon: () => (
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
        <path d="M5.5 1L10 10H1L5.5 1Z" fill="#f59e0b" fillOpacity="0.18" stroke="#f59e0b" strokeWidth="1" strokeLinejoin="round" />
        <line x1="5.5" y1="4.5" x2="5.5" y2="6.5" stroke="#f59e0b" strokeWidth="1.1" strokeLinecap="round" />
        <circle cx="5.5" cy="8" r="0.55" fill="#f59e0b" />
      </svg>
    ),
  },
  caution: {
    bg: "#fff7ed", border: "#fed7aa", text: "#7c2d12", label: "Caution",
    icon: () => (
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
        <circle cx="5.5" cy="5.5" r="4.5" fill="#fb923c" fillOpacity="0.14" stroke="#fb923c" strokeWidth="1" />
        <line x1="5.5" y1="3.5" x2="5.5" y2="6" stroke="#fb923c" strokeWidth="1.1" strokeLinecap="round" />
        <circle cx="5.5" cy="7.5" r="0.55" fill="#fb923c" />
      </svg>
    ),
  },
  mandatory: {
    bg: "#eff6ff", border: "#bfdbfe", text: "#1e3a8a", label: "Required",
    icon: () => (
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
        <circle cx="5.5" cy="5.5" r="4.5" fill="#3b82f6" fillOpacity="0.14" stroke="#3b82f6" strokeWidth="1" />
        <line x1="5.5" y1="4" x2="5.5" y2="7.5" stroke="#3b82f6" strokeWidth="1.1" strokeLinecap="round" />
        <circle cx="5.5" cy="2.8" r="0.55" fill="#3b82f6" />
      </svg>
    ),
  },
};

function normaliseSafetyNote(n: string | SafetyNote): SafetyNote {
  if (typeof n === "string") return { level: "warning", message: n };
  return n;
}

function groupSafetyNotes(notes: (string | SafetyNote)[]): Map<SafetyLevel, string[]> {
  const ORDER: SafetyLevel[] = ["danger", "warning", "caution", "mandatory"];
  const map = new Map<SafetyLevel, string[]>(ORDER.map((l) => [l, []]));
  for (const n of notes) {
    const { level, message } = normaliseSafetyNote(n);
    map.get(level)!.push(message);
  }
  return map;
}

export default function PreLabIntro({
  title, objective, apparatus, reagents = [], safetyNotes,
}: PreLabIntroProps) {
  const [isOpen, setIsOpen] = useState(false);
  const grouped = groupSafetyNotes(safetyNotes);

  const dangerNotes = grouped.get("danger")!.length + grouped.get("warning")!.length;

  return (
    <>
      {/* Collapsed trigger — floating badge */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.75, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.75, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => setIsOpen(true)}
            title="Pre-Lab Introduction"
            aria-label="Open pre-lab introduction"
            className="fixed bottom-5 left-5 z-40 flex items-center gap-2 px-3.5 py-2 rounded-xl hover:opacity-90 active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            style={{
              background: "var(--lab-blue-600)",
              color:      "white",
              boxShadow:  "var(--lab-shadow-md)",
            }}
          >
            <DocIcon />
            <span className="text-xs font-semibold hidden sm:block">Pre-Lab</span>
            {dangerNotes > 0 && (
              <span
                className="w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center flex-shrink-0"
                style={{ background: "#ef4444", color: "white" }}
              >
                !
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 20 }}
              animate={{ scale: 1,    opacity: 1, y: 0  }}
              exit={{ scale: 0.93,    opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.38, bounce: 0.12 }}
              className="glass-heavy rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col"
              style={{ boxShadow: "0 32px 80px rgba(15,23,42,0.18), 0 8px 24px rgba(15,23,42,0.08), 0 0 0 1px rgba(255,255,255,0.75) inset" }}
              role="dialog"
              aria-modal="true"
              aria-label={`Pre-lab introduction: ${title}`}
            >
              {/* Gradient accent top bar */}
              <div
                className="h-1 w-full rounded-t-2xl flex-shrink-0"
                style={{ background: "linear-gradient(90deg, #1d4ed8 0%, #0ea5e9 50%, #7c3aed 100%)" }}
                aria-hidden="true"
              />

              {/* Header */}
              <div
                className="flex items-start justify-between gap-4 px-6 pt-5 pb-5 border-b flex-shrink-0"
                style={{ borderColor: "var(--lab-glass-border)" }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-1"
                     style={{ color: "var(--lab-blue-600)" }}>
                    Pre-Lab Introduction
                  </p>
                  <h2 className="text-lg font-bold leading-snug" style={{ color: "var(--lab-text-primary)" }}>
                    {title}
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-shrink-0 flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl text-white transition-all duration-150 hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%)", boxShadow: "0 2px 10px rgba(37,99,235,0.28)" }}
                >
                  Begin Lab
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M3 2.5l4.5 3.5L3 9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Objective */}
                <section>
                  <SectionLabel>Objective</SectionLabel>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--lab-text-muted)" }}>
                    {objective}
                  </p>
                </section>

                {/* Apparatus */}
                <section>
                  <SectionLabel>Apparatus &amp; Materials</SectionLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {apparatus.map((item) => (
                      <span
                        key={item}
                        className="text-xs px-2.5 py-1 rounded-full border font-medium"
                        style={{
                          background:  "var(--lab-surface)",
                          borderColor: "var(--lab-glass-border)",
                          color:       "var(--lab-text-secondary)",
                        }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </section>

                {/* Reagents */}
                {reagents.length > 0 && (
                  <section>
                    <SectionLabel>Reagents &amp; Concentrations</SectionLabel>
                    <div className="rounded-xl overflow-hidden border" style={{ borderColor: "var(--lab-glass-border)" }}>
                      {reagents.map((r, i) => (
                        <div
                          key={r.name}
                          className="flex items-center justify-between px-3 py-2.5 text-xs"
                          style={{
                            background:  i % 2 === 0 ? "var(--lab-surface)" : "rgba(255,255,255,0.6)",
                            borderTop:   i > 0 ? "1px solid var(--lab-glass-border)" : "none",
                            color:       "var(--lab-text-secondary)",
                          }}
                        >
                          <span className="font-semibold">{r.name}</span>
                          {r.concentration && (
                            <span className="font-mono text-[10.5px] px-2 py-0.5 rounded-md"
                                  style={{ background: "rgba(37,99,235,0.07)", color: "var(--lab-blue-700)" }}>
                              {r.concentration}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Safety */}
                <section>
                  <SectionLabel danger>Safety Highlights</SectionLabel>
                  <div className="space-y-2.5">
                    {(["danger", "warning", "caution", "mandatory"] as SafetyLevel[]).map((level) => {
                      const notes = grouped.get(level)!;
                      if (notes.length === 0) return null;
                      const cfg = SAFETY_CONFIG[level];
                      return (
                        <div key={level}>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            {cfg.icon()}
                            <span
                              className="text-[9px] font-bold uppercase tracking-widest"
                              style={{ color: cfg.text }}
                            >
                              {cfg.label}
                            </span>
                            <div className="flex-1 h-px" style={{ background: cfg.border }} />
                          </div>
                          <div className="space-y-1.5">
                            {notes.map((note) => (
                              <div
                                key={note}
                                className="flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs border"
                                style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.text }}
                              >
                                {cfg.icon()}
                                <span className="leading-snug">{note}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>

              {/* Sticky footer CTA */}
              <div
                className="flex-shrink-0 px-6 py-4 border-t"
                style={{ borderColor: "var(--lab-glass-border)", background: "rgba(255,255,255,0.8)" }}
              >
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:opacity-90 active:scale-95 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%)", boxShadow: "0 2px 12px rgba(37,99,235,0.28)" }}
                >
                  I have read the safety notes — Begin Lab
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M3 7h8M8 4l3.5 3L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SectionLabel({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
  return (
    <h3
      className="text-[10px] font-semibold uppercase tracking-widest mb-2"
      style={{ color: danger ? "#dc2626" : "var(--lab-blue-600)" }}
    >
      {children}
    </h3>
  );
}

function DocIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="3" y="2" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <line x1="6" y1="6"  x2="12" y2="6"  stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <line x1="6" y1="9"  x2="12" y2="9"  stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <line x1="6" y1="12" x2="9"  y2="12" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}
