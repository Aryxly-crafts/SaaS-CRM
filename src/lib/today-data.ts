import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext, applyWorkspaceFilter } from "@/lib/workspace";
import type { Lead } from "@/lib/leads";

/**
 * How many calls count as a finished day. A constant rather than a setting:
 * there are two founders, and a number you can edit is a number you negotiate
 * with on a bad morning.
 */
export const DAILY_CALL_TARGET = 10;

/** Leads shown at once, so a large backlog never becomes an unreadable wall. */
const QUEUE_LIMIT = 25;

export interface TodaysCalls {
  /** Uncalled leads, oldest first, so a carried-over lead surfaces before a fresh one. */
  queue: Lead[];
  /** Calls actually made since midnight. */
  doneToday: number;
  /** Total uncalled leads, which may exceed what the queue shows. */
  remaining: number;
  target: number;
}

// Local midnight as an ISO timestamp, so "today" means the founder's today rather than UTC's.
function startOfToday(): string {
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  return midnight.toISOString();
}

// Loads the day's call list: who is still to be called, and how many are done.
export async function getTodaysCalls(): Promise<TodaysCalls> {
  const supabase = await createClient();
  const ctx = await getWorkspaceContext();
  const since = startOfToday();

  // Oldest first: a lead sitting uncalled for three days should be the next call,
  // not buried under this morning's fresh scrape.
  let queueQuery = supabase
    .from("leads")
    .select("*")
    .eq("status", "cold")
    .order("created_at", { ascending: true })
    .limit(QUEUE_LIMIT);
  queueQuery = applyWorkspaceFilter(queueQuery, ctx);

  let remainingQuery = supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("status", "cold");
  remainingQuery = applyWorkspaceFilter(remainingQuery, ctx);

  let doneQuery = supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .gte("contacted_at", since);
  doneQuery = applyWorkspaceFilter(doneQuery, ctx);

  const [queue, remaining, done] = await Promise.all([queueQuery, remainingQuery, doneQuery]);

  return {
    queue: (queue.data as Lead[]) ?? [],
    remaining: remaining.count ?? 0,
    doneToday: done.count ?? 0,
    target: DAILY_CALL_TARGET,
  };
}
