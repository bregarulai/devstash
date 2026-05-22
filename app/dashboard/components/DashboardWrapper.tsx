'use client';

import { useState } from 'react';

import { TopBar } from './MobilSideBar';
import { Sidebar } from './Sidebar';

export function DashboardWrapper({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className='flex h-screen w-screen overflow-hidden'>
      {/* Sidebar — always visible, compact on mobile */}
      <div className='hidden lg:flex lg:shrink-0'>
        <Sidebar
          isExpanded={isExpanded}
          onToggle={() => setIsExpanded(!isExpanded)}
        />
      </div>

      {/* Mobile sidebar (compact, icons-only) */}
      <div className='flex w-14 shrink-0 lg:hidden'>
        <Sidebar
          isExpanded={false}
          onToggle={() => setIsExpanded(!isExpanded)}
        />
      </div>

      {/* Main content area */}
      <div className='flex min-w-0 flex-1 flex-col'>
        {/* Top bar */}
        <TopBar />

        {/* Page content */}
        <main className='flex-1 overflow-y-auto p-6 lg:p-8'>{children}</main>
      </div>
    </div>
  );
}
