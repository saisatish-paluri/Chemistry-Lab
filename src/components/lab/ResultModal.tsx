"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ExperimentResult, ObservationEvent } from "@/lib/engine/types";
import { MCQ_DATA, type ExperimentKey } from "@/lib/mcq-data";
import Link from "next/link";

const CIRCUMFERENCE = 2 * Math.PI * 34; // r=34

interface Props {
  result:          ExperimentResult | null;
  onReset:         () => void;
  nextHref?:       string;
  nextLabel?:      string;
  observations?:   ObservationEvent[];
  experimentKey?:  ExperimentKey;
}

// ── Score ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score, success }: { score: number; success: boolean }) {
  const offset = CIRCUMFERENCE * (1 - score / 100);
  const color  = success ? "#059669" : "#dc2626";
  return (
    <div className="relative w-24 h-24">
      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
        <circle cx="40" cy="40" r="34" fill="none" stroke="var(--lab-slate-100)" strokeWidth="8" />
        <motion.circle
          cx="40" cy="40" r="34" fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-2xl font-black"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-xs" style={{ color: "var(--lab-text-subtle)" }}>/ 100</span>
      </div>
    </div>
  );
}

function GradeLabel({ score }: { score: number }) {
  if (score >= 95) return <span style={{ color: "#059669" }}>Outstanding</span>;
  if (score >= 85) return <span style={{ color: "#0891b2" }}>Excellent</span>;
  if (score >= 70) return <span style={{ color: "#2563eb" }}>Good</span>;
  if (score >= 50) return <span style={{ color: "#f59e0b" }}>Adequate</span>;
  return <span style={{ color: "#dc2626" }}>Needs Practice</span>;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
}

const SEV_STYLE: Record<ObservationEvent["severity"], { border: string; bg: string; dot: string }> = {
  info:    { border: "#bfdbfe", bg: "#eff6ff", dot: "#3b82f6" },
  warning: { border: "#fde68a", bg: "#fffbeb", dot: "#f59e0b" },
  success: { border: "#bbf7d0", bg: "#f0fdf4", dot: "#059669" },
  error:   { border: "#fecaca", bg: "#fef2f2", dot: "#dc2626" },
};

// ── Exit navigation row — always available after completion ───────────────────

function ExitNavRow({ onReset, nextHref, nextLabel }: { onReset: () => void; nextHref?: string; nextLabel?: string }) {
  return (
    <div className="flex flex-col gap-2">
      {/* Primary actions row */}
      <div className="flex gap-2.5">
        <button
          onClick={onReset}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150 hover:bg-blue-50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          style={{ borderColor: "var(--lab-glass-border)", color: "var(--lab-text-secondary)" }}
        >
          Try Again
        </button>
        {nextHref ? (
          <Link
            href={nextHref}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white text-center transition-all duration-150 hover:opacity-90 active:scale-95 flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            style={{ background: "linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)" }}
          >
            {nextLabel ?? "Next Experiment"}
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
              <path d="M2 5.5h7M6.5 3l2.5 2.5L6.5 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        ) : (
          <Link
            href="/experiments"
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white text-center transition-all duration-150 hover:opacity-90 active:scale-95 flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            style={{ background: "linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)" }}
          >
            All Experiments
          </Link>
        )}
      </div>

      {/* Secondary exit links — always present so users can never be trapped */}
      <div
        className="flex items-center justify-center gap-0"
        style={{ borderTop: "1px solid var(--lab-glass-border)", paddingTop: 6 }}
      >
        <Link
          href="/experiments"
          className="flex-1 py-2 rounded-lg text-xs font-semibold text-center transition-all duration-150 hover:bg-slate-50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          style={{ color: "var(--lab-text-muted)" }}
        >
          All Labs
        </Link>
        <div className="w-px h-4" style={{ background: "var(--lab-glass-border)" }} />
        <Link
          href="/dashboard"
          className="flex-1 py-2 rounded-lg text-xs font-semibold text-center transition-all duration-150 hover:bg-slate-50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          style={{ color: "var(--lab-text-muted)" }}
        >
          Dashboard
        </Link>
        <div className="w-px h-4" style={{ background: "var(--lab-glass-border)" }} />
        <Link
          href="/"
          className="flex-1 py-2 rounded-lg text-xs font-semibold text-center transition-all duration-150 hover:bg-slate-50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          style={{ color: "var(--lab-text-muted)" }}
        >
          Home
        </Link>
      </div>
    </div>
  );
}

// ── MCQ Quiz ─────────────────────────────────────────────────────────────────

interface QuizState {
  current:   number;
  answers:   (number | null)[];
  revealed:  boolean[];
  finished:  boolean;
  quizScore: number;
}

function initQuiz(len: number): QuizState {
  return {
    current:   0,
    answers:   Array(len).fill(null),
    revealed:  Array(len).fill(false),
    finished:  false,
    quizScore: 0,
  };
}

function MCQQuizPanel({
  experimentKey,
  onReset,
  nextHref,
  nextLabel,
}: {
  experimentKey: ExperimentKey;
  onReset: () => void;
  nextHref?: string;
  nextLabel?: string;
}) {
  const questions = MCQ_DATA[experimentKey] ?? [];
  const [quiz, setQuiz] = useState<QuizState>(() => initQuiz(questions.length));

  if (questions.length === 0) {
    return (
      <div className="p-6">
        <p className="text-sm text-center mb-6" style={{ color: "var(--lab-text-muted)" }}>
          No quiz available for this experiment yet.
        </p>
        <ExitNavRow onReset={onReset} nextHref={nextHref} nextLabel={nextLabel} />
      </div>
    );
  }

  const q = questions[quiz.current];

  const handleAnswer = (idx: number) => {
    if (quiz.revealed[quiz.current]) return;
    const newAnswers  = [...quiz.answers];
    const newRevealed = [...quiz.revealed];
    newAnswers[quiz.current]  = idx;
    newRevealed[quiz.current] = true;
    setQuiz((prev) => ({ ...prev, answers: newAnswers, revealed: newRevealed }));
  };

  const handleNext = () => {
    if (quiz.current < questions.length - 1) {
      setQuiz((prev) => ({ ...prev, current: prev.current + 1 }));
    } else {
      const score = quiz.answers.reduce<number>(
        (acc, ans, i) => acc + (ans === questions[i].correctIndex ? 1 : 0),
        0,
      );
      setQuiz((prev) => ({ ...prev, finished: true, quizScore: score }));
    }
  };

  const handleRetry = () => {
    setQuiz(initQuiz(questions.length));
  };

  if (quiz.finished) {
    const pct = Math.round((quiz.quizScore / questions.length) * 100);
    const color = pct >= 80 ? "#059669" : pct >= 60 ? "#2563eb" : "#f59e0b";
    return (
      <div className="p-6">
        <div className="flex flex-col items-center mb-5">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-3"
            style={{ background: `${color}12`, border: `3px solid ${color}` }}
          >
            <span className="text-2xl font-black" style={{ color }}>{quiz.quizScore}/{questions.length}</span>
          </div>
          <p className="text-base font-bold" style={{ color: "var(--lab-text-primary)" }}>
            {pct >= 80 ? "Excellent understanding!" : pct >= 60 ? "Good effort — review the answers below" : "Review the concepts and try again"}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--lab-text-muted)" }}>
            {pct}% — {quiz.quizScore} correct out of {questions.length}
          </p>
        </div>

        <div className="space-y-3 mb-5">
          {questions.map((qn, i) => {
            const ans = quiz.answers[i];
            const correct = ans === qn.correctIndex;
            return (
              <div
                key={qn.id}
                className="rounded-xl p-3 border text-xs"
                style={{
                  background:  correct ? "#f0fdf4" : "#fef2f2",
                  borderColor: correct ? "#bbf7d0" : "#fecaca",
                }}
              >
                <div className="flex items-start gap-2 mb-1.5">
                  <span className="flex-shrink-0 font-black" style={{ color: correct ? "#059669" : "#dc2626" }}>
                    {correct ? "✓" : "✗"}
                  </span>
                  <p className="font-semibold" style={{ color: "var(--lab-text-primary)" }}>{qn.question}</p>
                </div>
                <p className="ml-4 mb-1.5" style={{ color: correct ? "#059669" : "#dc2626" }}>
                  Your answer: {qn.options[ans ?? 0]}
                </p>
                {!correct && (
                  <p className="ml-4 mb-1.5 font-semibold" style={{ color: "#059669" }}>
                    Correct: {qn.options[qn.correctIndex]}
                  </p>
                )}
                <p className="ml-4 leading-relaxed" style={{ color: "var(--lab-text-muted)" }}>
                  {qn.explanation}
                </p>
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <button
            onClick={handleRetry}
            className="w-full py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-blue-50"
            style={{ borderColor: "var(--lab-glass-border)", color: "var(--lab-text-secondary)" }}
          >
            Retry Quiz
          </button>
          <ExitNavRow onReset={onReset} nextHref={nextHref} nextLabel={nextLabel} />
        </div>
      </div>
    );
  }

  const answered  = quiz.revealed[quiz.current];
  const userAns   = quiz.answers[quiz.current];
  const isLast    = quiz.current === questions.length - 1;

  return (
    <div className="p-5">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--lab-blue-600)" }}>
          Post-Lab Quiz
        </p>
        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "var(--lab-slate-100)" }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width:      `${((quiz.current + (answered ? 1 : 0)) / questions.length) * 100}%`,
              background: "var(--lab-blue-600)",
            }}
          />
        </div>
        <span className="text-[10px] font-mono" style={{ color: "var(--lab-text-subtle)" }}>
          {quiz.current + 1}/{questions.length}
        </span>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={quiz.current}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.22 }}
        >
          <p className="text-sm font-semibold mb-4 leading-snug" style={{ color: "var(--lab-text-primary)" }}>
            {q.question}
          </p>

          {/* Options */}
          <div className="space-y-2 mb-4">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correctIndex;
              const isSelected = userAns === i;
              let bg = "var(--lab-glass)";
              let border = "var(--lab-glass-border)";
              let color = "var(--lab-text-secondary)";

              if (answered) {
                if (isCorrect) { bg = "#f0fdf4"; border = "#86efac"; color = "#14532d"; }
                else if (isSelected && !isCorrect) { bg = "#fef2f2"; border = "#fca5a5"; color = "#7f1d1d"; }
              } else if (isSelected) {
                bg = "#eff6ff"; border = "var(--lab-blue-400)"; color = "var(--lab-blue-600)";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={answered}
                  className="w-full text-left px-3 py-2.5 rounded-xl border text-xs font-medium transition-all duration-150 disabled:cursor-default"
                  style={{ background: bg, borderColor: border, color }}
                >
                  <span className="font-bold mr-2" style={{ opacity: 0.6 }}>
                    {String.fromCharCode(65 + i)}.
                  </span>
                  {opt}
                  {answered && isCorrect && (
                    <span className="ml-2 font-bold" style={{ color: "#059669" }}>✓</span>
                  )}
                  {answered && isSelected && !isCorrect && (
                    <span className="ml-2 font-bold" style={{ color: "#dc2626" }}>✗</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {answered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="rounded-xl px-3 py-2.5 mb-4 text-xs leading-relaxed overflow-hidden"
                style={{
                  background: userAns === q.correctIndex ? "#f0fdf4" : "#fef9f0",
                  borderLeft: `3px solid ${userAns === q.correctIndex ? "#059669" : "#f59e0b"}`,
                }}
              >
                <p className="font-semibold mb-1" style={{ color: userAns === q.correctIndex ? "#059669" : "#d97706" }}>
                  {userAns === q.correctIndex ? "Correct!" : "Not quite — here's why:"}
                </p>
                <p style={{ color: "var(--lab-text-muted)" }}>{q.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={handleNext}
        disabled={!answered}
        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-150 disabled:opacity-40"
        style={{ background: "linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)" }}
      >
        {isLast ? "View Results" : "Next Question"}
      </button>
    </div>
  );
}

// ── Main Modal ───────────────────────────────────────────────────────────────

export default function ResultModal({
  result, onReset, nextHref, nextLabel, observations = [], experimentKey,
}: Props) {
  type Tab = "result" | "log" | "quiz";
  const hasQuiz = !!experimentKey && !!MCQ_DATA[experimentKey]?.length;
  const [tab, setTab] = useState<Tab>("result");

  const TABS: Array<{ id: Tab; label: string }> = [
    { id: "result", label: "Result" },
    { id: "log",    label: `Log (${observations.length})` },
    ...(hasQuiz ? [{ id: "quiz" as Tab, label: "Quiz" }] : []),
  ];

  return (
    <AnimatePresence>
      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
          role="dialog"
          aria-modal="true"
          aria-label="Experiment complete"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 24 }}
            animate={{ scale: 1,    opacity: 1, y: 0  }}
            exit={{   scale: 0.92,  opacity: 0, y: 24 }}
            transition={{ type: "spring", duration: 0.42, bounce: 0.18 }}
            className="glass-heavy rounded-2xl max-w-md w-full max-h-[92vh] flex flex-col"
            style={{ boxShadow: "0 24px 80px rgba(15,23,42,0.18), 0 8px 24px rgba(15,23,42,0.08), 0 0 0 1px rgba(255,255,255,0.7) inset" }}
          >
            {/* Modal header — title + close/exit anchor */}
            <div
              className="flex items-center justify-between px-5 pt-4 pb-0 flex-shrink-0"
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--lab-blue-600)" }}>
                {result.success ? "Experiment Complete" : "Results"}
              </p>
              <Link
                href="/experiments"
                className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all hover:bg-blue-50"
                style={{ borderColor: "var(--lab-glass-border)", color: "var(--lab-text-muted)" }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M6 2L3 5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                All Experiments
              </Link>
            </div>

            {/* Tab bar */}
            <div className="flex border-b flex-shrink-0 mt-3" style={{ borderColor: "var(--lab-glass-border)" }}>
              {TABS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className="flex-1 py-2.5 text-xs font-semibold capitalize transition-colors duration-150 relative"
                  style={{
                    color: tab === id ? "var(--lab-blue-600)" : "var(--lab-text-muted)",
                  }}
                >
                  {label}
                  {tab === id && (
                    <motion.div
                      layoutId="result-tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ background: "var(--lab-blue-600)" }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              {/* ── Result tab ── */}
              {tab === "result" && (
                <div className="p-6">
                  <div className="flex flex-col items-center mb-5">
                    <ScoreRing score={result.score} success={result.success} />
                    <h2 className="mt-3 text-xl font-bold" style={{ color: "var(--lab-text-primary)" }}>
                      {result.success ? "Experiment Successful!" : "Experiment Complete"}
                    </h2>
                    <p className="text-sm font-semibold mt-0.5">
                      <GradeLabel score={result.score} />
                    </p>
                  </div>

                  {result.precision !== undefined && (
                    <div
                      className="flex items-center justify-between rounded-xl px-4 py-2.5 mb-4 text-xs"
                      style={{ background: "var(--lab-surface)", border: "1px solid var(--lab-glass-border)" }}
                    >
                      <span style={{ color: "var(--lab-text-muted)" }}>Deviation from equivalence</span>
                      <span
                        className="font-bold font-mono"
                        style={{ color: result.precision <= 0.5 ? "#059669" : result.precision <= 1.5 ? "#2563eb" : "#f59e0b" }}
                      >
                        {result.precision.toFixed(2)} mL
                      </span>
                    </div>
                  )}

                  <p className="text-sm text-center mb-4 leading-relaxed" style={{ color: "var(--lab-text-muted)" }}>
                    {result.summary}
                  </p>

                  <div
                    className="rounded-xl p-4 mb-5 text-xs leading-relaxed"
                    style={{ background: "var(--lab-surface)", color: "var(--lab-text-tertiary)" }}
                  >
                    <p className="font-semibold mb-1.5" style={{ color: "var(--lab-blue-600)" }}>
                      Scientific explanation
                    </p>
                    <p style={{ whiteSpace: "pre-wrap" }}>{result.explanation}</p>
                  </div>

                  {hasQuiz && (
                    <button
                      onClick={() => setTab("quiz")}
                      className="w-full mb-3 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-95"
                      style={{ background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)" }}
                    >
                      Take Post-Lab Quiz
                    </button>
                  )}

                  <ExitNavRow onReset={onReset} nextHref={nextHref} nextLabel={nextLabel} />
                </div>
              )}

              {/* ── Log tab ── */}
              {tab === "log" && (
                <div className="p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-4"
                     style={{ color: "var(--lab-blue-600)" }}>
                    Observation Log
                  </p>
                  {observations.length === 0 ? (
                    <p className="text-xs text-center py-8" style={{ color: "var(--lab-text-subtle)" }}>
                      No observations recorded.
                    </p>
                  ) : (
                    <div className="space-y-2 mb-5">
                      {[...observations].reverse().map((obs, i) => {
                        const s = SEV_STYLE[obs.severity];
                        return (
                          <motion.div
                            key={obs.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.18, delay: i * 0.02 }}
                            className="flex gap-2.5 rounded-lg px-3 py-2.5 border text-xs"
                            style={{ background: s.bg, borderColor: s.border }}
                          >
                            <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
                            <div className="flex-1 min-w-0">
                              <p className="leading-snug" style={{ color: "var(--lab-text-secondary)" }}>{obs.message}</p>
                              <p className="text-[9px] mt-0.5 font-mono" style={{ color: "var(--lab-text-subtle)" }}>
                                {formatTime(obs.timestamp)}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {observations.length > 0 && (
                    <div className="mb-5 rounded-xl p-4 border text-xs"
                         style={{ background: "var(--lab-surface)", borderColor: "var(--lab-glass-border)" }}>
                      <p className="font-semibold mb-2" style={{ color: "var(--lab-blue-600)" }}>Key Outcomes</p>
                      <ul className="space-y-1" style={{ color: "var(--lab-text-muted)" }}>
                        <li>· {observations.length} observation{observations.length !== 1 ? "s" : ""} recorded</li>
                        <li>· Success events: <strong style={{ color: "#059669" }}>{observations.filter((o) => o.severity === "success").length}</strong></li>
                        <li>· Warnings: <strong style={{ color: "#f59e0b" }}>{observations.filter((o) => o.severity === "warning").length}</strong></li>
                        <li>· Final score: <strong style={{ color: "var(--lab-blue-600)" }}>{result.score} / 100</strong></li>
                      </ul>
                    </div>
                  )}

                  <ExitNavRow onReset={onReset} nextHref={nextHref} nextLabel={nextLabel} />
                </div>
              )}

              {/* ── Quiz tab ── */}
              {tab === "quiz" && hasQuiz && (
                <MCQQuizPanel
                  experimentKey={experimentKey!}
                  onReset={onReset}
                  nextHref={nextHref}
                  nextLabel={nextLabel}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
