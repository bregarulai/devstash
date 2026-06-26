'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LANGUAGE_OPTIONS } from '@/lib/constants';
import { cn } from '@/lib/utils/utils';

interface LanguageSelectProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  className?: string;
}

export function LanguageSelect({
  value,
  onChange,
  id,
  placeholder = 'Select language',
  className,
}: LanguageSelectProps) {
  const hasMatch = LANGUAGE_OPTIONS.some((opt) => opt.value === value);

  return (
    <Select value={hasMatch ? value : ''} onValueChange={onChange}>
      <SelectTrigger id={id} className={cn('w-full', className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGE_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}