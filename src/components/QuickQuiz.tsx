'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, CheckSquare, Layers3, RotateCcw, Square, Trophy, X } from 'lucide-react';
import { useExamStore } from '@/store/useExamStore';
import { Question } from '@/types';
import { cn } from '@/lib/utils';

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

export default function QuickQuiz() {
  const router = useRouter();
  const { exams, addGameScore, currentUser } = useExamStore();
  const [selectedExamIds, setSelectedExamIds] = useState<string[]>(exams.slice(0, 1).map((exam) => exam.id));
  const [questionCount, setQuestionCount] = useState(5);
  const [round, setRound] = useState(0);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());

  const questionPool = useMemo(
    () => exams.filter((exam) => selectedExamIds.includes(exam.id)).flatMap((exam) => exam.questions),
    [exams, selectedExamIds],
  );
  const questions = useMemo(
    () => shuffle(questionPool).slice(0, Math.min(questionCount, questionPool.length)),
    [questionPool, questionCount, round],
  );
  const question: Question | undefined = questions[index];
  const correctAnswer = question?.answers.find((answer) => answer.isCorrect);

  const toggleExam = (examId: string) => {
    setSelectedExamIds((current) => current.includes(examId)
      ? current.filter((id) => id !== examId)
      : [...current, examId]);
  };

  const startQuiz = () => {
    if (questionPool.length === 0) return;
    setRound((value) => value + 1);
    setIndex(0);
    setScore(0);
    setSelectedId(null);
    setFinished(false);
    setStartedAt(Date.now());
    setStarted(true);
  };

  const chooseAnswer = (answerId: string) => {
    if (selectedId || !question) return;
    setSelectedId(answerId);
    if (answerId === correctAnswer?.id) setScore((value) => value + 20);
  };

  const nextQuestion = () => {
    if (index < questions.length - 1) {
      setIndex((value) => value + 1);
      setSelectedId(null);
      return;
    }
    addGameScore({
      id: `quick-quiz-${Date.now()}`,
      userId: currentUser?.id || 'guest',
      score,
      vocabularyCategory: 'Quiz nhanh',
      durationSeconds: Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
      playedAt: new Date().toISOString(),
    });
    setFinished(true);
  };

  if (!started) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="border-b border-[var(--border-default)] pb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">Tự tạo lượt chơi</p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">Trộn đề cho Quiz nhanh</h1>
          <p className="mt-3 max-w-2xl text-sm text-[var(--text-secondary)]">Chọn nhiều bộ đề để tạo một lượt quiz ngẫu nhiên. Mỗi câu đúng được 20 điểm thi đua.</p>
        </header>

        <section className="rounded-2xl border border-[var(--border-default)] bg-[var(--card-bg)] p-5 sm:p-7">
          <div className="flex flex-col items-start gap-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-[var(--text-primary)]">Chọn nguồn câu hỏi</h2>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">{selectedExamIds.length} đề · {questionPool.length} câu khả dụng</p>
            </div>
            <button type="button" onClick={() => setSelectedExamIds(selectedExamIds.length === exams.length ? [] : exams.map((exam) => exam.id))} className="min-h-11 rounded-xl border border-[var(--border-default)] px-3 text-xs font-semibold text-[var(--accent)]">
              {selectedExamIds.length === exams.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {exams.map((exam) => {
              const selected = selectedExamIds.includes(exam.id);
              return (
                <button type="button" key={exam.id} onClick={() => toggleExam(exam.id)} className={cn('flex gap-3 rounded-xl border p-4 text-left transition-all', selected ? 'border-[var(--accent)] bg-[var(--accent-light)]' : 'border-[var(--border-default)] hover:border-[var(--accent)]/40')}>
                  {selected ? <CheckSquare className="h-5 w-5 shrink-0 text-[var(--accent)]" /> : <Square className="h-5 w-5 shrink-0 text-[var(--text-secondary)]" />}
                  <span>
                    <span className="block text-sm font-semibold text-[var(--text-primary)]">{exam.title}</span>
                    <span className="mt-1 block text-[10px] text-[var(--text-secondary)]">{exam.questions.length} câu hỏi</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-[var(--border-default)] bg-[var(--card-bg)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-[var(--text-primary)]"><Layers3 className="h-5 w-5 text-[var(--accent)]" /> Số câu trong lượt</h2>
            <div className="mt-3 grid grid-cols-4 gap-2 sm:flex">
              {[5, 10, 15, 20].map((count) => (
                <button type="button" key={count} onClick={() => setQuestionCount(count)} className={cn('h-11 min-w-0 rounded-xl border text-xs font-bold sm:min-w-11', questionCount === count ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]' : 'border-[var(--border-default)] text-[var(--text-secondary)]')}>{count}</button>
              ))}
            </div>
          </div>
          <button type="button" disabled={questionPool.length === 0} onClick={startQuiz} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 text-xs font-bold uppercase tracking-wider text-[var(--accent-foreground)] disabled:opacity-40 sm:w-auto">
            Trộn và bắt đầu <ArrowRight className="h-4 w-4" />
          </button>
        </section>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-[var(--border-default)] bg-[var(--card-bg)] p-5 sm:p-10">
        <Trophy className="h-8 w-8 text-[var(--accent)]" />
        <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">Hoàn thành</p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">Bạn đạt {score} điểm</h1>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">Điểm đã được cộng vào thành tích game và điểm thi đua.</p>
        <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
          <button type="button" onClick={startQuiz} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 text-xs font-bold uppercase tracking-wider text-[var(--accent-foreground)] sm:w-auto"><RotateCcw className="h-4 w-4" /> Trộn lại</button>
          <button type="button" onClick={() => setStarted(false)} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-default)] px-5 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] sm:w-auto">Chọn đề khác</button>
          <button type="button" onClick={() => router.push('/leaderboard')} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-default)] px-5 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] sm:w-auto">Bảng xếp hạng <ArrowRight className="h-4 w-4" /></button>
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header className="flex items-end justify-between gap-3 border-b border-[var(--border-default)] pb-4 sm:pb-5">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">Mini game đã trộn đề</p><h1 className="mt-2 font-serif text-3xl font-bold text-[var(--text-primary)]">Quiz nhanh</h1></div>
        <div className="text-right"><p className="font-mono text-xl font-bold text-[var(--accent)]">{score}đ</p><p className="text-[10px] text-[var(--text-secondary)]">Câu {index + 1}/{questions.length}</p></div>
      </header>
      <div className="h-1 overflow-hidden rounded-full bg-[var(--accent-light)]"><div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div>
      <section className="rounded-2xl border border-[var(--border-default)] bg-[var(--card-bg)] p-5 sm:p-8 space-y-4">
        <h2 className="font-serif text-xl font-bold leading-relaxed text-[var(--text-primary)]">{question.content}</h2>
        
        {question.imageUrl && (
          <div className="overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--surface-soft)] flex items-center justify-center p-2 max-w-full sm:max-w-xl mx-auto shadow-sm">
            <img src={question.imageUrl} alt="Hình ảnh câu hỏi" className="max-h-[280px] object-contain w-full rounded-xl" />
          </div>
        )}

        {question.imageSvg && (
          <div className="overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--surface-soft)] p-4 flex items-center justify-center max-w-full sm:max-w-xl mx-auto shadow-sm">
            <div className="w-full h-auto text-neutral-800" dangerouslySetInnerHTML={{ __html: question.imageSvg }} />
          </div>
        )}

        <div className="mt-7 grid gap-3">
          {question.answers.map((answer) => {
            const isSelected = selectedId === answer.id;
            const showCorrect = selectedId && answer.isCorrect;
            const showWrong = isSelected && !answer.isCorrect;
            return <button type="button" key={answer.id} onClick={() => chooseAnswer(answer.id)} className={cn('flex min-h-14 items-center justify-between gap-3 rounded-xl border px-4 text-left text-sm font-medium transition-all', !selectedId && 'border-[var(--border-default)] hover:border-[var(--accent)]/50 hover:bg-[var(--accent-light)]', showCorrect && 'border-emerald-500 bg-emerald-50 text-emerald-800', showWrong && 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]', selectedId && !showCorrect && !showWrong && 'border-[var(--border-default)] opacity-55')}>{answer.content}{showCorrect && <Check className="h-4 w-4 shrink-0" />}{showWrong && <X className="h-4 w-4 shrink-0" />}</button>;
          })}
        </div>
        {selectedId && <div className="mt-6 border-t border-[var(--border-default)] pt-5"><p className="text-xs leading-5 text-[var(--text-secondary)]">{question.explanation || 'Ghi nhớ đáp án đúng và tiếp tục câu kế tiếp.'}</p><button type="button" onClick={nextQuestion} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 text-xs font-bold uppercase tracking-wider text-white sm:w-auto">{index === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'} <ArrowRight className="h-4 w-4" /></button></div>}
      </section>
    </div>
  );
}
