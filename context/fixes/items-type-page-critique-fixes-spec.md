# Items Type Page Critique Fixes

**Source**: `/impeccable critique app/items/[type]/page.tsx`
**Date**: 2026-06-20
**Score**: 35/40 (Good)
**Scope**: Design system violations, data safety, minor polish

---

## P1 Fixes

### 1. ImageCard: Remove 3px colored left border

**File**: `src/components/items/imageCard/ImageCard.tsx` (line 52)
**Problem**: `border-l-[3px]` with dynamic `borderLeftColor` violates DESIGN.md: "Don't use border-left or border-right greater than 1px as a colored stripe on cards or list items."
**Fix**: Remove `border-l-[3px]` and `borderLeftColor` from the className. Rely on the icon badge for type identification, matching ItemCard's treatment.

### 2. ImageCard: Replace hover:shadow-md with tonal shift

**File**: `src/components/items/imageCard/ImageCard.tsx` (line 52)
**Problem**: `hover:shadow-md` violates DESIGN.md: "Don't add box-shadows to surfaces. Flat design is a deliberate choice." ItemCard correctly uses `hover:bg-accent/50`.
**Fix**: Replace `hover:shadow-md` with `hover:bg-accent/50` to match ItemCard's tonal hover pattern.

---

## P2 Fixes

### 3. Replace hardcoded text-green-500 with success token

**Files**: `src/components/items/itemCard/ItemCard.tsx` (line 117), `src/components/items/imageCard/ImageCard.tsx` (line 97)
**Problem**: `<Check className='text-green-500' />` bypasses the theme system. May not pass WCAG contrast in dark mode.
**Fix**: Replace `text-green-500` with the project's success token (check `app/globals.css` for the correct utility class, likely `text-success` or similar).

### 4. Add unsaved-changes guard in drawer edit mode

**File**: `src/components/items/itemDrawer/DrawerEditContent.tsx`
**Problem**: No `beforeunload` handler or navigation blocker. User edits title, clicks sidebar link, changes silently lost.
**Fix**: Import `useBlocker` from `next/navigation`. Block navigation when `isEditing && hasChanges`. Show a confirmation dialog or browser-native `beforeunload` prompt.

---

## P3 Fixes

### 5. Sidebar uppercase tracked labels

**File**: `src/components/dashboard/sidebar/Sidebar.tsx` (lines 57, 73)
**Problem**: "Navigation" and "Types" headings use `uppercase tracking-wider` — close to the banned eyebrow pattern.
**Fix**: Change to sentence case ("Navigation", "Types") without uppercase tracking. Low priority; accept as sidebar convention if intentional.

---

## Notes

- Drawer architecture: Keep as Sheet (user decision). The `useAutoOpenDrawer` hook is a reasonable workaround.
- No browser injection was performed for this critique (source-file target only).
- Detector scan returned zero issues.
