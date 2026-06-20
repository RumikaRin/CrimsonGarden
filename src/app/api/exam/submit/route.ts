import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { findRealUser, isPlaceholderUserId } from '@/lib/users';

interface ExamAttemptBody {
  id?: unknown;
  userId?: unknown;
  examId?: unknown;
  score?: unknown;
  durationSec?: unknown;
  answers?: unknown;
  startedAt?: unknown;
  endedAt?: unknown;
}

function parseOptionalDate(value: unknown): Date {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
    ? new Date(value)
    : new Date();
}

export async function POST(req: NextRequest) {
  try {
    const attemptData = await req.json() as ExamAttemptBody;
    const examId = typeof attemptData.examId === 'string' ? attemptData.examId : '';
    const userId = typeof attemptData.userId === 'string' ? attemptData.userId : '';
    const answers = attemptData.answers;

    if (!examId || !userId || !answers || typeof answers !== 'object' || Array.isArray(answers)) {
      return NextResponse.json({ success: false, error: 'Thông tin kết quả thi không hợp lệ.' }, { status: 400 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({
        success: true,
        warning: 'DATABASE_URL chưa cấu hình. Kết quả thi được lưu tại trình duyệt.',
      });
    }

    if (isPlaceholderUserId(userId)) {
      return NextResponse.json({ success: false, error: 'Vui lòng đăng nhập để lưu kết quả thi.' }, { status: 401 });
    }

    const [dbUser, existingExam] = await Promise.all([
      findRealUser(prisma, userId),
      prisma.exam.findUnique({ where: { id: examId }, select: { id: true } }),
    ]);

    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'Tài khoản không tồn tại.' }, { status: 404 });
    }
    if (!existingExam) {
      return NextResponse.json({ success: false, error: 'Đề thi không còn tồn tại.' }, { status: 404 });
    }

    const score = Number(attemptData.score);
    const durationSec = Number(attemptData.durationSec);
    if (!Number.isFinite(score) || !Number.isFinite(durationSec)) {
      return NextResponse.json({ success: false, error: 'Điểm số hoặc thời gian không hợp lệ.' }, { status: 400 });
    }

    const attempt = await prisma.examAttempt.create({
      data: {
        id: typeof attemptData.id === 'string' ? attemptData.id : `att-${Date.now()}`,
        score,
        durationSec,
        answers,
        userId: dbUser.id,
        examId,
        startedAt: parseOptionalDate(attemptData.startedAt),
        endedAt: parseOptionalDate(attemptData.endedAt),
      },
    });

    return NextResponse.json({ success: true, attempt });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Không thể đồng bộ kết quả thi.';
    console.error('[Prisma Exam Submit Error]:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
