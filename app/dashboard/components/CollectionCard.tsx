import { Folder } from 'lucide-react';
import { ItemTypeIcon } from '@/app/dashboard/components/ItemTypeIcon';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const contentTypeBorderColorMap: Record<string, string> = {
  TEXT: 'border-l-blue-500',
  FILE: 'border-l-amber-500',
  URL: 'border-l-emerald-500',
};

function getBorderColorFromContentType(
  contentTypeCounts: Record<string, number>,
): string {
  const mostUsedContentType =
    Object.entries(contentTypeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
  return contentTypeBorderColorMap[mostUsedContentType] || '';
}

interface CollectionCardProps {
  collection: {
    id: string;
    name: string;
    description: string | null;
    itemCount: number;
    isFavorite: boolean;
    itemTypeNames: string[];
    contentTypeCounts: Record<string, number>;
  };
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const borderColor = getBorderColorFromContentType(
    collection.contentTypeCounts,
  );

  return (
    <Card className={`h-full rounded-xl border-l-[3px] ${borderColor} transition-all hover:shadow-md`}>
      <CardHeader className='flex flex-row items-center gap-3 space-y-0 pb-2'>
        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted'>
          <Folder className='h-5 w-5 text-muted-foreground' />
        </div>
        <div className='min-w-0 flex-1'>
          <CardTitle className='truncate text-sm font-medium'>
            {collection.name}
          </CardTitle>
          {collection.description && (
            <CardDescription className='truncate text-xs'>
              {collection.description}
            </CardDescription>
          )}
        </div>
      </CardHeader>
      <CardContent className='pb-2'>
        <div className='flex items-center gap-2'>
          {collection.itemTypeNames.length > 0 ? (
            collection.itemTypeNames.slice(0, 5).map((type, index) => (
              <span
                key={index}
                className='flex h-6 w-6 items-center justify-center rounded bg-muted/50'
              >
                <ItemTypeIcon type={type} className='h-3.5 w-3.5' />
              </span>
            ))
          ) : (
            <span className='text-xs text-muted-foreground'>No items</span>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <span className='rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground'>
          {collection.itemCount} items
        </span>
      </CardFooter>
    </Card>
  );
}
