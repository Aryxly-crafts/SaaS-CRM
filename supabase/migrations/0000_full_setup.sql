-- COMPLETE SETUP SCRIPT: Tables, Storage, and Personal/Team Workspace Security

-- 1. Create leads table
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

-- 2. Create clients table
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads (id) on delete set null,
  legal_name text not null,
  phone text,
  address text,
  created_at timestamptz not null default now()
);

-- 3. Create projects table
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

-- 4. Create payments table
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  amount numeric not null,
  type text not null default 'other'
    check (type in ('advance', 'final', 'other')),
  paid_date date,
  created_at timestamptz not null default now()
);

-- 5. Create documents table
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  type text not null default 'agreement'
    check (type in ('agreement', 'sow', 'invoice')),
  file_url text not null,
  file_name text,
  created_at timestamptz not null default now()
);

-- 6. Add workspace_type and user_id columns to all tables
alter table leads
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists workspace_type text not null default 'team' check (workspace_type in ('personal', 'team'));

alter table clients
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists workspace_type text not null default 'team' check (workspace_type in ('personal', 'team'));

alter table projects
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists workspace_type text not null default 'team' check (workspace_type in ('personal', 'team'));

alter table payments
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists workspace_type text not null default 'team' check (workspace_type in ('personal', 'team'));

alter table documents
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists workspace_type text not null default 'team' check (workspace_type in ('personal', 'team'));

-- 7. Performance Indexes
create index if not exists projects_client_id_idx on projects (client_id);
create index if not exists payments_project_id_idx on payments (project_id);
create index if not exists documents_project_id_idx on documents (project_id);
create index if not exists clients_lead_id_idx on clients (lead_id);

create index if not exists leads_workspace_type_user_id_idx on leads (workspace_type, user_id);
create index if not exists clients_workspace_type_user_id_idx on clients (workspace_type, user_id);
create index if not exists projects_workspace_type_user_id_idx on projects (workspace_type, user_id);
create index if not exists payments_workspace_type_user_id_idx on payments (workspace_type, user_id);
create index if not exists documents_workspace_type_user_id_idx on documents (workspace_type, user_id);

-- 8. Enable Row Level Security (RLS)
alter table leads enable row level security;
alter table clients enable row level security;
alter table projects enable row level security;
alter table payments enable row level security;
alter table documents enable row level security;

-- 9. Clean up legacy policies if present
drop policy if exists "authenticated users can read leads" on leads;
drop policy if exists "authenticated users can insert leads" on leads;
drop policy if exists "authenticated users can update leads" on leads;
drop policy if exists "authenticated users can delete leads" on leads;
drop policy if exists "workspace access on leads" on leads;

drop policy if exists "authenticated full access on clients" on clients;
drop policy if exists "workspace access on clients" on clients;

drop policy if exists "authenticated full access on projects" on projects;
drop policy if exists "workspace access on projects" on projects;

drop policy if exists "authenticated full access on payments" on payments;
drop policy if exists "workspace access on payments" on payments;

drop policy if exists "authenticated full access on documents" on documents;
drop policy if exists "workspace access on documents" on documents;

-- 10. Workspace-aware RLS Policies
create policy "workspace access on leads"
  on leads for all to authenticated
  using (
    workspace_type = 'team' or (workspace_type = 'personal' and user_id = auth.uid())
  )
  with check (
    workspace_type = 'team' or (workspace_type = 'personal' and user_id = auth.uid())
  );

create policy "workspace access on clients"
  on clients for all to authenticated
  using (
    workspace_type = 'team' or (workspace_type = 'personal' and user_id = auth.uid())
  )
  with check (
    workspace_type = 'team' or (workspace_type = 'personal' and user_id = auth.uid())
  );

create policy "workspace access on projects"
  on projects for all to authenticated
  using (
    workspace_type = 'team' or (workspace_type = 'personal' and user_id = auth.uid())
  )
  with check (
    workspace_type = 'team' or (workspace_type = 'personal' and user_id = auth.uid())
  );

create policy "workspace access on payments"
  on payments for all to authenticated
  using (
    workspace_type = 'team' or (workspace_type = 'personal' and user_id = auth.uid())
  )
  with check (
    workspace_type = 'team' or (workspace_type = 'personal' and user_id = auth.uid())
  );

create policy "workspace access on documents"
  on documents for all to authenticated
  using (
    workspace_type = 'team' or (workspace_type = 'personal' and user_id = auth.uid())
  )
  with check (
    workspace_type = 'team' or (workspace_type = 'personal' and user_id = auth.uid())
  );

-- 11. Storage bucket setup for uploaded documents
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

drop policy if exists "authenticated read documents" on storage.objects;
drop policy if exists "authenticated upload documents" on storage.objects;
drop policy if exists "authenticated update documents" on storage.objects;
drop policy if exists "authenticated delete documents" on storage.objects;

create policy "authenticated read documents"
  on storage.objects for select to authenticated
  using (bucket_id = 'documents');

create policy "authenticated upload documents"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'documents');

create policy "authenticated update documents"
  on storage.objects for update to authenticated
  using (bucket_id = 'documents') with check (bucket_id = 'documents');

create policy "authenticated delete documents"
  on storage.objects for delete to authenticated
  using (bucket_id = 'documents');
