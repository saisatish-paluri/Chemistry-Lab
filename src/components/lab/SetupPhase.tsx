"use client";

import { motion, AnimatePresence } from "framer-motion";

export type SetupStatus = "not-started" | "in-progress" | "ready";

export interface SetupStep {
  id:          string;
  label:       string;
  description: string;
  done:        boolean;
  required:    boolean;
}

interface SetupPhaseProps {
  steps:     SetupStep[];
  onBegin:   () => void;
}

const STATUS_CONFIG: Record<SetupStatus, { label: string; bg: string; color: string; border: string; dot: string }> = {
  "not-started": {
    label:  "Not Started",
    bg:     "rgba(100,116,139,0.07)",
    color:  "var(--lab-text-subtle)",
    border: "var(--lab-glass-border)",
    dot:    "#94a3b8",
  },
  "in-progress": {
    label:  "In Progress",
    bg:     "rgba(234,179,8,0.08)",
    color:  "#92400e",
    border: "rgba(234,179,8,0.35)",
    dot:    "#f59e0b",
  },
  "ready": {
    label:  "Ready to Run",
    bg:     "rgba(5,150,105,0.08)",
    color:  "#065f46",
    border: "rgba(5,150,105,0.3)",
    dot:    "#10b981",
  },
};

function deriveStatus(steps: SetupStep[]): SetupStatus {
  const required = steps.filter((s) => s.required);
  const doneCount = required.filter((s) => s.done).length;
  if (doneCount === 0) return "not-started";
  if (doneCount < required.length) return "in-progress";
  return "ready";
}

export default function SetupPhase({ steps, onBegin }: SetupPhaseProps) {
  const status = deriveStatus(steps);
  const cfg    = STATUS_CONFIG[status];
  const allRequiredDone = steps.filter((s) => s.required).every((s) => s.done);
  const completedCount  = steps.filter((s) => s.done).length;

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        background:  "var(--lab-glass-heavy)",
        borderColor: "var(--lab-glass-border)",
        boxShadow:   "var(--lab-shadow-md)",
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 border-b flex items-center justify-between"
        style={{ borderColor: "var(--lab-glass-border)" }}
      >
        <div>
          <p
            className="text-[9px] font-semibold uppercase tracking-widest mb-0.5"
            style={{ color: "var(--lab-blue-600)" }}
          >
            Lab Setup
          </p>
          <p className="text-sm font-bold" style={{ color: "var(--lab-text-primary)" }}>
            Prepare Your Apparatus
          </p>
        </div>

        {/* Status badge */}
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border"
          style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{
              background: cfg.dot,
              boxShadow:  status === "in-progress" ? `0 0 0 3px ${cfg.dot}30` : undefined,
            }}
          />
          {cfg.label}
        </span>
      </div>

      {/* Steps */}
      <div className="p-4 space-y-2">
        {steps.map((step, i) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05, ease: "easeOut" }}
            className="flex items-start gap-3 rounded-xl px-3 py-2.5 border transition-all duration-200"
            style={{
              background:  step.done
                ? "rgba(5,150,105,0.05)"
                : "var(--lab-glass)",
              borderColor: step.done
                ? "rgba(5,150,105,0.25)"
                : "var(--lab-glass-border)",
            }}
          >
            {/* Checkbox */}
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200"
              style={{
                background: step.done ? "#10b981" : "transparent",
                border:     step.done ? "none" : "1.5px solid var(--lab-slate-300)",
              }}
            >
              <AnimatePresence>
                {step.done && (
                  <motion.svg
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: "backOut" }}
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 5l2.5 2.5L8 3"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.svg>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p
                  className="text-xs font-semibold"
                  style={{
                    color:          step.done ? "#065f46" : "var(--lab-text-primary)",
                    textDecoration: step.done ? "line-through" : "none",
                    opacity:        step.done ? 0.7 : 1,
                  }}
                >
                  {step.label}
                </p>
                {!step.required && (
                  <span
                    className="text-[8px] px-1 rounded font-semibold"
                    style={{ background: "var(--lab-glass-border)", color: "var(--lab-text-subtle)" }}
                  >
                    optional
                  </span>
                )}
              </div>
              <p className="text-[10.5px] mt-0.5 leading-snug" style={{ color: "var(--lab-text-muted)" }}>
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress + CTA */}
      <div
        className="px-5 py-4 border-t flex items-center justify-between gap-4"
        style={{ borderColor: "var(--lab-glass-border)" }}
      >
        <div className="flex-1">
          <div className="flex items-center justify-between text-[9px] font-medium mb-1"
               style={{ color: "var(--lab-text-subtle)" }}>
            <span>{completedCount} / {steps.length} steps complete</span>
            {allRequiredDone && (
              <span style={{ color: "#059669" }}>All required steps done ✓</span>
            )}
          </div>
          <div
            className="h-1 rounded-full overflow-hidden"
            style={{ background: "var(--lab-glass-border)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #10b981, #059669)" }}
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / steps.length) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>

        <button
          onClick={onBegin}
          disabled={!allRequiredDone}
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-200"
          style={{
            background: allRequiredDone
              ? "linear-gradient(135deg, #059669 0%, #10b981 100%)"
              : "var(--lab-glass-border)",
            color:      allRequiredDone ? "white" : "var(--lab-text-subtle)",
            boxShadow:  allRequiredDone ? "0 2px 12px rgba(16,185,129,0.35)" : "none",
            cursor:     allRequiredDone ? "pointer" : "not-allowed",
            opacity:    allRequiredDone ? 1 : 0.6,
          }}
        >
          Begin Experiment
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4"
                  strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
