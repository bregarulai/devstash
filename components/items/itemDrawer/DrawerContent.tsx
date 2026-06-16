import { Tag, Info, ExternalLink, FileText, Download } from 'lucide-react';
import Image from 'next/image';
import { formatDaysAgo, formatFileSize } from '@/lib/utils/utils';
import { CodeEditor } from '@/components/codeEditor/CodeEditor/CodeEditor';
import { MarkdownEditor } from '@/components/markdownEditor/MarkdownEditor/MarkdownEditor';
import { Button } from '@/components/ui/button';
import type { ItemWithDetails } from '@/types/db';
import { CODE_EDITOR_TYPES, MARKDOWN_EDITOR_TYPES } from '@/lib/constants';

interface DrawerContentProps {
  item: ItemWithDetails;
  onDownload?: () => void;
}

export function DrawerContent({ item, onDownload }: DrawerContentProps) {
  const isFileOrImage = item.itemType.name.toLowerCase() === 'file' || item.itemType.name.toLowerCase() === 'image';
  const isImage = item.itemType.name.toLowerCase() === 'image';

  return (
    <div className='space-y-4 py-6'>
      {isFileOrImage && item.fileUrl && (
        <div className='space-y-1.5'>
          {isImage ? (
            <div className='relative rounded-lg overflow-hidden border'>
              <Image
                src={item.fileUrl}
                alt={item.fileName || item.title}
                width={0}
                height={0}
                sizes='100vw'
                className='w-full h-auto max-h-[300px] object-contain'
              />
              {onDownload && (
                <Button
                  variant='secondary'
                  size='icon'
                  onClick={onDownload}
                  className='absolute top-2 right-2 cursor-pointer'
                  aria-label='Download image'
                >
                  <Download className='size-4' />
                </Button>
              )}
            </div>
          ) : (
            <div className='flex items-center gap-3 rounded-lg border p-4'>
              <FileText className='h-10 w-10 shrink-0 text-muted-foreground' />
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium truncate'>{item.fileName || item.title}</p>
                {item.fileSize != null && (
                  <p className='text-xs text-muted-foreground'>
                    {formatFileSize(item.fileSize)}
                  </p>
                )}
              </div>
              {onDownload && (
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={onDownload}
                  className='shrink-0 cursor-pointer'
                  aria-label='Download file'
                >
                  <Download className='size-4' />
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {item.description && (
        <div className='space-y-1.5'>
          <div className='text-xs font-medium text-muted-foreground'>
            Description
          </div>
          <p className='text-sm text-foreground'>{item.description}</p>
        </div>
      )}

      {item.content && (
        <div className='space-y-1.5'>
          <div className='text-xs font-medium text-muted-foreground'>
            Content
          </div>
          {CODE_EDITOR_TYPES.includes(item.itemType.name.toLowerCase()) ? (
            <CodeEditor
              value={item.content}
              language={item.language || 'plaintext'}
              readOnly
            />
          ) : MARKDOWN_EDITOR_TYPES.includes(item.itemType.name.toLowerCase()) ? (
            <MarkdownEditor
              value={item.content}
              readOnly
            />
          ) : (
            <div className='rounded-lg bg-muted/50 p-4'>
              <pre className='overflow-x-auto text-sm text-foreground'>
                <code>{item.content}</code>
              </pre>
            </div>
          )}
        </div>
      )}

      {item.tags.length > 0 && (
        <div className='space-y-1.5'>
          <div className='flex items-center gap-1.5 text-xs font-medium text-muted-foreground'>
            <Tag className='h-3 w-3' />
            Tags
          </div>
          <div className='flex flex-wrap gap-1.5'>
            {item.tags.map((tag) => (
              <span
                key={tag.id}
                className='rounded-md bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground'
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {(item.url || item.createdAt) && (
        <div className='space-y-1.5'>
          <div className='flex items-center gap-1.5 text-xs font-medium text-muted-foreground'>
            <Info className='h-3 w-3' />
            Details
          </div>
          {item.url && (
            <a
              href={item.url}
              target='_blank'
              rel='noopener noreferrer'
              className='flex cursor-pointer items-center gap-2 text-sm text-primary underline-offset-4 hover:underline'
            >
              <ExternalLink className='h-3.5 w-3.5 shrink-0' />
              {item.url}
            </a>
          )}
          {item.createdAt && (
            <div className='text-xs text-muted-foreground'>
              Created {formatDaysAgo(item.createdAt)}
            </div>
          )}
          {item.updatedAt && (
            <div className='text-xs text-muted-foreground'>
              Updated {formatDaysAgo(item.updatedAt)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
