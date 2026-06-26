import { z } from 'zod';
import { ContentType } from '../generated/prisma/enums';

// ── Shared Types ─────────────────────────────────────────────────────────────

export type PlanTier = 'free' | 'monthly' | 'yearly';

// ── Auth / Form Schemas ──────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const passwordRequirements = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Contains uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Contains lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Contains a number", test: (p: string) => /\d/.test(p) },
] as const;

export const signInSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignInFormData = z.infer<typeof signInSchema>;

export const signInActionResultSchema = z.object({
  success: z.boolean(),
  data: z.null(),
  error: z.string().or(z.null()),
});

export type SignInActionResult = z.infer<typeof signInActionResultSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

// ── Editor Preferences ────────────────────────────────────────────────────────

export const editorPreferencesSchema = z.object({
  fontSize: z.number().int().min(10).max(24).default(13),
  tabSize: z.number().int().min(2).max(8).default(2),
  wordWrap: z.boolean().default(true),
  minimap: z.boolean().default(false),
  theme: z.enum(['vs-dark', 'monokai', 'github-dark']).default('vs-dark'),
});

export type EditorPreferences = z.infer<typeof editorPreferencesSchema>;

// ── AI Auto-Tagging ────────────────────────────────────────────────────────────

export const autoTagsInputSchema = z
  .object({
    title: z.string().max(200).optional(),
    content: z.string().max(20_000).optional(),
    language: z.string().optional(),
  })
  .refine((data) => (data.title?.trim().length ?? 0) > 0 || (data.content?.trim().length ?? 0) > 0, {
    message: 'Title or content is required',
  });

export type AutoTagsInput = z.infer<typeof autoTagsInputSchema>;

// ── AI Description Generator ───────────────────────────────────────────────────

export const descriptionInputSchema = z
  .object({
    title: z.string().max(200).optional(),
    content: z.string().max(20_000).optional(),
    language: z.string().optional(),
    url: z.string().max(2000).optional(),
    fileName: z.string().max(255).optional(),
    fileSize: z.number().int().nonnegative().optional(),
  })
  .refine(
    (data) =>
      (data.title?.trim().length ?? 0) > 0 ||
      (data.content?.trim().length ?? 0) > 0 ||
      (data.url?.trim().length ?? 0) > 0 ||
      (data.fileName?.trim().length ?? 0) > 0,
    { message: 'Title, content, URL, or file is required' },
  );

export type DescriptionInput = z.infer<typeof descriptionInputSchema>;

// ── AI Code Explanation ───────────────────────────────────────────────────────

export const explainCodeInputSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().min(1, 'Content is required').max(20_000),
  language: z.string().optional(),
});

export type ExplainCodeInput = z.infer<typeof explainCodeInputSchema>;

export const DEFAULT_EDITOR_PREFERENCES: EditorPreferences = {
  fontSize: 13,
  tabSize: 2,
  wordWrap: true,
  minimap: false,
  theme: 'vs-dark',
};

// ── User ──────────────────────────────────────────────────────────────────────

export const userInsertSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255).optional(),
  image: z.string().url().or(z.literal('')).optional(),
  password: z.string().optional(),
  isPro: z.boolean().optional(),
  stripeCustomerId: z.string().or(z.null()).optional(),
  stripeSubscriptionId: z.string().or(z.null()).optional(),
  editorPreferences: editorPreferencesSchema.or(z.null()).optional(),
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

export const itemUpdateSchema = z.object({
  isFavorite: z.boolean().optional(),
  isPinned: z.boolean().optional(),
});

export const itemEditSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255).trim(),
  description: z.string().or(z.null()).optional(),
  content: z.string().or(z.null()).optional(),
  url: z.string().url('Must be a valid URL').or(z.literal('')).or(z.null()).optional(),
  language: z.string().or(z.null()).optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  collectionIds: z.array(z.string()).optional(),
});

export type ItemInsert = z.infer<typeof itemInsertSchema>;
export type ItemSelect = z.infer<typeof itemSelectSchema>;
export type ItemUpdate = z.infer<typeof itemUpdateSchema>;
export type ItemEditValues = z.infer<typeof itemEditSchema>;

export const itemCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255).trim(),
  description: z.string().or(z.null()).optional(),
  itemType: z.enum(['snippet', 'prompt', 'command', 'note', 'link', 'file', 'image']),
  content: z.string().or(z.null()).optional(),
  language: z.string().or(z.null()).optional(),
  url: z.string().url('Must be a valid URL').or(z.literal('')).or(z.null()).optional(),
  fileUrl: z.string().or(z.null()).optional(),
  fileName: z.string().or(z.null()).optional(),
  fileSize: z.number().int().or(z.null()).optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  collectionIds: z.array(z.string()).optional(),
}).refine(
  (data) => {
    if (data.itemType === 'link') {
      return !!data.url && data.url.trim().length > 0;
    }
    return true;
  },
  { message: 'URL is required for link type', path: ['url'] },
).refine(
  (data) => {
    if (data.itemType === 'file' || data.itemType === 'image') {
      return !!data.fileName && data.fileName.trim().length > 0;
    }
    return true;
  },
  { message: 'File is required for file/image type', path: ['fileUrl'] },
).refine(
  (data) => {
    if (!['link', 'file', 'image'].includes(data.itemType)) {
      return !!data.content && data.content.trim().length > 0;
    }
    return true;
  },
  { message: 'Content is required', path: ['content'] },
);

export type ItemCreateValues = z.infer<typeof itemCreateSchema>;
export type ItemType = ItemCreateValues['itemType'];

// ── Collection ────────────────────────────────────────────────────────────────

export const collectionInsertSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().or(z.null()).optional(),
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

export const collectionCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255).trim(),
  description: z.string().or(z.null()).optional(),
});

export type CollectionCreateValues = z.infer<typeof collectionCreateSchema>;

export const collectionUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255).trim(),
  description: z.string().or(z.null()).optional(),
});

export type CollectionUpdateValues = z.infer<typeof collectionUpdateSchema>;

export const collectionUpdateFavoriteSchema = z.object({
  isFavorite: z.boolean(),
});

export type CollectionUpdateFavorite = z.infer<typeof collectionUpdateFavoriteSchema>;

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

export const sidebarItemTypeBreakdownSchema = z.object({
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  count: z.number(),
});

export type SidebarItemTypeBreakdown = z.infer<typeof sidebarItemTypeBreakdownSchema>;

export const systemItemTypeSchema = z.object({
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  itemCount: z.number(),
});

export type SystemItemType = z.infer<typeof systemItemTypeSchema>;

export const itemWithDetailsSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(255),
  description: z.string().or(z.null()),
  contentType: z.nativeEnum(ContentType),
  content: z.string().or(z.null()),
  fileUrl: z.string().or(z.null()),
  fileName: z.string().or(z.null()),
  fileSize: z.number().int().or(z.null()),
  url: z.string().url().or(z.literal('')).or(z.null()),
  language: z.string().or(z.null()),
  isFavorite: z.boolean(),
  isPinned: z.boolean(),
  itemType: z.object({
    name: z.string(),
    icon: z.string(),
    color: z.string(),
  }),
  tags: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })),
  collections: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ItemWithDetails = z.infer<typeof itemWithDetailsSchema>;

export const collectionWithStatsSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().or(z.null()),
  itemCount: z.number(),
  isFavorite: z.boolean(),
  itemTypeNames: z.array(z.string()),
  dominantItemTypeColor: z.string(),
  contentTypeCounts: z.record(z.string(), z.number()),
  createdAt: z.coerce.date(),
});

export type CollectionWithStats = z.infer<typeof collectionWithStatsSchema>;

export const collectionDetailSchema = collectionWithStatsSchema.extend({
  items: z.array(itemWithDetailsSchema),
});

export type CollectionDetail = z.infer<typeof collectionDetailSchema>;

export const profileUserDataSchema = z.object({
  id: z.string(),
  name: z.string().or(z.null()),
  email: z.string(),
  image: z.string().or(z.null()),
  isPro: z.boolean(),
  createdAt: z.coerce.date(),
  hasPassword: z.boolean(),
  stripeSubscriptionId: z.string().or(z.null()),
});

export const profileDataSchema = z.object({
  user: profileUserDataSchema.or(z.null()),
  itemStats: z.object({
    totalItems: z.number(),
    totalCollections: z.number(),
    favoriteItems: z.number(),
    favoriteCollections: z.number(),
  }),
  itemTypeBreakdown: sidebarItemTypeBreakdownSchema.array(),
  errorType: z.union([z.literal('db-failure'), z.literal('user-not-found'), z.null()]),
});

export type ProfileData = z.infer<typeof profileDataSchema>;

// ── Delete Account Schema ─────────────────────────────────────────────────────

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export type DeleteAccountValues = z.infer<typeof deleteAccountSchema>;

// ── Verify Token Schema ───────────────────────────────────────────────────────

export const verifyTokenSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export type VerifyTokenValues = z.infer<typeof verifyTokenSchema>;

// ── Item Stats ────────────────────────────────────────────────────────────────

export const itemStatsSchema = z.object({
  totalItems: z.number(),
  totalCollections: z.number(),
  favoriteItems: z.number(),
  favoriteCollections: z.number(),
});

export type ItemStats = z.infer<typeof itemStatsSchema>;

export const EMPTY_ITEM_STATS: ItemStats = {
  totalItems: 0,
  totalCollections: 0,
  favoriteItems: 0,
  favoriteCollections: 0,
};

export type DashboardUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  isPro: boolean;
};

// ── Forgot Password Schema ────────────────────────────────────────────────────

export const forgotPasswordSchema = z.object({
  email: z.email(),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

// ── Reset Password Schema ─────────────────────────────────────────────────────

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    email: z.string().min(1),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
