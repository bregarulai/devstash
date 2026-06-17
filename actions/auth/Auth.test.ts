import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockPrismaUserFindUnique = vi.fn()
const mockPrismaUserCreate = vi.fn()
const mockPrismaUserDelete = vi.fn()
const mockPrismaUserUpdate = vi.fn()
const mockBcryptHash = vi.fn()
const mockBcryptCompare = vi.fn()
const mockCreateVerificationToken = vi.fn()
const mockResendSend = vi.fn()
const mockRevalidatePath = vi.fn()
const mockRedirect = vi.fn()
const mockAuth = vi.fn()
const mockSignOut = vi.fn()
const mockSignIn = vi.fn()
const mockCheckRateLimit = vi.fn()

const mockHeaders = vi.fn().mockResolvedValue(new Map([['x-client-ip', '127.0.0.1']]))

vi.mock('@/lib/prisma/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockPrismaUserFindUnique(...args),
      create: (...args: unknown[]) => mockPrismaUserCreate(...args),
      delete: (...args: unknown[]) => mockPrismaUserDelete(...args),
      update: (...args: unknown[]) => mockPrismaUserUpdate(...args),
    },
  },
}))

vi.mock('bcryptjs', () => ({
  default: {
    hash: (...args: unknown[]) => mockBcryptHash(...args),
    compare: (...args: unknown[]) => mockBcryptCompare(...args),
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

vi.mock('@/lib/auth/auth/auth', () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
  signIn: (...args: unknown[]) => mockSignIn(...args),
}))

vi.mock('next/headers', () => ({
  headers: (...args: unknown[]) => mockHeaders(...args),
}))

vi.mock('@/lib/auth/rateLimit/rateLimit', () => ({
  createRateLimiter: vi.fn(() => ({ limit: vi.fn() })),
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
  RATE_LIMIT_CONFIGS: {
    register: { limit: 3, duration: 3600 },
    signIn: { limit: 5, duration: 900 },
    forgotPassword: { limit: 3, duration: 3600 },
    deleteAccount: { limit: 3, duration: 900 },
  },
}))

const originalEnv = process.env

describe('handleRegister', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...originalEnv }
    mockHeaders.mockResolvedValue(new Map([['x-client-ip', '127.0.0.1']]))
    mockCheckRateLimit.mockResolvedValue({ success: true })
    mockBcryptHash.mockResolvedValue('hashed-password')
    mockCreateVerificationToken.mockResolvedValue('token-123')
    mockResendSend.mockResolvedValue({})
    mockPrismaUserFindUnique.mockResolvedValue(null)
    mockPrismaUserCreate.mockResolvedValue({})
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('registers new user with valid data', async () => {
    process.env.ENABLE_EMAIL_VERIFICATION = 'false'

    const formData = new FormData()
    formData.set('name', 'John Doe')
    formData.set('email', 'john@example.com')
    formData.set('password', 'password123')
    formData.set('confirmPassword', 'password123')

    const { handleRegister } = await import('./Auth')
    await expect(handleRegister(formData)).rejects.toThrow('NEXT_REDIRECT')

    expect(mockPrismaUserCreate).toHaveBeenCalledWith({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed-password',
      },
    })
  })

  it('hashes password with bcrypt cost 12', async () => {
    process.env.ENABLE_EMAIL_VERIFICATION = 'false'

    const formData = new FormData()
    formData.set('name', 'John Doe')
    formData.set('email', 'john@example.com')
    formData.set('password', 'password123')
    formData.set('confirmPassword', 'password123')

    const { handleRegister } = await import('./Auth')
    await expect(handleRegister(formData)).rejects.toThrow('NEXT_REDIRECT')

    expect(mockBcryptHash).toHaveBeenCalledWith('password123', 12)
  })

  it('creates verification token when email verification enabled', async () => {
    process.env.ENABLE_EMAIL_VERIFICATION = 'true'

    const formData = new FormData()
    formData.set('name', 'John Doe')
    formData.set('email', 'john@example.com')
    formData.set('password', 'password123')
    formData.set('confirmPassword', 'password123')

    const { handleRegister } = await import('./Auth')
    await expect(handleRegister(formData)).rejects.toThrow('NEXT_REDIRECT')

    expect(mockCreateVerificationToken).toHaveBeenCalledWith('john@example.com')
    expect(mockResendSend).toHaveBeenCalled()
  })

  it('redirects to verify-email on success with verification enabled', async () => {
    process.env.ENABLE_EMAIL_VERIFICATION = 'true'

    const formData = new FormData()
    formData.set('name', 'John Doe')
    formData.set('email', 'john@example.com')
    formData.set('password', 'password123')
    formData.set('confirmPassword', 'password123')

    const { handleRegister } = await import('./Auth')
    await expect(handleRegister(formData)).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining('/verify-email?success=registered&email=')
    )
  })

  it('redirects to sign-in on success with verification disabled', async () => {
    process.env.ENABLE_EMAIL_VERIFICATION = 'false'

    const formData = new FormData()
    formData.set('name', 'John Doe')
    formData.set('email', 'john@example.com')
    formData.set('password', 'password123')
    formData.set('confirmPassword', 'password123')

    const { handleRegister } = await import('./Auth')
    await expect(handleRegister(formData)).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining('/sign-in?success=registered&email=')
    )
  })

  it('returns error for duplicate email', async () => {
    process.env.ENABLE_EMAIL_VERIFICATION = 'false'
    mockPrismaUserFindUnique.mockResolvedValue({ id: 'existing-user' })

    const formData = new FormData()
    formData.set('name', 'John Doe')
    formData.set('email', 'existing@example.com')
    formData.set('password', 'password123')
    formData.set('confirmPassword', 'password123')

    const { handleRegister } = await import('./Auth')
    await expect(handleRegister(formData)).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith(
      '/register?error=User+with+this+email+already+exists'
    )
  })

  it('redirects on Zod validation failure', async () => {
    const formData = new FormData()
    formData.set('name', '')
    formData.set('email', 'invalid-email')
    formData.set('password', 'short')
    formData.set('confirmPassword', 'different')

    const { handleRegister } = await import('./Auth')
    await expect(handleRegister(formData)).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining('/register?error=')
    )
  })

  it('calls revalidatePath on success', async () => {
    process.env.ENABLE_EMAIL_VERIFICATION = 'false'

    const formData = new FormData()
    formData.set('name', 'John Doe')
    formData.set('email', 'john@example.com')
    formData.set('password', 'password123')
    formData.set('confirmPassword', 'password123')

    const { handleRegister } = await import('./Auth')
    await expect(handleRegister(formData)).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRevalidatePath).toHaveBeenCalledWith('/register')
  })

  it('redirects when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({ success: false, retryAfter: 3600 })

    const formData = new FormData()
    formData.set('name', 'John Doe')
    formData.set('email', 'john@example.com')
    formData.set('password', 'password123')
    formData.set('confirmPassword', 'password123')

    const { handleRegister } = await import('./Auth')
    await expect(handleRegister(formData)).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining('/register?error=')
    )
  })

  it('continues registration even if email sending fails', async () => {
    process.env.ENABLE_EMAIL_VERIFICATION = 'true'
    mockResendSend.mockRejectedValue(new Error('Email service unavailable'))

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const formData = new FormData()
    formData.set('name', 'John Doe')
    formData.set('email', 'john@example.com')
    formData.set('password', 'password123')
    formData.set('confirmPassword', 'password123')

    const { handleRegister } = await import('./Auth')
    await expect(handleRegister(formData)).rejects.toThrow('NEXT_REDIRECT')

    expect(consoleSpy).toHaveBeenCalledWith('Failed to send verification email:', expect.any(Error))
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining('/verify-email?success=registered&email=')
    )

    consoleSpy.mockRestore()
  })
})

describe('handleDeleteAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSignOut.mockResolvedValue({})
  })

  it('returns error when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const { handleDeleteAccount } = await import('./Auth')
    const result = await handleDeleteAccount('password123')

    expect(result).toEqual({ error: 'Not authenticated', data: null })
  })

  it('returns error when user not found', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaUserFindUnique.mockResolvedValue(null)

    const { handleDeleteAccount } = await import('./Auth')
    const result = await handleDeleteAccount('password123')

    expect(result).toEqual({ error: 'User not found', data: null })
  })

  it('returns error for OAuth user without password', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaUserFindUnique.mockResolvedValue({ id: 'user-1', password: null })

    const { handleDeleteAccount } = await import('./Auth')
    const result = await handleDeleteAccount('password123')

    expect(result).toEqual({ error: 'Password verification required', data: null })
  })

  it('returns error on wrong password', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaUserFindUnique.mockResolvedValue({ id: 'user-1', password: 'hashed' })
    mockBcryptCompare.mockResolvedValue(false)

    const { handleDeleteAccount } = await import('./Auth')
    const result = await handleDeleteAccount('wrong-password')

    expect(result).toEqual({ error: 'Password verification failed', data: null })
  })

  it('deletes account and signs out on success', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaUserFindUnique.mockResolvedValue({ id: 'user-1', password: 'hashed' })
    mockBcryptCompare.mockResolvedValue(true)
    mockPrismaUserDelete.mockResolvedValue({})

    const { handleDeleteAccount } = await import('./Auth')
    const result = await handleDeleteAccount('correct-password')

    expect(result).toEqual({ success: true, data: null })
    expect(mockPrismaUserDelete).toHaveBeenCalledWith({ where: { id: 'user-1' } })
    expect(mockSignOut).toHaveBeenCalledWith({ redirectTo: '/sign-in' })
    expect(mockRevalidatePath).toHaveBeenCalledWith('/profile')
  })

  it('returns error when deletion fails', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaUserFindUnique.mockResolvedValue({ id: 'user-1', password: 'hashed' })
    mockBcryptCompare.mockResolvedValue(true)
    mockPrismaUserDelete.mockRejectedValue(new Error('Database error'))

    const { handleDeleteAccount } = await import('./Auth')
    const result = await handleDeleteAccount('correct-password')

    expect(result).toEqual({ error: 'Failed to delete account', data: null })
    expect(mockSignOut).not.toHaveBeenCalled()
  })
})

describe('handleChangePassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns error when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const { handleChangePassword } = await import('./Auth')
    const result = await handleChangePassword({
      currentPassword: 'old',
      newPassword: 'new',
      confirmPassword: 'new',
    })

    expect(result).toEqual({ error: 'Not authenticated', data: null })
  })

  it('returns error for OAuth user without password', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaUserFindUnique.mockResolvedValue({ password: null })

    const { handleChangePassword } = await import('./Auth')
    const result = await handleChangePassword({
      currentPassword: 'old',
      newPassword: 'new',
      confirmPassword: 'new',
    })

    expect(result).toEqual({
      error: 'Password change not available for OAuth accounts',
      data: null,
    })
  })

  it('returns error on incorrect current password', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaUserFindUnique.mockResolvedValue({ password: 'hashed' })
    mockBcryptCompare.mockResolvedValue(false)

    const { handleChangePassword } = await import('./Auth')
    const result = await handleChangePassword({
      currentPassword: 'wrong',
      newPassword: 'new',
      confirmPassword: 'new',
    })

    expect(result).toEqual({ error: 'Current password is incorrect', data: null })
  })

  it('updates password on success', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaUserFindUnique.mockResolvedValue({ password: 'hashed' })
    mockBcryptCompare.mockResolvedValue(true)
    mockBcryptHash.mockResolvedValue('new-hashed')
    mockPrismaUserUpdate.mockResolvedValue({})

    const { handleChangePassword } = await import('./Auth')
    const result = await handleChangePassword({
      currentPassword: 'correct',
      newPassword: 'new-password',
      confirmPassword: 'new-password',
    })

    expect(result).toEqual({ success: true, data: null })
    expect(mockBcryptHash).toHaveBeenCalledWith('new-password', 12)
    expect(mockPrismaUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { password: 'new-hashed' },
    })
  })
})

describe('handleSignOut', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls signOut with redirect to home', async () => {
    mockSignOut.mockResolvedValue({})

    const { handleSignOut } = await import('./Auth')
    await handleSignOut()

    expect(mockSignOut).toHaveBeenCalledWith({ redirectTo: '/' })
  })
})
