import { createClient } from "@/lib/supabase/server";
import { SetPageTitle } from "../page-title-context";
import { getClients, getProjects, getExpenses } from "@/lib/records-data";
import { getLeads } from "@/lib/dashboard-data";
import { Card, PageHeader } from "@/components/ui";
import { shortDate } from "@/lib/records";
import { signOut } from "../actions";
import { Button } from "@/components/ui";

// One labelled row inside a settings card.
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-line flex items-center justify-between gap-4 border-b px-4 py-2.5 text-[12.5px] last:border-b-0">
      <span className="text-ink-muted">{label}</span>
      <span className="text-ink font-medium">{value}</span>
    </div>
  );
}

// Account and workspace overview.
export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [leads, clients, projects, expenses] = await Promise.all([
    getLeads(),
    getClients(),
    getProjects(),
    getExpenses(),
  ]);

  return (
    <>
      <SetPageTitle title="Settings" />
      <PageHeader
        title="Settings"
        description="Account details and workspace totals."
      />

      <div className="flex max-w-[560px] flex-col gap-4">
        <Card>
          <div className="border-line border-b px-4 py-2.5">
            <h3 className="text-ink text-[13px] font-semibold">Account</h3>
          </div>
          <Row label="Signed in as" value={user?.email ?? "Unknown"} />
          <Row
            label="Member since"
            value={user?.created_at ? shortDate(user.created_at) : "—"}
          />
          <Row
            label="Last sign-in"
            value={
              user?.last_sign_in_at ? shortDate(user.last_sign_in_at) : "—"
            }
          />
        </Card>

        <Card>
          <div className="border-line border-b px-4 py-2.5">
            <h3 className="text-ink text-[13px] font-semibold">Workspace</h3>
          </div>
          <Row label="Leads" value={String(leads.length)} />
          <Row label="Clients" value={String(clients.length)} />
          <Row label="Projects" value={String(projects.length)} />
          <Row label="Expenses" value={String(expenses.length)} />
        </Card>

        <Card>
          <div className="border-line border-b px-4 py-2.5">
            <h3 className="text-ink text-[13px] font-semibold">Session</h3>
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <p className="text-ink-muted text-[12.5px]">
              Sign out of this device.
            </p>
            <form action={signOut}>
              <Button type="submit">Sign out</Button>
            </form>
          </div>
        </Card>
      </div>
    </>
  );
}
