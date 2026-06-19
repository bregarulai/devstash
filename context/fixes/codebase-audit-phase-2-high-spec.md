# Codebase Audit — Phase 2: High Severity Fixes

## Overview

Fix 6 high-severity issues identified in the codebase audit.

| Severity | Count |
|----------|-------|
| High | 6 |

> **IMPORTANT**: When implementing these fixes, you MUST NOT break any existing functionality or user flow. Always double-check your work by verifying that affected features still work as expected after each change.

> **IMPORTANT**: When implementing these fixes, you MUST NOT break any existing functionality or user flow. Always double-check your work by verifying that affected features still work as expected after each change.

---

## 5. handleSignIn Doesn't Catch signIn() Errors

**File:** `actions/signIn/SignIn.ts:59-63`

```ts
await signIn('credentials', { email, password });
redirect(shouldRedirect ? '/verify-required' : '/dashboard');
```

`signIn()` throws on invalid credentials. The error is not caught, so the redirect never executes and the user sees a raw 500 error.

**Fix:** Wrap in try-catch and redirect with an error message:
```ts
try {
  await signIn('credentials', { email, password });
} catch {
  redirect('/sign-in?error=Invalid+email+or+password');
}
```

---

## 6. No Rate Limiting on Password Change

**File:** `actions/auth/Auth.ts:177-209`

`handleChangePassword` has no rate limit check. All other auth endpoints (sign-in, register, forgot password, reset password, delete account, resend verification, email verify, GitHub OAuth) are rate-limited.

**Fix:** Add rate limiting using `RATE_LIMIT_CONFIGS` (create a `changePassword` config if needed).

---

## 7. Rate Limiter Fails Open on Redis Outage

**File:** `lib/auth/rateLimit/rateLimit.ts:133-141`

When Upstash Redis is unavailable, `checkRateLimit` returns `success: true`, allowing unlimited requests:

```ts
} catch {
  // Fail open: allow request if Upstash is unavailable
  return { success: true, ... };
}
```

**Fix:** For critical auth endpoints (sign-in, register, password reset), fail closed by returning `success: false` when Redis is unavailable.

---

## 8. Password Reset Leaks User Existence

**File:** `actions/resetPassword/ResetPassword.ts:52-54`

```ts
if (!user) {
  redirect('/reset-password?error=User+not+found');
}
```

This reveals whether an email is registered. The forgot-password flow correctly uses a generic message, but reset-password does not.

**Fix:** Use a generic error like `Reset+link+is+invalid+or+has+expired` for both cases.

---

## 9. Duplicate Account Deletion Logic

**Files:** `actions/auth/Auth.ts:126-175`, `lib/auth/accountDeletion/accountDeletion.ts:6-45`

`handleDeleteAccount` + `deleteAccountByPasswordInternal` in `Auth.ts` duplicates the logic in `deleteAccountByPassword` from `accountDeletion.ts`. Both do password verification, user deletion, and sign-out.

**Fix:** Remove `handleDeleteAccount` and `deleteAccountByPasswordInternal` from `Auth.ts`. Have the API route call `deleteAccountByPassword` from `accountDeletion.ts` directly.

---

## 10. Duplicate Image Extension Lists

**Files:** `lib/fileValidation.ts:15`, `lib/utils/items.ts:3`

```ts
// fileValidation.ts
export const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']

// utils/items.ts
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico']
```

Different values (`.bmp`, `.ico` missing from one). Can cause inconsistent behavior.

**Fix:** Consolidate into a single shared constant in `lib/constants.ts` or `lib/fileValidation.ts`.
