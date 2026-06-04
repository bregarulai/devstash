# Profile Page Improvements

## Target

`app/profile/page.tsx` + `app/profile/ProfilePageClient.tsx`

## Source

Impeccable critique score: 22/40 (Acceptable)

## Issues

### 1. Nested Cards in Usage Overview

**Severity**: P1

**File**: `app/profile/ProfilePageClient.tsx` (lines 170-238)

**Problem**: The Usage Overview card contains `<Card>` elements inside it for Total Items, Total Collections, Favorites, and Items by Type. Nested cards create visual noise and depth confusion. The design system explicitly states "nested cards are always wrong."

**Fix**: Replace inner cards with a flat grid layout using tonal backgrounds (`bg-muted`) and ring borders (`ring-1`) for stat tiles. Keep the same visual weight but remove the card container.

**Changes**:
- `ProfilePageClient.tsx`: Remove `<Card>` wrappers around stat tiles in the Usage Overview section
- Replace with `div` elements using `rounded-xl bg-muted ring-1 ring-foreground/10` for consistent visual treatment
- Ensure the Favorites stat moves into the 2-column grid (see Issue 4)

---

### 2. No Loading States

**Severity**: P3

**File**: `app/profile/page.tsx` (lines 38-49)

**Problem**: The server component fetches `loadProfileData`, `getSystemItemTypesWithCounts`, `getFavoriteCollections`, and `getRecentCollections` with no loading indicator. If any of these are slow, the user sees a blank page.

**Fix**: Add a loading guard with skeleton placeholders for the avatar, stats grid, and item breakdown.

**Changes**:
- `app/profile/page.tsx`: Add a loading state check after the `try/catch` block. If `profileData` is null or data fetch failed, return a loading skeleton before rendering.
- Create `ProfilePageLoading.tsx` skeleton component with:
  - Avatar placeholder (`<Skeleton className="size-20 rounded-full" />`)
  - Name/email placeholder rows
  - Stats grid with 3 skeleton tiles
  - Item type breakdown grid with 4 skeleton tiles
- Pass a `loading` prop to `ProfilePageClient` or render conditionally

---

### 3. Vague Error Message

**Severity**: P4

**File**: `app/profile/page.tsx` (line 28)

**Problem**: `"Unable to load profile. Please try again."` is vague with no recovery path. Users don't know what failed or what to do.

**Fix**: Distinguish between "account not found" (404-style) and "temporary failure" (retry button). Use plain language.

**Changes**:
- `app/profile/page.tsx`: Refactor the `!user` error branch (lines 24-32):
  - If `profileData.user` is null → `"We couldn't find your profile. If this persists, contact support."`
  - If the `try/catch` block fails → show a retry button alongside `"Something went wrong loading your profile. [Retry]"`
- The retry action should re-trigger the `Promise.all` fetch (extract into a reusable function or client-side retry)

---

### 4. Favorites Stat Breaks Grid Rhythm

**Severity**: P2

**File**: `app/profile/ProfilePageClient.tsx` (lines 198-209)

**Problem**: Favorites is a standalone card with just a number. It's visually equal to the 2-column stat grid above it but occupies full width. This creates unnecessary vertical space and breaks the rhythm.

**Fix**: Move Favorites into the 2-column grid alongside Total Items and Total Collections. Make it a 3rd column on larger screens, or a full-width row if it warrants emphasis.

**Changes**:
- `ProfilePageClient.tsx`: Replace the standalone Favorites card with a 3-column grid:
  ```
  <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
    {/* Total Items */}
    {/* Total Collections */}
    {/* Favorites */}
  </div>
  ```
- Use the same stat tile format (tonal background, ring border, no Card wrapper)
- Keep the existing label + large number pattern

---

### 5. Email Field Wastes 2-Column Grid Space

**Severity**: P3

**File**: `app/profile/ProfilePageClient.tsx` (lines 112-120)

**Problem**: The Email row uses `grid-cols-1 sm:grid-cols-2` but only displays one field (email). The 2-column layout is wasted space.

**Fix**: Use a single-column layout for the email row. If a second field is needed in the future (e.g., username), the grid can be expanded.

**Changes**:
- `ProfilePageClient.tsx`: Remove `sm:grid-cols-2` from the email row (line 112), keep `grid-cols-1` or remove the grid entirely and use a single `div` with `space-y-1`

---

### 6. PRO Badge Uses Wrong Variant

**Severity**: P3

**File**: `app/profile/ProfilePageClient.tsx` (lines 103-107)

**Problem**: The PRO badge uses `variant='default'` which maps to the secondary style in the design system. It should use the sidebar-primary color to align with the brand's active state treatment.

**Fix**: Create a `pro` badge variant or use inline styling with the sidebar-primary color token.

**Changes**:
- `ProfilePageClient.tsx`: Replace `variant='default'` with inline styling:
  ```
  <Badge className='bg-sidebar-primary text-sidebar-primary-foreground'>
    PRO
  </Badge>
  ```
- Or add a `pro` variant to the Badge component if Pro status is used elsewhere

---

## Minor Observations (No Action Required)

- `hasPassword` check on line 51 uses `!== null` — consider `!= null` for loose check against both null and undefined.
- `space-y-8` on the client root div (line 70) uses 32px gap. Consider `space-y-6` for a tighter, more professional feel.
- The `bg-[color:${type.color}15]` inline style on item type icon backgrounds is functional but not accessible via CSS variable. Screen readers won't get the color context.

## Questions to Consider

- Should the profile page include a bio/about section? Currently there's nowhere for the user to describe themselves.
- Is the item type breakdown meant to be interactive (click to filter)? If so, it needs link affordances.
- Should "Member Since" use a relative format ("Joined 3 months ago") instead of the full date?
