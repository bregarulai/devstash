import { describe, it, expect, vi, beforeEach } from 'vitest'
import crypto from 'crypto'
import { createVerificationToken, verifyToken } from './verificationToken'

const mockVerificationTokenCreate = vi.fn()
const mockVerificationTokenFindFirst = vi.fn()
const mockVerificationTokenDelete = vi.fn()

vi.mock('@/lib/prisma/prisma', () => ({
  prisma: {
    verificationToken: {
      create: (...args: unknown[]) => mockVerificationTokenCreate(...args),
      findFirst: (...args: unknown[]) => mockVerificationTokenFindFirst(...args),
      delete: (...args: unknown[]) => mockVerificationTokenDelete(...args),
    },
  },
}))

const mockPrisma = {
  verificationToken: {
    create: mockVerificationTokenCreate,
    findFirst: mockVerificationTokenFindFirst,
    delete: mockVerificationTokenDelete,
  },
}

describe('createVerificationToken', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('generates a 32-byte hex token', async () => {
    mockPrisma.verificationToken.create.mockResolvedValue({} as never)

    const token = await createVerificationToken('test@example.com')

    expect(token).toMatch(/^[a-f0-9]{64}$/)
  })

  it('returns token in plain text', async () => {
    mockPrisma.verificationToken.create.mockResolvedValue({} as never)

    const token = await createVerificationToken('test@example.com')

    expect(typeof token).toBe('string')
    expect(token.length).toBe(64)
  })

  it('stores hashed token in database', async () => {
    mockPrisma.verificationToken.create.mockResolvedValue({} as never)

    const token = await createVerificationToken('test@example.com')
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    expect(mockPrisma.verificationToken.create).toHaveBeenCalledWith({
      data: {
        identifier: 'test@example.com',
        token: hashedToken,
        expires: expect.any(Date),
      },
    })
  })

  it('creates token with 24h expiry', async () => {
    mockPrisma.verificationToken.create.mockResolvedValue({} as never)
    const before = Date.now()

    await createVerificationToken('test@example.com')

    const call = mockPrisma.verificationToken.create.mock.calls[0][0]
    const expires = call.data.expires as Date
    const after = Date.now() + 24 * 60 * 60 * 1000

    expect(expires.getTime()).toBeGreaterThanOrEqual(before + 24 * 60 * 60 * 1000 - 1000)
    expect(expires.getTime()).toBeLessThanOrEqual(after + 1000)
  })

  it('creates token for given email', async () => {
    mockPrisma.verificationToken.create.mockResolvedValue({} as never)

    await createVerificationToken('user@example.com')

    expect(mockPrisma.verificationToken.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        identifier: 'user@example.com',
      }),
    })
  })
})

describe('verifyToken', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns identifier for valid unexpired token', async () => {
    const token = 'a'.repeat(64)
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    mockPrisma.verificationToken.findFirst.mockResolvedValue({
      identifier: 'test@example.com',
      token: hashedToken,
      expires: new Date(Date.now() + 3600000),
    } as never)
    mockPrisma.verificationToken.delete.mockResolvedValue({} as never)

    const result = await verifyToken(token)

    expect(result).toBe('test@example.com')
  })

  it('returns null for invalid token', async () => {
    mockPrisma.verificationToken.findFirst.mockResolvedValue(null)

    const result = await verifyToken('invalid-token')

    expect(result).toBeNull()
  })

  it('returns null and deletes expired token', async () => {
    const token = 'b'.repeat(64)
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    mockPrisma.verificationToken.findFirst.mockResolvedValue({
      identifier: 'test@example.com',
      token: hashedToken,
      expires: new Date(Date.now() - 3600000),
    } as never)
    mockPrisma.verificationToken.delete.mockResolvedValue({} as never)

    const result = await verifyToken(token)

    expect(result).toBeNull()
    expect(mockPrisma.verificationToken.delete).toHaveBeenCalled()
  })

  it('deletes token after successful verification', async () => {
    const token = 'c'.repeat(64)
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    mockPrisma.verificationToken.findFirst.mockResolvedValue({
      identifier: 'test@example.com',
      token: hashedToken,
      expires: new Date(Date.now() + 3600000),
    } as never)
    mockPrisma.verificationToken.delete.mockResolvedValue({} as never)

    await verifyToken(token)

    expect(mockPrisma.verificationToken.delete).toHaveBeenCalledWith({
      where: {
        identifier_token: {
          identifier: 'test@example.com',
          token: hashedToken,
        },
      },
    })
  })

  it('does not delete token on invalid token', async () => {
    mockPrisma.verificationToken.findFirst.mockResolvedValue(null)

    await verifyToken('invalid-token')

    expect(mockPrisma.verificationToken.delete).not.toHaveBeenCalled()
  })

  it('hashes token before lookup', async () => {
    const token = 'd'.repeat(64)
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    mockPrisma.verificationToken.findFirst.mockResolvedValue(null)

    await verifyToken(token)

    expect(mockPrisma.verificationToken.findFirst).toHaveBeenCalledWith({
      where: {
        token: hashedToken,
      },
    })
  })
})
