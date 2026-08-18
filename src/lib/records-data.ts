import { createClient } from "@/lib/supabase/server";
import type {
  Client,
  DocumentRecord,
  Expense,
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

export interface ExpenseWithProject extends Expense {
  project_title: string | null;
}

// Fetches expenses for active workspace with optional project title join.
export async function getExpenses(): Promise<ExpenseWithProject[]> {
  const supabase = await createClient();
  const ctx = await getWorkspaceContext();

  let query = supabase
    .from("expenses")
    .select("*, projects(title)")
    .order("date", { ascending: false });
  query = applyWorkspaceFilter(query, ctx);

  const { data, error } = await query;
  if (error) {
    console.error("getExpenses query error:", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const { projects, ...expense } = row as Record<string, unknown>;
    const project = one<{ title: string }>(projects);
    return {
      ...(expense as unknown as Expense),
      project_title: project?.title ?? null,
    };
  });
}

export interface ExpenseSummary {
  totalIncome: number;
  totalExpenses: number;
  netCashflow: number;
  topCategory: string | null;
  topCategoryAmount: number;
  entryCount: number;
}

// Summarises expenses for the current month in the active workspace.
export async function getExpenseSummary(): Promise<ExpenseSummary> {
  const supabase = await createClient();
  const ctx = await getWorkspaceContext();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const startDate = startOfMonth.toISOString().slice(0, 10);

  let query = supabase
    .from("expenses")
    .select("amount, entry_type, category")
    .gte("date", startDate);
  query = applyWorkspaceFilter(query, ctx);

  const { data, error } = await query;
  if (error) {
    console.error("getExpenseSummary query error:", error.message);
    return {
      totalIncome: 0,
      totalExpenses: 0,
      netCashflow: 0,
      topCategory: null,
      topCategoryAmount: 0,
      entryCount: 0,
    };
  }

  const rows = data ?? [];
  let totalIncome = 0;
  let totalExpenses = 0;
  const byCat = new Map<string, number>();

  for (const row of rows) {
    const amount = Number(row.amount);
    if (row.entry_type === "income") {
      totalIncome += amount;
    } else {
      totalExpenses += amount;
      byCat.set(row.category, (byCat.get(row.category) ?? 0) + amount);
    }
  }

  let topCategory: string | null = null;
  let topCategoryAmount = 0;
  for (const [cat, amount] of byCat) {
    if (amount > topCategoryAmount) {
      topCategory = cat;
      topCategoryAmount = amount;
    }
  }

  return {
    totalIncome,
    totalExpenses,
    netCashflow: totalIncome - totalExpenses,
    topCategory,
    topCategoryAmount,
    entryCount: rows.length,
  };
}
