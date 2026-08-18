-- Enable Supabase Realtime on all CRM tables so the dashboard updates live via WebSocket
-- Run this in your Supabase SQL Editor.

-- Enable replica identity on tables
alter table if exists leads replica identity full;
alter table if exists projects replica identity full;
alter table if exists payments replica identity full;
alter table if exists expenses replica identity full;
alter table if exists clients replica identity full;

-- Add tables to the supabase_realtime publication
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

alter publication supabase_realtime add table leads, projects, payments, expenses, clients;
