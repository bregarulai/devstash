import { z } from 'zod';
import { ContentType } from '../generated/prisma/enums';

// ── User ──────────────────────────────────────────────────────────────────────

export const userInsertSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255).optional(),
  image: z.string().url().or(z.literal('')).optional(),
  password: z.string().optional(),
  isPro: z.boolean().optional(),
  stripeCustomerId: z.string().or(z.null()).optional(),
  stripeSubscriptionId: z.string().or(z.null()).optional(),
});

export const userSelectSchema = userInsertSchema.extend({
  id: z.string(),
  emailVerified: z.coerce.date().or(z.null()).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type UserInsert = z.infer<typeof userInsertSchema>;
export type UserSelect = z.infer<typeof userSelectSchema>;

// ── Item ──────────────────────────────────────────────────────────────────────

export const itemInsertSchema = z.object({
  title: z.string().min(1).max(255),
  contentType: z.nativeEnum(ContentType),
  content: z.string().optional(),
  fileUrl: z.string().or(z.null()).optional(),
  fileName: z.string().or(z.null()).optional(),
  fileSize: z.number().int().or(z.null()).optional(),
  url: z.string().url().or(z.literal('')).optional(),
  description: z.string().optional(),
  isFavorite: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  language: z.string().or(z.null()).optional(),
  userId: z.string(),
  itemTypeId: z.string(),
});

export const itemSelectSchema = itemInsertSchema.extend({
  id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ItemInsert = z.infer<typeof itemInsertSchema>;
export type ItemSelect = z.infer<typeof itemSelectSchema>;

// ── Collection ────────────────────────────────────────────────────────────────

export const collectionInsertSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  isFavorite: z.boolean().optional(),
  userId: z.string(),
  defaultTypeId: z.string().or(z.null()).optional(),
});

export const collectionSelectSchema = collectionInsertSchema.extend({
  id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type CollectionInsert = z.infer<typeof collectionInsertSchema>;
export type CollectionSelect = z.infer<typeof collectionSelectSchema>;

// ── ItemType ──────────────────────────────────────────────────────────────────

export const itemTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  isSystem: z.boolean(),
  userId: z.string().or(z.null()).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ItemTypeSelect = z.infer<typeof itemTypeSchema>;

// ── Tag ───────────────────────────────────────────────────────────────────────

export const tagSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type TagSelect = z.infer<typeof tagSchema>;

// ── VerificationToken ─────────────────────────────────────────────────────────

export const verificationTokenSchema = z.object({
  id: z.string(),
  identifier: z.string(),
  token: z.string(),
  expires: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type VerificationTokenSelect = z.infer<typeof verificationTokenSchema>;

// ── Account ───────────────────────────────────────────────────────────────────

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

// ── Session ───────────────────────────────────────────────────────────────────

export const sessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  expires: z.coerce.date(),
  sessionToken: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type SessionSelect = z.infer<typeof sessionSchema>;

// ── ItemCollection ────────────────────────────────────────────────────────────

export const itemCollectionSchema = z.object({
  itemId: z.string(),
  collectionId: z.string(),
  addedAt: z.coerce.date(),
});

export type ItemCollectionSelect = z.infer<typeof itemCollectionSchema>;

// ── Computed / DTO Schemas ────────────────────────────────────────────────────

export const itemTypeBreakdownSchema = z.object({
  type: z.nativeEnum(ContentType),
  count: z.number().int(),
});

export type ItemTypeBreakdown = z.infer<typeof itemTypeBreakdownSchema>;

export const systemItemTypeSchema = z.object({
  itemType: itemTypeSchema,
  count: z.number().int(),
});

export type SystemItemType = z.infer<typeof systemItemTypeSchema>;

export const itemWithDetailsSchema = itemSelectSchema.extend({
  itemType: itemTypeSchema,
  tags: z.array(tagSchema),
});

export type ItemWithDetails = z.infer<typeof itemWithDetailsSchema>;

export const collectionWithStatsSchema = collectionSelectSchema.extend({
  itemTypeNames: z.array(z.string()),
  dominantItemTypeColor: z.string().or(z.null()),
  contentTypeCounts: itemTypeBreakdownSchema.array(),
});

export type CollectionWithStats = z.infer<typeof collectionWithStatsSchema>;

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
