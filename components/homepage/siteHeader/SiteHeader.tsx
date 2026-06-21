'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';

interface SiteHeaderProps {
  isAuthenticated: boolean;
}

export function SiteHeader({ isAuthenticated }: SiteHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      const firstLink = panelRef.current?.querySelector<HTMLAnchorElement>('a, button');
      firstLink?.focus();
    } else {
      toggleRef.current?.focus();
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileMenu();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMobileMenuOpen, closeMobileMenu]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        closeMobileMenu();
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [isMobileMenuOpen, closeMobileMenu]);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-background/82 backdrop-blur-[14px] border-b border-border'
          : 'bg-transparent border-b-transparent'
      )}
    >
      <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center gap-5">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-lg tracking-tight"
          aria-label="DevStash home"
        >
          <span className="inline-flex" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
              <rect x="3" y="3" width="26" height="26" rx="7" fill="var(--color-brand)" />
              <path
                d="M11 21V11h6.5a3.5 3.5 0 0 1 0 7H14"
                stroke="#0b1020"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="text-foreground">DevStash</span>
        </Link>

        <div className="hidden lg:flex gap-6.5 ml-4.5">
          <a href="#features" className="text-muted-foreground text-sm font-medium hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#ai" className="text-muted-foreground text-sm font-medium hover:text-foreground transition-colors">
            AI
          </a>
          <a href="#pricing" className="text-muted-foreground text-sm font-medium hover:text-foreground transition-colors">
            Pricing
          </a>
        </div>

        <div className="hidden lg:flex gap-2.5 ml-auto">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/api/auth/signout">Sign Out</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost-border" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button variant="default" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        <button
          ref={toggleRef}
          className="lg:hidden inline-flex flex-col gap-1.5 ml-auto p-2 rounded-lg"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-[22px] h-[22px] text-foreground" />
          ) : (
            <Menu className="w-[22px] h-[22px] text-foreground" />
          )}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div
          ref={panelRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="lg:hidden flex flex-col gap-1.5 px-5 pb-4.5 bg-background/95 border-b border-border"
        >
          <a
            href="#features"
            className="py-3 min-h-11 px-1 text-sm text-muted-foreground font-medium"
            onClick={closeMobileMenu}
          >
            Features
          </a>
          <a
            href="#ai"
            className="py-3 min-h-11 px-1 text-sm text-muted-foreground font-medium"
            onClick={closeMobileMenu}
          >
            AI
          </a>
          <a
            href="#pricing"
            className="py-3 min-h-11 px-1 text-sm text-muted-foreground font-medium"
            onClick={closeMobileMenu}
          >
            Pricing
          </a>
          {isAuthenticated ? (
            <>
              <Button variant="ghost" className="mt-1.5" asChild>
                <Link href="/dashboard" onClick={closeMobileMenu}>
                  Dashboard
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/api/auth/signout" onClick={closeMobileMenu}>
                  Sign Out
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost-border" className="mt-1.5" asChild>
                <Link href="/sign-in" onClick={closeMobileMenu}>
                  Sign In
                </Link>
              </Button>
              <Button variant="default" asChild>
                <Link href="/register" onClick={closeMobileMenu}>
                  Get Started
                </Link>
              </Button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
