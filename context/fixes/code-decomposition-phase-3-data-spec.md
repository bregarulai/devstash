# Code Decomposition — Phase 3: Data Layer

## Overview

Consolidate 6 nearly identical query functions in `lib/db/items/items.ts` into a single generic helper.

| Priority | Count |
|----------|-------|
| High | 1 |

> **IMPORTANT**: When implementing these changes, you MUST NOT break any existing functionality or user flow. Always double-check your work by verifying that affected features still work as expected after each change.

---

## 8. Extract Generic `findItems` Helper

**File:** `lib/db/items/items.ts:85-199`

The following 6 functions share a nearly identical `prisma.item.findMany` structure with only the `where` clause varying:

- `getPinnedItems` (85-100)
- `getRecentItems` (102-118)
- `getAllItems` (120-136)
- `getFavoriteItems` (138-155)
- `getItemsByType` (157-177)
- `searchItems` (179-199)

All use:
```ts
prisma.item.findMany({
  where: { userId, ...filters },
  orderBy: { updatedAt: 'desc' },
  include: ITEM_INCLUDE,
  take: limit,
})
```

**Change:** Extract a generic helper:

```ts
type FindItemsOptions = {
  where?: Prisma.ItemWhereInput;
  limit?: number;
};

async function findItems(userId: string, options: FindItemsOptions = {}) {
  return prisma.item.findMany({
    where: { userId, ...options.where },
    orderBy: { updatedAt: 'desc' },
    include: ITEM_INCLUDE,
    take: options.limit,
  });
}
```

Then rewrite each existing function as a thin wrapper:

```ts
export async function getPinnedItems(userId: string) {
  return findItems(userId, { where: { isPinned: true } });
}

export async function getRecentItems(userId: string, limit = 10) {
  return findItems(userId, { limit });
}
```

**Impact:** ~85 lines removed; adding new query variants becomes trivial. Each existing function remains as a named export for backward compatibility.
