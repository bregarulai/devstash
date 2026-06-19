# Audit June 2026 — Phase 1: Security

## Overview

Fix 4 security-critical issues identified in the codebase audit. These must be implemented first and shipped together.

| # | Severity | Issue | File |
|---|----------|-------|------|
| 2 | High | Missing rate limiting on change-password API route | `app/api/profile/change-password/route.ts` |
| 3 | High | Missing CSRF protection on change-password API route | `app/api/profile/change-password/route.ts` |
| 4 | High | Missing try-catch on change-password API route | `app/api/profile/change-password/route.ts:44-48` |
| 5 | High | Email enumeration on registration | `actions/auth/Auth.ts:47` |

> **IMPORTANT**: When implementing these fixes, you MUST NOT break any existing functionality or user flow. Always double-check your work by verifying that affected features still work as expected after each change.

---

## 1. Missing Rate Limiting on change-password API Route

**File:** `app/api/profile/change-password/route.ts`

The server action `handleChangePassword` in `actions/auth/Auth.ts:138-144` has rate limiting via `RATE_LIMIT_CONFIGS.changePassword`. This API route has none, allowing unlimited password-guess attempts.

**Fix:** Add the same rate limiting pattern used in `handleChangePassword`:
- Import `createRateLimiter`, `checkRateLimit`, `RATE_LIMIT_CONFIGS` from `@/lib/auth/rateLimit/rateLimit`
- Import `headers` from `next/headers`
- Add rate limit check before password validation using `RATE_LIMIT_CONFIGS.changePassword` with key `changepwd:${ip}:${session.user.id}`
- Return 429 with retry-after message on failure

---

## 2. Missing CSRF Protection on change-password API Route

**File:** `app/api/profile/change-password/route.ts`

The delete-account route validates CSRF tokens, but this route does not. An attacker could craft a form targeting this endpoint.

**Fix:** Add CSRF token validation matching the pattern in `app/api/profile/delete-account/route.ts`. Compare the `x-csrf-token` header against the token in the `__Host-next-auth.csrf-token` cookie.

---

## 3. Missing try-catch on change-password API Route

**File:** `app/api/profile/change-password/route.ts:44-48`

`bcrypt.hash()` and `prisma.user.update()` are not wrapped in try-catch. If the DB update fails (constraint violation, connection issue), the user receives a raw 500 error.

```ts
// Current (unprotected):
const hashedPassword = await bcrypt.hash(newPassword, 12);
await prisma.user.update({
  where: { id: session.user.id },
  data: { password: hashedPassword },
});

// Fixed:
try {
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword },
  });
} catch {
  return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
}
```

---

## 4. Email Enumeration on Registration

**File:** `actions/auth/Auth.ts:47`

Returns `"User with this email already exists"`, allowing attackers to enumerate valid email addresses.

```ts
// Current (leaks info):
if (existingUser) {
  redirect("/register?error=User+with+this+email+already+exists");
}

// Fixed (generic message):
if (existingUser) {
  redirect("/register?error=Unable+to+create+account.+Please+try+again.");
}
```

**Fix:** Replace the specific error with a generic message that doesn't reveal whether the email is registered.

---

## Implementation Notes

- Items 1-3 all target the same file (`app/api/profile/change-password/route.ts`) — implement together
- Item 4 is isolated to `actions/auth/Auth.ts`
- Verify the change-password flow still works after items 1-3
- Verify registration still works after item 4
