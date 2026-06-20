'use client';

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

interface UnsavedChangesContextValue {
  registerCheckFn: (fn: () => boolean) => void;
  unregisterCheckFn: () => void;
  hasUnsavedChanges: () => boolean;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextValue | null>(null);

export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
  const checkFnRef = useRef<(() => boolean) | null>(null);
  const [registered, setRegistered] = useState(false);

  const registerCheckFn = useCallback((fn: () => boolean) => {
    checkFnRef.current = fn;
    setRegistered(true);
  }, []);

  const unregisterCheckFn = useCallback(() => {
    checkFnRef.current = null;
    setRegistered(false);
  }, []);

  const hasUnsavedChanges = useCallback(() => {
    if (!registered || !checkFnRef.current) return false;
    return checkFnRef.current();
  }, [registered]);

  return (
    <UnsavedChangesContext.Provider value={{ registerCheckFn, unregisterCheckFn, hasUnsavedChanges }}>
      {children}
    </UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChanges() {
  const context = useContext(UnsavedChangesContext);
  if (!context) {
    throw new Error('useUnsavedChanges must be used within UnsavedChangesProvider');
  }
  return context;
}
