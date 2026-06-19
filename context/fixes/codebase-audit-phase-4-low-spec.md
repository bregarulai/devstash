# Codebase Audit — Phase 4: Low Severity Fixes

## Overview

Fix 4 low-severity issues identified in the codebase audit.

| Severity | Count |
|----------|-------|
| Low | 4 |

> **IMPORTANT**: When implementing these fixes, you MUST NOT break any existing functionality or user flow. Always double-check your work by verifying that affected features still work as expected after each change.

> **IMPORTANT**: When implementing these fixes, you MUST NOT break any existing functionality or user flow. Always double-check your work by verifying that affected features still work as expected after each change.

---

## 19. Hardcoded Email Sender Address

**Files:** `actions/auth/Auth.ts:68`, `actions/forgotPassword/ForgotPassword.ts:60`, `actions/resendVerification/ResendVerification.ts:46`

`"DevStash <onboarding@resend.dev>"` is hardcoded in 3 places.

**Fix:** Extract to a constant in `lib/constants.ts` or use an environment variable.

---

## 20. Magic Number Token Expiry

**File:** `lib/auth/verificationToken/verificationToken.ts:12`

`24 * 60 * 60 * 1000` is used without a named constant.

**Fix:** Extract to `const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;` in `lib/constants.ts`.

---

## 21. DashboardWrapper is a Client Component Unnecessarily

**File:** `components/dashboard/dashboardWrapper/DashboardWrapper.tsx:1`

Has `'use client'` but only uses `useState` for sidebar toggle. This prevents server-side rendering of children.

**Fix:** Split into a server component wrapper and a client component for the sidebar toggle state.

---

## 22. `handleResetPassword` User Not Found Error

**File:** `actions/resetPassword/ResetPassword.ts:53`

Returns `User+not+found` which differs from the generic error used elsewhere. While not a direct enumeration vector (the token is verified first), it's inconsistent with the project's email enumeration prevention pattern.

**Fix:** Use the same generic error message as the invalid token case.
