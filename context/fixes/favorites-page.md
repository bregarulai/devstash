# Favorites Page Fixes

**Target**: `app/favorites/page.tsx` + `components/favorites/favoritesPageContent/FavoritesPageContent.tsx`
**Score**: 26/40 (Acceptable)
**Date**: 2026-06-20

---

## P1: Remove `font-mono` from list item rows

**File**: `FavoritesPageContent.tsx`
**Lines**: 123, 173

The list containers use `className='space-y-1 font-mono text-sm'`. This renders item titles, collection names, timestamps, and badges in Geist Mono. The design system reserves mono for code blocks, terminal output, and file paths only.

**Fix**: Remove `font-mono` from both list container classes. Keep `space-y-1 text-sm`.

```tsx
// Before (line 123 and 173)
<div className='space-y-1 font-mono text-sm'>

// After
<div className='space-y-1 text-sm'>
```

---

## P2: Remove redundant star icons from list items

**File**: `FavoritesPageContent.tsx`
**Lines**: 142, 192

Every item row shows a filled `Star` icon with `fill-current text-favorite`. Since this is the Favorites page, every item is inherently a favorite. The star is decorative repetition that adds visual noise across the entire list.

**Fix**: Delete the `<Star>` element from both the item row (line 142) and the collection row (line 192).

```tsx
// Before (item row, line 142)
<Star className='size-3.5 shrink-0 fill-current text-favorite' />

// After — remove entirely
```

---

## P2: Add `focus-visible` ring to interactive list items

**File**: `FavoritesPageContent.tsx`
**Lines**: 136-139 (items), 186-189 (collections)

The list items are keyboard-focusable (`role="button"`, `tabIndex={0}`) but have no visible focus ring. The design system uses `focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none` for interactive elements.

**Fix**: Add focus-visible classes to both item and collection row `className` arrays.

```tsx
// Before (item row)
className={cn(
  'flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer',
  'hover:bg-muted/50 transition-colors'
)}

// After
className={cn(
  'flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer',
  'hover:bg-muted/50 transition-colors',
  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
)}
```

Apply the same change to the collection row.

---

## P2: Add retry mechanism to error state

**File**: `FavoritesPageContent.tsx`
**Lines**: 77-82

The error banner says "Please try again" but provides no way to retry. The user must manually refresh the page.

**Fix**: Import `useRouter` (already imported) and add a retry button that calls `router.refresh()`.

```tsx
// Before
{hasError && (
  <div className='flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive'>
    <AlertCircle className='h-4 w-4 shrink-0' />
    <p className='text-sm'>Failed to load favorites. Please try again.</p>
  </div>
)}

// After
{hasError && (
  <div className='flex items-center justify-between gap-2 rounded-lg bg-destructive/10 p-3 text-destructive'>
    <div className='flex items-center gap-2'>
      <AlertCircle className='h-4 w-4 shrink-0' />
      <p className='text-sm'>Failed to load favorites. Please try again.</p>
    </div>
    <button
      onClick={() => router.refresh()}
      className='text-sm font-medium underline underline-offset-2 hover:no-underline'
    >
      Retry
    </button>
  </div>
)}
```

---

## P3: Remove duplicate empty-state text

**File**: `FavoritesPageContent.tsx`
**Lines**: 91-93

When `totalCount === 0`, the header subtitle shows "No favorites yet" AND the Empty component shows "No favorites yet". Two identical strings.

**Fix**: Always show the count in the header subtitle. Remove the conditional.

```tsx
// Before (line 91-93)
<p className='text-sm text-muted-foreground'>
  {totalCount === 0
    ? 'No favorites yet'
    : `${totalCount} ${totalCount === 1 ? 'item' : 'items'}`}
</p>

// After
<p className='text-sm text-muted-foreground'>
  {totalCount} {totalCount === 1 ? 'item' : 'items'}
</p>
```

---

## Verification

After applying all fixes:

1. Run `npm run lint` to check for lint errors
2. Run `npm run build` to verify the page compiles
3. Manual checks:
   - Tab through list items: focus ring should be visible
   - Trigger an error (e.g., disconnect DB): retry button should appear and work
   - Empty state: header shows "0 items", Empty component shows instructional text
   - List items: no star icon, body font (not mono)
