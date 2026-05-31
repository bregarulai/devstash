# Dashboard Hardening Phase 3 — Empty States & Onboarding Guidance

## Overview

Add empty-state guidance for users with zero data. Currently, a new user with no pinned items, no collections, and no recent activity sees blank sections. This is a missed onboarding opportunity — the dashboard should teach the interface, not disappear.

This phase adds instructive empty states that guide first-time users through their initial actions, turning a blank dashboard into a "get started" experience.

## Goals

- [ ] Add empty-state UI for `CollectionsSession` when user has zero collections
- [ ] Add empty-state UI for `PinnedItems` when user has zero pinned items
- [ ] Add empty-state UI for `RecentItems` when user has zero recent items
- [ ] Add a "get started" hero section for brand-new users (zero items total)
- [ ] Empty states should be actionable (include a CTA or guidance text)
- [ ] Maintain the project's dark-mode-first, restrained aesthetic

## Requirements

### 1. Empty state design principles

All empty states must:

- Use the project's muted color tokens (`text-muted-foreground`, `bg-muted`)
- Include a brief, actionable description (1-2 sentences max)
- Include a primary CTA button when applicable (e.g., "Create your first collection")
- Have no decorative icons or illustrations (per design system: no decorative elements)
- Match the width of the parent container

### 2. Per-section empty states

#### CollectionsSession empty state

When `favoriteCollections.length === 0` and `recentCollections.length === 0`:

```
Heading: "No collections yet"
Body: "Collections organize your items by topic. Create one to get started."
CTA: "Create collection" → links to /collections/new
```

#### PinnedItems empty state

When `pinnedItems.length === 0`:

```
Heading: "No pinned items"
Body: "Pin your most important snippets, prompts, and links to find them instantly."
CTA: "Browse items" → links to /items
```

#### RecentItems empty state

When `recentItems.length === 0`:

```
Heading: "No recent items"
Body: "Items you view or edit will appear here for quick access."
CTA: (none — this is informational, no action needed)
```

### 3. "Get started" hero for brand-new users

When the user has **zero items total** (no items, no collections), show a compact hero section at the top of the dashboard (above StatsCards) that guides them through their first 3 actions:

```
Heading: "Welcome to DevStash"
Body: "Your knowledge hub is empty. Start by collecting your first item."

Steps (numbered, horizontal layout):
1. "Collect" — Save a snippet, prompt, or link
2. "Organize" — Group items into collections
3. "Search" — Find anything instantly

CTA: "Save your first item" → links to /collect
```

This hero should only show once. After the user creates their first item, it should disappear permanently.

### 4. Implementation approach

**Option A (Recommended)**: Add empty-state logic directly in `app/dashboard/page.tsx` as conditional renders passed to each section component. Each section component receives an `isEmpty` prop and renders its own empty state.

**Option B**: Create a `<EmptyState />` shared component at `components/ui/EmptyState.tsx` that accepts `title`, `description`, and `cta` props. Each section uses this component when empty.

**Option C**: Add the "get started" hero as a separate client component at `components/dashboard/GetStartedHero.tsx` that checks `user.totalItemCount` and renders conditionally.

Recommend **Option B + C** — reusable `EmptyState` component + dedicated hero component.

## Component Changes

### New files

- `components/ui/EmptyState.tsx` — Shared empty-state component
- `components/dashboard/GetStartedHero.tsx` — "Get started" hero for new users

### Modified files

- `app/dashboard/page.tsx` — Add `isEmpty` checks, pass to sections, render hero
- `components/dashboard/collectionSession/CollectionsSession.tsx` — Accept `isEmpty` prop
- `components/dashboard/pinnedItems/PinnedItems.tsx` — Accept `isEmpty` prop
- `components/dashboard/recentItems/RecentItems.tsx` — Accept `isEmpty` prop

## References

- `app/dashboard/page.tsx`
- `context/screenshots/dashboard-ui-main.png`
- `app/globals.css` (design tokens)
- `context/coding-standards.md`
- `context/project-overview.md`
- `context/features/dashboard-phase-3-spec.md`
- `context/features/dashboard-items-spec.md`
- `context/features/dashboard-collections-spec.md`

## Severity

**P1** — Major. New users see a blank dashboard and have no guidance on what to do next. High abandonment risk at step 1.
