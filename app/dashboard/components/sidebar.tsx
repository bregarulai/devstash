'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Collection } from '@/lib/mock-data';
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Heart,
  Folder,
} from 'lucide-react';

interface ItemType {
  name: 'snippet' | 'prompt' | 'command' | 'note' | 'file' | 'image' | 'link';
  icon: string;
  color: string;
  isSystem: boolean;
}

const ITEM_TYPES: ItemType[] = [
  { name: 'snippet', icon: 'Code', color: '#3b82f6', isSystem: true },
  { name: 'prompt', icon: 'Sparkles', color: '#8b5cf6', isSystem: true },
  { name: 'command', icon: 'Terminal', color: '#f97316', isSystem: true },
  { name: 'note', icon: 'StickyNote', color: '#fde047', isSystem: true },
  { name: 'file', icon: 'File', color: '#6b7280', isSystem: true },
  { name: 'image', icon: 'Image', color: '#ec4899', isSystem: true },
  { name: 'link', icon: 'Link', color: '#10b981', isSystem: true },
];

const typeIcons: Record<string, React.ReactNode> = {
  snippet: <Code className='h-4 w-4' />,
  prompt: <Sparkles className='h-4 w-4' />,
  command: <Terminal className='h-4 w-4' />,
  note: <StickyNote className='h-4 w-4' />,
  file: <File className='h-4 w-4' />,
  image: <Image className='h-4 w-4' />,
  link: <LinkIcon className='h-4 w-4' />,
};

const typePaths: Record<string, string> = {
  snippet: '/items/snippets',
  prompt: '/items/prompts',
  command: '/items/commands',
  note: '/items/note',
  file: '/items/files',
  image: '/items/images',
  link: '/items/links',
};

// Mock favorite collections
const favoriteCollections: Collection[] = [
  { id: 'col-1', name: 'React Patterns', itemCount: 12, isFavorite: true },
  { id: 'col-3', name: 'Context Files', itemCount: 5, isFavorite: true },
];

// Mock recent collections
const recentCollections: Collection[] = [
  { id: 'col-2', name: 'Python Snippets', itemCount: 8, isFavorite: false },
  { id: 'col-4', name: 'DevOps Commands', itemCount: 15, isFavorite: false },
  { id: 'col-5', name: 'AI Prompts', itemCount: 20, isFavorite: false },
];

function ItemTypeItem({ type }: { type: ItemType }) {
  const Icon = typeIcons[type.name];

  return (
    <Link
      href={typePaths[type.name]}
      className='group flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
    >
      <span className='flex h-5 w-5 shrink-0 items-center justify-center' style={{ color: type.color }}>
        {Icon}
      </span>
      <span className='truncate font-medium'>
        {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
      </span>
    </Link>
  );
}

function CollectionSection({
  title,
  collections,
  defaultOpen = true,
}: {
  title: string;
  collections: Collection[];
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className='mb-4'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex w-full items-center gap-1.5 px-2 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground'
      >
        {isOpen ? <ChevronDown className='h-3.5 w-3.5' /> : <ChevronRight className='h-3.5 w-3.5' />}
        {title}
      </button>
      {isOpen && (
        <div className='space-y-0.5'>
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.id}`}
              className='group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
            >
              {collection.isFavorite ? (
                <Heart className='h-4 w-4 fill-purple-500 text-purple-500' />
              ) : (
                <Folder className='h-4 w-4' />
              )}
              <span className='truncate'>{collection.name}</span>
              <span className='ml-auto text-xs text-muted-foreground'>{collection.itemCount}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='relative flex h-screen w-64 flex-col border-r border-border bg-background'>
      {/* Header */}
      <div className='flex h-16 items-center justify-between px-4'>
        <Link href='/' className='text-lg font-bold'>
          DevStash
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className='rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground'
        >
          {isOpen ? <ChevronLeft className='h-4 w-4' /> : <ChevronRight className='h-4 w-4' />}
        </button>
      </div>

      <div className='flex-1 overflow-y-auto p-2'>
        {/* Item Types */}
        <div className='mb-4'>
          <h3 className='mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
            Items
          </h3>
          <div className='space-y-0.5'>
            {ITEM_TYPES.map((type) => (
              <ItemTypeItem key={type.name} type={type} />
            ))}
          </div>
        </div>

        {/* Favorite Collections */}
        <CollectionSection title='Favorites' collections={favoriteCollections} />

        {/* Recent Collections */}
        <CollectionSection title='Recent' collections={recentCollections} />
      </div>

      {/* User Avatar */}
      <div className='border-t border-border p-3'>
        <div className='flex items-center gap-3 rounded-lg p-2'>
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground'>
            JD
          </div>
          <div className='flex-1 overflow-hidden'>
            <p className='truncate text-sm font-medium'>John Doe</p>
            <p className='truncate text-xs text-muted-foreground'>demo@devstash.ai</p>
          </div>
        </div>
      </div>
    </div>
  );
}
