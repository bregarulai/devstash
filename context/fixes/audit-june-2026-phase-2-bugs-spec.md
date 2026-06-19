# Audit June 2026 — Phase 2: Bugs

## Overview

Fix 5 user-facing bugs identified in the codebase audit. These are functional issues that affect the user experience.

| # | Severity | Issue | File |
|---|----------|-------|------|
| 1 | Medium | "ago ago" display bug | `components/profile/profilePageClient/ProfilePageClient.tsx:122` |
| 7 | Medium | isPro hardcoded to false | `app/items/[type]/page.tsx:47` |
| 14 | Medium | CommandPalette inconsistent ITEM_TYPES | `components/dashboard/CommandPalette/CommandPalette.tsx:29-35` |
| 15 | Low | getRecentCollections hardcodes take: 5 | `lib/db/collections/collections.ts:136` |
| 18 | Medium | ChangePasswordForm misuses startTransition | `components/profile/changePasswordForm/ChangePasswordForm.tsx:33-36` |

> **IMPORTANT**: When implementing these fixes, you MUST NOT break any existing functionality or user flow. Always double-check your work by verifying that affected features still work as expected after each change.

---

## 1. "ago ago" Display Bug

**File:** `components/profile/profilePageClient/ProfilePageClient.tsx:122`

`formatDaysAgo()` already returns strings like `"2 days ago"`, `"Yesterday"`, `"Today"`. The trailing ` ago` creates double text.

```tsx
// Current (broken):
<span className='text-foreground'>{formatDaysAgo(user.createdAt)} ago</span>

// Fixed:
<span className='text-foreground'>{formatDaysAgo(user.createdAt)}</span>
```

**Fix:** Remove the trailing ` ago` from line 122.

---

## 2. isPro Hardcoded to false

**File:** `app/items/[type]/page.tsx:47`

All users see `isPro: false` regardless of their actual subscription status. The PRO badge in the sidebar will never render.

```tsx
// Current:
user={{
  id: session.user.id,
  name: session.user.name ?? null,
  email: session.user.email || '',
  image: session.user.image ?? null,
  isPro: false,  // ← hardcoded
}}

// Fixed:
// Query isPro from the database or use session data if available.
// Option A: Add isPro to the auth() session callback in the auth config.
// Option B: Query it here:
const dbUser = await prisma.user.findUnique({
  where: { id: session.user.id },
  select: { isPro: true },
});
// Then pass isPro: dbUser?.isPro ?? false
```

---

## 3. CommandPalette Inconsistent ITEM_TYPES

**File:** `components/dashboard/CommandPalette/CommandPalette.tsx:29-35`

Local `ITEM_TYPES` array is missing `command` and `note` types, and uses capitalized hrefs (`/items/Snippet`) instead of lowercase canonical form (`/items/snippet`).

```ts
// Current:
const ITEM_TYPES = [
  { name: 'Snippet', icon: Code, href: '/items/Snippet', color: 'text-snippet' },
  { name: 'Prompt', icon: FileText, href: '/items/Prompt', color: 'text-prompt' },
  { name: 'Link', icon: LinkIcon, href: '/items/Link', color: 'text-link' },
  { name: 'File', icon: File, href: '/items/File', color: 'text-file' },
  { name: 'Image', icon: ImageIcon, href: '/items/Image', color: 'text-image' },
];
```

**Fix:** Import `ITEM_TYPES` from `@/lib/constants` and generate palette items from it, or manually add `command` and `note` and fix hrefs to lowercase.

---

## 4. getRecentCollections Hardcodes take: 5

**File:** `lib/db/collections/collections.ts:136`

`take: 5` is hardcoded instead of using `DEFAULT_SAMPLE_COUNT` (which is `5`). `getFavoriteCollections` correctly uses the constant on line 97.

```ts
// Current:
items: {
  take: 5,  // ← hardcoded
  include: { ... }
}

// Fixed:
items: {
  take: DEFAULT_SAMPLE_COUNT,
  include: { ... }
}
```

---

## 5. ChangePasswordForm Misuses startTransition

**File:** `components/profile/changePasswordForm/ChangePasswordForm.tsx:33-36`

`startTransition` wraps only `setGeneralError(null)`. The actual async work runs outside the transition, so `isPending` never reflects the real loading state.

```tsx
// Current (broken):
const onSubmit = async (data: ChangePasswordValues) => {
  startTransition(() => {
    setGeneralError(null);
  });
  try {
    const result = await handleChangePassword(data);
    // ...
  }
};

// Fixed:
const onSubmit = async (data: ChangePasswordValues) => {
  setGeneralError(null);
  startTransition(async () => {
    try {
      const result = await handleChangePassword(data);
      if ('error' in result) {
        setGeneralError(result.error ?? 'An unexpected error occurred');
        return;
      }
      toast.success('Password updated', {
        description: 'Your password has been changed successfully.',
      });
      onSuccess?.();
      reset();
      setGeneralError(null);
    } catch {
      setGeneralError('An unexpected error occurred');
    }
  });
};
```

---

## Implementation Notes

- Item 1 is a one-line fix
- Item 2 requires a DB query or session callback change — test with both pro and non-pro users
- Item 3 requires importing from constants — verify all item types render in the command palette
- Item 4 is a one-line constant swap
- Item 5 requires restructuring the form submission — verify loading state reflects actual async work
