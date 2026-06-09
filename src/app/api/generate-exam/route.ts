import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { findExamOwner } from '@/lib/users';
import type { Answer, Exam, Question } from '@/types';

type ParsedAnswer = Pick<Answer, 'content'> & Partial<Pick<Answer, 'isCorrect'>>;
type ParsedQuestion = Pick<Question, 'content'> & Partial<Pick<Question, 'points' | 'explanation'>> & {
  answers?: ParsedAnswer[];
};
type ParsedExam = Partial<Pick<Exam, 'title' | 'description' | 'duration'>> & {
  questions: ParsedQuestion[];
};

interface GenerateExamPayload {
  fileName?: string;
  parsedExam?: ParsedExam;
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function isParsedExam(value: unknown): value is ParsedExam {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as { questions?: unknown };
  return Array.isArray(candidate.questions) && candidate.questions.length > 0;
}

export async function POST(req: NextRequest) {
  try {
    const { fileName = 'tai-lieu-on-tap', parsedExam } = await req.json() as GenerateExamPayload;

    if (!isParsedExam(parsedExam)) {
      return NextResponse.json({ success: false, error: 'Dữ liệu đề thi đã bóc tách không hợp lệ.' }, { status: 400 });
    }

    console.log(`[Offline Sync] Saving parsed exam from file: "${fileName}" to Prisma DB...`);

    const examId = `gen-exam-${Date.now()}`;
    const mappedQuestions: Question[] = parsedExam.questions.map((q, qIdx) => {
      const qId = `gen-q-${qIdx}-${Date.now()}`;
      return {
        id: qId,
        content: q.content,
        points: q.points || 2,
        order: qIdx + 1,
        explanation: q.explanation || 'Đáp án đúng theo tài liệu mẫu.',
        answers: (q.answers || []).map((a, aIdx) => ({
          id: `gen-a-${qIdx}-${aIdx}-${Date.now()}`,
          content: a.content,
          isCorrect: !!a.isCorrect
        }))
      };
    });

    const newExam: Exam = {
      id: examId,
      title: parsedExam.title || `Đề Ôn Tập - ${fileName}`,
      description: parsedExam.description || 'Đề khảo thí thiết kế sinh động từ file dữ liệu của giáo viên.',
      duration: Number(parsedExam.duration) || 15,
      createdAt: new Date().toISOString(),
      questions: mappedQuestions
    };

    try {
      const prisma = getPrisma();
      if (!prisma) throw new Error('DB_OFFLINE');
      const creator = await findExamOwner(prisma);
      if (!creator) throw new Error('Chưa có tài khoản hợp lệ để lưu đề thi.');
      const creatorId = creator.id;

      await prisma.exam.create({
        data: {
          id: newExam.id,
          title: newExam.title,
          description: newExam.description,
          duration: newExam.duration,
          userId: creatorId,
          questions: {
            create: mappedQuestions.map((mq) => ({
              id: mq.id,
              content: mq.content,
              explanation: mq.explanation,
              points: mq.points,
              order: mq.order,
              answers: {
                create: mq.answers.map((ma) => ({
                  id: ma.id,
                  content: ma.content,
                  isCorrect: ma.isCorrect
                }))
              }
            }))
          }
        }
      });
      console.log(`[DB Sync] Dynamically created exam saved to Neon PostgreSQL successfully! Id: ${newExam.id}`);
    } catch (saveError) {
      console.warn('[DB Error] Could not persist generated exam to SQL database, operating offline-first on frontend:', saveError);
    }

    return NextResponse.json({ success: true, exam: newExam });
  } catch (err: unknown) {
    console.error('[Offline Sync Error]:', err);
    return NextResponse.json({ success: false, error: getErrorMessage(err, 'Không thể lưu đề thi.') }, { status: 500 });
  }
}
