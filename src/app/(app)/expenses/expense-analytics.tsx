"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import type { Expense, ExpenseCategory } from "@/lib/records";
import { EXPENSE_CATEGORY_LABELS, money } from "@/lib/records";
import type {
  ProjectBudgetMetric,
  CategoryBudgetMetric,
  PersonalSavingsGoalMetric,
} from "@/lib/budgets";

interface ExpenseAnalyticsProps {
  isTeam: boolean;
  projectMetrics: ProjectBudgetMetric[];
  categoryMetrics: CategoryBudgetMetric[];
  savingsMetric: PersonalSavingsGoalMetric;
  expenses: Expense[];
}

const PALETTE = ["#2f7eda", "#10b981", "#f59e0b", "#7c3aed", "#ec4899", "#06b6d4", "#84cc16", "#64748b"];

// PowerBI-grade visual analytics engine for expense & margin tracking.
export function ExpenseAnalytics({
  isTeam,
  projectMetrics,
  categoryMetrics,
  savingsMetric,
  expenses,
}: ExpenseAnalyticsProps) {
  const [filterHealth, setFilterHealth] = useState<string>("all");

  // Prepare Category Donut Data
  const categorySpendMap = new Map<string, number>();
  for (const e of expenses) {
    if (e.entry_type === "expense") {
      categorySpendMap.set(e.category, (categorySpendMap.get(e.category) ?? 0) + Number(e.amount || 0));
    }
  }

  const categoryDonutData = Array.from(categorySpendMap.entries())
    .map(([cat, val]) => ({
      name: EXPENSE_CATEGORY_LABELS[cat as ExpenseCategory] || cat,
      value: val,
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  const totalExpenseVal = categoryDonutData.reduce((sum, d) => sum + d.value, 0);

  // Filtered Project Metrics for Team View
  const filteredProjects = projectMetrics.filter((p) => {
    if (filterHealth === "all") return true;
    return p.health === filterHealth;
  });

  return (
    <div className="mb-6 space-y-4">
      {/* ─── TEAM WORKSPACE ANALYTICS: Deal Margins & Project Cost Matrix ─── */}
      {isTeam ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Project Profitability & Cost Matrix (8 cols) */}
          <div className="border-line bg-surface rounded-2xl border p-4 shadow-xs lg:col-span-8">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
              <div>
                <h3 className="text-ink text-[13.5px] font-bold tracking-tight">
                  Project Budget & Margin Alignment Matrix
                </h3>
                <p className="text-ink-muted text-[11.5px]">
                  Real-time contract value vs planned cost budget vs actual project burn.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="bg-surface-muted border-line flex items-center rounded-lg border p-0.5 text-[11px] font-medium">
                {["all", "critical", "warning", "healthy"].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilterHealth(f)}
                    className={`rounded-md px-2 py-0.5 capitalize transition-all ${
                      filterHealth === f ? "bg-surface text-ink shadow-xs" : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    {f === "all" ? "All Deals" : f}
                  </button>
                ))}
              </div>
            </div>

            {/* Matrix Table */}
            {filteredProjects.length === 0 ? (
              <div className="py-8 text-center text-[12px] text-ink-muted">
                No projects found for the selected filter.
              </div>
            ) : (
              <div className="scroll-hidden overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-line bg-surface-muted/60 text-ink-subtle border-b text-[11px] font-semibold uppercase">
                      <th className="py-2 pl-3 pr-2">Project</th>
                      <th className="px-2 py-2 text-right">Contract</th>
                      <th className="px-2 py-2 text-right">Cost Budget</th>
                      <th className="px-2 py-2 text-right">Actual Cost</th>
                      <th className="px-2 py-2 text-right">Net Margin</th>
                      <th className="py-2 pr-3 pl-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((p) => {
                      const isOverBudget = p.actual_cost > p.planned_cost_budget && p.planned_cost_budget > 0;
                      return (
                        <tr
                          key={p.project_id}
                          className="border-line hover:bg-surface-muted/50 border-b text-[12px] transition-colors last:border-b-0"
                        >
                          <td className="text-ink py-2.5 pl-3 pr-2 font-medium">
                            {p.project_title}
                          </td>
                          <td className="text-ink-muted px-2 py-2.5 text-right tabular">
                            {money(p.total_value)}
                          </td>
                          <td className="text-ink-muted px-2 py-2.5 text-right tabular">
                            {money(p.planned_cost_budget)}
                          </td>
                          <td
                            className={`px-2 py-2.5 text-right font-medium tabular ${
                              isOverBudget ? "text-danger" : "text-ink"
                            }`}
                          >
                            {money(p.actual_cost)}
                          </td>
                          <td className="px-2 py-2.5 text-right font-semibold tabular">
                            <span
                              className={`inline-flex items-center gap-0.5 ${
                                p.margin_percent >= 50
                                  ? "text-positive"
                                  : p.margin_percent >= 30
                                  ? "text-warning"
                                  : "text-danger"
                              }`}
                            >
                              {p.margin_percent >= 50 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                              {p.margin_percent}% ({money(p.projected_margin)})
                            </span>
                          </td>
                          <td className="py-2.5 pr-3 pl-2 text-center">
                            {p.health === "critical" ? (
                              <span className="bg-danger-soft text-danger inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase">
                                <ShieldAlert size={11} /> Over Budget
                              </span>
                            ) : p.health === "warning" ? (
                              <span className="bg-warning-soft text-warning inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase">
                                <AlertTriangle size={11} /> Thin Margin
                              </span>
                            ) : (
                              <span className="bg-positive-soft text-positive inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase">
                                <CheckCircle2 size={11} /> On Target
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Category Composition Donut (4 cols) */}
          <div className="border-line bg-surface flex flex-col justify-between rounded-2xl border p-4 shadow-xs lg:col-span-4">
            <div>
              <div className="mb-2 flex items-center justify-between border-b border-[var(--line)] pb-2.5">
                <h3 className="text-ink text-[13.5px] font-bold tracking-tight">Category Breakdown</h3>
                <span className="text-ink-subtle text-[11px] tabular font-medium">
                  Total: {money(totalExpenseVal)}
                </span>
              </div>

              {categoryDonutData.length === 0 ? (
                <div className="py-12 text-center text-[12px] text-ink-muted">
                  No expense records logged yet.
                </div>
              ) : (
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryDonutData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={46}
                        outerRadius={68}
                        paddingAngle={3}
                      >
                        {categoryDonutData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val) => [money(Number(val ?? 0)), "Amount"]}
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Top Category Tags */}
            <div className="mt-2 space-y-1.5">
              {categoryDonutData.slice(0, 4).map((d, i) => (
                <div key={d.name} className="flex items-center justify-between text-[11.5px]">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                    />
                    <span className="text-ink-muted truncate max-w-[120px]">{d.name}</span>
                  </div>
                  <span className="text-ink font-semibold tabular">
                    {money(d.value)} ({totalExpenseVal > 0 ? Math.round((d.value / totalExpenseVal) * 100) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ─── PERSONAL WORKSPACE ANALYTICS: Savings Goal & Category Caps ─── */
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Monthly Savings Target Power Gauge (5 cols) */}
          <div className="border-line bg-surface flex flex-col justify-between rounded-2xl border p-4 shadow-xs lg:col-span-5">
            <div>
              <div className="mb-3 flex items-center justify-between border-b border-[var(--line)] pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="bg-positive-soft text-positive flex h-7 w-7 items-center justify-center rounded-lg">
                    <Target size={15} />
                  </div>
                  <h3 className="text-ink text-[13.5px] font-bold">Monthly Savings Goal</h3>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    savingsMetric.status === "exceeded"
                      ? "bg-positive-soft text-positive"
                      : savingsMetric.status === "on_track"
                      ? "bg-info-soft text-info"
                      : "bg-warning-soft text-warning"
                  }`}
                >
                  {savingsMetric.status.replace("_", " ")}
                </span>
              </div>

              <div className="my-3 flex items-baseline justify-between">
                <div>
                  <p className="text-ink-muted text-[11px]">Net Savings Achieved</p>
                  <p className="text-ink text-[22px] font-bold tracking-tight tabular">
                    {money(savingsMetric.actualSavings)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-ink-muted text-[11px]">Goal Target</p>
                  <p className="text-ink-subtle text-[14px] font-semibold tabular">
                    {money(savingsMetric.targetSavings)}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-surface-muted border-line relative h-3 w-full overflow-hidden rounded-full border">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    savingsMetric.progressPercent >= 100
                      ? "bg-positive"
                      : savingsMetric.progressPercent >= 60
                      ? "bg-accent"
                      : "bg-warning"
                  }`}
                  style={{ width: `${Math.min(savingsMetric.progressPercent, 100)}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] text-ink-muted">
                <span>{savingsMetric.progressPercent}% of Monthly Target</span>
                <span>Savings Rate: {savingsMetric.savingsRate}%</span>
              </div>
            </div>

            <div className="bg-surface-muted/60 border-line mt-4 rounded-xl border p-2.5 text-[11.5px] text-ink-muted">
              <span className="font-semibold text-ink">AI Note: </span>
              {savingsMetric.status === "exceeded"
                ? "Target achieved! Great discipline on discretionary burn this month."
                : savingsMetric.status === "on_track"
                ? "On pace to achieve your savings goal if current daily spend holds steady."
                : "Spending velocity is elevated. Review dining and subscriptions to catch up."}
            </div>
          </div>

          {/* Category Budget Cap Progress Meters (7 cols) */}
          <div className="border-line bg-surface rounded-2xl border p-4 shadow-xs lg:col-span-7">
            <div className="mb-3 flex items-center justify-between border-b border-[var(--line)] pb-2.5">
              <h3 className="text-ink text-[13.5px] font-bold">Category Budget Utilization</h3>
              <span className="text-ink-muted text-[11px]">
                {categoryMetrics.filter((c) => c.status === "exceeded").length} Over-budget caps
              </span>
            </div>

            {categoryMetrics.length === 0 ? (
              <div className="py-8 text-center text-[12px] text-ink-muted">
                No category budgets set yet. Click &quot;Manage Budgets & Goals&quot; to define limits.
              </div>
            ) : (
              <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
                {categoryMetrics.map((cat) => {
                  const label = EXPENSE_CATEGORY_LABELS[cat.category as ExpenseCategory] || cat.category;
                  const isExceeded = cat.status === "exceeded";
                  return (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="text-ink font-medium capitalize">{label}</span>
                        <span className="tabular text-[11.5px]">
                          <strong className={isExceeded ? "text-danger" : "text-ink"}>
                            {money(cat.actual)}
                          </strong>
                          <span className="text-ink-muted"> / {cat.planned > 0 ? money(cat.planned) : "No Cap"}</span>
                          <span className="text-ink-subtle ml-1 font-semibold">({cat.percentage_used}%)</span>
                        </span>
                      </div>
                      <div className="bg-surface-muted h-2 w-full overflow-hidden rounded-full">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isExceeded ? "bg-danger" : cat.percentage_used >= 80 ? "bg-warning" : "bg-positive"
                          }`}
                          style={{ width: `${Math.min(cat.percentage_used, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
