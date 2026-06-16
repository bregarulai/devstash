import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatDaysAgo } from '@/lib/utils/utils';
import type { ItemWithDetails } from '@/types/db';

interface ImageCardProps {
  item: ItemWithDetails;
  onOpen?: (itemId: string) => void;
}

export function ImageCard({ item, onOpen }: ImageCardProps) {
  const borderColor = item.itemType.color;

  const handleClick = () => {
    onOpen?.(item.id);
  };

  return (
    <button
      type='button'
      onClick={handleClick}
      className={cn(
        'h-full w-full overflow-hidden rounded-xl border-l-[3px] transition-all hover:shadow-md text-left cursor-pointer',
        borderColor ? '' : 'border-l-transparent',
      )}
      style={borderColor ? { borderLeftColor: borderColor } : undefined}
    >
      <Card className='h-full overflow-hidden'>
        <div className='relative aspect-video w-full overflow-hidden'>
          {item.fileUrl ? (
            <Image
              src={item.fileUrl}
              alt={item.title}
              fill
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
          <h3 className='truncate text-sm font-medium'>{item.title}</h3>
          {item.description && (
            <p className='mt-1 truncate text-xs text-muted-foreground'>
              {item.description}
            </p>
          )}
          <div className='mt-2 flex items-center justify-between'>
            <time
              dateTime={item.createdAt.toISOString()}
              className='text-xs text-muted-foreground'
            >
              {formatDaysAgo(item.createdAt)}
            </time>
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
    </button>
  );
}
