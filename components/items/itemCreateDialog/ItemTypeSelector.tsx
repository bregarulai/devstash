import { cn } from '@/lib/utils/utils';
import { ITEM_TYPES } from '@/lib/constants';
import { type ItemType } from '@/types/db';

interface ItemTypeSelectorProps {
  selectedType: ItemType;
  onSelect: (type: ItemType) => void;
}

export function ItemTypeSelector({ selectedType, onSelect }: ItemTypeSelectorProps) {
  return (
    <div className='flex flex-wrap gap-2'>
      {ITEM_TYPES.map((type) => {
        const Icon = type.icon;
        return (
          <button
            key={type.value}
            type='button'
            onClick={() => onSelect(type.value)}
            className={cn(
              'flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
              selectedType === type.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-muted',
            )}
          >
            <Icon className='h-4 w-4' />
            {type.label}
          </button>
        );
      })}
    </div>
  );
}
