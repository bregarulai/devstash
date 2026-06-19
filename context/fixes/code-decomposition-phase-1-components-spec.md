# Code Decomposition — Phase 1: Component Decomposition

## Overview

Extract 4 focused sub-components from `Sidebar.tsx` to improve readability and reusability.

| Priority | Count |
|----------|-------|
| High | 4 |

> **IMPORTANT**: When implementing these changes, you MUST NOT break any existing functionality or user flow. Always double-check your work by verifying that affected features still work as expected after each change.

---

## 1. Extract `SidebarItemTypeLink` Component

**File:** `components/dashboard/sidebar/Sidebar.tsx:85-118`

The item type navigation link with expand/collapse logic is a self-contained unit that mixes icon rendering, label display, expand toggle, and PRO badge. Extract into its own component.

**Change:** Create `components/dashboard/sidebar/SidebarItemTypeLink.tsx` containing:
- Icon rendering
- Label text
- Expand/collapse chevron
- PRO badge for `file`/`image` types

Props: `{ type, isExpanded, onToggle }`

---

## 2. Extract `SidebarCollectionLink` Component

**File:** `components/dashboard/sidebar/Sidebar.tsx:144-156, 167-184`

Both "Favorites" and "Recent" collection lists render `<Link>` elements with nearly identical class names and structure. The only differences are the icon and the `ml-6` class on the recent list container.

**Change:** Create `components/dashboard/sidebar/SidebarCollectionLink.tsx` containing:
- `<Link>` with icon, label, and count
- Configurable icon prop (e.g., `<Star>` for favorites, colored dot for recent)
- Optional `className` for the `ml-6` indent

Props: `{ href, label, count, icon, className? }`

---

## 3. Extract `SidebarUserMenu` Component

**File:** `components/dashboard/sidebar/Sidebar.tsx:205-255`

The user avatar section with dropdown menu is a self-contained sub-component mixing avatar display, user menu toggle, and the dropdown menu itself. This is 50 lines of isolated UI.

**Change:** Create `components/dashboard/sidebar/SidebarUserMenu.tsx` containing:
- User avatar image
- User name/email display
- Dropdown menu (Sign out, Profile)

Props: `{ user }`

---

## 4. Deduplicate PRO Badge Blocks

**File:** `components/dashboard/sidebar/Sidebar.tsx:103-112`

Lines 103-107 and 108-112 are identical badge blocks for `file` and `image` types. This duplicated condition can be simplified.

**Change:** Replace the two separate conditionals with:
```tsx
{['file', 'image'].includes(type.name) && (
  <Badge variant="secondary">PRO</Badge>
)}
```

This eliminates ~10 lines of duplicated JSX.
