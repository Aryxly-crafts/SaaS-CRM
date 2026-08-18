"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { calculatePriorityScore, type LeadStatus, type WorkspaceType } from "@/lib/leads";
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

// Builds the lead column values shared by create and update.
function leadFields(form: FormData) {
  const status = (text(form, "status") ?? "cold") as LeadStatus;
  const phone = text(form, "phone");
  const estimated_value = number(form, "estimated_value");
  const created_at = text(form, "created_at") ?? new Date().toISOString();

  return {
    business_name: (text(form, "business_name") ?? "").trim(),
    category: text(form, "category"),
    phone,
    address: text(form, "address"),
    status,
    notes: text(form, "notes"),
    source: text(form, "source"),
    estimated_value,
    priority_score: calculatePriorityScore({
      phone,
      status,
      estimated_value,
      created_at,
    }),
  };
}

// Creates a lead from the new-lead form.
export async function createLead(form: FormData) {
  const fields = leadFields(form);
  if (!fields.business_name) throw new Error("Business name is required");

  const ctx = await getWorkspaceContext();
  const supabase = await createClient();
  let { error } = await supabase.from("leads").insert({
    ...fields,
    user_id: ctx.userId,
    workspace_type: ctx.mode,
  });

  // Fallback if workspace_type column is missing before SQL migration runs
  if (error && (error.code === "PGRST204" || error.message?.includes("workspace_type"))) {
    const res = await supabase.from("leads").insert(fields);
    error = res.error;
  }

  if (error) {
    if (error.code === "42501") {
      throw new Error(
        "Database security policy blocking access. Please run the SQL migration script in your Supabase SQL Editor."
      );
    }
    throw new Error(error.message || "Failed to create lead");
  }

  revalidatePath("/leads");
  revalidatePath("/");
}

// Updates an existing lead and recalculates its priority score scoped to active workspace.
export async function updateLead(form: FormData) {
  const id = form.get("id");
  if (typeof id !== "string") throw new Error("Missing lead id");

  const fields = leadFields(form);
  if (!fields.business_name) throw new Error("Business name is required");

  const ctx = await getWorkspaceContext();
  const supabase = await createClient();
  let query = supabase.from("leads").update(fields).eq("id", id).eq("workspace_type", ctx.mode);
  if (ctx.mode === "personal" && ctx.userId) {
    query = query.eq("user_id", ctx.userId);
  }
  const { error } = await query;
  if (error) {
    if (error.code === "42501") {
      throw new Error(
        "Database security policy blocking access. Please run the SQL migration script in your Supabase SQL Editor."
      );
    }
    throw new Error(error.message || "Failed to update lead");
  }

  revalidatePath("/leads");
  revalidatePath("/");
}

// Moves a lead between personal and team workspace.
export async function toggleLeadWorkspace(id: string, workspace_type: WorkspaceType) {
  const ctx = await getWorkspaceContext();
  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ workspace_type, user_id: ctx.userId })
    .eq("id", id);

  if (error) throw error;

  revalidatePath("/leads");
  revalidatePath("/");
}

// Moves a lead to a new pipeline status scoped to workspace.
export async function setLeadStatus(id: string, status: LeadStatus) {
  const ctx = await getWorkspaceContext();
  const supabase = await createClient();
  let query = supabase.from("leads").update({ status }).eq("id", id).eq("workspace_type", ctx.mode);
  if (ctx.mode === "personal" && ctx.userId) {
    query = query.eq("user_id", ctx.userId);
  }
  const { error } = await query;
  if (error) throw error;

  revalidatePath("/leads");
  revalidatePath("/");
}

// Deletes a lead permanently scoped to workspace.
export async function deleteLead(id: string) {
  const ctx = await getWorkspaceContext();
  const supabase = await createClient();
  let query = supabase.from("leads").delete().eq("id", id).eq("workspace_type", ctx.mode);
  if (ctx.mode === "personal" && ctx.userId) {
    query = query.eq("user_id", ctx.userId);
  }
  const { error } = await query;
  if (error) throw error;

  revalidatePath("/leads");
  revalidatePath("/");
}

// Converts a won lead into a client record, carrying over its details.
export async function convertLeadToClient(id: string) {
  const ctx = await getWorkspaceContext();
  const supabase = await createClient();

  const { data: lead, error: readError } = await supabase
    .from("leads")
    .select("id, business_name, phone, address, workspace_type")
    .eq("id", id)
    .single();
  if (readError) throw readError;

  const { error: insertError } = await supabase.from("clients").insert({
    lead_id: lead.id,
    legal_name: lead.business_name,
    phone: lead.phone,
    address: lead.address,
    user_id: ctx.userId,
    workspace_type: lead.workspace_type ?? ctx.mode,
  });
  if (insertError) throw insertError;

  const { error: updateError } = await supabase
    .from("leads")
    .update({ status: "won" })
    .eq("id", id);
  if (updateError) throw updateError;

  revalidatePath("/leads");
  revalidatePath("/projects");
  revalidatePath("/");
}
