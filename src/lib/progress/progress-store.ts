import { create } from "zustand";
import { saveSession, loadSession } from "@/lib/persistence";
import type {
  LaboratoryProgress,
  ExperimentProgress,
  CompetencyProgress,
  AssessmentHistoryEntry,
  ReportHistoryEntry,
} from "./types";
import type { GradingResult, GradingCategory } from "@/lib/assessment/types";

const STORAGE_KEY = "progress_v1";
const HISTORY_LIMIT = 50;  // keep last N assessment entries

// ─── Store shape ──────────────────────────────────────────────────────────────

interface ProgressStore extends LaboratoryProgress {
  recordAssessment:  (result: GradingResult) => void;
  recordReport:      (entry: ReportHistoryEntry) => void;
  getExperiment:     (experimentId: string) => ExperimentProgress | null;
  getCompetency:     (category: GradingCategory) => CompetencyProgress | null;
  /** Returns the 10 most recent assessments, newest first */
  recentAssessments: () => AssessmentHistoryEntry[];
  reset:             () => void;
  hydrate:           () => void;
}

// ─── Initial state ────────────────────────────────────────────────────────────

const INITIAL: LaboratoryProgress = {
  experiments:       {},
  competencies:      {},
  assessmentHistory: [],
  reportHistory:     [],
  updatedAt:         0,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useProgressStore = create<ProgressStore>()((set, get) => ({
  ...INITIAL,

  // ── Actions ───────────────────────────────────────────────────────────────

  recordAssessment(result: GradingResult) {
    set(state => {
      const now = Date.now();
      const eid = result.experimentId;

      // Update per-experiment progress
      const prev = state.experiments[eid];
      const updatedExperiment: ExperimentProgress = {
        experimentId:     eid,
        firstAttemptAt:   prev?.firstAttemptAt ?? now,
        lastAttemptAt:    now,
        attemptCount:     (prev?.attemptCount ?? 0) + 1,
        bestScore:        Math.max(prev?.bestScore ?? 0, result.totalWeightedScore),
        latestScore:      result.totalWeightedScore,
        passed:           prev?.passed || result.passed,
        reportsGenerated: prev?.reportsGenerated ?? 0,
      };

      // Update per-competency progress
      const updatedCompetencies = { ...state.competencies };
      for (const cat of result.categories) {
        const prevC = updatedCompetencies[cat.category];
        const history = [...(prevC?.history ?? []), cat.percentage].slice(-10);
        const attempts = (prevC?.attempts ?? 0) + 1;
        const avg      = history.reduce((s, v) => s + v, 0) / history.length;
        const trend    = history.length >= 2
          ? history[history.length - 1] - history[0]
          : 0;
        updatedCompetencies[cat.category] = {
          category:     cat.category,
          attempts,
          averageScore: Math.round(avg * 10) / 10,
          bestScore:    Math.max(prevC?.bestScore ?? 0, cat.percentage),
          trend:        Math.round(trend * 10) / 10,
          history,
        };
      }

      // Append to history (cap at HISTORY_LIMIT)
      const historyEntry: AssessmentHistoryEntry = {
        id:           `${now}_${Math.random().toString(36).slice(2, 7)}`,
        experimentId: eid,
        sessionId:    result.sessionId,
        gradedAt:     result.gradedAt,
        totalScore:   result.totalWeightedScore,
        letterGrade:  result.letterGrade,
        passed:       result.passed,
      };

      const assessmentHistory = [historyEntry, ...state.assessmentHistory].slice(0, HISTORY_LIMIT);

      const next: LaboratoryProgress = {
        ...state,
        experiments:       { ...state.experiments, [eid]: updatedExperiment },
        competencies:      updatedCompetencies,
        assessmentHistory,
        updatedAt:         now,
      };

      saveSession(STORAGE_KEY, next);
      return next;
    });
  },

  recordReport(entry: ReportHistoryEntry) {
    set(state => {
      const prev = state.experiments[entry.experimentId];
      const updatedExp: ExperimentProgress | undefined = prev
        ? { ...prev, reportsGenerated: prev.reportsGenerated + 1 }
        : undefined;

      const next: LaboratoryProgress = {
        ...state,
        experiments: updatedExp
          ? { ...state.experiments, [entry.experimentId]: updatedExp }
          : state.experiments,
        reportHistory: [entry, ...state.reportHistory].slice(0, HISTORY_LIMIT),
        updatedAt:     Date.now(),
      };

      saveSession(STORAGE_KEY, next);
      return next;
    });
  },

  getExperiment(experimentId: string): ExperimentProgress | null {
    return get().experiments[experimentId] ?? null;
  },

  getCompetency(category: GradingCategory): CompetencyProgress | null {
    return get().competencies[category] ?? null;
  },

  recentAssessments(): AssessmentHistoryEntry[] {
    return get().assessmentHistory.slice(0, 10);
  },

  reset() {
    saveSession(STORAGE_KEY, INITIAL);
    set({ ...INITIAL });
  },

  hydrate() {
    const saved = loadSession<LaboratoryProgress>(STORAGE_KEY);
    if (saved) set(saved);
  },
}));
