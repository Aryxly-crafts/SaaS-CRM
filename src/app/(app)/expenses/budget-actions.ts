"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/workspace";
import type { BudgetPeriod, BudgetScope, ExpenseCategory } from "@/lib/records";

// Reads an optional text field, treating blank input as null.
function text(form: FormData, key: string): string | null {
  const value = form.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

// Revalidates screens whose financial calculations depend on budgets.
function revalidateBudgetViews() {
  revalidatePath("/expenses");
  revalidatePath("/");
}

// Saves or updates a project budget, category limit, or personal savings goal.
export async function saveBudget(form: FormData) {
  const id = text(form, "id");
  const scope = (text(form, "scope") ?? "category") as BudgetScope;
  const projectId = text(form, "project_id");
  const category = text(form, "category") as ExpenseCategory | null;
  const rawAmount = text(form, "amount");
  const amount = Number((rawAmount ?? "").replace(/,/g, ""));
  const period = (text(form, "period") ?? "monthly") as BudgetPeriod;
  const notes = text(form, "notes");

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Enter a valid positive budget amount");
  }

  const ctx = await getWorkspaceContext();
  const supabase = await createClient();

  const payload = {
    scope,
    project_id: scope === "project" ? projectId : null,
    category: scope === "category" ? category : null,
    amount,
    period,
    notes,
    user_id: ctx.userId,
    workspace_type: ctx.mode,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    let query = supabase.from("budgets").update(payload).eq("id", id).eq("workspace_type", ctx.mode);
    if (ctx.mode === "personal" && ctx.userId) query = query.eq("user_id", ctx.userId);
    const { error } = await query;
    if (error) throw error;
  } else {
    // Check if an existing budget matches scope to update instead of duplicate
    let existingQuery = supabase
      .from("budgets")
      .select("id")
      .eq("scope", scope)
      .eq("workspace_type", ctx.mode);
    if (scope === "project" && projectId) existingQuery = existingQuery.eq("project_id", projectId);
    if (scope === "category" && category) existingQuery = existingQuery.eq("category", category);
    if (ctx.mode === "personal" && ctx.userId) existingQuery = existingQuery.eq("user_id", ctx.userId);

    const { data: existing } = await existingQuery.maybeSingle();

    if (existing?.id) {
      const { error } = await supabase.from("budgets").update(payload).eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("budgets").insert(payload);
      if (error) throw error;
    }
  }

  revalidateBudgetViews();
}

// Removes a budget record permanently.
export async function deleteBudget(id: string) {
  const ctx = await getWorkspaceContext();
  const supabase = await createClient();

  let query = supabase.from("budgets").delete().eq("id", id).eq("workspace_type", ctx.mode);
  if (ctx.mode === "personal" && ctx.userId) {
    query = query.eq("user_id", ctx.userId);
  }
  const { error } = await query;
  if (error) throw error;

  revalidateBudgetViews();
}
