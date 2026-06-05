# Zod Schema Inference from Prisma — Phase 3

**Target**: Replace manual interfaces in `lib/db/` with `z.infer` imports
**Phase**: 3 of 5
**Status**: Draft
**Created**: 2026-06-05
**Priority**: P1

## Overview

Replace every manually defined TypeScript interface in `lib/db/` with `z.infer` types imported from `types/db.ts`. This is the pivot point — the old type system starts being replaced.

---

## 3.1: Replace types in `lib/db/user.ts`

### Current manual interfaces

```ts
// lib/db/user.ts:4
export interface ItemTypeBreakdown {
  type: ItemType;
  count: number;
}

// lib/db/user.ts:13
export interface ProfileData {
  user: User;
  itemStats: {
    totalItems: number;
    totalCollections: number;
    totalTags: number;
  };
  itemTypeBreakdown: ItemTypeBreakdown[];
}
```

### Action

1. Remove both interfaces from `lib/db/user.ts`
2. Import `z.infer` types from `types/db.ts`:

```ts
import type { ItemTypeBreakdown, ProfileData } from '@/types/db';
```

3. Update any function signatures that reference the manual interfaces to use the imported types

---

## 3.2: Replace types in `lib/db/items.ts`

### Current manual interfaces

```ts
// lib/db/items.ts:4
export interface ItemWithDetails {
  // ... manual fields
}

// lib/db/items.ts:282
export type SystemItemType = {
  itemType: ItemType;
  count: number;
};
```

### Action

1. Remove both interfaces from `lib/db/items.ts`
2. Import `z.infer` types from `types/db.ts`:

```ts
import type { ItemWithDetails, SystemItemType } from '@/types/db';
```

3. Update any function signatures that reference the manual interfaces to use the imported types

---

## 3.3: Replace types in `lib/db/collections.ts`

### Current manual interface

```ts
// lib/db/collections.ts:31
export interface CollectionWithStats {
  // ... manual fields
}
```

### Action

1. Remove the interface from `lib/db/collections.ts`
2. Import `z.infer` type from `types/db.ts`:

```ts
import type { CollectionWithStats } from '@/types/db';
```

3. Update any function signatures that reference the manual interface to use the imported type

---

## Files Changed

| File | Action |
|------|--------|
| `lib/db/user.ts` | **Modify** — remove interfaces, import from `@/types/db` |
| `lib/db/items.ts` | **Modify** — remove interfaces, import from `@/types/db` |
| `lib/db/collections.ts` | **Modify** — remove interface, import from `@/types/db` |

## Implementation Order

1. Replace `lib/db/user.ts` interfaces
2. Replace `lib/db/items.ts` interfaces
3. Replace `lib/db/collections.ts` interface
4. Run `npm run build` — verify no type errors in `lib/db/` files
5. Check for any remaining manual interface references in the codebase

## Constraints

- Do NOT change function signatures beyond type imports — behavior must stay identical
- All replaced types must match exactly — no field additions or removals
- Verify all downstream consumers (components, server actions, API routes) still compile

## Verification

After this phase, grep for `interface` in `lib/db/` — there should be zero results. All types should come from `@/types/db`.
