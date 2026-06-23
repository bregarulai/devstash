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
import { Button } from '@/components/ui/button';
import { cn, formatDaysAgo, formatFileSize } from '@/lib/utils/utils';
import { triggerDownload } from '@/lib/utils/download';
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
  '.png': FileImage,
  '.jpg': FileImage,
  '.jpeg': FileImage,
  '.gif': FileImage,
  '.webp': FileImage,
  '.svg': FileImage,
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
    triggerDownload(item.fileUrl, item.fileName);
  };

  return (
    <div
      className={cn(
        'group relative flex w-full items-center gap-4 rounded-lg border bg-muted/50 px-4 py-3 text-left transition-colors hover:bg-muted/70 focus-within:border-ring focus-within:ring-1 focus-within:ring-ring',
      )}
    >
      <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/50'>
        {renderFileIcon(item.fileName, 'h-4 w-4 text-muted-foreground')}
      </div>

      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-medium'>
          <button
            type='button'
            onClick={handleClick}
            className='relative text-left after:absolute after:inset-0 focus-visible:outline-none'
          >
            {item.title}
          </button>
        </p>
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
        <Button
          variant='ghost'
          size='icon'
          onClick={handleDownload}
          aria-label={`Download ${item.fileName ?? item.title}`}
          className='relative z-10'
        >
          <Download />
        </Button>
      )}
    </div>
  );
}
