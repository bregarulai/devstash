import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth/auth';
import { uploadToR2 } from '@/lib/r2';
import {
  IMAGE_TYPES,
  FILE_TYPES,
  IMAGE_EXTENSIONS,
  FILE_EXTENSIONS,
  MAX_IMAGE_SIZE,
  MAX_FILE_SIZE,
  getExtension,
} from '@/lib/fileValidation';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const ext = getExtension(file.name);
  const isImage = IMAGE_EXTENSIONS.includes(ext);
  const isFile = FILE_EXTENSIONS.includes(ext);

  if (!isImage && !isFile) {
    return NextResponse.json(
      { error: `Unsupported file type: ${ext}` },
      { status: 400 },
    );
  }

  if (isImage && file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json(
      { error: `Image exceeds 5 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB)` },
      { status: 400 },
    );
  }

  if (isFile && file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `File exceeds 10 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB)` },
      { status: 400 },
    );
  }

  const allowedTypes = isImage ? IMAGE_TYPES : FILE_TYPES;
  if (!allowedTypes.includes(file.type) && file.type !== 'application/octet-stream') {
    return NextResponse.json(
      { error: `Unsupported MIME type: ${file.type}` },
      { status: 400 },
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `uploads/${session.user.id}/${timestamp}-${safeName}`;

  try {
    const result = await uploadToR2(key, buffer, file.type || 'application/octet-stream');

    return NextResponse.json({
      url: result.url,
      key: result.key,
      name: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 },
    );
  }
}
