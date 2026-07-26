import { HeaderSkeleton, TableSkeleton } from "@/components/skeleton";

// Shown instantly on navigation while the payment ledger loads.
export default function PaymentsLoading() {
  return (
    <>
      <HeaderSkeleton />
      <TableSkeleton columns={4} rows={5} />
    </>
  );
}
