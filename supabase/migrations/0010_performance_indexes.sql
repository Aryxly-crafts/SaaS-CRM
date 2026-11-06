-- Indexes for the workspace-scoped dashboard queries.
create index if not exists leads_workspace_created_at_idx
  on leads (workspace_type, created_at desc);

create index if not exists leads_workspace_status_idx
  on leads (workspace_type, status);

create index if not exists payments_workspace_paid_date_idx
  on payments (workspace_type, paid_date);

create index if not exists projects_workspace_deadline_idx
  on projects (workspace_type, deadline)
  where status <> 'completed' and deadline is not null;