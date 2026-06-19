# Codebase Audit — Phase 3: Medium Severity Fixes

## Overview

Fix 8 medium-severity issues identified in the codebase audit.

| Severity | Count |
|----------|-------|
| Medium | 8 |

> **IMPORTANT**: When implementing these fixes, you MUST NOT break any existing functionality or user flow. Always double-check your work by verifying that affected features still work as expected after each change.

> **IMPORTANT**: When implementing these fixes, you MUST NOT break any existing functionality or user flow. Always double-check your work by verifying that affected features still work as expected after each change.

---

## 11. Inconsistent Rate Limit IP Extraction

**File:** `app/api/auth/verify/route.ts:9`

Uses raw `x-forwarded-for` header:
```ts
const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
```

All other files use `getClientIP()` from `lib/auth/rateLimit/rateLimit.ts` or `headersList.get('x-client-ip')`.

**Fix:** Use `getClientIP(request.headers)` consistently.

---

## 12. Token Included in Error Redirect URL

**File:** `actions/resetPassword/ResetPassword.ts:36`

On validation failure, the raw token is included in the redirect URL:
```ts
redirect(`/reset-password?error=...&token=${encodeURIComponent(formData.get('token') as string)}...`)
```

**Fix:** Remove the token from error redirects. The user can re-request a reset link.

---

## 13. SVG Files Allowed Without Sanitization

**File:** `lib/fileValidation.ts:1`

`IMAGE_TYPES` includes `image/svg+xml`. SVGs can contain embedded JavaScript. If ever rendered inline (e.g., `data:` URL or markdown preview), this is stored XSS.

**Fix:** Either remove `image/svg+xml` from allowed types, or add server-side SVG sanitization before upload.

---

## 14. Download Route Skips Database Ownership Check

**File:** `app/api/download/route.ts:24-26`

Authorization is R2 key string matching:
```ts
if (!key.includes(`/${session.user.id}/`)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

Doesn't verify against the database that the item actually belongs to the user.

**Fix:** Verify the file key against the database: `await prisma.item.findFirst({ where: { fileUrl: ..., userId: session.user.id } })`.

---

## 15. Duplicate Collection Transform Logic

**File:** `lib/db/collections/collections.ts`

The mapping logic (computing `itemTypes`, `distinctNames`, `dominantColor`, `contentTypeCounts`) is copy-pasted across `getFavoriteCollections` (lines 70-99), `getRecentCollections` (lines 138-167), and `getAllCollections` (lines 204-233).

**Fix:** Extract a `mapCollectionToStats()` helper function.

---

## 16. Redundant Identity Transform

**File:** `lib/db/items/items.ts:100-119`

`mapItemToDetails` copies every field from the input to a new object with the same type — a no-op identity function.

**Fix:** Remove `mapItemToDetails` and return the Prisma result directly, or simplify to a type assertion.

---

## 17. Sequential DB Queries in Profile Load

**File:** `lib/db/user/user.ts:38-63`

`getItemStats` and `getUserItemTypeBreakdown` are called sequentially in separate try-catch blocks. They could run in parallel.

**Fix:** Use `Promise.all` for both queries.

---

## 18. MobileSideBar "New Collection" Button Has No Handler

**File:** `components/dashboard/mobileSideBar/MobileSideBar.tsx:15-18`

```tsx
<Button size='sm' variant='outline'>
  <FolderDown className='mr-2 h-4 w-4' />
  New Collection
</Button>
```

No `onClick` handler — button does nothing.

**Fix:** Wire to a collection creation dialog or disable until feature is ready.
