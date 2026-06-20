import { useState, useCallback } from 'react';
import type { ItemWithDetails } from '@/types/db';
import { getItemAction } from '@/actions';

export function useItemDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [item, setItem] = useState<ItemWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const openDrawer = useCallback(async (itemId: string) => {
    setIsOpen(true);
    setItem(null);
    setIsLoading(true);
    setError(null);
    setIsEditing(false);

    try {
      const result = await getItemAction(itemId);

      if (!result.success) {
        throw new Error(result.error);
      }

      setItem(result.data);
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
    setIsEditing(false);
  }, []);

  const updateItem = useCallback((updates: Partial<ItemWithDetails>) => {
    setItem((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  const startEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  const stopEditing = useCallback(() => {
    setIsEditing(false);
  }, []);

  return {
    isOpen,
    item,
    isLoading,
    error,
    isEditing,
    openDrawer,
    closeDrawer,
    updateItem,
    startEditing,
    stopEditing,
  };
}
