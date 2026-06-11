import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {},
}))

const { authConfig } = await import('./auth.config')

describe('authConfig.redirect', () => {
  const redirect = authConfig.callbacks!.redirect!

  it('allows redirect to same-origin relative path', async () => {
    const result = await redirect({
      url: '/dashboard',
      baseUrl: 'http://localhost:3000',
      trigger: 'signIn',
    })

    expect(result).toBe('http://localhost:3000/dashboard')
  })

  it('allows redirect to same-origin absolute URL', async () => {
    const result = await redirect({
      url: 'http://localhost:3000/dashboard',
      baseUrl: 'http://localhost:3000',
      trigger: 'signIn',
    })

    expect(result).toBe('http://localhost:3000/dashboard')
  })

  it('redirects to base URL for cross-origin URL', async () => {
    const result = await redirect({
      url: 'https://evil.com/phishing',
      baseUrl: 'http://localhost:3000',
      trigger: 'signIn',
    })

    expect(result).toBe('http://localhost:3000')
  })

  it('handles relative path starting with slash', async () => {
    const result = await redirect({
      url: '/sign-in',
      baseUrl: 'http://localhost:3000',
      trigger: 'signIn',
    })

    expect(result).toBe('http://localhost:3000/sign-in')
  })

  it('handles root path', async () => {
    const result = await redirect({
      url: '/',
      baseUrl: 'http://localhost:3000',
      trigger: 'signIn',
    })

    expect(result).toBe('http://localhost:3000/')
  })

  it('handles URL with query parameters', async () => {
    const result = await redirect({
      url: '/dashboard?tab=settings',
      baseUrl: 'http://localhost:3000',
      trigger: 'signIn',
    })

    expect(result).toBe('http://localhost:3000/dashboard?tab=settings')
  })

  it('handles URL with hash', async () => {
    const result = await redirect({
      url: '/dashboard#section',
      baseUrl: 'http://localhost:3000',
      trigger: 'signIn',
    })

    expect(result).toBe('http://localhost:3000/dashboard#section')
  })

  it('treats protocol-relative URLs as relative paths', async () => {
    const result = await redirect({
      url: '//evil.com/phishing',
      baseUrl: 'http://localhost:3000',
      trigger: 'signIn',
    })

    expect(result).toBe('http://localhost:3000//evil.com/phishing')
  })

  it('handles different port as cross-origin', async () => {
    const result = await redirect({
      url: 'http://localhost:4000/dashboard',
      baseUrl: 'http://localhost:3000',
      trigger: 'signIn',
    })

    expect(result).toBe('http://localhost:3000')
  })

  it('handles different subdomain as cross-origin', async () => {
    const result = await redirect({
      url: 'https://evil.localhost:3000/dashboard',
      baseUrl: 'http://localhost:3000',
      trigger: 'signIn',
    })

    expect(result).toBe('http://localhost:3000')
  })
})

describe('authConfig.jwt', () => {
  const jwt = authConfig.callbacks!.jwt!

  it('adds user id to token on sign in', async () => {
    const token = {}
    const user = { id: 'user-123' }

    const result = await jwt({ token, user, account: null, profile: undefined, trigger: 'signIn', session: undefined })

    expect(result).toEqual({ id: 'user-123' })
  })

  it('returns existing token without user', async () => {
    const token = { existing: 'data' }

    const result = await jwt({ token, user: undefined, account: null, profile: undefined, trigger: 'signIn', session: undefined })

    expect(result).toEqual({ existing: 'data' })
  })
})

describe('authConfig.session', () => {
  const session = authConfig.callbacks!.session!

  it('adds user id from token to session', async () => {
    const sessionObj = { user: { name: 'John' } }
    const token = { id: 'user-123' }

    const result = await session({ session: sessionObj, token })

    expect(result).toEqual({ user: { name: 'John', id: 'user-123' } })
  })

  it('returns session without id when token has no id', async () => {
    const sessionObj = { user: { name: 'John' } }
    const token = {}

    const result = await session({ session: sessionObj, token })

    expect(result).toEqual({ user: { name: 'John' } })
  })
})
