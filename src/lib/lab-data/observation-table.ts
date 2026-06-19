import type {
  ColumnDef,
  ObservationRow,
  ObservationTable,
  ObservationTableTemplate,
} from "./types";

// ─── Table creation ────────────────────────────────────────────────────────────

export function createTable(
  experimentId: string,
  sessionId:    string,
  template:     ObservationTableTemplate,
  rowCount      = 3,
): ObservationTable {
  const rows: ObservationRow[] = Array.from({ length: rowCount }, (_, i) => ({
    id:    `row_${i + 1}`,
    cells: Object.fromEntries(template.columns.map(c => [c.id, null])),
  }));

  return {
    id:           `${experimentId}_${sessionId}_${Date.now()}`,
    experimentId,
    sessionId,
    title:        template.title,
    columns:      template.columns,
    rows,
    updatedAt:    Date.now(),
  };
}

// ─── Cell editing ─────────────────────────────────────────────────────────────

export function updateCell(
  table:  ObservationTable,
  rowId:  string,
  colId:  string,
  value:  string | number | null,
): ObservationTable {
  const column = table.columns.find(c => c.id === colId);
  if (!column || !column.editable) return table;

  const rows = table.rows.map(row =>
    row.id !== rowId
      ? row
      : { ...row, cells: { ...row.cells, [colId]: value } },
  );

  // Re-evaluate formula columns for every row after any edit
  const recomputed = rows.map(row => ({
    ...row,
    cells: recomputeFormulas(row.cells, table.columns),
  }));

  return { ...table, rows: recomputed, updatedAt: Date.now() };
}

// ─── Row management ───────────────────────────────────────────────────────────

export function addRow(table: ObservationTable): ObservationTable {
  const newRow: ObservationRow = {
    id:    `row_${Date.now()}`,
    cells: Object.fromEntries(table.columns.map(c => [c.id, null])),
  };
  return { ...table, rows: [...table.rows, newRow], updatedAt: Date.now() };
}

export function removeRow(table: ObservationTable, rowId: string): ObservationTable {
  return {
    ...table,
    rows:      table.rows.filter(r => r.id !== rowId),
    updatedAt: Date.now(),
  };
}

// ─── Analytics ────────────────────────────────────────────────────────────────

/** Returns column-keyed averages for all numeric and formula columns. */
export function getColumnAverages(table: ObservationTable): Record<string, number | null> {
  const averages: Record<string, number | null> = {};

  for (const col of table.columns) {
    if (col.type !== "number" && col.type !== "formula") continue;

    const nums = table.rows
      .map(r => r.cells[col.id])
      .filter((v): v is number => typeof v === "number" && isFinite(v));

    averages[col.id] = nums.length > 0
      ? nums.reduce((a, b) => a + b, 0) / nums.length
      : null;
  }

  return averages;
}

/** Format a cell value for display (adds unit and respects decimalPlaces). */
export function formatCell(value: string | number | null, col: ColumnDef): string {
  if (value === null || value === undefined || value === "") return "—";

  if (col.type === "number" || col.type === "formula") {
    const num = typeof value === "number" ? value : parseFloat(String(value));
    if (isNaN(num)) return String(value);
    const dp        = col.decimalPlaces ?? 2;
    const formatted = num.toFixed(dp);
    return col.unit ? `${formatted} ${col.unit}` : formatted;
  }

  return String(value);
}

// ─── Formula engine ───────────────────────────────────────────────────────────

function recomputeFormulas(
  cells:   Record<string, string | number | null>,
  columns: ColumnDef[],
): Record<string, string | number | null> {
  const out = { ...cells };
  for (const col of columns) {
    if (col.type === "formula" && col.formula) {
      out[col.id] = evaluateFormula(col.formula, out, columns);
    }
  }
  return out;
}

/**
 * Safe arithmetic formula evaluator.
 * Substitutes column IDs with their numeric values, then parses using a
 * hand-written recursive descent parser (+, -, *, /, parentheses, unary minus).
 * Returns null if any operand is missing or the expression is invalid.
 */
function evaluateFormula(
  formula: string,
  cells:   Record<string, string | number | null>,
  columns: ColumnDef[],
): number | null {
  let expr = formula;

  // Replace each editable column reference with its numeric value
  for (const col of columns) {
    if (col.type === "formula") continue;
    const raw = cells[col.id];
    const num = typeof raw === "number" ? raw : parseFloat(String(raw ?? ""));
    if (isNaN(num)) return null;
    expr = expr.replace(
      new RegExp(`\\b${escapeRegex(col.id)}\\b`, "g"),
      String(num),
    );
  }

  // Guard: after substitution only digits, operators, decimals, parens, spaces allowed
  if (!/^[\d\s+\-*/().]+$/.test(expr)) return null;

  const state = { pos: 0, src: expr.replace(/\s/g, "") };
  try {
    const result = parseExpr(state);
    return state.pos === state.src.length && result !== null && isFinite(result)
      ? result
      : null;
  } catch {
    return null;
  }
}

// Recursive descent: expr → term (('+' | '-') term)*
function parseExpr(s: { pos: number; src: string }): number | null {
  let left = parseTerm(s);
  if (left === null) return null;

  while (s.pos < s.src.length) {
    const op = s.src[s.pos];
    if (op !== "+" && op !== "-") break;
    s.pos++;
    const right = parseTerm(s);
    if (right === null) return null;
    left = op === "+" ? left + right : left - right;
  }
  return left;
}

// term → factor (('*' | '/') factor)*
function parseTerm(s: { pos: number; src: string }): number | null {
  let left = parseFactor(s);
  if (left === null) return null;

  while (s.pos < s.src.length) {
    const op = s.src[s.pos];
    if (op !== "*" && op !== "/") break;
    s.pos++;
    const right = parseFactor(s);
    if (right === null) return null;
    if (op === "/" && right === 0) return null;
    left = op === "*" ? left * right : left / right;
  }
  return left;
}

// factor → '(' expr ')' | '-' factor | number
function parseFactor(s: { pos: number; src: string }): number | null {
  if (s.pos >= s.src.length) return null;

  if (s.src[s.pos] === "(") {
    s.pos++;
    const val = parseExpr(s);
    if (s.pos >= s.src.length || s.src[s.pos] !== ")") return null;
    s.pos++;
    return val;
  }

  if (s.src[s.pos] === "-") {
    s.pos++;
    const val = parseFactor(s);
    return val !== null ? -val : null;
  }

  const match = s.src.slice(s.pos).match(/^[\d]+(?:\.[\d]+)?/);
  if (!match) return null;
  s.pos += match[0].length;
  return parseFloat(match[0]);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
