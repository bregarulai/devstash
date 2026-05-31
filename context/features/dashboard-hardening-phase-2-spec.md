# Dashboard Hardening Phase 2 — Loading States & Skeleton UI

## Overview

Add loading/skeleton states to the dashboard page. Currently, the page renders nothing until all 5 Prisma queries resolve. For users with slower connections or larger datasets, this creates a perceptible blank period with no feedback.

This phase introduces skeleton placeholders that match the layout of each dashboard section, giving users immediate visual feedback that content is loading.

## Goals

- [ ] Add skeleton loading states for `StatsCards` section
- [ ] Add skeleton loading states for `CollectionsSession` section
- [ ] Add skeleton loading states for `PinnedItems` section
- [ ] Add skeleton loading states for `RecentItems` section
- [ ] Ensure skeletons match the actual layout dimensions (no layout shift on load)
- [ ] Loading states should appear instantly (no spinner delay)

## Requirements

### 1. Skeleton component architecture

Create a shared `<DashboardSkeleton />` component at `components/dashboard/DashboardSkeleton.tsx` that renders the full dashboard layout with skeleton placeholders. Each skeleton block should:

- Match the dimensions of the corresponding real content
- Use the project's muted/foreground color tokens (`bg-muted`, `text-muted-foreground`)
- Have no animation (static placeholders for RSC)
- Follow the flat, no-shadow design system

### 2. Per-section skeleton design

#### StatsCards skeleton

- 4 small rectangular blocks in a row
- Each block ~120px wide, 60px tall
- Uses `bg-muted` fill with `rounded-xl`
- No text labels (skeleton doesn't mimic label positions)

#### CollectionsSession skeleton

- Grid of 6 collection card placeholders
- Each card ~200px wide, 100px tall
- `bg-muted` fill with `rounded-xl`
- Matches the 3-column grid layout

#### PinnedItems skeleton

- 3-4 item card placeholders in a vertical stack
- Each card ~100% width, 72px tall
- `bg-muted` fill with `rounded-xl`
- Matches the actual item card height

#### RecentItems skeleton

- 5-6 item card placeholders in a vertical stack
- Each card ~100% width, 72px tall
- `bg-muted` fill with `rounded-xl`
- Matches the actual item card height

### 3. Integration in `app/dashboard/page.tsx`

Use a conditional render based on a loading state. Since this is a Server Component, the approach is:

**Option A (Recommended)**: Render the skeleton inline when data fetch is in progress. Use a client-side loading state triggered by a `<ClientLoader />` wrapper component that wraps the dashboard content.

**Option B**: Use `Suspense` boundaries around each section. Each section renders its own skeleton while its data loads.

**Option C**: Add a simple client-side `<LoadingProvider />` component that toggles between skeleton and real content during the initial page load.

Recommend **Option A** — simplest integration, no `Suspense` complexity in RSC.

### 4. Skeleton color tokens

Use the existing design system tokens:

```css
/* Skeleton fill */
bg-muted (or bg-card/50 for subtle contrast)

/* Skeleton border (optional, for definition) */
ring-1 ring-foreground/5

/* No animation, no shimmer */
static placeholder only
```

## Component Changes

### New files

- `components/dashboard/DashboardSkeleton.tsx` — Shared skeleton layout
- `components/dashboard/ClientLoader.tsx` — Client-side loading state wrapper (if needed)

### Modified files

- `app/dashboard/page.tsx` — Integrate skeleton rendering
- `components/dashboard/statsCards/StatsCards.tsx` — No changes (already accepts empty data)
- `components/dashboard/collectionSession/CollectionsSession.tsx` — No changes
- `components/dashboard/pinnedItems/PinnedItems.tsx` — No changes
- `components/dashboard/recentItems/RecentItems.tsx` — No changes

## References

- `app/dashboard/page.tsx`
- `components/dashboard/statsCards/StatsCards.tsx`
- `components/dashboard/collectionSession/CollectionsSession.tsx`
- `components/dashboard/pinnedItems/PinnedItems.tsx`
- `components/dashboard/recentItems/RecentItems.tsx`
- `app/globals.css` (design tokens)
- `context/coding-standards.md`
- `context/features/dashboard-phase-3-spec.md`

## Severity

**P0** — Major. Users with slow connections see a blank page with no feedback. This undermines the "speed-first interface" design principle.
