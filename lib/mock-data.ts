// Item type definitions
export interface ItemType {
  name: string;
  icon: string;
  color: string;
  isSystem: boolean;
}

// A collection the user has created
export interface Collection {
  id: string;
  name: string;
  description?: string;
  itemCount: number;
  isFavorite: boolean;
}

// An item in the dashboard
export interface Item {
  id: string;
  title: string;
  description?: string;
  type: ItemType;
  content: string;
  language?: string;
  isFavorite: boolean;
  isPinned: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// The current logged-in user
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  isPro: boolean;
}

// Item type definitions (system types)
export const ITEM_TYPES: ItemType[] = [
  { name: 'snippet', icon: 'Code', color: '#3b82f6', isSystem: true },
  { name: 'prompt', icon: 'Sparkles', color: '#8b5cf6', isSystem: true },
  { name: 'command', icon: 'Terminal', color: '#f97316', isSystem: true },
  { name: 'note', icon: 'StickyNote', color: '#fde047', isSystem: true },
  { name: 'file', icon: 'File', color: '#6b7280', isSystem: true },
  { name: 'image', icon: 'Image', color: '#ec4899', isSystem: true },
  { name: 'link', icon: 'Link', color: '#10b981', isSystem: true },
];

// Sample collections
export const MOCK_COLLECTIONS: Collection[] = [
  { id: 'col-1', name: 'React Patterns', itemCount: 12, isFavorite: true },
  { id: 'col-2', name: 'Python Snippets', itemCount: 8, isFavorite: false },
  { id: 'col-3', name: 'Context Files', itemCount: 5, isFavorite: true },
  { id: 'col-4', name: 'DevOps Commands', itemCount: 15, isFavorite: false },
  { id: 'col-5', name: 'AI Prompts', itemCount: 20, isFavorite: false },
];

// Sample items
export const MOCK_ITEMS: Item[] = [
  {
    id: 'item-1',
    title: 'useAuth hook',
    description: 'Custom React hook for authentication state',
    type: ITEM_TYPES[0],
    content: 'function useAuth() { ... }',
    language: 'typescript',
    isFavorite: true,
    isPinned: true,
    tags: ['react', 'hook'],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:20:00Z',
  },
  {
    id: 'item-2',
    title: 'Code review prompt',
    description: 'AI prompt for code review assistance',
    type: ITEM_TYPES[1],
    content: 'You are an experienced code reviewer...',
    isFavorite: false,
    isPinned: true,
    tags: ['ai', 'prompt', 'code-review'],
    createdAt: '2024-01-18T09:15:00Z',
    updatedAt: '2024-01-18T09:15:00Z',
  },
  {
    id: 'item-3',
    title: 'git reset --hard HEAD~1',
    description: 'Reset last commit but keep changes',
    type: ITEM_TYPES[2],
    content: 'git reset --hard HEAD~1',
    language: 'bash',
    isFavorite: false,
    isPinned: false,
    tags: ['git', 'command'],
    createdAt: '2024-01-10T16:45:00Z',
    updatedAt: '2024-01-10T16:45:00Z',
  },
  {
    id: 'item-4',
    title: 'TypeScript generics note',
    description: 'Quick reference for TypeScript generics',
    type: ITEM_TYPES[3],
    content: 'Generic functions allow you to create...',
    language: 'typescript',
    isFavorite: true,
    isPinned: false,
    tags: ['typescript', 'generics'],
    createdAt: '2024-01-12T11:00:00Z',
    updatedAt: '2024-01-14T08:30:00Z',
  },
  {
    id: 'item-5',
    title: 'Deploy script',
    description: 'Bash script for automated deployment',
    type: ITEM_TYPES[4],
    content: '#!/bin/bash',
    language: 'bash',
    isFavorite: false,
    isPinned: false,
    tags: ['devops'],
    createdAt: '2024-01-08T14:00:00Z',
    updatedAt: '2024-01-09T10:15:00Z',
  },
  {
    id: 'item-6',
    title: 'README.md',
    description: 'Project documentation file',
    type: ITEM_TYPES[5],
    content: '# Project Title',
    language: 'markdown',
    isFavorite: false,
    isPinned: false,
    tags: ['docs'],
    createdAt: '2024-01-05T09:00:00Z',
    updatedAt: '2024-01-05T09:00:00Z',
  },
  {
    id: 'item-7',
    title: 'Next.js documentation',
    description: 'Link to Next.js documentation',
    type: ITEM_TYPES[6],
    content: 'https://nextjs.org/docs',
    isFavorite: true,
    isPinned: false,
    tags: ['nextjs', 'link'],
    createdAt: '2024-01-20T12:00:00Z',
    updatedAt: '2024-01-20T12:00:00Z',
  },
];

// Current logged-in user
export const CURRENT_USER: User = {
  id: 'user-1',
  name: 'John Doe',
  email: 'demo@devstash.ai',
  image: undefined,
  isPro: false,
};
