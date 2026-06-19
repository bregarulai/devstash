'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth/auth/auth';
import { itemEditSchema, itemCreateSchema, type ItemEditValues, type ItemCreateValues, type ItemWithDetails } from '@/types/db';
import { updateItem, deleteItem, createItem } from '@/lib/db/items/items';

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
    return { success: true, data: updated, error: null };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'Failed to update item',
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
