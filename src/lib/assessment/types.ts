// ─── Pre-Lab Prediction ────────────────────────────────────────────────────────

export type QuestionType =
  | "multiple-choice"
  | "true-false"
  | "multi-select"
  | "short-answer"
  | "numerical";

export interface PredictionChoice {
  id:        string;
  text:      string;
  isCorrect: boolean;
}

export interface PredictionQuestion {
  id:               string;
  text:             string;
  type:             QuestionType;
  /** For MCQ / true-false / multi-select */
  choices?:         PredictionChoice[];
  /** For short-answer: expected exact text (case-insensitive match) */
  correctAnswer?:   string;
  /** For numerical: expected value */
  numericalAnswer?: number;
  /** ± absolute tolerance; defaults to 5% of numericalAnswer */
  tolerance?:       number;
  unit?:            string;
  /** Shown to student after answering */
  explanation:      string;
  points:           number;
}

export interface PreLabConfig {
  experimentId:  string;
  title:         string;
  instructions?: string;
  questions:     PredictionQuestion[];
  /** Minimum percentage (0–100) required to pass */
  passingScore:  number;
}

export interface PredictionAnswer {
  questionId:         string;
  selectedChoiceId?:  string;
  selectedChoiceIds?: string[];
  textAnswer?:        string;
  numericalAnswer?:   number;
}

export interface PredictionFeedback {
  questionId:      string;
  correct:         boolean;
  pointsEarned:    number;
  pointsAvailable: number;
  explanation:     string;
  correctAnswer:   string;
}

export interface PredictionResult {
  totalPoints: number;
  maxPoints:   number;
  percentage:  number;
  passed:      boolean;
  feedback:    PredictionFeedback[];
}

// ─── Observation Assessment ────────────────────────────────────────────────────

export interface ObservationCriteria {
  minimumEvents:             number;
  /** ObservationEvent.type values that must appear at least once */
  requiredEventTypes?:       string[];
  /** NotebookSectionKey values that must contain non-empty content */
  notebookSectionsRequired?: string[];
}

export interface ObservationScore {
  completeness: number;   // 0–100
  consistency:  number;   // 0–100
  quality:      number;   // 0–100
  overall:      number;
  feedback:     string[];
}

// ─── Calculation Assessment ───────────────────────────────────────────────────

export interface CalculationCriteria {
  requiresUnitLabels:  boolean;
  requiresSigFigs:     boolean;
  requiresUncertainty: boolean;
  minimumCalculations: number;
  /** Substrings that should appear in the calculations / rawData sections */
  expectedFormulas?:   string[];
}

export interface CalculationScore {
  formulaUsage:         number;   // 0–100
  unitCorrectness:      number;   // 0–100
  sigFigAccuracy:       number;   // 0–100
  uncertaintyReporting: number;   // 0–100
  overall:              number;
  feedback:             string[];
}

// ─── Scientific Reasoning Assessment ─────────────────────────────────────────

export interface ReasoningCriteria {
  requiresInterpretation: boolean;
  requiresConclusion:     boolean;
  requiresErrorAnalysis:  boolean;
  /** Minimum total word count across results + conclusion + errorAnalysis */
  minimumWordCount?:      number;
}

export interface ReasoningScore {
  interpretation:          number;   // 0–100
  conclusions:             number;   // 0–100
  errorAnalysis:           number;   // 0–100
  conceptualUnderstanding: number;   // 0–100
  overall:                 number;
  feedback:                string[];
}

// ─── Grading Engine ───────────────────────────────────────────────────────────

export type GradingCategory =
  | "Prediction"
  | "Observation"
  | "DataCollection"
  | "Calculations"
  | "ScientificReasoning"
  | "ErrorAnalysis"
  | "Conclusion";

export const GRADING_CATEGORY_LABELS: Record<GradingCategory, string> = {
  Prediction:          "Pre-Lab Prediction",
  Observation:         "Observations",
  DataCollection:      "Data Collection",
  Calculations:        "Calculations",
  ScientificReasoning: "Scientific Reasoning",
  ErrorAnalysis:       "Error Analysis",
  Conclusion:          "Conclusion",
};

export interface CategoryWeight {
  category: GradingCategory;
  /** Fraction 0–1; all weights in a config must sum to 1.0 */
  weight:   number;
  maxScore: number;
}

export interface CategoryScore {
  category:      GradingCategory;
  rawScore:      number;
  maxScore:      number;
  percentage:    number;
  weightedScore: number;
  feedback:      string[];
}

export interface GradingResult {
  experimentId:       string;
  sessionId:          string;
  gradedAt:           number;
  categories:         CategoryScore[];
  totalWeightedScore: number;   // 0–100
  letterGrade:        string;
  passed:             boolean;
  passingThreshold:   number;
  overallFeedback:    string;
}

export interface GradingConfig {
  experimentId:     string;
  weights:          CategoryWeight[];
  passingThreshold: number;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_GRADING_WEIGHTS: CategoryWeight[] = [
  { category: "Prediction",          weight: 0.10, maxScore: 100 },
  { category: "Observation",         weight: 0.15, maxScore: 100 },
  { category: "DataCollection",      weight: 0.15, maxScore: 100 },
  { category: "Calculations",        weight: 0.25, maxScore: 100 },
  { category: "ScientificReasoning", weight: 0.15, maxScore: 100 },
  { category: "ErrorAnalysis",       weight: 0.10, maxScore: 100 },
  { category: "Conclusion",          weight: 0.10, maxScore: 100 },
];

export const DEFAULT_OBSERVATION_CRITERIA: ObservationCriteria = {
  minimumEvents:             3,
  notebookSectionsRequired:  ["observations"],
};

export const DEFAULT_CALCULATION_CRITERIA: CalculationCriteria = {
  requiresUnitLabels:  true,
  requiresSigFigs:     true,
  requiresUncertainty: false,
  minimumCalculations: 1,
};

export const DEFAULT_REASONING_CRITERIA: ReasoningCriteria = {
  requiresInterpretation: true,
  requiresConclusion:     true,
  requiresErrorAnalysis:  true,
  minimumWordCount:       50,
};
