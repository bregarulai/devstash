'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { toast } from 'sonner';
import {
  type EditorPreferences,
  DEFAULT_EDITOR_PREFERENCES,
} from '@/types/db';
import {
  updateEditorPreferencesAction,
  getEditorPreferencesAction,
} from '@/actions/editorPreferences/EditorPreferences';

interface EditorPreferencesContextValue {
  preferences: EditorPreferences;
  updatePreference: <K extends keyof EditorPreferences>(
    key: K,
    value: EditorPreferences[K],
  ) => void;
  isLoading: boolean;
  isLoaded: boolean;
}

export const EditorPreferencesContext = createContext<EditorPreferencesContextValue | null>(null);

export function useEditorPreferences() {
  const context = useContext(EditorPreferencesContext);
  if (!context) {
    throw new Error('useEditorPreferences must be used within EditorPreferencesProvider');
  }
  return context;
}

interface EditorPreferencesProviderProps {
  initialPreferences?: EditorPreferences;
  children: ReactNode;
}

export function EditorPreferencesProvider({
  initialPreferences,
  children,
}: EditorPreferencesProviderProps) {
  const [preferences, setPreferences] = useState<EditorPreferences>(
    initialPreferences ?? DEFAULT_EDITOR_PREFERENCES,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(!!initialPreferences);

  useEffect(() => {
    if (!initialPreferences) {
      getEditorPreferencesAction().then((result) => {
        if (result.success) {
          setPreferences(result.data);
        }
        setIsLoaded(true);
      });
    }
  }, [initialPreferences]);

  const savePreferences = useCallback((prefs: EditorPreferences) => {
    setIsLoading(true);
    updateEditorPreferencesAction(prefs).then((result) => {
      setIsLoading(false);
      if (result.success) {
        toast.success('Editor preferences saved');
      } else {
        toast.error(result.error);
      }
    });
  }, []);

  const updatePreference = useCallback(
    <K extends keyof EditorPreferences>(key: K, value: EditorPreferences[K]) => {
      let pending: EditorPreferences;
      setPreferences((prev) => {
        pending = { ...prev, [key]: value };
        return pending;
      });
      savePreferences(pending!);
    },
    [savePreferences],
  );

  return (
    <EditorPreferencesContext.Provider value={{ preferences, updatePreference, isLoading, isLoaded }}>
      {children}
    </EditorPreferencesContext.Provider>
  );
}
