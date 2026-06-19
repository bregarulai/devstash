'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/button';
import { CollectionEditDialog } from '@/components/collections/collectionEditDialog/CollectionEditDialog';
import { DeleteCollectionDialog } from '@/components/collections/deleteCollectionDialog/DeleteCollectionDialog';
import { useDeleteCollection } from '@/hooks/useDeleteCollection/useDeleteCollection';

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

  const { isDeleting, deleteCollection } = useDeleteCollection(() => {
    setIsDeleteDialogOpen(false);
    router.push('/collections');
  });

  return (
    <>
      <div className='flex items-center gap-2'>
        <Button
          variant='ghost'
          size='sm'
          className={cn(
            'cursor-pointer',
            isFavorite && 'hover:bg-favorite/10',
          )}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star
            className={cn(
              'size-4',
              isFavorite
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
          size='icon'
          className='cursor-pointer'
          aria-label='Delete collection'
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          <Trash2 className='size-4' />
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
