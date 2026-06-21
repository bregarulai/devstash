'use client';

import { useState } from 'react';
import { SystemItemType, CollectionWithStats } from '@/types/db';
import { MobileSideBar } from '../mobileSideBar/MobileSideBar';
import { Sidebar } from '../sidebar/Sidebar';
import { EditorPreferencesProvider } from '@/contexts/editorPreferencesContext/EditorPreferencesContext';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';

export function DashboardWrapperClient({
  children,
  user,
  systemItemTypes,
  favoriteCollections,
  recentCollections,
}: {
  children: React.ReactNode;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    isPro: boolean;
  };
  systemItemTypes: SystemItemType[];
  favoriteCollections: CollectionWithStats[];
  recentCollections: CollectionWithStats[];
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const sidebarProps = {
    isExpanded,
    onToggle: () => setIsExpanded(!isExpanded),
    systemItemTypes,
    favoriteCollections,
    recentCollections,
    user,
  };

  return (
    <EditorPreferencesProvider>
      <div className='flex h-screen w-screen overflow-hidden'>
        {/* Desktop sidebar — inline, collapsible */}
        <div className='hidden lg:flex lg:shrink-0'>
          <Sidebar {...sidebarProps} />
        </div>

        {/* Mobile sidebar — Sheet overlay */}
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetContent
            side='left'
            showCloseButton={false}
            className='w-64 p-0'
          >
            <SheetTitle className='sr-only'>Navigation</SheetTitle>
            <Sidebar
              isExpanded={true}
              onToggle={() => setIsMobileOpen(false)}
              systemItemTypes={systemItemTypes}
              favoriteCollections={favoriteCollections}
              recentCollections={recentCollections}
              user={user}
            />
          </SheetContent>
        </Sheet>

        {/* Main content area */}
        <div className='flex min-w-0 flex-1 flex-col'>
          {/* Top bar */}
          <MobileSideBar onMenuToggle={() => setIsMobileOpen(true)} isPro={user.isPro} />

          {/* Page content */}
          <main className='flex-1 overflow-y-auto p-6 lg:p-8'>{children}</main>
        </div>
      </div>
    </EditorPreferencesProvider>
  );
}