'use server';

import { prisma } from '@/lib/prisma/prisma';
import { signIn } from '@/lib/auth/auth/auth';
import { redirect } from 'next/navigation';
import {
  signInSchema,
  type SignInActionResult,
  type SignInFormData,
} from '@/types/db';
import { headers } from 'next/headers';
import {
  createRateLimiter,
  checkRateLimit,
  RATE_LIMIT_CONFIGS,
} from '@/lib/auth/rateLimit/rateLimit';

export async function handleSignIn(
  data: SignInFormData,
): Promise<SignInActionResult> {
  const { email: loginEmail, password } = data;
  const headersList = await headers();
  const ip = headersList.get('x-client-ip') ?? 'unknown';
  const rateLimiter = createRateLimiter(RATE_LIMIT_CONFIGS.signIn);
  const rateKey = `signin:${ip}:${loginEmail}`;
  const rateResult = await checkRateLimit(
    rateLimiter,
    rateKey,
    RATE_LIMIT_CONFIGS.signIn,
  );

  if (!rateResult.success) {
    const retryAfter = rateResult.retryAfter || 900;
    redirect(
      `/sign-in?error=${encodeURIComponent(`Too many attempts. Please try again in ${retryAfter / 60} minute${retryAfter / 60 > 1 ? 's' : ''}`)}&retry-after=${retryAfter}`,
    );
  }

  const parsed = signInSchema.safeParse(data);

  if (!parsed.success) {
    redirect(
      `/sign-in?error=${encodeURIComponent(parsed.error.issues[0]?.message || 'Validation failed')}`,
    );
  }

  const { email } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { emailVerified: true },
  });

  const emailVerificationEnabled =
    process.env.ENABLE_EMAIL_VERIFICATION !== 'false';
  const shouldRedirect =
    emailVerificationEnabled && user && !user.emailVerified;

  await signIn('credentials', {
    email,
    password,
  });
  redirect(shouldRedirect ? '/verify-required' : '/dashboard');
}
