import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockAuth = vi.fn()
const mockPrismaUserUpdate = vi.fn()
const mockPrismaUserFindUnique = vi.fn()
const mockRevalidatePath = vi.fn()

vi.mock('@/lib/auth/auth/auth', () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}))

vi.mock('@/lib/prisma/prisma', () => ({
  prisma: {
    user: {
      update: (...args: unknown[]) => mockPrismaUserUpdate(...args),
      findUnique: (...args: unknown[]) => mockPrismaUserFindUnique(...args),
    },
  },
}))

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}))

describe('updateEditorPreferencesAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaUserUpdate.mockResolvedValue({})
  })

  it('returns unauthorized when no session', async () => {
    mockAuth.mockResolvedValue(null)

    const { updateEditorPreferencesAction } = await import('./EditorPreferences')
    const result = await updateEditorPreferencesAction({
      fontSize: 14,
      tabSize: 4,
      wordWrap: true,
      minimap: false,
      theme: 'vs-dark',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Unauthorized')
  })

  it('returns unauthorized when no user id', async () => {
    mockAuth.mockResolvedValue({ user: {} })

    const { updateEditorPreferencesAction } = await import('./EditorPreferences')
    const result = await updateEditorPreferencesAction({
      fontSize: 14,
      tabSize: 4,
      wordWrap: true,
      minimap: false,
      theme: 'vs-dark',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Unauthorized')
  })

  it('returns error on invalid data', async () => {
    const { updateEditorPreferencesAction } = await import('./EditorPreferences')
    const result = await updateEditorPreferencesAction({
      fontSize: 5,
      tabSize: 4,
      wordWrap: true,
      minimap: false,
      theme: 'vs-dark',
    })

    expect(result.success).toBe(false)
    expect(result.data).toBeNull()
    expect(mockPrismaUserUpdate).not.toHaveBeenCalled()
  })

  it('saves valid preferences to database', async () => {
    const { updateEditorPreferencesAction } = await import('./EditorPreferences')
    const prefs = {
      fontSize: 16,
      tabSize: 4,
      wordWrap: false,
      minimap: true,
      theme: 'monokai' as const,
    }

    const result = await updateEditorPreferencesAction(prefs)

    expect(result.success).toBe(true)
    expect(result.data).toEqual(prefs)
    expect(mockPrismaUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { editorPreferences: prefs },
    })
  })

  it('revalidates settings path after save', async () => {
    const { updateEditorPreferencesAction } = await import('./EditorPreferences')
    await updateEditorPreferencesAction({
      fontSize: 14,
      tabSize: 2,
      wordWrap: true,
      minimap: false,
      theme: 'vs-dark',
    })

    expect(mockRevalidatePath).toHaveBeenCalledWith('/settings')
  })

  it('returns error when database update fails', async () => {
    mockPrismaUserUpdate.mockRejectedValue(new Error('DB connection failed'))

    const { updateEditorPreferencesAction } = await import('./EditorPreferences')
    const result = await updateEditorPreferencesAction({
      fontSize: 14,
      tabSize: 2,
      wordWrap: true,
      minimap: false,
      theme: 'vs-dark',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('DB connection failed')
  })

  it('returns generic error for non-Error exceptions', async () => {
    mockPrismaUserUpdate.mockRejectedValue('unknown error')

    const { updateEditorPreferencesAction } = await import('./EditorPreferences')
    const result = await updateEditorPreferencesAction({
      fontSize: 14,
      tabSize: 2,
      wordWrap: true,
      minimap: false,
      theme: 'vs-dark',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Failed to update editor preferences')
  })
})

describe('getEditorPreferencesAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
  })

  it('returns unauthorized when no session', async () => {
    mockAuth.mockResolvedValue(null)

    const { getEditorPreferencesAction } = await import('./EditorPreferences')
    const result = await getEditorPreferencesAction()

    expect(result.success).toBe(false)
    expect(result.error).toBe('Unauthorized')
  })

  it('returns defaults when user has no preferences', async () => {
    mockPrismaUserFindUnique.mockResolvedValue({ editorPreferences: null })

    const { getEditorPreferencesAction } = await import('./EditorPreferences')
    const result = await getEditorPreferencesAction()

    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      fontSize: 13,
      tabSize: 2,
      wordWrap: true,
      minimap: false,
      theme: 'vs-dark',
    })
  })

  it('returns defaults when user not found', async () => {
    mockPrismaUserFindUnique.mockResolvedValue(null)

    const { getEditorPreferencesAction } = await import('./EditorPreferences')
    const result = await getEditorPreferencesAction()

    expect(result.success).toBe(false)
    expect(result.error).toBe('User not found')
  })

  it('returns saved preferences', async () => {
    const savedPrefs = {
      fontSize: 16,
      tabSize: 4,
      wordWrap: false,
      minimap: true,
      theme: 'monokai',
    }
    mockPrismaUserFindUnique.mockResolvedValue({ editorPreferences: savedPrefs })

    const { getEditorPreferencesAction } = await import('./EditorPreferences')
    const result = await getEditorPreferencesAction()

    expect(result.success).toBe(true)
    expect(result.data).toEqual(savedPrefs)
  })

  it('returns defaults when stored preferences are invalid', async () => {
    mockPrismaUserFindUnique.mockResolvedValue({
      editorPreferences: { fontSize: 999, invalid: true },
    })

    const { getEditorPreferencesAction } = await import('./EditorPreferences')
    const result = await getEditorPreferencesAction()

    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      fontSize: 13,
      tabSize: 2,
      wordWrap: true,
      minimap: false,
      theme: 'vs-dark',
    })
  })

  it('returns error when database query fails', async () => {
    mockPrismaUserFindUnique.mockRejectedValue(new Error('DB timeout'))

    const { getEditorPreferencesAction } = await import('./EditorPreferences')
    const result = await getEditorPreferencesAction()

    expect(result.success).toBe(false)
    expect(result.error).toBe('DB timeout')
  })

  it('returns generic error for non-Error exceptions', async () => {
    mockPrismaUserFindUnique.mockRejectedValue('unknown')

    const { getEditorPreferencesAction } = await import('./EditorPreferences')
    const result = await getEditorPreferencesAction()

    expect(result.success).toBe(false)
    expect(result.error).toBe('Failed to get editor preferences')
  })
})
