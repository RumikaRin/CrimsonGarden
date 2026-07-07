# Skill: /review — Đánh Giá Code

## Metadata
- **Trigger:** `/review`
- **Agent:** Reviewer
- **Exit Criteria:** Báo cáo review có cấu trúc, mọi issue được phân loại, recommendation rõ ràng.

---

## Quy Trình

1. **Xác định phạm vi:** `git diff` hoặc file được chỉ định.
2. **Đọc context:** Hiểu code đang làm gì, đọc file liên quan.
3. **Chạy checklist:** Correctness → Security → Performance → Error handling → Testing → Conventions → UI/UX.
4. **Phân loại issue:** 🔴 Critical / 🟡 Important / 🔵 Nit.
5. **Viết báo cáo:** Format chuẩn với file:line, mô tả, đề xuất sửa.
6. **Recommendation:** Ship / Fix first / Needs user decision.

## Anti-Rationalization

| Lý Do Bỏ Qua | Phản Bác |
| :--- | :--- |
| "Code đã pass test" | Test pass ≠ code tốt. Security, performance cần mắt review. |
| "Coder tự review rồi" | Tự review = confirmation bias. Review phải khách quan. |
| "Chỉ 1-2 dòng thay đổi" | 1 dòng SQL injection là đủ. |

## Verification Gate
- [ ] Tất cả file trong diff đã được kiểm tra?
- [ ] Security checklist đã chạy (nếu đụng auth/input/DB)?
- [ ] Issue được phân loại đúng severity?
- [ ] Có recommendation rõ ràng?
