'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BookOpenCheck,
  Brain,
  Gamepad2,
  GraduationCap,
  Medal,
  Trophy,
} from 'lucide-react';
import { useExamStore } from '@/store/useExamStore';
import { cn } from '@/lib/utils';
import { SplineSceneBasic } from '@/components/ui/demo';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
};

export default function HomePage() {
  const router = useRouter();
  const { attempts, gameScores, exams, currentUser } = useExamStore();

  const myAttempts = attempts.filter((attempt) => attempt.userId === currentUser?.id);
  const myGameScores = gameScores.filter((score) => score.userId === currentUser?.id);
  const bestExamScore = myAttempts.reduce((best, attempt) => Math.max(best, attempt.score), 0);
  const bestGameScore = myGameScores.reduce((best, score) => Math.max(best, score.score), 0);
  const competitionPoints = Math.round(
    myAttempts.reduce((total, attempt) => total + attempt.score * 10, 0)
      + myGameScores.reduce((total, score) => total + score.score, 0),
  );

  const activities = useMemo(() => [
    ...myAttempts.map((attempt) => ({
      id: attempt.id,
      type: 'exam' as const,
      title: exams.find((exam) => exam.id === attempt.examId)?.title || 'Bài thi',
      result: `${attempt.score.toFixed(1)}/10`,
      date: attempt.endedAt,
    })),
    ...myGameScores.map((score) => ({
      id: score.id,
      type: 'game' as const,
      title: score.vocabularyCategory,
      result: `${score.score} điểm`,
      date: score.playedAt,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8), [exams, myAttempts, myGameScores]);

  const activitiesMenu = [
    { path: '/quiz', label: 'Luyện đề', note: `${exams.length} bộ đề`, icon: GraduationCap },
    { path: '/quick-quiz', label: 'Quiz nhanh', note: 'Tự chọn và trộn đề', icon: Brain },
    { path: '/snake', label: 'Săn từ vựng', note: 'Game phản xạ', icon: Gamepad2 },
    { path: '/review', label: 'Ôn câu sai', note: 'Học lại có giải thích', icon: BookOpenCheck },
  ];

  return (
    <motion.main
      initial="initial"
      animate="animate"
      className="space-y-7 sm:space-y-10"
    >
      <motion.section variants={fadeUp}>
        <SplineSceneBasic />
      </motion.section>

      <motion.header variants={fadeUp} className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end border-b border-[var(--border-default)] pb-6 sm:pb-8">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">Crimson Academy</p>
          <h1 className="mt-3 max-w-3xl font-serif text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl">
            Học, chơi và chinh phục bảng xếp hạng.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
            Chọn một hoạt động ngắn để ôn tập hoặc tích thêm điểm thi đua hôm nay.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/leaderboard')}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 text-xs font-bold uppercase tracking-wider text-[var(--accent-foreground)] lg:w-auto"
        >
          Xem bảng xếp hạng <ArrowRight className="h-4 w-4" />
        </button>
      </motion.header>

      <motion.section variants={fadeUp} className="grid overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--card-bg)] sm:grid-cols-3">
        {[
          { label: 'Điểm thi đua', value: competitionPoints, suffix: 'đ', icon: Medal },
          { label: 'Điểm thi tốt nhất', value: bestExamScore.toFixed(1), suffix: '/10', icon: Trophy },
          { label: 'Điểm game tốt nhất', value: bestGameScore, suffix: 'đ', icon: Gamepad2 },
        ].map(({ label, value, suffix, icon: Icon }, index) => (
          <div key={label} className={cn('p-4 sm:p-7', index > 0 && 'border-t border-[var(--border-default)] sm:border-l sm:border-t-0')}>
            <Icon className="h-5 w-5 text-[var(--accent)]" />
            <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] sm:mt-7">{label}</p>
            <p className="mt-1 font-mono text-3xl font-bold text-[var(--text-primary)]">{value}<span className="ml-1 text-sm text-[var(--text-secondary)]">{suffix}</span></p>
          </div>
        ))}
      </motion.section>

      <motion.section variants={fadeUp}>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Học và chơi</p>
            <h2 className="mt-2 font-serif text-2xl font-bold text-[var(--text-primary)]">Chọn hoạt động</h2>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {activitiesMenu.map(({ path, label, note, icon: Icon }) => (
            <button
              type="button"
              key={path}
              onClick={() => router.push(path)}
              className="group min-h-40 rounded-2xl border border-[var(--border-default)] bg-[var(--card-bg)] p-5 text-left transition-all hover:-translate-y-0.5 hover:border-[var(--accent)]/40 hover:shadow-[var(--card-shadow)]"
            >
              <Icon className="h-5 w-5 text-[var(--accent)]" />
              <span className="mt-10 block font-serif text-lg font-bold text-[var(--text-primary)]">{label}</span>
              <span className="mt-1 flex items-center justify-between text-xs text-[var(--text-secondary)]">
                {note}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          ))}
        </div>
      </motion.section>

      <motion.section variants={fadeUp}>
        <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end sm:gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Kết quả</p>
            <h2 className="mt-2 font-serif text-2xl font-bold text-[var(--text-primary)]">Hoạt động gần đây</h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">{myAttempts.length} bài thi · {myGameScores.length} lượt game</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--card-bg)]">
          {activities.length === 0 ? (
            <div className="p-5 text-sm text-[var(--text-secondary)] sm:p-8">Chưa có kết quả. Bắt đầu với Quiz nhanh để ghi điểm đầu tiên.</div>
          ) : activities.map((activity, index) => (
            <div key={activity.id} className={cn('grid gap-2 p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-4', index > 0 && 'border-t border-[var(--border-default)]')}>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-light)] text-[var(--accent)]">
                {activity.type === 'exam' ? <GraduationCap className="h-4 w-4" /> : <Gamepad2 className="h-4 w-4" />}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{activity.title}</p>
                <p className="mt-1 text-[10px] text-[var(--text-secondary)]">{new Date(activity.date).toLocaleString('vi-VN')}</p>
              </div>
              <p className="font-mono text-base font-bold text-[var(--accent)]">{activity.result}</p>
            </div>
          ))}
        </div>
      </motion.section>
    </motion.main>
  );
}
