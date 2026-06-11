import { describe, expect, it } from 'vitest'
import { formatDaysAgo, getInitials } from '@/lib/utils'

describe('formatDaysAgo', () => {
  it('returns "Today" for the current date', () => {
    const today = new Date()
    expect(formatDaysAgo(today)).toBe('Today')
  })

  it('returns "Yesterday" for yesterday', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(formatDaysAgo(yesterday)).toBe('Yesterday')
  })

  it('returns "N days ago" for dates within 30 days', () => {
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    expect(formatDaysAgo(threeDaysAgo)).toBe('3 days ago')

    const twentyNineDaysAgo = new Date()
    twentyNineDaysAgo.setDate(twentyNineDaysAgo.getDate() - 29)
    expect(formatDaysAgo(twentyNineDaysAgo)).toBe('29 days ago')
  })

  it('returns "N months ago" for dates older than 30 days', () => {
    const twoMonthsAgo = new Date()
    twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60)
    expect(formatDaysAgo(twoMonthsAgo)).toBe('2 months ago')

    const oneMonthAgo = new Date()
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 31)
    expect(formatDaysAgo(oneMonthAgo)).toBe('1 month ago')
  })

  it('returns "Invalid date" for invalid input', () => {
    expect(formatDaysAgo('invalid')).toBe('Invalid date')
  })
})

describe('getInitials', () => {
  it('returns first two letters of name when name has two or more words', () => {
    expect(getInitials('John Doe', 'john@example.com')).toBe('JD')
    expect(getInitials('Jane Marie Smith', 'jane@example.com')).toBe('JS')
  })

  it('returns first two letters when name has only one word', () => {
    expect(getInitials('John', 'john@example.com')).toBe('JO')
  })

  it('falls back to email when name is null', () => {
    expect(getInitials(null, 'alice@example.com')).toBe('AL')
  })

  it('handles whitespace in name', () => {
    expect(getInitials('  John Doe  ', 'john@example.com')).toBe('JD')
  })
})
