"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ProjectStatus } from "@/lib/records";
import { WorkspaceType } from "@/lib/leads";
import { getWorkspaceContext } from "@/lib/workspace";

// Reads an optional text field, treating blank input as null.
function text(form: FormData, key: string): string | null {
  const value = form.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

// Reads an optional numeric field, ignoring blank or invalid input.
function number(form: FormData, key: string): number | null {
  const raw = text(form, key);
  if (raw === null) return null;
  const parsed = Number(raw.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

// Builds the project column values shared by create and update.
function projectFields(form: FormData) {
  return {
    client_id: text(form, "client_id") ?? "",
    title: (text(form, "title") ?? "").trim(),
    total_value: number(form, "total_value"),
    advance_amount: number(form, "advance_amount"),
    advance_paid: form.get("advance_paid") === "on",
    final_amount: number(form, "final_amount"),
    final_paid: form.get("final_paid") === "on",
    start_date: text(form, "start_date"),
    deadline: text(form, "deadline"),
    status: (text(form, "status") ?? "active") as ProjectStatus,
  };
}

// Revalidates every screen whose numbers depend on projects.
function revalidateProjectViews() {
  revalidatePath("/projects");
  revalidatePath("/payments");
  revalidatePath("/documents");
  revalidatePath("/");
}

// Creates a project for an existing client.
export async function createProject(form: FormData) {
  const fields = projectFields(form);
  if (!fields.client_id) throw new Error("Pick a client for this project");
  if (!fields.title) throw new Error("Project title is required");

  const ctx = await getWorkspaceContext();
  const supabase = await createClient();
  const { error } = await supabase.from("projects").insert({
    ...fields,
    user_id: ctx.userId,
    workspace_type: ctx.mode,
  });
  if (error) throw error;

  revalidateProjectViews();
}

// Updates an existing project scoped to active workspace.
export async function updateProject(form: FormData) {
  const id = form.get("id");
  if (typeof id !== "string") throw new Error("Missing project id");

  const fields = projectFields(form);
  if (!fields.client_id) throw new Error("Pick a client for this project");
  if (!fields.title) throw new Error("Project title is required");

  const ctx = await getWorkspaceContext();
  const supabase = await createClient();
  let query = supabase.from("projects").update(fields).eq("id", id).eq("workspace_type", ctx.mode);
  if (ctx.mode === "personal" && ctx.userId) {
    query = query.eq("user_id", ctx.userId);
  }
  const { error } = await query;
  if (error) throw error;

  revalidateProjectViews();
}

// Moves a project between personal and team workspace.
export async function toggleProjectWorkspace(id: string, workspace_type: WorkspaceType) {
  const ctx = await getWorkspaceContext();
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ workspace_type, user_id: ctx.userId })
    .eq("id", id);

  if (error) throw error;

  revalidateProjectViews();
}

// Deletes a project along with its payments and documents scoped to workspace.
export async function deleteProject(id: string) {
  const ctx = await getWorkspaceContext();
  const supabase = await createClient();
  let query = supabase.from("projects").delete().eq("id", id).eq("workspace_type", ctx.mode);
  if (ctx.mode === "personal" && ctx.userId) {
    query = query.eq("user_id", ctx.userId);
  }
  const { error } = await query;
  if (error) throw error;

  revalidateProjectViews();
}

// Creates a client directly, for work that didn't start as a lead.
export async function createClientRecord(form: FormData) {
  const legal_name = (text(form, "legal_name") ?? "").trim();
  if (!legal_name) throw new Error("Client name is required");

  const ctx = await getWorkspaceContext();
  const supabase = await createClient();
  const { error } = await supabase.from("clients").insert({
    legal_name,
    phone: text(form, "phone"),
    address: text(form, "address"),
    user_id: ctx.userId,
    workspace_type: ctx.mode,
  });
  if (error) throw error;

  revalidateProjectViews();
}
