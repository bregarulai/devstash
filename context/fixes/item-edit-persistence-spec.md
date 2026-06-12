# Item Edit Persistence Fix

**Target**: `actions/items.ts`, `app/api/items/[id]/route.ts`
**Phase**: 1 of 1
**Status**: Draft
**Created**: 2026-06-09
**Priority**: P1

## Overview

Item edits made through the drawer do not persist after page refresh. The root cause is missing cache invalidation in the server action and API route that handle item updates. When `router.refresh()` fires after a save, Next.js serves stale cached RSC payload instead of re-executing the server component.

---

## Finding #1 — Add `revalidatePath` to Item Update Server Action

### Problem

The `updateItemAction` server action in `actions/items.ts:28-30` writes to the database via `prisma.item.update()` but never calls `revalidatePath('/dashboard')`. Every other mutation action in the codebase calls `revalidatePath` (e.g., `actions/profile.ts:20`, `lib/auth/accountDeletion/accountDeletion.ts:42`). Without cache invalidation, `router.refresh()` serves stale data.

### Current Code

```typescript
// actions/items.ts:28-30
try {
  const updated = await updateItem(itemId, session.user.id, result.data);
  return { success: true, data: updated, error: null };
}
```

### Requirements

1. **Invalidate dashboard cache**: Call `revalidatePath('/dashboard')` after successful item update.
2. **Only on success**: Do not invalidate cache if the update fails.

### Implementation Details

- Add import at top of `actions/items.ts`:
  ```typescript
  import { revalidatePath } from 'next/cache';
  ```
- Add `revalidatePath('/dashboard')` after the successful `updateItem()` call:
  ```typescript
  try {
    const updated = await updateItem(itemId, session.user.id, result.data);
    revalidatePath('/dashboard');
    return { success: true, data: updated, error: null };
  }
  ```

---

## Finding #2 — Add `revalidatePath` to Item PATCH API Route

### Problem

The PATCH endpoint at `app/api/items/[id]/route.ts:68-112` handles favorite/pin updates via `prisma.item.updateMany()` but does not invalidate the dashboard cache. While favorite/pin changes are smaller mutations, they still affect the dashboard display and should invalidate the cache for consistency.

### Current Code

```typescript
// app/api/items/[id]/route.ts:93-105
const item = await prisma.item.updateMany({
  where: { id, userId: session.user.id },
  data: updateData,
});

if (item.count === 0) {
  return NextResponse.json({ error: 'Item not found' }, { status: 404 });
}

return NextResponse.json({ success: true });
```

### Requirements

1. **Invalidate dashboard cache**: Call `revalidatePath('/dashboard')` after successful PATCH update.
2. **Only on success**: Do not invalidate cache if the update fails.

### Implementation Details

- Add import at top of `app/api/items/[id]/route.ts`:
  ```typescript
  import { revalidatePath } from 'next/cache';
  ```
- Add `revalidatePath('/dashboard')` after the successful `updateMany()` call:
  ```typescript
  const item = await prisma.item.updateMany({
    where: { id, userId: session.user.id },
    data: updateData,
  });

  if (item.count === 0) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  revalidatePath('/dashboard');
  return NextResponse.json({ success: true });
  ```

---

## Files to Modify

| File | Finding |
|------|---------|
| `actions/items.ts` | #1 — add `revalidatePath` after successful update |
| `app/api/items/[id]/route.ts` | #2 — add `revalidatePath` after successful PATCH |
| `actions/items.test.ts` | #1 — add test for `revalidatePath` call |

## Testing Plan

### Unit Tests (`actions/items.test.ts`)

Add mock for `next/cache`:

```typescript
const mockRevalidatePath = vi.fn();
vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));
```

Add test cases:

1. **Test**: `revalidatePath` is called after successful update
   ```typescript
   it('calls revalidatePath after successful update', async () => {
     mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
     mockUpdateItem.mockResolvedValue({ id: 'item-1', title: 'Updated' });
     
     await updateItemAction('item-1', { title: 'Updated' });
     
     expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard');
   });
   ```

2. **Test**: `revalidatePath` is NOT called on update failure
   ```typescript
   it('does not call revalidatePath on update failure', async () => {
     mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
     mockUpdateItem.mockRejectedValue(new Error('DB error'));
     
     await updateItemAction('item-1', { title: 'Title' });
     
     expect(mockRevalidatePath).not.toHaveBeenCalled();
   });
   ```

3. **Test**: `revalidatePath` is NOT called when not authenticated
   ```typescript
   it('does not call revalidatePath when not authenticated', async () => {
     mockAuth.mockResolvedValue(null);
     
     await updateItemAction('item-1', { title: 'Title' });
     
     expect(mockRevalidatePath).not.toHaveBeenCalled();
   });
   ```

### Verification Checklist

- [ ] `npm run test:run` — all tests pass
- [ ] `npm run lint` — no lint errors
- [ ] `npm run build` — build succeeds
- [ ] Manual test: Edit an item on dashboard, save, refresh page — changes persist
- [ ] Manual test: Toggle favorite/pin, save, refresh page — changes persist
- [ ] Manual test: Edit reflected in all places item is displayed (drawer, pinned list, recent list)

## References

- `actions/items.ts` — Item update server action
- `app/api/items/[id]/route.ts` — Item PATCH API route
- `actions/items.test.ts` — Existing test file for items actions
- `components/items/itemDrawer/ItemDrawer.tsx` — Drawer save handler (line 44-66)
- `hooks/useItemDrawer/useItemDrawer.ts` — Drawer local state management
- `context/coding-standards.md` — Coding standards
- `context/project-overview.md` — Project overview

## Severity

**P1** — High. Users expect edits to persist after save. This is a core data integrity issue that affects user trust and usability.
