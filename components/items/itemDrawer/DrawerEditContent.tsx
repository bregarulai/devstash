'use client';

import { useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';
import { formatDaysAgo } from '@/lib/utils/utils';
import { CodeEditor } from '@/components/codeEditor/CodeEditor/CodeEditor';
import type { ItemWithDetails } from '@/types/db';
import { CODE_EDITOR_TYPES } from '@/lib/constants';

const EDITABLE_CONTENT_TYPES = ['snippet', 'prompt', 'command', 'note'];
const EDITABLE_LANGUAGE_TYPES = ['snippet', 'command'];
const EDITABLE_URL_TYPES = ['link'];

export interface DrawerEditContentHandle {
  getFormData: () => {
    title: string;
    description: string | null;
    content: string | null | undefined;
    url: string | null | undefined;
    language: string | null | undefined;
    tags: string[];
  };
}

interface DrawerEditContentProps {
  item: ItemWithDetails;
  onCanSaveChange: (canSave: boolean) => void;
}

export const DrawerEditContent = forwardRef<DrawerEditContentHandle, DrawerEditContentProps>(
  function DrawerEditContent({ item, onCanSaveChange }, ref) {
    const [title, setTitle] = useState(item.title);
    const [description, setDescription] = useState(item.description ?? '');
    const [content, setContent] = useState(item.content ?? '');
    const [url, setUrl] = useState(item.url ?? '');
    const [language, setLanguage] = useState(item.language ?? '');
    const [tagInput, setTagInput] = useState(item.tags.map((t) => t.name).join(', '));

    const typeName = item.itemType.name.toLowerCase();
    const showContent = EDITABLE_CONTENT_TYPES.includes(typeName);
    const showLanguage = EDITABLE_LANGUAGE_TYPES.includes(typeName);
    const showUrl = EDITABLE_URL_TYPES.includes(typeName);
    const showCodeEditor = CODE_EDITOR_TYPES.includes(typeName);

    useEffect(() => {
      onCanSaveChange(title.trim().length > 0);
    }, [title, onCanSaveChange]);

    const getFormData = useCallback(
      () => ({
        title: title.trim(),
        description: description.trim() || null,
        content: showContent ? (content.trim() || null) : undefined,
        url: showUrl ? (url.trim() || null) : undefined,
        language: showLanguage ? (language.trim() || null) : undefined,
        tags: tagInput
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      }),
      [title, description, content, url, language, tagInput, showContent, showUrl, showLanguage],
    );

    useImperativeHandle(ref, () => ({
      getFormData,
    }));

    return (
      <div className='space-y-4 py-6'>
        <div className='space-y-2'>
          <Label htmlFor='edit-title' className='text-xs font-medium text-muted-foreground'>
            Title <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='edit-title'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='Item title'
            className='h-9'
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='edit-description' className='text-xs font-medium text-muted-foreground'>
            Description
          </Label>
          <Textarea
            id='edit-description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Optional description'
            rows={2}
            className='resize-none'
          />
        </div>

        {showContent && (
          <div className='space-y-2'>
            <Label htmlFor='edit-content' className='text-xs font-medium text-muted-foreground'>
              Content
            </Label>
            {showCodeEditor ? (
              <CodeEditor
                value={content}
                onChange={setContent}
                language={language || 'plaintext'}
              />
            ) : (
              <Textarea
                id='edit-content'
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder='Content'
                rows={4}
                className='resize-none font-mono text-sm'
              />
            )}
          </div>
        )}

        {showUrl && (
          <div className='space-y-2'>
            <Label htmlFor='edit-url' className='text-xs font-medium text-muted-foreground'>
              URL
            </Label>
            <Input
              id='edit-url'
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder='https://...'
              className='h-9'
            />
          </div>
        )}

        {showLanguage && (
          <div className='space-y-2'>
            <Label htmlFor='edit-language' className='text-xs font-medium text-muted-foreground'>
              Language
            </Label>
            <Input
              id='edit-language'
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder='e.g. typescript, python'
              className='h-9'
            />
          </div>
        )}

        <div className='space-y-2'>
          <Label htmlFor='edit-tags' className='text-xs font-medium text-muted-foreground'>
            Tags
          </Label>
          <Input
            id='edit-tags'
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder='Comma-separated tags'
            className='h-9'
          />
        </div>

        <div className='space-y-1.5'>
          <div className='flex items-center gap-1.5 text-xs font-medium text-muted-foreground'>
            <Info className='h-3 w-3' />
            Details
          </div>
          <div className='space-y-1'>
            {item.createdAt && (
              <div className='text-xs text-muted-foreground'>
                Created {formatDaysAgo(item.createdAt)}
              </div>
            )}
            {item.updatedAt && (
              <div className='text-xs text-muted-foreground'>
                Updated {formatDaysAgo(item.updatedAt)}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);
