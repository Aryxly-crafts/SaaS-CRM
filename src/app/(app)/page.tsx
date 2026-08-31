import { Suspense } from "react";
import { SetPageTitle } from "./page-title-context";
import { StatCardRow } from "@/components/stat-card-row";
import { TrendsPanel } from "@/components/trends-panel";
import { LeadTable } from "@/components/lead-table";
import { RightPanel } from "@/components/right-panel";
import { Skeleton, TableSkeleton } from "@/components/skeleton";

// Top metrics strip skeleton, matches StatCardRow's layout.
function StatCardRowSkeleton() {
  return (
    <div className="border-line bg-line grid grid-cols-2 gap-px overflow-hidden rounded-[16px] border sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-surface flex flex-col gap-2 px-4 py-3.5">
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}

// Trends chart skeleton, matches TrendsPanel's layout.
function TrendsPanelSkeleton() {
  return (
    <div className="border-line rounded-[16px] border p-4">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-2.5 w-20" />
      </div>
      <Skeleton className="h-[208px] w-full rounded-lg" />
    </div>
  );
}

// Right column skeleton, matches RightPanel's layout.
function RightPanelSkeleton() {
  return (
    <div className="flex w-[268px] flex-shrink-0 flex-col gap-4">
      {Array.from({ length: 3 }).map((_, card) => (
        <div key={card} className="border-line rounded-[16px] border p-4">
          <Skeleton className="mb-3 h-3 w-24" />
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 4 }).map((_, row) => (
              <Skeleton key={row} className="h-3 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Dashboard: metrics strip, trends, lead table, and the right-hand panels.
// Each section streams in independently so a slow query only delays its own
// section instead of blocking the whole page from rendering.
export default function DashboardPage() {
  return (
    <>
      <SetPageTitle title="Overview" />
      <p className="text-ink-muted text-body-md mb-4">
        Here is what&apos;s happening with your agency today.
      </p>
      <div className="flex flex-col gap-4 xl:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Suspense fallback={<StatCardRowSkeleton />}>
            <StatCardRow />
          </Suspense>
          <Suspense fallback={<TrendsPanelSkeleton />}>
            <TrendsPanel />
          </Suspense>
          <Suspense fallback={<TableSkeleton columns={6} rows={5} />}>
            <LeadTable />
          </Suspense>
        </div>
        <Suspense fallback={<RightPanelSkeleton />}>
          <RightPanel />
        </Suspense>
      </div>
    </>
  );
}
