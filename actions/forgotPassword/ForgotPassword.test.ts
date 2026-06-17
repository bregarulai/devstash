import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockPrismaUserFindUnique = vi.fn()
const mockCreateVerificationToken = vi.fn()
const mockResendSend = vi.fn()
const mockRevalidatePath = vi.fn()
const mockRedirect = vi.fn()
const mockCheckRateLimit = vi.fn()

const mockHeaders = vi.fn().mockResolvedValue(new Map([['x-client-ip', '127.0.0.1']]))

vi.mock('@/lib/prisma/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockPrismaUserFindUnique(...args),
    },
  },
}))

vi.mock('@/lib/auth/verificationToken/verificationToken', () => ({
  createVerificationToken: (...args: unknown[]) => mockCreateVerificationToken(...args),
}))

vi.mock('@/lib/email/resend/resend', () => ({
  resend: { emails: { send: (...args: unknown[]) => mockResendSend(...args) } },
}))

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}))

vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => {
    mockRedirect(...args)
    throw new Error('NEXT_REDIRECT')
  },
}))

vi.mock('next/headers', () => ({
  headers: (...args: unknown[]) => mockHeaders(...args),
}))

vi.mock('@/lib/auth/rateLimit/rateLimit', () => ({
  createRateLimiter: vi.fn(() => ({ limit: vi.fn() })),
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
  RATE_LIMIT_CONFIGS: {
    forgotPassword: { limit: 3, duration: 3600 },
  },
}))

const originalEnv = process.env

describe('handleForgotPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...originalEnv }
    process.env.ENABLE_EMAIL_VERIFICATION = 'false'
    mockHeaders.mockResolvedValue(new Map([['x-client-ip', '127.0.0.1']]))
    mockCheckRateLimit.mockResolvedValue({ success: true })
    mockCreateVerificationToken.mockResolvedValue('token-123')
    mockResendSend.mockResolvedValue({})
    mockPrismaUserFindUnique.mockResolvedValue(null)
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('sends reset email with valid email', async () => {
    mockPrismaUserFindUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      emailVerified: new Date(),
    })

    const formData = new FormData()
    formData.set('email', 'test@example.com')

    const { handleForgotPassword } = await import('./ForgotPassword')
    await expect(handleForgotPassword(formData)).rejects.toThrow('NEXT_REDIRECT')

    expect(mockResendSend).toHaveBeenCalled()
  })

  it('returns success redirect on valid email', async () => {
    const formData = new FormData()
    formData.set('email', 'test@example.com')

    const { handleForgotPassword } = await import('./ForgotPassword')
    await expect(handleForgotPassword(formData)).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining('/forgot-password?success=')
    )
  })

  it('returns error redirect for Zod validation failure', async () => {
    const formData = new FormData()
    formData.set('email', 'invalid-email')

    const { handleForgotPassword } = await import('./ForgotPassword')
    await expect(handleForgotPassword(formData)).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining('/forgot-password?error=')
    )
  })

  it('returns error redirect when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({ success: false, retryAfter: 3600 })

    const formData = new FormData()
    formData.set('email', 'test@example.com')

    const { handleForgotPassword } = await import('./ForgotPassword')
    await expect(handleForgotPassword(formData)).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining('/forgot-password?error=')
    )
  })

  it('creates dummy token before real token (timing-attack prevention)', async () => {
    const formData = new FormData()
    formData.set('email', 'test@example.com')

    const { handleForgotPassword } = await import('./ForgotPassword')
    await expect(handleForgotPassword(formData)).rejects.toThrow('NEXT_REDIRECT')

    expect(mockCreateVerificationToken).toHaveBeenCalledWith('test@example.com')
  })

  it('redirects to verify-email when email verification enabled and user not verified', async () => {
    process.env.ENABLE_EMAIL_VERIFICATION = 'true'
    mockPrismaUserFindUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      emailVerified: null,
    })

    const formData = new FormData()
    formData.set('email', 'test@example.com')

    const { handleForgotPassword } = await import('./ForgotPassword')
    await expect(handleForgotPassword(formData)).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining('/forgot-password?error=Please+verify+your+email+address+first')
    )
  })

  it('handles email sending failure gracefully', async () => {
    mockResendSend.mockRejectedValue(new Error('Email service unavailable'))
    mockPrismaUserFindUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      emailVerified: new Date(),
    })
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const formData = new FormData()
    formData.set('email', 'test@example.com')

    const { handleForgotPassword } = await import('./ForgotPassword')
    await expect(handleForgotPassword(formData)).rejects.toThrow('NEXT_REDIRECT')

    expect(consoleSpy).toHaveBeenCalledWith('Failed to send password reset email:', expect.any(Error))
    consoleSpy.mockRestore()
  })
})
