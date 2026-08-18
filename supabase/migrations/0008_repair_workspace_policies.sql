-- Repairs the workspace RLS policies on every workspace-scoped table.
--
-- Migration 0004 drops the old policies before creating the new ones. If that
-- script stops partway — as 0006 did on a re-run — the columns land but the
-- policies do not, leaving RLS enabled with nothing to allow. Reads then return
-- an empty list rather than an error, so the app looks like it simply has no
-- data. This restores a known-good state and is safe to run at any time.
--
-- Run in the CRM Supabase SQL Editor. Safe to re-run.

do $$
declare
  t text;
begin
  foreach t in array array['leads', 'clients', 'projects', 'payments', 'documents'] loop
    -- Clear every historical name for this table's policy so none can linger
    -- alongside the current one.
    execute format('drop policy if exists %I on %I', 'workspace access on ' || t, t);
    execute format('drop policy if exists %I on %I', 'authenticated full access on ' || t, t);
    execute format('drop policy if exists %I on %I', 'authenticated users can read ' || t, t);
    execute format('drop policy if exists %I on %I', 'authenticated users can insert ' || t, t);
    execute format('drop policy if exists %I on %I', 'authenticated users can update ' || t, t);
    execute format('drop policy if exists %I on %I', 'authenticated users can delete ' || t, t);

    -- Team rows are shared by both founders; personal rows belong to one of them.
    execute format($f$
      create policy %I on %I for all to authenticated
      using (workspace_type = 'team' or (workspace_type = 'personal' and user_id = auth.uid()))
      with check (workspace_type = 'team' or (workspace_type = 'personal' and user_id = auth.uid()))
    $f$, 'workspace access on ' || t, t);
  end loop;
end $$;

-- Report the result so a partial run is visible rather than assumed.
select tablename, policyname, cmd
from pg_policies
where tablename in ('leads', 'clients', 'projects', 'payments', 'documents')
order by tablename;
