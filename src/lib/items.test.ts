import { describe, expect, it } from 'vitest'
import type { ShelfItem } from '../types'
import { filterShelfItems } from './items'

const items: ShelfItem[] = [
  {
    id: '1',
    title: 'The Left Hand of Darkness',
    subtitle: 'Ursula K. Le Guin',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Dune',
    subtitle: 'Frank Herbert',
    createdAt: '2026-01-02T00:00:00Z',
  },
  {
    id: '3',
    title: 'A Tutorial',
    subtitle: 'https://youtube.com/watch?v=abc',
    url: 'https://youtube.com/watch?v=abc',
    createdAt: '2026-01-03T00:00:00Z',
  },
]

describe('filterShelfItems', () => {
  it('returns all items for an empty query', () => {
    expect(filterShelfItems(items, '')).toHaveLength(3)
    expect(filterShelfItems(items, '   ')).toHaveLength(3)
  })

  it('matches titles and subtitles case-insensitively', () => {
    expect(filterShelfItems(items, 'dune').map((item) => item.id)).toEqual(['2'])
    expect(filterShelfItems(items, 'le guin').map((item) => item.id)).toEqual([
      '1',
    ])
  })

  it('matches URLs for linked items', () => {
    expect(filterShelfItems(items, 'youtube.com').map((item) => item.id)).toEqual([
      '3',
    ])
  })

  it('returns no matches when nothing fits', () => {
    expect(filterShelfItems(items, 'zzz')).toEqual([])
  })
})
