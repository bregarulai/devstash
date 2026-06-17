'use server';

import { prisma } from '@/lib/prisma/prisma';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth/verificationToken/verificationToken';
import { resetPasswordSchema } from '@/types/db';
import { headers } from 'next/headers';
import { createRateLimiter, checkRateLimit, RATE_LIMIT_CONFIGS } from '@/lib/auth/rateLimit/rateLimit';

export async function handleResetPassword(formData: FormData) {
  // Rate limiting check
  const headersList = await headers();
  const ip = headersList.get('x-client-ip') ?? 'unknown';
  const rateLimiter = createRateLimiter(RATE_LIMIT_CONFIGS.resetPassword);
  const rateKey = `resetpwd:${ip}`;
  const rateResult = await checkRateLimit(rateLimiter, rateKey, RATE_LIMIT_CONFIGS.resetPassword);

  if (!rateResult.success) {
    const retryAfter = rateResult.retryAfter || 900;
    redirect(
      `/reset-password?error=${encodeURIComponent(`Too many attempts. Please try again in ${retryAfter / 60} minute${retryAfter / 60 > 1 ? "s" : ""}`)}&retry-after=${retryAfter}`,
    );
  }

  const result = resetPasswordSchema.safeParse({
    token: formData.get('token'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!result.success) {
    const errorMessage = result.error.issues[0]?.message || 'Validation failed';
    redirect(
      `/reset-password?error=${encodeURIComponent(errorMessage)}&token=${encodeURIComponent(formData.get('token') as string)}&email=${encodeURIComponent(formData.get('email') as string)}`,
    );
  }

  const { token, email, password } = result.data;

  const verifiedEmail = await verifyToken(token);

  if (!verifiedEmail || verifiedEmail !== email) {
    redirect('/reset-password?error=Reset+link+is+invalid+or+has+expired');
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    redirect('/reset-password?error=User+not+found');
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  redirect(
    '/sign-in?success=password-reset&email=' + encodeURIComponent(email),
  );
}
