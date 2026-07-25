# Skill: /test — Xác Minh Chất Lượng

## Metadata
- **Trigger:** `/test`
- **Agent:** Tester
- **Exit Criteria:** Tất cả test pass, TEST_MATRIX.md được cập nhật với bằng chứng.

---

## Quy Trình

1. **Đọc spec:** Hiểu acceptance criteria.
2. **Viết test cases:** Happy path + edge cases + error cases.
3. **Chạy test:** `node --test tests/<feature>.test.ts` hoặc `npm test`.
4. **Chạy pipeline đầy đủ:** `npm run check`.
5. **Ghi bằng chứng:** Paste output terminal vào `progress.md`.
6. **Cập nhật TEST_MATRIX.md:** Status + ngày xác minh.

## Anti-Rationalization

| Lý Do Bỏ Qua | Phản Bác |
| :--- | :--- |
| "Test cũ đã cover" | Chạy thử test cũ với code mới để xác minh. |
| "Không biết test gì" | Đọc lại spec — acceptance criteria = test case. |
| "Test setup phức tạp" | Đó là vấn đề cần giải quyết, không phải lý do bỏ qua. |

## Verification Gate
- [ ] Test bao phủ tất cả acceptance criteria?
- [ ] Có test cho edge case?
- [ ] Pipeline `npm run check` pass?
- [ ] TEST_MATRIX.md đã cập nhật?
- [ ] Bằng chứng đã ghi vào progress.md?
