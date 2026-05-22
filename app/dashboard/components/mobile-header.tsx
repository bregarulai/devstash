'use client';

import { Sidebar } from '@/app/dashboard/components/sidebar';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export function MobileHeader() {
  return (
    <div className='fixed inset-x-0 top-0 z-40 flex h-16 items-center border-b border-border bg-background px-4 lg:hidden'>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant='outline'
            className='p-2 text-muted-foreground hover:text-foreground'
          >
            <Menu className='h-6 w-6' />
          </Button>
        </SheetTrigger>
        <SheetContent side='left' className='w-64 p-0'>
          <Sidebar />
        </SheetContent>
      </Sheet>
      <span className='ml-2 text-lg font-bold'>DevStash</span>
    </div>
  );
}
