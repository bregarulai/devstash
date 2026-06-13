'use client';

import { useRef, useCallback, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Copy, Check } from 'lucide-react';
import type { OnMount } from '@monaco-editor/react';

const Editor = dynamic(() => import('@monaco-editor/react').then((mod) => mod.default), {
  ssr: false,
  loading: () => (
    <div className='flex min-h-[120px] items-center justify-center text-sm text-muted-foreground'>
      Loading editor...
    </div>
  ),
});

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  className?: string;
}

export function CodeEditor({
  value,
  onChange,
  language = 'plaintext',
  readOnly = false,
  className,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const editorHeight = useMemo(() => {
    const lineCount = value.split('\n').length;
    return Math.min(Math.max(lineCount * 20 + 24, 120), 400);
  }, [value]);

  const handleEditorMount: OnMount = useCallback(
    (editor) => {
      editorRef.current = editor;
      editor.updateOptions({
        readOnly,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        padding: { top: 12, bottom: 12 },
        fontFamily: 'var(--font-mono), ui-monospace, monospace',
        fontSize: 13,
        lineHeight: 20,
        renderLineHighlight: 'none',
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        overviewRulerBorder: false,
        scrollbar: {
          vertical: 'auto',
          horizontal: 'auto',
          verticalScrollbarSize: 8,
          horizontalScrollbarSize: 8,
          useShadows: false,
        },
      });
    },
    [readOnly],
  );

  const handleCopy = useCallback(async () => {
    const text = editorRef.current?.getValue() ?? value;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  return (
    <div
      className={`overflow-hidden rounded-lg border border-border ${className ?? ''}`}
    >
      <div className='flex items-center justify-between border-b border-border bg-muted/50 px-3 py-2'>
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-1.5'>
            <span className='h-3 w-3 rounded-full bg-[#ff5f57]' />
            <span className='h-3 w-3 rounded-full bg-[#febc2e]' />
            <span className='h-3 w-3 rounded-full bg-[#28c840]' />
          </div>
          <span className='ml-2 text-xs text-muted-foreground'>
            {language}
          </span>
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
      <div className='max-h-[400px] overflow-auto [&_.monaco-editor]:!rounded-none [&_.monaco-editor_.overflow-guard]:!rounded-none'>
        <Editor
          language={language}
          value={value}
          theme='vs-dark'
          height={editorHeight}
          onChange={(v) => onChange?.(v ?? '')}
          onMount={handleEditorMount}
          options={{
            readOnly,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            padding: { top: 12, bottom: 12 },
            fontFamily: 'var(--font-mono), ui-monospace, monospace',
            fontSize: 13,
            lineHeight: 20,
            renderLineHighlight: 'none',
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
              useShadows: false,
            },
          }}
        />
      </div>
    </div>
  );
}
