import { Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ItemTypeIcon } from './ItemTypeIcon';

interface ItemWithDetails {
  id: string;
  title: string;
  description: string | null;
  itemType: {
    name: string;
    icon: string;
    color: string;
  };
  tags: { id: string; name: string }[];
  updatedAt: Date;
}

interface RecentItemsProps {
  items: ItemWithDetails[];
}

export function RecentItems({ items }: RecentItemsProps) {
  return (
    <section>
      <div className='flex items-center gap-2 border-b border-border px-6 py-4'>
        <Clock className='h-4 w-4 text-muted-foreground' />
        <h2 className='text-lg font-semibold'>Recent Items</h2>
      </div>

      <div className='flex flex-col gap-3 p-6'>
        {items.map((item) => (
          <Card key={item.id} className='overflow-hidden ring-0 hover:bg-muted/50 transition-colors'>
            <CardContent className='flex items-center gap-4 p-4'>
              <div
                className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'
                style={{
                  backgroundColor: `${item.itemType.color}15`,
                  borderColor: item.itemType.color,
                }}
              >
                <ItemTypeIcon type={item.itemType.name} />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-medium'>{item.title}</p>
                <p className='truncate text-xs text-muted-foreground'>{item.description ?? ''}</p>
              </div>
              <span
                className='shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium'
                style={{
                  color: item.itemType.color,
                  backgroundColor: `${item.itemType.color}15`,
                }}
              >
                {item.itemType.name}
              </span>
              <span className='shrink-0 text-xs text-muted-foreground'>
                {new Date(item.updatedAt).toLocaleDateString()}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
