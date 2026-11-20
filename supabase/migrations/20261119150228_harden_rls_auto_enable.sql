-- Supabase installs rls_auto_enable() as an event trigger helper. It does not
-- need to be callable through PostgREST by anonymous or signed-in users.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
