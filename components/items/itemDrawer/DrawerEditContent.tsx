'use client';

import { useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';
import { formatDaysAgo } from '@/lib/utils/utils';
import { CodeEditor } from '@/components/codeEditor/CodeEditor/CodeEditor';
import { LanguageSelect } from '@/components/codeEditor/LanguageSelect/LanguageSelect';
import { MarkdownEditor } from '@/components/markdownEditor/MarkdownEditor/MarkdownEditor';
import { CollectionPicker } from '@/components/collections/collectionPicker/CollectionPicker';
import { AiTagSuggestions } from '@/components/ai/aiTagSuggestions/AiTagSuggestions';
import { AiDescription } from '@/components/ai/aiDescription/AiDescription';
import type { ItemWithDetails } from '@/types/db';
import { CODE_EDITOR_TYPES, MARKDOWN_EDITOR_TYPES, SHOW_CONTENT, SHOW_LANGUAGE, SHOW_URL } from '@/lib/constants';

export interface DrawerEditContentHandle {
  getFormData: () => {
    title: string;
    description: string | null;
    content: string | null | undefined;
    url: string | null | undefined;
    language: string | null | undefined;
    tags: string[];
    collectionIds: string[];
  };
  hasUnsavedChanges: () => boolean;
}

interface DrawerEditContentProps {
  item: ItemWithDetails;
  isPro: boolean;
  onCanSaveChange: (canSave: boolean) => void;
}

export const DrawerEditContent = forwardRef<DrawerEditContentHandle, DrawerEditContentProps>(
  function DrawerEditContent({ item, isPro, onCanSaveChange }, ref) {
    const [title, setTitle] = useState(item.title);
    const [description, setDescription] = useState(item.description ?? '');
    const [content, setContent] = useState(item.content ?? '');
    const [url, setUrl] = useState(item.url ?? '');
    const [language, setLanguage] = useState(item.language ?? '');
    const [tagInput, setTagInput] = useState(item.tags.map((t) => t.name).join(', '));
    const [collectionIds, setCollectionIds] = useState<string[]>(
      item.collections?.map((c) => c.id) ?? [],
    );

    const typeName = item.itemType.name.toLowerCase();
    const showContent = SHOW_CONTENT.includes(typeName);
    const showLanguage = SHOW_LANGUAGE.includes(typeName);
    const showUrl = SHOW_URL.includes(typeName);
    const showCodeEditor = CODE_EDITOR_TYPES.includes(typeName);
    const showMarkdownEditor = MARKDOWN_EDITOR_TYPES.includes(typeName);

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
        collectionIds,
      }),
      [title, description, content, url, language, tagInput, collectionIds, showContent, showUrl, showLanguage],
    );

    useImperativeHandle(ref, () => ({
      getFormData,
      hasUnsavedChanges: () => {
        const initialTags = item.tags.map((t) => t.name).join(', ');
        const initialCollections = item.collections?.map((c) => c.id) ?? [];
        return (
          title.trim() !== item.title ||
          (description.trim() || null) !== (item.description ?? null) ||
          (showContent ? (content.trim() || null) : undefined) !== (item.content ?? null) ||
          (showUrl ? (url.trim() || null) : undefined) !== (item.url ?? null) ||
          (showLanguage ? (language.trim() || null) : undefined) !== (item.language ?? null) ||
          tagInput.trim() !== initialTags ||
          collectionIds.toSorted().join(',') !== initialCollections.toSorted().join(',')
        );
      },
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
          <div className='flex items-center justify-between gap-2'>
            <Label htmlFor='edit-description' className='text-xs font-medium text-muted-foreground'>
              Description
            </Label>
            <AiDescription
              isPro={isPro}
              getItemData={() => ({
                title,
                content: showContent ? content : '',
                language: showLanguage ? language : undefined,
                url: showUrl ? url : undefined,
                fileName: item.fileName ?? undefined,
                fileSize: item.fileSize ?? undefined,
              })}
              onAccept={(d) => setDescription(d)}
            />
          </div>
          <Textarea
            id='edit-description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Optional description'
            rows={2}
            className='resize-none'
          />
        </div>

        {showLanguage && (
          <div className='space-y-2'>
            <Label htmlFor='edit-language' className='text-xs font-medium text-muted-foreground'>
              Language
            </Label>
            <LanguageSelect
              id='edit-language'
              value={language}
              onChange={setLanguage}
            />
          </div>
        )}

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
            ) : showMarkdownEditor ? (
              <MarkdownEditor
                value={content}
                onChange={setContent}
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
          <AiTagSuggestions
            isPro={isPro}
            existingTags={tagInput
              .split(',')
              .map((t) => t.trim().toLowerCase())
              .filter(Boolean)}
            getItemData={() => ({
              title,
              content: showContent ? content : showUrl ? url : description,
              language,
            })}
            onAcceptTags={(accepted) => {
              const current = tagInput
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean);
              const merged = Array.from(new Set([...current, ...accepted]));
              setTagInput(merged.join(', '));
            }}
          />
        </div>

        <div className='space-y-2'>
          <Label className='text-xs font-medium text-muted-foreground'>
            Collections
          </Label>
          <CollectionPicker
            value={collectionIds}
            onChange={setCollectionIds}
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
