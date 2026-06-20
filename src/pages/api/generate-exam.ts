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
      sizeLimit: '50mb', // Set body size limit to 50mb to handle large base64 files
    },
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
        const { stdout: out } = await execAsync(cmd, { maxBuffer: 1024 * 1024 * 50 }); // 50MB buffer
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

    let finalExamData: ParsedExam;

    if (fileData) {
      const isPdf = fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
      
      if (isPdf) {
        console.log(`[Local Parser] Parsing PDF locally: "${fileName}"...`);
        finalExamData = await runLocalPdfParser(fileData);
      } else {
        console.log(`[Gemini Engine] Generating exam based on uploaded file: "${fileName}"...`);
        const parsed = parseBase64(fileData);
        if (!parsed) {
          return res.status(400).json({ success: false, error: 'Dữ liệu tệp tin base64 không đúng định dạng.' });
        }
        const mimeType = parsed.mimeType;
        const base64Data = parsed.base64Data;

        const apiKey = process.env.GEMINI_API_KEY || "";
        if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
          return res.status(500).json({
            success: false,
            error: 'Vui lòng cung cấp GEMINI_API_KEY trong cấu hình .env để bóc tách tệp bằng AI.'
          });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-3.5-flash",
          generationConfig: {
            responseMimeType: "application/json"
          }
        });

        const prompt = `Bạn là một chuyên gia khảo thí và biên soạn đề kiểm tra tiếng Anh hàng đầu.
Hãy phân tích tệp tài liệu được gửi kèm (Định dạng: ${mimeType}, Tên: ${fileName}).
Tệp này có thể là đề kiểm tra, tài liệu ôn tập hoặc hình ảnh đề thi.
Hãy bóc tách hoặc biên soạn một đề thi thử trắc nghiệm tiếng Anh từ tài liệu này.

Yêu cầu chi tiết:
1. Đọc kỹ nội dung văn bản và bất kỳ hình ảnh nào trong tài liệu.
2. Thiết kế đề thi gồm:
    - Tiêu đề đề thi sinh động, hấp dẫn bằng tiếng Việt.
    - Mô tả ngắn giới thiệu chủ đề ôn tập.
    - Thời gian làm bài hợp lý (tính toán dựa trên số lượng câu hỏi thực tế được bóc tách, trung bình 1.5 đến 2 phút cho mỗi câu).
    - Hãy trích xuất và bóc tách nhiều câu hỏi nhất có thể từ tệp tài liệu này (tối đa khoảng 30 đến 40 câu hỏi trắc nghiệm phân bố đều từ đầu đến cuối tài liệu để đảm bảo bao phủ đầy đủ kiến thức và không vượt quá giới hạn ký tự phản hồi của hệ thống). Nếu tài liệu không chứa các câu hỏi trắc nghiệm sẵn có, hãy tự động biên soạn khoảng 20 đến 30 câu hỏi trắc nghiệm tiếng Anh chất lượng cao dựa trên nội dung/chủ đề ôn tập của tài liệu.
    - Mỗi câu hỏi có 4 lựa chọn (A, B, C, D) với ĐÁP ÁN ĐÚNG DUY NHẤT và GIẢI THÍCH chi tiết vì sao đúng bằng tiếng Việt.
3. QUAN TRỌNG VỀ HÌNH ẢNH:
   - Nếu tài liệu là hình ảnh duy nhất (ví dụ: ảnh chụp 1 trang đề thi) hoặc nếu câu hỏi đó liên quan trực tiếp đến hình ảnh duy nhất này, hãy đặt trường "imageUrl" của câu hỏi đó là "uploaded_file".
   - Nếu trong tài liệu có hình ảnh/hình minh họa/biển báo/sơ đồ cụ thể cho từng câu hỏi, hãy thiết kế lại hình ảnh minh họa đó thành mã nguồn SVG tự dựng (chứa trong trường "imageSvg" của câu hỏi đó dưới dạng một chuỗi HTML SVG hoàn chỉnh, tự co giãn responsive và có thiết kế hiện đại, tinh tế với màu sắc chalk #F2EFE7 và crimson #DC143C). Nếu không cần hình ảnh cho câu hỏi đó, hãy bỏ trống trường "imageUrl" và "imageSvg".

Hãy xuất kết quả chính xác theo định dạng JSON Schema sau:
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
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          prompt
        ]);
        const textOutput = result.response.text();
        if (!textOutput) {
          throw new Error('Gemini không phản hồi văn bản định dạng mong muốn.');
        }
        
        const generated = JSON.parse(textOutput);
        
        // Map questions and handle imageUrl
        const isImage = mimeType.startsWith('image/');
        const mappedQuestions = (generated.questions || []).map((q: any) => {
          let qImageUrl = q.imageUrl;
          if (qImageUrl === 'uploaded_file' && isImage) {
            qImageUrl = fileData; // Save original uploaded image data url
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

        finalExamData = {
          title: generated.title || fileName.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
          description: generated.description || 'Đề thi được bóc tách tự động bằng AI từ tài liệu.',
          duration: Number(generated.duration) || 15,
          questions: mappedQuestions
        };
      }
    } else {
      if (!isParsedExam(parsedExam)) {
        return res.status(400).json({ success: false, error: 'Dữ liệu đề thi đã bóc tách không hợp lệ.' });
      }
      finalExamData = parsedExam;
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
