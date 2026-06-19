import { useState } from 'react';
import { toast } from 'sonner';
import { deleteCollectionAction } from '@/actions';

export function useDeleteCollection(onSuccess?: () => void) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteCollection(collectionId: string) {
    setIsDeleting(true);

    try {
      const result = await deleteCollectionAction(collectionId);

      if (result.success) {
        toast.success('Collection deleted');
        onSuccess?.();
      } else {
        toast.error(result.error ?? 'Failed to delete collection');
      }
    } catch {
      toast.error('Failed to delete collection');
    } finally {
      setIsDeleting(false);
    }
  }

  return { isDeleting, deleteCollection };
}
