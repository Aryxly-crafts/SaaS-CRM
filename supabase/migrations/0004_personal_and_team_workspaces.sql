-- Migration: Add user_id and workspace_type columns for Personal vs Team Workspace support

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

create index if not exists leads_workspace_type_user_id_idx on leads (workspace_type, user_id);
create index if not exists clients_workspace_type_user_id_idx on clients (workspace_type, user_id);
create index if not exists projects_workspace_type_user_id_idx on projects (workspace_type, user_id);
create index if not exists payments_workspace_type_user_id_idx on payments (workspace_type, user_id);
create index if not exists documents_workspace_type_user_id_idx on documents (workspace_type, user_id);

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
  );

create policy "workspace access on projects"
  on projects for all to authenticated
  using (
    workspace_type = 'team' or (workspace_type = 'personal' and user_id = auth.uid())
  );

create policy "workspace access on payments"
  on payments for all to authenticated
  using (
    workspace_type = 'team' or (workspace_type = 'personal' and user_id = auth.uid())
  );

create policy "workspace access on documents"
  on documents for all to authenticated
  using (
    workspace_type = 'team' or (workspace_type = 'personal' and user_id = auth.uid())
  );
