# Skill: /spec — Định Nghĩa Đặc Tả

## Metadata
- **Trigger:** `/spec`
- **Agent:** Leader
- **Exit Criteria:** Tài liệu đặc tả được ghi vào `progress.md` và được người dùng chấp nhận.

---

## Quy Trình

1. **Thu thập yêu cầu:** Đọc yêu cầu từ người dùng hoặc `feature_list.json`.
2. **Phân tích phạm vi:** Xác định IN scope vs OUT scope.
3. **Xác định acceptance criteria:** Liệt kê tiêu chí nghiệm thu cụ thể, đo lường được.
4. **Đánh giá rủi ro:** Tham chiếu [FEATURE_INTAKE.md](docs/FEATURE_INTAKE.md).
5. **Ghi nhận:** Viết spec vào `progress.md` hoặc file story riêng.

## Anti-Rationalization

| Lý Do Bỏ Qua | Phản Bác |
| :--- | :--- |
| "Yêu cầu đã rõ" | Spec ghi nhận scope và edge case, không chỉ yêu cầu chính. |
| "Task nhỏ" | Spec nhỏ cũng chỉ cần 3-5 dòng. |

## Verification Gate
- [ ] Spec có acceptance criteria cụ thể?
- [ ] Scope IN/OUT được ghi rõ?
- [ ] Rủi ro được đánh giá?
