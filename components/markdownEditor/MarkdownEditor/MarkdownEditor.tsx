'use client';

import { useState, useCallback, useMemo } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Eye, Pencil } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils/utils';

interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  readOnly = false,
  className,
}: MarkdownEditorProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(readOnly ? 'preview' : 'write');

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  const contentHeight = useMemo(() => {
    const lineCount = value.split('\n').length;
    return Math.min(Math.max(lineCount * 20 + 24, 120), 400);
  }, [value]);

  if (readOnly) {
    return (
      <div
        className={cn(
          'overflow-hidden rounded-lg border border-border',
          className,
        )}
      >
        <div className='flex items-center justify-between border-b border-border bg-muted/50 px-3 py-2'>
          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-1.5'>
              <span className='h-3 w-3 rounded-full bg-dot-red' />
              <span className='h-3 w-3 rounded-full bg-dot-yellow' />
              <span className='h-3 w-3 rounded-full bg-dot-green' />
            </div>
            <span className='ml-2 text-xs text-muted-foreground'>Markdown</span>
          </div>
          <button
            type='button'
            onClick={handleCopy}
            className='flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
          >
            {copied ? (
              <Check className='h-3.5 w-3.5 text-success' />
            ) : (
              <Copy className='h-3.5 w-3.5' />
            )}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <div
          className='max-h-[400px] overflow-auto p-4'
          style={{ minHeight: contentHeight }}
        >
          {value ? (
            <div className='markdown-preview'>
              <Markdown remarkPlugins={[remarkGfm]}>{value}</Markdown>
            </div>
          ) : (
            <p className='text-sm text-muted-foreground italic'>No content</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-border',
        className,
      )}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className='flex items-center justify-between border-b border-border bg-muted/50 px-3 py-2'>
          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-1.5'>
              <span className='h-3 w-3 rounded-full bg-dot-red' />
              <span className='h-3 w-3 rounded-full bg-dot-yellow' />
              <span className='h-3 w-3 rounded-full bg-dot-green' />
            </div>
            <TabsList className='ml-2 h-7'>
              <TabsTrigger value='write' className='h-5 px-2 text-xs'>
                <Pencil className='mr-1 h-3 w-3' />
                Write
              </TabsTrigger>
              <TabsTrigger value='preview' className='h-5 px-2 text-xs'>
                <Eye className='mr-1 h-3 w-3' />
                Preview
              </TabsTrigger>
            </TabsList>
          </div>
          <button
            type='button'
            onClick={handleCopy}
            className='flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
          >
            {copied ? (
              <Check className='h-3.5 w-3.5 text-success' />
            ) : (
              <Copy className='h-3.5 w-3.5' />
            )}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <TabsContent value='write' className='mt-0'>
          <div className='max-h-[400px] overflow-auto'>
            <Textarea
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              placeholder='Write markdown...'
              className='min-h-[120px] resize-none border-0 p-4 font-mono text-sm focus-visible:ring-0'
              style={{ minHeight: contentHeight }}
            />
          </div>
        </TabsContent>

        <TabsContent value='preview' className='mt-0'>
          <div
            className='max-h-[400px] overflow-auto p-4'
            style={{ minHeight: contentHeight }}
          >
            {value ? (
              <div className='markdown-preview'>
                <Markdown remarkPlugins={[remarkGfm]}>{value}</Markdown>
              </div>
            ) : (
              <p className='text-sm text-muted-foreground italic'>Nothing to preview</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
