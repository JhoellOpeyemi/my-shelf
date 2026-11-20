# My Shelf

My Shelf is a small personal website. It keeps a list of:

- books you have read
- films you have watched
- YouTube tutorials you have watched

You can switch between the three lists, search the current list, and open
tutorial links in a new tab. Anyone can view the shelf. Only the owner can add
items, using a private admin page.

The app is a single-page React app. Supabase stores the data and handles the
admin login.

## Run it on your computer

You need Node 22, npm, and a Supabase project.

### 1. Install the packages

```bash
npm install
```

### 2. Create your local environment file

```bash
cp .env.example .env.local
```

The `.env.local` file stays on your computer and is ignored by Git.

Open `.env.local` and add your Supabase project URL and publishable key:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

Both names must start with `VITE_` so the browser can read them. Use only the
publishable key here. Never put a secret or service-role key in the app.

### 3. Start the app

```bash
npm run dev
```

Vite will print the local address in your terminal.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Check the types and build the production site |
| `npm run typecheck` | Check the TypeScript types only |
| `npm run lint` | Check the code with oxlint |
| `npm test` | Run the tests in watch mode |
| `npm run test:run` | Run the tests once |
| `npm run preview` | Preview the production build |

## Pages

| Page | What it does |
| --- | --- |
| `/` | The public shelf |
| `/admin` | Add a book, film, or tutorial. You must sign in first. |
| `/admin/login` | Sign in with the admin email and password |

The admin pages are not linked from the public shelf. The login and database
rules are what keep them safe.

## Admin account

Create the admin account in the Supabase Dashboard:

1. Open **Authentication → Users** and choose **Add user**. Set an email and
   password, then confirm the user.
2. Open the auth settings and turn off **Allow new users to sign up**.
3. Use a strong password. If your plan supports it, turn on protection against
   leaked passwords.

There is no sign-up page in the app. Keep sign-ups turned off. The database lets
any signed-in user add items, so the admin account should be the only account
you create.

Sessions stay in the browser. Use **Sign out** in the admin header to end a
session.

## Deploying

The app is a static site. Cloudflare Workers static assets (via the
`wrangler deploy` setup) is the recommended free host.

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | `22` |

Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as environment
variables in the hosting dashboard.

Cloudflare's Vite setup already enables SPA fallback through
`not_found_handling: "single-page-application"`, so direct links such as
`/admin` work. Do not add a catch-all `_redirects` rule like
`/* /index.html 200`; Cloudflare rejects it with an infinite-loop error.

After you deploy, set the Supabase **Authentication → URL Configuration** site
URL to your new domain.

## Database

The Supabase project ref is `seggooyflpjgnlfhcaam`.

The app uses three tables:

- `books` with `title` and `author`
- `movies` with `title` and `director`
- `youtube_videos` with `title` and `url`

Each row also has an `id`, a `created_at` date, and a nullable `user_id`.

Row level security (RLS) is turned on. The database uses these rules:

- Anyone can read the shelf.
- A signed-in user can add a row. The row is saved under that user's ID.
- Only the row owner can update or delete a row.

Rows created before the admin login was added have a null `user_id`. Anyone can
read them, but no one owns them. If you add edit or delete later, give those rows
an owner first.

Database changes are in `supabase/migrations/`. The TypeScript types for the
database are in `src/lib/database.types.ts`. After a schema change, regenerate
the types instead of editing that file by hand.

## Main files

- `src/pages/ShelfPage.tsx` — the public shelf, tabs, search, and list
- `src/pages/AdminPage.tsx` — the add-item form
- `src/pages/LoginPage.tsx` — the sign-in page
- `src/lib/items.ts` — shelf database queries and the search helper
- `src/lib/auth.ts` — sign-in, sign-out, and session helpers
- `src/lib/supabase.ts` — the Supabase client and setup check
- `supabase/migrations/` — the database schema and security rules
