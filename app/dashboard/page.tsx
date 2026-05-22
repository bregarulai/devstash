'use client';

import { useState } from 'react';
import { Sidebar } from './components/sidebar';
import { TopBar } from './components/top-bar';
import { Menu } from 'lucide-react';

export default function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className='flex h-screen w-screen'>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/50 lg:hidden'
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - responsive */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 lg:static lg:z-0 lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div className='flex min-w-0 flex-1 flex-col'>
        {/* Mobile header with menu button */}
        <div className='flex h-16 items-center border-b border-border bg-background px-4 lg:hidden'>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className='p-2 text-muted-foreground hover:text-foreground'
          >
            <Menu className='h-6 w-6' />
          </button>
          <span className='ml-2 text-lg font-bold'>DevStash</span>
        </div>

        <TopBar />
        <main className='min-w-0 flex-1 p-6'>
          <h2 className='text-2xl font-semibold'>Main</h2>
        </main>
      </div>
    </div>
  );
}
