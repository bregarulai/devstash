# Stripe Integration Phase 1 — Core Infrastructure

## Overview

Phase 1 lays the foundation for DevStash Pro subscriptions: the Stripe SDK singleton, the free-tier usage-limits module, and the NextAuth JWT callback fix that lets webhook updates propagate to active sessions. No Stripe Dashboard setup, webhooks, or UI work in this phase — everything here is unit-testable in isolation with Vitest.

Implement this phase **before** Phase 2. All subsequent Stripe work (webhooks, checkout, gating enforcement, billing UI) depends on these primitives.

---

## Goals

- Stripe SDK is importable from a single singleton with typed price-ID helpers.
- Free-tier limits and Pro-only item-type rules live in one pure module with full unit test coverage.
- An active user session picks up `isPro` changes from the database on the next request (no sign-out/in required).
- `npm run test:run` and `npm run build` stay green.

---

## Finding #1 — Add Stripe SDK & Create Singleton Module

### Problem

There is no Stripe code in the codebase. `package.json` has no `stripe` dependency, and `lib/stripe/` does not exist. Phase 2 routes/actions need a shared, typed Stripe client.

### Current Code

- `package.json:19-49` — no `stripe` entry in `dependencies`.
- `lib/` directory — no `stripe/` subfolder (compare existing `lib/auth/`, `lib/db/`, `lib/email/`).

### Requirements

1. **Install `stripe`** as a runtime dependency. The `stripe` package v19+ ships its own TypeScript types — do **not** add `@types/stripe`.
2. **Create `lib/stripe/stripe.ts`** that exports:
   - `stripe` — a singleton `Stripe` client constructed with `process.env.STRIPE_SECRET_KEY`.
   - `STRIPE_PRICE_IDS` — a `const` object `{ monthly, yearly }` reading `STRIPE_PRICE_ID_MONTHLY` and `STRIPE_PRICE_ID_YEARLY`.
   - `PlanInterval` — a type alias `'monthly' | 'yearly'`.
   - `priceIdToPlan(priceId: string): PlanInterval | null` — maps a Stripe price ID back to a plan interval (returns `null` for unknown IDs).
3. **Throw on missing env var**: If `STRIPE_SECRET_KEY` is unset, throw `new Error('STRIPE_SECRET_KEY is not set')` at module load (mirrors the pattern in `lib/prisma/prisma.ts:6-8`).
4. **Folder convention**: Place at `lib/stripe/stripe.ts` to match the one-folder-per-module convention (`lib/auth/auth/`, `lib/email/resend/`).

### Implementation Details

```typescript
// lib/stripe/stripe.ts
import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(secretKey, {
  apiVersion: '2025-08-27.basil', // pin to a stable apiVersion on install
  typescript: true,
});

export const STRIPE_PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_ID_MONTHLY!,
  yearly: process.env.STRIPE_PRICE_ID_YEARLY!,
} as const;

export type PlanInterval = 'monthly' | 'yearly';

export function priceIdToPlan(priceId: string): PlanInterval | null {
  if (priceId === STRIPE_PRICE_IDS.monthly) return 'monthly';
  if (priceId === STRIPE_PRICE_IDS.yearly) return 'yearly';
  return null;
}
```

> **Note on `apiVersion`:** Pin to whatever version the installed `stripe` package defaults to. Check `node_modules/stripe` after install and use that exact version string. Do not leave it unset — Stripe SDKs warn on unpinned versions.

---

## Finding #2 — Create Usage-Limits Module

### Problem

Free-tier limits (50 items, 3 collections) and Pro-only item types (`file`, `image`) are described in `context/project-overview.md:526-547` but exist nowhere in code. Phase 2 enforcement points (`createItemAction`, `createCollectionAction`, `app/api/upload/route.ts`) need a single source of truth.

### Current Code

- `lib/constants.ts:6-14` — `ITEM_TYPES` array lists all 7 types with no Pro distinction.
- `lib/constants.ts:19` — `SHOW_FILE_UPLOAD = ['file', 'image']` exists but is purely a UI display flag, not a gate.
- No `lib/constants/limits.ts` file.

### Requirements

1. **Create `lib/constants/limits.ts`** exporting:
   - `FREE_TIER_LIMITS` — `{ maxItems: 50, maxCollections: 3 }` as a readonly const.
   - `PRO_ONLY_ITEM_TYPES` — `['file', 'image'] as const`.
   - `isProOnlyItemType(type: string): boolean` — returns `true` if `type` is in `PRO_ONLY_ITEM_TYPES`.
2. **Use `as const`** for both constants so downstream type narrowing works.
3. **Pure module**: No Prisma, no Stripe, no React. Fully unit-testable.

### Implementation Details

```typescript
// lib/constants/limits.ts
export const FREE_TIER_LIMITS = {
  maxItems: 50,
  maxCollections: 3,
} as const;

export const PRO_ONLY_ITEM_TYPES = ['file', 'image'] as const;

export function isProOnlyItemType(type: string): boolean {
  return (PRO_ONLY_ITEM_TYPES as readonly string[]).includes(type);
}
```

> **Why a separate file from `lib/constants.ts`:** `lib/constants.ts` imports `lucide-react` icons (line 1), which pulls in React-side concerns. The limits module must stay pure so it can be imported from server actions, API routes, and unit tests without side effects.

---

## Finding #3 — Unit Tests for Usage-Limits Module

### Problem

The new `lib/constants/limits.ts` module is pure logic that gates every billing-aware code path. It must be tested before Phase 2 builds enforcement on top of it.

### Current Code

- No test file exists yet. Project test convention is `*.test.ts` colocated next to source (see `lib/constants.test.ts`, `lib/pagination.test.ts`, `lib/fileValidation.test.ts`).
- Vitest is configured via `vitest.config.ts` and run with `npm run test:run` (`package.json:12`).

### Requirements

1. **Create `lib/constants/limits.test.ts`** colocated with the source.
2. **Test `FREE_TIER_LIMITS`**:
   - `maxItems` equals `50`.
   - `maxCollections` equals `3`.
3. **Test `PRO_ONLY_ITEM_TYPES`**:
   - Contains exactly `'file'` and `'image'`.
   - Does **not** contain `'snippet'`, `'prompt'`, `'command'`, `'note'`, `'link'`.
4. **Test `isProOnlyItemType`**:
   - Returns `true` for `'file'`.
   - Returns `true` for `'image'`.
   - Returns `false` for `'snippet'`.
   - Returns `false` for `'prompt'`, `'command'`, `'note'`, `'link'`.
   - Returns `false` for an empty string.
   - Returns `false` for an unknown type (e.g. `'custom'`).
   - Is case-sensitive (`'File'` returns `false`).
5. **No mocks needed** — the module is pure. Import directly.

### Implementation Details

Follow the existing test style in `lib/constants.test.ts` (describe/it blocks, plain asserts). Example shape:

```typescript
// lib/constants/limits.test.ts
import { describe, it, expect } from 'vitest';
import { FREE_TIER_LIMITS, PRO_ONLY_ITEM_TYPES, isProOnlyItemType } from './limits';

describe('FREE_TIER_LIMITS', () => {
  it('limits items to 50', () => {
    expect(FREE_TIER_LIMITS.maxItems).toBe(50);
  });

  it('limits collections to 3', () => {
    expect(FREE_TIER_LIMITS.maxCollections).toBe(3);
  });
});

describe('PRO_ONLY_ITEM_TYPES', () => {
  it('contains file and image', () => {
    expect(PRO_ONLY_ITEM_TYPES).toEqual(['file', 'image']);
  });
});

describe('isProOnlyItemType', () => {
  it.each(['file', 'image'])('returns true for %s', (type) => {
    expect(isProOnlyItemType(type)).toBe(true);
  });

  it.each(['snippet', 'prompt', 'command', 'note', 'link'])('returns false for %s', (type) => {
    expect(isProOnlyItemType(type)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isProOnlyItemType('')).toBe(false);
  });

  it('returns false for unknown type', () => {
    expect(isProOnlyItemType('custom')).toBe(false);
  });

  it('is case-sensitive', () => {
    expect(isProOnlyItemType('File')).toBe(false);
    expect(isProOnlyItemType('IMAGE')).toBe(false);
  });
});
```

---

## Finding #4 — Fix NextAuth JWT Callback to Always Sync `isPro`

### Problem

The JWT callback only reads `isPro` from the database when `user` is truthy — i.e. **on initial sign-in**. When a Stripe webhook flips `isPro` to `true` in the database (Phase 2), an already-logged-in user's JWT still carries the stale `isPro: false` until they fully sign out and back in. The `session({ session, token })` callback only copies the token value — it never re-reads the DB.

### Current Code

`lib/auth/authConfig/authConfig.ts:22-32`:

```typescript
async jwt({ token, user }) {
  if (user) {
    (token as { id: string }).id = String(user.id);
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { isPro: true },
    });
    (token as { isPro: boolean }).isPro = dbUser?.isPro ?? false;
  }
  return token;
},
```

### Requirements

1. **Always sync `isPro` from the database** on every JWT callback invocation, not just when `user` is present.
2. **Use `token.sub` (or the custom `token.id`)** as the user ID on subsequent calls — `user` is only set on the first sign-in.
3. **Preserve the existing `token.id` assignment** on first sign-in (other code reads `token.id`, see `session` callback at line 34).
4. **Default to `false`** when the DB lookup fails or the user is gone (matches existing behavior at line 29).
5. **Update the existing test file** `lib/auth/authConfig/authConfig.test.ts` to cover the no-`user` path.

### Implementation Details

Replace the `jwt` callback (lines 22-32):

```typescript
async jwt({ token, user }) {
  if (user) {
    (token as { id: string }).id = String(user.id);
  }

  // Always sync isPro from DB so webhook updates propagate without re-login.
  // `user` is only set on first sign-in; subsequent calls rely on token.id/sub.
  const userId = (token as { id?: string }).id ?? token.sub;
  if (userId) {
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { isPro: true },
    });
    (token as { isPro: boolean }).isPro = dbUser?.isPro ?? false;
  }

  return token;
},
```

**Trade-off:** One `prisma.user.findUnique` per session validation. Acceptable for now; revisit with a short-TTL cache only if profiling shows it's hot.

### Test Updates Required

The existing `lib/auth/authConfig/authConfig.test.ts` (lines 125, 134) asserts `{ id: 'user-123', isPro: false }` style outputs. Update it to:

- Mock `prisma.user.findUnique` to resolve `{ isPro: true }` and assert the JWT callback sets `token.isPro = true` **even when `user` is not passed** (simulating a returning session).
- Cover the case where `prisma.user.findUnique` resolves `null` → `token.isPro` defaults to `false`.
- Cover the case where `token.id` is unset but `token.sub` is set → still performs the lookup.

---

## Files to Create

| File | Purpose |
|------|---------|
| `lib/stripe/stripe.ts` | Stripe SDK singleton + price ID helpers |
| `lib/constants/limits.ts` | Free-tier limits + Pro-only type guard |
| `lib/constants/limits.test.ts` | Unit tests for limits module |

## Files to Modify

| File | Change |
|------|--------|
| `package.json` | Add `stripe` to `dependencies` |
| `lib/auth/authConfig/authConfig.ts` | Always-sync `isPro` in `jwt` callback (lines 22-32) |
| `lib/auth/authConfig/authConfig.test.ts` | Cover the no-`user` JWT path with mocked Prisma |

---

## Testing Checklist

- [ ] `npm install stripe` succeeds; `import Stripe from 'stripe'` resolves in `lib/stripe/stripe.ts`
- [ ] `lib/stripe/stripe.ts` throws at load when `STRIPE_SECRET_KEY` is unset
- [ ] `priceIdToPlan` returns `'monthly'` / `'yearly'` for the matching IDs and `null` for unknown IDs
- [ ] `lib/constants/limits.test.ts` covers all cases listed in Finding #3
- [ ] `npm run test:run` passes with the new limits test file
- [ ] `npm run test:run` passes with the updated authConfig tests
- [ ] JWT callback syncs `isPro` from DB when `user` is absent (mocked Prisma test)
- [ ] `npm run lint` passes
- [ ] `npm run build` passes (no type errors from the `stripe` import)

## Acceptance Criteria

- [ ] `lib/constants/limits.ts` unit test coverage ≥ 95% (it's a tiny pure module — aim for 100%)
- [ ] `lib/auth/authConfig/authConfig.ts` — the `jwt` callback makes a DB call on every invocation, not just on sign-in
- [ ] No Stripe Dashboard configuration needed for this phase
- [ ] No webhooks, no checkout, no UI changes in this phase

---

## References

- `docs/stripe-integration-plan.md` — §1.2 (NextAuth config), §4.1.1 (stripe singleton), §4.1.2 (limits module), §4.2.1 (JWT callback fix)
- `prisma/schema.prisma:16-37` — User model with `isPro`, `stripeCustomerId`, `stripeSubscriptionId`
- `lib/auth/authConfig/authConfig.ts:22-41` — current `jwt` + `session` callbacks
- `lib/auth/authConfig/authConfig.test.ts:125,134` — existing test assertions to update
- `lib/prisma/prisma.ts:6-8` — env-missing throw pattern to mirror
- `lib/constants.ts:6-19` — existing `ITEM_TYPES` and `SHOW_FILE_UPLOAD` (do not modify here)
- `context/project-overview.md:526-547` — free tier vs Pro feature matrix
- `context/coding-standards.md`
- `vitest.config.ts` — test runner config

## Severity

**P0** — Foundation. Phase 2 cannot ship without the singleton, the limits module, and the JWT sync fix.

## Notes

- The `stripe` package ships its own types — do **not** add `@types/stripe` to devDependencies.
- Pin the Stripe `apiVersion` to the exact string the installed SDK defaults to; do not leave it unset.
- The JWT callback fix adds one DB query per session validation. This is intentional and documented in the plan. Revisit with caching only if profiling justifies it.
- Phase 1 does **not** require a Stripe account or Dashboard setup. All env vars can be placeholder strings for unit tests; the throw-on-missing-secret only fires at module load in runtime code paths, not in tests that don't import `lib/stripe/stripe.ts`.
