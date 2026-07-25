# H5S Skill Router

File này giúp Codex Leader tự chọn skill phù hợp trước khi giao task cho
Antigravity hoặc tự xử lý trong vai Codex Coder/Reviewer.

Nguyên tắc: **Codex Leader chọn skill theo task, ghi quyết định vào
`Suggested skills` trong `TEAM_MAILBOX.md`, rồi mới dispatch worker.**

## Quy Trình Chọn Skill

1. Đọc yêu cầu của người dùng.
2. Khảo sát project đủ để biết stack, files liên quan và rủi ro.
3. Chọn `task_class`.
4. Chọn `risk`: `low`, `medium`, `high`, `critical`.
5. Chọn skill từ bảng dưới.
6. Ghi vào task mailbox:

```markdown
Task class: <class>
Risk: <risk>
Worker role: <role>
Suggested skills: <skill-a>, <skill-b>
Codex review required: yes
```

Nếu task không cần worker, Codex vẫn ghi skill decision vào plan hoặc response
ngắn trước khi làm.

## Task Class

| Task class | Khi dùng | Worker phù hợp |
| :--- | :--- | :--- |
| `planning` | Phân tích yêu cầu, chia scope, viết spec/tasks | Codex Leader |
| `frontend-ui` | UI, component, responsive, visual polish, a11y | Antigravity |
| `redesign` | Redesign app/site hiện có | Antigravity + Codex review |
| `backend-api` | API, service, business logic | Antigravity nếu risk thấp/vừa; Codex nếu risk cao |
| `security-hardening` | Auth, permission, secrets, input validation | Codex primary; Antigravity chỉ hỗ trợ task nhỏ |
| `document-extraction` | Word/PDF/TXT parsing, file upload, extraction flow | Antigravity/Codex tùy risk |
| `debugging` | Bug, test fail, lỗi runtime/build | Codex hoặc Antigravity theo file ownership |
| `testing` | Unit/integration/e2e test, test matrix | Antigravity hoặc Codex |
| `review` | Code review, final ship review | Codex Reviewer |
| `docs` | README, handoff, changelog, workflow docs | Antigravity hoặc Codex |
| `research` | Docs thư viện/API, cập nhật usage theo version | Codex nếu cần web/docs chính thức |
| `fullstack` | Chạm cả UI + backend + verify | Codex chia nhỏ thành nhiều MSG |

## Skill Map

| Task | Suggested skills |
| :--- | :--- |
| Làm feature mới | `brainstorming`, `writing-plans`, `test-driven-development` |
| Code logic hoặc backend | `test-driven-development`, `verification-before-completion` |
| Debug bug/test fail | `systematic-debugging`, `test-driven-development` |
| UI/frontend thường | `design-taste-frontend`, `ui-ux-pro-max`, `verification-before-completion` |
| Redesign project hiện có | `redesign-existing-projects`, `design-taste-frontend`, `high-end-visual-design` |
| Landing/marketing cinematic | `imagegen-frontend-web`, `frontend-design`, `high-end-visual-design` |
| Mobile/app screen concept | `imagegen-frontend-mobile` |
| Word/docx | `documents:documents` |
| PDF | `pdf:pdf` |
| Spreadsheet/CSV/XLSX | `spreadsheets:Spreadsheets` |
| PowerPoint/slides | `presentations:Presentations` |
| Security/auth/payment/DB review | `verification-before-completion`, `requesting-code-review` |
| Code review | `requesting-code-review`, `verification-before-completion` |
| Nhận review feedback | `receiving-code-review` |
| Parallel subtasks | `dispatching-parallel-agents`, `subagent-driven-development` |
| Isolated worktree | `using-git-worktrees` |
| Ship/finish branch | `verification-before-completion`, `finishing-a-development-branch` |

## Risk Rules

| Risk | Codex Leader làm gì |
| :--- | :--- |
| `low` | Có thể giao Antigravity trực tiếp nếu files allowed rõ. |
| `medium` | Giao worker nhưng Codex review diff và verify trước khi báo user. |
| `high` | Codex phải viết spec/tasks rõ; worker chỉ làm phần được khoanh vùng. |
| `critical` | Codex giữ quyền quyết định; worker chỉ hỗ trợ đọc/QA/docs nếu cần. |

Luôn giữ Codex làm reviewer cuối với:

- auth, permission, security
- payment
- database migration / data loss risk
- file upload / document parsing có rủi ro bảo mật
- final ship review
- architecture decision

## Format Model + Skill Decision

Codex Leader ghi ngắn trong plan hoặc mailbox:

```text
Delegation decision:
- task_class: document-extraction
- risk: high
- worker_role: Coder / Tester
- suggested_skills: systematic-debugging, test-driven-development, pdf:pdf, documents:documents
- codex_review_required: yes
- reason: xử lý file upload/parser có rủi ro bảo mật và cần verify extraction.
```

Nếu không tìm thấy skill phù hợp, ghi:

```text
Suggested skills: none
Skill note: không có skill local phù hợp; worker dùng H5S/RULE.md và docs project.
```
