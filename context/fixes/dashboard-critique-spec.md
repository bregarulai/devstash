# Dashboard Critique Fix Spec

**Source**: `/impeccable critique app/dashboard/page.tsx`
**Date**: 2026-06-20
**Score**: 21/40 (Acceptable)

---

## Fix 1: Visual Hierarchy & Layout (P1)

### Problem

The dashboard is a uniform `space-y-6` vertical stack. StatsCards, CollectionsSession, PinnedItems, and RecentItems all get equal visual weight. No section breaks, no density variation, no clear "look here first" signal.

### Target Files

- `components/dashboard/dashboardContent/DashboardContent.tsx`
- `components/dashboard/statsCards/StatsCards.tsx`
- `components/dashboard/pinnedItems/PinnedItems.tsx`
- `components/dashboard/recentItems/RecentItems.tsx`

### Spec

#### A. Stats row → dense glanceable strip

Replace the current StatsCards layout (icon + value + label per stat, separated by pipe dividers) with a compact horizontal strip:

- Remove pipe dividers (`div className='h-4 w-px bg-border'`)
- Use `gap-8` or `gap-10` between stat items instead
- Wrap in a subtle background band: `bg-muted/40 rounded-xl px-6 py-4` to visually separate from content below
- Keep the icon + value + label structure but tighten it

#### B. Section separation

Add visual breathing room between major zones:

- After StatsCards: add `mt-2 mb-2` (reduce the uniform `space-y-6` to zone-specific spacing)
- Before PinnedItems and RecentItems sections: add a subtle `border-b border-border/50` or use background tone shift
- CollectionsSession should feel like the primary navigation zone — give it more vertical space above/below

#### C. PinnedItems → card grid, not flex-wrap

Current: `flex flex-wrap gap-3` with `min-[690px]:w-72` per card. This creates an awkward responsive breakpoint.

Change to: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3` for consistent card sizing.

#### D. RecentItems → denser list

Current: Each recent item is a full button with icon, title, description, type badge, and timestamp.

Keep the structure but:
- Reduce vertical padding: `p-4` → `p-3`
- Make the type badge and timestamp sit on the same baseline as the title (currently they're in a separate flex row)

---

## Fix 2: Design System Consistency (P1)

### Problem

PinnedItems and RecentItems use `border border-border` on card wrappers. DESIGN.md specifies cards use `ring-1 ring-foreground/10`. Icon containers set `borderColor` inline.

### Target Files

- `components/dashboard/pinnedItems/PinnedItems.tsx`
- `components/dashboard/recentItems/RecentItems.tsx`

### Spec

#### A. Card wrapper styling

Replace on both PinnedItems and RecentItems button elements:

```
// Before
className='... border border-border ...'

// After
className='... ring-1 ring-foreground/10 ...'
```

#### B. Icon container

Remove `borderColor` from the inline style on the icon wrapper div. Keep only `backgroundColor`:

```tsx
// Before
style={{
  backgroundColor: `${item.itemType.color}15`,
  borderColor: item.itemType.color,
}}

// After
style={{
  backgroundColor: `${item.itemType.color}15`,
}}
```

#### C. Focus indicators

Add `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` to both PinnedItems and RecentItems button elements for accessible focus states.

---

## Fix 3: StatsCards Dividers (P2)

### Problem

Pipe dividers (`h-4 w-px bg-border`) between stat items create a data-table feel.

### Target File

- `components/dashboard/statsCards/StatsCards.tsx`

### Spec

Remove the divider logic entirely. Delete the `{index > 0 && <div className='h-4 w-px bg-border' />}` line. Let `gap-6` (or the increased `gap-8`/`gap-10` from Fix 1A) provide separation.

---

## Fix 4: Keyboard Shortcut Bar (P2)

### Problem

"Quick commands: Ctrl+K" bar sits above content with no context. Noise for first-timers, redundant for power users.

### Target File

- `components/dashboard/dashboardContent/DashboardContent.tsx`

### Spec

Remove the keyboard hint bar from DashboardContent entirely. The command palette (Ctrl+K) is discoverable through its own trigger (typically a search icon or Cmd+K binding in the shell). Advertising it on every dashboard load is unnecessary.

If retention is desired, move it to a subtle position inside the empty state or as a footer hint, not above the fold.

---

## Fix 5: Component Name Mismatch (P3)

### Problem

Folder: `collectionSession/` (singular). Component: `CollectionsSession` (plural).

### Target

- Rename folder `components/dashboard/collectionSession/` → `components/dashboard/collectionsSession/`
- Update import in `DashboardContent.tsx`

---

## Fix 6: Not-Signed-In State Consistency (P3)

### Problem

Not-signed-in state (`app/dashboard/page.tsx:83`) has no background class. User-not-found state has `bg-background`.

### Target File

- `app/dashboard/page.tsx`

### Spec

Add `className="min-h-screen bg-background flex items-center justify-center"` to the not-signed-in div to match the error state styling.

---

## Implementation Order

1. Fix 1 (Visual Hierarchy) — biggest impact
2. Fix 2 (Design System Consistency) — P1
3. Fix 3 (Stats Dividers) — quick win, part of Fix 1
4. Fix 4 (Keyboard Bar) — quick removal
5. Fix 5 (Folder Rename) — mechanical
6. Fix 6 (State Consistency) — one-line

## Verification

After all fixes:
- Run `npm run lint`
- Run `npm run build`
- Visual check: dashboard should have clear section hierarchy, consistent card styling, no pipe dividers

---

## Action Summary

| # | Command | Scope | Fixes |
|---|---------|-------|-------|
| 1 | `/impeccable layout` | Visual hierarchy & layout | Fix 1 (stats strip, section separation, PinnedItems grid, RecentItems density) |
| 2 | `/impeccable polish` | Design system consistency + detail fixes | Fix 2 (ring-1 vs border, focus indicators), Fix 3 (remove pipe dividers) |
| 3 | `/impeccable clarify` | UX copy & discoverability | Fix 4 (remove keyboard bar), Fix 6 (not-signed-in state background) |
| 4 | Manual rename | Folder naming | Fix 5 (collectionSession → collectionsSession) |
