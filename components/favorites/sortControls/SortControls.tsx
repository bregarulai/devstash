'use client';

import { ArrowDownAZ, ArrowUpAZ, CalendarArrowDown, CalendarArrowUp, Layers } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SortOption } from '@/types/sort';

export type { SortOption };

interface SortControlsProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'newest', label: 'Newest first', icon: CalendarArrowDown },
  { value: 'oldest', label: 'Oldest first', icon: CalendarArrowUp },
  { value: 'name-asc', label: 'Name A-Z', icon: ArrowDownAZ },
  { value: 'name-desc', label: 'Name Z-A', icon: ArrowUpAZ },
  { value: 'type', label: 'By type', icon: Layers },
];

export function SortControls({ value, onChange }: SortControlsProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as SortOption)}>
      <SelectTrigger size='sm' className='w-fit gap-1.5 cursor-pointer'>
        <SelectValue placeholder='Sort by' />
      </SelectTrigger>
      <SelectContent side="top" position="popper" align="end">
        {sortOptions.map((option) => {
          const OptionIcon = option.icon;
          return (
            <SelectItem key={option.value} value={option.value}>
              <span className='flex items-center gap-1.5'>
                <OptionIcon className='size-3.5' />
                {option.label}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
