'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth/auth/auth';
import { editorPreferencesSchema, type EditorPreferences } from '@/types/db';
import { prisma } from '@/lib/prisma/prisma';

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

export async function updateEditorPreferencesAction(
  data: EditorPreferences,
): Promise<ActionResult<EditorPreferences>> {
  const authResult = await requireAuth();
  if (authResult.error) return { success: false, data: null, error: authResult.error };
  const { userId } = authResult;

  const result = editorPreferencesSchema.safeParse(data);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? 'Invalid input';
    return { success: false, data: null, error: firstError };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { editorPreferences: result.data },
    });
    revalidatePath('/settings');
    return { success: true, data: result.data, error: null };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'Failed to update editor preferences',
    };
  }
}

export async function getEditorPreferencesAction(): Promise<ActionResult<EditorPreferences>> {
  const authResult = await requireAuth();
  if (authResult.error) return { success: false, data: null, error: authResult.error };
  const { userId } = authResult;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { editorPreferences: true },
    });

    if (!user) {
      return { success: false, data: null, error: 'User not found' };
    }

    const prefs = user.editorPreferences as Record<string, unknown> | null;
    if (!prefs) {
      return { success: true, data: editorPreferencesSchema.parse({}), error: null };
    }

    const validated = editorPreferencesSchema.safeParse(prefs);
    if (!validated.success) {
      return { success: true, data: editorPreferencesSchema.parse({}), error: null };
    }

    return { success: true, data: validated.data, error: null };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'Failed to get editor preferences',
    };
  }
}
