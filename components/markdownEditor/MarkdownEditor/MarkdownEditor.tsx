'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Eye, Pencil, Sparkles, Loader2, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn, formatDaysAgo } from '@/lib/utils/utils';
import { optimizePrompt, applyOptimizedPromptAction } from '@/actions';

const OPTIMIZE_COOLDOWN_MS = 3_000;

interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
  enableOptimize?: boolean;
  isPro?: boolean;
  itemTitle?: string;
  itemId?: string;
  optimized?: boolean;
  optimizedAt?: Date | string | null;
}

export function MarkdownEditor({
  value,
  onChange,
  readOnly = false,
  className,
  enableOptimize = false,
  isPro = false,
  itemTitle,
  itemId,
  optimized = false,
  optimizedAt = null,
}: MarkdownEditorProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(readOnly ? 'preview' : 'write');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [proposedOptimization, setProposedOptimization] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);

  const showOptimizeFeature = enableOptimize && readOnly;

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  const contentHeight = useMemo(() => {
    const lineCount = value.split('\n').length;
    return Math.min(Math.max(lineCount * 20 + 24, 120), 400);
  }, [value]);

  const startCooldown = useCallback(() => {
    setCooldown(true);
    setTimeout(() => setCooldown(false), OPTIMIZE_COOLDOWN_MS);
  }, []);

  const handleOptimize = useCallback(async () => {
    if (!isPro) {
      toast.error('AI features require a Pro subscription');
      return;
    }

    setIsOptimizing(true);
    try {
      const result = await optimizePrompt({
        title: itemTitle,
        content: value,
      });
      if (result.success) {
        if (result.data.trim().length === 0) {
          toast.message('No optimization proposed');
        } else {
          setProposedOptimization(result.data);
        }
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to optimize prompt');
    } finally {
      setIsOptimizing(false);
      startCooldown();
    }
  }, [isPro, itemTitle, value, startCooldown]);

  const handleAccept = useCallback(async () => {
    if (!proposedOptimization || !itemId) return;
    setIsAccepting(true);
    try {
      const result = await applyOptimizedPromptAction({
        itemId,
        content: proposedOptimization,
      });
      if (result.success) {
        toast.success('Prompt optimized');
        setProposedOptimization(null);
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed to apply optimization');
      }
    } catch {
      toast.error('Failed to apply optimization');
    } finally {
      setIsAccepting(false);
    }
  }, [proposedOptimization, itemId, router]);

  const handleReject = useCallback(() => {
    setProposedOptimization(null);
  }, []);

  const renderOptimizeButton = () => {
    if (!showOptimizeFeature) return null;

    if (!isPro) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant='ghost' size='xs' onClick={handleOptimize} className='text-muted-foreground'>
                <Crown className='h-3.5 w-3.5' />
                Optimize
              </Button>
            </TooltipTrigger>
            <TooltipContent>AI features require Pro subscription</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (cooldown && !isOptimizing) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant='ghost' size='xs' disabled className='text-muted-foreground'>
                <Sparkles className='h-3.5 w-3.5' />
                Optimize
              </Button>
            </TooltipTrigger>
            <TooltipContent>Please wait a moment before optimizing again</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <Button variant='ghost' size='xs' onClick={handleOptimize} disabled={isOptimizing} className='text-muted-foreground'>
        {isOptimizing ? (
          <Loader2 className='h-3.5 w-3.5 animate-spin' />
        ) : (
          <Sparkles className='h-3.5 w-3.5' />
        )}
        {isOptimizing ? 'Optimizing' : 'Optimize'}
      </Button>
    );
  };

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
          <div className='flex items-center gap-1'>
            {renderOptimizeButton()}
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

        <AlertDialog open={proposedOptimization !== null} onOpenChange={(open) => !open && handleReject()}>
          <AlertDialogContent className='!max-w-2xl'>
            <AlertDialogHeader>
              <AlertDialogTitle>Apply optimized prompt?</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className='text-left'>
                  {optimized && optimizedAt ? (
                    <p className='mb-2 text-amber-600 dark:text-amber-400'>
                      This prompt was already optimized {formatDaysAgo(new Date(optimizedAt))}. Re-optimizing may drift or over-engineer — proceed only if you want another pass.
                    </p>
                  ) : null}
                  <div className='grid gap-3 sm:grid-cols-2'>
                    <div>
                      <p className='mb-1 text-xs font-medium text-muted-foreground'>Original</p>
                      <div className='markdown-preview max-h-40 overflow-auto rounded-md border bg-muted/40 p-3 text-xs'>
                        <Markdown remarkPlugins={[remarkGfm]}>{value}</Markdown>
                      </div>
                    </div>
                    <div>
                      <p className='mb-1 text-xs font-medium text-muted-foreground'>Optimized</p>
                      <div className='markdown-preview max-h-40 overflow-auto rounded-md border bg-muted/40 p-3 text-xs'>
                        <Markdown remarkPlugins={[remarkGfm]}>{proposedOptimization ?? ''}</Markdown>
                      </div>
                    </div>
                  </div>
                  <p className='mt-3'>Accepting overwrites the current prompt content.</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isAccepting} onClick={handleReject}>Reject</AlertDialogCancel>
              <AlertDialogAction onClick={handleAccept} disabled={isAccepting}>
                {isAccepting ? (
                  <>
                    <Loader2 className='size-4 animate-spin' />
                    Applying...
                  </>
                ) : (
                  'Accept'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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