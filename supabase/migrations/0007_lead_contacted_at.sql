-- Records when a lead was actually spoken to, which is the only number the daily
-- target counts. Deliberately not a generic updated_at: editing a note is not a
-- call, and a target that counts edits would reward the wrong habit.
-- Run in your Supabase SQL Editor. Safe to re-run.

alter table leads
  add column if not exists contacted_at timestamptz;

-- Backfill: any lead already past 'cold' was contacted at some point, and dating
-- it from creation keeps historical rows out of today's count.
update leads
  set contacted_at = created_at
  where contacted_at is null
    and status in ('contacted', 'interested', 'negotiating', 'won', 'lost');

-- Today's Calls reads "contacted since midnight" and "still cold, oldest first".
create index if not exists leads_contacted_at_idx on leads (contacted_at desc);
create index if not exists leads_status_created_idx on leads (status, created_at);
