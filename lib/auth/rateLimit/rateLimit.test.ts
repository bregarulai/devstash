import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getClientIP,
  formatRetryAfter,
  createRateLimiter,
  checkRateLimit,
  RATE_LIMIT_CONFIGS,
} from './rateLimit'

describe('getClientIP', () => {
  it('extracts IP from x-forwarded-for header', () => {
    const headers = new Headers()
    headers.set('x-forwarded-for', '192.168.1.1')
    expect(getClientIP(headers)).toBe('192.168.1.1')
  })

  it('extracts first IP when multiple IPs in x-forwarded-for', () => {
    const headers = new Headers()
    headers.set('x-forwarded-for', '192.168.1.1, 10.0.0.1, 172.16.0.1')
    expect(getClientIP(headers)).toBe('192.168.1.1')
  })

  it('trims whitespace from IP', () => {
    const headers = new Headers()
    headers.set('x-forwarded-for', '  192.168.1.1  ')
    expect(getClientIP(headers)).toBe('192.168.1.1')
  })

  it('falls back to x-real-ip header', () => {
    const headers = new Headers()
    headers.set('x-real-ip', '10.0.0.1')
    expect(getClientIP(headers)).toBe('10.0.0.1')
  })

  it('returns unknown when no headers present', () => {
    const headers = new Headers()
    expect(getClientIP(headers)).toBe('unknown')
  })

  it('returns unknown when headers is null', () => {
    expect(getClientIP(null)).toBe('unknown')
  })

  it('prefers x-forwarded-for over x-real-ip', () => {
    const headers = new Headers()
    headers.set('x-forwarded-for', '192.168.1.1')
    headers.set('x-real-ip', '10.0.0.1')
    expect(getClientIP(headers)).toBe('192.168.1.1')
  })
})

describe('formatRetryAfter', () => {
  it('returns "0" for zero or negative values', () => {
    expect(formatRetryAfter(0)).toBe('0')
    expect(formatRetryAfter(-5)).toBe('0')
  })

  it('formats 1 minute', () => {
    expect(formatRetryAfter(60)).toBe('1 minute')
  })

  it('formats minutes', () => {
    expect(formatRetryAfter(300)).toBe('5 minutes')
  })

  it('formats 1 hour', () => {
    expect(formatRetryAfter(3600)).toBe('1 hour')
  })

  it('formats hours', () => {
    expect(formatRetryAfter(7200)).toBe('2 hours')
  })

  it('rounds up partial minutes', () => {
    expect(formatRetryAfter(90)).toBe('2 minutes')
  })

  it('rounds up partial hours', () => {
    expect(formatRetryAfter(3700)).toBe('2 hours')
  })
})

describe('RATE_LIMIT_CONFIGS', () => {
  it('contains signIn config', () => {
    expect(RATE_LIMIT_CONFIGS.signIn).toBeDefined()
    expect(RATE_LIMIT_CONFIGS.signIn.limit).toBe(5)
    expect(RATE_LIMIT_CONFIGS.signIn.duration).toBe(15 * 60)
  })

  it('contains register config', () => {
    expect(RATE_LIMIT_CONFIGS.register).toBeDefined()
    expect(RATE_LIMIT_CONFIGS.register.limit).toBe(3)
    expect(RATE_LIMIT_CONFIGS.register.duration).toBe(60 * 60)
  })

  it('contains forgotPassword config', () => {
    expect(RATE_LIMIT_CONFIGS.forgotPassword).toBeDefined()
  })

  it('contains resetPassword config', () => {
    expect(RATE_LIMIT_CONFIGS.resetPassword).toBeDefined()
  })

  it('contains resendVerification config', () => {
    expect(RATE_LIMIT_CONFIGS.resendVerification).toBeDefined()
  })

  it('contains emailVerify config', () => {
    expect(RATE_LIMIT_CONFIGS.emailVerify).toBeDefined()
  })

  it('contains githubOAuth config', () => {
    expect(RATE_LIMIT_CONFIGS.githubOAuth).toBeDefined()
  })

  it('contains deleteAccount config', () => {
    expect(RATE_LIMIT_CONFIGS.deleteAccount).toBeDefined()
  })

  it('all configs have limit and duration', () => {
    for (const config of Object.values(RATE_LIMIT_CONFIGS)) {
      expect(typeof config.limit).toBe('number')
      expect(typeof config.duration).toBe('number')
      expect(config.limit).toBeGreaterThan(0)
      expect(config.duration).toBeGreaterThan(0)
    }
  })
})

describe('createRateLimiter', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('returns null-like limiter when env vars missing', () => {
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN

    const limiter = createRateLimiter({ limit: 5, duration: 60 })
    expect(limiter).toBeDefined()
    expect(limiter.limit).toBeDefined()
  })

  it('returns limiter that always succeeds when env vars missing', async () => {
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN

    const limiter = createRateLimiter({ limit: 5, duration: 60 })
    const result = await limiter.limit('test-key')
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(5)
  })
})

describe('checkRateLimit', () => {
  it('returns success when under limit', async () => {
    const mockLimiter = {
      limit: vi.fn().mockResolvedValue({
        success: true,
        remaining: 4,
        limit: 5,
        reset: Date.now() + 60000,
      }),
    }

    const result = await checkRateLimit(mockLimiter, 'test-key', {
      limit: 5,
      duration: 60,
    })

    expect(result.success).toBe(true)
    expect(result.remaining).toBe(4)
    expect(result.retryAfter).toBeUndefined()
  })

  it('returns failure with retryAfter when over limit', async () => {
    const resetTime = Date.now() + 30000
    const mockLimiter = {
      limit: vi.fn().mockResolvedValue({
        success: false,
        remaining: 0,
        limit: 5,
        reset: resetTime,
      }),
    }

    const result = await checkRateLimit(mockLimiter, 'test-key', {
      limit: 5,
      duration: 60,
    })

    expect(result.success).toBe(false)
    expect(result.retryAfter).toBeDefined()
    expect(result.retryAfter).toBeGreaterThan(0)
  })

  it('returns success when Upstash fails (fail-open)', async () => {
    const mockLimiter = {
      limit: vi.fn().mockRejectedValue(new Error('Connection refused')),
    }

    const result = await checkRateLimit(mockLimiter, 'test-key', {
      limit: 5,
      duration: 60,
    })

    expect(result.success).toBe(true)
    expect(result.remaining).toBe(5)
  })
})
