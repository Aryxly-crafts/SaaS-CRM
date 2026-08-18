"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/workspace";

// Returns financial breakdown of a project: total payments collected, direct costs, and net margin.
export async function getProjectFinancials(projectId: string) {
  const supabase = await createClient();

  const [paymentsRes, expensesRes, projectRes] = await Promise.all([
    supabase.from("payments").select("amount").eq("project_id", projectId),
    supabase
      .from("expenses")
      .select("amount, category, entry_type")
      .eq("project_id", projectId),
    supabase.from("projects").select("id, title, total_value").eq("id", projectId).single(),
  ]);

  const totalPayments = (paymentsRes.data ?? []).reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  const directExpenses = (expensesRes.data ?? [])
    .filter((e) => e.entry_type === "expense" && e.category !== "payout")
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const previousPayouts = (expensesRes.data ?? [])
    .filter((e) => e.category === "payout")
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const netMargin = Math.max(totalPayments - directExpenses, 0);
  const remainingDistributable = Math.max(netMargin - previousPayouts, 0);

  return {
    project: projectRes.data,
    totalPayments,
    directExpenses,
    previousPayouts,
    netMargin,
    remainingDistributable,
  };
}

// 1-Click Founder Payout Transfer: splits net margin and pushes shares into Personal Inflows.
export async function distributeProjectPayout(formData: FormData) {
  const projectId = formData.get("project_id") as string;
  const projectTitle = (formData.get("project_title") as string) || "Project";
  const akshithAmount = Number(formData.get("akshith_amount") || 0);
  const yashashwiniAmount = Number(formData.get("yashashwini_amount") || 0);
  const notes = (formData.get("notes") as string) || "";
  const totalPayout = akshithAmount + yashashwiniAmount;

  if (totalPayout <= 0) {
    throw new Error("Payout amount must be greater than zero.");
  }

  const ctx = await getWorkspaceContext();
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  // 1. Team ledger: Record team expense payout transfer
  const { error: teamExpenseErr } = await supabase.from("expenses").insert({
    title: `Founder Payout Transfer — ${projectTitle}`,
    amount: totalPayout,
    category: "payout",
    entry_type: "expense",
    project_id: projectId,
    date: today,
    notes: `Distributed: Akshith (₹${akshithAmount.toLocaleString("en-IN")}) + Yashashwini (₹${yashashwiniAmount.toLocaleString("en-IN")}). ${notes}`.trim(),
    workspace_type: "team",
    user_id: ctx.userId,
  });

  if (teamExpenseErr) throw teamExpenseErr;

  // 2. Personal Inflows: Record Founder shares in Personal Workspace as Income/Savings
  const personalInflows = [
    {
      title: `Founder Share (Akshith) — ${projectTitle}`,
      amount: akshithAmount,
      category: "savings",
      entry_type: "income",
      date: today,
      notes: `Project Payout Share. ${notes}`.trim(),
      workspace_type: "personal",
      user_id: ctx.userId,
    },
    {
      title: `Founder Share (Yashashwini) — ${projectTitle}`,
      amount: yashashwiniAmount,
      category: "savings",
      entry_type: "income",
      date: today,
      notes: `Project Payout Share. ${notes}`.trim(),
      workspace_type: "personal",
      user_id: ctx.userId,
    },
  ].filter((item) => item.amount > 0);

  if (personalInflows.length > 0) {
    const { error: personalErr } = await supabase.from("expenses").insert(personalInflows);
    if (personalErr) {
      console.warn("Personal inflow record note:", personalErr.message);
    }
  }

  revalidatePath("/expenses");
  revalidatePath("/projects");
  revalidatePath("/");
}
