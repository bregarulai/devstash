'use client';

import { CommandPalette } from '../CommandPalette/CommandPalette';
import { useState, useEffect, useCallback } from 'react';

export function CommandPaletteClient() {
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((current) => !current);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

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
      onOpenChange={setOpen}
      isDark={isDark}
      onToggleTheme={toggleTheme}
    />
  );
}
