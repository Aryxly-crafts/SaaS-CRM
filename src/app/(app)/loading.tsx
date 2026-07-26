import { Skeleton, TableSkeleton } from "@/components/skeleton";

// Shown instantly while the dashboard's stats, chart, and leads load.
export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-4 xl:flex-row">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="border-line bg-line grid grid-cols-2 gap-px overflow-hidden rounded-[16px] border sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-surface flex flex-col gap-2 px-4 py-3.5">
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>

        <div className="border-line rounded-[16px] border p-4">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-2.5 w-20" />
          </div>
          <Skeleton className="h-[208px] w-full rounded-lg" />
        </div>

        <TableSkeleton columns={6} rows={5} />
      </div>

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
    </div>
  );
}
