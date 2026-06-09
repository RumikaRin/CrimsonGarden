import { isPlaceholderUserId } from '@/lib/users';

const PLACEHOLDER_NAMES = new Set(['Học Sinh Đăng Nhập', 'student-curr', 'guest']);

export function shouldShowOnLeaderboard(userId: string): boolean {
  return !isPlaceholderUserId(userId);
}

export function resolveDisplayName(
  user: { id: string; name: string | null; email: string } | null | undefined,
  userId: string,
): string {
  const name = user?.name?.trim();
  if (name && !PLACEHOLDER_NAMES.has(name)) return name;
  if (user?.email?.includes('@')) {
    const local = user.email.split('@')[0];
    if (!PLACEHOLDER_NAMES.has(local)) return local;
  }
  return userId;
}

export function collectActivityDatesForUser(
  userId: string,
  sources: {
    activityDates?: string[];
    attempts?: { userId: string; startedAt: string; endedAt: string }[];
    gameScores?: { userId: string; playedAt: string }[];
  },
  currentUserId?: string,
): string[] {
  const dates: string[] = [];
  if (userId === currentUserId && sources.activityDates?.length) {
    dates.push(...sources.activityDates);
  }
  sources.attempts
    ?.filter((a) => a.userId === userId)
    .forEach((a) => {
      dates.push(a.startedAt, a.endedAt);
    });
  sources.gameScores
    ?.filter((g) => g.userId === userId)
    .forEach((g) => {
      dates.push(g.playedAt);
    });
  return dates;
}

/** Consecutive calendar days with activity (today inclusive) */
export function computeStreak(activityDates: string[]): number {
  if (!activityDates.length) return 0;
  const uniqueDays = Array.from(
    new Set(activityDates.map((d) => new Date(d).toISOString().slice(0, 10)))
  ).sort().reverse();

  const todayStr = new Date().toISOString().slice(0, 10);
  if (uniqueDays[0] !== todayStr) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (uniqueDays[0] !== yesterday) return 0;
  }

  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1]);
    const curr = new Date(uniqueDays[i]);
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000);
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
