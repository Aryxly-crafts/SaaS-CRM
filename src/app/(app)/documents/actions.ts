"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { DocumentType } from "@/lib/records";
import { getWorkspaceContext } from "@/lib/workspace";

const BUCKET = "documents";

// Strips characters that make object keys awkward to work with.
function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
}

// Uploads a file to storage and records it against a project.
export async function uploadDocument(form: FormData) {
  const projectId = form.get("project_id");
  const type = (form.get("type") as DocumentType) ?? "agreement";
  const file = form.get("file");

  if (typeof projectId !== "string" || !projectId) {
    throw new Error("Pick a project for this document");
  }
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose a file to upload");
  }

  const ctx = await getWorkspaceContext();
  const supabase = await createClient();
  const key = `${projectId}/${Date.now()}-${safeName(file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(key, file, { contentType: file.type || undefined });
  if (uploadError) throw uploadError;

  const { error: insertError } = await supabase.from("documents").insert({
    project_id: projectId,
    type,
    file_url: key,
    file_name: file.name,
    user_id: ctx.userId,
    workspace_type: ctx.mode,
  });

  // Don't leave an orphaned file in storage if the row didn't save.
  if (insertError) {
    await supabase.storage.from(BUCKET).remove([key]);
    throw insertError;
  }

  revalidatePath("/documents");
}

// Removes a document. The row goes first so a storage failure can't leave
// a record pointing at a file that no longer exists.
export async function deleteDocument(id: string, fileUrl: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throw error;

  await supabase.storage.from(BUCKET).remove([fileUrl]);

  revalidatePath("/documents");
}

// Creates a short-lived signed URL so a private file can be opened.
export async function getDocumentUrl(fileUrl: string): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(fileUrl, 60);
  if (error) throw error;
  return data.signedUrl;
}

// Records a generated invoice/SOW into the documents library
export async function recordGeneratedDocument(
  projectId: string,
  type: DocumentType,
  fileName: string
) {
  const ctx = await getWorkspaceContext();
  const supabase = await createClient();

  const { error } = await supabase.from("documents").insert({
    project_id: projectId,
    type,
    file_url: `generated/${projectId}/${Date.now()}-${safeName(fileName)}`,
    file_name: fileName,
    user_id: ctx.userId,
    workspace_type: ctx.mode,
  });

  if (error) throw error;
  revalidatePath("/documents");
}
