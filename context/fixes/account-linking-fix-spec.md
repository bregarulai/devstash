# Account Linking Fix — Disable Dangerous Email Account Linking

**Phase**: 1
**Status**: Draft
**Created**: 2026-06-14
**Priority**: P0

## Overview

`allowDangerousEmailAccountLinking: true` in the NextAuth config allows automatic account linking via email collision, enabling account takeover.

---

## Problem

`lib/auth/authConfig/authConfig.ts:6-8`:
```ts
const GitHubProvider = GitHub({
  allowDangerousEmailAccountLinking: true,
})
```

**Attack scenario:**
1. Attacker creates a GitHub account using `victim@example.com` (if the email is unverified or the attacker has access to that inbox).
2. Victim already has a DevStash account with `victim@example.com`.
3. Attacker clicks "Sign in with GitHub" on DevStash.
4. NextAuth auto-links the GitHub account and logs the attacker into the victim's DevStash account.

---

## Requirements

1. Disable automatic account linking — users must explicitly link accounts.
2. Preserve GitHub OAuth functionality — GitHub sign-in should still work for new users.

---

## Implementation Details

Set `allowDangerousEmailAccountLinking: false` (or remove the option — `false` is the default):

```ts
const GitHubProvider = GitHub({
  allowDangerousEmailAccountLinking: false,
})
```

This means GitHub sign-in will create a new account if no existing account is linked. Users who want to link GitHub to an existing email account will need to do so from their profile settings (requires a future explicit linking flow).

---

## Files to Modify

| File | Change |
|------|--------|
| `lib/auth/authConfig/authConfig.ts` | Change `allowDangerousEmailAccountLinking` to `false` |

---

## Testing Checklist

- [ ] GitHub OAuth still works for new users (creates account)
- [ ] Existing users with matching email are NOT auto-linked
- [ ] Account linking requires explicit user action (future feature)

---

## References

- `lib/auth/authConfig/authConfig.ts` — NextAuth config
- `context/coding-standards.md` — Coding standards
- OWASP — [Account Takeover via Email Linking](https://owasp.org/www-community/attacks/Account_Hijacking)

## Severity

**P0** — Critical. Real account takeover vector via email collision.
