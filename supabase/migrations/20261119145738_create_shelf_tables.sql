-- Shelf schema: books, movies, and YouTube tutorials.
-- Applied to project seggooyflpjgnlfhcaam via the Supabase MCP server.

create table public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  author text not null check (length(trim(author)) > 0),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now()
);

create table public.movies (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  director text not null check (length(trim(director)) > 0),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now()
);

create table public.youtube_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  url text not null check (url ~* '^https?://'),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now()
);

create index books_created_at_idx on public.books (created_at desc);
create index movies_created_at_idx on public.movies (created_at desc);
create index youtube_videos_created_at_idx on public.youtube_videos (created_at desc);

alter table public.books enable row level security;
alter table public.movies enable row level security;
alter table public.youtube_videos enable row level security;

-- Public read for the shelf. When auth is added, replace with owner-scoped reads
-- if shelves should become private.
create policy "Books are publicly readable" on public.books for select using (true);
create policy "Movies are publicly readable" on public.movies for select using (true);
create policy "YouTube videos are publicly readable" on public.youtube_videos for select using (true);

-- Anonymous inserts (no auth yet) are allowed with a null owner. Once auth is
-- enabled, new rows are automatically owned by auth.uid().
create policy "Anyone can add books" on public.books for insert
  with check (user_id is null or user_id = auth.uid());
create policy "Anyone can add movies" on public.movies for insert
  with check (user_id is null or user_id = auth.uid());
create policy "Anyone can add YouTube videos" on public.youtube_videos for insert
  with check (user_id is null or user_id = auth.uid());

-- Editing and deleting is reserved for the row owner, so enabling auth later
-- immediately scopes mutations without exposing them to anonymous visitors.
create policy "Owners can update books" on public.books for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Owners can delete books" on public.books for delete
  using (user_id = auth.uid());

create policy "Owners can update movies" on public.movies for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Owners can delete movies" on public.movies for delete
  using (user_id = auth.uid());

create policy "Owners can update YouTube videos" on public.youtube_videos for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Owners can delete YouTube videos" on public.youtube_videos for delete
  using (user_id = auth.uid());
