import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { ITEM_TYPES } from '@/lib/constants';
import { PRO_ONLY_ITEM_TYPES } from '@/lib/constants/limits';
import { type ItemType } from '@/types/db';

interface ItemTypeSelectorProps {
  selectedType: ItemType;
  onSelect: (type: ItemType) => void;
  isPro: boolean;
}

export function ItemTypeSelector({ selectedType, onSelect, isPro }: ItemTypeSelectorProps) {
  return (
    <div className='flex flex-wrap gap-2'>
      {ITEM_TYPES.map((type) => {
        const Icon = type.icon;
        const locked = !isPro && (PRO_ONLY_ITEM_TYPES as readonly string[]).includes(type.value);
        return (
          <button
            key={type.value}
            type='button'
            disabled={locked}
            onClick={() => !locked && onSelect(type.value)}
            className={cn(
              'flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
              selectedType === type.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-muted',
              locked && 'opacity-50 cursor-not-allowed',
            )}
          >
            <Icon className='h-4 w-4' />
            {type.label}
            {locked && <Lock className='ml-1 h-3 w-3' />}
          </button>
        );
      })}
    </div>
  );
}
