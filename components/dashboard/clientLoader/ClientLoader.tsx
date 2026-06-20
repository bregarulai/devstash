'use client';

import { useSyncExternalStore } from 'react';

interface ClientLoaderProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

const emptySubscribe = () => () => {};

export function ClientLoader({ children, fallback }: ClientLoaderProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
