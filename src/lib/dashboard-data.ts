import { createClient } from "@/lib/supabase/server";
import { STATUS_ORDER, type Lead, type LeadStatus } from "@/lib/leads";

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

// Fetches the 5 dashboard stat-card values from Supabase. Payments/projects
// tables don't exist yet, so those two stats are 0 until that slice lands.
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const { count: activeLeads } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .in("status", ACTIVE_STATUSES);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: wonThisMonth } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("status", "won")
    .gte("created_at", startOfMonth.toISOString());

  return {
    activeLeads: activeLeads ?? 0,
    wonThisMonth: wonThisMonth ?? 0,
    revenueCollected: 0,
    pendingPayments: 0,
    overdueProjects: 0,
  };
}

// Fetches all leads for the dashboard table, newest first.
export async function getLeads(): Promise<Lead[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Lead[];
}

export interface TrendPoint {
  date: string;
  revenue: number;
  leadsWon: number;
}

const TREND_WINDOW_DAYS = 30;

// Builds a continuous day-by-day series for the last 30 days so the chart
// always has a real axis, filling gaps with zeroes.
export async function getTrendData(): Promise<{
  points: TrendPoint[];
  hasData: boolean;
}> {
  const supabase = await createClient();

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (TREND_WINDOW_DAYS - 1));

  const { data, error } = await supabase
    .from("leads")
    .select("created_at")
    .eq("status", "won")
    .gte("created_at", start.toISOString());

  if (error) throw error;

  const wonByDate = new Map<string, number>();
  for (const row of data ?? []) {
    const day = row.created_at.slice(0, 10);
    wonByDate.set(day, (wonByDate.get(day) ?? 0) + 1);
  }

  const points: TrendPoint[] = [];
  for (let i = 0; i < TREND_WINDOW_DAYS; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const key = day.toISOString().slice(0, 10);
    points.push({
      date: key,
      revenue: 0,
      leadsWon: wonByDate.get(key) ?? 0,
    });
  }

  return { points, hasData: wonByDate.size > 0 };
}

export interface PipelineStage {
  status: LeadStatus;
  count: number;
}

// Counts leads per status so the pipeline panel can show a breakdown bar.
export async function getPipelineBreakdown(): Promise<PipelineStage[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("leads").select("status");
  if (error) throw error;

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

// Upcoming project deadlines. Returns empty until the projects table exists.
export async function getUpcomingDeadlines(): Promise<DeadlineItem[]> {
  return [];
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

// Most recently created leads, shown as the activity feed.
export async function getRecentActivity(): Promise<ActivityItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leads")
    .select("id, business_name, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id as string,
    label: `${row.business_name} added as ${row.status}`,
    when: timeAgo(row.created_at as string),
  }));
}
