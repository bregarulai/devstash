import { auth } from '@/lib/auth/auth/auth';
import { prisma } from '@/lib/prisma/prisma';

export const MAX_TAG_SUGGESTIONS = 5;
export const MAX_CONTENT_CHARS = 2000;

export type ActionResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: string };

export async function requireProUser(): Promise<{ userId: string } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPro: true },
  });
  if (!dbUser?.isPro) return { error: 'AI features require a Pro plan.' };

  return { userId: session.user.id };
}