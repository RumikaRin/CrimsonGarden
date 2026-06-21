import { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/prisma';
import { findExamOwner } from '@/lib/users';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Answer, Exam, Question } from '@/types';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
    responseLimit: '200mb',
  },
};

function parseBase64(dataUrl: string): { mimeType: string; base64Data: string } | null {
  if (!dataUrl.startsWith('data:')) return null;
  const commaIndex = dataUrl.indexOf(',');
  if (commaIndex === -1) return null;
  const mediaSpec = dataUrl.substring(5, commaIndex);
  const parts = mediaSpec.split(';');
  if (!parts.includes('base64')) return null;
  return {
    mimeType: parts[0] || '',
    base64Data: dataUrl.substring(commaIndex + 1)
  };
}

async function runLocalPdfParser(pdfBase64: string): Promise<any> {
  const tempDir = path.join(process.cwd(), 'temp_uploads');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  const tempFilePath = path.join(tempDir, `temp_upload_${Date.now()}.pdf`);
  
  const parsed = parseBase64(pdfBase64);
  if (!parsed) {
    throw new Error('Dữ liệu tệp tin base64 không đúng định dạng.');
  }
  const base64Data = parsed.base64Data;
  fs.writeFileSync(tempFilePath, Buffer.from(base64Data, 'base64'));

  try {
    const pythonScriptPath = path.join(process.cwd(), 'src', 'lib', 'pdf_parser.py');
    const commands = [
      `C:\\Users\\sansm\\AppData\\Local\\Microsoft\\WindowsApps\\python.exe "${pythonScriptPath}" "${tempFilePath}"`,
      `python "${pythonScriptPath}" "${tempFilePath}"`,
      `python3 "${pythonScriptPath}" "${tempFilePath}"`
    ];

    let stdout = '';
    let lastError: any = null;

    for (const cmd of commands) {
      try {
        const { stdout: out } = await execAsync(cmd, { maxBuffer: 1024 * 1024 * 200 }); // 200MB buffer
        stdout = out;
        break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!stdout && lastError) {
      throw new Error(`Lỗi thực thi script Python: ${lastError.message}`);
    }

    const result = JSON.parse(stdout.trim());
    if (!result.success) {
      throw new Error(result.error || 'Lỗi bóc tách PDF không xác định.');
    }

    return result.exam;
  } finally {
    if (fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {}
    }
  }
}

async function runGeminiParser(base64Data: string, mimeType: string, fileName: string): Promise<ParsedExam> {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('Vui lòng cung cấp GEMINI_API_KEY trong cấu hình .env để bóc tách tệp bằng AI.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: { responseMimeType: 'application/json' }
  });

  const isPdfMime = mimeType === 'application/pdf';
  const prompt = `Bạn là một chuyên gia khảo thí và biên soạn đề kiểm tra hàng đầu.
Hãy phân tích tệp tài liệu được gửi kèm (Định dạng: ${mimeType}, Tên: ${fileName}).
Tệp này có thể là đề kiểm tra, tài liệu ôn tập hoặc hình ảnh đề thi.
Hãy bóc tách hoặc biên soạn một đề thi thử trắc nghiệm từ tài liệu này.

Yêu cầu chi tiết:
1. Đọc kỹ nội dung văn bản và bất kỳ hình ảnh nào trong tài liệu.
2. Thiết kế đề thi gồm:
    - Tiêu đề đề thi sinh động, hấp dẫn bằng tiếng Việt.
    - Mô tả ngắn giới thiệu chủ đề ôn tập.
    - Thời gian làm bài hợp lý (trung bình 1.5 đến 2 phút cho mỗi câu).
    - Hãy trích xuất và bóc tách NHIỀU câu hỏi nhất có thể (tối đa 40 câu, phân bố đều từ đầu đến cuối tài liệu). Nếu tài liệu không có câu hỏi trắc nghiệm sẵn, hãy biên soạn 20-30 câu chất lượng cao dựa trên nội dung tài liệu.
    - Mỗi câu hỏi có 4 lựa chọn (A, B, C, D) với ĐÁP ÁN ĐÚNG DUY NHẤT và GIẢI THÍCH chi tiết bằng tiếng Việt.
3. QUAN TRỌNG VỀ HÌNH ẢNH:
   - Nếu câu hỏi liên quan trực tiếp đến một hình ảnh trong tài liệu, hãy thiết kế lại hình ảnh đó thành mã SVG tự dựng (trong trường "imageSvg"), responsive, màu chalk #F2EFE7 và crimson #DC143C.
   - Nếu không cần hình ảnh, để trống "imageUrl" và "imageSvg".

Hãy xuất kết quả chính xác theo JSON Schema sau:
{
  "title": string,
  "description": string,
  "duration": number,
  "questions": [
    {
      "content": string,
      "explanation": string,
      "points": number,
      "imageUrl": string,
      "imageSvg": string,
      "answers": [
        { "content": string, "isCorrect": boolean }
      ]
    }
  ]
}`;

  const result = await model.generateContent([
    { inlineData: { data: base64Data, mimeType } },
    prompt
  ]);
  const textOutput = result.response.text();
  if (!textOutput) throw new Error('Gemini không phản hồi văn bản định dạng mong muốn.');

  const generated = JSON.parse(textOutput);
  const isImageMime = mimeType.startsWith('image/');
  const mappedQuestions = (generated.questions || []).map((q: any) => {
    let qImageUrl = q.imageUrl;
    if (qImageUrl === 'uploaded_file' && isImageMime) {
      qImageUrl = `data:${mimeType};base64,${base64Data}`;
    } else if (qImageUrl === 'uploaded_file' && isPdfMime) {
      qImageUrl = undefined; // Can't embed PDF page as image via Gemini
    }
    return {
      content: q.content,
      points: q.points || 2,
      explanation: q.explanation || 'Đáp án đúng dựa vào tài liệu.',
      imageUrl: qImageUrl || undefined,
      imageSvg: q.imageSvg || undefined,
      answers: q.answers || []
    };
  });

  return {
    title: generated.title || fileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
    description: generated.description || 'Đề thi được bóc tách tự động bằng AI từ tài liệu.',
    duration: Number(generated.duration) || 15,
    questions: mappedQuestions
  };
}


type ParsedAnswer = Pick<Answer, 'content'> & Partial<Pick<Answer, 'isCorrect'>>;
type ParsedQuestion = Pick<Question, 'content'> & Partial<Pick<Question, 'points' | 'explanation' | 'imageUrl' | 'imageSvg'>> & {
  answers?: ParsedAnswer[];
};
type ParsedExam = Partial<Pick<Exam, 'title' | 'description' | 'duration'>> & {
  questions: ParsedQuestion[];
};

interface GenerateExamPayload {
  fileName?: string;
  fileType?: string;
  fileSizeKB?: number;
  parsedExam?: ParsedExam;
  fileData?: string; // base64 data url
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function isParsedExam(value: unknown): value is ParsedExam {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as { questions?: unknown };
  return Array.isArray(candidate.questions) && candidate.questions.length > 0;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Phương thức không được hỗ trợ.' });
  }

  try {
    const { fileName = 'tai-lieu-on-tap', fileType = '', fileSizeKB = 0, parsedExam, fileData } = req.body as GenerateExamPayload;

    let finalExamData: ParsedExam | undefined;

    if (fileData) {
      const isPdf = fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
      const parsed = parseBase64(fileData);
      if (!parsed) {
        return res.status(400).json({ success: false, error: 'Dữ liệu tệp tin base64 không đúng định dạng.' });
      }
      const { mimeType, base64Data } = parsed;

      if (isPdf) {
        // Strategy 1: try local Python parser (works on local dev with Python installed)
        let pythonSuccess = false;
        if (!process.env.VERCEL) {
          try {
            console.log(`[Local Python] Parsing PDF: "${fileName}"...`);
            finalExamData = await runLocalPdfParser(fileData);
            pythonSuccess = true;
            console.log(`[Local Python] Success: ${finalExamData!.questions.length} questions extracted.`);
          } catch (pythonErr) {
            console.warn('[Local Python] Failed, falling back to Gemini:', getErrorMessage(pythonErr, 'unknown'));
          }
        }

        // Strategy 2: Gemini AI fallback (always used on Vercel, or when Python fails locally)
        if (!pythonSuccess) {
          console.log(`[Gemini PDF] Parsing PDF via Gemini AI: "${fileName}"...`);
          finalExamData = await runGeminiParser(base64Data, 'application/pdf', fileName);
          console.log(`[Gemini PDF] Success: ${finalExamData.questions.length} questions extracted.`);
        }
      } else {
        // Non-PDF files (images, etc.) → always use Gemini
        console.log(`[Gemini Engine] Parsing file via Gemini: "${fileName}" (${mimeType})...`);
        finalExamData = await runGeminiParser(base64Data, mimeType, fileName);
        console.log(`[Gemini Engine] Success: ${finalExamData.questions.length} questions extracted.`);
      }
    } else {
      if (!isParsedExam(parsedExam)) {
        return res.status(400).json({ success: false, error: 'Dữ liệu đề thi đã bóc tách không hợp lệ.' });
      }
      finalExamData = parsedExam;
    }

    if (!finalExamData) {
      return res.status(500).json({ success: false, error: 'Không thể xử lý dữ liệu đề thi.' });
    }

    console.log(`[Offline Sync] Saving parsed exam from file: "${fileName}" to Prisma DB...`);

    const examId = `gen-exam-${Date.now()}`;
    const mappedQuestions: Question[] = finalExamData.questions.map((q, qIdx) => {
      const qId = `gen-q-${qIdx}-${Date.now()}`;
      return {
        id: qId,
        content: q.content,
        points: q.points || 2,
        order: qIdx + 1,
        explanation: q.explanation || 'Đáp án đúng theo tài liệu mẫu.',
        imageUrl: q.imageUrl || undefined,
        imageSvg: q.imageSvg || undefined,
        answers: (q.answers || []).map((a, aIdx) => ({
          id: `gen-a-${qIdx}-${aIdx}-${Date.now()}`,
          content: a.content,
          isCorrect: !!a.isCorrect
        }))
      };
    });

    const newExam: Exam = {
      id: examId,
      title: finalExamData.title || `Đề Ôn Tập - ${fileName}`,
      description: finalExamData.description || 'Đề khảo thí thiết kế sinh động từ file dữ liệu của giáo viên.',
      duration: Number(finalExamData.duration) || 15,
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
              imageUrl: mq.imageUrl || null,
              imageSvg: mq.imageSvg || null,
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

    return res.status(200).json({ success: true, exam: newExam });
  } catch (err: unknown) {
    console.error('[Offline Sync Error]:', err);
    return res.status(500).json({ success: false, error: getErrorMessage(err, 'Không thể lưu đề thi.') });
  }
}
