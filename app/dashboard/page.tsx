'use client';

import { Sidebar } from './components/sidebar';
import { TopBar } from './components/top-bar';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function DashboardPage() {
  return (
    <div className='flex h-screen w-screen'>
      {/* Mobile header with menu button */}
      <div className='fixed inset-x-0 top-0 z-40 flex h-16 items-center border-b border-border bg-background px-4 lg:hidden'>
        <Sheet>
          <SheetTrigger asChild>
            <button className='p-2 text-muted-foreground hover:text-foreground'>
              <Menu className='h-6 w-6' />
            </button>
          </SheetTrigger>
          <SheetContent side='left' className='w-64 p-0'>
            <Sidebar />
          </SheetContent>
        </Sheet>
        <span className='ml-2 text-lg font-bold'>DevStash</span>
      </div>

      {/* Sidebar - responsive */}
      <div className='hidden lg:block lg:w-64 lg:shrink-0'>
        <Sidebar />
      </div>

      {/* Main content */}
      <div className='flex min-w-0 flex-1 flex-col'>
        <TopBar />
        <main className='min-w-0 flex-1 p-6'>
          <h2 className='text-2xl font-semibold'>Main</h2>
        </main>
      </div>
    </div>
  );
}
