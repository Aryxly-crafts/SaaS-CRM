"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CallOutcome = { ok: true } | { ok: false; error: string };

// Marks a lead as called: moves it out of the queue and stamps the day's count.
// Only cold leads are advanced, so re-clicking never drags a negotiating lead
// backwards to 'contacted'.
export async function markContacted(id: string): Promise<CallOutcome> {
  if (!id) return { ok: false, error: "Missing lead id." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ status: "contacted", contacted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "cold");

  if (error) return { ok: false, error: error.message };

  revalidatePath("/today");
  revalidatePath("/leads");
  revalidatePath("/");
  return { ok: true };
}

// Puts a lead back in the queue when a call is logged by mistake.
export async function undoContacted(id: string): Promise<CallOutcome> {
  if (!id) return { ok: false, error: "Missing lead id." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ status: "cold", contacted_at: null })
    .eq("id", id)
    .eq("status", "contacted");

  if (error) return { ok: false, error: error.message };

  revalidatePath("/today");
  revalidatePath("/leads");
  revalidatePath("/");
  return { ok: true };
}
