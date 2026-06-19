import type { GradingCategory } from "@/lib/assessment/types";

// ─── Per-experiment progress ──────────────────────────────────────────────────

export interface ExperimentProgress {
  experimentId:   string;
  firstAttemptAt: number;
  lastAttemptAt:  number;
  attemptCount:   number;
  bestScore:      number;
  latestScore:    number;
  passed:         boolean;
  reportsGenerated: number;
}

// ─── Per-competency progress ──────────────────────────────────────────────────

export interface CompetencyProgress {
  category:     GradingCategory;
  attempts:     number;
  averageScore: number;
  bestScore:    number;
  /** Most recent score minus the first recorded score (positive = improvement) */
  trend:        number;
  history:      number[];   // rolling last-10 scores
}

// ─── History entries ──────────────────────────────────────────────────────────

export interface AssessmentHistoryEntry {
  id:           string;
  experimentId: string;
  sessionId:    string;
  gradedAt:     number;
  totalScore:   number;
  letterGrade:  string;
  passed:       boolean;
}

export interface ReportHistoryEntry {
  id:           string;
  experimentId: string;
  sessionId:    string;
  generatedAt:  number;
  format:       "pdf" | "docx";
  filename:     string;
}

// ─── Aggregate progress record ────────────────────────────────────────────────

export interface LaboratoryProgress {
  studentId?:        string;
  experiments:       Record<string, ExperimentProgress>;
  competencies:      Partial<Record<GradingCategory, CompetencyProgress>>;
  assessmentHistory: AssessmentHistoryEntry[];
  reportHistory:     ReportHistoryEntry[];
  updatedAt:         number;
}
