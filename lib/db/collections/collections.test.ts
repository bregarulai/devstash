import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockPrismaCollectionFindMany = vi.fn()
const mockPrismaCollectionFindFirst = vi.fn()
const mockPrismaCollectionCreate = vi.fn()

vi.mock('@/lib/prisma/prisma', () => ({
  prisma: {
    collection: {
      findMany: (...args: unknown[]) => mockPrismaCollectionFindMany(...args),
      findFirst: (...args: unknown[]) => mockPrismaCollectionFindFirst(...args),
      create: (...args: unknown[]) => mockPrismaCollectionCreate(...args),
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

describe('createCollection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a collection with name only', async () => {
    const mockCreated = {
      id: 'col-new',
      name: 'New Collection',
      description: null,
      isFavorite: false,
      userId: 'user-1',
      defaultTypeId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockPrismaCollectionCreate.mockResolvedValue(mockCreated)

    const { createCollection } = await import('./collections')
    const result = await createCollection('user-1', { name: 'New Collection' })

    expect(result).toEqual(mockCreated)
    expect(mockPrismaCollectionCreate).toHaveBeenCalledWith({
      data: {
        name: 'New Collection',
        description: null,
        userId: 'user-1',
      },
    })
  })

  it('creates a collection with description', async () => {
    const mockCreated = {
      id: 'col-new',
      name: 'New Collection',
      description: 'A test description',
      isFavorite: false,
      userId: 'user-1',
      defaultTypeId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockPrismaCollectionCreate.mockResolvedValue(mockCreated)

    const { createCollection } = await import('./collections')
    const result = await createCollection('user-1', {
      name: 'New Collection',
      description: 'A test description',
    })

    expect(result).toEqual(mockCreated)
    expect(mockPrismaCollectionCreate).toHaveBeenCalledWith({
      data: {
        name: 'New Collection',
        description: 'A test description',
        userId: 'user-1',
      },
    })
  })

  it('converts undefined description to null', async () => {
    const mockCreated = {
      id: 'col-new',
      name: 'New Collection',
      description: null,
      isFavorite: false,
      userId: 'user-1',
      defaultTypeId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockPrismaCollectionCreate.mockResolvedValue(mockCreated)

    const { createCollection } = await import('./collections')
    await createCollection('user-1', { name: 'New Collection' })

    expect(mockPrismaCollectionCreate).toHaveBeenCalledWith({
      data: {
        name: 'New Collection',
        description: null,
        userId: 'user-1',
      },
    })
  })

  it('propagates prisma errors', async () => {
    mockPrismaCollectionCreate.mockRejectedValue(new Error('DB error'))

    const { createCollection } = await import('./collections')

    await expect(createCollection('user-1', { name: 'Test' })).rejects.toThrow('DB error')
  })
})

describe('getUserCollectionList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns collection id and name pairs', async () => {
    mockPrismaCollectionFindMany.mockResolvedValue([
      { id: 'col-1', name: 'Collection A' },
      { id: 'col-2', name: 'Collection B' },
    ])

    const { getUserCollectionList } = await import('./collections')
    const result = await getUserCollectionList('user-1')

    expect(result).toEqual([
      { id: 'col-1', name: 'Collection A' },
      { id: 'col-2', name: 'Collection B' },
    ])
  })

  it('returns empty array when no collections', async () => {
    mockPrismaCollectionFindMany.mockResolvedValue([])

    const { getUserCollectionList } = await import('./collections')
    const result = await getUserCollectionList('user-1')

    expect(result).toEqual([])
  })

  it('orders collections by name ascending', async () => {
    mockPrismaCollectionFindMany.mockResolvedValue([])

    const { getUserCollectionList } = await import('./collections')
    await getUserCollectionList('user-1')

    expect(mockPrismaCollectionFindMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    })
  })
})

describe('getCollectionById', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns collection with items', async () => {
    mockPrismaCollectionFindFirst.mockResolvedValue({
      id: 'col-1',
      name: 'Test Collection',
      description: 'A test collection',
      isFavorite: true,
      createdAt: new Date('2024-01-01'),
      _count: { items: 2 },
      items: [
        {
          item: {
            id: 'item-1',
            title: 'Item 1',
            description: null,
            contentType: 'TEXT',
            content: 'content',
            url: null,
            fileUrl: null,
            fileName: null,
            fileSize: null,
            language: null,
            isFavorite: false,
            isPinned: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            itemType: { name: 'Note', icon: '📝', color: '#0000ff' },
            tags: [{ id: 'tag-1', name: 'test' }],
            collections: [{ collection: { id: 'col-1', name: 'Test Collection' } }],
          },
        },
        {
          item: {
            id: 'item-2',
            title: 'Item 2',
            description: 'Desc',
            contentType: 'URL',
            content: null,
            url: 'https://example.com',
            fileUrl: null,
            fileName: null,
            fileSize: null,
            language: null,
            isFavorite: true,
            isPinned: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            itemType: { name: 'Link', icon: '🔗', color: '#ff0000' },
            tags: [],
            collections: [{ collection: { id: 'col-1', name: 'Test Collection' } }],
          },
        },
      ],
    })

    const { getCollectionById } = await import('./collections')
    const result = await getCollectionById('user-1', 'col-1')

    expect(result).not.toBeNull()
    expect(result!.id).toBe('col-1')
    expect(result!.name).toBe('Test Collection')
    expect(result!.description).toBe('A test collection')
    expect(result!.isFavorite).toBe(true)
    expect(result!.itemCount).toBe(2)
    expect(result!.items).toHaveLength(2)
    expect(result!.items[0].id).toBe('item-1')
    expect(result!.items[0].collections).toEqual([{ id: 'col-1', name: 'Test Collection' }])
  })

  it('returns null when collection not found', async () => {
    mockPrismaCollectionFindFirst.mockResolvedValue(null)

    const { getCollectionById } = await import('./collections')
    const result = await getCollectionById('user-1', 'nonexistent')

    expect(result).toBeNull()
  })

  it('returns null when collection belongs to different user', async () => {
    mockPrismaCollectionFindFirst.mockResolvedValue(null)

    const { getCollectionById } = await import('./collections')
    const result = await getCollectionById('user-2', 'col-1')

    expect(result).toBeNull()
  })

  it('queries with correct user and collection id', async () => {
    mockPrismaCollectionFindFirst.mockResolvedValue(null)

    const { getCollectionById } = await import('./collections')
    await getCollectionById('user-1', 'col-1')

    expect(mockPrismaCollectionFindFirst).toHaveBeenCalledWith({
      where: {
        id: 'col-1',
        userId: 'user-1',
      },
      include: {
        _count: { select: { items: true } },
        items: {
          include: {
            item: {
              include: {
                itemType: { select: { name: true, icon: true, color: true } },
                tags: { select: { id: true, name: true } },
                collections: {
                  select: {
                    collection: { select: { id: true, name: true } },
                  },
                },
              },
            },
          },
        },
      },
    })
  })

  it('filters out null items', async () => {
    mockPrismaCollectionFindFirst.mockResolvedValue({
      id: 'col-1',
      name: 'Collection with null item',
      description: null,
      isFavorite: false,
      createdAt: new Date(),
      _count: { items: 2 },
      items: [
        {
          item: {
            id: 'item-1',
            title: 'Item 1',
            description: null,
            contentType: 'TEXT',
            content: null,
            url: null,
            fileUrl: null,
            fileName: null,
            fileSize: null,
            language: null,
            isFavorite: false,
            isPinned: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            itemType: { name: 'Note', icon: '📝', color: '#0000ff' },
            tags: [],
            collections: [],
          },
        },
        { item: null },
      ],
    })

    const { getCollectionById } = await import('./collections')
    const result = await getCollectionById('user-1', 'col-1')

    expect(result).not.toBeNull()
    expect(result!.items).toHaveLength(1)
    expect(result!.items[0].id).toBe('item-1')
  })
})
