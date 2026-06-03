# Profile Page Redesign

## Overview

Redesign the `/profile` page to match the `/dashboard` layout (header + sidebar), restructure the Account Information Card, and introduce a Usage Statistics session with item type breakdown.

## Requirements

### 1. Layout — match `/dashboard`

- The `/profile` page should use the same **header (top bar)** and **sidebar** as the `/dashboard` page.
- Reuse `DashboardWrapper` component from `components/dashboard/dashboardWrapper/DashboardWrapper.tsx` to wrap the profile page content.
- The wrapper provides:
  - `Sidebar` (desktop + mobile compact)
  - `MobileSideBar` (top bar)
  - `main` content area with `overflow-y-auto p-6 lg:p-8`
- Pass the same props to `DashboardWrapper`: `user`, `systemItemTypes`, `favoriteCollections`, `recentCollections`.
- Fetch `systemItemTypes`, `favoriteCollections`, and `recentCollections` in the profile page (same functions used in `app/dashboard/page.tsx`).

### 2. Page title and description

- **Below the header** (inside the `main` content area) and **above the Account Information Card**, add:
  - A **title** — e.g. "Profile"
  - A **description** — e.g. "Manage your account settings and view your usage statistics."
- Style consistently with the dashboard aesthetic (dark-mode-first, muted foreground for description).

### 3. Account Information Card — restructure

#### Avatar and user info

- Move the **avatar** and **user name** from the standalone header section into the **Account Information Card**.
- Avatar logic remains the same: GitHub image if available, initials fallback via `getInitials()`.
- User name displayed below or beside the avatar within the card.

#### Email field with icon

- The **email** field inside the card should display a **lucide-react Mail icon** next to the email value (similar to how the Member Since section uses a Calendar icon).
- Use `Mail` from `lucide-react`.

#### Remove account type

- **Remove** the "Account Type" row from the Account Information Card entirely.

#### Card footer — action buttons

- The **footer** of the Account Information Card should contain two buttons:
  1. **Change Password** — opens a shadcn `Dialog` component with the change password form (reuse existing `ChangePasswordForm` logic but move it inside the Dialog).
  2. **Delete Account** — opens a shadcn `Dialog` component for account deletion confirmation (reuse existing `DeleteAccountDialog` logic but move it inside the Dialog).
- Both buttons should be in the card's footer area (use `CardFooter`).
- **Change Password** button should only appear if the user has a password set (`hasPassword` / `user.password !== null`).

### 4. Usage Statistics session

#### Session title

- Replace the current "Usage Statistics" session title with something more descriptive — e.g. **"Usage Overview"** or **"Usage Statistics"**.

#### Two side-by-side Cards

- Display **two Cards next to each other** (use `grid grid-cols-1 sm:grid-cols-2 gap-4`):
  1. **Total Items Card** — shows `profileData.itemStats.totalItems` with a corresponding icon (e.g. `Folder` or `FileText` from `lucide-react`).
  2. **Collections Card** — shows `profileData.itemStats.totalCollections` with a corresponding icon (e.g. `Folder` from `lucide-react`).
- Each card should have a title with icon, and the count as a large number below.

#### Item by Type session

- Below the two side-by-side Cards, add another section titled **"Item by Type"** (still within the Usage Statistics context).
- Display each item type as its own **Card** containing:
  - **Icon** — from `profileData.itemTypeBreakdown[].icon` (rendered as a lucide-react component or the stored icon string)
  - **Type name** — e.g. "Snippet", "Prompt", "Note", etc.
  - **Count** — the count for that type
- Style each item type card consistently (small cards, clean layout).

## Component Changes

### `app/profile/page.tsx`

- Replace the current standalone layout with `DashboardWrapper` wrapper.
- Fetch `systemItemTypes`, `favoriteCollections`, `recentCollections` alongside profile data.
- Restructure content in order:
  1. Title + description
  2. Account Information Card (avatar, name, email with Mail icon, member since, footer with Change Password + Delete Account buttons)
  3. Usage Statistics section (two side-by-side cards for total items + collections)
  4. Item by Type section (cards for each item type)
- Move Change Password form into a Dialog (triggered from Account Info card footer).
- Move Delete Account confirmation into a Dialog (triggered from Account Info card footer).

### `components/profile/change-password-form.tsx`

- No structural changes needed — the form logic stays the same.
- The form will be rendered inside a Dialog instead of as a standalone Card.

### `components/profile/delete-account-dialog.tsx`

- Already uses Dialog — no changes needed.
- Will be triggered from the Account Information Card footer instead of a standalone card.

## References

- `app/profile/page.tsx`
- `app/dashboard/page.tsx`
- `app/dashboard/layout.tsx`
- `components/dashboard/dashboardWrapper/DashboardWrapper.tsx`
- `components/profile/change-password-form.tsx`
- `components/profile/delete-account-dialog.tsx`
- `lib/db/user.ts`
- `lib/db/items.ts`
- `lib/db/collections.ts`
- `context/features/profile-spec.md`
- `context/coding-standards.md`
- `context/project-overview.md`

## Severity

**P1** — Important. Improves consistency with dashboard layout and restructures profile page for better UX.
