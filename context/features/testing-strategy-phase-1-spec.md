# Testing Strategy Phase 1: Security-Critical Foundations

## Overview

Phase 1 focuses on testing security-critical pure functions and validation schemas that form the foundation for all server actions.

## Scope

| File | Functions | Why Test |
|------|-----------|----------|
| `lib/rate-limit.ts` | `getClientIP`, `formatRetryAfter`, `createRateLimiter`, `checkRateLimit` | Pure functions, fail-open behavior, security boundary |
| `lib/verification-token.ts` | `createVerificationToken`, `verifyToken` | Token lifecycle, expiry, cleanup |
| `types/db.ts` | All Zod schemas, `passwordRequirements` | Validation logic, password refinements |
| `lib/auth.ts` | `isCredentialsInput` | Type guard pure function |

## Test Cases

### `lib/rate-limit.ts`

**`getClientIP`**
- Extracts IP from `x-forwarded-for` header
- Falls back to `x-real-ip` header
- Returns `'127.0.0.1'` when no headers present
- Handles multiple IPs in `x-forwarded-for` (takes first)

**`formatRetryAfter`**
- Formats 1 second → `"1 second"`
- Formats 30 seconds → `"30 seconds"`
- Formats 60 seconds → `"1 minute"`
- Formats 90 seconds → `"1 minute 30 seconds"`

**`createRateLimiter`**
- Returns limiter when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set
- Returns null when env vars missing (fail-open)

**`checkRateLimit`**
- Returns `{ success: true }` when under limit
- Returns `{ success: false, retryAfter }` when over limit
- Returns `{ success: true }` when Upstash fails (fail-open)

**`RATE_LIMIT_CONFIGS`**
- Contains `auth`, `passwordReset`, `githubOAuth` configs
- Each has `limit`, `window` properties

### `lib/verification-token.ts`

**`createVerificationToken`**
- Generates random 32-byte hex token
- Returns token in plain text
- Stores hashed token in database with 24h expiry
- Creates token for given email

**`verifyToken`**
- Returns `{ success: true }` for valid unexpired token
- Returns `{ success: false, error: 'Token not found' }` for invalid token
- Returns `{ success: false, error: 'Token expired' }` for expired token
- Deletes token after successful verification
- Does not delete token on failure

### `types/db.ts`

**Zod Schemas**
- `registerSchema`: valid email/password/name passes, invalid fails
- `signInSchema`: valid email/password passes
- `changePasswordSchema`: passwords match, meets requirements
- `resetPasswordSchema`: passwords match, meets requirements
- `forgotPasswordSchema`: valid email passes
- `deleteAccountSchema`: password required
- `verifyTokenSchema`: token and email required
- `itemInsertSchema`: valid item data passes
- `.refine()` on `registerSchema`: password confirmation matching
- `.refine()` on `changePasswordSchema`: password confirmation matching
- `.refine()` on `resetPasswordSchema`: password confirmation matching

**`passwordRequirements`**
- Each requirement function returns correct boolean
- Validates length, uppercase, lowercase, number, special char

### `lib/auth.ts`

**`isCredentialsInput`**
- Returns `true` for valid `CredentialsInput` objects
- Returns `false` for non-objects
- Returns `false` when missing `email` or `password`
- Returns `false` for wrong types

## Dependencies to Mock

- Prisma client (for `verification-token.ts`)
- `env` variables (for `rate-limit.ts`)

## Acceptance Criteria

- [ ] All test files created alongside source files
- [ ] `npm run test:run` passes
- [ ] Coverage for `lib/rate-limit.ts` ≥ 80%
- [ ] Coverage for `lib/verification-token.ts` ≥ 80%
- [ ] Coverage for `lib/auth.ts` ≥ 80%
- [ ] Zod schemas validated with valid/invalid inputs
