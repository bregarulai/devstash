# API Routes Cleanup — Phase 2: Migrate Favorite Toggle to Server Action

## Overview

Replace the direct `fetch` call to `PATCH /api/items/[id]` in `useItemActions` with a dedicated `toggleItemFavoriteAction` server action, then remove the now-unused `PATCH` handler from the API route.

| Item | Detail |
|------|--------|
| Complexity | Medium |
| Risk | Low |
| Files to modify | 4 |
| Files to delete | 1 |

> **IMPORTANT**: When implementing these fixes, you MUST NOT break any existing functionality or user flow. Always double-check your work by verifying that affected features still work as expected after each change.

---

## Problem

`useItemActions` (`hooks/useItemActions/useItemActions.ts:18`) calls `fetch(/api/items/${item.id})` directly for favorite toggling. This bypasses the server action pattern used by every other mutation in the codebase and leaves the PATCH handler in `app/api/items/[id]/route.ts` with only one consumer.

Meanwhile, `toggleItemPinAction` (a sibling operation on the same entity) already follows the server action pattern. Favorite toggling should be consistent.

---

## Changes

### 1. Add `toggleItemFavoriteAction` to `actions/items/Items.ts`

Add a new exported function following the same pattern as `toggleItemPinAction` (lines 75-111):

```typescript
export async function toggleItemFavoriteAction(
  itemId: string,
): Promise<ActionResult<boolean>> {
  const authResult = await requireAuth();
  if (authResult.error) return { success: false, data: null, error: authResult.error };
  const { userId } = authResult;

  const result = itemUpdateSchema.safeParse({ itemId });
  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? 'Invalid input';
    return { success: false, data: null, error: firstError };
  }

  try {
    const item = await prisma.item.findUnique({
      where: { id: itemId, userId },
      select: { isFavorite: true, itemType: { select: { name: true } } },
    });

    if (!item) {
      return { success: false, data: null, error: 'Item not found' };
    }

    const newFavorite = !item.isFavorite;
    await updateItemFields(itemId, userId, { isFavorite: newFavorite });
    revalidatePath('/dashboard');
    revalidatePath('/favorites');
    revalidatePath(`/items/${item.itemType.name.toLowerCase()}`);
    return { success: true, data: newFavorite, error: null };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'Failed to toggle favorite',
    };
  }
}
```

### 2. Export the new action from `actions/index.ts`

Add `toggleItemFavoriteAction` to the exports from `./items/Items`:

```typescript
export { updateItemAction, deleteItemAction, createItemAction, toggleItemPinAction, toggleItemFavoriteAction } from './items/Items'
```

### 3. Update `hooks/useItemActions/useItemActions.ts`

**Import change** (line 3): Add `toggleItemFavoriteAction` to the import:

```typescript
import { toggleItemPinAction, toggleItemFavoriteAction } from '@/actions';
```

**Replace `handleFavorite`** (lines 14-33): Replace the `fetch` call with the server action:

```typescript
const handleFavorite = useCallback(async () => {
  if (!item) return;
  setIsFavoriting(true);
  try {
    const result = await toggleItemFavoriteAction(item.id);
    if (!result.success) throw new Error(result.error ?? 'Failed to update favorite');
    updateItem({ isFavorite: result.data });
    onMutate?.();
    toast.success(
      item.isFavorite ? 'Removed from favorites' : 'Added to favorites',
    );
  } catch {
    toast.error('Failed to update favorite');
  } finally {
    setIsFavoriting(false);
  }
}, [item, updateItem, onMutate]);
```

### 4. Remove `PATCH` from `app/api/items/[id]/route.ts`

- Delete the `PATCH` function (lines 69-100)
- Remove the `updateItemFields` import from `@/lib/db/items/items` (line 6) — only used by PATCH
- Remove the `revalidatePath` import from `next/cache` (line 1) — only used by PATCH
- Remove the `itemUpdateSchema` import from `@/types/db` (line 5) — only used by PATCH

The resulting file should only contain the `GET` function and its required imports.

### 5. Update `app/api/items/[id]/route.test.ts`

The test file only contains PATCH tests. Two options:

- **Option A (preferred)**: Delete the entire file since no PATCH tests are needed
- **Option B**: Replace with GET tests if coverage is desired

---

## Verification

1. Run `npm run lint` — no lint errors
2. Run `npm run build` — build succeeds
3. Run `npm run test:run` — all existing tests pass
4. Manual check: Click the favorite icon on an item in the drawer, verify toast appears and icon updates
5. Manual check: Verify favorites page reflects the change
