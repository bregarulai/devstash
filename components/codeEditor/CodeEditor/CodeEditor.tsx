'use client';

import { useCallback, useState, useMemo, useContext } from 'react';
import dynamic from 'next/dynamic';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Sparkles, Loader2, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { EditorPreferencesContext } from '@/contexts/editorPreferencesContext/EditorPreferencesContext';
import { DEFAULT_EDITOR_PREFERENCES } from '@/types/db';
import { explainCode } from '@/actions';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const Editor = dynamic(() => import('@monaco-editor/react').then((mod) => mod.default), {
  ssr: false,
  loading: () => (
    <div className='flex min-h-[120px] items-center justify-center text-sm text-muted-foreground'>
      Loading editor...
    </div>
  ),
});

const REGENERATE_COOLDOWN_MS = 3_000;

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  className?: string;
  enableExplain?: boolean;
  isPro?: boolean;
  itemTitle?: string;
  itemId?: string;
  persistedExplanation?: string | null;
}

export function CodeEditor({
  value,
  onChange,
  language = 'plaintext',
  readOnly = false,
  className,
  enableExplain = false,
  isPro = false,
  itemTitle,
  itemId,
  persistedExplanation = null,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(persistedExplanation);
  const [isExplaining, setIsExplaining] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [activeView, setActiveView] = useState<'code' | 'explain'>('code');
  const context = useContext(EditorPreferencesContext);
  const preferences = context?.preferences ?? DEFAULT_EDITOR_PREFERENCES;

  const showExplainFeature = enableExplain && readOnly;

  const editorHeight = useMemo(() => {
    const lineCount = value.split('\n').length;
    return Math.min(Math.max(lineCount * 20 + 24, 120), 400);
  }, [value]);

  const handleCopy = useCallback(async () => {
    const textToCopy = showExplainFeature && activeView === 'explain' ? (explanation ?? '') : value;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value, showExplainFeature, activeView, explanation]);

  const handleExplain = useCallback(async () => {
    if (!isPro) {
      toast.error('AI features require a Pro subscription');
      return;
    }

    setIsExplaining(true);
    const wasRegenerate = explanation !== null;
    try {
      const result = await explainCode({
        itemId,
        title: itemTitle,
        content: value,
        language,
        forceRegenerate: wasRegenerate,
      });
      if (result.success) {
        setExplanation(result.data);
        setActiveView('explain');
        if (result.data.trim().length === 0) {
          toast.message('No explanation generated');
        }
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to generate explanation');
    } finally {
      setIsExplaining(false);
      if (wasRegenerate) {
        setCooldown(true);
        setTimeout(() => setCooldown(false), REGENERATE_COOLDOWN_MS);
      }
    }
  }, [isPro, itemId, itemTitle, value, language, explanation]);

  const renderExplainButton = () => {
    if (!showExplainFeature) return null;

    if (!isPro) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant='ghost' size='xs' onClick={handleExplain} className='text-muted-foreground'>
                <Crown className='h-3.5 w-3.5' />
                Explain
              </Button>
            </TooltipTrigger>
            <TooltipContent>AI features require Pro subscription</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    const onCooldown = cooldown && !isExplaining;

    if (onCooldown) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant='ghost' size='xs' disabled className='text-muted-foreground'>
                <Sparkles className='h-3.5 w-3.5' />
                {explanation ? 'Regenerate' : 'Explain'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Please wait a moment before regenerating</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <Button variant='ghost' size='xs' onClick={handleExplain} disabled={isExplaining} className='text-muted-foreground'>
        {isExplaining ? (
          <Loader2 className='h-3.5 w-3.5 animate-spin' />
        ) : (
          <Sparkles className='h-3.5 w-3.5' />
        )}
        {isExplaining ? 'Explaining' : explanation ? 'Regenerate' : 'Explain'}
      </Button>
    );
  };

  const headerLeft = () => {
    if (showExplainFeature && explanation) {
      return (
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-1.5'>
            <span className='h-3 w-3 rounded-full bg-[#ff5f57]' />
            <span className='h-3 w-3 rounded-full bg-[#febc2e]' />
            <span className='h-3 w-3 rounded-full bg-[#28c840]' />
          </div>
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'code' | 'explain')}>
            <TabsList className='ml-1 h-7'>
              <TabsTrigger value='code' className='h-5 px-2 text-xs'>
                Code
              </TabsTrigger>
              <TabsTrigger value='explain' className='h-5 px-2 text-xs'>
                Explain
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      );
    }

    return (
      <div className='flex items-center gap-2'>
        <div className='flex items-center gap-1.5'>
          <span className='h-3 w-3 rounded-full bg-[#ff5f57]' />
          <span className='h-3 w-3 rounded-full bg-[#febc2e]' />
          <span className='h-3 w-3 rounded-full bg-[#28c840]' />
        </div>
        <span className='ml-2 text-xs text-muted-foreground'>{language}</span>
      </div>
    );
  };

  return (
    <div
      className={`overflow-hidden rounded-lg border border-border ${className ?? ''}`}
    >
      <div className='flex items-center justify-between border-b border-border bg-muted/50 px-3 py-2'>
        {headerLeft()}
        <div className='flex items-center gap-1'>
          {renderExplainButton()}
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
      </div>
      <div className='max-h-[400px] overflow-auto [&_.monaco-editor]:!rounded-none [&_.monaco-editor_.overflow-guard]:!rounded-none'>
        {showExplainFeature && activeView === 'explain' && explanation ? (
          <div className='p-4' style={{ minHeight: editorHeight }}>
            <div className='markdown-preview'>
              <Markdown remarkPlugins={[remarkGfm]}>{explanation}</Markdown>
            </div>
          </div>
        ) : (
          <Editor
            language={language}
            value={value}
            theme={preferences.theme}
            height={editorHeight}
            onChange={(v) => onChange?.(v ?? '')}
            options={{
              readOnly,
              minimap: { enabled: preferences.minimap },
              scrollBeyondLastLine: false,
              wordWrap: preferences.wordWrap ? 'on' : 'off',
              padding: { top: 12, bottom: 12 },
              fontFamily: 'var(--font-mono), ui-monospace, monospace',
              fontSize: preferences.fontSize,
              tabSize: preferences.tabSize,
              lineHeight: preferences.fontSize + 7,
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
        )}
      </div>
    </div>
  );
}