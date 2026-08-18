// Skeleton loader for the today's calls page.
export default function TodayLoading() {
  return (
    <div className="animate-pulse">
      <div className="bg-surface-muted h-7 w-44 rounded-lg" />
      <div className="bg-surface-muted mt-2 h-4 w-60 rounded" />
      <div className="border-line mt-6 h-32 rounded-[14px] border" />
      <div className="mt-4 flex flex-col gap-2">
        <div className="border-line h-[74px] rounded-[12px] border" />
        <div className="border-line h-[74px] rounded-[12px] border" />
        <div className="border-line h-[74px] rounded-[12px] border" />
      </div>
    </div>
  );
}
