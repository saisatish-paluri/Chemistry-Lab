import type { LabNotebook, TrialSet } from "@/lib/lab-data/types";
import type { CalculationCriteria, CalculationScore } from "./types";
import { DEFAULT_CALCULATION_CRITERIA } from "./types";

// ─── Patterns ─────────────────────────────────────────────────────────────────

const UNIT_RE        = /\b(mol|g|kg|mL|L|dm³|cm³|kJ|J|°C|K|Pa|atm|M|mol\/L|mmHg|s|min|nm|cm)\b/gi;
const FORMULA_RE     = /[a-zA-ZΔ][a-zA-Z₀₁₂₃₄₅₆₇₈₉]*\s*=|ΔH|ΔT|pV|nRT|Q\s*=|n\s*=|c\s*=|m\s*=|V\s*=|C\s*=/g;
const SIG_FIG_RE     = /\d+\.\d{1,4}/;
const UNCERTAINTY_RE = /±|\+\/-|uncertainty|absolute error|percentage error|relative error/i;
const NUMBER_RE      = /\d+\.?\d*/g;

// ─── Public API ───────────────────────────────────────────────────────────────

export function assessCalculations(
  notebook: LabNotebook | null,
  trials:   TrialSet | null,
  criteria: CalculationCriteria = DEFAULT_CALCULATION_CRITERIA,
): CalculationScore {
  const feedback: string[] = [];
  const calcText = notebook?.sections.calculations?.content ?? "";
  const rawText  = notebook?.sections.rawData?.content      ?? "";
  const allText  = `${calcText}\n${rawText}`;

  // ── Formula usage ─────────────────────────────────────────────────────────
  let formulaUsage = 0;
  const formulaMatches = (allText.match(FORMULA_RE) ?? []).length;
  formulaUsage = Math.min(70, formulaMatches * 20);

  if (criteria.expectedFormulas && criteria.expectedFormulas.length > 0) {
    const found = criteria.expectedFormulas.filter(f =>
      allText.toLowerCase().includes(f.toLowerCase()),
    ).length;
    formulaUsage = Math.min(100, formulaUsage + (found / criteria.expectedFormulas.length) * 50);
  }

  if (calcText.trim().length < 30) {
    formulaUsage = Math.min(formulaUsage, 20);
    feedback.push(
      `Add at least ${criteria.minimumCalculations} worked calculation(s) to the Calculations section.`,
    );
  } else if (formulaUsage < 50) {
    feedback.push("Show all formulae used (e.g. n = cV, ΔH = mcΔT, Q = mcΔT).");
  }

  // ── Unit correctness ──────────────────────────────────────────────────────
  let unitCorrectness: number;
  if (!criteria.requiresUnitLabels) {
    unitCorrectness = 100;
  } else {
    const unitCount   = (allText.match(UNIT_RE) ?? []).length;
    const numberCount = (allText.match(NUMBER_RE) ?? []).length;
    if (numberCount === 0) {
      unitCorrectness = 0;
      feedback.push("Include numerical values with proper SI units in calculations.");
    } else {
      const ratio = unitCount / numberCount;
      unitCorrectness = Math.round(Math.min(100, ratio * 150));
      if (ratio < 0.5) {
        feedback.push("Ensure every numerical value includes its SI unit label.");
      }
    }
  }

  // ── Significant figures ───────────────────────────────────────────────────
  let sigFigAccuracy: number;
  if (!criteria.requiresSigFigs) {
    sigFigAccuracy = 100;
  } else {
    const hasSigFig    = SIG_FIG_RE.test(allText);
    sigFigAccuracy     = hasSigFig ? 80 : 20;
    const completedN   = trials?.trials.filter(t => t.completedAt !== null).length ?? 0;
    if (completedN >= 2) sigFigAccuracy = Math.min(100, sigFigAccuracy + 20);
    if (!hasSigFig) {
      feedback.push("Express calculated values to the appropriate number of significant figures.");
    }
  }

  // ── Uncertainty reporting ─────────────────────────────────────────────────
  let uncertaintyReporting: number;
  if (!criteria.requiresUncertainty) {
    uncertaintyReporting = 100;
  } else {
    const hasUncertainty = UNCERTAINTY_RE.test(allText);
    uncertaintyReporting = hasUncertainty ? 90 : 10;
    if (!hasUncertainty) {
      feedback.push("Include absolute or percentage uncertainty in your final result (e.g. 24.5 ± 0.05 mL).");
    }
  }

  const overall = Math.round(
    (formulaUsage         * 0.35) +
    (unitCorrectness      * 0.30) +
    (sigFigAccuracy       * 0.20) +
    (uncertaintyReporting * 0.15),
  );

  return { formulaUsage, unitCorrectness, sigFigAccuracy, uncertaintyReporting, overall, feedback };
}
