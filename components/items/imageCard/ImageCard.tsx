'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDaysAgo } from '@/lib/utils/utils';
import { Copy, Check } from 'lucide-react';
import type { ItemWithDetails } from '@/types/db';

interface ImageCardProps {
  item: ItemWithDetails;
  onOpen?: (itemId: string) => void;
}

export function ImageCard({ item, onOpen }: ImageCardProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    onOpen?.(item.id);
  };

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = item.content || item.fileUrl;
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [item.content, item.fileUrl]);

  return (
    <div
      className='group relative h-full w-full overflow-hidden rounded-xl border transition-colors hover:bg-accent/50 focus-within:border-ring focus-within:ring-1 focus-within:ring-ring text-left border-foreground/10'
    >
      <Card className='relative h-full overflow-hidden'>
        <div className='relative aspect-video w-full overflow-hidden'>
          {item.fileUrl ? (
            <Image
              src={item.fileUrl}
              alt={item.title}
              fill
              loading='eager'
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              className='object-cover transition-transform duration-300 hover:scale-105'
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center bg-muted'>
              <span className='text-sm text-muted-foreground'>No image</span>
            </div>
          )}
        </div>
        <CardContent className='p-3'>
          <h3 className='truncate text-sm font-medium'>
            <button
              type='button'
              onClick={handleClick}
              className='relative text-left after:absolute after:inset-0 focus-visible:outline-none'
            >
              {item.title}
            </button>
          </h3>
          {item.description && (
            <p className='mt-1 truncate text-xs text-muted-foreground'>
              {item.description}
            </p>
          )}
          <div className='mt-2 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <time
                dateTime={item.createdAt.toISOString()}
                className='text-xs text-muted-foreground'
              >
                {formatDaysAgo(item.createdAt)}
              </time>
              {(item.content || item.fileUrl) && (
                <Button
                  variant='ghost'
                  size='icon-xs'
                  onClick={handleCopy}
                  title='Copy content'
                  className='relative z-10'
                >
                  {copied ? (
                    <Check className='text-success' />
                  ) : (
                    <Copy />
                  )}
                </Button>
              )}
            </div>
            {item.tags.length > 0 && (
              <div className='flex gap-1'>
                {item.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag.id}
                    className='rounded-md bg-muted/50 px-1.5 py-0.5 text-xs text-muted-foreground'
                  >
                    {tag.name}
                  </span>
                ))}
                {item.tags.length > 2 && (
                  <span className='rounded-md bg-muted/50 px-1.5 py-0.5 text-xs text-muted-foreground'>
                    +{item.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
