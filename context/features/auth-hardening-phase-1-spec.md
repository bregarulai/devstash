# Auth Hardening Phase 1 — Quick Wins (5 Isolated Fixes)

## Overview

Five small, independent security fixes that each touch a single file. No new pages or flows. Safe to implement in parallel.

---

## Finding #4 — Increase bcrypt Cost Factor to 12

### Problem

Password hashing uses bcrypt cost factor 10, which is below the recommended minimum of 12 for production.

### Current Code

`lib/auth.ts:32` — `bcrypt.compare()` uses the default cost factor of 10.

### Requirements

1. **Set bcrypt cost factor to 12**: All bcrypt hashing must use cost factor 12.
2. **Apply to all password operations**:
   - Password hashing during registration
   - Password hashing during password change

### Implementation Details

- `bcrypt.compare()` auto-detects cost from the stored hash — no change needed there.
- Find the registration handler and update `bcrypt.hash(password, 12)`.
- Find the password change handler and update `bcrypt.hash(newPassword, 12)`.
- Verify no other bcrypt calls exist with a hardcoded cost factor.

---

## Finding #5 — Remove User Existence Disclosure in Forgot Password

### Problem

The forgot password success message confirms whether an email is registered.

### Current Code

`actions/forgot-password.ts:84` — success message contains "If an account exists with that email".

### Requirements

1. **Generic success message**: "If an account is associated with that email, a password reset link has been sent to it."
2. **Always generate a token**: Even when the email does not exist, generate a dummy token and log it to prevent timing-based enumeration.

### Implementation Details

- In `actions/forgot-password.ts`:
  - Change the success redirect message at line 84 to a generic message.
  - Remove the conditional that only creates a token when a user exists. Always call `createVerificationToken()`.
  - The email will only be delivered if the user exists, but response time and message are identical.

---

## Finding #6 — Extend Middleware Protection to /profile

### Problem

The proxy.ts middleware only protects `/dashboard/:path*` routes. `/profile` has no middleware-level protection.

### Current Code

`proxy.ts:19` — `matcher: ["/dashboard/:path*"]`.

### Requirements

1. **Extend matcher**: Add `/profile/:path*` to the proxy.ts matcher array.
2. **Maintain per-page auth checks**: Keep existing `auth()` checks as defense-in-depth.

### Implementation Details

- In `proxy.ts:19`, change matcher to `["/dashboard/:path*", "/profile/:path*"]`.

---

## Finding #7 — Delete Verification Token After Use

### Problem

The `/api/auth/verify` endpoint verifies the email but does not delete the token, allowing reuse.

### Current Code

`app/api/auth/verify/route.ts` — updates `emailVerified` but never deletes the token.

### Requirements

1. **Delete token after successful verification**: Delete the token after updating `emailVerified`.
2. **Handle token deletion gracefully**: If deletion fails, still consider verification successful.

### Implementation Details

- In `app/api/auth/verify/route.ts`, after the `prisma.user.update` call:
  ```ts
  try {
    await prisma.verificationToken.deleteMany({
      where: { token: hashedToken, identifier: existingToken.identifier },
    })
  } catch (err) {
    console.error('Failed to delete verification token:', err)
  }
  ```

---

## Finding #8 — Remove User Existence Disclosure in Resend Verification

### Problem

`handleResendVerification` gives different behavior for non-existent users vs. verified users.

### Current Code

`actions/resend-verification.ts:19` — conditional redirect for non-existent or verified users.

### Requirements

1. **Generic response**: All cases redirect to `/sign-in?success=resent` with the same message.
2. **No indication of account existence**: Non-existent emails get the same success response.

### Implementation Details

- In `actions/resend-verification.ts`:
  - If user is not found, silently redirect to `/sign-in?success=resent`.
  - If user is already verified, also redirect to `/sign-in?success=resent`.
  - Only send a new verification email if the user exists and is unverified.

---

## Files to Modify

| File | Finding |
|------|---------|
| Registration handler | #4 — bcrypt cost 12 |
| Password change handler | #4 — bcrypt cost 12 |
| `actions/forgot-password.ts` | #5 — generic message + always generate token |
| `proxy.ts` | #6 — extend matcher |
| `app/api/auth/verify/route.ts` | #7 — delete token after use |
| `actions/resend-verification.ts` | #8 — generic response |

## Testing Checklist

- [ ] bcrypt cost factor is 12 in all hashing calls
- [ ] Forgot password with non-existent email shows generic message
- [ ] Forgot password with existing email sends reset link
- [ ] Profile page redirects unauthenticated users via middleware
- [ ] Verification token is deleted from database after use
- [ ] Resend verification for non-existent users shows same success as existing users

## References

- `context/features/auth-hardening-spec.md` — Full spec with all 6 findings
- `lib/auth.ts`
- `lib/auth.config.ts`
- `actions/forgot-password.ts`
- `actions/resend-verification.ts`
- `proxy.ts`
- `app/api/auth/verify/route.ts`
- `context/coding-standards.md`
- `context/project-overview.md`

## Severity

**P1** — Medium. These are real security findings but low-impact individually. No user-facing flow changes.
