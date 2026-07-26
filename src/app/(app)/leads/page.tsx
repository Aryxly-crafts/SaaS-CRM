import { Users } from "lucide-react";
import { SetPageTitle } from "../page-title-context";
import { getLeads } from "@/lib/dashboard-data";
import { STATUS_ORDER, type LeadStatus } from "@/lib/leads";
import { StatusBadge } from "@/components/status-badge";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { LeadForm } from "./lead-form";
import { LeadActions } from "./lead-actions";
import { StatusFilter } from "./status-filter";

const rowDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

// Full lead management screen: filter, table, and row-level CRUD.
export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = STATUS_ORDER.includes(status as LeadStatus)
    ? (status as LeadStatus)
    : null;

  const allLeads = await getLeads();
  const leads = activeStatus
    ? allLeads.filter((lead) => lead.status === activeStatus)
    : allLeads;

  const counts = STATUS_ORDER.reduce<Record<string, number>>((acc, s) => {
    acc[s] = allLeads.filter((lead) => lead.status === s).length;
    return acc;
  }, {});

  return (
    <>
      <SetPageTitle title="Leads" />
      <PageHeader
        title="Leads"
        description={`${allLeads.length} total in the pipeline`}
        action={<LeadForm />}
      />

      <StatusFilter active={activeStatus} counts={counts} total={allLeads.length} />

      <Card className="mt-3 overflow-hidden">
        {leads.length === 0 ? (
          <EmptyState
            icon={<Users size={17} strokeWidth={1.75} />}
            title={activeStatus ? "No leads in this stage" : "No leads yet"}
            description={
              activeStatus
                ? "Try a different status filter, or add a new lead."
                : "Add your first lead and it will appear here with status, priority score, and full detail."
            }
            action={<LeadForm />}
          />
        ) : (
          <div className="scroll-hidden overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-line bg-surface-muted border-b text-left">
                  {["Added", "Business", "Phone", "Category", "Source", "Value", "Status", "Score"].map(
                    (column) => (
                      <th
                        key={column}
                        className="text-ink-subtle px-3 py-2 text-[10px] font-semibold tracking-[0.06em] whitespace-nowrap uppercase first:pl-4"
                      >
                        {column}
                      </th>
                    )
                  )}
                  <th className="w-10 pr-3" />
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-line hover:bg-surface-muted border-b text-[12.5px] transition-colors last:border-b-0"
                  >
                    <td className="text-ink-muted py-2.5 pr-3 pl-4 whitespace-nowrap">
                      {rowDate.format(new Date(lead.created_at))}
                    </td>
                    <td className="text-ink px-3 py-2.5 font-medium">
                      {lead.business_name}
                    </td>
                    <td className="text-ink-muted tabular px-3 py-2.5 whitespace-nowrap">
                      {lead.phone ?? "—"}
                    </td>
                    <td className="text-ink-muted px-3 py-2.5">
                      {lead.category ?? "—"}
                    </td>
                    <td className="text-ink-muted px-3 py-2.5">
                      {lead.source ?? "—"}
                    </td>
                    <td className="text-ink tabular px-3 py-2.5 whitespace-nowrap">
                      {lead.estimated_value
                        ? `$${lead.estimated_value.toLocaleString()}`
                        : "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="text-ink tabular px-3 py-2.5 font-medium">
                      {lead.priority_score}
                    </td>
                    <td className="py-2.5 pr-3">
                      <LeadActions lead={lead} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
