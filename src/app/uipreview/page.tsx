// TEMPORARY visual-check route. Deleted before commit.
import { PageTitleProvider } from "../(app)/page-title-context";
import { TopBar } from "../(app)/top-bar";
import { Sidebar } from "../(app)/sidebar";
import { StatCard } from "@/components/stat-card";
import { TrendsChart } from "@/components/trends-chart";
import { TableTabs } from "@/components/table-tabs";
import { LeadRow } from "@/components/lead-row";
import type { Lead } from "@/lib/leads";
import type { TrendPoint } from "@/lib/dashboard-data";
import { STATUS_STYLES } from "@/lib/leads";
import { MoreHorizontal } from "lucide-react";

const SAMPLE: Lead[] = [
  { id: "1", business_name: "Designhub", category: "UI/UX Design", phone: "+91 98765 43210", address: "Bengaluru", status: "negotiating", notes: "Sent proposal Aug 3. Waiting on their design lead.", source: "Referral", priority_score: 85, estimated_value: 150000, created_at: new Date(Date.now() - 3 * 864e5).toISOString() },
  { id: "2", business_name: "Innovate.co", category: "Web Development", phone: "+91 90000 11111", address: "Hyderabad", status: "interested", notes: null, source: "Cold call", priority_score: 62, estimated_value: 60000, created_at: new Date(Date.now() - 1 * 864e5).toISOString() },
  { id: "3", business_name: "Webmail", category: "Branding", phone: "+91 91234 56789", address: "Chennai", status: "won", notes: null, source: "Walk-in", priority_score: 90, estimated_value: 220000, created_at: new Date(Date.now() - 6 * 864e5).toISOString() },
  { id: "4", business_name: "Proton Labs", category: "Web Development", phone: null, address: null, status: "cold", notes: null, source: null, priority_score: 20, estimated_value: null, created_at: new Date(Date.now() - 12 * 864e5).toISOString() },
];

const points: TrendPoint[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  return { date: d.toISOString().slice(0, 10), revenue: Math.round(40 + 30 * Math.sin(i / 3) + i * 1.5), leadsWon: Math.round(20 + 14 * Math.cos(i / 4) + i * 0.6) };
});

const stats = [
  { label: "Active Leads", value: 34, delta: { value: "+5%", direction: "up" as const } },
  { label: "Won This Month", value: 8, delta: { value: "+3%", direction: "up" as const } },
  { label: "Revenue Collected", value: "$88,400", delta: { value: "-2%", direction: "down" as const } },
  { label: "Pending Payments", value: "$12,500", delta: { value: "+9%", direction: "up" as const } },
  { label: "Overdue Projects", value: 2, delta: { value: "-0.2", direction: "down" as const } },
];

const pipeline = [
  { status: "cold" as const, count: 12 },
  { status: "contacted" as const, count: 9 },
  { status: "interested" as const, count: 7 },
  { status: "negotiating" as const, count: 4 },
  { status: "won" as const, count: 8 },
  { status: "lost" as const, count: 3 },
];

export default function Preview() {
  const max = Math.max(...pipeline.map((p) => p.count));
  return (
    <PageTitleProvider>
      <div className="bg-surface flex h-screen overflow-hidden">
        <Sidebar userEmail="akshith@arylxy.com" />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar userEmail="akshith@arylxy.com" />
          <main className="scroll-hidden flex-1 overflow-y-auto px-6 py-5">
            <div className="flex flex-col gap-4 xl:flex-row">
              <div className="flex min-w-0 flex-1 flex-col gap-4">
                <div className="border-line grid grid-cols-2 gap-px overflow-hidden rounded-[16px] border bg-[var(--line)] sm:grid-cols-3 lg:grid-cols-5">
                  {stats.map((c, i) => (
                    <div key={c.label} className="bg-surface">
                      <StatCard {...c} index={i} />
                    </div>
                  ))}
                </div>

                <section className="border-line rounded-[16px] border p-4">
                  <div className="mb-1 flex items-center justify-between">
                    <h2 className="text-ink text-[13px] font-semibold">Trends</h2>
                    <span className="text-ink-subtle text-[11px]">Last 30 days</span>
                  </div>
                  <TrendsChart data={points} hasData />
                </section>

                <section className="border-line overflow-hidden rounded-[16px] border">
                  <TableTabs count={SAMPLE.length} />
                  <div className="scroll-hidden overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-line bg-surface-muted border-b text-left">
                          {["Date", "Business Name", "Phone", "Category", "Status", "Priority"].map((c) => (
                            <th key={c} className="text-ink-subtle px-3 py-2 text-[10px] font-semibold tracking-[0.06em] uppercase first:pr-3 first:pl-4">{c}</th>
                          ))}
                          <th className="w-8" />
                        </tr>
                      </thead>
                      <tbody>
                        {SAMPLE.map((l) => (<LeadRow key={l.id} lead={l} />))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              <aside className="flex w-[268px] flex-shrink-0 flex-col gap-4">
                <section className="border-line rounded-[16px] border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-ink text-[13px] font-semibold">Pipeline</h2>
                    <span className="text-ink-subtle text-[11px]">43 leads</span>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {pipeline.map((s) => (
                      <li key={s.status} className="flex items-center gap-2.5">
                        <span className={`w-[86px] flex-shrink-0 rounded-[5px] px-1.5 py-[3px] text-center text-[10px] font-semibold tracking-[0.04em] ${STATUS_STYLES[s.status].className}`}>
                          {STATUS_STYLES[s.status].label}
                        </span>
                        <span className="bg-line h-1.5 flex-1 overflow-hidden rounded-full">
                          <span className="bg-accent block h-full rounded-full" style={{ width: `${(s.count / max) * 100}%` }} />
                        </span>
                        <span className="text-ink tabular w-4 text-right text-[11.5px] font-medium">{s.count}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="border-line rounded-[16px] border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-ink text-[13px] font-semibold">Upcoming Deadlines</h2>
                    <MoreHorizontal size={14} className="text-ink-subtle" />
                  </div>
                  <ul className="flex flex-col gap-2.5">
                    {[["Designhub — brand kit", "Aug 12"], ["Innovate.co — site launch", "Aug 19"]].map(([t, d]) => (
                      <li key={t} className="flex items-start justify-between gap-2">
                        <span className="text-ink min-w-0 truncate text-[12px]">{t}</span>
                        <span className="text-ink-muted tabular flex-shrink-0 text-[11px]">{d}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="border-line rounded-[16px] border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-ink text-[13px] font-semibold">Recent Activity</h2>
                    <MoreHorizontal size={14} className="text-ink-subtle" />
                  </div>
                  <ul className="flex flex-col gap-3">
                    {[["Webmail moved to Won", "2 hours ago"], ["Innovate.co added as interested", "yesterday"]].map(([l, w]) => (
                      <li key={l} className="flex gap-2.5">
                        <span className="bg-accent mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                        <div className="min-w-0">
                          <p className="text-ink truncate text-[12px]">{l}</p>
                          <p className="text-ink-subtle text-[11px]">{w}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              </aside>
            </div>
          </main>
        </div>
      </div>
    </PageTitleProvider>
  );
}
