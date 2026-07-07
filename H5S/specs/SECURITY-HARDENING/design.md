# SECURITY-HARDENING Design

## Approach

Use server-authenticated identity as the new trust boundary.

Recommended design:
1. Add a server-only auth module that verifies an HTTP-only signed session cookie.
2. Store only a signed user identifier and expiry in the cookie.
3. For each protected API request, verify cookie signature, load the user from Prisma and enforce role/ownership.
4. Move client `currentUser` to a UI cache only. It can display identity but cannot authorize writes.
5. Harden password reset with a token flow. If DB schema work is approved, add a reset-token table with hashed tokens and expiry; otherwise disable reset until a token flow exists.
6. Remove or quarantine `server.ts` because current build scripts use Next routes and `server.ts` is stale.

This keeps changes compatible with the existing Prisma `User` model while avoiding a full auth provider migration in the first hardening pass.

## Files And Ownership

| File | Owner | Change |
| :--- | :--- | :--- |
| `src/lib/server/auth.ts` | Codex Coder | New server-only session verification, cookie helpers, `requireUser`, `requireRole`. |
| `src/lib/server/security.ts` | Codex Coder | Shared response helpers, rate limit or request guard utilities. |
| `src/lib/server/schemas.ts` | Codex Coder | Zod schemas for auth, profile, exam, result and score routes. |
| `src/app/api/auth/login/route.ts` | Codex Coder | Set signed HTTP-only session cookie after bcrypt password match. |
| `src/app/api/auth/signup/route.ts` | Codex Coder | Stronger validation, no predictable custom user ID, set session after signup if approved. |
| `src/app/api/auth/logout/route.ts` | Codex Coder | New route to clear session cookie. |
| `src/app/api/auth/me/route.ts` | Codex Coder | New route returning server-derived user profile. |
| `src/app/api/auth/forgot-password/route.ts` | Codex Coder | Replace direct reset with token-based flow or disable unsafe reset. |
| `src/app/api/auth/profile/route.ts` | Codex Coder | Require authenticated user and update only own profile unless admin. |
| `src/app/api/users/route.ts` | Codex Coder | Restrict to admin role. |
| `src/app/api/exam/create/route.ts` | Codex Coder | Use authenticated creator or explicit admin/staff policy. |
| `src/app/api/exam/delete/route.ts` | Codex Coder | Require admin/staff or exam owner. |
| `src/app/api/exam/submit/route.ts` | Codex Coder | Use authenticated user, validate score/duration/answers. |
| `src/app/api/exam/result/route.ts` | Codex Coder | Use authenticated user, validate result payload. |
| `src/app/api/game/score/route.ts` | Codex Coder | Use authenticated user, validate score and category. |
| `src/app/api/leaderboard/**` | Codex Coder | Confirm only intended public data is returned. |
| `src/store/useExamStore.ts` | Codex Coder | Remove auth fallback that silently creates local logged-in users after failed server auth. |
| `src/app/(dashboard)/admin/page.tsx` | Codex Coder | Treat UI gate as display only; data APIs enforce admin role. |
| `server.ts` | Codex Coder | Remove, archive or bring under checks after explicit decision. |
| `prisma/schema.prisma` | Codex Coder | Optional reset-token model only after user approval. |
| `tests/security/*.test.ts` | Codex Coder | Unit tests for auth helpers and authorization policy. |

## Data Flow

### Login

1. Client posts email/password to `/api/auth/login`.
2. Server validates shape and rate limit.
3. Server checks bcrypt hash.
4. Server sets `HttpOnly`, `SameSite=Lax`, `Secure` in production signed session cookie.
5. Client calls `/api/auth/me` or uses returned user for UI cache.

### Protected API

1. Route calls `requireUser(req)` or equivalent helper.
2. Helper verifies signed cookie and expiry.
3. Helper loads the user from Prisma and returns `{ id, email, role }`.
4. Route validates request body with schema.
5. Route enforces owner/admin/staff policy before database writes.

### Password Reset

Preferred token flow after DB approval:
1. User requests reset by email.
2. Server creates random token, stores hash + expiry + single-use marker.
3. Email delivery or dev-visible handoff is handled through an approved channel.
4. Reset route accepts token + new password, verifies hash and expiry, updates password, invalidates token.

If email delivery is not available, direct password reset must be disabled in production.

## Alternatives Considered

| Option | Decision | Reason |
| :--- | :--- | :--- |
| Keep current client-trusted `currentUser` and only hide UI | rejected | LocalStorage can be modified and cannot protect API writes. |
| Add a full auth provider immediately | deferred | Safer long-term, but larger migration. Current ask can be served by a server-owned session boundary first. |
| DB-backed sessions from day one | deferred | Good for revocation, but requires schema migration. Use signed cookie plus DB user lookup first unless revocation becomes mandatory. |
| Signed cookie with DB user lookup | chosen | No initial schema migration, moves trust boundary to server, keeps role changes reflected by DB lookup. |
| Leave `server.ts` alone | rejected | It duplicates sensitive routes, is not checked by current scripts and can mislead future agents. |

## Guardrails

- Files allowed:
  - `src/lib/server/**`
  - listed `src/app/api/**` auth/data routes
  - `src/store/useExamStore.ts`
  - minimal UI auth-state surfaces if needed
  - security tests
  - `server.ts` only for removal/quarantine after approval
  - `prisma/schema.prisma` only after explicit DB migration approval
- Do not touch:
  - UI redesign files unless needed for auth state
  - parser quality code in `src/lib/pdf_parser.py`, `src/lib/docx_parser.py`
  - unrelated game/exam UI refactors
  - `.env` secrets
- Before editing Next.js code:
  - Check `node_modules/next/dist/docs/`. Current audit found this path absent.
  - If absent, document fallback source before coding.
- Security rules:
  - Do not log passwords, tokens or raw secrets.
  - Do not return different login errors that enable email enumeration unless product explicitly accepts it.
  - Do not introduce destructive Prisma migration without approval.
  - Do not accept `role`, `userId`, `createdAt`, ownership fields from client as trusted facts.
- Verification:
  - `npm.cmd run lint`
  - `npm.cmd run test`
  - `npm.cmd run build`
  - targeted route tests for 401/403/400/happy path
  - manual check that localStorage role editing cannot access admin data
