import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Pin, Copy, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useItemActions } from '@/hooks/useItemActions/useItemActions';
import { deleteItemAction } from '@/actions';
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
  onMutate?: () => void;
  onClose?: () => void;
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
  onMutate,
  onClose,
}: DrawerActionsProps) {
  const router = useRouter();
  const { isFavoriting, isPinning, handleFavorite, handlePin, handleCopy } =
    useItemActions(item, updateItem, onMutate);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteItemAction(item.id);

      if (result.success) {
        toast.success('Item deleted');
        setIsDeleteDialogOpen(false);
        router.refresh();
        onMutate?.();
        onClose?.();
      } else {
        toast.error(result.error ?? 'Failed to delete item');
      }
    } catch {
      toast.error('Failed to delete item');
    } finally {
      setIsDeleting(false);
    }
  };

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
    <>
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
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className='size-4' />
          </Button>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{item.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant='destructive'
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className='size-4 animate-spin' />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
