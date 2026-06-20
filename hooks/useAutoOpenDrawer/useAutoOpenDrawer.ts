'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useItemDrawer } from '@/components/items/itemDrawer/ItemDrawerProvider';

export function useAutoOpenDrawer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { openDrawer } = useItemDrawer();

  useEffect(() => {
    const itemId = searchParams.get('itemId');
    if (itemId) {
      openDrawer(itemId);
      const url = new URL(window.location.href);
      url.searchParams.delete('itemId');
      router.replace(url.pathname + url.search);
    }
  }, [searchParams, openDrawer, router]);
}
