# Testing Strategy Phase 3: Data & Remaining Actions

## Overview

Phase 3 covers data transformation functions, remaining server actions, and utility tests.

## Scope

| File | Functions | Why Test |
|------|-----------|----------|
| `lib/db/collections.ts` | `getDominantItemTypeColor` | Pure function |
| `lib/db/items.ts` | `mapItemToDetails`, `getItemStats`, `getSystemItemTypesWithCounts` | Mappers, aggregation |
| `lib/utils.ts` | `cn()` | Class merging utility |
| `actions/forgot-password.ts` | `handleForgotPassword` | Timing-attack prevention, email flow |
| `actions/reset-password.ts` | `handleResetPassword` | Token verification, password update |
| `actions/resend-verification.ts` | `handleResendVerification` | Token generation, email sending |
| `actions/sign-in-github.ts` | `handleSignInWithGitHub` | Rate limiting config |
| `actions/profile.ts` | `retryProfileData` | Auth guard, redirect logic |
| `lib/constants.ts` | 4 numeric constants | Smoke test |

## Test Cases

### `lib/db/collections.ts`

**`getDominantItemTypeColor`**
- Returns color of most frequent item type
- Returns `null` for empty array
- Returns first color when counts are equal
- Handles single item type

### `lib/db/items.ts`

**`mapItemToDetails`**
- Returns item data unchanged
- Handles all item properties

**`getItemStats`**
- Returns correct counts for items, collections, pinned, favorites
- Returns zeros when no data

**`getSystemItemTypesWithCounts`**
- Returns item types with counts
- Returns empty array when no items

### `lib/utils.ts`

**`cn()`**
- Merges classes without conflicts
- Resolves Tailwind class conflicts (e.g., `p-2 p-4` → `p-4`)
- Handles conditional classes
- Returns empty string for no input

### `actions/forgot-password.ts`

**`handleForgotPassword`**
- Sends reset email with valid email
- Returns `{ success: true }` on success
- Returns `{ success: false, errors }` for Zod validation failure
- Returns `{ success: false, retryAfter }` when rate limited
- Creates dummy token before real token (timing-attack prevention)
- Calls `redirect` on success

### `actions/reset-password.ts`

**`handleResetPassword`**
- Resets password with valid token
- Returns `{ success: true }` on success
- Returns `{ success: false, error: 'Invalid or expired token' }` for invalid token
- Returns `{ success: false, errors }` for Zod validation failure
- Returns `{ success: false, retryAfter }` when rate limited
- Hashes new password with bcrypt
- Calls `redirect` on success

### `actions/resend-verification.ts`

**`handleResendVerification`**
- Resends verification email
- Returns `{ success: true }` on success
- Returns `{ success: false, error: 'User not found' }` when user missing
- Returns `{ success: false, error: 'Email already verified' }` when verified
- Returns `{ success: false, retryAfter }` when rate limited
- Creates dummy token before real token (timing-attack prevention)

### `actions/sign-in-github.ts`

**`handleSignInWithGitHub`**
- Initiates GitHub OAuth flow
- Returns `{ success: true }` on success
- Returns `{ success: false, retryAfter }` when rate limited
- Calls `redirect` on success

### `actions/profile.ts`

**`retryProfileData`**
- Returns profile data when authenticated
- Calls `redirect('/signin')` when not authenticated
- Calls `revalidatePath` on success

### `lib/constants.ts`

**Constants**
- `DEFAULT_RECENT_LIMIT` is 10
- `DEFAULT_FAVORITE_LIMIT` is 6
- `DEFAULT_SAMPLE_COUNT` is 3
- `DEFAULT_RECENT_COLLECTIONS_LIMIT` is 10

## Dependencies to Mock

- Prisma client (all query functions)
- `bcryptjs` (password hashing)
- `next-auth` (`signIn`, `signOut`, `auth`)
- `next/navigation` (`redirect`, `revalidatePath`)
- `@upstash/ratelimit` (rate limiting)
- `resend` (email sending)
- `env` variables

## Acceptance Criteria

- [ ] All test files created alongside source files
- [ ] `npm run test:run` passes
- [ ] Coverage for `lib/db/collections.ts` ≥ 80% (pure functions)
- [ ] Coverage for `lib/db/items.ts` ≥ 80% (pure functions)
- [ ] Coverage for `lib/utils.ts` = 100%
- [ ] Coverage for all server actions ≥ 80%
- [ ] `npm run test:coverage` meets overall thresholds (80% lines, 80% functions, 70% branches, 80% statements)
