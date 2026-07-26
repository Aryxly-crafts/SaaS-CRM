import { HeaderSkeleton, TableSkeleton } from "@/components/skeleton";

// Shown instantly on navigation while the document library loads.
export default function DocumentsLoading() {
  return (
    <>
      <HeaderSkeleton />
      <TableSkeleton columns={4} rows={5} />
    </>
  );
}
