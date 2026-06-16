import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth/auth';
import { prisma } from '@/lib/prisma/prisma';
import { itemUpdateSchema } from '@/types/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const item = await prisma.item.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        itemType: {
          select: {
            name: true,
            icon: true,
            color: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
      },
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const result = itemUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', issues: result.error.issues },
        { status: 400 },
      );
    }

    const updateData = { ...result.data, userId: session.user.id };

    const item = await prisma.item.updateMany({
      where: {
        id,
        userId: session.user.id,
      },
      data: updateData,
    });

    if (item.count === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    revalidatePath('/dashboard');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 },
    );
  }
}
