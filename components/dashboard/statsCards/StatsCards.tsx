'use client'; // Required for ClientLoader interactivity (mounted state)

import { Code, Folder, Heart, Star } from 'lucide-react';
import { ClientLoader } from '../ClientLoader';
import { StatsCardsSkeleton } from '../skeletons/StatsCardsSkeleton';

interface StatsCardsProps {
  userId: string;
  stats: {
    totalItems: number;
    totalCollections: number;
    favoriteItems: number;
    favoriteCollections: number;
  };
}

export function StatsCards({ userId, stats }: StatsCardsProps) {
  const data = [
    {
      label: 'Total Items',
      value: stats.totalItems,
      icon: Code,
      color: 'text-snippet',
      bgColor: 'bg-snippet/10',
    },
    {
      label: 'Collections',
      value: stats.totalCollections,
      icon: Folder,
      color: 'text-prompt',
      bgColor: 'bg-prompt/10',
    },
    {
      label: 'Favorite Items',
      value: stats.favoriteItems,
      icon: Heart,
      color: 'text-image',
      bgColor: 'bg-image/10',
    },
    {
      label: 'Favorite Collections',
      value: stats.favoriteCollections,
      icon: Star,
      color: 'text-command',
      bgColor: 'bg-command/10',
    },
  ];

  const content = (
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

  return (
    <ClientLoader fallback={<StatsCardsSkeleton />}>
      {content}
    </ClientLoader>
  );
}
