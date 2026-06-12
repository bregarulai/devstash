import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockPrismaUserFindUnique = vi.fn()
const mockSignIn = vi.fn()
const mockRedirect = vi.fn()
const mockCheckRateLimit = vi.fn()
const mockGetClientIP = vi.fn()

vi.mock('@/lib/prisma/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockPrismaUserFindUnique(...args),
    },
  },
}))

vi.mock('@/lib/auth/auth/auth', () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}))

vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => {
    mockRedirect(...args)
    throw new Error('NEXT_REDIRECT')
  },
}))

vi.mock('@/lib/auth/rateLimit/rateLimit', () => ({
  createRateLimiter: vi.fn(() => ({ limit: vi.fn() })),
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
  getClientIP: (...args: unknown[]) => mockGetClientIP(...args),
  RATE_LIMIT_CONFIGS: {
    signIn: { limit: 5, duration: 900 },
  },
}))

const originalEnv = process.env

describe('handleSignIn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...originalEnv }
    mockGetClientIP.mockReturnValue('127.0.0.1')
    mockCheckRateLimit.mockResolvedValue({ success: true })
    mockSignIn.mockResolvedValue({})
    mockPrismaUserFindUnique.mockResolvedValue({ emailVerified: new Date() })
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('signs in with valid credentials', async () => {
    process.env.ENABLE_EMAIL_VERIFICATION = 'false'

    const { handleSignIn } = await import('./sign-in')
    await expect(handleSignIn({ email: 'test@example.com', password: 'password123' })).rejects.toThrow('NEXT_REDIRECT')

    expect(mockSignIn).toHaveBeenCalledWith('credentials', {
      email: 'test@example.com',
      password: 'password123',
    })
  })

  it('redirects to dashboard on success', async () => {
    process.env.ENABLE_EMAIL_VERIFICATION = 'false'

    const { handleSignIn } = await import('./sign-in')
    await expect(handleSignIn({ email: 'test@example.com', password: 'password123' })).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
  })

  it('redirects to verify-required when email not verified', async () => {
    process.env.ENABLE_EMAIL_VERIFICATION = 'true'
    mockPrismaUserFindUnique.mockResolvedValue({ emailVerified: null })

    const { handleSignIn } = await import('./sign-in')
    await expect(handleSignIn({ email: 'test@example.com', password: 'password123' })).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith('/verify-required')
  })

  it('redirects on Zod validation failure', async () => {
    const { handleSignIn } = await import('./sign-in')
    await expect(handleSignIn({ email: 'invalid-email', password: 'short' })).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining('/sign-in?error=')
    )
  })

  it('redirects when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({ success: false, retryAfter: 900 })

    const { handleSignIn } = await import('./sign-in')
    await expect(handleSignIn({ email: 'test@example.com', password: 'password123' })).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining('/sign-in?error=')
    )
  })

  it('formats rate limit error with minutes', async () => {
    mockCheckRateLimit.mockResolvedValue({ success: false, retryAfter: 300 })

    const { handleSignIn } = await import('./sign-in')
    await expect(handleSignIn({ email: 'test@example.com', password: 'password123' })).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining('5%20minutes')
    )
  })

  it('uses email in rate limit key', async () => {
    process.env.ENABLE_EMAIL_VERIFICATION = 'false'

    const { handleSignIn } = await import('./sign-in')
    await expect(handleSignIn({ email: 'test@example.com', password: 'password123' })).rejects.toThrow('NEXT_REDIRECT')

    expect(mockCheckRateLimit).toHaveBeenCalledWith(
      expect.anything(),
      'signin:127.0.0.1:test@example.com',
      expect.anything()
    )
  })
})
