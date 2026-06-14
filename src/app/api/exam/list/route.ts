import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function GET() {
  try {
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

    return NextResponse.json({ success: true, exams });
  } catch (err: any) {
    console.error('[Exam List Error]:', err);
    return NextResponse.json({ success: false, error: err.message, exams: [] }, { status: 500 });
  }
}
