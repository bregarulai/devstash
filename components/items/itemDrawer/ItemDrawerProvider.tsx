'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useItemDrawer as useItemDrawerHook } from '@/hooks/useItemDrawer/useItemDrawer';

interface ItemDrawerContextValue {
  isOpen: boolean;
  item: ReturnType<typeof useItemDrawerHook>['item'];
  isLoading: boolean;
  error: string | null;
  isEditing: boolean;
  isPro: boolean;
  openDrawer: (itemId: string) => Promise<void>;
  closeDrawer: () => void;
  updateItem: ReturnType<typeof useItemDrawerHook>['updateItem'];
  startEditing: () => void;
  stopEditing: () => void;
}

const ItemDrawerContext = createContext<ItemDrawerContextValue | null>(null);

export function ItemDrawerProvider({
  children,
  isPro,
}: { children: ReactNode; isPro?: boolean }) {
  const drawer = useItemDrawerHook();

  return (
    <ItemDrawerContext.Provider value={{ ...drawer, isPro: isPro ?? false }}>
      {children}
    </ItemDrawerContext.Provider>
  );
}

export function useItemDrawer() {
  const context = useContext(ItemDrawerContext);

  if (!context) {
    throw new Error('useItemDrawer must be used within ItemDrawerProvider');
  }

  return context;
}
