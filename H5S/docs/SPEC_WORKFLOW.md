# H5S Spec Workflow

Tài liệu này nâng H5S từ "workflow bằng markdown" thành một vòng đời feature có
artifact rõ ràng. Mục tiêu là để mọi agent, tool, hoặc phiên làm việc mới có thể
tiếp tục công việc mà không cần đọc lại toàn bộ hội thoại cũ.

---

## 1. Khi Nào Cần Spec Folder

| Mode | Có cần `H5S/specs/<feature-id>/`? | Lý do |
| :--- | :--- | :--- |
| Quick | Không bắt buộc | Task nhỏ, đọc file trực tiếp là đủ. |
| Standard | Bắt buộc khi sửa code hoặc thêm feature | Cần scope, acceptance và verify rõ. |
| Full | Bắt buộc | Nhiều agent, rủi ro cao, cần handoff và evidence. |

Feature ID nên dùng dạng `FEAT-001`, `BUG-014`, `CHORE-003`, hoặc tên ngắn
không có khoảng trắng như `AUTH-SESSION-FIX`.

---

## 2. Cấu Trúc Feature Artifact

```text
H5S/specs/<feature-id>/
├── spec.md           # User goal, scope, acceptance criteria
├── design.md         # Architecture, file ownership, data flow, risk
├── tasks.md          # Checklist thực thi theo bước nhỏ
├── review.md         # Reviewer findings và ship decision
└── test-evidence.md  # Commands đã chạy, output tóm tắt, ngày giờ
```

Trong Standard mode, tối thiểu phải có:
- `spec.md`
- `tasks.md`

Trong Full mode, phải có đủ cả 5 file.

---

## 3. Luồng Chuẩn

1. **Intake:** Leader đọc yêu cầu, chọn Quick/Standard/Full, phân loại risk trong
   `FEATURE_INTAKE.md`.
2. **Create spec folder:** Copy `H5S/specs/_template/` sang
   `H5S/specs/<feature-id>/`.
3. **Write spec:** Điền mục tiêu, scope, acceptance, out-of-scope vào `spec.md`.
4. **Design:** Nếu có hơn một cách làm hoặc có rủi ro, ghi quyết định vào
   `design.md`; nếu là kiến trúc lớn, tạo ADR từ `docs/templates/decision.md`.
5. **Tasking:** Tách việc trong `tasks.md` thành các bước nhỏ có owner, files
   allowed, verify command.
6. **Preflight:** Chạy guard trước khi sửa file:

```bash
python H5S/scripts/h5s_guard.py preflight --mode standard --feature FEAT-001
```

7. **Implement:** Agent claim `ACTIVE WRITER` trong `progress.md`, chỉ sửa file
   đã claim, và cập nhật worklog.
8. **Verify:** Chạy lint/typecheck/test/build phù hợp, ghi output vào
   `progress.md` và `test-evidence.md`.
9. **Review:** Reviewer ghi finding vào `review.md`; Leader chốt ship/fix.
10. **Close:** Cập nhật `TEST_MATRIX.md`, `feature_list.json`,
    `session-handoff.md` nếu cần.

---

## 4. Spec Contract

Mỗi `spec.md` phải trả lời được:
- User muốn kết quả gì?
- Trong scope và ngoài scope là gì?
- Acceptance criteria nào quan sát/kiểm thử được?
- Có rủi ro về auth, DB, payment, data, security, UI regression không?
- Lệnh nào chứng minh feature đã xong?

Mỗi `tasks.md` phải có:
- Task owner hoặc role.
- Files allowed.
- Do-not-touch list nếu có vùng rủi ro.
- Verify command cụ thể.
- Checklist có thể tick từng mục.

Mỗi `test-evidence.md` phải có:
- Thời gian chạy.
- Command thực tế.
- Kết quả exit code/pass/fail.
- Lỗi còn lại hoặc lý do chưa chạy được.

---

## 5. Dùng Với Claude Agent Teams / Task Graph

Nếu dùng Claude Agent Teams, Task Master, hoặc tool task graph khác:
- H5S/specs vẫn là source of truth.
- Team/task tool có thể chia việc, nhưng mọi task con phải trỏ về `tasks.md`.
- Kết quả cuối phải ghi vào `review.md`, `test-evidence.md`, và `TEST_MATRIX.md`.

Nếu tool ngoài sinh ra đề xuất trái với `RULE.md`, `progress.md`, hoặc
`ACTIVE WRITER`, H5S thắng.
