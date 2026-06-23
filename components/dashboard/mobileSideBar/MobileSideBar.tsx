'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, Plus, FolderDown, Menu } from 'lucide-react';
import { SearchBar } from '../searchBar/SearchBar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ItemCreateDialog } from '@/components/items/itemCreateDialog/ItemCreateDialog';
import { CollectionCreateDialog } from '@/components/collections/collectionCreateDialog/CollectionCreateDialog';

interface MobileSideBarProps {
  onMenuToggle?: () => void;
  isPro?: boolean;
}

export function MobileSideBar({ onMenuToggle, isPro = false }: MobileSideBarProps) {
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false);

  return (
    <>
      <header className='flex items-center sticky top-0 z-30 h-16 shrink-0 bg-background px-4 sm:px-6'>
        {/* Left: menu button (mobile only) */}
        <div className='flex items-center justify-start w-20 shrink-0 lg:hidden'>
          {onMenuToggle && (
            <Button
              variant='ghost'
              size='icon'
              onClick={onMenuToggle}
            >
              <Menu className='h-4 w-4' />
              <span className='sr-only'>Open menu</span>
            </Button>
          )}
        </div>

        {/* Center: search bar */}
        <div className='flex-1 flex justify-center'>
          <div className='w-full max-w-md'>
            <SearchBar />
          </div>
        </div>

        {/* Right: action buttons */}
        <div className='flex items-center justify-end gap-2 shrink-0'>
          <Button variant='ghost' size='icon' asChild>
            <Link href='/favorites'>
              <Star className='h-4 w-4' />
              <span className='sr-only'>Favorites</span>
            </Link>
          </Button>
          {/* Mobile: dropdown with + icon */}
          <div className='lg:hidden'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size='icon' variant='ghost'>
                  <Plus className='h-4 w-4' />
                  <span className='sr-only'>Create</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onSelect={() => setItemDialogOpen(true)}>
                  <Plus className='mr-2 h-4 w-4' />
                  New Item
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setCollectionDialogOpen(true)}>
                  <FolderDown className='mr-2 h-4 w-4' />
                  New Collection
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* Desktop: full buttons */}
          <div className='hidden lg:flex items-center gap-2'>
            <Button size='sm' variant='outline' onClick={() => setItemDialogOpen(true)}>
              <Plus className='mr-2 h-4 w-4' />
              New Item
            </Button>
            <Button size='sm' onClick={() => setCollectionDialogOpen(true)}>
              <FolderDown className='mr-2 h-4 w-4' />
              New Collection
            </Button>
          </div>
        </div>
      </header>
      <Separator />
      <ItemCreateDialog open={itemDialogOpen} onOpenChange={setItemDialogOpen} isPro={isPro} />
      <CollectionCreateDialog open={collectionDialogOpen} onOpenChange={setCollectionDialogOpen} />
    </>
  );
}
