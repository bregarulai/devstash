import { describe, expect, it } from 'vitest'
import {
  IMAGE_EXTENSIONS,
  IMAGE_ACCEPT,
  ITEM_TYPES,
  CODE_EDITOR_TYPES,
  MARKDOWN_EDITOR_TYPES,
  SHOW_CONTENT,
  SHOW_LANGUAGE,
  SHOW_URL,
  SHOW_FILE_UPLOAD,
  LANGUAGE_OPTIONS,
} from './constants'

describe('IMAGE_EXTENSIONS', () => {
  it('includes all expected image extensions', () => {
    expect(IMAGE_EXTENSIONS).toContain('.jpg')
    expect(IMAGE_EXTENSIONS).toContain('.jpeg')
    expect(IMAGE_EXTENSIONS).toContain('.png')
    expect(IMAGE_EXTENSIONS).toContain('.gif')
    expect(IMAGE_EXTENSIONS).toContain('.webp')
    expect(IMAGE_EXTENSIONS).toContain('.svg')
    expect(IMAGE_EXTENSIONS).toContain('.bmp')
    expect(IMAGE_EXTENSIONS).toContain('.ico')
  })

  it('is the single source of truth for image extensions', () => {
    expect(IMAGE_EXTENSIONS.length).toBe(8)
  })
})

describe('IMAGE_ACCEPT', () => {
  it('matches IMAGE_EXTENSIONS', () => {
    const extensions = IMAGE_ACCEPT.split(',')
    for (const ext of IMAGE_EXTENSIONS) {
      expect(extensions).toContain(ext)
    }
  })
})

describe('ITEM_TYPES', () => {
  it('contains all item types', () => {
    const values = ITEM_TYPES.map((t) => t.value)
    expect(values).toContain('snippet')
    expect(values).toContain('prompt')
    expect(values).toContain('command')
    expect(values).toContain('note')
    expect(values).toContain('link')
    expect(values).toContain('file')
    expect(values).toContain('image')
  })
})

describe('type categories', () => {
  it('CODE_EDITOR_TYPES contains snippet and command', () => {
    expect(CODE_EDITOR_TYPES).toContain('snippet')
    expect(CODE_EDITOR_TYPES).toContain('command')
  })

  it('MARKDOWN_EDITOR_TYPES contains note and prompt', () => {
    expect(MARKDOWN_EDITOR_TYPES).toContain('note')
    expect(MARKDOWN_EDITOR_TYPES).toContain('prompt')
  })

  it('SHOW_CONTENT includes editor types', () => {
    expect(SHOW_CONTENT).toContain('snippet')
    expect(SHOW_CONTENT).toContain('prompt')
    expect(SHOW_CONTENT).toContain('command')
    expect(SHOW_CONTENT).toContain('note')
  })

  it('SHOW_LANGUAGE includes code types', () => {
    expect(SHOW_LANGUAGE).toContain('snippet')
    expect(SHOW_LANGUAGE).toContain('command')
  })

  it('SHOW_URL includes link', () => {
    expect(SHOW_URL).toContain('link')
  })

  it('SHOW_FILE_UPLOAD includes file and image', () => {
    expect(SHOW_FILE_UPLOAD).toContain('file')
    expect(SHOW_FILE_UPLOAD).toContain('image')
  })
})

describe('LANGUAGE_OPTIONS', () => {
  it('is a non-empty list of options', () => {
    expect(LANGUAGE_OPTIONS.length).toBeGreaterThan(0)
  })

  it('each option has a value and label', () => {
    for (const opt of LANGUAGE_OPTIONS) {
      expect(typeof opt.value).toBe('string')
      expect(opt.value.length).toBeGreaterThan(0)
      expect(typeof opt.label).toBe('string')
      expect(opt.label.length).toBeGreaterThan(0)
    }
  })

  it('has unique values', () => {
    const values = LANGUAGE_OPTIONS.map((o) => o.value)
    expect(new Set(values).size).toBe(values.length)
  })

  it('includes plaintext, typescript, and python', () => {
    const values = LANGUAGE_OPTIONS.map((o) => o.value)
    expect(values).toContain('plaintext')
    expect(values).toContain('typescript')
    expect(values).toContain('python')
  })

  it('includes plaintext as first option', () => {
    expect(LANGUAGE_OPTIONS[0].value).toBe('plaintext')
  })
})
