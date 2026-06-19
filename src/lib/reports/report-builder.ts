import { labDataPersistence }       from "@/lib/lab-data";
import type { LabNotebook, ObservationTable, TrialSet } from "@/lib/lab-data/types";
import type { LabReport, ReportBuildOptions, ReportDataTable, ReportDataTableRow } from "./types";

// ─── Public API ───────────────────────────────────────────────────────────────

export async function buildReport(options: ReportBuildOptions): Promise<LabReport> {
  const { experimentId } = options;

  // Load all sources in parallel — avoids sequential waterfall
  const [notebook, trialSet, tables] = await Promise.all([
    labDataPersistence.loadNotebook(experimentId),
    labDataPersistence.loadTrialSet(experimentId),
    labDataPersistence.loadTablesForExperiment(experimentId),
  ]);

  return assembleReport(options, notebook, trialSet, tables);
}

// ─── Assembly ─────────────────────────────────────────────────────────────────

function assembleReport(
  opts:      ReportBuildOptions,
  notebook:  LabNotebook | null,
  trialSet:  TrialSet | null,
  tables:    ObservationTable[],
): LabReport {
  const s = notebook?.sections;

  const aim          = s?.aim?.content          ?? "";
  const theory       = s?.theory?.content       ?? "";
  const procedure    = s?.procedure?.content    ?? "";
  const observations = s?.observations?.content ?? "";
  const calculations = s?.calculations?.content ?? "";
  const results      = s?.results?.content      ?? "";
  const errorText    = s?.errorAnalysis?.content ?? "";
  const conclusion   = s?.conclusion?.content   ?? "";

  const apparatus      = parseList(s?.apparatus?.content ?? "");
  const sourcesOfError = parseList(errorText);
  const dataTables     = buildDataTables(tables, trialSet);

  const date = new Date().toLocaleDateString("en-GB", {
    year: "numeric", month: "long", day: "numeric",
  });

  return {
    title:        opts.experimentTitle ?? firstLine(aim) ?? "Laboratory Report",
    studentInfo:  {
      name:       opts.studentInfo?.name,
      studentId:  opts.studentInfo?.studentId,
      course:     opts.studentInfo?.course,
      instructor: opts.studentInfo?.instructor,
      difficulty: opts.studentInfo?.difficulty,
      date:       opts.studentInfo?.date ?? date,
    },
    experimentId: opts.experimentId,
    sessionId:    opts.sessionId,
    generatedAt:  Date.now(),
    aim,
    theory,
    apparatus,
    procedure,
    observations,
    dataTables,
    calculations,
    results,
    discussion:      results,     // results section doubles as discussion
    sourcesOfError,
    conclusion,
    references:      opts.references ?? [],
    gradingResult:   opts.gradingResult,
  };
}

// ─── Data table builders ──────────────────────────────────────────────────────

function buildDataTables(
  tables:   ObservationTable[],
  trialSet: TrialSet | null,
): ReportDataTable[] {
  const out: ReportDataTable[] = [];

  for (const t of tables) {
    if (t.rows.length === 0) continue;
    const headers = t.columns.map(c => c.unit ? `${c.header} (${c.unit})` : c.header);
    const rows: ReportDataTableRow[] = t.rows.map(row => ({
      cells: t.columns.map(col => row.cells[col.id] ?? null),
    }));
    out.push({ title: t.title, headers, rows });
  }

  if (trialSet) {
    const completed = trialSet.trials.filter(t => t.completedAt !== null);
    const keys      = completed.length > 0 ? Object.keys(completed[0].values) : [];
    if (keys.length > 0) {
      const headers = ["Trial", ...keys];
      const rows: ReportDataTableRow[] = completed.map(t => ({
        cells: [`Trial ${t.trialNumber}`, ...keys.map(k => t.values[k] ?? null)],
      }));
      const footer = ["Average", ...keys.map(k => trialSet.averages[k] ?? "—")];
      out.push({ title: "Multi-Trial Data", headers, rows, footer });
    }
  }

  return out;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function parseList(text: string): string[] {
  if (!text.trim()) return [];
  return text
    .split(/\n|[•\*;]/)
    .map(line => line.replace(/^\s*(\d+[\.\)]|-|\*|•)\s*/, "").trim())
    .filter(line => line.length > 2);
}

function firstLine(text: string): string | null {
  const line = text.split("\n")[0]?.trim();
  return line && line.length > 3 ? line : null;
}
