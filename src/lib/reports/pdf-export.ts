import type { LabReport, PDFExportOptions } from "./types";
import { GRADING_CATEGORY_LABELS }          from "@/lib/assessment/types";

// ─── Layout constants ─────────────────────────────────────────────────────────

const MARGIN = 20;
const FS     = { h1: 15, h2: 12, body: 10, small: 8 } as const;
const BLUE   = [30, 80, 140] as [number, number, number];

// ─── Public API ───────────────────────────────────────────────────────────────

export async function exportToPDF(
  report:  LabReport,
  options: PDFExportOptions = {},
): Promise<Blob> {
  // Heavy libs loaded only when export is triggered — keeps initial bundle lean
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const pageSize    = options.pageSize    ?? "a4";
  const orientation = options.orientation ?? "portrait";
  const doc         = new jsPDF({ unit: "mm", format: pageSize, orientation });
  const pageW       = doc.internal.pageSize.getWidth();
  const pageH       = doc.internal.pageSize.getHeight();
  const contentW    = pageW - MARGIN * 2;

  let y = MARGIN;

  // ── Cursor helpers ────────────────────────────────────────────────────────

  const newPage = () => { doc.addPage(); y = MARGIN; };

  const guard = (needed: number) => { if (y + needed > pageH - MARGIN) newPage(); };

  const h1 = (text: string) => {
    guard(14);
    doc.setFont("helvetica", "bold").setFontSize(FS.h1);
    doc.text(text, MARGIN, y);
    y += 7;
    doc.setDrawColor(80, 80, 80).line(MARGIN, y, pageW - MARGIN, y);
    y += 5;
  };

  const h2 = (text: string) => {
    guard(10);
    doc.setFont("helvetica", "bold").setFontSize(FS.h2);
    doc.text(text, MARGIN, y);
    y += 7;
  };

  const body = (text: string) => {
    if (!text.trim()) { body("—"); return; }
    doc.setFont("helvetica", "normal").setFontSize(FS.body);
    const lines = doc.splitTextToSize(text, contentW) as string[];
    for (const ln of lines) {
      guard(6);
      doc.text(ln, MARGIN, y);
      y += 5.5;
    }
    y += 2;
  };

  const bullets = (items: string[]) => {
    if (items.length === 0) { body("—"); return; }
    doc.setFont("helvetica", "normal").setFontSize(FS.body);
    for (const item of items) {
      const lines = doc.splitTextToSize(`• ${item}`, contentW - 4) as string[];
      for (let i = 0; i < lines.length; i++) {
        guard(6);
        doc.text(lines[i], MARGIN + (i > 0 ? 4 : 0), y);
        y += 5.5;
      }
    }
    y += 2;
  };

  const drawTable = (
    headers: string[],
    rows:    (string | number | null)[][],
    title?:  string,
  ) => {
    if (title) h2(title);
    let tableEndY = y;
    autoTable(doc, {
      head:       [headers],
      body:       rows.map(r => r.map(c => (c == null ? "—" : String(c)))),
      startY:     y,
      margin:     { left: MARGIN, right: MARGIN },
      styles:     { fontSize: 9, cellPadding: 2.5, lineColor: [200, 200, 200], lineWidth: 0.2 },
      headStyles: { fillColor: BLUE, textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      didDrawPage: ({ cursor }) => { if (cursor) tableEndY = cursor.y; },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable?.finalY ?? tableEndY;
    y += 8;
  };

  // ── Title page ────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold").setFontSize(20);
  const titleLines = doc.splitTextToSize(report.title, contentW) as string[];
  let ty = pageH * 0.28;
  for (const ln of titleLines) { doc.text(ln, pageW / 2, ty, { align: "center" }); ty += 10; }

  doc.setDrawColor(...BLUE).setLineWidth(0.5).line(MARGIN, ty + 4, pageW - MARGIN, ty + 4);
  ty += 12;

  doc.setFont("helvetica", "normal").setFontSize(11);
  const info: string[] = [];
  if (report.studentInfo.name)       info.push(`Student: ${report.studentInfo.name}`);
  if (report.studentInfo.studentId)  info.push(`ID: ${report.studentInfo.studentId}`);
  if (report.studentInfo.course)     info.push(`Course: ${report.studentInfo.course}`);
  if (report.studentInfo.instructor) info.push(`Instructor: ${report.studentInfo.instructor}`);
  info.push(`Date: ${report.studentInfo.date}`);
  if (report.studentInfo.difficulty) info.push(`Level: ${report.studentInfo.difficulty}`);
  for (const ln of info) { doc.text(ln, pageW / 2, ty, { align: "center" }); ty += 8; }

  newPage();

  // ── Aim ───────────────────────────────────────────────────────────────────
  h1("1. Aim");
  body(report.aim || "—");
  y += 2;

  // ── Theory ────────────────────────────────────────────────────────────────
  h1("2. Theory");
  body(report.theory || "—");
  y += 2;

  // ── Apparatus ─────────────────────────────────────────────────────────────
  h1("3. Apparatus");
  bullets(report.apparatus);
  y += 2;

  // ── Procedure ─────────────────────────────────────────────────────────────
  h1("4. Procedure");
  body(report.procedure || "—");
  y += 2;

  // ── Observations ─────────────────────────────────────────────────────────
  h1("5. Observations");
  body(report.observations || "—");
  y += 2;

  // ── Data tables ───────────────────────────────────────────────────────────
  if (report.dataTables.length > 0) {
    h1("6. Data Tables");
    for (const t of report.dataTables) {
      const bodyRows = t.rows.map(r => r.cells);
      if (t.footer) bodyRows.push(t.footer);
      drawTable(t.headers, bodyRows, t.title);
    }
  } else {
    h1("6. Data Tables");
    body("No data tables recorded.");
    y += 2;
  }

  // ── Calculations ─────────────────────────────────────────────────────────
  h1("7. Calculations");
  body(report.calculations || "—");
  y += 2;

  // ── Results ───────────────────────────────────────────────────────────────
  h1("8. Results");
  body(report.results || "—");
  y += 2;

  // ── Discussion ────────────────────────────────────────────────────────────
  if (report.discussion && report.discussion !== report.results) {
    h1("9. Discussion");
    body(report.discussion);
    y += 2;
  }

  // ── Sources of error ──────────────────────────────────────────────────────
  h1("10. Sources of Error");
  bullets(report.sourcesOfError.length > 0 ? report.sourcesOfError : ["—"]);
  y += 2;

  // ── Conclusion ────────────────────────────────────────────────────────────
  h1("11. Conclusion");
  body(report.conclusion || "—");
  y += 2;

  // ── References ────────────────────────────────────────────────────────────
  if (report.references.length > 0) {
    h1("12. References");
    bullets(report.references);
  }

  // ── Assessment summary ────────────────────────────────────────────────────
  if (options.includeGrade !== false && report.gradingResult) {
    newPage();
    const gr = report.gradingResult;
    h1("Assessment Summary");

    doc.setFont("helvetica", "bold").setFontSize(14);
    doc.text(
      `Final Score: ${gr.totalWeightedScore}%   Grade: ${gr.letterGrade}   ${gr.passed ? "PASS" : "FAIL"}`,
      MARGIN, y,
    );
    y += 8;
    doc.setFont("helvetica", "normal").setFontSize(FS.body);
    body(gr.overallFeedback);

    drawTable(
      ["Category", "Score", "%", "Weighted"],
      gr.categories.map(c => [
        GRADING_CATEGORY_LABELS[c.category],
        `${c.rawScore.toFixed(0)} / ${c.maxScore}`,
        `${c.percentage.toFixed(1)}%`,
        `${c.weightedScore.toFixed(1)}`,
      ]),
    );

    for (const cat of gr.categories) {
      if (cat.feedback.length === 0) continue;
      h2(GRADING_CATEGORY_LABELS[cat.category]);
      bullets(cat.feedback.slice(0, 3));
    }
  }

  // ── Page number footer ────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalPages = (doc.internal as any).getNumberOfPages?.() ?? 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(FS.small).setFont("helvetica", "normal").setTextColor(130);
    doc.text(
      `${report.title}  —  Page ${i} of ${totalPages}`,
      pageW / 2, pageH - 7,
      { align: "center" },
    );
    doc.setTextColor(0);
  }

  return doc.output("blob");
}
