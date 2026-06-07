# Rate Limiting for Auth

## Overview

Implement rate limiting on authentication endpoints to prevent brute force attacks, credential stuffing, and abuse of email-sending endpoints.

## Requirements

- Add rate limiting to auth-related Server Actions and API routes
- Use Upstash Redis with `@upstash/ratelimit` for serverless-compatible limiting
- Create reusable rate limiting utility
- Return appropriate error responses (429 Too Many Requests)
- Display user-friendly error messages on the frontend

## Endpoints to Protect

| Endpoint (Server Action / API Route) | Limit | Window | Key By |
| ------------------------------------ | ----- | ------ | ------ |
| `handleSignIn()` — credentials login | 5 attempts | 15 min | IP + email |
| `handleRegister()` — user registration | 3 attempts | 1 hour | IP |
| `handleForgotPassword()` — forgot password | 3 attempts | 1 hour | IP |
| `handleResetPassword()` — reset password | 5 attempts | 15 min | IP |
| `handleResendVerification()` — resend verification email | 3 attempts | 15 min | IP + email |
| `GET /api/auth/verify` — email verification | 10 attempts | 15 min | IP |
| `handleSignInWithGitHub()` — OAuth sign-in | 20 attempts | 15 min | IP |

## Implementation

- Create `lib/rate-limit.ts` utility with Upstash client
- Use sliding window algorithm for smooth limiting
- Extract IP from `x-forwarded-for` header (Vercel) or request
- Combine IP + identifier (email) where applicable for tighter limits
- Return `{ success, remaining, reset }` from rate limit checks
- Apply rate limiting at the Server Action entry point (e.g. `handleSignIn`, `handleRegister`)
- For API routes (e.g. `/api/auth/verify`), apply rate limiting at the route handler

## Environment Variables

```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## Error Handling

- API returns 429 status with JSON: `{ error: "Too many attempts. Please try again in X minutes." }`
- Frontend displays error via toast notification
- Include `Retry-After` header in 429 responses

## Notes

- Upstash free tier allows 10k requests/day (sufficient for auth limiting)
- Rate limiting should fail open (allow request) if Upstash is unavailable
- Server Actions are used for all auth flows (not custom API routes)
- `GET /api/auth/verify` needs rate limiting to prevent email enumeration attacks
- GitHub OAuth sign-in gets a higher limit (20 attempts) since OAuth redirects are less likely to be brute-forced
