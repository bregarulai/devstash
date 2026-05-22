import { Clock } from 'lucide-react';
import { MOCK_ITEMS, typeIcons } from '@/lib/mock-data';

const recentItems = [...MOCK_ITEMS].sort(
  (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
);

export function RecentItems() {
  return (
    <section className='rounded-xl border border-border bg-card'>
      <div className='flex items-center gap-2 border-b border-border px-6 py-4'>
        <Clock className='h-4 w-4 text-muted-foreground' />
        <h2 className='text-lg font-semibold'>Recent Items</h2>
      </div>
      <div className='divide-y divide-border'>
        {recentItems.map((item) => (
          <div
            key={item.id}
            className='flex items-center gap-4 px-6 py-3 transition-colors hover:bg-muted/50'
          >
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted'>
              {typeIcons[item.type.name]}
            </div>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-medium'>{item.title}</p>
              <p className='truncate text-xs text-muted-foreground'>{item.description}</p>
            </div>
            <span className='shrink-0 rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground'>
              {item.type.name}
            </span>
            <span className='shrink-0 text-xs text-muted-foreground'>
              {new Date(item.updatedAt).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
