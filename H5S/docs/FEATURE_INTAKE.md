# Phân Loại & Đánh Giá Tính Năng Đầu Vào (FEATURE_INTAKE.md)

Tài liệu này định nghĩa quy trình phân loại độ rủi ro và phạm vi ảnh hưởng của từng tính năng trước khi Agent bắt đầu triển khai, nhằm thiết lập ngân sách token và chiến lược xử lý phù hợp.

---

## 🎯 1. QUY TRÌNH ĐÁNH GIÁ ĐẦU VÀO (INTAKE PROCESS)

Khi nhận một feature mới từ `feature_list.json`, Agent (vai trò Leader) phải thực hiện đánh giá 3 bước:

### Bước 1: Phân loại quy mô (Size Classification)

| Quy Mô | Tiêu Chí | Ví Dụ |
| :--- | :--- | :--- |
| **S (Small)** | ≤ 3 file thay đổi, 1 component, không đụng DB | Sửa label button, thêm tooltip |
| **M (Medium)** | 4–10 file, 2-3 components, có thể đụng DB schema | Thêm form đăng ký, tạo API endpoint mới |
| **L (Large)** | > 10 file, nhiều components, thay đổi DB + API + UI | Tích hợp cổng thanh toán, hệ thống RBAC |
| **XL (Extra Large)** | Thay đổi kiến trúc, ảnh hưởng toàn bộ hệ thống | Migrate framework, đổi authentication provider |

### Bước 2: Đánh giá rủi ro (Risk Assessment)

| Mức Rủi Ro | Điều Kiện Kích Hoạt | Hành Động Bắt Buộc |
| :--- | :--- | :--- |
| 🟢 **Thấp** | Không đụng DB, auth, payment, dữ liệu người dùng | Triển khai bình thường |
| 🟡 **Trung bình** | Thêm/sửa cột DB, thêm API mới, đụng validation | Chạy migration dry-run, viết test trước |
| 🔴 **Cao** | Xóa cột/bảng DB, đổi auth flow, đụng payment, thay đổi RBAC | **Dừng lại — hỏi người dùng trước khi làm** |
| ⚫ **Nghiêm trọng** | Đổi kiến trúc, reset data, thay đổi production config | **Cấm Agent tự ý làm — yêu cầu ADR** |

### Bước 3: Kiểm tra phụ thuộc (Dependency Check)

Trước khi bắt đầu, xác minh:
- [ ] Feature này có `dependencies` nào trong `feature_list.json` chưa hoàn thành?
- [ ] Có file nào đang bị Agent khác sửa (nếu chạy Agent Team)?
- [ ] Có migration chưa apply không? (`npx prisma migrate status`)

### Bước 4: Tạo feature spec folder (Standard/Full)

Với Standard hoặc Full mode, Leader tạo hoặc cập nhật:

```text
H5S/specs/<feature-id>/
```

Nguồn template:

```text
H5S/specs/_template/
```

Yêu cầu tối thiểu:
- **Standard:** `spec.md`, `tasks.md`.
- **Full:** `spec.md`, `design.md`, `tasks.md`, `review.md`, `test-evidence.md`.

Trước khi sửa file, chạy:

```bash
python H5S/scripts/h5s_guard.py preflight --mode standard --feature FEAT-XXX
```

---

## 📊 2. MA TRẬN RỦI RO THEO LĨNH VỰC

| Lĩnh Vực | Rủi Ro Điển Hình | Kiểm Tra Bắt Buộc |
| :--- | :--- | :--- |
| **Database Schema** | Mất dữ liệu, khóa ngoại hỏng | `prisma migrate dev --dry-run`, backup |
| **Authentication** | Lỗ hổng bảo mật, session leak | Security review, test edge case |
| **Payment** | Trùng đơn, mất tiền, refund sai | Idempotency check, sandbox testing |
| **File Upload** | Path traversal, file overwrite | Validation + sanitization |
| **API Endpoints** | CORS bypass, rate limit, injection | Security review checklist |
| **UI/UX** | Layout vỡ, accessibility, responsive | Taste skill + cross-browser |

---

## 📋 3. TEMPLATE ĐÁNH GIÁ

Khi đánh giá xong, Agent ghi nhận kết quả theo format sau vào `progress.md`:

```text
## Đánh Giá Feature Đầu Vào
- **Feature:** FEAT-XXX: <tên>
- **Quy mô:** S / M / L / XL
- **Rủi ro:** 🟢 Thấp / 🟡 Trung bình / 🔴 Cao / ⚫ Nghiêm trọng
- **Phụ thuộc:** Không / FEAT-YYY
- **Token Budget:** Tham chiếu CONTEXT_RULES.md
- **Spec Folder:** `H5S/specs/FEAT-XXX`
- **Hành động:** Triển khai bình thường / Cần hỏi user / Cần ADR
```
