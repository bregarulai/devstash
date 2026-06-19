import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState } from 'react';
import { handleSignOut } from '@/actions';

interface SidebarUserMenuProps {
  user: {
    name: string | null;
    email: string;
    image: string | null;
  };
  isExpanded: boolean;
}

export function SidebarUserMenu({ user, isExpanded }: SidebarUserMenuProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const displayName = user.name || user.email || 'User';
  const displayImage = user.image || undefined;
  const fallbackName = (user.name || user.email || 'U').charAt(0).toUpperCase();

  return (
    <>
      <div
        className={`flex items-center justify-center gap-3 rounded-lg p-2 cursor-pointer hover:bg-accent transition-colors ${isExpanded ? '' : 'justify-center'}`}
        onClick={() => setShowUserMenu(!showUserMenu)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowUserMenu(!showUserMenu); } }}
        tabIndex={0}
        role="button"
        aria-label="User menu"
        aria-expanded={showUserMenu}
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
            <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </>
        )}
      </div>

      {showUserMenu && (
        <div className={`absolute bottom-full ${isExpanded ? 'left-0 right-0' : 'left-1/2 -translate-x-1/2'} mb-2 bg-background border border-border rounded-lg shadow-lg z-50 py-1`}>
          <Link
            href='/profile'
            className={`block px-3 py-2 text-sm hover:bg-accent transition-colors ${!isExpanded ? 'text-center' : ''}`}
            onClick={() => setShowUserMenu(false)}
          >
            View Profile
          </Link>
          <form
            action={handleSignOut}
          >
            <button
              type='submit'
              className={`w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-accent transition-colors ${!isExpanded ? 'text-center' : ''}`}
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </>
  );
}
