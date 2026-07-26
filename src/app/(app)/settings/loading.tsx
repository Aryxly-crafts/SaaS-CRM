import { HeaderSkeleton, Skeleton } from "@/components/skeleton";

// Shown instantly on navigation while account details load.
export default function SettingsLoading() {
  return (
    <>
      <HeaderSkeleton />
      <div className="flex max-w-[560px] flex-col gap-4">
        {Array.from({ length: 3 }).map((_, card) => (
          <div key={card} className="border-line rounded-[16px] border">
            <div className="border-line border-b px-4 py-3">
              <Skeleton className="h-3 w-24" />
            </div>
            {Array.from({ length: 3 }).map((_, row) => (
              <div
                key={row}
                className="border-line flex justify-between border-b px-4 py-3 last:border-b-0"
              >
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-36" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
