'use client';

import { useEditorPreferences } from '@/contexts/editorPreferencesContext/EditorPreferencesContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';

const FONT_SIZE_OPTIONS = [
  { value: 10, label: '10px' },
  { value: 12, label: '12px' },
  { value: 13, label: '13px' },
  { value: 14, label: '14px' },
  { value: 16, label: '16px' },
  { value: 18, label: '18px' },
  { value: 20, label: '20px' },
  { value: 24, label: '24px' },
];

const TAB_SIZE_OPTIONS = [
  { value: 2, label: '2 spaces' },
  { value: 4, label: '4 spaces' },
  { value: 8, label: '8 spaces' },
];

const THEME_OPTIONS = [
  { value: 'vs-dark', label: 'VS Dark' },
  { value: 'monokai', label: 'Monokai' },
  { value: 'github-dark', label: 'GitHub Dark' },
];

export function EditorPreferencesForm() {
  const { preferences, updatePreference, isLoading, isLoaded } = useEditorPreferences();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Editor Preferences</CardTitle>
          {isLoading && <Skeleton className="size-4 rounded-full" />}
        </div>
        <CardDescription>
          Configure font size, tab width, and theme for the code editor. Changes save instantly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isLoaded ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-20" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3.5 w-56" />
              </div>
              <Skeleton className="h-5 w-9 rounded-full" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3.5 w-52" />
              </div>
              <Skeleton className="h-5 w-9 rounded-full" />
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="font-size">Font Size</Label>
                <Select
                  value={preferences.fontSize.toString()}
                  onValueChange={(value) => updatePreference('fontSize', parseInt(value, 10))}
                >
                  <SelectTrigger id="font-size">
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_SIZE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tab-size">Tab Size</Label>
                <Select
                  value={preferences.tabSize.toString()}
                  onValueChange={(value) => updatePreference('tabSize', parseInt(value, 10))}
                >
                  <SelectTrigger id="tab-size">
                    <SelectValue placeholder="Select tab size" />
                  </SelectTrigger>
                  <SelectContent>
                    {TAB_SIZE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={preferences.theme}
                  onValueChange={(value) =>
                    updatePreference('theme', value as 'vs-dark' | 'monokai' | 'github-dark')
                  }
                >
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {THEME_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="word-wrap">Word Wrap</Label>
                  <p className="text-sm text-muted-foreground">
                    Wrap long lines to fit within the editor
                  </p>
                </div>
                <Switch
                  id="word-wrap"
                  checked={preferences.wordWrap}
                  onCheckedChange={(checked) => updatePreference('wordWrap', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="minimap">Minimap</Label>
                  <p className="text-sm text-muted-foreground">
                    Show a minimap overview of your code
                  </p>
                </div>
                <Switch
                  id="minimap"
                  checked={preferences.minimap}
                  onCheckedChange={(checked) => updatePreference('minimap', checked)}
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
