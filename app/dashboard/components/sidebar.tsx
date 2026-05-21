'use client';

import { useState } from 'react';
import { MOCK_COLLECTIONS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Code,
  FolderOpen,
  Heart,
  LayoutGrid,
  Link2,
  Sparkles,
  StickyNote,
  Terminal,
} from 'lucide-react';

interface NavItem {
  name: string;
  icon: React.ElementType;
  href: string;
  color: string;
}

const navItems: NavItem[] = [
  { name: 'All', icon: LayoutGrid, href: '/items/all', color: '#6b7280' },
  { name: 'Snippets', icon: Code, href: '/items/snippets', color: '#3b82f6' },
  { name: 'Prompts', icon: Sparkles, href: '/items/prompts', color: '#8b5cf6' },
  { name: 'Commands', icon: Terminal, href: '/items/commands', color: '#f97316' },
  { name: 'Notes', icon: StickyNote, href: '/items/notes', color: '#eab308' },
  { name: 'Files', icon: Code, href: '/items/files', color: '#6b7280' },
  { name: 'Images', icon: Code, href: '/items/images', color: '#ec4899' },
  { name: 'Links', icon: Link2, href: '/items/links', color: '#10b981' },
];

function getItemIcon(icon: React.ElementType, color: string, className?: string) {
  const Icon = icon;
  return <Icon className={className} style={{ color }} />;
}

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSection, setExpandedSection] = useState<'favorites' | 'recent'>('favorites');

  const favoriteCollections = MOCK_COLLECTIONS.filter((c) => c.isFavorite);
  const recentCollections = MOCK_COLLECTIONS.slice(0, 4);

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-border bg-background transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-[52px]' : 'w-64',
      )}
    >
      {/* Logo / Header */}
      <div className='flex h-16 items-center justify-between px-4'>
        {!isCollapsed && <span className='text-lg font-bold'>DevStash</span>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className='flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-muted'
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className='h-4 w-4' /> : <ChevronLeft className='h-4 w-4' />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className='flex-1 space-y-1 overflow-y-auto px-2 pt-4'>
        {navItems.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted',
              isCollapsed ? 'justify-center' : 'px-3',
              'text-muted-foreground hover:text-foreground',
            )}
            title={isCollapsed ? item.name : undefined}
          >
            {getItemIcon(item.icon, item.color)}
            {!isCollapsed && <span>{item.name}</span>}
          </a>
        ))}
      </nav>

      {/* Collections Section */}
      {!isCollapsed && (
        <div className='mt-4'>
          <div className='mb-2 flex items-center justify-between px-2'>
            <h3 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              Collections
            </h3>
            <button
              onClick={() =>
                setExpandedSection(expandedSection === 'favorites' ? 'recent' : 'favorites')
              }
              className='text-xs text-muted-foreground hover:text-foreground'
            >
              {expandedSection === 'favorites' ? 'Hide' : 'Show'}
            </button>
          </div>

          {/* Favorite Collections */}
          {expandedSection === 'favorites' && (
            <div className='space-y-1'>
              <h4 className='flex items-center gap-2 px-2 pt-2 text-xs font-medium text-muted-foreground'>
                <Heart className='h-3 w-3' />
                Favorites
              </h4>
              <div className='space-y-0.5'>
                {favoriteCollections.length > 0 ? (
                  favoriteCollections.map((col) => (
                    <a
                      key={col.id}
                      href={`/collections/${col.id}`}
                      className='flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground'
                    >
                      <FolderOpen className='h-3.5 w-3.5' />
                      <span className='truncate'>{col.name}</span>
                    </a>
                  ))
                ) : (
                  <p className='px-2 py-1 text-xs text-muted-foreground'>No favorites yet</p>
                )}
              </div>
            </div>
          )}

          {/* Recent Collections */}
          {expandedSection === 'recent' && (
            <div className='space-y-1'>
              <h4 className='mb-1 flex items-center gap-2 px-2 pt-2 text-xs font-medium text-muted-foreground'>
                <FolderOpen className='h-3 w-3' />
                Recent
              </h4>
              <div className='space-y-0.5'>
                {recentCollections.map((col) => (
                  <a
                    key={col.id}
                    href={`/collections/${col.id}`}
                    className='flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground'
                  >
                    <FolderOpen className='h-3.5 w-3.5' />
                    <span className='truncate'>{col.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Spacer between collections and user area */}
      <div className='flex-1' />

      {/* User Avatar Area */}
      <div className={cn('border-t border-border p-3', isCollapsed ? 'flex justify-center' : '')}>
        <div className='flex items-center gap-3'>
          <div className='flex h-8 w-8 flex-none items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold'>
            JD
          </div>
          {!isCollapsed && (
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-medium'>John Doe</p>
              <p className='truncate text-xs text-muted-foreground'>demo@devstash.ai</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
