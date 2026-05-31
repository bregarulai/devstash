# Dashboard Hardening Phase 1 — Error Handling & Reliability

## Overview

Add error boundaries, fallback UI, and retry paths to the dashboard page. Currently, if any Prisma query throws (connection failure, permission error, etc.), the entire RSC page crashes with no recovery. The user sees a white screen or server error.

This phase also fixes the redundant `prisma.user.findFirst` query, which should be `findUnique` and can be replaced with `session.user` data in most cases.

## Goals

- [ ] Wrap dashboard data fetch in `try/catch` with graceful fallback UI
- [ ] Replace `prisma.user.findFirst` with `prisma.user.findUnique` or use `session.user` directly
- [ ] Add null-safe defaults for all data fetch results (empty arrays instead of crashes)
- [ ] Ensure the dashboard renders a usable state even when Prisma queries fail
- [ ] No white-screen crashes under any database failure scenario

## Requirements

### 1. Error boundary for data fetch

Add a `try/catch` around the `Promise.all` data fetch block in `app/dashboard/page.tsx`. On failure:

- Render a fallback UI with a clear message: "Unable to load dashboard. Please try again."
- Include a "Retry" button that re-triggers the data fetch
- Log the error to the console (or error tracking service when available)

```tsx
// Example structure (not final code)
try {
  const [pinnedItems, recentItems, ...] = await Promise.all([...]);
  // render dashboard
} catch (error) {
  console.error('Dashboard fetch failed:', error);
  return <DashboardErrorFallback onRetry={() => router.refresh()} />;
}
```

### 2. Fix redundant user query

The current code queries `prisma.user.findFirst` after `auth()` already returned user info:

```tsx
// Current (problematic)
const user = await prisma.user.findFirst({
  where: { id: session.user.id },
  // ...
});
```

Options (pick the best based on what `session.user` already provides):

**Option A**: If `session.user` contains `id`, `name`, `email`, `image`, skip the Prisma query entirely and pass `session.user` to components. Only query Prisma when `isPro` or other DB-only fields are needed.

**Option B**: Keep the Prisma query but change `findFirst` to `findUnique` (correctness fix). `findFirst` without a proper index can return any matching row.

**Option C**: Query Prisma only for fields not in `session.user` (e.g., `isPro`), and merge with `session.user` data.

Recommend **Option C** — minimal DB query, maximal reuse of session data.

### 3. Null-safe defaults

Ensure all data fetch results have safe defaults:

- `pinnedItems` defaults to `[]` if query fails
- `recentItems` defaults to `[]` if query fails
- `systemItemTypes` defaults to `[]` if query fails
- `favoriteCollections` defaults to `[]` if query fails
- `recentCollections` defaults to `[]` if query fails

Components should handle empty arrays gracefully (no crashes on `.map([])`).

### 4. Consistent error styling

Both error fallback paths ("Not signed in" and "No user found") should use consistent classes:

```
- Use `bg-background` consistently (currently one uses `min-h-screen`, the other uses `bg-background`)
- Use `text-muted-foreground` consistently for secondary messages
- Match the project's dark-mode-first aesthetic
```

## Component Changes

### `app/dashboard/page.tsx`

- Add `try/catch` around `Promise.all`
- Fix user query (`findUnique` or session reuse)
- Add consistent error fallback UI
- Add `router.refresh()` import for retry functionality

### `components/dashboard/` (existing components)

- No changes required — components already accept `items={[]}` as valid input
- Verify each component handles empty arrays without visual glitches

## References

- `app/dashboard/page.tsx`
- `lib/auth.ts`
- `lib/prisma.ts`
- `context/features/dashboard-phase-1-spec.md`
- `context/features/dashboard-phase-3-spec.md`
- `context/features/dashboard-items-spec.md`
- `context/features/dashboard-collections-spec.md`
- `context/coding-standards.md`
- `context/project-overview.md`

## Severity

**P0** — Blocking. Without this, any database failure crashes the entire dashboard with no recovery path.
