'use client';

import { useState } from 'react';
import { SystemItemType, CollectionWithStats } from '@/types/db';
import { MobileSideBar } from '../mobileSideBar/MobileSideBar';
import { Sidebar } from '../sidebar/Sidebar';

export function DashboardWrapper({
  children,
  user,
  systemItemTypes,
  favoriteCollections,
  recentCollections,
}: {
  children: React.ReactNode;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    isPro: boolean;
  };
  systemItemTypes: SystemItemType[];
  favoriteCollections: CollectionWithStats[];
  recentCollections: CollectionWithStats[];
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  return (
    <div className='flex h-screen w-screen overflow-hidden'>
      {/* Sidebar — always visible, compact on mobile */}
      <div className='hidden lg:flex lg:shrink-0'>
        <Sidebar
          isExpanded={isExpanded}
          onToggle={() => setIsExpanded(!isExpanded)}
          systemItemTypes={systemItemTypes}
          favoriteCollections={favoriteCollections}
          recentCollections={recentCollections}
          user={user}
        />
      </div>

      {/* Mobile sidebar (compact, icons-only) */}
      <div className='flex w-14 shrink-0 lg:hidden'>
        <Sidebar
          isExpanded={isMobileExpanded}
          onToggle={() => setIsMobileExpanded(!isMobileExpanded)}
          systemItemTypes={systemItemTypes}
          favoriteCollections={favoriteCollections}
          recentCollections={recentCollections}
          user={user}
        />
      </div>

      {/* Main content area */}
      <div className='flex min-w-0 flex-1 flex-col'>
        {/* Top bar */}
        <MobileSideBar />

        {/* Page content */}
        <main className='flex-1 overflow-y-auto p-6 lg:p-8'>{children}</main>
      </div>
    </div>
  );
}
