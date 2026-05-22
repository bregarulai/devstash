'use client';

import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Sidebar } from './sidebar';

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant='outline'
          size='icon'
          className='lg:hidden p-2 text-muted-foreground hover:text-foreground'
        >
          <Menu className='h-5 w-5' />
        </Button>
      </SheetTrigger>
      <SheetContent side='left' className='w-64 p-0'>
        <Sidebar isExpanded={true} onToggle={() => {}} />
      </SheetContent>
    </Sheet>
  );
}
