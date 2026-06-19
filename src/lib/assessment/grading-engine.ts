import type {
  GradingCategory,
  GradingConfig,
  GradingResult,
  CategoryScore,
  CategoryWeight,
  PredictionResult,
  ObservationScore,
  CalculationScore,
  ReasoningScore,
} from "./types";
import { DEFAULT_GRADING_WEIGHTS, GRADING_CATEGORY_LABELS } from "./types";

// ─── Input shape ──────────────────────────────────────────────────────────────

export interface GradingInput {
  predictionResult?:    PredictionResult;
  observationScore?:    ObservationScore;
  /** 0–100: percentage of experiment trials that were completed */
  dataCollectionScore?: number;
  calculationScore?:    CalculationScore;
  reasoningScore?:      ReasoningScore;
  /** 0–100: quality of the error analysis section */
  errorAnalysisScore?:  number;
  /** 0–100: quality of the conclusion section */
  conclusionScore?:     number;
}

// ─── Grading engine ───────────────────────────────────────────────────────────

export class GradingEngine {
  private readonly config: GradingConfig;

  constructor(config: { experimentId: string } & Partial<Omit<GradingConfig, "experimentId">>) {
    this.config = {
      experimentId:     config.experimentId,
      weights:          config.weights          ?? DEFAULT_GRADING_WEIGHTS,
      passingThreshold: config.passingThreshold ?? 50,
    };
  }

  grade(input: GradingInput, sessionId: string): GradingResult {
    const categories = this.config.weights.map(w => this.scoreCategory(w, input));

    const totalWeightedScore = Math.round(
      categories.reduce((sum, cs) => sum + cs.weightedScore, 0),
    );

    const passed      = totalWeightedScore >= this.config.passingThreshold;
    const letterGrade = resolveLetterGrade(totalWeightedScore);

    return {
      experimentId:       this.config.experimentId,
      sessionId,
      gradedAt:           Date.now(),
      categories,
      totalWeightedScore,
      letterGrade,
      passed,
      passingThreshold:   this.config.passingThreshold,
      overallFeedback:    buildOverallFeedback(totalWeightedScore, passed, categories),
    };
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private scoreCategory(w: CategoryWeight, input: GradingInput): CategoryScore {
    const { rawScore, feedback } = extractRawScore(w.category, input);
    const clamped      = Math.max(0, Math.min(w.maxScore, rawScore));
    const percentage   = w.maxScore > 0 ? (clamped / w.maxScore) * 100 : 0;
    const weightedScore = percentage * w.weight;
    return { category: w.category, rawScore: clamped, maxScore: w.maxScore, percentage, weightedScore, feedback };
  }
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function extractRawScore(
  category: GradingCategory,
  input:    GradingInput,
): { rawScore: number; feedback: string[] } {
  switch (category) {
    case "Prediction":
      return {
        rawScore: input.predictionResult?.percentage ?? 0,
        feedback: input.predictionResult
          ? input.predictionResult.feedback
              .filter(f => !f.correct)
              .map((f, i) => `Q${i + 1}: ${f.explanation}`)
          : ["Pre-lab prediction not submitted."],
      };

    case "Observation":
      return {
        rawScore: input.observationScore?.overall ?? 0,
        feedback: input.observationScore?.feedback ?? ["Observations not assessed."],
      };

    case "DataCollection":
      return {
        rawScore: input.dataCollectionScore ?? 0,
        feedback: (input.dataCollectionScore ?? 0) < 50
          ? ["Complete all experiment trials to maximise the data collection score."]
          : [],
      };

    case "Calculations":
      return {
        rawScore: input.calculationScore?.overall ?? 0,
        feedback: input.calculationScore?.feedback ?? ["Calculations section not assessed."],
      };

    case "ScientificReasoning":
      return {
        rawScore: input.reasoningScore?.overall ?? 0,
        feedback: input.reasoningScore?.feedback ?? ["Scientific reasoning not assessed."],
      };

    case "ErrorAnalysis":
      return {
        rawScore: input.errorAnalysisScore ?? 0,
        feedback: (input.errorAnalysisScore ?? 0) < 50
          ? ["Provide a thorough error analysis identifying systematic and random sources of error."]
          : [],
      };

    case "Conclusion":
      return {
        rawScore: input.conclusionScore ?? 0,
        feedback: (input.conclusionScore ?? 0) < 50
          ? ["Write a conclusion that directly addresses the aim and references experimental evidence."]
          : [],
      };
  }
}

function resolveLetterGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function buildOverallFeedback(
  score:      number,
  passed:     boolean,
  categories: CategoryScore[],
): string {
  const weak = categories
    .filter(c => c.percentage < 50)
    .map(c => GRADING_CATEGORY_LABELS[c.category]);

  if (!passed) {
    return `Score: ${score}% — below the passing threshold. Priority areas: ${weak.join(", ") || "all sections"}.`;
  }
  if (weak.length > 0) {
    return `Score: ${score}% (${resolveLetterGrade(score)}). Areas to strengthen: ${weak.join(", ")}.`;
  }
  return `Score: ${score}% (${resolveLetterGrade(score)}) — strong performance across all categories.`;
}
