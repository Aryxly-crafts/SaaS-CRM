import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { WorkspaceType } from "@/lib/leads";

export interface WorkspaceContext {
  mode: WorkspaceType;
  userId: string | null;
}

// Retrieves the active workspace mode ("personal" | "team") and current user id.
export async function getWorkspaceContext(): Promise<WorkspaceContext> {
  const cookieStore = await cookies();
  const modeCookie = cookieStore.get("workspace_mode")?.value;
  const mode: WorkspaceType = modeCookie === "personal" ? "personal" : "team";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    mode,
    userId: user?.id ?? null,
  };
}

// Applies workspace scope filter to a Supabase query builder.
export function applyWorkspaceFilter<T>(query: T, ctx: WorkspaceContext): T {
  const q = query as any;
  if (ctx.mode === "personal") {
    if (ctx.userId) {
      return q.eq("workspace_type", "personal").eq("user_id", ctx.userId);
    }
    return q.eq("workspace_type", "personal");
  }
  return q.eq("workspace_type", "team");
}
