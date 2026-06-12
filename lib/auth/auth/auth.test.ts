import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCompare = vi.fn()
const mockFindUnique = vi.fn()

vi.mock('@/lib/prisma/prisma', () => ({
  prisma: { user: { findUnique: (...args: unknown[]) => mockFindUnique(...args) } },
}))

vi.mock('./authConfig', () => ({
  authConfig: { providers: [] },
}))

let capturedAuthorize: ((credentials: Record<string, unknown> | undefined) => Promise<Record<string, string | null> | null>) | undefined

vi.mock('next-auth', () => ({
  default: () => ({
    handlers: {},
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}))

vi.mock('next-auth/providers/credentials', () => ({
  default: (opts: { authorize: (credentials: Record<string, unknown> | undefined) => Promise<Record<string, string | null> | null> }) => {
    capturedAuthorize = opts.authorize
    return {}
  },
}))

vi.mock('bcryptjs', () => ({
  default: { compare: (...args: unknown[]) => mockCompare(...args) },
}))

const { isCredentialsInput } = await import('./auth')

describe('isCredentialsInput', () => {
  it('returns true for valid CredentialsInput objects', () => {
    expect(isCredentialsInput({ email: 'test@example.com', password: 'password123' })).toBe(true)
  })

  it('returns false for non-objects', () => {
    expect(isCredentialsInput(null)).toBe(false)
    expect(isCredentialsInput(undefined)).toBe(false)
    expect(isCredentialsInput('string')).toBe(false)
    expect(isCredentialsInput(123)).toBe(false)
    expect(isCredentialsInput(true)).toBe(false)
  })

  it('returns false when missing email', () => {
    expect(isCredentialsInput({ password: 'password123' })).toBe(false)
  })

  it('returns false when missing password', () => {
    expect(isCredentialsInput({ email: 'test@example.com' })).toBe(false)
  })

  it('returns false when both missing', () => {
    expect(isCredentialsInput({})).toBe(false)
  })

  it('returns false for wrong types', () => {
    expect(isCredentialsInput({ email: 123, password: 'password' })).toBe(false)
    expect(isCredentialsInput({ email: 'test@example.com', password: 123 })).toBe(false)
    expect(isCredentialsInput({ email: null, password: 'password' })).toBe(false)
    expect(isCredentialsInput({ email: 'test@example.com', password: null })).toBe(false)
  })

  it('returns true with extra properties', () => {
    expect(
      isCredentialsInput({
        email: 'test@example.com',
        password: 'password123',
        extra: 'data',
      })
    ).toBe(true)
  })
})

describe('authorize', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null for undefined credentials', async () => {
    const result = await capturedAuthorize!(undefined)
    expect(result).toBeNull()
  })

  it('returns null for non-object credentials', async () => {
    const result = await capturedAuthorize!("string" as unknown as Record<string, unknown>)
    expect(result).toBeNull()
  })

  it('returns null when user not found', async () => {
    mockFindUnique.mockResolvedValue(null)

    const result = await capturedAuthorize!({ email: 'test@example.com', password: 'password123' })

    expect(result).toBeNull()
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } })
  })

  it('returns null when user has no password', async () => {
    mockFindUnique.mockResolvedValue({ id: '1', email: 'test@example.com', password: null })

    const result = await capturedAuthorize!({ email: 'test@example.com', password: 'password123' })

    expect(result).toBeNull()
  })

  it('returns null when password is invalid', async () => {
    mockFindUnique.mockResolvedValue({
      id: '1',
      name: 'John',
      email: 'test@example.com',
      password: 'hashed',
      image: null,
    })
    mockCompare.mockResolvedValue(false)

    const result = await capturedAuthorize!({ email: 'test@example.com', password: 'wrong' })

    expect(result).toBeNull()
    expect(mockCompare).toHaveBeenCalledWith('wrong', 'hashed')
  })

  it('returns user object when credentials are valid', async () => {
    mockFindUnique.mockResolvedValue({
      id: '1',
      name: 'John',
      email: 'test@example.com',
      password: 'hashed',
      image: 'https://example.com/avatar.png',
    })
    mockCompare.mockResolvedValue(true)

    const result = await capturedAuthorize!({ email: 'test@example.com', password: 'correct' })

    expect(result).toEqual({
      id: '1',
      name: 'John',
      email: 'test@example.com',
      image: 'https://example.com/avatar.png',
    })
  })

  it('returns null for empty string email', async () => {
    const result = await capturedAuthorize!({ email: '', password: 'password123' })
    expect(result).toBeNull()
  })

  it('returns null for empty string password', async () => {
    const result = await capturedAuthorize!({ email: 'test@example.com', password: '' })
    expect(result).toBeNull()
  })
})
