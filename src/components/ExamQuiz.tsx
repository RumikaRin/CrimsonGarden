'use client';

import React, { useEffect, useState } from 'react';
import { useExamStore } from '../store/useExamStore';
import { Exam, Answer } from '../types';
import { cn } from '../lib/utils';
import { useIsGreen } from '../lib/useThemeTokens';
import {
  Clock, CheckCircle, Play, HelpCircle,
  ChevronRight, ChevronLeft, Bookmark, Award, Check, X, ListChecks, Settings
} from 'lucide-react';
import { ExamSettings } from './exam/ExamSettings';
import { QuestionGrid } from './exam/QuestionGrid';
import { ResultSummary } from './exam/ResultSummary';
import { playSound } from '../lib/snakeSound';

export default function ExamQuiz() {
  const {
    theme, exams, activeExamId, activeAnswers, currentQuestionIndex, timeRemaining,
    isExamActive, isExamSubmitted, examMode, setExamMode, autoAdvance, setAutoAdvance,
    showExplanation, setShowExplanation, soundEnabled, setSoundEnabled,
    shuffleQuestions, setShuffleQuestions, shuffleAnswers, setShuffleAnswers, timerMode, setTimerMode, shuffledExam,
    isExamsFetched, fetchCloudExams,
    startExam, selectAnswer, setCurrentQuestionIndex, decrementTime, submitExam, retryIncorrectQuestions, resetExamSession, currentUser
  } = useExamStore();

  React.useEffect(() => {
    if (!isExamsFetched) {
      fetchCloudExams();
    }
  }, [isExamsFetched, fetchCloudExams]);

  const isGreenTheme = useIsGreen();
  const [markedQuestions, setMarkedQuestions] = React.useState<Record<string, boolean>>({});
  const [showGrid, setShowGrid] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const gridContainerRef = React.useRef<HTMLDivElement>(null);

  const activeExam = React.useMemo(() => {
    let exam = shuffledExam || exams.find(e => e.id === activeExamId) || null;
    if (exam && exams.length > 0) {
      const originalExam = exams.find(e => e.id === exam?.id);
      if (originalExam) {
        const restoredQuestions = exam.questions.map(q => {
          if (!q.imageUrl && !q.imageSvg) {
            const origQ = originalExam.questions.find(oq => oq.id === q.id);
            if (origQ) {
              return {
                ...q,
                imageUrl: origQ.imageUrl,
                imageSvg: origQ.imageSvg
              };
            }
          }
          return q;
        });
        return {
          ...exam,
          questions: restoredQuestions
        };
      }
    }
    return exam;
  }, [shuffledExam, exams, activeExamId]);
  const accentColor = 'var(--accent)';
  const accentBg = 'bg-[var(--accent)]';
  const accentText = 'text-[var(--accent)]';
  const accentBorder = 'border-[var(--accent)]';
  const accentLight = 'bg-[var(--accent)]/[0.15]';

  // Auto-scroll grid
  React.useEffect(() => {
    if (!gridContainerRef.current || !activeExam) return;
    const activeBtn = gridContainerRef.current.querySelector(`[data-qidx="${currentQuestionIndex}"]`);
    if (activeBtn) activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [currentQuestionIndex, activeExam]);

  // Timer
  useEffect(() => {
    let tInterval: number | null = null;
    if (isExamActive && !isExamSubmitted) {
      tInterval = window.setInterval(() => decrementTime(), 1000);
    }
    return () => { if (tInterval) window.clearInterval(tInterval); };
  }, [isExamActive, isExamSubmitted, decrementTime]);

  // Tick sound when time is low (under 10 seconds)
  useEffect(() => {
    if (isExamActive && !isExamSubmitted && timeRemaining <= 10 && timeRemaining > 0 && soundEnabled) {
      playSound('tick');
    }
  }, [timeRemaining, isExamActive, isExamSubmitted, soundEnabled]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!activeExam || isExamSubmitted) return;
    const handleKey = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement) return;
      const q = activeExam.questions[currentQuestionIndex];
      if (!q) return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= q.answers.length) { e.preventDefault(); selectAnswer(q.id, q.answers[num - 1].id); return; }
      if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) { e.preventDefault(); setCurrentQuestionIndex(currentQuestionIndex - 1); }
      if (e.key === 'ArrowRight' && currentQuestionIndex < activeExam.questions.length - 1) { e.preventDefault(); setCurrentQuestionIndex(currentQuestionIndex + 1); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeExam, currentQuestionIndex, isExamSubmitted, activeAnswers, selectAnswer, setCurrentQuestionIndex]);

  const handleStartExam = (examId: string) => {
    startExam(examId);
    setMarkedQuestions({});
    setShowGrid(false);
    setShowSettings(false);
    setShowExitModal(false);
  };
  const handleRetryIncorrect = () => {
    retryIncorrectQuestions();
    setMarkedQuestions({});
  };
  const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  const toggleMarked = (questionId: string) => setMarkedQuestions(prev => ({ ...prev, [questionId]: !prev[questionId] }));

  const calculateSummary = () => {
    if (!activeExam) return { correctCount: 0, totalCount: 0, percentage: 0 };
    let correct = 0;
    activeExam.questions.forEach(q => {
      const chosenId = activeAnswers[q.id];
      const correctAns = q.answers.find(a => a.isCorrect);
      if (chosenId && correctAns && chosenId === correctAns.id) correct++;
    });
    const total = activeExam.questions.length;
    return { correctCount: correct, totalCount: total, percentage: total > 0 ? Math.round((correct / total) * 100) : 0 };
  };

  const summary = calculateSummary();
  const answeredCount = activeExam ? Object.keys(activeAnswers).length : 0;
  const totalQuestions = activeExam?.questions.length ?? 0;
  const progressPct = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  const reviewCount = activeExam
    ? activeExam.questions.filter((question) => {
        const selectedAnswerId = activeAnswers[question.id];
        const selectedAnswer = question.answers.find((answer) => answer.id === selectedAnswerId);
        return !selectedAnswer?.isCorrect;
      }).length
    : 0;
  const hasIncorrectAnswers = activeExam
    ? activeExam.questions.some((question) => {
        const selectedAnswerId = activeAnswers[question.id];
        const selectedAnswer = question.answers.find((answer) => answer.id === selectedAnswerId);
        return !!selectedAnswer && !selectedAnswer.isCorrect;
      })
    : false;
  const showSubmitAction = !isExamSubmitted;
  const showRetryAction = examMode === 'practice' && hasIncorrectAnswers && reviewCount > 0;
  const showMobileAction = showSubmitAction || showRetryAction;

  if (!activeExamId) {
    return (
      <div className="w-full max-w-[1280px] mx-auto space-y-8 relative">
        <div className="relative z-10 flex justify-end md:absolute md:right-0 md:top-0">
          <ExamSettings
            theme={theme} examMode={examMode} autoAdvance={autoAdvance}
            showExplanation={showExplanation} soundEnabled={soundEnabled}
            shuffleQuestions={shuffleQuestions} shuffleAnswers={shuffleAnswers} timerMode={timerMode}
            showSettings={showSettings} onToggleSettings={() => setShowSettings(!showSettings)}
            onSetExamMode={setExamMode} onSetAutoAdvance={setAutoAdvance}
            onSetShowExplanation={setShowExplanation} onSetSoundEnabled={setSoundEnabled}
            onSetShuffleQuestions={setShuffleQuestions} onSetShuffleAnswers={setShuffleAnswers}
            onSetTimerMode={setTimerMode}
          />
        </div>
        <div className="text-center space-y-3 pt-0 md:pt-4">
          <span className={cn("text-[11px] font-sans font-bold tracking-[0.2em] uppercase", accentText)}>BẮT ĐẦU ÔN TẬP</span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[var(--text-primary)] tracking-tight">Chọn Đề Thi</h2>
          <p className="text-sm text-[var(--text-secondary)] font-sans max-w-lg mx-auto leading-relaxed">
            Mỗi đề thi được tự động bóc tách từ tài liệu bạn upload. Hoàn thành bài thi để nhận kết quả chi tiết.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {exams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} accentBg={accentBg} accentText={accentText} accentLight={accentLight} isGreenTheme={true} onStart={handleStartExam} />
          ))}
        </div>
      </div>
    );
  }

  if (!activeExam) return null;

  return (
    <div className={cn(
      "grid grid-cols-1 xl:grid-cols-[240px_minmax(0,1fr)_360px] 2xl:grid-cols-[260px_minmax(0,1fr)_400px] w-full min-h-[100dvh] xl:h-[100dvh] gap-3 sm:gap-4 2xl:gap-5 bg-[var(--page-bg)] p-2 sm:px-4 sm:pt-4 xl:p-4 text-[var(--text-primary)] xl:overflow-hidden",
      showMobileAction ? "pb-[calc(9.25rem+env(safe-area-inset-bottom))]" : "pb-[calc(5.5rem+env(safe-area-inset-bottom))]",
      showGrid || showSettings || showExitModal ? "overflow-hidden" : "overflow-y-auto"
    )}>

      <section className="order-1 xl:hidden sticky top-2 z-30 grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 rounded-2xl border border-[var(--border-default)] bg-[var(--card-bg)] p-2 shadow-[var(--card-shadow)]">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">{activeExam.title}</p>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--surface-soft)]">
            <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
        <div className="rounded-xl bg-[var(--surface-soft)] px-2.5 py-2 text-center">
          <span className={cn("block font-mono text-sm font-bold tabular-nums", timeRemaining !== -1 && timeRemaining < 60 ? "text-red-500" : "text-[var(--accent)]")}>
            {timeRemaining === -1 ? '∞' : formatTime(timeRemaining)}
          </span>
          <span className="block text-[7px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">thời gian</span>
        </div>
        <button type="button" onClick={() => setShowGrid(true)} aria-label="Mở danh sách câu hỏi" className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-light)] text-[var(--accent)]">
          <ListChecks className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => setShowSettings(true)} aria-label="Mở tùy chọn làm bài" className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border-default)] text-[var(--text-secondary)]">
          <Settings className="h-4 w-4" />
        </button>
      </section>

      {isExamSubmitted && (
        <section className="order-2 xl:hidden rounded-2xl border border-[var(--border-default)] bg-[var(--card-bg)] p-4 shadow-[var(--card-shadow)]">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] shadow-sm">
              <span className="font-mono text-2xl font-bold tabular-nums">{summary.percentage}%</span>
              <span className="text-[8px] font-bold uppercase tracking-wider">chính xác</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
                <Award className="h-3.5 w-3.5" /> Kết quả bài làm
              </div>
              <h2 className="mt-1 font-serif text-lg font-bold text-[var(--text-primary)]">Đã hoàn thành</h2>
              <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                Trả lời đúng <strong className="text-[var(--text-primary)]">{summary.correctCount}/{summary.totalCount}</strong> câu. Chạm danh sách câu hỏi để xem lại chi tiết.
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[var(--border-default)] pt-3">
            <button type="button" onClick={resetExamSession} className="min-h-11 rounded-xl border border-[var(--border-default)] bg-[var(--surface-soft)] px-3 text-xs font-bold text-[var(--text-primary)] transition-all active:scale-[0.99]">
              Chọn đề khác
            </button>
            <button type="button" onClick={() => handleStartExam(activeExam.id)} className="min-h-11 rounded-xl bg-[var(--accent)] px-3 text-xs font-bold text-[var(--accent-foreground)] shadow-sm transition-all active:scale-[0.99]">
              Làm lại đề
            </button>
          </div>
        </section>
      )}

      {/* Left Column (Info & Settings) */}
      <aside className="order-3 hidden xl:order-1 xl:flex flex-col gap-3 min-w-0 xl:overflow-y-auto xl:pr-1 custom-scrollbar xl:max-h-full">
        <div className="bg-[var(--card-bg)] border border-[var(--border-default)] rounded-2xl p-4 shadow-[var(--card-shadow)] flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-serif font-bold text-[var(--text-primary)] leading-snug">{activeExam.title}</h3>
            <div className={cn("px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider whitespace-nowrap", examMode === 'exam' ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500")}>
              {examMode === 'exam' ? 'Thi thật' : 'Ôn thi'}
            </div>
          </div>

          <div className="hidden xl:flex bg-[var(--surface-soft)] rounded-xl p-4 flex-col items-center justify-center gap-1 border border-[var(--border-default)]">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[var(--text-secondary)]">Thời gian làm bài</span>
            <span className={cn("font-mono text-2xl md:text-3xl font-bold tabular-nums", timeRemaining !== -1 && timeRemaining < 60 ? "text-red-500 animate-pulse" : "text-[var(--accent)]")}>
              {timeRemaining === -1 ? '∞' : formatTime(timeRemaining)}
            </span>
          </div>

          <div className="space-y-3 pt-2 border-t border-[var(--border-default)]">
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <span className="text-xs font-sans font-medium text-[var(--text-primary)]">Tự động chuyển câu</span>
              <button onClick={() => setAutoAdvance(!autoAdvance)} className={cn("w-8 h-4 rounded-full transition-all relative", autoAdvance ? "bg-[var(--accent)]" : "bg-[var(--surface-soft)] ring-1 ring-inset ring-[var(--border-default)]")}>
                <div className={cn("absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all", autoAdvance ? "right-0.5" : "left-0.5")} />
              </button>
            </label>
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <span className="text-xs font-sans font-medium text-[var(--text-primary)]">Hiển thị giải thích</span>
              <button onClick={() => setShowExplanation(!showExplanation)} className={cn("w-8 h-4 rounded-full transition-all relative", showExplanation ? "bg-[var(--accent)]" : "bg-[var(--surface-soft)] ring-1 ring-inset ring-[var(--border-default)]")}>
                <div className={cn("absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all", showExplanation ? "right-0.5" : "left-0.5")} />
              </button>
            </label>
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <span className="text-xs font-sans font-medium text-[var(--text-primary)]">Âm thanh</span>
              <button onClick={() => setSoundEnabled(!soundEnabled)} className={cn("w-8 h-4 rounded-full transition-all relative", soundEnabled ? "bg-[var(--accent)]" : "bg-[var(--surface-soft)] ring-1 ring-inset ring-[var(--border-default)]")}>
                <div className={cn("absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all", soundEnabled ? "right-0.5" : "left-0.5")} />
              </button>
            </label>
          </div>

          <div className="pt-2 border-t border-[var(--border-default)] flex gap-2">
            <button onClick={() => setShowExitModal(true)}
              className="flex-1 px-3 py-2 rounded-xl text-[10px] font-serif font-bold uppercase tracking-wider transition-all bg-[var(--surface-soft)] text-red-500 hover:bg-red-500 hover:text-white border border-[var(--border-default)] hover:border-red-500"
            >
              Trở về
            </button>
            {isExamSubmitted && (
              <button onClick={() => handleStartExam(activeExam.id)}
                className="flex-1 px-3 py-2 rounded-xl text-[10px] font-serif font-bold uppercase tracking-wider transition-all bg-[var(--accent)] text-[var(--accent-foreground)] hover:opacity-90 shadow-sm"
              >
                Làm lại
              </button>
            )}
          </div>
        </div>

        {isExamSubmitted && (
          <ResultSummary
            isGreenTheme={true} correctCount={summary.correctCount} totalCount={summary.totalCount}
            percentage={summary.percentage} accentBg={accentBg} accentText={accentText}
            accentBorder={accentBorder} accentLight={accentLight}
            onReset={resetExamSession} onRetry={() => handleStartExam(activeExam.id)}
          />
        )}
      </aside>

      {/* Center Column (Question) */}
      <main className="order-3 xl:order-2 min-w-0 flex flex-col min-h-0 relative">
        <div className="flex-1 overflow-y-auto xl:pr-1 custom-scrollbar">
          <QuestionCard
            activeExam={activeExam} currentQuestionIndex={currentQuestionIndex}
            activeAnswers={activeAnswers} isExamSubmitted={isExamSubmitted}
            isGreenTheme={true} examMode={examMode} showExplanation={showExplanation}
            markedQuestions={markedQuestions} showFeedback={false}
            totalQuestions={totalQuestions} accentText={accentText}
            onSelectAnswer={selectAnswer} onToggleMarked={toggleMarked}
            onGoNext={() => currentQuestionIndex < activeExam.questions.length - 1 && setCurrentQuestionIndex(currentQuestionIndex + 1)}
            onGoPrev={() => currentQuestionIndex > 0 && setCurrentQuestionIndex(currentQuestionIndex - 1)}
            autoAdvance={autoAdvance} setCurrentQuestionIndex={setCurrentQuestionIndex}
          />
        </div>
      </main>

      <nav aria-label="Điều hướng câu hỏi" className="fixed bottom-[max(0.5rem,env(safe-area-inset-bottom))] left-2 right-2 z-40 flex flex-col gap-2 rounded-2xl border border-[var(--border-default)] bg-[var(--card-bg)] p-2 shadow-2xl xl:hidden">
        {showMobileAction && (
          <div className={cn("grid gap-2", showSubmitAction && showRetryAction ? "grid-cols-2" : "grid-cols-1")}>
            {showRetryAction && (
              <button
                type="button"
                onClick={handleRetryIncorrect}
                className="flex min-h-11 w-full items-center justify-center rounded-xl bg-red-600 px-3 text-[11px] font-serif font-bold uppercase tracking-wide text-white shadow-sm transition-all active:scale-[0.99] active:bg-red-700"
              >
                Làm lại câu sai
              </button>
            )}
            {showSubmitAction && (
              <button
                type="button"
                onClick={() => submitExam(currentUser?.id)}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-sm font-bold text-[var(--accent-foreground)] shadow-sm transition-all active:scale-[0.99]"
              >
                <CheckCircle className="h-4 w-4" /> Nộp bài
              </button>
            )}
          </div>
        )}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <button
            type="button"
            disabled={currentQuestionIndex === 0}
            onClick={() => currentQuestionIndex > 0 && setCurrentQuestionIndex(currentQuestionIndex - 1)}
            className="flex min-h-11 items-center justify-center gap-1 rounded-xl border border-[var(--border-default)] px-3 text-xs font-serif font-bold uppercase tracking-wider text-[var(--text-secondary)] transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" /> Trước
          </button>
          <button type="button" onClick={() => setShowGrid(true)} className="min-w-14 rounded-xl px-2 py-1 text-center transition-colors active:bg-[var(--surface-soft)]">
            <span className="block font-mono text-sm font-bold tabular-nums text-[var(--text-primary)]">{currentQuestionIndex + 1}/{totalQuestions}</span>
            <span className="block text-[7px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">câu hỏi</span>
          </button>
          <button
            type="button"
            disabled={currentQuestionIndex === activeExam.questions.length - 1}
            onClick={() => currentQuestionIndex < activeExam.questions.length - 1 && setCurrentQuestionIndex(currentQuestionIndex + 1)}
            className="flex min-h-11 items-center justify-center gap-1 rounded-xl bg-[var(--accent)] px-3 text-xs font-serif font-bold uppercase tracking-wider text-[var(--accent-foreground)] transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30"
          >
            Sau <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </nav>

      {/* Right Column (Question Grid) */}
      <aside className="order-4 hidden min-w-0 xl:order-3 xl:flex xl:h-full xl:min-h-0 flex-col bg-[var(--card-bg)] border border-[var(--border-default)] rounded-2xl shadow-[var(--card-shadow)] overflow-hidden">
        <QuestionGrid
          activeExam={activeExam} activeAnswers={activeAnswers}
          currentQuestionIndex={currentQuestionIndex} isExamSubmitted={isExamSubmitted}
          markedQuestions={markedQuestions} isGreenTheme={true} examMode={examMode}
          answeredCount={answeredCount} reviewCount={reviewCount} hasIncorrectAnswers={hasIncorrectAnswers} totalQuestions={totalQuestions}
          progressPct={progressPct} gridContainerRef={gridContainerRef}
          onSelectQuestion={setCurrentQuestionIndex}
          onSubmit={() => submitExam(currentUser?.id)}
          onRetryIncorrect={handleRetryIncorrect}
          onResetSession={resetExamSession}
        />
      </aside>

      {showSettings && (
        <div className="xl:hidden fixed inset-0 z-50 flex items-end bg-black/55 p-2 backdrop-blur-[2px]" onClick={() => setShowSettings(false)}>
          <section role="dialog" aria-modal="true" aria-label="Tùy chọn làm bài" className="w-full rounded-2xl border border-[var(--border-default)] bg-[var(--card-bg)] p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Tùy chọn làm bài</p>
                <h3 className="mt-1 truncate font-serif text-base font-bold text-[var(--text-primary)]">{activeExam.title}</h3>
              </div>
              <button type="button" onClick={() => setShowSettings(false)} aria-label="Đóng tùy chọn" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border-default)] text-[var(--text-secondary)]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 border-y border-[var(--border-default)] py-4">
              <MobileToggle label="Tự động chuyển câu" value={autoAdvance} onChange={() => setAutoAdvance(!autoAdvance)} />
              <MobileToggle label="Hiển thị giải thích" value={showExplanation} onChange={() => setShowExplanation(!showExplanation)} />
              <MobileToggle label="Âm thanh" value={soundEnabled} onChange={() => setSoundEnabled(!soundEnabled)} />
            </div>
            <button type="button" onClick={() => { setShowSettings(false); setShowExitModal(true); }} className="mt-4 flex min-h-11 w-full items-center justify-center rounded-xl bg-red-500/10 text-xs font-bold uppercase tracking-wider text-red-500">
              Thoát bài
            </button>
          </section>
        </div>
      )}

      {showGrid && (
        <div className="xl:hidden fixed inset-0 z-50 flex items-end bg-black/55 p-2 backdrop-blur-[2px]" onClick={() => setShowGrid(false)}>
          <section role="dialog" aria-modal="true" aria-label="Danh sách câu hỏi" className="flex h-[82dvh] w-full flex-col overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--card-bg)] shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex shrink-0 items-center justify-between border-b border-[var(--border-default)] p-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Danh sách câu hỏi</p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">{answeredCount}/{totalQuestions} câu đã trả lời</p>
              </div>
              <button type="button" onClick={() => setShowGrid(false)} aria-label="Đóng danh sách câu hỏi" className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-default)] text-[var(--text-secondary)]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <QuestionGrid
                activeExam={activeExam} activeAnswers={activeAnswers}
                currentQuestionIndex={currentQuestionIndex} isExamSubmitted={isExamSubmitted}
                markedQuestions={markedQuestions} isGreenTheme={true} examMode={examMode}
                answeredCount={answeredCount} reviewCount={reviewCount} hasIncorrectAnswers={hasIncorrectAnswers} totalQuestions={totalQuestions}
                progressPct={progressPct} gridContainerRef={gridContainerRef} compact
                onSelectQuestion={(index) => { setCurrentQuestionIndex(index); setShowGrid(false); }}
                onSubmit={() => { submitExam(currentUser?.id); setShowGrid(false); }}
                onRetryIncorrect={() => { handleRetryIncorrect(); setShowGrid(false); }}
                onResetSession={() => { resetExamSession(); setShowGrid(false); }}
              />
            </div>
          </section>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--card-bg)] border-2 border-red-500/30 w-full max-w-sm rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
            <h3 className="text-xl font-serif font-bold text-[var(--text-primary)] mb-2">Xác nhận thoát bài</h3>
            <p className="text-sm font-sans text-[var(--text-secondary)] mb-6">Bạn có chắc muốn thoát bài thi không? Toàn bộ quá trình làm bài sẽ không được lưu.</p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--border-default)] text-[var(--text-primary)] font-semibold text-sm hover:bg-[var(--surface-soft)] transition-colors"
              >
                Trở lại bài thi
              </button>
              <button
                onClick={() => { setShowExitModal(false); resetExamSession(); }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm shadow-sm transition-colors"
              >
                Thoát luôn
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function MobileToggle({ label, value, onChange }: { label: string; value: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange} className="flex min-h-11 w-full items-center justify-between gap-3 text-left">
      <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
      <span className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", value ? "bg-[var(--accent)]" : "bg-[var(--surface-soft)] ring-1 ring-inset ring-[var(--border-default)]")}>
        <span className={cn("absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all", value ? "right-1" : "left-1")} />
      </span>
    </button>
  );
}

interface ExamCardProps {
  exam: Exam;
  accentBg: string;
  accentText: string;
  accentLight: string;
  isGreenTheme?: boolean;
  onStart: (examId: string) => void;
}

function ExamCard({ exam, accentBg, accentText, accentLight, onStart }: ExamCardProps) {
  return (
    <div className={cn("group relative p-4 sm:p-6 transition-all duration-300 cursor-pointer card-layered",
      "hover:-translate-y-0.5 active:translate-y-0"
    )} onClick={() => onStart(exam.id)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", accentBg)} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">Trắc nghiệm</span>
          </div>
          <h3 className={cn("font-serif text-lg font-bold text-[var(--text-primary)] transition-colors leading-snug line-clamp-2",
            "group-hover:text-[var(--accent)]"
          )}>{exam.title}</h3>
          <p className="text-xs text-[var(--text-secondary)] font-sans line-clamp-2 leading-relaxed">{exam.description || 'Đề trắc nghiệm kiểm tra trình độ.'}</p>
        </div>
        <div className={cn("shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300", accentLight, "group-hover:scale-110 group-hover:shadow-md")}>
          <Play className={cn("w-5 h-5 ml-0.5", accentText)} />
        </div>
      </div>
      <div className="mt-5 pt-4 border-t border-[var(--border-default)] flex flex-col gap-3 min-[390px]:flex-row min-[390px]:items-center min-[390px]:justify-between">
        <div className="flex gap-4 text-xs font-mono text-[var(--text-secondary)]">
          <span className="flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5" /> {exam.questions.length} câu</span>
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {exam.duration} phút</span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onStart(exam.id); }}
          className={cn("flex min-h-11 w-full items-center justify-center gap-1 text-white px-4 py-2 rounded-xl text-xs font-serif font-bold uppercase tracking-wider transition-all min-[390px]:w-auto", accentBg)}
        >Làm bài <ChevronRight className="w-3 h-3" /></button>
      </div>
    </div>
  );
}

interface QuestionCardProps {
  activeExam: Exam;
  currentQuestionIndex: number;
  activeAnswers: Record<string, string>;
  isExamSubmitted: boolean;
  isGreenTheme: boolean;
  examMode: 'exam' | 'practice';
  showExplanation: boolean;
  markedQuestions: Record<string, boolean>;
  showFeedback?: boolean;
  totalQuestions: number;
  accentText: string;
  onSelectAnswer: (questionId: string, answerId: string) => void;
  onToggleMarked: (questionId: string) => void;
  onGoNext: () => void;
  onGoPrev: () => void;
  autoAdvance: boolean;
  setCurrentQuestionIndex: (index: number) => void;
}

function QuestionCard({ activeExam, currentQuestionIndex, activeAnswers, isExamSubmitted, isGreenTheme, examMode, showExplanation, markedQuestions, totalQuestions, accentText, onSelectAnswer, onToggleMarked, onGoNext, onGoPrev, autoAdvance, setCurrentQuestionIndex }: QuestionCardProps) {
  const q = activeExam.questions[currentQuestionIndex];
  if (!q) return null;
  const originalQuestionNumber = q.order > 0 ? q.order : currentQuestionIndex + 1;
  const isReviewSession = activeExam.title.includes('· Làm lại câu sai');

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-default)] rounded-2xl shadow-[var(--card-shadow)] overflow-hidden animate-fade-in flex-1">
      <div className="px-4 pt-4 pb-3 border-b border-[var(--border-default)] flex items-center justify-between gap-3 sm:px-6 sm:pt-6 sm:pb-4">
        <div className="flex items-center gap-3">
          <span className={cn("w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-sm",
            "bg-[var(--accent-light)] text-[var(--accent)]"
          )}>{originalQuestionNumber}</span>
          <div>
            <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              {isReviewSession
                ? `Câu gốc ${originalQuestionNumber} · lượt ôn ${currentQuestionIndex + 1}/${totalQuestions}`
                : `Câu hỏi ${currentQuestionIndex + 1}/${totalQuestions}`}
            </span>
            {q.points && <span className="text-[10px] text-neutral-300 font-sans">{q.points} điểm</span>}
          </div>
        </div>
        {!isExamSubmitted && (
          <button onClick={() => onToggleMarked(q.id)}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-serif font-bold uppercase tracking-wider transition-all cursor-pointer",
              markedQuestions[q.id] ? "bg-amber-100 text-amber-700 shadow-sm" : "text-neutral-400 hover:text-[var(--text-secondary)] hover:bg-neutral-100"
            )}
          >
            <Bookmark className={cn("w-3.5 h-3.5", markedQuestions[q.id] ? "fill-amber-500" : "")} />
            Xem lại
          </button>
        )}
      </div>

      <div className="px-4 py-4 sm:px-6 sm:py-5 space-y-4">
        <h4 className="text-[var(--text-primary)] text-base sm:text-lg font-sans font-bold leading-relaxed">{q.content}</h4>
        
        {q.imageUrl && (
          <div className="overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--surface-soft)] flex items-center justify-center p-2 max-w-full sm:max-w-xl mx-auto shadow-sm">
            <img src={q.imageUrl} alt="Hình ảnh câu hỏi" className="max-h-[320px] object-contain w-full rounded-xl" />
          </div>
        )}

        {q.imageSvg && (
          <div className="overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--surface-soft)] p-4 flex items-center justify-center max-w-full sm:max-w-xl mx-auto shadow-sm">
            <div className="w-full h-auto text-neutral-800" dangerouslySetInnerHTML={{ __html: q.imageSvg }} />
          </div>
        )}
      </div>

      <div className="px-4 pb-2 space-y-2.5 sm:px-6">
        {q.answers.map((answer: Answer, oIdx: number) => {
          const optionLetter = String.fromCharCode(65 + oIdx);
          const qId = q.id;
          const isSelected = activeAnswers[qId] === answer.id;
          const isCorrect = answer.isCorrect;
          const practiceFeedbackOn = !isExamSubmitted && examMode === 'practice' && !!activeAnswers[qId];

          let optStyle = "border-[var(--border-default)] bg-[var(--card-bg)] hover:border-[var(--accent)] hover:shadow-sm";
          let prefixStyle = "bg-[var(--surface-soft)] text-[var(--text-secondary)]";
          let textStyle = "text-[var(--text-primary)]";

          if (practiceFeedbackOn) {
            if (isCorrect) {
              optStyle = "border-emerald-500 bg-emerald-50/80 ring-1 ring-emerald-500/30";
              prefixStyle = "bg-emerald-500 text-white";
              textStyle = "text-[#1A1814]";
            } else if (isSelected) {
              optStyle = "border-red-400 bg-red-50/80 ring-1 ring-red-400/30";
              prefixStyle = "bg-red-500 text-white";
              textStyle = "text-[#1A1814]";
            } else {
              optStyle = "border-[var(--border-default)] bg-[var(--card-bg)] opacity-55";
            }
          } else if (isExamSubmitted) {
            if (isCorrect) { optStyle = "border-emerald-500 bg-emerald-50/80 ring-1 ring-emerald-500/30"; prefixStyle = "bg-emerald-500 text-white"; textStyle = "text-[#1A1814]"; }
            else if (isSelected && !isCorrect) { optStyle = "bg-red-50/80 ring-1 ring-red-400/30 text-red-500"; prefixStyle = "bg-red-500 text-white"; textStyle = "text-[#1A1814]"; }
          } else if (isSelected) {
            optStyle = "bg-[var(--accent-light)] text-[var(--accent)]";
            prefixStyle = "bg-[var(--accent)] text-white";
          }

          const isDisabled = isExamSubmitted || practiceFeedbackOn;
          return (
            <button key={answer.id} disabled={isDisabled}
              onClick={() => {
                onSelectAnswer(qId, answer.id);
                if (activeExam && examMode === 'practice' && autoAdvance) {
                  setTimeout(() => {
                    if (currentQuestionIndex < activeExam.questions.length - 1) setCurrentQuestionIndex(currentQuestionIndex + 1);
                  }, 2000);
                }
              }}
              className={cn("w-full text-left p-3.5 sm:p-4 rounded-xl border flex items-center justify-between gap-3 transition-all duration-150 cursor-pointer group", optStyle)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={cn("w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-all", prefixStyle)}>
                  {optionLetter}
                </span>
                <span className={cn("text-sm font-sans leading-relaxed font-medium", textStyle)}>{answer.content}</span>
              </div>
              {practiceFeedbackOn && isCorrect && <Check className="w-5 h-5 text-emerald-500 shrink-0" />}
              {practiceFeedbackOn && isSelected && !isCorrect && <X className="w-5 h-5 text-red-500 shrink-0" />}
              {isExamSubmitted && isCorrect && <Check className="w-5 h-5 text-emerald-500 shrink-0" />}
              {isExamSubmitted && isSelected && !isCorrect && <X className={cn("w-5 h-5 shrink-0", accentText)} />}
            </button>
          );
        })}
      </div>

      {(isExamSubmitted || (examMode === 'practice' && showExplanation && !!activeAnswers[q.id])) && q.explanation && (
        <div className="mx-4 mb-4 p-4 rounded-xl bg-[var(--accent-light)]/10 border border-[var(--accent)]/20 space-y-1.5 sm:mx-6">
          <span className={cn("text-[10px] font-serif font-bold uppercase tracking-wider", "text-[var(--accent)]")}>Giải thích</span>
          <p className="text-sm text-[var(--text-primary)] font-sans leading-relaxed">{q.explanation}</p>
        </div>
      )}

      <div className="hidden border-t border-[var(--border-default)] bg-[var(--surface-soft)] px-6 py-4 items-center justify-between gap-3 xl:flex">
        <button disabled={currentQuestionIndex === 0} onClick={onGoPrev}
          className="flex min-h-11 flex-1 items-center justify-center gap-1.5 border border-[var(--border-default)] hover:bg-[var(--surface-soft)] disabled:opacity-30 disabled:cursor-not-allowed text-[var(--text-secondary)] px-3 py-2 rounded-xl text-xs font-serif font-bold uppercase tracking-wider cursor-pointer transition-all sm:flex-none sm:px-4"
        ><ChevronLeft className="w-4 h-4" /> Trước</button>
        <div className="hidden sm:flex items-center gap-1 text-[10px] text-[var(--text-secondary)] font-sans">
          <kbd className="px-1.5 py-0.5 bg-[var(--surface-soft)] rounded text-[10px] font-mono border border-[var(--border-default)]">←</kbd>
          <span className="mx-1">/</span>
          <kbd className="px-1.5 py-0.5 bg-[var(--surface-soft)] rounded text-[10px] font-mono border border-[var(--border-default)]">→</kbd>
          <span className="ml-1">điều hướng · </span>
          <kbd className="px-1.5 py-0.5 bg-[var(--surface-soft)] rounded text-[10px] font-mono border border-[var(--border-default)]">1-4</kbd>
          <span className="ml-1">chọn đáp án</span>
        </div>
        <button disabled={currentQuestionIndex === activeExam.questions.length - 1} onClick={onGoNext}
          className="flex min-h-11 flex-1 items-center justify-center gap-1.5 border border-[var(--border-default)] hover:bg-[var(--surface-soft)] disabled:opacity-30 disabled:cursor-not-allowed text-[var(--text-secondary)] px-3 py-2 rounded-xl text-xs font-serif font-bold uppercase tracking-wider cursor-pointer transition-all sm:flex-none sm:px-4"
        >Sau <ChevronRight className="w-4 h-4" /></button>
      </div>
    </div>
  );
}
