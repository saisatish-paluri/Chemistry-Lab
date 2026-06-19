// Types — import these in any file that needs the data model
export type {
  NotebookSectionKey,
  NotebookSection,
  LabNotebook,
  TrialNumber,
  TrialData,
  TrialSet,
  CellType,
  ColumnDef,
  ObservationRow,
  ObservationTable,
  ObservationTableTemplate,
  UnknownValueConfig,
  GeneratedUnknown,
  SessionUnknowns,
  WorkflowStage,
  LabSession,
} from "./types";

export {
  NOTEBOOK_SECTION_TITLES,
  NOTEBOOK_SECTION_ORDER,
  WORKFLOW_STAGES,
  WORKFLOW_STAGE_LABELS,
} from "./types";

// Unknown value generator
export { createUnknownGenerator, generateSessionId } from "./unknown-generator";

// Observation table engine
export {
  createTable,
  updateCell,
  addRow,
  removeRow,
  getColumnAverages,
  formatCell,
} from "./observation-table";

// Persistence layer
export { labDataPersistence } from "./idb-persistence";

// Zustand stores (use only when you need store-level access outside hooks)
export { useNotebookStore } from "./notebook-store";
export { useTrialStore }    from "./trial-store";

// React hooks — primary integration point for experiment components
export {
  useLabNotebook,
  useTrials,
  useObservationTable,
  useUnknownValues,
  useWorkflowStage,
} from "./hooks";

export type {
  UseLabNotebookResult,
  UseTrialsResult,
  UseObservationTableResult,
  UseUnknownValuesResult,
  UseWorkflowStageResult,
} from "./hooks";
