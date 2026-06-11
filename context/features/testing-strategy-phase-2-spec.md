# Testing Strategy Phase 2: Core Auth Flows

## Overview

Phase 2 tests the main authentication server actions, building on the mocked dependencies established in Phase 1.

## Scope

| File | Functions | Why Test |
|------|-----------|----------|
| `actions/auth.ts` | `handleRegister`, `handleDeleteAccount`, `handleChangePassword` | Auth lifecycle, validation, error branches |
| `actions/sign-in.ts` | `handleSignIn` | Rate limiting, credential validation |
| `lib/account-deletion.ts` | `deleteAccountByPassword` | Multiple error branches, structured returns |
| `lib/auth.config.ts` | `redirect` callback | URL safety checking |

## Test Cases

### `actions/auth.ts`

**`handleRegister`**
- Registers new user with valid data
- Hashes password with bcrypt
- Creates verification token if email verification enabled
- Sends verification email via Resend
- Returns `{ success: true }` on success
- Returns `{ success: false, error: 'User already exists' }` for duplicate email
- Returns `{ success: false, errors }` for Zod validation failure
- Calls `revalidatePath` on success
- Calls `redirect` on success

**`handleDeleteAccount`**
- Deletes account with correct password
- Returns `{ success: true }` on success
- Returns `{ success: false, error: 'Not authenticated' }` when no session
- Returns `{ success: false, error: 'User not found' }` when user missing
- Returns `{ success: false, error: 'No password set' }` for OAuth users
- Returns `{ success: false, error: 'Incorrect password' }` on wrong password
- Calls `signOut` after deletion
- Calls `revalidatePath` on success

**`handleChangePassword`**
- Changes password with valid current password
- Hashes new password with bcrypt
- Returns `{ success: true }` on success
- Returns `{ success: false, error: 'Not authenticated' }` when no session
- Returns `{ success: false, error: 'User not found' }` when user missing
- Returns `{ success: false, error: 'No password set' }` for OAuth users
- Returns `{ success: false, error: 'Current password is incorrect' }` on wrong password
- Returns `{ success: false, errors }` for Zod validation failure

### `actions/sign-in.ts`

**`handleSignIn`**
- Signs in with valid credentials
- Returns `{ success: true }` on success
- Returns `{ success: false, error: 'Invalid credentials' }` on wrong password
- Returns `{ success: false, error: 'Email not verified' }` when verification required
- Returns `{ success: false, errors }` for Zod validation failure
- Returns `{ success: false, retryAfter }` when rate limited
- Calls `redirect` on success

### `lib/account-deletion.ts`

**`deleteAccountByPassword`**
- Deletes account with correct password
- Returns `{ success: true }` on success
- Returns `{ success: false, error: 'Not authenticated' }` when no session
- Returns `{ success: false, error: 'User not found' }` when user missing
- Returns `{ success: false, error: 'No password set' }` for OAuth users
- Returns `{ success: false, error: 'Incorrect password' }` on wrong password
- Calls `signOut` after deletion

### `lib/auth.config.ts`

**`redirect` callback**
- Allows redirect to same-origin URLs
- Redirects to `/` for cross-origin URLs
- Handles relative paths correctly

## Dependencies to Mock

- Prisma client (user lookups, deletes, updates)
- `bcryptjs` (password hashing/comparison)
- `next-auth` (`signIn`, `signOut`, `auth`)
- `next/navigation` (`redirect`, `revalidatePath`)
- `@upstash/ratelimit` (rate limiting)
- `resend` (email sending)
- `env` variables (`ENABLE_EMAIL_VERIFICATION`, `RESEND_FROM`)

## Acceptance Criteria

- [ ] All test files created alongside source files
- [ ] `npm run test:run` passes
- [ ] Coverage for `actions/auth.ts` ≥ 80%
- [ ] Coverage for `actions/sign-in.ts` ≥ 80%
- [ ] Coverage for `lib/account-deletion.ts` ≥ 80%
- [ ] Coverage for `lib/auth.config.ts` ≥ 80%
- [ ] All error branches tested
- [ ] All redirect calls verified
