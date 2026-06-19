// Types
export type {
  StudentInfo,
  ReportDataTableRow,
  ReportDataTable,
  LabReport,
  ReportBuildOptions,
  PDFExportOptions,
  DOCXExportOptions,
} from "./types";

// Report assembly
export { buildReport } from "./report-builder";

// Export functions — both are async and use dynamic imports (heavy libs not bundled upfront)
export { exportToPDF }  from "./pdf-export";
export { exportToDOCX } from "./docx-export";
