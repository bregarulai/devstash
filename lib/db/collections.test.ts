import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockPrismaCollectionFindMany = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    collection: {
      findMany: (...args: unknown[]) => mockPrismaCollectionFindMany(...args),
    },
  },
}))

describe('getDominantItemTypeColor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns color of most frequent item type', async () => {
    mockPrismaCollectionFindMany.mockResolvedValue([
      {
        id: 'col-1',
        name: 'Test Collection',
        description: null,
        isFavorite: false,
        createdAt: new Date(),
        _count: { items: 3 },
        items: [
          { item: { itemType: { name: 'Type A', color: '#ff0000' }, contentType: 'code' } },
          { item: { itemType: { name: 'Type A', color: '#ff0000' }, contentType: 'code' } },
          { item: { itemType: { name: 'Type B', color: '#00ff00' }, contentType: 'text' } },
        ],
      },
    ])

    const { getFavoriteCollections } = await import('./collections')
    const result = await getFavoriteCollections('user-1')

    expect(result[0].dominantItemTypeColor).toBe('#ff0000')
  })

  it('returns empty string for empty array', async () => {
    mockPrismaCollectionFindMany.mockResolvedValue([
      {
        id: 'col-1',
        name: 'Empty Collection',
        description: null,
        isFavorite: false,
        createdAt: new Date(),
        _count: { items: 0 },
        items: [],
      },
    ])

    const { getFavoriteCollections } = await import('./collections')
    const result = await getFavoriteCollections('user-1')

    expect(result[0].dominantItemTypeColor).toBe('')
  })

  it('returns first color when counts are equal', async () => {
    mockPrismaCollectionFindMany.mockResolvedValue([
      {
        id: 'col-1',
        name: 'Equal Collection',
        description: null,
        isFavorite: false,
        createdAt: new Date(),
        _count: { items: 2 },
        items: [
          { item: { itemType: { name: 'Type A', color: '#ff0000' }, contentType: 'code' } },
          { item: { itemType: { name: 'Type B', color: '#00ff00' }, contentType: 'text' } },
        ],
      },
    ])

    const { getFavoriteCollections } = await import('./collections')
    const result = await getFavoriteCollections('user-1')

    expect(result[0].dominantItemTypeColor).toBe('#ff0000')
  })

  it('handles single item type', async () => {
    mockPrismaCollectionFindMany.mockResolvedValue([
      {
        id: 'col-1',
        name: 'Single Type Collection',
        description: null,
        isFavorite: false,
        createdAt: new Date(),
        _count: { items: 1 },
        items: [
          { item: { itemType: { name: 'Type A', color: '#ff0000' }, contentType: 'code' } },
        ],
      },
    ])

    const { getFavoriteCollections } = await import('./collections')
    const result = await getFavoriteCollections('user-1')

    expect(result[0].dominantItemTypeColor).toBe('#ff0000')
  })

  it('filters out null item types', async () => {
    mockPrismaCollectionFindMany.mockResolvedValue([
      {
        id: 'col-1',
        name: 'Mixed Collection',
        description: null,
        isFavorite: false,
        createdAt: new Date(),
        _count: { items: 2 },
        items: [
          { item: { itemType: { name: 'Type A', color: '#ff0000' }, contentType: 'code' } },
          { item: { itemType: null, contentType: 'text' } },
        ],
      },
    ])

    const { getFavoriteCollections } = await import('./collections')
    const result = await getFavoriteCollections('user-1')

    expect(result[0].dominantItemTypeColor).toBe('#ff0000')
    expect(result[0].itemTypeNames).toEqual(['Type A'])
  })

  it('returns distinct type names', async () => {
    mockPrismaCollectionFindMany.mockResolvedValue([
      {
        id: 'col-1',
        name: 'Multi-Type Collection',
        description: null,
        isFavorite: false,
        createdAt: new Date(),
        _count: { items: 3 },
        items: [
          { item: { itemType: { name: 'Type A', color: '#ff0000' }, contentType: 'code' } },
          { item: { itemType: { name: 'Type A', color: '#ff0000' }, contentType: 'code' } },
          { item: { itemType: { name: 'Type B', color: '#00ff00' }, contentType: 'text' } },
        ],
      },
    ])

    const { getFavoriteCollections } = await import('./collections')
    const result = await getFavoriteCollections('user-1')

    expect(result[0].itemTypeNames).toEqual(['Type A', 'Type B'])
  })

  it('counts content types correctly', async () => {
    mockPrismaCollectionFindMany.mockResolvedValue([
      {
        id: 'col-1',
        name: 'Content Type Collection',
        description: null,
        isFavorite: false,
        createdAt: new Date(),
        _count: { items: 3 },
        items: [
          { item: { itemType: { name: 'Type A', color: '#ff0000' }, contentType: 'code' } },
          { item: { itemType: { name: 'Type A', color: '#ff0000' }, contentType: 'code' } },
          { item: { itemType: { name: 'Type B', color: '#00ff00' }, contentType: 'text' } },
        ],
      },
    ])

    const { getFavoriteCollections } = await import('./collections')
    const result = await getFavoriteCollections('user-1')

    expect(result[0].contentTypeCounts).toEqual({ code: 2, text: 1 })
  })

  it('returns correct collection stats', async () => {
    mockPrismaCollectionFindMany.mockResolvedValue([
      {
        id: 'col-1',
        name: 'Stats Collection',
        description: 'A test collection',
        isFavorite: true,
        createdAt: new Date('2024-01-01'),
        _count: { items: 5 },
        items: [],
      },
    ])

    const { getFavoriteCollections } = await import('./collections')
    const result = await getFavoriteCollections('user-1')

    expect(result[0]).toEqual({
      id: 'col-1',
      name: 'Stats Collection',
      description: 'A test collection',
      itemCount: 5,
      isFavorite: true,
      itemTypeNames: [],
      dominantItemTypeColor: '',
      contentTypeCounts: {},
      createdAt: new Date('2024-01-01'),
    })
  })
})

describe('getRecentCollections', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns recent collections with correct structure', async () => {
    mockPrismaCollectionFindMany.mockResolvedValue([
      {
        id: 'col-1',
        name: 'Recent Collection',
        description: null,
        isFavorite: false,
        createdAt: new Date(),
        _count: { items: 2 },
        items: [
          { item: { itemType: { name: 'Type A', color: '#ff0000' }, contentType: 'code' } },
          { item: { itemType: null, contentType: null } },
        ],
      },
    ])

    const { getRecentCollections } = await import('./collections')
    const result = await getRecentCollections('user-1')

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Recent Collection')
    expect(result[0].itemCount).toBe(2)
  })
})

describe('getAllCollections', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns all collections with correct structure', async () => {
    mockPrismaCollectionFindMany.mockResolvedValue([
      {
        id: 'col-1',
        name: 'All Collection',
        description: 'Description',
        isFavorite: true,
        createdAt: new Date(),
        _count: { items: 3 },
        items: [
          { item: { itemType: { name: 'Type A', color: '#ff0000' }, contentType: 'code' } },
        ],
      },
    ])

    const { getAllCollections } = await import('./collections')
    const result = await getAllCollections('user-1')

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('All Collection')
    expect(result[0].description).toBe('Description')
    expect(result[0].isFavorite).toBe(true)
  })
})
