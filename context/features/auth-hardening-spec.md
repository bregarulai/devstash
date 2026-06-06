# Auth Hardening Feature Spec

## Overview

Address 6 security findings from the auth security audit to harden authentication across the application.

---

## Finding #3 — Eliminate Email Enumeration on Sign-In

### Problem

The sign-in page displays different error messages based on user state:
- `UnverifiedEmail` error shows "Your email has not been verified yet"
- Other credential failures show a generic message

This allows attackers to determine if an email is registered in the system.

### Current Code

`app/(auth)/sign-in/page.tsx:47` — conditional rendering of `UnverifiedEmail` error message.

`lib/auth.ts:28-30` — `authorize` returns `null` for both unverified users and wrong passwords, but NextAuth or the sign-in flow distinguishes these cases.

### Requirements

1. **Unified error message**: All credential failures return the same message: "Invalid email or password". No distinction between non-existent user, wrong password, or unverified email.

2. **Remove `UnverifiedEmail` error from sign-in page**: Remove the conditional block at `app/(auth)/sign-in/page.tsx:47-65` that shows the verification state and resend form.

3. **Move verification check to after sign-in**: Unverified users should sign in successfully, then be redirected to a verify-email required page or shown a modal blocking dashboard access until email is verified.

4. **Resend verification accessible from verify-required page**: The resend verification link should be available on the post-sign-in verification required screen, not on the sign-in page.

### Implementation Details

- In `lib/auth.ts` `authorize` function: remove the email verification check at lines 28-30. Let unverified users authenticate normally.
- In `app/(auth)/sign-in/page.tsx`: remove the `error === 'UnverifiedEmail'` conditional block. Replace with a single generic error display.
- Create a post-sign-in middleware or callback in `lib/auth.config.ts` that checks `emailVerified` and redirects unverified users to a `/verify-required` route.
- The `/verify-required` route should display a message and a "Resend verification email" button that calls `handleResendVerification`.

---

## Finding #4 — Increase bcrypt Cost Factor to 12

### Problem

Password hashing uses bcrypt cost factor 10, which is below the recommended minimum of 12 for production.

### Current Code

`lib/auth.ts:32` — `bcrypt.compare()` uses the default cost factor of 10.

### Requirements

1. **Set bcrypt cost factor to 12**: All bcrypt operations (hashing and comparing) must use cost factor 12.

2. **Apply to all password operations**:
   - Password hashing during registration
   - Password comparison during sign-in
   - Password hashing during password change

### Implementation Details

- Determine where password hashing occurs (likely in a registration action or NextAuth adapter). Use `bcryptjs.hash(password, 12)` for new passwords.
- In `lib/auth.ts` `authorize` function, `bcrypt.compare()` does not accept a cost parameter — it auto-detects from the stored hash. No change needed for `bcrypt.compare()`.
- If a custom registration handler exists, update the `bcrypt.hash()` call to use cost factor 12.
- Verify no other bcrypt calls exist in the codebase that use a hardcoded cost factor.

---

## Finding #5 — Remove User Existence Disclosure in Forgot Password

### Problem

The forgot password success message says "If an account exists with that email, a password reset link has been sent." This confirms whether an email is registered.

### Current Code

`actions/forgot-password.ts:84` — success message contains "If an account exists with that email".

### Requirements

1. **Generic success message**: Always display a message that does not confirm or deny account existence: "If an account is associated with that email, a password reset link has been sent to it."

2. **Always generate a token**: Even when the email does not exist, generate a dummy token and log it to prevent timing-based enumeration (attackers could measure response time to determine if email exists).

### Implementation Details

- In `actions/forgot-password.ts`:
  - Change the success redirect message at line 84 to a generic message that never confirms account existence.
  - Remove the conditional that only creates a token when a user exists. Always call `createVerificationToken()` regardless of whether the user was found.
  - The email sent to the user will only be delivered if the email exists (since Prisma filters by email identifier), but the response time and message will be identical for existing and non-existing emails.

---

## Finding #6 — Extend Middleware Protection to /profile

### Problem

The proxy.ts middleware only protects `/dashboard/:path*` routes. The `/profile` page has no middleware-level protection and relies solely on per-page `auth()` checks.

### Current Code

`proxy.ts:19` — `matcher: ["/dashboard/:path*"]` only covers dashboard routes.

### Verification

Confirmed: `/profile` is at `app/profile/page.tsx` and is NOT under the `/dashboard/` path. The proxy.ts matcher does not cover it. The page does have an `auth()` check at line 12-16, but middleware-level protection provides defense-in-depth.

### Requirements

1. **Extend proxy.ts matcher to include /profile**: Add `/profile/:path*` to the matcher array so unauthenticated requests are redirected before reaching the page.

2. **Maintain per-page auth checks**: Keep existing `auth()` checks in individual pages as defense-in-depth. Middleware redirection is a first layer, not a replacement.

### Implementation Details

- In `proxy.ts:19`, change the matcher from `["/dashboard/:path*"]` to `["/dashboard/:path*", "/profile/:path*"]`.
- Consider whether other unprotected routes exist (e.g., API routes under `/api/profile/`). The `/api/profile/*` routes are already protected by their own auth checks in the route handlers.

---

## Finding #7 — Delete Verification Token After Use

### Problem

The `/api/auth/verify` endpoint verifies the email but does not delete the verification token, allowing the same token to be reused.

### Current Code

`app/api/auth/verify/route.ts` — updates `emailVerified` at line 57-60 but never deletes the token.

### Requirements

1. **Delete token after successful verification**: After updating the user's `emailVerified` field, delete the verification token from the database.

2. **Handle token deletion gracefully**: If token deletion fails (e.g., database error), still consider the verification successful since the email is already marked as verified. Log the error but do not roll back the verification.

### Implementation Details

- In `app/api/auth/verify/route.ts`, after line 60 (the `prisma.user.update` call), add:
  ```
  await prisma.verificationToken.deleteMany({
    where: { token: hashedToken, identifier: existingToken.identifier },
  })
  ```
- Wrap the token deletion in a try-catch that logs the error but does not affect the response.

---

## Finding #8 — Remove User Existence Disclosure in Resend Verification

### Problem

The `handleResendVerification` action at `actions/resend-verification.ts:19` checks `if (!user || user.emailVerified)` and redirects to `/sign-in`. This gives different behavior for non-existent users vs. verified users, potentially revealing account existence.

### Current Code

`actions/resend-verification.ts:19` — conditional redirect for non-existent or verified users.

### Requirements

1. **Generic response for resend verification**: When a user is not found or is already verified, redirect to `/sign-in?success=resent` with the same response as a successful resend. The user should receive no indication that the email was not found.

2. **Always send a "sent" response**: Regardless of whether the email exists or is verified, the user should see the same success message and redirect.

### Implementation Details

- In `actions/resend-verification.ts`:
  - Remove the `!user` check at line 19 that would redirect for non-existent emails.
  - For verified users, still redirect to `/sign-in?success=resent` — the message is generic enough that it doesn't reveal the verification status.
  - Alternatively, keep the redirect for verified users but use the same redirect URL and message as the success case. The key is that the response is identical regardless of the user's state.
  - The safest approach: if the user is not found, silently redirect to `/sign-in?success=resent`. If the user is verified, also redirect to `/sign-in?success=resent`. Only send a new verification email if the user exists and is unverified.

---

## Files to Modify

| File | Changes |
|------|---------|
| `lib/auth.ts` | Remove email verification check in `authorize` function (Finding #3) |
| `lib/auth.config.ts` | Add redirect callback for unverified users post-sign-in (Finding #3) |
| `app/(auth)/sign-in/page.tsx` | Remove `UnverifiedEmail` conditional, add generic error display (Finding #3) |
| Registration handler | Update bcrypt cost to 12 (Finding #4) |
| `actions/forgot-password.ts` | Generic success message, always generate token (Finding #5) |
| `proxy.ts` | Extend matcher to include `/profile/:path*` (Finding #6) |
| `app/api/auth/verify/route.ts` | Delete token after verification (Finding #7) |
| `actions/resend-verification.ts` | Generic response for all cases (Finding #8) |

## New Files to Create

| File | Purpose |
|------|---------|
| `app/verify-required/page.tsx` | Post-sign-in page for unverified users (Finding #3) |

## Testing Checklist

- [ ] Sign-in with non-existent email shows same error as wrong password
- [ ] Sign-in with verified email works normally
- [ ] Sign-in with unverified email redirects to verify-required page
- [ ] Forgot password with non-existent email shows generic message
- [ ] Forgot password with existing email sends reset link
- [ ] Response time for existing vs non-existing email in forgot password is similar
- [ ] Profile page redirects unauthenticated users via middleware
- [ ] Verification token is deleted from database after use
- [ ] Resend verification works for unverified users
- [ ] Resend verification for non-existent users shows same success as for existing users
- [ ] bcrypt cost factor is 12 for all password hashing operations
