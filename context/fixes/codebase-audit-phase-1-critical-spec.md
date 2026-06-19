# Codebase Audit — Phase 1: Critical Fixes

## Overview

Fix 4 critical security vulnerabilities identified in the codebase audit.

| Severity | Count |
|----------|-------|
| Critical | 4 |

> **IMPORTANT**: When implementing these fixes, you MUST NOT break any existing functionality or user flow. Always double-check your work by verifying that affected features still work as expected after each change.

> **IMPORTANT**: When implementing these fixes, you MUST NOT break any existing functionality or user flow. Always double-check your work by verifying that affected features still work as expected after each change.

---

## 1. CSRF Token Validation is Security Theater

**File:** `app/api/profile/delete-account/route.ts:34-37`

The CSRF check only verifies the header is **present**, never validates its **value**:

```ts
const csrfToken = (await headers()).get('x-csrf-token');
if (!csrfToken) {
  return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
}
```

Any non-empty string (including `"abc"`) passes this check.

**Fix:** Validate the token against a server-side session or use NextAuth's built-in CSRF protection. Compare the header value against the token stored in the `__Host-next-auth.csrf-token` cookie.

---

## 2. Password Hash Included in ProfileData Type

**Files:** `lib/db/user/user.ts:30`, `types/db.ts:336`

`loadProfileDataAsync` selects `password: true` from the database and the `profileUserDataSchema` includes `password: z.string().or(z.null())`. While the current `profile/page.tsx` only passes specific fields to client components, the `ProfileData` type carries the hash through the server-component boundary. Any future code that spreads or serializes the full `user` object will leak the hash.

**Fix:** Remove `password` from the Prisma select. Compute `hasPassword: user.password !== null` on the server before returning, and add `hasPassword: boolean` to `ProfileData` instead.

---

## 3. getSystemItemTypesWithCounts Counts ALL Users' Items

**File:** `lib/db/items/items.ts:356-361`

The `groupBy` call has `where: {}`, counting items across every user globally:

```ts
const counts = await prisma.item.groupBy({
  by: ['itemTypeId'],
  _count: { id: true },
  where: {},  // ← no userId filter
});
```

This affects sidebar item counts and profile stats displayed to users.

**Fix:** Accept `userId` parameter and add `where: { userId }`.

---

## 4. Missing `'use client'` Directive

**File:** `components/items/itemCreateDialog/ContentTypeField.tsx`

This component uses `UseFormRegister` and `UseFormSetValue` from `react-hook-form` (client-only APIs) but has no `'use client'` directive. It works only because it's imported by `ItemCreateDialog` (which has `'use client'`), but this is fragile and will break if imported by a server component.

**Fix:** Add `'use client';` at the top of the file.
