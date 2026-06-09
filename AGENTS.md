# AI Coding Agent Guidelines for Crimson-Chalk Educational Platform

Bạn là một Senior Full-stack Web Developer chuyên nghiệp. Hãy tuân thủ nghiêm ngặt các quy tắc dưới đây trong suốt quá trình phát triển mã nguồn của ứng dụng.

## 1. Thiết kế Giao diện (Crimson & Chalk Aesthetic)
- **Palette Màu chính:**
  - **Chalk (Nền chính/Muted):** `#F2EFE7` - Tạo cảm giác giấy mỹ thuật cao cấp, dịu mắt và thanh lịch.
  - **Crimson (Accent/CTAs):** `#DC143C` - Màu đỏ thẫm tinh tế, dùng để nhấn mạnh các nút bấm cốt lõi, trạng thái đúng, hoặc đường viền đặc biệt.
  - **Cream Light:** `#FAF9F6` - Cho thẻ hoặc các khối nội dung nổi bật trên nền Chalk.
  - **Dark Charcoal:** `#1A1814` - Màu chữ chính (text-neutral-900), tránh dùng màu đen tuyền `#000000`.
- **Typography:**
  - Tiêu đề Display: Sử dụng font chữ Serif sang trọng (như Playfair Display hoặc EB Garamond) kết hợp với các chi tiết Sans-serif có khoảng cách tracking rộng (`tracking-widest`).
  - Font chữ thân bài (Body): Hệ thống chữ San-serif sạch sẽ (Inter/Satoshi).
- **Nguyên tắc Anti-Slop:**
  - KHÔNG sử dụng màu tím chuyển sắc (AI purple gradient).
  - KHÔNG trang trí dư thừa các thành phần kỹ thuật giả lập (như "PORT 3000", status log, active ticks vô lý).
  - Bo góc thống nhất và gọn gàng (mặc định `rounded-xl` hoặc `rounded-2xl` cho thẻ, `rounded-full` cho các pill button).

## 2. Quản lý trạng thái thi (Zustand & Persist)
- Trạng thái ôn thi trắc nghiệm (Exam State) phải được đồng bộ trực tiếp ra `localStorage` thông qua Zustand Persist middleware.
- Tránh mất mát dữ liệu khi giáo viên hoặc học sinh vô tình tải lại (reload) trang web hoặc thay đổi kết nối mạng.
- Cấu trúc Zustand phải bảo đảm chia nhỏ giữa `Exam Mode` (đồng hồ đếm ngược, danh sách câu trả lời đã chọn, tiến trình bài thi) và `Game Mode` (điểm số trò chơi Rắn săn từ vựng).

## 3. Quy trình Bóc tách Đề thi & Gemini AI (Auto-Generate)
- Sử dụng mô hình `gemini-3.5-flash` để tự động hóa việc bóc tách đề thi từ dữ liệu văn bản thuần hoặc phi cấu trúc (ví dụ: bóc câu hỏi, đáp án, giải thích chi tiết dưới dạng JSON schema).
- Đảm bảo thực thi hoàn toàn trong Server-side (`/api/gemini` hoặc qua endpoint Express của server full-stack) để KHÔNG lộ API Key ra phía frontend trình duyệt.

## 4. Gamification: Trò chơi Rắn Săn Từ Vựng (Vocabulary Snake)
- Sử dụng HTML5 Canvas + TypeScript để viết nhân game nhẹ nhàng, mượt mà trên trình duyệt.
- Cơ chế trò chơi: Hiển thị nghĩa tiếng Việt hoặc hình ảnh ở bảng điều khiển trung tâm. Rắn phải săn đúng mồi là "Từ vựng tiếng Anh" tương ứng.
- Đảm bảo xử lý mượt mà các trường hợp rắn đâm đuôi, đâm tường hoặc ăn nhầm từ vựng bị trừ điểm.

## 5. Chất lượng Code & TypeScript
- 100% Type-safe. Sử dụng enum chuẩn, không sử dụng `any`, hạn chế dùng ép kiểu phi lý.
- Tận dụng `lucide-react` cho toàn bộ thư viện Icon.
- Thiết kế layout có khả năng đáp ứng tốt (responsive) trên Mobile (375px) và Desktop (1440px).
