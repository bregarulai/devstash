'use client';

import { useState, useEffect } from 'react';
import { PanelLeft } from 'lucide-react';
import { Sidebar } from './components/sidebar';
import { TopBar } from './components/top-bar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobile) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile]);

  return (
    <div className='min-h-screen bg-background'>
      {/* Mobile overlay backdrop */}
      {isMobile && isSidebarOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/50'
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className='flex h-screen w-screen'>
        {/* Sidebar - always visible on desktop, drawer on mobile */}
        <div
          className={isMobile && !isSidebarOpen ? 'hidden' : ''}
        >
          <div className='flex h-full w-64 flex-col border-r border-border bg-background'>
            <Sidebar />
          </div>
        </div>

        {/* Main content area */}
        <div className='flex min-w-0 flex-1 flex-col'>
          <TopBar />
          <main className='min-w-0 flex-1 overflow-y-auto p-4 sm:p-6'>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
