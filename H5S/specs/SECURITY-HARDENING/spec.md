# SECURITY-HARDENING Spec

## Goal

Review và harden logic bảo mật của Crimsonacademy để dữ liệu người dùng, quyền admin, kết quả làm bài và endpoint sinh đề không còn phụ thuộc vào state client hoặc `userId` do client tự gửi.

Codex giữ vai trò Head/Leader trong planning. Khi bắt đầu sửa auth/security/backend, Codex phải tuyên bố chuyển sang Coder và dùng tier `deep-review`.

## Context

- Project/module liên quan:
  - Auth routes: `src/app/api/auth/login/route.ts`, `signup/route.ts`, `forgot-password/route.ts`, `profile/route.ts`.
  - Data routes: `src/app/api/exam/**`, `src/app/api/game/score/route.ts`, `src/app/api/leaderboard/**`, `src/app/api/users/route.ts`.
  - Client auth state: `src/store/useExamStore.ts`.
  - Admin UI gate: `src/app/(dashboard)/admin/page.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/Header.tsx`.
  - Legacy backend: `server.ts`.
- Current behavior:
  - No server session/cookie middleware was found.
  - `useExamStore.ts` persists `currentUser` in localStorage and creates a fallback user when auth requests fail.
  - `/admin` checks `currentUser?.role === 'ADMIN'` client-side.
  - Several API routes accept `userId`, `examId`, score or profile fields from request body without server-authenticated ownership.
  - `forgot-password` allows email verification and password reset using only email plus `newPassword`.
  - Password minimum length is 4.
  - `/api/users` returns all users without an auth check.
  - `server.ts` duplicates auth/generate logic outside current Next build scripts and is not covered by `tsc --noEmit`; audit found a syntax issue in its signup handler.
- Desired behavior:
  - Server-verified authenticated identity for protected operations.
  - Role enforcement happens in API/server code, not only UI.
  - Password reset uses a time-limited token flow or is disabled until a token flow exists.
  - API input is schema-validated, bounded and consistently returns 400/401/403/404/429/500 where appropriate.
  - Legacy backend code is either removed, archived or made non-production with explicit ownership.

## Scope

In scope:
- Threat model and security review for auth, RBAC, user profile, exam ownership, score submission, admin/user listing and file generation entrypoints.
- Introduce server-side auth helpers and protected route guards.
- Replace client-trusted `currentUser` role with server-derived profile.
- Harden login/signup/password reset/profile flows.
- Add input schemas for sensitive API routes.
- Add route-level permission checks for admin-only and owner-only operations.
- Add rate limiting or abuse controls appropriate for Next API routes.
- Decide whether `server.ts` is legacy dead code and remove/quarantine after user approval.
- Write tests for security helper behavior and route-level authorization decisions.

Out of scope:
- Payment, billing or third-party SSO.
- Production secret rotation unless the user provides approval and credentials workflow.
- Destructive DB changes.
- UI redesign except minimal auth-state UI changes required by server auth.
- Parser quality improvements beyond upload security gates, which belong to `DOC-EXTRACTION`.

## Acceptance Criteria

- [ ] Editing localStorage cannot grant admin access to protected API data.
- [ ] Unauthenticated requests to protected APIs return 401.
- [ ] Authenticated non-admin requests to admin/user-list operations return 403.
- [ ] Profile update, exam create/delete, exam submit/result and game score save use server-authenticated user identity or a documented public/demo mode.
- [ ] Password reset no longer allows changing a password with only email knowledge.
- [ ] Password policy is stronger than current 4-character minimum and produces clear validation errors.
- [ ] API routes validate body shape, numeric ranges and IDs before database writes.
- [ ] `server.ts` is removed from production path or explicitly covered by lint/build/tests if retained.
- [ ] Verification command được ghi trong `test-evidence.md`.

## Risk

- Size: L
- Risk: high
- Sensitive areas: auth, RBAC, user data, API endpoints, database writes, security
- User approval required: yes, before auth/session implementation and before any Prisma migration
- Model decision:
  - mode: Full
  - task_class: security/backend review and coding
  - risk: high
  - tier: deep-review
  - note: CLI hiện tại không đổi model trong phiên này; implementation phase should restart or switch to the strongest available review tier if possible.
