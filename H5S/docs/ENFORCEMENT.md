# H5S Enforcement

Tài liệu này biến các quy tắc H5S thành gate có thể kiểm tra được. Guard script
không thay review của Leader, nhưng giúp bắt lỗi phù hợp với máy trước khi agent
bắt đầu sửa file hoặc kết luận đã xong.

---

## 1. Guard Script

Script:

```text
H5S/scripts/h5s_guard.py
```

Chạy từ project root hoặc từ chính thư mục `H5S/`.

```bash
python H5S/scripts/h5s_guard.py bootstrap
python H5S/scripts/h5s_guard.py preflight --mode standard --feature FEAT-001
python H5S/scripts/h5s_guard.py verify --mode standard --feature FEAT-001
```

Nếu trên Windows chỉ có Python launcher:

```powershell
py H5S/scripts/h5s_guard.py bootstrap
```

---

## 2. Bootstrap Gate

Dùng khi copy H5S sang project mới hoặc trước khi bắt đầu Full mode.

```bash
python H5S/scripts/h5s_guard.py bootstrap
```

Kiểm tra:
- Các file core tồn tại: `AGENTS.md`, `RULE.md`, `progress.md`,
  `feature_list.json`.
- Các doc core tồn tại: `FEATURE_INTAKE.md`, `TEST_MATRIX.md`,
  `SPEC_WORKFLOW.md`, `ENFORCEMENT.md`.
- Script và spec template tồn tại.

---

## 3. Preflight Gate

Dùng trước khi agent sửa file trong Standard/Full mode.

```bash
python H5S/scripts/h5s_guard.py preflight --mode standard --feature FEAT-001
```

Kiểm tra:
- Feature ID không còn `UNASSIGNED`.
- Standard mode có `spec.md` và `tasks.md`.
- Full mode có đủ `spec.md`, `design.md`, `tasks.md`, `review.md`,
  `test-evidence.md`.
- `progress.md` có block `ACTIVE WRITER`.

Nếu muốn bắt buộc đang có active writer trước khi code:

```bash
python H5S/scripts/h5s_guard.py preflight --mode standard --feature FEAT-001 --require-active-writer
```

---

## 4. Verify Gate

Dùng trước khi Leader/agent nói task đã xong hoặc ship được.

```bash
python H5S/scripts/h5s_guard.py verify --mode standard --feature FEAT-001
```

Kiểm tra:
- `TEST_MATRIX.md` có dòng cho feature.
- Dòng feature không còn `Pending`.
- `test-evidence.md` tồn tại trong spec folder nếu là Standard/Full.

Guard này không thay thế test command. Agent vẫn phải chạy lệnh thực tế như
`npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, hoặc command
từ project.

---

## 5. Claude Hooks / ClaudeKit Integration

Nếu dùng Claude Code, có thể map H5S gate vào hooks:

| Hook | H5S action |
| :--- | :--- |
| `SessionStart` | `python H5S/scripts/h5s_guard.py bootstrap` |
| `PreToolUse` với edit/write | `preflight --require-active-writer` |
| `Stop` | `verify` nếu task đang ở trạng thái ready-to-ship |

Nếu dùng ClaudeKit, để ClaudeKit làm guardrail runtime, nhưng H5S vẫn giữ source
of truth:
- H5S giữ `progress.md`, `ACTIVE WRITER`, `specs/`, `TEST_MATRIX.md`.
- ClaudeKit giữ checkpoint, codebase map, hooks, file guard.
- Khi xung đột, user request > `RULE.md` > `progress.md` > H5S specs >
  ClaudeKit suggestion.

---

## 6. Minimum Manual Gate Nếu Không Có Python

Nếu không chạy được Python, agent phải tự kiểm tra bằng tay trước khi sửa file:
- `progress.md` có `ACTIVE WRITER` free hoặc mình đã claim.
- `H5S/specs/<feature-id>/spec.md` tồn tại.
- `H5S/specs/<feature-id>/tasks.md` có files allowed và verify command.
- `TEST_MATRIX.md` có dòng cho feature trước khi close.
