# Audit June 2026 — Phase 3: Cleanup

## Overview

Fix 10 code quality and deduplication issues identified in the codebase audit. These are low-risk improvements that reduce duplication and improve maintainability.

| # | Severity | Issue | File |
|---|----------|-------|------|
| 6 | Medium | PrismaClient singleton missing globalThis pattern | `lib/prisma/prisma.ts` |
| 8 | Medium | Prisma include pattern duplicated 8 times | `lib/db/items/items.ts` |
| 9 | Medium | Duplicate item result mapping | `lib/db/items/items.ts:56-73`, `items.ts:416-433` |
| 10 | Low | Two sequential findUnique queries | `lib/db/user/user.ts:21-37` |
| 11 | Medium | Near-identical getSystemItemTypesWithCounts / getUserItemTypeBreakdown | `lib/db/items/items.ts:317-349`, `lib/db/user/user.ts:83-117` |
| 12 | Low | File size constants duplicated | `lib/constants.ts:26-27`, `lib/fileValidation.ts:18-19` |
| 13 | Medium | Verification email HTML copy-pasted | `actions/auth/Auth.ts:72-108`, `actions/resendVerification/ResendVerification.ts:50-87` |
| 16 | Low | Duplicate EDITABLE_* constants | `components/items/itemDrawer/DrawerEditContent.tsx:14-16` |
| 17 | Medium | Download handler duplicated | `components/items/itemDrawer/ItemDrawer.tsx:69-78`, `components/items/fileListRow/FileListRow.tsx:63-73` |
| 19 | Low | generateStaticParams wastes DB query | `app/items/[type]/page.tsx:12-15` |

> **IMPORTANT**: When implementing these fixes, you MUST NOT break any existing functionality or user flow. Always double-check your work by verifying that affected features still work as expected after each change.

---

## 1. PrismaClient Singleton Missing globalThis Pattern

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

## 2. Prisma include Pattern Duplicated 8 Times

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

## 3. Duplicate Item Result Mapping

**File:** `lib/db/items/items.ts:56-73` and `items.ts:416-433`

Both `createItem` and `updateItem` manually map the Prisma result to `ItemWithDetails` with identical 17-line blocks. Prisma already returns the correct shape via `include`.

**Fix:** Return the Prisma result directly since it already matches `ItemWithDetails`:

```ts
// Instead of manual mapping, just return:
return item;  // Prisma result with include already matches ItemWithDetails
```

If TypeScript complains, add a type assertion: `return item as ItemWithDetails`.

---

## 4. Two Sequential findUnique Queries

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

## 5. getSystemItemTypesWithCounts and getUserItemTypeBreakdown Near-Identical

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

## 6. File Size Constants Duplicated

**Files:** `lib/constants.ts:26-27` and `lib/fileValidation.ts:18-19`

Same values with different names: `IMAGE_MAX_SIZE` vs `MAX_IMAGE_SIZE`, `FILE_MAX_SIZE` vs `MAX_FILE_SIZE`.

**Fix:** Keep constants in `lib/constants.ts` and re-export from `lib/fileValidation.ts`:

```ts
// lib/fileValidation.ts
export { IMAGE_MAX_SIZE as MAX_IMAGE_SIZE, FILE_MAX_SIZE as MAX_FILE_SIZE } from '@/lib/constants';
```

Or consolidate to use one name everywhere.

---

## 7. Verification Email HTML Copy-Pasted

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

## 8. Duplicate EDITABLE_* Constants

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

## 9. Download Handler Duplicated

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

## 10. generateStaticParams Wastes DB Query

**File:** `app/items/[type]/page.tsx:12-15`

`generateStaticParams` calls `getSystemItemTypesWithCounts()` without a userId. The returned counts are discarded — only `type.name` is used.

**Fix:** Use `ITEM_TYPES` from `@/lib/constants` to avoid a DB query entirely:

```ts
import { ITEM_TYPES } from '@/lib/constants';

export async function generateStaticParams() {
  return ITEM_TYPES.map((type) => ({ type: type.value }));
}
```

---

## Implementation Notes

- Items 2-3 are related (both in `lib/db/items/items.ts`) — implement together
- Items 5 is related to item 2 (uses the same function) — implement after item 2
- Items 6 and 8 are simple constant deduplication — quick wins
- Item 7 creates a new file (`lib/email/templates/verification.ts`) — follow file organization conventions
- Item 9 creates a new file (`lib/utils/download.ts`) — follow file organization conventions
- Item 10 is a one-line import change
