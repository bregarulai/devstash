# Data Fetching Audit Criteria

## Server Components
- Server components fetch directly with Prisma?
- Server component return types use `z.infer` types from `@/types/db`?

## Client Components
- Client components use Server Actions?
- No direct Prisma calls in client components?

## Validation
- Inputs validated with Zod schemas from `@/types/db`?

## Type Re-exports
- `export type { ... }` used to re-export types from `lib/db/`?
- Never define new interfaces in `lib/db/` — use `z.infer` schemas in `types/db.ts`?
