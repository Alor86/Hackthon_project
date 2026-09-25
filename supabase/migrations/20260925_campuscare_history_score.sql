-- Follow-up CampusCare migration for authenticated history and autonomous scoring.
-- Run this if the original incidents migration was already executed partially.

alter table public.incidents
  add column if not exists reporter_id uuid references auth.users(id),
  add column if not exists threat_score integer not null default 0,
  add column if not exists threat_points integer not null default 0,
  add column if not exists priority_reason text;

create index if not exists incidents_reporter_created_at_idx
  on public.incidents (reporter_id, created_at desc);

alter table public.incidents enable row level security;

-- These policies are intentionally idempotent. Existing policies with the same
-- names are left unchanged.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'incidents' and policyname = 'users can submit own incidents') then
    create policy "users can submit own incidents" on public.incidents
      for insert to authenticated
      with check (auth.uid() = reporter_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'incidents' and policyname = 'users can delete own incidents') then
    create policy "users can delete own incidents" on public.incidents
      for delete to authenticated
      using (auth.uid() = reporter_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'incidents' and policyname = 'authenticated users can delete legacy incidents') then
    create policy "authenticated users can delete legacy incidents" on public.incidents
      for delete to authenticated
      using (reporter_id is null);
  end if;
end $$;

alter table public.incidents replica identity full;
