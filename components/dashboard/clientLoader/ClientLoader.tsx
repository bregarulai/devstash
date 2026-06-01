'use client';

import { useState } from 'react';

interface ClientLoaderProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

export function ClientLoader({ children, fallback }: ClientLoaderProps) {
  const [mounted] = useState(true);

  if (!mounted) {
    return fallback;
  }

  return <>{children}</>;
}
