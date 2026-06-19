import { extractR2Key } from '@/lib/r2';

export function triggerDownload(fileUrl: string | null | undefined, fileName?: string | null): void {
  if (!fileUrl) return;
  const key = extractR2Key(fileUrl);
  if (key) {
    const params = new URLSearchParams({ key });
    if (fileName) params.set('fileName', fileName);
    window.location.href = `/api/download?${params.toString()}`;
  } else {
    window.location.href = fileUrl;
  }
}
