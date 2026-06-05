# Zod Schema Inference from Prisma — Phase 2

**Target**: Consolidate existing Zod schemas into `types/db.ts`
**Phase**: 2 of 5
**Status**: Draft
**Created**: 2026-06-05
**Priority**: P2

## Overview

Consolidate existing Zod schemas from `types/register.ts`, `types/signIn.ts`, and `types/auth.ts` into the new `types/db.ts`. Delete the old files. This is a refactoring within the types layer — no breaking changes to runtime behavior.

---

## 2.1: Merge `types/register.ts` into `types/db.ts`

### Current file: `types/register.ts`

```ts
import { z } from 'zod';

export const registerSchema = z.object({
  // ... current fields
});

export type RegisterFormData = z.infer<typeof registerSchema>;
```

### Action

1. Add `registerSchema` and `RegisterFormData` to `types/db.ts`
2. Add `registerSchema` to `types/db.ts`:

```ts
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  // ... any other fields from current schema
});

export type RegisterFormData = z.infer<typeof registerSchema>;
```

3. Delete `types/register.ts`
4. Update imports in `components/registerForm/RegisterForm.tsx` — change `import { registerSchema, RegisterFormData } from '@/types/register'` to `import { registerSchema, RegisterFormData } from '@/types/db'`

---

## 2.2: Merge `types/signIn.ts` into `types/db.ts`

### Current file: `types/signIn.ts`

```ts
import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type SignInFormData = z.infer<typeof signInSchema>;
```

### Action

1. Add `signInSchema` and `SignInFormData` to `types/db.ts`
2. Delete `types/signIn.ts`
3. Update imports in `components/signinForm/SigninForm.tsx` — change import to `@/types/db`

---

## 2.3: Merge `types/auth.ts` into `types/db.ts`

### Current file: `types/auth.ts`

```ts
import { z } from 'zod';

export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
```

### Action

1. Add `changePasswordSchema` and `ChangePasswordValues` to `types/db.ts`
2. Delete `types/auth.ts`
3. Update imports in `components/profile/changePasswordForm/ChangePasswordForm.tsx` — change import to `@/types/db`

---

## 2.4: Fix Inline Zod Duplication in `actions/auth.ts`

### Current file: `actions/auth.ts`

Has a duplicate `registerSchema` defined inline (lines 14-22). This is the exact same schema from `types/register.ts`.

### Action

1. Remove the inline `registerSchema` definition from `actions/auth.ts`
2. Import `registerSchema` from `@/types/db` instead:

```ts
import { registerSchema } from '@/types/db';
```

3. Keep the `safeParse()` call in `handleRegister` — just change the import source

---

## Files Changed

| File | Action |
|------|--------|
| `types/db.ts` | **Modified** — add `registerSchema`, `signInSchema`, `changePasswordSchema` + type exports |
| `types/register.ts` | **Delete** |
| `types/signIn.ts` | **Delete** |
| `types/auth.ts` | **Delete** |
| `components/registerForm/RegisterForm.tsx` | **Modify** — update import to `@/types/db` |
| `components/signinForm/SigninForm.tsx` | **Modify** — update import to `@/types/db` |
| `components/profile/changePasswordForm/ChangePasswordForm.tsx` | **Modify** — update import to `@/types/db` |
| `actions/auth.ts` | **Modify** — remove inline schema, import from `@/types/db` |

## Implementation Order

1. Add merged schemas to `types/db.ts`
2. Delete `types/register.ts`, `types/signIn.ts`, `types/auth.ts`
3. Update all imports in components and actions
4. Run `npm run build` — verify no import errors
5. Test auth flows (register, sign-in, change password) — schemas work correctly

## Constraints

- All merged schemas must be identical to originals — no field changes
- Keep `refine()` on `changePasswordSchema` for password confirmation check
- Keep the `message` and `path` options on the refine error
- Verify `actions/auth.ts` no longer has an inline schema definition
