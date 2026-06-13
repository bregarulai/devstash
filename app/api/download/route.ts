import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth/auth';
import { getPresignedDownloadUrl } from '@/lib/r2';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (!key) {
    return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 });
  }

  if (!key.startsWith('uploads/')) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 400 });
  }

  if (!key.includes(`/${session.user.id}/`)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const presignedUrl = await getPresignedDownloadUrl(key);
    return NextResponse.redirect(presignedUrl);
  } catch (error) {
    console.error('Download failed:', error);
    return NextResponse.json(
      { error: 'Download failed' },
      { status: 500 },
    );
  }
}
