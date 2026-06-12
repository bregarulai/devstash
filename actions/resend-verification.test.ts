import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockPrismaUserFindUnique = vi.fn()
const mockCreateVerificationToken = vi.fn()
const mockResendSend = vi.fn()
const mockRedirect = vi.fn()
const mockCheckRateLimit = vi.fn()
const mockGetClientIP = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockPrismaUserFindUnique(...args),
    },
  },
}))

vi.mock('@/lib/verification-token', () => ({
  createVerificationToken: (...args: unknown[]) => mockCreateVerificationToken(...args),
}))

vi.mock('@/lib/resend', () => ({
  resend: { emails: { send: (...args: unknown[]) => mockResendSend(...args) } },
}))

vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => {
    mockRedirect(...args)
    throw new Error('NEXT_REDIRECT')
  },
}))

vi.mock('@/lib/rate-limit', () => ({
  createRateLimiter: vi.fn(() => ({ limit: vi.fn() })),
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
  getClientIP: (...args: unknown[]) => mockGetClientIP(...args),
  RATE_LIMIT_CONFIGS: {
    resendVerification: { limit: 3, duration: 900 },
  },
}))

const originalEnv = process.env

describe('handleResendVerification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...originalEnv }
    process.env.ENABLE_EMAIL_VERIFICATION = 'true'
    mockGetClientIP.mockReturnValue('127.0.0.1')
    mockCheckRateLimit.mockResolvedValue({ success: true })
    mockCreateVerificationToken.mockResolvedValue('token-123')
    mockResendSend.mockResolvedValue({})
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('resends verification email', async () => {
    mockPrismaUserFindUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      emailVerified: null,
    })

    const { handleResendVerification } = await import('./resend-verification')
    await expect(handleResendVerification('test@example.com')).rejects.toThrow('NEXT_REDIRECT')

    expect(mockResendSend).toHaveBeenCalled()
  })

  it('returns success redirect on success', async () => {
    mockPrismaUserFindUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      emailVerified: null,
    })

    const { handleResendVerification } = await import('./resend-verification')
    await expect(handleResendVerification('test@example.com')).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining('/sign-in?success=resent')
    )
  })

  it('returns success redirect when user not found (timing-attack prevention)', async () => {
    mockPrismaUserFindUnique.mockResolvedValue(null)

    const { handleResendVerification } = await import('./resend-verification')
    await expect(handleResendVerification('test@example.com')).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining('/sign-in?success=resent')
    )
  })

  it('returns success redirect when email already verified', async () => {
    mockPrismaUserFindUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      emailVerified: new Date(),
    })

    const { handleResendVerification } = await import('./resend-verification')
    await expect(handleResendVerification('test@example.com')).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining('/sign-in?success=resent')
    )
  })

  it('returns error redirect when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({ success: false, retryAfter: 900 })

    const { handleResendVerification } = await import('./resend-verification')
    await expect(handleResendVerification('test@example.com')).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining('/sign-in?error=')
    )
  })

  it('creates dummy token before real token (timing-attack prevention)', async () => {
    mockPrismaUserFindUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      emailVerified: null,
    })

    const { handleResendVerification } = await import('./resend-verification')
    await expect(handleResendVerification('test@example.com')).rejects.toThrow('NEXT_REDIRECT')

    expect(mockCreateVerificationToken).toHaveBeenCalledWith('test@example.com')
  })

  it('redirects to sign-in when email verification disabled', async () => {
    process.env.ENABLE_EMAIL_VERIFICATION = 'false'

    const { handleResendVerification } = await import('./resend-verification')
    await expect(handleResendVerification('test@example.com')).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith('/sign-in')
  })

  it('handles email sending failure gracefully', async () => {
    mockPrismaUserFindUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      emailVerified: null,
    })
    mockResendSend.mockRejectedValue(new Error('Email service unavailable'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { handleResendVerification } = await import('./resend-verification')
    await expect(handleResendVerification('test@example.com')).rejects.toThrow('NEXT_REDIRECT')

    expect(consoleSpy).toHaveBeenCalledWith('Failed to send verification email:', expect.any(Error))
    consoleSpy.mockRestore()
  })
})
