import { HeaderSkeleton, TableSkeleton } from "@/components/skeleton";

// Shown instantly on navigation while the project list loads.
export default function ProjectsLoading() {
  return (
    <>
      <HeaderSkeleton />
      <TableSkeleton columns={7} rows={5} />
    </>
  );
}
