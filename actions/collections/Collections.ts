'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth/auth/auth';
import { collectionCreateSchema, type CollectionCreateValues, type CollectionSelect } from '@/types/db';
import { createCollection } from '@/lib/db/collections/collections';

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
