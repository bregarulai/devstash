# Zod Schema Inference Audit Criteria

## Single Source of Truth
- All Zod schemas live in `types/db.ts`?
- No inline schemas in components or actions?

## Exported Types
- Types exported as `z.infer<typeof schema>`?
- No manual interfaces in `lib/db/` (replaced with `z.infer` imports)?

## Insert/Select Variants
- Prisma models have `*InsertSchema` + `*SelectSchema` variants?
- Select schemas use `extend()` for additional fields?

## DateTime Fields
- DateTime fields use `z.coerce.date()`?
- Nullable DateTime uses `z.coerce.date().or(z.null())`?

## Prisma Enums
- Prisma enums use `z.nativeEnum()` (not `z.enum()`)?

## Nullable vs Optional
- Nullable fields use `z.string().or(z.null())` (not `.optional()`)?
- Optional fields use `.optional()` for truly optional (non-null) fields?

## Nested Relations
- Nested relations use `z.object()` with nested schemas?
- Never `z.infer` on a single model for nested data?

## Computed/DTO Types
- Explicit schemas for complex shapes (e.g., `itemWithDetailsSchema`)?

## Re-exports
- `lib/db/` files use `export type { ... }` to re-export from `@/types/db`?

## Type Imports
- Type imports from `@/types/db` (not `lib/db/` or `generated/prisma/`)?

## Zod 4 Compatible
- Uses `result.error.issues` (not `.errors`) for validation error access?

## Component Props
- Component props use standard TypeScript types (not `z.infer`)?

## Server Component Return Types
- Server component return types use `z.infer` types from `@/types/db`?
