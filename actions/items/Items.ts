'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth/auth/auth';
import { itemEditSchema, type ItemEditValues, type ItemWithDetails } from '@/types/db';
import { updateItem, deleteItem } from '@/lib/db/items/items';

type UpdateItemResult =
  | { success: true; data: ItemWithDetails; error: null }
  | { success: false; data: null; error: string };

export async function updateItemAction(
  itemId: string,
  data: ItemEditValues,
): Promise<UpdateItemResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, data: null, error: 'Unauthorized' };
  }

  const result = itemEditSchema.safeParse(data);

  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? 'Invalid input';
    return { success: false, data: null, error: firstError };
  }

  try {
    const updated = await updateItem(itemId, session.user.id, result.data);
    revalidatePath('/dashboard');
    return { success: true, data: updated, error: null };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Failed to update item',
    };
  }
}

type DeleteItemResult =
  | { success: true; error: null }
  | { success: false; error: string };

export async function deleteItemAction(
  itemId: string,
): Promise<DeleteItemResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await deleteItem(itemId, session.user.id);
    revalidatePath('/dashboard');
    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete item',
    };
  }
}
