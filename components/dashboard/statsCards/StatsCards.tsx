import { Code, Folder, Heart, Star } from 'lucide-react';
import { getItemStats } from '@/lib/db/items';

interface StatsCardsProps {
  userId: string;
}

export async function StatsCards({ userId }: StatsCardsProps) {
  const result = {
    success: false,
    data: {
      totalItems: 0,
      totalCollections: 0,
      favoriteItems: 0,
      favoriteCollections: 0,
    } as Awaited<ReturnType<typeof getItemStats>>,
    error: null as Error | null,
  };

  try {
    result.data = await getItemStats(userId);
    result.success = true;
  } catch (error) {
    result.error = error instanceof Error ? error : new Error(String(error));
    console.error('Failed to fetch stats:', result.error);
  }

  const data = [
    {
      label: 'Total Items',
      value: result.data.totalItems,
      icon: Code,
      color: 'text-snippet',
      bgColor: 'bg-snippet/10',
    },
    {
      label: 'Collections',
      value: result.data.totalCollections,
      icon: Folder,
      color: 'text-prompt',
      bgColor: 'bg-prompt/10',
    },
    {
      label: 'Favorite Items',
      value: result.data.favoriteItems,
      icon: Heart,
      color: 'text-image',
      bgColor: 'bg-image/10',
    },
    {
      label: 'Favorite Collections',
      value: result.data.favoriteCollections,
      icon: Star,
      color: 'text-command',
      bgColor: 'bg-command/10',
    },
  ];

  return (
    <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
      {data.map((stat) => (
        <div
          key={stat.label}
          className='rounded-xl border border-border bg-card p-4 transition-colors hover:border-border/80'
        >
          <div className='flex items-center gap-3'>
            <div className={`rounded-lg ${stat.bgColor} p-2`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className='flex-1'>
              <p className='text-sm text-muted-foreground'>{stat.label}</p>
              <p className='text-2xl font-bold'>{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
