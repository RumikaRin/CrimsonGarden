import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { resolveDisplayName, shouldShowOnLeaderboard } from '@/lib/leaderboard';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ success: false, error: 'DB_OFFLINE' }, { status: 503 });
    }

    // Get all results with user info, ordered by score desc, time asc, completedAt asc
    const results = await prisma.userExamResult.findMany({
      orderBy: [
        { score: 'desc' },
        { timeSpent: 'asc' },
        { completedAt: 'asc' },
      ],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Aggregate per user: highest score, total correct, total wrong, best time
    const userMap = new Map<string, {
      userId: string;
      name: string;
      email: string;
      bestScore: number;
      bestTime: number;
      totalCorrect: number;
      totalWrong: number;
      totalExams: number;
      lastActive: string;
    }>();

    for (const r of results) {
      const existing = userMap.get(r.userId);
      const username = resolveDisplayName(r.user, r.userId);

      if (existing) {
        existing.totalExams++;
        existing.totalCorrect += r.correctAnswers;
        existing.totalWrong += r.wrongAnswers;
        if (r.score > existing.bestScore) {
          existing.bestScore = r.score;
          existing.bestTime = r.timeSpent;
        } else if (r.score === existing.bestScore && r.timeSpent < existing.bestTime) {
          existing.bestTime = r.timeSpent;
        }
        if (r.completedAt.toISOString() > existing.lastActive) {
          existing.lastActive = r.completedAt.toISOString();
        }
      } else {
        userMap.set(r.userId, {
          userId: r.userId,
          name: username,
          email: r.user?.email || '',
          bestScore: r.score,
          bestTime: r.timeSpent,
          totalCorrect: r.correctAnswers,
          totalWrong: r.wrongAnswers,
          totalExams: 1,
          lastActive: r.completedAt.toISOString(),
        });
      }
    }

    // Sort: bestScore desc, bestTime asc, lastActive desc
    const leaderboard = Array.from(userMap.values())
      .filter((entry) => shouldShowOnLeaderboard(entry.userId))
      .sort((a, b) => {
        if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
        if (a.bestTime !== b.bestTime) return a.bestTime - b.bestTime;
        return b.lastActive.localeCompare(a.lastActive);
      });

    return NextResponse.json({ success: true, leaderboard });
  } catch (err: any) {
    console.error('[Leaderboard Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
