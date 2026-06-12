import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockPrismaUserFindUnique = vi.fn()
const mockPrismaUserUpdate = vi.fn()
const mockBcryptHash = vi.fn()
const mockVerifyToken = vi.fn()
const mockRedirect = vi.fn()
const mockCheckRateLimit = vi.fn()
const mockGetClientIP = vi.fn()

vi.mock('@/lib/prisma/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockPrismaUserFindUnique(...args),
      update: (...args: unknown[]) => mockPrismaUserUpdate(...args),
    },
  },
}))

vi.mock('bcryptjs', () => ({
  default: {
    hash: (...args: unknown[]) => mockBcryptHash(...args),
  },
}))

vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => {
    mockRedirect(...args)
    throw new Error('NEXT_REDIRECT')
  },
}))

vi.mock('@/lib/auth/verificationToken/verificationToken', () => ({
  verifyToken: (...args: unknown[]) => mockVerifyToken(...args),
}))

vi.mock('@/lib/auth/rateLimit/rateLimit', () => ({
  createRateLimiter: vi.fn(() => ({ limit: vi.fn() })),
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
  getClientIP: (...args: unknown[]) => mockGetClientIP(...args),
  RATE_LIMIT_CONFIGS: {
    resetPassword: { limit: 5, duration: 900 },
  },
}))

describe('handleResetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetClientIP.mockReturnValue('127.0.0.1')
    mockCheckRateLimit.mockResolvedValue({ success: true })
    mockVerifyToken.mockResolvedValue('test@example.com')
    mockBcryptHash.mockResolvedValue('hashed-password')
    mockPrismaUserFindUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
    })
    mockPrismaUserUpdate.mockResolvedValue({})
  })

  it('resets password with valid token', async () => {
    const formData = new FormData()
    formData.set('token', 'valid-token')
    formData.set('email', 'test@example.com')
    formData.set('password', 'new-password123')
    formData.set('confirmPassword', 'new-password123')

    const { handleResetPassword } = await import('./ResetPassword')
    await expect(handleResetPassword(formData)).rejects.toThrow('NEXT_REDIRECT')

    expect(mockPrismaUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { password: 'hashed-password' },
    })
  })

  it('returns success redirect on valid token', async () => {
    const formData = new FormData()
    formData.set('token', 'valid-token')
    formData.set('email', 'test@example.com')
    formData.set('password', 'new-password123')
    formData.set('confirmPassword', 'new-password123')

    const { handleResetPassword } = await import('./ResetPassword')
    await expect(handleResetPassword(formData)).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining('/sign-in?success=password-reset')
    )
  })

  it('returns error redirect for invalid token', async () => {
    mockVerifyToken.mockResolvedValue(null)

    const formData = new FormData()
    formData.set('token', 'invalid-token')
    formData.set('email', 'test@example.com')
    formData.set('password', 'new-password123')
    formData.set('confirmPassword', 'new-password123')

    const { handleResetPassword } = await import('./ResetPassword')
    await expect(handleResetPassword(formData)).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining('/reset-password?error=Reset+link+is+invalid+or+has+expired')
    )
  })

  it('returns error redirect for Zod validation failure', async () => {
    const formData = new FormData()
    formData.set('token', 'valid-token')
    formData.set('email', 'invalid-email')
    formData.set('password', 'short')
    formData.set('confirmPassword', 'different')

    const { handleResetPassword } = await import('./ResetPassword')
    await expect(handleResetPassword(formData)).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining('/reset-password?error=')
    )
  })

  it('returns error redirect when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({ success: false, retryAfter: 900 })

    const formData = new FormData()
    formData.set('token', 'valid-token')
    formData.set('email', 'test@example.com')
    formData.set('password', 'new-password123')
    formData.set('confirmPassword', 'new-password123')

    const { handleResetPassword } = await import('./ResetPassword')
    await expect(handleResetPassword(formData)).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining('/reset-password?error=')
    )
  })

  it('hashes new password with bcrypt', async () => {
    const formData = new FormData()
    formData.set('token', 'valid-token')
    formData.set('email', 'test@example.com')
    formData.set('password', 'new-password123')
    formData.set('confirmPassword', 'new-password123')

    const { handleResetPassword } = await import('./ResetPassword')
    await expect(handleResetPassword(formData)).rejects.toThrow('NEXT_REDIRECT')

    expect(mockBcryptHash).toHaveBeenCalledWith('new-password123', 12)
  })

  it('returns error redirect when user not found', async () => {
    mockPrismaUserFindUnique.mockResolvedValue(null)

    const formData = new FormData()
    formData.set('token', 'valid-token')
    formData.set('email', 'test@example.com')
    formData.set('password', 'new-password123')
    formData.set('confirmPassword', 'new-password123')

    const { handleResetPassword } = await import('./ResetPassword')
    await expect(handleResetPassword(formData)).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining('/reset-password?error=User+not+found')
    )
  })

  it('returns error redirect when token email does not match form email', async () => {
    mockVerifyToken.mockResolvedValue('other@example.com')

    const formData = new FormData()
    formData.set('token', 'valid-token')
    formData.set('email', 'test@example.com')
    formData.set('password', 'new-password123')
    formData.set('confirmPassword', 'new-password123')

    const { handleResetPassword } = await import('./ResetPassword')
    await expect(handleResetPassword(formData)).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining('/reset-password?error=Reset+link+is+invalid+or+has+expired')
    )
  })
})
