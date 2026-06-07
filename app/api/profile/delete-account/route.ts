import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { deleteAccountByPassword } from '@/lib/account-deletion';
import { deleteAccountSchema } from '@/types/db';
import { headers } from 'next/headers';
import { createRateLimiter, checkRateLimit, formatRetryAfter, RATE_LIMIT_CONFIGS, getClientIP } from '@/lib/rate-limit';

export async function DELETE(request: NextRequest) {
  // Rate limiting check
  const ip = getClientIP(request.headers);
  const rateLimiter = createRateLimiter(RATE_LIMIT_CONFIGS.deleteAccount);
  const rateKey = `deleteaccount:${ip}`;
  const rateResult = await checkRateLimit(rateLimiter, rateKey, RATE_LIMIT_CONFIGS.deleteAccount);

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

  const csrfToken = (await headers()).get('x-csrf-token');
  if (!csrfToken) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const result = deleteAccountSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
  }

  const passwordResult = await deleteAccountByPassword(result.data.password);

  if ('error' in passwordResult) {
    return NextResponse.json({ error: passwordResult.error }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
