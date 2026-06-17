'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ItemTypeIcon } from '@/components/dashboard/itemTypeIcon/ItemTypeIcon';
import { Button } from '@/components/ui/button';
import { cn, formatDaysAgo } from '@/lib/utils/utils';
import { Copy, Check } from 'lucide-react';
import type { ItemWithDetails } from '@/types/db';

interface ItemCardProps {
  item: ItemWithDetails;
  onOpen?: (itemId: string) => void;
}

export function ItemCard({ item, onOpen }: ItemCardProps) {
  const [copied, setCopied] = useState(false);
  const borderColor = item.itemType.color;

  const handleClick = () => {
    onOpen?.(item.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.content) return;
    
    try {
      await navigator.clipboard.writeText(item.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [item.content]);

  return (
    <div
      role='button'
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'h-full w-full overflow-hidden rounded-xl border-l-[3px] transition-all hover:shadow-md text-left cursor-pointer',
        borderColor ? '' : 'border-l-transparent',
      )}
      style={borderColor ? { borderLeftColor: borderColor } : undefined}
    >
      <Card className='h-full'>
        <CardHeader className='flex flex-row items-center gap-3 space-y-0 pb-2'>
          <div
            className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg'
            style={{
              backgroundColor: `${borderColor}15`,
              color: borderColor,
            }}
          >
            <ItemTypeIcon type={item.itemType.name} className='h-4 w-4' />
          </div>
          <div className='min-w-0 flex-1'>
            <CardTitle className='truncate text-sm font-medium'>
              {item.title}
            </CardTitle>
            {item.description && (
              <p className='truncate text-xs text-muted-foreground'>
                {item.description}
              </p>
            )}
          </div>
          <span className='shrink-0 text-xs text-muted-foreground'>
            {formatDaysAgo(item.createdAt)}
          </span>
        </CardHeader>
        <CardContent className='space-y-2 pb-2 pt-0'>
          <div className='flex items-center justify-between'>
            {item.tags.length > 0 ? (
              <div className='flex flex-wrap gap-1'>
                {item.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.id}
                    className='rounded-md bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground'
                  >
                    {tag.name}
                  </span>
                ))}
                {item.tags.length > 3 && (
                  <span className='rounded-md bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground'>
                    +{item.tags.length - 3}
                  </span>
                )}
              </div>
            ) : (
              <div />
            )}
            {item.content && (
              <Button
                variant='ghost'
                size='icon'
                onClick={handleCopy}
                title='Copy content'
              >
                {copied ? (
                  <Check className='text-green-500' />
                ) : (
                  <Copy />
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
