import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6">
        <p className="text-sm text-muted">Checking session…</p>
      </main>
    )
  }

  if (!session) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from: `${location.pathname}${location.search}${location.hash}`,
        }}
      />
    )
  }

  return <>{children}</>
}
