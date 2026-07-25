# Quy Tắc An Toàn Database Prisma 6 (prisma.md)

Hệ thống kết nối trực tiếp đến Neon Serverless PostgreSQL thông qua Prisma v6.

---

## 1. QUY TRÌNH THAY ĐỔI SCHEMA (EVOLUTION WORKFLOW)

Khi thực hiện bất kỳ thay đổi nào trong `prisma/schema.prisma`:

1.  **Đánh giá rủi ro mất dữ liệu (Data Loss Audit):** Kiểm tra xem thay đổi có xóa cột, đổi kiểu dữ liệu, hoặc thêm cột bắt buộc (`required`) mà không có giá trị mặc định (`default`) không. Nếu có, báo cáo ngay cho người dùng để lên phương án migrate thủ công.
2.  **Cập nhật local/staging:**
    *   Chạy lệnh `npm run db:generate` để cập nhật kiểu dữ liệu (Typescript types) cho Prisma Client.
    *   Sử dụng lệnh `npx prisma migrate dev --name <tên_migration>` để ghi nhận file migration vào lịch sử Git.
3.  **Xác minh Seed dữ liệu:** Chạy lệnh `npm run db:seed` để chắc chắn dữ liệu mẫu không vi phạm các ràng buộc khóa ngoại mới.
4.  **Cấm db push trên production:** Tuyệt đối không chạy `prisma db push` trên production. Chỉ sử dụng `prisma migrate deploy` trong quá trình CD.
