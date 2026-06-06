'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/verification-token';
import { resetPasswordSchema } from '@/types/db';

export async function handleResetPassword(formData: FormData) {
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
