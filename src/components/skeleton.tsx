// Shimmering placeholder block used while a route's data loads.
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-line/70 animate-pulse rounded-md ${className}`} />;
}

// Placeholder for a page header: title, subtitle, and action button.
export function HeaderSkeleton() {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-44" />
      </div>
      <Skeleton className="h-8 w-28" />
    </div>
  );
}

// Placeholder table with a header strip and a set of rows.
export function TableSkeleton({
  columns = 6,
  rows = 6,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <div className="border-line overflow-hidden rounded-[16px] border">
      <div className="border-line bg-surface-muted flex gap-4 border-b px-4 py-2.5">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-2.5 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="border-line flex items-center gap-4 border-b px-4 py-3 last:border-b-0"
          style={{ opacity: 1 - r * 0.1 }}
        >
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} className="h-3 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
