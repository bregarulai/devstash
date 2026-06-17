# Rate Limiting Fix — Server Actions Bypassed

**Phase**: 1
**Status**: Draft
**Created**: 2026-06-14
**Priority**: P0

## Overview

Every Server Action calls `getClientIP(null)`, which returns `"unknown"`. This makes rate limit keys collide across all users, effectively disabling rate limiting for IP-based endpoints.

---

## Problem

`getClientIP` in `lib/auth/rateLimit/rateLimit.ts:44`:
```ts
export function getClientIP(headers: Headers | null): string {
  if (!headers) return "unknown";  // <-- always hits this branch
}
```

All 6 Server Actions call `getClientIP(null)`:
```ts
const ip = getClientIP(null);  // always returns "unknown"
```

**Impact by endpoint:**

| Endpoint | Rate key | Problem |
|----------|----------|---------|
| `handleSignIn` | `signin:unknown:${email}` | Per-email, but IP is useless — attacker can bypass per-IP limits |
| `handleRegister` | `register:unknown` | **IP-only key shared by ALL users** — first user to hit limit blocks everyone |
| `handleForgotPassword` | `forgotpwd:unknown` | **IP-only key shared by ALL users** |
| `handleResetPassword` | `resetpwd:unknown` | **IP-only key shared by ALL users** |
| `handleSignInWithGitHub` | `github:unknown` | **IP-only key shared by ALL users** |
| `handleResendVerification` | `resendverif:unknown:${email}` | Per-email, but IP is useless |

---

## Requirements

1. Server Actions must receive request headers to extract the real client IP.
2. Rate limit keys must include the real IP so each user is rate-limited independently.
3. No breaking changes to existing action signatures.

---

## Implementation Details

Next.js Server Actions do not have access to `request.headers`. Use middleware-injected header:

### Step 1 — Create/update `middleware.ts`

Extract IP from `request.headers` and inject as a custom header:

```ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "unknown";

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-client-ip", ip);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

### Step 2 — Update all 6 Server Actions

Replace `getClientIP(null)` with `headers()` from `next/headers`:

```ts
import { headers } from "next/headers";

// In each action:
const headersList = await headers();
const ip = headersList.get("x-client-ip") ?? "unknown";
```

---

## Files to Modify

| File | Change |
|------|--------|
| `middleware.ts` (create or update) | Extract IP, set `x-client-ip` header |
| `actions/signIn/SignIn.ts` | Replace `getClientIP(null)` with `headers().get("x-client-ip")` |
| `actions/auth/Auth.ts` | Same change in `handleRegister` |
| `actions/forgotPassword/ForgotPassword.ts` | Same change |
| `actions/resetPassword/ResetPassword.ts` | Same change |
| `actions/signInGithub/SignInGithub.ts` | Same change |
| `actions/resendVerification/ResendVerification.ts` | Same change |

---

## Testing Checklist

- [ ] `getClientIP(null)` is no longer called from any Server Action
- [ ] Register endpoint rate-limits per real IP, not per `"unknown"`
- [ ] Sign-in endpoint rate-limits per IP + email independently
- [ ] Rate limiting works when Upstash is configured
- [ ] Rate limiting fails open when Upstash is unavailable
- [ ] Middleware correctly forwards `x-client-ip` header
- [ ] Non-auth routes are not affected by middleware

---

## References

- `lib/auth/rateLimit/rateLimit.ts` — Rate limiting implementation
- `actions/signIn/SignIn.ts` — Sign-in action
- `actions/auth/Auth.ts` — Register action
- `actions/forgotPassword/ForgotPassword.ts` — Forgot password action
- `actions/resetPassword/ResetPassword.ts` — Reset password action
- `actions/signInGithub/SignInGithub.ts` — GitHub sign-in action
- `actions/resendVerification/ResendVerification.ts` — Resend verification action
- `context/coding-standards.md` — Coding standards

## Severity

**P0** — Critical. Rate limiting is completely non-functional for IP-based endpoints. The first user to hit the limit blocks all subsequent users, and attackers can bypass per-IP limits entirely.
