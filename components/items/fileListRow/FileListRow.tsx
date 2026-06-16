'use client';

import {
  Download,
  File,
  FileCode,
  FileImage,
  FileJson,
  FileSpreadsheet,
  FileText,
  type LucideIcon,
} from 'lucide-react';
import { cn, formatDaysAgo, formatFileSize } from '@/lib/utils/utils';
import { extractR2Key } from '@/lib/r2';
import type { ItemWithDetails } from '@/types/db';

interface FileListRowProps {
  item: ItemWithDetails;
  onOpen?: (itemId: string) => void;
}

function getFileExtension(fileName: string | null): string {
  if (!fileName) return '';
  const ext = fileName.split('.').pop()?.toLowerCase();
  return ext ? `.${ext}` : '';
}

const EXT_ICON_MAP: Record<string, LucideIcon> = {
  // Images
  '.png': FileImage,
  '.jpg': FileImage,
  '.jpeg': FileImage,
  '.gif': FileImage,
  '.webp': FileImage,
  '.svg': FileImage,
  // Files
  '.pdf': FileText,
  '.txt': FileText,
  '.md': FileText,
  '.json': FileJson,
  '.yaml': FileCode,
  '.yml': FileCode,
  '.xml': FileCode,
  '.csv': FileSpreadsheet,
  '.toml': FileCode,
  '.ini': FileText,
};

function renderFileIcon(fileName: string | null, className?: string) {
  const ext = getFileExtension(fileName);
  const Icon = EXT_ICON_MAP[ext] ?? File;
  return <Icon className={className} />;
}

export function FileListRow({ item, onOpen }: FileListRowProps) {
  const ext = getFileExtension(item.fileName);

  const handleClick = () => {
    onOpen?.(item.id);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.fileUrl) return;
    const key = extractR2Key(item.fileUrl);
    if (key) {
      const params = new URLSearchParams({ key });
      if (item.fileName) params.set('fileName', item.fileName);
      window.location.href = `/api/download?${params.toString()}`;
    } else {
      window.location.href = item.fileUrl;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role='button'
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'flex w-full items-center gap-4 rounded-lg border bg-muted/50 px-4 py-3 text-left transition-colors hover:bg-muted/70 cursor-pointer',
      )}
    >
      <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/50'>
        {renderFileIcon(item.fileName, 'h-4 w-4 text-muted-foreground')}
      </div>

      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-medium'>{item.title}</p>
        {ext && (
          <p className='text-xs text-muted-foreground uppercase'>{ext}</p>
        )}
      </div>

      <span className='hidden shrink-0 text-xs text-muted-foreground sm:block'>
        {item.fileSize != null ? formatFileSize(item.fileSize) : '—'}
      </span>

      <span className='hidden shrink-0 text-xs text-muted-foreground md:block'>
        {formatDaysAgo(item.createdAt)}
      </span>

      {item.fileUrl && (
        <button
          type='button'
          onClick={handleDownload}
          className='flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
        >
          <Download className='h-4 w-4' />
        </button>
      )}
    </div>
  );
}
