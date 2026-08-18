import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { WorkspaceType } from "@/lib/leads";

export interface WorkspaceContext {
  mode: WorkspaceType;
  userId: string | null;
}

// Retrieves active workspace mode ("personal" | "team") and user id, memoized per request.
export const getWorkspaceContext = cache(async (): Promise<WorkspaceContext> => {
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
});

interface QueryFilter {
  eq(column: string, value: unknown): QueryFilter;
}

// Applies workspace scope filter to a Supabase query builder.
export function applyWorkspaceFilter<T>(query: T, ctx: WorkspaceContext): T {
  const q = query as unknown as QueryFilter;
  if (ctx.mode === "personal") {
    if (!ctx.userId) {
      return q.eq("workspace_type", "personal").eq("user_id", "00000000-0000-0000-0000-000000000000") as unknown as T;
    }
    return q.eq("workspace_type", "personal").eq("user_id", ctx.userId) as unknown as T;
  }
  return q.eq("workspace_type", "team") as unknown as T;
}
