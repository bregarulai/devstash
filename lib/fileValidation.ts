export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']
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

export const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']
export const FILE_EXTENSIONS = ['.pdf', '.txt', '.md', '.json', '.yaml', '.yml', '.xml', '.csv', '.toml', '.ini']

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024
export const MAX_FILE_SIZE = 10 * 1024 * 1024

export function getExtension(filename: string): string {
  const idx = filename.lastIndexOf('.')
  return idx >= 0 ? filename.slice(idx).toLowerCase() : ''
}