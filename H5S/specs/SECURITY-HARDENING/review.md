# SECURITY-HARDENING Review

## Status

planning-only

## Findings

| Severity | File | Finding | Recommendation |
| :--- | :--- | :--- | :--- |
| Critical | `src/app/api/auth/forgot-password/route.ts:7` | Password reset accepts `email` and `newPassword`; no token or proof of inbox ownership was found. | Replace with token-based reset or disable direct reset before production use. |
| Critical | `src/store/useExamStore.ts:155` | Auth helper falls back to a locally created logged-in user when server auth fails. | Remove silent login fallback or isolate it behind an explicit demo mode. |
| Critical | `src/app/(dashboard)/admin/page.tsx:10` | Admin screen is gated by client-persisted `currentUser.role`. | Treat UI gate as cosmetic and enforce admin role on server APIs. |
| Critical | `src/app/api/users/route.ts:14` | User list endpoint returns users without auth or admin guard. | Require authenticated admin before returning user data. |
| Important | `src/app/api/exam/submit/route.ts:26`, `src/app/api/game/score/route.ts:21` | Score/result routes trust `userId` from body. | Derive user identity from server session. |
| Important | `src/app/api/exam/delete/route.ts:10` | Delete route accepts only `examId`; no owner/admin check was found. | Require admin/staff or exam owner before delete transaction. |
| Important | `src/app/api/auth/signup/route.ts:12` | Password minimum is 4 characters. | Raise policy and validate with shared schema. |
| Important | `server.ts` | Legacy backend duplicates auth/generate routes, is not covered by current `npm.cmd run lint`, and audit found a syntax issue. | Remove/quarantine or bring under scripts and tests. |

## Checks

- [x] Scope matches `spec.md`.
- [x] Files changed stay inside H5S planning artifacts so far.
- [x] No unrelated source-code refactor.
- [x] Security/data/auth risks reviewed.
- [x] Baseline verification evidence exists.

## Ship Decision

Fix first. Planning is ready, but current security posture should not be considered production-ready until this track is implemented and reviewed with deep-review.
