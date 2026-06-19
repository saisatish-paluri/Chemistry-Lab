import type { ObservationEvent } from "@/lib/engine/types";
import type { LabNotebook }       from "@/lib/lab-data/types";
import type { ObservationCriteria, ObservationScore } from "./types";
import { DEFAULT_OBSERVATION_CRITERIA } from "./types";

// ─── Public API ───────────────────────────────────────────────────────────────

export function assessObservations(
  events:   ObservationEvent[],
  notebook: LabNotebook | null,
  criteria: ObservationCriteria = DEFAULT_OBSERVATION_CRITERIA,
): ObservationScore {
  const feedback: string[] = [];

  // ── Completeness ──────────────────────────────────────────────────────────
  const eventRatio  = events.length / Math.max(criteria.minimumEvents, 1);
  let eventScore    = Math.min(80, eventRatio * 80);

  if (events.length < criteria.minimumEvents) {
    feedback.push(
      `Record at least ${criteria.minimumEvents} observation events (found ${events.length}).`,
    );
  }

  // Required event types
  if (criteria.requiredEventTypes && criteria.requiredEventTypes.length > 0) {
    const seenTypes = new Set<string>(events.map(e => e.type));
    const missing   = criteria.requiredEventTypes.filter(t => !seenTypes.has(t));
    if (missing.length > 0) {
      feedback.push(`Missing key observations: ${missing.join(", ")}.`);
      const covered = criteria.requiredEventTypes.length - missing.length;
      eventScore *= covered / criteria.requiredEventTypes.length;
    }
  }

  let sectionScore = 20;
  const required   = criteria.notebookSectionsRequired ?? [];
  if (required.length > 0 && notebook) {
    const filled = required.filter(
      key => (notebook.sections[key as keyof typeof notebook.sections]?.content.trim().length ?? 0) > 10,
    ).length;
    sectionScore = (filled / required.length) * 20;
    if (filled < required.length) {
      feedback.push(`Complete required notebook sections: ${required.join(", ")}.`);
    }
  }

  const completeness = Math.round(Math.min(100, eventScore + sectionScore));

  // ── Consistency ───────────────────────────────────────────────────────────
  let consistency = 100;
  if (notebook) {
    const obsText       = notebook.sections.observations?.content ?? "";
    const hasAlerts     = events.some(e => e.severity === "error" || e.severity === "warning");
    if (obsText.length === 0 && events.length > 0) {
      consistency = 45;
      feedback.push("Observations section is empty despite active experiment events.");
    } else if (hasAlerts && obsText.length < 20) {
      consistency = 60;
      feedback.push("Notebook observations do not reflect recorded warning/error events.");
    }
  }

  // ── Quality ───────────────────────────────────────────────────────────────
  const uniqueTypes    = new Set(events.map(e => e.type)).size;
  const successCount   = events.filter(e => e.severity === "success").length;
  const infoCount      = events.filter(e => e.severity === "info").length;
  const diversityScore = Math.min(40, (uniqueTypes / 5) * 40);
  const successScore   = Math.min(40, (successCount / Math.max(1, events.length)) * 40);
  const volumeScore    = Math.min(20, (infoCount / 5) * 20);
  const quality        = Math.round(diversityScore + successScore + volumeScore);

  const overall = Math.round(
    (completeness * 0.45) + (consistency * 0.30) + (quality * 0.25),
  );

  return { completeness, consistency, quality, overall, feedback };
}
