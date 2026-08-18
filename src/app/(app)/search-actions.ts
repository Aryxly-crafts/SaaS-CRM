"use server";

import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext, applyWorkspaceFilter } from "@/lib/workspace";

export interface SearchResultItem {
  id: string;
  type: "lead" | "project" | "client" | "payment" | "expense";
  title: string;
  subtitle: string;
  meta?: string;
  href: string;
}

// Global search across leads, projects, clients, payments, and expenses scoped to active workspace.
export async function searchAllRecords(query: string): Promise<SearchResultItem[]> {
  const q = query.trim();
  if (!q) return [];

  const supabase = await createClient();
  const ctx = await getWorkspaceContext();

  const [leadsRes, projectsRes, clientsRes, paymentsRes, expensesRes] = await Promise.all([
    applyWorkspaceFilter(
      supabase
        .from("leads")
        .select("id, business_name, category, status, phone")
        .or(`business_name.ilike.%${q}%,category.ilike.%${q}%,phone.ilike.%${q}%`)
        .limit(5),
      ctx
    ),
    applyWorkspaceFilter(
      supabase
        .from("projects")
        .select("id, title, status, total_value, clients(legal_name)")
        .ilike("title", `%${q}%`)
        .limit(5),
      ctx
    ),
    applyWorkspaceFilter(
      supabase
        .from("clients")
        .select("id, legal_name, phone")
        .or(`legal_name.ilike.%${q}%,phone.ilike.%${q}%`)
        .limit(5),
      ctx
    ),
    applyWorkspaceFilter(
      supabase
        .from("payments")
        .select("id, amount, type, projects(title)")
        .limit(5),
      ctx
    ),
    applyWorkspaceFilter(
      supabase
        .from("expenses")
        .select("id, title, amount, category, entry_type")
        .or(`title.ilike.%${q}%,category.ilike.%${q}%`)
        .limit(5),
      ctx
    ),
  ]);

  const results: SearchResultItem[] = [];

  // Leads
  for (const lead of leadsRes.data ?? []) {
    results.push({
      id: `lead-${lead.id}`,
      type: "lead",
      title: lead.business_name,
      subtitle: lead.category ? `${lead.category} · ${lead.phone || "No phone"}` : lead.phone || "Lead",
      meta: lead.status?.toUpperCase(),
      href: `/leads?status=${lead.status}`,
    });
  }

  // Projects
  for (const project of projectsRes.data ?? []) {
    const client = Array.isArray(project.clients) ? project.clients[0] : project.clients;
    results.push({
      id: `project-${project.id}`,
      type: "project",
      title: project.title,
      subtitle: client?.legal_name ? `Client: ${client.legal_name}` : "Project",
      meta: project.total_value ? `₹${Number(project.total_value).toLocaleString("en-IN")}` : undefined,
      href: "/projects",
    });
  }

  // Clients
  for (const client of clientsRes.data ?? []) {
    results.push({
      id: `client-${client.id}`,
      type: "client",
      title: client.legal_name,
      subtitle: client.phone || "Client contact",
      href: "/projects",
    });
  }

  // Payments
  for (const pay of paymentsRes.data ?? []) {
    const project = Array.isArray(pay.projects) ? pay.projects[0] : pay.projects;
    results.push({
      id: `payment-${pay.id}`,
      type: "payment",
      title: `Payment: ₹${Number(pay.amount).toLocaleString("en-IN")}`,
      subtitle: (project as { title: string } | null)?.title ? `Project: ${(project as { title: string }).title}` : `Type: ${pay.type}`,
      meta: pay.type?.toUpperCase(),
      href: "/payments",
    });
  }

  // Expenses
  for (const exp of expensesRes.data ?? []) {
    results.push({
      id: `exp-${exp.id}`,
      type: "expense",
      title: exp.title,
      subtitle: `${exp.category} · ${exp.entry_type}`,
      meta: `₹${Number(exp.amount).toLocaleString("en-IN")}`,
      href: "/expenses",
    });
  }

  return results;
}
