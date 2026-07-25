import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { memoryCache } from '@/lib/cache';

interface DeleteExamBody {
  examId?: unknown;
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json() as DeleteExamBody;
    const examId = typeof body.examId === 'string' ? body.examId.trim() : '';

    if (!examId) {
      return NextResponse.json({ success: false, error: 'Thiếu mã đề thi.' }, { status: 400 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ success: false, error: 'DB_OFFLINE' }, { status: 503 });
    }

    // Execute manual cascade deletions in a transaction to guarantee completeness and optimize Neon capacity
    const deletedCount = await prisma.$transaction(async (tx) => {
      // 1. Delete associated UserExamResult records (since it lacks direct relational cascade)
      await tx.userExamResult.deleteMany({ where: { examId: examId } });

      // 2. Delete associated ExamAttempt records
      await tx.examAttempt.deleteMany({ where: { examId: examId } });

      // 3. Delete Answer records linked to the Questions of this Exam
      await tx.answer.deleteMany({
        where: {
          question: {
            examId: examId,
          },
        },
      });

      // 4. Delete Question records linked to this Exam
      await tx.question.deleteMany({ where: { examId: examId } });

      // 5. Delete the Exam itself
      const examDelete = await tx.exam.deleteMany({ where: { id: examId } });
      return examDelete.count;
    });

    // Invalidate cache
    memoryCache.delete('exams:list');

    return NextResponse.json({ success: true, deleted: deletedCount > 0 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Không thể xóa đề thi.';
    console.error('[Exam Delete Error]:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
