-- Cover the ownership foreign keys used by the RLS policies.
create index books_user_id_idx on public.books (user_id);
create index movies_user_id_idx on public.movies (user_id);
create index youtube_videos_user_id_idx on public.youtube_videos (user_id);

-- Use (select auth.uid()) so Postgres evaluates the function once per query
-- instead of once per row.
alter policy "Anyone can add books" on public.books
  with check (user_id is null or user_id = (select auth.uid()));
alter policy "Anyone can add movies" on public.movies
  with check (user_id is null or user_id = (select auth.uid()));
alter policy "Anyone can add YouTube videos" on public.youtube_videos
  with check (user_id is null or user_id = (select auth.uid()));

alter policy "Owners can update books" on public.books
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
alter policy "Owners can delete books" on public.books
  using (user_id = (select auth.uid()));
alter policy "Owners can update movies" on public.movies
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
alter policy "Owners can delete movies" on public.movies
  using (user_id = (select auth.uid()));
alter policy "Owners can update YouTube videos" on public.youtube_videos
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
alter policy "Owners can delete YouTube videos" on public.youtube_videos
  using (user_id = (select auth.uid()));
