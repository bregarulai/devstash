import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockAuth = vi.fn()
const mockGetAllItems = vi.fn()
const mockGetAllCollections = vi.fn()

vi.mock('@/lib/auth/auth/auth', () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}))

vi.mock('@/lib/db/items/items', () => ({
  getAllItems: (...args: unknown[]) => mockGetAllItems(...args),
}))

vi.mock('@/lib/db/collections/collections', () => ({
  getAllCollections: (...args: unknown[]) => mockGetAllCollections(...args),
}))

describe('getSearchData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty arrays when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const { getSearchData } = await import('./search')
    const result = await getSearchData()

    expect(result).toEqual({ items: [], collections: [] })
  })

  it('returns empty arrays when session has no user id', async () => {
    mockAuth.mockResolvedValue({ user: {} })

    const { getSearchData } = await import('./search')
    const result = await getSearchData()

    expect(result).toEqual({ items: [], collections: [] })
  })

  it('returns items and collections when authenticated', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockGetAllItems.mockResolvedValue([{ id: 'item-1', title: 'Test Item' }])
    mockGetAllCollections.mockResolvedValue([{ id: 'col-1', name: 'Test Collection' }])

    const { getSearchData } = await import('./search')
    const result = await getSearchData()

    expect(result).toEqual({
      items: [{ id: 'item-1', title: 'Test Item' }],
      collections: [{ id: 'col-1', name: 'Test Collection' }],
    })
    expect(mockGetAllItems).toHaveBeenCalledWith('user-1')
    expect(mockGetAllCollections).toHaveBeenCalledWith('user-1')
  })

  it('returns empty items array when getAllItems fails', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockGetAllItems.mockRejectedValue(new Error('DB error'))
    mockGetAllCollections.mockResolvedValue([{ id: 'col-1', name: 'Test Collection' }])

    const { getSearchData } = await import('./search')
    const result = await getSearchData()

    expect(result).toEqual({
      items: [],
      collections: [{ id: 'col-1', name: 'Test Collection' }],
    })
  })

  it('returns empty collections array when getAllCollections fails', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockGetAllItems.mockResolvedValue([{ id: 'item-1', title: 'Test Item' }])
    mockGetAllCollections.mockRejectedValue(new Error('DB error'))

    const { getSearchData } = await import('./search')
    const result = await getSearchData()

    expect(result).toEqual({
      items: [{ id: 'item-1', title: 'Test Item' }],
      collections: [],
    })
  })

  it('returns empty arrays when both queries fail', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockGetAllItems.mockRejectedValue(new Error('DB error'))
    mockGetAllCollections.mockRejectedValue(new Error('DB error'))

    const { getSearchData } = await import('./search')
    const result = await getSearchData()

    expect(result).toEqual({ items: [], collections: [] })
  })
})