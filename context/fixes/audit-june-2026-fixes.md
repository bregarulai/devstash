# Codebase Audit — June 2026 Fixes

## Overview

Fix 19 real issues identified in the codebase audit (verified against source code, false positives removed).

| Severity | Count |
|----------|-------|
| High | 4 |
| Medium | 8 |
| Low | 3 |

## Split Specs

| Phase | File | Items |
|-------|------|-------|
| Phase 1 — Security | [audit-june-2026-phase-1-security-spec.md](audit-june-2026-phase-1-security-spec.md) | 2, 3, 4, 5 |
| Phase 2 — Bugs | [audit-june-2026-phase-2-bugs-spec.md](audit-june-2026-phase-2-bugs-spec.md) | 1, 7, 14, 15, 18 |
| Phase 3 — Cleanup | [audit-june-2026-phase-3-cleanup-spec.md](audit-june-2026-phase-3-cleanup-spec.md) | 6, 8, 9, 10, 11, 12, 13, 16, 17, 19 |

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

## 2. Missing Rate Limiting on change-password API Route

**File:** `app/api/profile/change-password/route.ts`

The server action `handleChangePassword` in `actions/auth/Auth.ts:138-144` has rate limiting via `RATE_LIMIT_CONFIGS.changePassword`. This API route has none, allowing unlimited password-guess attempts.

**Fix:** Add the same rate limiting pattern used in `handleChangePassword`:
- Import `createRateLimiter`, `checkRateLimit`, `RATE_LIMIT_CONFIGS` from `@/lib/auth/rateLimit/rateLimit`
- Import `headers` from `next/headers`
- Add rate limit check before password validation using `RATE_LIMIT_CONFIGS.changePassword` with key `changepwd:${ip}:${session.user.id}`
- Return 429 with retry-after message on failure

---

## 3. Missing CSRF Protection on change-password API Route

**File:** `app/api/profile/change-password/route.ts`

The delete-account route validates CSRF tokens, but this route does not. An attacker could craft a form targeting this endpoint.

**Fix:** Add CSRF token validation matching the pattern in `app/api/profile/delete-account/route.ts`. Compare the `x-csrf-token` header against the token in the `__Host-next-auth.csrf-token` cookie.

---

## 4. Missing try-catch on change-password API Route

**File:** `app/api/profile/change-password/route.ts:44-48`

`bcrypt.hash()` and `prisma.user.update()` are not wrapped in try-catch. If the DB update fails (constraint violation, connection issue), the user receives a raw 500 error.

```ts
// Current (unprotected):
const hashedPassword = await bcrypt.hash(newPassword, 12);
await prisma.user.update({
  where: { id: session.user.id },
  data: { password: hashedPassword },
});

// Fixed:
try {
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword },
  });
} catch {
  return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
}
```

---

## 5. Email Enumeration on Registration

**File:** `actions/auth/Auth.ts:47`

Returns `"User with this email already exists"`, allowing attackers to enumerate valid email addresses.

```ts
// Current (leaks info):
if (existingUser) {
  redirect("/register?error=User+with+this+email+already+exists");
}

// Fixed (generic message):
if (existingUser) {
  redirect("/register?error=Unable+to+create+account.+Please+try+again.");
}
```

**Fix:** Replace the specific error with a generic message that doesn't reveal whether the email is registered.

---

## 6. PrismaClient Singleton Missing globalThis Pattern

**File:** `lib/prisma/prisma.ts`

Each module reload in dev creates a new `PrismaClient`, potentially exhausting the database connection pool.

```ts
// Current:
export const prisma = new PrismaClient({ adapter });

// Fixed:
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## 7. isPro Hardcoded to false

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

## 8. Prisma include Pattern Duplicated 8 Times

**File:** `lib/db/items/items.ts` (lines 39, 111, 143, 175, 208, 244, 280, 399)

Identical `include` object copy-pasted across `createItem`, `getPinnedItems`, `getRecentItems`, `getAllItems`, `getFavoriteItems`, `getItemsByType`, `searchItems`, and `updateItem`.

**Fix:** Extract a shared constant:

```ts
const ITEM_INCLUDE = {
  itemType: {
    select: { name: true, icon: true, color: true },
  },
  tags: {
    select: { id: true, name: true },
  },
} as const;
```

Replace all 8 occurrences with `include: ITEM_INCLUDE`.

---

## 9. Duplicate Item Result Mapping

**File:** `lib/db/items/items.ts:56-73` and `items.ts:416-433`

Both `createItem` and `updateItem` manually map the Prisma result to `ItemWithDetails` with identical 17-line blocks. Prisma already returns the correct shape via `include`.

**Fix:** Return the Prisma result directly since it already matches `ItemWithDetails`:

```ts
// Instead of manual mapping, just return:
return item;  // Prisma result with include already matches ItemWithDetails
```

If TypeScript complains, add a type assertion: `return item as ItemWithDetails`.

---

## 10. Two Sequential findUnique Queries

**File:** `lib/db/user/user.ts:21-37`

Two separate `prisma.user.findUnique` calls for the same user run in parallel. Could be a single query.

```ts
// Current:
const [user, userWithPassword] = await Promise.all([
  prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, image: true, isPro: true, createdAt: true } }),
  prisma.user.findUnique({ where: { id: userId }, select: { password: true } }),
]);

// Fixed:
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true, name: true, email: true, image: true,
    isPro: true, createdAt: true, password: true,
  },
});
const hasPassword = user?.password !== null;
```

Then derive `hasPassword` from the single result and remove `userWithPassword`.

---

## 11. getSystemItemTypesWithCounts and getUserItemTypeBreakdown Near-Identical

**Files:** `lib/db/items/items.ts:317-349` and `lib/db/user/user.ts:83-117`

Same query logic, different return shape (`itemCount` vs `count`).

**Fix:** Consolidate into one function with a configurable return shape, or have `getUserItemTypeBreakdown` call `getSystemItemTypesWithCounts` and remap:

```ts
export async function getUserItemTypeBreakdown(userId: string): Promise<SidebarItemTypeBreakdown[]> {
  const types = await getSystemItemTypesWithCounts(userId);
  return types.map(({ name, icon, color, itemCount }) => ({
    name, icon, color, count: itemCount,
  }));
}
```

---

## 12. File Size Constants Duplicated

**Files:** `lib/constants.ts:26-27` and `lib/fileValidation.ts:18-19`

Same values with different names: `IMAGE_MAX_SIZE` vs `MAX_IMAGE_SIZE`, `FILE_MAX_SIZE` vs `MAX_FILE_SIZE`.

**Fix:** Keep constants in `lib/constants.ts` and re-export from `lib/fileValidation.ts`:

```ts
// lib/fileValidation.ts
export { IMAGE_MAX_SIZE as MAX_IMAGE_SIZE, FILE_MAX_SIZE as MAX_FILE_SIZE } from '@/lib/constants';
```

Or consolidate to use one name everywhere.

---

## 13. Verification Email HTML Copy-Pasted

**Files:** `actions/auth/Auth.ts:72-108` and `actions/resendVerification/ResendVerification.ts:50-87`

Identical 40-line HTML email template duplicated.

**Fix:** Extract to a shared function:

```ts
// lib/email/templates/verification.ts
export function buildVerificationEmailHtml(verificationLink: string): string {
  return `<!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #fafafa; padding: 40px 20px; margin: 0;">
        <div style="max-width: 480px; margin: 0 auto; background-color: #171717; border-radius: 8px; padding: 32px; border: 1px solid #262626;">
          <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 16px 0; color: #fafafa;">Welcome to DevStash</h1>
          <p style="font-size: 16px; line-height: 1.5; color: #a1a1aa; margin: 0 0 24px 0;">Thanks for signing up! Please verify your email address by clicking the button below.</p>
          <a href="${verificationLink}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-size: 14px; font-weight: 500; text-decoration: none; padding: 12px 24px; border-radius: 6px;">Verify Email Address</a>
          <p style="font-size: 14px; line-height: 1.5; color: #71717a; margin: 24px 0 0 0;">This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #262626; margin: 24px 0;">
          <p style="font-size: 12px; color: #52525b; margin: 0;">If the button doesn't work, copy and paste this link into your browser:<br><a href="${verificationLink}" style="color: #3b82f6; word-break: break-all;">${verificationLink}</a></p>
        </div>
      </body>
    </html>`;
}
```

Also create a text version helper. Both `Auth.ts` and `ResendVerification.ts` import and use this.

---

## 14. CommandPalette Inconsistent ITEM_TYPES

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

## 15. getRecentCollections Hardcodes take: 5

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

## 16. Duplicate EDITABLE_* Constants

**File:** `components/items/itemDrawer/DrawerEditContent.tsx:14-16`

Locally defined constants duplicate `SHOW_CONTENT`, `SHOW_LANGUAGE`, `SHOW_URL` from `lib/constants.ts`.

```ts
// Current (local):
const EDITABLE_CONTENT_TYPES = ['snippet', 'prompt', 'command', 'note'];
const EDITABLE_LANGUAGE_TYPES = ['snippet', 'command'];
const EDITABLE_URL_TYPES = ['link'];

// Fixed (import from constants):
import { SHOW_CONTENT, SHOW_LANGUAGE, SHOW_URL } from '@/lib/constants';
// Then use SHOW_CONTENT, SHOW_LANGUAGE, SHOW_URL directly
```

---

## 17. Download Handler Duplicated

**Files:** `components/items/itemDrawer/ItemDrawer.tsx:69-78` and `components/items/fileListRow/FileListRow.tsx:63-73`

Identical download logic (extractR2Key → URLSearchParams → window.location.href).

**Fix:** Extract to a shared utility:

```ts
// lib/utils/download.ts
import { extractR2Key } from '@/lib/r2';

export function downloadFile(fileUrl: string, fileName?: string | null) {
  const key = extractR2Key(fileUrl);
  if (key) {
    const params = new URLSearchParams({ key });
    if (fileName) params.set('fileName', fileName);
    window.location.href = `/api/download?${params.toString()}`;
  } else {
    window.location.href = fileUrl;
  }
}
```

Both components import and call `downloadFile()`.

---

## 18. ChangePasswordForm Misuses startTransition

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

## 19. generateStaticParams Wastes DB Query

**File:** `app/items/[type]/page.tsx:12-15`

`generateStaticParams` calls `getSystemItemTypesWithCounts()` without a userId. The returned counts are discarded — only `type.name` is used.

**Fix:** Use `ITEM_TYPES` from `@/lib/constants` to avoid a DB query entirely:

```ts
import { ITEM_TYPES } from '@/lib/constants';

export async function generateStaticParams() {
  return ITEM_TYPES.map((type) => ({ type: type.value }));
}
```


