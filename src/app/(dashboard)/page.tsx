'use client';

import React from 'react';
import { useExamStore, computeStreak } from '@/store/useExamStore';
import { SplineSceneBasic } from '@/components/ui/demo';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Trophy,
  Sparkles,
  Activity,
  ArrowRight,
  Flame,
  Check,
  X,
  AlertCircle,
  Clock,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ExamAttempt } from '@/types';

const container = {
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const springEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: springEase } },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: springEase } },
};

export default function HomePage() {
  const { theme, attempts, gameScores, activityDates, exams } = useExamStore();
  const router = useRouter();
  const [selectedAttempt, setSelectedAttempt] = React.useState<ExamAttempt | null>(null);

  const isGreenTheme = theme === 'neon';
  const lastAttempt = attempts[attempts.length - 1] || null;
  const recentWordCategory =
    gameScores[gameScores.length - 1]?.vocabularyCategory || 'Công Nghệ';
  const streak = computeStreak(activityDates);
  const bestSnakeScore = gameScores.reduce((max, s) => Math.max(max, s.score), 0);
  const hasActivity = attempts.length > 0 || gameScores.length > 0;
  const sampleExam = exams[0];

  const accentText = isGreenTheme ? 'text-[#224334]' : 'text-[#DC143C]';
  const accentBg = isGreenTheme ? 'bg-[#9ce5c1]/25' : 'bg-[#DC143C]/10';
  const cardBase = 'card-layered';

  const bentoCards = [
    {
      path: '/quiz',
      icon: GraduationCap,
      title: 'Trắc Nghiệm',
      desc: 'Luyện đề có chấm điểm và giải thích chi tiết.',
      link: 'Làm đề ngay',
      span: 'lg:col-span-2',
      visual: 'from-[#DC143C]/12 via-[#FAF9F6] to-transparent',
      visualGreen: 'from-[#224334]/12 via-[#F4FAF0] to-transparent',
      tall: true,
    },
    {
      path: '/snake',
      icon: Trophy,
      title: 'Săn Từ Vựng',
      desc: 'Game Snake rèn phản xạ từ vựng.',
      link: 'Chơi ngay',
      span: 'lg:col-span-1',
      visual: 'from-[#DC143C]/8 to-[#FAF9F6]',
      visualGreen: 'from-[#79ab8e]/20 to-[#F4FAF0]',
      tall: false,
    },
    {
      path: '/generate',
      icon: Sparkles,
      title: 'Bóc Tách Đề',
      desc: 'Upload Word hoặc Excel để tạo đề thi tự động.',
      link: 'Tải lên đề',
      span: 'lg:col-span-3',
      visual: 'from-[#1A1814]/5 via-[#FAF9F6] to-[#DC143C]/5',
      visualGreen: 'from-[#1A1814]/5 via-[#F4FAF0] to-[#224334]/8',
      tall: false,
      horizontal: true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-12"
    >
      <motion.div variants={scaleIn} initial="initial" animate="animate">
        <SplineSceneBasic />
      </motion.div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        variants={container}
        initial="initial"
        animate="animate"
      >
        <div className="lg:col-span-2 space-y-8">
          <motion.h3
            variants={fadeUp}
            className="font-serif text-xl font-bold tracking-tight pb-3 border-b border-[#1A1814]/10"
          >
            Lộ Trình Tương Tác
          </motion.h3>

          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-5"
            variants={container}
          >
            {bentoCards.map(
              ({ path, icon: Icon, title, desc, link, span, visual, visualGreen, tall, horizontal }) => (
                <motion.div
                  key={path}
                  variants={scaleIn}
                  onClick={() => router.push(path)}
                  className={cn(
                    'rounded-2xl cursor-pointer group overflow-hidden flex',
                    cardBase,
                    span,
                    tall ? 'min-h-[200px]' : 'min-h-[160px]',
                    horizontal ? 'flex-row' : 'flex-col',
                  )}
                  whileHover={{ y: -3, transition: { type: 'spring', stiffness: 300, damping: 22 } }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className={cn(
                      'relative flex items-center justify-center bg-gradient-to-br shrink-0',
                      isGreenTheme ? visualGreen : visual,
                      horizontal ? 'w-2/5 min-h-[140px]' : tall ? 'h-28' : 'h-24',
                      !horizontal && 'w-full',
                    )}
                  >
                    <Icon
                      className={cn(
                        'opacity-30 transition-transform group-hover:scale-110',
                        tall ? 'w-16 h-16' : 'w-12 h-12',
                        accentText,
                      )}
                    />
                  </div>
                  <div
                    className={cn(
                      'p-5 flex flex-col justify-between flex-1',
                      horizontal && 'py-6',
                    )}
                  >
                    <div>
                      <h4 className={cn('font-serif font-bold text-base', accentText)}>{title}</h4>
                      <p className="text-[11px] font-sans mt-1.5 text-[#78716C] leading-relaxed">{desc}</p>
                    </div>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 text-[11px] font-sans font-bold uppercase tracking-wider mt-4 group-hover:gap-2.5 transition-all',
                        accentText,
                      )}
                    >
                      {link}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.div>
              ),
            )}
          </motion.div>

          <motion.div
            variants={fadeUp}
            className={cn(
              'p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-6',
              cardBase,
            )}
          >
            <div className="space-y-1 text-center sm:text-left">
              <span
                className={cn(
                  'text-[10px] font-sans tracking-[0.2em] uppercase font-bold',
                  isGreenTheme ? 'text-[#79ab8e]' : 'text-[#DC143C]',
                )}
              >
                Mục tiêu hôm nay
              </span>
              <h4 className="font-serif font-bold text-base text-[#1A1814]">
                {lastAttempt
                  ? 'Tiếp tục cải thiện điểm số và từ vựng.'
                  : 'Hoàn thành bài thi đầu tiên để mở khóa thống kê.'}
              </h4>
            </div>
            <div className="flex gap-3 shrink-0 items-center">
              {lastAttempt ? (
                <>
                  <div className="text-center bg-[#1A1814]/5 px-4 py-2 rounded-xl border border-[#1A1814]/5">
                    <p className="text-[10px] font-sans uppercase font-bold tracking-wider text-[#78716C]">
                      Độ chuẩn
                    </p>
                    <p className={cn('text-lg font-bold font-mono', accentText)}>
                      {Math.round(lastAttempt.score * 10)}%
                    </p>
                  </div>
                  <div className="text-center bg-[#1A1814]/5 px-4 py-2 rounded-xl border border-[#1A1814]/5">
                    <p className="text-[10px] font-sans uppercase font-bold tracking-wider text-[#78716C]">
                      Chủ đề săn
                    </p>
                    <p className="text-lg font-bold font-mono text-[#1A1814]">
                      {recentWordCategory.replace('Chủ đề ', '').split(' ')[0]}
                    </p>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push('/quiz')}
                  className={cn(
                    'px-5 py-2.5 rounded-xl text-xs font-sans font-bold uppercase tracking-wider border transition-all cursor-pointer hover:opacity-90 active:scale-[0.98]',
                    isGreenTheme
                      ? 'border-[#224334] text-[#224334] hover:bg-[#224334]/5'
                      : 'border-[#DC143C] text-[#DC143C] hover:bg-[#DC143C]/5',
                  )}
                >
                  Làm đề thử
                </button>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div className="space-y-6" variants={container}>
          <motion.div
            variants={fadeUp}
            className={cn('rounded-2xl p-6 space-y-4', cardBase)}
          >
            <h4 className="font-serif text-base font-bold flex items-center gap-2 pb-2 border-b border-[#1A1814]/5 text-[#1A1814]">
              <Activity className={cn('w-4 h-4', isGreenTheme ? 'text-[#79ab8e]' : 'text-[#DC143C]')} />
              Lịch sử hoạt động
            </h4>

            <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
              {!hasActivity ? (
                <div className="text-center py-6 space-y-4">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-2xl mx-auto flex items-center justify-center',
                      accentBg,
                    )}
                  >
                    <GraduationCap className={cn('w-6 h-6', accentText)} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-serif font-bold text-[#1A1814]">Chưa có hoạt động</p>
                    <p className="text-xs text-[#78716C] font-sans">
                      {sampleExam
                        ? `Bắt đầu với "${sampleExam.title.slice(0, 32)}…"`
                        : 'Làm bài thi đầu tiên để theo dõi tiến trình.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push('/quiz')}
                    className={cn(
                      'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-sans font-bold uppercase tracking-wider text-white transition-all cursor-pointer hover:opacity-90',
                      isGreenTheme ? 'bg-[#224334]' : 'bg-[#DC143C]',
                    )}
                  >
                    Làm đề thử
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  {attempts.map((attempt) => (
                    <motion.div
                      key={attempt.id}
                      variants={fadeUp}
                      onClick={() => setSelectedAttempt(attempt)}
                      className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 flex justify-between items-center text-xs cursor-pointer hover:bg-neutral-100/80 hover:border-neutral-200 transition-colors"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="space-y-1">
                        <p className="font-serif font-bold text-[#1A1814] leading-tight">
                          Thử sức: {attempt.examId.replace('exam-', '').toUpperCase()}
                        </p>
                        <p className="text-[10px] text-neutral-500 font-mono">
                          Đạt: {attempt.score}/10 điểm |{' '}
                          {new Date(attempt.endedAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <span className="font-mono font-bold bg-green-500/10 text-green-700 px-2 py-1 rounded-md">
                        {Math.round(attempt.score * 10)}%
                      </span>
                    </motion.div>
                  ))}
                  {gameScores.map((scoreLog) => (
                    <motion.div
                      key={scoreLog.id}
                      variants={fadeUp}
                      className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 flex justify-between items-center text-xs"
                    >
                      <div className="space-y-1">
                        <p className="font-serif font-bold text-neutral-800 leading-tight">
                          Game Snake:{' '}
                          {scoreLog.vocabularyCategory.replace('Chủ đề ', '').split(' ')[0]}
                        </p>
                        <p className="text-[10px] text-neutral-500 font-mono">
                          Thời gian: {scoreLog.durationSeconds} giây |{' '}
                          {new Date(scoreLog.playedAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'font-mono font-bold px-2 py-1 rounded-md',
                          isGreenTheme
                            ? 'bg-[#9ce5c1]/30 text-[#224334]'
                            : 'bg-[#DC143C]/10 text-[#DC143C]',
                        )}
                      >
                        +{scoreLog.score}đ
                      </span>
                    </motion.div>
                  ))}
                </>
              )}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className={cn('rounded-2xl p-5 space-y-4', cardBase)}>
            <h4 className="font-serif text-sm font-bold text-[#1A1814] flex items-center gap-2">
              <Flame className={cn('w-4 h-4', isGreenTheme ? 'text-[#79ab8e]' : 'text-orange-500')} />
              Tiến trình của bạn
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-xl bg-[#1A1814]/5 border border-[#1A1814]/5">
                <p className="text-[10px] font-sans uppercase font-bold tracking-wider text-[#78716C]">
                  Streak
                </p>
                <p className={cn('text-xl font-bold font-mono mt-1', accentText)}>{streak} ngày</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-[#1A1814]/5 border border-[#1A1814]/5">
                <p className="text-[10px] font-sans uppercase font-bold tracking-wider text-[#78716C]">
                  Snake cao nhất
                </p>
                <p className="text-xl font-bold font-mono mt-1 text-[#1A1814]">{bestSnakeScore}đ</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push('/leaderboard')}
              className={cn(
                'w-full flex items-center justify-center gap-2 text-[11px] font-sans font-bold uppercase tracking-wider transition-all cursor-pointer hover:gap-3',
                accentText,
              )}
            >
              Xem bảng xếp hạng
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {selectedAttempt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAttempt(null)}
              className="absolute inset-0 bg-[#1A1814]/55 backdrop-blur-sm"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className={cn(
                "relative w-full max-w-2xl max-h-[85vh] bg-[var(--card-bg)] rounded-2xl flex flex-col z-10 overflow-hidden",
                "border-[3px] border-[var(--accent)]"
              )}
              style={{
                boxShadow: '6px 6px 0px 0px var(--accent)'
              }}
            >
              {/* Header */}
              <div className="p-6 border-b border-[#1A1814]/10 flex justify-between items-start gap-4">
                <div>
                  <span className={cn(
                    "text-[10px] font-sans font-bold uppercase tracking-wider px-2.5 py-1 rounded-full",
                    isGreenTheme ? "bg-[#9ce5c1]/20 text-[#224334]" : "bg-[#DC143C]/10 text-[#DC143C]"
                  )}>
                    Chi tiết bài làm
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#1A1814] mt-2">
                    {exams.find(e => e.id === selectedAttempt.examId)?.title || `Bài thi: ${selectedAttempt.examId}`}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] text-neutral-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {Math.floor(selectedAttempt.durationSec / 60)} phút {selectedAttempt.durationSec % 60} giây
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(selectedAttempt.endedAt).toLocaleDateString('vi-VN')} {new Date(selectedAttempt.endedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                
                <div className="text-right flex flex-col items-end gap-1.5">
                  <div className={cn(
                    "font-mono font-bold text-xl px-3 py-1.5 rounded-xl border border-current",
                    isGreenTheme ? "text-[#224334] bg-[#9ce5c1]/10" : "text-[#DC143C] bg-[#DC143C]/5"
                  )}>
                    {selectedAttempt.score}/10đ
                  </div>
                  <button
                    onClick={() => setSelectedAttempt(null)}
                    className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Questions list */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {(() => {
                  const exam = exams.find(e => e.id === selectedAttempt.examId);
                  if (!exam) {
                    return (
                      <div className="text-center py-8 text-neutral-500 text-sm">
                        Không tìm thấy thông tin đề thi này.
                      </div>
                    );
                  }

                  return exam.questions.map((q, qIndex) => {
                    const chosenId = selectedAttempt.answers[q.id];
                    const chosenAnswer = q.answers.find(a => a.id === chosenId);
                    const correctAnswer = q.answers.find(a => a.isCorrect);
                    const isCorrect = chosenId && correctAnswer && chosenId === correctAnswer.id;

                    return (
                      <div key={q.id} className="space-y-3 pb-6 border-b border-neutral-100 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-serif font-bold text-sm text-[#1A1814] flex-1 leading-snug">
                            <span className="font-mono text-xs uppercase text-neutral-400 block mb-0.5">Câu {qIndex + 1} ({q.points} điểm)</span>
                            {q.content}
                          </h4>
                          <span className={cn(
                            "flex items-center gap-1 font-mono font-bold text-xs px-2.5 py-1 rounded-md shrink-0",
                            isCorrect 
                              ? "bg-green-500/10 text-green-700" 
                              : "bg-red-500/10 text-red-700"
                          )}>
                            {isCorrect ? (
                              <>
                                <Check className="w-3.5 h-3.5" /> Đúng
                              </>
                            ) : (
                              <>
                                <X className="w-3.5 h-3.5" /> Sai
                              </>
                            )}
                          </span>
                        </div>

                        {/* Answers Options list */}
                        <div className="grid grid-cols-1 gap-2 mt-3">
                          {q.answers.map((a) => {
                            const isChosenOption = a.id === chosenId;
                            const isCorrectOption = a.isCorrect;

                            let optionBg = "bg-white border-neutral-200 hover:border-neutral-300";
                            let optionText = "text-[#1A1814]";
                            let optionBadge = null;

                            if (isChosenOption && isCorrectOption) {
                              optionBg = "bg-green-500/10 border-green-500/50";
                              optionText = "text-green-800 font-medium";
                              optionBadge = (
                                <span className="text-[10px] uppercase font-bold text-green-700 bg-green-500/20 px-2 py-0.5 rounded flex items-center gap-0.5">
                                  <Check className="w-3 h-3" /> Đáp án đúng của bạn
                                </span>
                              );
                            } else if (isChosenOption && !isCorrectOption) {
                              optionBg = "bg-red-500/10 border-red-500/50";
                              optionText = "text-red-800 font-medium";
                              optionBadge = (
                                <span className="text-[10px] uppercase font-bold text-red-700 bg-red-500/20 px-2 py-0.5 rounded flex items-center gap-0.5">
                                  <X className="w-3 h-3" /> Đáp án bạn đã chọn
                                </span>
                              );
                            } else if (isCorrectOption) {
                              optionBg = "bg-green-500/5 border-green-500/30";
                              optionText = "text-green-700 font-medium";
                              optionBadge = (
                                <span className="text-[10px] uppercase font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded">
                                  Đáp án đúng
                                </span>
                              );
                            }

                            return (
                              <div
                                key={a.id}
                                className={cn(
                                  "p-3 rounded-xl border text-xs flex items-center justify-between gap-3 transition-all",
                                  optionBg
                                )}
                              >
                                <span className={optionText}>{a.content}</span>
                                {optionBadge}
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation Box */}
                        {q.explanation && (
                          <div className={cn(
                            "p-3.5 rounded-xl border text-xs leading-relaxed flex gap-2.5 mt-3",
                            isGreenTheme 
                              ? "bg-[#9ce5c1]/10 border-[#224334]/20 text-[#224334]" 
                              : "bg-[#DC143C]/5 border-[#DC143C]/10 text-neutral-800"
                          )}>
                            <AlertCircle className={cn("w-4 h-4 shrink-0 mt-0.5", isGreenTheme ? "text-[#224334]" : "text-[#DC143C]")} />
                            <div className="space-y-1">
                              <p className="font-bold font-serif uppercase tracking-wider text-[9px] opacity-75">Giải thích chi tiết</p>
                              <p className="font-sans text-[11px] opacity-90">{q.explanation}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[#1A1814]/10 bg-neutral-50/50 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedAttempt(null)}
                  className={cn(
                    "px-5 py-2.5 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all",
                    isGreenTheme 
                      ? "bg-[#224334] text-white hover:bg-[#1A3327]" 
                      : "bg-[#DC143C] text-white hover:bg-[#c91236]"
                  )}
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
