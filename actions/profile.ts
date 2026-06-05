'use server';

import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type RetryProfileResult = {
  success: boolean;
  error?: string;
};

export async function retryProfileData(): Promise<RetryProfileResult> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  try {
    revalidatePath('/profile');
    redirect('/profile');
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to retry' };
  }
}

export async function retryProfileDataAction(): Promise<void> {
  await retryProfileData();
}
