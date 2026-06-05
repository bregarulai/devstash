# Zod Schema Inference from Prisma — Phase 4

**Target**: Add Zod validation to API routes missing it
**Phase**: 4 of 5
**Status**: Draft
**Created**: 2026-06-05
**Priority**: P2

## Overview

Add Zod validation to API routes that currently use manual `if` checks. Use schemas from `types/db.ts` for input validation. This adds runtime behavior — each route gets a proper schema with `.safeParse()`.

---

## 4.1: Add Zod to `app/api/profile/change-password/route.ts`

### Current manual validation

```ts
// Lines 22-28
if (!currentPassword || !newPassword) { ... }
if (newPassword.length < 8) { ... }
```

### Action

1. Import `changePasswordSchema` from `@/types/db`:

```ts
import { changePasswordSchema } from '@/types/db';
```

2. Replace manual checks with `.safeParse()`:

```ts
const result = changePasswordSchema.safeParse(body);

if (!result.success) {
  return Response.json(
    { error: result.error.errors[0].message },
    { status: 400 }
  );
}

const { currentPassword, newPassword } = result.data;
```

3. Remove the manual `if` checks
4. Use `result.data` instead of destructured `body`

---

## 4.2: Add Zod to `app/api/profile/delete-account/route.ts`

### Current manual validation

```ts
// Lines 8-9
if (!session?.user?.id) { ... }
```

### Action

1. Define a delete account body schema in `types/db.ts`:

```ts
export const deleteAccountSchema = z.object({
  userId: z.string(),
  confirm: z.literal(true),
});

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
```

2. Import and validate in the route:

```ts
import { deleteAccountSchema } from '@/types/db';

const result = deleteAccountSchema.safeParse(body);

if (!result.success) {
  return Response.json(
    { error: result.error.errors[0].message },
    { status: 400 }
  );
}
```

3. Keep the session check — Zod validates the body, not auth state

---

## 4.3: Add Zod to `app/api/auth/verify/route.ts`

### Current manual validation

```ts
// Lines 9-14, 29-34
if (!token) { ... }
if (existingToken.expires < new Date()) { ... }
```

### Action

1. Define a verify token schema in `types/db.ts`:

```ts
export const verifyTokenSchema = z.object({
  token: z.string().min(1),
});

export type VerifyTokenInput = z.infer<typeof verifyTokenSchema>;
```

2. Import and validate in the route:

```ts
import { verifyTokenSchema } from '@/types/db';

const result = verifyTokenSchema.safeParse(body);

if (!result.success) {
  return Response.json(
    { error: result.error.errors[0].message },
    { status: 400 }
  );
}

const { token } = result.data;
```

3. Keep the existing token lookup and expiry check — Zod only validates the input shape

---

## Files Changed

| File | Action |
|------|--------|
| `types/db.ts` | **Modify** — add `deleteAccountSchema`, `verifyTokenSchema` + type exports |
| `app/api/profile/change-password/route.ts` | **Modify** — replace manual checks with `changePasswordSchema.safeParse()` |
| `app/api/profile/delete-account/route.ts` | **Modify** — add `deleteAccountSchema.safeParse()` |
| `app/api/auth/verify/route.ts` | **Modify** — add `verifyTokenSchema.safeParse()` |

## Implementation Order

1. Add new schemas to `types/db.ts`
2. Update `change-password/route.ts`
3. Update `delete-account/route.ts`
4. Update `verify/route.ts`
5. Run `npm run build` — verify no type errors
6. Test each route with valid and invalid inputs

## Constraints

- Keep existing session/auth checks — Zod validates shape, not auth state
- Keep existing token expiry checks — Zod validates input, not business logic
- Error responses should maintain the same format as before (JSON with `error` field)
- Use `result.error.errors[0].message` for the first validation error message
- Do NOT change the route handler logic beyond validation

## Verification

After this phase, all API routes should use Zod `.safeParse()` for input validation. No manual `if (!field)` checks for input validation should remain.
