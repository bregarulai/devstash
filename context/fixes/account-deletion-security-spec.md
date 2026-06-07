# Account Deletion Security Fixes

**Target**: `app/api/profile/delete-account/route.ts`
**Phase**: 1 of 2
**Status**: Draft
**Created**: 2026-06-07
**Priority**: P0

## Overview

Two actionable vulnerabilities identified in the account deletion flow that expose users to irreversible account loss. Both fixes touch a single file each and can be implemented independently.

---

## Finding #1 — Add CSRF Protection to Account Deletion API

### Problem

The DELETE endpoint at `app/api/profile/delete-account/route.ts:6` validates the session (line 7-11) but has no CSRF token check. An attacker can craft a malicious page that tricks a logged-in user into triggering this DELETE request. NextAuth handles CSRF for OAuth flows, but custom API routes need their own CSRF protection.

### Current Code

`app/api/profile/delete-account/route.ts:6-43` — session validation only, no CSRF token verification.

### Requirements

1. **Add CSRF token validation**: Verify a CSRF token header before processing the deletion request.
2. **Use same CSRF mechanism as auth**: Align with NextAuth's CSRF approach if possible, or generate a separate token.

### Implementation Details

- Add a CSRF token check at the start of the DELETE handler:
  ```ts
  const csrfToken = request.headers.get('x-csrf-token');
  if (!csrfToken) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
  }
  ```
- The CSRF token can be obtained from the sign-in page session or generated via a separate endpoint.
- Consider whether to use NextAuth's built-in CSRF token or a custom one. If using NextAuth, the token is available in the session or can be fetched via `/api/auth/csrf`.
- The frontend (account deletion confirmation page) must include the token in the request header.

---

## Finding #2 — Add Re-Authentication (Password Confirmation) for Account Deletion

### Problem

Account deletion only requires the user to be authenticated via session. It doesn't require re-entering the password or any additional confirmation. A compromised session or CSRF attack could lead to irreversible account loss.

### Current Code

`app/api/profile/delete-account/route.ts:6-43` — only checks `session.user.id`, no password verification.

### Requirements

1. **Require password re-entry**: User must enter their current password before account deletion proceeds.
2. **Verify password before deletion**: Check the entered password against the stored hash before executing the delete.
3. **Fail gracefully**: If password verification fails, return a 401 response without revealing whether the password was incorrect for the user.

### Implementation Details

- In `deleteAccountSchema` (types/db.ts), add a `password` field:
  ```ts
  export const deleteAccountSchema = z.object({
    password: z.string().min(1, 'Password is required'),
  });
  ```
- In `app/api/profile/delete-account/route.ts`, after session validation and body parsing:
  ```ts
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!user?.password) {
    return NextResponse.json({ error: 'Password verification required' }, { status: 400 });
  }

  const valid = await bcrypt.compare(body.password, user.password);
  if (!valid) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }
  ```
- The frontend (account deletion confirmation page) must include a password input field.
- Consider adding a delay or confirmation step after password entry to prevent automated attacks.

---

## Files to Modify

| File | Finding |
|------|---------|
| `app/api/profile/delete-account/route.ts` | #1 — add CSRF token check |
| `app/api/profile/delete-account/route.ts` | #2 — add password verification |
| `types/db.ts` | #2 — add `password` field to `deleteAccountSchema` |
| Account deletion confirmation page | #2 — add password input field |

## Testing Checklist

- [ ] Account deletion without CSRF token returns 403
- [ ] Account deletion with valid CSRF token proceeds to password check
- [ ] Account deletion with incorrect password returns 401
- [ ] Account deletion with correct password succeeds and deletes the account
- [ ] CSRF token is included in the frontend request header
- [ ] Password input is present on the account deletion confirmation page
- [ ] Password verification uses bcrypt.compare (not timing-vulnerable)

## References

- `context/features/auth-hardening-spec.md` — Full auth hardening spec
- `app/api/profile/delete-account/route.ts` — Account deletion API
- `types/db.ts` — Zod schemas
- `actions/auth.ts` — Auth actions for reference
- `context/coding-standards.md` — Coding standards
- `context/project-overview.md` — Project overview

## Severity

**P0** — Critical. These are real security vulnerabilities that could lead to irreversible account loss. Account deletion is a high-sensitivity operation that requires defense-in-depth.
