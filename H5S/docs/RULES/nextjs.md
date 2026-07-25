# Quy Tắc An Toàn Next.js 15 & React 19 (nextjs.md)

Dự án sử dụng Next.js 15 và React 19, đòi hỏi phải kiểm soát chặt chẽ các hành vi bất đồng bộ và ranh giới Client/Server.

---

## 1. XỬ LÝ ASYNC DYNAMIC APIs (BẮT BUỘC)

Trong Next.js 15, các API động của router đã chuyển sang dạng Asynchronous. Bạn **BẮT BUỘC** phải dùng `await` khi truy cập chúng:

*   **`params` và `searchParams`:**
    ```typescript
    // Sai: const { id } = params;
    // Đúng:
    const { id } = await params;
    ```
*   **`headers()` và `cookies()`:**
    ```typescript
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    ```

---

## 2. RANH GIỚI CLIENT VÀ SERVER (COMPONENT BOUNDARIES)

*   **Mặc định:** Tất cả các component trong thư mục `src/app/` là Server Components (RSC) để tối ưu hiệu năng và bảo mật. Thực hiện gọi DB trực tiếp qua Prisma ở đây.
*   **`'use client'`:** Chỉ sử dụng ở các component lá (leaf components) có tính tương tác cao (như form validation bằng React Hook Form, hiệu ứng Framer Motion, quản lý trạng thái Zustand).
*   **Hydration Errors:** Không sử dụng các biến thời gian thực của trình duyệt (như `window.innerWidth`, `localStorage`, `new Date()`) trực tiếp trong lần render đầu tiên của Client Component mà không có bọc kiểm tra `useEffect` hoặc trạng thái mounted.
