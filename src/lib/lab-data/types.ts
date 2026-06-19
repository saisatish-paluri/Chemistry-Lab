// ─── Notebook ─────────────────────────────────────────────────────────────────

export type NotebookSectionKey =
  | "aim"
  | "theory"
  | "apparatus"
  | "procedure"
  | "observations"
  | "rawData"
  | "calculations"
  | "results"
  | "errorAnalysis"
  | "conclusion";

export const NOTEBOOK_SECTION_TITLES: Record<NotebookSectionKey, string> = {
  aim:           "Aim",
  theory:        "Theory",
  apparatus:     "Apparatus",
  procedure:     "Procedure",
  observations:  "Observations",
  rawData:       "Raw Data",
  calculations:  "Calculations",
  results:       "Results",
  errorAnalysis: "Error Analysis",
  conclusion:    "Conclusion",
};

export const NOTEBOOK_SECTION_ORDER: NotebookSectionKey[] = [
  "aim",
  "theory",
  "apparatus",
  "procedure",
  "observations",
  "rawData",
  "calculations",
  "results",
  "errorAnalysis",
  "conclusion",
];

export interface NotebookSection {
  key:       NotebookSectionKey;
  title:     string;
  content:   string;
  updatedAt: number;
}

export interface LabNotebook {
  experimentId: string;
  sessionId:    string;
  sections:     Record<NotebookSectionKey, NotebookSection>;
  createdAt:    number;
  updatedAt:    number;
}

// ─── Multi-Trial ──────────────────────────────────────────────────────────────

export type TrialNumber = 1 | 2 | 3;

export interface TrialData {
  trialNumber: TrialNumber;
  values:      Record<string, number | string | null>;
  completedAt: number | null;
  notes:       string;
}

export interface TrialSet {
  experimentId: string;
  sessionId:    string;
  trials:       TrialData[];
  averages:     Record<string, number | null>;
  updatedAt:    number;
}

// ─── Observation Table ────────────────────────────────────────────────────────

export type CellType = "text" | "number" | "formula" | "select";

export interface ColumnDef {
  id:             string;
  header:         string;
  type:           CellType;
  unit?:          string;
  /** Arithmetic expression referencing other column IDs, e.g. "final - initial" */
  formula?:       string;
  options?:       string[];
  editable:       boolean;
  decimalPlaces?: number;
}

export interface ObservationRow {
  id:    string;
  cells: Record<string, string | number | null>;
}

export interface ObservationTable {
  id:           string;
  experimentId: string;
  sessionId:    string;
  title:        string;
  columns:      ColumnDef[];
  rows:         ObservationRow[];
  updatedAt:    number;
}

/** Template: column layout + title without runtime identity fields */
export type ObservationTableTemplate = Pick<ObservationTable, "title" | "columns">;

// ─── Unknown Values ───────────────────────────────────────────────────────────

export interface UnknownValueConfig {
  id:            string;
  label:         string;
  min:           number;
  max:           number;
  decimalPlaces: number;
  unit:          string;
}

export interface GeneratedUnknown {
  configId:    string;
  label:       string;
  value:       number;
  unit:        string;
  formatted:   string;
  sessionId:   string;
  generatedAt: number;
}

export interface SessionUnknowns {
  sessionId: string;
  unknowns:  GeneratedUnknown[];
  createdAt: number;
}

// ─── Student Workflow ─────────────────────────────────────────────────────────

export type WorkflowStage =
  | "setup"
  | "observation"
  | "dataCollection"
  | "calculation"
  | "interpretation";

export const WORKFLOW_STAGES: WorkflowStage[] = [
  "setup",
  "observation",
  "dataCollection",
  "calculation",
  "interpretation",
];

export const WORKFLOW_STAGE_LABELS: Record<WorkflowStage, string> = {
  setup:          "Setup",
  observation:    "Observation",
  dataCollection: "Data Collection",
  calculation:    "Calculation",
  interpretation: "Interpretation",
};

export interface LabSession {
  id:            string;
  experimentId:  string;
  workflowStage: WorkflowStage;
  createdAt:     number;
  updatedAt:     number;
}
