# Code Decomposition — Phase 5: Page Decomposition

## Overview

Separate data-fetching concerns from rendering in the dashboard page, and extract shared types and constants.

| Priority | Count |
|----------|-------|
| Medium | 1 |

> **IMPORTANT**: When implementing these changes, you MUST NOT break any existing functionality or user flow. Always double-check your work by verifying that affected features still work as expected after each change.

---

## 11. Dashboard Page — Extract Helpers, Types, and Constants

**File:** `app/dashboard/page.tsx`

### 11a. Extract `EMPTY_ITEM_STATS` Constant

Lines 63-68 and 84-89 define identical default values:
```ts
let itemStats = { total: 0, itemsByType: [] };
```

This default appears twice — once in the variable initializer and once in the `.catch()` fallback.

**Change:** Extract a shared constant:
```ts
const EMPTY_ITEM_STATS: ItemStats = { total: 0, itemsByType: [] };
```

Use it in both places: `let itemStats = EMPTY_ITEM_STATS;` and `.catch(() => EMPTY_ITEM_STATS)`.

---

### 11b. Extract `DashboardUser` Type

Line 28 defines an inline type for the user object:
```ts
let user: { id: string; name: string | null; email: string; image: string | null; isPro: boolean } | null = null;
```

This same shape is also manually constructed in `app/items/[type]/page.tsx:41-47`.

**Change:** Define a shared type in `types/db.ts`:
```ts
type DashboardUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  isPro: boolean;
};
```

Use it in both `dashboard/page.tsx` and `items/[type]/page.tsx`.

---

### 11c. Extract `loadDashboardData` Helper

Lines 58-93 contain a self-contained data-loading block that initializes six variables and calls `Promise.all` with individual `.catch()` fallbacks. This mixes data fetching with rendering.

**Change:** Extract an async helper:
```ts
type DashboardData = {
  pinnedItems: ItemWithDetails[];
  recentItems: ItemWithDetails[];
  systemItemTypes: ItemTypeWithCount[];
  favoriteCollections: CollectionWithItemCount[];
  recentCollections: CollectionWithItemCount[];
  itemStats: ItemStats;
};

async function loadDashboardData(userId: string): Promise<DashboardData> {
  const [pinnedItems, recentItems, systemItemTypes, favoriteCollections, recentCollections, itemStats] =
    await Promise.all([
      getPinnedItems(userId).catch(() => []),
      getRecentItems(userId, 5).catch(() => []),
      getSystemItemTypesWithCounts(userId).catch(() => []),
      getFavoriteCollections(userId).catch(() => []),
      getRecentCollections(userId).catch(() => []),
      getItemStats(userId).catch(() => EMPTY_ITEM_STATS),
    ]);

  return { pinnedItems, recentItems, systemItemTypes, favoriteCollections, recentCollections, itemStats };
}
```

Then the page component becomes:
```ts
const data = await loadDashboardData(session.user.id);
```

**Impact:** Page component shrinks from ~93 lines to ~40 lines; data logic is isolated and testable.
