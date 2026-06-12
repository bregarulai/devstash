import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ItemWithDetails } from '@/types/db'

const mockPrismaItemCount = vi.fn()
const mockPrismaItemFindMany = vi.fn()
const mockPrismaCollectionCount = vi.fn()
const mockPrismaItemTypeFindMany = vi.fn()
const mockPrismaItemGroupBy = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    item: {
      count: (...args: unknown[]) => mockPrismaItemCount(...args),
      findMany: (...args: unknown[]) => mockPrismaItemFindMany(...args),
      groupBy: (...args: unknown[]) => mockPrismaItemGroupBy(...args),
    },
    collection: {
      count: (...args: unknown[]) => mockPrismaCollectionCount(...args),
    },
    itemType: {
      findMany: (...args: unknown[]) => mockPrismaItemTypeFindMany(...args),
    },
  },
}))

describe('mapItemToDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns item data unchanged', async () => {
    const mockItem = {
      id: 'item-1',
      title: 'Test Item',
      description: 'A test item',
      contentType: 'code',
      content: 'const x = 1',
      url: null,
      language: 'typescript',
      isFavorite: false,
      isPinned: true,
      itemType: { name: 'File', icon: '📄', color: '#ff0000' },
      tags: [{ id: 'tag-1', name: 'test' }],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    }

    const { mapItemToDetails } = await import('./items')
    const result = mapItemToDetails(mockItem as ItemWithDetails)

    expect(result).toEqual(mockItem)
  })

  it('handles all item properties', async () => {
    const mockItem = {
      id: 'item-2',
      title: 'Another Item',
      description: null,
      contentType: 'text',
      content: null,
      url: 'https://example.com',
      language: null,
      isFavorite: true,
      isPinned: false,
      itemType: null,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const { mapItemToDetails } = await import('./items')
    const result = mapItemToDetails(mockItem as ItemWithDetails)

    expect(result.id).toBe('item-2')
    expect(result.title).toBe('Another Item')
    expect(result.description).toBeNull()
    expect(result.url).toBe('https://example.com')
    expect(result.isFavorite).toBe(true)
    expect(result.isPinned).toBe(false)
    expect(result.itemType).toBeNull()
    expect(result.tags).toEqual([])
  })
})

describe('getItemStats', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    mockPrismaItemCount.mockReset()
    mockPrismaCollectionCount.mockReset()
  })

  it('returns correct counts for items, collections, pinned, favorites', async () => {
    mockPrismaItemCount
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(3)
    mockPrismaCollectionCount
      .mockResolvedValueOnce(8)
      .mockResolvedValueOnce(4)

    const { getItemStats } = await import('./items')
    const result = await getItemStats('user-1')

    expect(result).toEqual({
      totalItems: 10,
      totalCollections: 8,
      favoriteItems: 3,
      favoriteCollections: 4,
    })
  })

  it('returns zeros when no data', async () => {
    mockPrismaItemCount.mockResolvedValue(0)
    mockPrismaCollectionCount.mockResolvedValue(0)

    const { getItemStats } = await import('./items')
    const result = await getItemStats('user-1')

    expect(result).toEqual({
      totalItems: 0,
      totalCollections: 0,
      favoriteItems: 0,
      favoriteCollections: 0,
    })
  })
})

describe('getSystemItemTypesWithCounts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns item types with counts', async () => {
    mockPrismaItemTypeFindMany.mockResolvedValue([
      { id: 'type-1', name: 'File', icon: '📄', color: '#ff0000' },
      { id: 'type-2', name: 'Image', icon: '🖼️', color: '#00ff00' },
    ])
    mockPrismaItemGroupBy.mockResolvedValue([
      { itemTypeId: 'type-1', _count: { id: 5 } },
      { itemTypeId: 'type-2', _count: { id: 3 } },
    ])

    const { getSystemItemTypesWithCounts } = await import('./items')
    const result = await getSystemItemTypesWithCounts()

    expect(result).toEqual([
      { name: 'File', icon: '📄', color: '#ff0000', itemCount: 5 },
      { name: 'Image', icon: '🖼️', color: '#00ff00', itemCount: 3 },
    ])
  })

  it('returns empty array when no items', async () => {
    mockPrismaItemTypeFindMany.mockResolvedValue([])
    mockPrismaItemGroupBy.mockResolvedValue([])

    const { getSystemItemTypesWithCounts } = await import('./items')
    const result = await getSystemItemTypesWithCounts()

    expect(result).toEqual([])
  })

  it('defaults count to 0 when item type has no items', async () => {
    mockPrismaItemTypeFindMany.mockResolvedValue([
      { id: 'type-1', name: 'File', icon: '📄', color: '#ff0000' },
    ])
    mockPrismaItemGroupBy.mockResolvedValue([])

    const { getSystemItemTypesWithCounts } = await import('./items')
    const result = await getSystemItemTypesWithCounts()

    expect(result).toEqual([
      { name: 'File', icon: '📄', color: '#ff0000', itemCount: 0 },
    ])
  })
})

describe('getPinnedItems', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns pinned items', async () => {
    const mockItems = [
      {
        id: 'item-1',
        title: 'Pinned Item',
        description: 'A pinned item',
        contentType: 'code',
        content: 'const x = 1',
        url: null,
        language: 'typescript',
        isFavorite: false,
        isPinned: true,
        itemType: { name: 'File', icon: '📄', color: '#ff0000' },
        tags: [{ id: 'tag-1', name: 'test' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    mockPrismaItemFindMany.mockResolvedValue(mockItems)

    const { getPinnedItems } = await import('./items')
    const result = await getPinnedItems('user-1')

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('item-1')
    expect(result[0].title).toBe('Pinned Item')
  })

  it('returns empty array when no pinned items', async () => {
    mockPrismaItemFindMany.mockResolvedValue([])

    const { getPinnedItems } = await import('./items')
    const result = await getPinnedItems('user-1')

    expect(result).toEqual([])
  })
})

describe('getRecentItems', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns recent items', async () => {
    const mockItems = [
      {
        id: 'item-1',
        title: 'Recent Item',
        description: null,
        contentType: 'text',
        content: null,
        url: null,
        language: null,
        isFavorite: false,
        isPinned: false,
        itemType: null,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    mockPrismaItemFindMany.mockResolvedValue(mockItems)

    const { getRecentItems } = await import('./items')
    const result = await getRecentItems('user-1')

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('item-1')
  })

  it('uses default limit', async () => {
    mockPrismaItemFindMany.mockResolvedValue([])

    const { getRecentItems } = await import('./items')
    await getRecentItems('user-1')

    expect(mockPrismaItemFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 10 })
    )
  })

  it('uses custom limit', async () => {
    mockPrismaItemFindMany.mockResolvedValue([])

    const { getRecentItems } = await import('./items')
    await getRecentItems('user-1', 5)

    expect(mockPrismaItemFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 5 })
    )
  })
})

describe('getAllItems', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns all items', async () => {
    const mockItems = [
      {
        id: 'item-1',
        title: 'All Item',
        description: null,
        contentType: 'text',
        content: null,
        url: null,
        language: null,
        isFavorite: false,
        isPinned: false,
        itemType: null,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    mockPrismaItemFindMany.mockResolvedValue(mockItems)

    const { getAllItems } = await import('./items')
    const result = await getAllItems('user-1')

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('item-1')
  })

  it('applies limit when provided', async () => {
    mockPrismaItemFindMany.mockResolvedValue([])

    const { getAllItems } = await import('./items')
    await getAllItems('user-1', 5)

    expect(mockPrismaItemFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 5 })
    )
  })

  it('does not apply limit when not provided', async () => {
    mockPrismaItemFindMany.mockResolvedValue([])

    const { getAllItems } = await import('./items')
    await getAllItems('user-1')

    expect(mockPrismaItemFindMany).toHaveBeenCalledWith(
      expect.not.objectContaining({ take: expect.any(Number) })
    )
  })
})

describe('getFavoriteItems', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns favorite items', async () => {
    const mockItems = [
      {
        id: 'item-1',
        title: 'Favorite Item',
        description: null,
        contentType: 'text',
        content: null,
        url: null,
        language: null,
        isFavorite: true,
        isPinned: false,
        itemType: null,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    mockPrismaItemFindMany.mockResolvedValue(mockItems)

    const { getFavoriteItems } = await import('./items')
    const result = await getFavoriteItems('user-1')

    expect(result).toHaveLength(1)
    expect(result[0].isFavorite).toBe(true)
  })

  it('applies limit when provided', async () => {
    mockPrismaItemFindMany.mockResolvedValue([])

    const { getFavoriteItems } = await import('./items')
    await getFavoriteItems('user-1', 5)

    expect(mockPrismaItemFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 5 })
    )
  })
})

describe('getItemsByType', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns items by type', async () => {
    const mockItems = [
      {
        id: 'item-1',
        title: 'Type Item',
        description: null,
        contentType: 'text',
        content: null,
        url: null,
        language: null,
        isFavorite: false,
        isPinned: false,
        itemType: { name: 'File', icon: '📄', color: '#ff0000' },
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    mockPrismaItemFindMany.mockResolvedValue(mockItems)

    const { getItemsByType } = await import('./items')
    const result = await getItemsByType('user-1', 'File')

    expect(result).toHaveLength(1)
    expect(result[0].itemType?.name).toBe('File')
  })

  it('applies limit when provided', async () => {
    mockPrismaItemFindMany.mockResolvedValue([])

    const { getItemsByType } = await import('./items')
    await getItemsByType('user-1', 'File', 5)

    expect(mockPrismaItemFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 5 })
    )
  })
})

describe('searchItems', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('searches items by query', async () => {
    const mockItems = [
      {
        id: 'item-1',
        title: 'Search Result',
        description: null,
        contentType: 'text',
        content: null,
        url: null,
        language: null,
        isFavorite: false,
        isPinned: false,
        itemType: null,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    mockPrismaItemFindMany.mockResolvedValue(mockItems)

    const { searchItems } = await import('./items')
    const result = await searchItems('user-1', 'search')

    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Search Result')
  })

  it('returns empty array when no results', async () => {
    mockPrismaItemFindMany.mockResolvedValue([])

    const { searchItems } = await import('./items')
    const result = await searchItems('user-1', 'nonexistent')

    expect(result).toEqual([])
  })
})

describe('getItemsByTypeWithMeta', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns items and types with no error', async () => {
    const mockItems = [
      {
        id: 'item-1',
        title: 'Type Item',
        description: null,
        contentType: 'text',
        content: null,
        url: null,
        language: null,
        isFavorite: false,
        isPinned: false,
        itemType: null,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    const mockTypes = [
      { id: 'type-1', name: 'File', icon: '📄', color: '#ff0000' },
    ]
    mockPrismaItemFindMany.mockResolvedValue(mockItems)
    mockPrismaItemTypeFindMany.mockResolvedValue(mockTypes)
    mockPrismaItemGroupBy.mockResolvedValue([])

    const { getItemsByTypeWithMeta } = await import('./items')
    const result = await getItemsByTypeWithMeta('user-1', 'File')

    expect(result.items).toHaveLength(1)
    expect(result.types).toHaveLength(1)
    expect(result.hasError).toBe(false)
  })

  it('returns empty arrays when fetch fails', async () => {
    mockPrismaItemFindMany.mockRejectedValue(new Error('Database error'))
    mockPrismaItemTypeFindMany.mockRejectedValue(new Error('Database error'))
    mockPrismaItemGroupBy.mockRejectedValue(new Error('Database error'))

    const { getItemsByTypeWithMeta } = await import('./items')
    const result = await getItemsByTypeWithMeta('user-1', 'File')

    expect(result.items).toEqual([])
    expect(result.types).toEqual([])
    expect(result.hasError).toBe(false)
  })
})
