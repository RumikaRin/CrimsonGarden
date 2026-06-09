'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useIsGreen } from "@/lib/useThemeTokens";
import { CheckCircle, BarChart3 } from 'lucide-react';
import { Exam } from '@/types';

interface QuestionGridProps {
  activeExam: Exam;
  activeAnswers: Record<string, string>;
  currentQuestionIndex: number;
  isExamSubmitted: boolean;
  markedQuestions: Record<string, boolean>;
  isGreenTheme: boolean;
  answeredCount: number;
  totalQuestions: number;
  progressPct: number;
  gridContainerRef: React.RefObject<HTMLDivElement | null>;
  onSelectQuestion: (index: number) => void;
  onSubmit: () => void;
  onResetSession: () => void;
}

export function QuestionGrid({
  activeExam, activeAnswers, currentQuestionIndex, isExamSubmitted, markedQuestions,
  isGreenTheme, answeredCount, totalQuestions, progressPct,
  gridContainerRef, onSelectQuestion, onSubmit, onResetSession,
}: QuestionGridProps) {
  const accentBg = 'bg-[var(--accent)]';
  const accentBorder = 'border-[var(--accent)]';
  const accentLight = isGreenTheme ? 'bg-[var(--accent-light)]/15' : 'bg-[var(--accent)]/8';

  return (
    <div className="space-y-4">
      <div className="bg-[#FAF9F6] border border-neutral-200 rounded-2xl p-5 shadow-sm sticky top-28">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-serif font-bold text-[#1A1814]">{totalQuestions} câu hỏi</h3>
          <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">{answeredCount}/{totalQuestions}</span>
        </div>
        <div ref={gridContainerRef} className="overflow-y-auto pr-1 scroll-smooth"
          style={{ maxHeight: totalQuestions > 40 ? `${Math.min(Math.ceil(totalQuestions / 5), 16) * 3 + 0.25}rem` : '20.25rem' }}
        >
          <div className="grid grid-cols-5 gap-2">
            {activeExam.questions.map((q, idx) => {
              const isAnswered = !!activeAnswers[q.id];
              const isFlagged = !isExamSubmitted && !!markedQuestions[q.id];
              const isActive = currentQuestionIndex === idx;
              const correctAns = q.answers.find(a => a.isCorrect);
              const isCorrectQ = isExamSubmitted ? activeAnswers[q.id] === correctAns?.id : false;

              let cls = "bg-[var(--card-bg)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-neutral-400";
              if (isActive && !isExamSubmitted) cls = `${accentLight} ${accentBorder} text-[#1A1814] font-bold ring-2 ring-[#224334]/20`;
              else if (isExamSubmitted) cls = isCorrectQ ? "border-emerald-500 bg-emerald-500 text-white font-bold" : `${accentBg} text-white`;
              else if (isFlagged) cls = "border-amber-400 bg-amber-100 text-amber-700 font-bold";
              else if (isAnswered) cls = "border-neutral-800 bg-neutral-800 text-white";

              return (
                <button key={q.id} data-qidx={idx} onClick={() => onSelectQuestion(idx)}
                  className={cn("aspect-square rounded-xl border flex items-center justify-center font-mono text-xs transition-all cursor-pointer hover:scale-105 active:scale-95", cls)}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-neutral-100 grid grid-cols-2 gap-y-2 gap-x-3 text-[10px] text-neutral-500 font-sans">
          <Legend color="bg-[var(--card-bg)] border-[var(--border-default)]" label="Chưa làm" />
          <Legend color="bg-neutral-800" label="Đã chọn" />
          <Legend color="bg-amber-400" label="Cần xem lại" />
          <Legend color={cn("border", accentBorder, accentLight)} label="Đang xem" />
        </div>
        <div className="mt-5 pt-4 border-t border-neutral-100">
          {!isExamSubmitted ? (
            <button onClick={onSubmit}
              className={cn("w-full flex items-center justify-center gap-2 text-white py-3 rounded-xl font-sans font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer", accentBg)}
            >
              <CheckCircle className="w-5 h-5" /> Nộp bài
            </button>
          ) : (
            <button onClick={onResetSession} className="w-full flex items-center justify-center gap-2 bg-[#1A1814] hover:bg-neutral-800 text-white py-3 rounded-xl text-xs font-serif font-bold uppercase tracking-wider cursor-pointer transition-all">
              Quay lại
            </button>
          )}
        </div>
      </div>
      {!isExamSubmitted && (
        <div className="bg-[#FAF9F6] border border-neutral-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-[11px] font-sans font-bold uppercase tracking-wider text-neutral-500 mb-2">
            <BarChart3 className="w-3.5 h-3.5" /> Tiến độ
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, backgroundColor: isGreenTheme ? '#224334' : '#DC143C' }} />
            </div>
            <span className="text-xs font-mono font-bold text-[var(--text-secondary)] tabular-nums">{answeredCount}/{totalQuestions}</span>
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
