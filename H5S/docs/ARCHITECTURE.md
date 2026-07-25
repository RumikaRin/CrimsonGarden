# Đặc Tả Kiến Trúc Dự Án (ARCHITECTURE.md)

Tài liệu này định nghĩa cấu trúc thư mục tiêu chuẩn và các ranh giới kiến trúc (boundaries) mà AI Agent bắt buộc phải tuân thủ khi viết mã nguồn trong dự án H5S.

---

## 🗺️ CẤU TRÚC THƯ MỤC CHUẨN (FOLDER HIERARCHY)

Tất cả mã nguồn ứng dụng phải tuân theo cấu trúc phân tầng nghiêm ngặt sau:

```text
├── prisma/                  # Cấu hình Database Schema & file Seeding dữ liệu
│   ├── schema.prisma        # Prisma Models
│   └── seed.ts              # Dữ liệu mẫu (seeding)
├── tests/                   # Unit tests và Integration tests (.test.ts)
├── src/
│   ├── app/                 # Next.js App Router (Các Routes, Layouts, APIs)
│   ├── components/          # React Components tái sử dụng
│   │   ├── ui/              # Component giao diện nguyên tử (Button, Input)
│   │   ├── layout/          # Layout chung (Header, Footer, Sidebar)
│   │   └── features/        # Component phức hợp chia theo chức năng
│   ├── lib/                 # Các hàm tiện ích, cấu hình chung, DB client
│   │   ├── db.ts            # Khởi tạo Prisma Client duy nhất
│   │   └── utils.ts         # Hàm hỗ trợ giao diện (cn, clsx, tailwind-merge)
│   ├── providers/           # Các React Context Providers
│   ├── store/               # Quản lý trạng thái client bằng Zustand
│   └── types/               # Kiểu dữ liệu TypeScript
```

---

## 🚫 RANH GIỚI KIẾN TRÚC & ĐIỂM CẤM (BOUNDARIES & SANCTIONS)

### 1. Phân định Client và Server (RSC vs RCC)
*   **Không import Prisma Client** hoặc các đoạn mã chứa logic gọi trực tiếp cơ sở dữ liệu (Database) hoặc các hàm backend nhạy cảm vào các file được đánh dấu `'use client'`.
*   **Hydration Sync:** Các component sử dụng dữ liệu phụ thuộc môi trường chạy (như `window`, `localStorage`, `navigator`) phải được trì hoãn render cho đến khi component đã hoàn tất quá trình mounting (`useEffect`).

### 2. Khởi tạo Database Client (Prisma Singleton)
*   **Tuyệt đối không** import `@prisma/client` và khởi tạo `new PrismaClient()` ở nhiều file khác nhau.
*   **Luôn sử dụng** singleton client được xuất bản từ `src/lib/db.ts` để tránh cạn kiệt tài nguyên kết nối (Connection Pool Exhaustion) khi chạy ứng dụng ở chế độ dev.

### 3. Tối giản hóa logic giao diện (UI Separation)
*   Tách biệt logic hiển thị giao diện với logic xử lý dữ liệu phức tạp. Sử dụng React Hook Form kết hợp validation bằng Zod để kiểm soát đầu vào form trước khi truyền dữ liệu đi.
