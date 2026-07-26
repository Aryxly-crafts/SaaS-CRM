import { SetPageTitle } from "./page-title-context";
import { StatCardRow } from "@/components/stat-card-row";
import { TrendsPanel } from "@/components/trends-panel";
import { LeadTable } from "@/components/lead-table";
import { RightPanel } from "@/components/right-panel";

// Dashboard: metrics strip, trends, lead table, and the right-hand panels.
export default function DashboardPage() {
  return (
    <>
      <SetPageTitle title="Overview" />
      <div className="flex flex-col gap-4 xl:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <StatCardRow />
          <TrendsPanel />
          <LeadTable />
        </div>
        <RightPanel />
      </div>
    </>
  );
}
