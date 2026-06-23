'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/button';
import { CollectionEditDialog } from '@/components/collections/collectionEditDialog/CollectionEditDialog';
import { DeleteCollectionDialog } from '@/components/collections/deleteCollectionDialog/DeleteCollectionDialog';
import { useDeleteCollection } from '@/hooks/useDeleteCollection/useDeleteCollection';
import { toggleCollectionFavoriteAction } from '@/actions/collections/Collections';

interface CollectionActionsProps {
  collectionId: string;
  collectionName: string;
  collectionDescription: string | null;
  isFavorite: boolean;
}

export function CollectionActions({
  collectionId,
  collectionName,
  collectionDescription,
  isFavorite,
}: CollectionActionsProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [optimisticFavorite, setOptimisticFavorite] = useState(isFavorite);
  const [isPending, startTransition] = useTransition();

  const { isDeleting, deleteCollection } = useDeleteCollection(() => {
    setIsDeleteDialogOpen(false);
    router.push('/collections');
  });

  const handleFavoriteToggle = () => {
    const newValue = !optimisticFavorite;
    setOptimisticFavorite(newValue);
    startTransition(async () => {
      const result = await toggleCollectionFavoriteAction(collectionId, {
        isFavorite: newValue,
      });
      if (result.success) {
        toast.success(newValue ? 'Added to favorites' : 'Removed from favorites');
        router.refresh();
      } else {
        setOptimisticFavorite(!newValue);
        toast.error(result.error ?? 'Failed to update favorite');
      }
    });
  };

  return (
    <>
      <div className='flex items-center gap-2'>
        <Button
          variant='ghost'
          size='sm'
          className={cn(
            'cursor-pointer',
            optimisticFavorite && 'hover:bg-favorite/10',
          )}
          aria-label={optimisticFavorite ? 'Remove from favorites' : 'Add to favorites'}
          onClick={handleFavoriteToggle}
          disabled={isPending}
        >
          <Star
            className={cn(
              'size-4',
              optimisticFavorite
                ? 'fill-current text-favorite'
                : 'fill-none text-muted-foreground',
            )}
          />
          <span className='text-xs text-muted-foreground'>Favorite</span>
        </Button>
        <CollectionEditDialog
          collectionId={collectionId}
          collectionName={collectionName}
          collectionDescription={collectionDescription}
        />
        <Button
          variant='destructive'
          size='sm'
          className='cursor-pointer'
          aria-label='Delete collection'
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          <Trash2 className='size-4' />
          <span className='text-xs'>Delete</span>
        </Button>
      </div>

      <DeleteCollectionDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        collectionName={collectionName}
        isDeleting={isDeleting}
        onConfirm={() => deleteCollection(collectionId)}
      />
    </>
  );
}
