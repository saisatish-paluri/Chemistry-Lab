import type { GradingResult } from "@/lib/assessment/types";

// ─── Student / report header ──────────────────────────────────────────────────

export interface StudentInfo {
  name?:       string;
  studentId?:  string;
  course?:     string;
  instructor?: string;
  date:        string;
  difficulty?: string;
}

// ─── Data tables ──────────────────────────────────────────────────────────────

export interface ReportDataTableRow {
  cells: (string | number | null)[];
}

export interface ReportDataTable {
  title:   string;
  headers: string[];
  rows:    ReportDataTableRow[];
  /** Optional summary row (averages, totals, etc.) */
  footer?: (string | number | null)[];
}

// ─── Lab report ───────────────────────────────────────────────────────────────

export interface LabReport {
  // Header
  title:        string;
  studentInfo:  StudentInfo;
  experimentId: string;
  sessionId:    string;
  generatedAt:  number;

  // Sections (IMRaD-style + full A-level format)
  aim:            string;
  theory:         string;
  apparatus:      string[];
  procedure:      string;
  observations:   string;
  dataTables:     ReportDataTable[];
  calculations:   string;
  results:        string;
  discussion:     string;
  sourcesOfError: string[];
  conclusion:     string;
  references:     string[];

  // Optional grading attachment
  gradingResult?: GradingResult;
}

// ─── Build options ────────────────────────────────────────────────────────────

export interface ReportBuildOptions {
  experimentId:     string;
  sessionId:        string;
  /** Overrides the notebook aim as the document title */
  experimentTitle?: string;
  studentInfo?:     Partial<StudentInfo>;
  references?:      string[];
  gradingResult?:   GradingResult;
}

// ─── Export options ───────────────────────────────────────────────────────────

export interface PDFExportOptions {
  /** Defaults to "a4" */
  pageSize?:     "a4" | "letter";
  orientation?:  "portrait" | "landscape";
  includeGrade?: boolean;
}

export interface DOCXExportOptions {
  includeGrade?: boolean;
  creator?:      string;
}
