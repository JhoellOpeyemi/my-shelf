import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ErrorNotice } from '../components/ErrorNotice'
import { PageHeader } from '../components/PageHeader'
import { Tabs } from '../components/Tabs'
import { useAuth } from '../hooks/useAuth'
import { useShelfItems } from '../hooks/useShelfItems'
import { signOut } from '../lib/auth'
import { addShelfItem } from '../lib/items'
import {
  KIND_FIELD_LABELS,
  KIND_NOUNS,
  type ShelfKind,
} from '../types'

type Feedback = {
  tone: 'success' | 'error'
  message: string
}

const inputClassName =
  'mt-2 w-full border-0 border-b border-line bg-transparent py-2 text-[15px] text-ink placeholder:text-muted focus:border-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink'

function fieldPlaceholder(kind: ShelfKind) {
  if (kind === 'books') return 'e.g. Ursula K. Le Guin'
  if (kind === 'movies') return 'e.g. Agnès Varda'
  return 'https://www.youtube.com/watch?v=…'
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function AdminPage() {
  const { session } = useAuth()
  const [kind, setKind] = useState<ShelfKind>('books')
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [saving, setSaving] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const { items, state, error, reload } = useShelfItems(kind)

  const noun = KIND_NOUNS[kind]

  function changeKind(nextKind: ShelfKind) {
    setKind(nextKind)
    setTitle('')
    setDetail('')
    setFeedback(null)
  }

  async function handleSignOut() {
    if (signingOut) return

    setSigningOut(true)
    setFeedback(null)

    try {
      await signOut()
    } catch (cause: unknown) {
      setFeedback({
        tone: 'error',
        message:
          cause instanceof Error ? cause.message : 'Could not sign out.',
      })
    } finally {
      setSigningOut(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (saving) return

    const trimmedTitle = title.trim()
    const trimmedDetail = detail.trim()

    if (!trimmedTitle || !trimmedDetail) {
      setFeedback({ tone: 'error', message: 'Both fields are required.' })
      return
    }

    if (kind === 'youtube' && !isHttpUrl(trimmedDetail)) {
      setFeedback({
        tone: 'error',
        message: 'Enter a full URL starting with http:// or https://.',
      })
      return
    }

    setSaving(true)
    setFeedback(null)

    try {
      if (kind === 'books') {
        await addShelfItem({
          kind: 'books',
          title: trimmedTitle,
          author: trimmedDetail,
        })
      } else if (kind === 'movies') {
        await addShelfItem({
          kind: 'movies',
          title: trimmedTitle,
          director: trimmedDetail,
        })
      } else {
        await addShelfItem({
          kind: 'youtube',
          title: trimmedTitle,
          url: trimmedDetail,
        })
      }

      setTitle('')
      setDetail('')
      setFeedback({
        tone: 'success',
        message: `Added “${trimmedTitle}”.`,
      })
      reload()
    } catch (cause: unknown) {
      setFeedback({
        tone: 'error',
        message:
          cause instanceof Error ? cause.message : 'Could not add the item.',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-6 pb-24 pt-10 sm:pt-14">
      <div className="mb-10 flex items-start justify-between gap-6">
        <Link
          to="/"
          className="text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          ← Back to shelf
        </Link>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="hidden max-w-56 truncate sm:inline">
            {session?.user.email}
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="uppercase tracking-[0.14em] transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </div>

      <PageHeader
        eyebrow="Unlisted"
        title="Admin"
        description="Add a book, film, or tutorial to the shelf."
      />

      <Tabs
        active={kind}
        onChange={changeKind}
        idPrefix="admin"
        label="Item type"
      />

      <div
        id={`admin-panel-${kind}`}
        role="tabpanel"
        aria-labelledby={`admin-tab-${kind}`}
      >
        <form onSubmit={handleSubmit} className="mt-8 border border-line p-6">
          <div className="space-y-6">
            <div>
              <label
                htmlFor="item-title"
                className="block text-xs uppercase tracking-[0.14em] text-muted"
              >
                Title
              </label>
              <input
                id="item-title"
                type="text"
                required
                autoComplete="off"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={`e.g. A ${noun.singular} worth remembering`}
                className={inputClassName}
              />
            </div>

            <div>
              <label
                htmlFor="item-detail"
                className="block text-xs uppercase tracking-[0.14em] text-muted"
              >
                {KIND_FIELD_LABELS[kind]}
              </label>
              <input
                id="item-detail"
                type={kind === 'youtube' ? 'url' : 'text'}
                required
                autoComplete="off"
                value={detail}
                onChange={(event) => setDetail(event.target.value)}
                placeholder={fieldPlaceholder(kind)}
                className={inputClassName}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={saving}
              className="bg-ink px-5 py-2.5 text-sm text-paper transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Adding…' : `Add ${noun.singular}`}
            </button>

            {feedback ? (
              <p
                role={feedback.tone === 'error' ? 'alert' : 'status'}
                className={`text-sm ${
                  feedback.tone === 'error' ? 'text-danger' : 'text-muted'
                }`}
              >
                {feedback.message}
              </p>
            ) : null}
          </div>
        </form>
      </div>

      <section className="mt-12" aria-labelledby="recently-added">
        <div className="flex items-baseline justify-between border-b border-line pb-3">
          <h2
            id="recently-added"
            className="text-xs uppercase tracking-[0.14em] text-muted"
          >
            Recently added
          </h2>
          {state === 'ready' ? (
            <span className="text-xs text-muted">
              {items.length} {items.length === 1 ? noun.singular : noun.plural}
            </span>
          ) : null}
        </div>

        {state === 'loading' ? (
          <p className="py-6 text-sm text-muted">Loading…</p>
        ) : null}

        {state === 'error' ? (
          <div className="pt-4">
            <ErrorNotice
              message={error ?? 'Could not load recent items.'}
              onRetry={reload}
            />
          </div>
        ) : null}

        {state === 'ready' && items.length === 0 ? (
          <p className="py-6 text-sm text-muted">
            Nothing added yet. Use the form above.
          </p>
        ) : null}

        {state === 'ready' && items.length > 0 ? (
          <ul className="divide-y divide-line">
            {items.slice(0, 5).map((item) => (
              <li
                key={item.id}
                className="flex items-baseline justify-between gap-6 py-3 text-sm"
              >
                <span className="min-w-0 truncate text-ink">{item.title}</span>
                <span className="max-w-[45%] shrink-0 truncate text-xs text-muted">
                  {item.subtitle}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </main>
  )
}
