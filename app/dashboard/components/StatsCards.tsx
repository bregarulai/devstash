import {
  Code,
  Folder,
  Heart,
  Star,
} from 'lucide-react';
import { MOCK_ITEMS, MOCK_COLLECTIONS, favoriteCollections } from '@/lib/mock-data';

const stats = [
  {
    label: 'Total Items',
    value: MOCK_ITEMS.length,
    icon: Code,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    label: 'Collections',
    value: MOCK_COLLECTIONS.length,
    icon: Folder,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    label: 'Favorite Items',
    value: MOCK_ITEMS.filter((i) => i.isFavorite).length,
    icon: Heart,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  {
    label: 'Favorite Collections',
    value: favoriteCollections.length,
    icon: Star,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
];

export function StatsCards() {
  return (
    <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
      {stats.map((stat) => (
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
