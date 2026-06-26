'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { generateDescription } from '@/actions';
import type { DescriptionInput } from '@/types/db';

interface AiDescriptionProps {
  getItemData: () => Omit<DescriptionInput, never>;
  onAccept: (description: string) => void;
  isPro: boolean;
}

export function AiDescription({ getItemData, onAccept, isPro }: AiDescriptionProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isPro) return null;

  const handleGenerate = async () => {
    const data = getItemData();
    const hasInput =
      (data.title?.trim().length ?? 0) > 0 ||
      (data.content?.trim().length ?? 0) > 0 ||
      (data.url?.trim().length ?? 0) > 0 ||
      (data.fileName?.trim().length ?? 0) > 0;
    if (!hasInput) {
      toast.error('Add a title, content, URL, or file first');
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateDescription(data);
      if (result.success) {
        if (result.data.trim().length === 0) {
          toast.message('No description generated');
        } else {
          onAccept(result.data);
          toast.success('Description generated');
        }
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to generate description');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type='button'
      variant='ghost'
      size='sm'
      className='h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground'
      onClick={handleGenerate}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className='h-3.5 w-3.5 animate-spin' />
      ) : (
        <Sparkles className='h-3.5 w-3.5' />
      )}
      Generate
    </Button>
  );
}
