# Codebase Audit — 2026-06-16

## Summary

| Severity | Count |
|----------|-------|
| Critical | 4 |
| High | 6 |
| Medium | 8 |
| Low | 5 |
| **Total** | **23** |

---

## Critical

### 1. CSRF Token Validation is Security Theater

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

### 2. Password Hash Included in ProfileData Type

**Files:** `lib/db/user/user.ts:30`, `types/db.ts:336`

`loadProfileDataAsync` selects `password: true` from the database and the `profileUserDataSchema` includes `password: z.string().or(z.null())`. While the current `profile/page.tsx` only passes specific fields to client components, the `ProfileData` type carries the hash through the server-component boundary. Any future code that spreads or serializes the full `user` object will leak the hash.

**Fix:** Remove `password` from the Prisma select. Compute `hasPassword: user.password !== null` on the server before returning, and add `hasPassword: boolean` to `ProfileData` instead.

---

### 3. getSystemItemTypesWithCounts Counts ALL Users' Items

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

### 4. Missing `'use client'` Directive

**File:** `components/items/itemCreateDialog/ContentTypeField.tsx`

This component uses `UseFormRegister` and `UseFormSetValue` from `react-hook-form` (client-only APIs) but has no `'use client'` directive. It works only because it's imported by `ItemCreateDialog` (which has `'use client'`), but this is fragile and will break if imported by a server component.

**Fix:** Add `'use client';` at the top of the file.

---

## High

### 5. handleSignIn Doesn't Catch signIn() Errors

**File:** `actions/signIn/SignIn.ts:59-63`

```ts
await signIn('credentials', { email, password });
redirect(shouldRedirect ? '/verify-required' : '/dashboard');
```

`signIn()` throws on invalid credentials. The error is not caught, so the redirect never executes and the user sees a raw 500 error.

**Fix:** Wrap in try-catch and redirect with an error message:
```ts
try {
  await signIn('credentials', { email, password });
} catch {
  redirect('/sign-in?error=Invalid+email+or+password');
}
```

---

### 6. No Rate Limiting on Password Change

**File:** `actions/auth/Auth.ts:177-209`

`handleChangePassword` has no rate limit check. All other auth endpoints (sign-in, register, forgot password, reset password, delete account, resend verification, email verify, GitHub OAuth) are rate-limited.

**Fix:** Add rate limiting using `RATE_LIMIT_CONFIGS` (create a `changePassword` config if needed).

---

### 7. Rate Limiter Fails Open on Redis Outage

**File:** `lib/auth/rateLimit/rateLimit.ts:133-141`

When Upstash Redis is unavailable, `checkRateLimit` returns `success: true`, allowing unlimited requests:

```ts
} catch {
  // Fail open: allow request if Upstash is unavailable
  return { success: true, ... };
}
```

**Fix:** For critical auth endpoints (sign-in, register, password reset), fail closed by returning `success: false` when Redis is unavailable.

---

### 8. Password Reset Leaks User Existence

**File:** `actions/resetPassword/ResetPassword.ts:52-54`

```ts
if (!user) {
  redirect('/reset-password?error=User+not+found');
}
```

This reveals whether an email is registered. The forgot-password flow correctly uses a generic message, but reset-password does not.

**Fix:** Use a generic error like `Reset+link+is+invalid+or+has+expired` for both cases.

---

### 9. Duplicate Account Deletion Logic

**Files:** `actions/auth/Auth.ts:126-175`, `lib/auth/accountDeletion/accountDeletion.ts:6-45`

`handleDeleteAccount` + `deleteAccountByPasswordInternal` in `Auth.ts` duplicates the logic in `deleteAccountByPassword` from `accountDeletion.ts`. Both do password verification, user deletion, and sign-out.

**Fix:** Remove `handleDeleteAccount` and `deleteAccountByPasswordInternal` from `Auth.ts`. Have the API route call `deleteAccountByPassword` from `accountDeletion.ts` directly.

---

### 10. Duplicate Image Extension Lists

**Files:** `lib/fileValidation.ts:15`, `lib/utils/items.ts:3`

```ts
// fileValidation.ts
export const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']

// utils/items.ts
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico']
```

Different values (`.bmp`, `.ico` missing from one). Can cause inconsistent behavior.

**Fix:** Consolidate into a single shared constant in `lib/constants.ts` or `lib/fileValidation.ts`.

---

## Medium

### 11. Inconsistent Rate Limit IP Extraction

**File:** `app/api/auth/verify/route.ts:9`

Uses raw `x-forwarded-for` header:
```ts
const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
```

All other files use `getClientIP()` from `lib/auth/rateLimit/rateLimit.ts` or `headersList.get('x-client-ip')`.

**Fix:** Use `getClientIP(request.headers)` consistently.

---

### 12. Token Included in Error Redirect URL

**File:** `actions/resetPassword/ResetPassword.ts:36`

On validation failure, the raw token is included in the redirect URL:
```ts
redirect(`/reset-password?error=...&token=${encodeURIComponent(formData.get('token') as string)}...`)
```

**Fix:** Remove the token from error redirects. The user can re-request a reset link.

---

### 13. SVG Files Allowed Without Sanitization

**File:** `lib/fileValidation.ts:1`

`IMAGE_TYPES` includes `image/svg+xml`. SVGs can contain embedded JavaScript. If ever rendered inline (e.g., `data:` URL or markdown preview), this is stored XSS.

**Fix:** Either remove `image/svg+xml` from allowed types, or add server-side SVG sanitization before upload.

---

### 14. Download Route Skips Database Ownership Check

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

### 15. Duplicate Collection Transform Logic

**File:** `lib/db/collections/collections.ts`

The mapping logic (computing `itemTypes`, `distinctNames`, `dominantColor`, `contentTypeCounts`) is copy-pasted across `getFavoriteCollections` (lines 70-99), `getRecentCollections` (lines 138-167), and `getAllCollections` (lines 204-233).

**Fix:** Extract a `mapCollectionToStats()` helper function.

---

### 16. Redundant Identity Transform

**File:** `lib/db/items/items.ts:100-119`

`mapItemToDetails` copies every field from the input to a new object with the same type — a no-op identity function.

**Fix:** Remove `mapItemToDetails` and return the Prisma result directly, or simplify to a type assertion.

---

### 17. Sequential DB Queries in Profile Load

**File:** `lib/db/user/user.ts:38-63`

`getItemStats` and `getUserItemTypeBreakdown` are called sequentially in separate try-catch blocks. They could run in parallel.

**Fix:** Use `Promise.all` for both queries.

---

### 18. MobileSideBar "New Collection" Button Has No Handler

**File:** `components/dashboard/mobileSideBar/MobileSideBar.tsx:15-18`

```tsx
<Button size='sm' variant='outline'>
  <FolderDown className='mr-2 h-4 w-4' />
  New Collection
</Button>
```

No `onClick` handler — button does nothing.

**Fix:** Wire to a collection creation dialog or disable until feature is ready.

---

## Low

### 19. Non-Functional SearchBar Component

**File:** `components/dashboard/searchBar/SearchBar.tsx`

Renders an input with no `onChange`, `onSubmit`, or state management. Purely visual.

**Fix:** Implement search functionality or remove the component.

---

### 20. Hardcoded Email Sender Address

**Files:** `actions/auth/Auth.ts:68`, `actions/forgotPassword/ForgotPassword.ts:60`, `actions/resendVerification/ResendVerification.ts:46`

`"DevStash <onboarding@resend.dev>"` is hardcoded in 3 places.

**Fix:** Extract to a constant in `lib/constants.ts` or use an environment variable.

---

### 21. Magic Number Token Expiry

**File:** `lib/auth/verificationToken/verificationToken.ts:12`

`24 * 60 * 60 * 1000` is used without a named constant.

**Fix:** Extract to `const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;` in `lib/constants.ts`.

---

### 22. DashboardWrapper is a Client Component Unnecessarily

**File:** `components/dashboard/dashboardWrapper/DashboardWrapper.tsx:1`

Has `'use client'` but only uses `useState` for sidebar toggle. This prevents server-side rendering of children.

**Fix:** Split into a server component wrapper and a client component for the sidebar toggle state.

---

### 23. `handleResetPassword` User Not Found Error

**File:** `actions/resetPassword/ResetPassword.ts:53`

Returns `User+not+found` which differs from the generic error used elsewhere. While not a direct enumeration vector (the token is verified first), it's inconsistent with the project's email enumeration prevention pattern.

**Fix:** Use the same generic error message as the invalid token case.

---

## What's Working Well

- **bcrypt cost factor 12** — meets OWASP recommendations
- **256-bit token entropy** with SHA-256 hashing before storage
- **Rate limiting on 8 endpoints** via Upstash Redis
- **Zod validation** on all auth inputs
- **Email enumeration prevention** via dummy tokens in forgot-password and resend-verification
- **NextAuth v5** handles OAuth CSRF, PKCE, nonce, and cookie security
- **IDOR protection** on file downloads (key ownership validation)
- **`proxy.ts`** correctly named for Next.js 16 convention
