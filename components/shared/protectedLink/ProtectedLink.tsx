'use client';

import Link from 'next/link';
import { type ComponentProps, useCallback, useState, useRef } from 'react';
import { useUnsavedChanges } from '@/components/items/itemDrawer/UnsavedChangesProvider';
import { UnsavedChangesDialog } from '@/components/shared/UnsavedChangesDialog/UnsavedChangesDialog';

export function ProtectedLink({ onClick, ...props }: ComponentProps<typeof Link>) {
  const { hasUnsavedChanges } = useUnsavedChanges();
  const [showDialog, setShowDialog] = useState(false);
  const pendingEventRef = useRef<React.MouseEvent<HTMLAnchorElement> | null>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (hasUnsavedChanges()) {
        pendingEventRef.current = e;
        e.preventDefault();
        setShowDialog(true);
        return;
      }
      onClick?.(e);
    },
    [hasUnsavedChanges, onClick],
  );

  const handleConfirm = useCallback(() => {
    setShowDialog(false);
    const event = pendingEventRef.current;
    pendingEventRef.current = null;
    if (event && onClick) {
      onClick(event);
    }
  }, [onClick]);

  const handleCancel = useCallback(() => {
    setShowDialog(false);
    pendingEventRef.current = null;
  }, []);

  return (
    <>
      <Link {...props} onClick={handleClick} />
      <UnsavedChangesDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}
