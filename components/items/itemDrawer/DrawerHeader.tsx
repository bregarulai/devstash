import {
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ItemTypeIcon } from '@/components/dashboard/itemTypeIcon/ItemTypeIcon';
import { Badge } from '@/components/ui/badge';
import type { ItemWithDetails } from '@/types/db';

interface DrawerHeaderProps {
  item: ItemWithDetails | null;
}

export function DrawerHeader({ item }: DrawerHeaderProps) {
  return (
    <SheetHeader className='border-b border-border px-6 py-4 space-y-3'>
      <SheetTitle className='flex items-center gap-3'>
        <div
          className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg'
          style={{
            backgroundColor: item
              ? `${item.itemType.color}15`
              : 'transparent',
            color: item?.itemType.color,
          }}
        >
          {item && (
            <ItemTypeIcon
              type={item.itemType.name}
              className='h-4 w-4 shrink-0'
            />
          )}
        </div>
        <div className='flex flex-col gap-1'>
          <span className='truncate'>{item?.title || 'Item'}</span>
          {item && (
            <Badge
              variant='outline'
              className='w-fit shrink-0'
              style={{
                borderColor: item.itemType.color,
                color: item.itemType.color,
              }}
            >
              {item.itemType.name}
            </Badge>
          )}
        </div>
      </SheetTitle>
    </SheetHeader>
  );
}
