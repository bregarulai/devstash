import { Star, Pin, Copy, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/button';
import { useItemActions } from '@/hooks/useItemActions/useItemActions';
import type { ItemWithDetails } from '@/types/db';

interface DrawerActionsProps {
  item: ItemWithDetails;
  updateItem: (data: Partial<ItemWithDetails>) => void;
  isEditing: boolean;
  onStartEditing: () => void;
  onStopEditing: () => void;
  isSaving: boolean;
  canSave: boolean;
  onSave: () => void;
}

export function DrawerActions({
  item,
  updateItem,
  isEditing,
  onStartEditing,
  onStopEditing,
  isSaving,
  canSave,
  onSave,
}: DrawerActionsProps) {
  const { isFavoriting, isPinning, handleFavorite, handlePin, handleCopy } =
    useItemActions(item, updateItem);

  if (isEditing) {
    return (
      <div className='flex items-center justify-end gap-2'>
        <Button
          variant='ghost'
          size='sm'
          onClick={onStopEditing}
          disabled={isSaving}
          className='cursor-pointer'
        >
          Cancel
        </Button>
        <Button
          size='sm'
          onClick={onSave}
          disabled={isSaving || !canSave}
          className='cursor-pointer'
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    );
  }

  return (
    <div className='flex items-center justify-between gap-2'>
      <div className='flex items-center gap-2'>
        <Button
          variant='ghost'
          size='sm'
          onClick={handleFavorite}
          disabled={isFavoriting}
          className={cn(
            'cursor-pointer',
            item.isFavorite && 'hover:bg-favorite/10',
            isFavoriting && 'opacity-50',
          )}
          aria-label={
            item.isFavorite
              ? 'Remove from favorites'
              : 'Add to favorites'
          }
        >
          <Star className={cn(
            'size-4',
            item.isFavorite ? 'fill-current text-favorite' : 'fill-none text-muted-foreground',
          )} />
          <span className='text-xs text-muted-foreground'>Favorite</span>
        </Button>
        <Button
          variant='ghost'
          size='sm'
          onClick={handlePin}
          disabled={isPinning}
          className={cn(
            'cursor-pointer',
            item.isPinned && 'bg-muted',
            isPinning && 'opacity-50',
          )}
          aria-label={item.isPinned ? 'Unpin item' : 'Pin item'}
        >
          <Pin className={cn(
            'size-4',
            item.isPinned ? 'text-foreground' : 'text-muted-foreground',
          )} />
          <span className='text-xs text-muted-foreground'>Pin</span>
        </Button>
        <Button
          variant='ghost'
          size='sm'
          onClick={handleCopy}
          className='cursor-pointer'
          aria-label='Copy content'
        >
          <Copy className='size-4' />
          <span className='text-xs text-muted-foreground'>Copy</span>
        </Button>
      </div>
      <div className='flex items-center gap-2'>
        <Button
          variant='ghost'
          size='sm'
          onClick={onStartEditing}
          className='cursor-pointer'
          aria-label='Edit item'
        >
          <Pencil className='size-4' />
          <span className='text-xs text-muted-foreground'>Edit</span>
        </Button>
        <Button
          variant='destructive'
          size='icon'
          className='cursor-pointer'
          aria-label='Delete item'
        >
          <Trash2 className='size-4' />
        </Button>
      </div>
    </div>
  );
}
