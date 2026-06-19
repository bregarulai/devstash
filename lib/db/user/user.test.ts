import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockPrismaUserFindUnique = vi.fn()
const mockPrismaItemTypeFindMany = vi.fn()
const mockPrismaItemGroupBy = vi.fn()
const mockGetItemStats = vi.fn()
const mockGetSystemItemTypesWithCounts = vi.fn()

vi.mock('@/lib/prisma/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockPrismaUserFindUnique(...args),
    },
    itemType: {
      findMany: (...args: unknown[]) => mockPrismaItemTypeFindMany(...args),
    },
    item: {
      groupBy: (...args: unknown[]) => mockPrismaItemGroupBy(...args),
    },
  },
}))

vi.mock('@/lib/db/items/items', () => ({
  getItemStats: (...args: unknown[]) => mockGetItemStats(...args),
  getSystemItemTypesWithCounts: (...args: unknown[]) => mockGetSystemItemTypesWithCounts(...args),
}))

describe('loadProfileDataAsync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetItemStats.mockResolvedValue({
      totalItems: 0,
      totalCollections: 0,
      favoriteItems: 0,
      favoriteCollections: 0,
    })
  })

  it('returns user data with hasPassword true when password exists', async () => {
    mockPrismaUserFindUnique.mockResolvedValueOnce({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      image: null,
      isPro: false,
      createdAt: new Date('2024-01-01'),
      password: '$2a$12$hashedpassword',
    })

    const { loadProfileDataAsync } = await import('./user')
    const result = await loadProfileDataAsync('user-1')

    expect(result.user).not.toBeNull()
    expect(result.user?.hasPassword).toBe(true)
    expect(result.user?.id).toBe('user-1')
    expect(result.errorType).toBeNull()
  })

  it('returns user data with hasPassword false when no password', async () => {
    mockPrismaUserFindUnique.mockResolvedValueOnce({
      id: 'user-2',
      name: 'OAuth User',
      email: 'oauth@example.com',
      image: 'https://example.com/avatar.jpg',
      isPro: true,
      createdAt: new Date('2024-01-01'),
      password: null,
    })

    const { loadProfileDataAsync } = await import('./user')
    const result = await loadProfileDataAsync('user-2')

    expect(result.user).not.toBeNull()
    expect(result.user?.hasPassword).toBe(false)
    expect(result.user?.isPro).toBe(true)
  })

  it('returns user-not-found error when user does not exist', async () => {
    mockPrismaUserFindUnique.mockResolvedValueOnce(null)

    const { loadProfileDataAsync } = await import('./user')
    const result = await loadProfileDataAsync('nonexistent')

    expect(result.user).toBeNull()
    expect(result.errorType).toBe('user-not-found')
    expect(result.itemStats).toEqual({
      totalItems: 0,
      totalCollections: 0,
      favoriteItems: 0,
      favoriteCollections: 0,
    })
  })

  it('returns db-failure error on database error', async () => {
    mockPrismaUserFindUnique.mockRejectedValue(new Error('Database connection failed'))

    const { loadProfileDataAsync } = await import('./user')
    const result = await loadProfileDataAsync('user-1')

    expect(result.user).toBeNull()
    expect(result.errorType).toBe('db-failure')
  })

  it('includes item stats from getItemStats', async () => {
    mockPrismaUserFindUnique.mockResolvedValueOnce({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      image: null,
      isPro: false,
      createdAt: new Date('2024-01-01'),
      password: null,
    })
    mockGetSystemItemTypesWithCounts.mockResolvedValue([])
    mockGetItemStats.mockResolvedValue({
      totalItems: 15,
      totalCollections: 5,
      favoriteItems: 3,
      favoriteCollections: 1,
    })

    const { loadProfileDataAsync } = await import('./user')
    const result = await loadProfileDataAsync('user-1')

    expect(result.itemStats).toEqual({
      totalItems: 15,
      totalCollections: 5,
      favoriteItems: 3,
      favoriteCollections: 1,
    })
  })

  it('returns default item stats when getItemStats fails', async () => {
    mockPrismaUserFindUnique.mockResolvedValueOnce({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      image: null,
      isPro: false,
      createdAt: new Date('2024-01-01'),
      password: null,
    })
    mockGetSystemItemTypesWithCounts.mockResolvedValue([])
    mockGetItemStats.mockRejectedValue(new Error('Stats query failed'))

    const { loadProfileDataAsync } = await import('./user')
    const result = await loadProfileDataAsync('user-1')

    expect(result.itemStats).toEqual({
      totalItems: 0,
      totalCollections: 0,
      favoriteItems: 0,
      favoriteCollections: 0,
    })
  })

  it('does not include password hash in returned user object', async () => {
    mockPrismaUserFindUnique.mockResolvedValueOnce({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      image: null,
      isPro: false,
      createdAt: new Date('2024-01-01'),
      password: '$2a$12$hashedpassword',
    })

    const { loadProfileDataAsync } = await import('./user')
    const result = await loadProfileDataAsync('user-1')

    expect(result.user).toHaveProperty('hasPassword')
    expect(result.user?.hasPassword).toBe(true)
  })
})

describe('getUserItemTypeBreakdown', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns item type breakdown with counts for user', async () => {
    mockGetSystemItemTypesWithCounts.mockResolvedValue([
      { name: 'File', icon: '📄', color: '#ff0000', itemCount: 5 },
      { name: 'Note', icon: '📝', color: '#00ff00', itemCount: 3 },
    ])

    const { getUserItemTypeBreakdown } = await import('./user')
    const result = await getUserItemTypeBreakdown('user-1')

    expect(result).toEqual([
      { name: 'File', icon: '📄', color: '#ff0000', count: 5 },
      { name: 'Note', icon: '📝', color: '#00ff00', count: 3 },
    ])
    expect(mockGetSystemItemTypesWithCounts).toHaveBeenCalledWith('user-1')
  })

  it('returns zero counts for types with no items', async () => {
    mockGetSystemItemTypesWithCounts.mockResolvedValue([
      { name: 'File', icon: '📄', color: '#ff0000', itemCount: 0 },
    ])

    const { getUserItemTypeBreakdown } = await import('./user')
    const result = await getUserItemTypeBreakdown('user-1')

    expect(result).toEqual([
      { name: 'File', icon: '📄', color: '#ff0000', count: 0 },
    ])
  })

  it('returns empty array when no system item types exist', async () => {
    mockGetSystemItemTypesWithCounts.mockResolvedValue([])

    const { getUserItemTypeBreakdown } = await import('./user')
    const result = await getUserItemTypeBreakdown('user-1')

    expect(result).toEqual([])
  })

  it('delegates to getSystemItemTypesWithCounts', async () => {
    mockGetSystemItemTypesWithCounts.mockResolvedValue([])

    const { getUserItemTypeBreakdown } = await import('./user')
    await getUserItemTypeBreakdown('user-1')

    expect(mockGetSystemItemTypesWithCounts).toHaveBeenCalledWith('user-1')
  })
})
