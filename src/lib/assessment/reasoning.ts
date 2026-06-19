import type { ExperimentResult } from "@/lib/engine/types";
import type { LabNotebook }       from "@/lib/lab-data/types";
import type { ReasoningCriteria, ReasoningScore } from "./types";
import { DEFAULT_REASONING_CRITERIA } from "./types";

// ─── Patterns ─────────────────────────────────────────────────────────────────

const CAUSAL_RE   = /because|therefore|since|as a result|due to|caused|indicates|suggests|shows that|demonstrates/i;
const ERROR_RE    = /error|uncertainty|systematic|random|parallax|human|instrumental|percentage|source of error/i;
const QUANTITY_RE = /\d+\.?\d*\s*(mol|g|mL|°C|kJ|M|mmHg|atm|Pa|%)/i;
const LIST_RE     = /\n|\d+\.|•|-\s/g;

// ─── Public API ───────────────────────────────────────────────────────────────

export function assessReasoning(
  notebook: LabNotebook | null,
  result:   ExperimentResult | null,
  criteria: ReasoningCriteria = DEFAULT_REASONING_CRITERIA,
): ReasoningScore {
  const feedback: string[] = [];

  const interpretText  = notebook?.sections.results?.content      ?? "";
  const conclusionText = notebook?.sections.conclusion?.content    ?? "";
  const errorText      = notebook?.sections.errorAnalysis?.content ?? "";

  // ── Interpretation ────────────────────────────────────────────────────────
  let interpretation: number;
  if (!criteria.requiresInterpretation) {
    interpretation = 100;
  } else {
    const wc = countWords(interpretText);
    interpretation = 0;
    if (wc >= 20)    interpretation += 40;
    else if (wc > 0) interpretation += 20;
    if (CAUSAL_RE.test(interpretText))   interpretation += 30;
    if (QUANTITY_RE.test(interpretText)) interpretation += 30;

    if (wc < 20)                         feedback.push("Expand Results/Interpretation with data-backed reasoning (aim for ≥ 20 words).");
    if (!CAUSAL_RE.test(interpretText))  feedback.push("Use causal language (because, therefore, as a result) in your interpretation.");
    if (!QUANTITY_RE.test(interpretText)) feedback.push("Reference specific numerical values in your interpretation.");
  }

  // ── Conclusions ───────────────────────────────────────────────────────────
  let conclusions: number;
  if (!criteria.requiresConclusion) {
    conclusions = 100;
  } else {
    const wc = countWords(conclusionText);
    conclusions = 0;
    if (wc >= 30)    conclusions += 40;
    else if (wc > 0) conclusions += 20;
    if (CAUSAL_RE.test(conclusionText))   conclusions += 25;
    if (QUANTITY_RE.test(conclusionText)) conclusions += 25;
    // Bonus when the conclusion appears to reference the engine result
    if (result?.success && result.score >= 80) conclusions = Math.min(100, conclusions + 10);

    if (wc < 30)                          feedback.push("Write a fuller conclusion addressing the aim and citing evidence (aim for ≥ 30 words).");
    if (!QUANTITY_RE.test(conclusionText)) feedback.push("Quantify your conclusion with experimental values and units.");
  }

  // ── Error Analysis ────────────────────────────────────────────────────────
  let errorAnalysis: number;
  if (!criteria.requiresErrorAnalysis) {
    errorAnalysis = 100;
  } else {
    const wc      = countWords(errorText);
    const listHits = (errorText.match(LIST_RE) ?? []).length;
    errorAnalysis = 0;
    if (wc >= 20)              errorAnalysis += 30;
    if (ERROR_RE.test(errorText))    errorAnalysis += 30;
    if (QUANTITY_RE.test(errorText)) errorAnalysis += 20;
    if (listHits >= 2)         errorAnalysis += 20;

    if (wc < 20)                  feedback.push("Identify ≥ 2 sources of experimental error in the Error Analysis section.");
    if (!ERROR_RE.test(errorText)) feedback.push("Name specific error types (parallax, systematic, random, instrumental).");
  }

  // ── Conceptual Understanding (holistic) ───────────────────────────────────
  const allText   = `${interpretText} ${conclusionText} ${errorText}`;
  const totalWords = countWords(allText);
  const minWords   = criteria.minimumWordCount ?? 50;

  let conceptualUnderstanding = Math.round(Math.min(50, (totalWords / minWords) * 50));
  if (CAUSAL_RE.test(allText))   conceptualUnderstanding += 25;
  if (QUANTITY_RE.test(allText)) conceptualUnderstanding += 25;
  conceptualUnderstanding = Math.min(100, conceptualUnderstanding);

  if (totalWords < minWords) {
    feedback.push(
      `Aim for ≥ ${minWords} words across Results, Error Analysis, and Conclusion (current: ${totalWords}).`,
    );
  }

  const overall = Math.round(
    (interpretation          * 0.30) +
    (conclusions             * 0.30) +
    (errorAnalysis           * 0.25) +
    (conceptualUnderstanding * 0.15),
  );

  return { interpretation, conclusions, errorAnalysis, conceptualUnderstanding, overall, feedback };
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}
