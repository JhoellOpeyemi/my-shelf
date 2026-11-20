import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { addShelfItem } from './lib/items'
import type { ShelfKind } from './types'

type MockSession = { user: { email: string } }

const authState = vi.hoisted(() => ({
  session: null as MockSession | null,
  listener: null as ((session: MockSession | null) => void) | null,
}))

vi.mock('./lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {},
  requireSupabase: () => ({}),
}))

vi.mock('./lib/auth', () => ({
  getSession: vi.fn(async () => authState.session),
  onAuthStateChange: vi.fn(
    (callback: (session: MockSession | null) => void) => {
      authState.listener = callback
      return { data: { subscription: { unsubscribe: vi.fn() } } }
    },
  ),
  signInWithPassword: vi.fn(async () => {
    authState.session = { user: { email: 'admin@example.com' } }
    authState.listener?.(authState.session)
  }),
  signOut: vi.fn(async () => {
    authState.session = null
    authState.listener?.(null)
  }),
}))

vi.mock('./lib/items', async () => {
  const actual = await vi.importActual<typeof import('./lib/items')>(
    './lib/items',
  )

  return {
    ...actual,
    fetchShelfItems: vi.fn(async (kind: ShelfKind) => {
      if (kind === 'books') {
        return [
          {
            id: 'book-1',
            title: 'The Left Hand of Darkness',
            subtitle: 'Ursula K. Le Guin',
            createdAt: '2026-01-01T00:00:00Z',
          },
          {
            id: 'book-2',
            title: 'Dune',
            subtitle: 'Frank Herbert',
            createdAt: '2026-01-02T00:00:00Z',
          },
        ]
      }

      if (kind === 'movies') {
        return [
          {
            id: 'movie-1',
            title: 'Cleo from 5 to 7',
            subtitle: 'Agnès Varda',
            createdAt: '2026-01-03T00:00:00Z',
          },
        ]
      }

      return [
        {
          id: 'video-1',
          title: 'A Tutorial',
          subtitle: 'https://youtube.com/watch?v=abc',
          url: 'https://youtube.com/watch?v=abc',
          createdAt: '2026-01-04T00:00:00Z',
        },
      ]
    }),
    addShelfItem: vi.fn(async () => undefined),
  }
})

beforeEach(() => {
  authState.session = null
  authState.listener = null
  window.history.pushState({}, '', '/')
})

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('shelf', () => {
  it('renders books and filters them with search', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(
      await screen.findByText('The Left Hand of Darkness'),
    ).toBeInTheDocument()
    expect(screen.getByText('Dune')).toBeInTheDocument()

    await user.type(screen.getByRole('searchbox'), 'le guin')

    expect(screen.getByText('The Left Hand of Darkness')).toBeInTheDocument()
    expect(screen.queryByText('Dune')).not.toBeInTheDocument()
  })

  it('switches tabs and clears the search query', async () => {
    const user = userEvent.setup()
    render(<App />)

    await screen.findByText('The Left Hand of Darkness')
    await user.type(screen.getByRole('searchbox'), 'left')
    await user.click(screen.getByRole('tab', { name: 'Movies' }))

    expect(await screen.findByText('Cleo from 5 to 7')).toBeInTheDocument()
    expect(screen.getByRole('searchbox')).toHaveValue('')
  })
})

describe('admin auth', () => {
  it('redirects signed-out visitors to the login page', async () => {
    window.history.pushState({}, '', '/admin')
    render(<App />)

    expect(
      await screen.findByRole('heading', { name: 'Sign in' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Admin' }),
    ).not.toBeInTheDocument()
  })

  it('signs in and signs out', async () => {
    window.history.pushState({}, '', '/admin')
    const user = userEvent.setup()
    render(<App />)

    await screen.findByRole('heading', { name: 'Sign in' })
    await user.type(screen.getByLabelText('Email'), 'admin@example.com')
    await user.type(screen.getByLabelText('Password'), 'correct horse')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(
      await screen.findByRole('heading', { name: 'Admin' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Sign out' }))

    expect(
      await screen.findByRole('heading', { name: 'Sign in' }),
    ).toBeInTheDocument()
  })

  it('adds a book from the authenticated admin route', async () => {
    authState.session = { user: { email: 'admin@example.com' } }
    window.history.pushState({}, '', '/admin')
    const user = userEvent.setup()
    render(<App />)

    expect(
      await screen.findByRole('heading', { name: 'Admin' }),
    ).toBeInTheDocument()

    await user.type(screen.getByLabelText('Title'), 'Piranesi')
    await user.type(screen.getByLabelText('Author'), 'Susanna Clarke')
    await user.click(screen.getByRole('button', { name: 'Add book' }))

    expect(vi.mocked(addShelfItem)).toHaveBeenCalledWith({
      kind: 'books',
      title: 'Piranesi',
      author: 'Susanna Clarke',
    })
    expect(await screen.findByText('Added “Piranesi”.')).toBeInTheDocument()
  })

  it('rejects tutorial links that are not http or https', async () => {
    authState.session = { user: { email: 'admin@example.com' } }
    window.history.pushState({}, '', '/admin')
    const user = userEvent.setup()
    render(<App />)

    await screen.findByRole('heading', { name: 'Admin' })
    await user.click(screen.getByRole('tab', { name: 'YouTube' }))
    await user.type(screen.getByLabelText('Title'), 'A tutorial')
    await user.type(
      screen.getByLabelText('YouTube link'),
      'ftp://example.com/video',
    )
    await user.click(screen.getByRole('button', { name: 'Add tutorial' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Enter a full URL starting with http:// or https://.',
    )
    expect(vi.mocked(addShelfItem)).not.toHaveBeenCalled()
  })

  it('returns to the requested admin URL after signing in', async () => {
    window.history.pushState({}, '', '/admin?view=recent')
    const user = userEvent.setup()
    render(<App />)

    await screen.findByRole('heading', { name: 'Sign in' })
    await user.type(screen.getByLabelText('Email'), 'admin@example.com')
    await user.type(screen.getByLabelText('Password'), 'correct horse')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await screen.findByRole('heading', { name: 'Admin' })
    expect(`${window.location.pathname}${window.location.search}`).toBe(
      '/admin?view=recent',
    )
  })
})
