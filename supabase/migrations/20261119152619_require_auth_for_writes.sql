-- The admin route now requires a Supabase session. Remove anonymous inserts and
-- only allow signed-in users to create rows they own.
drop policy "Anyone can add books" on public.books;
drop policy "Anyone can add movies" on public.movies;
drop policy "Anyone can add YouTube videos" on public.youtube_videos;

create policy "Authenticated users can add books" on public.books
  for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Authenticated users can add movies" on public.movies
  for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Authenticated users can add YouTube videos" on public.youtube_videos
  for insert to authenticated
  with check (user_id = (select auth.uid()));
