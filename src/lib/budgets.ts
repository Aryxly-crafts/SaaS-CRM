import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext, applyWorkspaceFilter } from "@/lib/workspace";
import type { Budget, Expense, Project } from "@/lib/records";

// Fetches all budgets scoped to the active workspace.
export async function getBudgets(): Promise<Budget[]> {
  const supabase = await createClient();
  const ctx = await getWorkspaceContext();

  let query = supabase
    .from("budgets")
    .select("*")
    .order("created_at", { ascending: false });
  query = applyWorkspaceFilter(query, ctx);

  const { data, error } = await query;
  if (error) {
    console.error("getBudgets query error:", error.message);
    return [];
  }
  return (data ?? []) as Budget[];
}

export interface ProjectBudgetMetric {
  project_id: string;
  project_title: string;
  total_value: number;
  planned_cost_budget: number;
  actual_cost: number;
  payments_collected: number;
  cost_variance: number;
  cost_burn_percent: number;
  projected_margin: number;
  margin_percent: number;
  health: "healthy" | "warning" | "critical";
}

// Calculates complete budget, actual cost, payment collection, and net margin per project.
export async function getProjectBudgetMetrics(
  projects: Project[],
  expenses: Expense[]
): Promise<ProjectBudgetMetric[]> {
  const budgets = await getBudgets();
  const projectBudgets = new Map<string, number>();
  for (const b of budgets) {
    if (b.scope === "project" && b.project_id) {
      projectBudgets.set(b.project_id, Number(b.amount || 0));
    }
  }

  const projectCosts = new Map<string, number>();
  for (const e of expenses) {
    if (e.project_id && e.entry_type === "expense" && e.category !== "payout") {
      projectCosts.set(e.project_id, (projectCosts.get(e.project_id) ?? 0) + Number(e.amount || 0));
    }
  }

  return projects.map((p) => {
    const total_value = Number(p.total_value || 0);
    const planned_cost_budget = projectBudgets.get(p.id) ?? (total_value > 0 ? total_value * 0.3 : 0);
    const actual_cost = projectCosts.get(p.id) ?? 0;
    const payments_collected = (p.advance_paid ? Number(p.advance_amount || 0) : 0) +
      (p.final_paid ? Number(p.final_amount || 0) : 0);
    const cost_variance = planned_cost_budget - actual_cost;
    const cost_burn_percent = planned_cost_budget > 0 ? Math.round((actual_cost / planned_cost_budget) * 100) : 0;
    const projected_margin = total_value - actual_cost;
    const margin_percent = total_value > 0 ? Math.round((projected_margin / total_value) * 100) : 0;

    let health: "healthy" | "warning" | "critical" = "healthy";
    if (actual_cost > planned_cost_budget && planned_cost_budget > 0) {
      health = "critical";
    } else if (cost_burn_percent >= 80 || margin_percent < 30) {
      health = "warning";
    }

    return {
      project_id: p.id,
      project_title: p.title,
      total_value,
      planned_cost_budget,
      actual_cost,
      payments_collected,
      cost_variance,
      cost_burn_percent,
      projected_margin,
      margin_percent,
      health,
    };
  });
}

export interface CategoryBudgetMetric {
  category: string;
  planned: number;
  actual: number;
  variance: number;
  percentage_used: number;
  status: "safe" | "warning" | "exceeded";
}

// Compares category monthly limits against current month expenses.
export async function getCategoryBudgetMetrics(
  expenses: Expense[]
): Promise<CategoryBudgetMetric[]> {
  const budgets = await getBudgets();
  const categoryBudgets = new Map<string, number>();
  for (const b of budgets) {
    if (b.scope === "category" && b.category) {
      categoryBudgets.set(b.category, Number(b.amount || 0));
    }
  }

  const categorySpend = new Map<string, number>();
  for (const e of expenses) {
    if (e.entry_type === "expense") {
      categorySpend.set(e.category, (categorySpend.get(e.category) ?? 0) + Number(e.amount || 0));
    }
  }

  const allCategories = Array.from(new Set([...categoryBudgets.keys(), ...categorySpend.keys()]));
  return allCategories.map((category) => {
    const planned = categoryBudgets.get(category) ?? 0;
    const actual = categorySpend.get(category) ?? 0;
    const variance = planned - actual;
    const percentage_used = planned > 0 ? Math.round((actual / planned) * 100) : (actual > 0 ? 100 : 0);

    let status: "safe" | "warning" | "exceeded" = "safe";
    if (planned > 0 && actual > planned) status = "exceeded";
    else if (percentage_used >= 80) status = "warning";

    return { category, planned, actual, variance, percentage_used, status };
  });
}

export interface PersonalSavingsGoalMetric {
  targetSavings: number;
  actualSavings: number;
  savingsRate: number;
  progressPercent: number;
  status: "on_track" | "behind" | "exceeded";
}

// Evaluates personal savings goal progress against net income.
export async function getPersonalSavingsMetric(
  totalIncome: number,
  totalExpenses: number
): Promise<PersonalSavingsGoalMetric> {
  const budgets = await getBudgets();
  const savingsBudget = budgets.find((b) => b.scope === "savings");
  const targetSavings = savingsBudget ? Number(savingsBudget.amount || 0) : 30000;
  const actualSavings = Math.max(totalIncome - totalExpenses, 0);
  const savingsRate = totalIncome > 0 ? Math.round((actualSavings / totalIncome) * 100) : 0;
  const progressPercent = targetSavings > 0 ? Math.round((actualSavings / targetSavings) * 100) : 0;

  let status: "on_track" | "behind" | "exceeded" = "on_track";
  if (actualSavings >= targetSavings) status = "exceeded";
  else if (progressPercent < 60) status = "behind";

  return { targetSavings, actualSavings, savingsRate, progressPercent, status };
}
