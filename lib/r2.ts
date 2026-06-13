import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
  },
});

const BUCKET = process.env.R2_BUCKET_NAME ?? '';
const PUBLIC_URL = process.env.R2_PUBLIC_URL ?? '';

export interface UploadResult {
  key: string;
  url: string;
}

export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<UploadResult> {
  await R2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  const url = PUBLIC_URL ? `${PUBLIC_URL}/${key}` : key;

  return { key, url };
}

export async function deleteFromR2(key: string): Promise<void> {
  await R2.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }),
  );
}

export async function getPresignedDownloadUrl(
  key: string,
  expiresIn = 3600,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  return getSignedUrl(R2, command, { expiresIn });
}

export function extractR2Key(url: string): string | null {
  if (!url) return null;
  if (PUBLIC_URL && url.startsWith(PUBLIC_URL)) {
    const baseUrl = PUBLIC_URL.endsWith('/') ? PUBLIC_URL : `${PUBLIC_URL}/`;
    return url.slice(baseUrl.length);
  }
  return null;
}
