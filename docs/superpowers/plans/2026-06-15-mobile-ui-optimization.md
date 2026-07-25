# Mobile UI Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the primary student experience at 375px without changing desktop behavior or application logic.

**Architecture:** Apply targeted responsive Tailwind changes to the existing dashboard shell and primary student components. Keep mobile-specific exam controls inside `ExamQuiz` and preserve the existing desktop column layout behind `xl:` breakpoints.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 3, Zustand, Motion, Lucide React.

---

### Task 1: Mobile dashboard shell

**Files:**
- Modify: `src/app/(dashboard)/layout.tsx`
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/app/globals.css`

- [ ] Add safe-area-aware top and bottom navigation spacing.
- [ ] Remove the mobile header and drawer so the bottom navigation is the only mobile navigation surface.
- [ ] Ensure page content and footer are never obscured by fixed navigation.
- [ ] Run `npm run lint`.

### Task 2: Mobile home page

**Files:**
- Modify: `src/app/(dashboard)/page.tsx`
- Modify: `src/components/ui/demo.tsx`

- [ ] Reduce hero height and spacing at 375px.
- [ ] Make metrics and activity actions easier to scan and tap.
- [ ] Preserve current desktop grid behavior.
- [ ] Run `npm run lint`.

### Task 3: Mobile exam experience

**Files:**
- Modify: `src/components/ExamQuiz.tsx`
- Modify: `src/components/exam/QuestionGrid.tsx`

- [ ] Add a compact mobile timer and progress status surface.
- [ ] Prioritize the question card before secondary settings.
- [ ] Reduce the question-grid panel height on mobile.
- [ ] Make footer navigation controls fit at 375px.
- [ ] Preserve the desktop three-column layout.
- [ ] Run `npm run lint`.

### Task 4: Quick Quiz and Vocabulary Snake

**Files:**
- Modify: `src/components/QuickQuiz.tsx`
- Modify: `src/components/VocabularySnake.tsx`

- [ ] Make Quick Quiz setup, result, and next actions full-width on mobile.
- [ ] Improve answer wrapping and spacing.
- [ ] Compact Snake heading and HUD spacing.
- [ ] Prioritize canvas and touch controls on mobile.
- [ ] Run `npm run lint`.

### Task 5: Final verification

**Files:**
- Review all modified files.

- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Verify 375px, 768px, and 1440px layouts when Browser is available.
- [ ] Review the diff for unintended desktop or behavior changes.
