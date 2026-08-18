import { MoreHorizontal } from "lucide-react";
import { getPipelineBreakdown, getUpcomingDeadlines, getRecentActivity } from "@/lib/dashboard-data";
import { STATUS_STYLES, type LeadStatus } from "@/lib/leads";

// Bar colour per pipeline stage so the breakdown reads at a glance.
const STAGE_BAR_COLORS: Record<LeadStatus, string> = {
  cold: "#c6d1d7",
  contacted: "#7fa8e4",
  interested: "#2f7eda",
  negotiating: "#2569b9",
  won: "#3d7a5c",
  lost: "#c9a0a0",
};

// Card wrapper shared by every right-column panel.
function Panel({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-line bg-surface rounded-[12px] border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-ink text-[13px] font-semibold">{title}</h2>
        {meta ? (
          <span className="text-ink-subtle text-[11px]">{meta}</span>
        ) : (
          <MoreHorizontal size={14} className="text-ink-subtle" />
        )}
      </div>
      {children}
    </section>
  );
}

// Right column — pipeline breakdown, deadlines, and activity.
export async function RightPanel() {
  const [pipeline, deadlines, activity] = await Promise.all([
    getPipelineBreakdown(),
    getUpcomingDeadlines(),
    getRecentActivity(),
  ]);

  const maxCount = Math.max(...pipeline.map((s) => s.count), 1);

  return (
    <aside className="flex w-[268px] flex-shrink-0 flex-col gap-4">
      <Panel title="Pipeline" meta={`${pipeline.reduce((sum, s) => sum + s.count, 0)} leads`}>
        <ul className="flex flex-col gap-2">
          {pipeline.map((stage) => (
            <li key={stage.status} className="flex items-center gap-2.5">
              <span
                className={`w-[86px] flex-shrink-0 rounded-[5px] px-1.5 py-[3px] text-center text-[10px] font-semibold tracking-[0.04em] ${STATUS_STYLES[stage.status].className}`}
              >
                {STATUS_STYLES[stage.status].label}
              </span>
              <span className="bg-line h-1.5 flex-1 overflow-hidden rounded-full">
                <span
                  className="block h-full rounded-full transition-[width] duration-500"
                  style={{
                    width: `${(stage.count / maxCount) * 100}%`,
                    background: STAGE_BAR_COLORS[stage.status],
                  }}
                />
              </span>
              <span className="text-ink tabular w-4 text-right text-[11.5px] font-medium">
                {stage.count}
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Upcoming Deadlines">
        {deadlines.length === 0 ? (
          <p className="text-ink-subtle py-3 text-[12px]">
            No deadlines scheduled. They appear here once projects have due
            dates.
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {deadlines.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-2">
                <span className="text-ink min-w-0 truncate text-[12px]">
                  {item.title}
                </span>
                <span className="text-ink-muted tabular flex-shrink-0 text-[11px]">
                  {item.due}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Recent Activity">
        {activity.length === 0 ? (
          <p className="text-ink-subtle py-3 text-[12px]">
            Nothing yet. New leads and status changes show up here.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {activity.map((entry) => (
              <li key={entry.id} className="flex gap-2.5">
                <span className="bg-accent mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                <div className="min-w-0">
                  <p className="text-ink truncate text-[12px]">{entry.label}</p>
                  <p className="text-ink-subtle text-[11px]">{entry.when}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </aside>
  );
}
