import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth/auth';
import { prisma } from '@/lib/prisma/prisma';
import { ITEM_INCLUDE } from '@/lib/db/items/items';

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { session, error: null };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { session } = result;

  const { id } = await params;

  try {
    const item = await prisma.item.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
      include: ITEM_INCLUDE,
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: item.id,
      title: item.title,
      description: item.description,
      contentType: item.contentType,
      content: item.content,
      fileUrl: item.fileUrl,
      fileName: item.fileName,
      fileSize: item.fileSize,
      url: item.url,
      language: item.language,
      isFavorite: item.isFavorite,
      isPinned: item.isPinned,
      itemType: item.itemType,
      tags: item.tags,
      collections: item.collections.map((ic) => ({
        id: ic.collection.id,
        name: ic.collection.name,
      })),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 },
    );
  }
}
