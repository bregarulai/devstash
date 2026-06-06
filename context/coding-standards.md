# Coding Standards

## TypeScript

- Strict mode enabled
- No `any` types - use proper typing or `unknown`
- Define interfaces for all props, API responses, and data models
- Use type inference where obvious, explicit types where helpful

## Zod Schema Inference Types

- **Single source of truth**: All Zod schemas live in `types/db.ts`
- **Exported types**: Use `z.infer<typeof schema>` for all data shapes at API boundaries
- **Insert/select variants**: Every Prisma model has `*InsertSchema` + `*SelectSchema` (use `extend()` for select)
- **DateTime fields**: Use `z.coerce.date()` or `z.coerce.date().or(z.null())`
- **Prisma enums**: Use `z.nativeEnum()` — never `z.enum()`
- **Nullable fields**: Use `z.string().or(z.null())` — never `z.string().optional()` for nullable
- **Optional fields**: Use `.optional()` for truly optional (non-null) fields
- **Nested relations**: Use `z.object()` with nested schemas — never `z.infer` on a single model
- **Computed/DTO types**: Define explicit schemas for complex shapes (e.g., `itemWithDetailsSchema`)
- **No manual interfaces in `lib/db/`**: Replace all interfaces with `z.infer` imports from `@/types/db`
- **Re-export types**: `lib/db/` files should use `export type { ... }` to re-export from `@/types/db`
- **Type imports**: Always import types from `@/types/db` — never from `lib/db/` or `generated/prisma/`
- **Zod 4 compatible**: Use `result.error.issues` (not `.errors`) for validation error access
- **Props**: Use standard TypeScript types for component props — not `z.infer` types
- **Server component return types**: Use `z.infer` types from `@/types/db`

## React

- Functional components only (no class components)
- Use hooks for state and side effects
- Keep components focused - one job per component
- Extract reusable logic into custom hooks

## UI

- **CRITICAL** ALWAYS use shadcn component when possible. DO NOT make UI components

## Next.js

- Server components by default
- Only use `'use client'` when needed (interactivity, hooks, browser APIs)
- Use Server Actions for form submissions and simple mutations
- Use API routes when you need:
  - Webhooks (Stripe, GitHub, etc.)
  - File uploads with progress tracking
  - Long-running operations
  - Specific HTTP status codes or headers
  - Endpoints for future mobile/CLI clients
  - Third-party integrations
- Otherwise, fetch data directly in server components
- Dynamic routes for item/collection pages

## Tailwind CSS v4

**CRITICAL**: We are using Tailwind CSS v4, which uses CSS-based configuration.

- **DO NOT** create `tailwind.config.ts` or `tailwind.config.js` files (those are for v3)
- All theme configuration must be done in CSS using the `@theme` directive in `app/globals.css`
- Use CSS custom properties for colors, spacing, etc.
- No JavaScript-based config allowed

Example v4 configuration:

```css
@import 'tailwindcss';

@theme {
  --color-primary: oklch(50% 0.2 250);
}
```

## File Organization

- Components: `components/[feature]/[componentName]/ComponentName.tsx` — each component lives in its own folder named in PascalCase matching the component name
- Pages: `app/[route]/page.tsx`
- Server Actions: `actions/[feature].ts`
- Types: `types/db.ts` — all Zod schemas and `z.infer` types (single file)
- Lib/Utils: `lib/[utility].ts`

## Naming

- Components: PascalCase (`ItemCard.tsx`)
- Component folders: PascalCase matching the component name (`components/[feature]/itemCard/ItemCard.tsx`)
- Files: Match component name or kebab-case
- Functions: camelCase
- Constants: SCREAMING_SNAKE_CASE
- Types/Interfaces: PascalCase (no prefix)

## Styling

- Tailwind CSS for all styling
- Use shadcn/ui components where applicable
- No inline styles
- Dark mode first, light mode as option
- ALWAYS use design tokens NEVER hardcode tailwind css class for colors, fonts, or spacing unless necessary

## Database

- Use Prisma ORM for all database operations
- ALWAYS use `prisma migrate dev` for schema changes (not `db push`)
- Run `prisma migrate status` before committing to verify migrations are in sync
- Production deployments must run `prisma migrate deploy` before the app starts

## Data Fetching

- Server components fetch directly with Prisma
- Client components use Server Actions
- Validate all inputs with Zod schemas from `@/types/db`
- Use `z.infer` types from `@/types/db` for server component return types
- Use `export type { ... }` to re-export types from `lib/db/`
- Never define new interfaces in `lib/db/` — use `z.infer` schemas in `types/db.ts`

## Error Handling

- Use try/catch in Server Actions
- Return `{ success, data, error }` pattern from actions
- Display user-friendly error messages via toast

## Code Quality

- No commented-out code unless specified
- No unused imports or variables
- Keep functions under 50 lines when possible
- Keep React components short when possible

```

```
