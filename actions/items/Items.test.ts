import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockAuth = vi.fn()
const mockCreateItem = vi.fn()
const mockUpdateItem = vi.fn()
const mockDeleteItem = vi.fn()
const mockUpdateItemFields = vi.fn()
const mockGetItemById = vi.fn()
const mockGetItemStats = vi.fn()
const mockRevalidatePath = vi.fn()
const mockPrismaItemFindUnique = vi.fn()
const mockPrismaItemUpdate = vi.fn()
const mockPrismaUserFindUnique = vi.fn()

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}))

vi.mock('@/lib/auth/auth/auth', () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}))

vi.mock('@/lib/prisma/prisma', () => ({
  prisma: {
    item: {
      findUnique: (...args: unknown[]) => mockPrismaItemFindUnique(...args),
      update: (...args: unknown[]) => mockPrismaItemUpdate(...args),
    },
    user: {
      findUnique: (...args: unknown[]) => mockPrismaUserFindUnique(...args),
    },
    collection: {
      count: vi.fn(),
    },
  },
}))

vi.mock('@/lib/db/items/items', () => ({
  createItem: (...args: unknown[]) => mockCreateItem(...args),
  updateItem: (...args: unknown[]) => mockUpdateItem(...args),
  deleteItem: (...args: unknown[]) => mockDeleteItem(...args),
  updateItemFields: (...args: unknown[]) => mockUpdateItemFields(...args),
  getItemById: (...args: unknown[]) => mockGetItemById(...args),
  getItemStats: (...args: unknown[]) => mockGetItemStats(...args),
}))

describe('updateItemAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns error when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const { updateItemAction } = await import('./Items')
    const result = await updateItemAction('item-1', { title: 'Title' })

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Unauthorized',
    })
  })

  it('returns error when session has no user id', async () => {
    mockAuth.mockResolvedValue({ user: {} })

    const { updateItemAction } = await import('./Items')
    const result = await updateItemAction('item-1', { title: 'Title' })

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Unauthorized',
    })
  })

  it('returns validation error for invalid data', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })

    const { updateItemAction } = await import('./Items')
    const result = await updateItemAction('item-1', { title: '' })

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Title is required',
    })
  })

  it('returns validation error for invalid url', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })

    const { updateItemAction } = await import('./Items')
    const result = await updateItemAction('item-1', {
      title: 'Title',
      url: 'not-a-url',
    })

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Must be a valid URL',
    })
  })

  it('returns success with updated item', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    const mockUpdatedItem = {
      id: 'item-1',
      title: 'Updated Title',
      description: null,
      contentType: 'text',
      content: null,
      url: null,
      language: null,
      isFavorite: false,
      isPinned: false,
      itemType: { name: 'snippet', icon: 'code', color: '#3b82f6' },
      tags: [],
      collections: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockUpdateItem.mockResolvedValue(mockUpdatedItem)

    const { updateItemAction } = await import('./Items')
    const result = await updateItemAction('item-1', { title: 'Updated Title' })

    expect(result).toEqual({
      success: true,
      data: mockUpdatedItem,
      error: null,
    })
    expect(mockUpdateItem).toHaveBeenCalledWith('item-1', 'user-1', {
      title: 'Updated Title',
    })
  })

  it('returns error when update fails', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockUpdateItem.mockRejectedValue(new Error('Database error'))

    const { updateItemAction } = await import('./Items')
    const result = await updateItemAction('item-1', { title: 'Title' })

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Database error',
    })
  })

  it('returns generic error for non-Error exceptions', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockUpdateItem.mockRejectedValue('Unknown error')

    const { updateItemAction } = await import('./Items')
    const result = await updateItemAction('item-1', { title: 'Title' })

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Failed to update item',
    })
  })

  it('calls revalidatePath after successful update', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockUpdateItem.mockResolvedValue({ id: 'item-1', title: 'Updated' })

    const { updateItemAction } = await import('./Items')
    await updateItemAction('item-1', { title: 'Updated' })

    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
  })

  it('does not call revalidatePath on update failure', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockUpdateItem.mockRejectedValue(new Error('DB error'))

    const { updateItemAction } = await import('./Items')
    await updateItemAction('item-1', { title: 'Title' })

    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  it('does not call revalidatePath when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const { updateItemAction } = await import('./Items')
    await updateItemAction('item-1', { title: 'Title' })

    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  it('passes collectionIds to updateItem', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    const mockUpdatedItem = {
      id: 'item-1',
      title: 'Updated Title',
      itemType: { name: 'snippet', icon: 'code', color: '#3b82f6' },
      tags: [],
      collections: [{ id: 'col-1', name: 'Collection 1' }],
    }
    mockUpdateItem.mockResolvedValue(mockUpdatedItem)

    const { updateItemAction } = await import('./Items')
    const result = await updateItemAction('item-1', {
      title: 'Updated Title',
      collectionIds: ['col-1'],
    })

    expect(result.success).toBe(true)
    expect(mockUpdateItem).toHaveBeenCalledWith('item-1', 'user-1', {
      title: 'Updated Title',
      collectionIds: ['col-1'],
    })
  })

  it('returns error when collectionIds validation fails', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockUpdateItem.mockRejectedValue(new Error('Unauthorized access to collection(s): invalid-col'))

    const { updateItemAction } = await import('./Items')
    const result = await updateItemAction('item-1', {
      title: 'Title',
      collectionIds: ['invalid-col'],
    })

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Unauthorized access to collection(s): invalid-col',
    })
  })
})

describe('deleteItemAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns error when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const { deleteItemAction } = await import('./Items')
    const result = await deleteItemAction('item-1')

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Unauthorized',
    })
  })

  it('returns error when session has no user id', async () => {
    mockAuth.mockResolvedValue({ user: {} })

    const { deleteItemAction } = await import('./Items')
    const result = await deleteItemAction('item-1')

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Unauthorized',
    })
  })

  it('returns success after successful deletion', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockDeleteItem.mockResolvedValue(true)

    const { deleteItemAction } = await import('./Items')
    const result = await deleteItemAction('item-1')

    expect(result).toEqual({
      success: true,
      data: null,
      error: null,
    })
    expect(mockDeleteItem).toHaveBeenCalledWith('item-1', 'user-1')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
  })

  it('returns error when delete throws', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockDeleteItem.mockRejectedValue(new Error('Database error'))

    const { deleteItemAction } = await import('./Items')
    const result = await deleteItemAction('item-1')

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Database error',
    })
  })

  it('returns generic error for non-Error exceptions', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockDeleteItem.mockRejectedValue('Unknown error')

    const { deleteItemAction } = await import('./Items')
    const result = await deleteItemAction('item-1')

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Failed to delete item',
    })
  })

  it('does not call revalidatePath when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const { deleteItemAction } = await import('./Items')
    await deleteItemAction('item-1')

    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  it('does not call revalidatePath on delete failure', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockDeleteItem.mockRejectedValue(new Error('DB error'))

    const { deleteItemAction } = await import('./Items')
    await deleteItemAction('item-1')

    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })
})

describe('createItemAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrismaUserFindUnique.mockResolvedValue({ isPro: true })
  })

  it('returns error when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const { createItemAction } = await import('./Items')
    const result = await createItemAction({
      title: 'Test',
      itemType: 'snippet',
      content: 'code',
    })

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Unauthorized',
    })
  })

  it('returns error when session has no user id', async () => {
    mockAuth.mockResolvedValue({ user: {} })

    const { createItemAction } = await import('./Items')
    const result = await createItemAction({
      title: 'Test',
      itemType: 'snippet',
      content: 'code',
    })

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Unauthorized',
    })
  })

  it('returns validation error for missing title', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })

    const { createItemAction } = await import('./Items')
    const result = await createItemAction({
      title: '',
      itemType: 'snippet',
      content: 'code',
    })

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Title is required',
    })
  })

  it('returns validation error for missing content on non-link type', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })

    const { createItemAction } = await import('./Items')
    const result = await createItemAction({
      title: 'Test',
      itemType: 'snippet',
    })

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Content is required',
    })
  })

  it('returns validation error for missing URL on link type', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })

    const { createItemAction } = await import('./Items')
    const result = await createItemAction({
      title: 'Test',
      itemType: 'link',
    })

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'URL is required for link type',
    })
  })

  it('returns validation error for invalid URL', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })

    const { createItemAction } = await import('./Items')
    const result = await createItemAction({
      title: 'Test',
      itemType: 'link',
      url: 'not-a-url',
    })

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Must be a valid URL',
    })
  })

  it('returns success with created item', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    const mockCreatedItem = {
      id: 'item-1',
      title: 'New Item',
      description: null,
      contentType: 'TEXT',
      content: 'code',
      url: null,
      language: null,
      isFavorite: false,
      isPinned: false,
      itemType: { name: 'snippet', icon: '📝', color: '#ff0000' },
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockCreateItem.mockResolvedValue(mockCreatedItem)

    const { createItemAction } = await import('./Items')
    const result = await createItemAction({
      title: 'New Item',
      itemType: 'snippet',
      content: 'code',
    })

    expect(result).toEqual({
      success: true,
      data: mockCreatedItem,
      error: null,
    })
    expect(mockCreateItem).toHaveBeenCalledWith('user-1', {
      title: 'New Item',
      itemType: 'snippet',
      content: 'code',
    })
  })

  it('returns error when create fails', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockCreateItem.mockRejectedValue(new Error('Database error'))

    const { createItemAction } = await import('./Items')
    const result = await createItemAction({
      title: 'Test',
      itemType: 'snippet',
      content: 'code',
    })

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Database error',
    })
  })

  it('returns generic error for non-Error exceptions', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockCreateItem.mockRejectedValue('Unknown error')

    const { createItemAction } = await import('./Items')
    const result = await createItemAction({
      title: 'Test',
      itemType: 'snippet',
      content: 'code',
    })

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Failed to create item',
    })
  })

  it('calls revalidatePath after successful creation', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockCreateItem.mockResolvedValue({ id: 'item-1', title: 'New' })

    const { createItemAction } = await import('./Items')
    await createItemAction({
      title: 'New',
      itemType: 'snippet',
      content: 'code',
    })

    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
  })

  it('does not call revalidatePath when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const { createItemAction } = await import('./Items')
    await createItemAction({
      title: 'Test',
      itemType: 'snippet',
      content: 'code',
    })

    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  it('does not call revalidatePath on create failure', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockCreateItem.mockRejectedValue(new Error('DB error'))

    const { createItemAction } = await import('./Items')
    await createItemAction({
      title: 'Test',
      itemType: 'snippet',
      content: 'code',
    })

    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  it('passes collectionIds to createItem', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    const mockCreatedItem = {
      id: 'item-1',
      title: 'Test with Collections',
      itemType: { name: 'snippet', icon: 'code', color: '#3b82f6' },
      tags: [],
      collections: [{ id: 'col-1', name: 'Collection 1' }],
    }
    mockCreateItem.mockResolvedValue(mockCreatedItem)

    const { createItemAction } = await import('./Items')
    const result = await createItemAction({
      title: 'Test with Collections',
      itemType: 'snippet',
      content: 'code',
      collectionIds: ['col-1'],
    })

    expect(result.success).toBe(true)
    expect(mockCreateItem).toHaveBeenCalledWith('user-1', {
      title: 'Test with Collections',
      itemType: 'snippet',
      content: 'code',
      collectionIds: ['col-1'],
    })
  })

  it('returns error when collectionIds validation fails during creation', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockCreateItem.mockRejectedValue(new Error('Unauthorized access to collection(s): invalid-col'))

    const { createItemAction } = await import('./Items')
    const result = await createItemAction({
      title: 'Test',
      itemType: 'snippet',
      content: 'code',
      collectionIds: ['invalid-col'],
    })

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Unauthorized access to collection(s): invalid-col',
    })
  })

  it('rejects free user creating file item with Pro-feature error', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaUserFindUnique.mockResolvedValue({ isPro: false })

    const { createItemAction } = await import('./Items')
    const result = await createItemAction({
      title: 'Test file',
      itemType: 'file',
      fileName: 'doc.pdf',
      fileUrl: 'https://example.com/doc.pdf',
    })

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'File and image items are a Pro feature.',
    })
    expect(mockCreateItem).not.toHaveBeenCalled()
  })

  it('rejects free user creating image item with Pro-feature error', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaUserFindUnique.mockResolvedValue({ isPro: false })

    const { createItemAction } = await import('./Items')
    const result = await createItemAction({
      title: 'Test image',
      itemType: 'image',
      fileName: 'pic.png',
      fileUrl: 'https://example.com/pic.png',
    })

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'File and image items are a Pro feature.',
    })
    expect(mockCreateItem).not.toHaveBeenCalled()
  })

  it('rejects free user at 50-item limit with upgrade error', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaUserFindUnique.mockResolvedValue({ isPro: false })
    mockGetItemStats.mockResolvedValue({
      totalItems: 50,
      totalCollections: 0,
      favoriteItems: 0,
      favoriteCollections: 0,
    })

    const { createItemAction } = await import('./Items')
    const result = await createItemAction({
      title: 'Test',
      itemType: 'snippet',
      content: 'code',
    })

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Free plan limited to 50 items. Upgrade to Pro for unlimited items.',
    })
    expect(mockCreateItem).not.toHaveBeenCalled()
  })

  it('allows free user below 50-item limit to create item', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaUserFindUnique.mockResolvedValue({ isPro: false })
    mockGetItemStats.mockResolvedValue({
      totalItems: 49,
      totalCollections: 0,
      favoriteItems: 0,
      favoriteCollections: 0,
    })
    mockCreateItem.mockResolvedValue({ id: 'item-1', title: 'Test' })

    const { createItemAction } = await import('./Items')
    const result = await createItemAction({
      title: 'Test',
      itemType: 'snippet',
      content: 'code',
    })

    expect(result.success).toBe(true)
    expect(mockCreateItem).toHaveBeenCalledWith('user-1', {
      title: 'Test',
      itemType: 'snippet',
      content: 'code',
    })
  })

  it('allows Pro user to create file item', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaUserFindUnique.mockResolvedValue({ isPro: true })
    mockCreateItem.mockResolvedValue({ id: 'item-1', title: 'File' })

    const { createItemAction } = await import('./Items')
    const result = await createItemAction({
      title: 'File',
      itemType: 'file',
      fileName: 'doc.pdf',
      fileUrl: 'https://example.com/doc.pdf',
    })

    expect(result.success).toBe(true)
    expect(mockGetItemStats).not.toHaveBeenCalled()
  })

  it('does not call getItemStats for Pro user', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaUserFindUnique.mockResolvedValue({ isPro: true })
    mockCreateItem.mockResolvedValue({ id: 'item-1', title: 'New' })

    const { createItemAction } = await import('./Items')
    await createItemAction({
      title: 'New',
      itemType: 'snippet',
      content: 'code',
    })

    expect(mockGetItemStats).not.toHaveBeenCalled()
  })

  it('checks Pro status from DB before enforcing limits', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaUserFindUnique.mockResolvedValue({ isPro: false })
    mockGetItemStats.mockResolvedValue({
      totalItems: 49,
      totalCollections: 0,
      favoriteItems: 0,
      favoriteCollections: 0,
    })
    mockCreateItem.mockResolvedValue({ id: 'item-1', title: 'Test' })

    const { createItemAction } = await import('./Items')
    await createItemAction({
      title: 'Test',
      itemType: 'snippet',
      content: 'code',
    })

    expect(mockPrismaUserFindUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: { isPro: true },
    })
  })
})

describe('toggleItemPinAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns error when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const { toggleItemPinAction } = await import('./Items')
    const result = await toggleItemPinAction('item-1')

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Unauthorized',
    })
  })

  it('returns error when session has no user id', async () => {
    mockAuth.mockResolvedValue({ user: {} })

    const { toggleItemPinAction } = await import('./Items')
    const result = await toggleItemPinAction('item-1')

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Unauthorized',
    })
  })

  it('returns error when item not found', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaItemFindUnique.mockResolvedValue(null)

    const { toggleItemPinAction } = await import('./Items')
    const result = await toggleItemPinAction('item-1')

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Item not found',
    })
  })

  it('toggles pin from false to true', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaItemFindUnique.mockResolvedValue({
      isPinned: false,
      itemType: { name: 'snippet' },
    })
    mockUpdateItemFields.mockResolvedValue({ id: 'item-1', isPinned: true })

    const { toggleItemPinAction } = await import('./Items')
    const result = await toggleItemPinAction('item-1')

    expect(result).toEqual({
      success: true,
      data: true,
      error: null,
    })
    expect(mockUpdateItemFields).toHaveBeenCalledWith('item-1', 'user-1', {
      isPinned: true,
    })
  })

  it('toggles pin from true to false', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaItemFindUnique.mockResolvedValue({
      isPinned: true,
      itemType: { name: 'snippet' },
    })
    mockUpdateItemFields.mockResolvedValue({ id: 'item-1', isPinned: false })

    const { toggleItemPinAction } = await import('./Items')
    const result = await toggleItemPinAction('item-1')

    expect(result).toEqual({
      success: true,
      data: false,
      error: null,
    })
    expect(mockUpdateItemFields).toHaveBeenCalledWith('item-1', 'user-1', {
      isPinned: false,
    })
  })

  it('calls revalidatePath after successful toggle', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaItemFindUnique.mockResolvedValue({
      isPinned: false,
      itemType: { name: 'snippet' },
    })
    mockUpdateItemFields.mockResolvedValue({ id: 'item-1', isPinned: true })

    const { toggleItemPinAction } = await import('./Items')
    await toggleItemPinAction('item-1')

    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/favorites')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/items/snippet')
  })

  it('returns error when toggle fails', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaItemFindUnique.mockResolvedValue({
      isPinned: false,
      itemType: { name: 'snippet' },
    })
    mockUpdateItemFields.mockRejectedValue(new Error('Database error'))

    const { toggleItemPinAction } = await import('./Items')
    const result = await toggleItemPinAction('item-1')

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Database error',
    })
  })

  it('returns generic error for non-Error exceptions', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaItemFindUnique.mockResolvedValue({
      isPinned: false,
      itemType: { name: 'snippet' },
    })
    mockUpdateItemFields.mockRejectedValue('Unknown error')

    const { toggleItemPinAction } = await import('./Items')
    const result = await toggleItemPinAction('item-1')

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Failed to toggle pin',
    })
  })

  it('does not call revalidatePath when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const { toggleItemPinAction } = await import('./Items')
    await toggleItemPinAction('item-1')

    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  it('does not call revalidatePath when item not found', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaItemFindUnique.mockResolvedValue(null)

    const { toggleItemPinAction } = await import('./Items')
    await toggleItemPinAction('item-1')

    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  it('does not call revalidatePath on toggle failure', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaItemFindUnique.mockResolvedValue({
      isPinned: false,
      itemType: { name: 'snippet' },
    })
    mockUpdateItemFields.mockRejectedValue(new Error('DB error'))

    const { toggleItemPinAction } = await import('./Items')
    await toggleItemPinAction('item-1')

    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })
})

describe('toggleItemFavoriteAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns error when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const { toggleItemFavoriteAction } = await import('./Items')
    const result = await toggleItemFavoriteAction('item-1')

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Unauthorized',
    })
  })

  it('returns error when session has no user id', async () => {
    mockAuth.mockResolvedValue({ user: {} })

    const { toggleItemFavoriteAction } = await import('./Items')
    const result = await toggleItemFavoriteAction('item-1')

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Unauthorized',
    })
  })

  it('returns error when item not found', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaItemFindUnique.mockResolvedValue(null)

    const { toggleItemFavoriteAction } = await import('./Items')
    const result = await toggleItemFavoriteAction('item-1')

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Item not found',
    })
  })

  it('toggles favorite from false to true', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaItemFindUnique.mockResolvedValue({
      isFavorite: false,
      itemType: { name: 'snippet' },
    })
    mockUpdateItemFields.mockResolvedValue({ id: 'item-1', isFavorite: true })

    const { toggleItemFavoriteAction } = await import('./Items')
    const result = await toggleItemFavoriteAction('item-1')

    expect(result).toEqual({
      success: true,
      data: true,
      error: null,
    })
    expect(mockUpdateItemFields).toHaveBeenCalledWith('item-1', 'user-1', {
      isFavorite: true,
    })
  })

  it('toggles favorite from true to false', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaItemFindUnique.mockResolvedValue({
      isFavorite: true,
      itemType: { name: 'snippet' },
    })
    mockUpdateItemFields.mockResolvedValue({ id: 'item-1', isFavorite: false })

    const { toggleItemFavoriteAction } = await import('./Items')
    const result = await toggleItemFavoriteAction('item-1')

    expect(result).toEqual({
      success: true,
      data: false,
      error: null,
    })
    expect(mockUpdateItemFields).toHaveBeenCalledWith('item-1', 'user-1', {
      isFavorite: false,
    })
  })

  it('calls revalidatePath after successful toggle', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaItemFindUnique.mockResolvedValue({
      isFavorite: false,
      itemType: { name: 'snippet' },
    })
    mockUpdateItemFields.mockResolvedValue({ id: 'item-1', isFavorite: true })

    const { toggleItemFavoriteAction } = await import('./Items')
    await toggleItemFavoriteAction('item-1')

    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/favorites')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/items/snippet')
  })

  it('returns error when toggle fails', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaItemFindUnique.mockResolvedValue({
      isFavorite: false,
      itemType: { name: 'snippet' },
    })
    mockUpdateItemFields.mockRejectedValue(new Error('Database error'))

    const { toggleItemFavoriteAction } = await import('./Items')
    const result = await toggleItemFavoriteAction('item-1')

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Database error',
    })
  })

  it('returns generic error for non-Error exceptions', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaItemFindUnique.mockResolvedValue({
      isFavorite: false,
      itemType: { name: 'snippet' },
    })
    mockUpdateItemFields.mockRejectedValue('Unknown error')

    const { toggleItemFavoriteAction } = await import('./Items')
    const result = await toggleItemFavoriteAction('item-1')

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Failed to toggle favorite',
    })
  })

  it('does not call revalidatePath when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const { toggleItemFavoriteAction } = await import('./Items')
    await toggleItemFavoriteAction('item-1')

    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  it('does not call revalidatePath when item not found', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaItemFindUnique.mockResolvedValue(null)

    const { toggleItemFavoriteAction } = await import('./Items')
    await toggleItemFavoriteAction('item-1')

    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  it('does not call revalidatePath on toggle failure', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaItemFindUnique.mockResolvedValue({
      isFavorite: false,
      itemType: { name: 'snippet' },
    })
    mockUpdateItemFields.mockRejectedValue(new Error('DB error'))

    const { toggleItemFavoriteAction } = await import('./Items')
    await toggleItemFavoriteAction('item-1')

    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })
})

describe('getItemAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns error when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const { getItemAction } = await import('./Items')
    const result = await getItemAction('item-1')

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Unauthorized',
    })
  })

  it('returns error when session has no user id', async () => {
    mockAuth.mockResolvedValue({ user: {} })

    const { getItemAction } = await import('./Items')
    const result = await getItemAction('item-1')

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Unauthorized',
    })
  })

  it('returns success with item when found', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    const mockItem = {
      id: 'item-1',
      title: 'Test Item',
      description: 'A test item',
      contentType: 'TEXT',
      content: 'code',
      url: null,
      fileUrl: null,
      fileName: null,
      fileSize: null,
      language: 'typescript',
      isFavorite: false,
      isPinned: false,
      itemType: { name: 'snippet', icon: '📝', color: '#ff0000' },
      tags: [{ id: 'tag-1', name: 'test' }],
      collections: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockGetItemById.mockResolvedValue(mockItem)

    const { getItemAction } = await import('./Items')
    const result = await getItemAction('item-1')

    expect(result).toEqual({
      success: true,
      data: mockItem,
      error: null,
    })
    expect(mockGetItemById).toHaveBeenCalledWith('item-1', 'user-1')
  })

  it('returns error when item not found', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockGetItemById.mockResolvedValue(null)

    const { getItemAction } = await import('./Items')
    const result = await getItemAction('nonexistent')

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Item not found',
    })
  })

  it('returns error when getItemById throws', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockGetItemById.mockRejectedValue(new Error('Database error'))

    const { getItemAction } = await import('./Items')
    const result = await getItemAction('item-1')

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Database error',
    })
  })

  it('returns generic error for non-Error exceptions', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockGetItemById.mockRejectedValue('Unknown error')

    const { getItemAction } = await import('./Items')
    const result = await getItemAction('item-1')

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Failed to fetch item',
    })
  })

  it('does not call revalidatePath', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockGetItemById.mockResolvedValue({ id: 'item-1', title: 'Item' })

    const { getItemAction } = await import('./Items')
    await getItemAction('item-1')

    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })
})

describe('applyOptimizedPromptAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns error when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const { applyOptimizedPromptAction } = await import('./Items')
    const result = await applyOptimizedPromptAction({
      itemId: 'item-1',
      content: 'optimized prompt',
    })

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Unauthorized',
    })
  })

  it('returns validation error when content is empty', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })

    const { applyOptimizedPromptAction } = await import('./Items')
    const result = await applyOptimizedPromptAction({
      itemId: 'item-1',
      content: '',
    })

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Content is required',
    })
  })

  it('returns validation error when itemId is empty', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })

    const { applyOptimizedPromptAction } = await import('./Items')
    const result = await applyOptimizedPromptAction({
      itemId: '',
      content: 'optimized prompt',
    })

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Item ID is required',
    })
  })

  it('returns error when item not found', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaItemFindUnique.mockResolvedValue(null)

    const { applyOptimizedPromptAction } = await import('./Items')
    const result = await applyOptimizedPromptAction({
      itemId: 'item-1',
      content: 'optimized prompt',
    })

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Item not found',
    })
    expect(mockUpdateItemFields).not.toHaveBeenCalled()
  })

  it('applies optimized prompt and marks optimized flag', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaItemFindUnique.mockResolvedValue({
      id: 'item-1',
      itemType: { name: 'prompt' },
    })
    mockUpdateItemFields.mockResolvedValue(undefined)

    const { applyOptimizedPromptAction } = await import('./Items')
    const result = await applyOptimizedPromptAction({
      itemId: 'item-1',
      content: 'optimized prompt',
    })

    expect(result).toEqual({ success: true, data: null, error: null })
    expect(mockUpdateItemFields).toHaveBeenCalledWith(
      'item-1',
      'user-1',
      expect.objectContaining({
        content: 'optimized prompt',
        optimized: true,
      }),
    )
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/items/prompt')
  })

  it('returns error when updateItemFields throws', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaItemFindUnique.mockResolvedValue({
      id: 'item-1',
      itemType: { name: 'prompt' },
    })
    mockUpdateItemFields.mockRejectedValue(new Error('Database error'))

    const { applyOptimizedPromptAction } = await import('./Items')
    const result = await applyOptimizedPromptAction({
      itemId: 'item-1',
      content: 'optimized prompt',
    })

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Database error',
    })
  })

  it('returns generic error for non-Error exceptions', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaItemFindUnique.mockResolvedValue({
      id: 'item-1',
      itemType: { name: 'prompt' },
    })
    mockUpdateItemFields.mockRejectedValue('Unknown error')

    const { applyOptimizedPromptAction } = await import('./Items')
    const result = await applyOptimizedPromptAction({
      itemId: 'item-1',
      content: 'optimized prompt',
    })

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Failed to apply optimized prompt',
    })
  })
})
