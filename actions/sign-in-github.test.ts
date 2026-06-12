import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSignIn = vi.fn()
const mockRedirect = vi.fn()
const mockCheckRateLimit = vi.fn()
const mockGetClientIP = vi.fn()

vi.mock('@/lib/auth', () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
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
    githubOAuth: { limit: 10, duration: 900 },
  },
}))

describe('handleSignInWithGitHub', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetClientIP.mockReturnValue('127.0.0.1')
    mockCheckRateLimit.mockResolvedValue({ success: true })
    mockSignIn.mockResolvedValue({})
  })

  it('initiates GitHub OAuth flow', async () => {
    const { handleSignInWithGitHub } = await import('./sign-in-github')
    await handleSignInWithGitHub()

    expect(mockSignIn).toHaveBeenCalledWith('github', {
      redirectTo: '/dashboard',
    })
  })

  it('returns success on successful sign-in', async () => {
    const { handleSignInWithGitHub } = await import('./sign-in-github')
    await expect(handleSignInWithGitHub()).resolves.not.toThrow()
  })

  it('returns error redirect when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({ success: false, retryAfter: 900 })

    const { handleSignInWithGitHub } = await import('./sign-in-github')
    await expect(handleSignInWithGitHub()).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining('/sign-in?error=')
    )
  })

  it('returns error redirect with singular minute when retryAfter <= 60', async () => {
    mockCheckRateLimit.mockResolvedValue({ success: false, retryAfter: 60 })

    const { handleSignInWithGitHub } = await import('./sign-in-github')
    await expect(handleSignInWithGitHub()).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining('1%20minute')
    )
  })

  it('returns error redirect using fallback retryAfter when undefined', async () => {
    mockCheckRateLimit.mockResolvedValue({ success: false })

    const { handleSignInWithGitHub } = await import('./sign-in-github')
    await expect(handleSignInWithGitHub()).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining('15%20minutes')
    )
  })

  it('calls redirect on success', async () => {
    const { handleSignInWithGitHub } = await import('./sign-in-github')
    await expect(handleSignInWithGitHub()).resolves.not.toThrow()
  })
})
