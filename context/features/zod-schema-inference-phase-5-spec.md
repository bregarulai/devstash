# Zod Schema Inference from Prisma — Phase 5

**Target**: Update server actions, components, and props to use `z.infer` types
**Phase**: 5 of 5
**Status**: Draft
**Created**: 2026-06-05
**Priority**: P3

## Overview

Update all server actions, server components, and UI components to consume `z.infer` types from `types/db.ts` instead of manual interfaces. This is the final migration step — cascading changes across the entire codebase.

---

## 5.1: Update Server Actions

### `actions/auth.ts`

1. Import types from `@/types/db`:

```ts
import type { RegisterFormData } from '@/types/db';
```

2. Update function parameter types to use imported types
3. Remove any local type definitions

### `actions/sign-in.ts`

1. Import `SignInFormData` from `@/types/db`
2. Update function parameter types

### `actions/forgot-password.ts`

1. Import schema from `@/types/db` (already has inline schema)
2. Remove inline schema definition
3. Update function parameter types

### `actions/reset-password.ts`

1. Import schema from `@/types/db` (already has inline schema)
2. Remove inline schema definition
3. Update function parameter types

### `actions/profile.ts`

1. Check for `RetryProfileResult` type — replace with `z.infer` if applicable
2. Update return types to use `z.infer` types from `@/types/db`

---

## 5.2: Update Server Components

### `app/dashboard/page.tsx`

Current pattern (lines 61-66):

```ts
type DashboardData = {
  pinnedItems: Awaited<ReturnType<typeof getPinnedItems>>;
  // ... more Awaited<ReturnType<>> patterns
};
```

Action:
1. Replace `Awaited<ReturnType<>>` patterns with `z.infer` types where applicable
2. Import `ItemWithDetails`, `CollectionWithStats` from `@/types/db`
3. Update return types of `getPinnedItems` and other data-fetching functions to use `z.infer` types

### `app/profile/page.tsx`

Current imports:
```ts
import type { SystemItemType, CollectionWithStats } from '@/lib/db/items';
```

Action:
1. Change import to `@/types/db`:
```ts
import type { SystemItemType, CollectionWithStats } from '@/types/db';
```
2. Remove any local type definitions

---

## 5.3: Update Component Props

### `components/dashboard/sidebar/Sidebar.tsx`

Current imports (lines 13-14):
```ts
import type { SystemItemType, CollectionWithStats } from '@/lib/db/items';
```

Action:
1. Change import to `@/types/db`
2. Update prop types to use `z.infer` types

### `components/dashboard/collectionSession/CollectionsSession.tsx`

Current import (line 10):
```ts
import type { CollectionWithStats } from '@/lib/db/collections';
```

Action:
1. Change import to `@/types/db`

### `components/dashboard/dashboardWrapper/DashboardWrapper.tsx`

Current imports (lines 4-5):
```ts
import type { SystemItemType, CollectionWithStats } from '@/lib/db/items';
```

Action:
1. Change import to `@/types/db`

### `components/registerForm/RegisterForm.tsx`

Current imports (lines 17-20):
```ts
import { registerSchema, RegisterFormData } from '@/types/register';
```

Action:
1. Change import to `@/types/db` (if not already done in Phase 2)

### `components/signinForm/SigninForm.tsx`

Current import (line 16):
```ts
import { signInSchema, SignInFormData } from '@/types/signIn';
```

Action:
1. Change import to `@/types/db` (if not already done in Phase 2)

### `components/profile/changePasswordForm/ChangePasswordForm.tsx`

Current import (line 14):
```ts
import { ChangePasswordValues } from '@/types/auth';
```

Action:
1. Change import to `@/types/db` (if not already done in Phase 2)

---

## 5.4: Final Cleanup

1. Grep for `from '@/lib/db/` imports — all should now be `from '@/types/db'`
2. Grep for `interface` in `lib/db/` — should be zero results
3. Grep for `import type {` from `lib/db/` — should be zero results
4. Run `npm run lint` — no new warnings
5. Run `npm run build` — all types resolve correctly

---

## Files Changed

| File | Action |
|------|--------|
| `actions/auth.ts` | **Modify** — import types from `@/types/db` |
| `actions/sign-in.ts` | **Modify** — import types from `@/types/db` |
| `actions/forgot-password.ts` | **Modify** — import schema from `@/types/db` |
| `actions/reset-password.ts` | **Modify** — import schema from `@/types/db` |
| `actions/profile.ts` | **Modify** — update return types |
| `app/dashboard/page.tsx` | **Modify** — replace `Awaited<ReturnType<>>` with `z.infer` |
| `app/profile/page.tsx` | **Modify** — update type imports |
| `components/dashboard/sidebar/Sidebar.tsx` | **Modify** — update type imports |
| `components/dashboard/collectionSession/CollectionsSession.tsx` | **Modify** — update type imports |
| `components/dashboard/dashboardWrapper/DashboardWrapper.tsx` | **Modify** — update type imports |
| All form components | **Modify** — update schema imports (done in Phase 2) |

## Implementation Order

1. Update server actions (Phase 5.1)
2. Update server components (Phase 5.2)
3. Update component props (Phase 5.3)
4. Run `npm run build` after each sub-phase
5. Final cleanup and verification (Phase 5.4)

## Constraints

- Do NOT change component behavior — only type imports and definitions
- Do NOT change prop interfaces beyond type source
- Keep all existing component props and their names
- Keep all existing component functionality

## Verification

After this phase:

- `grep -r "interface" lib/db/` returns zero results
- `grep -r "from '@/lib/db/"` returns zero results for type imports
- All types flow from `@/types/db` via `z.infer`
- `npm run build` succeeds with no type errors
- All auth flows work (register, sign-in, forgot password, reset password)
- All profile routes work (change password, delete account)
- Dashboard and profile pages render correctly
