'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth/auth/auth';
import { collectionCreateSchema, collectionUpdateSchema, type CollectionCreateValues, type CollectionUpdateValues, type CollectionSelect } from '@/types/db';
import { createCollection, getUserCollectionList, updateCollection, deleteCollection } from '@/lib/db/collections/collections';

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

export async function createCollectionAction(
  data: CollectionCreateValues,
): Promise<ActionResult<CollectionSelect>> {
  const authResult = await requireAuth();
  if (authResult.error) return { success: false, data: null, error: authResult.error };
  const { userId } = authResult;

  const result = collectionCreateSchema.safeParse(data);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? 'Invalid input';
    return { success: false, data: null, error: firstError };
  }

  try {
    const created = await createCollection(userId, result.data);
    revalidatePath('/dashboard');
    return { success: true, data: created, error: null };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'Failed to create collection',
    };
  }
}

export async function updateCollectionAction(
  collectionId: string,
  data: CollectionUpdateValues,
): Promise<ActionResult<CollectionSelect>> {
  const authResult = await requireAuth();
  if (authResult.error) return { success: false, data: null, error: authResult.error };
  const { userId } = authResult;

  const result = collectionUpdateSchema.safeParse(data);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? 'Invalid input';
    return { success: false, data: null, error: firstError };
  }

  try {
    const updated = await updateCollection(userId, collectionId, result.data);
    if (!updated) {
      return { success: false, data: null, error: 'Collection not found' };
    }
    revalidatePath('/dashboard');
    revalidatePath('/collections');
    revalidatePath(`/collections/${collectionId}`);
    return { success: true, data: updated, error: null };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'Failed to update collection',
    };
  }
}

export async function deleteCollectionAction(
  collectionId: string,
): Promise<ActionResult<null>> {
  const authResult = await requireAuth();
  if (authResult.error) return { success: false, data: null, error: authResult.error };
  const { userId } = authResult;

  try {
    const deleted = await deleteCollection(userId, collectionId);
    if (!deleted) {
      return { success: false, data: null, error: 'Collection not found' };
    }
    revalidatePath('/dashboard');
    revalidatePath('/collections');
    return { success: true, data: null, error: null };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'Failed to delete collection',
    };
  }
}

export async function getCollectionsForPickerAction(): Promise<
  ActionResult<{ id: string; name: string }[]>
> {
  const authResult = await requireAuth();
  if (authResult.error) return { success: false, data: null, error: authResult.error };
  const { userId } = authResult;

  try {
    const collections = await getUserCollectionList(userId);
    return { success: true, data: collections, error: null };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch collections',
    };
  }
}
