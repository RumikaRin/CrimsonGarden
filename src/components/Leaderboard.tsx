'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useExamStore } from '@/store/useExamStore';
import { collectActivityDatesForUser, computeStreak, shouldShowOnLeaderboard } from '@/lib/leaderboard';
import { cn } from '@/lib/utils';
import { useIsGreen } from '@/lib/useThemeTokens';
import { useRouter } from 'next/navigation';
import { Trophy, Medal, BookOpen, Gamepad2, Flame, Star, Award, Crown, Clock, Target, ArrowRight } from 'lucide-react';

type Mode = 'most-exams' | 'streak' | 'leaderboard';

export default function Leaderboard() {
  const { attempts, gameScores, exams, currentUser, activityDates } = useExamStore();
  const [mode, setMode] = useState<Mode>('leaderboard');
  const isGreenTheme = useIsGreen();
  const router = useRouter();

  const [userNameMap, setUserNameMap] = useState<Record<string, string>>({});
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [streakData, setStreakData] = useState<any[]>([]);
  const [mostExamsData, setMostExamsData] = useState<any[]>([]);
  const [loadingLB, setLoadingLB] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/users', { cache: 'no-store' }).then(r => r.json()).catch(() => ({ success: false })),
      fetch('/api/leaderboard', { cache: 'no-store' }).then(r => r.json()).catch(() => ({ success: false })),
      fetch('/api/leaderboard/stats', { cache: 'no-store' }).then(r => r.json()).catch(() => ({ success: false })),
    ]).then(([usersData, lbData, statsData]) => {
      if (usersData.success && usersData.users) {
        const map: Record<string, string> = {};
        usersData.users.forEach((u: any) => {
          const name = u.name?.trim();
          if (name && name !== 'Học Sinh Đăng Nhập') map[u.id] = name;
          else if (u.email?.includes('@')) map[u.id] = u.email.split('@')[0];
          else map[u.id] = u.email || u.id;
        });
        setUserNameMap(map);
      }
      if (lbData.success && lbData.leaderboard) setLeaderboardData(lbData.leaderboard.filter((e: { userId: string }) => shouldShowOnLeaderboard(e.userId)));
      if (statsData.success) {
        if (statsData.streak) setStreakData(statsData.streak);
        if (statsData.mostExams) setMostExamsData(statsData.mostExams);
      }
      setLoadingLB(false);
    }).catch(() => setLoadingLB(false));
  }, []);

  const accentBg = 'bg-[var(--accent)]';
  const accentText = 'text-[var(--accent)]';
  const accentBorder = 'border-[var(--accent)]';
  const accentLight = isGreenTheme ? 'bg-[var(--accent-light)]/15' : 'bg-[var(--accent)]/8';

  const getDisplayName = (entry: { userId: string; name?: string; email?: string }) => {
    const serverName = entry.name?.trim();
    if (serverName && serverName !== 'Học Sinh Đăng Nhập' && serverName !== 'student-curr' && serverName !== 'guest') return serverName.includes('@') ? serverName.split('@')[0] : serverName;
    const mapped = userNameMap[entry.userId];
    if (mapped) return mapped.includes('@') ? mapped.split('@')[0] : mapped;
    if (entry.email?.includes('@')) return entry.email.split('@')[0];
    if (currentUser && entry.userId === currentUser.id) return currentUser.name?.trim() || currentUser.email?.split('@')[0] || entry.userId;
    return serverName || entry.userId;
  };

  const isMe = (userId: string) => userId === currentUser?.id;
  const getInitials = (name: string) => name.charAt(0).toUpperCase();

  const localMostExams = useMemo(() => {
    const map = new Map<string, { userId: string; name: string; email?: string; examCount: number; gameCount: number }>();
    attempts.forEach(a => {
      const e = map.get(a.userId) || { userId: a.userId, name: userNameMap[a.userId] || (a.userId === currentUser?.id ? currentUser!.name : a.userId), email: a.userId === currentUser?.id ? currentUser?.email : undefined, examCount: 0, gameCount: 0 };
      e.examCount++; map.set(a.userId, e);
    });
    gameScores.forEach(g => {
      const e = map.get(g.userId) || { userId: g.userId, name: userNameMap[g.userId] || (g.userId === currentUser?.id ? currentUser!.name : g.userId), email: g.userId === currentUser?.id ? currentUser?.email : undefined, examCount: 0, gameCount: 0 };
      e.gameCount++; map.set(g.userId, e);
    });
    return Array.from(map.values()).filter(u => shouldShowOnLeaderboard(u.userId)).sort((a, b) => b.examCount - a.examCount).slice(0, 10);
  }, [attempts, gameScores, currentUser, userNameMap]);

  const displayedMostExams = mostExamsData.length > 0 ? mostExamsData : localMostExams;

  const displayedStreak = useMemo(() => {
    const merged = new Map<string, { userId: string; name: string; email?: string; streak: number }>();
    for (const entry of streakData) merged.set(entry.userId, { ...entry });
    const localUserIds = new Set<string>();
    if (currentUser) localUserIds.add(currentUser.id);
    attempts.forEach(a => localUserIds.add(a.userId));
    gameScores.forEach(g => localUserIds.add(g.userId));
    const activitySources = { activityDates, attempts, gameScores };
    for (const userId of localUserIds) {
      if (!shouldShowOnLeaderboard(userId)) continue;
      const dates = collectActivityDatesForUser(userId, activitySources, currentUser?.id);
      if (dates.length === 0) continue;
      const localStreak = computeStreak(dates);
      if (localStreak <= 0) continue;
      const existing = merged.get(userId);
      const streak = existing ? Math.max(existing.streak, localStreak) : localStreak;
      merged.set(userId, {
        userId, streak,
        name: getDisplayName({ userId, name: existing?.name || userNameMap[userId] || (userId === currentUser?.id ? currentUser?.name : undefined), email: existing?.email || (userId === currentUser?.id ? currentUser?.email : undefined) }),
        email: existing?.email || (userId === currentUser?.id ? currentUser?.email : undefined),
      });
    }
    return Array.from(merged.values()).filter(e => e.streak > 0 && shouldShowOnLeaderboard(e.userId)).sort((a, b) => b.streak - a.streak).slice(0, 10);
  }, [streakData, activityDates, attempts, gameScores, currentUser, userNameMap]);

  const YouBadge = () => <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-sans font-bold uppercase tracking-wider", accentLight, accentText)}>Bạn</span>;

  const medals = [
    { bg: 'bg-amber-50 border-amber-400', ring: 'ring-amber-400/30', circle: 'bg-amber-400 text-white', label: 'Vàng', textColor: 'text-amber-600' },
    { bg: 'bg-slate-50 border-slate-400', ring: 'ring-slate-400/30', circle: 'bg-slate-300 text-white', label: 'Bạc', textColor: 'text-slate-500' },
    { bg: 'bg-orange-50 border-orange-400', ring: 'ring-orange-400/30', circle: 'bg-orange-400 text-white', label: 'Đồng', textColor: 'text-orange-600' },
  ];

  const RankBadge = ({ rank }: { rank: number }) => {
    if (rank === 0) return <Crown className="w-5 h-5 text-amber-500" />;
    if (rank === 1) return <Medal className="w-5 h-5 text-slate-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-orange-500" />;
    return <span className="text-xs font-mono text-neutral-400 w-5 text-center font-bold">#{rank + 1}</span>;
  };

  function getRowCls(i: number): string {
    if (i === 0) return 'bg-amber-50 border-amber-300';
    if (i === 1) return 'bg-slate-50 border-slate-300';
    if (i === 2) return 'bg-orange-50 border-orange-300';
    return 'bg-[var(--card-bg)] border-[var(--border-default)]';
  }

  function StreakBadge({ streak }: { streak: number }) {
    return (
      <div className={cn(
        'shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl min-w-[52px]',
        streak >= 7 ? 'bg-orange-100 text-orange-700' : streak >= 3 ? 'bg-amber-50 text-amber-600' : 'bg-neutral-100 text-neutral-600',
      )}>
        <Flame className={cn(
          'w-4 h-4',
          streak >= 7 ? 'text-orange-500 fill-orange-500' : streak >= 3 ? 'text-amber-500 fill-amber-500' : 'text-neutral-400',
        )} />
        <span className="text-lg font-mono font-bold leading-none">{streak}</span>
        <span className="text-[9px] font-sans uppercase tracking-wide opacity-70">ngày</span>
      </div>
    );
  }

  function RowBase({ userId, i, initials, displayName, children, trailing }: {
    userId: string; i: number; initials: string; displayName: string; children: React.ReactNode; trailing?: React.ReactNode;
  }) {
    return (
      <div className={cn("flex items-center gap-4 p-4 rounded-2xl border transition-all", getRowCls(i), isMe(userId) ? `ring-2 ring-offset-1 ${accentBorder}` : '')}>
        <div className="shrink-0 w-8 flex justify-center"><RankBadge rank={i} /></div>
        <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0", isMe(userId) ? `${accentBg} text-white` : 'bg-neutral-100 text-[var(--text-secondary)]')}>{initials}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-serif font-bold text-[#1A1814] truncate">{displayName}</p>
            {isMe(userId) && <YouBadge />}
          </div>
          {children}
        </div>
        {trailing}
      </div>
    );
  }

  const LoadingSpinner = ({ text = 'Đang tải...' }) => (
    <div className="text-center py-16 text-neutral-400">
      <div className={cn("w-8 h-8 border border-t-transparent rounded-full animate-spin mx-auto mb-3", accentBorder)} />
      <p className="font-sans text-sm">{text}</p>
    </div>
  );

  const EmptyState = ({
    icon: Icon,
    text,
    subtext,
    ctaLabel,
    ctaPath,
  }: {
    icon: any;
    text: string;
    subtext?: string;
    ctaLabel?: string;
    ctaPath?: string;
  }) => (
    <div className="text-center py-14 px-6">
      <div className={cn('w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center', accentLight)}>
        <Icon className={cn('w-7 h-7', accentText)} />
      </div>
      <p className="font-serif font-bold text-sm text-[#1A1814]">{text}</p>
      {subtext && <p className="font-sans text-xs text-[#78716C] mt-2 max-w-xs mx-auto leading-relaxed">{subtext}</p>}
      {ctaLabel && ctaPath && (
        <button
          type="button"
          onClick={() => router.push(ctaPath)}
          className={cn(
            'mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-sans font-bold uppercase tracking-wider text-white transition-all cursor-pointer hover:opacity-90 active:scale-[0.98]',
            accentBg,
          )}
        >
          {ctaLabel}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );

  const modeTabs: { key: Mode; icon: any; label: string }[] = [
    { key: 'leaderboard', icon: Trophy, label: 'Bảng Xếp Hạng' },
    { key: 'most-exams', icon: BookOpen, label: 'Nhiều Bài Nhất' },
    { key: 'streak', icon: Flame, label: 'Streak Cao Nhất' },
  ];

  return (
    <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="text-center space-y-3">
        <span className={cn("text-[11px] font-sans font-bold tracking-[0.2em] uppercase", accentText)}>BẢNG XẾP HẠNG</span>
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#1A1814] tracking-tight">Thành Tích Nổi Bật</h2>
        <p className="text-sm text-neutral-500 font-sans max-w-lg mx-auto leading-relaxed">Xếp hạng dựa trên điểm số, thời gian và thành tích học tập thực tế từ cơ sở dữ liệu.</p>
      </div>

      <div className="flex items-center justify-center gap-2 bg-neutral-100 p-1 rounded-2xl w-fit mx-auto border border-neutral-200/60 flex-wrap">
        {modeTabs.map(({ key, icon: Icon, label }) => (
          <button key={key} onClick={() => setMode(key)}
            className={cn("flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer",
              mode === key ? `${accentBg} text-white shadow-md` : 'text-neutral-500 hover:text-neutral-800'
            )}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {mode === 'leaderboard' && (
        loadingLB ? <LoadingSpinner text="Đang tải bảng xếp hạng..." /> :
          leaderboardData.length === 0 ? (
            <EmptyState
              icon={Trophy}
              text="Chưa có dữ liệu bảng xếp hạng"
              subtext="Hoàn thành bài thi để xuất hiện trên bảng."
              ctaLabel="Làm đề thử"
              ctaPath="/quiz"
            />
          ) : (
            <div className="space-y-4">
              {leaderboardData.map((entry: any, i: number) => {
                const displayName = getDisplayName(entry);
                const initials = getInitials(displayName);
                if (i < 3) {
                  const m = medals[i];
                  return (
                    <div key={entry.userId} className={cn("card-layered relative overflow-hidden p-5 transition-all", m.bg, isMe(entry.userId) ? `ring-2 ring-offset-2 ${accentBorder}` : "")}>
                      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10" style={{ backgroundColor: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : '#f97316' }} />
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="shrink-0 flex flex-col items-center">
                          <div className={cn("w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shadow-md", m.circle)}>{initials}</div>
                          <span className={cn("text-[9px] font-serif font-bold uppercase tracking-wider mt-1", m.textColor)}>{m.label}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-serif font-bold text-[#1A1814] truncate">{displayName}</h3>
                            {isMe(entry.userId) && <YouBadge />}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] font-sans text-[var(--text-secondary)]">
                            <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> {entry.bestScore?.toFixed(1) || '0'} điểm</span>
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {entry.bestTime || 0}s</span>
                            <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {entry.totalExams || 0} bài</span>
                          </div>
                        </div>
                        <div className="shrink-0 text-center">
                          <div className={cn("text-2xl font-mono font-bold", m.textColor)}>{entry.bestScore?.toFixed(1) || '0'}</div>
                          <div className="text-[9px] font-sans font-bold text-neutral-400 uppercase tracking-wider">Điểm</div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-black/5 grid grid-cols-3 gap-3 text-center">
                        {[
                          { label: 'Đúng', value: entry.totalCorrect || 0 },
                          { label: 'Sai', value: entry.totalWrong || 0 },
                          { label: 'Bài thi', value: entry.totalExams || 0 },
                        ].map(s => (
                          <div key={s.label}><div className="text-sm font-mono font-bold text-[#1A1814]">{s.value}</div><div className="text-[9px] font-sans text-neutral-500">{s.label}</div></div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return (
                  <RowBase key={entry.userId} userId={entry.userId} i={i} initials={initials} displayName={displayName}>
                    <p className="text-[10px] text-neutral-500 font-sans">{entry.totalExams || 0} bài thi · {entry.totalCorrect || 0} đúng / {entry.totalWrong || 0} sai</p>
                  </RowBase>
                );
              })}
            </div>
          )
      )}

      {mode === 'most-exams' && (
        loadingLB ? <LoadingSpinner /> :
          displayedMostExams.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              text="Chưa có dữ liệu bài thi"
              subtext="Làm bài thi hoặc chơi game để ghi nhận hoạt động."
              ctaLabel="Làm đề thử"
              ctaPath="/quiz"
            />
          ) : (
            <div className="space-y-2.5">
              {displayedMostExams.map((u: any, i: number) => {
                const displayName = getDisplayName({ name: u.name, userId: u.userId, email: u.email });
                const initials = getInitials(displayName);
                return (
                  <RowBase key={u.userId} userId={u.userId} i={i} initials={initials} displayName={displayName}>
                    <div className="flex items-center gap-3 mt-0.5 text-[10px] font-sans text-neutral-500">
                      <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {u.examCount} bài thi</span>
                      <span className="flex items-center gap-1"><Gamepad2 className="w-3 h-3" /> {u.gameCount} game</span>
                      <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {u.examCount + u.gameCount} hoạt động</span>
                    </div>
                  </RowBase>
                );
              })}
            </div>
          )
      )}

      {mode === 'streak' && (
        loadingLB ? <LoadingSpinner /> :
          displayedStreak.length === 0 ? (
            <EmptyState
              icon={Flame}
              text="Chưa có streak"
              subtext="Làm bài mỗi ngày để tích lũy chuỗi ngày học."
              ctaLabel="Bắt đầu hôm nay"
              ctaPath="/quiz"
            />
          ) : (
            <div className="space-y-2.5">
              {displayedStreak.map((u: any, i: number) => {
                const displayName = getDisplayName({ name: u.name, userId: u.userId, email: u.email });
                const initials = getInitials(displayName);
                const streakDays = u.streak ?? 0;
                return (
                  <RowBase
                    key={u.userId}
                    userId={u.userId}
                    i={i}
                    initials={initials}
                    displayName={displayName}
                    trailing={<StreakBadge streak={streakDays} />}
                  >
                    <p className="text-[10px] font-sans text-neutral-500 mt-0.5">
                      Streak <strong className="text-[var(--text-primary)]">{streakDays} ngày</strong>
                      {' · '}
                      {isMe(u.userId) ? 'Duy trì học tập mỗi ngày' : 'Đang cố gắng duy trì thói quen'}
                    </p>
                  </RowBase>
                );
              })}
            </div>
          )
      )}

      {currentUser && (
        <div className="card-layered p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Award className={cn("w-6 h-6", accentText)} />
            <div>
              <p className="text-sm font-serif font-bold text-[#1A1814]">Thành tích cá nhân</p>
              <p className="text-[10px] text-neutral-500 font-sans flex items-center gap-3 mt-0.5 flex-wrap">
                <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {attempts.filter(a => a.userId === currentUser.id).length} bài thi</span>
                <span className="flex items-center gap-1"><Gamepad2 className="w-3 h-3" /> {gameScores.filter(g => g.userId === currentUser.id).length} game</span>
                <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500" /> Streak {computeStreak(activityDates)} ngày</span>
              </p>
            </div>
          </div>
          <div className={cn("text-2xl font-mono font-bold", accentText)}>{attempts.filter(a => a.userId === currentUser.id).length + gameScores.filter(g => g.userId === currentUser.id).length}</div>
        </div>
      )}
    </div>
  );
}
