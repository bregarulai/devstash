import { describe, it, expect } from 'vitest'
import {
  SAFE_RETURN_PATH_REGEX,
  getSafeReturnPath,
} from '@/lib/utils/safeReturn'

describe('SAFE_RETURN_PATH_REGEX', () => {
  it('matches a simple root-relative path', () => {
    expect(SAFE_RETURN_PATH_REGEX.test('/dashboard')).toBe(true)
  })

  it('matches a path with segments', () => {
    expect(SAFE_RETURN_PATH_REGEX.test('/items/snippet')).toBe(true)
  })

  it('matches a path with a query string', () => {
    expect(SAFE_RETURN_PATH_REGEX.test('/items/file?page=2')).toBe(true)
  })

  it('rejects protocol-relative URLs', () => {
    expect(SAFE_RETURN_PATH_REGEX.test('//evil.com')).toBe(false)
  })

  it('rejects backslash-prefixed paths', () => {
    expect(SAFE_RETURN_PATH_REGEX.test('\\\\evil.com')).toBe(false)
    expect(SAFE_RETURN_PATH_REGEX.test('/\\evil.com')).toBe(false)
  })

  it('rejects absolute URLs', () => {
    expect(SAFE_RETURN_PATH_REGEX.test('https://evil.com')).toBe(false)
  })

  it('rejects paths containing whitespace', () => {
    expect(SAFE_RETURN_PATH_REGEX.test('/foo bar')).toBe(false)
  })

  it('rejects empty string and non-slash-prefixed values', () => {
    expect(SAFE_RETURN_PATH_REGEX.test('')).toBe(false)
    expect(SAFE_RETURN_PATH_REGEX.test('dashboard')).toBe(false)
  })
})

describe('getSafeReturnPath', () => {
  it('returns the path when valid', () => {
    expect(getSafeReturnPath('/items/snippet')).toBe('/items/snippet')
  })

  it('returns the path when it includes a query string', () => {
    expect(getSafeReturnPath('/items/file?page=2')).toBe('/items/file?page=2')
  })

  it('returns null for a protocol-relative open-redirect attempt', () => {
    expect(getSafeReturnPath('//evil.com')).toBeNull()
  })

  it('returns null for an absolute URL', () => {
    expect(getSafeReturnPath('https://evil.com')).toBeNull()
  })

  it('returns null for a backslash-prefixed value', () => {
    expect(getSafeReturnPath('\\evil.com')).toBeNull()
  })

  it('returns null for a value with whitespace', () => {
    expect(getSafeReturnPath('/foo bar')).toBeNull()
  })

  it('returns null for an empty string', () => {
    expect(getSafeReturnPath('')).toBeNull()
  })

  it('returns null when value is undefined', () => {
    expect(getSafeReturnPath(undefined)).toBeNull()
  })

  it('returns null when value is null', () => {
    expect(getSafeReturnPath(null)).toBeNull()
  })
})
