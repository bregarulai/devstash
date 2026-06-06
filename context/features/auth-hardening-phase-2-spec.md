# Auth Hardening Phase 2 — Email Enumeration on Sign-In (Post-Sign-In Verification)

## Overview

Eliminate email enumeration on the sign-in page by moving the email verification check from pre-authentication to post-authentication. Unverified users authenticate normally, then get redirected to a `/verify-required` page.

This is the most complex finding — it changes the auth flow, requires a new page, and touches multiple files. Implement after Phase 1.

---

## Finding #3 — Eliminate Email Enumeration on Sign-In

### Problem

The sign-in page displays different error messages based on user state:
- `UnverifiedEmail` error shows "Your email has not been verified yet"
- Other credential failures show a generic message

This allows attackers to determine if an email is registered in the system.

### Current Code

`app/(auth)/sign-in/page.tsx:47` — conditional rendering of `UnverifiedEmail` error message.

`lib/auth.ts:28-30` — `authorize` returns `null` for unverified users.

### Requirements

1. **Unified error message**: All credential failures return "Invalid email or password". No distinction between non-existent user, wrong password, or unverified email.

2. **Remove `UnverifiedEmail` error from sign-in page**: Remove the conditional block at `app/(auth)/sign-in/page.tsx:47-65`.

3. **Move verification check to after sign-in**: Unverified users sign in successfully, then get redirected to `/verify-required`.

4. **Resend verification accessible from verify-required page**: The resend link is on the post-sign-in verification screen, not on the sign-in page.

### Implementation Details

#### 1. `lib/auth.ts` — Remove verification check from `authorize`

- Remove the email verification check at lines 28-30.
- Let unverified users authenticate normally (return the user object regardless of `emailVerified`).

#### 2. `lib/auth.config.ts` — Add post-sign-in callback

- Add a `callback` or `redirect` hook that checks `user.emailVerified` after successful sign-in.
- If unverified, redirect to `/verify-required` instead of the default destination.
- Preserve the original `nextUrl` so the user can return after verification.

```ts
// In auth.config.ts callback
if (!user.emailVerified) {
  return ResendCredentialsCallback(url.origin + '/verify-required')
}
```

#### 3. `app/(auth)/sign-in/page.tsx` — Remove conditional, add generic error

- Remove the `error === 'UnverifiedEmail'` conditional block (lines 47-65).
- Replace with a single generic error display for all credential failures.

#### 4. `app/verify-required/page.tsx` — New page

Create a new page at `app/verify-required/page.tsx`:

- Display message: "Please verify your email to access your account."
- Show the user's email address (masked or full).
- "Resend verification email" button that calls `handleResendVerification`.
- "Back to sign in" link.
- Use the same layout/styling as other auth pages.

**Component structure:**
```tsx
// app/verify-required/page.tsx
import { auth } from '@/lib/auth'
import { handleResendVerification } from '@/actions/resend-verification'

export default async function VerifyRequiredPage() {
  const session = await auth()
  const email = session?.user?.email
  
  return (
    <div className="...">
      <h1>Verify your email</h1>
      <p>We sent a verification link to {email}</p>
      <form action={handleResendVerification}>
        <button type="submit">Resend verification email</button>
      </form>
      <Link href="/sign-in">Back to sign in</Link>
    </div>
  )
}
```

**Layout**: Should be under `(auth)` route group so it uses the auth layout. Add to `(auth)/verify-required/page.tsx` or create the route appropriately.

### Edge Cases

- **User signs in, then verifies via email link before reaching `/verify-required`**: The redirect callback should check `emailVerified` at redirect time, not at session creation time. If already verified, skip the redirect.
- **Token expires while on `/verify-required`**: The page should handle expired session gracefully (redirect to sign-in with a message).
- **User clicks "Back to sign in"**: They can re-sign in and will be redirected again if still unverified.

---

## Files to Modify

| File | Change |
|------|--------|
| `lib/auth.ts` | Remove email verification check in `authorize` |
| `lib/auth.config.ts` | Add post-sign-in redirect callback for unverified users |
| `app/(auth)/sign-in/page.tsx` | Remove `UnverifiedEmail` conditional, generic error only |

## New Files to Create

| File | Purpose |
|------|---------|
| `app/(auth)/verify-required/page.tsx` | Post-sign-in page for unverified users |

## Testing Checklist

- [ ] Sign-in with non-existent email shows same error as wrong password
- [ ] Sign-in with verified email works normally (no redirect)
- [ ] Sign-in with unverified email redirects to `/verify-required`
- [ ] `/verify-required` shows user's email and resend button
- [ ] Resend verification from `/verify-required` works
- [ ] User who verifies email before redirect reaches dashboard normally
- [ ] Expired session on `/verify-required` redirects to sign-in

## References

- `context/features/auth-hardening-spec.md` — Full spec with all 6 findings
- `context/features/auth-hardening-phase-1-spec.md` — Phase 1 quick wins (implement first)
- `lib/auth.ts`
- `lib/auth.config.ts`
- `actions/resend-verification.ts`
- `app/(auth)/sign-in/page.tsx`
- `context/coding-standards.md`
- `context/project-overview.md`

## Severity

**P0** — Critical. This is the primary email enumeration vector on the sign-in flow.
