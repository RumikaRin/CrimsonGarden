# Crimson Academy UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign Crimson Academy into a coherent annotated-workbook UI with a unified theme system, better mobile shell, and page-by-page polish without breaking existing learning flows.

**Architecture:** Start by consolidating design tokens, font usage, and theme application so every screen reads from one visual source of truth. Then update the shared shell and the highest-traffic product surfaces in small, independent tasks: dashboard, auth/settings, exam flows, content generation, leaderboard/admin, and the snake game.

**Tech Stack:** Next.js 15 App Router, React 19, Tailwind CSS v3, Zustand, `motion/react`, Sonner, existing `src/components/ui` primitives.

---

### Task 1: Theme foundation and token consolidation

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/lib/theme.ts`
- Modify: `src/providers/theme-provider.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `tailwind.config.ts`
- Modify: `src/index.css` if it is still imported anywhere after audit

**Scope:**
- Add semantic feedback tokens for success and danger in `:root` and `.dark`.
- Remove duplicate theme application between `ThemeProvider` and dashboard layout; keep one source of truth.
- Replace `Inter`-first defaults with the project-approved typography stack used in `DESIGN.md`.
- Normalize focus-ring, page background, card background, and dot/noise variables so all screens inherit the same palette.

- [ ] **Step 1: Write the failing test/check**

Run:
`npm.cmd run lint`

Expected:
`tsc --noEmit` passes after the theme variables are wired consistently and the codebase has no broken imports or invalid Tailwind tokens.

- [ ] **Step 2: Implement the minimal theme changes**

Update the theme variables so semantic feedback is expressed through CSS vars, not hardcoded `emerald/red` utility classes in page components.

```css
:root {
  --success-bg: rgba(22, 163, 74, 0.08);
  --success-border: rgba(22, 163, 74, 0.25);
  --success-text: #16a34a;

  --danger-bg: rgba(220, 38, 38, 0.08);
  --danger-border: rgba(220, 38, 38, 0.25);
  --danger-text: #dc2626;
}

.dark {
  --success-bg: rgba(34, 197, 94, 0.15);
  --success-border: rgba(34, 197, 94, 0.4);
  --success-text: #4ade80;

  --danger-bg: rgba(239, 68, 68, 0.15);
  --danger-border: rgba(239, 68, 68, 0.4);
  --danger-text: #f87171;
}
```

- [ ] **Step 3: Verify theme wiring**

Run:
`npm.cmd run lint`

Expected:
No duplicate theme writes remain, and the build still typechecks.

- [ ] **Step 4: Commit**

Run:
`git add src/app/globals.css src/lib/theme.ts src/providers/theme-provider.tsx src/app/layout.tsx tailwind.config.ts`

Run:
`git commit -m "feat: consolidate crimson academy theme tokens"`

---

### Task 2: Shared shell and navigation

**Files:**
- Modify: `src/app/(dashboard)/layout.tsx`
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/components/layout/Footer.tsx`
- Modify: `src/components/layout/MainLayoutWrapper.tsx`

**Scope:**
- Make mobile navigation parity match desktop routes, including `review`, `leaderboard`, and `generate`.
- Replace tiny bottom-bar labels with readable mobile text and keep touch targets at least 44px.
- Remove duplicated shell patterns where the header and sidebar compete visually.
- Keep `MainLayoutWrapper` responsible only for route transitions and reveal animation.

- [ ] **Step 1: Draft route map and mobile navigation contract**

Use the same route list across desktop and mobile shell elements:

```ts
const navItems = [
  { path: '/', label: 'Trang Chủ' },
  { path: '/quiz', label: 'Luyện Đề' },
  { path: '/quick-quiz', label: 'Quiz Nhanh' },
  { path: '/review', label: 'Sổ Câu Sai' },
  { path: '/snake', label: 'Săn Từ Vựng' },
  { path: '/leaderboard', label: 'Bảng Xếp Hạng' },
  { path: '/generate', label: 'Bóc Tách Đề' },
];
```

- [ ] **Step 2: Implement shell updates**

Move the shared route list into one source and reuse it for sidebar, header, and mobile bar. Keep account controls in the mobile sheet, but make sure the user can reach every page from the bottom bar.

- [ ] **Step 3: Verify responsive shell behavior**

Run:
`npm.cmd run lint`

Expected:
No layout regressions from route changes; desktop and mobile shell still typecheck.

- [ ] **Step 4: Commit**

Run:
`git add src/app/(dashboard)/layout.tsx src/components/layout/Sidebar.tsx src/components/layout/Header.tsx src/components/layout/Footer.tsx src/components/layout/MainLayoutWrapper.tsx`

Run:
`git commit -m "feat: unify dashboard shell navigation"`

---

### Task 3: Exam and quiz workflows

**Files:**
- Modify: `src/components/ExamQuiz.tsx`
- Modify: `src/components/exam/ExamSettings.tsx`
- Modify: `src/components/exam/QuestionGrid.tsx`
- Modify: `src/components/exam/ResultSummary.tsx`
- Modify: `src/components/QuickQuiz.tsx`
- Modify: `src/components/ReviewNotebook.tsx`

**Scope:**
- Replace hardcoded success/danger surfaces with the new semantic feedback tokens.
- Increase mobile toggle touch targets to `w-11 h-6` with `w-4 h-4` knobs.
- Add or tighten ARIA roles for question selection and answer choice states.
- Keep question images/SVGs constrained so they never overflow their card on 375px screens.

- [ ] **Step 1: Update answer-state styling contract**

Use semantic variables instead of `emerald/red` utilities for correctness feedback:

```tsx
const successClass = "bg-[var(--success-bg)] border-[var(--success-border)] text-[var(--success-text)]";
const dangerClass = "bg-[var(--danger-bg)] border-[var(--danger-border)] text-[var(--danger-text)]";
```

- [ ] **Step 2: Implement ExamQuiz accessibility and toggle polish**

Add `role="radiogroup"` to the answer list container, `role="radio"` and `aria-checked` to each answer option, and enlarge toggles to `w-11 h-6` with a `w-4 h-4` thumb. Keep the 3-column desktop workspace intact.

- [ ] **Step 3: Apply the same feedback tokens to QuickQuiz and ReviewNotebook**

Use the same success/danger tokens for answer states and result panels so all quiz surfaces feel consistent.

- [ ] **Step 4: Verify workflow screens**

Run:
`npm.cmd run lint`

Expected:
No TS errors from the new ARIA and styling changes.

- [ ] **Step 5: Commit**

Run:
`git add src/components/ExamQuiz.tsx src/components/exam/ExamSettings.tsx src/components/exam/QuestionGrid.tsx src/components/exam/ResultSummary.tsx src/components/QuickQuiz.tsx src/components/ReviewNotebook.tsx`

Run:
`git commit -m "feat: polish exam and quiz workflows"`

---

### Task 4: Auth and account surfaces

**Files:**
- Modify: `src/app/login/page.tsx`
- Modify: `src/components/LoginScreen.tsx`
- Modify: `src/components/AccountSettings.tsx`

**Scope:**
- Replace decorative blob-heavy login styling with a calmer product surface.
- Add `id` + `htmlFor` pairs to inputs and tighten focus states.
- Keep the login/forgot-password flow intact while improving readability and error handling.
- Bring account settings onto the same form system used elsewhere.

- [ ] **Step 1: Add explicit form control wiring**

Example pattern:

```tsx
<label htmlFor="login-email">Email</label>
<input id="login-email" type="email" />
```

- [ ] **Step 2: Implement auth surface cleanup**

Remove manual inline border mutation on focus and switch to shared classes or variables for focus styling. Keep error messages direct and inline.

- [ ] **Step 3: Verify auth pages**

Run:
`npm.cmd run lint`

Expected:
No broken labels or hydration-sensitive rendering introduced.

- [ ] **Step 4: Commit**

Run:
`git add src/app/login/page.tsx src/components/LoginScreen.tsx src/components/AccountSettings.tsx`

Run:
`git commit -m "feat: refine auth and account forms"`

---

### Task 5: Content generation, leaderboard, admin, and snake polish

**Files:**
- Modify: `src/components/UploadAutoGenerate.tsx`
- Modify: `src/components/Leaderboard.tsx`
- Modify: `src/components/AdminStatsDashboard.tsx`
- Modify: `src/components/VocabularySnake.tsx`

**Scope:**
- Replace residual hardcoded green/red feedback and bright light-mode blocks.
- Turn leaderboard/admin surfaces into calmer scan-friendly panels.
- Keep snake gameplay intact while fixing night-mode contrast, labeled controls, and card density.
- Keep any new skeleton or loading treatment aligned with the project palette.

- [ ] **Step 1: Replace hardcoded feedback colors**

Swap `bg-green-50`, `bg-red-50`, and similar utilities with semantic variables from Task 1.

- [ ] **Step 2: Implement leaderboard/admin refinement**

Use shared card primitives and a mobile-safe layout that does not force horizontal scrolling for core metrics or actions.

- [ ] **Step 3: Fix snake surface contrast**

Dark theme should not use the bright tan board background for the main play surface; derive the board from theme tokens instead.

- [ ] **Step 4: Verify content-heavy screens**

Run:
`npm.cmd run lint`

Expected:
Page-level surfaces typecheck and remain responsive after token replacement.

- [ ] **Step 5: Commit**

Run:
`git add src/components/UploadAutoGenerate.tsx src/components/Leaderboard.tsx src/components/AdminStatsDashboard.tsx src/components/VocabularySnake.tsx`

Run:
`git commit -m "feat: polish content heavy surfaces"`

---

### Task 6: Final QA and handoff

**Files:**
- Modify: `H5S/docs/TEST_MATRIX.md`
- Modify: `H5S/progress.md`
- Modify: `H5S/docs/session-handoff.md`
- Modify: `H5S/docs/AGENT_LOG.md`

**Scope:**
- Record the UI redesign verification evidence.
- Note any browser QA limitations or follow-up bugs.
- Ensure handoff is explicit enough for the next session to continue without rereading the whole audit.

- [ ] **Step 1: Re-run verification**

Run:
`npm.cmd run lint`

Run:
`npm.cmd run test`

Expected:
Baseline passes before closing the redesign batch.

- [ ] **Step 2: Update harness evidence**

Record the commands and results in `H5S/docs/TEST_MATRIX.md` and `H5S/progress.md`.

- [ ] **Step 3: Update handoff**

Record the shipped files, any UI QA gaps, and the next recommended work slice in `H5S/docs/session-handoff.md` and `H5S/docs/AGENT_LOG.md`.

- [ ] **Step 4: Commit**

Run:
`git add H5S/docs/TEST_MATRIX.md H5S/progress.md H5S/docs/session-handoff.md H5S/docs/AGENT_LOG.md`

Run:
`git commit -m "docs: record crimson academy ui redesign handoff"`

