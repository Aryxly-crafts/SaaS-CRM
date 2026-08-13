import { createClient } from "@/lib/supabase/server";
import { STATUS_ORDER, type Lead, type LeadStatus } from "@/lib/leads";
import { getWorkspaceContext, applyWorkspaceFilter } from "@/lib/workspace";

export interface DashboardStats {
  activeLeads: number;
  wonThisMonth: number;
  revenueCollected: number;
  pendingPayments: number;
  overdueProjects: number;
}

const ACTIVE_STATUSES: LeadStatus[] = [
  "cold",
  "contacted",
  "interested",
  "negotiating",
];

// Fetches the 5 dashboard stat-card values from Supabase scoped to active workspace.
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const ctx = await getWorkspaceContext();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const today = new Date().toISOString().slice(0, 10);

  let activeLeadsQuery = supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .in("status", ACTIVE_STATUSES);
  activeLeadsQuery = applyWorkspaceFilter(activeLeadsQuery, ctx);

  let wonThisMonthQuery = supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("status", "won")
    .gte("created_at", startOfMonth.toISOString());
  wonThisMonthQuery = applyWorkspaceFilter(wonThisMonthQuery, ctx);

  let paymentsQuery = supabase.from("payments").select("amount");
  paymentsQuery = applyWorkspaceFilter(paymentsQuery, ctx);

  let projectsQuery = supabase
    .from("projects")
    .select("total_value, advance_amount, final_amount, deadline, status");
  projectsQuery = applyWorkspaceFilter(projectsQuery, ctx);

  const [activeLeads, wonThisMonth, payments, projects] = await Promise.all([
    activeLeadsQuery,
    wonThisMonthQuery,
    paymentsQuery,
    projectsQuery,
  ]);

  const revenueCollected = (payments.data ?? []).reduce(
    (sum, row) => sum + Number(row.amount ?? 0),
    0
  );

  // Anything contracted but not yet received counts as pending.
  const contracted = (projects.data ?? []).reduce((sum, row) => {
    const total =
      row.total_value ??
      Number(row.advance_amount ?? 0) + Number(row.final_amount ?? 0);
    return sum + Number(total ?? 0);
  }, 0);

  const overdueProjects = (projects.data ?? []).filter(
    (row) =>
      row.status !== "completed" && row.deadline && row.deadline < today
  ).length;

  return {
    activeLeads: activeLeads.count ?? 0,
    wonThisMonth: wonThisMonth.count ?? 0,
    revenueCollected,
    pendingPayments: Math.max(contracted - revenueCollected, 0),
    overdueProjects,
  };
}

// Fetches all leads for the dashboard table, newest first, scoped to active workspace.
export async function getLeads(): Promise<Lead[]> {
  const supabase = await createClient();
  const ctx = await getWorkspaceContext();

  let query = supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  query = applyWorkspaceFilter(query, ctx);

  const { data, error } = await query;

  if (error) {
    console.error("getLeads query error:", error.message);
    return [];
  }
  return (data ?? []) as Lead[];
}

export interface TrendPoint {
  date: string;
  revenue: number;
  leadsWon: number;
}

const TREND_WINDOW_DAYS = 30;

// Builds a continuous day-by-day series for the last 30 days for the active workspace.
export async function getTrendData(): Promise<{
  points: TrendPoint[];
  hasData: boolean;
}> {
  const supabase = await createClient();
  const ctx = await getWorkspaceContext();

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (TREND_WINDOW_DAYS - 1));

  let wonLeadsQuery = supabase
    .from("leads")
    .select("created_at")
    .eq("status", "won")
    .gte("created_at", start.toISOString());
  wonLeadsQuery = applyWorkspaceFilter(wonLeadsQuery, ctx);

  let paymentRowsQuery = supabase
    .from("payments")
    .select("amount, paid_date")
    .not("paid_date", "is", null)
    .gte("paid_date", start.toISOString().slice(0, 10));
  paymentRowsQuery = applyWorkspaceFilter(paymentRowsQuery, ctx);

  const [wonLeads, paymentRows] = await Promise.all([
    wonLeadsQuery,
    paymentRowsQuery,
  ]);

  if (wonLeads.error) {
    console.error("getTrendData wonLeads query error:", wonLeads.error.message);
  }
  if (paymentRows.error) {
    console.error("getTrendData paymentRows query error:", paymentRows.error.message);
  }

  const wonByDate = new Map<string, number>();
  for (const row of wonLeads.data ?? []) {
    const day = row.created_at.slice(0, 10);
    wonByDate.set(day, (wonByDate.get(day) ?? 0) + 1);
  }

  const revenueByDate = new Map<string, number>();
  for (const row of paymentRows.data ?? []) {
    const day = row.paid_date as string;
    revenueByDate.set(day, (revenueByDate.get(day) ?? 0) + Number(row.amount));
  }

  const points: TrendPoint[] = [];
  for (let i = 0; i < TREND_WINDOW_DAYS; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const key = day.toISOString().slice(0, 10);
    points.push({
      date: key,
      revenue: revenueByDate.get(key) ?? 0,
      leadsWon: wonByDate.get(key) ?? 0,
    });
  }

  return {
    points,
    hasData: wonByDate.size > 0 || revenueByDate.size > 0,
  };
}

export interface PipelineStage {
  status: LeadStatus;
  count: number;
}

// Counts leads per status for active workspace.
export async function getPipelineBreakdown(): Promise<PipelineStage[]> {
  const supabase = await createClient();
  const ctx = await getWorkspaceContext();

  let query = supabase.from("leads").select("status");
  query = applyWorkspaceFilter(query, ctx);

  const { data, error } = await query;
  if (error) {
    console.error("getPipelineBreakdown query error:", error.message);
    return STATUS_ORDER.map((status) => ({ status, count: 0 }));
  }

  const counts = new Map<LeadStatus, number>();
  for (const row of data ?? []) {
    const status = row.status as LeadStatus;
    counts.set(status, (counts.get(status) ?? 0) + 1);
  }

  return STATUS_ORDER.map((status) => ({
    status,
    count: counts.get(status) ?? 0,
  }));
}

export interface DeadlineItem {
  id: string;
  title: string;
  due: string;
}

const deadlineFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

// The next five project deadlines for active workspace.
export async function getUpcomingDeadlines(): Promise<DeadlineItem[]> {
  const supabase = await createClient();
  const ctx = await getWorkspaceContext();
  const today = new Date().toISOString().slice(0, 10);

  let query = supabase
    .from("projects")
    .select("id, title, deadline, clients(legal_name)")
    .neq("status", "completed")
    .not("deadline", "is", null)
    .gte("deadline", today)
    .order("deadline", { ascending: true })
    .limit(5);
  query = applyWorkspaceFilter(query, ctx);

  const { data, error } = await query;

  if (error) {
    console.error("getUpcomingDeadlines query error:", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const relation = row.clients as unknown;
    const client = (
      Array.isArray(relation) ? relation[0] : relation
    ) as { legal_name: string } | null | undefined;

    return {
      id: row.id as string,
      title: client ? `${client.legal_name} — ${row.title}` : (row.title as string),
      due: deadlineFormat.format(new Date(row.deadline as string)),
    };
  });
}

export interface ActivityItem {
  id: string;
  label: string;
  when: string;
}

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

// Turns a timestamp into a short relative label like "2 days ago".
function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (Math.abs(minutes) < 60) return relative.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relative.format(-hours, "hour");
  return relative.format(-Math.round(hours / 24), "day");
}

// Most recently created leads for active workspace.
export async function getRecentActivity(): Promise<ActivityItem[]> {
  const supabase = await createClient();
  const ctx = await getWorkspaceContext();

  let query = supabase
    .from("leads")
    .select("id, business_name, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);
  query = applyWorkspaceFilter(query, ctx);

  const { data, error } = await query;

  if (error) {
    console.error("getRecentActivity query error:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    label: `${row.business_name} added as ${row.status}`,
    when: timeAgo(row.created_at as string),
  }));
}
