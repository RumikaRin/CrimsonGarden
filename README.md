# Crimson Academy - Ôn Thi Trắc Nghiệm & Học Tiếng Anh

Nền tảng ôn luyện trắc nghiệm tiếng Anh thông minh và trò chơi săn từ vựng sinh động, được xây dựng trên cấu trúc Next.js App Router (FLOF Architecture) và tích hợp Gemini AI.

## Các Công Nghệ Sử Dụng
- **Framework**: Next.js 15 (App Router)
- **Database**: Prisma + PostgreSQL (Neon)
- **State Management**: Zustand (Persist middleware)
- **Styling**: Tailwind CSS + Lucide Icons

## Cấu Trúc Dự Án
- `src/app/`: Định tuyến và các API Route Handlers.
  - `src/app/api/generate-exam/route.ts`: API bóc tách đề thi từ file bằng Gemini.
  - `src/app/api/exam/submit/route.ts`: API nộp bài thi lưu vào Postgres.
  - `src/app/api/game/score/route.ts`: API lưu điểm trò chơi Snake.
- `src/components/`: Chứa các React components (ExamQuiz, VocabularySnake, UploadAutoGenerate, AdminStatsDashboard).
- `src/store/`: Quản lý trạng thái bằng Zustand.
- `src/lib/`: Các thư viện tiện ích (prisma, utils).

## Hướng Dẫn Chạy Dự Án

1. **Cài Đặt Thư Viện**:
   ```bash
   npm install
   ```

2. **Cấu Hình Môi Trường**:
   Tạo tệp `.env` hoặc `.env.local` ở thư mục gốc và cung cấp các khóa:
   ```env

   DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
   ```

3. **Tạo Schema Cơ Sở Dữ Liệu**:
   ```bash
   npx prisma db push
   ```

4. **Chạy Ở Chế Độ Phát Triển**:
   ```bash
   npm run dev
   ```
