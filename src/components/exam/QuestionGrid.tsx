'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, BarChart3 } from 'lucide-react';
import { Exam } from '@/types';

interface QuestionGridProps {
  activeExam: Exam;
  activeAnswers: Record<string, string>;
  currentQuestionIndex: number;
  isExamSubmitted: boolean;
  markedQuestions: Record<string, boolean>;
  isGreenTheme: boolean;
  examMode?: 'practice' | 'exam';
  answeredCount: number;
  reviewCount: number;
  hasIncorrectAnswers: boolean;
  totalQuestions: number;
  progressPct: number;
  gridContainerRef: React.RefObject<HTMLDivElement | null>;
  onSelectQuestion: (index: number) => void;
  onSubmit: () => void;
  onRetryIncorrect: () => void;
  onResetSession: () => void;
}

export function QuestionGrid({
  activeExam, activeAnswers, currentQuestionIndex, isExamSubmitted, markedQuestions,
  isGreenTheme, examMode, answeredCount, totalQuestions, progressPct,
  reviewCount, hasIncorrectAnswers, gridContainerRef, onSelectQuestion, onSubmit, onRetryIncorrect, onResetSession,
}: QuestionGridProps) {
  const accentBg = 'bg-[var(--accent)]';

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--card-bg)]">
      <div className="flex min-h-0 flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3 mb-3 shrink-0">
          <div>
            <h3 className="text-sm font-serif font-bold text-[var(--text-primary)]">{totalQuestions} câu hỏi</h3>
            <p className="mt-1 text-[9px] font-mono text-[var(--text-secondary)]">
              Cuộn xuống để xem toàn bộ
            </p>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--surface-soft)] px-2 py-0.5 rounded-full">{answeredCount}/{totalQuestions}</span>
        </div>
        <div ref={gridContainerRef} className="min-h-[320px] flex-1 overflow-y-auto pr-1 custom-scrollbar">
          <div className="grid grid-cols-5 gap-2 pb-2">
            {activeExam.questions.map((q, idx) => {
              const originalQuestionNumber = q.order > 0 ? q.order : idx + 1;
              const isAnswered = !!activeAnswers[q.id];
              const isFlagged = !isExamSubmitted && !!markedQuestions[q.id];
              const isActive = currentQuestionIndex === idx;
              const correctAns = q.answers.find(a => a.isCorrect);
              const isCorrectQ = (isExamSubmitted || examMode === 'practice') ? activeAnswers[q.id] === correctAns?.id : false;

              let cls = "bg-[var(--card-bg)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]";
              if (isActive && !isExamSubmitted) cls = `bg-[var(--accent-light)] border-[var(--accent)] text-[var(--accent)] font-bold ring-2 ring-[var(--accent)]/20 shadow-sm`;
              else if (isExamSubmitted) cls = isCorrectQ ? "border-emerald-500 bg-emerald-500 text-white font-bold shadow-sm" : `bg-[var(--accent)] border-[var(--accent)] text-white shadow-sm`;
              else if (examMode === 'practice' && isAnswered) {
                cls = isCorrectQ ? "border-emerald-500 bg-emerald-500 text-white font-bold shadow-sm" : `bg-red-500 border-red-500 text-white font-bold shadow-sm`;
              }
              else if (isFlagged) cls = "border-amber-400 bg-amber-100 text-amber-700 font-bold";
              else if (isAnswered) cls = "border-neutral-700 bg-neutral-700 text-white shadow-sm";

              return (
                <button key={q.id} data-qidx={idx} onClick={() => onSelectQuestion(idx)}
                  aria-label={`Câu gốc ${originalQuestionNumber}`}
                  className={cn("h-11 rounded-lg border flex items-center justify-center font-mono text-xs transition-all cursor-pointer hover:border-[var(--accent)] active:scale-95", cls)}
                >
                  {originalQuestionNumber}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-[var(--border-default)] grid grid-cols-2 gap-y-2 gap-x-2 text-[9px] text-[var(--text-secondary)] font-sans shrink-0">
          <Legend color="bg-[var(--card-bg)] border-[var(--border-default)]" label="Chưa làm" />
          <Legend color="bg-neutral-700" label="Đã chọn" />
          <Legend color="bg-amber-400" label="Cần xem lại" />
          <Legend color={cn("border border-[var(--accent)] bg-[var(--accent-light)]")} label="Đang xem" />
        </div>
        <div className="mt-4 pt-4 border-t border-[var(--border-default)] shrink-0">
          {!isExamSubmitted && examMode === 'practice' && hasIncorrectAnswers && reviewCount > 0 && (
            <button
              onClick={onRetryIncorrect}
              className="mb-2.5 w-full rounded-xl border border-red-500/50 bg-red-500/10 px-3 py-3 text-xs font-serif font-bold uppercase tracking-wider text-red-500 transition-all hover:border-red-500 hover:bg-red-500 hover:text-white"
            >
              Làm lại {reviewCount} câu cần ôn
            </button>
          )}
          {!isExamSubmitted ? (
            <button onClick={onSubmit}
              className={cn("w-full flex items-center justify-center gap-2 text-[var(--accent-foreground)] py-3 rounded-xl font-sans font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer", accentBg)}
            >
              <CheckCircle className="w-5 h-5" /> Nộp bài
            </button>
          ) : (
            <button onClick={onResetSession} className="w-full flex items-center justify-center gap-2 bg-[var(--surface-soft)] text-red-500 hover:bg-red-500 hover:text-white border border-[var(--border-default)] hover:border-red-500 py-3 rounded-xl text-xs font-serif font-bold uppercase tracking-wider cursor-pointer transition-all">
              Quay lại
            </button>
          )}
        </div>
      </div>
      {!isExamSubmitted && (
        <div className="bg-[var(--surface-soft)] border-t border-[var(--border-default)] p-3.5 shadow-sm shrink-0">
          <div className="flex items-center gap-2 text-[11px] font-sans font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
            <BarChart3 className="w-3.5 h-3.5" /> Tiến độ
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, backgroundColor: 'var(--accent)' }} />
            </div>
            <span className="text-xs font-mono font-bold text-[var(--text-primary)] tabular-nums">{answeredCount}/{totalQuestions}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("w-3 h-3 rounded", color)} />
      <span>{label}</span>
    </div>
  );
}
