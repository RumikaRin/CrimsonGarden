# Hướng Dẫn Vận Hành Đội Agent (AGENT_TEAM.md)

Tài liệu này mô tả chi tiết mô hình **Agent Team** — cho phép nhiều AI Agent cộng tác, phân vai và phối hợp trong một phiên làm việc Harness của dự án H5S.

---

## 🎯 1. TỔNG QUAN MÔ HÌNH ĐỘI (TEAM MODEL)

Đội Agent hoạt động theo mô hình **Role-Based Collaborative Team** với 5 vai trò chuyên biệt:

| Vai Trò | Biểu Tượng | Trách Nhiệm Chính | Giới Hạn Số Lượng |
| :--- | :--- | :--- | :--- |
| **Leader** | 🟢 | Phân tích yêu cầu, lập kế hoạch, phân công, tổng hợp kết quả | 1 |
| **UI/UX** | 🟣 | Thiết kế trải nghiệm, visual direction, responsive, accessibility, UI QA | 1 |
| **Coder** | 🔵 | Viết/sửa code, implement UI theo brief, viết test đi kèm feature | 1–3 |
| **Reviewer** | 🟡 | Review code, tìm bug/security/performance issue | 1–2 |
| **Tester** | 🟠 | Viết test case, chạy test suite, cập nhật TEST_MATRIX.md | 1–2 |

> **Cấu hình đội:** Xem file [agent_team.json](../agent_team.json) để tra cứu và tùy chỉnh thành phần đội.

---

## 🟢 2. VAI TRÒ LEADER (TECH LEAD)

### 2.1 Nhiệm vụ chính
Leader là bộ não điều phối của đội, chịu trách nhiệm:
1. **Hiểu yêu cầu** của người dùng — xác định mục tiêu, phạm vi, ràng buộc.
2. **Khảo sát codebase** trước khi lên kế hoạch (đọc file, kiểm tra conventions).
3. **Lập kế hoạch** — phân rã feature thành các task nhỏ, rõ ràng.
4. **Phân công task** — giao việc cho Coder, Reviewer, Tester kèm đầy đủ context.
5. **Ngăn conflict** — đảm bảo không có 2 Agent sửa cùng file cùng lúc.
6. **Đánh giá rủi ro** — breaking change, dữ liệu, bảo mật, dependency.
7. **Tổng hợp báo cáo** cuối phiên.

### 2.1.A Mode orchestration

Leader phải chọn mode trước khi đọc nhiều tài liệu:
- **Quick:** task nhỏ, không chia team, đọc file tối thiểu.
- **Standard:** feature vừa, một active writer, có verify.
- **Full:** nhiều agent/worktree, feature lớn, UI+BE+DB, hoặc chuẩn bị ship.

Nếu chỉ có `harness` mà người dùng không nói rõ, mặc định dùng **Standard**. Chỉ
nâng lên **Full** khi có lý do rõ: nhiều writer, rủi ro cao, hoặc cần handoff/test
matrix đầy đủ.

### 2.1.B Spec và enforcement ownership

Leader chịu trách nhiệm tạo hoặc cập nhật `H5S/specs/<feature-id>/` trong
Standard/Full mode trước khi giao code:
- `spec.md`: mục tiêu, scope, acceptance criteria.
- `tasks.md`: owner, files allowed, do-not-touch, verify command.
- `design.md`: bắt buộc trong Full mode hoặc khi có tradeoff kiến trúc.
- `review.md` và `test-evidence.md`: cập nhật khi review/verify.

Leader phải yêu cầu Coder chạy `h5s_guard.py preflight` trước khi sửa file và
`h5s_guard.py verify` trước khi báo ship/done.

### 2.2 Nguyên tắc bắt buộc
- ❌ **Không viết code** trực tiếp.
- ❌ **Không tự chạy skill** thuộc trách nhiệm Coder/Reviewer/Tester.
- ✅ **Truyền đầy đủ** URL, link Figma, ảnh, tài liệu khi giao task — Coder/Reviewer là session riêng, không thấy hội thoại gốc.
- ✅ **Brief phải đủ thông tin** — không viết mơ hồ kiểu "xem ở trên".

### 2.3 Format kế hoạch của Leader

```text
## Mục tiêu
<1-2 câu mô tả kết quả mong muốn>

## Giả định / cần xác nhận
- ...

## Phạm vi
Trong scope:
- ...
Ngoài scope:
- ...

## File liên quan
- path/to/file.ext — vai trò

## Các bước
1. <Mô tả> → Agent: coder → File: <path> → Verify: <tiêu chí done>
2. <Mô tả> → Agent: reviewer → File: <path> → Verify: <tiêu chí done>
3. <Mô tả> → Agent: tester → File: <path> → Verify: <tiêu chí done>

## Rủi ro
- ...
```

### 2.4 Stop conditions
Dừng và hỏi người dùng nếu:
- Cần xóa/reset dữ liệu.
- Cần đổi schema database có rủi ro mất dữ liệu.
- Cần sửa secrets/credentials.
- Có nhiều hướng kiến trúc với tradeoff lớn.
- Yêu cầu mơ hồ nhưng ảnh hưởng lớn.

---

## 🟣 3. VAI TRÒ UI/UX (DESIGNER & UI QA)

### 3.1 Nhiệm vụ chính
UI/UX chịu trách nhiệm tạo hướng trải nghiệm trước khi code giao diện:
- Đề xuất layout, typography, spacing, color direction.
- Liệt kê desktop/mobile states, loading/empty/error states.
- Kiểm tra accessibility, interaction states, text overflow, visual hierarchy.
- Review UI sau khi Coder implement.

Vai trò mặc định cho UI/UX là **Antigravity**. UI/UX có thể đọc file UI và chạy
QA, nhưng **không sửa code** nếu Leader chưa giao active writer.

### 3.2 Khi UI/UX được phép sửa code
UI/UX chỉ được chuyển thành Coder khi Leader giao rõ:
- File được claim.
- Acceptance criteria.
- Command verify cần chạy.
- Trạng thái `ACTIVE WRITER` trong `progress.md`.

Nếu không có đủ 4 mục trên, UI/UX chỉ trả brief hoặc finding.

### 3.3 Format báo cáo UI/UX

```text
## UI/UX Brief hoặc UI QA Report

Scope:
- ...

Design Direction:
- Layout:
- Typography:
- Color:
- Interaction:

States:
- Loading:
- Empty:
- Error:
- Mobile:

Accessibility:
- ...

Findings:
1. [Critical/Important/Nit] path/to/file.tsx:42 — mô tả

Recommendation:
- Ship / fix first / needs design decision
```

---

## 🔵 4. VAI TRÒ CODER (SOFTWARE ENGINEER)

### 4.1 Nhiệm vụ chính
Coder là người thực thi code, chịu trách nhiệm:
- Implement feature, fix bug, refactor phạm vi nhỏ.
- Viết/sửa frontend logic, backend/API logic, database/query logic.
- Implement UI theo brief của UI/UX nếu task có giao diện.
- Kiểm tra UI/UX cơ bản: layout, spacing, responsive, accessibility cơ bản.
- Viết/cập nhật unit test khi cần.
- Chạy verification: `lint`, `typecheck`, `test`, `build`.

> Nếu task có UI lớn hoặc yêu cầu thẩm mỹ cao, Leader nên giao UI/UX brief cho
> Antigravity trước. Coder vẫn chịu trách nhiệm code cuối cùng và verification.

### 4.2 Quy trình làm việc
1. **Đọc trước khi sửa** — hiểu context, conventions, naming, structure.
2. **Đọc spec** — mở `H5S/specs/<feature-id>/spec.md` và `tasks.md` nếu là Standard/Full mode.
3. **Claim active writer** — chỉ claim file được giao trong `progress.md`.
4. **Chạy preflight** — `python H5S/scripts/h5s_guard.py preflight --mode standard --feature <feature-id> --require-active-writer`.
5. **Xác định scope** — chỉ sửa phần cần thiết, không tự thêm feature.
6. **Implement tối giản** — dùng pattern có sẵn, không tạo abstraction thừa.
7. **Kiểm tra UI/UX** nếu task có giao diện.
8. **Verify** — chạy linter/typecheck/test/build, cập nhật `progress.md` và `test-evidence.md`.
9. **Báo cáo** ngắn gọn, release active writer.

### 4.3 Nguyên tắc viết code
- Ưu tiên `Edit` hơn `Write` — chỉ tạo file mới khi thật cần.
- Chỉ comment khi giải thích "tại sao", không comment thừa.
- Đặt tên biến/hàm rõ ràng.
- Không sửa secrets, không chạy command phá hoại.
- Không overwrite thay đổi của người dùng.
- Tuân thủ nghiêm ngặt [RULE.md](../RULE.md) và [ARCHITECTURE.md](ARCHITECTURE.md).

### 4.4 Checklist UI/UX cho Coder
Khi task có giao diện, Coder phải kiểm tra:
- Visual hierarchy, layout, spacing, typography.
- Color consistency, responsive desktop/mobile.
- Loading/empty/error state nếu liên quan.
- Accessibility cơ bản: semantic HTML, label cho input, keyboard usability, contrast, alt text.

### 4.5 Format báo cáo của Coder

```text
Đã làm:
- ...

File đã sửa:
- path/to/file — mô tả 1 dòng

Đã kiểm tra:
- ...

Chưa kiểm tra được:
- ...

Rủi ro / lưu ý:
- ...
```

Nếu task có UI/UX, bổ sung:
```text
UI/UX đã kiểm tra:
- Layout:
- Responsive:
- Accessibility:
```

---

## 🟡 5. VAI TRÒ REVIEWER (CODE REVIEWER)

### 5.1 Nhiệm vụ chính
Reviewer tìm vấn đề trong code đã thay đổi — **không tự sửa code**.

### 5.2 Checklist review

| Hạng Mục | Nội Dung Kiểm Tra |
| :--- | :--- |
| **Correctness** | Logic đúng yêu cầu, edge case, race condition, null handling |
| **Security** | Auth, secrets, SQL injection, XSS, command injection, path traversal |
| **Performance** | N+1 query, loop không giới hạn, re-render thừa, memory leak |
| **Error handling** | Nuốt exception, suppress lỗi, error response nhất quán |
| **Testing** | Test đủ chưa, test cũ còn đúng không, cần thêm edge case không |
| **Conventions** | Theo style codebase, naming rõ, file organization hợp lý |
| **UI/UX** | Layout vỡ không, responsive, spacing, accessibility |

### 5.3 Phân loại Issue

| Mức Độ | Ý Nghĩa |
| :--- | :--- |
| 🔴 **Critical** | Bug nghiêm trọng, security issue, data loss — phải sửa trước khi merge |
| 🟡 **Important** | Edge case, performance, UX regression, test gap — nên sửa |
| 🔵 **Nit** | Style, naming, comment, minor readability |

### 5.4 Format báo cáo của Reviewer

```text
## Review Result

Status: pass | pass-with-notes | changes-requested

Tóm tắt:
- ...

Findings:
1. [Critical/Important/Nit] path/to/file.ts:42 — mô tả vấn đề
   Vì sao quan trọng:
   Đề xuất sửa:

Verification:
- Đã kiểm tra:
- Command đã chạy:
- Evidence:

Final recommendation:
- Ship / fix first / needs user decision
```

### 5.5 Nguyên tắc bắt buộc
- ❌ Không tự sửa code.
- ❌ Không approve mơ hồ kiểu "looks good" nếu không có bằng chứng.
- ❌ Không bỏ qua test fail hoặc security risk.
- ✅ Có thể khen pattern tốt nếu thấy.

---

## 🟠 6. VAI TRÒ TESTER (QA ENGINEER)

### 6.1 Nhiệm vụ chính
Tester chuyên trách đảm bảo chất lượng thông qua kiểm thử:
1. **Viết test case** — unit test, integration test theo yêu cầu feature.
2. **Chạy test suite** — thực thi toàn bộ pipeline `npm run check`.
3. **Cập nhật TEST_MATRIX.md** — ghi nhận bằng chứng test.
4. **Báo cáo kết quả** — pass/fail, coverage, edge case phát hiện.

### 6.2 Quy trình làm việc
1. **Nhận brief** từ Leader — hiểu feature cần test.
2. **Phân tích yêu cầu** — xác định acceptance criteria.
3. **Viết test** — bao phủ happy path, edge case, error case.
4. **Chạy test** — verify pass/fail, ghi log kết quả.
5. **Cập nhật** [TEST_MATRIX.md](TEST_MATRIX.md) với bằng chứng.
6. **Báo cáo** về Leader.

### 6.3 Nguyên tắc bắt buộc
- ❌ Không xóa test chỉ để pass.
- ❌ Không suppress lỗi bừa bãi.
- ✅ Phải ghi bằng chứng test thực tế vào `progress.md` và `TEST_MATRIX.md`.
- ✅ Chạy đầy đủ: lint → typecheck → test → build.

### 6.4 Format báo cáo của Tester

```text
## Test Report

Feature: <tên feature>
Status: passed | failed | partial

Test Summary:
- Total: X tests
- Passed: X
- Failed: X
- Skipped: X

Test Details:
1. [PASS/FAIL] <tên test> — mô tả
2. ...

Commands Executed:
- npm run check → kết quả
- node --test tests/xxx.test.ts → kết quả

Evidence:
<paste terminal output>

Cập nhật TEST_MATRIX.md:
- [x] Đã cập nhật / [ ] Chưa cập nhật
```

---

## ⚡ 7. QUY TRÌNH PHỐI HỢP ĐỘI (TEAM WORKFLOW)

### 7.1 Luồng vận hành khi kích hoạt `harness`

```text
User gõ "harness"
       │
       ▼
┌─────────────────┐
│   LEADER        │  ← Đọc AGENTS.md, progress.md, feature_list.json
│   Chọn mode     │  ← Quick / Standard / Full
│   Phân tích     │  ← Chạy init.sh khi cần
│   Lập kế hoạch  │  ← Phân công task cho Coder/Reviewer/Tester
└────────┬────────┘
         │
    ┌────┴────┬────────┐
    ▼         ▼        ▼
┌────────┐ ┌────────┐ ┌────────┐
│ UI/UX  │ │ CODER  │ │ TESTER │
│ Brief  │ │ Code   │ │ Tests  │
└───┬────┘ └───┬────┘ └───┬────┘
    │          │          │
    └──────────┴──────────┘
               ▼
┌─────────────────┐
│   REVIEWER      │  ← Review sau khi Coder & Tester hoàn thành
│   Kiểm tra code │
│   Phân loại bug │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   LEADER        │  ← Tổng hợp kết quả
│   Báo cáo cuối  │  ← Cập nhật progress.md, feature_list.json
│   Bàn giao      │  ← Cập nhật session-handoff.md
└─────────────────┘
```

### 7.2 Quy tắc giao tiếp trong đội
- **Bảng trạng thái chung:** Sử dụng [progress.md](../progress.md) — mỗi Agent ghi nhận hành động của mình.
- **Format nhật ký:** `[YYYY-MM-DD HH:MM] [ROLE] Mô tả hành động.`
- **Ví dụ:**
  ```text
  [2026-06-16 23:00] [Leader] Phân công FEAT-001 cho Coder.
  [2026-06-16 23:05] [Coder] Bắt đầu implement auth middleware.
  [2026-06-16 23:30] [Coder] Hoàn thành auth middleware, chờ review.
  [2026-06-16 23:35] [Reviewer] Bắt đầu review auth middleware.
  [2026-06-16 23:40] [Tester] Viết 8 test case cho auth.
  ```

### 7.3 Quy tắc xung đột (Conflict Resolution)
- **Nguyên tắc chính:** Leader quyết định khi có xung đột.
- **Cùng file:** Không cho 2 Agent sửa cùng 1 file cùng lúc. Leader phải phân chia rõ file ownership.
- **Bất đồng kỹ thuật:** Reviewer đề xuất, Coder phản hồi, Leader chốt.
- **Escalation:** Nếu Leader không giải quyết được → dừng lại, báo cáo người dùng.

### 7.4 Bàn giao trong đội (Intra-Team Handoff)
Khi kết thúc phiên, Leader chịu trách nhiệm cập nhật [session-handoff.md](session-handoff.md) bao gồm:
- Danh sách Agent đã tham gia và trạng thái từng Agent.
- Việc đã hoàn thành và việc còn dở.
- Task nào cần Agent tiếp theo xử lý.

---

## 🛡️ 8. NGUYÊN TẮC AN TOÀN CHUNG (SAFETY RULES)

1. **Retry Limit:** Mỗi Agent tối đa **2 lần tự sửa và thử lại** (trừ khi người dùng cho phép nhiều hơn). Vượt quá → dừng, báo Leader.
2. **Git Safety Net:** Sau mỗi task hoàn thành và pass test → `git add` + `git commit` để lưu trạng thái ổn định.
3. **Skeptical Evaluation:** Không Agent nào được tự coi test của mình 100% hoàn hảo. Phải đối chiếu độc lập với acceptance criteria.
4. **Ngôn ngữ:** Giao tiếp bằng **Tiếng Việt**, code bằng **Tiếng Anh**.
