'use client';

import React, { useEffect } from 'react';
import { useExamStore } from '../store/useExamStore';
import { Exam, Answer } from '../types';
import { cn } from '../lib/utils';
import { useIsGreen } from '../lib/useThemeTokens';
import {
  Clock, CheckCircle, Play, HelpCircle,
  ChevronRight, ChevronLeft, Bookmark, Award, Check, X, ListChecks
} from 'lucide-react';
import { ExamSettings } from './exam/ExamSettings';
import { QuestionGrid } from './exam/QuestionGrid';
import { ResultSummary } from './exam/ResultSummary';
import { playSound } from '../lib/snakeSound';

export default function ExamQuiz() {
  const {
    exams, activeExamId, activeAnswers, currentQuestionIndex, timeRemaining,
    isExamActive, isExamSubmitted, examMode, setExamMode, autoAdvance, setAutoAdvance,
    showExplanation, setShowExplanation, soundEnabled, setSoundEnabled,
    shuffleQuestions, setShuffleQuestions, shuffleAnswers, setShuffleAnswers, timerMode, setTimerMode, shuffledExam,
    isExamsFetched, fetchCloudExams,
    startExam, selectAnswer, setCurrentQuestionIndex, decrementTime, submitExam, resetExamSession, currentUser
  } = useExamStore();

  React.useEffect(() => {
    if (!isExamsFetched) {
      fetchCloudExams();
    }
  }, [isExamsFetched, fetchCloudExams]);

  const isGreenTheme = useIsGreen();
  const [markedQuestions, setMarkedQuestions] = React.useState<Record<string, boolean>>({});
  const [showGrid, setShowGrid] = React.useState(true);
  const [showSettings, setShowSettings] = React.useState(false);
  const gridContainerRef = React.useRef<HTMLDivElement>(null);

  const activeExam = shuffledExam || exams.find(e => e.id === activeExamId) || null;
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

  const handleStartExam = (examId: string) => { startExam(examId); setMarkedQuestions({}); };
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

  if (!activeExamId) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto relative">
        <div className="absolute top-0 right-0 z-10">
          <ExamSettings
            isGreenTheme={true} examMode={examMode} autoAdvance={autoAdvance}
            showExplanation={showExplanation} soundEnabled={soundEnabled}
            shuffleQuestions={shuffleQuestions} shuffleAnswers={shuffleAnswers} timerMode={timerMode}
            showSettings={showSettings} onToggleSettings={() => setShowSettings(!showSettings)}
            onSetExamMode={setExamMode} onSetAutoAdvance={setAutoAdvance}
            onSetShowExplanation={setShowExplanation} onSetSoundEnabled={setSoundEnabled}
            onSetShuffleQuestions={setShuffleQuestions} onSetShuffleAnswers={setShuffleAnswers}
            onSetTimerMode={setTimerMode}
          />
        </div>
        <div className="text-center space-y-3 pt-4">
          <span className={cn("text-[11px] font-sans font-bold tracking-[0.2em] uppercase", accentText)}>BẮT ĐẦU ÔN TẬP</span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#1A1814] tracking-tight">Chọn Đề Thi</h2>
          <p className="text-sm text-neutral-500 font-sans max-w-lg mx-auto leading-relaxed">
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
    <div className="card-layered p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Top Bar */}
      <div className={cn("sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 mb-6 backdrop-blur-lg border-b",
        "bg-[var(--accent)] text-white"
      )}>
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono shrink-0",
              "bg-[var(--accent-light)] text-[var(--accent)]"
            )}>{currentQuestionIndex + 1}</div>
            <div className="min-w-0">
              <h3 className="text-sm font-serif font-bold truncate">{activeExam.title}</h3>
              <p className="text-[10px] opacity-60 font-sans">{answeredCount}/{totalQuestions} đã trả lời</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {!isExamSubmitted && (
              <>
                <ExamSettings
                  isGreenTheme={true} examMode={examMode} autoAdvance={autoAdvance}
                  showExplanation={showExplanation} soundEnabled={soundEnabled}
                  shuffleQuestions={shuffleQuestions} shuffleAnswers={shuffleAnswers} timerMode={timerMode}
                  showSettings={showSettings} onToggleSettings={() => setShowSettings(!showSettings)}
                  onSetExamMode={setExamMode} onSetAutoAdvance={setAutoAdvance}
                  onSetShowExplanation={setShowExplanation} onSetSoundEnabled={setSoundEnabled}
                  onSetShuffleQuestions={setShuffleQuestions} onSetShuffleAnswers={setShuffleAnswers}
                  onSetTimerMode={setTimerMode}
                  hidePreExamSettings={true}
                />
                <button onClick={() => setShowGrid(!showGrid)}
                  className={cn("p-2 rounded-lg transition-all hidden lg:flex hover:bg-white/10", showGrid ? "bg-white/10" : "")}
                  title="Toggle question grid"
                >
                  <ListChecks className="w-4 h-4" />
                </button>
                <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border", "border-[var(--accent)]/30 bg-[var(--accent)]/10")}>
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  <span className={cn("font-mono text-sm font-bold tabular-nums", timeRemaining !== -1 && timeRemaining < 60 ? "text-red-400" : "")}>
                    {timeRemaining === -1 ? '∞' : formatTime(timeRemaining)}
                  </span>
                </div>
              </>
            )}
            {isExamSubmitted && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-bold uppercase tracking-wider">
                <CheckCircle className="w-4 h-4" /> Đã Nộp
              </div>
            )}
          </div>
        </div>
        {!isExamSubmitted && (
          <div className="mt-2 -mb-3 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, backgroundColor: 'var(--accent)' }} />
          </div>
        )}
      </div>

      {/* Content Grid */}
      <div className={cn("grid gap-6", showGrid ? "lg:grid-cols-12" : "lg:grid-cols-1 max-w-3xl mx-auto")}>
        <div className={showGrid ? "lg:col-span-8 space-y-5" : "space-y-5"}>
          {isExamSubmitted && (
            <ResultSummary
              isGreenTheme={true} correctCount={summary.correctCount} totalCount={summary.totalCount}
              percentage={summary.percentage} accentBg={accentBg} accentText={accentText}
              accentBorder={accentBorder} accentLight={accentLight}
              onReset={resetExamSession} onRetry={() => handleStartExam(activeExam.id)}
            />
          )}
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
        {showGrid && (
          <div className="lg:col-span-4">
            <QuestionGrid
              activeExam={activeExam} activeAnswers={activeAnswers}
              currentQuestionIndex={currentQuestionIndex} isExamSubmitted={isExamSubmitted}
              markedQuestions={markedQuestions} isGreenTheme={true}
              answeredCount={answeredCount} totalQuestions={totalQuestions}
              progressPct={progressPct} gridContainerRef={gridContainerRef}
              onSelectQuestion={setCurrentQuestionIndex}
              onSubmit={() => submitExam(currentUser?.id)}
              onResetSession={resetExamSession}
            />
          </div>
        )}
      </div>
    </div>
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
    <div className={cn("group relative p-6 transition-all duration-300 cursor-pointer card-layered",
      "hover:-translate-y-0.5 active:translate-y-0"
    )} onClick={() => onStart(exam.id)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", accentBg)} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Trắc nghiệm</span>
          </div>
          <h3 className={cn("font-serif text-lg font-bold text-[#1A1814] transition-colors leading-snug line-clamp-2",
            "group-hover:text-[var(--accent)]"
          )}>{exam.title}</h3>
          <p className="text-xs text-neutral-500 font-sans line-clamp-2 leading-relaxed">{exam.description || 'Đề trắc nghiệm kiểm tra trình độ.'}</p>
        </div>
        <div className={cn("shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300", accentLight, "group-hover:scale-110 group-hover:shadow-md")}>
          <Play className={cn("w-5 h-5 ml-0.5", accentText)} />
        </div>
      </div>
      <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between">
        <div className="flex gap-4 text-xs font-mono text-neutral-400">
          <span className="flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5" /> {exam.questions.length} câu</span>
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {exam.duration} phút</span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onStart(exam.id); }}
          className={cn("flex items-center gap-1 text-white px-4 py-2 rounded-xl text-xs font-serif font-bold uppercase tracking-wider transition-all", accentBg)}
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

  return (
    <div className="bg-[#FAF9F6] border border-neutral-200 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
      <div className="px-6 pt-6 pb-4 border-b border-neutral-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={cn("w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-sm",
            "bg-[var(--accent-light)] text-[var(--accent)]"
          )}>{currentQuestionIndex + 1}</span>
          <div>
            <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Câu hỏi {currentQuestionIndex + 1}/{totalQuestions}
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

      <div className="px-6 py-5">
        <h4 className="text-[#1A1814] text-base sm:text-lg font-serif font-bold leading-relaxed">{q.content}</h4>
      </div>

      <div className="px-6 pb-2 space-y-2.5">
        {q.answers.map((answer: Answer, oIdx: number) => {
          const optionLetter = String.fromCharCode(65 + oIdx);
          const qId = q.id;
          const isSelected = activeAnswers[qId] === answer.id;
          const isCorrect = answer.isCorrect;
          const feedbackOn = !isExamSubmitted && examMode === 'practice' && isSelected && !!activeAnswers[qId];

          let optStyle = "border-neutral-200 bg-white hover:border-neutral-400 hover:shadow-sm";
          let prefixStyle = "bg-neutral-100 text-[var(--text-secondary)]";

          if (feedbackOn) {
            optStyle = isCorrect ? "border-emerald-500 bg-emerald-50/80 ring-1 ring-emerald-500/30" : "border-red-400 bg-red-50/80 ring-1 ring-red-400/30";
            prefixStyle = isCorrect ? "bg-emerald-500 text-white" : "bg-red-500 text-white";
            if (!isSelected && isCorrect) optStyle = "border-emerald-500 bg-emerald-50/80 ring-1 ring-emerald-500/30";
          } else if (isExamSubmitted) {
            if (isCorrect) { optStyle = "border-emerald-500 bg-emerald-50/80 ring-1 ring-emerald-500/30"; prefixStyle = "bg-emerald-500 text-white"; }
            else if (isSelected && !isCorrect) { optStyle = "bg-[var(--accent-light)] text-[var(--accent)]"; prefixStyle = "bg-[var(--accent)] text-white"; }
          } else if (isSelected) {
            optStyle = "bg-[var(--accent-light)] text-[var(--accent)]";
            prefixStyle = "bg-[var(--accent)] text-white";
          }

          const isDisabled = isExamSubmitted || (examMode === 'practice' && isSelected && !!activeAnswers[qId]);
          const shortcutKey = oIdx + 1;

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
                <span className={cn("w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-all relative", prefixStyle)}>
                  {optionLetter}
                  {!isExamSubmitted && (
                    <span className={cn("absolute -top-1.5 -right-1.5 text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", "bg-[var(--accent)] text-white")}>
                      {shortcutKey}
                    </span>
                  )}
                </span>
                <span className="text-sm font-sans leading-relaxed text-neutral-800 font-medium">{answer.content}</span>
              </div>
              {feedbackOn && isCorrect && <Check className="w-5 h-5 text-emerald-500 shrink-0" />}
              {feedbackOn && isSelected && !isCorrect && <X className="w-5 h-5 text-red-500 shrink-0" />}
              {isExamSubmitted && isCorrect && <Check className="w-5 h-5 text-emerald-500 shrink-0" />}
              {isExamSubmitted && isSelected && !isCorrect && <X className={cn("w-5 h-5 shrink-0", accentText)} />}
            </button>
          );
        })}
      </div>

      {(isExamSubmitted || (examMode === 'practice' && showExplanation && !!activeAnswers[q.id])) && q.explanation && (
        <div className="mx-6 mb-4 p-4 rounded-xl bg-amber-50/80 border border-amber-200/60 space-y-1.5">
          <span className={cn("text-[10px] font-serif font-bold uppercase tracking-wider", "text-[var(--accent)]")}>Giải thích</span>
          <p className="text-sm text-[var(--text-primary)] font-sans leading-relaxed">{q.explanation}</p>
        </div>
      )}

      <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-between gap-3">
        <button disabled={currentQuestionIndex === 0} onClick={onGoPrev}
          className="flex items-center gap-1.5 border border-neutral-200 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed text-[var(--text-secondary)] px-4 py-2 rounded-xl text-xs font-serif font-bold uppercase tracking-wider cursor-pointer transition-all"
        ><ChevronLeft className="w-4 h-4" /> Trước</button>
        <div className="hidden sm:flex items-center gap-1 text-[10px] text-neutral-400 font-sans">
          <kbd className="px-1.5 py-0.5 bg-neutral-100 rounded text-[10px] font-mono border border-neutral-200">←</kbd>
          <span className="mx-1">/</span>
          <kbd className="px-1.5 py-0.5 bg-neutral-100 rounded text-[10px] font-mono border border-neutral-200">→</kbd>
          <span className="ml-1">điều hướng · </span>
          <kbd className="px-1.5 py-0.5 bg-neutral-100 rounded text-[10px] font-mono border border-neutral-200">1-4</kbd>
          <span className="ml-1">chọn đáp án</span>
        </div>
        <button disabled={currentQuestionIndex === activeExam.questions.length - 1} onClick={onGoNext}
          className="flex items-center gap-1.5 border border-neutral-200 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed text-[var(--text-secondary)] px-4 py-2 rounded-xl text-xs font-serif font-bold uppercase tracking-wider cursor-pointer transition-all"
        >Sau <ChevronRight className="w-4 h-4" /></button>
      </div>
    </div>
  );
}
