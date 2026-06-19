import type {
  PreLabConfig,
  PredictionAnswer,
  PredictionFeedback,
  PredictionQuestion,
  PredictionResult,
} from "./types";

// ─── Public API ───────────────────────────────────────────────────────────────

export function assessPrediction(
  answers: PredictionAnswer[],
  config:  PreLabConfig,
): PredictionResult {
  let totalPoints = 0;
  let maxPoints   = 0;
  const feedback: PredictionFeedback[] = [];

  for (const question of config.questions) {
    maxPoints += question.points;
    const answer = answers.find(a => a.questionId === question.id);

    if (!answer) {
      feedback.push({
        questionId:      question.id,
        correct:         false,
        pointsEarned:    0,
        pointsAvailable: question.points,
        explanation:     question.explanation,
        correctAnswer:   resolveCorrectAnswerText(question),
      });
      continue;
    }

    const { correct, pointsEarned } = scoreAnswer(answer, question);
    totalPoints += pointsEarned;

    feedback.push({
      questionId:      question.id,
      correct,
      pointsEarned,
      pointsAvailable: question.points,
      explanation:     question.explanation,
      correctAnswer:   resolveCorrectAnswerText(question),
    });
  }

  const percentage = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;

  return { totalPoints, maxPoints, percentage, passed: percentage >= config.passingScore, feedback };
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function scoreAnswer(
  answer:   PredictionAnswer,
  question: PredictionQuestion,
): { correct: boolean; pointsEarned: number } {
  switch (question.type) {
    case "multiple-choice":
    case "true-false": {
      const correct = question.choices?.find(c => c.id === answer.selectedChoiceId)?.isCorrect === true;
      return { correct, pointsEarned: correct ? question.points : 0 };
    }
    case "multi-select": {
      const correctIds  = new Set(question.choices?.filter(c => c.isCorrect).map(c => c.id) ?? []);
      const selectedIds = new Set(answer.selectedChoiceIds ?? []);
      const allMatch    =
        correctIds.size === selectedIds.size &&
        [...correctIds].every(id => selectedIds.has(id));
      return { correct: allMatch, pointsEarned: allMatch ? question.points : 0 };
    }
    case "short-answer": {
      const correct =
        answer.textAnswer?.trim().toLowerCase() ===
        question.correctAnswer?.trim().toLowerCase();
      return { correct: !!correct, pointsEarned: correct ? question.points : 0 };
    }
    case "numerical": {
      if (answer.numericalAnswer == null || question.numericalAnswer == null) {
        return { correct: false, pointsEarned: 0 };
      }
      const tol     = question.tolerance ?? Math.abs(question.numericalAnswer) * 0.05;
      const correct = Math.abs(answer.numericalAnswer - question.numericalAnswer) <= tol;
      return { correct, pointsEarned: correct ? question.points : 0 };
    }
  }
}

function resolveCorrectAnswerText(question: PredictionQuestion): string {
  switch (question.type) {
    case "multiple-choice":
    case "true-false":
      return question.choices?.find(c => c.isCorrect)?.text ?? "—";
    case "multi-select":
      return question.choices?.filter(c => c.isCorrect).map(c => c.text).join(", ") ?? "—";
    case "short-answer":
      return question.correctAnswer ?? "—";
    case "numerical":
      if (question.numericalAnswer == null) return "—";
      return question.unit
        ? `${question.numericalAnswer} ${question.unit}`
        : String(question.numericalAnswer);
  }
}
