import { Users } from "lucide-react";
import { getLeads } from "@/lib/dashboard-data";
import { LeadRow } from "./lead-row";

// Fetches and renders all leads in the core dashboard table, or an empty state.
export async function LeadTable() {
  const leads = await getLeads();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-sm font-semibold text-slate-900">Lead Quality</h2>
      </div>

      {leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Users size={22} className="text-slate-400" strokeWidth={1.75} />
          </div>
          <p className="text-sm font-medium text-slate-900">No leads yet</p>
          <p className="max-w-xs text-sm text-slate-500">
            Leads you add will show up here with status, priority score, and
            full details.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium text-slate-500">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Business Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority Score</th>
                <th className="px-4 py-3" />
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
    </div>
  );
}
