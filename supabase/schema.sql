-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query)

create table public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,              -- Clerk user ID (e.g. "user_2abc...")
  prompt text not null,
  generated_text text not null,
  created_at timestamptz not null default now()
);

create index idx_generations_user_id on public.generations(user_id);

-- RLS is enabled for defense-in-depth even though the service role key
-- (used server-side only, in app/api/generate/route.ts) bypasses it.
alter table public.generations enable row level security;

-- No public policies are added: the service role key is the only
-- reader/writer for now. If you later add client-side reads (e.g. a
-- "history" page using the anon key), add a policy scoped to the
-- authenticated user's Clerk ID via a Clerk-Supabase JWT integration.
