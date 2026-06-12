import { describe, it, expect } from 'vitest'
import {
  DEFAULT_RECENT_LIMIT,
  DEFAULT_FAVORITE_LIMIT,
  DEFAULT_SAMPLE_COUNT,
  DEFAULT_RECENT_COLLECTIONS_LIMIT,
} from '@/lib/constants'

describe('constants', () => {
  it('DEFAULT_RECENT_LIMIT is 10', () => {
    expect(DEFAULT_RECENT_LIMIT).toBe(10)
  })

  it('DEFAULT_FAVORITE_LIMIT is 10', () => {
    expect(DEFAULT_FAVORITE_LIMIT).toBe(10)
  })

  it('DEFAULT_SAMPLE_COUNT is 5', () => {
    expect(DEFAULT_SAMPLE_COUNT).toBe(5)
  })

  it('DEFAULT_RECENT_COLLECTIONS_LIMIT is 5', () => {
    expect(DEFAULT_RECENT_COLLECTIONS_LIMIT).toBe(5)
  })
})
