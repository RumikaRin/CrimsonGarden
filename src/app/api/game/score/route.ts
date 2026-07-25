import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { findRealUser, isPlaceholderUserId } from '@/lib/users';
import { memoryCache } from '@/lib/cache';
import { jwt } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const scoreData = await req.json();

    if (!scoreData || scoreData.score === undefined) {
      return NextResponse.json({ success: false, error: 'Tham số điểm số không hợp lệ.' }, { status: 400 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({
        success: true,
        warning: 'DATABASE_URL chưa cấu hình. Điểm lưu tại trình duyệt.',
      });
    }

    const userId = scoreData.userId;
    if (isPlaceholderUserId(userId)) {
      return NextResponse.json({ success: false, error: 'Vui lòng đăng nhập để lưu điểm game.' }, { status: 401 });
    }

    // Xác thực token JWT
    const cookieHeader = req.headers.get('cookie');
    const token = jwt.getTokenFromCookieString(cookieHeader);
    const decoded = jwt.verify(token || '');
    if (!decoded || decoded.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ.' }, { status: 401 });
    }

    const dbUser = await findRealUser(prisma, userId);
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'Tài khoản không tồn tại.' }, { status: 404 });
    }

    const savedScore = await prisma.gameScore.create({
      data: {
        id: scoreData.id || `game-${Date.now()}`,
        score: Number(scoreData.score),
        vocabularyCategory: scoreData.vocabularyCategory || 'Tổng hợp',
        durationSeconds: Number(scoreData.durationSeconds) || 0,
        userId: dbUser.id,
        playedAt: scoreData.playedAt ? new Date(scoreData.playedAt) : new Date()
      }
    });

    // Invalidate cache
    memoryCache.delete('leaderboard:list');
    memoryCache.delete('leaderboard:stats');

    return NextResponse.json({ success: true, score: savedScore });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Game Score Error]:', err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
