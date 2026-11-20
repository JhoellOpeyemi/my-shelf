import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useAuth } from '../hooks/useAuth'
import { signInWithPassword } from '../lib/auth'

const inputClassName =
  'mt-2 w-full border-0 border-b border-line bg-transparent py-2 text-[15px] text-ink placeholder:text-muted focus:border-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink'

export function LoginPage() {
  const { session, loading } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const requestedPath = (location.state as { from?: unknown } | null)?.from
  const from =
    typeof requestedPath === 'string' &&
    requestedPath.startsWith('/') &&
    !requestedPath.startsWith('//')
      ? requestedPath
      : '/admin'

  if (loading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
        <p className="text-sm text-muted">Checking session…</p>
      </main>
    )
  }

  if (session) {
    return <Navigate to={from} replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (submitting) return

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setError('Enter your email and password.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await signInWithPassword(trimmedEmail, password)
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Could not sign in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
      <PageHeader
        eyebrow="Unlisted"
        title="Sign in"
        description="Use the admin account for this shelf."
      />

      <form onSubmit={handleSubmit} className="border border-line p-6">
        <div className="space-y-6">
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs uppercase tracking-[0.14em] text-muted"
            >
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className={inputClassName}
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs uppercase tracking-[0.14em] text-muted"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              className={inputClassName}
            />
          </div>
        </div>

        {error ? (
          <p role="alert" className="mt-4 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-8 w-full bg-ink px-5 py-2.5 text-sm text-paper transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-xs leading-relaxed text-muted">
        Create the admin account in Supabase under Authentication → Users, then
        sign in here.
      </p>

      <Link
        to="/"
        className="mt-8 w-fit text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
      >
        ← Back to shelf
      </Link>
    </main>
  )
}
