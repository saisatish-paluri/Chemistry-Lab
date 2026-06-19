import type { LabReport, DOCXExportOptions } from "./types";
import { GRADING_CATEGORY_LABELS }           from "@/lib/assessment/types";

// ─── Public API ───────────────────────────────────────────────────────────────

export async function exportToDOCX(
  report:  LabReport,
  options: DOCXExportOptions = {},
): Promise<Blob> {
  // Dynamic import — docx is large; only loaded on first export
  const docx = await import("docx");
  const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    HeadingLevel, AlignmentType, WidthType, BorderStyle, PageBreak,
    ShadingType, Header, Footer, PageNumber,
  } = docx;

  // ── Styling helpers ───────────────────────────────────────────────────────

  const heading1 = (text: string) =>
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)], spacing: { after: 120 } });

  const heading2 = (text: string) =>
    new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)], spacing: { after: 80 } });

  const para = (text: string) =>
    new Paragraph({
      children: [new TextRun({ text: text || "—", size: 22 })],
      spacing: { after: 100, line: 276 },
    });

  const bullet = (text: string) =>
    new Paragraph({
      bullet: { level: 0 },
      children: [new TextRun({ text, size: 22 })],
      spacing: { after: 60 },
    });

  const pageBreak = () =>
    new Paragraph({ children: [new PageBreak()] });

  const buildTable = (
    headers: string[],
    rows:    (string | number | null)[][],
    footer?: (string | number | null)[],
  ) => {
    const headerRow = new TableRow({
      tableHeader: true,
      children: headers.map(h =>
        new TableCell({
          shading:  { type: ShadingType.SOLID, color: "FFFFFF", fill: "1E508C" },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 20 })],
            }),
          ],
        }),
      ),
    });

    const dataRows = rows.map((row, ri) =>
      new TableRow({
        children: row.map(cell =>
          new TableCell({
            shading: ri % 2 === 1
              ? { type: ShadingType.SOLID, color: "FFFFFF", fill: "F0F5FF" }
              : undefined,
            children: [
              new Paragraph({
                children: [new TextRun({ text: cell == null ? "—" : String(cell), size: 20 })],
              }),
            ],
          }),
        ),
      }),
    );

    const footerRows = footer
      ? [new TableRow({
          children: footer.map(cell =>
            new TableCell({
              shading: { type: ShadingType.SOLID, color: "FFFFFF", fill: "E8ECF4" },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: cell == null ? "—" : String(cell), bold: true, size: 20 })],
                }),
              ],
            }),
          ),
        })]
      : [];

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top:    { style: BorderStyle.SINGLE, size: 6, color: "BBBBBB" },
        bottom: { style: BorderStyle.SINGLE, size: 6, color: "BBBBBB" },
        left:   { style: BorderStyle.SINGLE, size: 6, color: "BBBBBB" },
        right:  { style: BorderStyle.SINGLE, size: 6, color: "BBBBBB" },
      },
      rows: [headerRow, ...dataRows, ...footerRows],
    });
  };

  // ── Title page ────────────────────────────────────────────────────────────
  const titlePage = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing:   { before: 2000, after: 400 },
      children:  [new TextRun({ text: report.title, bold: true, size: 48 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing:   { after: 200 },
      children:  [new TextRun({ text: "─".repeat(40), color: "1E508C", size: 20 })],
    }),
    ...[
      report.studentInfo.name       && `Student: ${report.studentInfo.name}`,
      report.studentInfo.studentId  && `ID: ${report.studentInfo.studentId}`,
      report.studentInfo.course     && `Course: ${report.studentInfo.course}`,
      report.studentInfo.instructor && `Instructor: ${report.studentInfo.instructor}`,
      `Date: ${report.studentInfo.date}`,
      report.studentInfo.difficulty && `Level: ${report.studentInfo.difficulty}`,
    ]
      .filter((l): l is string => Boolean(l))
      .map(line =>
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing:   { after: 140 },
          children:  [new TextRun({ text: line, size: 24 })],
        }),
      ),
    pageBreak(),
  ];

  // ── Body sections ─────────────────────────────────────────────────────────
  const bodyContent = [
    heading1("1. Aim"),
    para(report.aim),

    heading1("2. Theory"),
    para(report.theory),

    heading1("3. Apparatus"),
    ...(report.apparatus.length > 0 ? report.apparatus.map(bullet) : [para("—")]),

    heading1("4. Procedure"),
    para(report.procedure),

    heading1("5. Observations"),
    para(report.observations),

    heading1("6. Data Tables"),
    ...buildDataTableElements(report, buildTable, heading2, para),

    heading1("7. Calculations"),
    para(report.calculations),

    heading1("8. Results"),
    para(report.results),

    heading1("10. Sources of Error"),
    ...(report.sourcesOfError.length > 0 ? report.sourcesOfError.map(bullet) : [para("—")]),

    heading1("11. Conclusion"),
    para(report.conclusion),

    ...(report.references.length > 0
      ? [heading1("12. References"), ...report.references.map(bullet)]
      : []),
  ];

  // ── Assessment page ───────────────────────────────────────────────────────
  const gradeContent =
    options.includeGrade !== false && report.gradingResult
      ? buildGradeSection(report.gradingResult, pageBreak, heading1, heading2, para, buildTable)
      : [];

  // ── Document ──────────────────────────────────────────────────────────────
  const document = new Document({
    creator:     options.creator ?? "ChemLab Virtual Laboratory",
    title:       report.title,
    description: `Laboratory report generated ${report.studentInfo.date}`,
    styles: {
      paragraphStyles: [
        {
          id:   "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          run: { bold: true, size: 28, color: "1E508C" },
          paragraph: { spacing: { before: 320, after: 160 } },
        },
        {
          id:   "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          run: { bold: true, size: 24, color: "2C6A9E" },
          paragraph: { spacing: { before: 200, after: 100 } },
        },
      ],
    },
    sections: [
      {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children:  [new TextRun({ text: report.title, size: 16, color: "888888" })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children:  [
                  new TextRun({ text: "Page ", size: 16, color: "888888" }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16, color: "888888",
                  }),
                ],
              }),
            ],
          }),
        },
        children: [...titlePage, ...bodyContent, ...gradeContent],
      },
    ],
  });

  return Packer.toBlob(document);
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

type BuildTableFn = (
  headers: string[],
  rows:    (string | number | null)[][],
  footer?: (string | number | null)[],
) => import("docx").Table;

function buildDataTableElements(
  report:     LabReport,
  buildTable: BuildTableFn,
  h2:         (text: string) => import("docx").Paragraph,
  para:       (text: string) => import("docx").Paragraph,
): (import("docx").Paragraph | import("docx").Table)[] {
  if (report.dataTables.length === 0) return [para("No data tables recorded.")];
  const out: (import("docx").Paragraph | import("docx").Table)[] = [];
  for (const t of report.dataTables) {
    out.push(h2(t.title));
    out.push(buildTable(t.headers, t.rows.map(r => r.cells), t.footer));
    out.push(para(""));
  }
  return out;
}

function buildGradeSection(
  gr:         import("@/lib/assessment/types").GradingResult,
  pageBreak:  () => import("docx").Paragraph,
  h1:         (text: string) => import("docx").Paragraph,
  h2:         (text: string) => import("docx").Paragraph,
  para:       (text: string) => import("docx").Paragraph,
  buildTable: BuildTableFn,
): (import("docx").Paragraph | import("docx").Table)[] {
  const out: (import("docx").Paragraph | import("docx").Table)[] = [
    pageBreak(),
    h1("Assessment Summary"),
    para(`Score: ${gr.totalWeightedScore}%   Grade: ${gr.letterGrade}   ${gr.passed ? "PASS" : "FAIL"}`),
    para(gr.overallFeedback),
    buildTable(
      ["Category", "Raw Score", "Percentage", "Weighted"],
      gr.categories.map(c => [
        GRADING_CATEGORY_LABELS[c.category],
        `${c.rawScore.toFixed(0)} / ${c.maxScore}`,
        `${c.percentage.toFixed(1)}%`,
        `${c.weightedScore.toFixed(1)}`,
      ]),
    ),
    para(""),
  ];

  for (const cat of gr.categories) {
    if (cat.feedback.length === 0) continue;
    out.push(h2(GRADING_CATEGORY_LABELS[cat.category]));
    for (const fb of cat.feedback.slice(0, 3)) {
      out.push(para(`• ${fb}`));
    }
  }

  return out;
}
