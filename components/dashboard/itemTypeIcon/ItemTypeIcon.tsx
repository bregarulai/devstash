import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image as ImageIcon,
  Link as LinkIcon,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  snippet: <Code className='h-4 w-4' />,
  prompt: <Sparkles className='h-4 w-4' />,
  command: <Terminal className='h-4 w-4' />,
  note: <StickyNote className='h-4 w-4' />,
  file: <File className='h-4 w-4' />,
  image: <ImageIcon className='h-4 w-4' />,
  link: <LinkIcon className='h-4 w-4' />,
};

const colorMap: Record<string, string> = {
  snippet: 'text-snippet',
  prompt: 'text-prompt',
  command: 'text-command',
  note: 'text-note',
  file: 'text-file',
  image: 'text-image',
  link: 'text-link',
};

interface ItemTypeIconProps {
  type: string;
  className?: string;
}

export function ItemTypeIcon({ type, className }: ItemTypeIconProps) {
  const Icon = iconMap[type] || iconMap['file'];
  const colorClass = colorMap[type] || 'text-file';
  return (
    <span className={`shrink-0 ${colorClass} ${className ?? ''}`}>
      {Icon}
    </span>
  );
}
