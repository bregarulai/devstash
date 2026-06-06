# Feature: Sign-In Page Resend Verification Success Param

**Spec**: `context/features/signin-resend-verification-success-spec.md`

## Status

Pending

## Goals

- Decide whether to keep or remove the `?success=resent` query param added to `redirect("/sign-in")` in `actions/resend-verification.ts`
- If keeping: implement sign-in page support to consume the param and display feedback
- If removing: revert the change to match the original behavior

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

The `?success=resent` param is **out of scope** for that goal. It has no effect unless the sign-in page is updated to consume it, which would be a separate coordinated change.

## Options

### Option A: Keep `?success=resent`

**Requires:**
1. Update sign-in page to check for `?success=resent` param
2. Display a toast or inline message: "Verification email resent. Check your inbox."
3. Clear the param after display to avoid re-showing on refresh

**Files affected:**
- `app/sign-in/page.tsx` (or equivalent sign-in page)
- `actions/resend-verification.ts` (keep as-is)

### Option B: Remove `?success=resent`

**Requires:**
1. Revert `actions/resend-verification.ts` line 23 to `redirect("/sign-in")`

**Files affected:**
- `actions/resend-verification.ts` only

## Recommendation

**Option B** — The `?success=resent` param does not contribute to the Auth Hardening Phase 1 goals. Resend verification already sends an email with implicit success feedback (the user receives a message). Adding a query param that the sign-in page doesn't handle creates dead code and a half-implemented feature.

If user feedback on resend is desired, it should be a **separate feature** with its own spec, not a query param tacked onto an existing security fix.

## Notes

- Auth Hardening Phase 1 goals are focused on security fixes, not UX improvements
- The resend verification flow already shows a success message before redirecting (email sent confirmation)
- No sign-in page currently consumes `?success=resent`
