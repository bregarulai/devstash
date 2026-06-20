'use client';

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { handleSignOut } from '@/actions';
import { useState } from 'react';

interface SidebarUserMenuProps {
  user: {
    name: string | null;
    email: string;
    image: string | null;
  };
  isExpanded: boolean;
}

export function SidebarUserMenu({ user, isExpanded }: SidebarUserMenuProps) {
  const [open, setOpen] = useState(false);

  const displayName = user.name || user.email || 'User';
  const displayImage = user.image || undefined;
  const fallbackName = (user.name || user.email || 'U').charAt(0).toUpperCase();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div
          className={`flex items-center justify-center gap-3 rounded-lg p-2 cursor-pointer hover:bg-accent transition-colors ${isExpanded ? '' : 'justify-center'}`}
          tabIndex={0}
          role="button"
          aria-label="User menu"
          aria-expanded={open}
        >
          <Avatar>
            <AvatarImage
              src={displayImage || ''}
              alt={displayName}
            />
            <AvatarFallback>{fallbackName}</AvatarFallback>
          </Avatar>

          {isExpanded && (
            <>
              <div className='flex-1 min-w-0'>
                <p className='truncate text-sm font-medium'>{displayName}</p>
                <p className='truncate text-xs text-muted-foreground'>{user.email}</p>
              </div>
              <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
            </>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={isExpanded ? 'top' : 'right'}
        align={isExpanded ? 'start' : 'center'}
        className={isExpanded ? 'w-[--radix-dropdown-menu-trigger-width]' : ''}
      >
        <DropdownMenuItem asChild>
          <Link href='/profile'>View Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href='/settings'>Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={handleSignOut}>
          <button type='submit' className='w-full'>
            <DropdownMenuItem className='text-red-500 cursor-pointer'>
              Sign out
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
