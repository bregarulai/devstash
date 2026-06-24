import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockAuth = vi.fn()
const mockStripeCustomersCreate = vi.fn()
const mockStripeCheckoutCreate = vi.fn()
const mockStripePortalCreate = vi.fn()
const mockPrismaUserFindUniqueOrThrow = vi.fn()
const mockPrismaUserFindUnique = vi.fn()
const mockPrismaUserUpdate = vi.fn()

vi.mock('@/lib/auth/auth/auth', () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}))

vi.mock('@/lib/prisma/prisma', () => ({
  prisma: {
    user: {
      findUniqueOrThrow: (...args: unknown[]) =>
        mockPrismaUserFindUniqueOrThrow(...args),
      findUnique: (...args: unknown[]) => mockPrismaUserFindUnique(...args),
      update: (...args: unknown[]) => mockPrismaUserUpdate(...args),
    },
  },
}))

vi.mock('@/lib/stripe/stripe', () => ({
  stripe: {
    customers: {
      create: (...args: unknown[]) => mockStripeCustomersCreate(...args),
    },
    checkout: {
      sessions: {
        create: (...args: unknown[]) => mockStripeCheckoutCreate(...args),
      },
    },
    billingPortal: {
      sessions: {
        create: (...args: unknown[]) => mockStripePortalCreate(...args),
      },
    },
  },
  STRIPE_PRICE_IDS: {
    monthly: 'price_monthly_id',
    yearly: 'price_yearly_id',
  },
}))

describe('createCheckoutAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('APP_URL', 'http://localhost:3000')
  })

  it('returns Unauthorized when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const { createCheckoutAction } = await import('./stripe')
    const result = await createCheckoutAction('monthly')

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Unauthorized',
    })
    expect(mockPrismaUserFindUniqueOrThrow).not.toHaveBeenCalled()
  })

  it('returns Unauthorized when session has no user id', async () => {
    mockAuth.mockResolvedValue({ user: {} })

    const { createCheckoutAction } = await import('./stripe')
    const result = await createCheckoutAction('monthly')

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Unauthorized',
    })
  })

  it('returns Invalid interval for unknown interval', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })

    const { createCheckoutAction } = await import('./stripe')
    const result = await createCheckoutAction('weekly' as 'monthly')

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Invalid interval',
    })
    expect(mockPrismaUserFindUniqueOrThrow).not.toHaveBeenCalled()
  })

  it('creates a Stripe customer when user has none, then returns checkout url', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user-1', email: 'demo@example.com' },
    })
    mockPrismaUserFindUniqueOrThrow.mockResolvedValue({ stripeCustomerId: null })
    mockStripeCustomersCreate.mockResolvedValue({ id: 'cus_new' })
    mockPrismaUserUpdate.mockResolvedValue({})
    mockStripeCheckoutCreate.mockResolvedValue({
      url: 'https://checkout.stripe.com/session_123',
    })

    const { createCheckoutAction } = await import('./stripe')
    const result = await createCheckoutAction('yearly')

    expect(result).toEqual({
      success: true,
      data: { url: 'https://checkout.stripe.com/session_123' },
      error: null,
    })
    expect(mockStripeCustomersCreate).toHaveBeenCalledWith({
      email: 'demo@example.com',
      metadata: { userId: 'user-1' },
    })
    expect(mockPrismaUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { stripeCustomerId: 'cus_new' },
    })
    expect(mockStripeCheckoutCreate).toHaveBeenCalledWith({
      customer: 'cus_new',
      mode: 'subscription',
      line_items: [{ price: 'price_yearly_id', quantity: 1 }],
      success_url: 'http://localhost:3000/settings?checkout=success',
      cancel_url: 'http://localhost:3000/settings?checkout=cancelled',
      client_reference_id: 'user-1',
      subscription_data: { metadata: { userId: 'user-1' } },
    })
  })

  it('reuses existing stripeCustomerId and does not create a new customer', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user-1', email: 'demo@example.com' },
    })
    mockPrismaUserFindUniqueOrThrow.mockResolvedValue({
      stripeCustomerId: 'cus_existing',
    })
    mockStripeCheckoutCreate.mockResolvedValue({
      url: 'https://checkout.stripe.com/session_abc',
    })

    const { createCheckoutAction } = await import('./stripe')
    const result = await createCheckoutAction('monthly')

    expect(result.success).toBe(true)
    expect(mockStripeCustomersCreate).not.toHaveBeenCalled()
    expect(mockPrismaUserUpdate).not.toHaveBeenCalled()
    expect(mockStripeCheckoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: 'cus_existing',
        line_items: [{ price: 'price_monthly_id', quantity: 1 }],
      }),
    )
  })

  it('returns Checkout failed when Stripe returns no url', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaUserFindUniqueOrThrow.mockResolvedValue({
      stripeCustomerId: 'cus_existing',
    })
    mockStripeCheckoutCreate.mockResolvedValue({ url: null })

    const { createCheckoutAction } = await import('./stripe')
    const result = await createCheckoutAction('monthly')

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Checkout failed',
    })
  })

  it('returns error message on Stripe failure', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaUserFindUniqueOrThrow.mockResolvedValue({
      stripeCustomerId: 'cus_existing',
    })
    mockStripeCheckoutCreate.mockRejectedValue(new Error('Stripe is down'))

    const { createCheckoutAction } = await import('./stripe')
    const result = await createCheckoutAction('monthly')

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Stripe is down',
    })
  })

  it('returns generic error for non-Error exceptions', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaUserFindUniqueOrThrow.mockResolvedValue({
      stripeCustomerId: 'cus_existing',
    })
    mockStripeCheckoutCreate.mockRejectedValue('boom')

    const { createCheckoutAction } = await import('./stripe')
    const result = await createCheckoutAction('monthly')

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Checkout failed',
    })
  })
})

describe('createCheckoutAction — returnTo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('APP_URL', 'http://localhost:3000')
    mockAuth.mockResolvedValue({
      user: { id: 'user-1', email: 'demo@example.com' },
    })
    mockPrismaUserFindUniqueOrThrow.mockResolvedValue({
      stripeCustomerId: 'cus_existing',
    })
    mockStripeCheckoutCreate.mockResolvedValue({
      url: 'https://checkout.stripe.com/session_rt',
    })
  })

  it('appends checkout=success with & when returnTo has a query string', async () => {
    const { createCheckoutAction } = await import('./stripe')
    await createCheckoutAction('monthly', '/items/file?page=2')

    expect(mockStripeCheckoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url:
          'http://localhost:3000/items/file?page=2&checkout=success',
      }),
    )
  })

  it('appends checkout=success with ? when returnTo has no query string', async () => {
    const { createCheckoutAction } = await import('./stripe')
    await createCheckoutAction('yearly', '/dashboard')

    expect(mockStripeCheckoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url: 'http://localhost:3000/dashboard?checkout=success',
      }),
    )
  })

  it('falls back to /settings?checkout=success when returnTo is omitted', async () => {
    const { createCheckoutAction } = await import('./stripe')
    await createCheckoutAction('monthly')

    expect(mockStripeCheckoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url: 'http://localhost:3000/settings?checkout=success',
      }),
    )
  })

  it('falls back to /settings?checkout=success when returnTo is an empty string', async () => {
    const { createCheckoutAction } = await import('./stripe')
    await createCheckoutAction('monthly', '')

    expect(mockStripeCheckoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url: 'http://localhost:3000/settings?checkout=success',
      }),
    )
  })

  it('rejects a protocol-relative open-redirect attempt', async () => {
    const { createCheckoutAction } = await import('./stripe')
    await createCheckoutAction('monthly', '//evil.com/phish')

    expect(mockStripeCheckoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url: 'http://localhost:3000/settings?checkout=success',
      }),
    )
  })

  it('rejects an absolute https URL', async () => {
    const { createCheckoutAction } = await import('./stripe')
    await createCheckoutAction('monthly', 'https://evil.com/phish')

    expect(mockStripeCheckoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url: 'http://localhost:3000/settings?checkout=success',
      }),
    )
  })

  it('rejects a backslash-prefixed value', async () => {
    const { createCheckoutAction } = await import('./stripe')
    await createCheckoutAction('monthly', '\\\\evil.com')

    expect(mockStripeCheckoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url: 'http://localhost:3000/settings?checkout=success',
      }),
    )
  })

  it('rejects a value containing whitespace', async () => {
    const { createCheckoutAction } = await import('./stripe')
    await createCheckoutAction('monthly', '/foo bar')

    expect(mockStripeCheckoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url: 'http://localhost:3000/settings?checkout=success',
      }),
    )
  })
})

describe('createPortalAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('APP_URL', 'http://localhost:3000')
  })

  it('returns Unauthorized when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const { createPortalAction } = await import('./stripe')
    const result = await createPortalAction()

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Unauthorized',
    })
    expect(mockPrismaUserFindUnique).not.toHaveBeenCalled()
  })

  it('returns Unauthorized when session has no user id', async () => {
    mockAuth.mockResolvedValue({ user: {} })

    const { createPortalAction } = await import('./stripe')
    const result = await createPortalAction()

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Unauthorized',
    })
  })

  it('returns No subscription found when user has no stripeCustomerId', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaUserFindUnique.mockResolvedValue({ stripeCustomerId: null })

    const { createPortalAction } = await import('./stripe')
    const result = await createPortalAction()

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'No subscription found',
    })
    expect(mockStripePortalCreate).not.toHaveBeenCalled()
  })

  it('returns No subscription found when user does not exist', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaUserFindUnique.mockResolvedValue(null)

    const { createPortalAction } = await import('./stripe')
    const result = await createPortalAction()

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'No subscription found',
    })
  })

  it('returns success with portal url', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaUserFindUnique.mockResolvedValue({ stripeCustomerId: 'cus_1' })
    mockStripePortalCreate.mockResolvedValue({
      url: 'https://billing.stripe.com/portal_123',
    })

    const { createPortalAction } = await import('./stripe')
    const result = await createPortalAction()

    expect(result).toEqual({
      success: true,
      data: { url: 'https://billing.stripe.com/portal_123' },
      error: null,
    })
    expect(mockStripePortalCreate).toHaveBeenCalledWith({
      customer: 'cus_1',
      return_url: 'http://localhost:3000/settings',
    })
  })

  it('returns error message on Stripe failure', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaUserFindUnique.mockResolvedValue({ stripeCustomerId: 'cus_1' })
    mockStripePortalCreate.mockRejectedValue(new Error('Stripe portal down'))

    const { createPortalAction } = await import('./stripe')
    const result = await createPortalAction()

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Stripe portal down',
    })
  })

  it('returns generic error for non-Error exceptions', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrismaUserFindUnique.mockResolvedValue({ stripeCustomerId: 'cus_1' })
    mockStripePortalCreate.mockRejectedValue('boom')

    const { createPortalAction } = await import('./stripe')
    const result = await createPortalAction()

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Portal failed',
    })
  })
})
