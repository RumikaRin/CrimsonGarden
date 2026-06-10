import type { Exam, ExamAttempt, Question } from '@/types';

export interface MistakeInsight {
  examId: string;
  examTitle: string;
  question: Question;
  selectedAnswerId?: string;
  mistakeCount: number;
  lastMissedAt: string;
}

export interface LearningSummary {
  answered: number;
  correct: number;
  accuracy: number;
  mistakeCount: number;
  reviewExamId: string | null;
}

export function buildMistakeInsights(
  exams: Exam[],
  attempts: ExamAttempt[],
  userId?: string,
): MistakeInsight[] {
  const examMap = new Map(exams.map((exam) => [exam.id, exam]));
  const mistakeMap = new Map<string, MistakeInsight>();

  attempts
    .filter((attempt) => !userId || attempt.userId === userId)
    .sort((a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime())
    .forEach((attempt) => {
      const exam = examMap.get(attempt.examId);
      if (!exam) return;

      exam.questions.forEach((question) => {
        const selectedAnswerId = attempt.answers[question.id];
        const correctAnswer = question.answers.find((answer) => answer.isCorrect);
        if (!selectedAnswerId || selectedAnswerId === correctAnswer?.id) return;

        const key = `${exam.id}:${question.id}`;
        const existing = mistakeMap.get(key);
        if (existing) {
          existing.mistakeCount += 1;
          return;
        }

        mistakeMap.set(key, {
          examId: exam.id,
          examTitle: exam.title,
          question,
          selectedAnswerId,
          mistakeCount: 1,
          lastMissedAt: attempt.endedAt,
        });
      });
    });

  return Array.from(mistakeMap.values()).sort((a, b) => {
    if (b.mistakeCount !== a.mistakeCount) return b.mistakeCount - a.mistakeCount;
    return new Date(b.lastMissedAt).getTime() - new Date(a.lastMissedAt).getTime();
  });
}

export function buildLearningSummary(
  exams: Exam[],
  attempts: ExamAttempt[],
  userId?: string,
): LearningSummary {
  const relevantAttempts = attempts.filter((attempt) => !userId || attempt.userId === userId);
  const examMap = new Map(exams.map((exam) => [exam.id, exam]));
  let answered = 0;
  let correct = 0;

  relevantAttempts.forEach((attempt) => {
    const exam = examMap.get(attempt.examId);
    if (!exam) return;

    exam.questions.forEach((question) => {
      const selectedAnswerId = attempt.answers[question.id];
      if (!selectedAnswerId) return;
      answered += 1;
      if (question.answers.find((answer) => answer.isCorrect)?.id === selectedAnswerId) {
        correct += 1;
      }
    });
  });

  const mistakes = buildMistakeInsights(exams, relevantAttempts);
  return {
    answered,
    correct,
    accuracy: answered > 0 ? Math.round((correct / answered) * 100) : 0,
    mistakeCount: mistakes.length,
    reviewExamId: mistakes[0]?.examId ?? null,
  };
}

