import type { ItemWithDetails } from '@/types/db';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];

export function isImageItem(item: ItemWithDetails): boolean {
  if (item.contentType !== 'FILE' || !item.fileUrl) return false;
  const fileName = item.fileName?.toLowerCase() || item.fileUrl.toLowerCase();
  return IMAGE_EXTENSIONS.some(ext => fileName.endsWith(ext));
}
