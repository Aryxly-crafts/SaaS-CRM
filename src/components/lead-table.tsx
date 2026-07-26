import { Users, Plus } from "lucide-react";
import Link from "next/link";
import { getLeads } from "@/lib/dashboard-data";
import { LeadRow } from "./lead-row";
import { TableTabs } from "./table-tabs";

const COLUMNS = [
  "Date",
  "Business Name",
  "Phone",
  "Category",
  "Status",
  "Priority",
];

// The core dashboard table, styled after the reference's Lead Quality panel.
export async function LeadTable() {
  const leads = await getLeads();

  return (
    <section className="border-line overflow-hidden rounded-[16px] border">
      <TableTabs count={leads.length} />

      {leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2.5 px-6 py-14 text-center">
          <span className="bg-surface-muted border-line flex h-10 w-10 items-center justify-center rounded-full border">
            <Users size={17} className="text-ink-subtle" strokeWidth={1.75} />
          </span>
          <p className="text-ink text-[13px] font-medium">No leads yet</p>
          <p className="text-ink-muted max-w-[280px] text-[12px] leading-relaxed">
            Add your first lead and it will appear here with status, priority
            score, and expandable detail.
          </p>
          <Link
            href="/leads"
            className="bg-accent hover:bg-accent-hover mt-1 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium text-white transition-colors"
          >
            <Plus size={13} strokeWidth={2.25} />
            Add your first lead
          </Link>
        </div>
      ) : (
        <div className="scroll-hidden overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-line bg-surface-muted border-b text-left">
                {COLUMNS.map((column) => (
                  <th
                    key={column}
                    className="text-ink-subtle px-3 py-2 text-[10px] font-semibold tracking-[0.06em] uppercase first:pr-3 first:pl-4"
                  >
                    {column}
                  </th>
                ))}
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <LeadRow key={lead.id} lead={lead} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
