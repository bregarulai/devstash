import { useState, useCallback } from 'react';
import type { ItemWithDetails } from '@/types/db';

export function useItemDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [item, setItem] = useState<ItemWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openDrawer = useCallback(async (itemId: string) => {
    setIsOpen(true);
    setItem(null);
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/items/${itemId}`);

      if (!res.ok) {
        throw new Error('Failed to fetch item');
      }

      const data = await res.json();
      setItem(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
    setItem(null);
    setError(null);
  }, []);

  const updateItem = useCallback((updates: Partial<ItemWithDetails>) => {
    setItem((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  return {
    isOpen,
    item,
    isLoading,
    error,
    openDrawer,
    closeDrawer,
    updateItem,
  };
}
