'use client';

import {
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
import {
  Folder,
  Heart,
  Plus,
  Moon,
  Sun,
  Settings,
  Home,
} from 'lucide-react';

const paletteTypes = ITEM_TYPES.map((type) => ({
  name: type.label,
  icon: type.icon,
  href: `/items/${type.value}`,
  color: `text-${type.value}`,
}));

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function CommandPalette({ open, onOpenChange, isDark, onToggleTheme }: CommandPaletteProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!mounted) return null;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem
            value="dashboard"
            onSelect={() => { window.location.href = '/dashboard'; }}
          >
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
            <CommandShortcut>Go</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="collections"
            onSelect={() => { window.location.href = '/collections'; }}
          >
            <Folder className="mr-2 h-4 w-4" />
            <span>Collections</span>
            <CommandShortcut>Go</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="favorites"
            onSelect={() => { window.location.href = '/collections?favorite=true'; }}
          >
            <Heart className="mr-2 h-4 w-4" />
            <span>Favorites</span>
            <CommandShortcut>Go</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="settings"
            onSelect={() => { window.location.href = '/settings'; }}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <CommandShortcut>Go</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Item Types">
          {paletteTypes.map((type) => (
            <CommandItem
              key={type.name}
              value={type.name.toLowerCase()}
              onSelect={() => { window.location.href = type.href; }}
            >
              <type.icon className={`mr-2 h-4 w-4 ${type.color}`} />
              <span>Browse {type.name}s</span>
              <CommandShortcut>Go</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Create">
          <CommandItem
            value="new-collection"
            onSelect={() => { window.location.href = '/collections/new'; }}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>New collection</span>
            <CommandShortcut>Ctrl+N</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="new-item"
            onSelect={() => { window.location.href = '/collect'; }}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Save new item</span>
            <CommandShortcut>Ctrl+S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Appearance">
          <CommandItem
            value={isDark ? 'light-mode' : 'dark-mode'}
            onSelect={onToggleTheme}
          >
            {isDark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
            <span>{isDark ? 'Switch to light mode' : 'Switch to dark mode'}</span>
            <CommandShortcut>Toggle</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
