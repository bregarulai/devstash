'use client';

import { useState } from 'react';
import { MobileHeader } from './mobile-header';
import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';

export function DashboardLayout() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className='flex h-screen w-screen'>
      {/* Mobile header with menu button */}
      <MobileHeader />

      {/* Desktop sidebar */}
      <div className='hidden lg:block lg:shrink-0 lg:pt-16'>
        <div
          className={`transition-all duration-200 ${isExpanded ? 'w-64' : 'w-18'}`}
        >
          <Sidebar
            isExpanded={isExpanded}
            onToggle={() => setIsExpanded(!isExpanded)}
          />
        </div>
      </div>

      {/* Main content */}
      <div className='flex min-w-0 flex-1 flex-col lg:pt-16'>
        <TopBar />
        <main className='min-w-0 flex-1 p-6'>
          <h2 className='text-2xl font-semibold'>Main</h2>
        </main>
      </div>
    </div>
  );
}
