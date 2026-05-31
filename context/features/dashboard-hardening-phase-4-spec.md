# Dashboard Hardening Phase 4 — Code Quality & Power-User Features

## Overview

Address remaining code quality issues and add power-user affordances. This phase fixes the `findFirst` vs `findUnique` correctness issue, standardizes props across sibling components, and adds a command palette for keyboard-driven navigation.

## Goals

- [ ] Fix `prisma.user.findFirst` → `findUnique` correctness issue
- [ ] Standardize props passed to sibling components (`user` prop consistency)
- [ ] Add command palette (`Ctrl+K`) for quick navigation and item creation
- [ ] Add keyboard shortcut hints to key dashboard actions
- [ ] Ensure all interactive elements have keyboard alternatives

## Requirements

### 1. Fix `findFirst` correctness issue

The current code uses `findFirst` to query by ID:

```tsx
const user = await prisma.user.findFirst({
  where: { id: session.user.id },
  // ...
});
```

**Problem**: `findFirst` without a proper index can return any matching row. When querying by a unique field (like `id`), `findUnique` is the correct method.

**Fix**: Replace with `findUnique`:

```tsx
const user = await prisma.user.findUnique({
  where: { id: session.user.id },
  select: { /* ... */ },
});
```

### 2. Standardize props across sibling components

Current prop passing is inconsistent:

```tsx
<StatsCards userId={user.id} />           // receives userId
<CollectionsSession user={user} />         // receives full user
<PinnedItems items={pinnedItems} />        // receives items only
<RecentItems items={recentItems} />        // receives items only
```

**Recommendation**: Keep props minimal and consistent. Each component should receive only what it needs:

- `StatsCards` — `userId` is sufficient (it only needs to query counts)
- `CollectionsSession` — `user` is needed (displays user's name/avatar)
- `PinnedItems` — `items` is sufficient (type info is in each item)
- `RecentItems` — `items` is sufficient

This is already mostly correct. The only change is ensuring `StatsCards` doesn't need `user` (it doesn't — it only queries counts by `userId`).

### 3. Command palette

Add a command palette (`Ctrl+K` / `Cmd+K`) for quick navigation and item creation. This is the single highest-impact power-user feature.

**Features**:
- Navigate to any item type (`/items/snippets`, `/items/prompts`, etc.)
- Create a new item (snippet, prompt, command, note, etc.)
- Create a new collection
- Search recent items (if data is available)
- Toggle dark/light mode
- Go to dashboard, collections, settings

**Implementation approach**:

**Option A (Recommended)**: Use `cmdk` (cmd.sh/k) library — lightweight, accessible, well-maintained.

```bash
npm install cmdk
```

Create at `components/dashboard/CommandPalette.tsx` — a client component that renders a `<Dialog>`-backed command palette.

**Option B**: Build a custom command palette using shadcn's `Dialog` + `Command` components.

```bash
npx shadcn@latest add dialog
npx shadcn@latest add command
```

### 4. Keyboard shortcut hints

Add subtle keyboard shortcut hints to key dashboard actions:

- "New item" button → show `Ctrl+K` hint
- Search input → show `Ctrl+K` hint
- Collection actions → show keyboard alternatives where applicable

Hint styling:
```tsx
<span className="ml-2 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
  Ctrl+K
</span>
```

## Component Changes

### New files

- `components/dashboard/CommandPalette.tsx` — Command palette component
- `components/ui/KeyboardHint.tsx` — Shared keyboard shortcut hint component (optional)

### Modified files

- `app/dashboard/page.tsx` — Integrate command palette trigger, add shortcut hints
- `components/dashboard/statsCards/StatsCards.tsx` — No changes needed
- `app/layout.tsx` — Add global `Ctrl+K` key listener (or handle in CommandPalette)

## Dependencies

- `cmdk` (if Option A is chosen)
- shadcn `Dialog` component (if Option B is chosen, already available)

## References

- `app/dashboard/page.tsx`
- `lib/auth.ts`
- `lib/prisma.ts`
- `app/layout.tsx`
- `context/coding-standards.md`
- `context/project-overview.md`
- `context/features/dashboard-phase-1-spec.md`

## Severity

**P1** (findFirst fix) — Major. Correctness issue: `findFirst` by ID can return wrong row.
**P2** (command palette) — Minor. Power-user feature, not blocking, but high value for target audience.
