# API Routes Cleanup — Phase 4: Migrate Single Item Fetch to Server Action

## Overview

Replace the `fetch` call to `GET /api/items/[id]` in `useItemDrawer` with a dedicated `getItemAction` server action, then remove the now-unused API route.

| Item | Detail |
|------|--------|
| Complexity | Low |
| Risk | Low |
| Files to modify | 3 |
| Files to delete | 1 |

> **IMPORTANT**: When implementing these fixes, you MUST NOT break any existing functionality or user flow. Always double-check your work by verifying that affected features still work as expected after each change.

---

## Problem

`useItemDrawer` (`hooks/useItemDrawer/useItemDrawer.ts:19`) calls `fetch(/api/items/${itemId})` directly to fetch a single item when opening the item drawer. This is the **only consumer** of `app/api/items/[id]/route.ts` (now that PATCH was removed in Phase 2).

Per the updated coding standards, this API route doesn't qualify for any API route criteria:
- Not a webhook
- No progress tracking needed
- No streaming needed
- No custom HTTP status codes needed
- Not exposed for mobile/CLI clients
- It's a simple data fetch triggered by client-side code

Meanwhile, `lib/db/items/items.ts` already has `ITEM_INCLUDE` and `mapItemResponse` — the API route duplicates this logic with manual field mapping.

---

## Changes

### 1. Add `getItemById` to `lib/db/items/items.ts`

Add a new exported function for fetching a single item by ID:

```typescript
export async function getItemById(
  userId: string,
  itemId: string,
): Promise<ItemWithDetails | null> {
  const item = await prisma.item.findUnique({
    where: { id: itemId, userId },
    include: ITEM_INCLUDE,
  });

  if (!item) return null;

  return mapItemResponse(item);
}
```

Place it after the existing `deleteItem` function (around line 130).

### 2. Add `getItemAction` to `actions/items/Items.ts`

Add a new exported server action following the same pattern as other actions:

```typescript
export async function getItemAction(
  itemId: string,
): Promise<ActionResult<ItemWithDetails>> {
  const authResult = await requireAuth();
  if (authResult.error) return { success: false, data: null, error: authResult.error };
  const { userId } = authResult;

  try {
    const item = await getItemById(userId, itemId);
    if (!item) {
      return { success: false, data: null, error: 'Item not found' };
    }
    return { success: true, data: item, error: null };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch item',
    };
  }
}
```

Add the `getItemById` import from `@/lib/db/items/items` at the top of the file.

### 3. Export `getItemAction` from `actions/index.ts`

Add `getItemAction` to the exports from `./items/Items`:

```typescript
export { updateItemAction, deleteItemAction, createItemAction, toggleItemPinAction, toggleItemFavoriteAction, getItemAction } from './items/Items'
```

### 4. Update `hooks/useItemDrawer/useItemDrawer.ts`

**Import change** (line 1): Add `getItemAction` import:

```typescript
import { getItemAction } from '@/actions';
```

**Replace `openDrawer`** (lines 11-32): Replace the `fetch` call with the server action:

```typescript
const openDrawer = useCallback(async (itemId: string) => {
  setIsOpen(true);
  setItem(null);
  setIsLoading(true);
  setError(null);
  setIsEditing(false);

  try {
    const result = await getItemAction(itemId);
    if (!result.success) throw new Error(result.error ?? 'Failed to fetch item');
    setItem(result.data);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error');
  } finally {
    setIsLoading(false);
  }
}, []);
```

### 5. Delete `app/api/items/[id]/route.ts`

Delete the entire file. It will have no consumers remaining.

---

## Verification

1. Run `npm run lint` — no lint errors
2. Run `npm run build` — build succeeds
3. Run `npm run test:run` — all existing tests pass
4. Manual check: Click an item on the dashboard — drawer opens with correct item data
5. Manual check: Click an item on the /items/[type] page — drawer opens with correct item data
6. Manual check: Verify drawer shows title, content, tags, collections, and action buttons correctly
7. Manual check: Verify edit mode in drawer still works (reads item data correctly)
