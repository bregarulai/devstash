'use client'; // Required for ClientLoader interactivity (mounted state)

import { Code, Folder, Heart, Star } from 'lucide-react';
import { ClientLoader } from '../clientLoader/ClientLoader';
import { StatsCardsSkeleton } from '../skeletons/StatsCardsSkeleton';

interface StatsCardsProps {
  stats: {
    totalItems: number;
    totalCollections: number;
    favoriteItems: number;
    favoriteCollections: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
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
    <div className='flex flex-wrap items-center gap-6 py-4'>
      {data.map((stat, index) => (
        <div key={stat.label} className='flex items-center gap-2'>
          {index > 0 && <div className='h-4 w-px bg-border' />}
          <div className={`rounded-lg ${stat.bgColor} p-1.5`}>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </div>
          <div className='flex items-baseline gap-1.5'>
            <span className='text-lg font-semibold'>{stat.value}</span>
            <span className='text-xs text-muted-foreground'>{stat.label}</span>
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
