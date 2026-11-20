# AGENTS.md

## Project

"My Shelf" — a personal tracker for books read, films watched, and YouTube tutorials watched (with links). Single-page React app with tabs, search, and a session-protected `/admin` area.

## Stack

- Vite 8 + React 19 + TypeScript (strict)
- Tailwind CSS v4 via `@tailwindcss/vite` (no `tailwind.config.js`, no PostCSS setup)
- Supabase (`@supabase/supabase-js`)
- Vitest 5 + React Testing Library + jsdom
- npm only (`package-lock.json`); the Vite scaffold uses `oxlint`, not ESLint
- Supabase project ref `seggooyflpjgnlfhcaam`

## Commands

```bash
npm install
npm run dev                     # Vite dev server
npm run typecheck               # tsc -b
npm run build                   # typecheck + production build
npm run lint                    # oxlint
npm test                        # Vitest watch mode
npm run test:run                # single CI-style run
npm test -- src/lib/items.test.ts   # one test file
```

Before declaring work done: `npm run lint && npm run build && npm run test:run`.

## Architecture

- `src/pages/ShelfPage.tsx` — public shelf: tabs, search, list.
- `src/pages/AdminPage.tsx` — add-item form at `/admin`; no link to it exists in the public UI. Keep it unlisted.
- `src/pages/LoginPage.tsx` — email/password sign-in at `/admin/login`.
- `src/auth/AuthProvider.tsx` + `src/auth/AuthContext.ts` + `src/hooks/useAuth.ts` — session state, `getSession()`, and `onAuthStateChange` subscription.
- `src/components/RequireAuth.tsx` — redirects signed-out visitors to `/admin/login`, preserving the intended path.
- `src/lib/auth.ts` — sign-in/sign-out/session wrappers. Put auth calls here, not in components.
- `src/lib/supabase.ts` — single client + `requireSupabase()` guard + `isSupabaseConfigured` setup screen.
- `src/lib/items.ts` — all queries/mutations and the pure `filterShelfItems` search helper. Put data access here, not in components.
- `src/hooks/useShelfItems.ts` — loads items for the active tab; `reload()` refetches.
- `src/lib/database.types.ts` — generated; do not hand-edit.
- `src/types.ts` — UI item union and per-tab labels/placeholders.
- `supabase/migrations/` — four applied migrations: base schema, `rls_auto_enable` hardening, RLS/index optimization, and auth-required writes. Keep new DDL in timestamped files too.

Search is client-side over the active tab; the whole table is fetched. Fine for a personal shelf; move to server-side filtering only if tables get large.

## Deployment

Static SPA hosted on Cloudflare Pages: build `npm run build`, output `dist`, Node 22, with `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` set in the dashboard. `public/_redirects` provides the SPA fallback for `/admin` routes; keep it when changing hosts.

## Supabase

- Env vars: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env.local` (gitignored). `VITE_SUPABASE_ANON_KEY` is supported as a fallback. Unprefixed vars are not exposed to Vite.
- Never put a service-role/secret key in `src/` or any `VITE_` variable.
- Tables: `books` (`title`, `author`), `movies` (`title`, `director`), `youtube_videos` (`title`, `url`). Each also has `id`, `created_at`, and nullable `user_id` defaulting to `auth.uid()`.
- RLS is on. Reads are public; inserts require an authenticated session with `user_id = auth.uid()`; update/delete require ownership.
- Auth is email/password via Supabase Auth. The admin account is created in the Supabase Dashboard, not through the app; there is no sign-up UI. Disable new user signups so only the admin account exists. The RLS policy permits any authenticated user to insert, so signup settings are part of the security boundary.
- Sessions persist in the browser through the Supabase client. `AuthProvider` subscribes to auth changes; `RequireAuth` guards `/admin`. Keep `/admin/login` unlinked from the public shelf.
- Rows created before auth existed have `user_id = null`; they stay publicly readable but are not owner-editable. Backfill them if edit/delete is added later.
- After schema changes, regenerate types with the Supabase MCP `generate_typescript_types` tool and update `src/lib/database.types.ts`. Apply DDL with `apply_migration`, and keep the local SQL file in `supabase/migrations/`.

## UI conventions

- Minimal, light, near-monochrome. Palette tokens are in `src/index.css` (`paper`, `ink`, `muted`, `line`, `accent`, `danger`); use them instead of arbitrary colors.
- No gradients or vibrant accents. Transitions are limited to color/opacity; don't add entrance animations.
- Layout is a single narrow column (`max-w-2xl`), serif page title, sans body, thin 1px dividers between list rows.
- Keep the tabs/search/list structure; the admin page reuses `Tabs` and `PageHeader`.

## Tests

- Vitest config lives in `vite.config.ts`; setup file is `src/test/setup.ts` (RTL cleanup + jest-dom).
- `src/App.test.tsx` mocks `src/lib/items`, `src/lib/supabase`, and `src/lib/auth`; it covers tab switching, search, the admin redirect, sign-in/sign-out, and the admin form.
- Pure search behavior is covered in `src/lib/items.test.ts`.
