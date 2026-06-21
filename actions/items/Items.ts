'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth/auth/auth';
import { itemEditSchema, itemCreateSchema, itemUpdateSchema, type ItemEditValues, type ItemCreateValues, type ItemWithDetails } from '@/types/db';
import { updateItem, deleteItem, createItem, updateItemFields, getItemById, getItemStats } from '@/lib/db/items/items';
import { prisma } from '@/lib/prisma/prisma';
import { FREE_TIER_LIMITS, isProOnlyItemType } from '@/lib/constants/limits';

type ActionResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: string };

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    return { userId: null, error: 'Unauthorized' as const };
  }
  return { userId: session.user.id, error: null };
}

export async function createItemAction(
  data: ItemCreateValues,
): Promise<ActionResult<ItemWithDetails>> {
  const authResult = await requireAuth();
  if (authResult.error) return { success: false, data: null, error: authResult.error };
  const { userId } = authResult;

  const result = itemCreateSchema.safeParse(data);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? 'Invalid input';
    return { success: false, data: null, error: firstError };
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { isPro: true },
    });

    if (!dbUser?.isPro) {
      if (isProOnlyItemType(result.data.itemType)) {
        return { success: false, data: null, error: 'File and image items are a Pro feature.' };
      }
      const stats = await getItemStats(userId);
      if (stats.totalItems >= FREE_TIER_LIMITS.maxItems) {
        return {
          success: false,
          data: null,
          error: `Free plan limited to ${FREE_TIER_LIMITS.maxItems} items. Upgrade to Pro for unlimited items.`,
        };
      }
    }

    const created = await createItem(userId, result.data);
    revalidatePath('/dashboard');
    return { success: true, data: created, error: null };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'Failed to create item',
    };
  }
}

export async function updateItemAction(
  itemId: string,
  data: ItemEditValues,
): Promise<ActionResult<ItemWithDetails>> {
  const authResult = await requireAuth();
  if (authResult.error) return { success: false, data: null, error: authResult.error };
  const { userId } = authResult;

  const result = itemEditSchema.safeParse(data);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? 'Invalid input';
    return { success: false, data: null, error: firstError };
  }

  try {
    const updated = await updateItem(itemId, userId, result.data);
    revalidatePath('/dashboard');
    revalidatePath(`/items/${updated.itemType.name.toLowerCase()}`);
    return { success: true, data: updated, error: null };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'Failed to update item',
    };
  }
}

export async function toggleItemPinAction(
  itemId: string,
): Promise<ActionResult<boolean>> {
  const authResult = await requireAuth();
  if (authResult.error) return { success: false, data: null, error: authResult.error };
  const { userId } = authResult;

  const result = itemUpdateSchema.safeParse({ itemId });
  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? 'Invalid input';
    return { success: false, data: null, error: firstError };
  }

  try {
    const item = await prisma.item.findUnique({
      where: { id: itemId, userId },
      select: { isPinned: true, itemType: { select: { name: true } } },
    });

    if (!item) {
      return { success: false, data: null, error: 'Item not found' };
    }

    const newPinned = !item.isPinned;
    await updateItemFields(itemId, userId, { isPinned: newPinned });
    revalidatePath('/dashboard');
    revalidatePath('/favorites');
    revalidatePath(`/items/${item.itemType.name.toLowerCase()}`);
    return { success: true, data: newPinned, error: null };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'Failed to toggle pin',
    };
  }
}

export async function toggleItemFavoriteAction(
  itemId: string,
): Promise<ActionResult<boolean>> {
  const authResult = await requireAuth();
  if (authResult.error) return { success: false, data: null, error: authResult.error };
  const { userId } = authResult;

  const result = itemUpdateSchema.safeParse({ itemId });
  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? 'Invalid input';
    return { success: false, data: null, error: firstError };
  }

  try {
    const item = await prisma.item.findUnique({
      where: { id: itemId, userId },
      select: { isFavorite: true, itemType: { select: { name: true } } },
    });

    if (!item) {
      return { success: false, data: null, error: 'Item not found' };
    }

    const newFavorite = !item.isFavorite;
    await updateItemFields(itemId, userId, { isFavorite: newFavorite });
    revalidatePath('/dashboard');
    revalidatePath('/favorites');
    revalidatePath(`/items/${item.itemType.name.toLowerCase()}`);
    return { success: true, data: newFavorite, error: null };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'Failed to toggle favorite',
    };
  }
}

export async function deleteItemAction(
  itemId: string,
): Promise<ActionResult<null>> {
  const authResult = await requireAuth();
  if (authResult.error) return { success: false, data: null, error: authResult.error };
  const { userId } = authResult;

  try {
    await deleteItem(itemId, userId);
    revalidatePath('/dashboard');
    return { success: true, data: null, error: null };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'Failed to delete item',
    };
  }
}

export async function getItemAction(
  itemId: string,
): Promise<ActionResult<ItemWithDetails>> {
  const authResult = await requireAuth();
  if (authResult.error) return { success: false, data: null, error: authResult.error };
  const { userId } = authResult;

  try {
    const item = await getItemById(itemId, userId);

    if (!item) {
      return { success: false, data: null, error: 'Item not found' };
    }

    return { success: true, data: item, error: null };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch item',
    };
  }
}
