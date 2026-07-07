# UI-REDESIGN Tasks

## Preflight

- [x] Chọn mode: Full.
- [x] Cập nhật `H5S/progress.md` current task.
- [x] Chạy `python H5S/scripts/h5s_guard.py preflight --mode full --feature UI-REDESIGN --require-active-writer`.
- [x] Trước khi code, active writer phải claim files được giao. Codex Coder fallback claim vì Antigravity không callable trong phiên này.
- [x] Trước khi sửa Next.js code, kiểm tra `node_modules/next/dist/docs/` hoặc ghi rõ path này không tồn tại trong package hiện tại.

## Task 1: UI/UX Audit And Direction

Owner: Antigravity UI/UX  
Status: completed via `REPLY-001`; Codex Leader reviewed and closed `MSG-001`  
Files allowed:
- Read only: `src/app/(dashboard)/**`, `src/components/**`, `src/app/globals.css`, `src/lib/theme.ts`, `tailwind.config.ts`
- Write only: reply in `H5S/docs/TEAM_MAILBOX.md` after Codex releases active writer

Do not touch:
- Source code
- Auth, API, Prisma, security, parser files

Checklist:
- [x] Produce visual audit with brand tokens, IA, page inventory, patterns to preserve and patterns to retire.
- [x] Provide design direction for app shell, typography, spacing, colors, shape scale, motion and a11y.
- [x] List desktop/mobile states for all key screens.
- [x] Propose implementation slices with files allowed per slice.

Verify:
- Antigravity reported no source code changed for the design-only brief.
- Codex reviewed Antigravity reply before implementation starts.

## Task 2: Foundation Slice

Owner: Antigravity Coder after Codex approval  
Status: completed via `REPLY-003`; Codex verified CSS output and approved moving to Slice 2  
Files allowed:
- `src/app/globals.css`
- `src/lib/theme.ts`
- `src/lib/useThemeTokens.ts`
- `src/components/ui/*.tsx`
- `src/app/layout.tsx` only for approved font loading changes after Next.js docs/fallback check
- `tailwind.config.ts` only if token names require it

Do not touch:
- Routes, business logic, APIs, Prisma, parser files

Checklist:
- [x] Normalize semantic tokens for surface, text, accent, border, focus, feedback and shadow.
- [x] Replace scattered one-off radii with a documented shape rule.
- [x] Keep `lucide-react` as the icon family unless Codex approves a package change.
- [x] Ensure button/input/card primitives have focus, disabled, loading-compatible and active states.
- [x] Fix Tailwind opacity utilities that were not emitted in production CSS:
  - `src/components/ui/AppBadge.tsx`: `bg-[#1B4332]/8`, `bg-[var(--accent)]/8`, `border-[var(--accent)]/16`.
  - `src/lib/useThemeTokens.ts`: `bg-white/8`, `bg-[#8FDCB9]/15`, `bg-[#D91A3C]/8`.
- [x] If Tailwind class strings remain in `src/lib/useThemeTokens.ts`, ensure Tailwind content scanning/safelist covers them or replace them with CSS-variable-safe output.

Verify:
- `npm.cmd run lint`
- `npm.cmd run test`
- `npm.cmd run build`
- CSS output check in `.next/static/css/app/layout.css` for the fixed selectors/rules

## Task 3: App Shell Slice

Owner: Antigravity Coder; Codex Coder fallback when Antigravity is not callable  
Status: command-verified via Codex fallback; browser viewport QA blocked  
Files allowed:
- `src/app/(dashboard)/layout.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/layout/MainLayoutWrapper.tsx`

Do not touch:
- Route slugs
- Primary nav labels unless Codex explicitly approves
- Auth/session behavior

Checklist:
- [x] Desktop sidebar is scannable and stays within viewport.
- [x] Mobile tab bar has stable dimensions and no text overflow controls at 375px source-level.
- [x] Account sheet/menu supports logged-in, guest and admin UI states.
- [x] Reduced-motion path exists for route/page transitions.

Verify:
- `python H5S/scripts/h5s_guard.py preflight --mode full --feature UI-REDESIGN --require-active-writer` pass.
- `npm.cmd run test -- src/components/layout/navigation.test.ts` pass.
- `npm.cmd run lint` pass.
- `npm.cmd run test` pass, 4 files and 16 tests.
- `npm.cmd run build` pass.
- HTTP smoke for `/`, `/login`, `/quiz`, `/generate` pass.
- Manual/browser viewport QA at 375px, 768px, 1440px remains blocked because no browser backend was available in this Codex session.

## Task 4: Learning And Exam Screens

Owner: Antigravity Coder  
Files allowed:
- `src/components/ExamQuiz.tsx`
- `src/components/QuickQuiz.tsx`
- `src/components/ReviewNotebook.tsx`
- `src/components/exam/*.tsx`
- `src/app/(dashboard)/quiz/page.tsx`
- `src/app/(dashboard)/quick-quiz/page.tsx`
- `src/app/(dashboard)/review/page.tsx`

Do not touch:
- `useExamStore` scoring logic
- Question correctness, timer math, persistence API calls

Checklist:
- [ ] Setup, active exam, submitted result and retry states are visually distinct.
- [ ] Question grid and answer options are keyboard-readable and mobile-safe.
- [ ] Empty review notebook state tells the user what action populates it.
- [ ] Long question text and image questions do not break layout.

Verify:
- `npm.cmd run lint`
- `npm.cmd run test`
- Manual QA for active timed quiz and submitted quiz.

## Task 5: Generate, Leaderboard, Settings, Admin, Game Screens

Owner: Antigravity Coder  
Files allowed:
- `src/components/UploadAutoGenerate.tsx`
- `src/components/Leaderboard.tsx`
- `src/components/AccountSettings.tsx`
- `src/components/AdminStatsDashboard.tsx`
- `src/components/VocabularySnake.tsx`
- `src/components/snake/SnakeCanvas.tsx`
- route page wrappers under `src/app/(dashboard)/**`

Do not touch:
- Upload/parser behavior
- Auth/admin permissions
- Snake engine logic in `src/components/snake/SnakeGameEngine.ts`

Checklist:
- [ ] Upload screen is redesigned but extraction behavior is unchanged.
- [ ] Leaderboard supports loading/error/empty states and dense ranking data.
- [ ] Admin dashboard is dense, scannable and not marketing-styled.
- [ ] Snake screen keeps game canvas stable on desktop and mobile.

Verify:
- `npm.cmd run lint`
- `npm.cmd run test`
- `npm.cmd run build`
- Browser QA for `/generate`, `/leaderboard`, `/settings`, `/admin`, `/snake`.

## Task 6: Review And Visual QA

Owner: Codex Reviewer + Antigravity UI QA  
Files allowed:
- `H5S/specs/UI-REDESIGN/review.md`
- `H5S/specs/UI-REDESIGN/test-evidence.md`
- `H5S/docs/TEST_MATRIX.md`

Checklist:
- [ ] Review diff for route stability and backend isolation.
- [ ] Capture visual QA findings by severity.
- [ ] Run full verification and record evidence.
- [ ] Update `review.md` with ship/fix decision.

Verify:
- `npm.cmd run lint`
- `npm.cmd run test`
- `npm.cmd run build`
- Browser screenshots or notes across required breakpoints.

## Closeout

- [x] Release `ACTIVE WRITER`.
- [ ] Codex Leader reviews Antigravity reply and diff.
- [ ] Reviewer updates `review.md`.
- [ ] Tester updates `test-evidence.md` and `H5S/docs/TEST_MATRIX.md`.
- [ ] Leader updates `session-handoff.md` if implementation remains incomplete.
