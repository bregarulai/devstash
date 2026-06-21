'use client';

import { useRef, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface RevealProps {
  children: ReactNode;
  className?: string;
  rootMargin?: string;
  threshold?: number;
  defaultVisible?: boolean;
}

function getReducedMotionSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function subscribeToReducedMotion(callback: () => void) {
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

export function Reveal({
  children,
  className,
  rootMargin = '0px 0px -8% 0px',
  threshold = 0.12,
  defaultVisible = false,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
  const [isVisible, setIsVisible] = useState(defaultVisible || prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion || defaultVisible) return;

    const element = ref.current;
    if (!element) return;

    if (!('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [rootMargin, threshold, prefersReducedMotion, defaultVisible]);

  return (
    <div
      ref={ref}
      className={cn(
        'transition-[opacity,transform] duration-500 ease-out',
        prefersReducedMotion
          ? 'opacity-100 translate-y-0'
          : isVisible
            ? 'opacity-100 translate-y-0'
            : '[html[data-js]_&]:opacity-0 [html[data-js]_&]:translate-y-6',
        className
      )}
    >
      {children}
    </div>
  );
}
