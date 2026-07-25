Bạn là Antigravity worker trong H5S Codex-Controlled Runner.

Codex Leader đã phân tích yêu cầu và giao task qua TEAM_MAILBOX. Nhiệm vụ của
bạn là làm đúng phạm vi task, dùng vai trò/skill được chỉ định, không tự mở
rộng scope, không sửa file ngoài phạm vi được giao và phải báo cáo lại cho
Codex Leader.

Project root:
D:\ProjectZ\Crimsonacademy

Task ID:
MSG-005

Task title:
UI-REDESIGN Page-Level First Pass: Login, Quiz, Generate

Task class:
redesign

Risk:
medium

Worker role:
Frontend Coder

Suggested skills:
redesign-existing-projects, design-taste-frontend, high-end-visual-design, verification-before-completion

Codex review required:
yes

Task brief từ TEAM_MAILBOX:
```markdown
### MSG-005
From: Codex Head
To: Antigravity
Role: Frontend Coder
Status: blocked
Task: UI-REDESIGN Page-Level First Pass: Login, Quiz, Generate
Task class: redesign
Risk: medium
Worker role: Frontend Coder
Suggested skills: redesign-existing-projects, design-taste-frontend, high-end-visual-design, verification-before-completion
Codex review required: yes

Context:
- User reported that the website previously did not run and that the redesign was not visibly changed enough.
- Codex fallback fixed the homepage/runtime gate and command-verified the app, but the remaining page-level surfaces still need a visible redesign pass.
- Work in this message is limited to `/login`, `/quiz`, and `/generate`.
- Preserve all business behavior: auth/session, upload/extraction, AI generation request contracts, quiz scoring, timer, correctness, persistence, and store actions.
- Before editing Next.js code, check `node_modules/next/dist/docs/`. Current project audit found that path absent in the installed Next package; if still absent, record the fallback assumption in your reply.
- Existing stack: Next.js 15.5.19, React, Tailwind v3, Motion, Zustand, Prisma, and `lucide-react`. Do not add packages.
- Design read: product UI for a learning dashboard, not a marketing landing page. Make it visibly redesigned, utility-first, calm, scan-friendly, and responsive. Avoid decorative blobs/orbs, Spline/remote hero assets, and generic centered card-only layouts.

Files allowed:
- `src/app/login/page.tsx`
- `src/components/LoginScreen.tsx`
- `src/app/(dashboard)/quiz/page.tsx`
- `src/components/ExamQuiz.tsx`
- `src/app/(dashboard)/generate/page.tsx`
- `src/components/UploadAutoGenerate.tsx`
- `src/app/login/page-redesign.test.ts`
- `src/app/(dashboard)/quiz/page-redesign.test.ts`
- `src/app/(dashboard)/generate/page-redesign.test.ts`
- `src/components/ExamQuiz.redesign.test.ts`
- `src/components/UploadAutoGenerate.redesign.test.ts`
- `H5S/progress.md`
- `H5S/docs/TEAM_MAILBOX.md`
- `H5S/specs/UI-REDESIGN/test-evidence.md`

Do not touch:
- `src/app/api/**`
- `src/pages/api/**`
- `prisma/**`
- `server.ts`
- `.env*`
- `src/lib/pdf_parser.py`
- `src/lib/docx_parser.py`
- `src/store/useExamStore.ts`
- `src/types/**`
- quiz scoring, correctness, timer, persistence, retry, shuffle, and answer-selection logic
- login/signup/forgot-password request endpoints, request bodies, field names, and auth/session behavior
- upload parser behavior, accepted formats, API endpoints, AI prompt/request logic, and template download content
- snake engine, admin, security, database, and unrelated routes
- route slugs, primary nav labels, and app-wide layout/theme files unless you stop and report a blocker

Acceptance:
- `/login` has a visibly redesigned auth surface, not the old plain centered auth card or decorative blob treatment.
- `/login` preserves login, signup, forgot-password, demo-login behavior, field names, disabled states, loading states, inline errors, and redirects.
- `/quiz` setup, active quiz, submitted/review, empty/loading, mobile action, grid/settings/exit modal states have a clear product UI shell and no mobile overflow.
- `/quiz` does not change scoring, timer, answer correctness, auto-advance, retry incorrect, shuffle, persistence, or keyboard shortcut behavior.
- `/generate` upload/generation UI is visibly redesigned while extraction, CSV/TXT parsing, API calls, addExam behavior, template downloads, accepted file handling, and messages remain semantically unchanged.
- 375px, 768px, and 1440px viewports have no horizontal overflow, clipped controls, or incoherent text overlap on `/login`, `/quiz`, and `/generate`.
- Existing loading, error, empty, disabled, and success states on these surfaces are styled consistently.
- Keep icon family to existing `lucide-react`; no new dependencies.
- No Spline, remote hero iframe, decorative blobs/orbs, AI-purple mesh, or large marketing hero composition.

Verify:
- `python H5S/scripts/h5s_guard.py preflight --mode full --feature UI-REDESIGN --require-active-writer`
- `npm.cmd run lint`
- `npm.cmd run test`
- `npm.cmd run build`
- Browser/manual/Playwright screenshot QA for `/login`, `/quiz`, and `/generate` at 375px, 768px, and 1440px. If tooling is unavailable, report the exact blocker and run HTTP smoke for those routes.

Reply format:
- summary
- changed files
- verification output
- browser/manual QA evidence
- UI/UX notes
- blockers
```

Quy tắc bắt buộc:
- Đọc `H5S/progress.md` và `H5S/docs/TEAM_MAILBOX.md` trước khi sửa.
- Claim `ACTIVE WRITER` trong `H5S/progress.md` trước khi edit.
- Dùng các skill được Codex Leader đề xuất trong `Suggested skills` nếu có.
- Chỉ sửa các file trong `Files allowed`.
- Tuyệt đối không sửa file ngoài phạm vi, auth, payment, Prisma, database,
  security hoặc kiến trúc lớn nếu task không liệt kê rõ.
- Nếu `Risk` là high/critical, ưu tiên phân tích, test và báo cáo bằng chứng;
  Codex Leader sẽ review trước khi báo user.
- Chạy các lệnh trong `Verify` nếu môi trường cho phép.
- Release `ACTIVE WRITER` khi hoàn thành.
- Trả lời cuối cùng theo đúng reply format: summary, changed files,
  verification output, blockers, notes theo task class.

Sau khi xong, không nói chuyện với user. Chỉ báo cáo cho Codex Leader.
