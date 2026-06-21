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
}

export function MobileSideBar({ onMenuToggle }: MobileSideBarProps) {
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false);

  return (
    <>
      <header className='flex align-middle sticky top-0 z-30 h-16 shrink-0 items-center gap-2 bg-background px-4 sm:px-6'>
        {onMenuToggle && (
          <Button
            variant='ghost'
            size='icon'
            className='lg:hidden'
            onClick={onMenuToggle}
          >
            <Menu className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        )}

        <div className='flex-1' />

        <div className='flex sm:hidden'>
          <SearchBar iconOnly />
        </div>
        <div className='hidden sm:flex sm:w-full sm:max-w-md lg:absolute lg:left-1/2 lg:-translate-x-1/2'>
          <SearchBar />
        </div>

        <div className='flex items-center gap-2 shrink-0 ml-auto'>
          <Button variant='ghost' size='icon' asChild>
            <Link href='/favorites'>
              <Star className='h-4 w-4' />
              <span className='sr-only'>Favorites</span>
            </Link>
          </Button>
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
      </header>
      <Separator />
      <ItemCreateDialog open={itemDialogOpen} onOpenChange={setItemDialogOpen} />
      <CollectionCreateDialog open={collectionDialogOpen} onOpenChange={setCollectionDialogOpen} />
    </>
  );
}
