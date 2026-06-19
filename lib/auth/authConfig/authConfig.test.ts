import { describe, it, expect, vi } from 'vitest'
import type { User } from '@auth/core/types'

vi.mock('@/lib/prisma/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn().mockResolvedValue(null),
    },
  },
}))

const { authConfig } = await import('./authConfig')

describe('authConfig.redirect', () => {
  const redirect = authConfig.callbacks!.redirect!

  it('allows redirect to same-origin relative path', async () => {
    const result = await redirect({
      url: '/dashboard',
      baseUrl: 'http://localhost:3000',
    })

    expect(result).toBe('http://localhost:3000/dashboard')
  })

  it('allows redirect to same-origin absolute URL', async () => {
    const result = await redirect({
      url: 'http://localhost:3000/dashboard',
      baseUrl: 'http://localhost:3000',
    })

    expect(result).toBe('http://localhost:3000/dashboard')
  })

  it('redirects to base URL for cross-origin URL', async () => {
    const result = await redirect({
      url: 'https://evil.com/phishing',
      baseUrl: 'http://localhost:3000',

    })

    expect(result).toBe('http://localhost:3000')
  })

  it('handles relative path starting with slash', async () => {
    const result = await redirect({
      url: '/sign-in',
      baseUrl: 'http://localhost:3000',

    })

    expect(result).toBe('http://localhost:3000/sign-in')
  })

  it('handles root path', async () => {
    const result = await redirect({
      url: '/',
      baseUrl: 'http://localhost:3000',

    })

    expect(result).toBe('http://localhost:3000/')
  })

  it('handles URL with query parameters', async () => {
    const result = await redirect({
      url: '/dashboard?tab=settings',
      baseUrl: 'http://localhost:3000',

    })

    expect(result).toBe('http://localhost:3000/dashboard?tab=settings')
  })

  it('handles URL with hash', async () => {
    const result = await redirect({
      url: '/dashboard#section',
      baseUrl: 'http://localhost:3000',

    })

    expect(result).toBe('http://localhost:3000/dashboard#section')
  })

  it('treats protocol-relative URLs as relative paths', async () => {
    const result = await redirect({
      url: '//evil.com/phishing',
      baseUrl: 'http://localhost:3000',

    })

    expect(result).toBe('http://localhost:3000//evil.com/phishing')
  })

  it('handles different port as cross-origin', async () => {
    const result = await redirect({
      url: 'http://localhost:4000/dashboard',
      baseUrl: 'http://localhost:3000',

    })

    expect(result).toBe('http://localhost:3000')
  })

  it('handles different subdomain as cross-origin', async () => {
    const result = await redirect({
      url: 'https://evil.localhost:3000/dashboard',
      baseUrl: 'http://localhost:3000',

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

    expect(result).toEqual({ id: 'user-123', isPro: false })
  })

  it('returns existing token without user', async () => {
    const token = { existing: 'data' }
    const user: User = { id: '', email: null, name: null, image: null }

    const result = await jwt({ token, user, account: null, profile: undefined, trigger: 'signIn', session: undefined })

    expect(result).toEqual({ existing: 'data', id: '', isPro: false })
  })
})

describe('authConfig.session', () => {
  const session = authConfig.callbacks!.session!

  it('adds user id from token to session', async () => {
    const adapterUser = { id: '', name: 'John', email: '', emailVerified: null }
    const sessionObj = {
      user: adapterUser,
      expires: new Date('2099-01-01'),
      sessionToken: 'mock-session-token',
      userId: '',
    }
    const token = { id: 'user-123' }

    const result = await session({
      session: sessionObj as { user: typeof adapterUser } & import('@auth/core/adapters').AdapterSession & import('@auth/core/types').Session,
      user: adapterUser,
      token,
      newSession: null,
      trigger: undefined,
    })

    expect(result).toEqual({
      user: { id: 'user-123', name: 'John', email: '', emailVerified: null },
      expires: new Date('2099-01-01'),
      sessionToken: 'mock-session-token',
      userId: '',
    })
  })

  it('returns session without id when token has no id', async () => {
    const adapterUser = { id: '', name: 'John', email: '', emailVerified: null }
    const sessionObj = {
      user: adapterUser,
      expires: new Date('2099-01-01'),
      sessionToken: 'mock-session-token',
      userId: '',
    }
    const token = {}

    const result = await session({
      session: sessionObj as { user: typeof adapterUser } & import('@auth/core/adapters').AdapterSession & import('@auth/core/types').Session,
      user: adapterUser,
      token,
      newSession: null,
      trigger: undefined,
    })

    expect(result).toEqual({
      user: { id: '', name: 'John', email: '', emailVerified: null },
      expires: new Date('2099-01-01'),
      sessionToken: 'mock-session-token',
      userId: '',
    })
  })
})
