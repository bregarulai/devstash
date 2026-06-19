import { describe, it, expect } from 'vitest'
import { getVerificationEmailHtml, getVerificationEmailText } from './verification'

describe('getVerificationEmailHtml', () => {
  it('includes verification link in HTML', () => {
    const link = 'https://example.com/verify?token=abc123'
    const html = getVerificationEmailHtml(link)
    expect(html).toContain(link)
  })

  it('includes welcome heading', () => {
    const html = getVerificationEmailHtml('https://example.com/verify')
    expect(html).toContain('Welcome to DevStash')
  })

  it('includes verify email button', () => {
    const html = getVerificationEmailHtml('https://example.com/verify')
    expect(html).toContain('Verify Email Address')
  })

  it('includes 24-hour expiry notice', () => {
    const html = getVerificationEmailHtml('https://example.com/verify')
    expect(html).toContain('24 hours')
  })

  it('includes fallback text link', () => {
    const link = 'https://example.com/verify?token=abc123'
    const html = getVerificationEmailHtml(link)
    expect(html).toContain('copy and paste this link')
    expect(html).toContain(link)
  })

  it('renders valid HTML structure', () => {
    const html = getVerificationEmailHtml('https://example.com/verify')
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('<html>')
    expect(html).toContain('<body')
    expect(html).toContain('</html>')
  })
})

describe('getVerificationEmailText', () => {
  it('includes verification link', () => {
    const link = 'https://example.com/verify?token=abc123'
    const text = getVerificationEmailText(link)
    expect(text).toContain(link)
  })

  it('includes welcome message', () => {
    const text = getVerificationEmailText('https://example.com/verify')
    expect(text).toContain('Welcome to DevStash')
  })

  it('includes 24-hour expiry notice', () => {
    const text = getVerificationEmailText('https://example.com/verify')
    expect(text).toContain('24 hours')
  })

  it('does not contain HTML tags', () => {
    const text = getVerificationEmailText('https://example.com/verify')
    expect(text).not.toContain('<html>')
    expect(text).not.toContain('<body>')
    expect(text).not.toContain('<a ')
  })
})
