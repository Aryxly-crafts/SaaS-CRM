-- Clients, projects, payments, and documents.
-- Mirrors the data model in CLAUDE.md. RLS is open to any authenticated
-- user because only the two founders ever have accounts.

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads (id) on delete set null,
  legal_name text not null,
  phone text,
  address text,
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  title text not null,
  total_value numeric,
  advance_amount numeric,
  advance_paid boolean not null default false,
  final_amount numeric,
  final_paid boolean not null default false,
  start_date date,
  deadline date,
  status text not null default 'active'
    check (status in ('active', 'completed', 'on_hold')),
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  amount numeric not null,
  type text not null default 'other'
    check (type in ('advance', 'final', 'other')),
  paid_date date,
  created_at timestamptz not null default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  type text not null default 'agreement'
    check (type in ('agreement', 'sow', 'invoice')),
  file_url text not null,
  file_name text,
  created_at timestamptz not null default now()
);

-- Indexes on the foreign keys the app filters and joins by.
create index if not exists projects_client_id_idx on projects (client_id);
create index if not exists payments_project_id_idx on payments (project_id);
create index if not exists documents_project_id_idx on documents (project_id);
create index if not exists clients_lead_id_idx on clients (lead_id);

alter table clients enable row level security;
alter table projects enable row level security;
alter table payments enable row level security;
alter table documents enable row level security;

-- Full access for authenticated users on every table.
create policy "authenticated full access on clients"
  on clients for all to authenticated using (true) with check (true);

create policy "authenticated full access on projects"
  on projects for all to authenticated using (true) with check (true);

create policy "authenticated full access on payments"
  on payments for all to authenticated using (true) with check (true);

create policy "authenticated full access on documents"
  on documents for all to authenticated using (true) with check (true);
