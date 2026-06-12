import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockAuth = vi.fn()
const mockSignOut = vi.fn()
const mockFindUnique = vi.fn()
const mockDelete = vi.fn()
const mockRevalidatePath = vi.fn()
const mockCompare = vi.fn()

vi.mock('@/lib/prisma/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      delete: (...args: unknown[]) => mockDelete(...args),
    },
  },
}))

vi.mock('@/lib/auth/auth/auth', () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
}))

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}))

vi.mock('bcryptjs', () => ({
  default: { compare: (...args: unknown[]) => mockCompare(...args) },
}))

const { deleteAccountByPassword } = await import('./accountDeletion')

describe('deleteAccountByPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns error when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const result = await deleteAccountByPassword('password123')

    expect(result).toEqual({ error: 'Not authenticated', data: null })
    expect(mockFindUnique).not.toHaveBeenCalled()
  })

  it('returns error when session has no user id', async () => {
    mockAuth.mockResolvedValue({ user: {} })

    const result = await deleteAccountByPassword('password123')

    expect(result).toEqual({ error: 'Not authenticated', data: null })
  })

  it('returns error when user not found', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindUnique.mockResolvedValue(null)

    const result = await deleteAccountByPassword('password123')

    expect(result).toEqual({ error: 'User not found', data: null })
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: { id: true, password: true },
    })
  })

  it('returns error when user has no password (OAuth user)', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindUnique.mockResolvedValue({ id: 'user-1', password: null })

    const result = await deleteAccountByPassword('password123')

    expect(result).toEqual({ error: 'Password verification required', data: null })
  })

  it('returns error when password is incorrect', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindUnique.mockResolvedValue({ id: 'user-1', password: 'hashed-password' })
    mockCompare.mockResolvedValue(false)

    const result = await deleteAccountByPassword('wrong-password')

    expect(result).toEqual({ error: 'Password verification failed', data: null })
    expect(mockCompare).toHaveBeenCalledWith('wrong-password', 'hashed-password')
  })

  it('deletes account and signs out on success', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindUnique.mockResolvedValue({ id: 'user-1', password: 'hashed-password' })
    mockCompare.mockResolvedValue(true)
    mockDelete.mockResolvedValue({})
    mockSignOut.mockResolvedValue({})

    const result = await deleteAccountByPassword('correct-password')

    expect(result).toEqual({ success: true, data: null })
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'user-1' } })
    expect(mockSignOut).toHaveBeenCalledWith({ redirectTo: '/sign-in' })
    expect(mockRevalidatePath).toHaveBeenCalledWith('/profile')
  })

  it('returns error when deletion fails', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindUnique.mockResolvedValue({ id: 'user-1', password: 'hashed-password' })
    mockCompare.mockResolvedValue(true)
    mockDelete.mockRejectedValue(new Error('Database error'))

    const result = await deleteAccountByPassword('correct-password')

    expect(result).toEqual({ error: 'Failed to delete account', data: null })
    expect(mockSignOut).not.toHaveBeenCalled()
  })
})
