import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { toggleItemPinAction } from '@/actions';
import type { ItemWithDetails } from '@/types/db';

export function useItemActions(
  item: ItemWithDetails | null,
  updateItem: (data: Partial<ItemWithDetails>) => void,
  onMutate?: () => void,
) {
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [isPinning, setIsPinning] = useState(false);

  const handleFavorite = useCallback(async () => {
    if (!item) return;
    setIsFavoriting(true);
    try {
      const res = await fetch(`/api/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !item.isFavorite }),
      });
      if (!res.ok) throw new Error('Failed to update favorite');
      updateItem({ isFavorite: !item.isFavorite });
      onMutate?.();
      toast.success(
        item.isFavorite ? 'Removed from favorites' : 'Added to favorites',
      );
    } catch {
      toast.error('Failed to update favorite');
    } finally {
      setIsFavoriting(false);
    }
  }, [item, updateItem, onMutate]);

  const handlePin = useCallback(async () => {
    if (!item) return;
    setIsPinning(true);
    try {
      const result = await toggleItemPinAction(item.id);
      if (!result.success) throw new Error(result.error ?? 'Failed to update pin');
      updateItem({ isPinned: result.data });
      onMutate?.();
      toast.success(item.isPinned ? 'Unpinned item' : 'Pinned item');
    } catch {
      toast.error('Failed to update pin');
    } finally {
      setIsPinning(false);
    }
  }, [item, updateItem, onMutate]);

  const handleCopy = useCallback(async () => {
    if (!item?.content) {
      toast.error('No content to copy');
      return;
    }
    try {
      await navigator.clipboard.writeText(item.content);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  }, [item]);

  return {
    isFavoriting,
    isPinning,
    handleFavorite,
    handlePin,
    handleCopy,
  };
}
