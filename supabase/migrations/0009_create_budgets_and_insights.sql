-- Migration 0009: Create budgets and AI insights tables for financial intelligence

-- 1. Budgets table supporting project targets, category caps, and personal savings goals
create table if not exists budgets (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('project', 'category', 'savings')),
  project_id uuid references projects(id) on delete cascade,
  category text,
  amount numeric not null default 0,
  period text not null default 'monthly' check (period in ('monthly', 'project', 'annual')),
  period_start date not null default current_date,
  notes text,
  workspace_type text not null default 'team' check (workspace_type in ('personal', 'team')),
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists budgets_workspace_user_idx on budgets (workspace_type, user_id);
create index if not exists budgets_project_id_idx on budgets (project_id);
create index if not exists budgets_scope_category_idx on budgets (scope, category);

alter table budgets enable row level security;

create policy "workspace access on budgets"
  on budgets for all to authenticated
  using (
    workspace_type = 'team' or (workspace_type = 'personal' and user_id = auth.uid())
  )
  with check (
    workspace_type = 'team' or (workspace_type = 'personal' and user_id = auth.uid())
  );

-- 2. AI insights cache table keyed by data fingerprint
create table if not exists ai_insights (
  id uuid primary key default gen_random_uuid(),
  workspace_type text not null check (workspace_type in ('personal', 'team')),
  user_id uuid references auth.users(id) on delete set null,
  fingerprint text not null,
  insights jsonb not null default '[]'::jsonb,
  summary text,
  health_score integer default 100,
  created_at timestamptz not null default now()
);

create index if not exists ai_insights_lookup_idx on ai_insights (workspace_type, user_id, fingerprint);

alter table ai_insights enable row level security;

create policy "workspace access on ai_insights"
  on ai_insights for all to authenticated
  using (
    workspace_type = 'team' or (workspace_type = 'personal' and user_id = auth.uid())
  )
  with check (
    workspace_type = 'team' or (workspace_type = 'personal' and user_id = auth.uid())
  );
