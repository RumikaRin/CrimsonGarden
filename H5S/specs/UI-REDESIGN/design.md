# UI-REDESIGN Design

## Design Read

Reading this as: redesign of a learning product dashboard for students and teachers, with a focused premium educational product language, leaning toward existing Tailwind + CSS variable tokens + Motion rather than importing a new design system.

Target dials:
- `DESIGN_VARIANCE`: 5 for app surfaces, 6 for home/dashboard hero moments.
- `MOTION_INTENSITY`: 4 for app-wide transitions, 5 for onboarding/home only.
- `VISUAL_DENSITY`: 6 for quiz/admin/leaderboard, 4 for login/home/generate.

## Audit Summary

- Current brand tokens are split between `src/lib/theme.ts`, `src/app/globals.css` and inline styles.
- Current palette uses crimson, forest, chalk/off-white and dark mode. This should be preserved but desaturated and made more systematic.
- Current typography uses Google `@import` with `Inter`, `Playfair Display`, `Space Grotesk`, `JetBrains Mono`. Redesign should move toward `next/font` or a self-hosted strategy when code begins.
- Current UI overuses `rounded-2xl`, nested cards, serif headings and uppercase tracking labels.
- Current IA is valid and should be preserved.
- Existing icon family is `lucide-react`; keep it for now to avoid churn.
- Large screens are feature-rich but several components are too large to maintain safely.

## Approach

Choose a staged app redesign, not a ground-up rewrite:

1. Antigravity produces a UI/UX brief and page inventory without code changes.
2. Codex Leader reviews and approves the design direction.
3. Antigravity implements a foundation slice: tokens, primitives, app shell.
4. Antigravity implements page groups in small batches.
5. Codex reviews diffs after each batch and blocks any auth/API/parser changes.

This approach keeps the UI work in the lowest-risk agent role while Codex retains risk decisions. It also avoids changing backend contracts while the security and extraction tracks are planned separately.

## Files And Ownership

| File | Owner | Change |
| :--- | :--- | :--- |
| `H5S/docs/TEAM_MAILBOX.md` | Codex Leader | Task brief and handoff to Antigravity. |
| `src/app/globals.css` | Antigravity Coder | Normalize global tokens, typography, focus, motion and utility classes after approval. |
| `src/lib/theme.ts` | Antigravity Coder | Consolidate semantic theme tokens and remove one-off color drift. |
| `src/app/layout.tsx` | Antigravity Coder | Move font loading to the approved Next.js pattern if required. |
| `src/app/(dashboard)/layout.tsx` | Antigravity Coder | Simplify dashboard shell, mobile navigation and account sheet. |
| `src/components/layout/Sidebar.tsx` | Antigravity Coder | Redesign desktop navigation and account controls. |
| `src/components/layout/Header.tsx` | Antigravity Coder | Either retire duplicated header or align with shell decision. |
| `src/components/layout/Footer.tsx` | Antigravity Coder | Align footer with new shell. |
| `src/components/ui/*.tsx` | Antigravity Coder | Normalize primitives, card/button radii and interaction states. |
| `src/app/(dashboard)/**/page.tsx` | Antigravity Coder | Keep route files thin and preserve existing route labels. |
| `src/components/AccountSettings.tsx` | Antigravity Coder | Redesign settings form states. |
| `src/components/AdminStatsDashboard.tsx` | Antigravity Coder | Redesign admin dashboard with dense, scannable layout. |
| `src/components/ExamQuiz.tsx` | Antigravity Coder | Redesign exam taking and result states without changing scoring. |
| `src/components/Leaderboard.tsx` | Antigravity Coder | Redesign ranking, tabs and empty/error states. |
| `src/components/LoginScreen.tsx`, `src/app/login/page.tsx` | Antigravity Coder | Redesign auth UI only, not auth logic. |
| `src/components/QuickQuiz.tsx` | Antigravity Coder | Redesign quick quiz setup and active state. |
| `src/components/ReviewNotebook.tsx` | Antigravity Coder | Redesign review and empty states. |
| `src/components/UploadAutoGenerate.tsx` | Antigravity Coder | Redesign upload UI only; parser behavior belongs to `DOC-EXTRACTION`. |
| `src/components/VocabularySnake.tsx`, `src/components/snake/*` | Antigravity Coder | Redesign game shell only; engine logic belongs to tests. |

## Data Flow

UI remains client-state driven through `useExamStore`. The redesign must not change data ownership:

1. Routes render existing pages.
2. Pages read `useExamStore` and API responses as today.
3. Components render improved UI states.
4. Existing API calls and local/offline sync behavior stay unchanged until `SECURITY-HARDENING` and `DOC-EXTRACTION` explicitly modify them.

## Alternatives Considered

| Option | Decision | Reason |
| :--- | :--- | :--- |
| Import a full external design system such as Radix Themes or Carbon | rejected | The app already has custom primitives, Tailwind, Motion and theme tokens. A large package migration would add risk before security hardening. |
| Targeted polish only | rejected | User requested full redesign, and current visual debt is structural across shell, pages and primitives. |
| Full rewrite of all UI components | rejected | Too risky for exam/game behavior. Keep behavior and refactor in controlled batches. |
| Staged internal design system | chosen | Best fit for preserving IA while improving visual consistency and reviewability. |

## Guardrails

- Files allowed for Antigravity implementation:
  - `src/app/globals.css`
  - `src/app/layout.tsx`
  - `src/app/(dashboard)/**`
  - `src/components/**`
  - `src/lib/theme.ts`
  - `src/lib/useThemeTokens.ts`
  - `src/lib/utils.ts`
  - frontend-only tests if needed
- Do not touch:
  - `src/app/api/**`
  - `src/pages/api/**`
  - `prisma/**`
  - `server.ts`
  - `.env`, `.env.example`
  - `src/lib/pdf_parser.py`, `src/lib/docx_parser.py`
  - scoring, answer correctness, auth/session, DB persistence
- Before editing Next.js code:
  - Check `node_modules/next/dist/docs/`. Current audit found this path absent in the installed package.
  - If absent, note the gap and use installed Next `15.5.19` package behavior plus approved official docs before coding.
- Verification:
  - `npm.cmd run lint`
  - `npm.cmd run test`
  - `npm.cmd run build`
  - Browser QA after dev server starts: `/`, `/login`, `/quiz`, `/quick-quiz`, `/review`, `/snake`, `/leaderboard`, `/generate`, `/settings`, `/admin` at 375px, 768px, 1440px.
