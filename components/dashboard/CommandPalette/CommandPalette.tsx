'use client';

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { useState, useEffect } from 'react';
import { ITEM_TYPES } from '@/lib/constants';
import type { ItemWithDetails, CollectionWithStats } from '@/types/db';
import {
  Folder,
  Heart,
  Moon,
  Sun,
  Settings,
  Home,
  Hash,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

function filterItem(query: string, value: string): number {
  const title = value.replace(/^item-/, '').toLowerCase();
  const search = query.toLowerCase();
  if (title.startsWith(search)) return 1;
  if (title.includes(search)) return 0.5;
  return 0;
}

function filterCollection(query: string, value: string): number {
  const name = value.replace(/^collection-/, '').toLowerCase();
  const search = query.toLowerCase();
  if (name.startsWith(search)) return 1;
  if (name.includes(search)) return 0.5;
  return 0;
}

const paletteTypes = ITEM_TYPES.map((type) => ({
  name: type.label,
  icon: type.icon,
  href: `/items/${type.value}`,
  color: `text-${type.value}`,
}));

const itemTypeIcons: Record<string, typeof ITEM_TYPES[number]['icon']> = Object.fromEntries(
  ITEM_TYPES.map((t) => [t.value, t.icon])
);

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ItemWithDetails[];
  collections: CollectionWithStats[];
  isDark: boolean;
  onToggleTheme: () => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  items,
  collections,
  isDark,
  onToggleTheme,
}: CommandPaletteProps) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!mounted) return null;

  function handleItemSelect(item: ItemWithDetails) {
    onOpenChange(false);
    const typeName = item.itemType?.name;
    if (typeName) {
      router.push(`/items/${typeName}?itemId=${item.id}`);
    }
  }

  function handleCollectionSelect(collection: CollectionWithStats) {
    onOpenChange(false);
    router.push(`/collections/${collection.id}`);
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command filter={(value, search) => {
        if (value.startsWith('item-')) return filterItem(search, value);
        if (value.startsWith('collection-')) return filterCollection(search, value);
        const label = value.replace(/^(type-|)/, '').replace(/-/g, ' ');
        return label.includes(search.toLowerCase()) ? 1 : 0;
      }}>
        <CommandInput placeholder='Search items, collections, or commands...' />
        <CommandList className='pt-2'>
        <CommandEmpty>No results found.</CommandEmpty>

        {items.length > 0 && (
          <CommandGroup heading='Items'>
            {items.map((item) => {
              const Icon = itemTypeIcons[item.itemType?.name ?? ''] ?? Hash;
              return (
                <CommandItem
                  key={item.id}
                  value={`item-${item.title}`}
                  onSelect={() => handleItemSelect(item)}
                >
                  <Icon className='mr-2 h-4 w-4 shrink-0' />
                  <span className='truncate'>{item.title}</span>
                  {item.description && (
                    <span className='ml-2 truncate text-muted-foreground text-xs'>
                      {item.description}
                    </span>
                  )}
                  <CommandShortcut>{item.itemType?.name}</CommandShortcut>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {items.length > 0 && collections.length > 0 && <CommandSeparator />}

        {collections.length > 0 && (
          <CommandGroup heading='Collections'>
            {collections.map((collection) => (
              <CommandItem
                key={collection.id}
                value={`collection-${collection.name}`}
                onSelect={() => handleCollectionSelect(collection)}
              >
                <Folder className='mr-2 h-4 w-4 shrink-0' />
                <span className='truncate'>{collection.name}</span>
                <CommandShortcut>{collection.itemCount} items</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />

        <CommandGroup heading='Navigation'>
          <CommandItem
            value='dashboard'
            onSelect={() => { onOpenChange(false); router.push('/dashboard'); }}
          >
            <Home className='mr-2 h-4 w-4' />
            <span>Dashboard</span>
            <CommandShortcut>Go</CommandShortcut>
          </CommandItem>
          <CommandItem
            value='collections-page'
            onSelect={() => { onOpenChange(false); router.push('/collections'); }}
          >
            <Folder className='mr-2 h-4 w-4' />
            <span>Collections</span>
            <CommandShortcut>Go</CommandShortcut>
          </CommandItem>
          <CommandItem
            value='favorites'
            onSelect={() => { onOpenChange(false); router.push('/collections?favorite=true'); }}
          >
            <Heart className='mr-2 h-4 w-4' />
            <span>Favorites</span>
            <CommandShortcut>Go</CommandShortcut>
          </CommandItem>
          <CommandItem
            value='settings'
            onSelect={() => { onOpenChange(false); router.push('/settings'); }}
          >
            <Settings className='mr-2 h-4 w-4' />
            <span>Settings</span>
            <CommandShortcut>Go</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading='Item Types'>
          {paletteTypes.map((type) => (
            <CommandItem
              key={type.name}
              value={`type-${type.name.toLowerCase()}`}
              onSelect={() => { onOpenChange(false); router.push(type.href); }}
            >
              <type.icon className={`mr-2 h-4 w-4 ${type.color}`} />
              <span>Browse {type.name}s</span>
              <CommandShortcut>Go</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading='Appearance'>
          <CommandItem
            value={isDark ? 'light-mode' : 'dark-mode'}
            onSelect={onToggleTheme}
          >
            {isDark ? <Sun className='mr-2 h-4 w-4' /> : <Moon className='mr-2 h-4 w-4' />}
            <span>{isDark ? 'Switch to light mode' : 'Switch to dark mode'}</span>
            <CommandShortcut>Toggle</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
      </Command>
    </CommandDialog>
  );
}
