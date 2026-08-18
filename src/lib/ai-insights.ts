import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/workspace";
import type { AIInsightItem, AIInsightRecord, Expense, Project } from "@/lib/records";
import { getProjectBudgetMetrics, getCategoryBudgetMetrics, getPersonalSavingsMetric } from "@/lib/budgets";

// Generates a quick hash fingerprint of current financial inputs to cache AI evaluations.
function createDataFingerprint(data: unknown): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `fp_${Math.abs(hash)}_${str.length}`;
}

// Generates deterministic financial intelligence analysis for Team workspace.
function analyzeTeamFinances(
  projects: Project[],
  expenses: Expense[],
  projectMetrics: Awaited<ReturnType<typeof getProjectBudgetMetrics>>
): { insights: AIInsightItem[]; summary: string; healthScore: number } {
  const insights: AIInsightItem[] = [];
  let healthScore = 95;

  // 1. Check projects with cost overruns or thin margins
  for (const pm of projectMetrics) {
    if (pm.health === "critical") {
      healthScore -= 15;
      insights.push({
        id: `team-overrun-${pm.project_id}`,
        category: "margin_risk",
        title: `Cost Overrun on "${pm.project_title}"`,
        severity: "critical",
        finding: `Actual costs (₹${pm.actual_cost.toLocaleString("en-IN")}) have exceeded planned budget (₹${pm.planned_cost_budget.toLocaleString("en-IN")}) by ₹${Math.abs(pm.cost_variance).toLocaleString("en-IN")}.`,
        recommendation: `Pause non-essential contractor or tooling expenses for this milestone. Review scope creep with the client before further delivery.`,
        impact_amount: Math.abs(pm.cost_variance),
      });
    } else if (pm.margin_percent < 40 && pm.total_value > 0) {
      healthScore -= 8;
      insights.push({
        id: `team-margin-${pm.project_id}`,
        category: "deal_alignment",
        title: `Low Margin Deal: "${pm.project_title}" (${pm.margin_percent}%)`,
        severity: "warning",
        finding: `Project margin is below the 50% agency target. Direct expenses are consuming ${100 - pm.margin_percent}% of contract value.`,
        recommendation: `For future similar deals, increase initial quote by at least 25% or bundle maintenance retainer to protect project gross margin.`,
        impact_amount: Math.round(pm.total_value * 0.2),
      });
    }
  }

  // 2. Check contractor vs software overhead
  const contractorSpend = expenses
    .filter((e) => e.category === "contractor" && e.entry_type === "expense")
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const totalExpenses = expenses
    .filter((e) => e.entry_type === "expense")
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  if (totalExpenses > 0 && (contractorSpend / totalExpenses) > 0.6) {
    insights.push({
      id: "team-contractor-weight",
      category: "cost_optimization",
      title: "High Contractor Dependency (60%+ of burn)",
      severity: "optimization",
      finding: `Outsourced contractor costs represent ₹${contractorSpend.toLocaleString("en-IN")} (${Math.round((contractorSpend / totalExpenses) * 100)}% of total team expenses).`,
      recommendation: `Standardize recurring deliverable templates or negotiate fixed milestone rates rather than hourly billing.`,
      impact_amount: Math.round(contractorSpend * 0.15),
    });
  }

  // 3. Positive margin reinforcement
  if (insights.length === 0) {
    insights.push({
      id: "team-healthy-margins",
      category: "deal_alignment",
      title: "Strong Agency Margin Health",
      severity: "positive",
      finding: "All active client projects are operating within their allocated budgets with healthy projected net margins (>50%).",
      recommendation: "Maintain current delivery efficiency and ensure milestone payments are invoiced promptly upon deliverable approval.",
    });
  }

  const finalScore = Math.max(Math.min(healthScore, 100), 20);
  const summary = finalScore >= 85
    ? "Agency finances are well-calibrated with strong profit margins across client projects."
    : "Action needed on cost overruns and margin compression to preserve agency cashflow.";

  return { insights, summary, healthScore: finalScore };
}

// Generates personal savings and expense intelligence analysis.
function analyzePersonalFinances(
  expenses: Expense[],
  savingsMetric: Awaited<ReturnType<typeof getPersonalSavingsMetric>>,
  categoryMetrics: Awaited<ReturnType<typeof getCategoryBudgetMetrics>>
): { insights: AIInsightItem[]; summary: string; healthScore: number } {
  const insights: AIInsightItem[] = [];
  let healthScore = 90;

  // 1. Savings Goal Check
  if (savingsMetric.status === "behind") {
    healthScore -= 20;
    insights.push({
      id: "personal-savings-lag",
      category: "savings_boost",
      title: "Monthly Savings Behind Target",
      severity: "warning",
      finding: `Current savings of ₹${savingsMetric.actualSavings.toLocaleString("en-IN")} is at ${savingsMetric.progressPercent}% of your ₹${savingsMetric.targetSavings.toLocaleString("en-IN")} goal.`,
      recommendation: `Trim discretionary expenses (dining/subscriptions) or allocate incoming founder dividends directly to reserve fund.`,
      impact_amount: Math.max(savingsMetric.targetSavings - savingsMetric.actualSavings, 0),
    });
  } else if (savingsMetric.status === "exceeded") {
    insights.push({
      id: "personal-savings-ahead",
      category: "savings_boost",
      title: "Savings Goal Achieved Ahead of Schedule",
      severity: "positive",
      finding: `You have saved ₹${savingsMetric.actualSavings.toLocaleString("en-IN")}, exceeding your monthly savings milestone.`,
      recommendation: `Consider moving surplus into an emergency liquidity reserve or high-yield investment buffer.`,
    });
  }

  // 2. Category Over-expenditures
  for (const cm of categoryMetrics) {
    if (cm.status === "exceeded" && cm.planned > 0) {
      healthScore -= 10;
      insights.push({
        id: `personal-cat-${cm.category}`,
        category: "spending_leak",
        title: `Budget Exceeded in ${cm.category.toUpperCase()}`,
        severity: "critical",
        finding: `Spent ₹${cm.actual.toLocaleString("en-IN")} vs monthly cap of ₹${cm.planned.toLocaleString("en-IN")} (${cm.percentage_used}% utilized).`,
        recommendation: `Freeze non-essential spending in this category for the remainder of the billing cycle.`,
        impact_amount: cm.actual - cm.planned,
      });
    }
  }

  // 3. Subscription audit
  const subSpend = expenses
    .filter((e) => e.category === "subscriptions" && e.entry_type === "expense")
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  if (subSpend > 5000) {
    insights.push({
      id: "personal-subs",
      category: "spending_leak",
      title: "Recurring Subscriptions Audit",
      severity: "optimization",
      finding: `Monthly recurring digital subscriptions total ₹${subSpend.toLocaleString("en-IN")}.`,
      recommendation: `Audit unused SaaS and media subscriptions to recover ~₹${Math.round(subSpend * 0.3).toLocaleString("en-IN")}/month.`,
      impact_amount: Math.round(subSpend * 0.3),
    });
  }

  const finalScore = Math.max(Math.min(healthScore, 100), 25);
  const summary = finalScore >= 80
    ? "Personal cash flow is disciplined with steady savings accumulation."
    : "Spending velocity in discretionary categories is outpacing your monthly savings target.";

  return { insights, summary, healthScore: finalScore };
}

// Retrieves cached AI insights or computes fresh recommendations.
export async function getFinancialAIInsights(
  projects: Project[],
  expenses: Expense[],
  totalIncome: number,
  totalExpenses: number
): Promise<AIInsightRecord> {
  const ctx = await getWorkspaceContext();
  const supabase = await createClient();

  const fingerprintData = {
    mode: ctx.mode,
    userId: ctx.userId,
    expenseCount: expenses.length,
    totalExpenses,
    totalIncome,
    projectCount: projects.length,
    latestExpense: expenses[0]?.id,
  };
  const fingerprint = createDataFingerprint(fingerprintData);

  // Check cached insights
  let cacheQuery = supabase
    .from("ai_insights")
    .select("*")
    .eq("workspace_type", ctx.mode)
    .eq("fingerprint", fingerprint);
  if (ctx.mode === "personal" && ctx.userId) cacheQuery = cacheQuery.eq("user_id", ctx.userId);

  const { data: cached } = await cacheQuery.maybeSingle();
  if (cached) {
    return cached as AIInsightRecord;
  }

  // Compute fresh insights
  const [projectMetrics, categoryMetrics, savingsMetric] = await Promise.all([
    getProjectBudgetMetrics(projects, expenses),
    getCategoryBudgetMetrics(expenses),
    getPersonalSavingsMetric(totalIncome, totalExpenses),
  ]);

  const analysis = ctx.mode === "team"
    ? analyzeTeamFinances(projects, expenses, projectMetrics)
    : analyzePersonalFinances(expenses, savingsMetric, categoryMetrics);

  const record: Omit<AIInsightRecord, "id"> = {
    workspace_type: ctx.mode,
    user_id: ctx.userId,
    fingerprint,
    insights: analysis.insights,
    summary: analysis.summary,
    health_score: analysis.healthScore,
    created_at: new Date().toISOString(),
  };

  // Upsert or insert into cache
  const { data: saved, error } = await supabase
    .from("ai_insights")
    .insert(record)
    .select()
    .single();

  if (error) {
    console.warn("Could not cache AI insight:", error.message);
    return { ...record, id: "temp-ai-insight" };
  }

  return saved as AIInsightRecord;
}
