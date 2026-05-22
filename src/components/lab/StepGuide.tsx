"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { StepDef, ExperimentObjective } from "@/lib/engine/types";

interface Props {
  steps:      StepDef[];
  objectives: ExperimentObjective[];
}

export default function StepGuide({ steps, objectives }: Props) {
  const completedSteps = steps.filter((s) => s.completed).length;
  const totalSteps     = steps.length;
  const allDone        = objectives.every((o) => o.completed);
  const progress       = totalSteps > 0 ? completedSteps / totalSteps : 0;
  const isDone         = progress === 1;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* ── Progress bar ── */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--lab-text-muted)" }}
          >
            Progress
          </span>
          <span
            className="text-[10px] font-bold font-mono"
            style={{ color: isDone ? "#059669" : "var(--lab-text-muted)" }}
          >
            {completedSteps}/{totalSteps}
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--lab-slate-100)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{
              background: isDone
                ? "linear-gradient(90deg, #059669, #34d399)"
                : "linear-gradient(90deg, #2563eb, #38bdf8)",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* ── Completion banner ── */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold"
            style={{
              background:  "#f0fdf4",
              borderColor: "#86efac",
              color:       "#15803d",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="6" fill="#059669" />
              <path d="M4 7l2.2 2.2L10 4.5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            All objectives complete!
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Objectives ── */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-2"
           style={{ color: "var(--lab-text-muted)" }}>
          Objectives
        </p>
        <ul className="space-y-1.5">
          {objectives.map((obj) => (
            <li key={obj.id} className="flex items-center gap-2 text-xs">
              <AnimatedCheck done={obj.completed} />
              <span
                style={{
                  color:          obj.completed ? "var(--lab-text-muted)" : "var(--lab-text-secondary)",
                  textDecoration: obj.completed ? "line-through" : "none",
                  transition:     "color 0.3s",
                }}
              >
                {obj.description}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Steps ── */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-2.5"
           style={{ color: "var(--lab-text-muted)" }}>
          Steps
        </p>
        <ol className="space-y-2">
          {steps.map((step, i) => {
            const isNext = !step.completed && steps.slice(0, i).every((s) => s.completed);
            return (
              <motion.li
                key={step.id}
                layout
                className="flex gap-2.5 text-xs"
              >
                {/* Step badge */}
                <div className="flex-shrink-0 relative w-5 h-5 mt-0.5">
                  <AnimatePresence mode="wait">
                    {step.completed ? (
                      <motion.span
                        key="check"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 420, damping: 22 }}
                        className="absolute inset-0 rounded-full flex items-center justify-center text-[10px]"
                        style={{ background: "#059669", color: "#fff" }}
                        aria-label="Completed"
                      >
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
                          <path d="M2 4.5L3.8 6.5L7 3" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </motion.span>
                    ) : (
                      <motion.span
                        key="num"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="absolute inset-0 rounded-full flex items-center justify-center text-[10px] font-bold border"
                        style={{
                          background:  isNext ? "var(--lab-blue-600)" : "transparent",
                          borderColor: isNext ? "var(--lab-blue-600)" : "var(--lab-slate-300)",
                          color:       isNext ? "#fff" : "var(--lab-text-subtle)",
                        }}
                      >
                        {i + 1}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {/* Instruction text */}
                <div className="flex-1 min-w-0">
                  {isNext ? (
                    <div
                      className="px-2.5 py-1.5 rounded-lg border -mx-1"
                      style={{
                        background:  "rgba(37,99,235,0.05)",
                        borderColor: "rgba(37,99,235,0.18)",
                      }}
                    >
                      <span
                        className="leading-snug font-semibold"
                        style={{ color: "var(--lab-blue-700, #1d4ed8)" }}
                      >
                        {step.instruction}
                      </span>
                      <motion.span
                        animate={{ opacity: [1, 0.35, 1] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                        className="ml-1.5 text-[9px] font-bold uppercase tracking-wider"
                        style={{ color: "var(--lab-blue-600)" }}
                      >
                        next
                      </motion.span>
                    </div>
                  ) : (
                    <span
                      className="leading-snug"
                      style={{
                        color:          step.completed ? "var(--lab-text-muted)" : "var(--lab-text-subtle)",
                        textDecoration: step.completed ? "line-through" : "none",
                        transition:     "color 0.3s",
                      }}
                    >
                      {step.instruction}
                    </span>
                  )}
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function AnimatedCheck({ done }: { done: boolean }) {
  return (
    <div className="relative w-3.5 h-3.5 flex-shrink-0">
      <AnimatePresence mode="wait">
        {done ? (
          <motion.svg
            key="filled"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 450, damping: 22 }}
            width="14" height="14" viewBox="0 0 14 14" fill="none"
            style={{ position: "absolute", inset: 0 }}
          >
            <circle cx="7" cy="7" r="6" fill="#059669" />
            <path d="M4 7l2.2 2.2L10 4.5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        ) : (
          <motion.svg
            key="empty"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            width="14" height="14" viewBox="0 0 14 14" fill="none"
            style={{ position: "absolute", inset: 0 }}
          >
            <circle cx="7" cy="7" r="6" stroke="var(--lab-slate-300)" strokeWidth="1.4" />
          </motion.svg>
        )}
      </AnimatePresence>
    </div>
  );
}
