export type ShelfKind = 'books' | 'movies' | 'youtube'

export const SHELF_KINDS = ['books', 'movies', 'youtube'] as const

export type ShelfItem = {
  id: string
  title: string
  subtitle: string
  url?: string
  createdAt: string
}

export type NewShelfItem =
  | { kind: 'books'; title: string; author: string }
  | { kind: 'movies'; title: string; director: string }
  | { kind: 'youtube'; title: string; url: string }

export const KIND_LABELS: Record<ShelfKind, string> = {
  books: 'Books',
  movies: 'Movies',
  youtube: 'YouTube',
}

export const KIND_NOUNS: Record<ShelfKind, { singular: string; plural: string }> = {
  books: { singular: 'book', plural: 'books' },
  movies: { singular: 'film', plural: 'films' },
  youtube: { singular: 'tutorial', plural: 'tutorials' },
}

export const KIND_FIELD_LABELS: Record<ShelfKind, string> = {
  books: 'Author',
  movies: 'Director / producer',
  youtube: 'YouTube link',
}

export const KIND_EMPTY_MESSAGES: Record<ShelfKind, string> = {
  books: 'No books on the shelf yet.',
  movies: 'No films on the shelf yet.',
  youtube: 'No tutorials on the shelf yet.',
}
