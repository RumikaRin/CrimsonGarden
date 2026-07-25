import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { findExamOwner, findRealUser, isPlaceholderUserId } from '@/lib/users';
import { memoryCache } from '@/lib/cache';

export async function POST(req: NextRequest) {
  try {
    const { exam } = await req.json();
    if (!exam || !exam.id || !exam.title || !exam.questions?.length) {
      return NextResponse.json({ success: false, error: 'Thông tin đề thi không hợp lệ.' }, { status: 400 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      // DB offline — still OK, exam saved client-side
      return NextResponse.json({ success: false, error: 'DB_OFFLINE', offlineSaved: true });
    }

    // Check if exam already exists
    const existing = await prisma.exam.findUnique({ where: { id: exam.id } });
    if (existing) {
      return NextResponse.json({ success: true, exam: existing, alreadyExists: true });
    }

    let ownerId = exam.userId;
    if (!ownerId || isPlaceholderUserId(ownerId)) {
      const owner = await findExamOwner(prisma);
      if (!owner) {
        return NextResponse.json({ success: false, error: 'Chưa có tài khoản hợp lệ để tạo đề thi.' }, { status: 400 });
      }
      ownerId = owner.id;
    } else {
      const owner = await findRealUser(prisma, ownerId);
      if (!owner) {
        return NextResponse.json({ success: false, error: 'Tài khoản không tồn tại.' }, { status: 404 });
      }
      ownerId = owner.id;
    }

    const newExam = await prisma.exam.create({
      data: {
        id: exam.id,
        title: exam.title,
        description: exam.description || '',
        duration: exam.duration || 15,
        userId: ownerId,
        questions: {
          create: exam.questions.map((q: any, idx: number) => ({
            id: q.id,
            content: q.content,
            points: q.points || 2,
            order: q.order || idx + 1,
            explanation: q.explanation || '',
            imageUrl: q.imageUrl || null,
            imageSvg: q.imageSvg || null,
            answers: {
              create: q.answers.map((a: any) => ({
                id: a.id,
                content: a.content,
                isCorrect: a.isCorrect,
              }))
            }
          }))
        }
      }
    });

    // Invalidate cache
    memoryCache.delete('exams:list');

    return NextResponse.json({ success: true, exam: newExam });
  } catch (err: any) {
    console.error('[Exam Create Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
