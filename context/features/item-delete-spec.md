# Item Delete

## Overview

Add delete functionality for items. Triggered from the existing Trash2 button in the item drawer's action bar (currently has no onClick). A shadcn AlertDialog confirms the destructive action. On success, the drawer closes and a sonner toast confirms deletion.

## Requirements

### Trigger

- The existing Delete button (Trash2 icon, `variant='destructive'`) in `DrawerActions.tsx` view mode
- Already renders — just needs an `onClick` handler
- Disabled state while delete is in progress

### Confirmation Dialog

- Use shadcn `AlertDialog` (install via `npx shadcn@latest add alert-dialog`)
- Open on Delete button click
- Title: "Delete item"
- Description: "Are you sure you want to delete \"{itemTitle}\"? This action cannot be undone."
- Cancel button (ghost/outline) closes the dialog
- Continue button (`variant='destructive'`) triggers deletion
- Loading spinner on Continue button while request is in flight
- Prevent double-click by disabling the button during the request

### Toast

- On success: `toast.success('Item deleted')`
- On error: `toast.error('Failed to delete item')` with optional `{ description: error.message }`
- After success: close the drawer via `onClose` callback

### Data Refresh

- Call `router.refresh()` after successful deletion so the item list reflects the change

## Server Action

`deleteItemAction(itemId: string)` in `actions/items.ts`:

- Get session via `auth()` — return `{ success: false, error: 'Unauthorized' }` if no session
- Validate ownership — item must belong to the current user
- Delete the item (Prisma cascade deletes ItemCollection join records automatically)
- Revalidate `/dashboard`
- Return `{ success: true }` or `{ success: false, error: string }`

## DB Layer

Add `deleteItem(itemId: string, userId: string)` to `lib/db/items/items.ts`:

- Verify item belongs to user (select by id + userId)
- Delete with `prisma.item.delete`
- Return deleted item or null if not found

## Zod Validation

No input schema needed — `itemId` is a string parameter, validated by ownership check in the action. The existing `itemSelectSchema` from `types/db.ts` is used for the ownership query.

## Files to Modify

| File | Change |
|------|--------|
| `actions/items.ts` | Add `deleteItemAction` |
| `lib/db/items/items.ts` | Add `deleteItem` function |
| `components/items/itemDrawer/DrawerActions.tsx` | Wire Delete button onClick, add AlertDialog state |
| `components/ui/alert-dialog.tsx` | Install via shadcn CLI |

## Notes

- The Prisma schema has `onDelete: Cascade` on Item → ItemCollection, so deleting an item automatically removes its collection associations
- No file cleanup needed for file/image types in this phase (R2 cleanup can be a follow-up)
- Keep the confirm dialog simple — no "type to confirm" pattern like the account deletion dialog. A single click confirm is sufficient for item deletion
