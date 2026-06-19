import Link from 'next/link';
import { ItemTypeIcon } from '../itemTypeIcon/ItemTypeIcon';
import { Badge } from '@/components/ui/badge';
import { SystemItemType } from '@/types/db';

const PRO_TYPES = new Set(['file', 'image']);

interface SidebarItemTypeLinkProps {
  type: SystemItemType;
  isExpanded: boolean;
}

export function SidebarItemTypeLink({ type, isExpanded }: SidebarItemTypeLinkProps) {
  return (
    <Link
      href={`/items/${type.name}`}
      className={`group flex items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground ${isExpanded ? 'gap-3 px-2 py-1.5 text-sm' : 'justify-center px-1 py-2'}`}
      title={
        isExpanded
          ? undefined
          : type.name.charAt(0).toUpperCase() + type.name.slice(1)
      }
    >
      <span className='flex h-5 w-5 shrink-0 items-center justify-center'>
        <ItemTypeIcon type={type.name} className='h-4 w-4' />
      </span>
      {isExpanded && (
        <span className='truncate font-medium'>
          {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
        </span>
      )}
      {isExpanded && PRO_TYPES.has(type.name) && (
        <Badge variant='outline' className='ml-2 h-4 w-fit rounded-full px-1 text-[10px] font-semibold uppercase'>
          PRO
        </Badge>
      )}
      {isExpanded && (
        <span className='ml-auto text-xs text-muted-foreground'>
          {type.itemCount}
        </span>
      )}
    </Link>
  );
}
