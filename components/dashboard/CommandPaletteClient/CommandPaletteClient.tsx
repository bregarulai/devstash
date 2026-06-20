'use client';

import { CommandPalette } from '../CommandPalette/CommandPalette';
import { useState, useEffect, useCallback, useRef } from 'react';
import { getSearchData, type SearchData } from '@/actions/search';
import { useCommandPalette } from '@/hooks/useCommandPalette/useCommandPalette';

export function CommandPaletteClient() {
  const { open, openPalette, closePalette } = useCommandPalette();
  const [isDark, setIsDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  );
  const [searchData, setSearchData] = useState<SearchData>({ items: [], collections: [] });
  const openRef = useRef(open);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    function down(e: KeyboardEvent) {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (openRef.current) {
          closePalette();
        } else {
          openPalette();
        }
      }
    }
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [openPalette, closePalette]);

  useEffect(() => {
    if (open) {
      getSearchData()
        .then(setSearchData)
        .catch((error) => {
          console.error('Failed to load search data:', error);
          setSearchData({ items: [], collections: [] });
        });
    }
  }, [open]);

  const toggleTheme = useCallback(() => {
    const html = document.documentElement;
    const next = !html.classList.contains('dark');
    html.classList.toggle('dark', next);
    setIsDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }, []);

  return (
    <CommandPalette
      open={open}
      onOpenChange={(isOpen) => {
        if (isOpen) openPalette();
        else closePalette();
      }}
      items={searchData.items}
      collections={searchData.collections}
      isDark={isDark}
      onToggleTheme={toggleTheme}
    />
  );
}
