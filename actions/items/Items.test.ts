import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockAuth = vi.fn()
const mockCreateItem = vi.fn()
const mockUpdateItem = vi.fn()
const mockDeleteItem = vi.fn()
const mockRevalidatePath = vi.fn()

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}))

vi.mock('@/lib/auth/auth/auth', () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}))

vi.mock('@/lib/db/items/items', () => ({
  createItem: (...args: unknown[]) => mockCreateItem(...args),
  updateItem: (...args: unknown[]) => mockUpdateItem(...args),
  deleteItem: (...args: unknown[]) => mockDeleteItem(...args),
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
})
