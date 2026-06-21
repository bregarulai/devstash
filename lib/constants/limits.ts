export const FREE_TIER_LIMITS = {
  maxItems: 50,
  maxCollections: 3,
} as const;

export const PRO_ONLY_ITEM_TYPES = ['file', 'image'] as const;

export function isProOnlyItemType(type: string): boolean {
  return (PRO_ONLY_ITEM_TYPES as readonly string[]).includes(type);
}
