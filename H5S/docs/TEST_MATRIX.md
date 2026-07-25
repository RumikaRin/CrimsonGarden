# Bản Đồ Kiểm Thử & Xác Minh (TEST_MATRIX.md)

Tài liệu này ghi nhận bằng chứng chạy thử nghiệm của từng tính năng lớn.
Khi copy template sang dự án mới, hãy thay các dòng mẫu bằng feature thật.

---

## 📊 MA TRẬN KIỂM THỬ DỰ ÁN (TEST MATRIX)

| ID Tính Năng | Tên Câu Chuyện (Story) | Lệnh Kiểm Thử Xác Minh | Kết Quả Chạy Gần Nhất | Ngày Xác Minh |
| :--- | :--- | :--- | :--- | :--- |
| **CLEAN-JUNK** | Dọn dẹp các file rác trong dự án | `npm run lint` && `npm run build` | Passed | 2026-07-01 |
| **UI-REDESIGN** | Redesign toàn bộ giao diện Website | `npm run test` && `npm run build` | Passed | 2026-07-01 |

---

## 🧾 FEATURE EVIDENCE CONTRACT

Với Standard/Full mode, mỗi feature phải có evidence song song ở:

```text
H5S/specs/<feature-id>/test-evidence.md
```

`TEST_MATRIX.md` là bảng tổng hợp; `test-evidence.md` là nơi ghi command chi
tiết, output quan trọng, exit code và rủi ro còn lại.

Trước khi đóng task, chạy guard:

```bash
python H5S/scripts/h5s_guard.py verify --mode standard --feature FEAT-001
```

---

## 🔬 ĐỊNH NGHĨA TRẠNG THÁI XÁC MINH (PROOF STATUS)

*   **`Pending`**: Tính năng chưa được viết test hoặc chưa chạy thử nghiệm.
*   **`Passed`**: Đã chạy test thành công trên môi trường local.
*   **`Failed`**: Chạy test thất bại. Cấm `/ship` hoặc merge code khi còn lỗi.

---

## 📌 HƯỚNG DẪN DÀNH CHO AGENT

Sau khi viết xong code và chạy test thành công:
1. Cập nhật cột **Kết Quả Chạy Gần Nhất**.
2. Cập nhật cột **Ngày Xác Minh** bằng thời gian chạy test thực tế.
3. Dán output terminal quan trọng vào `progress.md`.
4. Ghi command/output chính vào `H5S/specs/<feature-id>/test-evidence.md`.
