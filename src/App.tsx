import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { RequireAuth } from './components/RequireAuth'
import { isSupabaseConfigured } from './lib/supabase'
import { AdminPage } from './pages/AdminPage'
import { LoginPage } from './pages/LoginPage'
import { ShelfPage } from './pages/ShelfPage'

function SetupNotice() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-6">
      <h1 className="font-serif text-3xl tracking-tight">Shelf</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
        Supabase is not configured yet. Add{' '}
        <code className="text-ink">VITE_SUPABASE_URL</code> and{' '}
        <code className="text-ink">VITE_SUPABASE_PUBLISHABLE_KEY</code> to{' '}
        <code className="text-ink">.env.local</code>, then restart the dev
        server.
      </p>
    </main>
  )
}

function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-6">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">404</p>
      <h1 className="mt-3 font-serif text-3xl tracking-tight">
        Nothing on this shelf.
      </h1>
      <Link
        to="/"
        className="mt-6 w-fit border-b border-ink text-sm text-ink transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
      >
        Back to the shelf
      </Link>
    </main>
  )
}

export default function App() {
  if (!isSupabaseConfigured) return <SetupNotice />

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<ShelfPage />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminPage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
