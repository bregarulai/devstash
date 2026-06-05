# Zod Schema Inference from Prisma

## Overview

Introduce Zod schemas as the single source of truth for type inference at API boundaries (server actions, API routes, components) while staying on Prisma. Replace manual TypeScript interfaces with `z.infer` from Zod schemas derived from Prisma models. Eliminate type duplication between the database layer and the rest of the application.

## Problem

- All database-related types are manually defined as TypeScript interfaces in `lib/db/` (`ItemWithDetails`, `CollectionWithStats`, `ProfileData`, `ItemTypeBreakdown`, `SystemItemType`)
- Zod schemas exist only for form validation in `types/` and are duplicated inline in `actions/`
- API routes use manual `if` validation instead of Zod
- Prisma generated types are not used anywhere — manual interfaces duplicate what Prisma already provides
- Two sources of truth (Prisma schema + manual interfaces) creates drift risk

## Goals

1. Zod schemas become the source of truth for all data shapes used across API boundaries
2. Replace every manual interface in `lib/db/` with `z.infer` from a Zod schema
3. Use Zod for validation in all API routes (currently missing)
4. Keep Prisma for queries — no ORM migration
5. Eliminate duplicated Zod schemas (current `registerSchema` in `types/` and `actions/`)

## Approach: Stay on Prisma, Add Zod at Boundaries

Use Zod schemas to describe data shapes at API boundaries. For input validation, define Zod schemas that match Prisma model fields. For output types, use `z.infer` to derive types from those schemas. Components and server actions consume `z.infer` types instead of manual interfaces.

## Requirements

### Phase 1 — Audit and Define Zod Schemas

1. **Define Zod schemas for all Prisma models** in `types/db.ts` (new file):
   - `User` schema (insert + select variants)
   - `Item` schema (insert + select variants)
   - `Collection` schema (insert + select variants)
   - `ItemType` schema
   - `Tag` schema
   - `VerificationToken` schema
   - `Account` schema
   - `Session` schema

2. **Export `z.infer` types** from each schema:
   - `type UserInsert = z.infer<typeof userInsertSchema>`
   - `type UserSelect = z.infer<typeof userSelectSchema>`
   - Same pattern for Item, Collection, ItemType, Tag

3. **Define Zod schemas for computed/DTO types** currently in `lib/db/`:
   - `ItemWithDetails` schema (item + itemType + tags)
   - `CollectionWithStats` schema (collection + itemTypeNames + dominantItemTypeColor + contentTypeCounts)
   - `ProfileData` schema (user + itemStats + itemTypeBreakdown)
   - `ItemTypeBreakdown` schema
   - `SystemItemType` schema (itemType + count)

### Phase 2 — Replace Manual Interfaces

Replace manual interfaces in `lib/db/` with Zod-inferred types:

| File | Replace | With |
|------|---------|------|
| `lib/db/user.ts` | `ItemTypeBreakdown`, `ProfileData` | `z.infer` from Zod schemas in `types/db.ts` |
| `lib/db/items.ts` | `ItemWithDetails`, `SystemItemType` | `z.infer` from Zod schemas in `types/db.ts` |
| `lib/db/collections.ts` | `CollectionWithStats` | `z.infer` from Zod schemas in `types/db.ts` |

### Phase 3 — Fix Zod Duplication

1. Remove inline `registerSchema` from `actions/auth.ts` — import from `types/register.ts`
2. Move all Zod schemas from `types/` to `types/db.ts` for consolidation
3. Delete `types/register.ts`, `types/signIn.ts`, `types/auth.ts` (or merge into `types/db.ts`)

### Phase 4 — Add Zod Validation to API Routes

Add Zod validation to API routes that currently use manual checks:

| File | Current | Add |
|------|---------|-----|
| `app/api/profile/change-password/route.ts` | Manual `if` checks | Zod schema + `.safeParse()` |
| `app/api/profile/delete-account/route.ts` | Manual `if (!session)` | Zod schema for body validation |
| `app/api/auth/verify/route.ts` | Manual token checks | Zod schema for query validation |

### Phase 5 — Update Server Actions and Components

1. Update server actions to use `z.infer` types from `types/db.ts` instead of manual types
2. Update server component return types to use `z.infer` types
3. Update component props to use `z.infer` types from `types/db.ts`
4. Remove all `import type { ... }` from manual interfaces in `lib/db/`

## Files to Create

1. `types/db.ts` — All Zod schemas for Prisma models + computed types + exported `z.infer` types

## Files to Delete

1. `types/register.ts` — merged into `types/db.ts`
2. `types/signIn.ts` — merged into `types/db.ts`
3. `types/auth.ts` — merged into `types/db.ts`

## Files to Modify

1. `lib/db/user.ts` — replace manual interfaces with `z.infer` imports
2. `lib/db/items.ts` — replace manual interfaces with `z.infer` imports
3. `lib/db/collections.ts` — replace manual interfaces with `z.infer` imports
4. `actions/auth.ts` — remove inline schema, import from `types/db.ts`
5. `actions/sign-in.ts` — import schema from `types/db.ts`
6. `actions/forgot-password.ts` — import schema from `types/db.ts`
7. `actions/reset-password.ts` — import schema from `types/db.ts`
8. `app/api/profile/change-password/route.ts` — add Zod validation
9. `app/api/profile/delete-account/route.ts` — add Zod validation
10. `app/api/auth/verify/route.ts` — add Zod validation
11. `app/dashboard/page.tsx` — update return types
12. `app/profile/page.tsx` — update type imports
13. `components/dashboard/sidebar/Sidebar.tsx` — update type imports
14. `components/dashboard/collectionSession/CollectionsSession.tsx` — update type imports
15. `components/dashboard/dashboardWrapper/DashboardWrapper.tsx` — update type imports
16. All form components — update schema imports

## Key Gotchas

- Prisma `z.infer` from generated types is not supported natively — Zod schemas must be defined explicitly to match Prisma models
- Zod schemas for relations (e.g., `ItemWithDetails` with nested `itemType` and `tags`) need `z.object()` with nested schemas, not just `z.infer` on a single model
- `drizzle-zod` inference (`createSelectSchema`) is not available for Prisma — this is the main reason to stay on Prisma rather than migrate
- Zod schemas for Prisma enums (e.g., `ItemType`) should use `z.nativeEnum()` not `z.enum()`
- Prisma `DateTime` fields — use `z.coerce.date()` or `z.string().datetime()` depending on whether you want Date or string at the boundary
- Prisma `Decimal` fields — use `z.coerce.string()` or `z.string()` (Prisma returns strings in most configs)
- Keep Zod schemas close to Prisma schema — when Prisma schema changes, Zod schemas must be updated
- Use `z.ZodType` for complex nested shapes that can't be expressed with standard Zod methods

## Testing

1. Run `npm run lint` — no new warnings
2. Run `npm run build` — all types resolve correctly
3. Test auth flows (register, sign-in, forgot password, reset password) — Zod validation works
4. Test profile routes (change password, delete account) — Zod validation works
5. Test dashboard page — data shapes match component expectations
6. Test profile page — data shapes match component expectations
7. Verify no manual interface references remain in `lib/db/`

## Zod 4 Notes

- Zod 4 uses `result.error.issues` (not `.errors`) for validation error access
- Zod 4 `.safeParse()` returns `ZodError` with `.issues` array
- Use `z.coerce.string()` / `z.coerce.date()` for coercion in Zod 4
- Zod 4 uses `z.nativeEnum()` for Prisma enum types

## References

- Zod docs: https://zod.dev
- Zod coercion: https://zod.dev/?id=coercion
- Zod native enum: https://zod.dev/?id=enums
- Prisma docs: https://prisma.io/docs (Prisma 7 has breaking changes - fetch latest)
- Database standards: `context/coding-standards.md`
