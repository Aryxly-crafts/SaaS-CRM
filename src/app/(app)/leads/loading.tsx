import { HeaderSkeleton, Skeleton, TableSkeleton } from "@/components/skeleton";

// Shown instantly on navigation while the lead list loads.
export default function LeadsLoading() {
  return (
    <>
      <HeaderSkeleton />
      <div className="mb-3 flex gap-1.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-20 rounded-full" />
        ))}
      </div>
      <TableSkeleton columns={8} rows={6} />
    </>
  );
}
