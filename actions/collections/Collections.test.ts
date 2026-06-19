import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockAuth = vi.fn()
const mockCreateCollection = vi.fn()
const mockGetUserCollectionList = vi.fn()
const mockRevalidatePath = vi.fn()

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}))

vi.mock('@/lib/auth/auth/auth', () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}))

vi.mock('@/lib/db/collections/collections', () => ({
  createCollection: (...args: unknown[]) => mockCreateCollection(...args),
  getUserCollectionList: (...args: unknown[]) => mockGetUserCollectionList(...args),
}))

describe('createCollectionAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns error when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const { createCollectionAction } = await import('./Collections')
    const result = await createCollectionAction({ name: 'Test' })

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Unauthorized',
    })
  })

  it('returns error when session has no user id', async () => {
    mockAuth.mockResolvedValue({ user: {} })

    const { createCollectionAction } = await import('./Collections')
    const result = await createCollectionAction({ name: 'Test' })

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Unauthorized',
    })
  })

  it('returns validation error for empty name', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })

    const { createCollectionAction } = await import('./Collections')
    const result = await createCollectionAction({ name: '' })

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Name is required',
    })
  })

  it('returns validation error for name exceeding 255 characters', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })

    const { createCollectionAction } = await import('./Collections')
    const result = await createCollectionAction({ name: 'a'.repeat(256) })

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Too big: expected string to have <=255 characters',
    })
  })

  it('returns success with created collection', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
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
    mockCreateCollection.mockResolvedValue(mockCreated)

    const { createCollectionAction } = await import('./Collections')
    const result = await createCollectionAction({ name: 'New Collection' })

    expect(result).toEqual({
      success: true,
      data: mockCreated,
      error: null,
    })
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
  })

  it('passes description to createCollection', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    const mockCreated = {
      id: 'col-new',
      name: 'New Collection',
      description: 'A description',
      isFavorite: false,
      userId: 'user-1',
      defaultTypeId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockCreateCollection.mockResolvedValue(mockCreated)

    const { createCollectionAction } = await import('./Collections')
    const result = await createCollectionAction({
      name: 'New Collection',
      description: 'A description',
    })

    expect(result.success).toBe(true)
    expect(mockCreateCollection).toHaveBeenCalledWith('user-1', {
      name: 'New Collection',
      description: 'A description',
    })
  })

  it('returns error when createCollection throws', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockCreateCollection.mockRejectedValue(new Error('DB failure'))

    const { createCollectionAction } = await import('./Collections')
    const result = await createCollectionAction({ name: 'Test' })

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'DB failure',
    })
  })

  it('returns generic error for non-Error thrown values', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockCreateCollection.mockRejectedValue('unknown error')

    const { createCollectionAction } = await import('./Collections')
    const result = await createCollectionAction({ name: 'Test' })

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Failed to create collection',
    })
  })
})

describe('getCollectionsForPickerAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns error when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const { getCollectionsForPickerAction } = await import('./Collections')
    const result = await getCollectionsForPickerAction()

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Unauthorized',
    })
  })

  it('returns error when session has no user id', async () => {
    mockAuth.mockResolvedValue({ user: {} })

    const { getCollectionsForPickerAction } = await import('./Collections')
    const result = await getCollectionsForPickerAction()

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Unauthorized',
    })
  })

  it('returns collections list on success', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockGetUserCollectionList.mockResolvedValue([
      { id: 'col-1', name: 'Collection A' },
      { id: 'col-2', name: 'Collection B' },
    ])

    const { getCollectionsForPickerAction } = await import('./Collections')
    const result = await getCollectionsForPickerAction()

    expect(result).toEqual({
      success: true,
      data: [
        { id: 'col-1', name: 'Collection A' },
        { id: 'col-2', name: 'Collection B' },
      ],
      error: null,
    })
    expect(mockGetUserCollectionList).toHaveBeenCalledWith('user-1')
  })

  it('returns empty array when no collections', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockGetUserCollectionList.mockResolvedValue([])

    const { getCollectionsForPickerAction } = await import('./Collections')
    const result = await getCollectionsForPickerAction()

    expect(result).toEqual({
      success: true,
      data: [],
      error: null,
    })
  })

  it('returns error when getUserCollectionList throws', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockGetUserCollectionList.mockRejectedValue(new Error('DB error'))

    const { getCollectionsForPickerAction } = await import('./Collections')
    const result = await getCollectionsForPickerAction()

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'DB error',
    })
  })

  it('returns generic error for non-Error thrown values', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockGetUserCollectionList.mockRejectedValue('unknown error')

    const { getCollectionsForPickerAction } = await import('./Collections')
    const result = await getCollectionsForPickerAction()

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Failed to fetch collections',
    })
  })
})
