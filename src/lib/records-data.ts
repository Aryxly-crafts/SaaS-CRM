import { createClient } from "@/lib/supabase/server";
import type {
  Client,
  DocumentRecord,
  Payment,
  Project,
} from "@/lib/records";
import { getWorkspaceContext, applyWorkspaceFilter } from "@/lib/workspace";

// Supabase types embedded relations as arrays; unwrap to a single row.
function one<T>(relation: unknown): T | null {
  if (Array.isArray(relation)) return (relation[0] as T) ?? null;
  return (relation as T) ?? null;
}

export interface ProjectWithClient extends Project {
  client_name: string;
}

// Fetches every client for active workspace, newest first.
export async function getClients(): Promise<Client[]> {
  const supabase = await createClient();
  const ctx = await getWorkspaceContext();

  let query = supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });
  query = applyWorkspaceFilter(query, ctx);

  const { data, error } = await query;
  if (error) {
    console.error("getClients query error:", error.message);
    return [];
  }
  return (data ?? []) as Client[];
}

// Fetches projects for active workspace joined with their client's name.
export async function getProjects(): Promise<ProjectWithClient[]> {
  const supabase = await createClient();
  const ctx = await getWorkspaceContext();

  let query = supabase
    .from("projects")
    .select("*, clients(legal_name)")
    .order("created_at", { ascending: false });
  query = applyWorkspaceFilter(query, ctx);

  const { data, error } = await query;
  if (error) {
    console.error("getProjects query error:", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const { clients, ...project } = row as Record<string, unknown>;
    const client = one<{ legal_name: string }>(clients);
    return {
      ...(project as unknown as Project),
      client_name: client?.legal_name ?? "Unknown client",
    };
  });
}

export interface PaymentWithProject extends Payment {
  project_title: string;
}

// Fetches payments for active workspace joined with their project's title.
export async function getPayments(): Promise<PaymentWithProject[]> {
  const supabase = await createClient();
  const ctx = await getWorkspaceContext();

  let query = supabase
    .from("payments")
    .select("*, projects(title)")
    .order("created_at", { ascending: false });
  query = applyWorkspaceFilter(query, ctx);

  const { data, error } = await query;
  if (error) {
    console.error("getPayments query error:", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const { projects, ...payment } = row as Record<string, unknown>;
    const project = one<{ title: string }>(projects);
    return {
      ...(payment as unknown as Payment),
      project_title: project?.title ?? "Unknown project",
    };
  });
}

export interface DocumentWithProject extends DocumentRecord {
  project_title: string;
}

// Fetches documents for active workspace joined with their project's title.
export async function getDocuments(): Promise<DocumentWithProject[]> {
  const supabase = await createClient();
  const ctx = await getWorkspaceContext();

  let query = supabase
    .from("documents")
    .select("*, projects(title)")
    .order("created_at", { ascending: false });
  query = applyWorkspaceFilter(query, ctx);

  const { data, error } = await query;
  if (error) {
    console.error("getDocuments query error:", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const { projects, ...document } = row as Record<string, unknown>;
    const project = one<{ title: string }>(projects);
    return {
      ...(document as unknown as DocumentRecord),
      project_title: project?.title ?? "Unknown project",
    };
  });
}
