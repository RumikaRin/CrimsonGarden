import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { memoryCache } from '@/lib/cache';

export async function GET() {
  try {
    // 1. Kiểm tra cache trước
    const cachedExams = memoryCache.get<any[]>('exams:list');
    if (cachedExams) {
      return NextResponse.json({ success: true, exams: cachedExams, fromCache: true });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ success: false, error: 'DB_OFFLINE', exams: [] });
    }

    const exams = await prisma.exam.findMany({
      include: {
        questions: {
          include: {
            answers: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 2. Lưu vào cache trong 60 giây
    memoryCache.set('exams:list', exams, 60);

    return NextResponse.json({ success: true, exams });
  } catch (err: any) {
    console.error('[Exam List Error]:', err);
    return NextResponse.json({ success: false, error: err.message, exams: [] }, { status: 500 });
  }
}
