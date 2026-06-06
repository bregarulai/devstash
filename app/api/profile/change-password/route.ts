import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { changePasswordSchema } from '@/types/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const result = changePasswordSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
  }

  const { currentPassword, newPassword } = result.data;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!user?.password) {
    return NextResponse.json({ error: 'Password change not available for OAuth accounts' }, { status: 400 });
  }

  const valid = await bcrypt.compare(currentPassword, user.password);

  if (!valid) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword },
  });

  return NextResponse.json({ success: true });
}
