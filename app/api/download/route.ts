import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth/auth';
import { getPresignedDownloadUrl } from '@/lib/r2';
import { buildContentDispositionHeader, sanitizeFilename } from '@/lib/sanitize-filename';
import { prisma } from '@/lib/prisma/prisma';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  const fileName = searchParams.get('fileName');

  if (!key) {
    return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 });
  }

  if (!key.startsWith('uploads/')) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 400 });
  }

  if (!key.includes(`/${session.user.id}/`)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const item = await prisma.item.findFirst({
    where: {
      userId: session.user.id,
      fileUrl: { endsWith: `/${key}` },
    },
    select: { id: true },
  });

  if (!item) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  try {
    const presignedUrl = await getPresignedDownloadUrl(key);
    const response = await fetch(presignedUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch file' },
        { status: 500 },
      );
    }

    const fallbackName = key.split('/').pop() ?? 'download';
    const downloadName = sanitizeFilename(fileName || fallbackName);
    const contentDisposition = buildContentDispositionHeader(downloadName);

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') ?? 'application/octet-stream',
        'Content-Disposition': contentDisposition,
        'Content-Length': response.headers.get('Content-Length') ?? '',
      },
    });
  } catch (error) {
    console.error('Download failed:', error);
    return NextResponse.json(
      { error: 'Download failed' },
      { status: 500 },
    );
  }
}
