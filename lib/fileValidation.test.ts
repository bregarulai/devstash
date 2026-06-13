import { describe, expect, it } from 'vitest'
import { getExtension, IMAGE_EXTENSIONS, FILE_EXTENSIONS, MAX_IMAGE_SIZE, MAX_FILE_SIZE } from '@/lib/fileValidation'

describe('getExtension', () => {
  it('returns extension for files with extensions', () => {
    expect(getExtension('file.txt')).toBe('.txt')
    expect(getExtension('image.PNG')).toBe('.png')
    expect(getExtension('archive.tar.gz')).toBe('.gz')
  })

  it('returns empty string for files without extensions', () => {
    expect(getExtension('README')).toBe('')
    expect(getExtension('Makefile')).toBe('')
  })

  it('handles files with dots in directory path', () => {
    expect(getExtension('/path/to/file.txt')).toBe('.txt')
    expect(getExtension('folder.sub/file.md')).toBe('.md')
  })

  it('lowercases extensions', () => {
    expect(getExtension('FILE.TXT')).toBe('.txt')
    expect(getExtension('image.JPEG')).toBe('.jpeg')
  })
})

describe('IMAGE_EXTENSIONS', () => {
  it('includes common image formats', () => {
    expect(IMAGE_EXTENSIONS).toContain('.png')
    expect(IMAGE_EXTENSIONS).toContain('.jpg')
    expect(IMAGE_EXTENSIONS).toContain('.jpeg')
    expect(IMAGE_EXTENSIONS).toContain('.gif')
    expect(IMAGE_EXTENSIONS).toContain('.webp')
    expect(IMAGE_EXTENSIONS).toContain('.svg')
  })
})

describe('FILE_EXTENSIONS', () => {
  it('includes common file formats', () => {
    expect(FILE_EXTENSIONS).toContain('.pdf')
    expect(FILE_EXTENSIONS).toContain('.txt')
    expect(FILE_EXTENSIONS).toContain('.md')
    expect(FILE_EXTENSIONS).toContain('.json')
    expect(FILE_EXTENSIONS).toContain('.yaml')
    expect(FILE_EXTENSIONS).toContain('.yml')
    expect(FILE_EXTENSIONS).toContain('.xml')
    expect(FILE_EXTENSIONS).toContain('.csv')
    expect(FILE_EXTENSIONS).toContain('.toml')
    expect(FILE_EXTENSIONS).toContain('.ini')
  })
})

describe('size limits', () => {
  it('MAX_IMAGE_SIZE is 5 MB', () => {
    expect(MAX_IMAGE_SIZE).toBe(5 * 1024 * 1024)
  })

  it('MAX_FILE_SIZE is 10 MB', () => {
    expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024)
  })
})