# Zod Schema Inference from Prisma — Phase 1

**Target**: `types/db.ts` (new file)
**Phase**: 1 of 5
**Status**: Draft
**Created**: 2026-06-05
**Priority**: P1

## Overview

Create the foundational Zod schemas for all Prisma models and computed types. This is a pure addition — no breaking changes. All schemas and `z.infer` type exports live in a single `types/db.ts` file.

---

## 1.1: Prisma Model Schemas

Define Zod schemas for each Prisma model. Each model gets two variants: **insert** (required fields only) and **select** (all fields including relations/computed).

### User Schema

```ts
import { z } from 'zod';
import { ItemType } from '@prisma/client'; // or from your generated Prisma enums

export const userInsertSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  emailVerified: z.coerce.date().optional(),
  image: z.string().url().or(z.literal('')).optional(),
  githubId: z.string().or(z.null()),
});

export const userSelectSchema = userInsertSchema.extend({
  id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type UserInsert = z.infer<typeof userInsertSchema>;
export type UserSelect = z.infer<typeof userSelectSchema>;
```

### Item Schema

```ts
export const itemInsertSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  url: z.string().url().or(z.literal('')).optional(),
  type: z.nativeEnum(ItemType),
  tags: z.array(z.string()).optional(),
  collectionId: z.string().optional(),
  userId: z.string(),
});

export const itemSelectSchema = itemInsertSchema.extend({
  id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ItemInsert = z.infer<typeof itemInsertSchema>;
export type ItemSelect = z.infer<typeof itemSelectSchema>;
```

### Collection Schema

```ts
export const collectionInsertSchema = z.object({
  name: z.string().min(1).max(255),
  icon: z.string().optional(),
  color: z.string().optional(),
  userId: z.string(),
  parentId: z.string().or(z.null()).optional(),
});

export const collectionSelectSchema = collectionInsertSchema.extend({
  id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type CollectionInsert = z.infer<typeof collectionInsertSchema>;
export type CollectionSelect = z.infer<typeof collectionSelectSchema>;
```

### ItemType Schema

```ts
export const itemTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  description: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ItemTypeSelect = z.infer<typeof itemTypeSchema>;
```

### Tag Schema

```ts
export const tagSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type TagSelect = z.infer<typeof tagSchema>;
```

### VerificationToken Schema

```ts
export const verificationTokenSchema = z.object({
  id: z.string(),
  identifier: z.string(),
  token: z.string(),
  expires: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type VerificationTokenSelect = z.infer<typeof verificationTokenSchema>;
```

### Account Schema

```ts
export const accountSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.string(),
  provider: z.string(),
  providerAccountId: z.string(),
  refresh_token: z.string().or(z.null()).optional(),
  access_token: z.string().or(z.null()).optional(),
  expires_at: z.number().int().or(z.null()).optional(),
  token_type: z.string().or(z.null()).optional(),
  scope: z.string().or(z.null()).optional(),
  id_token: z.string().or(z.null()).optional(),
  session_state: z.string().or(z.null()).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type AccountSelect = z.infer<typeof accountSchema>;
```

### Session Schema

```ts
export const sessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  expires: z.coerce.date(),
  sessionToken: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type SessionSelect = z.infer<typeof sessionSchema>;
```

---

## 1.2: Computed / DTO Schemas

Define Zod schemas for the computed types currently in `lib/db/`. These are not direct Prisma models — they combine data from multiple sources.

### ItemTypeBreakdown

```ts
export const itemTypeBreakdownSchema = z.object({
  type: z.nativeEnum(ItemType),
  count: z.number().int(),
});

export type ItemTypeBreakdown = z.infer<typeof itemTypeBreakdownSchema>;
```

### SystemItemType

```ts
export const systemItemTypeSchema = z.object({
  itemType: itemTypeSchema,
  count: z.number().int(),
});

export type SystemItemType = z.infer<typeof systemItemTypeSchema>;
```

### ItemWithDetails

```ts
export const itemWithDetailsSchema = itemSelectSchema.extend({
  itemType: itemTypeSchema,
  tags: z.array(tagSchema),
});

export type ItemWithDetails = z.infer<typeof itemWithDetailsSchema>;
```

### CollectionWithStats

```ts
export const collectionWithStatsSchema = collectionSelectSchema.extend({
  itemTypeNames: z.array(z.string()),
  dominantItemTypeColor: z.string().or(z.null()),
  contentTypeCounts: itemTypeBreakdownSchema.array(),
});

export type CollectionWithStats = z.infer<typeof collectionWithStatsSchema>;
```

### ProfileData

```ts
export const profileDataSchema = z.object({
  user: userSelectSchema,
  itemStats: z.object({
    totalItems: z.number().int(),
    totalCollections: z.number().int(),
    totalTags: z.number().int(),
  }),
  itemTypeBreakdown: itemTypeBreakdownSchema.array(),
});

export type ProfileData = z.infer<typeof profileDataSchema>;
```

---

## Files Changed

| File | Action |
|------|--------|
| `types/db.ts` | **New** — all Zod schemas + `z.infer` exports |

## Implementation Order

1. Create `types/db.ts` with all schemas and type exports
2. Run `npm run build` — verify no type errors
3. Verify all schemas are exported and accessible

## Constraints

- Use `z.nativeEnum()` for Prisma enums (not `z.enum()`)
- Use `z.coerce.date()` for Prisma `DateTime` fields
- Use `z.string()` for Prisma `Decimal` fields
- Use `.or(z.null())` for nullable Prisma fields
- Use `.optional()` for optional Prisma fields
- Follow coding standards: no custom types beyond Zod inference
- Dark mode tokens use `oklch()` — keep color strings as-is for now
