import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockAuth = vi.fn()
const mockUpdateItemFields = vi.fn()
const mockRevalidatePath = vi.fn()

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}))

vi.mock('@/lib/auth/auth/auth', () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}))

vi.mock('@/lib/db/items/items', () => ({
  updateItemFields: (...args: unknown[]) => mockUpdateItemFields(...args),
}))

vi.mock('@/lib/prisma/prisma', () => ({
  prisma: {},
}))

function createMockRequest(body: unknown) {
  return {
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Request
}

function createMockParams(id: string) {
  return { params: Promise.resolve({ id }) }
}

describe('PATCH /api/items/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const { PATCH } = await import('./route')
    const request = createMockRequest({ isFavorite: true })
    const response = await PATCH(request, createMockParams('item-1'))
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  it('returns 401 when session has no user id', async () => {
    mockAuth.mockResolvedValue({ user: {} })

    const { PATCH } = await import('./route')
    const request = createMockRequest({ isFavorite: true })
    const response = await PATCH(request, createMockParams('item-1'))
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid request body', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })

    const { PATCH } = await import('./route')
    const request = createMockRequest({ isFavorite: 'not-a-boolean' })
    const response = await PATCH(request, createMockParams('item-1'))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid request body')
    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  it('returns 500 when item not found', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockUpdateItemFields.mockRejectedValue(new Error('Record to update not found'))

    const { PATCH } = await import('./route')
    const request = createMockRequest({ isFavorite: true })
    const response = await PATCH(request, createMockParams('item-1'))
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to update item')
    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  it('calls revalidatePath after successful update', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockUpdateItemFields.mockResolvedValue(undefined)

    const { PATCH } = await import('./route')
    const request = createMockRequest({ isFavorite: true })
    const response = await PATCH(request, createMockParams('item-1'))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
  })

  it('returns 500 on database error', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockUpdateItemFields.mockRejectedValue(new Error('Database error'))

    const { PATCH } = await import('./route')
    const request = createMockRequest({ isFavorite: true })
    const response = await PATCH(request, createMockParams('item-1'))
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to update item')
    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })
})
