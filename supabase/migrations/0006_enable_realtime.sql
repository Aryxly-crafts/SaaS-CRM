-- Enable Supabase Realtime on all CRM tables so the dashboard updates live via WebSocket.
-- Run this in your Supabase SQL Editor. Safe to re-run.

-- Realtime needs the full old row to build UPDATE/DELETE payloads.
alter table if exists leads    replica identity full;
alter table if exists projects replica identity full;
alter table if exists payments replica identity full;
alter table if exists expenses replica identity full;
alter table if exists clients  replica identity full;

do $$
declare
  t text;
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;

  -- Added one at a time and only when missing. A plain "alter publication ... add
  -- table" aborts the whole script with 42710 as soon as one table is already a
  -- member, which makes the migration impossible to re-run safely.
  foreach t in array array['leads', 'projects', 'payments', 'expenses', 'clients'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table %I', t);
    end if;
  end loop;
end $$;
