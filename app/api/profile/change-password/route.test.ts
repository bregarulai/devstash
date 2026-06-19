import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockAuth = vi.fn()
const mockPrismaUserFindUnique = vi.fn()
const mockPrismaUserUpdate = vi.fn()
const mockBcryptCompare = vi.fn()
const mockBcryptHash = vi.fn()
const mockCheckRateLimit = vi.fn()
const mockCreateRateLimiter = vi.fn(() => ({}))
const mockGetClientIP = vi.fn().mockReturnValue('127.0.0.1')
const mockFormatRetryAfter = vi.fn().mockReturnValue('15 minutes')

const mockHeaders = vi.fn().mockResolvedValue(new Map([
  ['x-csrf-token', 'valid-csrf'],
  ['cookie', '__Host-next-auth.csrf-token=valid-csrf'],
]))

vi.mock('next/headers', () => ({
  headers: (...args: unknown[]) => mockHeaders(...args),
}))

vi.mock('@/lib/auth/auth/auth', () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}))

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
    compare: (...args: unknown[]) => mockBcryptCompare(...args),
    hash: (...args: unknown[]) => mockBcryptHash(...args),
  },
}))

vi.mock('@/lib/auth/rateLimit/rateLimit', () => ({
  createRateLimiter: (...args: Parameters<typeof mockCreateRateLimiter>) => mockCreateRateLimiter(...args),
  checkRateLimit: (...args: Parameters<typeof mockCheckRateLimit>) => mockCheckRateLimit(...args),
  formatRetryAfter: (...args: Parameters<typeof mockFormatRetryAfter>) => mockFormatRetryAfter(...args),
  RATE_LIMIT_CONFIGS: {
    changePassword: { limit: 5, duration: 900 },
  },
  getClientIP: (...args: Parameters<typeof mockGetClientIP>) => mockGetClientIP(...args),
}))

function createMockRequest(body: unknown) {
  return {
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Request
}

describe('POST /api/profile/change-password', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCheckRateLimit.mockResolvedValue({ success: true })
    mockGetClientIP.mockReturnValue('127.0.0.1')
    mockFormatRetryAfter.mockReturnValue('15 minutes')
    mockBcryptHash.mockResolvedValue('new-hashed-password')
    mockPrismaUserUpdate.mockResolvedValue({})
    mockHeaders.mockResolvedValue(new Map([
      ['x-csrf-token', 'valid-csrf'],
      ['cookie', '__Host-next-auth.csrf-token=valid-csrf'],
    ]))
  })

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({ success: false, retryAfter: 900 })

    const { POST } = await import('./route')
    const request = createMockRequest(
      { currentPassword: 'old', newPassword: 'NewPassword123!', confirmPassword: 'NewPassword123!' }
    )
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.error).toContain('Too many attempts')
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const { POST } = await import('./route')
    const request = createMockRequest(
      { currentPassword: 'old', newPassword: 'NewPassword123!', confirmPassword: 'NewPassword123!' }
    )
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Not authenticated')
  })

  it('returns 403 when CSRF token missing', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockHeaders.mockResolvedValue(new Map())

    const { POST } = await import('./route')
    const request = createMockRequest(
      { currentPassword: 'old', newPassword: 'NewPassword123!', confirmPassword: 'NewPassword123!' }
    )
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('CSRF validation failed')
  })

  it('returns 403 when CSRF token does not match cookie', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockHeaders.mockResolvedValue(new Map([
      ['x-csrf-token', 'wrong-token'],
      ['cookie', '__Host-next-auth.csrf-token=valid-csrf'],
    ]))

    const { POST } = await import('./route')
    const request = createMockRequest(
      { currentPassword: 'old', newPassword: 'NewPassword123!', confirmPassword: 'NewPassword123!' }
    )
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('CSRF validation failed')
  })

  it('returns 400 for invalid JSON body', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })

    const { POST } = await import('./route')
    const request = {
      json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
    } as unknown as Request
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid request body')
  })

  it('returns 400 for Zod validation failure', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })

    const { POST } = await import('./route')
    const request = createMockRequest(
      { currentPassword: 'old', newPassword: 'short', confirmPassword: 'different' }
    )
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('returns 400 for OAuth user without password', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaUserFindUnique.mockResolvedValue({ password: null })

    const { POST } = await import('./route')
    const request = createMockRequest(
      { currentPassword: 'old', newPassword: 'NewPassword123!', confirmPassword: 'NewPassword123!' }
    )
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Password change not available for OAuth accounts')
  })

  it('returns 401 for incorrect current password', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaUserFindUnique.mockResolvedValue({ password: 'hashed' })
    mockBcryptCompare.mockResolvedValue(false)

    const { POST } = await import('./route')
    const request = createMockRequest(
      { currentPassword: 'wrong', newPassword: 'NewPassword123!', confirmPassword: 'NewPassword123!' }
    )
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Current password is incorrect')
  })

  it('returns 200 on successful password change', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaUserFindUnique.mockResolvedValue({ password: 'hashed' })
    mockBcryptCompare.mockResolvedValue(true)
    mockBcryptHash.mockResolvedValue('new-hashed')
    mockPrismaUserUpdate.mockResolvedValue({})

    const { POST } = await import('./route')
    const request = createMockRequest(
      { currentPassword: 'correct', newPassword: 'NewPassword123!', confirmPassword: 'NewPassword123!' }
    )
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockBcryptHash).toHaveBeenCalledWith('NewPassword123!', 12)
    expect(mockPrismaUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { password: 'new-hashed' },
    })
  })

  it('returns 500 when bcrypt.hash fails', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaUserFindUnique.mockResolvedValue({ password: 'hashed' })
    mockBcryptCompare.mockResolvedValue(true)
    mockBcryptHash.mockRejectedValue(new Error('Hash failed'))

    const { POST } = await import('./route')
    const request = createMockRequest(
      { currentPassword: 'correct', newPassword: 'NewPassword123!', confirmPassword: 'NewPassword123!' }
    )
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to update password')
  })

  it('returns 500 when prisma.user.update fails', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaUserFindUnique.mockResolvedValue({ password: 'hashed' })
    mockBcryptCompare.mockResolvedValue(true)
    mockBcryptHash.mockResolvedValue('new-hashed')
    mockPrismaUserUpdate.mockRejectedValue(new Error('Database error'))

    const { POST } = await import('./route')
    const request = createMockRequest(
      { currentPassword: 'correct', newPassword: 'NewPassword123!', confirmPassword: 'NewPassword123!' }
    )
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to update password')
  })

  it('uses rate limiter with correct config', async () => {
    mockAuth.mockResolvedValue(null)

    const { POST } = await import('./route')
    const request = createMockRequest(
      { currentPassword: 'old', newPassword: 'NewPassword123!', confirmPassword: 'NewPassword123!' }
    )
    await POST(request)

    expect(mockCreateRateLimiter).toHaveBeenCalledWith({ limit: 5, duration: 900 })
    expect(mockCheckRateLimit).toHaveBeenCalled()
  })

  it('extracts client IP from request headers', async () => {
    mockAuth.mockResolvedValue(null)
    mockGetClientIP.mockReturnValue('192.168.1.100')

    const { POST } = await import('./route')
    const request = createMockRequest(
      { currentPassword: 'old', newPassword: 'NewPassword123!', confirmPassword: 'NewPassword123!' }
    )
    await POST(request)

    expect(mockGetClientIP).toHaveBeenCalled()
  })
})
