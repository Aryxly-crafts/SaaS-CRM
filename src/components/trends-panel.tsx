import { getTrendData } from "@/lib/dashboard-data";
import { TrendsChart } from "./trends-chart";

// Trends card — revenue and leads-won over the last 30 days.
export async function TrendsPanel() {
  const { points, hasData } = await getTrendData();

  return (
    <section className="border-line rounded-[16px] border p-4">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-ink text-[13px] font-semibold">Trends</h2>
        <span className="text-ink-subtle text-[11px]">Last 30 days</span>
      </div>
      <TrendsChart data={points} hasData={hasData} />
    </section>
  );
}
