import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { findRealUser, isPlaceholderUserId } from '@/lib/users';
import { memoryCache } from '@/lib/cache';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data || !data.examId || !data.userId) {
      return NextResponse.json({ success: false, error: 'Thiếu thông tin kết quả.' }, { status: 400 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ success: false, error: 'DB_OFFLINE', offlineSaved: true });
    }

    if (isPlaceholderUserId(data.userId)) {
      return NextResponse.json({ success: false, error: 'Vui lòng đăng nhập để lưu kết quả.' }, { status: 401 });
    }

    const user = await findRealUser(prisma, data.userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Tài khoản không tồn tại.' }, { status: 404 });
    }

    const result = await prisma.userExamResult.create({
      data: {
        userId: user.id,
        examId: data.examId,
        examTitle: data.examTitle || '',
        score: parseFloat(data.score),
        correctAnswers: Number(data.correctAnswers),
        wrongAnswers: Number(data.wrongAnswers),
        timeSpent: Number(data.timeSpent),
        completedAt: new Date(),
      },
    });

    console.log(`[UserExamResult] Saved for user ${data.userId}, exam ${data.examId}, score ${data.score}`);
    // Invalidate cache
    memoryCache.delete('leaderboard:list');
    memoryCache.delete('leaderboard:stats');

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error('[UserExamResult Error]:', err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
