import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockExtractR2Key = vi.fn()

vi.mock('@/lib/r2', () => ({
  extractR2Key: (...args: unknown[]) => mockExtractR2Key(...args),
}))

describe('triggerDownload', () => {
  let locationHref = ''

  beforeEach(() => {
    vi.clearAllMocks()
    locationHref = ''

    Object.defineProperty(globalThis, 'window', {
      value: {
        get location() {
          return { get href() { return locationHref }, set href(v: string) { locationHref = v } }
        },
      },
      writable: true,
      configurable: true,
    })
  })

  it('does nothing when fileUrl is null', async () => {
    const { triggerDownload } = await import('./download')
    triggerDownload(null)
    expect(locationHref).toBe('')
    expect(mockExtractR2Key).not.toHaveBeenCalled()
  })

  it('does nothing when fileUrl is undefined', async () => {
    const { triggerDownload } = await import('./download')
    triggerDownload(undefined)
    expect(locationHref).toBe('')
    expect(mockExtractR2Key).not.toHaveBeenCalled()
  })

  it('sets location to download API when R2 key is extracted', async () => {
    mockExtractR2Key.mockReturnValue('files/test-file.pdf')
    const { triggerDownload } = await import('./download')
    triggerDownload('https://pub-abc123.r2.dev/files/test-file.pdf')
    expect(locationHref).toBe('/api/download?key=files%2Ftest-file.pdf')
  })

  it('includes fileName in download URL when provided', async () => {
    mockExtractR2Key.mockReturnValue('files/test-file.pdf')
    const { triggerDownload } = await import('./download')
    triggerDownload('https://pub-abc123.r2.dev/files/test-file.pdf', 'My Document.pdf')
    expect(locationHref).toContain('fileName=')
    expect(locationHref).toContain('key=files%2Ftest-file.pdf')
  })

  it('does not include fileName param when fileName is null', async () => {
    mockExtractR2Key.mockReturnValue('files/test-file.pdf')
    const { triggerDownload } = await import('./download')
    triggerDownload('https://pub-abc123.r2.dev/files/test-file.pdf', null)
    expect(locationHref).not.toContain('fileName')
  })

  it('does not include fileName param when fileName is empty string', async () => {
    mockExtractR2Key.mockReturnValue('files/test-file.pdf')
    const { triggerDownload } = await import('./download')
    triggerDownload('https://pub-abc123.r2.dev/files/test-file.pdf', '')
    expect(locationHref).not.toContain('fileName')
  })

  it('falls back to direct URL when no R2 key is extracted', async () => {
    mockExtractR2Key.mockReturnValue(null)
    const { triggerDownload } = await import('./download')
    triggerDownload('https://example.com/file.pdf')
    expect(locationHref).toBe('https://example.com/file.pdf')
  })
})
