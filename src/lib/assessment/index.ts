// ─── Types ────────────────────────────────────────────────────────────────────
export type {
  QuestionType,
  PredictionChoice,
  PredictionQuestion,
  PreLabConfig,
  PredictionAnswer,
  PredictionFeedback,
  PredictionResult,
  ObservationCriteria,
  ObservationScore,
  CalculationCriteria,
  CalculationScore,
  ReasoningCriteria,
  ReasoningScore,
  GradingCategory,
  CategoryWeight,
  CategoryScore,
  GradingResult,
  GradingConfig,
} from "./types";

export {
  GRADING_CATEGORY_LABELS,
  DEFAULT_GRADING_WEIGHTS,
  DEFAULT_OBSERVATION_CRITERIA,
  DEFAULT_CALCULATION_CRITERIA,
  DEFAULT_REASONING_CRITERIA,
} from "./types";

// ─── Assessment functions ─────────────────────────────────────────────────────
export { assessPrediction }   from "./pre-lab";
export { assessObservations } from "./observation";
export { assessCalculations } from "./calculation";
export { assessReasoning }    from "./reasoning";

// ─── Grading engine ───────────────────────────────────────────────────────────
export { GradingEngine }      from "./grading-engine";
export type { GradingInput }  from "./grading-engine";
