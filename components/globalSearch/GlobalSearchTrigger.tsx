'use client';

import { useCommandPalette } from '@/hooks/useCommandPalette/useCommandPalette';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function GlobalSearchTrigger() {
  const { openPalette } = useCommandPalette();
  const pathname = usePathname();

  if (pathname === '/dashboard') return null;

  return (
    <Button
      onClick={openPalette}
      size='icon'
      className='fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg sm:bottom-6 sm:right-6'
      aria-label='Open search (Ctrl+K)'
    >
      <Search className='h-5 w-5' />
    </Button>
  );
}
