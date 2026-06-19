import { Code, Sparkles, Terminal, StickyNote, Link, FileText, ImageIcon } from 'lucide-react';

export const CODE_EDITOR_TYPES = ['snippet', 'command'];
export const MARKDOWN_EDITOR_TYPES = ['note', 'prompt'];

export const ITEM_TYPES = [
  { value: 'snippet' as const, label: 'Snippet', icon: Code },
  { value: 'prompt' as const, label: 'Prompt', icon: Sparkles },
  { value: 'command' as const, label: 'Command', icon: Terminal },
  { value: 'note' as const, label: 'Note', icon: StickyNote },
  { value: 'link' as const, label: 'Link', icon: Link },
  { value: 'file' as const, label: 'File', icon: FileText },
  { value: 'image' as const, label: 'Image', icon: ImageIcon },
] as const;

export const SHOW_CONTENT = ['snippet', 'prompt', 'command', 'note'];
export const SHOW_LANGUAGE = ['snippet', 'command'];
export const SHOW_URL = ['link'];
export const SHOW_FILE_UPLOAD = ['file', 'image'];

export const IMAGE_ACCEPT = '.png,.jpg,.jpeg,.gif,.webp,.svg,.bmp,.ico';
export const FILE_ACCEPT = '.pdf,.txt,.md,.json,.yaml,.yml,.xml,.csv,.toml,.ini';

export const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];

export const IMAGE_MAX_SIZE = 5 * 1024 * 1024;
export const FILE_MAX_SIZE = 10 * 1024 * 1024;

export const EMAIL_SENDER = "DevStash <onboarding@resend.dev>";
export const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;
