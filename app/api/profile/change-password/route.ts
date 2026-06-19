import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth/auth';
import { prisma } from '@/lib/prisma/prisma';
import { changePasswordSchema } from '@/types/db';
import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';
import { createRateLimiter, checkRateLimit, formatRetryAfter, RATE_LIMIT_CONFIGS, getClientIP } from '@/lib/auth/rateLimit/rateLimit';

export async function POST(request: Request) {
  const ip = getClientIP(request.headers);
  const rateLimiter = createRateLimiter(RATE_LIMIT_CONFIGS.changePassword);
  const rateKey = `changepwd:${ip}`;
  const rateResult = await checkRateLimit(rateLimiter, rateKey, RATE_LIMIT_CONFIGS.changePassword);

  if (!rateResult.success) {
    const retryAfter = rateResult.retryAfter || 900;
    return NextResponse.json(
      { error: `Too many attempts. Please try again in ${formatRetryAfter(retryAfter)}` },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
        },
      },
    );
  }

  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const hdrs = await headers();
  const csrfToken = hdrs.get('x-csrf-token');
  const csrfCookie = hdrs.get('cookie')?.match(/__Host-next-auth\.csrf-token=([^;]+)/)?.[1];
  if (!csrfToken || !csrfCookie || csrfToken !== csrfCookie) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
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

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
