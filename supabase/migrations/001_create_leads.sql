create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  page text,
  session_id text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

create policy "No public direct access to leads"
on public.leads
for all
to public
using (false)
with check (false);
