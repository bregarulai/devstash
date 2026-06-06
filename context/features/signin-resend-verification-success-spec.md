# Feature: Sign-In Page Resend Verification Success Param

**Spec**: `context/features/signin-resend-verification-success-spec.md`

## Status

In Progress

## Goals

- Keep the `?success=resent` query param added to `redirect("/sign-in")` in `actions/resend-verification.ts`
- Implement sign-in page support to consume the param and display feedback to the user

## Context

`actions/resend-verification.ts` line 23 was changed from:

```ts
redirect("/sign-in")
```

to:

```ts
redirect("/sign-in?success=resent")
```

This is part of **Auth Hardening Phase 1** goal: "Remove user existence disclosure in resend verification."

The `?success=resent` param is currently out of scope for that goal. It has no effect unless the sign-in page is updated to consume it. This feature adds that coordinated change, providing user feedback when the verification email is resent.

## Implementation

**Decision: Option A — Keep `?success=resent`**

**Requires:**
1. Update sign-in page to check for `?success=resent` param
2. Display a toast or inline message: "Verification email resent. Check your inbox."
3. Clear the param after display to avoid re-showing on refresh

**Files affected:**
- `app/(auth)/sign-in/page.tsx`
- `actions/resend-verification.ts` (keep as-is)

## Notes

- The resend verification flow already sends an email, but the user may have already left the page due to the redirect. This param provides explicit confirmation they received.
- No sign-in page currently consumes `?success=resent` — this feature implements that support.
