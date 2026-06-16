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

  it('extracts key from r2.dev public URL', async () => {
    delete process.env.R2_PUBLIC_URL
    const { extractR2Key } = await import('@/lib/r2')
    expect(extractR2Key('https://pub-abc123.r2.dev/uploads/user123/file.txt')).toBe(
      'uploads/user123/file.txt'
    )
  })

  it('extracts key from r2.dev URL with hex hash', async () => {
    delete process.env.R2_PUBLIC_URL
    const { extractR2Key } = await import('@/lib/r2')
    expect(extractR2Key('https://pub-a1b2c3d4e5f6.r2.dev/image.png')).toBe('image.png')
  })

  it('returns null for r2.dev URL without path', async () => {
    delete process.env.R2_PUBLIC_URL
    const { extractR2Key } = await import('@/lib/r2')
    expect(extractR2Key('https://pub-abc123.r2.dev/')).toBeNull()
  })

  it('uses PUBLIC_URL when URL matches it, ignoring r2.dev pattern', async () => {
    process.env.R2_PUBLIC_URL = 'https://pub.example.com'
    const { extractR2Key } = await import('@/lib/r2')
    expect(extractR2Key('https://pub.example.com/file.txt')).toBe('file.txt')
  })
})