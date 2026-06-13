import { describe, expect, it, vi, beforeEach } from 'vitest'

describe('extractR2Key', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns null for empty string', async () => {
    const { extractR2Key } = await import('@/lib/r2')
    expect(extractR2Key('')).toBeNull()
  })

  it('returns null when PUBLIC_URL is not set', async () => {
    delete process.env.R2_PUBLIC_URL
    const { extractR2Key } = await import('@/lib/r2')
    expect(extractR2Key('https://example.com/file.txt')).toBeNull()
  })

  it('extracts key from full URL when PUBLIC_URL matches', async () => {
    process.env.R2_PUBLIC_URL = 'https://pub.example.com'
    const { extractR2Key } = await import('@/lib/r2')
    expect(extractR2Key('https://pub.example.com/uploads/user123/file.txt')).toBe(
      'uploads/user123/file.txt'
    )
  })

  it('returns null when URL does not start with PUBLIC_URL', async () => {
    process.env.R2_PUBLIC_URL = 'https://pub.example.com'
    const { extractR2Key } = await import('@/lib/r2')
    expect(extractR2Key('https://other.example.com/file.txt')).toBeNull()
  })

  it('handles trailing slash in PUBLIC_URL', async () => {
    process.env.R2_PUBLIC_URL = 'https://pub.example.com/'
    const { extractR2Key } = await import('@/lib/r2')
    expect(extractR2Key('https://pub.example.com/uploads/file.txt')).toBe('uploads/file.txt')
  })
})