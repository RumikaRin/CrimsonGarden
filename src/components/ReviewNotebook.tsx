'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookOpenCheck, Check, RotateCcw, Target, X } from 'lucide-react';
import { motion } from 'motion/react';
import { buildLearningSummary, buildMistakeInsights } from '@/lib/learningInsights';
import { cn } from '@/lib/utils';
import { useExamStore } from '@/store/useExamStore';

export default function ReviewNotebook() {
  const router = useRouter();
  const { exams, attempts, currentUser, startExam } = useExamStore();
  const mistakes = React.useMemo(
    () => buildMistakeInsights(exams, attempts, currentUser?.id),
    [attempts, currentUser?.id, exams],
  );
  const summary = React.useMemo(
    () => buildLearningSummary(exams, attempts, currentUser?.id),
    [attempts, currentUser?.id, exams],
  );
  const [selectedKey, setSelectedKey] = React.useState<string | null>(null);

  const selected = mistakes.find(
    (item) => `${item.examId}:${item.question.id}` === selectedKey,
  ) ?? mistakes[0];

  const retryExam = (examId: string) => {
    startExam(examId);
    router.push('/quiz');
  };

  if (mistakes.length === 0) {
    return (
      <section className="max-w-4xl mx-auto min-h-[60dvh] flex items-center">
        <div className="w-full border-y border-[var(--border-default)] py-16 text-center">
          <BookOpenCheck className="w-10 h-10 mx-auto text-[var(--accent)]" />
          <h1 className="font-serif text-3xl font-bold mt-5 text-[#1A1814]">Sổ câu sai đang trống</h1>
          <p className="mt-3 text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            Hoàn thành một đề thi để hệ thống tự động gom câu sai và đề xuất nội dung cần ôn lại.
          </p>
          <button
            type="button"
            onClick={() => router.push('/quiz')}
            className="mt-7 min-h-11 px-5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold inline-flex items-center gap-2"
          >
            Làm đề đầu tiên <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header className="grid lg:grid-cols-12 gap-6 items-end border-b border-[var(--border-default)] pb-7">
        <div className="lg:col-span-8">
          <p className="text-xs font-mono text-[var(--accent)] mb-3">Ôn tập thích ứng</p>
          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[#1A1814] text-balance">
            Sổ câu sai của bạn
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-4 max-w-2xl leading-relaxed">
            Ưu tiên câu bị sai nhiều lần và xem lại lời giải trước khi làm lại đề.
          </p>
        </div>
        <div className="lg:col-span-4 grid grid-cols-3 divide-x divide-[var(--border-default)] border-y border-[var(--border-default)]">
          {[
            { label: 'Cần ôn', value: summary.mistakeCount },
            { label: 'Đã trả lời', value: summary.answered },
            { label: 'Độ chính xác', value: `${summary.accuracy}%` },
          ].map((metric) => (
            <div key={metric.label} className="py-4 px-3 text-center">
              <p className="font-mono text-lg font-bold text-[#1A1814]">{metric.value}</p>
              <p className="text-[10px] text-[var(--text-secondary)] mt-1">{metric.label}</p>
            </div>
          ))}
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <section className="lg:col-span-5 border-t border-[var(--border-default)]">
          {mistakes.map((item, index) => {
            const key = `${item.examId}:${item.question.id}`;
            const isSelected = selectedKey ? selectedKey === key : index === 0;
            return (
              <button
                type="button"
                key={key}
                onClick={() => setSelectedKey(key)}
                className={cn(
                  'w-full text-left py-5 border-b border-[var(--border-default)] grid grid-cols-[2.25rem_1fr_auto] gap-3 items-start',
                  isSelected ? 'text-[var(--accent)]' : 'text-[#1A1814] hover:text-[var(--accent)]',
                )}
              >
                <span className="font-mono text-xs text-[var(--text-muted)] pt-0.5">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>
                  <span className="block text-sm font-semibold leading-snug line-clamp-2">
                    {item.question.content}
                  </span>
                  <span className="block text-[10px] text-[var(--text-secondary)] mt-2 line-clamp-1">
                    {item.examTitle}
                  </span>
                </span>
                <span className="font-mono text-xs text-[var(--text-secondary)]">
                  {item.mistakeCount}x
                </span>
              </button>
            );
          })}
        </section>

        {selected && (
          <aside className="lg:col-span-7 lg:sticky lg:top-8 bg-[var(--card-bg)] border border-[var(--border-default)] rounded-2xl p-5 sm:p-7 shadow-[var(--card-shadow)]">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[10px] text-[var(--text-secondary)] font-mono">
                  Sai {selected.mistakeCount} lần · {new Date(selected.lastMissedAt).toLocaleDateString('vi-VN')}
                </p>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1814] mt-3 leading-snug">
                  {selected.question.content}
                </h2>
              </div>
              <Target className="w-6 h-6 text-[var(--accent)] shrink-0" />
            </div>

            <div className="mt-7 space-y-2">
              {selected.question.answers.map((answer) => {
                const wasSelected = answer.id === selected.selectedAnswerId;
                return (
                  <div
                    key={answer.id}
                    className={cn(
                      'min-h-12 px-4 py-3 rounded-xl border flex items-center gap-3 text-sm',
                      answer.isCorrect && 'border-emerald-300 bg-emerald-50 text-emerald-800',
                      wasSelected && !answer.isCorrect && 'border-red-200 bg-red-50 text-red-800',
                      !answer.isCorrect && !wasSelected && 'border-[var(--border-default)] text-[var(--text-secondary)]',
                    )}
                  >
                    {answer.isCorrect ? <Check className="w-4 h-4" /> : wasSelected ? <X className="w-4 h-4" /> : <span className="w-4" />}
                    <span>{answer.content}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-7 border-t border-[var(--border-default)] pt-5">
              <p className="text-[10px] font-mono text-[var(--accent)]">Lời giải cần nhớ</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                {selected.question.explanation || 'Câu hỏi này chưa có lời giải chi tiết.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => retryExam(selected.examId)}
              className="mt-7 min-h-11 px-5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Làm lại đề này
            </button>
          </aside>
        )}
      </div>
    </motion.div>
  );
}

