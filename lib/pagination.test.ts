import { describe, it, expect } from 'vitest'
import { getPageUrl, getPageNumbers } from './pagination'

describe('getPageUrl', () => {
  it('appends page query to base URL', () => {
    expect(getPageUrl('/items/snippet', 1)).toBe('/items/snippet?page=1')
  })

  it('works with page number 2', () => {
    expect(getPageUrl('/collections/col-1', 2)).toBe('/collections/col-1?page=2')
  })

  it('handles high page numbers', () => {
    expect(getPageUrl('/items/note', 999)).toBe('/items/note?page=999')
  })

  it('preserves query string in base URL', () => {
    expect(getPageUrl('/items/snippet?foo=bar', 3)).toBe(
      '/items/snippet?foo=bar?page=3'
    )
  })
})

describe('getPageNumbers', () => {
  it('returns all pages when totalPages <= 7', () => {
    expect(getPageNumbers(1, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('returns all pages for exactly 7 total pages', () => {
    expect(getPageNumbers(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('shows ellipsis when totalPages > 7 and currentPage <= 3', () => {
    const result = getPageNumbers(1, 10)
    expect(result).toEqual([1, 2, 3, 4, 'ellipsis', 10])
  })

  it('shows ellipsis when currentPage is 2', () => {
    const result = getPageNumbers(2, 10)
    expect(result).toEqual([1, 2, 3, 4, 'ellipsis', 10])
  })

  it('shows ellipsis when currentPage is 3', () => {
    const result = getPageNumbers(3, 10)
    expect(result).toEqual([1, 2, 3, 4, 'ellipsis', 10])
  })

  it('shows ellipsis on both sides when currentPage is in middle', () => {
    const result = getPageNumbers(5, 10)
    expect(result).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 10])
  })

  it('shows ellipsis when currentPage >= totalPages - 2', () => {
    const result = getPageNumbers(8, 10)
    expect(result).toEqual([1, 'ellipsis', 7, 8, 9, 10])
  })

  it('shows ellipsis when currentPage is at totalPages - 1', () => {
    const result = getPageNumbers(9, 10)
    expect(result).toEqual([1, 'ellipsis', 7, 8, 9, 10])
  })

  it('shows ellipsis when currentPage is at totalPages', () => {
    const result = getPageNumbers(10, 10)
    expect(result).toEqual([1, 'ellipsis', 7, 8, 9, 10])
  })

  it('handles large total pages with middle current page', () => {
    const result = getPageNumbers(20, 50)
    expect(result).toEqual([1, 'ellipsis', 19, 20, 21, 'ellipsis', 50])
  })

  it('handles totalPages = 8 with currentPage = 1', () => {
    const result = getPageNumbers(1, 8)
    expect(result).toEqual([1, 2, 3, 4, 'ellipsis', 8])
  })

  it('handles totalPages = 8 with currentPage = 8', () => {
    const result = getPageNumbers(8, 8)
    expect(result).toEqual([1, 'ellipsis', 5, 6, 7, 8])
  })
})
