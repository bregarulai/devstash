'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { generateAutoTags } from '@/actions';

interface AiTagSuggestionsProps {
  getItemData: () => { title: string; content: string; language?: string };
  onAcceptTags: (tags: string[]) => void;
  isPro: boolean;
  existingTags?: string[];
}

export function AiTagSuggestions({
  getItemData,
  onAcceptTags,
  isPro,
  existingTags = [],
}: AiTagSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isPro) return null;

  const handleSuggest = async () => {
    const { title, content, language } = getItemData();
    if (!title.trim() && !content.trim()) {
      toast.error('Add a title or content first');
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateAutoTags({ title, content, language });
      if (result.success) {
        const filtered = result.data.filter((t) => !existingTags.includes(t));
        setSuggestions(filtered);
        if (filtered.length === 0) toast.message('No new tag suggestions');
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to generate tag suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = (tag: string) => {
    onAcceptTags([tag]);
    setSuggestions((prev) => prev.filter((t) => t !== tag));
  };

  const handleReject = (tag: string) => {
    setSuggestions((prev) => prev.filter((t) => t !== tag));
  };

  return (
    <div className='space-y-2'>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={handleSuggest}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className='animate-spin' />
        ) : (
          <Sparkles />
        )}
        Suggest Tags
      </Button>
      {suggestions.length > 0 && (
        <div className='flex flex-wrap gap-1.5'>
          {suggestions.map((tag) => (
            <Badge key={tag} variant='secondary' className='gap-1 pr-1'>
              {tag}
              <button
                type='button'
                aria-label={`Accept ${tag}`}
                onClick={() => handleAccept(tag)}
                className='inline-flex items-center justify-center text-muted-foreground hover:text-foreground'
              >
                <Check className='size-3' />
              </button>
              <button
                type='button'
                aria-label={`Reject ${tag}`}
                onClick={() => handleReject(tag)}
                className='inline-flex items-center justify-center text-muted-foreground hover:text-destructive'
              >
                <X className='size-3' />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}