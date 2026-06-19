/**
 * Student Action Engine
 *
 * Tracks student actions during an experiment and derives quality metrics.
 * Actions influence outcomes (e.g. fast titrant addition near the endpoint
 * degrades precision; poor mixing introduces local gradients).
 */

import type {
  StudentAction,
  StudentActionType,
  ActionSummary,
  ProcedureQuality,
} from "./types";

// ─── Action Recording ─────────────────────────────────────────────────────────

/** Create an empty action log. */
export function createActionLog(): StudentAction[] {
  return [];
}

/** Append a new action to the log; returns the updated log (immutable). */
export function recordAction(
  log:   StudentAction[],
  type:  StudentActionType,
  value?: number,
  unit?:  string,
): StudentAction[] {
  return [...log, { type, timestamp: Date.now(), value, unit }];
}

/** Filter the log to a specific action type. */
export function filterActions(
  log:  StudentAction[],
  type: StudentActionType,
): StudentAction[] {
  return log.filter((a) => a.type === type);
}

// ─── Rate Calculation ─────────────────────────────────────────────────────────

/**
 * Calculate the average reagent addition rate (mL/min) from logged actions
 * within a time window.
 *
 * @param log        Full action log.
 * @param windowMs   Look-back window in ms (default: last 30 s).
 */
export function additionRate(log: StudentAction[], windowMs = 30_000): number {
  const now = Date.now();
  const recent = log.filter(
    (a) => a.type === "add-reagent" && now - a.timestamp <= windowMs && a.value,
  );
  if (recent.length < 2) return 0;

  const totalVolume = recent.reduce((sum, a) => sum + (a.value ?? 0), 0);
  const elapsed     = recent[recent.length - 1].timestamp - recent[0].timestamp;
  if (elapsed <= 0) return 0;

  return (totalVolume / (elapsed / 60_000)); // mL/min
}

// ─── Mixing Score ─────────────────────────────────────────────────────────────

/**
 * Score mixing quality 0–1 based on the frequency and recency of "mix" actions.
 * Full score (1.0) requires mixing at least once every 30 s during the experiment.
 */
export function mixingScore(log: StudentAction[], experimentDurationMs: number): number {
  const mixEvents = filterActions(log, "mix");
  if (mixEvents.length === 0) return 0;

  const intervals = 30_000; // 30 s expected intervals
  const expected  = Math.max(1, Math.floor(experimentDurationMs / intervals));
  return Math.min(1, mixEvents.length / expected);
}

// ─── Procedure Quality ────────────────────────────────────────────────────────

/**
 * Derive an overall procedure quality rating from actions taken
 * near critical moments (endpoint, temperature plateau, etc.).
 */
export function procedureQuality(
  log:                StudentAction[],
  experimentDurationMs: number,
): ProcedureQuality {
  const fastNearEP  = filterActions(log, "titrate-fast").length;
  const dropwise    = filterActions(log, "titrate-dropwise").length;
  const mixing      = mixingScore(log, experimentDurationMs);

  // Penalty for fast additions near endpoint
  if (fastNearEP > 3)  return "poor";
  if (fastNearEP > 1)  return "fair";

  // Reward careful dropwise approach
  if (dropwise > 2 && mixing > 0.6) return "excellent";
  if (dropwise > 0 || mixing > 0.4) return "good";
  return "fair";
}

// ─── Summary ──────────────────────────────────────────────────────────────────

/** Build a complete ActionSummary from the full action log. */
export function buildActionSummary(
  log:                StudentAction[],
  experimentDurationMs: number,
): ActionSummary {
  return {
    totalActions:     log.length,
    additionRate:     additionRate(log),
    mixingScore:      mixingScore(log, experimentDurationMs),
    procedural:       procedureQuality(log, experimentDurationMs),
    heatingEvents:    filterActions(log, "heat").length + filterActions(log, "cool").length,
    mixingEvents:     filterActions(log, "mix").length,
    titrateDropwise:  filterActions(log, "titrate-dropwise").length,
    titrateFast:      filterActions(log, "titrate-fast").length,
  };
}

/** Human-readable procedural feedback. */
export function procedureFeedback(summary: ActionSummary): string {
  switch (summary.procedural) {
    case "excellent":
      return "Excellent technique — dropwise addition and regular mixing ensured a clean endpoint.";
    case "good":
      return "Good technique — minor improvements possible (more frequent mixing near the endpoint).";
    case "fair":
      return "Fair technique — reduce addition rate near the endpoint and mix more frequently.";
    case "poor":
      return "Poor technique — too many fast additions near the endpoint. Slow down and add dropwise.";
  }
}
