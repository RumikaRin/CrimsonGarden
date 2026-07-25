import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { computeStreak, resolveDisplayName, shouldShowOnLeaderboard } from '@/lib/leaderboard';
import { memoryCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

type UserInfo = { id: string; name: string | null; email: string };

function toEntry<T extends Record<string, unknown>>(user: UserInfo | null | undefined, userId: string, extra: T): { userId: string; name: string; email: string } & T {
  return {
    userId,
    name: resolveDisplayName(user, userId),
    email: user?.email || '',
    ...extra,
  } as { userId: string; name: string; email: string } & T;
}

export async function GET() {
  try {
    // 1. Kiểm tra cache trước
    const cachedStats = memoryCache.get<{ streak: any[]; mostExams: any[]; competition: any[] }>('leaderboard:stats');
    if (cachedStats) {
      return NextResponse.json({ success: true, ...cachedStats, fromCache: true });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ success: false, error: 'DB_OFFLINE' }, { status: 503 });
    }

    const [examResults, examAttempts, gameScores] = await Promise.all([
      prisma.userExamResult.findMany({
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.examAttempt.findMany({
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.gameScore.findMany({
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
    ]);

    const activityByUser = new Map<string, { dates: string[]; user: UserInfo | null }>();
    const examCountByUser = new Map<string, { count: number; user: UserInfo | null }>();
    const gameCountByUser = new Map<string, { count: number; user: UserInfo | null }>();
    const competitionByUser = new Map<string, { points: number; examPoints: number; gamePoints: number; user: UserInfo | null }>();

    for (const r of examResults) {
      const bucket = activityByUser.get(r.userId) || { dates: [], user: r.user };
      bucket.dates.push(r.completedAt.toISOString());
      bucket.user = r.user;
      activityByUser.set(r.userId, bucket);

      const exams = examCountByUser.get(r.userId) || { count: 0, user: r.user };
      exams.count++;
      exams.user = r.user;
      examCountByUser.set(r.userId, exams);

      const competition = competitionByUser.get(r.userId) || { points: 0, examPoints: 0, gamePoints: 0, user: r.user };
      const points = Math.round(r.score * 10);
      competition.points += points;
      competition.examPoints += points;
      competition.user = r.user;
      competitionByUser.set(r.userId, competition);
    }

    for (const a of examAttempts) {
      const bucket = activityByUser.get(a.userId) || { dates: [], user: a.user };
      bucket.dates.push(a.startedAt.toISOString(), a.endedAt.toISOString());
      bucket.user = a.user;
      activityByUser.set(a.userId, bucket);
    }

    for (const g of gameScores) {
      const bucket = activityByUser.get(g.userId) || { dates: [], user: g.user };
      bucket.dates.push(g.playedAt.toISOString());
      bucket.user = g.user;
      activityByUser.set(g.userId, bucket);

      const games = gameCountByUser.get(g.userId) || { count: 0, user: g.user };
      games.count++;
      games.user = g.user;
      gameCountByUser.set(g.userId, games);

      const competition = competitionByUser.get(g.userId) || { points: 0, examPoints: 0, gamePoints: 0, user: g.user };
      competition.points += g.score;
      competition.gamePoints += g.score;
      competition.user = g.user;
      competitionByUser.set(g.userId, competition);
    }

    const streak = Array.from(activityByUser.entries())
      .map(([userId, { dates, user }]) =>
        toEntry(user, userId, { streak: computeStreak(dates) })
      )
      .filter((e) => e.streak > 0 && shouldShowOnLeaderboard(e.userId))
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 10);

    const allUserIds = new Set([
      ...examCountByUser.keys(),
      ...gameCountByUser.keys(),
    ]);

    const mostExams = Array.from(allUserIds)
      .map((userId) => {
        const exam = examCountByUser.get(userId);
        const game = gameCountByUser.get(userId);
        const user = exam?.user || game?.user || null;
        return toEntry(user, userId, {
          examCount: exam?.count || 0,
          gameCount: game?.count || 0,
        });
      })
      .filter((e) => shouldShowOnLeaderboard(e.userId))
      .sort((a, b) => b.examCount - a.examCount)
      .slice(0, 10);

    const competition = Array.from(competitionByUser.entries())
      .map(([userId, value]) => toEntry(value.user, userId, {
        points: value.points,
        examPoints: value.examPoints,
        gamePoints: value.gamePoints,
      }))
      .filter((entry) => shouldShowOnLeaderboard(entry.userId))
      .sort((a, b) => b.points - a.points)
      .slice(0, 10);

    const statsResult = { streak, mostExams, competition };

    // 2. Lưu cache trong 60 giây
    memoryCache.set('leaderboard:stats', statsResult, 60);

    return NextResponse.json({ success: true, ...statsResult });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Leaderboard Stats Error]:', err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
