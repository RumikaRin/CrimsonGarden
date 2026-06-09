export type Role = 'ADMIN' | 'STAFF' | 'STUDENT';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: Role;
}

export interface Answer {
  id: string;
  content: string; // A, B, C, D text or choices
  isCorrect: boolean;
}

export interface Question {
  id: string;
  content: string;
  explanation?: string;
  points: number;
  order: number;
  answers: Answer[];
}

export interface Exam {
  id: string;
  title: string;
  description?: string;
  duration: number; // in minutes
  createdAt: string;
  questions: Question[];
}

export interface ExamAttempt {
  id: string;
  userId: string;
  examId: string;
  score: number;
  durationSec: number;
  answers: Record<string, string>; // questionId -> chosen answerId
  startedAt: string;
  endedAt: string;
  synced?: boolean;
}

export interface GameScore {
  id: string;
  userId: string;
  score: number;
  vocabularyCategory: string;
  durationSeconds: number;
  playedAt: string;
  synced?: boolean;
}

export interface VocabularyWord {
  english: string;
  vietnamese: string;
  hint?: string;
}
