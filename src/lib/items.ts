import type { Database } from './database.types'
import { requireSupabase } from './supabase'
import type { NewShelfItem, ShelfItem, ShelfKind } from '../types'

type BookRow = Pick<
  Database['public']['Tables']['books']['Row'],
  'id' | 'title' | 'author' | 'created_at'
>
type MovieRow = Pick<
  Database['public']['Tables']['movies']['Row'],
  'id' | 'title' | 'director' | 'created_at'
>
type YouTubeRow = Pick<
  Database['public']['Tables']['youtube_videos']['Row'],
  'id' | 'title' | 'url' | 'created_at'
>

function toBook(row: BookRow): ShelfItem {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.author,
    createdAt: row.created_at,
  }
}

function toMovie(row: MovieRow): ShelfItem {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.director,
    createdAt: row.created_at,
  }
}

function toYouTube(row: YouTubeRow): ShelfItem {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.url,
    url: row.url,
    createdAt: row.created_at,
  }
}

export async function fetchShelfItems(kind: ShelfKind): Promise<ShelfItem[]> {
  const client = requireSupabase()

  if (kind === 'books') {
    const { data, error } = await client
      .from('books')
      .select('id, title, author, created_at')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []).map(toBook)
  }

  if (kind === 'movies') {
    const { data, error } = await client
      .from('movies')
      .select('id, title, director, created_at')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []).map(toMovie)
  }

  const { data, error } = await client
    .from('youtube_videos')
    .select('id, title, url, created_at')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(toYouTube)
}

export async function addShelfItem(item: NewShelfItem): Promise<void> {
  const client = requireSupabase()

  if (item.kind === 'books') {
    const { error } = await client
      .from('books')
      .insert({ title: item.title, author: item.author })

    if (error) throw new Error(error.message)
    return
  }

  if (item.kind === 'movies') {
    const { error } = await client
      .from('movies')
      .insert({ title: item.title, director: item.director })

    if (error) throw new Error(error.message)
    return
  }

  const { error } = await client
    .from('youtube_videos')
    .insert({ title: item.title, url: item.url })

  if (error) throw new Error(error.message)
}

export function filterShelfItems(
  items: readonly ShelfItem[],
  query: string,
): ShelfItem[] {
  const term = query.trim().toLocaleLowerCase()
  if (!term) return [...items]

  return items.filter((item) =>
    [item.title, item.subtitle, item.url].some((value) =>
      value?.toLocaleLowerCase().includes(term),
    ),
  )
}
