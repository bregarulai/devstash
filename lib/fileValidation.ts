import { IMAGE_MAX_SIZE, FILE_MAX_SIZE } from '@/lib/constants'

export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
export const FILE_TYPES = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/json',
  'application/x-yaml',
  'text/yaml',
  'application/xml',
  'text/xml',
  'text/csv',
  'application/toml',
]

export { IMAGE_EXTENSIONS } from '@/lib/constants'
export const MAX_IMAGE_SIZE = IMAGE_MAX_SIZE
export const MAX_FILE_SIZE = FILE_MAX_SIZE
export const FILE_EXTENSIONS = ['.pdf', '.txt', '.md', '.json', '.yaml', '.yml', '.xml', '.csv', '.toml', '.ini']

export function getExtension(filename: string): string {
  const idx = filename.lastIndexOf('.')
  return idx >= 0 ? filename.slice(idx).toLowerCase() : ''
}