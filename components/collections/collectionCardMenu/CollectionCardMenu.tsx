'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Pencil, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CollectionEditDialog } from '@/components/collections/collectionEditDialog/CollectionEditDialog';
import { DeleteCollectionDialog } from '@/components/collections/deleteCollectionDialog/DeleteCollectionDialog';
import { useDeleteCollection } from '@/hooks/useDeleteCollection/useDeleteCollection';
import { toggleCollectionFavoriteAction } from '@/actions/collections/Collections';

interface CollectionCardMenuProps {
  collectionId: string;
  collectionName: string;
  collectionDescription: string | null;
  isFavorite: boolean;
}

export function CollectionCardMenu({
  collectionId,
  collectionName,
  collectionDescription,
  isFavorite,
}: CollectionCardMenuProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [optimisticFavorite, setOptimisticFavorite] = useState(isFavorite);
  const [isPending, startTransition] = useTransition();

  const { isDeleting, deleteCollection } = useDeleteCollection(() => {
    setIsDeleteDialogOpen(false);
    router.refresh();
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            className='size-8 cursor-pointer'
            aria-label='Collection actions'
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className='size-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setIsEditOpen(true);
            }}
            className='cursor-pointer'
          >
            <Pencil className='size-4' />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              handleFavoriteToggle();
            }}
            className='cursor-pointer'
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
            {optimisticFavorite ? 'Unfavorite' : 'Favorite'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setIsDeleteDialogOpen(true);
            }}
            className='cursor-pointer text-destructive focus:text-destructive'
          >
            <Trash2 className='size-4' />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CollectionEditDialog
        collectionId={collectionId}
        collectionName={collectionName}
        collectionDescription={collectionDescription}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        trigger={<span />}
      />

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
