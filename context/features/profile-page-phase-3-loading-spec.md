# Profile Page — Phase 3: Loading States

## Target

`app/profile/page.tsx` + new `app/profile/ProfilePageLoading.tsx`

## Source

Impeccable critique — `context/features/profile-page-improvements-spec.md`

## Issues

### 1. No Loading States

**Severity**: P3

**Problem**: The server component fetches `loadProfileData`, `getSystemItemTypesWithCounts`, `getFavoriteCollections`, and `getRecentCollections` with no loading indicator. If any of these are slow, the user sees a blank page.

**Fix**: Add a loading guard with skeleton placeholders for the avatar, stats grid, and item breakdown.

**Changes**:
- Create `app/profile/ProfilePageLoading.tsx` client component with:
  - Avatar placeholder (`<Skeleton className="size-20 rounded-full" />`)
  - Name/email placeholder rows
  - Stats grid with 3 skeleton tiles
  - Item type breakdown grid with 4 skeleton tiles
- `page.tsx`: Add a loading state check after the `try/catch` block. If data fetch failed or is pending, render `<ProfilePageLoading />` instead of the profile content.
- Since this is a server component, loading state is best handled by returning the skeleton from the server component directly when data is unavailable (same path as the error state)

## Notes

- Requires `<Skeleton>` component from shadcn. Install if not present: `npx shadcn@latest add skeleton`
- Loading state can share the same fallback path as the error state — return `<ProfilePageLoading />` for both.
- No interactive loading; just a static skeleton until data arrives.
