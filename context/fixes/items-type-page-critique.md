# Fix: Items Type Page — Design Critique Remediation

**Source**: `/impeccable critique app/items/[type]/page.tsx`
**Score**: 23/40 (Acceptable)
**Date**: 2026-06-20

---

## P1 — ItemCard: Remove banned side-stripe border

**File**: `components/items/itemCard/ItemCard.tsx:51`

**Problem**: `border-l-[3px]` with a dynamic item-type color is a banned anti-pattern. The design system states: "Side-stripe borders. `border-left` or `border-right` greater than 1px as a colored accent on cards, list items, callouts, or alerts. Never intentional."

**Fix**: Replace the 3px left border with a 1px full border using the item-type color, or use a subtle background tint on the card. The type icon already communicates the type color; the border is redundant visual noise.

**Approach**:
- Remove `border-l-[3px]` and `borderLeftColor` from the outer div
- Add a subtle `border` (1px) using the item-type color at low opacity, OR
- Add a faint background tint to the card header area using the item-type color
- Keep the type icon + color as the primary chromatic identifier

---

## P1 — ItemCard: Remove banned shadow on hover

**File**: `components/items/itemCard/ItemCard.tsx:51`

**Problem**: `hover:shadow-md` violates the no-shadow rule. The design system states: "Surfaces are flat. Elevation comes from background tone shifts and ring borders only. Never add a shadow to a card, button, or container." The Card component already has `ring-1 ring-foreground/10` for separation.

**Fix**: Remove `hover:shadow-md`. Replace with a subtle background tone shift on hover (e.g., `hover:bg-accent/50` or `hover:bg-muted/50`), which is the pattern the rest of the system uses.

---

## P2 — Empty state: Add CTA and guidance

**File**: `components/items/itemsListContent/ItemsListContent.tsx:87-98`

**Problem**: Empty state shows "No items yet" with a generic file icon and "You haven't added any {type} items yet." No call-to-action, no guidance on what {type} items are for.

**Fix**: 
- Add a one-line description of what {type} items are (e.g., "Snippets are reusable code blocks you can search and copy.")
- Add a prominent "Add your first {type}" button that triggers the `ItemCreateDialog`
- Use the item-type color for the CTA button to reinforce the type identity

---

## P2 — Error banner: Add retry mechanism

**File**: `components/items/itemsListContent/ItemsListContent.tsx:58-63`

**Problem**: Error banner shows "Failed to load items. Please try again." with no retry button. Users must manually refresh the page.

**Fix**: 
- Add a "Retry" button that calls `router.refresh()` to re-fetch server component data
- Add `role="alert"` or wrap in an `aria-live` region for screen reader announcement
- Consider differentiating between network errors and permission errors if feasible

---

## P3 — Type name capitalization: Use title case

**File**: `components/items/itemsListContent/ItemsListContent.tsx:76-77`

**Problem**: `charAt(0).toUpperCase() + slice(1)` only capitalizes the first letter. Fragile for multi-word type names.

**Fix**: Use a title-case utility or confirm type names are always single words. Low priority — current types are all single words so no visible bug today.

---

## Implementation Order

1. Fix P1 violations in `ItemCard.tsx` (stripe + shadow)
2. Fix P2 empty state in `ItemsListContent.tsx`
3. Fix P2 error banner in `ItemsListContent.tsx`
4. Fix P3 capitalization in `ItemsListContent.tsx`
5. Run `/impeccable polish` to verify

## Verification

- `npm run lint` passes
- `npm run build` passes
- Visual inspection: no shadows on cards, no side-stripe borders
- Empty state shows CTA button
- Error state shows retry button
