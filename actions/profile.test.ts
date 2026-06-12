import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockAuth = vi.fn()
const mockRevalidatePath = vi.fn()
const mockRedirect = vi.fn()

vi.mock('@/lib/auth/auth/auth', () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
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

describe('retryProfileData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls revalidatePath and redirect when authenticated', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })

    const { retryProfileData } = await import('./profile')
    const result = await retryProfileData()

    expect(mockRevalidatePath).toHaveBeenCalledWith('/profile')
    expect(mockRedirect).toHaveBeenCalledWith('/profile')
    expect(result).toEqual({ success: false, error: 'NEXT_REDIRECT' })
  })

  it('calls redirect to /sign-in when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const { retryProfileData } = await import('./profile')
    await expect(retryProfileData()).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith('/sign-in')
  })

  it('calls redirect to /sign-in when session has no user id', async () => {
    mockAuth.mockResolvedValue({ user: {} })

    const { retryProfileData } = await import('./profile')
    await expect(retryProfileData()).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith('/sign-in')
  })
})

describe('retryProfileDataAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls retryProfileData', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })

    const { retryProfileDataAction } = await import('./profile')
    await retryProfileDataAction()

    expect(mockRevalidatePath).toHaveBeenCalledWith('/profile')
  })
})
