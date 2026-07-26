import { getDashboardStats } from "@/lib/dashboard-data";
import { StatCard } from "./stat-card";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

// Top metrics strip — mirrors the reference's Traffic/ROI/Conversions row.
export async function StatCardRow() {
  const stats = await getDashboardStats();

  const cards = [
    { label: "Active Leads", value: stats.activeLeads },
    { label: "Won This Month", value: stats.wonThisMonth },
    { label: "Revenue Collected", value: currency.format(stats.revenueCollected) },
    { label: "Pending Payments", value: currency.format(stats.pendingPayments) },
    { label: "Overdue Projects", value: stats.overdueProjects },
  ];

  return (
    <div className="border-line grid grid-cols-2 gap-px overflow-hidden rounded-[16px] border bg-[var(--line)] sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card, index) => (
        <div key={card.label} className="bg-surface">
          <StatCard {...card} index={index} />
        </div>
      ))}
    </div>
  );
}
