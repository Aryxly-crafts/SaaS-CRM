-- Expense tracker table — tracks team project costs and personal expenses.
-- Follows the same workspace pattern as all other tables.

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete set null,
  title text not null,
  amount numeric not null,
  category text not null default 'miscellaneous',
  entry_type text not null default 'expense'
    check (entry_type in ('income', 'expense')),
  date date not null default current_date,
  notes text,
  user_id uuid references auth.users(id) on delete set null,
  workspace_type text not null default 'team'
    check (workspace_type in ('personal', 'team')),
  created_at timestamptz not null default now()
);

-- Performance indexes.
create index if not exists expenses_workspace_type_user_id_idx
  on expenses(workspace_type, user_id);
create index if not exists expenses_date_idx
  on expenses(date);
create index if not exists expenses_project_id_idx
  on expenses(project_id);

-- RLS — team expenses visible to all authenticated users, personal only to owner.
alter table expenses enable row level security;

create policy "workspace access on expenses"
  on expenses for all to authenticated
  using (
    workspace_type = 'team'
    or (workspace_type = 'personal' and user_id = auth.uid())
  )
  with check (
    workspace_type = 'team'
    or (workspace_type = 'personal' and user_id = auth.uid())
  );
