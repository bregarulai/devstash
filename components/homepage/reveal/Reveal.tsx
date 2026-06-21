'use client';

import { useRef, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type RevealVariant = 'fade' | 'scale' | 'fast' | 'stagger';

interface RevealProps {
  children: ReactNode;
  className?: string;
  rootMargin?: string;
  threshold?: number;
  defaultVisible?: boolean;
  variant?: RevealVariant;
  delay?: number;
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

const VARIANT_STYLES: Record<RevealVariant, { hidden: string; visible: string; transition: string }> = {
  fade: {
    hidden: '[html[data-js]_&]:opacity-0 [html[data-js]_&]:translate-y-5',
    visible: 'opacity-100 translate-y-0',
    transition: 'transition-[opacity,transform] duration-500 ease-out',
  },
  scale: {
    hidden: '[html[data-js]_&]:opacity-0 [html[data-js]_&]:scale-95',
    visible: 'opacity-100 scale-100',
    transition: 'transition-[opacity,transform] duration-600 ease-out',
  },
  fast: {
    hidden: '[html[data-js]_&]:opacity-0 [html[data-js]_&]:translate-y-3',
    visible: 'opacity-100 translate-y-0',
    transition: 'transition-[opacity,transform] duration-300 ease-out',
  },
  stagger: {
    hidden: '[html[data-js]_&]:opacity-0 [html[data-js]_&]:translate-y-4',
    visible: 'opacity-100 translate-y-0',
    transition: 'transition-[opacity,transform] duration-400 ease-out',
  },
};

export function Reveal({
  children,
  className,
  rootMargin = '0px 0px -8% 0px',
  threshold = 0.12,
  defaultVisible = false,
  variant = 'fade',
  delay,
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

  const styles = VARIANT_STYLES[variant];

  return (
    <div
      ref={ref}
      className={cn(
        styles.transition,
        prefersReducedMotion
          ? styles.visible
          : isVisible
            ? styles.visible
            : styles.hidden,
        className
      )}
      style={delay !== undefined ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
