import { createClient } from "@/lib/supabase/server";
import type { Lead, LeadStatus } from "@/lib/leads";

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

// Fetches revenue/leads-won trend data for the last 30 days. Revenue is
// always 0 until the payments table exists in a later slice.
export async function getTrendData(): Promise<TrendPoint[]> {
  const supabase = await createClient();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await supabase
    .from("leads")
    .select("created_at, status")
    .eq("status", "won")
    .gte("created_at", thirtyDaysAgo.toISOString());

  if (error) throw error;

  const byDate = new Map<string, number>();
  for (const row of data ?? []) {
    const day = row.created_at.slice(0, 10);
    byDate.set(day, (byDate.get(day) ?? 0) + 1);
  }

  return Array.from(byDate.entries())
    .map(([date, leadsWon]) => ({ date, revenue: 0, leadsWon }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
