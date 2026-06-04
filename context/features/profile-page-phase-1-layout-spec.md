# Profile Page — Phase 1: Layout Restructuring

## Target

`app/profile/ProfilePageClient.tsx`

## Source

Impeccable critique — `context/features/profile-page-improvements-spec.md`

## Issues

### 1. Nested Cards in Usage Overview

**Severity**: P1

**Problem**: The Usage Overview card contains `<Card>` elements inside it for Total Items, Total Collections, Favorites, and Items by Type. Nested cards create visual noise and depth confusion. The design system explicitly states "nested cards are always wrong."

**Fix**: Replace inner cards with a flat grid layout using tonal backgrounds (`bg-muted`) and ring borders (`ring-1`) for stat tiles. Keep the same visual weight but remove the card container.

**Changes**:
- `ProfilePageClient.tsx`: Remove `<Card>` wrappers around stat tiles in the Usage Overview section
- Replace with `div` elements using `rounded-xl bg-muted ring-1 ring-foreground/10` for consistent visual treatment

### 2. Favorites Stat Breaks Grid Rhythm

**Severity**: P2

**Problem**: Favorites is a standalone card with just a number. It's visually equal to the 2-column stat grid above it but occupies full width. This creates unnecessary vertical space and breaks the rhythm.

**Fix**: Move Favorites into the 3-column grid alongside Total Items and Total Collections.

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

### 3. Email Field Wastes 2-Column Grid Space

**Severity**: P3

**Problem**: The Email row uses `grid-cols-1 sm:grid-cols-2` but only displays one field (email). The 2-column layout is wasted space.

**Fix**: Use a single-column layout for the email row.

**Changes**:
- `ProfilePageClient.tsx`: Remove `sm:grid-cols-2` from the email row (line 112), keep `grid-cols-1` or remove the grid entirely and use a single `div` with `space-y-1`

### 4. PRO Badge Uses Wrong Variant

**Severity**: P3

**Problem**: The PRO badge uses `variant='default'` which maps to the secondary style in the design system. It should use the sidebar-primary color to align with the brand's active state treatment.

**Fix**: Use inline styling with the sidebar-primary color token.

**Changes**:
- `ProfilePageClient.tsx`: Replace `variant='default'` with inline styling:
  ```
  <Badge className='bg-sidebar-primary text-sidebar-primary-foreground'>
    PRO
  </Badge>
  ```

### 5. Tighten Vertical Spacing

**Severity**: P3

**Problem**: `space-y-8` on the client root div uses 32px gap. Feels loose for a settings/profile surface.

**Fix**: Change `space-y-8` to `space-y-6` for a tighter, more professional feel.

**Changes**:
- `ProfilePageClient.tsx` line 70: `space-y-8` → `space-y-6`

## Notes

- All changes are in `ProfilePageClient.tsx`. Single-file scope.
- No new components needed.
- No server component changes.
