# SECURITY-HARDENING Tasks

## Preflight

- [x] Chọn mode: Full.
- [x] Cập nhật `H5S/progress.md` current task.
- [x] Chạy `python H5S/scripts/h5s_guard.py preflight --mode full --feature SECURITY-HARDENING --require-active-writer`.
- [ ] Trước khi code, Codex phải tuyên bố chuyển từ Leader sang Coder cho phase security.
- [ ] Trước khi sửa Next.js code, kiểm tra `node_modules/next/dist/docs/` hoặc ghi rõ path này không tồn tại trong package hiện tại.
- [ ] Nếu cần Prisma migration cho reset token, hỏi user trước khi sửa schema.

## Task 1: Threat Model And Policy Matrix

Owner: Codex Leader / Reviewer  
Files allowed:
- `H5S/specs/SECURITY-HARDENING/design.md`
- `H5S/specs/SECURITY-HARDENING/review.md`

Checklist:
- [ ] Define public, authenticated, owner, staff and admin policies.
- [ ] Map each API route to required policy.
- [ ] Decide whether demo/offline auth remains and how it is clearly isolated.
- [ ] Decide fate of `server.ts`: remove, archive or bring under scripts.

Verify:
- No source code changed.
- `review.md` has route policy findings.

## Task 2: Server Auth Foundation

Owner: Codex Coder after role switch  
Files allowed:
- `src/lib/server/auth.ts`
- `src/lib/server/security.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/app/api/auth/me/route.ts`

Checklist:
- [ ] Implement signed HTTP-only session cookie.
- [ ] Verify cookie expiry and signature server-side.
- [ ] Load user from Prisma on protected requests.
- [ ] Add logout and me endpoints.
- [ ] Use generic login failure messaging unless user approves account-enumeration behavior.

Verify:
- Targeted auth helper tests.
- `npm.cmd run lint`
- `npm.cmd run test`

## Task 3: Auth Flow Hardening

Owner: Codex Coder  
Files allowed:
- `src/app/api/auth/signup/route.ts`
- `src/app/api/auth/forgot-password/route.ts`
- `src/app/api/auth/profile/route.ts`
- `src/store/useExamStore.ts`
- optional `prisma/schema.prisma` after approval

Checklist:
- [ ] Raise password minimum and validate email/name/password with schema.
- [ ] Remove fallback that logs a user in locally when auth fails.
- [ ] Change profile update to require authenticated user.
- [ ] Replace direct forgot-password reset with approved token flow or production-safe disabled behavior.
- [ ] Keep UI-facing error messages actionable but not secret-revealing.

Verify:
- Tests for login failure not creating `currentUser`.
- Tests for forgot-password refusing direct reset without valid token.
- `npm.cmd run lint`
- `npm.cmd run test`

## Task 4: API Authorization And Validation

Owner: Codex Coder  
Files allowed:
- `src/lib/server/schemas.ts`
- `src/app/api/users/route.ts`
- `src/app/api/exam/create/route.ts`
- `src/app/api/exam/delete/route.ts`
- `src/app/api/exam/submit/route.ts`
- `src/app/api/exam/result/route.ts`
- `src/app/api/game/score/route.ts`
- `src/app/api/leaderboard/route.ts`
- `src/app/api/leaderboard/stats/route.ts`

Checklist:
- [ ] `/api/users` requires admin.
- [ ] Exam create/delete requires authenticated admin/staff or owner policy.
- [ ] Exam submit/result uses authenticated user identity, not body `userId`.
- [ ] Game score uses authenticated user identity and validates numeric ranges.
- [ ] Leaderboard returns only intended public data.
- [ ] All modified routes validate body shape with a shared schema.

Verify:
- Route tests for 401, 403, 400 and happy path per protected endpoint.
- `npm.cmd run lint`
- `npm.cmd run test`
- `npm.cmd run build`

## Task 5: Legacy Backend Decision

Owner: Codex Coder with Leader approval  
Files allowed:
- `server.ts`
- `package.json` only if scripts change
- docs mentioning server startup if any

Checklist:
- [ ] Confirm whether `server.ts` is used by any script or deployment.
- [ ] If unused, remove or move to an archive path after user approval.
- [ ] If retained, fix syntax, add missing dependencies to `package.json`, include it in typecheck and document its role.
- [ ] Ensure duplicate auth/generate routes cannot drift from Next routes.

Verify:
- `npm.cmd run lint`
- `npm.cmd run build`
- Search confirms no stale startup instructions point to removed server.

## Task 6: Security Review And Abuse Checks

Owner: Codex Reviewer / Tester  
Files allowed:
- `H5S/specs/SECURITY-HARDENING/review.md`
- `H5S/specs/SECURITY-HARDENING/test-evidence.md`
- `H5S/docs/TEST_MATRIX.md`

Checklist:
- [ ] Attempt localStorage role escalation and verify protected API still returns 401/403.
- [ ] Attempt direct password reset with only email and verify rejection.
- [ ] Attempt forged `userId` in score/result/exam payload and verify server ignores or rejects it.
- [ ] Confirm no secrets or raw tokens appear in logs.
- [ ] Record all command output and manual abuse-test evidence.

Verify:
- `npm.cmd run lint`
- `npm.cmd run test`
- `npm.cmd run build`
- H5S verify after TEST_MATRIX is no longer pending.

## Closeout

- [ ] Release `ACTIVE WRITER`.
- [ ] Reviewer updates `review.md`.
- [ ] Tester updates `test-evidence.md` and `H5S/docs/TEST_MATRIX.md`.
- [ ] Leader updates `session-handoff.md` if implementation remains incomplete.
