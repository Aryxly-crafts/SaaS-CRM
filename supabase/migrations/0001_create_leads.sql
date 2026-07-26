-- supabase/migrations/0001_create_leads.sql
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  category text,
  phone text,
  address text,
  status text not null default 'cold'
    check (status in ('cold', 'contacted', 'interested', 'negotiating', 'won', 'lost')),
  notes text,
  source text,
  priority_score integer not null default 0
    check (priority_score >= 0 and priority_score <= 100),
  estimated_value numeric,
  created_at timestamptz not null default now()
);

alter table leads enable row level security;

-- Any authenticated user (only the 2 founders ever have accounts) can read all leads.
create policy "authenticated users can read leads"
  on leads for select
  to authenticated
  using (true);

-- Any authenticated user can create leads.
create policy "authenticated users can insert leads"
  on leads for insert
  to authenticated
  with check (true);

-- Any authenticated user can update leads.
create policy "authenticated users can update leads"
  on leads for update
  to authenticated
  using (true)
  with check (true);

-- Any authenticated user can delete/archive leads.
create policy "authenticated users can delete leads"
  on leads for delete
  to authenticated
  using (true);
