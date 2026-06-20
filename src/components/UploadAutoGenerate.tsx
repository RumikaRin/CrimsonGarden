'use client';

import React, { useState } from 'react';
import { useExamStore } from '../store/useExamStore';
import { cn } from '../lib/utils';
import { useIsGreen } from '../lib/useThemeTokens';
import { downloadFile } from '@/lib/download';
import {
  FileSpreadsheet, FileText, UploadCloud, CheckCircle, AlertCircle,
  Sparkles, RefreshCw, HelpCircle, Download, Dices
} from 'lucide-react';
import { questionBank } from '../data/questionBank';

interface CSVAnswer {
  content: string;
  isCorrect: boolean;
}

interface CSVQuestion {
  content: string;
  explanation: string;
  points: number;
  answers: CSVAnswer[];
}

interface TempAnswer {
  id?: string;
  content: string;
  isCorrect: boolean;
}

interface TempQuestion {
  content: string;
  explanation: string;
  points: number;
  answers: TempAnswer[];
}

export default function UploadAutoGenerate() {
  const { addExam, theme } = useExamStore();
  const isGreenTheme = theme === 'neon';
  const accent = 'var(--accent)';
  const accentBg = 'var(--page-bg)';
  const accentBorder = 'var(--accent-light)';
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: number; type: string } | null>(null);
  const [fileObject, setFileObject] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);

  // Client-side parser for Excel (CSV format)
  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    if (lines.length < 2) throw new Error("File CSV không có dữ liệu.");

    // Parse header to match correct indices
    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const questionIdx = headers.indexOf('question');
    const optionAIdx = headers.indexOf('optionA');
    const optionBIdx = headers.indexOf('optionB');
    const optionCIdx = headers.indexOf('optionC');
    const optionDIdx = headers.indexOf('optionD');
    const correctIdx = headers.indexOf('correct');
    const explanationIdx = headers.indexOf('explanation');

    if (questionIdx === -1 || optionAIdx === -1 || optionBIdx === -1 || optionCIdx === -1 || optionDIdx === -1 || correctIdx === -1) {
      throw new Error("File CSV thiếu cột bắt buộc. Các tiêu đề cột đúng: question, optionA, optionB, optionC, optionD, correct, explanation.");
    }

    const questions: CSVQuestion[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle simple quoted CSV cell splitting
      const cells: string[] = [];
      let currentCell = '';
      let inQuotes = false;
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          cells.push(currentCell.trim().replace(/^["']|["']$/g, ''));
          currentCell = '';
        } else {
          currentCell += char;
        }
      }
      cells.push(currentCell.trim().replace(/^["']|["']$/g, ''));

      if (cells.length <= Math.max(questionIdx, optionAIdx, optionBIdx, optionCIdx, optionDIdx, correctIdx)) {
        continue;
      }

      const questionText = cells[questionIdx];
      const a = cells[optionAIdx];
      const b = cells[optionBIdx];
      const c = cells[optionCIdx];
      const d = cells[optionDIdx];
      const correctLetter = (cells[correctIdx] || '').toUpperCase().trim();
      const explanation = cells[explanationIdx] || 'Đáp án đúng dựa vào tài liệu ôn tập.';

      if (!questionText) continue;

      const answers = [
        { content: a, isCorrect: correctLetter === 'A' },
        { content: b, isCorrect: correctLetter === 'B' },
        { content: c, isCorrect: correctLetter === 'C' },
        { content: d, isCorrect: correctLetter === 'D' },
      ];

      questions.push({
        content: questionText,
        explanation,
        points: 2,
        answers
      });
    }

    if (questions.length === 0) {
      throw new Error("Không tìm thấy câu hỏi hợp lệ nào trong file Excel/CSV.");
    }

    return {
      title: "Đề thi từ file Excel",
      description: "Đề thi được nhập tự động từ tệp Excel/CSV ôn tập.",
      duration: 15,
      questions
    };
  };

  // Client-side parser for Word (TXT format)
  const parseTXT = (text: string) => {
    const lines = text.split('\n');
    const questions: TempQuestion[] = [];
    let currentQuestion: TempQuestion | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Question start detection e.g. "Câu 1:", "Question 1:", "Q1:"
      const questionMatch = line.match(/^(Câu|Question|Q)\s*\d+\s*:/i);
      if (questionMatch) {
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        const content = line.substring(questionMatch[0].length).trim();
        currentQuestion = {
          content,
          explanation: 'Đáp án chuẩn từ tài liệu.',
          points: 2,
          answers: []
        };
      }
      // Answer options detection e.g. "A. finished", "B. has finished"
      else if (currentQuestion && line.match(/^[A-D]\s*\.\s*/i)) {
        const letter = line[0].toUpperCase();
        const answerContent = line.substring(line.indexOf('.') + 1).trim();
        currentQuestion.answers.push({
          id: letter, // Temporary id to bind correct answer
          content: answerContent,
          isCorrect: false
        });
      }
      // Correct answer binding e.g. "*Đáp án đúng: C"
      else if (currentQuestion && (line.match(/^\*?Đáp án đúng\s*:\s*[A-D]/i) || line.match(/^\*?Correct\s*:\s*[A-D]/i))) {
        const parts = line.split(':');
        const correctLetter = parts[parts.length - 1].trim().toUpperCase();
        currentQuestion.answers.forEach((ans) => {
          if (ans.id === correctLetter) ans.isCorrect = true;
        });
      }
      // Explanation extraction e.g. "*Giải thích: ..."
      else if (currentQuestion && line.match(/^\*?Giải thích\s*:\s*/i)) {
        const parts = line.split(':');
        currentQuestion.explanation = parts.slice(1).join(':').trim();
      }
    }

    if (currentQuestion) {
      questions.push(currentQuestion);
    }

    // Clean temporary reference IDs from answers
    questions.forEach(q => {
      q.answers.forEach((ans) => {
        delete ans.id;
      });
    });

    if (questions.length === 0) {
      throw new Error("Không thể trích xuất được câu hỏi nào. Hãy chắc chắn định dạng của bạn khớp với mẫu tải xuống bên phải.");
    }

    return {
      title: "Đề thi từ file Word/TXT",
      description: "Đề thi được bóc tách từ file Word/TXT chứa bộ đề mẫu.",
      duration: 15,
      questions
    };
  };

  const downloadExcelTemplate = () => downloadFile(
    "\uFEFFquestion,optionA,optionB,optionC,optionD,correct,explanation\n"
    + "\"Which keyword is used to declare a constant in JS?\",\"let\",\"var\",\"const\",\"define\",\"C\",\"The 'const' keyword declares a block-scoped local constant.\"\n"
    + "\"What is the synonym of 'gorgeous'?\",\"ugly\",\"beautiful\",\"dull\",\"plain\",\"B\",\"'Gorgeous' means extremely beautiful or attractive.\"",
    "mau_de_thi_excel.csv", "text/csv;charset=utf-8;"
  );

  const downloadWordTemplate = () => downloadFile(
    "Cấu trúc đề thi mẫu tiếng Anh (Định dạng Word/Text)\n\n"
    + "Câu 1: She ______ her homework before she went to bed last night.\n"
    + "A. finished\nB. has finished\nC. had finished\nD. was finishing\n*Đáp án đúng: C\n*Giải thích: Thì Quá khứ hoàn thành (had + V3) diễn tả hành động xảy ra trước một hành động khác trong quá khứ.\n\n"
    + "Câu 2: Choose the synonym of the word \"abundant\":\n"
    + "A. scarce\nB. plentiful\nC. tiny\nD. lacking\n*Đáp án đúng: B\n*Giải thích: \"Abundant\" có nghĩa là dồi dào, phong phú, đồng nghĩa với \"plentiful\".",
    "mau_de_thi_word.txt", "text/plain;charset=utf-8"
  );

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileObject(file);
      setSelectedFile({
        name: file.name,
        size: Math.round(file.size / 1024), // to KB
        type: file.name.substring(file.name.lastIndexOf('.'))
      });
      setSuccessMessage(null);
      setErrorMessage(null);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileObject(file);
      setSelectedFile({
        name: file.name,
        size: Math.round(file.size / 1024),
        type: file.name.substring(file.name.lastIndexOf('.'))
      });
      setSuccessMessage(null);
      setErrorMessage(null);
    }
  };

  // Submit and generate using local parse engine or server Gemini engine
  const handleGenerateExam = async () => {
    if (!selectedFile || !fileObject) return;

    setIsGenerating(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const isImage = /\.(png|jpg|jpeg|gif|webp)$/i.test(selectedFile.name);
    const isPdf = /\.pdf$/i.test(selectedFile.name);
    const isTextOrCsv = /\.(txt|csv)$/i.test(selectedFile.name);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        let payload: any = {
          fileName: selectedFile.name,
          fileType: selectedFile.type || (isPdf ? 'application/pdf' : isImage ? 'image/jpeg' : ''),
          fileSizeKB: selectedFile.size
        };

        if (isTextOrCsv) {
          const text = reader.result as string;
          const isExcel = selectedFile.name.toLowerCase().endsWith('.csv');
          const parsedExam = isExcel ? parseCSV(text) : parseTXT(text);
          parsedExam.title = selectedFile.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
          payload.parsedExam = parsedExam;
        } else {
          payload.fileData = reader.result as string; // base64 data url
        }

        // Save to DB via Prisma API sync
        const response = await fetch('/api/generate-exam', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Lỗi đồng bộ DB trên server.');
        }

        const result = await response.json();

        if (result.success && result.exam) {
          addExam(result.exam);
          setGeneratedCount(result.exam.questions.length);
          setSuccessMessage(`Bóc tách tệp thành công: "${result.exam.title}"! Đề thi đã có sẵn trong danh sách luyện tập.`);
          setSelectedFile(null);
          setFileObject(null);
        } else {
          throw new Error(result.error || 'Lỗi bóc tách tệp cấu trúc.');
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Lỗi định dạng cấu trúc file khi bóc tách.';
        setErrorMessage(message);
      } finally {
        setIsGenerating(false);
      }
    };

    reader.onerror = () => {
      setErrorMessage("Không thể đọc tệp tin.");
      setIsGenerating(false);
    };

    if (isTextOrCsv) {
      reader.readAsText(fileObject);
    } else {
      reader.readAsDataURL(fileObject);
    }
  };

  const handleAutoGenerateRandom = async () => {
    setIsAutoGenerating(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Shuffle and slice questions from questionBank
      const shuffled = [...questionBank].sort(() => 0.5 - Math.random());
      const selectedQuestions = shuffled.slice(0, Math.min(numQuestions, shuffled.length));

      // Construct the exam object
      const parsedExam = {
        title: `Đề Luyện Tập Ngẫu Nhiên #${Math.floor(1000 + Math.random() * 9000)}`,
        description: `Đề thi ngẫu nhiên gồm ${selectedQuestions.length} câu hỏi được sinh tự động từ Ngân hàng câu hỏi của hệ thống.`,
        duration: selectedQuestions.length === 5 ? 10 : selectedQuestions.length === 10 ? 20 : 30,
        questions: selectedQuestions.map((q) => ({
          content: q.content,
          explanation: q.explanation,
          points: q.points,
          answers: q.answers.map((a) => ({
            content: a.content,
            isCorrect: a.isCorrect
          }))
        }))
      };

      // Save to database via same endpoint
      const response = await fetch('/api/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: `auto-exam-${Date.now()}`,
          parsedExam: parsedExam
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Lỗi đồng bộ DB trên server.');
      }

      const result = await response.json();

      if (result.success && result.exam) {
        addExam(result.exam);
        setGeneratedCount(result.exam.questions.length);
        setSuccessMessage(`Tạo đề tự động thành công: "${result.exam.title}"! Đề thi đã có sẵn trong danh sách luyện tập.`);
      } else {
        throw new Error(result.error || 'Lỗi lưu đề thi tự động.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi không xác định khi tạo đề tự động.';
      setErrorMessage(message);
    } finally {
      setIsAutoGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="card-layered p-4 sm:p-6 max-w-2xl mx-auto">
        <span className="text-[11px] font-sans font-bold tracking-widest uppercase block mb-1" style={{ color: accent }}>
          BÓC TÁCH KHÔNG GIỚI HẠN CỤC BỘ (OFFLINE-FIRST)
        </span>
        <h2 className="text-3xl font-serif font-semibold text-[var(--text-primary)] tracking-tight">
          Upload & Tự Động Định Dạng Đề Thi
        </h2>
        <p className="text-sm font-sans text-[var(--text-secondary)] mt-2 leading-relaxed">
          Tải tài liệu ôn tập định dạng Word mẫu (.txt) hoặc danh sách Excel mẫu (.csv). Hệ thống sử dụng thuật toán phân tích cú pháp trực tiếp của ứng dụng để bóc tách nội dung, chuẩn hóa câu hỏi với đầy đủ đáp án & giải thích chi tiết.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 items-start lg:grid-cols-12 lg:gap-8">
        {/* Dropzone File Upload section */}
        <div className="lg:col-span-7 space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={cn(
              "card-layered p-5 sm:p-12 text-center transition-all relative group cursor-pointer",
              dragActive && "opacity-90 scale-[1.01]",
              selectedFile && "opacity-95"
            )}
          >
            <input
              type="file"
              id="file-upload-input"
              accept=".csv,.txt,.pdf,.png,.jpg,.jpeg"
              onChange={handleFileInput}
              className="hidden"
            />

            {!selectedFile ? (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400 group-hover:scale-105 transition-transform duration-250">
                  <UploadCloud className="w-8 h-8 text-neutral-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-sans font-medium text-neutral-800">
                    Kéo thả file vào đây hoặc{" "}
                    <label
                      htmlFor="file-upload-input"
                      className="hover:underline cursor-pointer font-bold"
                      style={{ color: accent }}
                    >
                      chọn file từ máy tính
                    </label>
                  </p>
                  <p className="text-xs text-neutral-500 font-mono">
                    Hỗ trợ tệp Word (.txt), Excel (.csv), tài liệu (.pdf) hoặc hình ảnh (.png, .jpg, .jpeg) lên đến 20MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                  style={{ backgroundColor: accentBg, color: accent }}
                >
                  {selectedFile.type === '.csv' ? (
                    <FileSpreadsheet className="w-8 h-8" />
                  ) : selectedFile.type === '.pdf' ? (
                    <FileText className="w-8 h-8 text-red-500" />
                  ) : (selectedFile.type === '.png' || selectedFile.type === '.jpg' || selectedFile.type === '.jpeg') ? (
                    <FileText className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <FileText className="w-8 h-8" />
                  )}
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-serif font-bold text-[var(--text-primary)] max-w-xs mx-auto truncate text-base">
                    {selectedFile.name}
                  </h4>
                  <p className="text-xs text-neutral-500 font-mono">
                    Dung lượng: {selectedFile.size} KB | Định dạng: {selectedFile.type.toUpperCase()}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setFileObject(null);
                  }}
                  className="text-xs text-neutral-500 underline cursor-pointer font-sans hover:opacity-70"
                >
                  Hủy chọn file và đổi file khác
                </button>
              </div>
            )}
          </div>

          {/* Action trigger button */}
          {selectedFile && (
            <button
              disabled={isGenerating}
              onClick={handleGenerateExam}
              className="w-full flex items-center justify-center gap-2 text-[var(--accent-foreground)] py-4 rounded-2xl shadow-md hover:shadow-lg font-sans font-bold transition-all active:scale-98 cursor-pointer text-sm disabled:opacity-50"
              style={{ backgroundColor: accent }}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" /> Hệ thống đang bóc tách và phân tích dữ liệu tệp tin...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" /> Phân Tích Cú Pháp & Tạo Đề Thi Cục Bộ
                </>
              )}
            </button>
          )}

          {/* Status banner response */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex gap-3 text-green-800 animate-fade-in sm:p-6 shadow-sm">
              <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
              <div className="space-y-1.5 leading-snug">
                <h5 className="font-serif font-bold text-base">Thành Công!</h5>
                <p className="text-sm font-sans text-green-700">
                  {successMessage} Đề thi mới gồm {generatedCount} câu hỏi đã có sẵn trong danh sách luyện tập.
                </p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex gap-3 text-red-800 animate-fade-in shadow-sm">
              <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
              <div className="space-y-1 leading-snug">
                <h5 className="font-serif font-bold text-base">Phát sinh lỗi phân tích</h5>
                <p className="text-sm font-sans text-red-700">
                  {errorMessage} Vui lòng kiểm tra lại cấu trúc file hoặc tải file mẫu để kiểm tra.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Instructive documentation & Quick Sample testing sidebar options */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Auto-Generate Random Exam */}
          <div className="card-layered p-4 sm:p-6 space-y-4">
            <h4 className="font-serif text-sm font-bold text-neutral-800 flex items-center gap-2">
              <Dices className="w-4 h-4" style={{ color: accent }} /> Tạo Đề Tự Động (Không AI)
            </h4>
            <p className="text-xs text-[#78716C] font-sans leading-relaxed">
              Tạo đề thi trắc nghiệm ngẫu nhiên từ ngân hàng câu hỏi chuẩn hóa tiếng Anh của hệ thống mà không cần upload file hay dùng AI.
            </p>
            <div className="space-y-3">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Số lượng câu hỏi:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 15].map((num) => (
                  <button
                    key={num}
                    onClick={() => setNumQuestions(num)}
                    className={cn(
                      "py-2 rounded-xl text-xs font-sans font-bold transition-all border cursor-pointer",
                      numQuestions === num
                        ? "bg-[var(--accent)] text-[var(--accent-foreground)] border-[var(--accent)] shadow-sm"
                        : "bg-[var(--card-bg)] text-[var(--text-primary)] border-[var(--border-default)] hover:bg-[var(--accent-light)]/20"
                    )}
                  >
                    {num} câu
                  </button>
                ))}
              </div>
            </div>
            <button
              disabled={isAutoGenerating}
              onClick={handleAutoGenerateRandom}
              className="w-full flex items-center justify-center gap-2 text-[var(--accent-foreground)] py-3 rounded-xl shadow-sm hover:shadow-md font-sans font-bold transition-all active:scale-98 cursor-pointer text-xs disabled:opacity-50"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {isAutoGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Đang tạo đề thi...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Sinh Đề Ngẫu Nhiên
                </>
              )}
            </button>
          </div>

          <div className="card-layered p-4 sm:p-6 space-y-4">
            <h4 className="font-serif text-sm font-bold text-neutral-800 flex items-center gap-2">
              <Download className="w-4 h-4" style={{ color: accent }} /> Tải file mẫu
            </h4>

            <p className="text-xs text-[#78716C] font-sans leading-relaxed">
              Tải mẫu, chỉnh sửa nội dung và upload lại để tạo đề thi.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={downloadExcelTemplate}
                className="flex items-center justify-center gap-1.5 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 py-2.5 rounded-xl text-xs font-sans font-bold transition-all cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> Mẫu Excel (.csv)
              </button>
              <button
                onClick={downloadWordTemplate}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-sans font-bold transition-all cursor-pointer shadow-sm border"
                style={{ backgroundColor: accentBg, borderColor: accentBorder, color: accent }}
              >
                <Download className="w-3.5 h-3.5" /> Mẫu Word (.txt)
              </button>
            </div>

            <details className="border-t border-neutral-200 pt-4 group">
              <summary className="cursor-pointer list-none flex items-center justify-between text-[11px] font-serif font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-3.5 h-3.5" style={{ color: accent }} />
                  Cấu trúc file chi tiết
                </span>
                <span className="text-[var(--text-muted)] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="space-y-3.5 text-xs text-[var(--text-secondary)] leading-relaxed font-sans pt-4">
                <div className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#1A1814] text-[#F2EFE7] font-mono flex items-center justify-center shrink-0 font-bold">1</span>
                  <p>
                    <strong>Mẫu Excel (.csv):</strong> Nhập đầy đủ nội dung theo cột: <code>question</code>, <code>optionA</code>, <code>optionB</code>, <code>optionC</code>, <code>optionD</code>, <code>correct</code> (Ghi chữ cái đáp án A/B/C/D), <code>explanation</code>.
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#1A1814] text-[#F2EFE7] font-mono flex items-center justify-center shrink-0 font-bold">2</span>
                  <p>
                    <strong>Mẫu Word / Text (.txt):</strong> Đảm bảo định dạng:
                    <br />
                    <code>Câu 1: [Câu hỏi]</code>
                    <br />
                    <code>A. [Đáp án A]</code>
                    <br />
                    <code>B. [Đáp án B]</code>
                    <br />
                    <code>*Đáp án đúng: [A/B/C/D]</code>
                    <br />
                    <code>*Giải thích: [Giải thích chi tiết]</code>
                  </p>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
