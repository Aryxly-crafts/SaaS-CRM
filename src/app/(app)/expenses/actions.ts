"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { EntryType, ExpenseCategory } from "@/lib/records";
import { getWorkspaceContext } from "@/lib/workspace";

// Reads an optional text field, treating blank input as null.
function text(form: FormData, key: string): string | null {
  const value = form.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

// Revalidates every screen whose numbers depend on expenses.
function revalidateExpenseViews() {
  revalidatePath("/expenses");
  revalidatePath("/");
}

// Builds the expense column values shared by create and update.
function expenseFields(form: FormData) {
  const rawAmount = text(form, "amount");
  const amount = Number((rawAmount ?? "").replace(/,/g, ""));

  return {
    title: text(form, "title") ?? "",
    amount,
    category: (text(form, "category") ?? "miscellaneous") as ExpenseCategory,
    entry_type: (text(form, "entry_type") ?? "expense") as EntryType,
    project_id: text(form, "project_id"),
    date: text(form, "date") ?? new Date().toISOString().slice(0, 10),
    notes: text(form, "notes"),
  };
}

// Creates a new expense entry scoped to the active workspace.
export async function createExpense(form: FormData) {
  const fields = expenseFields(form);
  if (!fields.title) throw new Error("Enter a title for this expense");
  if (!Number.isFinite(fields.amount) || fields.amount <= 0) {
    throw new Error("Enter an amount greater than zero");
  }

  const ctx = await getWorkspaceContext();
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").insert({
    ...fields,
    user_id: ctx.userId,
    workspace_type: ctx.mode,
  });
  if (error) throw error;

  revalidateExpenseViews();
}

// Updates an existing expense entry.
export async function updateExpense(form: FormData) {
  const id = form.get("id");
  if (typeof id !== "string") throw new Error("Missing expense id");

  const fields = expenseFields(form);
  if (!fields.title) throw new Error("Enter a title for this expense");
  if (!Number.isFinite(fields.amount) || fields.amount <= 0) {
    throw new Error("Enter an amount greater than zero");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("expenses").update(fields).eq("id", id);
  if (error) throw error;

  revalidateExpenseViews();
}

// Deletes an expense entry.
export async function deleteExpense(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;

  revalidateExpenseViews();
}
