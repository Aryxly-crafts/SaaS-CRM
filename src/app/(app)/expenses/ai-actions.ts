"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/workspace";

// Forces AI financial insights cache eviction and triggers a re-analysis.
export async function refreshAIInsights() {
  const ctx = await getWorkspaceContext();
  const supabase = await createClient();

  let query = supabase.from("ai_insights").delete().eq("workspace_type", ctx.mode);
  if (ctx.mode === "personal" && ctx.userId) {
    query = query.eq("user_id", ctx.userId);
  }
  await query;

  revalidatePath("/expenses");
}
