# UI-REDESIGN Review

## Status

Homepage runtime fixed; full redesign still in progress

## Findings

| Severity | File | Finding | Recommendation |
| :--- | :--- | :--- | :--- |
| Resolved | `src/components/ui/AppBadge.tsx`, `src/lib/useThemeTokens.ts`, `tailwind.config.ts` | `REPLY-003` fixed the missing Tailwind opacity utilities and added `src/lib` content scanning/safelist coverage. | Verified by Codex after rebuild; keep future dynamic class strings either safelisted or inside Tailwind content paths. |
| Important | `src/app/(dashboard)/layout.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx`, `src/components/layout/MainLayoutWrapper.tsx` | Slice 2 App Shell is command-verified, but visual viewport evidence is unavailable. | Run browser viewport QA at 375px, 768px and 1440px before visually approving Slice 2 or unlocking page redesign slices. |
| Resolved | `src/app/(dashboard)/layout.tsx` | Dashboard layout previously hid every route behind a client-only `hasMounted` loading gate, causing screenshots/failed JS sessions to show only `Đang tải Crimson Garden`. | Removed the gate and added `dashboard-layout.test.ts` regression coverage. |
| Resolved | `src/app/(dashboard)/page.tsx` | Homepage still used `SplineSceneBasic` remote hero, so the first screen looked like the old design and could stall on Spline/canvas loading. | Replaced it with native study dashboard hero and added `homepage-redesign.test.ts` regression coverage. |
| Important | Browser QA tooling | Codex could not complete viewport screenshot QA: Browser plugin exposed no available backend; Edge/Chrome headless screenshot attempts produced zero-byte/no screenshot files; CDP port did not become available. | Do not treat viewport QA as passed. Antigravity should include browser/screenshot evidence in the next reply or Codex should rerun once tooling is available. |
| Important | `H5S/docs/TEAM_MAILBOX.md` | Antigravity's full design brief lives outside the repository under a local Antigravity brain path. | Treat the external brief as context only; keep implementation-critical details in `H5S/` or mailbox replies. |
| Important | `src/app/globals.css` | Global theme, fonts, focus, body texture and compatibility overrides are mixed in one file. | Refactor cautiously into clearer token and utility sections during foundation slice. |
| Important | `src/lib/theme.ts` | Theme tokens exist but many components still use inline colors and one-off classes. | Make semantic tokens the source of truth before page redesign. |
| Important | `src/app/(dashboard)/layout.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/Header.tsx` | Navigation/account patterns are duplicated across shell/header/sidebar. | Codex should approve a single shell strategy before implementation. |
| Important | `src/components/ExamQuiz.tsx`, `src/components/VocabularySnake.tsx`, `src/components/UploadAutoGenerate.tsx` | Very large components increase regression risk during redesign. | Redesign in slices and avoid business-logic edits. |
| Nit | `src/components/layout/Sidebar.tsx` | Visible copy has typo `HỌ VIỆN THƯ THÁI`. | Fix only as part of approved UI copy polish. |

## REPLY-001 Review

Codex reviewed Antigravity's `REPLY-001` and the linked `ui_ux_redesign_brief.md`.

Result:
- Design direction meets `MSG-001` acceptance: design dials, current UI audit, visual direction, shell strategy, page priorities, responsive notes, system states, a11y checklist and implementation slices are present.
- Approved for `UI-REDESIGN` Slice 1 Foundation Overhaul only.
- App Shell/Header/Sidebar/page redesign remains locked until a later Codex review.
- `MSG-002` now contains a narrowed Slice 1 file list and acceptance criteria.

## REPLY-002 Review

Codex reviewed Antigravity's `REPLY-002` and the Slice 1 diff.

Fresh verification by Codex:
- `npm.cmd run lint`: pass.
- `npm.cmd run test`: pass, 3 files and 15 tests.
- `npm.cmd run build`: pass, Next.js 15.5.19 compiled successfully.
- `git diff --check` on Slice 1 files: pass, with CRLF warnings only.
- HTTP smoke for `/`, `/login`, `/quiz`, `/generate`: status 200, no direct runtime error text.

Result:
- File scope is acceptable for the reported Slice 1 files.
- `node_modules/next/dist/docs/` is still absent; fallback to installed Next.js 15.5.19 font behavior was documented in `REPLY-002`.
- Slice 1 is not approved for the App Shell Slice because production CSS evidence shows missing Tailwind utility output for new opacity classes.
- `MSG-003` is opened for a focused fix. App Shell/Header/Sidebar/page redesign remains locked.

## REPLY-003 Review

Codex reviewed Antigravity's `REPLY-003` and the Tailwind utility generation fix.

Fresh verification by Codex:
- `python H5S/scripts/h5s_guard.py preflight --mode full --feature UI-REDESIGN`: pass.
- `npm.cmd run lint`: pass.
- `npm.cmd run test`: pass, 3 files and 15 tests.
- `npm.cmd run build`: pass, Next.js 15.5.19 compiled successfully.
- `git diff --check` on `src/components/ui/AppBadge.tsx`, `src/lib/useThemeTokens.ts`, `tailwind.config.ts`: pass, with CRLF warnings only.
- CSS output check after rebuild: pass; `.next/static/css/*.css` contains the fixed background/border opacity selectors.

Result:
- `MSG-003` is approved and closed.
- Slice 1 Foundation Overhaul is accepted for moving to the next slice.
- `MSG-004` is opened for App Shell Slice only. Page redesign remains locked.

## REPLY-004 Review

Codex continued `MSG-004` as Coder fallback because Antigravity was not callable in this session.

Fresh verification by Codex:
- `python H5S/scripts/h5s_guard.py preflight --mode full --feature UI-REDESIGN --require-active-writer`: pass.
- `npm.cmd run test -- src/components/layout/navigation.test.ts`: pass, 1 file and 1 test.
- `npm.cmd run lint`: pass.
- `npm.cmd run test`: pass, 4 files and 16 tests.
- `npm.cmd run build`: pass, Next.js 15.5.19 compiled successfully.
- HTTP smoke via temporary `next start -p 3019`: `/`, `/login`, `/quiz`, `/generate` returned status 200 with no direct runtime error text.

Result:
- Slice 2 App Shell is command-verified.
- Browser viewport QA remains blocked because browser runtime selection failed for `iab` and `agent.browsers.list()` returned `[]` after troubleshooting.
- Do not unlock page redesign slices until viewport QA evidence is captured or Codex explicitly accepts the residual visual risk.

## Checks

- [x] Scope matches `spec.md`.
- [x] Files changed stay inside H5S planning artifacts so far.
- [x] No unrelated source-code refactor.
- [x] Security/data/auth/payment risks are explicitly out of scope for this track.
- [x] Baseline verification evidence exists in `test-evidence.md`.
- [x] `REPLY-001` reviewed before frontend implementation starts.
- [x] `REPLY-002` reviewed before unlocking Slice 2.
- [x] Slice 1 CSS utility generation fix verified.
- [x] Slice 2 command verification exists.
- [x] Homepage loading gate and Spline hero regressions fixed.
- [ ] Browser viewport screenshot QA verified.

## Ship Decision

Not ready to ship. Homepage now has a visible redesign and no longer depends on Spline, but browser viewport QA is still blocked and the full UI redesign is still in progress.

Approved next action: continue page-level redesign for `/login`, `/quiz`, and `/generate`, then run browser viewport QA when tooling is available.
