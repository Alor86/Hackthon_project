-- CampusCare incident schema repair.
-- Run this in Supabase SQL Editor before using the report and assignment flows.

alter table public.incidents
  add column if not exists type text,
  add column if not exists assigned_responder_id bigint,
  add column if not exists reason text,
  add column if not exists reporter_id uuid references auth.users(id),
  add column if not exists threat_score integer default 0;

-- Keep the numeric threat score in the existing priority column.
-- If priority is currently text in your project, change this column to integer first.
-- Keep priority compatible with the existing project trigger. The frontend
-- stores the detailed numeric score in threat_score.

create index if not exists incidents_created_at_idx
  on public.incidents (created_at desc);

alter table public.incidents replica identity full;

-- Add the tables to Realtime only when they are not already members.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'incidents'
  ) then
    alter publication supabase_realtime add table public.incidents;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'responders'
  ) then
    alter publication supabase_realtime add table public.responders;
  end if;
end $$;

alter table public.incidents enable row level security;
alter table public.responders enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'incidents' and policyname = 'authenticated incidents can read') then
    create policy "authenticated incidents can read" on public.incidents for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'incidents' and policyname = 'users can submit own incidents') then
    create policy "users can submit own incidents" on public.incidents for insert to authenticated with check (auth.uid() = reporter_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'incidents' and policyname = 'authenticated users can update incidents') then
    create policy "authenticated users can update incidents" on public.incidents for update to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'incidents' and policyname = 'users can delete own incidents') then
    create policy "users can delete own incidents" on public.incidents for delete to authenticated using (auth.uid() = reporter_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'responders' and policyname = 'authenticated responders can read') then
    create policy "authenticated responders can read" on public.responders for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'responders' and policyname = 'authenticated responders can update') then
    create policy "authenticated responders can update" on public.responders for update to authenticated using (true) with check (true);
  end if;
end $$;

-- The assignment update is collision-safe at the client boundary, but RLS must
-- allow authenticated users to update only the fields appropriate to their role.
-- Review and configure policies in Supabase Authentication > Policies.
